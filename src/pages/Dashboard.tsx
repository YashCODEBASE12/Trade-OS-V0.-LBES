import React, { useMemo, useState } from 'react';
import { useTradesStore } from '../store/useTradesStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Search, Filter, X, Trash2 } from 'lucide-react';
import { cn, formatNumber } from '../lib/utils';
import { Trade } from '../types';
import { SignInModal } from '../components/SignInModal';

const FILTER_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'Buy', label: 'BUY' },
  { id: 'Sell', label: 'SELL' },
  { id: 'open', label: 'WAIT' },
  { id: 'break-even', label: 'NO TRADE' },
];

export default function Trades() {
  const { trades, deleteTrade, clearAllTrades } = useTradesStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<string[]>([]);
  const [activeTrade, setActiveTrade] = useState<Trade | null>(null);
  const [isSignInOpen, setIsSignInOpen] = useState(false);

  const filteredTrades = useMemo(() => {
    return trades
      .filter((trade) => {
        if (filter !== 'all' && trade.outcome !== filter) return false;
        if (!search) return true;
        const term = search.toLowerCase();
        return [trade.pair, trade.direction, trade.timeframe, trade.outcome]
          .some((value) => value.toLowerCase().includes(term));
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [trades, filter, search]);

  const toggleSelection = (id: string) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
  };

  const handleDeleteSelected = () => {
    if (!selected.length) return;
    selected.forEach((id) => deleteTrade(id));
    setSelected([]);
  };

  const confidenceLabel = (trade: Trade) => {
    if (trade.outcome === 'open') return 'Pending';
    return trade.rule_followed ? 'High confidence' : 'Moderate confidence';
  };

  const getProfitLabel = (trade: Trade) => {
    if (trade.outcome === 'open') {
      return `Risk $${formatNumber(trade.risk_usd, 0)}`;
    }
    return `${trade.result_r && trade.result_r > 0 ? '+' : ''}${formatNumber(trade.result_r || 0)}R`;
  };

  return (
    <div className="pb-24 bg-background min-h-screen px-4 pt-6 space-y-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-text-primary">Activity</h1>
        <p className="text-sm text-text-secondary">Track all AI signals and trade execution details.</p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-text-muted" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search pair, signal, date"
              className="pl-9"
            />
          </div>

          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => setFilter(option.id)}
              className={cn(
                'rounded-full px-4 py-2 text-xs font-semibold transition-colors border',
                filter === option.id
                  ? 'bg-accent text-white border-transparent'
                  : 'bg-surface text-text-primary border-border hover:border-accent'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleDeleteSelected} disabled={!selected.length}>
            Delete selected
          </Button>
          <Button variant="destructive" size="sm" onClick={() => clearAllTrades()}>
            Delete all
          </Button>
          {selected.length ? (
            <span className="text-xs text-text-secondary">{selected.length} selected</span>
          ) : null}
        </div>
      </div>

      <div className="space-y-3">
        {filteredTrades.map((trade) => (
          <Card
            key={trade.id}
            className="border-border bg-white shadow-sm"
            onClick={() => setActiveTrade(trade)}
          >
            <div className="flex items-start gap-4 p-4">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  toggleSelection(trade.id);
                }}
                className={cn(
                  'h-5 w-5 rounded-full border transition-colors',
                  selected.includes(trade.id) ? 'bg-accent border-accent' : 'bg-white border-border'
                )}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold text-text-primary">{trade.pair}</div>
                    <div className="text-xs text-text-secondary mt-1">{trade.timeframe} • {new Date(trade.date).toLocaleDateString()}</div>
                  </div>
                  <Badge variant={trade.direction === 'Buy' ? 'win' : 'loss'}>{trade.direction}</Badge>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3 text-xs text-text-secondary">
                  <div className="rounded-3xl bg-surface p-3 border border-border">
                    <div className="font-semibold text-text-primary">R:R</div>
                    <div className="mt-2">{trade.r_multiple.toFixed(2)}:1</div>
                  </div>
                  <div className="rounded-3xl bg-surface p-3 border border-border">
                    <div className="font-semibold text-text-primary">Profit</div>
                    <div className="mt-2">{getProfitLabel(trade)}</div>
                  </div>
                  <div className="rounded-3xl bg-surface p-3 border border-border">
                    <div className="font-semibold text-text-primary">Confidence</div>
                    <div className="mt-2">{confidenceLabel(trade)}</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
        {!filteredTrades.length && (
          <div className="rounded-3xl border border-dashed border-border bg-surface p-8 text-center text-sm text-text-secondary">
            No activities match the current filter.
          </div>
        )}
      </div>

      <SignInModal isOpen={isSignInOpen} onClose={() => setIsSignInOpen(false)} />

      {activeTrade && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-lg overflow-hidden rounded-[32px] border border-border bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-4">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">Trade Details</h2>
                <p className="text-xs text-text-secondary">Tap outside to close</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTrade(null)}
                className="text-text-muted hover:text-text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 p-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-3xl bg-surface p-4 border border-border">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Entry</p>
                  <p className="mt-2 font-semibold text-text-primary">{activeTrade.entry_price}</p>
                </div>
                <div className="rounded-3xl bg-surface p-4 border border-border">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted">SL</p>
                  <p className="mt-2 font-semibold text-text-primary">{activeTrade.stop_loss}</p>
                </div>
                <div className="rounded-3xl bg-surface p-4 border border-border">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted">TP</p>
                  <p className="mt-2 font-semibold text-text-primary">{activeTrade.take_profit}</p>
                </div>
                <div className="rounded-3xl bg-surface p-4 border border-border">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Planned R</p>
                  <p className="mt-2 font-semibold text-text-primary">{activeTrade.r_multiple.toFixed(2)}R</p>
                </div>
              </div>

              <div className="rounded-3xl bg-surface p-4 border border-border">
                <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Reason</p>
                <p className="mt-2 text-sm text-text-primary">{activeTrade.reason || 'No reason provided.'}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm text-text-secondary">
                <div className="rounded-3xl bg-surface p-4 border border-border">
                  <p className="text-[10px] uppercase tracking-[0.2em]">Result</p>
                  <p className="mt-2 font-semibold text-text-primary">{activeTrade.outcome.toUpperCase()}</p>
                </div>
                <div className="rounded-3xl bg-surface p-4 border border-border">
                  <p className="text-[10px] uppercase tracking-[0.2em]">Realized R</p>
                  <p className="mt-2 font-semibold text-text-primary">{activeTrade.result_r ? `${activeTrade.result_r > 0 ? '+' : ''}${activeTrade.result_r.toFixed(2)}R` : 'TBD'}</p>
                </div>
              </div>

              <Button
                className="w-full bg-loss text-white"
                onClick={() => {
                  deleteTrade(activeTrade.id);
                  setActiveTrade(null);
                }}
              >
                Delete Trade
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
