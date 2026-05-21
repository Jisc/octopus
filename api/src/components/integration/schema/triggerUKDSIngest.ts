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
        },
        forceUpdate: {
            type: 'boolean',
            nullable: true
        },
        limit: {
            type: 'integer',
            nullable: true,
            minimum: 1
        }
    },
    additionalProperties: false,
    required: ['apiKey']
};

export default incrementalUKDSIngestHttpSchema;
