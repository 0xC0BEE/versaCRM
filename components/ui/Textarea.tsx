import React, { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    id: string;
}

const Textarea: React.FC<TextareaProps> = ({ label, id, className, ...props }) => {
    const baseClasses = "flex min-h-[80px] w-full rounded-md border border-border-subtle bg-card-bg px-3 py-2 text-sm ring-offset-background placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

    return (
        <div className={className}>
            <label htmlFor={id} className="block text-sm font-medium text-text-primary mb-1">
                {label} {props.required && <span className="text-error">*</span>}
            </label>
            <textarea
                id={id}
                className={baseClasses}
                {...props}
            />
        </div>
    );
};

export default Textarea;
