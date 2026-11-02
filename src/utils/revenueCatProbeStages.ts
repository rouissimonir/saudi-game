export type ProbeStage = 'STARTED' | 'INELIGIBLE' | 'INITIALIZED' | 'CONFIG_FAILED' | 'FETCH_FAILED' | 'NO_CURRENT' | 'MISSING_PACKAGES' | 'OFFERINGS_OK';

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
  catch { report('FETCH_FAILED'); return; }
  if (ids === null) { report('NO_CURRENT'); return; }
  if (!['$rc_monthly', 'starter_pack', 'decor_pack'].every(id => ids.includes(id))) {
    report('MISSING_PACKAGES');
    return;
  }
  report('OFFERINGS_OK');
}
