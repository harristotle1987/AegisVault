
import React, { useState, useEffect } from 'react';
import { X, FileText, Download, Shield } from 'lucide-react';

interface ExportModalProps {
  initialName: string;
  format: 'pdf' | 'docx' | null;
  onConfirm: (name: string) => void;
  onCancel: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ initialName, format, onConfirm, onCancel }) => {
  const [name, setName] = useState(initialName);

  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  if (!format) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#050505]/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-xl shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] overflow-hidden">
        <div className="p-6 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-emerald-500/10 flex items-center justify-center">
              <Shield className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-[11px] font-black tracking-[0.3em] uppercase text-zinc-400">Finalize Export</span>
          </div>
          <button onClick={onCancel} className="text-zinc-600 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Archive Identity</label>
            <div className="relative group">
              <input
                autoFocus
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-4 py-3 text-sm font-medium focus:outline-none focus:border-emerald-500/50 transition-all text-white"
                placeholder="Filename..."
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-600 uppercase">
                .{format}
              </div>
            </div>
          </div>

          <div className="bg-white/[0.01] border border-white/5 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FileText className="w-4 h-4 text-zinc-600 mt-1" />
              <div>
                <p className="text-[11px] text-zinc-400 font-medium">System hardening will be applied automatically to the output binary for high-fidelity compliance.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white/[0.02] flex gap-3">
          <button 
            onClick={onCancel}
            className="flex-1 py-3 text-[11px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => onConfirm(name)}
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-black rounded-lg text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
          >
            <Download size={14} /> Download {format.toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  );
};
