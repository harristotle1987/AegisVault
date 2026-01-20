
import React, { useEffect, useState } from 'react';
import { X, Moon, Shield, Save, Database, EyeOff, Zap, Layout, Monitor } from 'lucide-react';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  docCount: number;
}

/**
 * Role: Senior Architect
 * Feature: System Configuration Drawer (Slide-out)
 * Behavior: Hardware-accelerated translate-x transitions, full-width on mobile.
 */
export const ConfigModal: React.FC<ConfigModalProps> = ({ isOpen, onClose, docCount }) => {
  // Prevent background scrolling for total immersion
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop - High Contrast Blur */}
      <div 
        className={`fixed inset-0 bg-obsidian/40 backdrop-blur-sm z-[150] transition-opacity duration-500 ease-in-out pointer-events-auto
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sovereign Drawer Panel */}
      <div className={`fixed top-0 right-0 h-full w-full sm:max-w-md bg-obsidian-soft border-l border-vault-border z-[160] shadow-sovereign 
        transform transition-transform duration-500 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header - Technical Context */}
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
            onClick={(e) => { e.stopPropagation(); onClose(); }} 
            className="p-2.5 hover:bg-white/5 rounded-full text-vault-dim transition-all active:scale-90 touch-manipulation"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Settings Content - Vertical Rhythm Hardening */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-10 no-scrollbar">
          
          {/* Section: Status Shards */}
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

          {/* Section: Privacy Hardening */}
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

          {/* Section: Visual Logic */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <Layout size={12} className="text-vault-dim" />
              <h3 className="text-[10px] font-black text-vault-dim uppercase tracking-[0.3em]">Visual Logic</h3>
            </div>
            <div className="p-6 rounded-2xl bg-obsidian-muted border border-vault-border space-y-4">
              <p className="text-[10px] text-vault-dim leading-relaxed font-medium">Select the primary typeface for document generation. Binary sharding embeds these assets automatically.</p>
              <div className="grid grid-cols-2 gap-3">
                <button className="flex flex-col items-center gap-2 py-4 border border-emerald-vault/40 bg-emerald-vault/5 text-emerald-vault rounded-xl transition-all hover:bg-emerald-vault/10 active:scale-95 touch-manipulation">
                  <Monitor size={14} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Inter (Sans)</span>
                </button>
                <button className="flex flex-col items-center gap-2 py-4 border border-vault-border bg-white/[0.02] text-vault-dim rounded-xl transition-all hover:bg-white/5 active:scale-95 touch-manipulation">
                  <Database size={14} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Mono (Draft)</span>
                </button>
              </div>
            </div>
          </section>

          {/* Section: Support */}
          <section className="pt-4 border-t border-vault-border/50">
             <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-vault-border">
                <div className="flex items-center gap-3">
                   <Shield size={14} className="text-vault-dim" />
                   <span className="text-[10px] font-bold text-vault-dim uppercase tracking-widest">Security Protocol</span>
                </div>
                <span className="text-[9px] font-mono text-emerald-vault/60 uppercase">E2EE Ready</span>
             </div>
          </section>

        </div>

        {/* Footer Action */}
        <div className="p-6 bg-obsidian border-t border-vault-border">
          <button 
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="w-full py-4 bg-emerald-vault text-black rounded-xl text-[11px] font-black uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(16,185,129,0.15)] active:scale-[0.98] touch-manipulation"
          >
            Acknowledge Changes
          </button>
        </div>
      </div>
    </>
  );
};

const ToggleOption = ({ label, description, defaultOn = false, icon }: any) => {
  const [active, setActive] = useState(defaultOn);
  return (
    <div 
      onClick={() => setActive(!active)}
      className="flex items-center justify-between p-4 bg-obsidian-muted/40 rounded-xl border border-vault-border/50 cursor-pointer hover:bg-obsidian-muted/60 transition-all group touch-manipulation"
    >
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-lg transition-colors ${active ? 'bg-emerald-vault/10 text-emerald-vault' : 'bg-white/5 text-vault-dim'}`}>
          {icon}
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="text-[10px] text-white font-black uppercase tracking-widest">{label}</p>
          <p className="text-[9px] text-vault-dim/60 font-medium">{description}</p>
        </div>
      </div>
      <div className={`w-10 h-5 rounded-full relative transition-all duration-300 ${active ? 'bg-emerald-vault/30 border border-emerald-vault/50' : 'bg-white/5 border border-white/10'}`}>
        <div className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full transition-all duration-300 shadow-sm ${active ? 'right-1 bg-emerald-vault shadow-emerald-glow' : 'left-1 bg-vault-dim'}`} />
      </div>
    </div>
  );
};
