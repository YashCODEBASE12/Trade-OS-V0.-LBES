import * as React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      'flex h-12 w-full rounded-[20px] border border-white/70 bg-[rgba(255,255,255,0.72)] px-4 py-3 text-sm font-medium text-text-primary outline-none backdrop-blur-xl transition duration-300 placeholder:text-text-muted focus:border-primary focus:ring-4 focus:ring-[#2563eb]/10',
      className,
    )}
    {...props}
  />
));

Input.displayName = 'Input';

export { Input };
