import React from 'react';
import Header from '../layout/Header';
import Sidebar from '../layout/Sidebar';
import PageRenderer from '../common/PageRenderer';

const OrganizationConsole: React.FC = () => {
    return (
        <div className="flex h-screen bg-gray-100 dark:bg-dark-bg text-gray-800 dark:text-gray-200">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto">
                    <PageRenderer />
                </main>
            </div>
        </div>
    );
};

export default OrganizationConsole;