import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Filter, Search, Sparkles, Trash2 } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { useReasonTrackStore } from '../store/useReasonTrackStore';
import { ActivityTrade, TradeOutcome } from '../types/reasontrack';

export default function Activity() {
  const { trades, closeTrade, deleteTrade, loading } = useReasonTrackStore();
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [outcomes, setOutcomes] = useState<Record<string, TradeOutcome>>({});
  const [results, setResults] = useState<Record<string, string>>({});
  const [reinforcementId, setReinforcementId] = useState<string | null>(null);

  const filteredTrades = useMemo(
    () =>
      trades.filter((trade) => `${trade.pair} ${trade.signal} ${trade.status}`.toLowerCase().includes(query.toLowerCase())),
    [query, trades],
  );

  const closeMutation = useMutation({
    mutationFn: async ({ id, outcome, resultR }: { id: string; outcome: TradeOutcome; resultR: number }) => {
      await closeTrade(id, outcome, resultR);
    },
    onMutate: async ({ id }) => {
      setExpandedId(id);
      setReinforcementId(id);
    },
    onError: () => {
      setReinforcementId(null);
    },
  });

  return (
    <section className="space-y-5">
      <div className="rounded-[28px] border border-white/75 bg-[radial-gradient(circle_at_top_right,_rgba(94,147,255,0.18),_transparent_40%),rgba(255,255,255,0.62)] p-5 shadow-[0_18px_40px_rgba(27,39,76,0.08)] backdrop-blur-xl">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-text-muted">Live execution feed</p>
        <h1 className="mt-2 text-[28px] font-bold tracking-[-0.03em]">AI Trade Activity</h1>
        <div className="mt-3 flex items-center gap-2 text-sm text-text-secondary">
          <Sparkles className="h-4 w-4 text-primary" />
          Execution intelligence and closing workflow
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search pair or status" className="pl-11" />
        </div>
        <button
          type="button"
          title="Filter activity"
          aria-label="Filter activity"
          className="premium-card flex h-12 w-12 items-center justify-center rounded-[20px]"
        >
          <Filter className="h-4 w-4 text-text-secondary" />
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="space-y-3 py-5">
                <div className="h-4 w-24 animate-pulse rounded-full bg-slate-200" />
                <div className="h-3 w-40 animate-pulse rounded-full bg-slate-200" />
                <div className="h-10 w-full animate-pulse rounded-[16px] bg-slate-200" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !filteredTrades.length ? (
        <Card className="border border-white/10 bg-[rgba(255,255,255,0.04)]">
          <EmptyState
            icon="📭"
            title="No trades logged yet"
            description="Start by analyzing your first setup in the Execution screen. Every decision you capture builds your edge."
            action={
              <Button onClick={() => window.location.assign('/ai-trades')}>
                Go to Execution
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTrades.map((trade, index) => {
            const isExpanded = expandedId === trade.id;
            const outcome = outcomes[trade.id] ?? 'Win';
            const resultR = results[trade.id] ?? '';

            return (
              <motion.div
                key={trade.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.04 }}
              >
                <Card className="overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : trade.id)}
                    className="w-full text-left"
                  >
                    <CardContent className="space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="truncate text-lg font-bold">{trade.pair}</h2>
                            <Badge variant={trade.signal === 'BUY' ? 'buy' : 'sell'}>{trade.signal}</Badge>
                          </div>
                          <p className="mt-1 text-sm text-text-secondary">{trade.timeframe} • Alignment {trade.confidence}%</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {getStatusChips(trade).map((chip, chipIndex) => (
                              <StatusChip key={chip} label={chip} index={chipIndex} />
                            ))}
                          </div>
                        </div>
                        <Badge variant={trade.status === 'open' ? 'open' : trade.status}>{trade.status === 'breakeven' ? 'Breakeven' : capitalize(trade.status)}</Badge>
                      </div>
                    </CardContent>
                  </button>

                  <AnimatePresence initial={false}>
                    {isExpanded ? (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="overflow-hidden"
                      >
                        <CardContent className="space-y-5 border-t border-border pt-0">
                          <div className="grid grid-cols-2 gap-3 pt-5 text-sm">
                            <Detail label="Entry" value={String(trade.entry)} />
                            <Detail label="SL" value={String(trade.stopLoss)} />
                            <Detail label="TP1" value={String(trade.tp1)} />
                            <Detail label="TP2" value={String(trade.tp2)} />
                            <Detail label="TP3" value={String(trade.tp3)} />
                            <Detail label="Risk Reward" value={trade.riskReward} />
                          </div>

                          <div className="space-y-3 rounded-[20px] bg-subtle p-4 text-sm text-text-secondary">
                            <DetailBlock title="Alignment Score" value={`${trade.confidence}% - Alignment measures market condition quality. Not win probability.`} />
                            <DetailBlock title="Reason" value={trade.analysis.tradeReason} />
                            <DetailBlock title="Macro Alignment" value={trade.analysis.macroAlignment} />
                            <DetailBlock title="Trade Notes" value={trade.tradeNotes} />
                          </div>

                          {trade.status === 'open' ? (
                            <div className="space-y-3">
                              <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-text-muted">Close Trade</h3>
                              <Select value={outcome} onChange={(event) => setOutcomes((current) => ({ ...current, [trade.id]: event.target.value as TradeOutcome }))}>
                                <option>Win</option>
                                <option>Loss</option>
                                <option>Breakeven</option>
                              </Select>
                              <Input
                                value={resultR}
                                onChange={(event) => setResults((current) => ({ ...current, [trade.id]: event.target.value }))}
                                placeholder="Result R"
                                inputMode="decimal"
                              />
                              <div className="flex gap-3">
                                <Button
                                  variant="primary"
                                  className="flex-1"
                                  onClick={() => closeMutation.mutate({ id: trade.id, outcome, resultR: Number(resultR || 0) })}
                                  disabled={closeMutation.isPending && closeMutation.variables?.id === trade.id}
                                >
                                  {closeMutation.isPending && closeMutation.variables?.id === trade.id ? 'Closing...' : 'Close Trade'}
                                </Button>
                                <Button variant="destructive" className="px-4" onClick={() => deleteTrade(trade.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <AnimatePresence>
                                {reinforcementId === trade.id ? (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.97, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.35 }}
                                    className="mb-3 rounded-[24px] border border-[#dbeafe] bg-[radial-gradient(circle_at_top_right,_rgba(37,99,235,0.14),_transparent_38%),rgba(255,255,255,0.68)] p-4 shadow-[0_18px_36px_rgba(37,99,235,0.10)]"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#dcfce7] text-[#15803d]">
                                        <CheckCircle2 className="h-5 w-5" />
                                      </div>
                                      <div>
                                        <div className="text-base font-bold text-text-primary">Execution Updated</div>
                                        <div className="mt-1 text-xs text-text-secondary">Today protected from: {trade.protectedSetups ?? 3} weak setups</div>
                                      </div>
                                    </div>
                                    <div className="mt-4 grid gap-2">
                                      {['Discipline Streak +1', 'Session Quality Improved', 'Execution Score Increased'].map((item, itemIndex) => (
                                        <motion.div
                                          key={item}
                                          initial={{ opacity: 0, x: -8 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ duration: 0.3, delay: itemIndex * 0.05 }}
                                          className="rounded-full bg-white/68 px-3 py-2 text-xs font-semibold text-primary"
                                        >
                                          {item}
                                        </motion.div>
                                      ))}
                                    </div>
                                  </motion.div>
                                ) : null}
                              </AnimatePresence>
                            <div className="flex items-center justify-between rounded-[20px] bg-subtle p-4 text-sm">
                              <div>
                                <div className="font-semibold text-text-primary">Closed Result</div>
                                <div className="mt-1 text-text-secondary">{trade.closeOutcome} • {trade.resultR?.toFixed(2)}R</div>
                              </div>
                              <Button variant="destructive" size="sm" onClick={() => deleteTrade(trade.id)}>
                                Delete
                              </Button>
                            </div>
                            </>
                          )}
                        </CardContent>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function getStatusChips(trade: ActivityTrade) {
  return [
    trade.reviewed ? 'Reviewed' : 'Protected',
    trade.confidence >= 80 ? 'High Confidence' : null,
    trade.ruleFollowed === false ? null : 'Rule Followed',
    `Session: ${trade.session ?? 'London'}`,
    trade.status !== 'open' ? 'Closed Cleanly' : null,
  ].filter(Boolean) as string[];
}

function StatusChip({ label, index }: { label: string; index: number }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
      className="rounded-full border border-white/70 bg-white/58 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-text-secondary shadow-[0_8px_18px_rgba(27,39,76,0.05)]"
    >
      {label}
    </motion.span>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  const palette =
    label === 'Entry'
      ? 'bg-[#eff6ff] text-[#2563eb]'
      : label === 'SL'
        ? 'bg-[#fee2e2] text-[#dc2626]'
        : label.startsWith('TP')
          ? 'bg-[#dcfce7] text-[#16a34a]'
          : label === 'Risk Reward'
            ? 'bg-[#fff7ed] text-[#ea580c]'
            : 'bg-subtle text-text-primary';

  return (
    <div className={`rounded-[18px] p-4 ${palette}`}>
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">{label}</div>
      <div className="mt-2 text-sm font-semibold">{value}</div>
    </div>
  );
}

function DetailBlock({ title, value }: { title: string; value: string }) {
  const titleTone = title === 'Alignment Score' ? 'text-[#7c3aed]' : 'text-text-muted';
  return (
    <div>
      <div className={`text-xs font-semibold uppercase tracking-[0.18em] ${titleTone}`}>{title}</div>
      <p className="mt-2 leading-6">{value}</p>
    </div>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
