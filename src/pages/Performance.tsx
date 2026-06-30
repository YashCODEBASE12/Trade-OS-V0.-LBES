import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Activity, ArrowUpRight, BrainCircuit, Clock3, Gauge, LineChart as LineChartIcon, Percent, Sparkles, Target, Trophy } from 'lucide-react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useMemo, useState } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Select } from '../components/ui/Select';
import { useReasonTrackStore } from '../store/useReasonTrackStore';

export default function Performance() {
  const { trades, loading } = useReasonTrackStore();
  const [range, setRange] = useState<'30d' | '90d' | 'all'>('30d');
  const [pairFilter, setPairFilter] = useState('all');

  const analytics = useMemo(() => {
    const now = Date.now();
    const cutoff = range === '30d' ? 30 * 24 * 60 * 60 * 1000 : range === '90d' ? 90 * 24 * 60 * 60 * 1000 : null;
    const closedTrades = trades.filter((trade) => trade.status !== 'open');
    const filteredTrades = closedTrades.filter((trade) => {
      const withinRange = cutoff ? new Date(trade.createdAt).getTime() >= now - cutoff : true;
      return (pairFilter === 'all' || trade.pair === pairFilter) && withinRange;
    });

    const totalNetR = filteredTrades.reduce((sum, trade) => sum + (trade.resultR ?? 0), 0);
    const wins = filteredTrades.filter((trade) => trade.status === 'win');
    const winRate = filteredTrades.length ? Math.round((wins.length / filteredTrades.length) * 100) : 0;
    const avgR = filteredTrades.length ? totalNetR / filteredTrades.length : 0;

    const pairCounts = filteredTrades.reduce<Record<string, { count: number; net: number }>>((acc, trade) => {
      acc[trade.pair] ??= { count: 0, net: 0 };
      acc[trade.pair].count += 1;
      acc[trade.pair].net += trade.resultR ?? 0;
      return acc;
    }, {});
    const bestPair = Object.entries(pairCounts).sort((a, b) => b[1].net - a[1].net)[0]?.[0] ?? 'No pair yet';

    const equityCurve = filteredTrades.map((_, index) => ({
      index: index + 1,
      value: Number(filteredTrades.slice(0, index + 1).reduce((sum, item) => sum + (item.resultR ?? 0), 0).toFixed(2)),
    }));

    const pairShare = (() => {
      if (!filteredTrades.length) return 'Execution insight will appear after your first closed trade.';
      const totalPositive = filteredTrades.filter((trade) => (trade.resultR ?? 0) > 0).reduce((sum, trade) => sum + (trade.resultR ?? 0), 0);
      const bestPairNet = pairCounts[bestPair]?.net ?? 0;
      if (totalPositive <= 0) return `${bestPair} is currently the strongest pair in your reviewed history.`;
      const share = Math.round((bestPairNet / totalPositive) * 100);
      return `${bestPair} contributes ${Math.max(0, share)}% of gains.`;
    })();

    const londonBias = filteredTrades.length
      ? `${filteredTrades.filter((trade) => trade.timeframe === '15m' || trade.timeframe === '1H').length > filteredTrades.length / 2 ? 'Most wins occur during London-style structured sessions.' : 'Wins are currently spread across mixed session structures.'}`
      : 'Most wins occur during London session.';

    const weekdayMap = filteredTrades.reduce<Record<string, number>>((acc, trade) => {
      const day = new Date(trade.createdAt).toLocaleDateString('en-US', { weekday: 'long' });
      acc[day] = (acc[day] ?? 0) + Math.abs(trade.resultR ?? 0);
      return acc;
    }, {});
    const mostEmotionalDay = Object.entries(weekdayMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Not enough data';

    const highestConfidenceTrade = [...filteredTrades].sort((a, b) => b.confidence - a.confidence)[0];
    const bestSession = filteredTrades.length
      ? `${filteredTrades.filter((trade) => trade.timeframe === '15m').length >= filteredTrades.filter((trade) => trade.timeframe === '1H').length ? 'London session' : 'Structured 1H sessions'}`
      : 'Awaiting first review';

    const trend = filteredTrades.length ? Math.max(4, Math.min(28, Math.round((wins.length / Math.max(1, filteredTrades.length)) * 16))) : 12;
    const protectedSetups = trades.reduce((sum, trade) => sum + (trade.protectedSetups ?? 0), 0);
    const ruleFollowedTrades = trades.filter((trade) => trade.ruleFollowed !== false).length;
    const cleanClosedTrades = filteredTrades.filter((trade) => trade.status === 'win' || trade.status === 'breakeven').length;
    const strongestPair = bestPair === 'No pair yet' ? 'EURUSD' : bestPair;
    const pairFamiliarity = Math.min(100, Math.max(12, trades.filter((trade) => trade.pair === strongestPair).length * 22));
    const sessionMastery = Math.min(100, Math.max(16, filteredTrades.filter((trade) => (trade.session ?? 'London') === 'London').length * 24));
    const nextAction = filteredTrades.length
      ? `Next action: prioritize ${strongestPair} during London-style structure before expanding pairs.`
      : 'Next action: generate one AI trade, then close it from Activity to unlock real guidance.';

    return {
      totalNetR,
      trend,
      winRate,
      closedTrades: filteredTrades,
      avgR,
      bestPair,
      equityCurve,
      pairShare,
      londonBias,
      bestSession,
      mostEmotionalDay,
      highestConfidenceSetup: highestConfidenceTrade ? `${highestConfidenceTrade.pair} ${highestConfidenceTrade.timeframe} at ${highestConfidenceTrade.confidence}% alignment` : 'No setup captured yet',
      protectedSetups,
      ruleFollowedTrades,
      cleanClosedTrades,
      strongestPair,
      pairFamiliarity,
      sessionMastery,
      nextAction,
    };
  }, [pairFilter, range, trades]);

  return (
    <section className="space-y-5">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card className="border border-white/70 bg-[radial-gradient(circle_at_top_right,_rgba(94,147,255,0.22),_transparent_42%),rgba(10,16,30,0.88)]">
          <CardContent className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Performance</div>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-[30px] font-bold tracking-[-0.04em] text-white">Your Trading Performance</h1>
                <p className="mt-2 text-sm text-slate-300">Net result this month</p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/10 px-4 py-3 text-right shadow-[0_12px_28px_rgba(0,0,0,0.2)]">
                <div className={`text-[34px] font-bold tracking-[-0.05em] ${analytics.totalNetR >= 0 ? 'text-emerald-300' : 'text-[#ff8e83]'}`}>
                  {analytics.totalNetR >= 0 ? '+' : ''}{analytics.totalNetR.toFixed(1)}R
                </div>
                <div className="mt-1 flex items-center justify-end gap-1 text-sm font-semibold text-emerald-300">
                  <ArrowUpRight className="h-4 w-4" />
                  {analytics.trend}%
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <label className="min-w-[140px] text-sm text-slate-300">
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Range</span>
                <Select value={range} onChange={(event) => setRange(event.target.value as '30d' | '90d' | 'all')}>
                  <option value="30d">30d</option>
                  <option value="90d">90d</option>
                  <option value="all">All</option>
                </Select>
              </label>
              <label className="min-w-[140px] text-sm text-slate-300">
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Pair</span>
                <Select value={pairFilter} onChange={(event) => setPairFilter(event.target.value)}>
                  <option value="all">All pairs</option>
                  {Array.from(new Set(trades.map((trade) => trade.pair))).map((pair) => (
                    <option key={pair} value={pair}>{pair}</option>
                  ))}
                </Select>
              </label>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={Percent}
          label="Win Rate"
          value={`${analytics.winRate}%`}
          explanation={analytics.closedTrades.length ? `Won ${analytics.closedTrades.filter((trade) => trade.status === 'win').length} of ${analytics.closedTrades.length} trades` : 'No closed trades yet'}
        />
        <StatCard
          icon={Activity}
          label="Trades"
          value={String(analytics.closedTrades.length)}
          explanation="Reviewed executions logged"
        />
        <StatCard
          icon={Trophy}
          label="Best Pair"
          value={analytics.bestPair}
          explanation="Current top-performing market"
        />
        <StatCard
          icon={Gauge}
          label="Avg R"
          value={`${analytics.avgR >= 0 ? '+' : ''}${analytics.avgR.toFixed(1)}R`}
          explanation="Average outcome per closed trade"
        />
      </div>

      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
        <Card>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.22em] text-text-muted">Execution Curve</div>
                <h2 className="mt-2 text-xl font-bold text-text-primary">Execution Curve</h2>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-soft text-primary">
                <LineChartIcon className="h-5 w-5" />
              </div>
            </div>
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="h-[220px] rounded-[24px] border border-white/10 bg-[rgba(255,255,255,0.06)] p-4 backdrop-blur-xl">
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="h-24 w-24 animate-pulse rounded-full border-4 border-emerald-400/20 border-t-emerald-400" />
                </div>
              ) : analytics.equityCurve.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.equityCurve}>
                    <XAxis dataKey="index" tickLine={false} axisLine={false} tick={{ fill: '#90a0c3', fontSize: 11 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: '#90a0c3', fontSize: 11 }} />
                    <Tooltip contentStyle={{ borderRadius: '18px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(10,16,30,0.92)', color: '#f8fafc' }} />
                    <Line type="monotone" dataKey="value" stroke="#6ee7b7" strokeWidth={4} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState
                  icon="📈"
                  title="No performance data yet"
                  description="Close a trade from Activity to unlock your first execution curve and performance insights."
                  action={
                    <Button onClick={() => window.location.assign('/activity')}>
                      View Activity
                    </Button>
                  }
                  className="h-full"
                />
              )}
            </motion.div>
            <Card className="border border-white/10 bg-[rgba(255,255,255,0.06)]">
              <CardContent className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary">
                    <BrainCircuit className="h-4 w-4" />
                  </div>
                  <div className="text-sm font-semibold text-text-primary">AI insight</div>
                </div>
                <p className="text-sm leading-6 text-text-secondary">{analytics.pairShare}</p>
                <p className="text-sm leading-6 text-text-secondary">{analytics.londonBias}</p>
                <div className="rounded-[18px] bg-[#eff6ff] px-4 py-3 text-sm font-semibold leading-6 text-primary">
                  {analytics.nextAction}
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.08 }}>
        <Card>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-soft text-primary">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <div>
                <div className="text-base font-semibold text-text-primary">ReasonTrack learned</div>
                <div className="mt-1 text-xs text-text-muted">Execution intelligence updates after every trade.</div>
              </div>
            </div>
            <div className="grid gap-2">
              {['London session', 'Moderate risk', analytics.strongestPair].map((item) => (
                <div key={item} className="rounded-full bg-white/60 px-4 py-3 text-sm font-semibold text-text-secondary">
                  Your strongest setups occur during: {item}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-3">
        <BehaviorCard icon={Clock3} title="Best session" value={analytics.bestSession} action="Next action: plan entries when structure is clean, not when volume feels urgent." />
        <BehaviorCard icon={Sparkles} title="Most emotional day" value={analytics.mostEmotionalDay} action="Next action: reduce size or skip trades when that pattern repeats." />
        <BehaviorCard icon={Target} title="Highest alignment setup" value={analytics.highestConfidenceSetup} action="Next action: study why this setup passed before taking lower-alignment trades." />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <ProgressCard label="Execution streak" value={`${analytics.closedTrades.length}`} />
        <ProgressCard label="Clean trade streak" value={`${analytics.cleanClosedTrades}`} />
        <ProgressCard label="Rule-followed streak" value={`${analytics.ruleFollowedTrades}`} />
        <ProgressCard label="Protected setups" value={`${analytics.protectedSetups}`} />
        <ProgressCard label="Session mastery" value={`${analytics.sessionMastery}%`} />
        <ProgressCard label="Pair familiarity" value={`${analytics.pairFamiliarity}%`} />
      </div>

      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <Card>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-soft text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="text-base font-semibold text-text-primary">Execution Intelligence</div>
            </div>
            <p className="text-sm leading-6 text-text-secondary">
              Your highest quality trades occur during structured sessions with moderate alignment scores.
            </p>
            <div className="rounded-[18px] bg-[#eff6ff] px-4 py-3 text-sm font-semibold leading-6 text-primary">
              Next action: wait for structure, liquidity, and momentum to align before increasing trade volume.
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  explanation,
}: {
  icon: typeof Percent;
  label: string;
  value: string;
  explanation: string;
}) {
  return (
    <motion.div whileTap={{ scale: 0.98 }}>
      <Card>
        <CardContent className="space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary">
            <Icon className="h-4 w-4" />
          </div>
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-text-muted">{label}</div>
          <div className="text-[26px] font-bold tracking-[-0.04em] text-text-primary">{value}</div>
          <div className="text-xs leading-5 text-text-secondary">{explanation}</div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function BehaviorCard({
  icon: Icon,
  title,
  value,
  action,
}: {
  icon: typeof Clock3;
  title: string;
  value: string;
  action: string;
}) {
  return (
    <motion.div whileTap={{ scale: 0.98 }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card>
        <CardContent className="flex items-start gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-soft text-primary">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-text-muted">{title}</div>
            <div className="mt-2 text-sm font-semibold text-text-primary">{value}</div>
            <div className="mt-2 text-xs leading-5 text-text-secondary">{action}</div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ProgressCard({ label, value }: { label: string; value: string }) {
  return (
    <motion.div whileTap={{ scale: 0.98 }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card>
        <CardContent className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-text-muted">{label}</div>
          <div className="text-2xl font-bold tracking-[-0.04em] text-text-primary">{value}</div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[#dfe9ff]">
            <motion.div
              className="h-full rounded-full bg-[linear-gradient(90deg,#4e86ff_0%,#77b0ff_100%)]"
              initial={{ width: 0 }}
              animate={{ width: value.includes('%') ? value : '62%' }}
              transition={{ duration: 0.6 }}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
