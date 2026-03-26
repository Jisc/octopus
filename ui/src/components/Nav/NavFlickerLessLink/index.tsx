import React from 'react';

import * as Components from '@/components';
import * as Interfaces from '@/interfaces';

type FlickerLessLinkProps = {
    subItem: Interfaces.NavMenuItem;
    active: boolean;
    onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
};

const NavFlickerLessLink = React.forwardRef<HTMLAnchorElement, FlickerLessLinkProps>((props, ref) => {
    const { label, value, onClick } = props.subItem;

    return (
        <Components.Link
            ref={ref}
            href={value}
            onClick={onClick}
            className={`${
                props.active ? 'ring-yellow-400 hover:ring-transparent active:ring-yellow-400 ' : 'ring-transparent'
            } text-white m-0 block w-full rounded-md p-1 ring-2`}
        >
            {label}
        </Components.Link>
    );
});

NavFlickerLessLink.displayName = 'FlickerLessLink';

export default NavFlickerLessLink;
