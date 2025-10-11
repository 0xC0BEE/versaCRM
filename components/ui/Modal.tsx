import React, { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: ReactNode;
    footer?: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, description, children, footer, size = 'md' }) => {
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen) return null;
    
    const sizeClasses = {
        'sm': 'max-w-sm',
        'md': 'max-w-md',
        'lg': 'max-w-lg',
        'xl': 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
        '5xl': 'max-w-5xl',
    };

    return (
        <div 
            className="fixed inset-0 z-50 bg-black/60 flex justify-center items-center p-4 animate-fade-in-up" 
            style={{animationDuration: '0.2s'}} 
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div 
                className={`border bg-card-bg shadow-lg rounded-lg w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col animate-fade-in-up`} 
                style={{animationDuration: '0.3s', animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)'}}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col space-y-1.5 text-center sm:text-left p-6">
                    <h3 id="modal-title" className="text-lg font-semibold leading-none tracking-tight text-text-heading">{title}</h3>
                    {description && <p className="text-sm text-text-secondary">{description}</p>}
                </div>
                
                <div className="px-6 py-4 overflow-y-auto flex-grow">
                    {children}
                </div>
                
                {footer && (
                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6">
                        {footer}
                    </div>
                )}
                
                 <button onClick={onClose} className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none" aria-label="Close modal">
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};

export default Modal;