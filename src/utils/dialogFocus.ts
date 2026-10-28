/**
 * Keyboard focus for modal dialogs. Every `[role=dialog][aria-modal=true]` in the game gets the same behaviour: Tab
 * stays inside the top-most one, focus moves in when it opens, and returns to whatever opened it when it closes.
 */

/** Where Tab should go next inside a dialog, or null to let the browser move focus normally. */
export function nextDialogFocus(count: number, active: number, shift: boolean): number | null {
  if (count === 0) return null;
  if (active < 0) return shift ? count - 1 : 0; // focus is outside the dialog: bring it in
  if (!shift && active === count - 1) return 0;
  if (shift && active === 0) return count - 1;
  return null;
}

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
const DIALOGS = '[role=dialog][aria-modal=true]';

function focusablesIn(dialog: HTMLElement): HTMLElement[] {
  return Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.getClientRects().length > 0);
}

/** Starts the behaviour for the whole page. Returns a function that stops it. */
export function installDialogFocus(): () => void {
  const openers = new Map<HTMLElement, HTMLElement | null>();
  const top = () => {
    const all = document.querySelectorAll<HTMLElement>(DIALOGS);
    return all.length ? all[all.length - 1] : null;
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    const dialog = top();
    if (!dialog) return;
    const items = focusablesIn(dialog);
    if (items.length === 0) {
      e.preventDefault();
      return;
    }
    const target = nextDialogFocus(items.length, items.indexOf(document.activeElement as HTMLElement), e.shiftKey);
    if (target !== null) {
      e.preventDefault();
      items[target].focus();
    }
  };

  const sync = () => {
    const present = new Set(document.querySelectorAll<HTMLElement>(DIALOGS));
    for (const dialog of present) {
      if (openers.has(dialog)) continue;
      const active = document.activeElement as HTMLElement | null;
      openers.set(dialog, active && active !== document.body ? active : null);
      if (!dialog.contains(active)) {
        // A dialog can ask to hold focus itself (data-initial-focus="dialog", with tabindex="-1"); the rest start on their first control.
        const start = dialog.dataset.initialFocus === 'dialog' ? dialog : focusablesIn(dialog)[0] ?? dialog;
        start.focus({ preventScroll: true });
      }
    }
    for (const [dialog, opener] of Array.from(openers)) {
      if (present.has(dialog)) continue;
      openers.delete(dialog);
      const active = document.activeElement;
      if (opener && opener.isConnected && (!active || active === document.body)) opener.focus({ preventScroll: true });
    }
  };

  const observer = new MutationObserver(sync);
  observer.observe(document.body, { childList: true, subtree: true });
  document.addEventListener('keydown', onKeyDown, true);
  sync();
  return () => {
    observer.disconnect();
    document.removeEventListener('keydown', onKeyDown, true);
  };
}
