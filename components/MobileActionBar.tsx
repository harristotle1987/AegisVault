import React from 'react';
import { Scan, Volume2, BookOpen, Brush } from 'lucide-react';

interface MobileActionBarProps {
  isExporting: boolean;
  onExport: (format: 'pdf' | 'docx') => void;
  onLocalRefine: () => void;
  onOpenScanner: () => void;
  onToggleAudio: () => void;
  isPlayingAudio: boolean;
}

export const MobileActionBar: React.FC<MobileActionBarProps> = ({ 
  onLocalRefine, 
  onOpenScanner, 
  onToggleAudio, 
  isPlayingAudio 
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-obsidian border-t border-vault-border pb-safe pt-2 px-6 z-[120] flex items-center justify-between gap-4 shadow-[0_-10_-40px_rgba(0,0,0,0.5)] pointer-events-auto">
      <button 
        onClick={onLocalRefine}
        className="relative z-10 flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl text-vault-dim hover:text-emerald-vault active:scale-95 transition-all group pointer-events-auto"
      >
        <div className="p-2 rounded-full bg-white/5 group-hover:bg-emerald-vault/10 transition-colors">
          <Brush size={18} />
        </div>
        <span className="text-[9px] font-black uppercase tracking-widest">Harden</span>
      </button>

      <button 
        onClick={onOpenScanner}
        className="relative z-10 flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl text-vault-dim hover:text-white active:scale-95 transition-all group pointer-events-auto"
      >
        <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
          <Scan size={18} />
        </div>
        <span className="text-[9px] font-black uppercase tracking-widest">Scan</span>
      </button>

      <button 
        onClick={onToggleAudio}
        className={`relative z-10 flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl active:scale-95 transition-all group pointer-events-auto ${isPlayingAudio ? 'text-emerald-vault' : 'text-vault-dim'}`}
      >
        <div className={`p-2 rounded-full transition-colors ${isPlayingAudio ? 'bg-emerald-vault/20 border border-emerald-vault/30' : 'bg-white/5 border border-transparent'}`}>
          {isPlayingAudio ? <BookOpen size={18} className="animate-pulse" /> : <Volume2 size={18} />}
        </div>
        <span className="text-[9px] font-black uppercase tracking-widest">Listen</span>
      </button>
      <style>{`
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom, 20px);
        }
      `}</style>
    </div>
  );
};