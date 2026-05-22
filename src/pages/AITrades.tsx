import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, Bitcoin, Brain, CandlestickChart, CheckCircle2, ChevronDown, Globe, LoaderCircle, Settings2, Shield, TriangleAlert, XCircle, Zap, ChartNoAxesColumn, Earth, OctagonAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { pairOptions, riskRewardOptions } from '../data/reasontrack';
import { analyzeTrade } from '../lib/reasontrack';
import { useReasonTrackStore } from '../store/useReasonTrackStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { ActivityTrade, AnalysisFormState, GeneratedSignal } from '../types/reasontrack';

const defaultForm: AnalysisFormState = {
  pair: 'EURUSD',
  timeframe: '15m',
  capital: 2500,
  riskReward: '1:2',
  tradingStyle: 'Day Trader',
};

export default function AITrades() {
  const navigate = useNavigate();
  const { defaultCapital, addTradeFromSignal, trades, error: tradeError } = useReasonTrackStore();
  const { profile } = useSettingsStore();
  const [form, setForm] = useState<AnalysisFormState>({ ...defaultForm, capital: defaultCapital });
  const [isLoading, setIsLoading] = useState(false);
  const [signal, setSignal] = useState<GeneratedSignal | null>(null);
  const [accordionOpen, setAccordionOpen] = useState(false);
  const [notice, setNotice] = useState<'offline' | null>(null);
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);

  const activePair = useMemo(() => pairOptions.find((option) => option.value === form.pair) ?? pairOptions[0], [form.pair]);
  const activeSignals = trades.filter((trade) => trade.status === 'open').length;
  const closedTrades = trades.filter((trade) => trade.status !== 'open');
  const winStreak = getWinStreak(closedTrades);
  const netR = closedTrades.reduce((sum, trade) => sum + (trade.resultR ?? 0), 0);
  const averageAlignment = trades.length ? Math.round(trades.reduce((sum, trade) => sum + trade.confidence, 0) / trades.length) : 0;
  const pairIcon = getPairIcon(activePair.market);

  useEffect(() => {
    setForm((current) => ({ ...current, capital: profile.accountSize || defaultCapital }));
  }, [defaultCapital, profile.accountSize]);

  useEffect(() => {
    const syncStatus = () => setNotice(navigator.onLine ? null : 'offline');
    syncStatus();
    window.addEventListener('online', syncStatus);
    window.addEventListener('offline', syncStatus);
    return () => {
      window.removeEventListener('online', syncStatus);
      window.removeEventListener('offline', syncStatus);
    };
  }, []);

  const runAnalysis = () => {
    if (!navigator.onLine) {
      setNotice('offline');
      return;
    }

    setIsLoading(true);
    setSignal(null);
    setAccordionOpen(false);
    setProgress(0);
    setStepIndex(0);

    const checkpoints = [
      { at: 850, progress: 10, step: 0 },
      { at: 1700, progress: 21, step: 1 },
      { at: 2550, progress: 34, step: 2 },
      { at: 3400, progress: 48, step: 3 },
      { at: 4250, progress: 61, step: 4 },
      { at: 5100, progress: 74, step: 5 },
      { at: 5950, progress: 88, step: 6 },
      { at: 6800, progress: 100, step: 6 },
    ];

    checkpoints.forEach((checkpoint) => {
      window.setTimeout(() => {
        setProgress(checkpoint.progress);
        setStepIndex(checkpoint.step);
      }, checkpoint.at);
    });

    window.setTimeout(() => {
      const nextSignal = analyzeTrade(form);
      setSignal(nextSignal);
      setAccordionOpen(nextSignal.signal !== 'NO_SIGNAL');
      setIsLoading(false);
    }, 7100);
  };

  return (
    <section className="space-y-5">
      <div className="space-y-3">
        <div className="glass-tint flex items-center justify-between rounded-[24px] border border-white/70 px-3 py-2.5 shadow-[0_12px_24px_rgba(27,39,76,0.06)]">
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => navigate('/performance')}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/72 text-text-secondary shadow-[0_8px_18px_rgba(27,39,76,0.06)]"
          >
            <ArrowLeft className="h-4 w-4" />
          </motion.button>
          <div className="text-center">
            <div className="text-[15px] font-bold tracking-[-0.02em] text-text-primary">Execution Center</div>
            <div className="mt-1 text-[11px] text-text-secondary">AI signal generation and trade execution</div>
          </div>
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => window.dispatchEvent(new Event('open-settings-sheet'))}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/72 text-text-secondary shadow-[0_8px_18px_rgba(27,39,76,0.06)]"
          >
            <Settings2 className="h-4 w-4" />
          </motion.button>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 text-primary">
            <div className="premium-orb relative flex h-11 w-11 items-center justify-center rounded-full bg-primary-soft">
              <div className="absolute inset-[18%] rounded-full bg-[radial-gradient(circle,#8fb8ff_0%,#4e86ff_55%,#245df3_100%)]" />
              <Zap className="relative z-10 h-4 w-4 fill-current text-white" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">LBES EXECUTION AI</p>
              <h1 className="mt-1 text-[28px] font-bold tracking-[-0.03em] text-text-primary">AI Trade Intelligence</h1>
              <p className="mt-1 text-sm text-text-secondary">AI filtered execution engine</p>
            </div>
          </div>
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
            className="premium-card flex min-w-[72px] flex-col items-center rounded-[24px] px-3 py-3"
          >
            <div className="premium-orb relative h-10 w-10 rounded-full">
              <div className="absolute inset-[18%] rounded-full bg-[radial-gradient(circle,#97dbff_0%,#4d8dff_58%,#245df3_100%)]" />
            </div>
            <span className="mt-2 text-[10px] font-bold uppercase tracking-[0.24em] text-primary">Live</span>
          </motion.div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card className="overflow-hidden bg-[radial-gradient(circle_at_top_right,_rgba(71,130,255,0.24),_transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.84)_0%,rgba(245,248,255,0.72)_100%)]">
          <CardContent className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary">AI Active Session</div>
                <div className="mt-2 text-xl font-bold tracking-[-0.03em] text-text-primary">London Killzone</div>
                <p className="mt-2 text-sm leading-6 text-text-secondary">Monitoring EURUSD BTC XAU</p>
              </div>
              <div className="rounded-full bg-white/68 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-primary shadow-[0_10px_24px_rgba(27,39,76,0.06)]">
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#34c759]" />
                Active
              </div>
            </div>
            <div className="rounded-[26px] border border-white/75 bg-white/58 p-4 shadow-[0_14px_26px_rgba(50,78,139,0.08)] backdrop-blur-xl">
              <div className="text-sm font-semibold text-text-primary">Execution status</div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                <Metric label="Win streak" value={String(winStreak)} />
                <Metric label="Active signals" value={String(activeSignals)} />
                <Metric label="Net R" value={`${netR >= 0 ? '+' : ''}${netR.toFixed(1)}`} />
                <Metric label="AI alignment" value={averageAlignment ? `${averageAlignment}%` : '--'} />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.06 }}>
        <Card>
          <CardContent className="space-y-4">
            <Field label="Trading Pair" hint={activePair.subtitle}>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-subtle text-primary">{pairIcon}</div>
                <div className="flex-1">
                  <Select value={form.pair} onChange={(event) => setForm((current) => ({ ...current, pair: event.target.value }))}>
                    {pairOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Timeframe">
                <Select value={form.timeframe} onChange={(event) => setForm((current) => ({ ...current, timeframe: event.target.value as AnalysisFormState['timeframe'] }))}>
                  <option value="1m">1m</option>
                  <option value="15m">15m</option>
                  <option value="1H">1H</option>
                  <option value="4H">4H</option>
                </Select>
              </Field>
              <Field label="Capital">
                <Input
                  value={String(form.capital)}
                  onChange={(event) => setForm((current) => ({ ...current, capital: Number(event.target.value) || 0 }))}
                  inputMode="numeric"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Risk Reward">
                <Select value={form.riskReward} onChange={(event) => setForm((current) => ({ ...current, riskReward: event.target.value }))}>
                  {riskRewardOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Trading Style">
                <Select value={form.tradingStyle} onChange={(event) => setForm((current) => ({ ...current, tradingStyle: event.target.value as AnalysisFormState['tradingStyle'] }))}>
                  <option>Day Trader</option>
                  <option>Swing</option>
                  <option>Scalp</option>
                </Select>
              </Field>
            </div>

            <Button variant="primary" size="lg" className="w-full" onClick={runAnalysis} disabled={isLoading}>
              {isLoading ? 'Analyzing...' : 'Analyze'}
            </Button>
            {tradeError ? (
              <div className="rounded-[18px] bg-[#fff1f0] px-4 py-3 text-sm font-semibold text-[#de5246]">
                {tradeError}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </motion.div>

      {notice === 'offline' ? (
        <Card className="border-[#ffe1b5] bg-[#fff9ef]">
          <CardContent className="flex items-start gap-3">
            <TriangleAlert className="mt-1 h-5 w-5 text-[#d97706]" />
            <div>
              <div className="font-semibold text-text-primary">No internet</div>
              <p className="mt-1 text-sm leading-6 text-text-secondary">Reconnect to generate a fresh execution signal. Existing activity remains available locally.</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <AnimatePresence mode="wait">
        {isLoading ? (
          <AnalysisOverlay key="loading" progress={progress} stepIndex={stepIndex} />
        ) : signal ? (
          <motion.div key={signal.id} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4 }} className="space-y-4">
            {signal.signal === 'NO_SIGNAL' ? (
              <Card className="border-[#e5e9f3] bg-[radial-gradient(circle_at_top_right,_rgba(37,99,235,0.12),_transparent_38%),rgba(255,255,255,0.76)]">
                <CardContent className="space-y-5 py-7">
                  <div className="text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#eff6ff] text-primary">
                      <AlertCircle className="h-6 w-6" />
                    </div>
                    <h2 className="mt-4 text-xl font-bold">No trade found.</h2>
                    <p className="mt-2 text-sm leading-6 text-text-secondary">ReasonTrack blocked weak conditions.</p>
                  </div>
                  <div className="rounded-[24px] border border-white/75 bg-white/60 p-4">
                    <div className="text-xs font-bold uppercase tracking-[0.18em] text-text-muted">Blocked by ReasonTrack</div>
                    <div className="mt-3 grid gap-2">
                      {signal.blockedReasons.map((reason, index) => (
                        <motion.div
                          key={reason}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35, delay: index * 0.05 }}
                          className="flex items-center gap-2 rounded-full bg-[#fff7ed] px-3 py-2 text-xs font-semibold text-[#c2410c]"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          {reason}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  <p className="text-center text-sm font-semibold text-text-primary">Protected capital matters more than activity.</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card className={signal.signal === 'BUY'
                  ? 'overflow-hidden border-[#dff5e7] bg-[radial-gradient(circle_at_top_right,_rgba(52,199,89,0.20),_transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.84)_0%,rgba(243,255,248,0.86)_100%)]'
                  : 'overflow-hidden border-[#ffe1dc] bg-[radial-gradient(circle_at_top_right,_rgba(222,82,70,0.18),_transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.84)_0%,rgba(255,245,244,0.86)_100%)]'}>
                  <CardContent className="space-y-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="mb-3 inline-flex rounded-full bg-[#f3e8ff] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#7c3aed]">LBES verified</div>
                        <div className={signal.signal === 'BUY' ? 'text-[42px] font-bold text-[#1f9d55]' : 'text-[42px] font-bold text-[#de5246]'}>
                          {signal.signal}
                        </div>
                        <SignalBars value={signal.confidence} tone={signal.signal} />
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted">Alignment Score</div>
                        <CountUp value={signal.confidence} className="text-[#7c3aed]" />
                        <div className="mt-1 max-w-[150px] text-[11px] leading-4 text-text-muted">Alignment measures market condition quality. Not win probability.</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-[112px_1fr] gap-4">
                      <ConfidenceRing value={signal.confidence} tone={signal.signal} />
                      <div className="space-y-3 rounded-[24px] border border-white/70 bg-white/58 p-4 backdrop-blur-xl">
                        <Meter label="Signal strength" value={signal.confidence} tone={signal.signal} />
                        <Meter label="Risk meter" value={signal.signal === 'BUY' ? 42 : 58} tone={signal.signal === 'BUY' ? 'BUY' : 'SELL'} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <SignalMetric label="Entry" value={String(signal.entry)} tone="entry" />
                      <SignalMetric label="Stop Loss" value={String(signal.stopLoss)} tone="stop" />
                      <SignalMetric label="TP1" value={String(signal.tp1)} tone="tp" />
                      <SignalMetric label="TP2" value={String(signal.tp2)} tone="tp" />
                      <SignalMetric label="TP3" value={String(signal.tp3)} tone="tp" />
                      <SignalMetric label="Risk Reward" value={signal.riskReward} tone="rr" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="space-y-4">
                    <button type="button" onClick={() => setAccordionOpen((current) => !current)} className="flex w-full items-center justify-between">
                      <span className="text-base font-semibold text-text-primary">Show analysis</span>
                      <motion.div animate={{ rotate: accordionOpen ? 180 : 0 }} transition={{ duration: 0.4 }}>
                        <ChevronDown className="h-5 w-5 text-text-secondary" />
                      </motion.div>
                    </button>

                    <AnimatePresence initial={false}>
                      {accordionOpen ? (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4 }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-4 pt-2">
                            <AnalysisItem title="TRADE REASON" value={signal.analysis.tradeReason} icon={Brain} delay={0} />
                            <AnalysisItem title="TECHNICAL ALIGNMENT" value={signal.analysis.technicalAlignment} icon={ChartNoAxesColumn} delay={0.05} />
                            <AnalysisItem title="MACRO ALIGNMENT" value={signal.analysis.macroAlignment} icon={Earth} delay={0.1} />
                            <AnalysisItem title="INVALIDATION" value={signal.analysis.invalidation} icon={OctagonAlert} delay={0.15} />
                            <AnalysisItem title="RISK PROFILE" value={signal.analysis.riskProfile} icon={Shield} delay={0.2} />
                            <TrustEvidence signal={signal} />
                          </div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </CardContent>
                </Card>

                <Button variant="success" size="lg" className="w-full" onClick={() => addTradeFromSignal(signal)}>
                  Auto Fill Journal
                </Button>
              </>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-[0.18em] text-text-muted">{label}</label>
        {hint ? <span className="text-xs text-text-muted">{hint}</span> : null}
      </div>
      {children}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] bg-white/54 p-3 backdrop-blur-xl">
      <div className="mb-2 flex items-center justify-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-muted">{label}</div>
      </div>
      <div className="mt-2 text-lg font-bold text-text-primary">{value}</div>
    </div>
  );
}

function SignalMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'entry' | 'stop' | 'tp' | 'rr';
}) {
  const palette = {
    entry: 'bg-[#eff6ff] text-[#2563eb]',
    stop: 'bg-[#fee2e2] text-[#dc2626]',
    tp: 'bg-[#dcfce7] text-[#16a34a]',
    rr: 'bg-[#fff7ed] text-[#ea580c]',
  } as const;

  return (
    <div className={`rounded-[18px] p-4 ${palette[tone]}`}>
      <div className="text-xs font-bold uppercase tracking-[0.18em] text-text-muted">{label}</div>
      <div className="mt-2 text-sm font-semibold">{value}</div>
    </div>
  );
}

function AnalysisItem({
  title,
  value,
  icon: Icon,
  delay,
}: {
  title: string;
  value: string;
  icon: typeof Brain;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="rounded-[24px] border border-white/70 bg-white/60 p-4 backdrop-blur-xl"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div className="text-xs font-bold uppercase tracking-[0.18em] text-text-muted">{title}</div>
      </div>
      <p className="mt-3 text-sm leading-6 text-text-secondary">{value}</p>
    </motion.div>
  );
}

function TrustEvidence({ signal }: { signal: GeneratedSignal }) {
  const validationLayers = signal.validationLayers?.length
    ? signal.validationLayers
    : ['Liquidity aligned', 'Session aligned', 'Structure matched', 'Momentum confirmed', 'Risk window accepted', 'Setup DNA matched', 'Conflicting signals removed'];
  const rejectedSetups = signal.rejectedSetups?.length
    ? signal.rejectedSetups
    : ['Conflicting structure', 'Low momentum', 'Session weakness', 'Poor alignment'];

  return (
    <div className="space-y-3">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="rounded-[24px] border border-white/70 bg-white/60 p-4 backdrop-blur-xl"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-text-muted">Why this passed</div>
            <div className="mt-1 text-sm font-semibold text-text-primary">{validationLayers.length} validation layers passed</div>
          </div>
          <div className="rounded-full bg-[#dcfce7] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#15803d]">
            Verified
          </div>
        </div>
        <div className="mt-4 grid gap-2">
          {validationLayers.map((layer, index) => (
            <motion.div
              key={layer}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 + index * 0.04 }}
              className="flex items-center gap-2 rounded-full bg-[#ecfdf3] px-3 py-2 text-xs font-semibold text-[#15803d]"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {layer}
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="rounded-[24px] border border-white/70 bg-white/60 p-4 backdrop-blur-xl"
      >
        <div className="text-xs font-bold uppercase tracking-[0.18em] text-text-muted">Why others failed</div>
        <div className="mt-3 grid gap-2">
          {rejectedSetups.map((reason, index) => (
            <motion.div
              key={reason}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.35 + index * 0.04 }}
              className="flex items-center gap-2 rounded-full bg-[#fff7ed] px-3 py-2 text-xs font-semibold text-[#c2410c]"
            >
              <XCircle className="h-3.5 w-3.5" />
              {reason}
            </motion.div>
          ))}
        </div>
        <p className="mt-3 text-xs leading-5 text-text-secondary">Blocked by ReasonTrack before reaching execution.</p>
      </motion.div>
    </div>
  );
}

function AnalysisOverlay({ progress, stepIndex }: { progress: number; stepIndex: number }) {
  const steps = [
    'Scanning market structure',
    'Checking liquidity zones',
    'Comparing historical execution profile',
    'Validating momentum behavior',
    'Session alignment verification',
    'Removing conflicting signals',
    'Building alignment score',
  ];

  const statusLabels = [
    'Analyzing EURUSD',
    'Scanning session bias',
    'Cross checking setup DNA',
    'Liquidity matched',
    'Momentum confirmed',
  ];

  return (
    <motion.div
      key="loading"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[linear-gradient(180deg,rgba(248,250,255,0.94)_0%,rgba(244,246,252,0.95)_50%,rgba(238,243,255,0.96)_100%)] px-6 backdrop-blur-xl"
    >
      <div className="w-full max-w-[360px] space-y-6">
        <div className="mx-auto flex w-fit items-center gap-3 rounded-full border border-white/75 bg-white/68 px-4 py-2 shadow-[0_18px_40px_rgba(27,39,76,0.08)]">
          <LoaderCircle className="h-4 w-4 animate-spin text-primary" />
          <span className="text-xs font-bold uppercase tracking-[0.24em] text-primary">AI execution engine</span>
        </div>
        <motion.div
          animate={{ y: [0, -4, 0], scale: [1, 1.02, 1] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          className="premium-orb relative mx-auto h-28 w-28 rounded-full"
        >
          <div className="absolute inset-[15%] rounded-full bg-[radial-gradient(circle,#d2e4ff_0%,#78a8ff_38%,#245df3_100%)] shadow-[0_0_45px_rgba(75,130,255,0.42)]" />
        </motion.div>
        <div className="space-y-4 text-center">
          <div className="text-2xl font-bold tracking-[-0.04em] text-text-primary">{steps[stepIndex]}</div>
          <div className="text-sm text-text-secondary">ReasonTrack is simulating the LBES execution path before releasing a signal.</div>
        </div>
        <LoadingVisual stepIndex={stepIndex} progress={progress} />
        <div className="grid grid-cols-2 gap-2">
          {statusLabels.map((label, index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0.4 }}
              animate={{ opacity: stepIndex >= Math.min(index, 4) ? 1 : 0.45 }}
              className="rounded-[18px] border border-white/80 bg-white/56 px-3 py-3 text-xs font-semibold text-text-secondary"
            >
              {label}
            </motion.div>
          ))}
        </div>
        <div className="space-y-3 rounded-[28px] border border-white/80 bg-white/62 p-5 shadow-[0_18px_40px_rgba(27,39,76,0.08)] backdrop-blur-xl">
          <div className="flex justify-between text-sm font-semibold">
            <span className="text-text-secondary">Execution Alignment</span>
            <span className="text-[#7c3aed]">{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#dfe9ff]">
            <motion.div
              className="h-full rounded-full bg-[linear-gradient(90deg,#4e86ff_0%,#77b0ff_100%)]"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <div className="text-sm font-semibold text-text-primary">7 validation layers completed</div>
          <div className="text-xs leading-5 text-text-secondary">Alignment increases after every passed filter.</div>
          <div className="text-[11px] leading-5 text-text-muted">No signals released before multi-layer validation.</div>
        </div>
      </div>
    </motion.div>
  );
}

function LoadingVisual({ stepIndex, progress }: { stepIndex: number; progress: number }) {
  if (stepIndex === 0) {
    return (
      <div className="grid grid-cols-6 gap-2 rounded-[24px] border border-white/80 bg-white/54 p-4">
        {Array.from({ length: 24 }).map((_, index) => (
          <motion.div
            key={index}
            animate={{ opacity: [0.35, 1, 0.45], scale: [1, 1.06, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: (index % 6) * 0.05 }}
            className="h-8 rounded-[12px] bg-[linear-gradient(180deg,#edf4ff_0%,#dce8ff_100%)]"
          />
        ))}
      </div>
    );
  }

  if (stepIndex === 1) {
    return (
      <div className="flex items-end justify-center gap-1 rounded-[24px] border border-white/80 bg-white/54 p-4">
        {Array.from({ length: 20 }).map((_, index) => (
          <motion.div
            key={index}
            animate={{ height: [12, 38 + ((index % 5) * 4), 12] }}
            transition={{ duration: 1.1, repeat: Infinity, delay: index * 0.03 }}
            className="w-2 rounded-full bg-[linear-gradient(180deg,#7ec1ff_0%,#2563eb_100%)]"
          />
        ))}
      </div>
    );
  }

  if (stepIndex === 2) {
    return (
      <div className="rounded-[24px] border border-white/80 bg-white/54 p-4">
        <svg viewBox="0 0 240 80" className="h-20 w-full">
          <motion.path
            d="M0 58 C24 52, 34 28, 56 34 S90 64, 112 52 S148 18, 176 30 S212 58, 240 40"
            fill="none"
            stroke="#5d93ff"
            strokeWidth="4"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.1, repeat: Infinity, repeatType: 'reverse' }}
          />
        </svg>
      </div>
    );
  }

  if (stepIndex === 3) {
    return (
      <div className="overflow-hidden rounded-[24px] border border-white/80 bg-white/54 p-4">
        <motion.div
          animate={{ x: ['-110%', '110%'] }}
          transition={{ duration: 1.3, repeat: Infinity, ease: 'linear' }}
          className="h-16 w-24 rounded-[18px] bg-[linear-gradient(90deg,rgba(93,147,255,0)_0%,rgba(93,147,255,0.22)_50%,rgba(93,147,255,0)_100%)] blur-sm"
        />
      </div>
    );
  }

  if (stepIndex === 4 || stepIndex === 5) {
    return (
      <div className="grid gap-3">
        {[0, 1, 2].map((item) => (
          <motion.div
            key={item}
            animate={{ opacity: [0.55, 1, 0.55], scale: [1, 1.01, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, delay: item * 0.14 }}
            className="rounded-[22px] border border-white/80 bg-white/60 p-4 shadow-[0_14px_30px_rgba(27,39,76,0.06)]"
          >
            <div className="h-3 w-24 rounded-full bg-[#dfe9ff]" />
            <div className="mt-3 h-2 w-full rounded-full bg-[#edf3ff]" />
            <div className="mt-2 h-2 w-3/4 rounded-full bg-[#edf3ff]" />
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="text-center">
      <motion.div
        key={progress}
        initial={{ opacity: 0.2, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="text-[56px] font-bold tracking-[-0.06em] text-[#7c3aed]"
      >
        {progress}%
      </motion.div>
    </div>
  );
}

function ConfidenceRing({ value, tone }: { value: number; tone: 'BUY' | 'SELL' }) {
  const color = tone === 'BUY' ? '#1f9d55' : '#de5246';
  const degrees = (value / 100) * 360;

  return (
    <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-white/80 bg-white/60 shadow-[0_16px_30px_rgba(27,39,76,0.08)]">
      <div
        className="absolute inset-2 rounded-full"
        style={{ background: `conic-gradient(${color} ${degrees}deg, rgba(219,228,245,0.82) ${degrees}deg)` }}
      />
      <div className="absolute inset-4 rounded-full bg-[rgba(255,255,255,0.92)]" />
      <div className="relative text-center">
        <div className="text-xl font-bold tracking-[-0.04em] text-text-primary">{value}</div>
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">Align</div>
      </div>
    </div>
  );
}

function CountUp({ value, className }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame = 0;
    const duration = 900;
    const startedAt = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startedAt;
      const progress = Math.min(elapsed / duration, 1);
      setDisplay(Math.round(value * progress));
      if (progress < 1) {
        frame = window.requestAnimationFrame(tick);
      }
    };

    frame = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frame);
  }, [value]);

  return (
    <motion.div initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} className={`mt-2 text-[34px] font-bold tracking-[-0.04em] text-text-primary ${className ?? ''}`}>
      {display}%
    </motion.div>
  );
}

function SignalBars({ value, tone }: { value: number; tone: 'BUY' | 'SELL' }) {
  const activeCount = Math.max(1, Math.round(value / 20));
  const activeClass = tone === 'BUY' ? 'bg-[#1f9d55]' : 'bg-[#de5246]';

  return (
    <div className="mt-3 flex items-end gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <span
          key={index}
          className={`block w-2 rounded-full ${index < activeCount ? activeClass : 'bg-white/65'}`}
          style={{ height: `${12 + index * 4}px` }}
        />
      ))}
    </div>
  );
}

function Meter({ label, value, tone }: { label: string; value: number; tone: 'BUY' | 'SELL' }) {
  const color = tone === 'BUY' ? 'from-[#1f9d55] to-[#5ad67e]' : 'from-[#de5246] to-[#ff9f8f]';

  return (
    <div>
      <div className="mb-2 flex justify-between text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-[#e2eaf8]">
        <div className={`h-full rounded-full bg-gradient-to-r ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function getPairIcon(market: 'fx' | 'crypto' | 'metal') {
  if (market === 'crypto') return <Bitcoin className="h-5 w-5" />;
  if (market === 'metal') return <CandlestickChart className="h-5 w-5" />;
  return <Globe className="h-5 w-5" />;
}

function getWinStreak(trades: ActivityTrade[]) {
  let streak = 0;
  for (const trade of trades) {
    if (trade.status !== 'win') break;
    streak += 1;
  }
  return streak;
}
