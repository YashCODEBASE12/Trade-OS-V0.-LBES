import { create } from 'zustand';
import {
  closeTrade as closeRemoteTrade,
  deleteAllTrades,
  deleteTrade as deleteRemoteTrade,
  fetchTrades,
} from '../services/tradeService';
import { saveWeeklyReview } from '../services/reviewService';
import { getOrCreateGuestId } from '../services/guestService';
import { ActivityTrade, GeneratedSignal, TradeOutcome } from '../types/reasontrack';

interface ReasonTrackState {
  defaultCapital: number;
  trades: ActivityTrade[];
  userId: string | null;
  guestId: string | null;
  loading: boolean;
  error: string | null;
  setDefaultCapital: (capital: number) => void;
  loadTrades: (userId?: string | null) => Promise<void>;
  addTradeFromSignal: (signal: GeneratedSignal) => Promise<void>;
  closeTrade: (id: string, outcome: TradeOutcome, resultR: number) => Promise<void>;
  deleteTrade: (id: string) => Promise<void>;
  importTrades: (trades: ActivityTrade[]) => void;
  clearAllTrades: () => Promise<void>;
  reset: () => void;
  setUserId: (userId: string | null) => void;
}

export const useReasonTrackStore = create<ReasonTrackState>((set, get) => ({
  defaultCapital: 2500,
  trades: [],
  userId: null,
  guestId: null,
  loading: false,
  error: null,

  setDefaultCapital: (capital) => set({ defaultCapital: capital }),

  setUserId: (userId) => {
    set({ userId });
  },

  loadTrades: async (userId) => {
    set({ loading: true, error: null });
    
    const actualUserId = userId ?? get().userId;
    const guestId = !actualUserId ? getOrCreateGuestId() : null;
    
    set({ userId: actualUserId, guestId });
    
    try {
      const trades = await fetchTrades(actualUserId, guestId);
      set({ trades, loading: false });
    } catch (error) {
      set({ loading: false, error: getErrorMessage(error) });
    }
  },

  addTradeFromSignal: async (signal) => {
    const guestId = get().guestId || getOrCreateGuestId();

    set({ loading: true, error: null });
    try {
      // Supabase save is temporarily disabled while stabilizing the live webhook render path.
      const trade: ActivityTrade = {
        ...signal,
        status: 'open',
        tradeNotes: '',
        reviewed: false,
        ruleFollowed: true,
      };
      set((state) => ({ trades: [trade, ...state.trades], loading: false, guestId }));
    } catch (error) {
      const message = getErrorMessage(error);
      set({ loading: false, error: message });
      throw new Error(message);
    }
  },

  closeTrade: async (id, outcome, resultR) => {
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
      
      const userId = get().userId;
      if (userId) {
        await saveWeeklyReview(userId, nextTrades);
      }
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
    const guestId = get().guestId;
    const previousTrades = get().trades;
    set({ trades: [], error: null });
    
    try {
      await deleteAllTrades(userId, guestId);
    } catch (error) {
      set({ trades: previousTrades, error: getErrorMessage(error) });
    }
  },

  reset: () => set({ trades: [], userId: null, loading: false, error: null }),
}));

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Supabase trade sync failed';
}
