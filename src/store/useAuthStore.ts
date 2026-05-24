import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import {
  getSession,
  onAuthStateChange,
  signInWithEmail,
  signInWithGoogle,
  signOut as supabaseSignOut,
  signUpWithEmail,
} from '../services/supabase';
import { ensureProfile } from '../services/profileService';

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  authError: string | null;
  statusMessage: string | null;
  initialize: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  continueWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  loading: true,
  authError: null,
  statusMessage: null,

  initialize: async () => {
    try {
      const { data: { session } } = await getSession();
      if (session?.user) await ensureProfile(session.user);
      set({ session, user: session?.user ?? null, loading: false, authError: null, statusMessage: null });

      onAuthStateChange(async (session) => {
        if (session?.user) await ensureProfile(session.user);
        set({ session, user: session?.user ?? null, loading: false, authError: null, statusMessage: null });
      });
    } catch (error) {
      console.error('Auth initialization failed:', error);
      set({ loading: false, authError: getErrorMessage(error), statusMessage: null });
    }
  },

  signUp: async (email, password) => {
    set({ loading: true, authError: null, statusMessage: null });
    const { data, error } = await signUpWithEmail(email, password);
    if (error) {
      set({ loading: false, authError: error.message, statusMessage: null });
      throw error;
    }

    if (data.user && !data.session) {
      set({ session: null, user: null, loading: false, authError: null, statusMessage: 'Check your email for the confirmation link.' });
      return;
    }

    if (data.user) {
      await ensureProfile(data.user);
    }

    set({ session: data.session, user: data.user, loading: false, authError: null, statusMessage: null });
  },

  signIn: async (email, password) => {
    set({ loading: true, authError: null, statusMessage: null });
    const { data, error } = await signInWithEmail(email, password);
    if (error) {
      set({ loading: false, authError: error.message, statusMessage: null });
      throw error;
    }
    if (data.user) await ensureProfile(data.user);
    set({ session: data.session, user: data.user, loading: false, authError: null, statusMessage: null });
  },

  continueWithGoogle: async () => {
    set({ loading: true, authError: null, statusMessage: null });
    const { data, error } = await signInWithGoogle();
    if (error) {
      set({ loading: false, authError: error.message, statusMessage: null });
      throw error;
    }
    if (data?.url) {
      window.location.href = data.url;
      return;
    }
    set({ loading: false, authError: 'Unable to start Google sign-in.', statusMessage: null });
    throw new Error('Unable to start Google sign-in.');
  },

  signOut: async () => {
    set({ loading: true, authError: null, statusMessage: null });
    const { error } = await supabaseSignOut();
    if (error) {
      set({ loading: false, authError: error.message, statusMessage: null });
      throw error;
    }
    set({ session: null, user: null, loading: false, authError: null, statusMessage: null });
    if (typeof window !== 'undefined') {
      window.location.href = '/auth';
    }
  },
}));

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Authentication failed';
}
