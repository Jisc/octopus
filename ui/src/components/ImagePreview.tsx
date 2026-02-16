import React from 'react';
import * as OutlineIcons from '@heroicons/react/24/outline';

type Props = {
    id: string;
    source?: string;
    showClose: boolean;
    close: () => void;
};

const ImagePreview: React.FC<Props> = (props): React.ReactElement | null => {
    if (!props.source) {
        return null;
    }

    const validSource =
        props.source.startsWith('data:image') || props.source.startsWith('http') || props.source.startsWith('blob:');

    if (!validSource) {
        return (
            <div className="relative flex h-full w-full items-center justify-center rounded-xl border border-red-400 bg-red-50 p-4">
                <OutlineIcons.ExclamationTriangleIcon className="h-6 w-6 text-red-400" />
                <p className="ml-2 text-sm text-red-400">Invalid image source</p>
            </div>
        );
    }

    return (
        <div key={props.id} className="relative flex h-full w-full">
            {props.showClose && (
                <button
                    onClick={() => props.close()}
                    className="absolute top-2 right-2 rounded-full focus:outline-yellow-400"
                >
                    <OutlineIcons.XCircleIcon className="h-6 w-6 rounded-full text-red-400 bg-grey-800" />
                </button>
            )}

            <img src={props.source} alt="preview" className="w-full object-cover rounded-xl border border-grey-100" />
        </div>
    );
};

export default ImagePreview;
