import { useCallback, useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import type { GameState } from '../game/rules';
import { applyPackPurchase } from '../game/dailyPack';
import { initializeRevenueCatAppStore, canInitializeAppStore } from './revenueCatAppStore';
import { ListedPack, buyPack, listedPacks, revenueCatPackPort, todaysOffer, unappliedPurchases } from './packPurchase';

/** Paid packs ship dark: a build must opt in with VITE_DAILY_PACKS=1 and carry the public App Store key. */
export function dailyPacksEnabled(): boolean {
  return import.meta.env.VITE_DAILY_PACKS === '1' &&
    canInitializeAppStore(import.meta.env.PROD, Capacitor.getPlatform(), import.meta.env.VITE_REVENUECAT_IOS_KEY);
}

export type PackStatus = 'idle' | 'buying' | 'bought' | 'failed';

/**
 * Loads the store's packs, delivers any purchase that was charged but not yet added to the save,
 * and buys today's offer. `apply` must be a functional update so two deliveries never overwrite each other.
 */
export function useDailyPacks(
  active: boolean,
  dayKey: string,
  apply: (update: (state: GameState) => GameState) => void,
  stateRef: { current: GameState },
) {
  const [listed, setListed] = useState<ListedPack[]>([]);
  const [status, setStatus] = useState<PackStatus>('idle');
  const busy = useRef(false);

  const deliver = useCallback((pack: ListedPack['pack'], transactionId: string): boolean => {
    let applied = false;
    apply((state) => {
      const result = applyPackPurchase(state, pack, transactionId, dayKey);
      applied = result.applied;
      return result.state;
    });
    return applied;
  }, [apply, dayKey]);

  useEffect(() => {
    if (!active) return;
    let alive = true;
    void (async () => {
      try {
        await initializeRevenueCatAppStore();
        const port = await revenueCatPackPort();
        const found = await listedPacks(port);
        if (alive) setListed(found);
        for (const missed of unappliedPurchases(stateRef.current, await port.transactions(), Date.now())) deliver(missed.pack, missed.transactionId);
      } catch { /* Offline or store unavailable: no offer is shown and nothing is charged. */ }
    })();
    return () => { alive = false; };
  }, [active, deliver, stateRef]);

  const offer = active ? todaysOffer(listed, dayKey) : null;

  const buy = useCallback(async (): Promise<boolean> => {
    if (!offer || busy.current) return false;
    busy.current = true;
    setStatus('buying');
    try {
      const outcome = await buyPack(await revenueCatPackPort(), offer);
      if (outcome.kind === 'bought') { deliver(outcome.pack, outcome.transactionId); setStatus('bought'); return true; }
      setStatus(outcome.kind === 'cancelled' ? 'idle' : 'failed');
      return false;
    } catch { setStatus('failed'); return false; }
    finally { busy.current = false; }
  }, [offer, deliver]);

  return { offer, status, buy, resetStatus: () => setStatus('idle') };
}
