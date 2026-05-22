-- ============================================
-- FIXED SCHEMA: REASONTRACK TRADEROS
-- Fixes 42P17 error by using Triggers instead of Generated Columns
-- ============================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT,
  avatar_url TEXT,
  trading_style TEXT CHECK (trading_style IN ('scalper', 'day', 'swing', 'position')),
  risk_tolerance TEXT CHECK (risk_tolerance IN ('conservative', 'moderate', 'aggressive')),
  account_size DECIMAL(12,2) DEFAULT 10000.00,
  risk_per_trade DECIMAL(5,2) DEFAULT 1.00,
  currency TEXT DEFAULT 'USD',
  preferred_markets TEXT[] DEFAULT '{"forex", "crypto", "stocks"}',
  theme TEXT DEFAULT 'light',
  notifications_enabled BOOLEAN DEFAULT true,
  auto_backup_enabled BOOLEAN DEFAULT true,
  backup_frequency TEXT DEFAULT 'weekly',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_sync_at TIMESTAMPTZ,
  local_data_version INTEGER DEFAULT 1
);

-- 2. TRADES TABLE
CREATE TABLE IF NOT EXISTS trades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  local_id TEXT UNIQUE,
  sync_status TEXT DEFAULT 'pending',
  
  -- Basics
  pair VARCHAR(20) NOT NULL,
  asset_class TEXT,
  timeframe VARCHAR(5) NOT NULL,
  direction VARCHAR(4) NOT NULL,
  
  -- Prices
  entry_price DECIMAL(12,6) NOT NULL,
  stop_loss DECIMAL(12,6) NOT NULL,
  take_profit DECIMAL(12,6) NOT NULL,
  exit_price DECIMAL(12,6),
  
  -- Risk
  risk_usd DECIMAL(12,2) NOT NULL,
  reward_usd DECIMAL(12,2),
  position_size DECIMAL(12,4),
  
  -- Calculated Metrics (Managed by Trigger now)
  r_multiple DECIMAL(8,2),
  result_r DECIMAL(8,2),
  risk_reward_ratio DECIMAL(6,2),
  
  -- Psychology
  emotion SMALLINT,
  rule_followed BOOLEAN DEFAULT true,
  reason TEXT,
  invalidation TEXT,
  mistake_type CHAR(1),
  notes TEXT,
  
  -- Outcomes
  outcome VARCHAR(20) DEFAULT 'open',
  pnl_usd DECIMAL(12,2),
  
  -- Media
  screenshot_url TEXT,
  setup_id UUID,
  
  -- Time
  trade_date TIMESTAMPTZ DEFAULT NOW(),
  exit_date TIMESTAMPTZ,
  duration_minutes INTEGER,
  
  -- Date Metrics (Managed by Trigger now)
  week_number INTEGER,
  month_number INTEGER,
  year INTEGER,
  
  -- Meta
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT false,
  version INTEGER DEFAULT 1
);

-- 3. SETUPS TABLE
CREATE TABLE IF NOT EXISTS setups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  local_id TEXT UNIQUE,
  sync_status TEXT DEFAULT 'pending',
  name VARCHAR(100) NOT NULL,
  description TEXT,
  trigger_condition TEXT NOT NULL,
  entry_logic TEXT NOT NULL,
  confirmation_signals TEXT[],
  target_logic TEXT NOT NULL,
  risk_rule TEXT NOT NULL,
  
  -- Stats (Managed by Trigger)
  times_used INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0,
  avg_r_multiple DECIMAL(8,2) DEFAULT 0,
  total_pnl DECIMAL(12,2) DEFAULT 0,
  
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. WEEKLY REVIEWS TABLE
CREATE TABLE IF NOT EXISTS weekly_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  local_id TEXT UNIQUE,
  sync_status TEXT DEFAULT 'pending',
  week_number INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_trades INTEGER DEFAULT 0,
  winning_trades INTEGER DEFAULT 0,
  losing_trades INTEGER DEFAULT 0,
  win_rate DECIMAL(5,2),
  net_r DECIMAL(10,2) DEFAULT 0,
  expectancy DECIMAL(8,2),
  avg_emotion DECIMAL(4,2) DEFAULT 0,
  rule_follow_percentage DECIMAL(5,2) DEFAULT 0,
  what_worked TEXT,
  challenges_faced TEXT,
  lessons_learned TEXT,
  goals_next_week TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_number)
);

-- 5. SYNC LOGS & BACKUPS
CREATE TABLE IF NOT EXISTS sync_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  sync_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  items_processed INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS data_backups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  backup_type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FUNCTIONS & TRIGGERS (THE FIX)
-- ============================================

-- Function to calculate trade metrics (R-Multiple, Dates) automatically
CREATE OR REPLACE FUNCTION calculate_trade_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- 1. Date Metrics (Force UTC for consistency)
  IF NEW.trade_date IS NOT NULL THEN
    NEW.year := EXTRACT(YEAR FROM NEW.trade_date AT TIME ZONE 'UTC');
    NEW.month_number := EXTRACT(YEAR FROM NEW.trade_date AT TIME ZONE 'UTC') * 100 + EXTRACT(MONTH FROM NEW.trade_date AT TIME ZONE 'UTC');
    NEW.week_number := EXTRACT(YEAR FROM NEW.trade_date AT TIME ZONE 'UTC') * 100 + EXTRACT(WEEK FROM NEW.trade_date AT TIME ZONE 'UTC');
  END IF;

  -- 2. R-Multiple & RR (Safe Division)
  -- Buy Trade
  IF NEW.direction = 'Buy' OR NEW.direction = 'buy' THEN
    IF (NEW.entry_price - NEW.stop_loss) != 0 THEN
      NEW.r_multiple := (NEW.take_profit - NEW.entry_price) / (NEW.entry_price - NEW.stop_loss);
      NEW.risk_reward_ratio := (NEW.take_profit - NEW.entry_price) / (NEW.entry_price - NEW.stop_loss);
    ELSE
      NEW.r_multiple := 0;
      NEW.risk_reward_ratio := 0;
    END IF;
    
    -- Result R
    IF NEW.exit_price IS NOT NULL AND (NEW.entry_price - NEW.stop_loss) != 0 THEN
      NEW.result_r := (NEW.exit_price - NEW.entry_price) / (NEW.entry_price - NEW.stop_loss);
    END IF;

  -- Sell Trade
  ELSIF NEW.direction = 'Sell' OR NEW.direction = 'sell' THEN
    IF (NEW.stop_loss - NEW.entry_price) != 0 THEN
      NEW.r_multiple := (NEW.entry_price - NEW.take_profit) / (NEW.stop_loss - NEW.entry_price);
      NEW.risk_reward_ratio := (NEW.entry_price - NEW.take_profit) / (NEW.stop_loss - NEW.entry_price);
    ELSE
      NEW.r_multiple := 0;
      NEW.risk_reward_ratio := 0;
    END IF;

    -- Result R
    IF NEW.exit_price IS NOT NULL AND (NEW.stop_loss - NEW.entry_price) != 0 THEN
      NEW.result_r := (NEW.entry_price - NEW.exit_price) / (NEW.stop_loss - NEW.entry_price);
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply Trigger to Trades
CREATE TRIGGER trigger_calculate_trade_metrics
  BEFORE INSERT OR UPDATE ON trades
  FOR EACH ROW
  EXECUTE FUNCTION calculate_trade_metrics();

-- Function to update Setup Stats
CREATE OR REPLACE FUNCTION update_setup_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.outcome IN ('win', 'loss', 'break-even') AND OLD.outcome = 'open' THEN
    UPDATE setups 
    SET 
      times_used = times_used + 1,
      success_count = success_count + CASE WHEN NEW.outcome = 'win' THEN 1 ELSE 0 END,
      success_rate = CASE 
        WHEN (times_used + 1) > 0 THEN 
          ((success_count + CASE WHEN NEW.outcome = 'win' THEN 1 ELSE 0 END)::DECIMAL / (times_used + 1) * 100)
        ELSE 0 
      END,
      total_pnl = total_pnl + COALESCE(NEW.pnl_usd, 0),
      updated_at = NOW()
    WHERE id = NEW.setup_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_setup_stats
  AFTER UPDATE ON trades
  FOR EACH ROW
  EXECUTE FUNCTION update_setup_stats();

-- ============================================
-- RLS POLICIES (SECURITY)
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE setups ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_backups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own profiles" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can manage own trades" ON trades FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own setups" ON setups FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own reviews" ON weekly_reviews FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own logs" ON sync_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own backups" ON data_backups FOR ALL USING (auth.uid() = user_id);

-- Storage Buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('trade-backups', 'trade-backups', false), ('trade-screenshots', 'trade-screenshots', false)
ON CONFLICT DO NOTHING;

CREATE POLICY "Users can manage own backups" ON storage.objects
  FOR ALL TO authenticated USING (bucket_id = 'trade-backups' AND (storage.foldername(name))[1] = auth.uid()::text);
