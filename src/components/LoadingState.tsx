import { motion } from 'framer-motion';

export function LoadingState({ label = 'Loading', compact = false }: { label?: string; compact?: boolean }) {
  return (
    <div className={`flex items-center gap-3 ${compact ? 'py-2' : 'rounded-[24px] border border-white/70 bg-white/60 px-4 py-4 shadow-[0_12px_24px_rgba(27,39,76,0.06)]'}`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        className="h-4 w-4 rounded-full border-2 border-primary/30 border-t-primary"
      />
      <span className="text-sm font-semibold text-text-secondary">{label}</span>
    </div>
  );
}
