/*
  # ReasonTrack Initial Schema Setup
  
  1. Tables Created:
     - profiles (User settings & trading profile)
     - trades (Core trading data)
     - setups (Playbook strategies)
     - weekly_reviews (Performance summaries)
     - sync_logs (Track sync operations)
     - data_backups (CSV export metadata)
     - app_settings (UI/UX preferences)
  
  2. Security:
     - RLS enabled on all tables
     - Policies for owner-only access
  
  3. Automation:
     - Triggers for updating setup stats
     - Functions for R-multiple calculations and CSV export
     - Storage buckets for backups and screenshots
*/

-- ============================================
-- 1. PROFILES TABLE (User accounts)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT,
  avatar_url TEXT,
  
  -- Trading Profile
  trading_style TEXT CHECK (trading_style IN ('scalper', 'day', 'swing', 'position')),
  risk_tolerance TEXT CHECK (risk_tolerance IN ('conservative', 'moderate', 'aggressive')),
  account_size DECIMAL(12,2) DEFAULT 10000.00,
  risk_per_trade DECIMAL(5,2) DEFAULT 1.00,
  currency TEXT DEFAULT 'USD',
  preferred_markets TEXT[] DEFAULT '{"forex", "crypto", "stocks"}',
  
  -- Settings
  theme TEXT DEFAULT 'light',
  notifications_enabled BOOLEAN DEFAULT true,
  auto_backup_enabled BOOLEAN DEFAULT true,
  backup_frequency TEXT DEFAULT 'weekly',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_sync_at TIMESTAMPTZ,
  local_data_version INTEGER DEFAULT 1
);

-- ============================================
-- 2. TRADES TABLE (Main trading data)
-- ============================================
CREATE TABLE IF NOT EXISTS trades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Local reference (for sync)
  local_id TEXT UNIQUE,
  sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced', 'conflict', 'deleted')),
  
  -- Trade Basics
  pair VARCHAR(20) NOT NULL,
  asset_class TEXT CHECK (asset_class IN ('forex', 'crypto', 'stock', 'future', 'option')),
  timeframe VARCHAR(5) NOT NULL CHECK (timeframe IN ('1M', '5M', '15M', '1H', '4H', '1D', '1W')),
  direction VARCHAR(4) NOT NULL CHECK (direction IN ('buy', 'sell')),
  
  -- Entry/Exit
  entry_price DECIMAL(12,6) NOT NULL,
  stop_loss DECIMAL(12,6) NOT NULL,
  take_profit DECIMAL(12,6) NOT NULL,
  exit_price DECIMAL(12,6),
  
  -- Risk Management
  risk_usd DECIMAL(12,2) NOT NULL,
  reward_usd DECIMAL(12,2),
  position_size DECIMAL(12,4),
  account_size_at_trade DECIMAL(12,2),
  
  -- Calculated Metrics
  r_multiple DECIMAL(8,2) GENERATED ALWAYS AS (
    CASE 
      WHEN direction = 'buy' THEN (take_profit - entry_price) / (entry_price - stop_loss)
      ELSE (entry_price - take_profit) / (stop_loss - entry_price)
    END
  ) STORED,
  
  result_r DECIMAL(8,2),
  risk_reward_ratio DECIMAL(6,2) GENERATED ALWAYS AS (
    CASE 
      WHEN direction = 'buy' THEN (take_profit - entry_price) / (entry_price - stop_loss)
      ELSE (entry_price - take_profit) / (stop_loss - entry_price)
    END
  ) STORED,
  
  -- Psychology & Discipline
  emotion SMALLINT CHECK (emotion BETWEEN 1 AND 10),
  rule_followed BOOLEAN DEFAULT true,
  reason TEXT,
  invalidation TEXT,
  mistake_type CHAR(1) CHECK (mistake_type IN ('E', 'T', 'C')),
  notes TEXT,
  
  -- Outcomes
  outcome VARCHAR(20) DEFAULT 'open' CHECK (outcome IN ('open', 'win', 'loss', 'break-even', 'partial')),
  pnl_usd DECIMAL(12,2),
  pnl_percentage DECIMAL(8,2),
  
  -- Media
  screenshot_url TEXT,
  chart_data JSONB,
  
  -- Setup Reference
  setup_id UUID,
  
  -- Time Management
  trade_date TIMESTAMPTZ DEFAULT NOW(),
  exit_date TIMESTAMPTZ,
  duration_minutes INTEGER,
  
  -- Auto-calculated fields
  week_number INTEGER GENERATED ALWAYS AS (EXTRACT(YEAR FROM trade_date) * 100 + EXTRACT(WEEK FROM trade_date)) STORED,
  month_number INTEGER GENERATED ALWAYS AS (EXTRACT(YEAR FROM trade_date) * 100 + EXTRACT(MONTH FROM trade_date)) STORED,
  year INTEGER GENERATED ALWAYS AS (EXTRACT(YEAR FROM trade_date)) STORED,
  
  -- Sync Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  is_deleted BOOLEAN DEFAULT false,
  version INTEGER DEFAULT 1,
  
  -- Indexes for Performance
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- ============================================
-- 3. SETUPS TABLE (Trading playbook)
-- ============================================
CREATE TABLE IF NOT EXISTS setups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  local_id TEXT UNIQUE,
  sync_status TEXT DEFAULT 'pending',
  
  -- Setup Details
  name VARCHAR(100) NOT NULL,
  description TEXT,
  market_condition TEXT CHECK (market_condition IN ('trending', 'ranging', 'volatile', 'breakout')),
  
  -- Strategy
  trigger_condition TEXT NOT NULL,
  entry_logic TEXT NOT NULL,
  confirmation_signals TEXT[],
  target_logic TEXT NOT NULL,
  risk_rule TEXT NOT NULL,
  
  -- Performance Tracking
  times_used INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE WHEN times_used > 0 THEN (success_count::DECIMAL / times_used * 100) ELSE 0 END
  ) STORED,
  
  avg_r_multiple DECIMAL(8,2) DEFAULT 0,
  total_pnl DECIMAL(12,2) DEFAULT 0,
  
  -- Organization
  tags TEXT[] DEFAULT '{}',
  category TEXT,
  is_favorite BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  version INTEGER DEFAULT 1
);

-- ============================================
-- 4. WEEKLY REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS weekly_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  local_id TEXT UNIQUE,
  sync_status TEXT DEFAULT 'pending',
  
  -- Week Identification
  week_number INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  -- Performance Metrics
  total_trades INTEGER DEFAULT 0,
  winning_trades INTEGER DEFAULT 0,
  losing_trades INTEGER DEFAULT 0,
  win_rate DECIMAL(5,2),
  net_r DECIMAL(10,2) DEFAULT 0,
  expectancy DECIMAL(8,2),
  
  -- Quality Metrics
  avg_win_r DECIMAL(8,2) DEFAULT 0,
  avg_loss_r DECIMAL(8,2) DEFAULT 0,
  largest_win_r DECIMAL(8,2) DEFAULT 0,
  largest_loss_r DECIMAL(8,2) DEFAULT 0,
  max_drawdown_r DECIMAL(8,2) DEFAULT 0,
  
  -- Psychology Metrics
  avg_emotion DECIMAL(4,2) DEFAULT 0,
  rule_follow_percentage DECIMAL(5,2) DEFAULT 0,
  
  -- Analysis
  top_setup_id UUID REFERENCES setups(id),
  worst_setup_id UUID REFERENCES setups(id),
  mistake_analysis JSONB DEFAULT '{}',
  market_condition TEXT,
  
  -- Notes
  what_worked TEXT,
  challenges_faced TEXT,
  lessons_learned TEXT,
  goals_next_week TEXT,
  
  -- Stats
  total_pnl DECIMAL(12,2) DEFAULT 0,
  profit_factor DECIMAL(8,2),
  sharpe_ratio DECIMAL(8,4),
  recovery_factor DECIMAL(8,2),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_number)
);

-- ============================================
-- 5. SYNC LOGS TABLE (Track all sync operations)
-- ============================================
CREATE TABLE IF NOT EXISTS sync_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Sync Info
  sync_type TEXT NOT NULL CHECK (sync_type IN ('initial', 'incremental', 'conflict_resolution', 'backup', 'restore')),
  direction TEXT NOT NULL CHECK (direction IN ('local_to_cloud', 'cloud_to_local')),
  
  -- Stats
  items_processed INTEGER DEFAULT 0,
  items_succeeded INTEGER DEFAULT 0,
  items_failed INTEGER DEFAULT 0,
  conflicts_resolved INTEGER DEFAULT 0,
  
  -- Timing
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'partial')),
  error_message TEXT,
  
  -- Details
  tables_synced TEXT[],
  data_range_start TIMESTAMPTZ,
  data_range_end TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. DATA_BACKUPS TABLE (CSV exports storage)
-- ============================================
CREATE TABLE IF NOT EXISTS data_backups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Backup Info
  backup_type TEXT NOT NULL CHECK (backup_type IN ('manual', 'auto_daily', 'auto_weekly', 'auto_monthly', 'pre_migration')),
  period TEXT, -- '2024-01', 'weekly-2024-03'
  
  -- File Storage (in Supabase Storage)
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size_bytes INTEGER,
  file_hash TEXT, -- For integrity verification
  
  -- Content
  tables_included TEXT[] DEFAULT '{"trades", "setups", "weekly_reviews"}',
  record_count INTEGER,
  data_range_start TIMESTAMPTZ,
  data_range_end TIMESTAMPTZ,
  
  -- Status
  is_verified BOOLEAN DEFAULT false,
  verification_checksum TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ GENERATED ALWAYS AS (created_at + INTERVAL '90 days') STORED
);

-- ============================================
-- 7. APP_SETTINGS TABLE (User preferences)
-- ============================================
CREATE TABLE IF NOT EXISTS app_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  
  -- Display
  theme TEXT DEFAULT 'light',
  chart_style TEXT DEFAULT 'minimal',
  default_timeframe TEXT DEFAULT '1H',
  default_currency TEXT DEFAULT 'USD',
  
  -- Trading Defaults
  default_risk_percent DECIMAL(5,2) DEFAULT 1.00,
  default_risk_reward DECIMAL(4,2) DEFAULT 2.00,
  auto_calculate_rr BOOLEAN DEFAULT true,
  
  -- Notifications
  email_notifications BOOLEAN DEFAULT false,
  push_notifications BOOLEAN DEFAULT true,
  weekly_report BOOLEAN DEFAULT true,
  drawdown_alert_percent DECIMAL(5,2) DEFAULT 10.00,
  
  -- Data Management
  auto_backup BOOLEAN DEFAULT true,
  backup_frequency TEXT DEFAULT 'weekly',
  cloud_sync BOOLEAN DEFAULT true,
  sync_frequency TEXT DEFAULT 'realtime',
  
  -- Security
  app_lock_enabled BOOLEAN DEFAULT false,
  auto_logout_minutes INTEGER DEFAULT 30,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  version INTEGER DEFAULT 1
);

-- ============================================
-- 8. INDEXES
-- ============================================
CREATE INDEX idx_trades_user_date ON trades(user_id, trade_date DESC);
CREATE INDEX idx_trades_user_outcome ON trades(user_id, outcome);
CREATE INDEX idx_trades_user_pair ON trades(user_id, pair);
CREATE INDEX idx_trades_sync_status ON trades(sync_status) WHERE sync_status = 'pending';
CREATE INDEX idx_trades_local_id ON trades(local_id);

CREATE INDEX idx_setups_user ON setups(user_id);
CREATE INDEX idx_setups_success_rate ON setups(success_rate DESC);
CREATE INDEX idx_setups_sync_status ON setups(sync_status) WHERE sync_status = 'pending';

CREATE INDEX idx_weekly_reviews_user_week ON weekly_reviews(user_id, week_number DESC);
CREATE INDEX idx_sync_logs_user_date ON sync_logs(user_id, created_at DESC);

CREATE INDEX idx_profiles_last_sync ON profiles(last_sync_at);

-- ============================================
-- 9. RLS POLICIES
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE setups ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Trades
CREATE POLICY "Users can manage own trades" ON trades FOR ALL USING (auth.uid() = user_id);

-- Setups
CREATE POLICY "Users can manage own setups" ON setups FOR ALL USING (auth.uid() = user_id OR is_public = true);

-- Weekly Reviews
CREATE POLICY "Users can manage own weekly reviews" ON weekly_reviews FOR ALL USING (auth.uid() = user_id);

-- Sync Logs
CREATE POLICY "Users can view own sync logs" ON sync_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sync logs" ON sync_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sync logs" ON sync_logs FOR UPDATE USING (auth.uid() = user_id);

-- Data Backups
CREATE POLICY "Users can manage own backups" ON data_backups FOR ALL USING (auth.uid() = user_id);

-- App Settings
CREATE POLICY "Users can manage own settings" ON app_settings FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 10. FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update trade outcome and recalculate
CREATE OR REPLACE FUNCTION update_trade_outcome(
  p_trade_id UUID,
  p_exit_price DECIMAL,
  p_outcome VARCHAR
) RETURNS VOID AS $$
BEGIN
  UPDATE trades 
  SET 
    exit_price = p_exit_price,
    outcome = p_outcome,
    result_r = CASE 
      WHEN direction = 'buy' THEN (p_exit_price - entry_price) / (entry_price - stop_loss)
      ELSE (entry_price - p_exit_price) / (stop_loss - entry_price)
    END,
    pnl_usd = CASE 
      WHEN direction = 'buy' THEN (p_exit_price - entry_price) * position_size
      ELSE (entry_price - p_exit_price) * position_size
    END,
    exit_date = NOW(),
    duration_minutes = EXTRACT(EPOCH FROM (NOW() - trade_date)) / 60,
    updated_at = NOW(),
    version = version + 1
  WHERE id = p_trade_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update setup success rate
CREATE OR REPLACE FUNCTION update_setup_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.outcome IN ('win', 'loss', 'break-even') AND OLD.outcome = 'open' THEN
    UPDATE setups 
    SET 
      times_used = times_used + 1,
      success_count = success_count + CASE WHEN NEW.outcome = 'win' THEN 1 ELSE 0 END,
      total_pnl = total_pnl + COALESCE(NEW.pnl_usd, 0),
      avg_r_multiple = CASE 
        WHEN (times_used + 1) > 0 THEN 
          ((avg_r_multiple * times_used) + COALESCE(NEW.result_r, 0)) / (times_used + 1)
        ELSE COALESCE(NEW.result_r, 0)
      END,
      updated_at = NOW()
    WHERE id = NEW.setup_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-updating setup stats
DROP TRIGGER IF EXISTS trigger_update_setup_stats ON trades;
CREATE TRIGGER trigger_update_setup_stats
  AFTER UPDATE ON trades
  FOR EACH ROW
  EXECUTE FUNCTION update_setup_stats();

-- Function to export data to CSV
CREATE OR REPLACE FUNCTION export_trades_to_csv(
  p_user_id UUID,
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL
) RETURNS TEXT AS $$
DECLARE
  v_csv_text TEXT;
BEGIN
  SELECT string_agg(
    FORMAT(
      '%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s',
      id,
      pair,
      timeframe,
      direction,
      entry_price,
      stop_loss,
      take_profit,
      exit_price,
      risk_usd,
      reward_usd,
      r_multiple,
      result_r,
      outcome,
      emotion,
      rule_followed,
      reason,
      pnl_usd,
      TO_CHAR(trade_date, 'YYYY-MM-DD HH24:MI:SS'),
      TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS')
    ), E'\n'
  ) INTO v_csv_text
  FROM trades
  WHERE user_id = p_user_id
    AND (p_start_date IS NULL OR trade_date >= p_start_date)
    AND (p_end_date IS NULL OR trade_date <= p_end_date)
    AND is_deleted = false;
  
  -- Add header
  v_csv_text := 'id,pair,timeframe,direction,entry_price,stop_loss,take_profit,exit_price,risk_usd,reward_usd,r_multiple,result_r,outcome,emotion,rule_followed,reason,pnl_usd,trade_date,created_at' || E'\n' || COALESCE(v_csv_text, '');
  
  RETURN v_csv_text;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 11. STORAGE BUCKETS
-- ============================================
-- Insert buckets safely
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('trade-backups', 'trade-backups', false),
  ('trade-screenshots', 'trade-screenshots', false),
  ('user-avatars', 'user-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Users can upload own screenshots" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'trade-screenshots' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view own screenshots" ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id = 'trade-screenshots' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can manage own backups" ON storage.objects
  FOR ALL TO authenticated USING (
    bucket_id = 'trade-backups' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
