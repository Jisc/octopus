import * as I from 'interface';
import * as E from 'enum';

const createPearlCreatorSchema: I.Schema = {
    type: 'object',
    properties: {
        name: { type: 'string' },
        type: { enum: E.pearlCreatorType },
        creatorId: { type: 'string' },
        creatorTypeId: { type: 'string' }
    },
    required: ['name', 'type'],
    additionalProperties: false,
    allOf: [
        {
            if: { required: ['creatorId'] },
            then: { required: ['creatorTypeId'] }
        }
    ]
};

export default createPearlCreatorSchema;
