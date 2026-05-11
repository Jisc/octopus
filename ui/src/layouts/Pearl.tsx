import React from 'react';

import * as Components from '@/components';

type Props = {
    fixedHeader?: boolean;
    children: React.ReactNode;
    pearlId?: string;
};

const Pearl: React.FC<Props> = (props): React.ReactElement => (
    <>
        <Components.JumpToContent />
        <Components.Header fixed={props.fixedHeader} />
        {props.pearlId && <Components.PearlVisualization pearlId={props.pearlId} />}
        <main className="container mx-auto px-8 pb-6 lg:grid lg:grid-cols-12 lg:gap-8 lg:pb-16 lg:pt-8 2xl:gap-16">
            {props.children}
        </main>
        <Components.Footer waves={true} />
    </>
);

export default Pearl;
