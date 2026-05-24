import { AnalysisFormState, GeneratedSignal, SignalDirection, Timeframe, WebhookSourcePayload } from '../types/reasontrack';

const rawWebhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL as string | undefined;
const N8N_WEBHOOK_URL = rawWebhookUrl?.trim();

type RawWebhookResponse = Partial<WebhookSourcePayload> | Array<Partial<WebhookSourcePayload>> | null | undefined;

export async function callN8nWebhook(form: AnalysisFormState): Promise<GeneratedSignal> {
  validateAnalyzeForm(form);
  if (!N8N_WEBHOOK_URL) {
    throw new Error('Missing VITE_N8N_WEBHOOK_URL');
  }

  const payload = {
    pair: requireString(form.pair, 'pair'),
    capital: requireNumber(form.capital, 'capital'),
    rr: requireString(form.riskReward, 'rr'),
    riskTolerance: requireString(form.riskTolerance, 'riskTolerance').toLowerCase(),
    tradingStyle: requireString(form.tradingStyle, 'tradingStyle').toLowerCase(),
    experience: requireString(form.experience, 'experience').toLowerCase(),
  };

  console.debug('[deploy] env check', {
    hasSupabaseUrl: Boolean(import.meta.env.VITE_SUPABASE_URL),
    hasSupabaseAnonKey: Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY),
    hasWebhookUrl: Boolean(N8N_WEBHOOK_URL),
  });
  console.debug('[deploy] webhook URL', N8N_WEBHOOK_URL);
  console.debug('[analyze] payload', payload);

  const response = await fetch(N8N_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    mode: 'cors',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Webhook failed with status ${response.status}`);
  }

  const data = (await response.json()) as RawWebhookResponse;
  console.debug('[analyze] raw webhook response', data);

  return transformWebhookResponse(data, form);
}

export function transformWebhookResponse(raw: RawWebhookResponse, form: AnalysisFormState): GeneratedSignal {
  const trade = Array.isArray(raw) ? raw[0] : raw;
  if (!trade || typeof trade.final_action !== 'string' || !trade.final_action.trim()) {
    throw new Error('Webhook returned empty trade response');
  }

  const action = normalizeAction(trade.final_action);
  const normalizedTrade = sanitizeWebhookTrade(trade);
  console.debug('[analyze] normalized trade', normalizedTrade);

  const renderedSignal: GeneratedSignal = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    pair: payloadPair(form.pair),
    timeframe: normalizeTimeframe(form.timeframe),
    tradingStyle: form.tradingStyle,
    action,
    signal: action,
    direction: action,
    confidence: normalizedTrade.confidence,
    entry: normalizedTrade.entry.price,
    stopLoss: normalizedTrade.stop_loss.price,
    takeProfit: normalizedTrade.take_profit.price,
    tp1: normalizedTrade.take_profit.price,
    tp2: normalizedTrade.take_profit.price,
    tp3: normalizedTrade.take_profit.price,
    riskReward: normalizedTrade.risk_reward ?? form.riskReward,
    summary: normalizedTrade.execution_summary,
    reasoning: normalizedTrade.trade_reasoning,
    analysis: {
      tradeReason: normalizedTrade.trade_reasoning,
      technicalAlignment: normalizedTrade.technical_alignment,
      macroAlignment: normalizedTrade.macro_alignment,
      invalidation: normalizedTrade.invalidation,
      riskProfile: normalizedTrade.execution_bias,
      marketStructure: normalizedTrade.market_structure,
      liquiditySummary: normalizedTrade.liquidity_summary,
      executionBias: normalizedTrade.execution_bias,
      probabilityGrade: normalizedTrade.probability_grade,
      executionSummary: normalizedTrade.execution_summary,
    },
    validationLayers: [],
    rejectedSetups: [],
    blockedReasons: [],
    session: inferSession(form.timeframe),
    protectedSetups: 0,
    createdAt: new Date().toISOString(),
    rawWebhook: normalizedTrade,
  };

  console.debug('[analyze] final rendered state', renderedSignal);
  return renderedSignal;
}

function sanitizeWebhookTrade(trade: Partial<WebhookSourcePayload> & { risk_reward?: string }) {
  return {
    final_action: requireString(trade.final_action, 'final_action'),
    confidence: requireNumber(trade.confidence, 'confidence'),
    probability_grade: safeString(trade.probability_grade),
    execution_bias: safeString(trade.execution_bias),
    entry: { price: requireNumber(trade.entry?.price, 'entry.price') },
    stop_loss: { price: requireNumber(trade.stop_loss?.price, 'stop_loss.price') },
    take_profit: { price: requireNumber(trade.take_profit?.price, 'take_profit.price') },
    risk_reward: safeString(trade.risk_reward, 'N/A'),
    market_structure: safeString(trade.market_structure),
    liquidity_summary: safeString(trade.liquidity_summary),
    macro_alignment: safeString(trade.macro_alignment),
    technical_alignment: safeString(trade.technical_alignment),
    trade_reasoning: safeString(trade.trade_reasoning),
    invalidation: safeString(trade.invalidation),
    execution_summary: safeString(trade.execution_summary),
  };
}

function validateAnalyzeForm(form: AnalysisFormState) {
  requireString(form.pair, 'pair');
  requireNumber(form.capital, 'capital');
  requireString(form.riskReward, 'rr');
  requireString(form.riskTolerance, 'riskTolerance');
  requireString(form.tradingStyle, 'tradingStyle');
  requireString(form.experience, 'experience');
}

function normalizeAction(value: string): SignalDirection {
  const normalized = value.trim().toUpperCase();
  if (normalized === 'BUY') return 'BUY';
  if (normalized === 'SELL') return 'SELL';
  throw new Error(`Unexpected webhook action: ${value}`);
}

function payloadPair(value: string) {
  return value.trim();
}

function normalizeTimeframe(timeframe: Timeframe) {
  return timeframe;
}

function inferSession(timeframe: Timeframe) {
  return timeframe === '4H' ? 'New York' : 'London';
}

function safeString(value: unknown, fallback = 'N/A') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function requireString(value: unknown, field: string) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Missing required field: ${field}`);
  }
  return value.trim();
}

function requireNumber(value: unknown, field: string) {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid number for field: ${field}`);
  }
  return parsed;
}
