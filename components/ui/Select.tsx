import React, { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    id: string;
    className?: string;
}

const Select: React.FC<SelectProps> = ({ label, id, className, children, ...props }) => {
    const baseClasses = "mt-1 block w-full pl-3 pr-10 py-2 text-base bg-light-card/50 dark:bg-dark-card/50 border border-light-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue/80 sm:text-sm rounded-input transition-all";

    return (
        <div className={className}>
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    {label} {props.required && <span className="text-red-500">*</span>}
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