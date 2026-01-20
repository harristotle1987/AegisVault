import React from 'react';
import { X, Shield, Cpu, Activity, Database, Smartphone } from 'lucide-react';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  docCount: number;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({ isOpen, onClose, docCount }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-obsidian/90 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-obsidian-soft border border-vault-border rounded-2xl shadow-sovereign overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 flex items-center justify-between border-b border-vault-border bg-white/[0.01]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-vault/10 flex items-center justify-center border border-emerald-vault/20">
              <SettingsIcon className="w-5 h-5 text-emerald-vault" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-black tracking-[0.4em] uppercase text-vault-dim">Vault Configuration</span>
              <span className="text-[9px] font-mono text-emerald-vault/40 uppercase tracking-widest">Aegis.Engine: v1.0.4</span>
            </div>
          </div>
          <button onClick={onClose} className="text-vault-dim hover:text-white transition-all p-2 hover:bg-white/5 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-2 gap-4">
             <StatCard icon={<Database size={14}/>} label="Shard Storage" value={`${docCount} Entries`} />
             <StatCard icon={<Activity size={14}/>} label="Engine Status" value="Operational" />
             <StatCard icon={<Cpu size={14}/>} label="Local Core" value="Sandboxed" />
             <StatCard icon={<Smartphone size={14}/>} label="PWA Health" value="Hardened" />
          </div>

          <div className="space-y-4">
             <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-vault-dim/50 px-1">Sovereign Controls</h4>
             <div className="space-y-2">
                <ToggleItem label="Executive Hardening" desc="Auto-refine vertical rhythm on export" active={true} />
                <ToggleItem label="Tactile Response" desc="Haptic feedback on shard interaction" active={true} />
                <ToggleItem label="Deep-Space Mode" desc="Forced high-contrast Obsidian palette" active={true} />
             </div>
          </div>
        </div>

        <div className="p-6 bg-white/[0.02] border-t border-vault-border">
          <button 
            onClick={onClose}
            className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[11px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            Acknowledge Changes
          </button>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value }: { icon: any, label: string, value: string }) => (
  <div className="bg-white/[0.02] border border-vault-border p-4 rounded-xl space-y-1">
    <div className="flex items-center gap-2 text-vault-dim">
      {icon}
      <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
    </div>
    <div className="text-xs font-bold text-vault-text font-mono">{value}</div>
  </div>
);

const ToggleItem = ({ label, desc, active }: { label: string, desc: string, active: boolean }) => (
  <div className="flex items-center justify-between p-4 bg-white/[0.01] border border-vault-border rounded-xl">
    <div className="flex flex-col gap-0.5">
       <span className="text-[10px] font-bold text-vault-text uppercase tracking-widest">{label}</span>
       <span className="text-[9px] text-vault-dim/60 font-medium">{desc}</span>
    </div>
    <div className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${active ? 'bg-emerald-vault/40' : 'bg-white/5'}`}>
       <div className={`absolute top-1 w-3 h-3 rounded-full transition-all ${active ? 'right-1 bg-emerald-vault' : 'left-1 bg-vault-dim'}`} />
    </div>
  </div>
);

const SettingsIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);