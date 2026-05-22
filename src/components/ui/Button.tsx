import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]',
  {
    variants: {
      variant: {
        default: 'bg-text-primary text-white shadow-[0_12px_24px_rgba(18,24,38,0.14)]',
        primary: 'bg-gradient-to-b from-[#3e82ff] to-[#1f5fff] text-white shadow-[0_16px_28px_rgba(37,99,235,0.28)]',
        success: 'bg-[#34c759] text-white shadow-[0_12px_24px_rgba(52,199,89,0.26)]',
        outline: 'border border-border bg-white text-text-primary shadow-[0_8px_20px_rgba(27,39,76,0.06)]',
        ghost: 'bg-transparent text-text-secondary',
        destructive: 'bg-[#fff1f0] text-[#de5246]',
      },
      size: {
        default: 'h-12 px-5',
        sm: 'h-10 px-4 text-sm',
        lg: 'h-14 px-6 text-base',
        icon: 'h-10 w-10 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />
  ),
);

Button.displayName = 'Button';

export { Button, buttonVariants };
