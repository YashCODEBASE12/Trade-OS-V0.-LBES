import { create } from 'zustand';
import { saveAnalysis } from '../services/analysisService';
import {
  closeTrade as closeRemoteTrade,
  createTradeFromSignal,
  deleteAllTrades,
  deleteTrade as deleteRemoteTrade,
  fetchTrades,
} from '../services/tradeService';
import { saveWeeklyReview } from '../services/reviewService';
import { ActivityTrade, GeneratedSignal, TradeOutcome } from '../types/reasontrack';

interface ReasonTrackState {
  defaultCapital: number;
  trades: ActivityTrade[];
  userId: string | null;
  loading: boolean;
  error: string | null;
  setDefaultCapital: (capital: number) => void;
  loadTrades: (userId: string) => Promise<void>;
  addTradeFromSignal: (signal: GeneratedSignal) => Promise<void>;
  closeTrade: (id: string, outcome: TradeOutcome, resultR: number) => Promise<void>;
  deleteTrade: (id: string) => Promise<void>;
  importTrades: (trades: ActivityTrade[]) => void;
  clearAllTrades: () => Promise<void>;
  reset: () => void;
}

export const useReasonTrackStore = create<ReasonTrackState>((set, get) => ({
  defaultCapital: 2500,
  trades: [],
  userId: null,
  loading: false,
  error: null,

  setDefaultCapital: (capital) => set({ defaultCapital: capital }),

  loadTrades: async (userId) => {
    set({ loading: true, error: null, userId });
    try {
      const trades = await fetchTrades(userId);
      set({ trades, loading: false });
    } catch (error) {
      set({ loading: false, error: getErrorMessage(error) });
    }
  },

  addTradeFromSignal: async (signal) => {
    const userId = get().userId;
    if (!userId) {
      set({ error: 'Sign in to save trades to Supabase.' });
      return;
    }

    set({ loading: true, error: null });
    try {
      const trade = await createTradeFromSignal(userId, signal);
      await saveAnalysis(userId, signal, trade.id);
      set((state) => ({ trades: [trade, ...state.trades], loading: false }));
    } catch (error) {
      set({ loading: false, error: getErrorMessage(error) });
    }
  },

  closeTrade: async (id, outcome, resultR) => {
    const userId = get().userId;
    if (!userId) return;

    const previousTrades = get().trades;
    set((state) => ({
      trades: state.trades.map((trade) =>
        trade.id === id
          ? {
              ...trade,
              status: outcome === 'Win' ? 'win' : outcome === 'Loss' ? 'loss' : 'breakeven',
              closeOutcome: outcome,
              resultR,
              closedAt: new Date().toISOString(),
              reviewed: true,
            }
          : trade,
      ),
      error: null,
    }));

    try {
      const updatedTrade = await closeRemoteTrade(id, outcome, resultR);
      const nextTrades = get().trades.map((trade) =>
        trade.id === id ? { ...trade, ...updatedTrade } : trade,
      );
      set({ trades: nextTrades });
      await saveWeeklyReview(userId, nextTrades);
    } catch (error) {
      set({ trades: previousTrades, error: getErrorMessage(error) });
    }
  },

  deleteTrade: async (id) => {
    const previousTrades = get().trades;
    set((state) => ({ trades: state.trades.filter((trade) => trade.id !== id), error: null }));
    try {
      await deleteRemoteTrade(id);
    } catch (error) {
      set({ trades: previousTrades, error: getErrorMessage(error) });
    }
  },

  importTrades: (trades) => set({ trades }),

  clearAllTrades: async () => {
    const userId = get().userId;
    const previousTrades = get().trades;
    set({ trades: [], error: null });
    if (!userId) return;
    try {
      await deleteAllTrades(userId);
    } catch (error) {
      set({ trades: previousTrades, error: getErrorMessage(error) });
    }
  },

  reset: () => set({ trades: [], userId: null, loading: false, error: null }),
}));

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Supabase trade sync failed';
}
