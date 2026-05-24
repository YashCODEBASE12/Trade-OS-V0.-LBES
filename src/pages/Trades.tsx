import React, { useState } from 'react';
import { useTradesStore } from '../store/useTradesStore';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Search, Filter, X } from 'lucide-react';
import { cn, formatNumber } from '../lib/utils';
import { Trade } from '../types';
import { Button } from '../components/ui/Button';

const Trades = () => {
  const { trades, closeTrade, deleteTrade } = useTradesStore();
  const [filter, setFilter] = useState('');
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [closeData, setCloseData] = useState({ exitPrice: '', notes: '' });

  const filteredTrades = trades.filter(t => 
    t.pair.toLowerCase().includes(filter.toLowerCase()) || 
    t.outcome.toLowerCase().includes(filter.toLowerCase())
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleCloseTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrade) return;
    
    const exit = parseFloat(closeData.exitPrice);
    if (isNaN(exit)) return;

    // Calculate result R
    let resultR = 0;
    if (selectedTrade.direction === 'Buy') {
      resultR = (exit - selectedTrade.entry_price) / (selectedTrade.entry_price - selectedTrade.stop_loss);
    } else {
      resultR = (selectedTrade.entry_price - exit) / (selectedTrade.stop_loss - selectedTrade.entry_price);
    }

    closeTrade(selectedTrade.id, exit, parseFloat(resultR.toFixed(2)), closeData.notes);
    setSelectedTrade(null);
    setCloseData({ exitPrice: '', notes: '' });
  };

  return (
    <div className="pb-20 space-y-4">
      <div className="flex items-center gap-2 sticky top-14 bg-slate-50 z-20 py-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input 
            placeholder="Search pair..." 
            className="pl-9" 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-3">
        {filteredTrades.map((trade) => (
          <Card 
            key={trade.id} 
            className="overflow-hidden active:scale-[0.99] transition-transform cursor-pointer"
            onClick={() => setSelectedTrade(trade)}
          >
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-1 h-12 rounded-full",
                  trade.outcome === 'win' ? "bg-emerald-500" :
                  trade.outcome === 'loss' ? "bg-rose-500" :
                  trade.outcome === 'break-even' ? "bg-slate-400" : "bg-blue-500"
                )} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{trade.pair}</span>
                    <span className="text-xs text-slate-500">{trade.timeframe}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={trade.direction === 'Buy' ? 'default' : 'destructive'} className="text-[10px] h-5 px-1.5">
                      {trade.direction}
                    </Badge>
                    <span className="text-xs text-slate-500">{new Date(trade.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className={cn(
                  "font-bold text-lg",
                  trade.result_r && trade.result_r > 0 ? "text-emerald-600" : 
                  trade.result_r && trade.result_r < 0 ? "text-rose-600" : "text-slate-700"
                )}>
                  {trade.outcome === 'open' ? 'OPEN' : `${trade.result_r ? formatNumber(trade.result_r) : '0'}R`}
                </div>
                <div className="text-xs text-slate-400">
                  {trade.outcome === 'open' ? `Risk: $${trade.risk_usd}` : trade.outcome.toUpperCase()}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Trade Detail / Close Modal */}
      {selectedTrade && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white">
              <h3 className="font-bold text-lg">Trade Details</h3>
              <Button variant="ghost" size="icon" onClick={() => setSelectedTrade(null)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Entry</p>
                  <p className="font-mono font-medium">{selectedTrade.entry_price}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Stop Loss</p>
                  <p className="font-mono font-medium text-rose-600">{selectedTrade.stop_loss}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Take Profit</p>
                  <p className="font-mono font-medium text-emerald-600">{selectedTrade.take_profit}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Planned R</p>
                  <p className="font-mono font-medium">{selectedTrade.r_multiple}R</p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Reason</p>
                <p className="text-sm text-slate-700">{selectedTrade.reason}</p>
              </div>

              {selectedTrade.outcome === 'open' ? (
                <form onSubmit={handleCloseTrade} className="space-y-4 border-t pt-4">
                  <h4 className="font-semibold text-slate-900">Close Trade</h4>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-500">Exit Price</label>
                    <Input 
                      type="number" 
                      step="any" 
                      required
                      value={closeData.exitPrice}
                      onChange={(e) => setCloseData({...closeData, exitPrice: e.target.value})}
                      placeholder="Enter exit price"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-500">Closing Notes</label>
                    <textarea 
                      className="flex min-h-[60px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
                      value={closeData.notes}
                      onChange={(e) => setCloseData({...closeData, notes: e.target.value})}
                      placeholder="Why did you close?"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-slate-900">Confirm Close</Button>
                </form>
              ) : (
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Result</span>
                    <Badge variant={selectedTrade.outcome as 'win' | 'loss' | 'open' | 'break-even'}>{selectedTrade.outcome.toUpperCase()}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Realized R</span>
                    <span className={cn(
                      "font-bold",
                      (selectedTrade.result_r || 0) > 0 ? "text-emerald-600" : "text-rose-600"
                    )}>{formatNumber(selectedTrade.result_r || 0)}R</span>
                  </div>
                  <Button 
                    variant="destructive" 
                    className="w-full mt-4"
                    onClick={() => {
                      if(confirm('Delete this trade?')) {
                        deleteTrade(selectedTrade.id);
                        setSelectedTrade(null);
                      }
                    }}
                  >
                    Delete Record
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trades;
