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

const listIdentifiers = async (event: I.APIRequest<undefined, I.GetOAIRequestQueryParams>): Promise<I.XMLResponse> => {
    const queryParams = event.queryStringParameters || {};
    const limit = 10;

    let offset = 0;
    let from = queryParams.from;
    let until = queryParams.until;

    if (queryParams.resumptionToken) {
        const tokenData = oaiResponse.parseResumptionToken(queryParams.resumptionToken);

        if (tokenData) {
            offset = tokenData.offset;
            from = tokenData.from;
            until = tokenData.until;
        }
    }

    const publications = await publicationService.getOpenSearchPublications({
        limit,
        offset,
        authorType: 'individual',
        dateFrom: from,
        dateTo: until
    });

    const publicationIds: string[] = publications.body.hits.hits.map((hit) => hit._id as string);
    const publicationVersions = await publicationVersionService.getAllByPublicationIds(publicationIds);

    if (publicationVersions.length === 0) {
        return response.xml(200, oaiResponse.noRecordsMatchResponse());
    }

    let resumptionToken = '';

    if (offset + limit < publications.body.hits.total.value) {
        resumptionToken = oaiResponse.generateResumptionToken({
            offset: offset + limit,
            limit,
            from,
            until
        });
    }

    const listIdentifiersResponse = oaiResponse.listIdentifiersResponse(
        publicationVersions,
        queryParams,
        offset,
        resumptionToken
    );

    return response.xml(200, listIdentifiersResponse);
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
            case 'ListIdentifiers':
                return listIdentifiers(event);
        }
    } catch (error) {
        console.error('OAI Get Error:', error);

        return response.xml(500, oaiResponse.internalServerErrorResponse());
    }
};
