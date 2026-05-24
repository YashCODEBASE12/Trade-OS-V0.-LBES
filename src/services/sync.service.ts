import { supabase } from './supabase';
import { ensureProfile } from './profileService';

export class SyncService {
  private static instance: SyncService;

  private constructor() {}

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  async migrateLocalData(): Promise<{ success: boolean; error?: unknown }> {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) return { success: false, error };
    if (user) await ensureProfile(user);
    return { success: true };
  }

  setupRealtimeSubscription(userId: string) {
    return supabase
      .channel(`reasontrack:trades:${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'trades', filter: `user_id=eq.${userId}` },
        () => undefined,
      )
      .subscribe();
  }
}

export const syncService = SyncService.getInstance();
