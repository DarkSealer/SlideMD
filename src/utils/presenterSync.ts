import { PresentationDeck, PresentationSettings } from '../types/presentation';

export type PresenterSyncEvent =
  | {
      type: 'STATE_SYNC';
      slideIndex: number;
      fragmentIndex: number;
      isBlackedOut: boolean;
      direction?: 'next' | 'prev';
    }
  | {
      type: 'LASER_MOVE';
      xRatio: number; // 0.0 to 1.0 normalized
      yRatio: number; // 0.0 to 1.0 normalized
      active: boolean;
    }
  | {
      type: 'HEARTBEAT_PING';
      timestamp: number;
    }
  | {
      type: 'HEARTBEAT_ACK';
      timestamp: number;
      windowType: 'audience' | 'presenter';
    }
  | {
      type: 'DECK_UPDATE';
      deck: PresentationDeck;
    }
  | {
      type: 'REQUEST_SYNC';
    };

const CHANNEL_NAME = 'slidecraft_dual_monitor_sync_v1';
const STORAGE_SYNC_KEY = 'slidecraft_presenter_storage_event';

class PresenterSyncManager {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<(event: PresenterSyncEvent) => void> = new Set();
  private hasBroadcastChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window;

  constructor() {
    if (typeof window === 'undefined') return;

    if (this.hasBroadcastChannel) {
      try {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.channel.onmessage = (e: MessageEvent) => {
          if (e.data && e.data.type) {
            this.notifyListeners(e.data as PresenterSyncEvent);
          }
        };
      } catch (err) {
        console.warn('BroadcastChannel failed, falling back to storage sync:', err);
        this.channel = null;
      }
    }

    // Fallback: localStorage storage events for cross-tab sync
    window.addEventListener('storage', (e: StorageEvent) => {
      if (e.key === STORAGE_SYNC_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed && parsed.type) {
            this.notifyListeners(parsed as PresenterSyncEvent);
          }
        } catch {}
      }
    });
  }

  public publish(event: PresenterSyncEvent): void {
    if (this.channel) {
      try {
        this.channel.postMessage(event);
      } catch (err) {
        console.warn('Error posting to BroadcastChannel:', err);
      }
    }

    // Also dispatch to localStorage to notify fallback listeners
    try {
      localStorage.setItem(STORAGE_SYNC_KEY, JSON.stringify({ ...event, _t: Date.now() }));
    } catch {}
  }

  public subscribe(listener: (event: PresenterSyncEvent) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(event: PresenterSyncEvent): void {
    this.listeners.forEach((fn) => {
      try {
        fn(event);
      } catch (err) {
        console.error('Error in presenter sync listener:', err);
      }
    });
  }
}

export const syncManager = new PresenterSyncManager();

/**
 * Opens a dedicated Audience Presentation window on a secondary display/monitor.
 */
export function launchAudienceWindow(deckId?: string): Window | null {
  if (typeof window === 'undefined') return null;

  const url = new URL(window.location.href);
  url.searchParams.set('view', 'audience');
  if (deckId) {
    url.searchParams.set('deck', deckId);
  }

  const features = 'menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=no,width=1280,height=720';
  const newWin = window.open(url.toString(), 'SlideCraftAudienceDisplay', features);

  if (newWin) {
    newWin.focus();
  }
  return newWin;
}

/**
 * Checks if current window is designated as the external Audience display.
 */
export function isAudienceWindow(): boolean {
  if (typeof window === 'undefined') return false;
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get('view') === 'audience';
}
