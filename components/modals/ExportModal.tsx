import React, { useState, useEffect, useRef } from 'react';
import { X, FileText, Download, Shield, Layout, AlertCircle } from 'lucide-react';

interface ExportModalProps {
  initialName: string;
  format: 'pdf' | 'docx' | 'html' | 'txt' | 'rtf' | null;
  onConfirm: (name: string) => void;
  onCancel: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ initialName, format, onConfirm, onCancel }) => {
  const [name, setName] = useState(initialName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (format) {
      setName(initialName);
      setTimeout(() => inputRef.current?.select(), 100);
    }
  }, [initialName, format]);

  if (!format) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-obsidian/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-obsidian-soft border border-emerald-vault/20 rounded-2xl shadow-sovereign overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 flex items-center justify-between border-b border-vault-border bg-white/[0.01]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-vault/10 flex items-center justify-center border border-emerald-vault/20">
              <Shield className="w-5 h-5 text-emerald-vault" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-black tracking-[0.4em] uppercase text-vault-dim">Asset Finalization</span>
              <span className="text-[9px] font-mono text-emerald-vault/40 uppercase tracking-widest">Protocol.State: INTERCEPT</span>
            </div>
          </div>
          <button onClick={onCancel} className="text-vault-dim hover:text-white transition-all p-2 hover:bg-white/5 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-10 space-y-8">
          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] uppercase tracking-[0.2em] text-vault-dim font-black opacity-40">Archive Identifier</label>
              <span className="text-[9px] font-mono text-emerald-vault/60">.{format.toUpperCase()}</span>
            </div>
            <div className="relative group">
              <input
                ref={inputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-obsidian-muted border border-vault-border rounded-xl px-5 py-4 text-sm font-semibold focus:outline-none focus:border-emerald-vault/50 focus:ring-4 focus:ring-emerald-vault/5 transition-all text-white placeholder:text-zinc-800"
                placeholder="Asset Identity..."
                onKeyDown={(e) => e.key === 'Enter' && onConfirm(name)}
              />
              <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-emerald-vault/30 uppercase tracking-widest border-l border-white/5 pl-4">
                .{format}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-vault/[0.03] border border-emerald-vault/10 rounded-xl p-5 flex flex-col gap-3 transition-all hover:bg-emerald-vault/[0.05]">
              <div className="flex items-center gap-3">
                <Layout size={14} className="text-emerald-vault" />
                <span className="text-[10px] font-black text-vault-text uppercase tracking-widest">Bridge Mapping</span>
              </div>
              <p className="text-[10px] text-vault-dim leading-relaxed font-medium">100% editability preserved via Markdown intermediate state.</p>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <AlertCircle size={14} className="text-vault-dim" />
                <span className="text-[10px] font-black text-vault-text uppercase tracking-widest">Binary Shard</span>
              </div>
              <p className="text-[10px] text-vault-dim leading-relaxed font-medium">All images (HD Plates) are embedded directly into the asset blob.</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white/[0.02] flex gap-4 border-t border-vault-border">
          <button 
            onClick={onCancel}
            className="flex-1 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-vault-dim hover:text-white hover:bg-white/[0.05] rounded-xl transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={() => onConfirm(name)}
            className="flex-[2] py-4 bg-emerald-vault hover:bg-emerald-vault/90 text-black rounded-xl text-[11px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(16,185,129,0.2)] active:scale-[0.98]"
          >
            <Download size={16} strokeWidth={3} /> Execute Export
          </button>
        </div>
      </div>
    </div>
  );
};
