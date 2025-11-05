import * as I from 'interface';

const getOAI: I.Schema = {
    type: 'object',
    properties: {
        verb: {
            type: 'string',
            enum: ['GetRecord']
        },
        metadataPrefix: {
            type: 'string',
            enum: ['oai_dc']
        },
        identifier: {
            type: 'string'
        }
    },
    required: ['verb', 'metadataPrefix'],
    additionalProperties: false
};

export default getOAI;
