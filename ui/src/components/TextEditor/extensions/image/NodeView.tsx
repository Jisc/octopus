import ExtImage from '@tiptap/extension-image';
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import { Node } from '@tiptap/pm/model';
import * as HeadlessUi from '@headlessui/react';
import React from 'react';
import * as Components from '@/components';

type Props = {
    node: Node;
    selected: boolean;
    updateAttributes: (attrs: Record<string, any>) => void;
};

const NodeView = (props: Readonly<Props>) => {
    const { src, alt } = props.node.attrs;
    const [tempAlt, setTempAlt] = React.useState<string | null>(alt);
    const [altTextModalVisible, setAltTextModalVisible] = React.useState(false);

    let className = 'image';
    if (props.selected) {
        className += ' ProseMirror-selectednode';
    }

    React.useEffect(() => {
        setTempAlt(alt);
    }, [alt]);

    return (
        <NodeViewWrapper className={className} data-drag-handle>
            <figure className="relative w-fit group">
                <img
                    src={src}
                    alt={alt || ''}
                    width={props.node.attrs.width}
                    height={props.node.attrs.height}
                    className="block rounded-lg"
                />

                <div className="rounded-md px-4 py-2 text-sm transition duration-200 ease-out print:hidden bg-teal-700 dark:bg-teal-700 not-prose w-fit absolute bottom-2 left-2 text-white-100 dark:text-white-50 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0">
                    {alt ? (
                        <>
                            Alt text: <span className="font-semibold">{alt}.</span>
                        </>
                    ) : (
                        <>Decorative image</>
                    )}
                    <Components.Button
                        title="Edit"
                        className="ml-2 rounded outline-0 focus:ring-2 focus:ring-yellow-400"
                        onClick={() => setAltTextModalVisible(true)}
                    />
                </div>
            </figure>

            <HeadlessUi.Dialog
                open={altTextModalVisible}
                onClose={() => {
                    setAltTextModalVisible(false);
                }}
                className="fixed inset-0 z-10 grid place-items-center overflow-y-auto py-20"
            >
                <HeadlessUi.DialogBackdrop className="fixed inset-0 bg-black opacity-30" />

                <div className="relative w-11/12 rounded bg-white-50 p-4 shadow-sm md:w-9/12 lg:w-160 xl:w-192">
                    <HeadlessUi.DialogTitle className="sr-only">Edit image alt text</HeadlessUi.DialogTitle>
                    <HeadlessUi.Description>
                        <Components.ImageAltText altText={tempAlt} onChange={setTempAlt} />
                        <div className="mt-6 flex justify-between space-x-4">
                            <Components.ModalButton
                                text="Save"
                                title="Save image"
                                actionType="POSITIVE"
                                disabled={tempAlt === null}
                                onClick={() => {
                                    props.updateAttributes({ alt: tempAlt });
                                    setAltTextModalVisible(false);
                                }}
                            />
                            <Components.ModalButton
                                text="Cancel"
                                title="Cancel"
                                actionType="NEGATIVE"
                                onClick={() => setAltTextModalVisible(false)}
                            />
                        </div>
                    </HeadlessUi.Description>
                </div>
            </HeadlessUi.Dialog>
        </NodeViewWrapper>
    );
};

export default ExtImage.extend({
    addNodeView() {
        return ReactNodeViewRenderer(NodeView);
    }
});
