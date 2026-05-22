import { ActivityTrade } from '../types/reasontrack';
import { supabase } from './supabase';

export async function saveWeeklyReview(userId: string, trades: ActivityTrade[]) {
  const now = new Date();
  const weekNumber = getWeekNumber(now);
  const weekStart = getStartOfWeek(now);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const closedTrades = trades.filter((trade) => trade.status !== 'open');
  const winningTrades = closedTrades.filter((trade) => trade.status === 'win').length;
  const losingTrades = closedTrades.filter((trade) => trade.status === 'loss').length;
  const netR = closedTrades.reduce((sum, trade) => sum + (trade.resultR ?? 0), 0);
  const ruleFollowed = trades.filter((trade) => trade.ruleFollowed !== false).length;

  const payload = {
    user_id: userId,
    week_number: weekNumber,
    start_date: weekStart.toISOString().slice(0, 10),
    end_date: weekEnd.toISOString().slice(0, 10),
    total_trades: closedTrades.length,
    winning_trades: winningTrades,
    losing_trades: losingTrades,
    win_rate: closedTrades.length ? (winningTrades / closedTrades.length) * 100 : 0,
    net_r: netR,
    expectancy: closedTrades.length ? netR / closedTrades.length : 0,
    rule_follow_percentage: trades.length ? (ruleFollowed / trades.length) * 100 : 0,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('weekly_reviews')
    .upsert(payload, { onConflict: 'user_id,week_number' })
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function fetchWeeklyReviews(userId: string) {
  const { data, error } = await supabase
    .from('weekly_reviews')
    .select('*')
    .eq('user_id', userId)
    .order('week_number', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

function getWeekNumber(date: Date) {
  const firstDayOfYear = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return date.getUTCFullYear() * 100 + Math.ceil((pastDaysOfYear + firstDayOfYear.getUTCDay() + 1) / 7);
}

function getStartOfWeek(date: Date) {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = start.getUTCDay() || 7;
  start.setUTCDate(start.getUTCDate() - day + 1);
  return start;
}

