import React, { InputHTMLAttributes } from 'react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
    label?: string;
    'aria-label'?: string;
    id: string;
    size?: 'sm' | 'md';
}

const Input: React.FC<InputProps> = ({ label, id, className, size = 'md', ...props }) => {
    
    const sizeClasses = {
        sm: 'h-9 px-2 text-sm',
        md: 'h-10 px-3 py-2 text-sm'
    };
    
    const baseClasses = `flex w-full rounded-md border border-border-subtle bg-card-bg ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`;

    return (
        <div className={className}>
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-text-primary mb-1">
                    {label} {props.required && <span className="text-error">*</span>}
                </label>
            )}
            <input
                id={id}
                className={`${baseClasses} ${sizeClasses[size]}`}
                aria-label={props['aria-label'] || label}
                {...props}
            />
        </div>
    );
};

export default Input;