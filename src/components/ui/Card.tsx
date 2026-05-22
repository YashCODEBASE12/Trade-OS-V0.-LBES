import * as React from 'react';
import { cn } from '../../lib/utils';

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('premium-card rounded-[30px] text-text-primary transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_60px_rgba(27,39,76,0.14)]', className)}
    {...props}
  />
));

Card.displayName = 'Card';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-5', className)} {...props} />
));

CardContent.displayName = 'CardContent';

export { Card, CardContent };
