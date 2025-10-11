import React, { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    id: string;
    className?: string;
    size?: 'sm' | 'md';
}

const Select: React.FC<SelectProps> = ({ label, id, className, children, size = 'md', ...props }) => {
    
    const sizeClasses = {
        sm: 'h-8 text-sm rounded-[8px] px-2',
        md: 'h-10 text-sm rounded-input pl-3 pr-10 py-2'
    };
    
    const baseClasses = `mt-1 block w-full bg-card-bg/80 border border-border-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all ${sizeClasses[size]}`;

    return (
        <div className={className}>
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-text-primary">
                    {label} {props.required && <span className="text-error">*</span>}
                </label>
            )}
            <select
                id={id}
                className={baseClasses}
                {...props}
            >
                {children}
            </select>
        </div>
    );
};

export default Select;