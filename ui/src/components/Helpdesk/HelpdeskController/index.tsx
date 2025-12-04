import React from 'react';
import * as Hooks from '@/hooks';
import * as Components from '@/components';
import * as SolidIcons from '@heroicons/react/24/solid';
import * as Assets from '@/assets';

type Props = {
    userId: string;
};

const HelpdeskController: React.FC<Props> = (props) => {
    const helpdesk = Hooks.useHelpdesk(true);

    if (!helpdesk.status.enabled) {
        return null;
    }

    return (
        <div className="mt-8">
            {helpdesk.store.target ? (
                <Components.Button
                    disabled={helpdesk.status.loading}
                    onClick={() => helpdesk.stopHelpdeskSession()}
                    textSize="xs"
                    title="Stop Helpdesk session"
                    variant="block"
                    startIcon={
                        helpdesk.status.loading ? (
                            <Assets.Spinner width={16} height={16} className="stroke-white-50" />
                        ) : (
                            <SolidIcons.StopCircleIcon className="size-4" />
                        )
                    }
                />
            ) : (
                <Components.Button
                    disabled={helpdesk.status.loading}
                    onClick={() => helpdesk.startHelpdeskSession(props.userId)}
                    textSize="xs"
                    title="Start Helpdesk session"
                    variant="block-alt"
                    startIcon={
                        helpdesk.status.loading ? (
                            <Assets.Spinner width={16} height={16} className="stroke-white-50" />
                        ) : (
                            <SolidIcons.PlayCircleIcon className="size-4" />
                        )
                    }
                />
            )}
        </div>
    );
};

export default HelpdeskController;
