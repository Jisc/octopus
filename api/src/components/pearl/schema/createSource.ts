import * as I from 'interface';
import * as Enum from 'enum';

const createPearlSourceSchema: I.Schema = {
    type: 'object',
    properties: {
        name: { type: 'string' },
        identifier: { type: 'string' },
        identifierType: { enum: Enum.sourceIdentifierTypes },
        language: { enum: Enum.languageCodes },
        licenceType: { enum: Object.values(Enum.licences).map((l) => l.value) }
    },
    required: ['name', 'identifier', 'identifierType'],
    additionalProperties: false
};

export default createPearlSourceSchema;
