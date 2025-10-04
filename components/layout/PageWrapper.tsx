import React, { ReactNode } from 'react';

interface PageWrapperProps {
    children: ReactNode;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ children }) => {
    return (
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent p-6">
            <div className="container mx-auto">
                {children}
            </div>
        </main>
    );
};

export default PageWrapper;