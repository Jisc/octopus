import { NodeViewWrapper } from '@tiptap/react';
import { Node } from '@tiptap/pm/model';

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
                <img
                    src={oEmbed.thumbnail_url_with_play_button}
                    width={props.node.attrs.width || 640}
                    height={props.node.attrs.height || 360}
                    style={{ display: 'block' }}
                    alt="Vimeo Video Thumbnail"
                />
            ) : null}
        </NodeViewWrapper>
    );
};

export default NodeView;
