import { useState, useRef, useCallback, useEffect } from 'react';
import { PresentationSettings } from '../types/presentation';

export interface PresentationSnapshot {
  markdown: string;
  settings: PresentationSettings;
}

interface UsePresentationHistoryProps {
  initialSnapshot: PresentationSnapshot;
  onApplySnapshot: (snapshot: PresentationSnapshot) => void;
  maxHistory?: number;
}

function areSnapshotsEqual(a: PresentationSnapshot, b: PresentationSnapshot): boolean {
  if (a.markdown !== b.markdown) return false;
  return JSON.stringify(a.settings) === JSON.stringify(b.settings);
}

export function usePresentationHistory({
  initialSnapshot,
  onApplySnapshot,
  maxHistory = 60,
}: UsePresentationHistoryProps) {
  const historyRef = useRef<{
    past: PresentationSnapshot[];
    present: PresentationSnapshot;
    future: PresentationSnapshot[];
  }>({
    past: [],
    present: initialSnapshot,
    future: [],
  });

  // Trigger re-render when history state mutates
  const [, setVersion] = useState(0);
  const bumpVersion = useCallback(() => setVersion((v) => v + 1), []);

  const lastTypingTimeRef = useRef<number>(0);
  const onApplyRef = useRef(onApplySnapshot);
  useEffect(() => {
    onApplyRef.current = onApplySnapshot;
  }, [onApplySnapshot]);

  // Reset history stack without creating an undo entry (e.g. when switching decks)
  const resetHistory = useCallback(
    (newSnapshot: PresentationSnapshot) => {
      historyRef.current = {
        past: [],
        present: newSnapshot,
        future: [],
      };
      lastTypingTimeRef.current = 0;
      bumpVersion();
    },
    [bumpVersion]
  );

  // Push a new state into history.
  // - immediate = true: used for discrete actions (style changes, toolbar clicks, block moves, theme settings)
  // - immediate = false: used for continuous keyboard typing (coalesces keystrokes within 700ms)
  const pushState = useCallback(
    (nextSnapshot: PresentationSnapshot, immediate = false) => {
      const current = historyRef.current.present;
      if (areSnapshotsEqual(current, nextSnapshot)) {
        return;
      }

      const now = Date.now();
      const isBurstTyping = !immediate && now - lastTypingTimeRef.current < 700;

      if (isBurstTyping) {
        // Coalesce rapid typing keystrokes into the current undo step
        historyRef.current = {
          past: historyRef.current.past,
          present: nextSnapshot,
          future: [],
        };
        lastTypingTimeRef.current = now;
      } else {
        // Push current state onto past stack as a distinct undo step
        const nextPast = [...historyRef.current.past.slice(-(maxHistory - 1)), current];
        historyRef.current = {
          past: nextPast,
          present: nextSnapshot,
          future: [],
        };
        lastTypingTimeRef.current = immediate ? 0 : now;
      }

      bumpVersion();
      onApplyRef.current(nextSnapshot);
    },
    [maxHistory, bumpVersion]
  );

  const undo = useCallback(() => {
    const { past, present, future } = historyRef.current;
    if (past.length === 0) return;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, -1);
    const newFuture = [present, ...future.slice(0, maxHistory - 1)];

    historyRef.current = {
      past: newPast,
      present: previous,
      future: newFuture,
    };
    lastTypingTimeRef.current = 0;

    bumpVersion();
    onApplyRef.current(previous);
  }, [maxHistory, bumpVersion]);

  const redo = useCallback(() => {
    const { past, present, future } = historyRef.current;
    if (future.length === 0) return;

    const next = future[0];
    const newFuture = future.slice(1);
    const newPast = [...past.slice(-(maxHistory - 1)), present];

    historyRef.current = {
      past: newPast,
      present: next,
      future: newFuture,
    };
    lastTypingTimeRef.current = 0;

    bumpVersion();
    onApplyRef.current(next);
  }, [maxHistory, bumpVersion]);

  // Global Keyboard shortcuts: Ctrl+Z (Cmd+Z) for Undo, Ctrl+Y or Ctrl+Shift+Z for Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement as HTMLElement | null;
      // Allow Undo/Redo everywhere except inside standalone modal inputs (like rename title input)
      const isStandaloneInput =
        activeEl?.tagName === 'INPUT' && !activeEl?.classList.contains('wysiwyg-active-element');

      if (isStandaloneInput) return;

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (modifier && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if (modifier && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return {
    snapshot: historyRef.current.present,
    pushState,
    undo,
    redo,
    canUndo: historyRef.current.past.length > 0,
    canRedo: historyRef.current.future.length > 0,
    resetHistory,
  };
}
