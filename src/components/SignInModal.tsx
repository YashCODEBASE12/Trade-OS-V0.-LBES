import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Modal } from './Modal';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SignInModal = ({ isOpen, onClose }: SignInModalProps) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { loading, authError, statusMessage, user, signIn, signUp, continueWithGoogle } = useAuthStore();

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (isSignUp) {
        await signUp(email, password);
        if (useAuthStore.getState().user) {
          onClose();
        }
        return;
      }

      await signIn(email, password);
      onClose();
    } catch {
      // authError is handled by the auth store
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

        {authError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {authError}
          </div>
        ) : null}

        {statusMessage ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            {statusMessage}
          </div>
        ) : null}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isSignUp ? 'Create account' : 'Sign in'}
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={continueWithGoogle}
          disabled={loading}
        >
          Continue with Google
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
