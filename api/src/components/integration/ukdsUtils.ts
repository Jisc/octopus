import { StudyItem, StudyItemResponse, StudyListResponse } from 'pearl/types';
import lowerToTopTopicMapping from 'pearl/lowerToTopTopicMapping.json';
import * as client from 'lib/client';
import * as I from 'interface';
import * as fs from 'fs/promises';
import * as email from 'email';
import { create, update } from 'pearl/service';
import { HandledUKDS } from 'interface';

const apiURL = process.env.UKDS_API_URL;
const apiKey = process.env.UKDS_API_KEY;

export const fetchStudyList = async (
    start = 0,
    limit = 100
): Promise<{
    totalCount: number;
    list: Pick<StudyItem, 'FriendlyId' | 'LatestEditionReleaseDate'>[];
}> => {
    if (!apiURL || !apiKey) {
        console.error('UKDS API URL or API Key is not defined.');

        return {
            totalCount: 0,
            list: []
        };
    }

    const query = `
        query GetStudyList($DateFrom: Int, $DateTo: Int, $QueryString: String, $Rows: Int, $Sort: Int, $Start: Int, $FacetParams: String, $Phrase: Boolean) {
            getStudyList(DateFrom: $DateFrom, DateTo: $DateTo, QueryString: $QueryString, Rows: $Rows, Sort: $Sort, Start: $Start, FacetParams: $FacetParams, Phrase: $Phrase) {
                Count
                Results { FriendlyId, LatestEditionReleaseDate }
            }
        }`;

    const variables = {
        QueryString: '',
        Start: start,
        Rows: limit,
        Phrase: false,
        DateFrom: '440',
        DateTo: new Date().getFullYear().toString()
    };

    try {
        // https://datacatalogue.ukdataservice.ac.uk/searchresults?sort=0&tab=0
        const res = await fetch(apiURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey
            },
            body: JSON.stringify({ query, variables })
        });

        if (!res.ok) {
            return {
                totalCount: 0,
                list: []
            };
        }

        const json = (await res.json()) as StudyListResponse;

        return {
            totalCount: json.data.getStudyList.Count,
            list: json.data.getStudyList.Results.map((result) => ({
                FriendlyId: result.FriendlyId,
                LatestEditionReleaseDate: result.LatestEditionReleaseDate
            }))
        };
    } catch (error) {
        console.error(error);
    }

    return {
        totalCount: 0,
        list: []
    };
};

export const fetchStudyItem = async (friendlyId: string): Promise<StudyItem | null> => {
    if (!apiURL || !apiKey) {
        console.error('UKDS API URL or API Key is not defined.');

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
        FriendlyId: friendlyId
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

export const getSource = async (slug: I.PublicationImportSource): Promise<I.PearlSource | null> => {
    try {
        const source = await client.prisma.pearlSource.findFirst({ where: { slug } });

        if (!source) {
            console.error(`No source found with slug "${slug}".`);

            return null;
        }

        return source;
    } catch (error) {
        console.error(`Error fetching source with slug "${slug}":`, error);

        return null;
    }
};

export const ingestReport = async (
    format: I.IngestReportFormat,
    ingestDetails: {
        checkedCount: number;
        durationSeconds: number;
        createdCount: number;
        updatedCount: number;
        skippedCount: number;
        subpearlCount: number;
        dryRun: boolean;
    }
): Promise<void> => {
    const { checkedCount, durationSeconds, createdCount, updatedCount, skippedCount, subpearlCount, dryRun } =
        ingestDetails;
    const intro = `Full UKDS import ${dryRun ? 'dry ' : ''}run completed.`;
    const timingInfo = `Duration: ${durationSeconds} seconds.`;
    const detailsPrefix = `The ${dryRun ? 'simulated ' : ''}results of this run are as follows.`;
    const text = `
${intro}
${timingInfo}
${detailsPrefix} 
Studies checked: ${checkedCount}.
Pearls created: ${createdCount}.
Pearls updated: ${updatedCount}.
Pearls skipped (already up to date): ${skippedCount}.
Subpearls processed: ${subpearlCount}.`;

    if (format === 'file') {
        const fileName = 'ukds-import-report.txt';
        await fs.writeFile(fileName, text);
        console.log(`Report file written to ${fileName}.`);

        return;
    }

    if (format === 'email') {
        const html = `
        <html>
            <body>
                <p>${intro}</p>
                <p>${timingInfo}</p>
                <p>${detailsPrefix}</p>
                <ul>
                    <li>Studies checked: ${checkedCount}</li>    
                    <li>Pearls created: ${createdCount}</li>
                    <li>Pearls updated: ${updatedCount}</li>    
                    <li>Pearls skipped (already up to date): ${skippedCount}</li>
                    <li>Subpearls processed: ${subpearlCount}</li>
                </ul>
            </body>
        </html>
    `;
        await email.ukdsReport(html, text);

        return;
    }
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

    if (record.DateOfCollection) {
        results += buildTitledSection('Dates of fieldwork', record.DateOfCollection);
    }

    if (record.Country && record.Country.length > 0) {
        results += buildTitledSection('Country', record.Country);
    }

    if (record.Region) {
        results += buildTitledSection('Region', record.Region);
    }

    if (record.Town) {
        results += buildTitledSection('Town', record.Town);
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

    if (record.DeviationFromSample) {
        results += buildTitledSection('Number of units', record.DeviationFromSample);
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

export const handleIncomingStudy = async (
    study: Pick<StudyItem, 'FriendlyId' | 'LatestEditionReleaseDate'>,
    source: I.PearlSource,
    dryRun?: boolean,
    forceUpdate?: boolean
): Promise<HandledUKDS> => {
    const responseData: HandledUKDS = {
        totalSubpearls: 0,
        unrecognisedTopics: new Set<string>(),
        success: false,
        message: '',
        actionTaken: 'none'
    };

    let requiresUpdate = forceUpdate || false;

    try {
        const existingPearl = await client.prisma.pearl.findFirst({
            where: { externalId: study.FriendlyId, sourceId: source.id }
        });

        if (existingPearl) {
            const existingPearlDate = new Date(existingPearl.updatedAt);
            const studyDate = study.LatestEditionReleaseDate ? new Date(study.LatestEditionReleaseDate) : null;

            if (studyDate && studyDate > existingPearlDate) {
                requiresUpdate = true;
            } else {
                responseData.success = true;
                responseData.message =
                    'A publication linked to this UKDS record already exists in the system and is up to date.';
                responseData.actionTaken = 'none';

                return responseData;
            }
        }

        const record = await fetchStudyItem(study.FriendlyId);

        if (!record) {
            responseData.success = false;
            responseData.message = 'Failed to fetch record from UKDS. Please check the resource ID.';
            responseData.actionTaken = 'none';

            return responseData;
        }

        const doi = record.DOI;

        if (!doi) {
            responseData.success = false;
            responseData.message = 'No DOI found in the record.';
            responseData.actionTaken = 'none';

            return responseData;
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

        const { topicIds, unmappedTopicTitles } = await buildTopicIds(record, source);

        if (unmappedTopicTitles.size > 0) {
            responseData.success = false;
            responseData.message = 'Some topics in the record could not be mapped to existing topics in the system.';
            responseData.unrecognisedTopics = unmappedTopicTitles;

            return responseData;
        }

        const pearlData = {
            doi: doi,
            title: getTitle(record),
            externalId: study.FriendlyId,
            creators: creators as [I.PearlCreatorInput, ...I.PearlCreatorInput[]],
            topicIds: topicIds as [string, ...string[]],
            subPearls: subPearls as [I.SubPearlInput, ...I.SubPearlInput[]]
        };

        if (existingPearl && requiresUpdate) {
            if (!dryRun) {
                await update(existingPearl.id, pearlData);
            }

            responseData.actionTaken = 'update';
            responseData.message = 'An existing publication linked to this UKDS record was updated in the system.';
        } else {
            if (!dryRun) {
                await create({ sourceId: source.id, ...pearlData });
            }

            responseData.actionTaken = 'create';
            responseData.message = 'A new pearl was created in the system based on this UKDS record.';
        }

        responseData.success = true;
        responseData.totalSubpearls = subPearls.length;
    } catch (error) {
        console.error(`Error processing UKDS study with ID ${study.FriendlyId}:`, error);
        responseData.success = false;
        responseData.message =
            'An unexpected error occurred while processing the record. Please check the logs for details.';
    }

    return responseData;
};
