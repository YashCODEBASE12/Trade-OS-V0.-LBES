/**
 * LBES Execution AI - Deterministic Risk Engine (TypeScript)
 *
 * Production-grade, fully typed, zero-dependency risk calculation layer.
 * This is the instant, explainable core of the trading experience.
 *
 * Guarantees:
 * - 100% deterministic output from inputs
 * - Strict validation with clear error messages
 * - Professional reasoning + mandatory invalidation conditions
 * - Profile-aware (respects user's max risk, min RR, etc.)
 */

export type TradeSide = 'long' | 'short';

export interface TradeInput {
  pair: string;
  side: TradeSide;
  capital: number;
  riskPct: number;
  entry: number;
  stopLoss: number;
  takeProfit?: number;
  rr?: number;
  notes?: string;
}

export interface RiskProfile {
  riskTolerance: number;
  accountSize: number;
  maxRiskPerTradePct: number;
  minRrPreferred: number;
  tradingExperience: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  preferredAssets: string[];
}

export interface PositionSizeResult {
  pair: string;
  side: TradeSide;
  positionSize: number;
  riskAmount: number;
  rewardAmount: number;
  rr: number;
  riskPct: number;
  confidence: number;
  reasoning: string[];
  invalidationConditions: string[];
  actionRecommendation: 'PROCEED' | 'REVIEW' | 'AVOID';
  calculatedAt: string;
}

export class RiskEngineError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RiskEngineError';
  }
}

export function calculatePositionSize(
  input: TradeInput,
  profile?: Partial<RiskProfile>
): PositionSizeResult {
  // === Validation ===
  if (!input.pair || input.pair.length < 3) throw new RiskEngineError('Invalid trading pair');
  if (input.entry <= 0 || input.stopLoss <= 0) throw new RiskEngineError('Entry and Stop Loss must be positive');
  if (input.capital <= 0 || input.riskPct <= 0) throw new RiskEngineError('Capital and Risk % must be positive');

  const priceRisk = Math.abs(input.entry - input.stopLoss);
  if (priceRisk <= 0) throw new RiskEngineError('Entry and Stop Loss cannot be the same price');

  if (input.side === 'long') {
    if (input.stopLoss >= input.entry) throw new RiskEngineError('For LONG trades, Stop Loss must be BELOW Entry');
    if (input.takeProfit && input.takeProfit <= input.entry) throw new RiskEngineError('For LONG trades, Take Profit must be ABOVE Entry');
  } else {
    if (input.stopLoss <= input.entry) throw new RiskEngineError('For SHORT trades, Stop Loss must be ABOVE Entry');
    if (input.takeProfit && input.takeProfit >= input.entry) throw new RiskEngineError('For SHORT trades, Take Profit must be BELOW Entry');
  }

  if (!input.takeProfit && !input.rr) {
    throw new RiskEngineError('You must provide either Take Profit or Risk-Reward ratio');
  }

  // === Calculation ===
  const effectiveRiskPct = profile?.maxRiskPerTradePct
    ? Math.min(input.riskPct, profile.maxRiskPerTradePct)
    : input.riskPct;

  const riskAmount = input.capital * (effectiveRiskPct / 100);
  const positionSize = riskAmount / priceRisk;

  let rewardAmount = 0;
  let rr = 0;

  if (input.takeProfit) {
    const priceReward = Math.abs(input.takeProfit - input.entry);
    rewardAmount = positionSize * priceReward;
    rr = priceReward / priceRisk;
  } else if (input.rr) {
    rr = input.rr;
    rewardAmount = positionSize * (rr * priceRisk);
  }

  // === Recommendation + Confidence ===
  const minRr = profile?.minRrPreferred ?? 1.5;
  let action: 'PROCEED' | 'REVIEW' | 'AVOID' = 'PROCEED';
  let confidence = 0.65;

  if (rr < minRr) {
    action = rr < 1.0 ? 'AVOID' : 'REVIEW';
    confidence = 0.45;
  } else if (rr >= minRr * 1.5) {
    confidence = 0.88;
  } else {
    confidence = 0.78;
  }

  if (profile?.tradingExperience === 'advanced' || profile?.tradingExperience === 'professional') {
    confidence = Math.min(0.95, confidence + 0.07);
  }

  // === Reasoning ===
  const reasoning: string[] = [
    `Risking ${effectiveRiskPct.toFixed(1)}% of capital ($${riskAmount.toFixed(2)}) as per your profile rules.`,
    `Position sized to ${positionSize.toFixed(4)} units so a ${priceRisk.toFixed(5)} move to stop loss risks exactly $${riskAmount.toFixed(2)}.`,
  ];

  if (rr >= minRr) {
    reasoning.push(`Reward-to-risk of ${rr.toFixed(2)}:1 meets or exceeds your preferred minimum of ${minRr.toFixed(1)}:1.`);
  } else {
    reasoning.push(`Reward-to-risk of ${rr.toFixed(2)}:1 is below your preferred minimum of ${minRr.toFixed(1)}:1 — review carefully.`);
  }

  if (action === 'PROCEED') {
    reasoning.push('Setup quality supports execution. Define your invalidation clearly before entry.');
  } else if (action === 'REVIEW') {
    reasoning.push('Risk-reward is marginal. Consider tightening the stop loss or waiting for a higher-quality setup.');
  } else {
    reasoning.push('Risk-reward is poor. Strongly consider skipping this setup.');
  }

  // === Invalidation Conditions (non-negotiable discipline) ===
  const invalidationConditions: string[] = [
    `Price closes beyond your stop loss (${input.stopLoss}) on your execution timeframe.`,
    'You cannot clearly define why you would be wrong before entering.',
    'Higher timeframe (4H/Daily) shows clear structure shift against your direction.',
  ];

  if (input.side === 'long') {
    invalidationConditions.push('Liquidity sweep below recent swing low without bullish follow-through.');
  } else {
    invalidationConditions.push('Liquidity sweep above recent swing high without bearish follow-through.');
  }
  invalidationConditions.push('Any high-impact news or fundamental event that directly contradicts your directional bias.');

  return {
    pair: input.pair.toUpperCase(),
    side: input.side,
    positionSize: parseFloat(positionSize.toFixed(4)),
    riskAmount: parseFloat(riskAmount.toFixed(2)),
    rewardAmount: parseFloat(rewardAmount.toFixed(2)),
    rr: parseFloat(rr.toFixed(2)),
    riskPct: effectiveRiskPct,
    confidence: parseFloat(confidence.toFixed(2)),
    reasoning,
    invalidationConditions,
    actionRecommendation: action,
    calculatedAt: new Date().toISOString(),
  };
}
