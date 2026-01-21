
import React from 'react';
import { 
  FileText, 
  Download, 
  ShieldCheck, 
  Loader2,
  Brush,
  Menu,
  Share2,
  Tag,
  Settings,
  CheckCircle2
} from 'lucide-react';

interface ToolbarProps {
  markdown: string;
  isExporting: boolean;
  isSaving: boolean;
  onExport: (format: 'pdf' | 'docx') => void;
  onShare: () => void;
  onLocalRefine: () => void;
  onToggleSidebar: () => void;
  onOpenTags: () => void;
  onOpenConfig: () => void;
}

/**
 * Role: Senior Architect
 * Logic: Hardened TopBar with Refined Visibility Breakpoints.
 */
export const Toolbar: React.FC<ToolbarProps> = ({ 
  markdown, 
  isExporting, 
  isSaving,
  onExport, 
  onShare,
  onLocalRefine,
  onToggleSidebar,
  onOpenTags,
  onOpenConfig
}) => {
  return (
    <div className="h-16 md:h-14 border-b border-vault-border bg-obsidian-soft/80 backdrop-blur-md flex items-center justify-between px-4 md:px-6 shrink-0 z-[110] relative pointer-events-none">
      <div className="flex items-center gap-4 md:gap-6 pointer-events-auto h-full">
        <button 
          onClick={onToggleSidebar}
          className="md:hidden p-2 -ml-2 text-vault-dim hover:text-white transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center active:scale-95 touch-manipulation relative z-10"
          aria-label="Toggle Sidebar"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-2">
          <ShieldCheck className="text-emerald-vault w-5 h-5 md:w-4 md:h-4" />
          <span className="text-[12px] md:text-[10px] uppercase tracking-[0.2em] font-bold text-vault-dim hidden sm:inline-block">
            Sovereign Vault
          </span>
          <span className="text-[12px] uppercase tracking-[0.2em] font-bold text-vault-dim sm:hidden">
            Vault
          </span>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.02] border border-vault-border hidden lg:flex transition-all">
          <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${isSaving ? 'bg-emerald-vault animate-pulse' : 'bg-emerald-vault/30'}`} />
          <span className="text-[9px] font-mono text-vault-dim uppercase tracking-wider flex items-center gap-1.5">
            {isSaving ? (
              <>Syncing...</>
            ) : (
              <>
                <CheckCircle2 size={10} className="text-emerald-vault" /> Vault Synced
              </>
            )}
          </span>
        </div>
      </div>

      <div className="flex gap-2 pointer-events-auto h-full items-center">
        {/* Harden Toggle & System Config Buttons */}
        <div className="flex items-center gap-2 mr-2 md:mr-4 border-r border-white/5 pr-2 md:pr-4">
          <button 
            onClick={(e) => { e.stopPropagation(); onOpenTags(); }}
            className="relative z-10 p-2.5 rounded-lg border border-vault-border bg-obsidian-muted hover:bg-emerald-glow hover:border-emerald-vault/50 transition-all active:scale-95 touch-manipulation text-vault-dim hover:text-emerald-vault"
            title="Manage Tags"
          >
            <Tag size={18} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onOpenConfig(); }}
            className="relative z-10 p-2.5 rounded-lg border border-vault-border bg-obsidian-muted hover:bg-emerald-glow hover:border-emerald-vault/50 transition-all active:scale-95 touch-manipulation text-vault-dim hover:text-emerald-vault"
            title="System Config"
          >
            <Settings size={18} />
          </button>
        </div>

        {/* Action Group: Visible from SM breakpoint upwards to cover desktop view */}
        <div className="hidden sm:flex gap-2 h-full items-center">
          <button 
            onClick={onLocalRefine}
            className="relative z-10 flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 transition text-[10px] font-bold uppercase tracking-widest text-vault-dim border border-vault-border active:scale-95 touch-manipulation"
            title="Structural Clean"
          >
            <Brush size={14} className="w-3.5 h-3.5" /> <span className="hidden lg:inline">Harden</span>
          </button>

          <button 
            onClick={onShare}
            className="relative z-10 flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 transition text-[10px] font-bold uppercase tracking-widest text-vault-dim border border-vault-border active:scale-95 touch-manipulation"
            title="Beam Archive"
          >
            <Share2 size={14} className="w-3.5 h-3.5" /> <span className="hidden lg:inline">Beam</span>
          </button>

          <div className="w-px h-6 bg-vault-border mx-1 md:mx-2 hidden lg:block" />

          <button 
            onClick={() => onExport('docx')}
            disabled={isExporting}
            className="relative z-10 flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 transition text-[10px] font-black uppercase tracking-widest border border-vault-border text-vault-text disabled:opacity-50 active:scale-95 touch-manipulation"
          >
            <FileText size={16} className="w-3.5 h-3.5" /> <span className="hidden md:inline">DOCX</span>
          </button>
          
          <button 
            onClick={() => onExport('pdf')}
            disabled={isExporting}
            className="relative z-10 min-w-[110px] flex items-center justify-center gap-2 px-4 py-1.5 bg-emerald-vault hover:bg-emerald-vault/90 text-black rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50 shadow-lg shadow-emerald-vault/10 active:scale-95 touch-manipulation transition-all"
          >
            {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            <span className="hidden md:inline">Export PDF</span>
            <span className="md:hidden">PDF</span>
          </button>
        </div>
        
        <div className="sm:hidden flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.02] border border-vault-border">
          <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${isSaving ? 'bg-emerald-vault animate-pulse' : 'bg-emerald-vault/30'}`} />
          <span className="text-[9px] font-mono text-vault-dim uppercase tracking-wider">
            {isSaving ? 'Sync' : 'Ready'}
          </span>
        </div>
      </div>
    </div>
  );
};
