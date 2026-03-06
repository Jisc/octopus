import * as Stores from '@/stores';
import type * as Types from '@/types';
import * as Config from '@/config';
import * as api from '@/api';
import * as Helpers from '@/helpers';
import React from 'react';

const useHelpdesk = () => {
    const auth = Stores.useAuthStore();
    const store = Stores.useHelpdeskStore();
    const [loading, setLoading] = React.useState(false);

    function reset() {
        store.stopHelpdesk();
        auth.setUser(null);
        Helpers.clearJWT();
    }

    async function startHelpdeskSession(userId: string) {
        if (!auth.user) return;
        setLoading(true);
        const response = await api.post<Types.UserType>(
            `${Config.endpoints.helpdesk}/start-session`,
            { userId },
            auth.user.token
        );
        setLoading(false);
        const targetData = response.data;
        const decodedJWT = Helpers.setAndReturnJWT(targetData.token) as Types.UserType;
        const targetUser = { ...decodedJWT, token: targetData.token };
        auth.setUser(targetUser);
        store.startHelpdesk(auth.user, targetUser);
    }

    async function stopHelpdeskSession() {
        if (!store.initiator || !auth.user) {
            return reset();
        }
        setLoading(true);
        await api.post(`${Config.endpoints.helpdesk}/stop-session`, {}, store.initiator.token);
        setLoading(false);
        const decodedJWT = Helpers.setAndReturnJWT(store.initiator.token) as Types.UserType;
        const initiatorUser = { ...decodedJWT, token: store.initiator.token };
        auth.setUser(initiatorUser);
        store.stopHelpdesk();
    }

    return {
        store,
        loading,
        startHelpdeskSession,
        stopHelpdeskSession
    };
};

export default useHelpdesk;
