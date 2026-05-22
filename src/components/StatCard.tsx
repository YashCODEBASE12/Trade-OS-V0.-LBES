import React, { ReactNode } from 'react';
import { cn } from '../lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  icon: ReactNode;
  color: 'green' | 'red' | 'blue' | 'gray';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, color, className }) => {
  const getColorClasses = (c: string) => {
    switch (c) {
      case 'green': return 'text-trading-profit';
      case 'red': return 'text-trading-loss';
      case 'blue': return 'text-accent';
      default: return 'text-text-muted';
    }
  };

  return (
    <div className={cn("bg-surface border border-border rounded-xl p-4 shadow-sm", className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-text-secondary">{title}</span>
        <div className={cn("p-2 rounded-lg bg-background", getColorClasses(color))}>
          {icon}
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-text-primary">{value}</span>
        {change && (
          <span className={cn("text-xs font-medium", 
            change.includes('+') ? "text-trading-profit" : 
            change.includes('-') ? "text-trading-loss" : "text-text-muted"
          )}>
            {change}
          </span>
        )}
      </div>
    </div>
  );
};
