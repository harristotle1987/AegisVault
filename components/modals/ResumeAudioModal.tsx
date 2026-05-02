
import React from 'react';
import { Play, RotateCcw, Volume2, X, Shield } from 'lucide-react';

interface ResumeAudioModalProps {
  isOpen: boolean;
  onRestart: () => void;
  onResume: () => void;
  onCancel: () => void;
  progress: number;
  total: number;
}

export const ResumeAudioModal: React.FC<ResumeAudioModalProps> = ({ 
  isOpen, 
  onRestart, 
  onResume, 
  onCancel,
  progress,
  total
}) => {
  if (!isOpen) return null;

  const percentage = Math.round((progress / total) * 100);

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-obsidian/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-obsidian-soft border border-emerald-vault/30 rounded-3xl shadow-sovereign overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 bg-emerald-vault/5 flex items-center justify-between border-b border-emerald-vault/20">
          <div className="flex items-center gap-3">
            <Volume2 className="text-emerald-vault w-5 h-5" strokeWidth={2.5} />
            <h3 className="text-white font-black text-xs uppercase tracking-[0.3em]">Acoustic Resumption</h3>
          </div>
          <button onClick={onCancel} className="text-vault-dim hover:text-white transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <p className="text-vault-dim text-xs leading-relaxed">
              Existing progress detected in this shard. You are at segment <span className="text-emerald-vault font-bold">{progress + 1}</span> of <span className="text-white font-bold">{total}</span>.
            </p>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-vault shadow-emerald-glow" style={{ width: `${percentage}%` }} />
            </div>
          </div>
          
          <div className="space-y-3">
            <button 
              onClick={onResume}
              className="w-full py-4 bg-emerald-vault hover:bg-emerald-vault/90 text-black rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 active:scale-[0.98] shadow-lg shadow-emerald-vault/10"
            >
              <Play size={16} fill="currentColor" /> Resume Protocol
            </button>
            
            <button 
              onClick={onRestart}
              className="w-full py-4 bg-white/5 hover:bg-white/10 text-vault-dim hover:text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 border border-vault-border active:scale-[0.98]"
            >
              <RotateCcw size={16} /> Begin Anew
            </button>
          </div>
        </div>

        <div className="p-4 bg-white/[0.02] border-t border-vault-border flex justify-center items-center gap-2">
           <Shield size={10} className="text-emerald-vault/40" />
           <span className="text-[8px] font-mono text-vault-dim/40 uppercase tracking-[0.2em]">Sovereign Memory: Active</span>
        </div>
      </div>
    </div>
  );
};
