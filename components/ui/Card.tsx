import React, { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    title?: string;
    onClick?: () => void;
    contentClassName?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', title, onClick, contentClassName = 'p-5' }) => {
    const isClickable = !!onClick;
    return (
        <div 
            onClick={onClick}
            className={`bg-card-bg rounded-card shadow-md-new border border-border-subtle flex flex-col ${isClickable ? 'cursor-pointer' : ''} ${className}`}
        >
            {title && (
                <div className="px-5 py-4 border-b border-border-subtle flex-shrink-0">
                    <h3 className="text-base font-semibold text-text-primary">{title}</h3>
                </div>
            )}
            <div className={`${contentClassName} flex-grow`}>
                {children}
            </div>
        </div>
    );
};

export default Card;