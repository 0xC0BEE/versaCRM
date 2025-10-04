import React, { ReactNode } from 'react';

interface PageWrapperProps {
    children: ReactNode;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ children }) => {
    return (
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            {children}
        </main>
    );
};

export default PageWrapper;
