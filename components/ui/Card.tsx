/**
 * Card Component - Clay-Elevated Harmony UI
 *
 * STRICT SPECIFICATIONS:
 * - Padding: 1.25rem (20px)
 * - Min-height: 120px
 * - Border radius: 16px (var(--radius-lg))
 * - Background: var(--card-bg)
 * - Border: 1px var(--border-subtle)
 * - Hover: translateY(-2px) + shadow-md (for interactive cards)
 * - Shadow: sm default, md on hover
 */

import React, { ReactNode } from 'react';

export interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  onClick?: () => void;
  interactive?: boolean;
  variant?: 'default' | 'glass' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  onClick,
  interactive = false,
  variant = 'default',
  padding = 'md',
}) => {
  const isClickable = !!onClick || interactive;

  // Padding specifications - EXACT SIZES
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-4',        // 16px
    md: 'p-5',        // 20px - DEFAULT (1.25rem)
    lg: 'p-6',        // 24px
  };

  // Variant styles
  const variantClasses = {
    default: `
      bg-card-bg
      border border-border-subtle
      shadow-sm
    `,
    glass: `
      glass
      shadow-md
    `,
    outlined: `
      bg-transparent
      border-2 border-border-medium
    `,
  };

  // Interactive hover effects
  const interactiveClasses = isClickable
    ? 'cursor-pointer card-hover'
    : '';

  // Base classes - EXACT SPECS
  const baseClasses = `
    min-h-[120px]
    rounded-[16px]
    transition-all
    duration-[250ms]
    ease-[cubic-bezier(0.34,1.56,0.64,1)]
  `.trim().replace(/\s+/g, ' ');

  return (
    <div
      onClick={onClick}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${interactiveClasses}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
    >
      {/* Card Header */}
      {(title || subtitle) && (
        <div className="px-5 pt-5 pb-4 border-b border-border-subtle">
          {title && (
            <h3 className="text-lg font-semibold text-text-primary leading-6">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-text-secondary">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Card Content */}
      <div className={paddingClasses[padding]}>
        {children}
      </div>
    </div>
  );
};

export default Card;
