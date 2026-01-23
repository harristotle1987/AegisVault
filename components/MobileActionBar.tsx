import React from 'react';
import { FileText, Download, Brush, FolderInput, X } from 'lucide-react';

interface MobileActionBarProps {
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onHarden: () => void;
  onImport: () => void;
  onExportDocx: () => void;
  onExportPdf: () => void;
}

export const MobileActionBar: React.FC<MobileActionBarProps> = ({ 
  isMenuOpen,
  onToggleMenu,
  onHarden,
  onImport,
  onExportDocx, 
  onExportPdf 
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-vault-border pb-safe pt-4 px-4 sm:px-8 z-[120] flex items-center justify-between gap-3 sm:gap-6 shadow-[0_-15px_50px_rgba(0,0,0,1)] pointer-events-auto">
      {/* Action 1: HARDEN */}
      <button 
        onClick={onHarden}
        className="flex-1 flex flex-col items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.03] border border-white/5 text-vault-dim hover:text-emerald-vault active:scale-95 transition-all group"
      >
        <Brush size={16} className="text-emerald-vault/60 group-hover:text-emerald-vault" />
        <span className="text-[9px] font-black uppercase tracking-[0.2em]">Harden</span>
      </button>

      {/* Action 2: IMPORT */}
      <button 
        onClick={onImport}
        className="flex-1 flex flex-col items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.03] border border-white/5 text-vault-dim hover:text-white active:scale-95 transition-all group"
      >
        <FolderInput size={16} className="text-vault-dim group-hover:text-white" />
        <span className="text-[9px] font-black uppercase tracking-[0.2em]">Import</span>
      </button>

      {/* Action 3: DOWNLOAD (With Toggle Menu) */}
      <div className="flex-1 relative">
        <button 
          onClick={onToggleMenu}
          className={`w-full flex flex-col items-center justify-center gap-2 py-3 rounded-xl transition-all shadow-[0_10px_30px_rgba(16,185,129,0.3)] active:scale-95 ${
            isMenuOpen ? 'bg-white/10 text-white' : 'bg-emerald-vault text-black'
          }`}
        >
          {isMenuOpen ? <X size={16} /> : <Download size={16} />}
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">
            {isMenuOpen ? 'Cancel' : 'Download'}
          </span>
        </button>

        {isMenuOpen && (
          <div className="absolute bottom-full left-0 right-0 mb-4 bg-obsidian-muted border border-vault-border rounded-2xl overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,1)] animate-in slide-in-from-bottom-2 duration-300">
            <button 
              onClick={onExportPdf} 
              className="w-full py-4 px-6 text-left text-[10px] font-black uppercase tracking-widest text-white hover:bg-emerald-vault/10 flex items-center gap-3 border-b border-vault-border group transition-colors"
            >
              <Download size={14} className="text-emerald-vault" /> 
              <span>PDF Mirror</span>
            </button>
            <button 
              onClick={onExportDocx} 
              className="w-full py-4 px-6 text-left text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 flex items-center gap-3 group transition-colors"
            >
              <FileText size={14} className="text-vault-dim group-hover:text-white" /> 
              <span>DOCX Shard</span>
            </button>
          </div>
        )}
      </div>

      <style>{`
        .pb-safe {
          padding-bottom: calc(1.5rem + env(safe-area-inset-bottom, 20px));
        }
      `}</style>
    </div>
  );
};