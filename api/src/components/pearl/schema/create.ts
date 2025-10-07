import * as I from 'interface';
import * as E from 'enum';

import createPearlCreatorSchema from './createCreator';
import createSubPearlSchema from './createSubPearl';

const createPearlSchema: I.Schema = {
    type: 'object',
    properties: {
        title: {
            type: 'string'
        },
        creators: {
            type: 'array',
            items: createPearlCreatorSchema,
            minItems: 1
        },
        language: {
            enum: E.languageCodes
        },
        licenceType: {
            enum: Object.values(E.licences).map((l) => l.value)
        },
        topicIds: {
            type: 'array',
            items: { type: 'string' },
            minItems: 1,
            uniqueItems: true
        },
        sourceId: {
            type: 'string'
        },
        subPearls: {
            type: 'array',
            items: createSubPearlSchema,
            minItems: 1,
            uniqueItems: true
        }
    },
    required: ['title', 'creators', 'topicIds', 'subPearls'],
    additionalProperties: false
};

export default createPearlSchema;
