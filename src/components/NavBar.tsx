import { Settings2, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';

export default function NavBar({
  onOpenSignIn,
  onOpenSettings,
}: {
  onOpenSignIn: () => void;
  onOpenSettings: () => void;
}) {
  const { user, signOut } = useAuthStore();

  return (
    <header className="sticky top-0 z-30 px-5 pb-3 pt-5">
      <div className="glass-tint flex items-center justify-between rounded-[26px] border border-white/70 px-4 py-3 shadow-[0_14px_30px_rgba(27,39,76,0.08)]">
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
          <Zap className="h-4 w-4 fill-current" />
        </div>
        <span className="text-[18px] font-bold tracking-[-0.02em] text-text-primary">ReasonTrack</span>
      </div>

      <div className="flex items-center gap-2">
        <motion.button
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={user ? signOut : onOpenSignIn}
          className="rounded-full bg-white/60 px-4 py-2 text-sm font-semibold text-primary shadow-[0_8px_18px_rgba(27,39,76,0.06)]"
        >
          {user ? 'Logout' : 'Sign In'}
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={onOpenSettings}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/72 text-text-secondary shadow-[0_8px_20px_rgba(29,45,89,0.08)]"
        >
          <Settings2 className="h-4 w-4" />
        </motion.button>
      </div>
      </div>
    </header>
  );
}
