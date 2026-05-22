export interface Trade {
  id: string;
  date: string; // ISO8601
  pair: string;
  timeframe: '1D' | '4H' | '1H' | '15M' | '5M' | '1M';
  direction: 'Buy' | 'Sell';
  entry_price: number;
  stop_loss: number;
  take_profit: number;
  risk_usd: number;
  reward_usd: number;
  r_multiple: number;
  result_r: number | null;
  outcome: 'open' | 'win' | 'loss' | 'break-even';
  rule_followed: boolean;
  reason: string;
  invalidation: string;
  emotion: number; // 1-10
  mistake_type: 'E' | 'T' | 'C' | null;
  notes: string;
  screenshot_url?: string;
  setup_id: string | null;
  week_number: number; // YYYYWW
  created_at: string;
  updated_at: string;
}

export interface PlaybookSetup {
  id: string;
  name: string;
  description: string;
  trigger_condition: string;
  entry_logic: string;
  confirmation: string;
  target_logic: string;
  risk_rule: string;
  example_image?: string;
  success_rate: number;
  times_used: number;
  tags: string[];
  created_at: string;
}

export interface WeeklyReview {
  id: string;
  week_number: number;
  start_date: string;
  end_date: string;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: number;
  avg_win_r: number;
  avg_loss_r: number;
  expectancy: number;
  rule_follow_percentage: number;
  avg_emotion: number;
  top_mistakes: string[];
  lessons_learned: string;
  improvements_next_week: string;
  created_at: string;
}

export interface AppSettings {
  currency: string;
  riskPerTrade: number;
  defaultTimeframe: string;
  theme: 'light' | 'dark';
}
