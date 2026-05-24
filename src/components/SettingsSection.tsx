import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from './ui/Card';
import { cn } from '../lib/utils';

interface SettingsSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({ 
  title, 
  icon, 
  children, 
  defaultOpen = false 
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card className="overflow-hidden border-border bg-surface shadow-sm transition-all duration-300">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-background/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-background text-accent border border-border">
            {icon}
          </div>
          <span className="font-semibold text-text-primary">{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-text-muted" />
        ) : (
          <ChevronDown className="h-5 w-5 text-text-muted" />
        )}
      </button>
      
      <div className={cn(
        "transition-all duration-300 ease-in-out overflow-hidden",
        isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="p-4 pt-0 border-t border-border/50">
          <div className="pt-4 space-y-4">
            {children}
          </div>
        </div>
      </div>
    </Card>
  );
};
