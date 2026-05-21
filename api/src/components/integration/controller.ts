import * as I from 'interface';
import * as integrationService from 'integration/service';
import * as response from 'lib/response';

export const triggerAriIngest = async (
    event: I.APIRequest<undefined, I.TriggerAriIngestQueryParams, undefined>
): Promise<I.JSONResponse> => {
    const triggerTaskOutput = await integrationService.triggerAriIngest(event.queryStringParameters.dryRun);

    return response.json(200, { message: triggerTaskOutput });
};

export const triggerAriArchivedCheck = async (
    event: I.APIRequest<undefined, I.TriggerAriArchivedCheckQueryParams, undefined>
): Promise<I.JSONResponse> => {
    const triggerTaskOutput = await integrationService.triggerAriArchivedCheck(event.queryStringParameters.dryRun);

    return response.json(200, { message: triggerTaskOutput });
};

export const triggerUKDSIngest = async (
    event: I.APIRequest<undefined, I.TriggerUKDSIngestQueryParams, undefined>
): Promise<I.JSONResponse> => {
    const triggerTaskOutput = await integrationService.triggerUKDSIngest(
        event.queryStringParameters.dryRun,
        event.queryStringParameters.forceUpdate,
        event.queryStringParameters.limit
    );

    return response.json(200, { message: triggerTaskOutput });
};
