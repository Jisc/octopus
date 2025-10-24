import * as response from 'lib/response';
import * as I from 'interface';
import * as pearlService from 'pearl/service';

export const getAll = async (): Promise<I.JSONResponse> => {
    try {
        const pearls = await pearlService.getAll();

        return response.json(200, { pearls });
    } catch (error) {
        return response.json(500, { message: 'Unknown server error.' });
    }
};

export const create = async (event: I.AuthenticatedAPIRequest<I.CreatePearlRequestBody>): Promise<I.JSONResponse> => {
    try {
        await pearlService.create(event.body);
    } catch (error) {
        return response.json(500, { message: 'Unknown server error.' });
    }

    return response.json(201, { message: 'Pearl created successfully.' });
};

export const createSource = async (
    event: I.AuthenticatedAPIRequest<I.CreatePearlSourceRequestBody>
): Promise<I.JSONResponse> => {
    try {
        await pearlService.createSource(event.body);
    } catch (error) {
        response.json(500, { message: 'Unknown server error.' });
    }

    return response.json(201, { message: 'Pearl source created successfully.' });
};
