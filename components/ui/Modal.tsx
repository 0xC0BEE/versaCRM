import React, { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
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
        'sm': 'max-w-sm',   // 320px
        'md': 'max-w-md',   // 480px
        'lg': 'max-w-lg',   // 640px
        'xl': 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
        '5xl': 'max-w-5xl',
    };

    return (
        <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-md z-50 flex justify-center items-center p-4 animate-fade-in-up" 
            style={{animationDuration: '0.3s'}} 
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div 
                className={`bg-card-bg border border-border-subtle rounded-card shadow-lg-new w-full ${sizeClasses[size]} max-h-[85vh] flex flex-col animate-fade-in-up`} 
                style={{animationDuration: '0.4s', animationTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'}}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex-shrink-0 flex justify-between items-center p-6 border-b border-border-subtle">
                    <h3 id="modal-title" className="text-lg font-semibold text-text-primary">{title}</h3>
                    <button onClick={onClose} className="p-1 rounded-full text-text-secondary hover:bg-hover-bg hover:scale-110 transition-transform" aria-label="Close modal">
                        <X className="h-6 w-6" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;