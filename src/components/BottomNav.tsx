import { BarChart3, FlaskConical, Plus, Zap } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

const navItems = [
  { to: '/performance', label: 'Performance', icon: BarChart3 },
  { to: '/activity', label: 'Activity', icon: Zap },
  { to: '/labs', label: 'Labs', icon: FlaskConical },
];

export default function BottomNav() {
  return (
    <motion.nav
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      className="glass-tint fixed inset-x-0 bottom-3 z-40 mx-auto flex w-[calc(100%-24px)] max-w-[396px] items-end justify-between rounded-[30px] border border-white/80 px-6 pb-[calc(16px+env(safe-area-inset-bottom))] pt-4 shadow-[0_18px_40px_rgba(28,45,89,0.14)]"
    >
      <div className="flex min-w-0 flex-1 items-center justify-start gap-4">
        <BottomLink to={navItems[0].to} label={navItems[0].label} icon={navItems[0].icon} />
      </div>

      <NavLink to="/ai-trades" className="relative -mt-[18px] shrink-0">
        {({ isActive }) => (
          <motion.div
            animate={{
              boxShadow: [
                '0 18px 36px rgba(37,99,235,0.22), 0 0 0 rgba(59,130,246,0.16)',
                '0 22px 44px rgba(37,99,235,0.34), 0 0 24px rgba(59,130,246,0.24)',
                '0 18px 36px rgba(37,99,235,0.22), 0 0 0 rgba(59,130,246,0.16)',
              ],
              scale: [1, 1.04, 1],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            whileTap={{ scale: 0.94 }}
            className={cn(
              'flex h-[74px] w-[74px] items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_30%,#60a5fa_0%,#3b82f6_38%,#2563eb_100%)] text-white',
              isActive && 'ring-4 ring-white/80',
            )}
          >
            <span className="absolute inset-0 rounded-full bg-[#63a1ff]/30 blur-xl" />
            <span className="absolute -inset-2 rounded-full bg-[#60a5fa]/18 blur-2xl" />
            <Plus className="h-8 w-8" />
          </motion.div>
        )}
      </NavLink>

      <div className="flex min-w-0 flex-1 items-center justify-end gap-4">
        <BottomLink to={navItems[1].to} label={navItems[1].label} icon={navItems[1].icon} />
        <BottomLink to={navItems[2].to} label={navItems[2].label} icon={navItems[2].icon} />
      </div>
    </motion.nav>
  );
}

function BottomLink({ to, label, icon: Icon }: { to: string; label: string; icon: typeof Zap }) {
  return (
    <NavLink to={to} className="min-w-0">
      {({ isActive }) => (
        <motion.div
          whileTap={{ scale: 0.97 }}
          className={cn(
            'flex min-w-[64px] flex-col items-center gap-1 rounded-[18px] px-2 py-1 text-[11px] font-semibold transition-all duration-300',
            isActive ? 'bg-white/65 text-primary shadow-[0_10px_20px_rgba(37,99,235,0.10)]' : 'text-text-muted',
          )}
        >
          <Icon className="h-5 w-5" />
          <span>{label}</span>
        </motion.div>
      )}
    </NavLink>
  );
}
