import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
    return Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'));
};

// Singleton Supabase Client
export const supabase: SupabaseClient | null = isSupabaseConfigured()
    ? createClient(supabaseUrl, supabaseAnonKey, {
          auth: {
              persistSession: true,
              autoRefreshToken: true,
          },
      })
    : null;

export interface SleepProfile {
    id: string;
    email: string;
    name: string;
    current_hp: number;
    wake_up_time: string;
    sleep_target_time: string;
    shutdown_stacks: number;
    days_survived: number;
    tickets_count: number;
    is_disabled: boolean;
    last_idle_seconds: number;
    last_sleep_confirmed_at: string | null;
    discord_user_id: string | null;
    updated_at: string;
}

export interface SleepEvent {
    id: string;
    user_id: string;
    event_type: 'alert_30m' | 'lockdown_15m' | 'curfew_breached' | 'hp_drain' | 'disciplinary_lock' | 'shutdown_executed' | 'sleep_confirmed';
    message: string;
    payload?: Record<string, unknown>;
    created_at: string;
}

/**
 * Register user via Supabase Auth
 */
export async function signUpWithSupabase(email: string, password: string, name?: string) {
    if (!supabase) {
        throw new Error('Supabase client is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
    }
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name: name || email.split('@')[0],
            },
        },
    });

    if (error) throw error;
    return data;
}

/**
 * Sign in user via Supabase Auth
 */
export async function signInWithSupabase(email: string, password: string) {
    if (!supabase) {
        throw new Error('Supabase client is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
    }
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw error;
    return data;
}

/**
 * Sign out from Supabase Auth
 */
export async function signOutSupabase() {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Supabase sign out error:', error);
}

/**
 * Get currently authenticated Supabase user
 */
export async function getSupabaseUser() {
    if (!supabase) return null;
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

/**
 * Fetch sleep profile for user
 */
export async function getSleepProfile(userId: string): Promise<SleepProfile | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
        .from('sleep_profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        console.warn('Could not fetch sleep profile from Supabase:', error.message);
        return null;
    }
    return data as SleepProfile;
}

/**
 * Subscribe to realtime updates for user's sleep profile
 */
export function subscribeToSleepProfile(
    userId: string,
    onUpdate: (profile: SleepProfile) => void
): RealtimeChannel | null {
    if (!supabase) return null;

    const channel = supabase
        .channel(`sleep_profile_${userId}`)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'sleep_profiles',
                filter: `id=eq.${userId}`,
            },
            (payload) => {
                if (payload.new) {
                    onUpdate(payload.new as SleepProfile);
                }
            }
        )
        .subscribe();

    return channel;
}

/**
 * Subscribe to realtime sleep events (alerts, lockdowns, hp drains, shutdowns)
 */
export function subscribeToSleepEvents(
    userId: string,
    onEvent: (event: SleepEvent) => void
): RealtimeChannel | null {
    if (!supabase) return null;

    const channel = supabase
        .channel(`sleep_events_${userId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'sleep_events',
                filter: `user_id=eq.${userId}`,
            },
            (payload) => {
                if (payload.new) {
                    onEvent(payload.new as SleepEvent);
                }
            }
        )
        .subscribe();

    return channel;
}

/**
 * Update user sleep profile in Supabase
 */
export async function updateSleepProfile(
    userId: string,
    updates: Partial<SleepProfile>
): Promise<SleepProfile | null> {
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('sleep_profiles')
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

    if (error) {
        console.error('Error updating sleep profile in Supabase:', error.message);
        throw error;
    }

    return data as SleepProfile;
}

/**
 * Log a sleep event to Supabase
 */
export async function logSleepEvent(
    userId: string,
    eventType: SleepEvent['event_type'],
    message: string,
    payload: Record<string, unknown> = {}
) {
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('sleep_events')
        .insert({
            user_id: userId,
            event_type: eventType,
            message,
            payload,
        })
        .select()
        .single();

    if (error) {
        console.error('Error logging sleep event:', error.message);
    }
    return data;
}
