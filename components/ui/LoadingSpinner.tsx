import React from 'react';
import { Loader } from 'lucide-react';

const LoadingSpinner: React.FC = () => {
    return (
        <div className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-dark-bg">
            <Loader className="h-8 w-8 text-primary-500 animate-spin" />
        </div>
    );
};

export default LoadingSpinner;
