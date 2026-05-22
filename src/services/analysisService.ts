import { GeneratedSignal } from '../types/reasontrack';
import { supabase } from './supabase';

export type AnalysisRecord = {
  id: string;
  user_id: string;
  trade_id?: string | null;
  payload?: GeneratedSignal;
  created_at?: string;
};

export async function saveAnalysis(userId: string, signal: GeneratedSignal, tradeId?: string) {
  const payload = buildAnalysisPayload(userId, signal, tradeId);
  const { data, error } = await supabase.from('ai_analysis').insert(payload).select('*').single();

  if (!error) return data as AnalysisRecord;

  const fallbackPayload = {
    user_id: userId,
    trade_id: tradeId,
    payload: signal,
    created_at: signal.createdAt,
  };
  const fallback = await supabase.from('ai_analysis').insert(fallbackPayload).select('*').single();
  if (fallback.error) throw fallback.error;
  return fallback.data as AnalysisRecord;
}

export async function fetchAnalysisHistory(userId: string) {
  const { data, error } = await supabase
    .from('ai_analysis')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as AnalysisRecord[];
}

function buildAnalysisPayload(userId: string, signal: GeneratedSignal, tradeId?: string) {
  return {
    user_id: userId,
    trade_id: tradeId,
    pair: signal.pair,
    timeframe: signal.timeframe,
    signal: signal.signal,
    alignment_score: signal.confidence,
    confidence: signal.confidence,
    entry_price: signal.entry,
    stop_loss: signal.stopLoss,
    tp1: signal.tp1,
    tp2: signal.tp2,
    tp3: signal.tp3,
    risk_reward: signal.riskReward,
    analysis: signal.analysis,
    validation_layers: signal.validationLayers,
    rejected_setups: signal.rejectedSetups,
    blocked_reasons: signal.blockedReasons,
    session: signal.session,
    protected_setups: signal.protectedSetups,
    payload: signal,
    created_at: signal.createdAt,
  };
}

