import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={cn(
        'h-12 w-full appearance-none rounded-[20px] border border-white/70 bg-[rgba(255,255,255,0.72)] px-4 pr-10 text-sm font-medium text-text-primary outline-none backdrop-blur-xl transition duration-300 focus:border-primary focus:ring-4 focus:ring-[#2563eb]/10',
        className,
      )}
      {...props}
    >
      {children}
    </select>
    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
  </div>
));

Select.displayName = 'Select';

export { Select };
