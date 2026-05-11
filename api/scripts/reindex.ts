import 'dotenv/config';
import { convert } from 'html-to-text';
import * as client from '../src/lib/client';
import * as Helpers from '../src/lib/helpers';

const reindex = async (): Promise<void> => {
    const doesIndexExists = await client.search.indices.exists({
        index: 'publications'
    });

    if (doesIndexExists.body) {
        await client.search.indices.delete({
            index: 'publications'
        });
    }

    const pubs = await client.prisma.publication.findMany({
        where: {
            versions: {
                some: {
                    isLatestLiveVersion: true
                }
            }
        },
        include: {
            versions: {
                where: {
                    isLatestLiveVersion: true
                },
                select: {
                    title: true,
                    description: true,
                    generativeAIUsage: true,
                    keywords: true,
                    content: true,
                    publishedDate: true,
                    coAuthors: true,
                    user: {
                        select: {
                            role: true
                        }
                    }
                }
            }
        }
    });

    console.log(`reindexing ${pubs.length} publications`);

    for (const pub of pubs) {
        const latestLiveVersion = pub.versions[0];

        if (latestLiveVersion) {
            await client.search.create({
                index: 'publications',
                id: pub.id,
                body: {
                    id: pub.id,
                    type: pub.type,
                    title: latestLiveVersion.title,
                    organisationalAuthor: latestLiveVersion.user.role === 'ORGANISATION',
                    description: latestLiveVersion.description,
                    keywords: latestLiveVersion.keywords,
                    content: latestLiveVersion.content,
                    publishedDate: latestLiveVersion.publishedDate,
                    cleanContent: convert(latestLiveVersion.content),
                    generativeAIUsage: latestLiveVersion.generativeAIUsage || null,
                    affiliations: Helpers.indexableAffilicationsFromCoAuthors(latestLiveVersion.coAuthors)
                }
            });
        }
    }

    const pearls = await client.prisma.pearl.findMany({
        select: {
            id: true,
            title: true,
            createdAt: true,
            creators: {
                select: {
                    name: true
                }
            },
            subPearls: {
                select: {
                    id: true,
                    title: true,
                    type: true,
                    content: true
                }
            }
        }
    });
    
    console.log(`reindexing ${pearls.length} pearls`);

    for (const pearl of pearls) {
        for (const subPearl of pearl.subPearls) {
            await client.search.create({
                index: 'publications',
                id: subPearl.id,
                body: {
                    id: subPearl.id,
                    type: subPearl.type,
                    title: subPearl.title,
                    organisationalAuthor: true,
                    description: "",
                    keywords: [],
                    content: subPearl.content,
                    publishedDate: pearl.createdAt,
                    cleanContent: convert(subPearl.content),
                    generativeAIUsage: null,
                    affiliations: [],
                    isPearl: true
                }
            });
        }
    }
};

reindex()
    .then(() => console.log('Completed reindex'))
    .catch((error) => console.log('Error while reindexing: ', error));
