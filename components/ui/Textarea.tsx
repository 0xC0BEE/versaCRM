import React, { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    id: string;
}

const Textarea: React.FC<TextareaProps> = ({ label, id, className, ...props }) => {
    const baseClasses = "mt-1 block w-full px-3 py-2 bg-card-bg/50 border border-border-subtle rounded-input shadow-sm-new placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all";

    return (
        <div className={className}>
            <label htmlFor={id} className="block text-sm font-medium text-text-primary">
                {label} {props.required && <span className="text-error">*</span>}
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
