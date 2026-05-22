import * as I from 'interface';
import { Prisma } from '@prisma/client';
import * as client from 'lib/client';
import * as helpers from 'lib/helpers';

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
                id: helpers.generatePearlId(),
                doi: data.doi,
                title: data.title,
                creators: {
                    create: data.creators
                },
                language: data.language,
                externalId: data.externalId,
                licenceType: data.licenceType,
                topics: { connect: topics },
                source: { connect: { id: data.sourceId } }
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

export const createSource = async (data: I.CreatePearlSourceRequestBody) => {
    return client.prisma.pearlSource.create({
        data: data
    });
};

export const getSourceBySlug = (slug: I.PublicationImportSource) =>
    client.prisma.pearlSource.findFirst({
        where: {
            slug
        }
    });

export const getByExternalIdAndSourceId = (externalId: string, sourceId: string) =>
    client.prisma.pearl.findFirst({
        where: {
            externalId,
            sourceId
        }
    });

export const mapPearlDataToPublicationBody = (
    pearlData: I.PearlInput,
    subPearl: I.SubPearlInput,
    source: I.PearlSource,
    pearlId: string
): I.CreatePublicationRequestBody => {
    return {
        type: subPearl.type,
        title: subPearl.title,
        content: subPearl.content,
        // Topics are only attached to the HYPOTHESIS (the root of the publication chain).
        topicIds: subPearl.type === I.PublicationType.HYPOTHESIS ? pearlData.topicIds : undefined,
        externalId: pearlData.externalId,
        externalSource: source.slug,
        language: source.language,
        ...(source.licenceType ? { licence: source.licenceType } : {}),
        conflictOfInterestStatus: false,
        pearlId
    };
};

export const generatePublicationId = (pearlDOI: string, type: I.PublicationType): string => {
    let suffix = pearlDOI.split('/').pop();

    if (!suffix) {
        throw new Error(`Invalid DOI format: ${pearlDOI}`);
    }

    suffix = suffix?.replace('UKDA-SN-', 'UKDS-');

    return `${suffix}-${type.slice(0, 3)}`.toLocaleLowerCase();
};

export const mapPearlDataToPublicationVersionBody = (
    pearlData: I.PearlInput,
    subPearl: I.SubPearlInput,
    source: I.PearlSource
): Prisma.PublicationVersionUpdateInput => {
    return {
        title: subPearl.title,
        content: subPearl.content,
        language: source.language,
        ...(source.licenceType ? { licence: source.licenceType } : {}),
        conflictOfInterestStatus: false,
        conflictOfInterestText: null,
        publishedDate: pearlData.publicationDate,
        ...(subPearl.type === I.PublicationType.HYPOTHESIS && {
            topics: {
                set: pearlData.topicIds.map((id) => ({ id }))
            }
        })
    };
};

export const getPublicationPearl = async (
    publicationId: string
): Promise<
    | (Pick<I.Pearl, 'id' | 'doi'> & {
          creators: Pick<I.PearlCreator, 'id' | 'name' | 'type' | 'createdAt'>[];
      })
    | null
> => {
    const publication = await client.prisma.publication.findUnique({
        where: { id: publicationId },
        select: {
            pearl: {
                select: {
                    id: true,
                    doi: true,
                    creators: {
                        select: {
                            id: true,
                            name: true,
                            type: true,
                            createdAt: true
                        }
                    }
                }
            }
        }
    });

    return publication?.pearl || null;
};
