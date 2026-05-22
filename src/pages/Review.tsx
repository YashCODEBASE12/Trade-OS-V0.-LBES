import React from 'react';
import { useTradesStore } from '../store/useTradesStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { getWeekNumber } from '../utils/calculations';
import { formatNumber, cn } from '../lib/utils';

const Review = () => {
  const { trades } = useTradesStore();
  
  // Group trades by week
  const tradesByWeek = trades.reduce((acc, trade) => {
    const week = getWeekNumber(new Date(trade.date));
    if (!acc[week]) acc[week] = [];
    acc[week].push(trade);
    return acc;
  }, {} as Record<number, typeof trades>);

  const weeks = Object.keys(tradesByWeek).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="pb-20 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Weekly Reviews</h1>
      
      {weeks.length === 0 && (
        <p className="text-slate-500">No trades recorded yet to review.</p>
      )}

      {weeks.map((week) => {
        const weekTrades = tradesByWeek[Number(week)];
        const closedTrades = weekTrades.filter(t => t.outcome !== 'open');
        const wins = closedTrades.filter(t => t.outcome === 'win');
        const winRate = closedTrades.length > 0 ? (wins.length / closedTrades.length) * 100 : 0;
        const netR = closedTrades.reduce((sum, t) => sum + (t.result_r || 0), 0);
        
        return (
          <Card key={week}>
            <CardHeader className="bg-slate-50 border-b py-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">Week {week.toString().slice(4)} - {week.toString().slice(0,4)}</CardTitle>
                <span className="text-xs text-slate-500">{weekTrades.length} Trades</span>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-4 text-center mb-4">
                <div>
                  <p className="text-xs text-slate-500">Win Rate</p>
                  <p className="font-bold text-lg">{formatNumber(winRate, 0)}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Net R</p>
                  <p className={cn("font-bold text-lg", netR >= 0 ? "text-emerald-600" : "text-rose-600")}>
                    {formatNumber(netR)}R
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Mistakes</p>
                  <p className="font-bold text-lg">{weekTrades.filter(t => !t.rule_followed).length}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Weekly Notes</label>
                <textarea 
                  className="w-full p-2 text-sm border rounded-md bg-slate-50 min-h-[80px]"
                  placeholder="What did you learn this week?"
                />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default Review;
