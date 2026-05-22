import { create } from 'zustand';
import { PlaybookSetup } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface PlaybookStore {
  setups: PlaybookSetup[];
  addSetup: (setup: Omit<PlaybookSetup, 'id' | 'created_at' | 'times_used' | 'success_rate'>) => void;
  updateSetup: (id: string, updates: Partial<PlaybookSetup>) => void;
  deleteSetup: (id: string) => void;
  incrementUsage: (id: string, wasWin: boolean) => void;
}

export const usePlaybookStore = create<PlaybookStore>()(
    (set) => ({
      setups: [],
      addSetup: (setupData) => {
        const newSetup: PlaybookSetup = {
          id: uuidv4(),
          ...setupData,
          times_used: 0,
          success_rate: 0,
          created_at: new Date().toISOString(),
        };
        set((state) => ({ setups: [...state.setups, newSetup] }));
      },
      updateSetup: (id, updates) => {
        set((state) => ({
          setups: state.setups.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        }));
      },
      deleteSetup: (id) => {
        set((state) => ({
          setups: state.setups.filter((s) => s.id !== id),
        }));
      },
      incrementUsage: (id, wasWin) => {
        set((state) => ({
          setups: state.setups.map((s) => {
            if (s.id !== id) return s;
            const newTimesUsed = s.times_used + 1;
            const oldWins = (s.success_rate / 100) * s.times_used;
            const newWins = wasWin ? oldWins + 1 : oldWins;
            const newRate = (newWins / newTimesUsed) * 100;
            
            return {
              ...s,
              times_used: newTimesUsed,
              success_rate: newRate,
            };
          }),
        }));
      },
    })
);
