import * as I from 'interface';
import * as response from 'lib/response';
import * as userService from 'user/service';
import * as authorizationService from 'authorization/service';

const helpdeskEnabled = (user?: I.User): boolean => {
    if (!user) {
        return false;
    }

    const helpdeskUserIds = process.env.HELPDESK_ENABLED_USER_IDS;

    if (!helpdeskUserIds) {
        return false;
    }

    try {
        console.log('Helpdesk enabled user IDs:', helpdeskUserIds);
        console.log('Current user ID:', user.id);

        return helpdeskUserIds.split(',').some((id) => id.trim() === user.id);
    } catch {
        return false;
    }
};

export const getStatus = async (event: I.APIRequest): Promise<I.JSONResponse> => {
    const status: I.HelpdeskStatus = { enabled: helpdeskEnabled(event.user) };

    return response.json(200, status);
};

export const startSession = async (event: I.APIRequest<I.StartHelpdeskSessionBody>): Promise<I.JSONResponse> => {
    if (!helpdeskEnabled(event.user)) {
        return response.json(403, { message: 'Helpdesk feature is not enabled for this user' });
    }

    try {
        const targetUser = await userService.get(event.body.userId, true);

        if (!targetUser) {
            return response.json(404, { message: 'User not found' });
        }

        const token = authorizationService.createHelpdeskJWT({ ...targetUser, helpdeskInitiatorId: event.user?.id });

        console.log(
            `Helpdesk session started by user ${event.user?.id} for target user ${
                targetUser.id
            } at ${new Date().toISOString()}`
        );

        return response.json(200, { token });
    } catch (error) {
        console.error('Error starting helpdesk session:', error);

        return response.json(500, { message: 'Internal server error' });
    }
};

export const stopSession = async (event: I.APIRequest): Promise<I.JSONResponse> => {
    if (!helpdeskEnabled(event.user)) {
        return response.json(403, { message: 'Helpdesk feature is not enabled for this user' });
    }

    console.log(`Helpdesk session stopped by user ${event.user?.id} at ${new Date().toISOString()}`);

    return response.json(200, { token: null });
};
