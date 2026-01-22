import React from 'react';
import { 
  ShieldCheck, 
  Brush, 
  Menu
} from 'lucide-react';

interface ToolbarProps {
  onShare: () => void;
  onLocalRefine: () => void;
  onToggleSidebar: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ 
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
          className="p-2 -ml-2 text-vault-dim hover:text-white transition-all min-h-[48px] min-w-[48px] flex items-center justify-center active:scale-90"
          aria-label="Toggle Sidebar"
        >
          <Menu size={24} />
        </button>

        <div className="flex items-center gap-2">
          <ShieldCheck className="text-emerald-vault w-6 h-6 md:w-5 md:h-5" />
        </div>
      </div>

      <div className="flex gap-4 h-full items-center mr-auto ml-8">
        <button 
          onClick={onLocalRefine}
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-md bg-white/5 hover:bg-white/10 transition text-[11px] font-bold uppercase tracking-widest text-vault-dim border border-vault-border active:scale-95"
        >
          <Brush size={16} /> <span>Harden Shard</span>
        </button>
      </div>
    </nav>
  );
};