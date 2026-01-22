import { NodeViewWrapper } from '@tiptap/react';
import { Node } from '@tiptap/pm/model';
import * as Components from '@/components';

import React from 'react';
import { fetchEmbedData, OEmbed } from './utils';

const NodeView = (props: Readonly<{ node: Node }>) => {
    const { node } = props;
    const [oEmbed, setOEmbed] = React.useState<OEmbed | null>(null);

    React.useEffect(() => {
        fetchEmbedData(node.attrs.src).then(setOEmbed);
    }, [node.attrs.src]);

    return (
        <NodeViewWrapper>
            {oEmbed ? (
                <figure className="relative w-fit">
                    <img
                        src={oEmbed.thumbnail_url_with_play_button}
                        width={props.node.attrs.width || 640}
                        height={props.node.attrs.height || 360}
                        style={{ display: 'block' }}
                        alt={`Vimeo video: ${oEmbed.title || 'Video Thumbnail'}`}
                        className="rounded-lg"
                        role="img"
                        aria-label={`Vimeo video thumbnail: ${oEmbed.title || 'Video'}`}
                    />
                    <Components.Alert
                        severity="INFO"
                        title="Use the preview option to play this video"
                        className="not-prose w-fit absolute top-2 left-2"
                    />
                    {oEmbed.title && <figcaption className="sr-only">{oEmbed.title}</figcaption>}
                </figure>
            ) : null}
        </NodeViewWrapper>
    );
};

export default NodeView;
