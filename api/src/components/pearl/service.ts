import * as client from 'lib/client';
import * as I from 'interface';

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

export const create = async (data: I.CreatePearlRequestBody) => {
    return await client.prisma.pearl.create({
        data: {
            title: data.title,
            creators: {
                create: data.creators
            },
            language: data.language,
            licenceType: data.licenceType,
            topics: { connect: data.topicIds.map((id) => ({ id })) },
            source: { connect: { id: data.sourceId } },
            subPearls: { create: data.subPearls }
        },
        select: {
            id: true
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
