import { Capacitor } from '@capacitor/core';
import { REMINDER_IDS, type Reminder } from '../game/reminders';

const PREF_KEY = 'qahwa_reminders';
export type ReminderPref = 'on' | 'off' | null;

/** Local reminders exist only in the installed app; the website never asks. */
export function remindersAvailable(): boolean {
  try { return Capacitor.isNativePlatform(); } catch { return false; }
}

export function loadReminderPref(): ReminderPref {
  try {
    const v = localStorage.getItem(PREF_KEY);
    return v === 'on' || v === 'off' ? v : null;
  } catch { return null; }
}

export function saveReminderPref(pref: 'on' | 'off'): void {
  try { localStorage.setItem(PREF_KEY, pref); } catch { /* the choice stays for this session */ }
}

async function plugin() {
  return (await import('@capacitor/local-notifications')).LocalNotifications;
}

/** Shows the system permission prompt (once). Resolves true only if the player allowed notifications. */
export async function requestReminderPermission(): Promise<boolean> {
  if (!remindersAvailable()) return false;
  try {
    const notifications = await plugin();
    const current = await notifications.checkPermissions();
    if (current.display === 'granted') return true;
    if (current.display === 'denied') return false;
    return (await notifications.requestPermissions()).display === 'granted';
  } catch { return false; }
}

/** Replace all of the game's pending reminders with this set. Failures are ignored: reminders are a convenience. */
export async function scheduleReminders(reminders: Reminder[]): Promise<void> {
  if (!remindersAvailable()) return;
  try {
    const notifications = await plugin();
    await notifications.cancel({ notifications: Object.values(REMINDER_IDS).map((id) => ({ id })) });
    if (reminders.length === 0) return;
    await notifications.schedule({
      notifications: reminders.map((r) => ({ id: r.id, title: r.title, body: r.body, schedule: { at: new Date(r.at), allowWhileIdle: true } })),
    });
  } catch { /* ignore */ }
}

export async function cancelReminders(): Promise<void> {
  await scheduleReminders([]);
}
