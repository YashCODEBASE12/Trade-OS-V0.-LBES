import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine
} from 'recharts';
import { Trade } from '../types';

interface ChartEquityProps {
  trades: Trade[];
}

const ChartEquity: React.FC<ChartEquityProps> = ({ trades }) => {
  // Sort trades by date
  const sortedTrades = [...trades]
    .filter(t => t.outcome !== 'open')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let cumulativeR = 0;
  const data = sortedTrades.map((trade, index) => {
    cumulativeR += trade.result_r || 0;
    return {
      index: index + 1,
      r: cumulativeR,
      date: new Date(trade.date).toLocaleDateString(),
      tradeR: trade.result_r
    };
  });

  // Add starting point
  if (data.length > 0) {
    data.unshift({ index: 0, r: 0, date: 'Start', tradeR: 0 });
  }

  const isPositive = cumulativeR >= 0;

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorR" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={isPositive ? "#10b981" : "#f43f5e"} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={isPositive ? "#10b981" : "#f43f5e"} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="index" hide />
          <YAxis hide domain={['auto', 'auto']} />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(value: number) => [`${value.toFixed(2)}R`, 'Equity']}
            labelFormatter={() => ''}
          />
          <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
          <Area 
            type="monotone" 
            dataKey="r" 
            stroke={isPositive ? "#10b981" : "#f43f5e"} 
            fillOpacity={1} 
            fill="url(#colorR)" 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartEquity;
