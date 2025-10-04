import React, { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    title?: string;
    onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', title, onClick }) => {
    const isClickable = !!onClick;
    return (
        <div 
            onClick={onClick}
            className={`bg-light-card dark:bg-dark-card rounded-card shadow-md transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1 ${isClickable ? 'cursor-pointer' : ''} ${className}`}
        >
            {title && (
                <div className="px-6 py-4 border-b border-light-border dark:border-dark-border">
                    <h3 className="text-lg font-medium text-light-text dark:text-dark-text">{title}</h3>
                </div>
            )}
            <div className={`p-6 ${title ? '' : 'pt-6'}`}>
                {children}
            </div>
        </div>
    );
};

export default Card;