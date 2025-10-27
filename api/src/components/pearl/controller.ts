import * as response from 'lib/response';
import * as I from 'interface';
import * as pearlService from 'pearl/service';
import * as topicService from 'topic/service';

export const getAll = async (): Promise<I.JSONResponse> => {
    try {
        const pearls = await pearlService.getAll();

        return response.json(200, { pearls });
    } catch (error) {
        console.error(error);

        return response.json(500, { message: 'Unknown server error.' });
    }
};

export const create = async (event: I.AuthenticatedAPIRequest<I.CreatePearlRequestBody>): Promise<I.JSONResponse> => {
    try {
        const source = await pearlService.getSource(event.body.sourceId);

        if (!source) {
            return response.json(400, { message: 'Invalid source ID.' });
        }

        const topicIdsSet = new Set(event.body.topicIds);

        if (topicIdsSet.size !== event.body.topicIds.length) {
            return response.json(400, { message: 'Duplicate topic IDs are not allowed.' });
        }

        const topics = await topicService.getByMultipleIds(event.body.topicIds);

        if (topics.length !== event.body.topicIds.length) {
            const invalidTopicIds = event.body.topicIds.filter((id) => !topics.find((topic) => topic.id === id));

            return response.json(400, { message: `Invalid topic IDs: ${invalidTopicIds.join(', ')}` });
        }

        await pearlService.create(event.body);
    } catch (error) {
        console.error(error);

        return response.json(500, { message: 'Unknown server error.' });
    }

    return response.json(201, { message: 'Pearl created successfully.' });
};

export const getAllSources = async (): Promise<I.JSONResponse> => {
    try {
        const sources = await pearlService.getAllSources();

        return response.json(200, { sources });
    } catch (error) {
        console.error(error);

        return response.json(500, { message: 'Unknown server error.' });
    }
};

export const createSource = async (
    event: I.AuthenticatedAPIRequest<I.CreatePearlSourceRequestBody>
): Promise<I.JSONResponse> => {
    try {
        await pearlService.createSource(event.body);
    } catch (error) {
        console.error(error);
        response.json(500, { message: 'Unknown server error.' });
    }

    return response.json(201, { message: 'Pearl source created successfully.' });
};
