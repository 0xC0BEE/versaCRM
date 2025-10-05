/**
 * Button Component - Clay-Elevated Harmony UI
 *
 * STRICT SPECIFICATIONS:
 * - Height: 40px (44px on mobile for touch targets)
 * - Min-width: 96px
 * - Padding: 1rem (16px) horizontal
 * - Border radius: 10px (var(--radius-md))
 * - Hover: translateY(-2px) + shadow-md + primary-hover color
 * - Active: scale(0.98) + shadow-inner
 * - Ripple effect on click
 * - Focus ring: 2px primary outline
 */

import React, { ReactNode, useRef } from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  isLoading = false,
  fullWidth = false,
  className = '',
  disabled,
  onClick,
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Ripple effect handler
  const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const ripple = document.createElement('span');

    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.className = 'absolute rounded-full bg-white/40 pointer-events-none animate-ripple';

    button.appendChild(ripple);

    setTimeout(() => ripple.remove(), 300);
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !isLoading) {
      createRipple(event);
      onClick?.(event);
    }
  };

  // Base classes - EXACT HEIGHT: 40px
  const baseClasses = `
    relative overflow-hidden
    inline-flex items-center justify-center
    h-10 min-w-[96px] px-4
    font-medium text-base
    rounded-[10px]
    transition-all duration-[250ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]
    will-change-transform
    focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    active:scale-[0.98]
  `.trim().replace(/\s+/g, ' ');

  // Variant styles - EXACT COLORS & HOVERS
  const variantClasses = {
    primary: `
      bg-primary text-text-inverse
      shadow-sm
      hover:bg-primary-hover hover:shadow-md hover:-translate-y-0.5
      active:shadow-inner
    `,
    secondary: `
      bg-bg-secondary text-text-primary
      border border-border-subtle
      hover:bg-hover-bg hover:shadow-sm hover:-translate-y-0.5
      active:bg-active-bg
    `,
    success: `
      bg-success text-text-inverse
      shadow-sm
      hover:bg-success-hover hover:shadow-md hover:-translate-y-0.5
      hover:shadow-glow-success
      active:shadow-inner
    `,
    danger: `
      bg-error text-text-inverse
      shadow-sm
      hover:bg-error-hover hover:shadow-md hover:-translate-y-0.5
      hover:shadow-glow-error
      active:shadow-inner
    `,
    warning: `
      bg-warning text-text-inverse
      shadow-sm
      hover:bg-warning-hover hover:shadow-md hover:-translate-y-0.5
      hover:shadow-glow-warning
      active:shadow-inner
    `,
    ghost: `
      bg-transparent text-text-primary
      hover:bg-hover-bg hover:-translate-y-0.5
      active:bg-active-bg
    `,
  };

  // Size variations - maintain 40px height, adjust padding
  const sizeClasses = {
    sm: 'h-8 min-w-[80px] px-3 text-sm',
    md: 'h-10 min-w-[96px] px-4 text-base', // DEFAULT - 40px height
    lg: 'h-12 min-w-[120px] px-6 text-lg',
  };

  // Mobile touch targets: 44px minimum
  const mobileClasses = 'sm:h-10 h-11';

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      ref={buttonRef}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${size === 'md' ? mobileClasses : ''}
        ${widthClass}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      onClick={handleClick}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {/* Loading Spinner */}
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}

      {/* Left Icon */}
      {leftIcon && !isLoading && (
        <span className="mr-2 -ml-1 inline-flex items-center w-5 h-5">
          {leftIcon}
        </span>
      )}

      {/* Button Text */}
      <span className="inline-flex items-center">
        {children}
      </span>

      {/* Right Icon */}
      {rightIcon && (
        <span className="ml-2 -mr-1 inline-flex items-center w-5 h-5">
          {rightIcon}
        </span>
      )}
    </button>
  );
};

export default Button;
