import { GeneratedSignal } from '../types/reasontrack';
import { supabase } from './supabase';
import { getSessionIdentifier } from './guestService';

export type AnalysisRecord = {
  id: string;
  user_id?: string | null;
  guest_id?: string | null;
  trade_id?: string | null;
  payload?: GeneratedSignal;
  created_at?: string;
};

export async function saveAnalysis(userId: string | null, signal: GeneratedSignal, tradeId?: string) {
  const { user_id, guest_id } = getSessionIdentifier(userId);
  const payload = buildAnalysisPayload(user_id, guest_id, signal, tradeId);
  const { data, error } = await supabase.from('ai_analysis').insert(payload).select('*').single();

  if (!error) return data as AnalysisRecord;
  console.error('[analyze] supabase error', error);

  const fallbackPayload = {
    user_id: user_id,
    guest_id: guest_id,
    trade_id: tradeId,
    payload: signal,
    direction: signal.direction,
    confidence: signal.confidence,
    entry: signal.entry,
    stop_loss: signal.stopLoss,
    take_profit: signal.takeProfit,
    created_at: signal.createdAt,
  };
  console.debug('[analyze] supabase fallback payload', fallbackPayload);
  const fallback = await supabase.from('ai_analysis').insert(fallbackPayload).select('*').single();
  if (fallback.error) {
    console.error('[analyze] supabase fallback error', fallback.error);
    throw fallback.error;
  }
  return fallback.data as AnalysisRecord;
}

export async function fetchAnalysisHistory(userId: string | null, guestId?: string | null) {
  let query = supabase.from('ai_analysis').select('*');

  if (userId) {
    query = query.eq('user_id', userId);
  } else if (guestId) {
    query = query.eq('guest_id', guestId);
  } else {
    return [];
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as AnalysisRecord[];
}

function buildAnalysisPayload(userId: string | null, guestId: string | null, signal: GeneratedSignal, tradeId?: string) {
  const payload = {
    user_id: userId,
    guest_id: guestId,
    trade_id: tradeId,
    pair: signal.pair,
    timeframe: signal.timeframe,
    direction: signal.direction,
    confidence: signal.confidence,
    entry: signal.entry,
    stop_loss: signal.stopLoss,
    take_profit: signal.takeProfit,
    market_structure: signal.analysis.marketStructure,
    liquidity_summary: signal.analysis.liquiditySummary,
    macro_alignment: signal.analysis.macroAlignment,
    technical_alignment: signal.analysis.technicalAlignment,
    trade_reasoning: signal.analysis.tradeReason,
    invalidation: signal.analysis.invalidation,
    execution_bias: signal.analysis.executionBias,
    execution_summary: signal.analysis.executionSummary,
    probability_grade: signal.analysis.probabilityGrade,
    risk_reward: signal.riskReward,
    payload: signal,
    raw_webhook: signal.rawWebhook,
    created_at: signal.createdAt,
  };
  console.debug('[analyze] supabase payload', payload);
  return payload;
}
