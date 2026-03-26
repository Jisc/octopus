import React, { useCallback } from 'react';

import * as NextRouter from 'next/router';
import * as OutlineIcons from '@heroicons/react/24/outline';
import * as Components from '@/components';
import * as Assets from '@/assets';
import * as Config from '@/config';
import * as Stores from '@/stores';
import * as Interfaces from '@/interfaces';
import * as Helpers from '@/helpers';
import * as HeadlessUI from '@headlessui/react';

import * as Hooks from '@/hooks';

const NavUserAside: React.FC = () => {
    const { user, setUser } = Stores.useAuthStore();
    const router = NextRouter.useRouter();
    const md = Hooks.useMediaQuery('(max-width: 1023px)');

    const handleLogOut = useCallback(
        (event: React.MouseEvent<HTMLAnchorElement>) => {
            event.preventDefault();
            Helpers.clearJWT();
            setUser(null);
            router.push({
                pathname: `${Config.urls.home.path}`
            });
        },
        [router, setUser]
    );

    const items: Interfaces.NavMenuItem[] = user
        ? [
              {
                  label: user.firstName || user.lastName ? `${user?.firstName} ${user?.lastName}` : 'Anonymous User',
                  value: `${Config.urls.viewUser.path}/${user.id}`,
                  dataTestId: 'username-button',
                  subItems: [
                      {
                          label: 'My Account',
                          value: Config.urls.account.path
                      },
                      {
                          label: 'Notifications',
                          value: Config.urls.notifications.path
                      },
                      {
                          label: 'Log out',
                          value: '#log-out',
                          onClick: handleLogOut
                      }
                  ]
              }
          ]
        : [];

    if (!user) {
        return <Components.ORCIDLogInButton currentPath={router.asPath} />;
    }

    if (md) {
        return null;
    }

    return (
        <ul className="flex items-center">
            {items.map((item) => (
                <li key={item.value} className="first:ml-0 last:mr-0 xl:mx-2">
                    {item.subItems?.length ? (
                        <HeadlessUI.Menu as="div" className="relative z-50 inline-block text-left">
                            <HeadlessUI.MenuButton
                                data-testid={item.dataTestId}
                                className="rounded border-transparent p-2 font-medium text-grey-800 outline-0 transition-colors duration-500 focus:ring-2 focus:ring-yellow-400 dark:text-white-50"
                            >
                                <span className="flex items-center">
                                    {item.label}
                                    <OutlineIcons.ChevronDownIcon className="ml-1 xl:ml-2 h-4 w-4 text-grey-500 transition-colors duration-500 dark:text-teal-500" />
                                </span>
                            </HeadlessUI.MenuButton>
                            <HeadlessUI.Transition
                                as="div"
                                enter="transition ease-out duration-100"
                                enterFrom="transform opacity-0 scale-95"
                                enterTo="transform opacity-100 scale-100"
                                leave="transition ease-in duration-75"
                                leaveFrom="transform opacity-100 scale-100"
                                leaveTo="transform opacity-0 scale-95"
                            >
                                <HeadlessUI.MenuItems
                                    as="ul"
                                    className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-grey-200 divide-opacity-40 rounded-md border-2 border-transparent bg-white-50 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:divide-teal-600 dark:border-teal-500 dark:bg-grey-800"
                                >
                                    {item.subItems.map((subItem, index) => (
                                        <li
                                            key={index}
                                            className="p-2 text-teal-600 transition-colors duration-500 dark:text-white-50"
                                        >
                                            <HeadlessUI.MenuItem>
                                                {({ active }) => (
                                                    <Components.NavFlickerLessLink subItem={subItem} active={active} />
                                                )}
                                            </HeadlessUI.MenuItem>
                                        </li>
                                    ))}
                                </HeadlessUI.MenuItems>
                            </HeadlessUI.Transition>
                        </HeadlessUI.Menu>
                    ) : (
                        <Components.Link href={item.value} className="p-2">
                            <span
                                className={`font-medium transition-colors duration-500 ${item.highlighted ? 'text-teal-600 dark:text-teal-300' : 'text-grey-800 dark:text-white-50'}`}
                            >
                                {item.label}
                            </span>
                        </Components.Link>
                    )}
                </li>
            ))}
        </ul>
    );
};

export default NavUserAside;
