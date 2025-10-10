
import React, { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    as?: 'button' | 'label';
}

const Button: React.FC<ButtonProps> = ({
    children,
    className = '',
    variant = 'primary',
    size = 'md',
    leftIcon,
    rightIcon,
    as = 'button',
    ...props
}) => {
    const baseClasses = "inline-flex items-center justify-center font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200";

    const variantClasses: Record<ButtonVariant, string> = {
        primary: 'bg-primary text-white hover:bg-primary-hover active:bg-primary-active border border-transparent',
        secondary: 'bg-card-bg text-text-primary hover:bg-hover-bg border border-border-subtle',
        danger: 'bg-error text-white hover:bg-red-700 active:bg-red-800 border border-transparent',
        success: 'bg-success text-white hover:bg-green-700 active:bg-green-800 border border-transparent',
    };

    const sizeClasses: Record<ButtonSize, string> = {
        sm: 'px-3 h-8 text-sm rounded-[8px] min-w-[80px]',
        md: 'px-4 h-10 text-sm rounded-button min-w-[96px]',
        lg: 'px-6 h-11 text-base rounded-button min-w-[112px]',
    };

    const iconSpacingClasses = {
        sm: 'mr-1.5',
        md: 'mr-2',
        lg: 'mr-2',
    };
    
    const Component = as;

    return (
        <Component
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
            // FIX: Cast props to `any` to resolve type conflict when `as="label"`.
            {...(props as any)}
        >
            {leftIcon && <span className={iconSpacingClasses[size]}>{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-2">{rightIcon}</span>}
        </Component>
    );
};

export default Button;