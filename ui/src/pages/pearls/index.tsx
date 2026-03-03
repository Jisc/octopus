import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

import * as OutlineIcons from '@heroicons/react/24/outline';
import * as api from '@/api';
import * as Components from '@/components';
import * as Config from '@/config';
import * as Layouts from '@/layouts';
import * as Types from '@/types';

import * as Helpers from '@/helpers';

type Pearl = {
    id: string;
    title: string;
    doi?: string;
    externalId?: string;
    creators: Array<{ name: string }>;
    language: string;
    licenceType: string;
    topics: Array<{ id: string; title: string }>;
    source?: { name: string };
    subPearls: Array<{
        id: string;
        title: string;
        doi: string;
        content: string;
        type: string;
    }>;
    createdAt: string;
    updatedAt: string;
};

type Props = {
    pearls: Pearl[];
};

export const getServerSideProps: Types.GetServerSideProps<Props> = async (context) => {
    try {
        const token = Helpers.getJWT(context);
        const response = await api.get(`${Config.endpoints.pearls}`, token);
        const pearls = response.data.pearls || [];

        return {
            props: {
                pearls
            }
        };
    } catch (error) {
        console.error('Error fetching pearls:', error);
        return {
            notFound: true
        };
    }
};

const Pearls: Types.NextPage<Props> = (props): React.ReactElement => {
    const [expandedPearlId, setExpandedPearlId] = useState<string | null>(null);
    const [expandedTopicsPearlIds, setExpandedTopicsPearlIds] = useState<Set<string>>(new Set());
    const { pearls } = props;

    const toggleExpanded = (pearlId: string) => {
        setExpandedPearlId(expandedPearlId === pearlId ? null : pearlId);
    };

    const toggleTopicsExpanded = (e: React.MouseEvent, pearlId: string) => {
        e.stopPropagation();
        setExpandedTopicsPearlIds((prev) => {
            const next = new Set(prev);
            if (next.has(pearlId)) {
                next.delete(pearlId);
            } else {
                next.add(pearlId);
            }
            return next;
        });
    };

    const pageTitle = `${Config.urls.pearls.title}`;

    return (
        <>
            <Head>
                <title>{pageTitle}</title>
                <meta name="description" content={Config.urls.pearls.description} />
                <meta name="og:title" content={pageTitle} />
                <meta name="og:description" content={Config.urls.pearls.description} />
                <meta name="keywords" content={Config.urls.pearls.keywords.join(', ')} />
                <link rel="canonical" href={Config.urls.pearls.canonical} />
            </Head>

            <Layouts.Standard fixedHeader={false}>
                <section className="container mx-auto px-8 py-4 lg:pt-16">
                    <Components.PageTitle text="Pearls" />
                </section>

                <section className="container mx-auto px-8 pb-16">
                    {pearls.length === 0 && (
                        <div className="text-center text-grey-600 dark:text-grey-300">
                            <p>No pearls available.</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        {pearls.map((pearl) => (
                            <div
                                key={pearl.id}
                                className="rounded-lg border border-grey-200 bg-white-50 transition-colors duration-500 dark:border-grey-700 dark:bg-grey-700"
                            >
                                {/* Pearl Header */}
                                <button
                                    onClick={() => toggleExpanded(pearl.id)}
                                    className="w-full px-6 py-4 text-left focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 text-grey-800 dark:text-white-50">
                                            <h3 className="mb-2 font-montserrat text-lg font-semibold  transition-colors duration-500 ">
                                                {pearl.title}
                                            </h3>
                                            <p className="text-sm mb-2">
                                                {pearl.creators.map((c) => c.name).join(', ')}
                                            </p>
                                            {pearl.source && pearl.externalId && (
                                                <p className="text-xs">
                                                    <span className="text-grey-500 dark:text-grey-400">Source: </span>
                                                    <Link
                                                        href={`https://datacatalogue.ukdataservice.ac.uk/studies/study/${pearl.externalId}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 underline"
                                                    >
                                                        {pearl.source.name} #{pearl.externalId}
                                                    </Link>
                                                </p>
                                            )}
                                            {pearl.topics.length > 0 && (
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {(expandedTopicsPearlIds.has(pearl.id)
                                                        ? pearl.topics
                                                        : pearl.topics.slice(0, 5)
                                                    ).map((topic) => (
                                                        <Link
                                                            key={topic.id}
                                                            href={`/topics/${topic.id}`}
                                                            className="inline-block rounded-full px-3 py-1 text-xs font-medium  transition-colors text-teal-700 hover:bg-teal-100 bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-800 dark:text-white-50"
                                                        >
                                                            {topic.title}
                                                        </Link>
                                                    ))}
                                                    {pearl.topics.length > 5 && (
                                                        <div
                                                            onClick={(e) => toggleTopicsExpanded(e, pearl.id)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter' || e.key === ' ') {
                                                                    toggleTopicsExpanded(e as any, pearl.id);
                                                                }
                                                            }}
                                                            role="button"
                                                            tabIndex={0}
                                                            className="inline-block rounded-full bg-grey-100 px-3 py-1 text-xs font-medium text-grey-700 transition-colors hover:bg-grey-200 cursor-pointer dark:bg-grey-600 dark:text-grey-200 dark:hover:bg-grey-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-grey-400"
                                                        >
                                                            {expandedTopicsPearlIds.has(pearl.id)
                                                                ? 'Show less'
                                                                : `+${pearl.topics.length - 5} more`}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-4">
                                            <OutlineIcons.ChevronDownIcon
                                                className={`h-6 w-6 text-grey-600 transition-transform duration-300 dark:text-grey-400 ${
                                                    expandedPearlId === pearl.id ? 'rotate-180' : ''
                                                }`}
                                            />
                                        </div>
                                    </div>
                                </button>

                                {/* Sub-Pearls Section */}
                                {expandedPearlId === pearl.id && pearl.subPearls.length > 0 && (
                                    <div className="border-t border-grey-200 bg-grey-50 dark:border-grey-700 dark:bg-grey-800">
                                        <div className="px-6 py-4">
                                            <h4 className="mb-3 font-montserrat text-sm font-semibold text-grey-700 dark:text-grey-200">
                                                Sub-Pearls ({pearl.subPearls.length})
                                            </h4>
                                            <div className="space-y-2">
                                                {pearl.subPearls.map((subPearl) => (
                                                    <Link
                                                        key={subPearl.id}
                                                        href={`/pearls/${pearl.id}/${subPearl.id}`}
                                                        className="block w-full rounded bg-white px-4 py-3 text-left transition-all duration-200 hover:bg-teal-50 dark:bg-grey-900 dark:hover:bg-grey-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                                    >
                                                        <p className="mb-1 font-medium text-grey-800 dark:text-white-50">
                                                            {subPearl.title}
                                                        </p>
                                                        <p className="text-xs text-grey-500 dark:text-grey-400">
                                                            <span className="font-semibold">{subPearl.type}</span> •
                                                            DOI: {subPearl.doi}
                                                        </p>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {expandedPearlId === pearl.id && pearl.subPearls.length === 0 && (
                                    <div className="border-t border-grey-200 bg-grey-50 px-6 py-4 dark:border-grey-700 dark:bg-grey-800">
                                        <p className="text-sm text-grey-500 dark:text-grey-400">
                                            No sub-pearls available.
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            </Layouts.Standard>
        </>
    );
};

export default Pearls;
