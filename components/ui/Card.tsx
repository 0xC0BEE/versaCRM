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
            className={`bg-card-bg rounded-card shadow-md-new border border-border-subtle ${isClickable ? 'cursor-pointer' : ''} ${className}`}
        >
            {title && (
                <div className="px-5 py-4 border-b border-border-subtle">
                    <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
                </div>
            )}
            <div className={`p-5 ${title ? '' : 'pt-5'}`}>
                {children}
            </div>
        </div>
    );
};

export default Card;