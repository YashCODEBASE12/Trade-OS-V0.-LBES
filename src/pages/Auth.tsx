import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Target, Loader2, ArrowLeft } from 'lucide-react';
import { syncService } from '../services/sync.service';
import { setUserId } from '../lib/storage';

export default function Auth() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
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
          }
        });
        if (error) throw error;
        if (data.user && !data.session) {
          setMessage('Check your email for the confirmation link.');
        } else {
          // Auto-login happened (if email confirmation is off)
          if (data.user) {
             setUserId(data.user.id);
             await syncService.migrateLocalData(data.user.id);
             // Force reload to apply user isolation
             window.location.href = '/';
          }
        }
      } else {
        const { error, data } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) {
          setUserId(data.user.id);
          // Trigger migration on login
          await syncService.migrateLocalData(data.user.id);
          // Force reload to apply user isolation
          window.location.href = '/';
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background transition-colors duration-300">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-accent/70 
                        flex items-center justify-center shadow-lg text-text-inverse mb-4">
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
          <CardHeader>
            <CardTitle className="text-center text-lg">
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </CardTitle>
          </CardHeader>
          <CardContent>
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

              {error && (
                <div className="p-3 text-sm text-loss bg-loss/10 rounded-md border border-loss/20">
                  {error}
                </div>
              )}

              {message && (
                <div className="p-3 text-sm text-profit bg-profit/10 rounded-md border border-profit/20">
                  {message}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {isSignUp ? 'Create Account' : 'Sign In'}
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
              
              <div className="pt-2 border-t border-border">
                <button
                  onClick={() => {
                    setUserId('guest');
                    window.location.href = '/';
                  }}
                  className="flex items-center justify-center w-full text-sm text-text-muted hover:text-text-primary transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Continue Offline
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
