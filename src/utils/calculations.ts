import { Trade } from '../types';

export const calculateRMultiple = (
  direction: 'Buy' | 'Sell',
  entry: number,
  sl: number,
  tp: number
): number => {
  if (entry === sl) return 0;
  if (direction === 'Buy') {
    return (tp - entry) / (entry - sl);
  } else {
    return (entry - tp) / (sl - entry);
  }
};

export const calculateResultR = (
  direction: 'Buy' | 'Sell',
  entry: number,
  sl: number,
  exit: number
): number => {
  if (entry === sl) return 0;
  if (direction === 'Buy') {
    return (exit - entry) / (entry - sl);
  } else {
    return (entry - exit) / (sl - entry);
  }
};

export const calculateExpectancy = (trades: Trade[]): number => {
  const closedTrades = trades.filter(t => t.outcome !== 'open');
  if (closedTrades.length === 0) return 0;

  const wins = closedTrades.filter(t => t.result_r && t.result_r > 0);
  const losses = closedTrades.filter(t => t.result_r && t.result_r <= 0); // Include BE as loss/neutral for expectancy calc usually, or handle separate

  const winRate = wins.length / closedTrades.length;
  
  const avgWinR = wins.length > 0 
    ? wins.reduce((sum, t) => sum + (t.result_r || 0), 0) / wins.length 
    : 0;
    
  const avgLossR = losses.length > 0 
    ? Math.abs(losses.reduce((sum, t) => sum + (t.result_r || 0), 0) / losses.length) 
    : 0;

  return (avgWinR * winRate) - (avgLossR * (1 - winRate));
};

export const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return d.getUTCFullYear() * 100 + Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};
