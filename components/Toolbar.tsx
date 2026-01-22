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
  Settings
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
 * Role: Senior Lead Architect
 * Feature: Sovereign Command Toolbar
 * Logic: Hardened interaction targets and absolute z-index priority.
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
    <nav className="h-16 md:h-14 border-b border-vault-border bg-obsidian-soft/80 backdrop-blur-md flex items-center justify-between px-4 md:px-6 shrink-0 z-[9999] relative">
      <div className="flex items-center gap-4 md:gap-6 h-full">
        {/* Mobile Menu Trigger - z-index 9999 for absolute priority */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            onToggleSidebar();
          }}
          className="md:hidden p-2 -ml-2 text-vault-dim hover:text-white transition-all min-h-[48px] min-w-[48px] flex items-center justify-center active:scale-90 z-[9999]"
          aria-label="Toggle Sidebar"
        >
          <Menu size={22} />
        </button>

        <div className="flex items-center gap-2 z-[9999]">
          <ShieldCheck className="text-emerald-vault w-5 h-5 md:w-4 md:h-4" />
          <span className="text-[12px] md:text-[10px] uppercase tracking-[0.2em] font-black text-vault-text hidden sm:inline-block">
            Sovereign Vault
          </span>
          <span className="text-[12px] uppercase tracking-[0.2em] font-black text-vault-text sm:hidden">
            Vault
          </span>
        </div>
        
        {/* Minimalist Emerald Status Indicator - NO TEXT */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.02] border border-vault-border hidden lg:flex transition-all">
          <div 
            className={`w-1.5 h-1.5 rounded-full transition-all duration-500 shadow-emerald-glow ${isSaving ? 'bg-emerald-vault animate-pulse' : 'bg-emerald-vault/40'}`} 
            title={isSaving ? "Persisting..." : "State Locked"}
          />
        </div>
      </div>

      <div className="flex gap-2 h-full items-center">
        {/* Management Tools */}
        <div className="flex items-center gap-1.5 mr-2 md:mr-4 border-r border-white/5 pr-2 md:pr-4">
          <button 
            onClick={onOpenTags}
            className="p-2.5 rounded-lg border border-vault-border bg-obsidian-muted hover:bg-emerald-glow hover:border-emerald-vault/50 transition-all text-vault-dim hover:text-emerald-vault active:scale-95"
            title="Tags"
          >
            <Tag size={18} />
          </button>
          <button 
            onClick={onOpenConfig}
            className="p-2.5 rounded-lg border border-vault-border bg-obsidian-muted hover:bg-emerald-glow hover:border-emerald-vault/50 transition-all text-vault-dim hover:text-emerald-vault active:scale-95"
            title="Config"
          >
            <Settings size={18} />
          </button>
        </div>

        {/* Action Group: Desktop/Large Tablet */}
        <div className="hidden sm:flex gap-2 items-center">
          <button 
            onClick={onLocalRefine}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 transition text-[10px] font-bold uppercase tracking-widest text-vault-dim border border-vault-border active:scale-95"
          >
            <Brush size={14} /> <span className="hidden lg:inline">Harden</span>
          </button>

          <button 
            onClick={onShare}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 transition text-[10px] font-bold uppercase tracking-widest text-vault-dim border border-vault-border active:scale-95"
          >
            <Share2 size={14} /> <span className="hidden lg:inline">Beam</span>
          </button>

          <div className="w-px h-6 bg-vault-border mx-1 md:mx-2 hidden lg:block" />

          <button 
            onClick={() => onExport('docx')}
            disabled={isExporting}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 transition text-[10px] font-black uppercase tracking-widest border border-vault-border text-vault-text disabled:opacity-50 active:scale-95"
          >
            <FileText size={16} /> <span className="hidden md:inline">DOCX</span>
          </button>
          
          <button 
            onClick={() => onExport('pdf')}
            disabled={isExporting}
            className="min-w-[110px] flex items-center justify-center gap-2 px-4 py-1.5 bg-emerald-vault hover:bg-emerald-vault/90 text-black rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50 shadow-lg active:scale-95 transition-all"
          >
            {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            <span className="hidden md:inline">Export PDF</span>
            <span className="md:hidden">PDF</span>
          </button>
        </div>
        
        {/* Mobile Mini Status Dot */}
        <div className="sm:hidden flex items-center gap-2 px-3 py-2 rounded-full bg-white/[0.02] border border-vault-border">
          <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 shadow-emerald-glow ${isSaving ? 'bg-emerald-vault animate-pulse' : 'bg-emerald-vault/40'}`} />
        </div>
      </div>
    </nav>
  );
};