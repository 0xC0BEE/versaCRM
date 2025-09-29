import React, { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    id: string;
}

const Textarea: React.FC<TextareaProps> = ({ label, id, className, ...props }) => {
    const baseClasses = "mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm";

    return (
        <div className={className}>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {label} {props.required && <span className="text-red-500">*</span>}
            </label>
            <textarea
                id={id}
                className={baseClasses}
                rows={3}
                {...props}
            />
        </div>
    );
};

export default Textarea;