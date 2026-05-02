import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  Brush, 
  Menu,
  Sun,
  Moon,
  Scan,
  Volume2,
  BookOpen,
  CheckCircle2,
  Settings
} from 'lucide-react';

interface ToolbarProps {
  isSidebarOpen: boolean;
  onShare: () => void;
  onLocalRefine: () => void;
  onToggleSidebar: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onListen: () => void;
  onScan: () => void;
  onOpenConfig: () => void;
  isPlayingAudio: boolean;
  vaultSynced: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({ 
  isSidebarOpen,
  onLocalRefine,
  onToggleSidebar,
  isDarkMode,
  onToggleTheme,
  onListen,
  onScan,
  onOpenConfig,
  isPlayingAudio,
  vaultSynced
}) => {
  const [isWindows, setIsWindows] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsWindows(/windows|win32/i.test(userAgent));
  }, []);

  return (
    <nav className="h-16 md:h-16 border-b border-vault-border bg-obsidian-soft/90 backdrop-blur-xl flex items-center justify-between px-4 md:px-8 shrink-0 z-[1000] relative">
      <div className="flex items-center gap-4 md:gap-8 h-full">
        {/* Menu Toggle for Mobile/Mac */}
        {!isWindows && (
          <button 
            onClick={(e) => {
              e.preventDefault();
              onToggleSidebar();
            }}
            className="p-2.5 -ml-2 text-vault-dim hover:text-emerald-vault hover:bg-emerald-vault/5 rounded-xl transition-all active:scale-95"
            aria-label="Toggle Sidebar"
          >
            <Menu size={20} />
          </button>
        )}

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-vault/10 flex items-center justify-center border border-emerald-vault/20">
            <ShieldCheck className="text-emerald-vault w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-black uppercase tracking-[0.25em] text-vault-text leading-none">AegisVault</span>
            <span className="text-[8px] font-bold uppercase tracking-[0.1em] text-vault-dim mt-1 opacity-60">Sovereign Protocol</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4 h-full">
        {/* Sync Status */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-vault-dim/5 border border-vault-border mr-2">
          <div className={`w-1.5 h-1.5 rounded-full ${vaultSynced ? "bg-emerald-vault" : "bg-amber-500 animate-pulse"}`} />
          <span className="text-[9px] font-bold uppercase tracking-wider text-vault-dim">
            {vaultSynced ? "Vault Synced" : "Syncing..."}
          </span>
        </div>

        <div className="flex items-center gap-1.5 md:gap-2">
          <button 
            onClick={onScan}
            className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl bg-vault-dim/5 hover:bg-emerald-vault/10 hover:text-emerald-vault transition-all text-[10px] font-black uppercase tracking-widest text-vault-dim border border-vault-border active:scale-95"
            title="Scan Document"
          >
            <Scan size={14} />
            <span className="hidden sm:inline">Scan</span>
          </button>

          <button 
            onClick={onListen}
            className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest border active:scale-95 ${
              isPlayingAudio 
                ? 'bg-emerald-vault text-black border-emerald-vault shadow-emerald-glow' 
                : 'bg-vault-dim/5 hover:bg-emerald-vault/10 hover:text-emerald-vault text-vault-dim border-vault-border'
            }`}
            title="Listen to Document"
          >
            {isPlayingAudio ? <BookOpen size={14} className="animate-pulse" /> : <Volume2 size={14} />}
            <span className="hidden sm:inline">{isPlayingAudio ? "Playing" : "Listen"}</span>
          </button>

          <div className="w-px h-6 bg-vault-border mx-1 hidden sm:block" />

          <button 
            onClick={onLocalRefine}
            className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl bg-emerald-vault/5 hover:bg-emerald-vault/10 text-emerald-vault transition-all text-[10px] font-black uppercase tracking-widest border border-emerald-vault/20 active:scale-95"
            title="Harden Document"
          >
            <Brush size={14} />
            <span className="hidden md:inline">Harden Shard</span>
          </button>

          <button 
            onClick={onOpenConfig}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-vault-dim/5 hover:bg-vault-dim/10 transition text-vault-dim border border-vault-border active:scale-95"
            aria-label="Open Settings"
            title="System Configuration"
          >
            <Settings size={18} />
          </button>

          <button 
            onClick={onToggleTheme}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-vault-dim/5 hover:bg-vault-dim/10 transition text-vault-dim border border-vault-border active:scale-95"
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
