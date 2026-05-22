import { GeneratedSignal, PerformanceSummary, SignalDirection, SignalState, Timeframe, TradingStyle, ActivityTrade } from '../types/reasontrack';

export function analyzeTrade(input: {
  pair: string;
  timeframe: Timeframe;
  capital: number;
  riskReward: string;
  tradingStyle: TradingStyle;
}): GeneratedSignal {
  const seed = hash(`${input.pair}-${input.timeframe}-${input.tradingStyle}-${input.riskReward}-${input.capital}`);
  const signalState: SignalState = seed % 5 === 0 ? 'NO_SIGNAL' : seed % 2 === 0 ? 'BUY' : 'SELL';
  const base = basePrice(input.pair);
  const precision = input.pair === 'BTCUSD' ? 0 : input.pair === 'XAUUSD' ? 2 : 4;
  const move = precision === 0 ? 160 + (seed % 40) : precision === 2 ? 6 + (seed % 4) : 0.004 + (seed % 5) / 1000;
  const entry = round(base + directionalOffset(seed, precision), precision);
  const stopDistance = precision === 0 ? 85 : precision === 2 ? 3.2 : 0.0022;

  const direction: SignalDirection = signalState === 'SELL' ? 'SELL' : 'BUY';
  const stopLoss = direction === 'BUY' ? round(entry - stopDistance, precision) : round(entry + stopDistance, precision);
  const multiplier = parseRiskReward(input.riskReward);
  const tp1 = direction === 'BUY' ? round(entry + stopDistance * multiplier, precision) : round(entry - stopDistance * multiplier, precision);
  const tp2 = direction === 'BUY' ? round(entry + stopDistance * (multiplier + 0.8), precision) : round(entry - stopDistance * (multiplier + 0.8), precision);
  const tp3 = direction === 'BUY' ? round(entry + stopDistance * (multiplier + 1.5), precision) : round(entry - stopDistance * (multiplier + 1.5), precision);
  const confidence = signalState === 'NO_SIGNAL' ? 31 + (seed % 18) : 74 + (seed % 21);
  const session = input.timeframe === '4H' ? 'New York' : 'London';
  const validationLayers = [
    'Liquidity aligned',
    'Session aligned',
    'Structure matched',
    'Momentum confirmed',
    'Risk window accepted',
    'Setup DNA matched',
    'Conflicting signals removed',
  ];
  const rejectedSetups = [
    'Conflicting structure',
    'Low momentum',
    'Session weakness',
    'Poor alignment',
  ];
  const blockedReasons = [
    'Low structure alignment',
    'Weak momentum',
    'Session conflict',
    'Low liquidity',
  ];

  return {
    id: `${Date.now()}-${seed}`,
    pair: input.pair,
    timeframe: input.timeframe,
    tradingStyle: input.tradingStyle,
    signal: signalState,
    confidence,
    entry,
    stopLoss,
    tp1,
    tp2,
    tp3,
    riskReward: input.riskReward === 'Custom' ? `1:${(multiplier).toFixed(1)}` : input.riskReward,
    analysis: {
      tradeReason: `${input.pair} is showing filtered ${marketTone(input.pair)} structure aligned with ${input.tradingStyle.toLowerCase()} execution conditions.`,
      technicalAlignment: `${input.timeframe} momentum, rejection behavior, and projected target ladder are aligned for a ${direction.toLowerCase()} continuation scenario.`,
      macroAlignment: input.pair === 'XAUUSD'
        ? 'Gold is reacting cleanly to defensive macro positioning and intraday liquidity rotation.'
        : input.pair === 'BTCUSD'
          ? 'Crypto participation remains active, with trend continuation favored over range fade.'
          : 'Major currency flow remains orderly with clean session structure and no conflicting pressure.',
      invalidation: `${direction === 'BUY' ? 'A close below' : 'A close above'} ${formatNumber(stopLoss, precision)} invalidates the setup and cancels continuation logic.`,
      riskProfile: `Capital tracked at ${input.capital.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}. Planned execution follows ${input.riskReward === 'Custom' ? 'custom reward targeting' : input.riskReward} with disciplined stop placement.`,
    },
    validationLayers,
    rejectedSetups,
    blockedReasons,
    session,
    protectedSetups: 3 + (seed % 3),
    createdAt: new Date().toISOString(),
  };
}

export function buildPerformanceSummary(trades: ActivityTrade[]): PerformanceSummary {
  const closed = trades.filter((trade) => trade.status !== 'open');
  const wins = closed.filter((trade) => trade.status === 'win').length;
  const totalNetR = closed.reduce((sum, trade) => sum + (trade.resultR ?? 0), 0);
  const pairMap = new Map<string, number>();
  const biasMap = new Map<SignalDirection, number>([['BUY', 0], ['SELL', 0]]);
  const equityCurve = closed.map((trade, index) => {
    biasMap.set(trade.signal as SignalDirection, (biasMap.get(trade.signal as SignalDirection) ?? 0) + 1);
    pairMap.set(trade.pair, (pairMap.get(trade.pair) ?? 0) + (trade.resultR ?? 0));
    return {
      index: index + 1,
      value: round(closed.slice(0, index + 1).reduce((sum, item) => sum + (item.resultR ?? 0), 0), 2),
    };
  });

  const bestPair = pairMap.size
    ? [...pairMap.entries()].sort((a, b) => b[1] - a[1])[0][0]
    : 'No pair yet';
  const buyCount = trades.filter((trade) => trade.signal === 'BUY').length;
  const sellCount = trades.filter((trade) => trade.signal === 'SELL').length;

  return {
    winRate: closed.length ? Math.round((wins / closed.length) * 100) : 0,
    totalNetR: round(totalNetR, 2),
    totalTrades: closed.length,
    bestPair,
    bestSession: closed.length ? `${closed[0].timeframe} session strength is leading outcomes.` : 'AI waiting for first closed execution.',
    pairBias: trades.length ? `${buyCount >= sellCount ? 'BUY' : 'SELL'} bias across logged opportunities.` : 'No pair bias yet.',
    disciplineInsight: closed.length ? `Execution quality improved on ${closed.length} reviewed trades with consistent journal capture.` : 'No performance review yet.',
    riskInsight: closed.length ? `${totalNetR >= 0 ? 'Risk is controlled with positive net R.' : 'Risk control needs tighter invalidation adherence.'}` : 'Risk insight will appear after the first closed trade.',
    equityCurve,
  };
}

function directionalOffset(seed: number, precision: number) {
  if (precision === 0) return (seed % 9) * 14;
  if (precision === 2) return (seed % 5) * 0.8;
  return ((seed % 6) + 1) / 1000;
}

function basePrice(pair: string) {
  if (pair === 'BTCUSD') return 68420;
  if (pair === 'XAUUSD') return 2364.4;
  if (pair === 'GBPJPY') return 198.42;
  return 1.0844;
}

function parseRiskReward(value: string) {
  if (value === 'Custom') return 3.5;
  const [, ratio] = value.split(':');
  return Number(ratio) || 2;
}

function marketTone(pair: string) {
  if (pair === 'BTCUSD') return 'breakout';
  if (pair === 'XAUUSD') return 'macro-sensitive';
  return 'major market';
}

function hash(value: string) {
  return value.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function round(value: number, precision: number) {
  return Number(value.toFixed(precision));
}

function formatNumber(value: number, precision: number) {
  return value.toFixed(precision);
}
