import { PairOption } from '../types/reasontrack';

export const pairOptions: PairOption[] = [
  { value: 'EURUSD', label: 'EURUSD', subtitle: 'Major FX structure', market: 'fx' },
  { value: 'BTCUSD', label: 'BTCUSD', subtitle: 'Crypto momentum flow', market: 'crypto' },
  { value: 'XAUUSD', label: 'XAUUSD', subtitle: 'Gold macro reaction', market: 'metal' },
  { value: 'GBPJPY', label: 'GBPJPY', subtitle: 'Volatility expansion', market: 'fx' },
];

export const riskRewardOptions = ['1:2', '1:2.5', '1:3', '1:4', 'Custom'];

export const labsCards = [
  {
    id: 'dna',
    title: 'Personal Strategy DNA',
    description: 'Execution profiling for your strongest recurring setups.',
    badge: 'Learning layer',
    problem: 'Most tools treat every trader the same. LBES needs to understand how your execution quality changes by pair, session, and trigger.',
    futureVision: 'ReasonTrack learns your execution behavior and adapts filtering to the setups you actually perform best.',
    howItWorks: 'Your historical signals are mapped into an internal heatmap of pair, timeframe, confidence, and result patterns.',
    benefit: 'The AI starts prioritizing trades that fit your real behavior profile instead of generic setup logic.',
    example: 'Heatmap visualization',
    visual: 'dna',
  },
  {
    id: 'voice',
    title: 'Voice Trade Assistant',
    description: 'Hands-free signal capture during fast sessions.',
    badge: 'Voice layer',
    problem: 'Typing market context during active sessions breaks focus and slows execution review.',
    futureVision: 'A voice-first command layer lets traders speak to the execution engine while staying in market flow.',
    howItWorks: 'Voice commands convert directly into pair, timeframe, and analysis prompts that ReasonTrack can process.',
    benefit: 'Faster signal checks, less friction, and cleaner hands-free journaling during high-speed sessions.',
    example: '"Analyze BTC on 15m"',
    visual: 'voice',
  },
  {
    id: 'expansion',
    title: '50+ Pair Expansion',
    description: 'A wider universe without breaking the mobile-first workflow.',
    badge: 'Market layer',
    problem: 'Opportunity quality changes by session, and a narrow instrument list can block the best execution windows.',
    futureVision: 'LBES expands into a larger multi-market universe while preserving the same mobile filtering flow.',
    howItWorks: 'Pair clusters are grouped into watch universes with session-aware ranking and execution confidence.',
    benefit: 'More opportunity without turning the app into a noisy chart terminal.',
    example: 'Animated world grid',
    visual: 'grid',
  },
  {
    id: 'broker',
    title: 'Broker Auto Execution',
    description: 'Direct future order routing layered on top of LBES filtering.',
    badge: 'Execution layer',
    problem: 'Manual order placement adds delay between conviction and action, especially when multiple signals compete for attention.',
    futureVision: 'A one tap execution layer routes validated signals into connected broker infrastructure.',
    howItWorks: 'Future MCP broker connections will support Exness, MT5, and execution routing from signal approval to order dispatch.',
    benefit: 'Cleaner execution timing, fewer manual steps, and tighter alignment between filtered signal and placed order.',
    example: 'Premium lock',
    visual: 'broker',
  },
];

export const proTiers = [
  {
    name: 'FREE',
    price: '$0',
    features: ['2 trades/day', 'signal confidence'],
    cta: 'Current Tier',
  },
  {
    name: 'PRO',
    price: '$5',
    features: ['priority pairs', 'macro validation', 'advanced filtering'],
    cta: 'Unlock PRO',
  },
  {
    name: 'ELITE',
    price: '$29',
    features: ['50+ pairs', 'future broker execution'],
    cta: 'Go Elite',
  },
];
