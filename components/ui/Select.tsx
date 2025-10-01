import React, { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    id: string;
    className?: string;
}

const Select: React.FC<SelectProps> = ({ label, id, className, children, ...props }) => {
    const baseClasses = "mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md";

    return (
        <div className={className}>
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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