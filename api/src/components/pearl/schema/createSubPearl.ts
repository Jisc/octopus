import * as I from 'interface';

const createSubPearlSchema: I.Schema = {
    type: 'object',
    properties: {
        title: {
            type: 'string'
        },
        content: {
            type: 'string'
        },
        type: {
            type: 'string',
            enum: Object.values(I.PublicationType)
        },
        doi: {
            type: 'string'
        }
    },
    required: ['title', 'content', 'type', 'doi'],
    additionalProperties: false
};

export default createSubPearlSchema;
