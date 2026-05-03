import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  Brush, 
  Menu,
  Sun,
  Moon,
  Volume2,
  BookOpen
} from 'lucide-react';

interface ToolbarProps {
  isSidebarOpen: boolean;
  onLocalRefine: () => void;
  onToggleSidebar: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onListen: () => void;
  onUpdate?: () => void;
  isPlayingAudio: boolean;
  vaultSynced: boolean;
  isCloudConnected?: boolean;
  isSyncing?: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({ 
  isSidebarOpen,
  onLocalRefine,
  onToggleSidebar,
  isDarkMode,
  onToggleTheme,
  onListen,
  onUpdate,
  isPlayingAudio,
  vaultSynced,
  isCloudConnected,
  isSyncing
}) => {
  const [isWindows, setIsWindows] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsWindows(/windows|win32/i.test(userAgent));
  }, []);

  return (
    <nav className="w-full h-16 border-b border-vault-border bg-obsidian-soft/90 backdrop-blur-xl flex items-center shrink-0 z-[1000] relative overflow-hidden">
      {/* Primary Action Area (Logo + Menu) */}
      <div className="flex items-center gap-2 sm:gap-4 md:gap-8 h-full px-4 md:px-8 shrink-0 border-r border-vault-border/10 bg-inherit z-10 shadow-[4px_0_15px_rgba(0,0,0,0.05)]">
        {!isWindows && (
          <button 
            onClick={(e) => {
              e.preventDefault();
              onToggleSidebar();
            }}
            className="p-2.5 -ml-1 text-vault-dim hover:text-emerald-vault hover:bg-emerald-vault/5 rounded-xl transition-all active:scale-95"
            aria-label="Toggle Sidebar"
          >
            <Menu size={20} />
          </button>
        )}

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-vault/10 flex items-center justify-center border border-emerald-vault/20">
            <ShieldCheck className="text-emerald-vault w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.25em] text-vault-text leading-none">AegisVault</span>
            <span className="hidden xs:inline-block text-[8px] font-bold uppercase tracking-[0.1em] text-vault-dim mt-1 opacity-60 uppercase">Protocol</span>
          </div>
        </div>
      </div>

      {/* Tools Area - Stable Layout */}
      <div className="flex-1 flex items-center justify-end h-full min-w-0 pr-4 md:pr-8">
        <div className="flex items-center gap-1 sm:gap-2 h-full">
          {isCloudConnected && (
            <div className={`hidden xs:flex items-center gap-1.5 px-2 py-1 rounded-lg border border-vault-border bg-vault-dim/5 transition-opacity ${isSyncing ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-1 h-1 rounded-full ${isSyncing ? 'bg-emerald-vault animate-pulse' : 'bg-vault-dim'}`} />
              <span className="text-[8px] font-black uppercase tracking-widest text-vault-dim">Sync</span>
            </div>
          )}

          <button 
            onClick={onListen}
            className={`flex items-center justify-center shrink-0 w-9 sm:w-auto px-0 sm:px-4 h-9 sm:h-10 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest border active:scale-95 ${
              isPlayingAudio 
                ? 'bg-emerald-vault text-black border-emerald-vault shadow-emerald-glow' 
                : 'bg-vault-dim/5 hover:bg-emerald-vault/10 hover:text-emerald-vault text-vault-dim border-vault-border'
            }`}
            title="Listen to Document"
          >
            {isPlayingAudio ? <BookOpen size={18} className="animate-pulse" /> : <Volume2 size={18} />}
            <span className="hidden lg:inline ml-2">{isPlayingAudio ? "Playing" : "Listen"}</span>
          </button>

          <button 
            onClick={onLocalRefine}
            className="hidden sm:flex items-center justify-center shrink-0 w-9 sm:w-auto px-0 sm:px-4 h-9 sm:h-10 rounded-xl bg-emerald-vault/5 hover:bg-emerald-vault/10 text-emerald-vault transition-all text-[10px] font-black uppercase tracking-widest border border-emerald-vault/20 active:scale-95"
            title="Harden Document"
          >
            <Brush size={18} />
            <span className="hidden lg:inline ml-2">Harden</span>
          </button>

          <div className="w-px h-6 bg-vault-border mx-1 hidden md:block shrink-0" />

          <button 
            onClick={onToggleTheme}
            className="flex items-center justify-center shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-vault-dim/5 hover:bg-vault-dim/10 transition text-vault-dim border border-vault-border active:scale-95"
            aria-label="Toggle Theme"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </nav>

  );
};
