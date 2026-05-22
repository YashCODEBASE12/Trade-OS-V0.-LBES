import { create } from 'zustand';
import {
  defaultTraderProfile,
  fetchProfile,
  saveProfile,
  TraderProfile,
} from '../services/profileService';

interface AutomationSettings {
  autoRR: boolean;
  autoRRRatio: number;
  emotionalTracking: boolean;
  patternDetection: boolean;
  showRiskWarning: boolean;
}

interface DisplaySettings {
  chartDensity: 'Compact' | 'Normal' | 'Detailed';
  showEquityCurve: boolean;
  animations: boolean;
}

interface SettingsStore {
  profile: TraderProfile;
  automation: AutomationSettings;
  display: DisplaySettings;
  loading: boolean;
  error: string | null;
  userId: string | null;
  loadProfile: (userId: string) => Promise<void>;
  updateProfile: (updates: Partial<TraderProfile>) => Promise<void>;
  updateAutomation: (updates: Partial<AutomationSettings>) => void;
  updateDisplay: (updates: Partial<DisplaySettings>) => void;
  resetSettings: () => void;
}

const defaultSettings = {
  profile: defaultTraderProfile,
  automation: {
    autoRR: true,
    autoRRRatio: 2.0,
    emotionalTracking: true,
    patternDetection: false,
    showRiskWarning: true,
  },
  display: {
    chartDensity: 'Normal' as const,
    showEquityCurve: true,
    animations: true,
  },
};

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  ...defaultSettings,
  loading: false,
  error: null,
  userId: null,

  loadProfile: async (userId) => {
    set({ loading: true, error: null, userId });
    try {
      const profile = await fetchProfile(userId);
      set({ profile, loading: false });
    } catch (error) {
      set({ loading: false, error: getErrorMessage(error) });
    }
  },

  updateProfile: async (updates) => {
    const previous = get().profile;
    const nextProfile = { ...previous, ...updates };
    set({ profile: nextProfile, error: null });

    const userId = get().userId;
    if (!userId) return;

    try {
      const savedProfile = await saveProfile(userId, updates);
      set({ profile: savedProfile });
    } catch (error) {
      set({ profile: previous, error: getErrorMessage(error) });
    }
  },

  updateAutomation: (updates) =>
    set((state) => ({ automation: { ...state.automation, ...updates } })),

  updateDisplay: (updates) =>
    set((state) => ({ display: { ...state.display, ...updates } })),

  resetSettings: () => set({ ...defaultSettings, error: null }),
}));

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Profile sync failed';
}
