import React, { useEffect } from 'react';
import * as Helpers from '@/helpers';

type Props = {
    mainTextRef: React.RefObject<HTMLElement | null>;
};

const VideoTranscriptions: React.FC<Props> = ({ mainTextRef }): null => {
    useEffect(() => {
        const cleanup = Helpers.observeForElement(mainTextRef, '.video-transcription', () =>
            Helpers.addVideoTranscriptDownloadButtons('Download transcript (.txt)', 'transcript')
        );

        return cleanup;
    }, [mainTextRef]);

    return null;
};

export default VideoTranscriptions;
