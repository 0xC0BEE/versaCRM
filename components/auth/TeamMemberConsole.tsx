import React from 'react';
import Header from '../layout/Header';
import TeamMemberSidebar from '../layout/TeamMemberSidebar';
import PageRenderer from '../common/PageRenderer';

const TeamMemberConsole: React.FC = () => {
    return (
        <div className="flex h-screen bg-gray-100 dark:bg-dark-bg text-gray-800 dark:text-gray-200">
            <TeamMemberSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                 <main className="flex-1 overflow-x-hidden overflow-y-auto">
                    <PageRenderer />
                </main>
            </div>
        </div>
    );
};

export default TeamMemberConsole;