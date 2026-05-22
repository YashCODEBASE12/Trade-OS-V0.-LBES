export type Theme = 'light' | 'dark-navy' | 'pure-black';

export interface ThemeColors {
  name: Theme;
  label: string;
  description: string;
  icon: string;
  
  // Core palette
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  border: string;
  
  text: {
    primary: string;
    secondary: string;
    muted: string;
    inverse: string;
  };
  
  // Trading-specific
  trading: {
    profit: string;
    loss: string;
    neutral: string;
    open: string;
    high: string;
    low: string;
    volume: string;
    grid: string;
    tooltip: string;
  };
  
  // Chart colors
  chart: {
    equityLine: string;
    equityArea: string;
    winMarker: string;
    lossMarker: string;
    openMarker: string;
    breakevenMarker: string;
    gridLines: string;
    axis: string;
    tooltipBg: string;
  };
}

export const themes: Record<Theme, ThemeColors> = {
  'light': {
    name: 'light',
    label: 'Light Mode',
    description: 'Clean & professional',
    icon: 'sun',
    
    primary: '#0f172a', // Slate 900
    secondary: '#475569', // Slate 600
    accent: '#3b82f6', // Blue 500
    background: '#f8fafc', // Slate 50
    surface: '#ffffff',
    border: '#e2e8f0',
    
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      muted: '#94a3b8',
      inverse: '#ffffff'
    },
    
    trading: {
      profit: '#10b981', // Emerald 500
      loss: '#f43f5e', // Rose 500
      neutral: '#64748b', // Slate 500
      open: '#3b82f6', // Blue 500
      high: '#059669', // Emerald 600
      low: '#e11d48', // Rose 600
      volume: '#8b5cf6', // Violet 500
      grid: '#e2e8f0',
      tooltip: '#1e293b'
    },
    
    chart: {
      equityLine: '#3b82f6',
      equityArea: '#3b82f6', // Opacity handled in component
      winMarker: '#10b981',
      lossMarker: '#f43f5e',
      openMarker: '#3b82f6',
      breakevenMarker: '#64748b',
      gridLines: '#e2e8f0',
      axis: '#64748b',
      tooltipBg: 'rgba(255, 255, 255, 0.95)'
    }
  },
  
  'dark-navy': {
    name: 'dark-navy',
    label: 'Pro Navy',
    description: 'Professional trading terminal',
    icon: 'moon',
    
    primary: '#f8fafc', // Slate 50
    secondary: '#cbd5e1', // Slate 300
    accent: '#60a5fa', // Blue 400
    background: '#0f172a', // Slate 900
    surface: '#1e293b', // Slate 800
    border: '#334155', // Slate 700
    
    text: {
      primary: '#f1f5f9',
      secondary: '#94a3b8',
      muted: '#64748b',
      inverse: '#0f172a'
    },
    
    trading: {
      profit: '#34d399', // Emerald 400
      loss: '#f87171', // Red 400
      neutral: '#94a3b8', // Slate 400
      open: '#60a5fa', // Blue 400
      high: '#10b981', // Emerald 500
      low: '#f43f5e', // Rose 500
      volume: '#a78bfa', // Violet 400
      grid: '#334155',
      tooltip: '#0f172a'
    },
    
    chart: {
      equityLine: '#60a5fa',
      equityArea: '#60a5fa',
      winMarker: '#34d399',
      lossMarker: '#f87171',
      openMarker: '#60a5fa',
      breakevenMarker: '#94a3b8',
      gridLines: '#334155',
      axis: '#64748b',
      tooltipBg: 'rgba(30, 41, 59, 0.95)'
    }
  },
  
  'pure-black': {
    name: 'pure-black',
    label: 'Pure Black',
    description: 'Max focus, zero distractions',
    icon: 'sparkles',
    
    primary: '#ffffff',
    secondary: '#a1a1aa',
    accent: '#22d3ee', // Cyan 400
    background: '#000000',
    surface: '#09090b', // Zinc 950
    border: '#27272a', // Zinc 800
    
    text: {
      primary: '#ffffff',
      secondary: '#a1a1aa',
      muted: '#52525b',
      inverse: '#000000'
    },
    
    trading: {
      profit: '#22c55e', // Green 500
      loss: '#ef4444', // Red 500
      neutral: '#71717a', // Zinc 500
      open: '#22d3ee', // Cyan 400
      high: '#16a34a', // Green 600
      low: '#dc2626', // Red 600
      volume: '#8b5cf6', // Violet 500
      grid: '#18181b',
      tooltip: '#09090b'
    },
    
    chart: {
      equityLine: '#22d3ee',
      equityArea: '#22d3ee',
      winMarker: '#22c55e',
      lossMarker: '#ef4444',
      openMarker: '#22d3ee',
      breakevenMarker: '#71717a',
      gridLines: '#18181b',
      axis: '#52525b',
      tooltipBg: 'rgba(9, 9, 11, 0.95)'
    }
  }
};
