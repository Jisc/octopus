import React, { useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/router';
import { Xwrapper } from 'react-xarrows';
import Xarrow from 'react-xarrows';
import useSWR from 'swr';

import * as Components from '@/components';
import * as Config from '@/config';
import * as Helpers from '@/helpers';
import * as Types from '@/types';

type SubPearlLink = {
    id: string;
    title: string;
    type: Types.PublicationType;
};

type PearlLinksResponse = {
    pearl: {
        id: string;
        createdAt: string;
        creators: Array<{ name: string }>;
    };
    subPearls: SubPearlLink[];
};

const getSubPearlsByType = (subPearls: SubPearlLink[], type: Types.PublicationType): SubPearlLink[] => {
    return subPearls.filter((subPearl) => subPearl.type === type);
};

type SubPearlStages = {
    HYPOTHESIS: SubPearlLink[];
    PROTOCOL: SubPearlLink[];
    ANALYSIS: SubPearlLink[];
    DATA: SubPearlLink[];
};

const getArrows = (subPearlsByType: SubPearlStages) => {
    const arrows: Array<{ startId: string; endId: string }> = [];

    const hypotheses = subPearlsByType.HYPOTHESIS || [];
    const methods = subPearlsByType.PROTOCOL || [];
    const results = subPearlsByType.ANALYSIS || [];
    const sources = subPearlsByType.DATA || [];

    for (const hypothesis of hypotheses) {
        for (const method of methods) {
            arrows.push({ startId: hypothesis.id, endId: method.id });
        }
    }

    for (const method of methods) {
        for (const result of results) {
            arrows.push({ startId: method.id, endId: result.id });
        }

        for (const source of sources) {
            arrows.push({ startId: method.id, endId: source.id });
        }
    }

    return arrows;
};

type VisualizationProps = {
    pearlId: string;
    linksData?: PearlLinksResponse;
};

const Visualization: React.FC<VisualizationProps> = (props): React.ReactElement => {
    const router = useRouter();
    const currentSubPearlId = router.query.subPearlId as string | undefined;
    const shouldFetchLinks = !props.linksData;
    const { data } = useSWR<PearlLinksResponse>(
        shouldFetchLinks ? `${Config.endpoints.pearls}/${props.pearlId}/links` : null,
        null,
        {
            fallback: {
                data: {}
            }
        }
    );
    const linksData = props.linksData || data;

    const visualizationHeaderRef = useRef<HTMLDivElement>(null);
    const visualizationWrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // helper for visualization section allowing the header to be "sticky" while scrolling visualization content on x and y
        const handleHorizontalScroll = () => {
            if (visualizationWrapperRef.current && visualizationHeaderRef.current) {
                // scroll visualization header to be in sync with the content
                if (visualizationWrapperRef.current.scrollLeft !== visualizationHeaderRef.current.scrollLeft) {
                    visualizationHeaderRef.current.scrollLeft = visualizationWrapperRef.current.scrollLeft;
                }
            }
        };

        visualizationWrapperRef.current?.addEventListener('scroll', handleHorizontalScroll);
    }, []);

    // Keep the same visualization column order as publication visualization.
    const filteredPublicationTypes = useMemo(
        () => Config.values.publicationTypes.filter((type) => type !== 'PEER_REVIEW'),
        []
    );

    const subPearlsByType = useMemo((): SubPearlStages => {
        return (linksData?.subPearls || []).reduce<SubPearlStages>(
            (acc, subPearl) => {
                if (subPearl.type === 'HYPOTHESIS') {
                    acc.HYPOTHESIS.push(subPearl);
                }

                if (subPearl.type === 'PROTOCOL') {
                    acc.PROTOCOL.push(subPearl);
                }

                if (subPearl.type === 'ANALYSIS') {
                    acc.ANALYSIS.push(subPearl);
                }

                if (subPearl.type === 'DATA') {
                    acc.DATA.push(subPearl);
                }

                return acc;
            },
            {
                HYPOTHESIS: [],
                PROTOCOL: [],
                ANALYSIS: [],
                DATA: []
            }
        );
    }, [linksData]);

    const arrows = useMemo(() => getArrows(subPearlsByType), [subPearlsByType]);

    return (
        <section className="container mb-8 px-8 pt-8 lg:pt-16">
            <div className="overflow-hidden" ref={visualizationHeaderRef}>
                <div className="grid min-w-[1000px] grid-cols-7 gap-[2%] 3xl:gap-[1.75%]">
                    {filteredPublicationTypes.map((type) => (
                        <div key={type}>
                            <span className="block h-12 p-2 font-montserrat text-xs font-semibold text-grey-800 transition-colors duration-500 dark:text-white-50 xl:h-14 xl:text-sm 2xl:h-auto">
                                {Helpers.formatPublicationType(type)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="sm:scrollbar-vert max-h-[24rem] overflow-y-auto overflow-x-hidden xl:max-h-[30rem]">
                <div
                    className="sm:scrollbar min-h-[16rem] overflow-x-auto overflow-y-hidden"
                    ref={visualizationWrapperRef}
                >
                    <Xwrapper>
                        <div className="grid min-w-[1000px] grid-cols-7 gap-[2%] 3xl:gap-[1.75%]">
                            {linksData &&
                                filteredPublicationTypes.map((type) => (
                                    <div key={type} className="space-y-4 p-1">
                                        {getSubPearlsByType(linksData.subPearls, type as Types.PublicationType).map(
                                            (subPearl) => {
                                                const isSelected = currentSubPearlId === subPearl.id;
                                                return (
                                                    <Components.Link
                                                        key={subPearl.id}
                                                        id={subPearl.id}
                                                        href={`${Config.urls.viewPearl.path}/${linksData.pearl.id}/${subPearl.id}`}
                                                        className={`${
                                                            isSelected
                                                                ? 'border-teal-600 bg-teal-700 tracking-wide text-white-50 dark:bg-teal-800'
                                                                : 'border-transparent bg-teal-100 text-teal-800 hover:border-teal-600 dark:bg-grey-700'
                                                        } relative z-20 block overflow-hidden rounded-md border-2 px-3 py-2 shadow transition-colors duration-500 dark:text-white-100`}
                                                    >
                                                        <div
                                                            className={`mb-2 line-clamp-3 text-xs leading-snug xl:min-h-[50px] 2xl:min-h-[60px] 2xl:text-sm ${
                                                                isSelected ? 'font-semibold' : 'font-medium'
                                                            }`}
                                                            title={subPearl.title}
                                                            role="complementary"
                                                            aria-label={subPearl.title}
                                                        >
                                                            <span>{subPearl.title}</span>
                                                        </div>
                                                        <div className="space-y-2">
                                                            {linksData.pearl.creators.length > 0 && (
                                                                <span
                                                                    className={`${
                                                                        isSelected
                                                                            ? 'font-medium text-teal-100'
                                                                            : 'text-grey-600 dark:font-medium dark:text-teal-50'
                                                                    } block overflow-hidden text-ellipsis whitespace-nowrap text-xxs transition-colors duration-500 2xl:text-xs`}
                                                                >
                                                                    {linksData.pearl.creators
                                                                        .map((c) => c.name)
                                                                        .join(', ')}
                                                                </span>
                                                            )}
                                                            <time
                                                                className={`${
                                                                    isSelected
                                                                        ? 'text-teal-50'
                                                                        : 'text-grey-600 dark:text-grey-200'
                                                                } block text-xxs transition-colors duration-500 2xl:text-xs`}
                                                            >
                                                                {Helpers.formatDate(linksData.pearl.createdAt, 'short')}
                                                            </time>
                                                            <span className="mt-1 ml-auto block w-fit truncate rounded-md bg-white-50 px-1.5 text-xxs font-semibold text-teal-700 transition-colors duration-500 dark:bg-teal-600 dark:text-white-50">
                                                                Part of Pearl #{linksData.pearl.id.slice(0, 6)}
                                                            </span>
                                                        </div>
                                                    </Components.Link>
                                                );
                                            }
                                        )}
                                    </div>
                                ))}
                        </div>

                        {arrows.map((arrow, index) => (
                            <Xarrow
                                key={`subpearl-arrow-${index}`}
                                path="smooth"
                                strokeWidth={2}
                                color={'#296d8a'}
                                showHead
                                start={arrow.startId}
                                end={arrow.endId}
                                zIndex={5}
                                startAnchor={'right'}
                                endAnchor={'left'}
                                animateDrawing={0.2}
                                curveness={0.5}
                            />
                        ))}
                    </Xwrapper>
                </div>
            </div>
        </section>
    );
};

export default Visualization;
