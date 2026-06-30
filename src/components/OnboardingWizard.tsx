import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';
import { Input } from './ui/Input';
import { useSettingsStore } from '../store/useSettingsStore';

interface OnboardingWizardProps {
  onComplete?: () => void;
}

const steps = [
  {
    title: 'Choose your edge',
    description: 'Pick the style that best matches the way you trade so the engine can tailor your next moves.',
  },
  {
    title: 'Set your risk posture',
    description: 'Tie your account size and risk tolerance to future trade sizing and guidance.',
  },
  {
    title: 'Lock in your playbook',
    description: 'We’ll use your experience level to shape how confidently the system recommends entries.',
  },
  {
    title: 'You are ready',
    description: 'The welcome flow is complete and your future signals will feel more personal from the first click.',
  },
] as const;

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const { profile, updateProfile } = useSettingsStore();
  const [step, setStep] = useState(0);
  const [isVisible, setIsVisible] = useState(!profile.onboardingCompleted);

  const completeMutation = useMutation({
    mutationFn: async () => {
      await updateProfile({ onboardingCompleted: true });
    },
    onSuccess: () => {
      setIsVisible(false);
      onComplete?.();
    },
  });

  const preview = useMemo(() => {
    const base = profile.riskTolerance === 'Conservative' ? 0.8 : profile.riskTolerance === 'Aggressive' ? 1.6 : 1.2;
    const sizing = profile.accountSize > 25000 ? 'premium sizing' : 'steady sizing';
    const styleLabel = profile.tradingStyle === 'Scalper' ? 'fast scalp entries' : profile.tradingStyle === 'Swing Trader' ? 'clean swing structure' : profile.tradingStyle === 'Position Trader' ? 'macro conviction' : 'structured intraday setups';

    return {
      title: `${profile.tradingStyle} • ${profile.riskTolerance}`,
      detail: `Future trades will emphasize ${styleLabel} with ${base.toFixed(1)}R risk framing and ${sizing}.`,
      confidence: profile.experience === 'Advanced' ? 'High' : profile.experience === 'Beginner' ? 'Measured' : 'Balanced',
    };
  }, [profile.accountSize, profile.experience, profile.riskTolerance, profile.tradingStyle]);

  if (!isVisible || profile.onboardingCompleted) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[32px] border border-emerald-400/20 bg-[radial-gradient(circle_at_top_right,_rgba(110,231,183,0.18),_transparent_34%),rgba(8,10,20,0.95)] p-4 shadow-[0_24px_60px_rgba(2,6,23,0.28)]"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-300">Welcome aboard</div>
          <h2 className="mt-1 text-xl font-semibold text-white">Make your first-run experience feel personal</h2>
        </div>
        <div className="rounded-full border border-white/10 bg-white/8 px-3 py-2 text-xs font-semibold text-slate-300">
          Step {step + 1} / {steps.length}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.2 }}
          className="mt-4"
        >
          <Card className="trading-card border border-white/10 bg-[rgba(255,255,255,0.04)]">
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-300">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-semibold">{steps[step].title}</span>
              </div>
              <p className="text-sm leading-6 text-slate-300">{steps[step].description}</p>

              {step === 0 ? (
                <div className="grid gap-2">
                  {(['Scalper', 'Day Trader', 'Swing Trader', 'Position Trader'] as const).map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => updateProfile({ tradingStyle: style })}
                      className={`btn-premium rounded-[18px] border px-4 py-3 text-left text-sm font-medium transition ${profile.tradingStyle === style ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200' : 'border-white/10 bg-white/6 text-slate-300 hover:bg-white/10'}`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              ) : null}

              {step === 1 ? (
                <div className="space-y-3">
                  <div className="grid gap-2">
                    {(['Conservative', 'Moderate', 'Aggressive'] as const).map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => updateProfile({ riskTolerance: level })}
                        className={`btn-premium rounded-[18px] border px-4 py-3 text-left text-sm font-medium transition ${profile.riskTolerance === level ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200' : 'border-white/10 bg-white/6 text-slate-300 hover:bg-white/10'}`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                  <Input
                    value={String(profile.accountSize)}
                    onChange={(event) => updateProfile({ accountSize: Number(event.target.value) || 10000 })}
                    inputMode="numeric"
                    placeholder="Account size"
                  />
                </div>
              ) : null}

              {step === 2 ? (
                <div className="grid gap-2">
                  {(['Beginner', 'Intermediate', 'Advanced'] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => updateProfile({ experience: level })}
                      className={`btn-premium rounded-[18px] border px-4 py-3 text-left text-sm font-medium transition ${profile.experience === level ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200' : 'border-white/10 bg-white/6 text-slate-300 hover:bg-white/10'}`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              ) : null}

              {step === 3 ? (
                <div className="rounded-[24px] border border-emerald-400/20 bg-emerald-400/10 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">Setup complete</div>
                      <div className="text-sm text-emerald-100">Your future signal cards will be more tailored from the very first analysis.</div>
                    </div>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 rounded-[24px] border border-white/10 bg-white/6 p-4"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">Live preview</div>
            <div className="text-sm text-slate-300">{preview.detail}</div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between rounded-[18px] border border-white/10 bg-black/20 px-3 py-2 text-sm text-slate-300">
          <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-300" /> {preview.title}</span>
          <span className="text-emerald-200">{preview.confidence} confidence</span>
        </div>
      </motion.div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <Button variant="ghost" onClick={() => setIsVisible(false)} className="text-slate-400">
          Skip for now
        </Button>
        <div className="flex gap-2">
          {step > 0 ? (
            <Button variant="outline" onClick={() => setStep((current) => current - 1)}>
              Back
            </Button>
          ) : null}
          {step < steps.length - 1 ? (
            <Button onClick={() => setStep((current) => current + 1)}>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={() => completeMutation.mutate()} disabled={completeMutation.isPending}>
              {completeMutation.isPending ? 'Saving…' : 'Finish setup'}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
