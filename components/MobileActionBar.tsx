import React from 'react';
import { FileText, Download } from 'lucide-react';

interface MobileActionBarProps {
  onExportDocx: () => void;
  onExportPdf: () => void;
}

export const MobileActionBar: React.FC<MobileActionBarProps> = ({ 
  onExportDocx, 
  onExportPdf 
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-vault-border pb-safe pt-4 px-8 z-[120] flex items-center justify-between gap-6 shadow-[0_-10_-40px_rgba(0,0,0,0.8)] pointer-events-auto">
      <button 
        onClick={onExportDocx}
        className="flex-1 flex items-center justify-center gap-3 py-4 rounded-xl bg-white/5 border border-white/10 text-white hover:text-emerald-vault active:scale-95 transition-all group pointer-events-auto"
      >
        <FileText size={20} className="text-emerald-vault" />
        <span className="text-[11px] font-black uppercase tracking-[0.2em]">Harden DOCX</span>
      </button>

      <button 
        onClick={onExportPdf}
        className="flex-1 flex items-center justify-center gap-3 py-4 rounded-xl bg-emerald-vault text-black active:scale-95 transition-all group pointer-events-auto shadow-lg shadow-emerald-vault/20"
      >
        <Download size={20} />
        <span className="text-[11px] font-black uppercase tracking-[0.2em]">Harden PDF</span>
      </button>
      <style>{`
        .pb-safe {
          padding-bottom: calc(1.5rem + env(safe-area-inset-bottom, 20px));
        }
      `}</style>
    </div>
  );
};