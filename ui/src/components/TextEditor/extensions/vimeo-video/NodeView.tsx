import { NodeViewWrapper } from '@tiptap/react';
import { Node } from '@tiptap/pm/model';
import * as Components from '@/components';

import React from 'react';
import { fetchEmbedData, OEmbed } from './utils';
import Image from 'next/image';
import VideoTranscriptModal from './VideoTranscriptModal';

type Props = {
    node: Node;
    selected: boolean;
    updateAttributes: (attrs: Record<string, any>) => void;
};

const NodeView = (props: Readonly<Props>) => {
    const { node } = props;
    const [oEmbed, setOEmbed] = React.useState<OEmbed | null>(null);
    const [editModalVisible, setEditModalVisible] = React.useState(false);

    let className = 'video';
    if (props.selected) {
        className += ' ProseMirror-selectednode';
    }

    React.useEffect(() => {
        fetchEmbedData(node.attrs.src).then(setOEmbed);
    }, [node.attrs.src]);

    return (
        <NodeViewWrapper className={className} data-drag-handle>
            {oEmbed ? (
                <figure className="relative w-fit group">
                    <Image
                        src={oEmbed.thumbnail_url_with_play_button}
                        width={props.node.attrs.width || 640}
                        height={props.node.attrs.height || 360}
                        className="block rounded-lg"
                        alt={`Vimeo video: ${oEmbed.title || 'Video Thumbnail'}`}
                        aria-label={`Vimeo video thumbnail: ${oEmbed.title || 'Video'}`}
                    />
                    <Components.Alert
                        severity="INFO"
                        title="Preview this publication to play this video"
                        className="not-prose w-fit absolute top-2 left-2"
                    />
                    <div className="rounded-md px-4 py-2 text-sm transition duration-200 ease-out print:hidden bg-teal-700 dark:bg-teal-700 not-prose w-fit absolute bottom-2 left-2 text-white-100 dark:text-white-50 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0">
                        <Components.Button
                            title={node.attrs.transcript ? 'Edit video transcript' : 'Add video transcript'}
                            className="ml-2 rounded outline-0 focus:ring-2 focus:ring-yellow-400"
                            onClick={() => setEditModalVisible(true)}
                        />
                    </div>
                    {oEmbed.title && <figcaption className="sr-only">{oEmbed.title}</figcaption>}
                </figure>
            ) : null}

            <VideoTranscriptModal
                visible={editModalVisible}
                setVisible={setEditModalVisible}
                initialTranscript={node.attrs.transcript || ''}
                onSave={(transcript) => {
                    props.updateAttributes({ transcript });
                }}
            />
        </NodeViewWrapper>
    );
};

export default NodeView;
