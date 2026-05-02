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
    <div className="fixed bottom-0 left-0 right-0 bg-obsidian/95 backdrop-blur-xl border-t border-vault-border pb-safe pt-5 px-6 sm:px-10 z-[120] flex items-center justify-between gap-4 sm:gap-8 shadow-[0_-20px_60px_rgba(0,0,0,0.15)] pointer-events-auto">
      {/* Action 1: HARDEN */}
      <button 
        onClick={onHarden}
        className="flex-1 flex flex-col items-center justify-center gap-2 py-4 rounded-2xl bg-vault-dim/5 border border-vault-border text-vault-dim hover:text-emerald-vault hover:bg-emerald-vault/5 active:scale-95 transition-all group"
      >
        <Brush size={18} className="text-emerald-vault/60 group-hover:text-emerald-vault" />
        <span className="text-[10px] font-black uppercase tracking-[0.25em]">Harden</span>
      </button>

      {/* Action 2: IMPORT */}
      <button 
        onClick={onImport}
        className="flex-1 flex flex-col items-center justify-center gap-2 py-4 rounded-2xl bg-vault-dim/5 border border-vault-border text-vault-dim hover:text-vault-text hover:bg-vault-dim/10 active:scale-95 transition-all group"
      >
        <FolderInput size={18} className="text-vault-dim group-hover:text-vault-text" />
        <span className="text-[10px] font-black uppercase tracking-[0.25em]">Import</span>
      </button>

      {/* Action 3: DOWNLOAD (Sub-Menu Protocol) */}
      <div className="flex-1 relative">
        <button 
          onClick={onToggleMenu}
          className={`w-full flex flex-col items-center justify-center gap-2 py-4 rounded-2xl transition-all shadow-lg active:scale-95 ${
            isMenuOpen ? 'bg-vault-dim/10 text-vault-text border border-vault-border' : 'bg-emerald-vault text-black shadow-emerald-glow/20'
          }`}
        >
          {isMenuOpen ? <X size={18} /> : <Download size={18} />}
          <span className="text-[10px] font-black uppercase tracking-[0.25em]">
            {isMenuOpen ? 'Cancel' : 'Export'}
          </span>
        </button>

        {isMenuOpen && (
          <div className="absolute bottom-full left-0 right-0 mb-6 bg-obsidian-soft/95 backdrop-blur-2xl border border-vault-border rounded-3xl overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.25)] animate-in slide-in-from-bottom-4 duration-500">
            <button 
              onClick={onExportPdf} 
              className="w-full py-5 px-8 text-left text-[11px] font-black uppercase tracking-widest text-vault-text hover:bg-emerald-vault/10 flex items-center gap-4 border-b border-vault-border group transition-colors"
            >
              <Download size={16} className="text-emerald-vault" /> 
              <span>PDF Document</span>
            </button>
            <button 
              onClick={onExportDocx} 
              className="w-full py-5 px-8 text-left text-[11px] font-black uppercase tracking-widest text-vault-text hover:bg-vault-dim/10 flex items-center gap-4 group transition-colors"
            >
              <FileText size={16} className="text-vault-dim group-hover:text-vault-text" /> 
              <span>Word Artifact</span>
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