import * as I from 'interface';

const getOAI: I.Schema = {
    type: 'object',
    properties: {
        verb: {
            type: 'string',
            enum: ['GetRecord', 'Identify', 'ListSets']
        },
        metadataPrefix: {
            type: 'string',
            enum: ['oai_dc']
        },
        identifier: {
            type: 'string'
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
        }
    ]
};

export default getOAI;
