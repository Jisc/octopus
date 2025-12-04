import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import * as Config from '@/config';
import * as Types from '@/types';

const useHelpdeskStore = create<Types.HelpdeskStoreType>()(
    devtools(
        persist(
            (set) => ({
                target: null,
                initiator: null,
                startedAt: null,
                startHelpdesk: (initiator: Types.UserType, target: Types.UserType) =>
                    set(() => ({ initiator, target, startedAt: new Date().toISOString() })),
                stopHelpdesk: () => set(() => ({ target: null, initiator: null, startedAt: null }))
            }),
            {
                name: Config.keys.localStorage.helpdesk
            }
        )
    )
);

export default useHelpdeskStore;
