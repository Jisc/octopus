import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import * as Config from '@/config';
import * as Types from '@/types';
import * as Interfaces from '@/interfaces';

const useHelpdeskStore = create<Types.HelpdeskStoreType>()(
    devtools(
        persist(
            (set) => ({
                target: null,
                initiator: null,
                startHelpdesk: (initiator: Types.UserType, target: Types.UserType) => set(() => ({ initiator, target })),
                stopHelpdesk: () => set(() => ({ target: null, initiator: null })),
            }),
            {
                name: Config.keys.localStorage.helpdesk,
            }
        )
    )
);

export default useHelpdeskStore;
