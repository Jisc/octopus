import * as XMLBuilder from 'xmlbuilder2';
import * as I from 'lib/interface';
import * as Helpers from 'lib/helpers';

export const OAI_DC_METADATA_SCHEMA = {
    'xmlns:oai_dc': 'http://www.openarchives.org/OAI/2.0/oai_dc/',
    'xmlns:dc': 'http://purl.org/dc/elements/1.1/',
    'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
    'xsi:schemaLocation': 'http://www.openarchives.org/OAI/2.0/oai_dc/ http://www.openarchives.org/OAI/2.0/oai_dc.xsd'
};

export const OAI_PMH_SCHEMA = {
    xmlns: 'http://www.openarchives.org/OAI/2.0/',
    'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
    'xsi:schemaLocation': 'http://www.openarchives.org/OAI/2.0/ http://www.openarchives.org/OAI/2.0/OAI-PMH.xsd'
};

const BASE_URL = `https://${process.env.STAGE}.api.octopus.ac/v1/oai2`;

const writerOptions = { prettyPrint: true };

const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

export const responseRoot = (reqAttr: I.OAIRequestAttributes = {}): ReturnType<typeof XMLBuilder.create> =>
    XMLBuilder.create({ version: '1.0', encoding: 'UTF-8' })
        .ele('OAI-PMH', OAI_PMH_SCHEMA)
        .ele('responseDate')
        .txt(new Date().toISOString())
        .up()
        .ele('request', reqAttr)
        .txt(BASE_URL)
        .up();

export const invalidVerbResponse = (): string =>
    responseRoot().ele('error', { code: 'badVerb' }).txt('Illegal OAI verb').up().end(writerOptions);

export const invalidMetadataPrefixResponse = (): string =>
    responseRoot().ele('error', { code: 'cannotDisseminateFormat' }).up().end(writerOptions);

export const invalidIdentifierResponse = (): string =>
    responseRoot()
        .ele('error', { code: 'idDoesNotExist' })
        .txt('No matching identifier in repository')
        .up()
        .end(writerOptions);

export const badArgumentResponse = (): string =>
    responseRoot().ele('error', { code: 'badArgument' }).up().end(writerOptions);

export const recordNotFoundResponse = (): string =>
    responseRoot()
        .ele('error', { code: 'idDoesNotExist' })
        .txt('No matching identifier in repository')
        .up()
        .end(writerOptions);

export const badResumptionTokenResponse = (): string =>
    responseRoot()
        .ele('error', { code: 'badResumptionToken' })
        .txt('The resumption token is invalid or expired')
        .up()
        .end(writerOptions);

export const noRecordsMatchResponse = (): string =>
    responseRoot().ele('error', { code: 'noRecordsMatch' }).txt('No records match the request').up().end(writerOptions);

export const internalServerErrorResponse = (): string =>
    responseRoot().ele('error', { code: 'internalServerError' }).txt('Internal server error').up().end(writerOptions);

// https://www.openarchives.org/OAI/openarchivesprotocol.html#GetRecord
export const getRecordResponse = (
    publicationVersion: I.OAIPublicationVersion | null,
    links: {
        linkedTo: I.LinkedToPublication[];
        linkedFrom: I.LinkedFromPublication[];
    },
    params: I.GetOAIRequestQueryParams
): string => {
    if (!params.identifier) {
        return recordNotFoundResponse();
    }

    if (!publicationVersion) {
        return recordNotFoundResponse();
    }

    const { verb, metadataPrefix, identifier } = params;
    const {
        coAuthors,
        createdAt,
        description,
        funders,
        fundersStatement,
        keywords,
        language,
        licence,
        publishedDate,
        title,
        topics
    } = publicationVersion;

    const dateStamp = formatDate(publishedDate || createdAt);
    const recordRoot = responseRoot({ verb, metadataPrefix, identifier }).ele('GetRecord').ele('record');

    // Header
    const header = recordRoot.ele('header');
    header.ele('identifier').txt(identifier).up();
    header.ele('datestamp').txt(dateStamp).up();
    header.ele('setSpec').txt('publications').up();
    header.up();

    // Metadata
    const metadata = recordRoot.ele('metadata').ele('oai_dc:dc', OAI_DC_METADATA_SCHEMA);
    metadata
        .ele('dc:title', {})
        .txt(title || '')
        .up();

    coAuthors.forEach((author) => metadata.ele('dc:creator').txt(Helpers.getUserFullName(author.user)).up());
    keywords.forEach((keyword) => metadata.ele('dc:subject').txt(keyword).up());
    topics.forEach((topic) => metadata.ele('dc:subject').txt(topic.title).up());

    if (description) {
        metadata.ele('dc:description').txt(description).up();
    }

    if (fundersStatement) {
        metadata.ele('dc:description').txt(fundersStatement).up();
    }

    metadata.ele('dc:publisher').txt('Octopus').up();

    funders.forEach((funder) => metadata.ele('dc:contributor').txt(funder.name).up());

    metadata.ele('dc:date').txt(dateStamp).up();
    metadata.ele('dc:identifier').txt(identifier).up();
    metadata.ele('dc:language').txt(language).up();

    links.linkedTo.forEach((link) => metadata.ele('dc:relation', { type: 'predecessor' }).txt(link.doi).up());
    links.linkedFrom.forEach((link) => metadata.ele('dc:relation', { type: 'successor' }).txt(link.doi).up());

    metadata.ele('dc:rights').txt(licence).up();
    metadata.up();

    return recordRoot.up().end(writerOptions);
};

export const identifyResponse = (
    publicationVersion: Pick<NonNullable<I.OAIPublicationVersion>, 'createdAt' | 'publishedDate'> | null
): string => {
    const response = responseRoot({ verb: 'Identify' }).ele('Identify');

    response.ele('repositoryName').txt('Octopus').up();
    response.ele('baseURL').txt(BASE_URL).up();
    response.ele('protocolVersion').txt('2.0').up();
    response.ele('adminEmail').txt('help@jisc.ac.uk').up();

    if (publicationVersion) {
        const { createdAt, publishedDate } = publicationVersion;
        response
            .ele('earliestDatestamp')
            .txt(formatDate(publishedDate || createdAt))
            .up();
    }

    response.ele('deletedRecord').txt('no').up();
    response.ele('granularity').txt('YYYY-MM-DDThh:mm:ssZ').up();

    return response.up().end(writerOptions);
};

export const listSetsResponse = (): string => {
    const response = responseRoot({ verb: 'ListSets' }).ele('ListSets');

    response.ele('set');
    response.ele('setSpec').txt('publications').up();
    response.ele('setName').txt('Publications').up();
    response.ele('setDescription');
    response.ele('oai_dc:dc', OAI_DC_METADATA_SCHEMA);
    response.ele('dc:description').txt('All publications in Octopus').up();
    response.up();
    response.up();

    return response.up().end(writerOptions);
};

export const listIdentifiersResponse = (
    publicationVersionHeaders: I.OAIPublicationVersionHeader[],
    params: I.GetOAIRequestQueryParams,
    cursor = 0,
    resumptionToken?: string
): string => {
    const { verb, metadataPrefix, identifier } = params;

    const listIdentifiersRoot = responseRoot({ verb, metadataPrefix, identifier }).ele('ListIdentifiers');

    for (const pubHeader of publicationVersionHeaders) {
        const { doi, createdAt, publishedDate } = pubHeader;

        console.log(doi);

        if (!doi) {
            continue;
        }

        const dateStamp = formatDate(publishedDate || createdAt);

        const header = listIdentifiersRoot.ele('header');
        header.ele('identifier').txt(doi).up();
        header.ele('datestamp').txt(dateStamp).up();
        header.ele('setSpec').txt('publications').up();
        header.up();
    }

    if (resumptionToken) {
        listIdentifiersRoot
            .ele('resumptionToken', { cursor, completeListSize: publicationVersionHeaders.length })
            .txt(resumptionToken)
            .up();
    }

    return listIdentifiersRoot.up().end(writerOptions);
};

export const generateResumptionToken = (params: {
    offset: number;
    limit: number;
    from?: string;
    until?: string;
}): string => {
    const tokenData = {
        offset: params.offset,
        limit: params.limit,
        ...(params.from && { from: params.from }),
        ...(params.until && { until: params.until })
    };

    return Buffer.from(JSON.stringify(tokenData)).toString('base64');
};

export const parseResumptionToken = (
    token: string
): {
    offset: number;
    limit: number;
    from?: string;
    until?: string;
} | null => {
    try {
        const decoded = Buffer.from(token, 'base64').toString('utf-8');

        return JSON.parse(decoded);
    } catch {
        return null;
    }
};
