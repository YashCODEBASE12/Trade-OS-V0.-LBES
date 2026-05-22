import { create } from 'zustand';
import { Trade } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { getWeekNumber } from '../utils/calculations';

interface TradeStore {
  trades: Trade[];
  addTrade: (trade: Omit<Trade, 'id' | 'created_at' | 'updated_at' | 'week_number'>) => void;
  updateTrade: (id: string, updates: Partial<Trade>) => void;
  deleteTrade: (id: string) => void;
  closeTrade: (id: string, exitPrice: number, resultR: number, notes?: string) => void;
  importTrades: (trades: Trade[]) => void;
  clearAllTrades: () => void;
}

export const useTradesStore = create<TradeStore>()(
    (set) => ({
      trades: [],
      addTrade: (tradeData) => {
        const newTrade: Trade = {
          id: uuidv4(),
          ...tradeData,
          week_number: getWeekNumber(new Date(tradeData.date)),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        set((state) => ({ trades: [newTrade, ...state.trades] }));
      },
      updateTrade: (id, updates) => {
        set((state) => ({
          trades: state.trades.map((t) =>
            t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t
          ),
        }));
      },
      deleteTrade: (id) => {
        set((state) => ({
          trades: state.trades.filter((t) => t.id !== id),
        }));
      },
      closeTrade: (id, exitPrice, resultR, notes) => {
        set((state) => ({
          trades: state.trades.map((t) => {
            if (t.id !== id) return t;
            
            let outcome: Trade['outcome'] = 'break-even';
            if (resultR > 0.1) outcome = 'win';
            else if (resultR < -0.1) outcome = 'loss';
            
            return {
              ...t,
              result_r: resultR,
              outcome,
              notes: notes ? (t.notes ? `${t.notes}\n\nClosing Notes: ${notes}` : notes) : t.notes,
              updated_at: new Date().toISOString(),
            };
          }),
        }));
      },
      importTrades: (newTrades) => {
        set((state) => ({ trades: [...state.trades, ...newTrades] }));
      },
      clearAllTrades: () => set({ trades: [] }),
    })
);
