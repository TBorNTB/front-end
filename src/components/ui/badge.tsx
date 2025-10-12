'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning';
  size?: 'sm' | 'default' | 'lg';
  children: React.ReactNode;
}

const badgeVariants = {
  default: 'bg-primary-500 text-white border-primary-500',
  secondary: 'bg-secondary-100 text-secondary-700 border-secondary-300',
  outline: 'text-primary-700 border-primary-300 bg-transparent',
  destructive: 'bg-red-500 text-white border-red-500',
  success: 'bg-green-500 text-white border-green-500',
  warning: 'bg-yellow-500 text-white border-yellow-500',
};

const badgeSizes = {
  sm: 'px-2 py-0.5 text-xs',
  default: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'default', children, ...props }, ref) => {
    // Hide badge if content is 0 or empty
    if (children === 0 || children === '0' || children === '' || children == null) {
      return null;
    }

    return (
      <span
        ref={ref}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center font-medium rounded-full border transition-all duration-200',
          // Variant styles
          badgeVariants[variant],
          // Size styles
          badgeSizes[size],
          // Icon sizing (if badge contains icons)
          '[&>svg]:size-3',
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';