import React, { SelectHTMLAttributes } from 'react';

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
    label?: string;
    id: string;
    className?: string;
    size?: 'sm' | 'md';
}

const Select: React.FC<SelectProps> = ({ label, id, className, children, size = 'md', ...props }) => {
    
    const sizeClasses = {
        sm: 'h-9 rounded-md px-2',
        md: 'h-10 px-3 py-2'
    };
    
    const baseClasses = `flex w-full items-center justify-between rounded-md border border-border-subtle bg-card-bg text-sm ring-offset-background placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${sizeClasses[size]}`;

    return (
        <div className={className}>
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-text-primary mb-1">
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
