import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Brush
} from 'recharts';
import { useTradesStore } from '../../store/useTradesStore';
import { useThemeStore } from '../../store/useThemeStore';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface EquityDataPoint {
  tradeNumber: number;
  cumulativeR: number;
  tradeId: string;
  outcome: 'win' | 'loss' | 'open' | 'break-even';
  rMultiple: number;
  date: string;
}

// Utility for standard deviation
const calculateStdDev = (arr: number[]) => {
  if (arr.length === 0) return 0;
  const mean = arr.reduce((sum, val) => sum + val, 0) / arr.length;
  const squareDiffs = arr.map(val => Math.pow(val - mean, 2));
  const avgSquareDiff = squareDiffs.reduce((sum, val) => sum + val, 0) / squareDiffs.length;
  return Math.sqrt(avgSquareDiff);
};

export function ExpertEquityCurve() {
  const { trades } = useTradesStore();
  const { getThemeColors } = useThemeStore();
  const colors = getThemeColors();

  // Calculate equity curve data
  const equityData = useMemo<EquityDataPoint[]>(() => {
    const sortedTrades = [...trades]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .filter(t => t.outcome !== 'open'); // Only closed trades for equity curve

    let cumulativeR = 0;
    return sortedTrades.map((trade, index) => {
      cumulativeR += trade.result_r || 0;
      return {
        tradeNumber: index + 1,
        cumulativeR: parseFloat(cumulativeR.toFixed(2)),
        tradeId: trade.id,
        outcome: trade.outcome,
        rMultiple: trade.result_r || 0,
        date: new Date(trade.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        })
      };
    });
  }, [trades]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (equityData.length === 0) return null;
    
    const lastPoint = equityData[equityData.length - 1];
    const maxPoint = Math.max(...equityData.map(d => d.cumulativeR));
    const drawdown = maxPoint - lastPoint.cumulativeR;
    const rMultiples = equityData.map(d => d.rMultiple);
    
    return {
      currentR: lastPoint.cumulativeR,
      maxR: maxPoint,
      drawdown,
      winRate: equityData.filter(d => d.rMultiple > 0).length / equityData.length * 100,
      sharpeRatio: lastPoint.cumulativeR / (calculateStdDev(rMultiples) || 1)
    };
  }, [equityData]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="backdrop-blur-sm border border-border/50 rounded-lg p-3 shadow-xl"
             style={{ backgroundColor: colors.chart.tooltipBg }}>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-text-secondary text-sm">Trade #{data.tradeNumber}</span>
              <span className="text-sm font-semibold" style={{
                color: data.rMultiple > 0 ? colors.trading.profit : 
                       data.rMultiple < 0 ? colors.trading.loss : colors.trading.neutral
              }}>
                {data.rMultiple > 0 ? '+' : ''}{data.rMultiple.toFixed(2)}R
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-text-muted text-xs">Cumulative:</span>
              <span className="text-sm font-bold" style={{
                color: data.cumulativeR > 0 ? colors.trading.profit : 
                       data.cumulativeR < 0 ? colors.trading.loss : colors.trading.neutral
              }}>
                {data.cumulativeR > 0 ? '+' : ''}{data.cumulativeR.toFixed(2)}R
              </span>
            </div>
            <div className="pt-2 border-t border-border/30">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{
                  backgroundColor: data.outcome === 'win' ? colors.trading.profit : 
                                 data.outcome === 'loss' ? colors.trading.loss : colors.trading.neutral
                }} />
                <span className="text-xs text-text-secondary capitalize">{data.outcome}</span>
                <span className="text-xs text-text-muted ml-auto">{data.date}</span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom dot for trades
  const renderCustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    const size = Math.abs(payload.rMultiple) > 1.5 ? 6 : 4;
    
    return (
      <circle
        cx={cx}
        cy={cy}
        r={size}
        fill={payload.outcome === 'win' ? colors.chart.winMarker : 
              payload.outcome === 'loss' ? colors.chart.lossMarker : 
              payload.outcome === 'break-even' ? colors.chart.breakevenMarker : 
              colors.chart.openMarker}
        stroke={colors.background}
        strokeWidth={2}
        className="transition-all duration-300 hover:r-8"
      />
    );
  };

  if (equityData.length === 0) {
    return (
      <div className="h-[280px] flex flex-col items-center justify-center text-text-muted border border-dashed border-border rounded-xl bg-surface/50">
        <TrendingUp className="h-8 w-8 mb-2 opacity-50" />
        <p>No closed trades yet.</p>
        <p className="text-xs">Complete a trade to see your equity curve.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Chart header with stats */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            Equity Curve
          </h3>
          <p className="text-sm text-text-secondary">
            Cumulative R Multiple over time
          </p>
        </div>
        
        {stats && (
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-2xl font-bold text-text-primary">
                {stats.currentR > 0 ? '+' : ''}{stats.currentR.toFixed(2)}R
              </div>
              <div style={{ color: stats.currentR > 0 ? colors.trading.profit : stats.currentR < 0 ? colors.trading.loss : colors.trading.neutral }} className="text-xs">
                {stats.currentR > 0 ? 'Profitable' : stats.currentR < 0 ? 'Drawdown' : 'Break-even'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Chart */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/5 to-surface/20 
                        rounded-xl pointer-events-none z-0" />
        
        <ResponsiveContainer width="100%" height={280}>
          <LineChart
            data={equityData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.chart.equityLine} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={colors.chart.equityLine} stopOpacity={0}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid 
              stroke={colors.chart.gridLines} 
              strokeDasharray="3 3"
              strokeOpacity={0.5}
              vertical={false}
            />
            
            <XAxis
              dataKey="tradeNumber"
              tick={{ fill: colors.chart.axis, fontSize: 10 }}
              axisLine={{ stroke: colors.chart.gridLines }}
              tickLine={false}
              dy={10}
            />
            
            <YAxis
              tick={{ fill: colors.chart.axis, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            
            <ReferenceLine 
              y={0} 
              stroke={colors.chart.axis} 
              strokeDasharray="3 3"
              strokeOpacity={0.5}
            />
            
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: colors.chart.gridLines, strokeWidth: 1 }} />
            
            <Area
              type="monotone"
              dataKey="cumulativeR"
              stroke="none"
              fill="url(#equityGradient)"
            />
            
            <Line
              type="monotone"
              dataKey="cumulativeR"
              stroke={colors.chart.equityLine}
              strokeWidth={3}
              dot={renderCustomDot}
              activeDot={{ r: 6, strokeWidth: 0, fill: colors.accent }}
              isAnimationActive={true}
              animationDuration={1500}
            />
            
            {equityData.length > 20 && (
              <Brush
                dataKey="tradeNumber"
                height={20}
                stroke={colors.chart.gridLines}
                fill={colors.surface}
                travellerWidth={10}
                tickFormatter={() => ''}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
        
        {/* Performance indicators below chart */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-surface/50 backdrop-blur-sm rounded-lg p-3 border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-trading-profit" />
              <span className="text-xs text-text-secondary">Best Trade</span>
            </div>
            <div className="text-lg font-bold text-trading-profit">
              {Math.max(...equityData.map(d => d.rMultiple), 0).toFixed(2)}R
            </div>
          </div>
          
          <div className="bg-surface/50 backdrop-blur-sm rounded-lg p-3 border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-trading-loss" />
              <span className="text-xs text-text-secondary">Worst Trade</span>
            </div>
            <div className="text-lg font-bold text-trading-loss">
              {Math.min(...equityData.map(d => d.rMultiple), 0).toFixed(2)}R
            </div>
          </div>
          
          <div className="bg-surface/50 backdrop-blur-sm rounded-lg p-3 border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <Minus className="w-4 h-4 text-trading-neutral" />
              <span className="text-xs text-text-secondary">Avg Trade</span>
            </div>
            <div className="text-lg font-bold text-text-primary">
              {(equityData.reduce((sum, d) => sum + d.rMultiple, 0) / equityData.length || 0).toFixed(2)}R
            </div>
          </div>
          
          <div className="bg-surface/50 backdrop-blur-sm rounded-lg p-3 border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-4 rounded-full bg-accent" />
              <span className="text-xs text-text-secondary">Sharpe</span>
            </div>
            <div className="text-lg font-bold text-accent">
              {stats ? (stats.sharpeRatio > 0 ? stats.sharpeRatio.toFixed(2) : '0.00') : '0.00'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
