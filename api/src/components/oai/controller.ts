import * as I from 'interface';
import * as response from 'lib/response';
import * as oaiResponse from 'oai/response';
import * as OAIService from 'oai/service';
import * as publicationService from 'publication/service';
import * as publicationVersionService from 'publicationVersion/service';

const getRecord = async (event: I.APIRequest<undefined, I.GetOAIRequestQueryParams>): Promise<I.XMLResponse> => {
    const queryParams = event.queryStringParameters || {};

    if (!queryParams.identifier) {
        return response.xml(200, oaiResponse.invalidIdentifierResponse());
    }

    const publicationVersion = await OAIService.getPublicationVersionByDoi(queryParams.identifier);

    if (!publicationVersion) {
        return response.xml(200, oaiResponse.recordNotFoundResponse());
    }

    const links = await publicationService.getDirectLinksForPublication(publicationVersion.versionOf, null, true);

    const getRecordResponse = oaiResponse.getRecordResponse(publicationVersion, links, queryParams);

    return response.xml(200, getRecordResponse);
};

const identify = async (): Promise<I.XMLResponse> => {
    const publicationVersion = await publicationVersionService.getEarliestDoiPublicationVersion();
    const identifyResponse = oaiResponse.identifyResponse(publicationVersion);

    return response.xml(200, identifyResponse);
};

const listSets = async (): Promise<I.XMLResponse> => {
    const listSetsResponse = oaiResponse.listSetsResponse();

    return response.xml(200, listSetsResponse);
};

export const get = async (event: I.APIRequest<undefined, I.GetOAIRequestQueryParams>): Promise<I.XMLResponse> => {
    try {
        const { verb } = event.queryStringParameters || {};

        switch (verb) {
            case 'GetRecord':
                return getRecord(event);
            case 'Identify':
                return identify();
            case 'ListSets':
                return listSets();
        }
    } catch (error) {
        console.error('OAI Get Error:', error);

        return response.xml(500, oaiResponse.internalServerErrorResponse());
    }
};
