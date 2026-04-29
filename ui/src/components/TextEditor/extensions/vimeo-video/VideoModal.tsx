import React from 'react';
import * as tiptap from '@tiptap/react';
import * as HeadlessUi from '@headlessui/react';
import * as Components from '@/components';
import * as Stores from '@/stores';
import { fetchEmbedData, isValidVimeoUrl, OEmbed } from './utils';
import Image from 'next/image';
import * as SolidIcons from '@heroicons/react/24/solid';

const VideoModal = (props: {
    visible: boolean;
    setVisible: (visible: boolean) => void;
    editor: tiptap.Editor;
    publicationVersionId?: string;
}) => {
    const { visible, setVisible, editor, publicationVersionId } = props;

    const user = Stores.useAuthStore((state) => state.user);

    const [loading, setLoading] = React.useState(false);
    const [videoURL, setVideoURL] = React.useState('');
    const [videoFetchError, setVideoFetchError] = React.useState('');
    const [videoOEmbed, setVideoOEmbed] = React.useState<OEmbed | null>(null);
    const [transcript, setTranscript] = React.useState('');
    const [confirmationModalVisible, setConfirmationModalVisible] = React.useState(false);

    const TRANSCRIPT_CHAR_LIMIT = 10000;
    const transcriptCharCount = transcript.length;

    let videoURLError = '';

    if (videoURL) {
        const validVimeoUrl = Boolean(isValidVimeoUrl(videoURL));
        if (!validVimeoUrl) {
            videoURLError = 'Please enter a valid, public Vimeo URL.';
        } else {
            videoURLError = '';
        }
    }

    React.useEffect(() => {
        if (!videoURL || videoURLError) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
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
    }, [videoURL, videoURLError]);

    React.useEffect(() => {
        if (visible) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setVideoURL('');
            setTranscript('');
        }
    }, [visible]);

    function clear() {
        setVideoURL('');
        setVideoFetchError('');
        setVideoOEmbed(null);
        setTranscript('');
    }

    function close() {
        clear();
        setVisible(false);
    }

    async function insert() {
        if (!videoOEmbed?.video_id) {
            setVideoFetchError('Invalid Vimeo video. Please check the URL and try again.');
            return;
        }

        try {
            editor?.chain().focus().setVimeoVideo({ src: videoURL, transcript }).run();
            close();
        } catch (err) {
            console.error('Failed to insert video:', err);
            setVideoFetchError('Failed to insert video. Please try again.');
        }
    }

    const error = videoURLError || videoFetchError;

    return (
        <HeadlessUi.Dialog
            open={visible}
            onClose={close}
            className="fixed inset-0 z-10 grid place-items-center overflow-y-auto py-20"
        >
            <HeadlessUi.DialogBackdrop className="fixed inset-0 bg-black opacity-30" />

            <div className="relative w-11/12 rounded bg-white-50 p-4 shadow-sm md:w-9/12 lg:w-160">
                <HeadlessUi.DialogTitle className="sr-only">Insert Vimeo video</HeadlessUi.DialogTitle>
                <HeadlessUi.Description>
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
                            <Components.Button disabled={loading || !videoURL} onClick={clear} title="Clear" />
                        </div>

                        {error && (
                            <p className="mt-2 text-sm text-red-600" id="vimeo-url-error">
                                {error}
                            </p>
                        )}
                    </div>

                    {videoOEmbed ? (
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4">
                            <div className="gap-4 flex md:flex-col">
                                <Image
                                    src={videoOEmbed.thumbnail_url}
                                    alt="Vimeo video thumbnail"
                                    className="rounded border border-grey-100 shadow-sm h-auto"
                                    width={200}
                                    height={112}
                                />
                                <div>
                                    <p className="font-medium text-grey-800 mb-1 line-clamp-2">{videoOEmbed.title}</p>
                                    <p className="text-sm text-grey-700">by {videoOEmbed.author_name}</p>
                                    <p className="text-sm text-grey-700">
                                        Uploaded on {new Date(videoOEmbed.upload_date).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <div className="space-y-2">
                                    <label htmlFor="transcript" className="block text-sm font-medium text-grey-700">
                                        Add transcript (optional)
                                    </label>
                                    <Components.Link
                                        href="https://www.w3.org/WAI/media/av/"
                                        openNew
                                        className="text-xs flex items-center space-x-1 underline w-fit"
                                    >
                                        <SolidIcons.InformationCircleIcon className="size-4 text-teal-500" />
                                        <span>Learn more about making audiovisual media accessible</span>
                                    </Components.Link>
                                </div>
                                <textarea
                                    id="transcript"
                                    value={transcript}
                                    onChange={(e) => {
                                        const newValue = e.target.value.slice(0, TRANSCRIPT_CHAR_LIMIT);
                                        setTranscript(newValue);
                                    }}
                                    placeholder="Enter a transcript of the video content. Include timestamps for better accessibility."
                                    rows={6}
                                    maxLength={TRANSCRIPT_CHAR_LIMIT}
                                    className="mt-4 w-full rounded-md border border-grey-100 bg-white-50 text-grey-800 outline-0 focus:ring-2 focus:ring-yellow-400 resize-y"
                                    aria-describedby="transcript-hint"
                                />
                                <div className="flex justify-end">
                                    <p className="text-xs" aria-live="polite" aria-label="Character count">
                                        {transcriptCharCount.toLocaleString()} /{' '}
                                        {TRANSCRIPT_CHAR_LIMIT.toLocaleString()}
                                    </p>
                                </div>
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
                        <Components.ModalButton onClick={close} text="Cancel" title="Cancel" actionType="NEGATIVE" />
                    </div>
                </HeadlessUi.Description>
            </div>
        </HeadlessUi.Dialog>
    );
};

export default VideoModal;
