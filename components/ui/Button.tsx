import React, { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    as?: 'button' | 'label';
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    leftIcon,
    rightIcon,
    className = '',
    as = 'button',
    ...props
}) => {
    const baseClasses = 'inline-flex items-center justify-center font-semibold border border-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200';

    const variantClasses = {
        primary: 'bg-primary text-white hover:bg-primary-hover active:bg-primary-active',
        secondary: 'bg-card-bg text-text-primary border-border-subtle hover:bg-hover-bg hover:border-border-subtle-2',
        danger: 'bg-error/10 text-error border-error/20 hover:bg-error/20',
        success: 'bg-success/10 text-success border-success/20 hover:bg-success/20',
    };

    const sizeClasses = {
        sm: 'h-8 px-3 text-sm rounded-[8px] min-w-[80px]',
        md: 'h-10 px-4 text-sm rounded-button min-w-[96px]',
        lg: 'h-11 px-5 text-base rounded-button min-w-[112px]',
    };

    const iconSizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-5 h-5',
    };

    const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

    const iconMargin = children ? (size === 'sm' ? 'mr-1.5' : 'mr-2') : '';
    const rightIconMargin = children ? (size === 'sm' ? 'ml-1.5' : 'ml-2') : '';

    const Component = as;

    return (
        <Component className={combinedClasses} {...props}>
            {leftIcon && <span className={`${iconMargin} ${iconSizeClasses[size]}`}>{leftIcon}</span>}
            {children}
            {rightIcon && <span className={`${rightIconMargin} ${iconSizeClasses[size]}`}>{rightIcon}</span>}
        </Component>
    );
};

export default Button;
