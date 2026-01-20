
import React from 'react';
import { 
  FileText, 
  Download, 
  ShieldCheck, 
  Loader2,
  Brush
} from 'lucide-react';

interface ToolbarProps {
  markdown: string;
  isExporting: boolean;
  isSaving: boolean;
  onExport: (format: 'pdf' | 'docx') => void;
  onLocalRefine: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ 
  markdown, 
  isExporting, 
  isSaving,
  onExport, 
  onLocalRefine
}) => {
  return (
    <div className="h-14 border-b border-vault-border bg-obsidian-soft flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-emerald-vault w-4 h-4" />
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-vault-dim">
            Sovereign Vault
          </span>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.02] border border-vault-border">
          <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${isSaving ? 'bg-emerald-vault animate-pulse' : 'bg-emerald-vault/30'}`} />
          <span className="text-[9px] font-mono text-vault-dim uppercase tracking-wider">
            {isSaving ? 'Syncing...' : 'Encrypted'}
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <button 
          onClick={onLocalRefine}
          className="flex items-center gap-2 px-4 py-1.5 rounded-md bg-white/5 hover:bg-white/10 transition text-[11px] font-bold uppercase tracking-widest text-vault-dim border border-vault-border"
          title="Structural Clean (Local Logic)"
        >
          <Brush size={12} /> Harden
        </button>

        <div className="w-px h-6 bg-vault-border mx-2" />

        <button 
          onClick={() => onExport('docx')}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-1.5 rounded-md bg-white/5 hover:bg-white/10 transition text-xs font-semibold border border-vault-border text-vault-text disabled:opacity-50"
        >
          <FileText size={14} /> DOCX
        </button>
        
        <button 
          onClick={() => onExport('pdf')}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-1.5 rounded-md bg-emerald-vault hover:bg-emerald-vault/90 transition text-xs font-bold text-black disabled:opacity-50 shadow-lg shadow-emerald-vault/10"
        >
          {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
          Export PDF
        </button>
      </div>
    </div>
  );
};
