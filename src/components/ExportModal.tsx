import React, { useState } from 'react';
import {
  X,
  FileCode,
  FileDown,
  Printer,
  Share2,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  Laptop,
  Presentation,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PresentationDeck } from '../types/presentation';
import {
  generateStandaloneHtml,
  generatePrintPdfHtml,
  generateShareUrl,
  triggerDownload,
} from '../utils/exportEngine';
import { exportToPptx } from '../utils/pptxExportEngine';

interface ExportModalProps {
  deck: PresentationDeck;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ deck, onClose }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [isExportingPptx, setIsExportingPptx] = useState(false);
  const [includeNotesInPptx, setIncludeNotesInPptx] = useState(true);
  const [pptxProgress, setPptxProgress] = useState<string | null>(null);
  const shareUrl = generateShareUrl(deck);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {}
  };

  const handleDownloadPptx = async () => {
    try {
      setIsExportingPptx(true);
      setPptxProgress('Preparing slides...');
      await exportToPptx(deck, {
        includeNotes: includeNotesInPptx,
        onProgress: (current, total) => {
          setPptxProgress(`Slide ${current} of ${total}...`);
        },
      });
      triggerConfetti();
    } catch (err) {
      console.error('Failed to export PPTX:', err);
    } finally {
      setIsExportingPptx(false);
      setPptxProgress(null);
    }
  };

  const handleDownloadStandaloneHtml = () => {
    const html = generateStandaloneHtml(deck);
    const filename = `${deck.title.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'presentation'}.html`;
    triggerDownload(html, filename, 'text/html');
    triggerConfetti();
  };

  const handlePrintPdf = () => {
    const html = generatePrintPdfHtml(deck);
    // Open in a new window/tab for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      triggerConfetti();
    } else {
      // Fallback: download as html if popups blocked
      triggerDownload(html, 'presentation-print.html', 'text/html');
    }
  };

  const handleDownloadMarkdown = () => {
    const filename = `${deck.title.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'presentation'}.md`;
    triggerDownload(deck.markdown, filename, 'text/markdown');
  };

  const handleDownloadJson = () => {
    const filename = `${deck.title.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'presentation'}.json`;
    triggerDownload(JSON.stringify(deck, null, 2), filename, 'application/json');
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    triggerConfetti();
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-950/70 border border-indigo-800/80 rounded-lg text-indigo-400">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Export Presentation</h2>
              <p className="text-xs text-slate-400">One-click standalone packages, print PDF, and shareable web link</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
          {/* Option 1: Standalone HTML File */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-indigo-500/50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-lg bg-indigo-950/80 text-indigo-400 shrink-0 mt-0.5">
                <Laptop className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white">Interactive Standalone HTML</h3>
                  <span className="text-[10px] font-mono uppercase bg-indigo-900/60 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-700/50">
                    Offline Ready
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Single .html file with full slideshow navigation, custom theme, syntax highlighting, speaker notes (S), and grid overview (O). Runs on any device without internet.
                </p>
              </div>
            </div>
            <button
              onClick={handleDownloadStandaloneHtml}
              className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors shadow-md shadow-indigo-950/60"
            >
              Download .html
            </button>
          </div>

          {/* Option: Microsoft PowerPoint (.pptx) */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-amber-500/50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-lg bg-amber-950/80 text-amber-400 shrink-0 mt-0.5">
                <Presentation className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white">Microsoft PowerPoint (.pptx)</h3>
                  <span className="text-[10px] font-mono uppercase bg-amber-900/60 text-amber-300 px-1.5 py-0.5 rounded border border-amber-700/50">
                    Office Compatible
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Generates an editable .pptx presentation with native titles, bullet runs, code blocks, and slide notes for PowerPoint and Google Slides.
                </p>
                <div className="flex items-center gap-4 mt-2.5 text-xs text-slate-400">
                  <label className="flex items-center gap-1.5 cursor-pointer select-none hover:text-slate-200">
                    <input
                      type="checkbox"
                      checked={includeNotesInPptx}
                      onChange={(e) => setIncludeNotesInPptx(e.target.checked)}
                      className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
                    />
                    <span>Include speaker notes</span>
                  </label>
                  <span className="text-slate-600">·</span>
                  <span className="font-mono text-[11px] text-slate-400">
                    Format: {deck.settings?.aspectRatio || '16:9'}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleDownloadPptx}
              disabled={isExportingPptx}
              className="w-full sm:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors shadow-md shadow-amber-950/60 flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <Presentation className="w-3.5 h-3.5" />
              <span>{isExportingPptx ? (pptxProgress || 'Exporting...') : 'Download .pptx'}</span>
            </button>
          </div>

          {/* Option 2: Portable PDF / Print View */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-lg bg-cyan-950/80 text-cyan-400 shrink-0 mt-0.5">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white">Portable PDF Slides</h3>
                  <span className="text-[10px] font-mono uppercase bg-cyan-900/60 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-700/50">
                    Vector Crisp
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Opens a print-ready presentation layout formatted for 16:9 landscape printing or instant &quot;Save as PDF&quot;.
                </p>
              </div>
            </div>
            <button
              onClick={handlePrintPdf}
              className="w-full sm:w-auto px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors shadow-md shadow-cyan-950/60"
            >
              Print / Save PDF
            </button>
          </div>

          {/* Option 3: Shareable Cloud Link (Disabled - Coming Soon) */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3 relative overflow-hidden">
            <div className="flex items-start justify-between gap-3.5">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-lg bg-purple-950/40 text-purple-400/70 shrink-0 mt-0.5">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-300">Shareable Web Link</h3>
                    <span className="text-[10px] font-semibold uppercase bg-amber-950/70 text-amber-400 px-2 py-0.5 rounded-full border border-amber-800/60">
                      Coming Soon
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Live cloud links and instant presentation sharing will be available in an upcoming release.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1 opacity-60">
              <input
                type="text"
                readOnly
                disabled
                value={shareUrl}
                aria-label="Cloud share link coming soon"
                className="flex-1 bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-500 cursor-not-allowed select-none truncate focus:outline-none"
              />
              <button
                disabled
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold shrink-0 bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed"
                title="Cloud sharing coming soon"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Coming Soon</span>
              </button>
            </div>
          </div>

          {/* Option 4: Raw Markdown and JSON Backup */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-200">Raw Markdown (.md)</div>
                <div className="text-[11px] text-slate-500">Universal markdown format</div>
              </div>
              <button
                onClick={handleDownloadMarkdown}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition-colors"
              >
                Download .md
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-200">Deck Package (.json)</div>
                <div className="text-[11px] text-slate-500">Includes settings & notes</div>
              </div>
              <button
                onClick={handleDownloadJson}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition-colors"
              >
                Download JSON
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
