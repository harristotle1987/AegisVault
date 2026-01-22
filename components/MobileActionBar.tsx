import React from 'react';
import { FileText, Download, Brush } from 'lucide-react';

interface MobileActionBarProps {
  onHarden: () => void;
  onExportDocx: () => void;
  onExportPdf: () => void;
}

export const MobileActionBar: React.FC<MobileActionBarProps> = ({ 
  onHarden,
  onExportDocx, 
  onExportPdf 
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-vault-border pb-safe pt-4 px-4 sm:px-8 z-[120] flex items-center justify-between gap-3 sm:gap-6 shadow-[0_-15px_50px_rgba(0,0,0,1)] pointer-events-auto">
      <button 
        onClick={onHarden}
        className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl bg-white/[0.03] border border-white/5 text-vault-dim hover:text-emerald-vault hover:border-emerald-vault/20 active:scale-95 transition-all group pointer-events-auto"
      >
        <Brush size={16} className="text-emerald-vault/60 group-hover:text-emerald-vault" />
        <span className="text-[9px] font-black uppercase tracking-[0.2em]">Harden</span>
      </button>

      <button 
        onClick={onExportDocx}
        className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl bg-white/[0.03] border border-white/5 text-vault-dim hover:text-emerald-vault hover:border-emerald-vault/20 active:scale-95 transition-all group pointer-events-auto"
      >
        <FileText size={16} className="text-emerald-vault/60 group-hover:text-emerald-vault" />
        <span className="text-[9px] font-black uppercase tracking-[0.2em]">DOCX</span>
      </button>

      <button 
        onClick={onExportPdf}
        className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl bg-emerald-vault text-black active:scale-95 transition-all group pointer-events-auto shadow-[0_10px_30px_rgba(16,185,129,0.15)]"
      >
        <Download size={16} />
        <span className="text-[9px] font-black uppercase tracking-[0.2em]">PDF</span>
      </button>
      <style>{`
        .pb-safe {
          padding-bottom: calc(1.5rem + env(safe-area-inset-bottom, 20px));
        }
      `}</style>
    </div>
  );
};