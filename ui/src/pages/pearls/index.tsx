import React, { useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import useSWR from 'swr';

import * as OutlineIcons from '@heroicons/react/24/outline';
import * as api from '@/api';
import * as Components from '@/components';
import * as Config from '@/config';
import * as Layouts from '@/layouts';
import * as Types from '@/types';

import * as Helpers from '@/helpers';

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100, 200] as const;

const getPaginationItems = (currentPage: number, totalPages: number): Array<number | 'ellipsis'> => {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const items: Array<number | 'ellipsis'> = [1];

    if (currentPage > 3) {
        items.push('ellipsis');
    }

    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    for (let page = startPage; page <= endPage; page += 1) {
        items.push(page);
    }

    if (currentPage < totalPages - 2) {
        items.push('ellipsis');
    }

    items.push(totalPages);

    return items;
};

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
        type: Types.PublicationType;
    }>;
    createdAt: string;
    updatedAt: string;
};

type Props = {
    fallback: {
        data: Pearl[];
        metadata: {
            total: number;
            limit: number;
            offset: number;
        };
    };
};

type PearlsResponse = {
    data?: Pearl[];
    pearls?: Pearl[];
    metadata: {
        total: number;
        limit: number;
        offset: number;
    };
};

export const getServerSideProps: Types.GetServerSideProps<Props> = async (context) => {
    const extractedLimit = Number(Helpers.extractNextQueryParam(context.query.limit, true) || '10');
    const extractedOffset = Number(Helpers.extractNextQueryParam(context.query.offset, true) || '0');
    const limit = PAGE_SIZE_OPTIONS.includes(extractedLimit as (typeof PAGE_SIZE_OPTIONS)[number])
        ? extractedLimit
        : 10;
    const offset = Number.isInteger(extractedOffset) && extractedOffset >= 0 ? extractedOffset : 0;

    let fallback: Props['fallback'] = {
        data: [],
        metadata: {
            total: 0,
            limit,
            offset
        }
    };

    try {
        const token = Helpers.getJWT(context);
        const response = await api.get(`${Config.endpoints.pearls}?limit=${limit}&offset=${offset}`, token);
        const pearls = response.data.pearls || [];
        const metadata = response.data.metadata || fallback.metadata;

        fallback = {
            data: pearls,
            metadata: {
                total: metadata.total || pearls.length,
                limit: metadata.limit || limit,
                offset: metadata.offset || offset
            }
        };

        return {
            props: {
                fallback
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
    const { fallback } = props;
    const topRef = useRef<HTMLDivElement | null>(null);
    const [offset, setOffset] = useState(fallback.metadata.offset ? fallback.metadata.offset : 0);
    const [limit, setLimit] = useState(fallback.metadata.limit || 10);
    const [expandedPearlId, setExpandedPearlId] = useState<string | null>(null);
    const [expandedTopicsPearlIds, setExpandedTopicsPearlIds] = useState<Set<string>>(new Set());

    const swrKey = `${Config.endpoints.pearls}?limit=${limit}&offset=${offset}`;

    const { data: response, isValidating } = useSWR<PearlsResponse>(swrKey, null, {
        fallback: { [swrKey]: fallback },
        use: [Helpers.laggy]
    });

    const pearls = response?.data || response?.pearls || [];
    const total = response?.metadata.total || 0;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const currentPage = Math.floor(offset / limit) + 1;
    const paginationItems = getPaginationItems(currentPage, totalPages);

    const scrollToTop = () => {
        if (topRef.current) {
            topRef.current.scrollIntoView({ behavior: 'smooth' });
            return;
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePageChange = (page: number) => {
        setOffset((page - 1) * limit);
        setExpandedPearlId(null);
        setExpandedTopicsPearlIds(new Set());
        scrollToTop();
    };

    const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const nextLimit = Number(event.target.value);

        setLimit(nextLimit);
        setOffset(0);
        setExpandedPearlId(null);
        setExpandedTopicsPearlIds(new Set());
        scrollToTop();
    };

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
                    <div ref={topRef} />
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <Components.PageTitle text="Pearls" />
                        <div className="flex items-center gap-3 self-start md:self-auto">
                            <label
                                htmlFor="pearls-page-size"
                                className="text-sm font-medium text-grey-700 dark:text-grey-200"
                            >
                                Per page
                            </label>
                            <select
                                id="pearls-page-size"
                                value={limit}
                                onChange={handlePageSizeChange}
                                className="rounded-md border border-grey-300 bg-white px-3 py-2 text-sm font-medium text-grey-800 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-grey-600 dark:bg-grey-800 dark:text-white-50"
                            >
                                {PAGE_SIZE_OPTIONS.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </section>

                <section className="container mx-auto px-8 pb-16">
                    <p className="mb-4 text-sm font-medium text-grey-700 dark:text-grey-200">Total pearls: {total}</p>

                    {pearls.length === 0 && !isValidating && (
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
                                                            <span className="font-semibold">
                                                                {Helpers.formatPublicationType(subPearl.type)}
                                                            </span>{' '}
                                                            • DOI: {subPearl.doi}
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

                    {total > 0 && (
                        <div className="mt-10 flex flex-col items-center gap-4">
                            <nav
                                aria-label="Pearls pagination"
                                className="flex flex-wrap items-center justify-center gap-2"
                            >
                                <button
                                    type="button"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage <= 1}
                                    className="rounded-md border border-grey-300 px-3 py-2 text-sm font-medium text-grey-700 transition-colors hover:bg-grey-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-grey-600 dark:text-grey-200 dark:hover:bg-grey-700"
                                >
                                    Previous
                                </button>

                                {paginationItems.map((item, index) => {
                                    if (item === 'ellipsis') {
                                        return (
                                            <span
                                                key={`ellipsis-${index}`}
                                                className="px-2 text-grey-500 dark:text-grey-400"
                                            >
                                                ...
                                            </span>
                                        );
                                    }

                                    const isActive = item === currentPage;

                                    return (
                                        <button
                                            key={item}
                                            type="button"
                                            onClick={() => handlePageChange(item)}
                                            aria-current={isActive ? 'page' : undefined}
                                            className={`min-w-10 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                                isActive
                                                    ? 'bg-teal-600 text-white-50 dark:bg-teal-500'
                                                    : 'border border-grey-300 text-grey-700 hover:bg-grey-100 dark:border-grey-600 dark:text-grey-200 dark:hover:bg-grey-700'
                                            }`}
                                        >
                                            {item}
                                        </button>
                                    );
                                })}

                                <button
                                    type="button"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage >= totalPages}
                                    className="rounded-md border border-grey-300 px-3 py-2 text-sm font-medium text-grey-700 transition-colors hover:bg-grey-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-grey-600 dark:text-grey-200 dark:hover:bg-grey-700"
                                >
                                    Next
                                </button>
                            </nav>
                            <p className="text-sm text-grey-600 dark:text-grey-300">
                                Page {currentPage} of {totalPages}
                            </p>
                        </div>
                    )}
                </section>
            </Layouts.Standard>
        </>
    );
};

export default Pearls;
