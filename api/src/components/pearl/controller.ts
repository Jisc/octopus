import * as I from 'interface';
import * as pearlService from 'pearl/service';
import * as response from 'lib/response';

export const getPublicationPearl = async (
    event: I.APIRequest<undefined, undefined, I.GetPublicationPathParams>
): Promise<I.JSONResponse> => {
    const publicationId = event.pathParameters.publicationId;

    try {
        const pearl = await pearlService.getPublicationPearl(publicationId);

        if (!pearl) {
            return response.json(404, { message: 'Not found.' });
        }

        return response.json(200, pearl);
    } catch (err) {
        console.log(err);

        return response.json(500, { message: 'Unknown server error.' });
    }
};
