import React from 'react';

type Props = {
    tabHead: string[];
    tabBody: React.ReactElement[];
};

const Tabs: React.FC<Props> = (props): React.ReactElement => {
    const [current, setCurrent] = React.useState(0);

    return (
        <div className="w-full">
            <header>
                <nav className="border-b border-grey-200">
                    <ul className="flex gap-2 px-4">
                        {props.tabHead.map((head, index) => (
                            <li key={head}>
                                <button
                                    onClick={() => setCurrent(index)}
                                    className={`relative px-4 py-3 font-medium text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 ${
                                        index === current
                                            ? 'text-teal-600 dark:text-teal-400'
                                            : 'text-grey-600 dark:text-grey-400 hover:text-grey-900 dark:hover:text-grey-200'
                                    }`}
                                >
                                    {head}
                                    {index === current && (
                                        <span className="absolute bottom-0 left-0 right-0 h-0.5 w-full bg-teal-600 dark:bg-teal-400 rounded-t-sm" />
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </header>

            <section className="pt-6 animate-in fade-in duration-200">
                {props.tabBody.map((body, index) => index === current && body)}
            </section>
        </div>
    );
};

export default Tabs;
