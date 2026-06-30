import { User } from '@supabase/supabase-js';
import { supabase } from './supabase';

export type TraderProfile = {
  displayName: string;
  tradingStyle: 'Scalper' | 'Day Trader' | 'Swing Trader' | 'Position Trader';
  riskTolerance: 'Conservative' | 'Moderate' | 'Aggressive';
  accountSize: number;
  currency: string;
  experience: 'Beginner' | 'Intermediate' | 'Advanced';
  onboardingCompleted: boolean;
};

export const defaultTraderProfile: TraderProfile = {
  displayName: 'Trader',
  tradingStyle: 'Day Trader',
  riskTolerance: 'Moderate',
  accountSize: 10000,
  currency: 'USD',
  experience: 'Intermediate',
  onboardingCompleted: false,
};

export async function ensureProfile(user: User) {
  const payload = {
    id: user.id,
    email: user.email ?? '',
    username: user.user_metadata?.name ?? user.email?.split('@')[0] ?? 'Trader',
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('profiles').upsert(payload, { onConflict: 'id' });
  if (error) throw error;
}

export async function fetchProfile(userId: string): Promise<TraderProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return fromProfileRow(data);
}

export async function saveProfile(userId: string, updates: Partial<TraderProfile>) {
  const row = toProfileRow(updates);
  const result = await supabase
    .from('profiles')
    .update({ ...row, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select('*')
    .single();

  if (!result.error) return fromProfileRow(result.data);

  if ('experience' in row) {
    const fallbackRow = { ...row };
    delete fallbackRow.experience;
    const fallback = await supabase
      .from('profiles')
      .update({ ...fallbackRow, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select('*')
      .single();

    if (!fallback.error) return { ...fromProfileRow(fallback.data), experience: updates.experience ?? defaultTraderProfile.experience };
    throw fallback.error;
  }

  throw result.error;
}

function fromProfileRow(row: Record<string, unknown>): TraderProfile {
  return {
    displayName: (row?.username as string) ?? defaultTraderProfile.displayName,
    tradingStyle: fromDbTradingStyle(row?.trading_style as string | null | undefined),
    riskTolerance: fromDbRisk(row?.risk_tolerance as string | null | undefined),
    accountSize: Number(row?.account_size ?? defaultTraderProfile.accountSize),
    currency: (row?.currency as string) ?? defaultTraderProfile.currency,
    experience: fromDbExperience(row?.experience as string | null | undefined),
    onboardingCompleted: Boolean(row?.onboarding_completed ?? false),
  };
}

function toProfileRow(profile: Partial<TraderProfile>) {
  const row: Record<string, unknown> = {};
  if (profile.displayName !== undefined) row.username = profile.displayName;
  if (profile.tradingStyle !== undefined) row.trading_style = toDbTradingStyle(profile.tradingStyle);
  if (profile.riskTolerance !== undefined) row.risk_tolerance = profile.riskTolerance.toLowerCase();
  if (profile.accountSize !== undefined) row.account_size = profile.accountSize;
  if (profile.currency !== undefined) row.currency = profile.currency;
  if (profile.experience !== undefined) row.experience = profile.experience;
  if (profile.onboardingCompleted !== undefined) row.onboarding_completed = profile.onboardingCompleted;
  return row;
}

function toDbTradingStyle(value: TraderProfile['tradingStyle']) {
  if (value === 'Scalper') return 'scalper';
  if (value === 'Swing Trader') return 'swing';
  if (value === 'Position Trader') return 'position';
  return 'day';
}

function fromDbTradingStyle(value: string | null | undefined): TraderProfile['tradingStyle'] {
  if (value === 'scalper') return 'Scalper';
  if (value === 'swing') return 'Swing Trader';
  if (value === 'position') return 'Position Trader';
  return 'Day Trader';
}

function fromDbRisk(value: string | null | undefined): TraderProfile['riskTolerance'] {
  if (value === 'conservative') return 'Conservative';
  if (value === 'aggressive') return 'Aggressive';
  return 'Moderate';
}

function fromDbExperience(value: string | null | undefined): TraderProfile['experience'] {
  if (value === 'Beginner' || value === 'Intermediate' || value === 'Advanced') return value;
  return defaultTraderProfile.experience;
}
