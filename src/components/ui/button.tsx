'use client';

import * as React from 'react';
import { type VariantProps } from 'tailwind-variants';

import { cn } from '@/lib/utils';

import { buttonStyles } from './button.styles';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonStyles>;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = 'button', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonStyles({ variant, size }), className)}
        type={type}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';
