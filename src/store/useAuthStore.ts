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

  initialize: async () => {
    try {
      const { data: { session } } = await getSession();
      if (session?.user) await ensureProfile(session.user);
      set({ session, user: session?.user ?? null, loading: false, authError: null });

      onAuthStateChange(async (session) => {
        if (session?.user) await ensureProfile(session.user);
        set({ session, user: session?.user ?? null, loading: false, authError: null });
      });
    } catch (error) {
      console.error('Auth initialization failed:', error);
      set({ loading: false, authError: getErrorMessage(error) });
    }
  },

  signUp: async (email, password) => {
    set({ loading: true, authError: null });
    const { data, error } = await signUpWithEmail(email, password);
    if (error) {
      set({ loading: false, authError: error.message });
      throw error;
    }
    if (data.user) await ensureProfile(data.user);
    set({ session: data.session, user: data.user, loading: false, authError: null });
  },

  signIn: async (email, password) => {
    set({ loading: true, authError: null });
    const { data, error } = await signInWithEmail(email, password);
    if (error) {
      set({ loading: false, authError: error.message });
      throw error;
    }
    if (data.user) await ensureProfile(data.user);
    set({ session: data.session, user: data.user, loading: false, authError: null });
  },

  continueWithGoogle: async () => {
    set({ loading: true, authError: null });
    const { error } = await signInWithGoogle();
    if (error) {
      set({ loading: false, authError: error.message });
      throw error;
    }
  },

  signOut: async () => {
    await supabaseSignOut();
    set({ session: null, user: null, loading: false, authError: null });
  },
}));

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Authentication failed';
}
