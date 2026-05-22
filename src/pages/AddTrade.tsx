import React, { useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useTradesStore } from '../store/useTradesStore';
import { usePlaybookStore } from '../store/usePlaybookStore';
import { useDraftTradeStore } from '../store/useDraftTradeStore';
import { calculateRMultiple } from '../utils/calculations';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { ArrowLeft } from 'lucide-react';
import { cn, formatNumber } from '../lib/utils';
import { Trade } from '../types';
import { useAuthStore } from '../store/useAuthStore';
import { SignInModal } from '../components/SignInModal';

type TradeFormData = Omit<Trade, 'id' | 'created_at' | 'updated_at' | 'week_number' | 'result_r' | 'outcome' | 'mistake_type'>;

const AddTrade = () => {
  const navigate = useNavigate();
  const addTrade = useTradesStore((state) => state.addTrade);
  const setups = usePlaybookStore((state) => state.setups);
  const { draft, clearDraft } = useDraftTradeStore();
  const { user } = useAuthStore();
  const [showSignIn, setShowSignIn] = useState(false);

  const { register, control, handleSubmit, watch, setValue, reset } = useForm<TradeFormData>({
    defaultValues: {
      date: new Date().toISOString().slice(0, 16),
      pair: '',
      timeframe: '1H',
      direction: 'Buy',
      entry_price: 0,
      stop_loss: 0,
      take_profit: 0,
      risk_usd: 100,
      reward_usd: 0,
      r_multiple: 0,
      rule_followed: true,
      reason: '',
      invalidation: '',
      emotion: 5,
      notes: '',
      setup_id: null,
    },
  });

  useEffect(() => {
    if (draft.pair) {
      reset({
        ...draft,
        entry_price: draft.entry_price ?? 0,
        stop_loss: draft.stop_loss ?? 0,
        take_profit: draft.take_profit ?? 0,
        risk_usd: draft.risk_usd ?? 100,
        reward_usd: draft.reward_usd ?? 0,
        r_multiple: draft.r_multiple ?? 0,
        emotion: draft.emotion ?? 5,
        rule_followed: draft.rule_followed ?? true,
        setup_id: draft.setup_id ?? null,
      });
      clearDraft();
    }
  }, [draft, reset, clearDraft]);

  const direction = watch('direction');
  const entry = parseFloat(watch('entry_price') as any);
  const sl = parseFloat(watch('stop_loss') as any);
  const tp = parseFloat(watch('take_profit') as any);
  const risk = parseFloat(watch('risk_usd') as any);

  useEffect(() => {
    if (entry && sl && tp) {
      const r = calculateRMultiple(direction, entry, sl, tp);
      setValue('r_multiple', parseFloat(r.toFixed(2)));

      if (risk) {
        setValue('reward_usd', parseFloat((r * risk).toFixed(2)));
      }
    }
  }, [direction, entry, sl, tp, risk, setValue]);

  const rMultiple = watch('r_multiple');
  const rewardUsd = watch('reward_usd');

  const onSubmit = (data: TradeFormData) => {
    if (!user) {
      setShowSignIn(true);
      return;
    }

    addTrade({
      ...data,
      outcome: 'open',
      result_r: null,
      mistake_type: null,
      entry_price: Number(data.entry_price),
      stop_loss: Number(data.stop_loss),
      take_profit: Number(data.take_profit),
      risk_usd: Number(data.risk_usd),
      reward_usd: Number(data.reward_usd),
      r_multiple: Number(data.r_multiple),
      emotion: Number(data.emotion),
    });

    navigate('/trades');
  };

  const balanceLabel = useMemo(() => {
    if (rMultiple >= 2) return 'High reward';
    if (rMultiple >= 1) return 'Balanced risk';
    return 'Protect capital';
  }, [rMultiple]);

  return (
    <div className="pb-24 bg-background min-h-screen px-4 pt-6">
      <div className="mb-6 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Add Trade</h1>
          <p className="text-sm text-text-secondary">Log your trade with exact execution details.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardContent className="space-y-4 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-[0.18em] text-text-secondary">Pair</label>
                <Input {...register('pair', { required: true })} placeholder="BTC/USD" className="uppercase" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-[0.18em] text-text-secondary">Timeframe</label>
                <select
                  {...register('timeframe')}
                  className="flex h-10 w-full rounded-3xl border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-[#4F8CFF]/30"
                >
                  {['5m', '15m', '1H', '4H', 'Daily'].map((tf) => (
                    <option key={tf} value={tf}>{tf}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-[0.18em] text-text-secondary">Direction</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setValue('direction', 'Buy')}
                    className={cn(
                      'h-10 rounded-3xl border text-sm font-semibold transition-colors',
                      direction === 'Buy'
                        ? 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]'
                        : 'bg-surface text-text-primary border-border hover:bg-surface/80'
                    )}
                  >
                    Buy
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue('direction', 'Sell')}
                    className={cn(
                      'h-10 rounded-3xl border text-sm font-semibold transition-colors',
                      direction === 'Sell'
                        ? 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]'
                        : 'bg-surface text-text-primary border-border hover:bg-surface/80'
                    )}
                  >
                    Sell
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-[0.18em] text-text-secondary">Setup</label>
                <select
                  {...register('setup_id')}
                  className="flex h-10 w-full rounded-3xl border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-[#4F8CFF]/30"
                >
                  <option value="">Select setup</option>
                  {setups.map((setup) => (
                    <option key={setup.id} value={setup.id}>{setup.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-[0.18em] text-text-secondary">Entry</label>
                <Input type="number" step="any" {...register('entry_price', { required: true })} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-[0.18em] text-text-secondary">Stop Loss</label>
                <Input type="number" step="any" {...register('stop_loss', { required: true })} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-[0.18em] text-text-secondary">Take Profit</label>
                <Input type="number" step="any" {...register('take_profit', { required: true })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-[0.18em] text-text-secondary">Risk ($)</label>
                <Input type="number" step="any" {...register('risk_usd', { required: true, min: 0 })} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-[0.18em] text-text-secondary">R Multiple</label>
                <Input value={rMultiple.toFixed(2)} readOnly className="bg-surface" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-sm">
              <div className="rounded-3xl bg-surface p-3 border border-border">
                <div className="text-[10px] uppercase tracking-[0.18em] text-text-muted">Reward</div>
                <div className="mt-2 text-base font-semibold text-text-primary">${formatNumber(rewardUsd || 0)}</div>
              </div>
              <div className="rounded-3xl bg-surface p-3 border border-border">
                <div className="text-[10px] uppercase tracking-[0.18em] text-text-muted">Ratio</div>
                <div className="mt-2 text-base font-semibold text-text-primary">1:{formatNumber(rMultiple || 0, 1)}</div>
              </div>
              <div className="rounded-3xl bg-surface p-3 border border-border">
                <div className="text-[10px] uppercase tracking-[0.18em] text-text-muted">Status</div>
                <div className="mt-2 text-base font-semibold text-text-primary">{balanceLabel}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-4">
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-[0.18em] text-text-secondary">Why trade</label>
              <textarea
                {...register('reason', { required: true, maxLength: 200 })}
                className="min-h-[96px] w-full rounded-3xl border border-border bg-surface px-3 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-[#4F8CFF]/30"
                placeholder="Why this setup aligns with market structure"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-[0.18em] text-text-secondary">Invalidation</label>
              <Input {...register('invalidation')} placeholder="Price closes below..." />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium uppercase tracking-[0.18em] text-text-secondary">Emotion</label>
                <span className="text-sm text-text-primary">{watch('emotion')}</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                {...register('emotion')}
                className="w-full h-2 rounded-full bg-border"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-text-primary">Follow rules</span>
              <Controller
                name="rule_followed"
                control={control}
                render={({ field }) => (
                  <button
                    type="button"
                    onClick={() => field.onChange(!field.value)}
                    className={cn(
                      'inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      field.value ? 'bg-[#4F8CFF]' : 'bg-slate-300'
                    )}
                  >
                    <span
                      className={cn(
                        'inline-block h-5 w-5 rounded-full bg-white transition-transform',
                        field.value ? 'translate-x-5' : 'translate-x-0'
                      )}
                    />
                  </button>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full h-12 rounded-3xl bg-gradient-to-br from-[#4F8CFF] to-[#8CB8FF] text-white font-semibold">
          Log Trade
        </Button>
      </form>

      <SignInModal isOpen={showSignIn} onClose={() => setShowSignIn(false)} />
    </div>
  );
};

export default AddTrade;
