import * as client from 'lib/client';
import * as I from 'interface';
import { StudyItemResponse } from './types';
import lowerToTopTopicMapping from './lowerToTopTopicMapping.json';

export const getAll = async (): Promise<I.Pearl[]> => {
    return client.prisma.pearl.findMany({
        include: {
            creators: true,
            source: true,
            topics: true,
            subPearls: true
        }
    });
};

export const getAllPaginated = async (limit: number, offset: number): Promise<{ pearls: I.Pearl[]; total: number }> => {
    const [pearls, total] = await Promise.all([
        client.prisma.pearl.findMany({
            include: {
                creators: true,
                source: true,
                topics: true,
                subPearls: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: limit,
            skip: offset
        }),
        client.prisma.pearl.count()
    ]);

    return { pearls, total };
};

export const getSubPearl = async (pearlId: string, subPearlId: string) => {
    const pearl = await client.prisma.pearl.findUnique({
        where: {
            id: pearlId
        },
        include: {
            creators: true,
            source: true,
            topics: true,
            subPearls: {
                where: {
                    id: subPearlId
                }
            }
        }
    });

    if (!pearl || pearl.subPearls.length === 0) {
        return null;
    }

    return {
        pearl,
        subPearl: pearl.subPearls[0]
    };
};

export const create = async (data: I.CreatePearlRequestBody) => {
    const topics: { id: string }[] = [];

    // Remove duplicate topic IDs
    for (const topicId of data.topicIds) {
        if (!topics.find((t) => t.id === topicId)) {
            topics.push({ id: topicId });
        }
    }

    try {
        return await client.prisma.pearl.create({
            data: {
                doi: data.doi,
                title: data.title,
                creators: {
                    create: data.creators
                },
                language: data.language,
                externalId: data.externalId,
                licenceType: data.licenceType,
                topics: { connect: topics },
                source: { connect: { id: data.sourceId } },
                subPearls: { create: data.subPearls }
            },
            select: {
                id: true
            }
        });
    } catch (error) {
        console.error('Error creating pearl:', error);
        throw error;
    }
};

export const update = async (pearlId: string, data: I.UpdatePearlRequestBody) => {
    const topics: { id: string }[] = [];
    const topicsUpdate = data.topicIds ? { set: topics } : undefined;
    const source = data.sourceId ? { connect: { id: data.sourceId } } : undefined;
    const existingSubPearls = data.subPearls?.filter((subPearl) => !!subPearl.id) || [];
    const newSubPearls = data.subPearls?.filter((subPearl) => !subPearl.id) || [];
    const keepSubPearlIds = existingSubPearls.map((subPearl) => subPearl.id as string);

    const subPearls = data.subPearls
        ? {
              deleteMany: keepSubPearlIds.length > 0 ? { id: { notIn: keepSubPearlIds } } : {},
              update: existingSubPearls.map((subPearl) => ({
                  where: { id: subPearl.id as string },
                  data: {
                      doi: subPearl.doi,
                      title: subPearl.title,
                      content: subPearl.content,
                      type: subPearl.type
                  }
              })),
              create: newSubPearls.map((subPearl) => ({
                  doi: subPearl.doi,
                  title: subPearl.title,
                  content: subPearl.content,
                  type: subPearl.type
              }))
          }
        : undefined;

    // Remove duplicate topic IDs
    for (const topicId of data.topicIds || []) {
        if (!topics.find((t) => t.id === topicId)) {
            topics.push({ id: topicId });
        }
    }

    try {
        return await client.prisma.pearl.update({
            where: {
                id: pearlId
            },
            data: {
                doi: data.doi,
                title: data.title,
                language: data.language,
                externalId: data.externalId,
                licenceType: data.licenceType,
                topics: topicsUpdate,
                source,
                subPearls
            }
        });
    } catch (error) {
        console.error('Error updating pearl:', error);
        throw error;
    }
};

export const deletePearl = async (pearlId: string) => {
    await client.prisma.pearl.delete({
        where: {
            id: pearlId
        }
    });
};

export const getSource = async (sourceId: string): Promise<I.PearlSource | null> => {
    return client.prisma.pearlSource.findUnique({
        where: {
            id: sourceId
        }
    });
};

export const getAllSources = async (): Promise<I.PearlSource[]> => {
    return client.prisma.pearlSource.findMany();
};

export const createSource = async (data: I.CreatePearlSourceRequestBody) => {
    return client.prisma.pearlSource.create({
        data: data
    });
};

const fetchStudyItem = async (resourceId: string): Promise<StudyItemResponse['data']['getStudyItem'] | null> => {
    const apiURL = process.env.UKDS_API_URL;

    if (!apiURL) {
        console.error('UKDS API URL is not defined.');

        return null;
    }

    const apiKey = process.env.UKDS_API_KEY;

    if (!apiKey) {
        console.error('UKDS API Key is not defined.');

        return null;
    }

    const query = `query GetStudyItem($FriendlyId: String, $Id: ID, $QueryPath: String) { 
      getStudyItem(FriendlyId: $FriendlyId, Id: $Id, QueryPath: $QueryPath) {
        Abstract
        AlternativeTitle
        Country
        Creator { Organisations Individuals }
        DataCollectionMethodology { Id Value }
        DataFormat { Id Value Comment }
        Datasets { Id Title }
        Documents { Description Uri }
        DOI
        Keyword { Id Value }
        KindOfData
        NumberOfVariables
        ObservationUnit
        ObservationUnitLocation
        SamplingProcedure
        SpatialUnit
        TimePeriod
        Title
        Universe
        WeightingMethodology
    }}`;

    const variables = {
        FriendlyId: resourceId
    };

    try {
        const res = await fetch(apiURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey
            },
            body: JSON.stringify({ query, variables })
        });

        if (!res.ok) {
            return null;
        }

        const json = (await res.json()) as StudyItemResponse;

        return json.data.getStudyItem;
    } catch (error) {
        console.error(error);
    }

    return null;
};

function formatHTML(htmlString: string): string {
    return htmlString.replace(/\n/g, '<br/>').replace(/style="[^"]*"/g, '');
}

function buildTitledSection(title: string, content: string | number | (string | number)[]): string {
    const values = Array.isArray(content) ? content : [content];
    const filteredValues = values.filter((value) => value !== null && value !== undefined && value !== '');

    if (filteredValues.length === 0) {
        return '';
    }

    return `<strong>${title}:</strong><br/>${filteredValues.join('<br/>')}<br/><br/>`;
}

function getTitle(record: StudyItemResponse['data']['getStudyItem']): string {
    return record.Title || record.AlternativeTitle || 'Untitled';
}

function buildCreators(record: StudyItemResponse['data']['getStudyItem']): I.PearlCreatorInput[] {
    const creators: I.PearlCreatorInput[] = [];

    for (const individual of record.Creator.Individuals || []) {
        creators.push({ name: individual, type: 'INDIVIDUAL' });
    }

    for (const organisation of record.Creator.Organisations || []) {
        creators.push({ name: organisation, type: 'ORGANISATION' });
    }

    return creators;
}

function buildHypothesis(record: StudyItemResponse['data']['getStudyItem']): I.SubPearlInput | null {
    if (!record.Abstract || !record.DOI) {
        return null;
    }

    const hypothesis = {
        doi: record.DOI,
        title: getTitle(record),
        content: formatHTML(record.Abstract),
        type: I.PublicationType.HYPOTHESIS
    };

    return hypothesis;
}

function buildMethodology(record: StudyItemResponse['data']['getStudyItem']): I.SubPearlInput | null {
    if (!record.DOI) {
        return null;
    }

    let methodology = '';

    if (record.DataCollectionMethodology) {
        methodology += buildTitledSection(
            'Method of data collection',
            record.DataCollectionMethodology.map((m) => m.Value)
        );
    }

    if (record.DataFormat) {
        methodology += buildTitledSection(
            'Data format',
            record.DataFormat.map((d) => d.Value)
        );
    }

    if (record.KindOfData && record.KindOfData.length > 0) {
        methodology += buildTitledSection('Kind of data', record.KindOfData);
    }

    if (record.NumberOfVariables) {
        methodology += buildTitledSection('Number of variables', record.NumberOfVariables);
    }

    if (record.SamplingProcedure) {
        methodology += buildTitledSection('Sampling procedure', record.SamplingProcedure);
    }

    if (record.WeightingMethodology) {
        methodology += buildTitledSection('Weighting methodology', record.WeightingMethodology);
    }

    if (record.Documents) {
        let documentation = '';

        for (const doc of record.Documents) {
            documentation += `<li><a href="${doc.Uri}" target="_blank" rel="noopener noreferrer">${doc.Description}</a></li>`;
        }

        if (documentation !== '') {
            const content = `<ul>${documentation}</ul>`;
            methodology += buildTitledSection('Documentation', content);
        }
    }

    if (methodology === '') {
        return null;
    }

    return {
        doi: record.DOI,
        title: getTitle(record),
        content: formatHTML(methodology),
        type: I.PublicationType.PROTOCOL
    };
}

function buildResults(record: StudyItemResponse['data']['getStudyItem']): I.SubPearlInput | null {
    if (!record.DOI) {
        return null;
    }

    let results = '';

    if (record.TimePeriod) {
        results += buildTitledSection('Time period', record.TimePeriod);
    }

    if (record.Country && record.Country.length > 0) {
        results += buildTitledSection('Country', record.Country);
    }

    if (record.SpatialUnit && record.SpatialUnit.length > 0) {
        results += buildTitledSection('Spatial unit', record.SpatialUnit);
    }

    if (record.ObservationUnit && record.ObservationUnit.length > 0) {
        results += buildTitledSection('Observation unit', record.ObservationUnit);
    }

    if (record.ObservationUnitLocation && record.ObservationUnitLocation.length > 0) {
        results += buildTitledSection('Observation unit location', record.ObservationUnitLocation);
    }

    if (record.Universe) {
        results += buildTitledSection('Population', record.Universe);
    }

    if (record.Datasets) {
        let datasetSection = '';

        for (const dataset of record.Datasets) {
            const uri = `https://datacatalogue.ukdataservice.ac.uk/datasets/dataset/${dataset.Id}`;
            datasetSection += `<li><a href="${uri}" target="_blank" rel="noopener noreferrer">${dataset.Title}</a></li>`;
        }

        if (datasetSection !== '') {
            const content = `<ul>${datasetSection}</ul>`;
            results += buildTitledSection('Datasets', content);
        }
    }

    if (results === '') {
        return null;
    }

    return {
        doi: record.DOI,
        title: getTitle(record),
        content: formatHTML(results),
        type: I.PublicationType.DATA
    };
}

async function buildTopicIds(
    record: StudyItemResponse['data']['getStudyItem'],
    source: I.PearlSource
): Promise<{ topicIds: string[]; unmappedTopicTitles: Set<string> }> {
    const topicIds: string[] = [];

    if (source.defaultTopicId) {
        topicIds.push(source.defaultTopicId);
    }

    const unmappedTopicTitles: Set<string> = new Set();

    for (const keyword of record.Keyword) {
        // Topics with IDs are ELSST topics
        if (!keyword.Id) continue;
        unmappedTopicTitles.add(keyword.Value);
    }

    const topics = await client.prisma.topic.findMany({
        where: { title: { in: Array.from(unmappedTopicTitles) } }
    });

    for (const topic of topics) {
        topicIds.push(topic.id);
        unmappedTopicTitles.delete(topic.title);
    }

    // We still have unmapped topics, try to find mappings for them
    if (unmappedTopicTitles.size > 0) {
        // Map lower level topics to their highest level topics
        const topicsToSearch: Set<string> = new Set();
        const lowerToTopMap: Record<string, string> = lowerToTopTopicMapping as Record<string, string>;
        const topicToOriginalMap = new Map<string, Set<string>>();

        for (const topicTitle of unmappedTopicTitles) {
            // Check if this is a lower level topic that needs to be mapped to a higher level one
            const highestLevelTopic = lowerToTopMap[topicTitle];
            const searchTopic = (highestLevelTopic || topicTitle).toLowerCase();

            topicsToSearch.add(searchTopic);

            // Track which original topics this search topic represents
            if (!topicToOriginalMap.has(searchTopic)) {
                topicToOriginalMap.set(searchTopic, new Set());
            }

            const originalTopics = topicToOriginalMap.get(searchTopic);

            if (originalTopics) {
                originalTopics.add(topicTitle);
            }
        }

        const topicMapping = await client.prisma.topicMapping.findMany({
            where: { title: { in: Array.from(topicsToSearch) }, source: source.slug }
        });

        for (const mapping of topicMapping) {
            if (mapping.topicId) {
                if (!topicIds.includes(mapping.topicId)) {
                    topicIds.push(mapping.topicId);
                }

                // Always remove the original topics when we find a valid mapping
                // (even if the topicId was already in the array from another source)
                const originalTopics = topicToOriginalMap.get(mapping.title);

                if (originalTopics) {
                    for (const originalTopic of originalTopics) {
                        unmappedTopicTitles.delete(originalTopic);
                    }
                } else {
                    console.warn(
                        `No original topics found for mapping title "${mapping.title}". This should not happen.`
                    );
                }
            }
        }
    }

    return { topicIds, unmappedTopicTitles };
}

export const harvestFromUKDS = async (
    source: I.PearlSource,
    resourceIds: string[]
): Promise<I.HarvestPearlsResponse> => {
    const responseData: I.HarvestPearlsResponse = { message: '', success: true };

    responseData.data = {
        pearlsCreated: { count: 0, items: [] },
        pearlsSkipped: { count: 0, items: [] }
    };

    responseData.metadata = {
        performanceTimings: []
    };

    for (const id of resourceIds) {
        try {
            let t = Date.now();
            const record = await fetchStudyItem(id);
            responseData.metadata.performanceTimings.push({ op: 'recordFetching', ms: Date.now() - t });

            if (!record) {
                const reason = 'Failed to fetch record from UKDS. Please check the resource ID.';
                responseData.data.pearlsSkipped.count += 1;
                responseData.data.pearlsSkipped.items.push({ id, reason });
                continue;
            }

            const existingPearl = await client.prisma.pearl.findFirst({
                where: {
                    externalId: id,
                    sourceId: source.id
                }
            });

            if (existingPearl) {
                responseData.data.pearlsSkipped.count += 1;
                responseData.data.pearlsSkipped.items.push({
                    id,
                    reason: 'Pearl with this resource ID already exists.'
                });
                continue;
            }

            const doi = record.DOI;

            if (!doi) {
                const reason = 'No DOI found in the record.';
                responseData.data.pearlsSkipped.count += 1;
                responseData.data.pearlsSkipped.items.push({ id, reason });
                continue;
            }

            const creators = buildCreators(record);

            const subPearls: I.SubPearlInput[] = [];

            const hypothesisSubPearl = buildHypothesis(record);

            if (hypothesisSubPearl) {
                subPearls.push(hypothesisSubPearl);
            }

            const methodologySubPearl = buildMethodology(record);

            if (methodologySubPearl) {
                subPearls.push(methodologySubPearl);
            }

            const resultsSubPearl = buildResults(record);

            if (resultsSubPearl) {
                subPearls.push(resultsSubPearl);
            }

            t = Date.now();

            const { topicIds, unmappedTopicTitles } = await buildTopicIds(record, source);

            responseData.metadata.performanceTimings.push({ op: 'topicMapping', ms: Date.now() - t });

            if (unmappedTopicTitles.size > 0) {
                const reason = `Missing topics: ${Array.from(unmappedTopicTitles).join(', ')}`;
                responseData.data.pearlsSkipped.count += 1;
                responseData.data.pearlsSkipped.items.push({ id, reason });
                continue;
            }

            t = Date.now();
            const newPearl = await create({
                doi: doi,
                externalId: id,
                sourceId: source.id,
                title: getTitle(record),
                creators: creators as [I.PearlCreatorInput, ...I.PearlCreatorInput[]],
                topicIds: topicIds as [string, ...string[]],
                subPearls: subPearls as [I.SubPearlInput, ...I.SubPearlInput[]]
            });

            responseData.data.pearlsCreated.count += 1;
            responseData.data.pearlsCreated.items.push({ id: newPearl.id });
            responseData.metadata.performanceTimings.push({ op: 'pearlCreation', ms: Date.now() - t });
        } catch (error) {
            responseData.data.pearlsSkipped.count += 1;
            responseData.data.pearlsSkipped.items.push({
                id,
                reason: 'Error occurred during processing.'
            });
            continue;
        }
    }

    responseData.success = responseData.data.pearlsCreated.count > 0;
    responseData.message =
        responseData.data.pearlsCreated.count === 0
            ? 'No records were processed successfully.'
            : responseData.data.pearlsSkipped.count === 0
            ? 'All records processed successfully.'
            : 'Some records were processed successfully, some were skipped.';

    return responseData;
};
