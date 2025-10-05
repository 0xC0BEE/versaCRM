import React, { InputHTMLAttributes } from 'react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
    label?: string;
    id: string;
    inputSize?: 'md' | 'lg';
}

const Input: React.FC<InputProps> = ({ label, id, className, inputSize = 'md', ...props }) => {
    
    const sizeClasses = {
        md: "px-3 py-2 sm:text-sm", // 14px
        lg: "p-3 text-base", // 15px
    };

    const baseClasses = `mt-1 block w-full bg-card-bg/50 border border-border-subtle rounded-input shadow-sm-new placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-slate-500/10 disabled:cursor-not-allowed transition-all ${sizeClasses[inputSize]}`;

    return (
        <div className={className}>
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-text-primary">
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
