import { ActivityTrade, GeneratedSignal, SignalDirection, TradeOutcome } from '../types/reasontrack';
import { fetchAnalysisHistory } from './analysisService';
import { supabase } from './supabase';

export async function fetchTrades(userId: string): Promise<ActivityTrade[]> {
  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', userId)
    .eq('is_deleted', false)
    .order('trade_date', { ascending: false });

  if (error) throw error;

  let analysisByTradeId = new Map<string, any>();
  try {
    const analyses = await fetchAnalysisHistory(userId);
    analysisByTradeId = new Map(
      analyses
        .filter((item: any) => item.trade_id)
        .map((item: any) => [item.trade_id, item.payload ?? item]),
    );
  } catch {
    analysisByTradeId = new Map();
  }

  return (data ?? []).map((row) => fromTradeRow(row, analysisByTradeId.get(row.id)));
}

export async function createTradeFromSignal(userId: string, signal: GeneratedSignal): Promise<ActivityTrade> {
  const { data, error } = await supabase
    .from('trades')
    .insert(toTradeInsertRow(userId, signal))
    .select('*')
    .single();

  if (error) throw error;
  return fromTradeRow(data, signal);
}

export async function closeTrade(id: string, outcome: TradeOutcome, resultR: number): Promise<ActivityTrade> {
  const dbOutcome = outcome === 'Breakeven' ? 'break-even' : outcome.toLowerCase();
  const { data, error } = await supabase
    .from('trades')
    .update({
      outcome: dbOutcome,
      result_r: resultR,
      exit_date: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return fromTradeRow(data);
}

export async function deleteTrade(id: string) {
  const softDelete = await supabase
    .from('trades')
    .update({ is_deleted: true, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (!softDelete.error) return;

  const hardDelete = await supabase.from('trades').delete().eq('id', id);
  if (hardDelete.error) throw hardDelete.error;
}

export async function deleteAllTrades(userId: string) {
  const { error } = await supabase
    .from('trades')
    .update({ is_deleted: true, updated_at: new Date().toISOString() })
    .eq('user_id', userId);
  if (error) throw error;
}

function toTradeInsertRow(userId: string, signal: GeneratedSignal) {
  const direction = signal.signal === 'SELL' ? 'sell' : 'buy';
  return {
    user_id: userId,
    local_id: signal.id,
    pair: signal.pair.slice(0, 20),
    asset_class: getAssetClass(signal.pair),
    timeframe: toDbTimeframe(signal.timeframe),
    direction,
    entry_price: signal.entry,
    stop_loss: signal.stopLoss,
    take_profit: signal.tp1,
    risk_usd: 0,
    reward_usd: 0,
    result_r: null,
    outcome: 'open',
    rule_followed: true,
    reason: signal.analysis.tradeReason,
    invalidation: signal.analysis.invalidation,
    notes: 'Journal auto-filled from LBES execution analysis.',
    trade_date: signal.createdAt,
    sync_status: 'synced',
  };
}

function fromTradeRow(row: any, analysisPayload?: Partial<GeneratedSignal>): ActivityTrade {
  const direction = String(row.direction).toLowerCase() === 'sell' ? 'SELL' : 'BUY';
  const status = row.outcome === 'break-even' ? 'breakeven' : row.outcome ?? 'open';
  const entry = Number(row.entry_price ?? analysisPayload?.entry ?? 0);
  const stopLoss = Number(row.stop_loss ?? analysisPayload?.stopLoss ?? 0);
  const tp1 = Number(row.take_profit ?? analysisPayload?.tp1 ?? 0);

  return {
    id: row.id,
    pair: row.pair,
    timeframe: fromDbTimeframe(row.timeframe),
    tradingStyle: analysisPayload?.tradingStyle ?? 'Day Trader',
    signal: direction as SignalDirection,
    confidence: Number(analysisPayload?.confidence ?? row.alignment_score ?? 0),
    entry,
    stopLoss,
    tp1,
    tp2: Number(analysisPayload?.tp2 ?? tp1),
    tp3: Number(analysisPayload?.tp3 ?? tp1),
    riskReward: analysisPayload?.riskReward ?? `1:${Number(row.risk_reward_ratio ?? row.r_multiple ?? 0).toFixed(1)}`,
    analysis: analysisPayload?.analysis ?? {
      tradeReason: row.reason ?? 'Execution reason saved with trade.',
      technicalAlignment: row.reason ?? 'Technical alignment saved in AI analysis history.',
      macroAlignment: 'Macro alignment saved in AI analysis history.',
      invalidation: row.invalidation ?? 'Invalidation saved with trade.',
      riskProfile: row.notes ?? 'Risk profile saved with trade.',
    },
    validationLayers: analysisPayload?.validationLayers ?? [],
    rejectedSetups: analysisPayload?.rejectedSetups ?? [],
    blockedReasons: analysisPayload?.blockedReasons ?? [],
    session: analysisPayload?.session ?? 'London',
    protectedSetups: Number(analysisPayload?.protectedSetups ?? 0),
    createdAt: row.trade_date ?? row.created_at ?? new Date().toISOString(),
    status,
    tradeNotes: row.notes ?? '',
    reviewed: status !== 'open',
    ruleFollowed: row.rule_followed ?? true,
    closedAt: row.exit_date ?? undefined,
    resultR: row.result_r === null || row.result_r === undefined ? undefined : Number(row.result_r),
    closeOutcome: status === 'win' ? 'Win' : status === 'loss' ? 'Loss' : status === 'breakeven' ? 'Breakeven' : undefined,
  };
}

function toDbTimeframe(value: string) {
  if (value === '1m') return '1M';
  if (value === '15m') return '15M';
  return value;
}

function fromDbTimeframe(value: string) {
  if (value === '1M') return '1m';
  if (value === '15M') return '15m';
  if (value === '1H' || value === '4H') return value;
  return '15m';
}

function getAssetClass(pair: string) {
  if (pair.includes('BTC')) return 'crypto';
  if (pair.includes('XAU')) return 'future';
  return 'forex';
}

