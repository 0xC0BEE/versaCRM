import React, { InputHTMLAttributes } from 'react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
    label?: string;
    id: string;
}

const Input: React.FC<InputProps> = ({ label, id, className, ...props }) => {
    
    const baseClasses = `flex h-10 w-full rounded-md border border-border-subtle bg-card-bg px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`;

    return (
        <div className={className}>
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-text-primary mb-1">
                    {label} {props.required && <span className="text-error">*</span>}
                </label>
            )}
            <input
                id={id}
                className={baseClasses}
                {...props}
            />
        </div>
    );
};

export default Input;
