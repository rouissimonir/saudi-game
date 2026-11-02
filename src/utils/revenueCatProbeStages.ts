export type ProbeStage = 'STARTED' | 'INELIGIBLE' | 'INITIALIZED' | 'CONFIG_FAILED' | 'FETCH_NETWORK' | 'FETCH_CREDENTIALS' | 'FETCH_CONFIGURATION' | 'FETCH_NO_PRODUCTS' | 'FETCH_PRODUCTS_UNAVAILABLE' | 'FETCH_BACKEND' | 'FETCH_STORE' | 'FETCH_PLUGIN' | 'FETCH_OTHER' | 'NO_CURRENT' | 'MISSING_PACKAGES' | 'OFFERINGS_OK';

/** Keep diagnostics fixed and non-sensitive; never render raw error messages or user info. */
export function classifyProbeFetchError(error: unknown): ProbeStage {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
  if (['10', '33', '35'].includes(code)) return 'FETCH_NETWORK';
  if (code === '11') return 'FETCH_CREDENTIALS';
  if (code === '23') {
    const details = error as { message?: unknown; underlyingErrorMessage?: unknown };
    const messages = [details.message, details.underlyingErrorMessage].filter((value): value is string => typeof value === 'string');
    if (messages.some(message => /none of the products registered.*could be fetched/i.test(message))) return 'FETCH_PRODUCTS_UNAVAILABLE';
    if (messages.some(message => /no products registered.*offerings/i.test(message))) return 'FETCH_NO_PRODUCTS';
    return 'FETCH_CONFIGURATION';
  }
  if (['12', '16'].includes(code)) return 'FETCH_BACKEND';
  if (['2', '5', '32'].includes(code)) return 'FETCH_STORE';
  if (['UNIMPLEMENTED', 'UNAVAILABLE'].includes(code)) return 'FETCH_PLUGIN';
  return 'FETCH_OTHER';
}

/** CI-only probe logic: fixed stages only; never expose SDK errors, identities, or transactions. */
export async function inspectTestOffering(
  initialize: () => Promise<void>,
  fetchPackageIds: () => Promise<readonly string[] | null>,
  report: (stage: ProbeStage) => void,
): Promise<void> {
  try { await initialize(); }
  catch { report('CONFIG_FAILED'); return; }
  report('INITIALIZED');
  let ids: readonly string[] | null;
  try { ids = await fetchPackageIds(); }
  catch (error) { report(classifyProbeFetchError(error)); return; }
  if (ids === null) { report('NO_CURRENT'); return; }
  if (!['$rc_monthly', 'starter_pack', 'decor_pack'].every(id => ids.includes(id))) {
    report('MISSING_PACKAGES');
    return;
  }
  report('OFFERINGS_OK');
}
