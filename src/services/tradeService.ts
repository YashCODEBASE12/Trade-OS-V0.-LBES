import { ActivityTrade, GeneratedSignal, TradeOutcome } from '../types/reasontrack';
import { fetchAnalysisHistory } from './analysisService';
import { getSessionIdentifier } from './guestService';
import { supabase } from './supabase';

export async function fetchTrades(userId: string | null, guestId?: string | null): Promise<ActivityTrade[]> {
  let query = supabase
    .from('trades')
    .select('*')
    .eq('is_deleted', false)
    .order('trade_date', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  } else if (guestId) {
    query = query.eq('guest_id', guestId);
  } else {
    return [];
  }

  const { data, error } = await query;

  if (error) throw error;

  const analysisByTradeId = new Map<string, GeneratedSignal | Record<string, unknown>>();
  try {
    const analyses = await fetchAnalysisHistory(userId, guestId);
    analyses
      .filter((item: Record<string, unknown>) => item.trade_id)
      .forEach((item: Record<string, unknown>) => {
        analysisByTradeId.set(item.trade_id as string, item.payload ?? item);
      });
  } catch {
    // Empty map if analysis fetch fails
  }

  return (data ?? []).map((row: Record<string, unknown>) => fromTradeRow(row, analysisByTradeId.get(row.id as string)));
}

export async function createTradeFromSignal(userId: string | null, signal: GeneratedSignal): Promise<ActivityTrade> {
  const { user_id, guest_id } = getSessionIdentifier(userId);
  const { data, error } = await supabase
    .from('trades')
    .insert(toTradeInsertRow(user_id, guest_id, signal))
    .select('*')
    .single();

  if (error) throw error;
  return fromTradeRow(data as Record<string, unknown>, signal);
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
  return fromTradeRow(data as Record<string, unknown>);
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

export async function deleteAllTrades(userId: string | null, guestId?: string | null) {
  let query = supabase.from('trades').update({ is_deleted: true, updated_at: new Date().toISOString() });

  if (userId) {
    query = query.eq('user_id', userId);
  } else if (guestId) {
    query = query.eq('guest_id', guestId);
  } else {
    return;
  }

  const { error } = await query;
  if (error) throw error;
}

function toTradeInsertRow(userId: string | null, guestId: string | null, signal: GeneratedSignal) {
  const direction = signal.signal === 'SELL' ? 'sell' : 'buy';
  return {
    user_id: userId,
    guest_id: guestId,
    local_id: signal.id,
    pair: signal.pair.slice(0, 20),
    asset_class: getAssetClass(signal.pair),
    timeframe: toDbTimeframe(signal.timeframe),
    direction,
    entry_price: signal.entry,
    stop_loss: signal.stopLoss,
    take_profit: signal.takeProfit,
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

function fromTradeRow(row: Record<string, unknown>, analysisPayload?: Partial<GeneratedSignal>): ActivityTrade {
  const directionValue = typeof row.direction === 'string' ? row.direction : analysisPayload?.direction ?? analysisPayload?.signal ?? 'BUY';
  const direction = String(directionValue).toLowerCase() === 'sell' ? 'SELL' : String(directionValue).toUpperCase() === 'NO_SIGNAL' ? 'NO_SIGNAL' : 'BUY';
  const status = row.outcome === 'break-even' ? 'breakeven' : row.outcome ?? 'open';
  const entry = Number(row.entry_price ?? row.entry ?? analysisPayload?.entry ?? 0);
  const stopLoss = Number(row.stop_loss ?? analysisPayload?.stopLoss ?? 0);
  const takeProfit = Number(row.take_profit ?? analysisPayload?.takeProfit ?? analysisPayload?.tp1 ?? 0);
  const analysis = analysisPayload?.analysis ?? {
    tradeReason: String(row.trade_reasoning ?? row.reason ?? 'Execution reason saved with trade.'),
    technicalAlignment: String(row.technical_alignment ?? row.reason ?? 'Technical alignment saved in AI analysis history.'),
    macroAlignment: String(row.macro_alignment ?? 'Macro alignment saved in AI analysis history.'),
    invalidation: String(row.invalidation ?? 'Invalidation saved with trade.'),
    riskProfile: String(row.execution_bias ?? row.notes ?? 'Risk profile saved with trade.'),
    marketStructure: String(row.market_structure ?? 'N/A'),
    liquiditySummary: String(row.liquidity_summary ?? 'N/A'),
    executionBias: String(row.execution_bias ?? 'N/A'),
    probabilityGrade: String(row.probability_grade ?? 'N/A'),
    executionSummary: String(row.execution_summary ?? row.notes ?? 'N/A'),
  };

  return {
    id: row.id,
    pair: row.pair,
    timeframe: fromDbTimeframe(row.timeframe),
    tradingStyle: analysisPayload?.tradingStyle ?? 'Day Trader',
    signal: direction,
    direction,
    confidence: Number(analysisPayload?.confidence ?? row.confidence ?? row.alignment_score ?? 0),
    entry,
    stopLoss,
    takeProfit,
    tp1: takeProfit,
    tp2: Number(analysisPayload?.tp2 ?? takeProfit),
    tp3: Number(analysisPayload?.tp3 ?? takeProfit),
    riskReward: analysisPayload?.riskReward ?? `1:${Number(row.risk_reward_ratio ?? row.r_multiple ?? 0).toFixed(1)}`,
    analysis,
    validationLayers: analysisPayload?.validationLayers ?? [],
    rejectedSetups: analysisPayload?.rejectedSetups ?? [],
    blockedReasons: analysisPayload?.blockedReasons ?? [],
    session: analysisPayload?.session ?? 'London',
    protectedSetups: Number(analysisPayload?.protectedSetups ?? 0),
    createdAt: row.trade_date ?? row.created_at ?? new Date().toISOString(),
    rawWebhook: analysisPayload?.rawWebhook ?? {
      final_action: direction,
      confidence: Number(analysisPayload?.confidence ?? row.confidence ?? row.alignment_score ?? 0),
      probability_grade: analysis.probabilityGrade,
      execution_bias: analysis.executionBias,
      entry: { price: entry },
      stop_loss: { price: stopLoss },
      take_profit: { price: takeProfit },
      market_structure: analysis.marketStructure,
      liquidity_summary: analysis.liquiditySummary,
      macro_alignment: analysis.macroAlignment,
      technical_alignment: analysis.technicalAlignment,
      trade_reasoning: analysis.tradeReason,
      invalidation: analysis.invalidation,
      execution_summary: analysis.executionSummary,
    },
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
