/**
 * Evening reminder to log symptoms. PWAs cannot schedule notifications without a push server, so this is
 * best-effort: (1) when the app is open or resumed after 18:00 with no distress logged, show a notification (or an
 * in-app banner if permission is denied); (2) if Periodic Background Sync exists (installed Chrome on Android), the
 * service worker gets a 'periodicsync' registration and the same check runs there via the generated SW's message bus.
 */
import { getDayLog, getSetting, setSetting } from '../db/repo';
import { today } from './dates';

const REMINDER_HOUR = 18;

export async function reminderEnabled(): Promise<boolean> { return (await getSetting('reminder')) !== 'off'; }

export async function requestPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied';
  if (Notification.permission === 'default') return Notification.requestPermission();
  return Notification.permission;
}

async function maybeRemind(): Promise<void> {
  if (!(await reminderEnabled())) return;
  const h = new Date().getHours();
  if (h < REMINDER_HOUR) return;
  const log = await getDayLog(today());
  if (log?.distress != null) return;
  const last = await getSetting('lastReminder');
  if (last === today()) return;
  if ('Notification' in window && Notification.permission === 'granted') {
    const reg = await navigator.serviceWorker?.getRegistration();
    const opts: NotificationOptions = { body: 'How was your gut today? Takes 10 seconds.', tag: 'gutlog-daily', icon: './icons/icon-192.png' };
    if (reg) await reg.showNotification('Log today', opts); else new Notification('Log today', opts);
    await setSetting('lastReminder', today());
  }
}

export function setupReminder(): void {
  maybeRemind().catch(() => {});
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') maybeRemind().catch(() => {}); });
  // Periodic background sync (Chrome Android, installed PWA). Minimum interval is browser-controlled (~12 h+).
  navigator.serviceWorker?.ready.then(async (reg) => {
    const r = reg as ServiceWorkerRegistration & { periodicSync?: { register: (tag: string, o: { minInterval: number }) => Promise<void> } };
    if (!r.periodicSync) return;
    try {
      const status = await (navigator as Navigator & { permissions: Permissions }).permissions.query({ name: 'periodic-background-sync' as PermissionName });
      if (status.state === 'granted') await r.periodicSync.register('gutlog-reminder', { minInterval: 12 * 60 * 60 * 1000 });
    } catch { /* unsupported */ }
  }).catch(() => {});
}
