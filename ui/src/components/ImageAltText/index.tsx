import React, { useId } from 'react';
import * as SolidIcons from '@heroicons/react/24/solid';
import * as Components from '@/components';

type Props = {
    altText: string | null;
    onChange: (altText: string | null) => void;
    disabled?: boolean;
    className?: string;
};

const ImageAltText: React.FC<Props> = (props): React.ReactElement => {
    const checkId = useId();
    const txtId = useId();

    function onTextChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
        const newAltText = e.target.value;
        props.onChange(newAltText || null);
    }

    function onDecorativeChange(e: React.ChangeEvent<HTMLInputElement>) {
        const newIsDecorative = e.target.checked;
        props.onChange(newIsDecorative ? '' : null);
    }

    const isDecorative = props.altText === '';

    return (
        <div className={`space-y-4 ${props.className || ''}`}>
            <div className="space-y-2">
                <span className="text-sm font-semibold text-grey-600">Image alt text</span>
                <Components.Link
                    href="https://webaim.org/techniques/alttext/"
                    openNew
                    className="text-xs flex items-center space-x-1 underline w-fit"
                >
                    <SolidIcons.InformationCircleIcon className="size-4 text-teal-500" />
                    <span>Learn about why this is important</span>
                </Components.Link>
            </div>

            <div className="space-y-2">
                {isDecorative ? null : (
                    <textarea
                        required
                        rows={2}
                        id={txtId}
                        name="altText"
                        maxLength={150}
                        disabled={props.disabled}
                        value={props.altText || ''}
                        onChange={onTextChange}
                        className="w-full rounded-md border border-grey-100 bg-white-50 text-grey-800 outline-0 focus:ring-2 focus:ring-yellow-400 disabled:bg-grey-50 disabled:cursor-not-allowed resize-none"
                    />
                )}
                <div className="flex items-center justify-between">
                    <Components.Checkbox
                        label="Mark as decorative"
                        name="decorative"
                        id={checkId}
                        checked={isDecorative}
                        onChange={onDecorativeChange}
                        disabled={props.disabled}
                        className="disabled:cursor-not-allowed"
                    />
                    {isDecorative ? null : <p className="text-xs">{props.altText ? props.altText.length : 0} / 150</p>}
                </div>
            </div>
        </div>
    );
};

export default ImageAltText;
