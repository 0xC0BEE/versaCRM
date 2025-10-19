import React, { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
    label?: string;
    'aria-label'?: string;
    id: string;
    size?: 'sm' | 'md';
    leftIcon?: ReactNode;
}

const Input: React.FC<InputProps> = ({ label, id, className, size = 'md', leftIcon, ...props }) => {
    
    const sizeClasses = {
        sm: 'h-9 text-sm',
        md: 'h-10 py-2 text-sm'
    };
    
    const paddingClasses = leftIcon ? 'pl-10 pr-3' : 'px-3';

    const baseClasses = `flex w-full rounded-md border border-border-subtle bg-card-bg ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`;

    return (
        <div className={className}>
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-text-primary mb-1">
                    {label} {props.required && <span className="text-error">*</span>}
                </label>
            )}
            <div className="relative">
                {leftIcon && (
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        {/* FIX: Cast leftIcon to a type that accepts className to fix TypeScript error with React.cloneElement. */}
                        {React.isValidElement(leftIcon) && React.cloneElement(leftIcon as React.ReactElement<{ className?: string }>, { className: 'h-5 w-5 text-text-secondary' })}
                    </div>
                )}
                <input
                    id={id}
                    className={`${baseClasses} ${sizeClasses[size]} ${paddingClasses}`}
                    aria-label={props['aria-label'] || label}
                    {...props}
                />
            </div>
        </div>
    );
};

export default Input;