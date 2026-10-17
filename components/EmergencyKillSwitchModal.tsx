'use client';

import { useState } from 'react';
import { AlertOctagon, AlertTriangle, ShieldAlert, CheckCircle2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface EmergencyKillSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  openPositionCount: number;
}

export function EmergencyKillSwitchModal({
  isOpen,
  onClose,
  onConfirm,
  openPositionCount,
}: EmergencyKillSwitchModalProps) {
  const [loading, setLoading] = useState(false);
  const [confirmedText, setConfirmedText] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleExecuteKillSwitch = async () => {
    setLoading(true);
    try {
      await onConfirm();
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setConfirmedText('');
        onClose();
      }, 1500);
    } catch (e) {
      console.error('Kill switch failed', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border border-red-500/40 bg-[#0c1222] p-6 shadow-2xl shadow-red-950/50">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {success ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-400 animate-bounce" />
            <h3 className="text-xl font-bold text-white">Emergency Kill Switch Activated</h3>
            <p className="text-sm text-slate-400">
              All pending orders cancelled and open positions closed at market price.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Header Icon + Title */}
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/20 border border-red-500/30 text-red-400">
                <AlertOctagon className="h-7 w-7 animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-wide">
                  EMERGENCY KILL SWITCH
                </h2>
                <p className="text-xs text-red-400 font-medium">
                  Immediate Square-Off &amp; Order Cancellation
                </p>
              </div>
            </div>

            {/* Warning Box */}
            <div className="rounded-xl border border-red-900/50 bg-red-950/30 p-4 space-y-2">
              <div className="flex items-center gap-2 text-red-300 font-semibold text-sm">
                <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
                <span>Critical Safety Action</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                <li>Instantly cancels <span className="font-semibold text-white">all pending Dhan/Broker orders</span>.</li>
                <li>Immediately executes <span className="font-semibold text-white">market exit for {openPositionCount} active position{openPositionCount !== 1 ? 's' : ''}</span>.</li>
                <li>Halts automated signal processing for the remainder of the session.</li>
              </ul>
            </div>

            {/* Confirmation Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Type <span className="text-red-400 font-mono">KILL</span> to confirm:
              </label>
              <input
                type="text"
                placeholder="KILL"
                value={confirmedText}
                onChange={(e) => setConfirmedText(e.target.value.toUpperCase())}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2.5 font-mono text-sm text-white placeholder-slate-600 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={onClose}
                disabled={loading}
                className="flex-1 border border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleExecuteKillSwitch}
                disabled={confirmedText !== 'KILL' || loading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold tracking-wider py-2.5 shadow-lg shadow-red-900/50 disabled:opacity-40"
              >
                <ShieldAlert className="h-4 w-4 mr-1.5" />
                {loading ? 'Executing...' : 'ACTIVATE KILL SWITCH'}
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
