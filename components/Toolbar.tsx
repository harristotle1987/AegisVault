import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Brush, 
  Menu,
  Share2
} from 'lucide-react';

interface ToolbarProps {
  markdown: string;
  isExporting: boolean;
  isSaving: boolean;
  onExport: (format: 'pdf' | 'docx' | 'html' | 'txt' | 'rtf') => void;
  onShare: () => void;
  onLocalRefine: () => void;
  onToggleSidebar: () => void;
  onOpenTags: () => void;
  onOpenConfig: () => void;
  onImport: (files: FileList) => void;
  onOpenScanner: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ 
  onShare, 
  onLocalRefine,
  onToggleSidebar
}) => {
  return (
    <nav className="h-16 md:h-14 border-b border-vault-border bg-obsidian-soft/80 backdrop-blur-md flex items-center justify-between px-4 md:px-6 shrink-0 z-[1000] relative">
      <div className="flex items-center gap-4 md:gap-6 h-full z-[1001]">
        <button 
          onClick={(e) => {
            e.preventDefault();
            onToggleSidebar();
          }}
          className="md:hidden p-2 -ml-2 text-vault-dim hover:text-white transition-all min-h-[48px] min-w-[48px] flex items-center justify-center active:scale-90"
          aria-label="Toggle Sidebar"
        >
          <Menu size={22} />
        </button>

        <div className="flex items-center gap-2">
          <ShieldCheck className="text-emerald-vault w-5 h-5 md:w-4 md:h-4" />
        </div>
      </div>

      {/* Internal Toolbar Actions - Refined Spacing */}
      <div className="flex gap-2 h-full items-center mr-auto ml-4 md:ml-8">
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
        </div>
      </div>
    </nav>
  );
};