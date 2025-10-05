/**
 * Modal Component - Clay-Elevated Harmony UI
 *
 * STRICT SPECIFICATIONS:
 * - Widths: sm(320px) / md(480px) / lg(640px)
 * - Max height: 85vh
 * - Padding: 1.5rem (24px)
 * - Border radius: 16px (var(--radius-lg))
 * - Backdrop: bg-black/30 with blur(20px)
 * - Header: flex with left-aligned title + right-aligned close (24px icon)
 * - Close icon hover: scale(1.1)
 * - Footer: right-aligned with gap-0.5rem
 * - Z-index: backdrop(1030) / modal(1040)
 */

import React, { ReactNode, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: ReactNode;
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  footer,
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, closeOnEscape]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    firstElement?.focus();

    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  if (!isOpen) return null;

  // EXACT SIZE SPECIFICATIONS
  const sizeClasses = {
    sm: 'w-[320px]',       // 320px exact
    md: 'w-[480px]',       // 480px exact (DEFAULT)
    lg: 'w-[640px]',       // 640px exact
    xl: 'w-[800px]',       // 800px for extra large
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-modal-backdrop flex items-center justify-center p-4 sm:p-6"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop - EXACT SPEC: bg-black/30 + backdrop-blur */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-md animate-fadeIn"
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        ref={modalRef}
        className={`
          relative z-modal
          ${sizeClasses[size]}
          max-w-full
          max-h-[85vh]
          flex flex-col
          bg-card-bg
          border border-border-subtle
          rounded-[16px]
          shadow-xl
          animate-fadeInUp
          custom-scrollbar
        `.trim().replace(/\s+/g, ' ')}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - EXACT SPEC: flex with left title + right close */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-border-subtle">
          <h3
            id="modal-title"
            className="text-xl font-semibold text-text-primary leading-6"
          >
            {title}
          </h3>

          {/* Close Button - EXACT SPEC: 24px icon with scale(1.1) hover */}
          {showCloseButton && (
            <button
              onClick={onClose}
              className="
                p-1 rounded-md
                text-text-secondary
                hover:text-text-primary
                hover:bg-hover-bg
                transition-all duration-200
                hover:scale-110
                focus:outline-none
                focus-visible:ring-2
                focus-visible:ring-primary
              "
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Content - Scrollable with exact padding: 1.5rem (24px) */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {children}
        </div>

        {/* Footer - EXACT SPEC: right-aligned with gap-0.5rem (8px) */}
        {footer && (
          <div className="flex-shrink-0 flex items-center justify-end gap-2 p-6 border-t border-border-subtle">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
