import React, { InputHTMLAttributes } from 'react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
    label?: string;
    id: string;
    inputSize?: 'md' | 'lg';
}

const Input: React.FC<InputProps> = ({ label, id, className, inputSize = 'md', ...props }) => {
    
    const sizeClasses = {
        md: "px-3 py-2 sm:text-sm",
        lg: "p-3 text-base",
    };

    const baseClasses = `mt-1 block w-full bg-light-card/50 dark:bg-dark-card/50 border border-light-border dark:border-dark-border rounded-input shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue/80 disabled:bg-slate-100 disabled:cursor-not-allowed dark:disabled:bg-slate-800 transition-all ${sizeClasses[inputSize]}`;

    return (
        <div className={className}>
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
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