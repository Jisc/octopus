import * as I from 'interface';

const incrementalUKDSIngestHttpSchema: I.JSONSchemaType<I.TriggerUKDSIngestQueryParams> = {
    type: 'object',
    properties: {
        apiKey: {
            type: 'string'
        },
        dryRun: {
            type: 'boolean',
            nullable: true
        }
    },
    additionalProperties: false,
    required: ['apiKey']
};

export default incrementalUKDSIngestHttpSchema;
