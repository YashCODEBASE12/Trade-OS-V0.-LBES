import { AnimatePresence, motion } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import BottomNav from './BottomNav';
import NavBar from './NavBar';
import PlaceholderSheet from './PlaceholderSheet';
import { useAuthStore } from '../store/useAuthStore';
import { useReasonTrackStore } from '../store/useReasonTrackStore';
import { useSettingsStore } from '../store/useSettingsStore';

export default function AppShell() {
  const location = useLocation();
  const [sheet, setSheet] = useState<'signin' | 'settings' | null>(null);
  const isExecutionScreen = location.pathname === '/' || location.pathname === '/ai-trades';
  const { initialize, user } = useAuthStore();
  const { loadTrades } = useReasonTrackStore();
  const { loadProfile } = useSettingsStore();

  useEffect(() => {
    const handleOpenSettings = () => setSheet('settings');
    window.addEventListener('open-settings-sheet', handleOpenSettings);
    return () => window.removeEventListener('open-settings-sheet', handleOpenSettings);
  }, []);

  useEffect(() => {
    if (user) {
      loadProfile(user.id);
      loadTrades(user.id);
    } else {
      // Load guest trades
      loadTrades(null);
    }
  }, [loadProfile, loadTrades, user]);

  return (
    <div className="min-h-screen bg-background px-4 py-0 text-text-primary">
      <div className="phone-shell noise-overlay mx-auto min-h-screen max-w-[420px] overflow-hidden rounded-[40px] bg-background">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,_rgba(96,151,255,0.22),_transparent_65%)]" />
        {!isExecutionScreen ? <NavBar onOpenSignIn={() => setSheet('signin')} onOpenSettings={() => setSheet('settings')} /> : null}
        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className={`relative px-5 pb-40 ${isExecutionScreen ? 'pt-5' : ''}`}
          >
            <Outlet />
          </motion.main>
        </AnimatePresence>
        <BottomNav />
      </div>
      <PlaceholderSheet
        kind={sheet}
        onClose={() => setSheet(null)}
        onOpenSignIn={() => setSheet('signin')}
      />
    </div>
  );
}
