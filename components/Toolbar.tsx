import React from 'react';
import { ShieldCheck, Menu } from 'lucide-react';

interface ToolbarProps {
  showMenu: boolean;
  onToggleSidebar: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ 
  showMenu,
  onToggleSidebar
}) => {
  return (
    <nav className="h-16 md:h-14 border-b border-vault-border bg-black flex items-center justify-between px-4 md:px-6 shrink-0 z-[1000] relative">
      <div className="flex items-center gap-4 h-full">
        {showMenu && (
          <button 
            onClick={(e) => { e.preventDefault(); onToggleSidebar(); }}
            className="p-3 -ml-2 text-vault-dim hover:text-white transition-all min-h-[48px] min-w-[48px] flex items-center justify-center active:scale-90"
          >
            <Menu size={24} />
          </button>
        )}

        <div className="flex items-center gap-2">
          <ShieldCheck className="text-emerald-vault w-5 h-5" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-vault-dim hidden sm:block">AegisVault Protocol</span>
        </div>
      </div>
    </nav>
  );
};