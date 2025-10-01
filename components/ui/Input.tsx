import React, { InputHTMLAttributes } from 'react';

// FIX: Renamed `size` prop to `inputSize` to avoid conflict with native attribute.
interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
    label?: string;
    id: string;
    inputSize?: 'md' | 'lg';
}

const Input: React.FC<InputProps> = ({ label, id, className, inputSize = 'md', ...props }) => {
    
    const sizeClasses = {
        md: "px-3 py-2 sm:text-sm",
        lg: "p-3 text-base", // Larger padding and text for lg size
    };

    const baseClasses = `mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed dark:disabled:bg-gray-800 ${sizeClasses[inputSize]}`;

    return (
        <div className={className}>
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label} {props.required && <span className="text-red-500">*</span>}
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