import React, { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    id: string;
    className?: string;
}

const Select: React.FC<SelectProps> = ({ label, id, className, children, ...props }) => {
    const baseClasses = "mt-1 block w-full pl-3 pr-10 py-2 text-sm bg-card-bg/80 border border-border-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm rounded-input transition-all";

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
