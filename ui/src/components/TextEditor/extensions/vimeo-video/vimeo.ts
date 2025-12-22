import { mergeAttributes, Node, nodePasteRule, type Commands } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

import { getEmbedUrlFromVimeoUrl, isValidVimeoUrl, VIMEO_REGEX_GLOBAL } from './utils';
import NodeView from './NodeView';

export interface VimeoOptions {
    addPasteHandler: boolean;
    autoplay: boolean;
    autopause?: boolean | number;
    background?: boolean | number;
    byline?: boolean | number;
    color?: string;
    colors?: string;
    controls: boolean | number;
    dnt?: boolean | number;
    keyboard?: boolean | number;
    loop: boolean | number;
    muted?: boolean | number;
    pip?: boolean | number;
    playsinline?: boolean | number;
    portrait?: boolean | number;
    quality?: string;
    speed?: boolean | number;
    texttrack?: string;
    title?: boolean | number;
    transparent?: boolean | number;
    transcript?: boolean | number;
    HTMLAttributes: Record<string, any>;
    inline: boolean;
    width: number;
    height: number;
}

type SetVimeoVideoOptions = { src: string; width?: number; height?: number };

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        vimeo: {
            setVimeoVideo: (options: SetVimeoVideoOptions) => ReturnType;
        };
    }
}

export const Vimeo = Node.create<VimeoOptions>({
    name: 'vimeo',

    addOptions() {
        return {
            addPasteHandler: true,
            autoplay: false,
            autopause: undefined,
            background: undefined,
            byline: undefined,
            color: undefined,
            colors: undefined,
            controls: true,
            dnt: undefined,
            keyboard: undefined,
            loop: false,
            muted: undefined,
            pip: undefined,
            playsinline: undefined,
            portrait: undefined,
            quality: undefined,
            speed: undefined,
            texttrack: undefined,
            title: undefined,
            transparent: undefined,
            transcript: undefined,
            HTMLAttributes: {},
            inline: false,
            width: 640,
            height: 480
        };
    },

    inline() {
        return this.options.inline;
    },

    group() {
        return this.options.inline ? 'inline' : 'block';
    },

    draggable: true,

    addAttributes() {
        return {
            src: {
                default: null
            },
            width: {
                default: this.options.width
            },
            height: {
                default: this.options.height
            }
        };
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-vimeo-video] iframe'
            }
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(NodeView);
    },

    addCommands() {
        return {
            setVimeoVideo:
                (options: SetVimeoVideoOptions) =>
                ({ commands }: { commands: Commands['insertContent'] }) => {
                    if (!isValidVimeoUrl(options.src)) {
                        return false;
                    }

                    return commands.insertContent({
                        type: this.name,
                        attrs: options
                    });
                }
        };
    },

    addPasteRules() {
        if (!this.options.addPasteHandler) {
            return [];
        }

        return [
            nodePasteRule({
                find: VIMEO_REGEX_GLOBAL,
                type: this.type,
                getAttributes: (match) => {
                    return { src: match.input };
                }
            })
        ];
    },

    renderHTML({ HTMLAttributes }) {
        const embedUrl = getEmbedUrlFromVimeoUrl({
            url: HTMLAttributes.src,
            autoplay: this.options.autoplay,
            autopause: this.options.autopause,
            background: this.options.background,
            byline: this.options.byline,
            color: this.options.color,
            colors: this.options.colors,
            controls: this.options.controls,
            dnt: this.options.dnt,
            keyboard: this.options.keyboard,
            loop: this.options.loop,
            muted: this.options.muted,
            pip: this.options.pip,
            playsinline: this.options.playsinline,
            portrait: this.options.portrait,
            quality: this.options.quality,
            speed: this.options.speed,
            texttrack: this.options.texttrack,
            title: this.options.title,
            transparent: this.options.transparent,
            transcript: this.options.transcript
        });

        HTMLAttributes.src = embedUrl;

        return [
            'div',
            {
                'data-vimeo-video': '',
                style: 'padding:56.25% 0 0 0; position:relative;'
            },
            [
                'iframe',
                mergeAttributes(
                    this.options.HTMLAttributes,
                    {
                        src: embedUrl,
                        frameborder: '0',
                        width: this.options.width,
                        height: this.options.height,
                        allow: 'autoplay; fullscreen; picture-in-picture; clipboard-write',
                        style: 'position:absolute; top:0; left:0; width:100%; height:100%;'
                    },
                    HTMLAttributes
                )
            ]
        ];
    }
});
