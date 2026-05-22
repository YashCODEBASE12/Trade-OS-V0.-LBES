import React, { useMemo } from 'react';
import { useTradesStore } from '../store/useTradesStore';
import { ExpertEquityCurve } from '../components/charts/ExpertEquityCurve';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ArrowRight, TrendingUp, ChartBar, Activity, Sparkles } from 'lucide-react';
import { formatNumber } from '../lib/utils';

export default function Analytics() {
  const { trades } = useTradesStore();
  const closedTrades = trades.filter((trade) => trade.outcome !== 'open');
  const totalNetR = closedTrades.reduce((sum, trade) => sum + (trade.result_r || 0), 0);
  const winRate = closedTrades.length > 0
    ? (closedTrades.filter((trade) => trade.outcome === 'win').length / closedTrades.length) * 100
    : 0;

  const pairStats = useMemo(() => {
    const tally: Record<string, { count: number; netR: number }> = {};
    trades.forEach((trade) => {
      if (!tally[trade.pair]) tally[trade.pair] = { count: 0, netR: 0 };
      tally[trade.pair].count += 1;
      tally[trade.pair].netR += trade.result_r ?? 0;
    });
    return Object.entries(tally).sort(([, a], [, b]) => b.count - a.count);
  }, [trades]);

  const bestPair = pairStats.length ? pairStats[0][0] : 'N/A';

  const insightData = useMemo(() => {
    const directionCounts = trades.reduce(
      (acc, trade) => {
        acc[trade.direction] = (acc[trade.direction] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const mostActiveDirection = directionCounts.Buy >= directionCounts.Sell ? 'Buy bias' : 'Sell bias';
    const sessionByWeek = trades.reduce((acc, trade) => {
      const key = trade.week_number.toString();
      if (!acc[key]) acc[key] = 0;
      acc[key] += trade.result_r ?? 0;
      return acc;
    }, {} as Record<string, number>);

    const bestSession = Object.entries(sessionByWeek)
      .sort(([, a], [, b]) => b - a)[0];

    const ruleFollowRate = trades.length
      ? (trades.filter((trade) => trade.rule_followed).length / trades.length) * 100
      : 0;

    return {
      bestSession: bestSession ? `Week ${bestSession[0].slice(4)} / ${bestSession[0].slice(0, 4)} • ${formatNumber(bestSession[1], 2)}R` : 'Need more trades',
      pairBias: trades.length ? `${mostActiveDirection} (${directionCounts.Buy || 0}-${directionCounts.Sell || 0})` : 'No bias yet',
      patternRecognition: closedTrades.length ? `Highest win rate on ${bestPair}` : 'Awaiting trade history',
      behaviorAnalysis: trades.length
        ? `Rule adherence ${formatNumber(ruleFollowRate, 0)}% — keep discipline` :
          'Start logging trades to uncover behavior',
    };
  }, [trades, closedTrades.length, bestPair]);

  return (
    <div className="pb-24 space-y-6 px-4 pt-6 bg-background min-h-screen">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm uppercase tracking-[0.24em] text-text-muted font-semibold">
          <Sparkles className="w-4 h-4 text-accent" />
          LBES Analytics
        </div>
        <h1 className="text-2xl font-bold text-text-primary">AI Performance</h1>
        <p className="text-sm text-text-secondary">Track execution, risk and behavior over time.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4">
          <div className="text-sm text-text-secondary uppercase tracking-[0.2em]">Win Rate</div>
          <div className="mt-3 text-3xl font-semibold text-text-primary">{formatNumber(winRate, 1)}%</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-text-secondary uppercase tracking-[0.2em]">Total Net R</div>
          <div className="mt-3 text-3xl font-semibold text-text-primary">{formatNumber(totalNetR, 2)}R</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-text-secondary uppercase tracking-[0.2em]">Total Trades</div>
          <div className="mt-3 text-3xl font-semibold text-text-primary">{closedTrades.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-text-secondary uppercase tracking-[0.2em]">Best Pair</div>
          <div className="mt-3 text-3xl font-semibold text-text-primary">{bestPair}</div>
        </Card>
      </div>

      <Card className="overflow-hidden border-border shadow-lg">
        <div className="p-4 border-b border-border bg-background">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-text-muted uppercase tracking-[0.18em]">Equity Curve</p>
              <h2 className="mt-1 text-xl font-semibold text-text-primary">Cumulative performance</h2>
            </div>
            <Badge variant="outline" className="text-xs uppercase tracking-[0.18em]">
              Smooth line
            </Badge>
          </div>
        </div>
        <div className="p-4">
          <ExpertEquityCurve />
        </div>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Performance details</p>
              <h3 className="mt-2 text-lg font-semibold text-text-primary">Metrics</h3>
            </div>
            <ChartBar className="w-5 h-5 text-accent" />
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm text-text-secondary">
            <div className="rounded-3xl bg-surface p-4 border border-border">
              <div className="text-xs uppercase tracking-[0.2em]">Best Trade</div>
              <div className="mt-3 text-2xl font-semibold text-text-primary">{closedTrades.length ? `${Math.max(...closedTrades.map((trade) => trade.result_r || 0)).toFixed(2)}R` : '0.00R'}</div>
            </div>
            <div className="rounded-3xl bg-surface p-4 border border-border">
              <div className="text-xs uppercase tracking-[0.2em]">Worst Trade</div>
              <div className="mt-3 text-2xl font-semibold text-text-primary">{closedTrades.length ? `${Math.min(...closedTrades.map((trade) => trade.result_r || 0)).toFixed(2)}R` : '0.00R'}</div>
            </div>
            <div className="rounded-3xl bg-surface p-4 border border-border">
              <div className="text-xs uppercase tracking-[0.2em]">Average Trade</div>
              <div className="mt-3 text-2xl font-semibold text-text-primary">{closedTrades.length ? `${(totalNetR / closedTrades.length).toFixed(2)}R` : '0.00R'}</div>
            </div>
            <div className="rounded-3xl bg-surface p-4 border border-border">
              <div className="text-xs uppercase tracking-[0.2em]">Sharpe</div>
              <div className="mt-3 text-2xl font-semibold text-accent">{closedTrades.length ? formatNumber(totalNetR / (closedTrades.length ? Math.sqrt(closedTrades.length) : 1), 2) : '0.00'}</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-text-muted">AI Insights</p>
              <h3 className="mt-2 text-lg font-semibold text-text-primary">Model snapshot</h3>
            </div>
            <Sparkles className="w-5 h-5 text-accent" />
          </div>
          <div className="space-y-3 text-sm text-text-secondary">
            <div className="rounded-3xl bg-surface p-4 border border-border">
              <div className="font-semibold text-text-primary">Best Session</div>
              <p className="mt-2">{insightData.bestSession}</p>
            </div>
            <div className="rounded-3xl bg-surface p-4 border border-border">
              <div className="font-semibold text-text-primary">Pair Bias</div>
              <p className="mt-2">{insightData.pairBias}</p>
            </div>
            <div className="rounded-3xl bg-surface p-4 border border-border">
              <div className="font-semibold text-text-primary">Pattern Recognition</div>
              <p className="mt-2">{insightData.patternRecognition}</p>
            </div>
            <div className="rounded-3xl bg-surface p-4 border border-border">
              <div className="font-semibold text-text-primary">Behavior Analysis</div>
              <p className="mt-2">{insightData.behaviorAnalysis}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Recent Trades</p>
            <h3 className="mt-2 text-lg font-semibold text-text-primary">Last 5 executed signals</h3>
          </div>
          <ArrowRight className="w-5 h-5 text-accent" />
        </div>
        <div className="space-y-3">
          {trades.slice(0, 5).map((trade) => (
            <div key={trade.id} className="rounded-3xl bg-surface p-4 border border-border">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-text-primary">{trade.pair}</div>
                  <div className="text-xs text-text-secondary">{trade.timeframe} • {trade.direction}</div>
                </div>
                <Badge variant={trade.outcome === 'win' ? 'win' : trade.outcome === 'loss' ? 'loss' : 'open'}>
                  {trade.outcome.toUpperCase()}
                </Badge>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3 text-xs text-text-secondary">
                <div>
                  <div className="font-semibold text-text-primary">{formatNumber(trade.result_r || 0, 2)}R</div>
                  Outcome
                </div>
                <div>
                  <div className="font-semibold text-text-primary">{trade.rule_followed ? 'Rule-Based' : 'Manual'}</div>
                  Entry type
                </div>
                <div>
                  <div className="font-semibold text-text-primary">{trade.reason.slice(0, 24)}...</div>
                  Signal note
                </div>
              </div>
            </div>
          ))}
          {!trades.length && (
            <div className="rounded-3xl bg-surface p-6 border border-border text-center text-sm text-text-secondary">
              No trades yet. Capture signals in AI Trades to populate analytics.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
