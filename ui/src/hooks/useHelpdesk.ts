import * as Stores from '@/stores';
import type * as Types from '@/types';
import * as Config from '@/config';
import * as api from '@/api';
import * as Helpers from '@/helpers';

const useHelpdesk = () => {
    const auth = Stores.useAuthStore();
    const store = Stores.useHelpdeskStore();

    function reset() {
        store.stopHelpdesk();
        auth.setUser(null);
        Helpers.clearJWT();
    }

    async function startHelpdesk(userId: string) {
        if (!auth.user) return;
        const response = await api.post<Types.UserType>(`${Config.endpoints.helpdesk}/start`, { userId }, "");
        const target = response.data;
        store.startHelpdesk(auth.user, target);
        auth.setUser(target);
        Helpers.setAndReturnJWT(target.token);
    }

    function stopHelpdesk() {
        if (!store.initiator) {
            return reset();
        }
        const response = api.post(`${Config.endpoints.helpdesk}/stop`, {}, "");
        store.stopHelpdesk();
        auth.setUser(store.initiator);
        Helpers.setAndReturnJWT(store.initiator.token);
    }

    return {
        store,
        startHelpdesk,
        stopHelpdesk
    };
}

export default useHelpdesk;