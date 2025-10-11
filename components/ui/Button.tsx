import React, { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

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
    variant = 'default',
    size = 'md',
    leftIcon,
    rightIcon,
    as = 'button',
    ...props
}) => {
    const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

    const variantClasses: Record<ButtonVariant, string> = {
        default: 'bg-primary text-white hover:bg-primary/90',
        destructive: 'bg-error text-white hover:bg-error/90',
        outline: 'border border-border-subtle bg-transparent hover:bg-hover-bg hover:text-text-primary',
        secondary: 'bg-hover-bg text-text-primary hover:bg-hover-bg/80',
        ghost: 'hover:bg-hover-bg hover:text-text-primary',
        link: 'text-primary underline-offset-4 hover:underline',
        success: 'bg-success text-white hover:bg-success/90',
    };

    const sizeClasses: Record<ButtonSize, string> = {
        sm: 'h-9 rounded-md px-3',
        md: 'h-10 px-4 py-2',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
    };

    const iconSpacingClasses = {
        sm: 'mr-1.5',
        md: 'mr-2',
        lg: 'mr-2',
        icon: '',
    };
    
    const Component = as;

    return (
        <Component
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
            {...(props as any)}
        >
            {leftIcon && <span className={size !== 'icon' ? iconSpacingClasses[size] : ''}>{leftIcon}</span>}
            {children}
            {rightIcon && <span className={size !== 'icon' ? "ml-2" : ''}>{rightIcon}</span>}
        </Component>
    );
};

export default Button;