import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import middy from '@middy/core';
import * as I from 'interface';
import * as response from 'lib/response';
import * as oaiResponse from 'oai/response';

const validator = (schema: I.Schema, requestType: I.RequestType): middy.MiddlewareObj => {
    const ajv = new Ajv({ allErrors: true, useDefaults: true, coerceTypes: true });
    addFormats(ajv);

    const validate = ajv.compile(schema);

    const before: middy.MiddlewareFn<I.APIGatewayProxyEventV2> = (request): I.JSONResponse | void => {
        const valid = validate(request.event[requestType] || {});

        if (!valid) {
            for (const error of validate.errors || []) {
                switch (error.instancePath) {
                    case '/verb':
                        return response.xml(200, oaiResponse.invalidVerbResponse());
                    case '/metadataPrefix':
                        return response.xml(200, oaiResponse.invalidMetadataPrefixResponse());
                    case '/identifier':
                        return response.xml(200, oaiResponse.invalidIdentifierResponse());
                    case '/resumptionToken':
                        return response.xml(200, oaiResponse.badResumptionTokenResponse());
                    default:
                        return response.xml(200, oaiResponse.badArgumentResponse());
                }
            }
        }
    };

    return {
        before
    };
};

export default validator;
