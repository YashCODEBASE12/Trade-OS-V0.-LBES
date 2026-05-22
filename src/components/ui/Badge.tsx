import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva('inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold', {
  variants: {
    variant: {
      default: 'bg-primary-soft text-primary',
      buy: 'bg-[#ecfdf3] text-[#1f9d55]',
      sell: 'bg-[#fff1f0] text-[#de5246]',
      open: 'bg-[#eef4ff] text-[#2563eb]',
      win: 'bg-[#ecfdf3] text-[#1f9d55]',
      loss: 'bg-[#fff1f0] text-[#de5246]',
      breakeven: 'bg-[#fff8e8] text-[#b7791f]',
      muted: 'bg-subtle text-text-secondary',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
