
import React, { useState, useEffect, useRef } from 'react';
import { X, FileText, Download, Shield } from 'lucide-react';

interface ExportModalProps {
  initialName: string;
  format: 'pdf' | 'docx' | null;
  onConfirm: (name: string) => void;
  onCancel: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ initialName, format, onConfirm, onCancel }) => {
  const [name, setName] = useState(initialName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (format) {
      setName(initialName);
      // Mechanical focus interaction
      setTimeout(() => inputRef.current?.select(), 50);
    }
  }, [initialName, format]);

  if (!format) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-obsidian/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-obsidian-soft border border-emerald-vault/20 rounded-xl shadow-sovereign overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 flex items-center justify-between border-b border-vault-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-emerald-vault/10 flex items-center justify-center border border-emerald-vault/10">
              <Shield className="w-4 h-4 text-emerald-vault" />
            </div>
            <span className="text-[11px] font-black tracking-[0.3em] uppercase text-vault-dim">Protocol Checkpoint</span>
          </div>
          <button onClick={onCancel} className="text-vault-dim hover:text-white transition-colors p-1">
            <X size={18} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-vault-dim font-bold opacity-50">Archive Identity</label>
            <div className="relative group">
              <input
                ref={inputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-obsidian-muted border border-vault-border rounded-lg px-4 py-3 text-sm font-medium focus:outline-none focus:border-emerald-vault/40 focus:ring-1 focus:ring-emerald-vault/10 transition-all text-white placeholder:text-zinc-800"
                placeholder="Name the asset..."
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-mono text-emerald-vault/40 uppercase font-bold">
                .{format}
              </div>
            </div>
          </div>

          <div className="bg-emerald-vault/[0.02] border border-emerald-vault/5 rounded-lg p-4 flex items-start gap-4">
            <div className="mt-1">
              <FileText className="w-4 h-4 text-emerald-vault/60" />
            </div>
            <div className="space-y-1">
              <h4 className="text-[10px] font-bold text-vault-text uppercase tracking-widest">Sovereign Refinement</h4>
              <p className="text-[11px] text-vault-dim leading-relaxed">System hardening and structural clean will be applied automatically to the output binary to ensure high-fidelity compliance.</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white/[0.02] flex gap-3 border-t border-vault-border">
          <button 
            onClick={onCancel}
            className="flex-1 py-3 text-[11px] font-bold uppercase tracking-widest text-vault-dim hover:text-vault-text hover:bg-white/[0.03] rounded-lg transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={() => onConfirm(name)}
            className="flex-1 py-3 bg-emerald-vault hover:bg-emerald-vault/90 text-black rounded-lg text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-[0_5px_15px_rgba(16,185,129,0.2)]"
          >
            <Download size={14} /> Download {format.toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  );
};
