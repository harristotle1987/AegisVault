import React, { useEffect, useState } from 'react';
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
  const [isWindows, setIsWindows] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsWindows(/windows|win32/i.test(userAgent));
  }, []);

  return (
    <nav className="h-16 md:h-14 border-b border-vault-border bg-obsidian-soft/80 backdrop-blur-md flex items-center justify-between px-4 md:px-6 shrink-0 z-[1000] relative">
      <div className="flex items-center gap-4 md:gap-6 h-full z-[1001]">
        {!isWindows && (
          <button 
            onClick={(e) => {
              e.preventDefault();
              onToggleSidebar();
            }}
            className="p-3 -ml-2 text-vault-dim hover:text-white transition-all min-h-[48px] min-w-[48px] flex items-center justify-center active:scale-90"
            aria-label="Toggle Sidebar"
          >
            <Menu size={22} />
          </button>
        )}

        <div className="flex items-center gap-2">
          <ShieldCheck className="text-emerald-vault w-5 h-5" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-vault-dim hidden sm:block">AegisVault Protocol</span>
        </div>
      </div>

      <div className="flex gap-4 h-full items-center">
        <button 
          onClick={onLocalRefine}
          className="hidden lg:flex items-center gap-2 px-4 py-1.5 rounded-md bg-white/5 hover:bg-white/10 transition text-[10px] font-black uppercase tracking-widest text-vault-dim border border-vault-border active:scale-95"
        >
          <Brush size={14} /> <span>Harden Shard</span>
        </button>
      </div>
    </nav>
  );
};