import React, { ReactNode } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
    size?: 'sm' | 'md' | 'lg';
    leftIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', leftIcon, className = '', ...props }) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-button focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 dark:focus:ring-offset-bg-primary transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-md-new active:scale-[0.98] active:shadow-inner ripple';

    const variantClasses = {
        primary: 'bg-primary text-white hover:bg-primary-hover active:bg-primary-active',
        secondary: 'bg-card-bg text-text-primary border border-border-subtle hover:bg-hover-bg',
        success: 'bg-success text-white hover:bg-success-hover',
        danger: 'bg-error text-white hover:bg-error-hover',
        warning: 'bg-warning text-text-primary hover:bg-warning-hover',
    };

    const sizeClasses = {
        sm: 'h-8 px-3 text-sm min-w-[80px] rounded-[8px]',
        md: 'h-10 px-4 text-sm min-w-[96px]', // 40px height
        lg: 'h-11 px-6 text-lg min-w-[112px]', // Mobile target size
    };
    
    // For mobile, ensure the main button size has a larger touch target
    const finalSizeClasses = size === 'md' ? `${sizeClasses.md} md:h-10 lg:h-10 sm:h-11` : sizeClasses[size];

    return (
        <button
            className={`${baseClasses} ${variantClasses[variant]} ${finalSizeClasses} ${className}`}
            {...props}
        >
            {leftIcon && <span className="mr-2 -ml-1">{leftIcon}</span>}
            {children}
        </button>
    );
};

export default Button;
