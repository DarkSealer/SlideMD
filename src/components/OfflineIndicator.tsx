import React from 'react';
import { WifiOff, HardDrive, CheckCircle } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-xl bg-amber-950/90 border border-amber-600/80 px-3.5 py-2 text-xs font-medium text-amber-100 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 select-none"
    >
      <div className="relative flex items-center justify-center">
        <WifiOff className="w-4 h-4 text-amber-400" />
        <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
      </div>
      <div>
        <span className="font-bold text-amber-300">Offline Mode</span>
        <span className="text-slate-300 ml-1.5 hidden sm:inline">
          All slides and edits are stored safely on your device.
        </span>
      </div>
    </div>
  );
};
