import React from 'react';
import * as HeadlessUi from '@headlessui/react';
import * as Components from '@/components';
import * as SolidIcons from '@heroicons/react/24/solid';

const VideoTranscriptModal = (props: {
    visible: boolean;
    setVisible: (visible: boolean) => void;
    initialTranscript: string;
    onSave: (transcript: string) => void;
}) => {
    const { visible, setVisible, initialTranscript, onSave } = props;

    const [transcript, setTranscript] = React.useState(initialTranscript);
    const [confirmationModalVisible, setConfirmationModalVisible] = React.useState(false);

    const TRANSCRIPT_CHAR_LIMIT = 10000;
    const transcriptCharCount = transcript.length;

    React.useEffect(() => {
        if (visible) {
            setTranscript(initialTranscript);
        }
    }, [visible, initialTranscript]);

    function close() {
        setVisible(false);
    }

    function handleCancel() {
        setConfirmationModalVisible(true);
    }

    function discardChanges() {
        setConfirmationModalVisible(false);
        close();
    }

    function resumeEditing() {
        setConfirmationModalVisible(false);
    }

    function save() {
        onSave(transcript);
        close();
    }

    return (
        <HeadlessUi.Dialog
            open={visible}
            onClose={close}
            className="fixed inset-0 z-10 grid place-items-center overflow-y-auto py-20"
        >
            <HeadlessUi.DialogBackdrop className="fixed inset-0 bg-black opacity-30" />

            <div className="relative w-11/12 rounded bg-white-50 p-4 shadow-sm md:w-9/12 lg:w-160">
                <HeadlessUi.DialogTitle className="sr-only">
                    {initialTranscript ? 'Edit video transcript' : 'Add video transcript'}
                </HeadlessUi.DialogTitle>
                <HeadlessUi.Description>
                    <div className="space-y-2">
                        <label htmlFor="transcript" className="block text-sm font-medium text-grey-700">
                            {initialTranscript ? 'Edit video transcript' : 'Add video transcript'}
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
                        autoFocus
                        value={transcript}
                        onChange={(e) => {
                            const newValue = e.target.value.slice(0, TRANSCRIPT_CHAR_LIMIT);
                            setTranscript(newValue);
                        }}
                        placeholder="Enter a transcript of the video content. Include timestamps for better accessibility."
                        rows={10}
                        maxLength={TRANSCRIPT_CHAR_LIMIT}
                        className="mt-4 w-full rounded-md border border-grey-100 bg-white-50 text-grey-800 outline-0 focus:ring-2 focus:ring-yellow-400 resize-y"
                        aria-describedby="transcript-hint"
                    />
                    <div className="flex justify-end">
                        <p className="text-xs" aria-live="polite" aria-label="Character count">
                            {transcriptCharCount.toLocaleString()} / {TRANSCRIPT_CHAR_LIMIT.toLocaleString()}
                        </p>
                    </div>

                    <div className="mt-6 flex space-x-4">
                        <Components.ModalButton onClick={save} text="Save" title="Save" actionType="POSITIVE" />
                        <Components.ModalButton
                            onClick={handleCancel}
                            text="Cancel"
                            title="Cancel"
                            actionType="NEGATIVE"
                        />
                    </div>
                </HeadlessUi.Description>
            </div>

            <Components.Modal
                open={confirmationModalVisible}
                onClose={() => setConfirmationModalVisible(false)}
                positiveCallback={resumeEditing}
                positiveButtonText="Resume editing"
                cancelButtonText="Cancel and discard changes"
                negativeCallback={discardChanges}
                title="Stop editing the transcript?"
                icon={<SolidIcons.ExclamationTriangleIcon className="h-10 w-10 text-red-600" aria-hidden="true" />}
            >
                <p className="text-sm text-grey-700">
                    You are about to stop editing the transcript. All changes will be lost.
                </p>
            </Components.Modal>
        </HeadlessUi.Dialog>
    );
};

export default VideoTranscriptModal;
