import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { TOOLBAR_HINTS } from './toolbarHints';

const SHOW_DELAY_MS = 350;
const WIDTH = 256;

interface ActiveHint {
  id: string;
  rect: DOMRect;
  side: boolean;
}

// Event-delegation hook: any element inside the bound container carrying a
// `data-hint="<id>"` attribute gets a hover/focus tooltip with a visual preview.
export function useToolbarHint(disabled: boolean) {
  const [active, setActive] = useState<ActiveHint | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const suppressed = useRef<string | null>(null);

  const clearTimer = () => window.clearTimeout(timer.current);

  const hide = useCallback(() => {
    clearTimer();
    setActive(null);
  }, []);

  useEffect(() => {
    if (disabled) hide();
  }, [disabled, hide]);

  useEffect(() => clearTimer, []);

  const schedule = (el: HTMLElement | null, immediate = false) => {
    const id = el?.dataset.hint ?? null;
    if (!el || !id) {
      suppressed.current = null;
      hide();
      return;
    }
    // Items inside an open dropdown (data-hint-side) keep their hints; the
    // toolbar buttons themselves are muted while a dropdown is open.
    if (suppressed.current === id || (disabled && !el.dataset.hintSide)) return;
    clearTimer();
    const open = () => setActive({ id, rect: el.getBoundingClientRect(), side: !!el.dataset.hintSide });
    if (immediate) open();
    else timer.current = window.setTimeout(open, SHOW_DELAY_MS);
  };

  const closest = (e: React.SyntheticEvent) =>
    (e.target as HTMLElement).closest<HTMLElement>('[data-hint]');

  const bind = {
    onMouseOver: (e: React.MouseEvent) => {
      const el = closest(e);
      if (el && active?.id === el.dataset.hint) return;
      schedule(el);
    },
    // Covers content that moved under a resting pointer (list scrolled, menu closed).
    onMouseMove: (e: React.MouseEvent) => {
      const el = closest(e);
      if (el && !active) schedule(el);
    },
    onMouseLeave: () => {
      suppressed.current = null;
      hide();
    },
    onFocus: (e: React.FocusEvent) => schedule(closest(e), true),
    onBlur: hide,
    onClick: (e: React.MouseEvent) => {
      suppressed.current = closest(e)?.dataset.hint ?? null;
      hide();
    },
    onScrollCapture: hide,
  };

  const tooltip = active ? <HintCard {...active} /> : null;
  return { bind, tooltip };
}

const CARD_HEIGHT = 200;

const HintCard: React.FC<ActiveHint> = ({ id, rect, side }) => {
  const hint = TOOLBAR_HINTS[id];
  if (!hint) return null;
  const maxLeft = window.innerWidth - WIDTH - 8;
  let left: number;
  let top: number;
  if (side) {
    // Beside the dropdown: right of the item, or left if there is no room.
    const panel = (document.querySelector('[data-hint-panel]') as HTMLElement | null)?.getBoundingClientRect();
    const rightX = (panel?.right ?? rect.right) + 8;
    const leftX = (panel?.left ?? rect.left) - WIDTH - 8;
    left = rightX <= maxLeft ? rightX : leftX >= 8 ? leftX : Math.max(8, maxLeft);
    top = Math.max(8, Math.min(rect.top, window.innerHeight - CARD_HEIGHT - 8));
  } else {
    left = Math.max(8, Math.min(rect.left + rect.width / 2 - WIDTH / 2, maxLeft));
    top = rect.bottom + 8;
  }

  return createPortal(
    <div
      role="tooltip"
      className="pointer-events-none fixed rounded-xl border border-slate-700 bg-slate-900/95 shadow-2xl backdrop-blur-md overflow-hidden animate-in fade-in"
      style={{ top, left, width: WIDTH, zIndex: 110 }}
    >
      <div className="flex items-center justify-center bg-slate-950 border-b border-slate-800 px-3 py-3.5 min-h-[88px]">
        {hint.preview}
      </div>
      <div className="px-3 py-2.5">
        <div className="text-xs font-semibold text-slate-100">{hint.title}</div>
        <p className="mt-1 text-[11px] leading-snug text-slate-400">{hint.description}</p>
      </div>
    </div>,
    document.body
  );
};
