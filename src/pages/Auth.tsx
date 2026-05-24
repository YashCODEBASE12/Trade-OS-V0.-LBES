import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { Target, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function Auth() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { loading, authError, statusMessage, user, signIn, signUp, continueWithGoogle } = useAuthStore();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
      const { session, statusMessage } = useAuthStore.getState();
      if (session?.user && !statusMessage) {
        navigate('/');
      }
    } catch {
      // auth store handles errors and state
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background transition-colors duration-300">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center shadow-lg text-text-inverse mb-4">
            <Target className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-text-secondary">
            {isSignUp ? 'Start your journey to disciplined trading' : 'Sign in to sync your trading journal'}
          </p>
        </div>

        <Card className="border-border shadow-lg">
          <CardContent>
            <div className="text-center text-lg font-semibold mb-4">
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </div>
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">Email</label>
                <Input
                  type="email"
                  placeholder="trader@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-background"
                />
              </div>

              {authError && (
                <div className="p-3 text-sm text-loss bg-loss/10 rounded-md border border-loss/20">
                  {authError}
                </div>
              )}

              {statusMessage && (
                <div className="p-3 text-sm text-profit bg-profit/10 rounded-md border border-profit/20">
                  {statusMessage}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {isSignUp ? 'Create Account' : 'Sign In'}
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
            </form>

            <div className="mt-6 text-center space-y-4">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-accent hover:underline"
              >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
