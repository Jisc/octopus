import * as I from 'interface';

const getOAI: I.Schema = {
    type: 'object',
    properties: {
        verb: {
            type: 'string',
            enum: ['GetRecord', 'Identify', 'ListIdentifiers', 'ListMetadataFormats', 'ListRecords', 'ListSets']
        },
        metadataPrefix: {
            type: 'string',
            enum: ['oai_dc']
        },
        identifier: {
            type: 'string'
        },
        set: {
            type: 'string',
            enum: ['publications']
        },
        resumptionToken: {
            type: 'string',
            pattern: '^[A-Za-z0-9+/]+=*$',
            minLength: 16,
            maxLength: 256
        }
    },
    required: ['verb'],
    additionalProperties: false,
    allOf: [
        {
            if: {
                properties: {
                    verb: { const: 'GetRecord' }
                }
            },
            then: {
                required: ['identifier', 'metadataPrefix']
            }
        },
        {
            if: {
                properties: {
                    verb: { const: 'ListIdentifiers' }
                }
            },
            then: {
                required: ['metadataPrefix']
            }
        },
        {
            if: {
                properties: {
                    verb: { const: 'ListRecords' }
                }
            },
            then: {
                required: ['metadataPrefix']
            }
        }
    ]
};

export default getOAI;
