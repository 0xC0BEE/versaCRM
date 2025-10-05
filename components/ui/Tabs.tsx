import React from 'react';

interface TabsProps {
    tabs: string[];
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, setActiveTab }) => {
    return (
        <div className="border-b border-border-subtle overflow-x-auto custom-scrollbar">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`whitespace-nowrap pb-4 px-1 border-b-2 font-semibold text-sm transition-colors ${
                            tab === activeTab
                                ? 'border-primary text-primary'
                                : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-subtle'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </nav>
        </div>
    );
};

export default Tabs;
