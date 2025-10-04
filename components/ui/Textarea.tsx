import React, { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    id: string;
}

const Textarea: React.FC<TextareaProps> = ({ label, id, className, ...props }) => {
    const baseClasses = "mt-1 block w-full px-3 py-2 bg-light-card/50 dark:bg-dark-card/50 border border-light-border dark:border-dark-border rounded-input shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue/80 sm:text-sm transition-all";

    return (
        <div className={className}>
            <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
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