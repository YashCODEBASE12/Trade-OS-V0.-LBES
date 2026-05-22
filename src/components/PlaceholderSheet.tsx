import { AnimatePresence, motion } from 'framer-motion';
import { BellRing, BrainCircuit, Cloud, Shield, X } from 'lucide-react';
import { FormEvent, useState } from 'react';
import SettingsSheet from './SettingsSheet';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useAuthStore } from '../store/useAuthStore';

export default function PlaceholderSheet({
  kind,
  onClose,
  onOpenSignIn,
}: {
  kind: 'signin' | 'settings' | null;
  onClose: () => void;
  onOpenSignIn?: () => void;
}) {
  const { user, loading, authError, signIn, signUp, continueWithGoogle, signOut } = useAuthStore();
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleEmailAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (mode === 'signup') {
      await signUp(email, password);
    } else {
      await signIn(email, password);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {kind ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#0f172a]/24 px-4 pb-4 backdrop-blur-md"
          onClick={onClose}
        >
          {kind === 'settings' ? (
            <div className="relative h-full w-full max-w-[420px]" onClick={(event) => event.stopPropagation()}>
              <SettingsSheet onClose={onClose} onOpenSignIn={() => onOpenSignIn?.()} />
            </div>
          ) : (
            <motion.div
              initial={{ y: 48, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 36, opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              onClick={(event) => event.stopPropagation()}
              className="premium-card w-full max-w-[420px] rounded-[40px] p-6 shadow-[0_30px_80px_rgba(15,23,42,0.18)]"
            >
              <div className="mb-5 flex justify-center">
                <div className="h-1.5 w-14 rounded-full bg-white/70" />
              </div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="premium-orb relative h-14 w-14 rounded-full">
                      <div className="absolute inset-[18%] rounded-full bg-[radial-gradient(circle,#8fb8ff_0%,#4e86ff_55%,#245df3_100%)]" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Execution Identity</div>
                      <div className="text-sm text-text-secondary">Protect your data and unlock your AI trading profile.</div>
                    </div>
                  </div>
                  <h2 className="text-[28px] font-bold tracking-[-0.03em] text-text-primary">Create Execution Identity</h2>
                  <div className="mt-4 space-y-2 text-sm leading-6 text-text-secondary">
                    <div>Sync your profile</div>
                    <div>Save execution history</div>
                    <div>Restore progress</div>
                    <div>Personalize AI behavior</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/70 text-text-secondary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-6 space-y-3">
                <MiniPill icon={Cloud} label="Secure Cloud Backup" />
                <MiniPill icon={BrainCircuit} label="Personal AI Profile" />
                <MiniPill icon={BellRing} label="Execution Intelligence" />
              </div>
              {user ? (
                <div className="mt-6 space-y-3 rounded-[24px] border border-white/80 bg-white/58 p-4 text-center">
                  <div className="text-sm font-semibold text-text-primary">{user.email}</div>
                  <Button type="button" variant="outline" className="w-full" onClick={signOut}>
                    Logout
                  </Button>
                </div>
              ) : (
                <form className="mt-6 space-y-3" onSubmit={handleEmailAuth}>
                  <Input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="trader@example.com"
                    required
                  />
                  <Input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Password"
                    required
                    minLength={6}
                  />
                  {authError ? (
                    <div className="rounded-[18px] bg-[#fff1f0] px-4 py-3 text-sm font-semibold text-[#de5246]">
                      {authError}
                    </div>
                  ) : null}
                  <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
                    {mode === 'signup' ? 'Create Execution Identity' : 'Sign In'}
                  </Button>
                  <Button type="button" variant="outline" size="lg" className="w-full" onClick={continueWithGoogle} disabled={loading}>
                    Continue with Google
                  </Button>
                </form>
              )}
              {!user ? (
                <button type="button" onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')} className="mt-4 w-full text-center text-sm font-semibold text-primary">
                  {mode === 'signup' ? 'Already have account? Sign in' : 'New here? Create identity'}
                </button>
              ) : null}
              <p className="mt-4 text-center text-xs leading-5 text-text-muted">
                Your data stays encrypted and under your control.
              </p>
            </motion.div>
          )}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function MiniPill({ icon: Icon, label }: { icon: typeof Shield; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-[22px] border border-white/80 bg-white/55 px-4 py-4 shadow-[0_10px_24px_rgba(27,39,76,0.06)]">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="text-sm font-semibold text-text-secondary">{label}</div>
    </div>
  );
}
