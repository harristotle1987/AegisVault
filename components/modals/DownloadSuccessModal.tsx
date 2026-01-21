import React from 'react';
import { CheckCircle2, X, ShieldCheck, ArrowRight, Maximize2 } from 'lucide-react';

interface DownloadSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  format: 'pdf' | 'docx' | null;
  blobUrl: string | null;
}

export const DownloadSuccessModal: React.FC<DownloadSuccessModalProps> = ({ isOpen, onClose, fileName, format, blobUrl }) => {
  if (!isOpen) return null;

  const handleOpen = () => {
    if (blobUrl) {
      window.open(blobUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-obsidian/90 backdrop-blur-2xl animate-in fade-in duration-500">
      <div className="w-full max-w-sm bg-obsidian-soft border border-emerald-vault/30 rounded-3xl shadow-sovereign overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 flex flex-col items-center text-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-vault/20 blur-3xl rounded-full animate-pulse" />
            <div className="relative w-20 h-20 rounded-full bg-emerald-vault/10 border border-emerald-vault/40 flex items-center justify-center shadow-emerald-glow">
              <CheckCircle2 size={40} className="text-emerald-vault" strokeWidth={2.5} />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-white font-black text-lg uppercase tracking-[0.3em]">Archive Secured</h3>
            <p className="text-vault-dim text-[10px] font-mono uppercase tracking-widest opacity-60">Sovereign Export Successful</p>
          </div>

          <div className="w-full p-4 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center gap-4 text-left">
            <div className="w-10 h-10 rounded-lg bg-obsidian flex items-center justify-center shrink-0 border border-vault-border">
              <ShieldCheck size={20} className="text-emerald-vault/40" />
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-[10px] font-black uppercase tracking-widest text-emerald-vault">Binary Asset</div>
              <div className="text-xs text-white font-bold truncate">{fileName}.{format}</div>
            </div>
          </div>

          <div className="w-full flex flex-col gap-3">
            <button 
              onClick={handleOpen}
              className="group w-full py-4 bg-emerald-vault hover:bg-emerald-vault/90 text-black rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 active:scale-95 shadow-[0_10px_30px_rgba(16,185,129,0.3)]"
            >
              <Maximize2 size={14} className="group-hover:scale-110 transition-transform" /> View Shard
            </button>
            
            <button 
              onClick={onClose}
              className="group w-full py-3 bg-white/5 hover:bg-white/10 text-vault-dim hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              Close Protocol <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
        
        <div className="p-4 bg-white/[0.02] border-t border-vault-border flex justify-center">
          <span className="text-[8px] font-mono text-vault-dim/40 uppercase tracking-[0.2em]">Hash: Verified • State: Persistent</span>
        </div>
      </div>
    </div>
  );
};