import React from 'react';
import * as Hooks from '@/hooks';
import * as Components from '@/components';
import * as SolidIcons from '@heroicons/react/16/solid';

const HelpdeskBanner: React.FC = () => {
    const helpdesk = Hooks.useHelpdesk();

    if (!helpdesk.store.target) {
        return null;
    }

    return (
        <div className="items-center p-2 bg-red-300 dark:bg-red-700 text-black dark:text-grey-100 flex justify-center space-x-4 sticky top-0 z-60">
            <span className="font-montserrat text-sm">
                Helpesk session started for{' '}
                <strong>
                    {helpdesk.store.target.firstName} {helpdesk.store.target.lastName} &lt;
                    {helpdesk.store.target.email || 'no email'}&gt;
                </strong>
                {helpdesk.store.startedAt ? ` at ${new Date(helpdesk.store.startedAt).toLocaleTimeString()}` : ''}
            </span>
            <Components.Button
                className="!bg-red-900"
                onClick={() => helpdesk.stopHelpdeskSession()}
                startIcon={<SolidIcons.StopCircleIcon className="size-4" />}
                title="Stop session"
                variant="block"
                textSize="xs"
            />
        </div>
    );
};

export default HelpdeskBanner;
