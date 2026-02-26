import * as I from 'interface';

const harvestSchema: I.Schema = {
    type: 'object',
    properties: {
        sourceId: { type: 'string' },
        resourceIds: {
            type: 'array',
            items: { type: 'string' },
            minItems: 1,
            uniqueItems: true
        }
    },
    required: ['sourceId', 'resourceIds'],
    additionalProperties: false
};

export default harvestSchema;
