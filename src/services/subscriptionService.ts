import { supabase } from './supabase';

export async function fetchSubscription(userId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function joinLabsWaitlist(userId: string, email: string, labId: string) {
  const payload = {
    user_id: userId,
    email,
    lab_id: labId,
    feature: labId,
    status: 'joined',
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('labs_waitlist')
    .insert(payload)
    .select('*')
    .single();

  if (!error) return data;

  const fallback = await supabase
    .from('labs_waitlist')
    .insert({ user_id: userId, email, feature: labId })
    .select('*')
    .single();

  if (fallback.error) throw fallback.error;
  return fallback.data;
}

