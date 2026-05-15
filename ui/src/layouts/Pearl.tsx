import React from 'react';

import * as Components from '@/components';
import * as Types from '@/types';

type PearlLinksData = {
    pearl: {
        id: string;
        createdAt: string;
        creators: Array<{ name: string }>;
    };
    subPearls: Array<{
        id: string;
        title: string;
        type: Types.PublicationType;
    }>;
};

type Props = {
    fixedHeader?: boolean;
    children: React.ReactNode;
    pearlId?: string;
    pearlLinks?: PearlLinksData;
};

const Pearl: React.FC<Props> = (props): React.ReactElement => (
    <>
        <Components.JumpToContent />
        <Components.Header fixed={props.fixedHeader} />
        {props.pearlId && <Components.PearlVisualization pearlId={props.pearlId} linksData={props.pearlLinks} />}
        <main className="container mx-auto px-8 pb-6 lg:grid lg:grid-cols-12 lg:gap-8 lg:pb-16 lg:pt-8 2xl:gap-16">
            {props.children}
        </main>
        <Components.Footer waves={true} />
    </>
);

export default Pearl;
