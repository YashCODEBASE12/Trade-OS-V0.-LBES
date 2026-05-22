import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Modal } from './Modal';
import { Loader2 } from 'lucide-react';
import { syncService } from '../services/sync.service';
import { setUserId } from '../lib/storage';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SignInModal = ({ isOpen, onClose }: SignInModalProps) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (error) throw error;
        if (data.user && !data.session) {
          setMessage('Check your email for the confirmation link.');
        } else if (data.user) {
          setUserId(data.user.id);
          await syncService.migrateLocalData(data.user.id);
          window.location.href = '/';
        }
      } else {
        const { error, data } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) {
          setUserId(data.user.id);
          await syncService.migrateLocalData(data.user.id);
          window.location.href = '/';
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} title={isSignUp ? 'Create account' : 'Sign in'} onClose={onClose}>
      <form onSubmit={handleAuth} className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-widest text-text-muted">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="trader@example.com"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-widest text-text-muted">Password</label>
          <Input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            {message}
          </div>
        ) : null}

        <Button type="submit" className="w-full">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isSignUp ? 'Create account' : 'Sign in'}
        </Button>

        <div className="border-t border-border pt-4 text-center text-sm text-text-muted">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="font-semibold text-accent underline-offset-2 hover:underline"
          >
            {isSignUp ? 'Already have an account? Sign in' : 'New to ReasonTrack? Create account'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
