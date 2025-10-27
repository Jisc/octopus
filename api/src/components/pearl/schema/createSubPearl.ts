import * as I from 'interface';

const createSubPearlSchema: I.Schema = {
    type: 'object',
    properties: {
        doi: {
            type: 'string'
        }
    },
    required: ['doi'],
    additionalProperties: false
};

export default createSubPearlSchema;
