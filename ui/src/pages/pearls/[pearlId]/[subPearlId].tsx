import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import parse from 'html-react-parser';

import * as OutlineIcons from '@heroicons/react/24/outline';
import * as Components from '@/components';
import * as Config from '@/config';
import * as Helpers from '@/helpers';
import * as Layouts from '@/layouts';
import * as Types from '@/types';
import * as api from '@/api';

type SubPearl = {
    id: string;
    title: string;
    doi: string;
    content: string;
    type: Types.PublicationType;
};

type Pearl = {
    id: string;
    title: string;
    creators: Array<{ name: string }>;
    source?: { name: string };
};

type Props = {
    pearl: Pearl;
    subPearl: SubPearl;
};

export const getServerSideProps: Types.GetServerSideProps<Props> = async (context) => {
    const { pearlId, subPearlId } = context.query;

    try {
        const token = Helpers.getJWT(context);
        const response = await api.get(`${Config.endpoints.pearls}/${pearlId}/sub-pearls/${subPearlId}`, token);
        const { pearl, subPearl } = response.data;

        if (!pearl || !subPearl) {
            return {
                notFound: true
            };
        }

        return {
            props: {
                pearl: {
                    id: pearl.id,
                    title: pearl.title,
                    creators: pearl.creators,
                    source: pearl.source
                },
                subPearl: {
                    id: subPearl.id,
                    title: subPearl.title,
                    doi: subPearl.doi,
                    content: subPearl.content,
                    type: subPearl.type
                }
            }
        };
    } catch (error) {
        console.error('Error fetching pearl data:', error);
        return {
            notFound: true
        };
    }
};

const SubPearlPage: Types.NextPage<Props> = (props): React.ReactElement => {
    const router = useRouter();
    const { pearl, subPearl } = props;

    const pageTitle = `${subPearl.title} - Pearls - ${Config.urls.base.title}`;

    return (
        <>
            <Head>
                <title>{pageTitle}</title>
                <meta name="description" content={`Read ${subPearl.title} on Octopus`} />
                <meta name="og:title" content={Helpers.truncateString(pageTitle, 70)} />
                <meta name="og:description" content={`Read ${subPearl.title} on Octopus`} />
                <link rel="canonical" href={`${Config.urls.viewPearl.canonical}/${props.pearl.id}/${subPearl.id}`} />
            </Head>

            <Layouts.Standard fixedHeader={false}>
                <section className="container mx-auto grid grid-cols-1 px-8 py-4 lg:grid-cols-8 lg:gap-16 lg:pt-16">
                    {/* Back Button */}
                    <div className="col-span-full mb-4">
                        <Components.Button
                            href="/pearls"
                            title="Back to Pearls"
                            startIcon={<OutlineIcons.ArrowLeftIcon className="h-4 w-4 text-white-50" />}
                            variant="underlined"
                        />
                    </div>

                    {/* Main Content */}
                    <article className="col-span-full space-y-8 lg:col-span-6">
                        <header className="border-b border-grey-200 pb-6 dark:border-grey-700">
                            <div className="mb-4 inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-700 bg-teal-700 dark:bg-teal-700 dark:text-white-50">
                                {Helpers.formatPublicationType(subPearl.type)}
                            </div>

                            <h1 className="mb-4 font-montserrat text-3xl font-bold leading-tight text-grey-800 transition-colors duration-500 dark:text-white-50 lg:text-4xl">
                                {subPearl.title}
                            </h1>

                            <div className="space-y-2 text-sm text-grey-600 dark:text-grey-400">
                                <p>
                                    <span className="font-semibold">Parent Pearl:</span> {pearl.title}
                                </p>
                                {pearl.creators.length > 0 && (
                                    <p>
                                        <span className="font-semibold">Creators:</span>{' '}
                                        {pearl.creators.map((c) => c.name).join(', ')}
                                    </p>
                                )}
                                {pearl.source && (
                                    <p>
                                        <span className="font-semibold">Source:</span> {pearl.source.name}
                                    </p>
                                )}
                                <p>
                                    <span className="font-semibold">DOI: </span>
                                    <Components.Link
                                        href={`http://doi.org/${subPearl.doi}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="underline"
                                    >
                                        {subPearl.doi}
                                    </Components.Link>
                                </p>
                            </div>
                        </header>

                        {/* Sub-Pearl Content */}
                        <section id="main-text" className="prose dark:prose-invert max-w-none">
                            <div className="text-grey-800 dark:text-grey-100">
                                {typeof subPearl.content === 'string' ? (
                                    subPearl.content.startsWith('<') ? (
                                        parse(subPearl.content)
                                    ) : (
                                        <p>{subPearl.content}</p>
                                    )
                                ) : (
                                    <p>{subPearl.content}</p>
                                )}
                            </div>
                        </section>
                    </article>

                    {/* Sidebar */}
                    <aside className="col-span-full lg:col-span-2">
                        <div className="sticky top-20 space-y-4">
                            <div className="rounded bg-white-50 px-6 py-6 shadow transition-colors duration-500 dark:bg-grey-900">
                                <div className="space-y-3 text-sm text-grey-600 dark:text-grey-400">
                                    <div>
                                        <p className="font-semibold text-grey-800 dark:text-white-50">Type</p>
                                        <p className="mt-1">{Helpers.formatPublicationType(subPearl.type)}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-grey-800 dark:text-white-50">DOI</p>
                                        <Components.Link
                                            href={`http://doi.org/${subPearl.doi}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="underline break-all"
                                        >
                                            {subPearl.doi}
                                        </Components.Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>
                </section>
            </Layouts.Standard>
        </>
    );
};

export default SubPearlPage;
