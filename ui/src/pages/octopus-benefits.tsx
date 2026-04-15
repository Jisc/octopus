import React, { Fragment } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import * as Framer from 'framer-motion';
import * as Components from '@/components';
import * as Layouts from '@/layouts';
import * as Config from '@/config';
import * as Assets from '@/assets';
import {
    Disclosure,
    DisclosureButton,
    DisclosurePanel,
    Tab,
    TabGroup,
    TabList,
    TabPanel,
    TabPanels
} from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';

type PageSectionProps = {
    children: React.ReactNode;
};

type AccordionSectionProps = {
    title: React.ReactNode;
    children: React.ReactNode;
};

type AccordionCTAProps = {
    title: React.ReactNode;
    description: React.ReactNode;
    children: React.ReactNode;
};

const PageSection: React.FC<PageSectionProps> = (props): React.ReactElement => {
    return (
        <Framer.motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring' }}
            className="container mx-auto px-8 pt-8 lg:pt-20"
        >
            <div className="mx-auto block lg:w-9/12 xl:w-10/12 2xl:max-w-5xl transition-colors duration-500 text-grey-800 dark:text-white-50 text-center">
                {props.children}
            </div>
        </Framer.motion.div>
    );
};

const AccordionCTA: React.FC<AccordionCTAProps> = (props): React.ReactElement => {
    return (
        <div className="mx-auto max-w-2xl text-center py-10">
            <h3 className="mb-8 block text-center font-montserrat text-xl font-bold transition-colors duration-500 lg:text-2xl">
                {props.title}
            </h3>
            <p className="mb-8 block text-base font-normal !leading-relaxed tracking-tight transition-colors duration-500 lg:text-lg">
                {props.description}
            </p>

            {props.children}
        </div>
    );
};

const ContactCTA: React.FC<{ text: string; ariaLabel?: string }> = (props): React.ReactElement => {
    return (
        <Components.Link
            href="mailto:help@jisc.ac.uk"
            ariaLabel={props.ariaLabel || props.text}
            className="mt-4 shadow-lg inline-flex items-center rounded-md bg-teal-600 px-8 py-3 text-white-50 font-semibold hover:bg-teal-600 transition-colors duration-300"
        >
            {props.text}
        </Components.Link>
    );
};

const AccordionSection: React.FC<AccordionSectionProps> = (props): React.ReactElement => {
    return (
        <Disclosure as="div" className="border-b border-b-2 dark:border-grey-700 border-grey-100">
            {({ open }) => (
                <>
                    <DisclosureButton className="flex justify-between gap-4 w-full group py-4 font-semibold hover:text-teal-400 hover:underline underline-offset-2 lg:text-lg text-left font-montserrat">
                        {props.title}
                        <ChevronDownIcon className="shrink-0 size-4 mt-1 text-grey-400 group-data-[open]:rotate-180 transition-transform group-hover:text-teal-500" />
                    </DisclosureButton>
                    <div className="overflow-hidden">
                        <Framer.AnimatePresence>
                            {open && (
                                <DisclosurePanel static as={Fragment}>
                                    <Framer.motion.div
                                        initial={{ maxHeight: 0 }}
                                        animate={{ maxHeight: 500 }}
                                        exit={{ maxHeight: 0 }}
                                        transition={{ duration: 0.2, ease: 'easeOut' }}
                                        className="overflow-hidden pb-4 text-left leading-relaxed text-grey-700 dark:text-grey-100"
                                    >
                                        {props.children}
                                    </Framer.motion.div>
                                </DisclosurePanel>
                            )}
                        </Framer.AnimatePresence>
                    </div>
                </>
            )}
        </Disclosure>
    );
};

const Benefits: NextPage = (): React.ReactElement => {
    const tabClass =
        'py-1 text-sm xl:text-base dark:data-[selected]:bg-grey-800 data-[selected]:bg-white-50 data-[selected]:font-semibold rounded-full data-[selected]:border dark:border-grey-700 border-grey-300 outline-none font-montserrat';

    return (
        <>
            <Head>
                <title>{Config.urls.octopusBenefits.title}</title>
                <meta name="description" content={Config.urls.octopusBenefits.description} />
                <meta name="keywords" content={Config.urls.octopusBenefits.keywords.join(', ')} />
                <meta name="og:title" content={Config.urls.octopusBenefits.title} />
                <meta name="og:description" content={Config.urls.octopusBenefits.description} />
                <link rel="canonical" href={Config.urls.octopusBenefits.canonical} />
            </Head>

            <Layouts.Standard fixedHeader={false}>
                <PageSection>
                    <h1 className="mb-10 block  text-3xl font-black transition-colors duration-500 lg:text-5xl font-montserrat">
                        What&apos;s in it for me?
                    </h1>
                    <h2 className="mb-8 block text-xl font-bold transition-colors duration-500 lg:text-4xl font-montserrat">
                        Publish research as it{' '}
                        <span className="relative">
                            <span className="relative z-10">really</span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="104"
                                height="9"
                                viewBox="0 0 104 9"
                                fill="none"
                                className="absolute -bottom-1 left-0 w-full z-0 scale-110"
                            >
                                <path
                                    d="M3.99493 0.139316C2.93392 0.0285246 1.91703 0.439215 1.16784 1.2003C0.418664 1.9622 -0.00141457 3.02635 2.87298e-06 4.14438C0.00142032 5.26241 0.424196 6.3255 1.17531 7.0855C1.92641 7.84468 2.94435 8.25279 4.00507 8.13931C4.00507 8.13931 4.00507 8.13931 4.00507 8.13931C5.58991 7.97062 7.17477 7.81027 8.75963 7.65825C23.0222 6.29019 37.2857 5.59711 51.55 5.57903C65.8167 5.56094 80.0842 6.21787 94.3526 7.5498C95.9379 7.69778 97.5231 7.85409 99.1084 8.01874C100.169 8.12951 101.186 7.71882 101.935 6.95774C102.685 6.19584 103.105 5.13169 103.103 4.01367C103.102 2.89565 102.679 1.83257 101.928 1.07257C101.177 0.313391 100.159 -0.0947207 99.0982 0.0187434C99.0982 0.0187434 99.0982 0.0187434 99.0982 0.0187434C97.5134 0.187407 95.9285 0.347738 94.3437 0.499738C80.0787 1.86785 65.8129 2.56094 51.5462 2.57903C37.2819 2.59712 23.0167 1.94021 8.7507 0.608321C7.16545 0.46032 5.5802 0.303985 3.99493 0.139316Z"
                                    className="dark:fill-teal-500 fill-teal-300"
                                />
                            </svg>
                        </span>{' '}
                        happens
                    </h2>

                    <p className="block text-base font-medium leading-relaxed transition-colors duration-500 lg:text-lg text-grey-700 dark:text-grey-100 text-balance font-montserrat">
                        Publish each stage of your work as its own citable output, get recognised earlier, and don’t
                        worry about fitting everything into one paper. Your work becomes easier to find, reuse and build
                        on, and because Octopus is{' '}
                        <span className="font-semibold dark:text-teal-400 text-teal-500">free and open by design</span>,
                        every publication helps to create a fairer, more transparent research system that everyone can
                        trust.
                    </p>
                </PageSection>

                <PageSection>
                    <TabGroup className="space-y-3" id="content">
                        <TabList className="grid md:grid-cols-4 gap-2 bg-grey-50 dark:bg-grey-900 rounded-2xl md:rounded-full p-1 shadow border border-grey-100 dark:border-grey-700">
                            <Tab className={tabClass}>As a researcher</Tab>
                            <Tab className={tabClass}>As an institution</Tab>
                            <Tab className={tabClass}>As a funder of research</Tab>
                            <Tab className={tabClass}>As a publisher</Tab>
                        </TabList>
                        <TabPanels className="px-8 py-6 dark:bg-grey-900 shadow-lg rounded-xl border border-grey-100 dark:border-grey-700">
                            <TabPanel className="space-y-4">
                                <AccordionSection title="You can publish for free, and it’s quick and easy with no barriers: empty your file drawer!">
                                    <p>
                                        There are no gatekeepers and no fees at Octopus. It is designed, and funded, to
                                        make it easy for researchers to share all their work (and get citable DOIs for
                                        it).
                                    </p>
                                    <br />
                                    <p>
                                        Publishing on Octopus doesn’t stop you publishing the same work in a journal as
                                        well - you can use it like a pre-print server, or you can post-print (putting
                                        your work on Octopus after publishing it elsewhere). Even if you don’t want to
                                        do that, though, there is nothing stopping you from publishing all that work
                                        that you’ll never submit to a journal. Get credit for your ideas, your small
                                        datasets, your ‘negative results’ or for peer reviewing others’ work.
                                    </p>
                                    <br />
                                    <p>
                                        Octopus publications can be as short as you want, or as long as you need them to
                                        be. So they can be very quick to get out there.
                                    </p>
                                </AccordionSection>
                                <AccordionSection title="Draw attention to your research.">
                                    <p>
                                        Octopus is a great platform for drawing attention to your work, whether you are
                                        looking for feedback, registering your idea, or just want to disseminate your
                                        research. During 2025 Octopus publications received views from researchers in
                                        184 countries, with an average of over 200 views per publication.
                                    </p>
                                </AccordionSection>
                                <AccordionSection title="Establish your priority instantly to stop others from ‘scooping’ you.">
                                    <p>
                                        Some researchers’ first thought is ‘I don’t want to publish my work on Octopus
                                        before I’ve got all the journal publications I need out of it, else someone
                                        might pick it up and scoop me’. Fair enough - if you want to hold back and
                                        publish alongside a traditional output you can do that.
                                    </p>
                                    <br />
                                    <p>
                                        BUT – publishing on Octopus gives you a DOI and an instant time stamp so that
                                        you can prove you published an idea at a certain time. It’s like a patent
                                        office. So if you really want to establish your priority on an idea, it gives
                                        you far more protection than nervously waiting for months (years?) and hoping no
                                        one else comes up with it.
                                    </p>
                                    <br />
                                    <p>
                                        Remember, Darwin was saved from being scooped by Wallace only because he’d
                                        written his ideas about natural selection in letters to friends… Now, you have
                                        Octopus to do it formally.
                                    </p>
                                </AccordionSection>
                                <AccordionSection title="Easily find relevant work, and even research problems that government or funders are interested in and alert them to your research.">
                                    <p>
                                        Because Octopus is discipline-agnostic and entirely digital, and because it has
                                        a unique structure that links publications together, it is easy to search for
                                        and stumble across relevant work.
                                    </p>
                                    <br />
                                    <p>
                                        In addition, Octopus automatically pulls in Research Problems from{' '}
                                        <Components.Link
                                            openNew
                                            href="https://www.octopus.ac/search/organisations"
                                            className="underline"
                                            aria-label="UK Government departments"
                                        >
                                            UK Government departments
                                        </Components.Link>
                                        , which you can search. When you link your relevant work, you will get a chance
                                        to notify them and pass on your contact details, if you want to.
                                    </p>
                                    <br />
                                    <p>
                                        We’re working with funders to try doing something similar for themed funding
                                        calls.
                                    </p>
                                </AccordionSection>
                                <AccordionSection title="Get credit where credit’s due – for everything you do.">
                                    <p>
                                        Octopus’ smaller, more specialist publication types means that author groups are
                                        smaller (much more often a single author). Specialists, who might often
                                        otherwise be in the middle of a list of authors, can have their ‘own
                                        publications’ on Octopus.
                                    </p>
                                    <br />
                                    <p>
                                        Everything that you as an author do on Octopus appears on your public author
                                        page (along with details pulled in from your ORCiD), so any potential
                                        collaborators, employers or funders can easily find out more about you and see
                                        all your work.
                                    </p>
                                    <br />
                                    <p>
                                        Peer reviews that you do are treated just like any other kind of publication,
                                        getting a DOI and appearing on your author page to get you credit.
                                    </p>
                                </AccordionSection>
                                <AccordionSection title="Share any kind of work, whatever format it is (such as data, code, video etc).">
                                    <p>
                                        Although Octopus isn’t a repository, you can link in to your Octopus
                                        publications anything that you have placed online somewhere – such as a digital
                                        scan of an object, a video, a dataset, code etc.
                                    </p>
                                    <br />
                                    <p>
                                        This means you can include any digital artifacts as your research outputs,
                                        getting a DOI and being able to describe them, and easily share them or submit
                                        them for research assessment.
                                    </p>
                                    <br />
                                    <p>
                                        You will find the field to ‘include part of this work hosted elsewhere’ when you
                                        are submitting your publications.
                                    </p>
                                </AccordionSection>
                                <AccordionSection title="Get peer review early in a project, before you spend all your resources.">
                                    <p>
                                        We’ve all been there: you submit your work to a journal and one of the peer
                                        reviewers says it would have been much better if only you had done something
                                        differently from the start… and they have a point. But it’s too late, so you can
                                        only defend what you’ve done and try to make the best of it.
                                    </p>
                                    <br />
                                    <p>
                                        Instead, in Octopus, when you publish ideas or methods, you can get peer review
                                        of them before you put time, money and effort into going further. You can
                                        reversion your publications any time, to improve on them if peer reviewers pick
                                        up good points. This helps ensure that your work is as good as it possibly can
                                        be. Good for you – good for the research community.
                                    </p>
                                    <br />
                                    <p>
                                        All peer review is done post-publication, so you just need to publish your work
                                        and then you can even invite peer review yourself from people you know and
                                        respect, or solicit it on social media.
                                    </p>
                                </AccordionSection>
                                <AccordionSection title="Your publications can either automatically or very easily be submitted to your institutional repository, research assessment process (such as REF, or grant review), or a traditional publisher.">
                                    <p>
                                        If your institution uses the service called Publications Router (most UK
                                        universities do), then your Octopus publications will automatically be deposited
                                        in their repository, and if you enter your funding details then your funder can
                                        also be notified of the relevant publications. If you need to deposit the
                                        publications yourself then you can easily create a pdf to do that, and we are
                                        working on automatic pipelines to funders, journals, research assessment systems
                                        (like{' '}
                                        <Components.Link
                                            openNew
                                            href="https://2029.ref.ac.uk/"
                                            aria-label="REF"
                                            className="underline"
                                        >
                                            REF
                                        </Components.Link>
                                        ) and other alternative publishing systems.
                                    </p>
                                </AccordionSection>
                                <AccordionSection title="Perfect for ‘big team science’ and meta-analysis.">
                                    <p>
                                        For those working in ‘many labs’ and replication projects in science,
                                        traditional publication routes can be difficult. Octopus provides the ideal
                                        platform.
                                    </p>
                                    <br />
                                    <p>
                                        From one agreed method or protocol, any number of research teams can link their
                                        data or results. These can then be analysed separately, and also in a
                                        meta-analysis if necessary. Each of these publications will have their own
                                        author set, ensuring everyone gets the credit they deserve, and it’s clear who
                                        did what (and when).
                                    </p>
                                </AccordionSection>
                                <AccordionCTA
                                    title="Start using Octopus as part of your research"
                                    description="Sign in with your ORCID in a few clicks – there's no separate registration or new password, so you can start exploring, publishing and reviewing straight away."
                                >
                                    <Components.Link
                                        href={Config.urls.orcidLogin.path}
                                        ariaLabel="Sign in with ORCID"
                                        className="flex items-center rounded-md bg-orcid px-4 py-2 w-fit mx-auto text-white-50 font-semibold hover:bg-orcid-dark transition-colors duration-300"
                                    >
                                        <Assets.ORCID width={20} height={20} className="fill-white-50" />
                                        <span className="ml-2">Sign in with ORCID</span>
                                    </Components.Link>
                                </AccordionCTA>
                            </TabPanel>
                            <TabPanel>
                                <AccordionSection title="Automatically receive publications from affiliated researchers.">
                                    <p>
                                        If you use Publications Router, Octopus publications will automatically be
                                        deposited in your institutional repository, and include funder/grant metadata.
                                        All Octopus publications are fully Open Access.
                                    </p>
                                    <br />
                                    <p>
                                        If you don’t use Publication Router, then contact us via{' '}
                                        <Components.Link
                                            href="mailto:help@jisc.ac.uk"
                                            className="underline"
                                            aria-label="Contact help@jisc.ac.uk"
                                        >
                                            help@jisc.ac.uk
                                        </Components.Link>{' '}
                                        to see if we can integrate Octopus with your institutional systems.
                                    </p>
                                </AccordionSection>
                                <AccordionSection title="Easily submit ‘non traditional outputs’ to research assessment exercises (like REF).">
                                    <p>
                                        Many of the best outputs of research work are not text-based narratives as are
                                        usually published in the traditional journal- and book-dominated publishing
                                        system. Creative works, code, digital objects, data – all can be linked into
                                        Octopus publications and easily submitted to assessment via their DOI. We are
                                        currently building integrations to allow easy ‘packaging’ of Octopus
                                        publications for various submission platforms and expect to have one for the
                                        next{' '}
                                        <Components.Link
                                            openNew
                                            href="https://2029.ref.ac.uk/"
                                            aria-label="REF"
                                            className="underline"
                                        >
                                            REF
                                        </Components.Link>{' '}
                                        in the UK.
                                    </p>
                                    <br />
                                    <p>
                                        This makes Octopus an ideal place to encourage researchers to publish their
                                        ‘non-traditional’ outputs.
                                    </p>
                                </AccordionSection>
                                <AccordionSection title="It’s a perfect tool for doctoral & student training in best research practice.">
                                    <p>
                                        Because Octopus is built to incentivise best research practices, it is the ideal
                                        training platform for students.
                                    </p>
                                    <br />
                                    <p>
                                        For doctoral candidates, it helps support ‘writing up as you go’, as well as
                                        introducing concepts such as pre-registration in experimental sciences.
                                    </p>
                                    <br />
                                </AccordionSection>
                                <AccordionSection title="Instantly assess what type of researcher a candidate for hiring/promotion is.">
                                    <p>
                                        Including Octopus in your institutional hiring and promotion process not only
                                        signals your commitment to the highest research practice standards, but the
                                        ‘author page’ gives you valuable information about any candidate.
                                    </p>
                                    <br />
                                    <p>
                                        The author page doesn’t allow the inclusion of potentially biasing information
                                        such as a photo, but it pulls in all information associated with an ORCiD,
                                        alongside all their activity in Octopus (including peer reviewing, red flagging,
                                        and making useful links between publication chains).
                                    </p>
                                    <br />
                                    <p>
                                        Because Octopus publications are more specialised, the kinds of publications a
                                        researcher authors will give you a more precise picture of their work: are they
                                        single-authoring lots of ideas, or designing methods, collecting data, or doing
                                        analyses? Or are they a good collaborator, shown through doing high quality peer
                                        reviews?
                                    </p>
                                    <br />
                                </AccordionSection>
                                <AccordionSection title="Get to see what their peers think of a candidate’s work.">
                                    <p>
                                        Because peer review is open in Octopus, you can read the peer reviews of the
                                        work of candidates for promotion or hiring. You can check the backgrounds of the
                                        reviewers by looking at their ‘author page’ to check they are not a friend and
                                        collaborator, and assess their expertise in the topic.
                                    </p>
                                    <br />
                                    <p>
                                        Peer reviews can give a much more rounded idea of the strength of a researcher’s
                                        work than using journal publications (and their impact factors) as a proxy.
                                    </p>
                                    <br />
                                </AccordionSection>
                                <AccordionCTA
                                    title="Bring Octopus into your institution"
                                    description="Talk to us about how Octopus can support your researchers, align with your open research policies and complement your existing systems and training."
                                >
                                    <ContactCTA text="Talk to us about using Octopus" />
                                </AccordionCTA>
                            </TabPanel>
                            <TabPanel>
                                <AccordionSection title="Easily see what publications result from your grants.">
                                    <p>
                                        Authors are asked to enter details of their funding, preferably via a{' '}
                                        <Components.Link
                                            openNew
                                            href="https://ror.org/blog/2024-08-06-using-ror-for-funder-identification/"
                                            aria-label="ROR"
                                            className="underline"
                                        >
                                            ROR ID
                                        </Components.Link>{' '}
                                        and grant ID. This metadata is carried in{' '}
                                        <Components.Link
                                            openNew
                                            href="https://jiscsd.github.io/octopus/"
                                            aria-label="Octopus API"
                                            className="underline"
                                        >
                                            Octopus’ API
                                        </Components.Link>
                                        , meaning that funders can opt to be automatically alerted every time a
                                        publication is published that is associated with their funding.
                                    </p>
                                </AccordionSection>
                                <AccordionSection title="Use Octopus as a new way to elicit and assess thematic grant call applications.">
                                    <p>
                                        If you do funding calls that are based around specific research questions, these
                                        could be published on Octopus in the same way that{' '}
                                        <Components.Link
                                            openNew
                                            href="https://www.octopus.ac/search/organisations"
                                            aria-label="UK government areas of research interest"
                                            className="underline"
                                        >
                                            UK government areas of research interest
                                        </Components.Link>{' '}
                                        are. This allows researchers to find them easily, and also submit their
                                        proposals openly by linking them to these research problems. This protects
                                        applicants by ensuring that their ideas gain a DOI and are time-stamped to prove
                                        their priority over their ideas (acting a little like a patent office). We know
                                        that applicants are often nervous of their ideas being scooped by grant panel
                                        members – this system will ensure they are protected.
                                    </p>
                                    <br />
                                    <p>
                                        You can then elicit peer reviews for applications, to be done openly on Octopus
                                        as well. Octopus publications do not display authors’ first names or
                                        institutional affiliations (these are one click away), helping reviewers avoid
                                        potential unconscious gender or institutional biases.
                                    </p>
                                    <br />
                                    <p>
                                        Using Octopus ensures transparency over the whole process – something greatly
                                        missing in grant applications currently – and can signal that, as a funder, you
                                        prioritise research quality, fairness, and openness.
                                    </p>
                                    <br />
                                    <p>
                                        If you are a funder and would like to pilot this way of working, please email{' '}
                                        <Components.Link
                                            openNew
                                            href="mailto:help@jisc.ac.uk"
                                            aria-label="Contact help@jisc.ac.uk"
                                            className="underline"
                                        >
                                            help@jisc.ac.uk
                                        </Components.Link>{' '}
                                        and we will work to integrate Octopus with your application system.
                                    </p>
                                </AccordionSection>
                                <AccordionSection title="Easily assess individual researchers.">
                                    <p>
                                        Every author has their own page on Octopus. The author’s page doesn’t allow the
                                        inclusion of potentially biasing information such as a photo, but it pulls in
                                        all information associated with an ORCiD, alongside all the individual’s
                                        activity in Octopus (including peer reviewing, red flagging, and making useful
                                        links between publication chains).
                                    </p>
                                    <br />
                                    <p>
                                        Because Octopus publications are more specialised, the kinds of publications a
                                        researcher authors will give you a more precise picture of their work: are they
                                        single-authoring lots of ideas, or designing methods, collecting data, or doing
                                        analyses? Or are they a good collaborator, shown through doing high quality peer
                                        reviews?
                                    </p>
                                    <br />
                                    <p>
                                        This, along with being able to view open peer reviews of their work, make
                                        Octopus a useful tool in researcher assessment.
                                    </p>
                                </AccordionSection>
                                <AccordionSection title="Easily fund replication and ‘many labs’ projects, and use small grants in new & efficient ways.">
                                    <p>
                                        Octopus is designed to support and incentivise best research practice, including
                                        replication in experimental work. From one Method publication, multiple Results
                                        publications can be linked, each potentially from a different set of authors.
                                    </p>
                                    <br />
                                    <p>
                                        Funders interested in supporting ‘many labs’ or replication projects could
                                        either fund the development of a Method, or search existing Method publications
                                        to find one that is well-reviewed, and then offer funding to multiple groups for
                                        data collection according to that Method. This could encourage, and make
                                        efficient, such robust practices.
                                    </p>
                                    <br />
                                    <p>
                                        In a slight modification of this, funders interested in supporting diverse
                                        researchers with small grants could do this efficiently by finding any number of
                                        well-reviewed publications on Octopus and offering funding to anyone interested
                                        in completing ‘the next step in the chain’, whether that be developing a robust
                                        Method to test a Hypothesis, collecting Data, completing an Analysis (or
                                        meta-analysis) etc. This could be a very innovative and efficient way of funding
                                        specific research, which might allow many researchers to gain small grants who
                                        would otherwise not be able to put together a full grant application (such as a
                                        specialist analyst working in a resource-poor setting, or an ECR).
                                    </p>
                                </AccordionSection>
                                <AccordionCTA
                                    title="Support Octopus as shared research infrastructure"
                                    description="If you're interested in funding, partnering on pilots or aligning Octopus with your open research ambitions, we'd love to talk."
                                >
                                    <ContactCTA text="Talk to us about supporting Octopus" />
                                </AccordionCTA>
                            </TabPanel>
                            <TabPanel>
                                <AccordionSection title="Charge subscriptions knowing that the underlying research is freely available in Octopus and hence counts as Open for the researcher and funder: the ‘Octopus Open’ model!">
                                    <p>
                                        As a publisher, we recognise that you need to charge fees either to authors or
                                        as a subscription to readers – and that charging authors decreases the number of
                                        authors able to publish with you (especially as funders increasingly withdraw
                                        APC funding). However, co-publication with Octopus offers benefits to everyone:
                                    </p>
                                    <br />
                                    <p>
                                        Authors can publish the raw underlying work (including data, code and everything
                                        that might be considered ‘supplementary information’) as a series of Octopus
                                        publications, which are Open under a CC-BY licence. This ensures that the
                                        knowledge is freely available and should fall under the Open Access mandate of a
                                        funder, institution or research assessment programme. This means that a
                                        narrative article or monograph published in a traditional outlet such as a
                                        journal doesn’t have to be Open Access – you can charge a subscription fee.
                                    </p>
                                    <br />
                                    <p>
                                        The authors have no fees to pay and hence free choice of their journal; you as
                                        the publisher do not need to carry unnecessary amounts of technical information
                                        in your articles – they can reference the Octopus publication DOIs like an
                                        organised form of supplementary information – likely increasing readership and
                                        interest in the articles; you the publisher can charge a subscription fee (and
                                        explore different fee models) but still reassure people that the work is
                                        ‘Octopus Open’; the research community gets the full detailed work in a digital
                                        format to build upon.
                                    </p>
                                </AccordionSection>
                                <AccordionSection title="Take advantage of Octopus’ freely available, open peer review options.">
                                    <p>
                                        Encouraging authors to use Octopus like a pre-print server means that other
                                        researchers may review the work, openly, on Octopus. You can then take these
                                        peer reviews into account (or ignore them) in your deliberation process.
                                    </p>
                                    <br />
                                    <p>
                                        You could even encourage your own peer reviewers to review in Octopus. This
                                        would have the advantages of:
                                    </p>
                                    <ul>
                                        <li>Allowing the peer reviewers to get credit for their peer review</li>
                                        <li>
                                            Making the peer reviews much more specific to sections of the work, meaning
                                            you can ensure that each part has been scrutinised by a suitable expert and
                                            that the peer reviewers each have a much quicker job to do
                                        </li>
                                        <li>Signalling your commitment to quality and transparency</li>
                                    </ul>
                                </AccordionSection>
                                <AccordionSection title="Use Octopus as your ‘supplementary information'.">
                                    <p>
                                        We all know that supplementary information can be crucial for researchers who
                                        are deeply interested in an article, and yet it is often only available in an
                                        inconvenient format (e.g. pdf), and sometimes missing crucial information.
                                    </p>
                                    <br />
                                    <p>
                                        As a publisher, it would be a great service to your readers, and often good for
                                        the authors, to have a properly organised set of supplementary information which
                                        is forced by format to include all the information readers need. That is what
                                        Octopus is designed for. By encouraging authors to publish their work in full on
                                        Octopus simultaneously with publication of an article, you can reference the
                                        DOIs of the Octopus publications in lieu of messy supplementary information.
                                    </p>
                                </AccordionSection>
                                <AccordionCTA
                                    title="Explore how Octopus can work with your journals or platform"
                                    description="Let's discuss how linking, peer review and new research formats could fit your workflows and help your authors share more of their work."
                                >
                                    <ContactCTA text="Talk to us about partnering with Octopus" />
                                </AccordionCTA>
                            </TabPanel>
                        </TabPanels>
                    </TabGroup>
                </PageSection>

                <PageSection>
                    <div className="border dark:border-teal-500 border-teal-400 rounded-xl p-8 shadow-lg">
                        <div className="max-w-2xl mx-auto space-y-6">
                            <h3 className="lg:text-xl">
                                We love every opportunity to talk about Octopus. Get in touch with any comments, ideas
                                or questions.
                            </h3>
                            <ContactCTA text="Get in touch" />
                        </div>
                    </div>
                </PageSection>
            </Layouts.Standard>
        </>
    );
};

export default Benefits;
