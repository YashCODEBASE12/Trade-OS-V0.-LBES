import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center px-6 py-12 text-center ${className}`}
    >
      {icon ? <div className="mb-4 text-4xl opacity-70">{icon}</div> : null}

      <h3 className="mb-2 text-xl font-semibold tracking-tight text-white">{title}</h3>
      <p className="mb-6 max-w-xs text-sm leading-6 text-zinc-400">{description}</p>

      {action ? <div>{action}</div> : null}
    </motion.div>
  );
}
