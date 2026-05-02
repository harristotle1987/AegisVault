
import React from 'react';
import { ShieldAlert, Trash2, X } from 'lucide-react';

interface PurgeModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  draftTitle: string;
}

export const PurgeModal: React.FC<PurgeModalProps> = ({ isOpen, onConfirm, onCancel, draftTitle }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-obsidian-soft border border-red-500/30 rounded-2xl shadow-sovereign overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 bg-red-500/5 flex items-center justify-between border-b border-red-500/20">
          <div className="flex items-center gap-3">
            <ShieldAlert className="text-red-500 w-5 h-5" strokeWidth={2.5} />
            <h3 className="text-white font-black text-xs uppercase tracking-[0.3em]">Purge Confirmation</h3>
          </div>
          <button onClick={onCancel} className="text-vault-dim hover:text-white transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="p-8 space-y-4">
          <p className="text-vault-dim text-xs leading-relaxed">
            You are about to initiate a <span className="text-red-400 font-bold">Permanent Purge</span> of:
          </p>
          <div className="p-3 bg-black/40 border border-white/5 rounded-lg">
            <span className="text-white font-mono text-sm break-all">"{draftTitle}"</span>
          </div>
          <p className="text-[10px] text-vault-dim/60 italic">
            This action bypasses standard recovery protocols and is irreversible within the local execution context.
          </p>
        </div>

        <div className="p-6 flex gap-3 bg-white/[0.02] border-t border-vault-border">
          <button 
            onClick={onCancel}
            className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-vault-dim hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
          >
            Abort
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 active:scale-95"
          >
            <Trash2 size={14} /> Purge Shard
          </button>
        </div>
      </div>
    </div>
  );
};
