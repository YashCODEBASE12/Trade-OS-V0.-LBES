export type TradingStyle = 'Day Trader' | 'Swing' | 'Scalp';
export type Timeframe = '1m' | '15m' | '1H' | '4H';
export type SignalDirection = 'BUY' | 'SELL';
export type SignalState = SignalDirection | 'NO_SIGNAL';
export type TradeStatus = 'open' | 'win' | 'loss' | 'breakeven';
export type TradeOutcome = 'Win' | 'Loss' | 'Breakeven';

export interface PairOption {
  value: string;
  label: string;
  subtitle: string;
  market: 'fx' | 'crypto' | 'metal';
}

export interface AnalysisFormState {
  pair: string;
  timeframe: Timeframe;
  capital: number;
  riskReward: string;
  tradingStyle: TradingStyle;
}

export interface SignalAnalysis {
  tradeReason: string;
  technicalAlignment: string;
  macroAlignment: string;
  invalidation: string;
  riskProfile: string;
}

export interface GeneratedSignal {
  id: string;
  pair: string;
  timeframe: Timeframe;
  tradingStyle: TradingStyle;
  signal: SignalState;
  confidence: number;
  entry: number;
  stopLoss: number;
  tp1: number;
  tp2: number;
  tp3: number;
  riskReward: string;
  analysis: SignalAnalysis;
  validationLayers: string[];
  rejectedSetups: string[];
  blockedReasons: string[];
  session: string;
  protectedSetups: number;
  createdAt: string;
}

export interface ActivityTrade extends GeneratedSignal {
  status: TradeStatus;
  tradeNotes: string;
  reviewed: boolean;
  ruleFollowed: boolean;
  closedAt?: string;
  resultR?: number;
  closeOutcome?: TradeOutcome;
}

export interface EquityPoint {
  index: number;
  value: number;
}

export interface PerformanceSummary {
  winRate: number;
  totalNetR: number;
  totalTrades: number;
  bestPair: string;
  bestSession: string;
  pairBias: string;
  disciplineInsight: string;
  riskInsight: string;
  equityCurve: EquityPoint[];
}
