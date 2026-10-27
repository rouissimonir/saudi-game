import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export type HapticIntensity = 'light' | 'medium' | 'heavy';
const HAPTICS_KEY = 'qahwa_haptics_enabled';

export function loadHapticsEnabled(): boolean {
  try { return localStorage.getItem(HAPTICS_KEY) !== 'false'; } catch { return true; }
}

export function saveHapticsEnabled(enabled: boolean): void {
  try { localStorage.setItem(HAPTICS_KEY, String(enabled)); } catch { /* Keep the current session preference. */ }
}

type HapticBackend = {
  native: boolean;
  impact: (style: ImpactStyle) => Promise<void>;
  vibrate: (ms: number) => void;
};

/** Fail silently if a device lacks haptics; never fall back to web vibration on native. */
export async function deliverHaptic(intensity: HapticIntensity, enabled: boolean, backend: HapticBackend): Promise<void> {
  if (!enabled) return;
  const style = intensity === 'heavy' ? ImpactStyle.Heavy : intensity === 'medium' ? ImpactStyle.Medium : ImpactStyle.Light;
  try {
    if (backend.native) await backend.impact(style);
    else backend.vibrate(intensity === 'heavy' ? 35 : intensity === 'medium' ? 18 : 8);
  } catch { /* Unsupported hardware or browser. */ }
}

export function triggerDeviceHaptic(intensity: HapticIntensity, enabled: boolean): void {
  void deliverHaptic(intensity, enabled, {
    native: Capacitor.isNativePlatform(),
    impact: style => Haptics.impact({ style }),
    vibrate: ms => { if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(ms); },
  });
}
