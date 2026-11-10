import React, { useEffect, useState } from 'react';
import { X, LifeBuoy, Bug, MessageSquare, Mail, Send, Loader2, CheckCircle2, AlertTriangle, WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface ContactModalProps {
  onClose: () => void;
}

type ContactType = 'bug' | 'feedback' | 'contact';
type Status = 'idle' | 'sending' | 'sent' | 'error';

// Keep in sync with the limits enforced in api/contact.ts
const MIN_MESSAGE_LENGTH = 10;
const MAX_MESSAGE_LENGTH = 4000;

const TYPES: { id: ContactType; label: string; icon: React.ReactNode; placeholder: string }[] = [
  {
    id: 'bug',
    label: 'Report a bug',
    icon: <Bug className="w-3.5 h-3.5" />,
    placeholder: 'What happened, what did you expect, and how can we reproduce it?',
  },
  {
    id: 'feedback',
    label: 'Feedback',
    icon: <MessageSquare className="w-3.5 h-3.5" />,
    placeholder: 'What would make SlideMD better for you?',
  },
  {
    id: 'contact',
    label: 'Contact us',
    icon: <Mail className="w-3.5 h-3.5" />,
    placeholder: 'How can we help?',
  },
];

const ERROR_MESSAGES: Record<string, string> = {
  rate_limited: 'Too many messages in a short time. Please try again in a few minutes.',
  invalid_email: 'That email address does not look right.',
  invalid_message: `Your message must be between ${MIN_MESSAGE_LENGTH} and ${MAX_MESSAGE_LENGTH} characters.`,
};
const GENERIC_ERROR = 'We could not send your message. Please try again in a moment.';

export const ContactModal: React.FC<ContactModalProps> = ({ onClose }) => {
  const [type, setType] = useState<ContactType>('bug');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState(''); // honeypot, must stay empty
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isOnline = useOnlineStatus();

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const trimmedLength = message.trim().length;
  const canSubmit = isOnline && status !== 'sending' && trimmedLength >= MIN_MESSAGE_LENGTH;
  const activeType = TYPES.find((t) => t.id === type) ?? TYPES[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setStatus('sending');
    setErrorMessage(null);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          message: message.trim(),
          email: email.trim(),
          website,
          // Path only: the query string and hash can carry shared deck content.
          page: window.location.pathname,
        }),
      });
      const result = await response.json().catch(() => null);
      if (response.ok && result?.ok) {
        setStatus('sent');
        return;
      }
      setErrorMessage(ERROR_MESSAGES[result?.error] ?? GENERIC_ERROR);
      setStatus('error');
    } catch {
      setErrorMessage(GENERIC_ERROR);
      setStatus('error');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-modal-title"
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-950/70 border border-indigo-800/80 rounded-lg text-indigo-400">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <h2 id="contact-modal-title" className="text-base font-bold text-white">
                Get in touch
              </h2>
              <p className="text-xs text-slate-400">Report a bug, share feedback, or just say hello</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {status === 'sent' ? (
          <div className="p-8 flex flex-col items-center text-center gap-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Message sent</h3>
            <p className="text-xs text-slate-400 max-w-xs">
              Thanks for taking the time.{' '}
              {email.trim() ? 'We will reply to the address you provided.' : 'We read every message.'}
            </p>
            <button
              onClick={onClose}
              className="mt-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[80vh]">
            {/* Message type */}
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Message type">
              {TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="radio"
                  aria-checked={type === t.id}
                  onClick={() => setType(t.id)}
                  className={`flex items-center justify-center gap-1.5 px-2 py-2 text-xs font-medium rounded-lg border transition-colors ${
                    type === t.id
                      ? 'bg-indigo-950/80 border-indigo-500 text-indigo-200'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {t.icon}
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            {/* Message */}
            <div>
              <label htmlFor="contact-message" className="block text-xs font-medium text-slate-300 mb-1.5">
                Message
              </label>
              <textarea
                id="contact-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={activeType.placeholder}
                rows={6}
                maxLength={MAX_MESSAGE_LENGTH}
                required
                autoFocus
                className="w-full px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none rounded-lg resize-y"
              />
              <div className="mt-1 flex justify-between text-[11px] text-slate-500">
                <span>
                  {trimmedLength > 0 && trimmedLength < MIN_MESSAGE_LENGTH
                    ? `At least ${MIN_MESSAGE_LENGTH} characters`
                    : 'Your slides are never attached. Only what you type here is sent.'}
                </span>
                <span className="tabular-nums shrink-0 ml-3">
                  {message.length}/{MAX_MESSAGE_LENGTH}
                </span>
              </div>
            </div>

            {/* Reply email */}
            <div>
              <label htmlFor="contact-email" className="block text-xs font-medium text-slate-300 mb-1.5">
                Your email <span className="text-slate-500 font-normal">(optional, only if you want a reply)</span>
              </label>
              <input
                id="contact-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                maxLength={254}
                autoComplete="email"
                className="w-full px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none rounded-lg"
              />
            </div>

            {/* Honeypot: hidden from people and assistive tech, bots tend to fill it */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="contact-website">Website</label>
              <input
                id="contact-website"
                type="text"
                name="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {!isOnline && (
              <div className="flex items-center gap-2 px-3 py-2 text-xs text-amber-200 bg-amber-950/50 border border-amber-800/60 rounded-lg">
                <WifiOff className="w-3.5 h-3.5 shrink-0" />
                <span>You are offline. Reconnect to send your message.</span>
              </div>
            )}

            {status === 'error' && errorMessage && (
              <div
                role="alert"
                className="flex items-center gap-2 px-3 py-2 text-xs text-rose-200 bg-rose-950/50 border border-rose-800/60 rounded-lg"
              >
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!canSubmit}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {status === 'sending' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>{status === 'sending' ? 'Sending...' : 'Send message'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
