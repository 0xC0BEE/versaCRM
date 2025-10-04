import React, { ReactNode } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    leftIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', leftIcon, className = '', ...props }) => {
    const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-button focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue/50 transition-all duration-200 ease-in-out transform hover:scale-[1.03] active:scale-[0.98] ripple';

    const variantClasses = {
        primary: 'bg-gradient-to-r from-accent-blue to-blue-400 text-white shadow-md hover:shadow-lg active:shadow-inner',
        secondary: 'bg-slate-200 text-slate-700 border border-transparent hover:bg-slate-300 dark:bg-dark-card dark:text-dark-text dark:hover:bg-slate-600',
        danger: 'bg-red-500 text-white shadow-md hover:bg-red-600 hover:shadow-lg active:shadow-inner',
    };

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
    };

    const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
        const button = event.currentTarget;
        const circle = document.createElement("span");
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;

        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
        circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
        circle.classList.add("ripple-effect");

        const ripple = button.getElementsByClassName("ripple-effect")[0];
        if (ripple) {
            ripple.remove();
        }
        button.appendChild(circle);
    };

    return (
        <button
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
            onMouseDown={createRipple}
            {...props}
        >
            {leftIcon && <span className="mr-2 -ml-1">{leftIcon}</span>}
            {children}
        </button>
    );
};

export default Button;