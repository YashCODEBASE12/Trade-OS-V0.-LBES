import { motion } from 'framer-motion';
import { Activity, ArrowUpRight, BrainCircuit, Clock3, Gauge, LineChart as LineChartIcon, Percent, Sparkles, Target, Trophy } from 'lucide-react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useMemo } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { useReasonTrackStore } from '../store/useReasonTrackStore';

export default function Performance() {
  const { trades } = useReasonTrackStore();

  const analytics = useMemo(() => {
    const closedTrades = trades.filter((trade) => trade.status !== 'open');
    const totalNetR = closedTrades.reduce((sum, trade) => sum + (trade.resultR ?? 0), 0);
    const wins = closedTrades.filter((trade) => trade.status === 'win');
    const winRate = closedTrades.length ? Math.round((wins.length / closedTrades.length) * 100) : 0;
    const avgR = closedTrades.length ? totalNetR / closedTrades.length : 0;

    const pairCounts = closedTrades.reduce<Record<string, { count: number; net: number }>>((acc, trade) => {
      acc[trade.pair] ??= { count: 0, net: 0 };
      acc[trade.pair].count += 1;
      acc[trade.pair].net += trade.resultR ?? 0;
      return acc;
    }, {});
    const bestPair = Object.entries(pairCounts).sort((a, b) => b[1].net - a[1].net)[0]?.[0] ?? 'No pair yet';

    const equityCurve = closedTrades.map((trade, index) => ({
      index: index + 1,
      value: Number(closedTrades.slice(0, index + 1).reduce((sum, item) => sum + (item.resultR ?? 0), 0).toFixed(2)),
    }));

    const pairShare = (() => {
      if (!closedTrades.length) return 'Execution insight will appear after your first closed trade.';
      const totalPositive = closedTrades.filter((trade) => (trade.resultR ?? 0) > 0).reduce((sum, trade) => sum + (trade.resultR ?? 0), 0);
      const bestPairNet = pairCounts[bestPair]?.net ?? 0;
      if (totalPositive <= 0) return `${bestPair} is currently the strongest pair in your reviewed history.`;
      const share = Math.round((bestPairNet / totalPositive) * 100);
      return `${bestPair} contributes ${Math.max(0, share)}% of gains.`;
    })();

    const londonBias = closedTrades.length
      ? `${closedTrades.filter((trade) => trade.timeframe === '15m' || trade.timeframe === '1H').length > closedTrades.length / 2 ? 'Most wins occur during London-style structured sessions.' : 'Wins are currently spread across mixed session structures.'}`
      : 'Most wins occur during London session.';

    const weekdayMap = closedTrades.reduce<Record<string, number>>((acc, trade) => {
      const day = new Date(trade.createdAt).toLocaleDateString('en-US', { weekday: 'long' });
      acc[day] = (acc[day] ?? 0) + Math.abs(trade.resultR ?? 0);
      return acc;
    }, {});
    const mostEmotionalDay = Object.entries(weekdayMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Not enough data';

    const highestConfidenceTrade = [...closedTrades].sort((a, b) => b.confidence - a.confidence)[0];
    const bestSession = closedTrades.length
      ? `${closedTrades.filter((trade) => trade.timeframe === '15m').length >= closedTrades.filter((trade) => trade.timeframe === '1H').length ? 'London session' : 'Structured 1H sessions'}`
      : 'Awaiting first review';

    const trend = closedTrades.length ? Math.max(4, Math.min(28, Math.round((wins.length / Math.max(1, closedTrades.length)) * 16))) : 12;
    const protectedSetups = trades.reduce((sum, trade) => sum + (trade.protectedSetups ?? 0), 0);
    const ruleFollowedTrades = trades.filter((trade) => trade.ruleFollowed !== false).length;
    const cleanClosedTrades = closedTrades.filter((trade) => trade.status === 'win' || trade.status === 'breakeven').length;
    const strongestPair = bestPair === 'No pair yet' ? 'EURUSD' : bestPair;
    const pairFamiliarity = Math.min(100, Math.max(12, trades.filter((trade) => trade.pair === strongestPair).length * 22));
    const sessionMastery = Math.min(100, Math.max(16, closedTrades.filter((trade) => (trade.session ?? 'London') === 'London').length * 24));
    const nextAction = closedTrades.length
      ? `Next action: prioritize ${strongestPair} during London-style structure before expanding pairs.`
      : 'Next action: generate one AI trade, then close it from Activity to unlock real guidance.';

    return {
      totalNetR,
      trend,
      winRate,
      closedTrades,
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
  }, [trades]);

  return (
    <section className="space-y-5">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card className="bg-[radial-gradient(circle_at_top_right,_rgba(94,147,255,0.22),_transparent_42%),rgba(255,255,255,0.62)]">
          <CardContent className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-text-muted">Performance</div>
            <div className="flex items-end justify-between gap-4">
              <div>
                <h1 className="text-[30px] font-bold tracking-[-0.04em] text-text-primary">Your Trading Performance</h1>
                <p className="mt-2 text-sm text-text-secondary">Net result this month</p>
              </div>
              <div className="rounded-[22px] bg-white/70 px-4 py-3 text-right shadow-[0_12px_28px_rgba(27,39,76,0.08)]">
                <div className={`text-[34px] font-bold tracking-[-0.05em] ${analytics.totalNetR >= 0 ? 'text-primary' : 'text-[#de5246]'}`}>
                  {analytics.totalNetR >= 0 ? '+' : ''}{analytics.totalNetR.toFixed(1)}R
                </div>
                <div className="mt-1 flex items-center justify-end gap-1 text-sm font-semibold text-[#1f9d55]">
                  <ArrowUpRight className="h-4 w-4" />
                  {analytics.trend}%
                </div>
              </div>
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
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="h-[220px] rounded-[24px] border border-white/75 bg-[rgba(255,255,255,0.56)] p-4 backdrop-blur-xl">
              {analytics.equityCurve.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.equityCurve}>
                    <XAxis dataKey="index" tickLine={false} axisLine={false} tick={{ fill: '#97a1b3', fontSize: 11 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: '#97a1b3', fontSize: 11 }} />
                    <Tooltip contentStyle={{ borderRadius: '18px', border: '1px solid rgba(255,255,255,0.76)', background: 'rgba(255,255,255,0.86)', backdropFilter: 'blur(14px)' }} />
                    <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={4} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-center text-sm text-text-secondary">
                  No performance yet. Close a trade in Activity to start the execution curve.
                </div>
              )}
            </motion.div>
            <Card className="bg-[rgba(255,255,255,0.52)]">
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
