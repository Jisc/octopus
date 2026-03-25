import * as I from 'interface';
import * as response from 'lib/response';
import * as userService from 'user/service';
import { getParameter } from 'lib/ssm';
import * as authorizationService from 'authorization/service';
import * as Helpers from 'lib/helpers';

const helpdeskEnabled = async (user?: I.User): Promise<boolean> => {
    if (!user) {
        return false;
    }

    try {
        const helpdeskUserIds = Helpers.checkEnvVariable('HELPDESK_ENABLED_USER_IDS');

        if (!helpdeskUserIds) {
            return false;
        }

        const featureFlagEnabled = await getParameter('helpdesk_enabled');

        if (featureFlagEnabled !== 'true') {
            return false;
        }

        console.log('Helpdesk enabled user IDs:', helpdeskUserIds);
        console.log('Current user ID:', user.id);

        return helpdeskUserIds.split(',').some((id) => id.trim() === user.id);
    } catch (error) {
        console.error('Error checking helpdesk enabled status:', error);

        return false;
    }
};

export const getStatus = async (event: I.APIRequest): Promise<I.JSONResponse> => {
    const enabled = await helpdeskEnabled(event.user);
    const status: I.HelpdeskStatus = { enabled };

    return response.json(200, status);
};

export const startSession = async (event: I.APIRequest<I.StartHelpdeskSessionBody>): Promise<I.JSONResponse> => {
    const enabled = await helpdeskEnabled(event.user);

    if (!enabled) {
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
    console.log(`Helpdesk session stopped by user ${event.user?.id} at ${new Date().toISOString()}`);

    return response.json(200, { token: null });
};
