import React, { useState } from 'react';
import { Phone, PhoneOff, ShieldCheck, Lock, Mic, MicOff, Volume2 } from 'lucide-react';

interface PrivacyCallModalProps {
  recipientName: string;
  recipientRole: string;
  maskedNumber: string;
  onClose: () => void;
}

export default function PrivacyCallModal({
  recipientName,
  recipientRole,
  maskedNumber,
  onClose,
}: PrivacyCallModalProps) {
  const [callState, setCallState] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [isMuted, setIsMuted] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setCallState('connected');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    let interval: any;
    if (callState === 'connected') {
      interval = setInterval(() => {
        setCallSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callState]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm text-white overflow-hidden shadow-2xl">
        {/* Header privacy banner */}
        <div className="bg-emerald-950/70 border-b border-emerald-800/40 px-4 py-2 text-center text-xs text-emerald-300 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Number Masking Active · Zero Direct Contact Details Shared</span>
        </div>

        <div className="p-6 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center mb-4 relative">
            <Phone className={`w-8 h-8 ${callState === 'connected' ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
            {callState === 'connected' && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900"></span>
            )}
          </div>

          <h3 className="text-lg font-bold text-white mb-0.5">{recipientName}</h3>
          <p className="text-xs text-slate-400 mb-1">{recipientRole}</p>
          <p className="text-xs font-mono text-cyan-400 mb-4">{maskedNumber}</p>

          <div className="py-2 px-3 rounded-lg bg-slate-800/60 border border-slate-700/60 inline-block mb-6">
            <span className="text-xs text-slate-300 font-mono tabular-nums">
              {callState === 'connecting' && 'Routing via Secure IVR...'}
              {callState === 'connected' && `Encrypted Call · ${formatTimer(callSeconds)}`}
              {callState === 'ended' && 'Call Terminated'}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setIsMuted(!isMuted)}
              disabled={callState !== 'connected'}
              className={`p-3.5 rounded-full border transition-colors ${
                isMuted
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <button
              onClick={() => {
                setCallState('ended');
                setTimeout(onClose, 800);
              }}
              className="p-4 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-lg transition-transform active:scale-95"
            >
              <PhoneOff className="w-6 h-6" />
            </button>

            <button
              disabled={callState !== 'connected'}
              className="p-3.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 transition-colors"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-6 py-3 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-slate-500" /> End-to-End Encrypted
          </span>
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
}
