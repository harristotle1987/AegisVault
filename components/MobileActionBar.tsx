
import React from 'react';
import { FileText, Download, Brush, Loader2 } from 'lucide-react';

interface MobileActionBarProps {
  isExporting: boolean;
  onExport: (format: 'pdf' | 'docx') => void;
  onLocalRefine: () => void;
}

export const MobileActionBar: React.FC<MobileActionBarProps> = ({ isExporting, onExport, onLocalRefine }) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-obsidian-soft border-t border-vault-border pb-safe pt-2 px-6 z-50 flex items-center justify-between gap-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      <button 
        onClick={onLocalRefine}
        className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl text-vault-dim hover:text-emerald-vault active:scale-95 transition-all group"
      >
        <div className="p-2 rounded-full bg-white/5 group-hover:bg-emerald-vault/10 transition-colors">
          <Brush size={18} />
        </div>
        <span className="text-[9px] font-black uppercase tracking-widest">Harden</span>
      </button>

      <button 
        onClick={() => onExport('docx')}
        disabled={isExporting}
        className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl text-vault-dim hover:text-white active:scale-95 transition-all disabled:opacity-50 group"
      >
        <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
          <FileText size={18} />
        </div>
        <span className="text-[9px] font-black uppercase tracking-widest">DOCX</span>
      </button>

      <button 
        onClick={() => onExport('pdf')}
        disabled={isExporting}
        className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl text-emerald-vault active:scale-95 transition-all disabled:opacity-50 group"
      >
        <div className="p-2 rounded-full bg-emerald-vault/10 group-hover:bg-emerald-vault/20 transition-colors border border-emerald-vault/20">
          {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
        </div>
        <span className="text-[9px] font-black uppercase tracking-widest">PDF</span>
      </button>
      <style>{`
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom, 20px);
        }
      `}</style>
    </div>
  );
};
