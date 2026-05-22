import { create } from 'zustand';

type TradingStyle = 'Scalp' | 'Day Trader' | 'Swing';

type Timeframe = '5m' | '15m' | '1H' | '4H' | 'Daily';

type DraftTrade = {
  pair: string;
  timeframe: Timeframe;
  direction: 'Buy' | 'Sell';
  entry_price: number;
  stop_loss: number;
  take_profit: number;
  risk_usd: number;
  reward_usd: number;
  r_multiple: number;
  reason: string;
  invalidation: string;
  emotion: number;
  rule_followed: boolean;
  tradingStyle: TradingStyle;
};

interface DraftTradeStore {
  draft: Partial<DraftTrade>;
  setDraft: (draft: Partial<DraftTrade>) => void;
  clearDraft: () => void;
}

export const useDraftTradeStore = create<DraftTradeStore>((set) => ({
  draft: {},
  setDraft: (draft) => set((state) => ({ draft: { ...state.draft, ...draft } })),
  clearDraft: () => set({ draft: {} }),
}));
