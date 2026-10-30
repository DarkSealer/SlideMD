import React, { useState } from 'react';
import { DownloadCloud, Smartphone, Check, X, Share } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'compact' | 'full';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'compact',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installing, setInstalling] = useState(false);

  // If already running as an installed standalone PWA, hide or show installed badge
  if (isInstalled) {
    return null;
  }

  // Handle Chrome / Edge / Android install prompt
  const handleInstallClick = async () => {
    try {
      setInstalling(true);
      await install();
    } finally {
      setInstalling(false);
    }
  };

  // If browser fired beforeinstallprompt
  if (isInstallable) {
    return (
      <button
        onClick={handleInstallClick}
        disabled={installing}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-emerald-300 hover:text-emerald-100 bg-emerald-950/60 hover:bg-emerald-900/80 rounded-lg border border-emerald-600/50 hover:border-emerald-500 transition-all whitespace-nowrap shadow-sm shadow-emerald-950/40 ${className}`}
        title="Install SlideCraft as a desktop or mobile application for 100% offline presentations"
      >
        <DownloadCloud className="w-3.5 h-3.5 text-emerald-400" />
        <span>{variant === 'full' ? 'Install Offline App' : 'Install App'}</span>
      </button>
    );
  }

  // iOS Safari flow (WebKit doesn't trigger beforeinstallprompt, requires Add to Home Screen)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-700 transition-all whitespace-nowrap ${className}`}
          title="Install SlideCraft on iOS (Add to Home Screen)"
        >
          <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
          <span>Install iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                    <span className="font-bold text-white text-base">S</span>
                  </div>
                  <h3 className="text-base font-bold text-white">Install on iOS</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-sm text-slate-300 mb-5">
                <div className="flex items-start gap-3 bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                  <div className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-300 font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </div>
                  <div>
                    Tap the <strong className="text-white">Share</strong> button <Share className="w-4 h-4 inline-block text-indigo-400 mx-0.5" /> in the Safari bottom bar.
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                  <div className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-300 font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </div>
                  <div>
                    Scroll down and tap <strong className="text-white">Add to Home Screen</strong>.
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                  <div className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-300 font-bold flex items-center justify-center shrink-0 text-xs">
                    3
                  </div>
                  <div>
                    Tap <strong className="text-white">Add</strong> in the top-right corner to launch fullscreen offline.
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-medium text-sm text-white transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  const [showDesktopGuide, setShowDesktopGuide] = useState(false);

  // Fallback button for browsers
  return (
    <>
      <button
        onClick={() => {
          if (isInstallable) {
            handleInstallClick();
          } else {
            setShowDesktopGuide(true);
          }
        }}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors whitespace-nowrap ${className}`}
        title="Install SlideCraft on your device for offline presentation support"
      >
        <DownloadCloud className="w-3.5 h-3.5 text-slate-400" />
        <span>Install</span>
      </button>

      {showDesktopGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                  <span className="font-bold text-white text-base">S</span>
                </div>
                <h3 className="text-base font-bold text-white">Install SlideCraft App</h3>
              </div>
              <button
                onClick={() => setShowDesktopGuide(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 mb-5 leading-relaxed">
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                <span className="font-semibold text-white block mb-1">Desktop (Chrome / Edge / Brave):</span>
                Look for the <strong className="text-indigo-300">Install App</strong> icon (down-arrow monitor) on the right side of your browser address bar.
              </div>
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                <span className="font-semibold text-white block mb-1">Android Mobile:</span>
                Tap the three-dots browser menu and choose <strong className="text-indigo-300">Install app</strong> or <strong className="text-indigo-300">Add to Home screen</strong>.
              </div>
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                <span className="font-semibold text-white block mb-1">100% Offline Ready:</span>
                Once installed, SlideCraft runs without any internet connection directly from your device storage.
              </div>
            </div>

            <button
              onClick={() => setShowDesktopGuide(false)}
              className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-medium text-xs text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
