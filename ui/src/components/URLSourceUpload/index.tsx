import React from 'react';

import * as Interfaces from '@/interfaces';
import * as Components from '@/components';

type Props = {
    image: Interfaces.TextEditorImage;
    positiveCallback: (url: string, altText: string | null) => void;
    negativeCallback: () => void;
};

const URLSourceUpload: React.FC<Props> = (props): React.ReactElement => {
    const [url, setUrl] = React.useState<string>('');
    const [altText, setAltText] = React.useState<string | null>(props.image.alt ?? null);

    const validUrl = url.startsWith('http');

    return (
        <section key="url-source" className="space-y-8">
            <input
                type="text"
                placeholder="Paste in your url to an image"
                onChange={(e) => setUrl(e.target.value)}
                value={url}
                className="w-full rounded-md border-grey-100 px-4 py-3 text-sm text-grey-700 shadow placeholder:text-center placeholder:text-sm placeholder:text-grey-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />

            {url ? (
                <div className="grid sm:grid-cols-2 gap-4">
                    <Components.ImagePreview id="image-preview" source={url} showClose close={() => setUrl('')} />
                    <Components.ImageAltText
                        altText={altText}
                        onChange={(newAltText: string | null) => setAltText(newAltText)}
                        disabled={!validUrl}
                    />
                </div>
            ) : null}

            {altText === null && validUrl ? (
                <p className="mt-4 text-sm text-red-600" role="alert">
                    Please provide alternative text for your image or mark it as decorative
                </p>
            ) : null}

            <div className="mt-6 flex justify-between space-x-4">
                <Components.ModalButton
                    text="Upload image"
                    title="Upload image"
                    disabled={!url || !validUrl || altText === null}
                    onClick={() => {
                        url && props.positiveCallback(url, altText);
                    }}
                    actionType="POSITIVE"
                />
                <Components.ModalButton
                    text="Cancel"
                    title="Cancel"
                    onClick={() => props.negativeCallback()}
                    actionType="NEGATIVE"
                />
            </div>
        </section>
    );
};

export default URLSourceUpload;
