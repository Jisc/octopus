import * as Stores from '@/stores';
import type * as Types from '@/types';
import * as Config from '@/config';
import * as api from '@/api';
import * as Helpers from '@/helpers';
import React from 'react';

const useHelpdesk = (checkStatus = false) => {
    const auth = Stores.useAuthStore();
    const store = Stores.useHelpdeskStore();
    const [status, setStatus] = React.useState<Types.HelpdeskStatusType>({ enabled: false, loading: false });
    const fetchedRef = React.useRef(false);

    React.useEffect(() => {
        if (!auth.user?.token || fetchedRef.current) return;
        const fetchStatus = async () => {
            if (!auth.user) return;
            try {
                const response = await api.get(`${Config.endpoints.helpdesk}/status`, auth.user.token);
                setStatus({ enabled: response.data.enabled, loading: false });
            } catch (err) {
                setStatus({ enabled: false, loading: false });
            }
        };

        fetchedRef.current = true;
        if (checkStatus) {
            fetchStatus();
        }
    }, [auth.user?.token]);

    function reset() {
        store.stopHelpdesk();
        auth.setUser(null);
        Helpers.clearJWT();
    }

    async function startHelpdeskSession(userId: string) {
        if (!auth.user) return;
        setStatus((prev) => ({ ...prev, loading: true }));
        const response = await api.post<Types.UserType>(
            `${Config.endpoints.helpdesk}/start-session`,
            { userId },
            auth.user.token
        );
        setStatus((prev) => ({ ...prev, loading: false }));
        const targetData = response.data;
        const decodedJWT = Helpers.setAndReturnJWT(targetData.token) as Types.UserType;
        const targetUser = { ...decodedJWT, token: targetData.token };
        auth.setUser(targetUser);
        store.startHelpdesk(auth.user, targetUser);
    }

    function stopHelpdeskSession() {
        if (!store.initiator || !auth.user) {
            return reset();
        }
        setStatus((prev) => ({ ...prev, loading: true }));
        const response = api.post(`${Config.endpoints.helpdesk}/stop-session`, {}, auth.user.token);
        setStatus((prev) => ({ ...prev, loading: false }));
        const decodedJWT = Helpers.setAndReturnJWT(store.initiator.token) as Types.UserType;
        const initiatorUser = { ...decodedJWT, token: store.initiator.token };
        auth.setUser(initiatorUser);
        store.stopHelpdesk();
    }

    return {
        store,
        status,
        startHelpdeskSession,
        stopHelpdeskSession
    };
};

export default useHelpdesk;
