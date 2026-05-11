import React from 'react';
import Head from 'next/head';
import parse from 'html-react-parser';
import Image from 'next/image';

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

type PearlSource = {
    name: string;
    slug?: string;
    identifier?: string;
    language?: Types.Languages;
    licenceType?: Types.LicenceType;
};

type PearlTopic = {
    id: string;
    title: string;
};

type Pearl = {
    id: string;
    title: string;
    externalId?: string | null;
    creators: Array<{ name: string }>;
    topics: PearlTopic[];
    language?: Types.Languages;
    licenceType?: Types.LicenceType;
    createdAt?: string;
    source?: PearlSource | null;
};

type SiblingSubPearl = {
    id: string;
    title: string;
    type: Types.PublicationType;
};

type Props = {
    pearl: Pearl;
    subPearl: SubPearl;
};

type SectionListItem = {
    title: string;
    href: string;
};

const publicationHierarchy: Types.PublicationType[] = [
    'PROBLEM',
    'HYPOTHESIS',
    'PROTOCOL',
    'DATA',
    'ANALYSIS',
    'INTERPRETATION',
    'REAL_WORLD_APPLICATION',
    'PEER_REVIEW'
];

const getOriginalRecordUrl = (pearl: Pearl): string | null => {
    if (pearl.source?.slug === 'UKDS' && pearl.externalId) {
        return `https://datacatalogue.ukdataservice.ac.uk/studies/study/${pearl.externalId}`;
    }

    if (pearl.source?.identifier?.startsWith('http')) {
        return pearl.source.identifier;
    }

    return null;
};

const getSectionList = (content: string): SectionListItem[] => {
    const sectionList: SectionListItem[] = [{ title: 'Main content', href: 'main-text' }];

    if (!content.startsWith('<')) {
        return sectionList;
    }

    const titleMatches = content.matchAll(/<strong\s+id="([^"]+)">([\s\S]*?)<\/strong>/g);

    for (const [, href, rawTitle] of titleMatches) {
        const title = rawTitle
            .replace(/<[^>]+>/g, '')
            .replace(/:$/, '')
            .trim();

        if (!title || sectionList.some((section) => section.href === href)) {
            continue;
        }

        sectionList.push({ title, href });
    }

    return sectionList;
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
                    externalId: pearl.externalId,
                    creators: pearl.creators,
                    topics: pearl.topics || [],
                    language: pearl.language,
                    licenceType: pearl.licenceType,
                    createdAt: pearl.createdAt,
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
    const { pearl, subPearl } = props;

    const pageTitle = `${subPearl.title} - Pearls - ${Config.urls.base.title}`;
    const sourceUrl = getOriginalRecordUrl(pearl);
    const sectionList = getSectionList(subPearl.content);

    const languageCode = pearl.language || pearl.source?.language || 'en';
    const languageName =
        Config.values.octopusInformation.languages.find((language) => language.code === languageCode)?.name ||
        languageCode;
    const licenceType = pearl.licenceType || pearl.source?.licenceType || 'CC_BY';
    const licenceDetails = Config.values.octopusInformation.licences[licenceType];

    const onDownloadJson = () => {
        const payload = {
            pearl: {
                id: pearl.id,
                title: pearl.title,
                creators: pearl.creators,
                topics: pearl.topics,
                source: pearl.source
            },
            subPearl: {
                ...subPearl,
                formattedType: Helpers.formatPublicationType(subPearl.type)
            }
        };

        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `${subPearl.id}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
    };

    const MetadataCard = (
        <div className="w-full space-y-2 rounded bg-white-50 px-6 py-6 shadow transition-colors duration-500 dark:bg-grey-900">
            <div className="flex">
                <span className="mr-2 text-sm font-semibold text-grey-800 transition-colors duration-500 dark:text-grey-100">
                    Sub-pearl type:
                </span>
                <span className="text-sm font-medium text-grey-800 transition-colors duration-500 dark:text-white-50">
                    {Helpers.formatPublicationType(subPearl.type)}
                </span>
            </div>
            <div className="flex">
                <span className="mr-2 text-sm font-semibold text-grey-800 transition-colors duration-500 dark:text-grey-100">
                    Published date:
                </span>
                <span className="text-sm font-medium text-grey-800 transition-colors duration-500 dark:text-white-50">
                    {pearl.createdAt ? Helpers.formatDate(pearl.createdAt) : 'Not available'}
                </span>
            </div>
            <div className="flex">
                <span className="mr-2 text-sm font-semibold text-grey-800 transition-colors duration-500 dark:text-grey-100">
                    Language:
                </span>
                <span className="text-sm font-medium text-grey-800 transition-colors duration-500 dark:text-white-50">
                    {languageName}
                </span>
            </div>
            <div className="flex">
                <span className="mr-2 text-sm font-semibold text-grey-800 transition-colors duration-500 dark:text-grey-100">
                    License:
                </span>
                <Components.Link
                    href={licenceDetails.link}
                    className="flex items-center text-sm font-medium text-teal-600 transition-colors duration-500 hover:underline dark:text-teal-400"
                    openNew
                >
                    <span>{licenceDetails.nicename}</span>
                    <OutlineIcons.ArrowTopRightOnSquareIcon className="ml-1 h-4 w-4" />
                </Components.Link>
            </div>
            <div className="flex">
                <span className="mr-2 text-sm font-semibold text-grey-800 transition-colors duration-500 dark:text-grey-100">
                    Pearl ID:
                </span>
                <span className="text-sm font-medium text-grey-800 transition-colors duration-500 dark:text-white-50">
                    {pearl.id}
                </span>
            </div>
            <div className="flex w-full flex-wrap whitespace-normal">
                <span className="mr-2 whitespace-nowrap text-sm font-semibold text-grey-800 transition-colors duration-500 dark:text-grey-100">
                    DOI:
                </span>
                <Components.Link
                    href={`https://doi.org/${subPearl.doi}`}
                    className="text-sm font-medium text-teal-600 transition-colors duration-500 hover:underline dark:text-teal-400"
                    openNew
                >
                    <span className="break-all">{subPearl.doi}</span>
                </Components.Link>
            </div>

            <Components.SectionBreak name="Actions" />
            <div className="flex">
                <span className="mr-2 text-sm font-semibold text-grey-800 transition-colors duration-500 dark:text-grey-100">
                    Download:
                </span>
                <button
                    aria-label="Download PDF"
                    onClick={() => window.print()}
                    className="mr-4 flex items-center rounded border-transparent text-right text-sm font-medium text-teal-600 outline-0 transition-colors duration-500 hover:underline focus:overflow-hidden focus:ring-2 focus:ring-yellow-400 dark:text-teal-400"
                >
                    <Image src="/images/pdf.svg" alt="PDF Icon" width={18} height={18} />
                    <span className="ml-1">pdf</span>
                </button>
                <button
                    aria-label="Download JSON"
                    onClick={onDownloadJson}
                    className="mr-4 flex items-center rounded border-transparent text-right text-sm font-medium text-teal-600 outline-0 transition-colors duration-500 hover:underline focus:overflow-hidden focus:ring-2 focus:ring-yellow-400 dark:text-teal-400"
                >
                    <Image src="/images/json.svg" alt="JSON Icon" width={18} height={18} />
                    <span className="ml-1">json</span>
                </button>
            </div>

            <Components.PublicationSidebarCardSections sectionList={sectionList} />
        </div>
    );

    return (
        <>
            <Head>
                <title>{pageTitle}</title>
                <meta name="description" content={`Read ${subPearl.title} on Octopus`} />
                <meta name="og:title" content={Helpers.truncateString(pageTitle, 70)} />
                <meta name="og:description" content={`Read ${subPearl.title} on Octopus`} />
                <link rel="canonical" href={`${Config.urls.viewPearl.canonical}/${props.pearl.id}/${subPearl.id}`} />
            </Head>

            <Layouts.Pearl fixedHeader={false} pearlId={pearl.id}>
                <section className="col-span-12 lg:col-span-8 xl:col-span-9">
                    <article>
                        <header className="border-b border-grey-200 pb-8 dark:border-grey-700">
                            <h1 className="mb-4 block font-montserrat text-2xl font-bold leading-tight text-grey-800 transition-colors duration-500 dark:text-white-50 md:text-3xl xl:text-3xl xl:leading-normal">
                                {subPearl.title}
                            </h1>

                            {pearl.creators.length > 0 && (
                                <p className="mb-5 text-sm text-grey-700 transition-colors duration-500 dark:text-grey-200">
                                    {pearl.creators.map((creator) => creator.name).join(', ')}
                                </p>
                            )}

                            <p className="text-sm leading-relaxed text-grey-700 transition-colors duration-500 dark:bg-grey-800 dark:text-grey-200">
                                This record represents the {Helpers.formatPublicationType(subPearl.type)} for a dataset
                                that has been harvested from an external source for use on the Octopus platform. Please
                                visit{' '}
                                {sourceUrl ? (
                                    <Components.Link
                                        href={sourceUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-medium text-teal-600 underline transition-colors duration-500 dark:text-teal-400"
                                    >
                                        {pearl.source?.name || 'the source'}
                                    </Components.Link>
                                ) : (
                                    pearl.source?.name || 'the source'
                                )}{' '}
                                to view this record on the original site.{' '}
                                <Components.Link
                                    href={`${Config.urls.faq.path}#pearls_on_octopus`}
                                    className="font-medium text-teal-600 underline transition-colors duration-500 dark:text-teal-400"
                                >
                                    Click here to learn more about Pearls.
                                </Components.Link>
                            </p>

                            <div className="mt-6 block space-y-8 lg:hidden">{MetadataCard}</div>
                        </header>

                        <Components.ContentSection id="main-text" isMainText>
                            <div className="prose max-w-none text-grey-800 transition-colors duration-500 dark:prose-invert dark:text-grey-100 mt-8">
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
                        </Components.ContentSection>
                    </article>
                </section>
                <aside className="relative hidden lg:col-span-4 lg:block xl:col-span-3">
                    <div className="sticky top-20">{MetadataCard}</div>
                </aside>
            </Layouts.Pearl>
        </>
    );
};

export default SubPearlPage;
