import { createClient } from '@supabase/supabase-js';

// Public project configuration. Privileged keys never belong in the app bundle.
export const cloudAccount = createClient(
  'https://bbklymawuckhkbthkkfa.supabase.co',
  'sb_publishable_-ef5Ila5N872AAjM3ZM0qQ_t2FvIgCw',
  { auth: { detectSessionInUrl: false, storageKey: 'qahwa-cloud-account' } },
);

export async function readSandboxWallet() {
  const { data, error } = await cloudAccount.from('purchase_wallets')
    .select('energy,gems').eq('environment', 'SANDBOX').maybeSingle();
  if (error) throw error;
  return { energy: Number(data?.energy ?? 0), gems: Number(data?.gems ?? 0) };
}
