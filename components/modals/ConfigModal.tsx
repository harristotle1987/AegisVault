
import React, { useEffect, useState } from 'react';
import { X, Moon, Shield, Save, Database, EyeOff, Zap, Layout, Monitor, RefreshCcw } from 'lucide-react';
import { VaultFont } from '../../types';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  docCount: number;
  activeFont: VaultFont;
  setActiveFont: (font: VaultFont) => void;
}

const ToggleOption = ({ label, description, defaultOn, icon }: { label: string, description: string, defaultOn?: boolean, icon: React.ReactNode }) => {
  const [isOn, setIsOn] = useState(defaultOn || false);
  return (
    <button 
      onClick={() => setIsOn(!isOn)}
      className="w-full flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-vault-border hover:bg-white/[0.04] transition-all group active:scale-[0.98] touch-manipulation"
    >
      <div className="flex items-center gap-4">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isOn ? 'bg-emerald-vault/20 text-emerald-vault' : 'bg-white/5 text-vault-dim'}`}>
          {icon}
        </div>
        <div className="flex flex-col items-start">
          <span className="text-[10px] font-bold text-vault-text uppercase tracking-widest">{label}</span>
          <span className="text-[9px] text-vault-dim font-medium">{description}</span>
        </div>
      </div>
      <div className={`w-10 h-5 rounded-full p-1 transition-colors ${isOn ? 'bg-emerald-vault' : 'bg-vault-border'}`}>
        <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${isOn ? 'translate-x-5' : 'translate-x-0'}`} />
      </div>
    </button>
  );
};

export const ConfigModal: React.FC<ConfigModalProps> = ({ isOpen, onClose, docCount, activeFont, setActiveFont }) => {
  const [isPurging, setIsPurging] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const handlePurge = async () => {
    setIsPurging(true);
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
        const cacheNames = await caches.keys();
        for (const name of cacheNames) {
          await caches.delete(name);
        }
      }
      window.location.reload();
    } catch (err) {
      console.error('Purge sequence failure:', err);
      setIsPurging(false);
    }
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-obsidian/40 backdrop-blur-sm z-[150] transition-all duration-500 ease-in-out
          ${isOpen ? 'opacity-100 pointer-events-auto visible' : 'opacity-0 pointer-events-none invisible'}`}
        onClick={onClose}
      />

      <div className={`fixed top-0 right-0 h-full w-full sm:max-w-md bg-obsidian-soft border-l border-vault-border z-[160] shadow-sovereign 
        transform transition-transform duration-500 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0 pointer-events-auto visible' : 'translate-x-full pointer-events-none invisible'}`}>
        
        <div className="flex items-center justify-between p-6 border-b border-vault-border bg-obsidian">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-vault/10 flex items-center justify-center border border-emerald-vault/20">
              <Database className="text-emerald-vault w-4 h-4" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <h2 className="text-white font-black text-xs uppercase tracking-[0.4em]">System Configuration</h2>
              <span className="text-[8px] font-mono text-emerald-vault/50 uppercase tracking-widest">Aegis.Core: Operational</span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2.5 hover:bg-white/5 rounded-full text-vault-dim transition-all active:scale-90"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-10 no-scrollbar">
          <section className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-obsidian-muted/30 border border-vault-border space-y-1">
              <span className="text-[8px] font-black uppercase tracking-widest text-vault-dim">Shard Count</span>
              <div className="text-sm font-bold text-white">{docCount} Archives</div>
            </div>
            <div className="p-4 rounded-xl bg-obsidian-muted/30 border border-vault-border space-y-1">
              <span className="text-[8px] font-black uppercase tracking-widest text-vault-dim">Environment</span>
              <div className="text-sm font-bold text-emerald-vault">Sandboxed</div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <Shield size={12} className="text-emerald-vault" />
              <h3 className="text-[10px] font-black text-emerald-vault uppercase tracking-[0.3em]">Privacy Hardening</h3>
            </div>
            <div className="space-y-3">
              <ToggleOption 
                label="Auto-Purge Session" 
                description="Clear local RAM on vault exit" 
                icon={<Zap size={14} />}
              />
              <ToggleOption 
                label="Stealth Mode" 
                description="Hide UI elements during export" 
                defaultOn 
                icon={<EyeOff size={14} />}
              />
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <Monitor size={12} className="text-vault-dim" />
              <h3 className="text-[10px] font-black text-vault-dim uppercase tracking-[0.3em]">Maintenance Protocol</h3>
            </div>
            <button 
              onClick={handlePurge}
              disabled={isPurging}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-red-500/5 border border-red-500/20 hover:bg-red-500/10 transition-all group active:scale-[0.98] disabled:opacity-50"
            >
              <div className="flex items-center gap-4 text-left">
                <div className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center">
                  <RefreshCcw size={14} className={isPurging ? 'animate-spin' : ''} />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Purge Cache & Update</span>
                  <span className="text-[9px] text-vault-dim font-medium">Reset PWA shell & local assets</span>
                </div>
              </div>
            </button>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <Layout size={12} className="text-vault-dim" />
              <h3 className="text-[10px] font-black text-vault-dim uppercase tracking-[0.3em]">Visual Logic</h3>
            </div>
            <div className="p-6 rounded-2xl bg-obsidian-muted border border-vault-border space-y-4">
              <p className="text-[10px] text-vault-dim leading-relaxed font-medium">Select the primary typeface for document generation. Binary sharding embeds these assets automatically.</p>
              <div className="grid grid-cols-2 gap-3 relative z-[170]">
                <button 
                  onClick={() => setActiveFont('sans')}
                  className={`flex flex-col items-center gap-2 py-4 border rounded-xl transition-all active:scale-95 ${
                    activeFont === 'sans' 
                      ? 'border-emerald-vault/40 bg-emerald-vault/5 text-emerald-vault' 
                      : 'border-vault-border bg-white/[0.02] text-vault-dim hover:border-vault-border/50'
                  }`}
                >
                  <Monitor size={14} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Inter (Sans)</span>
                </button>
                <button 
                  onClick={() => setActiveFont('mono')}
                  className={`flex flex-col items-center gap-2 py-4 border rounded-xl transition-all active:scale-95 ${
                    activeFont === 'mono' 
                      ? 'border-emerald-vault/40 bg-emerald-vault/5 text-emerald-vault' 
                      : 'border-vault-border bg-white/[0.02] text-vault-dim hover:border-vault-border/50'
                  }`}
                >
                  <Database size={14} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Mono (Draft)</span>
                </button>
              </div>
            </div>
          </section>
        </div>

        <div className="p-6 bg-obsidian border-t border-vault-border">
           <button 
             onClick={onClose}
             className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[11px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 active:scale-[0.98] border border-vault-border"
           >
             <Save size={16} /> Save Configuration
           </button>
        </div>
      </div>
    </>
  );
};
