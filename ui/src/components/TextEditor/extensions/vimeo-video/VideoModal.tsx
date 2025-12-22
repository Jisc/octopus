import React from 'react';
import * as tiptap from '@tiptap/react';
import * as HeadlessUi from '@headlessui/react';
import * as Components from '@/components';
import * as Outline from '@heroicons/react/24/outline';
import { fetchEmbedData, OEmbed } from './utils';

const VideoModal = (props: { visible: boolean; setVisible: (visible: boolean) => void; editor: tiptap.Editor }) => {
    const { visible, setVisible, editor } = props;

    const [loading, setLoading] = React.useState(false);
    const [videoURL, setVideoURL] = React.useState('');
    const [videoFetchError, setVideoFetchError] = React.useState('');
    const [videoOEmbed, setVideoOEmbed] = React.useState<OEmbed | null>(null);

    let videoURLError = '';

    if (videoURL) {
        const validVimeoUrl = /^(https?:\/\/)?(www\.)?(vimeo\.com\/)([0-9]+)(\/)?(#.*)?$/.test(videoURL);
        if (!validVimeoUrl) {
            videoURLError = 'Please enter a valid Vimeo URL.';
        } else {
            videoURLError = '';
        }
    }

    React.useEffect(() => {
        if (!videoURL || videoURLError) {
            setVideoOEmbed(null);
            return;
        }

        setLoading(true);
        setVideoFetchError('');
        fetchEmbedData(videoURL)
            .then((data) => {
                setVideoOEmbed(data);
            })
            .catch(() => {
                setVideoOEmbed(null);
                setVideoFetchError('Could not fetch video thumbnail. Please check the URL and try again.');
            })
            .finally(() => {
                setLoading(false);
            });
    }, [videoURL]);

    function clear() {
        setVideoURL('');
        setVideoFetchError('');
        setVideoOEmbed(null);
    }

    function close() {
        clear();
        setVisible(false);
    }

    function insert() {
        editor?.chain().focus().setVimeoVideo({ src: videoURL }).run();
        close();
    }

    const error = videoURLError || videoFetchError;

    return (
        <HeadlessUi.Dialog
            open={visible}
            onClose={close}
            className="fixed inset-0 z-10 grid place-items-center overflow-y-auto py-20"
        >
            <HeadlessUi.Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

            <div className="relative w-11/12 rounded bg-white-50 p-4 shadow-sm md:w-9/12 lg:w-160">
                <HeadlessUi.Dialog.Title className="sr-only">Insert Vimeo video</HeadlessUi.Dialog.Title>
                <HeadlessUi.Dialog.Description>
                    <label htmlFor="vimeo-url" className="block text-sm font-medium text-grey-700">
                        Enter Vimeo video URL
                    </label>
                    <div className="mt-2">
                        <div className="flex gap-4">
                            <input
                                disabled={loading}
                                value={videoURL}
                                onChange={(e) => setVideoURL(e.target.value)}
                                type="text"
                                name="vimeo-url"
                                id="vimeo-url"
                                placeholder="https://vimeo.com/123456789"
                                className="block w-full rounded-md border-grey-300 shadow-sm placeholder:font-light focus:border-yellow-500 focus:outline-none focus:ring-yellow-500 sm:text-sm"
                            />
                            <Components.Button
                                disabled={loading || !videoURL}
                                onClick={clear}
                                endIcon={<Outline.XCircleIcon className="h-5 w-5" />}
                                title="Clear"
                            />
                        </div>

                        {error && (
                            <p className="mt-2 text-sm text-red-600" id="vimeo-url-error">
                                {error}
                            </p>
                        )}
                    </div>

                    {videoOEmbed ? (
                        <div className="mt-4 flex items-center space-x-4">
                            <img
                                src={videoOEmbed.thumbnail_url}
                                alt="Vimeo video thumbnail"
                                className="rounded border-grey-300 shadow-sm w-32 h-auto"
                            />
                            <div>
                                <p className="text-sm font-medium text-grey-700">{videoOEmbed.title}</p>
                                <p className="text-sm font-light text-grey-600">by {videoOEmbed.author_name}</p>
                                <p className="text-sm font-light text-grey-600">
                                    Uploaded on {new Date(videoOEmbed.upload_date).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    ) : null}

                    <div className="mt-6 flex space-x-4">
                        <Components.ModalButton
                            onClick={insert}
                            disabled={!videoURL || videoURLError !== ''}
                            text="Confirm"
                            title="Confirm"
                            actionType="POSITIVE"
                        />
                        <Components.ModalButton
                            onClick={close}
                            disabled={false}
                            text="Cancel"
                            title="Cancel"
                            actionType="NEGATIVE"
                        />
                    </div>
                </HeadlessUi.Dialog.Description>
            </div>
        </HeadlessUi.Dialog>
    );
};

export default VideoModal;
