
import React, { useState } from 'react';
import { Plus, Hash, Trash2, Shield, Settings, FileText, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { SovereignDocument } from '../types';

interface SidebarProps {
  documents: SovereignDocument[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  documents, 
  activeId, 
  onSelect, 
  onCreate, 
  onDelete,
  onRename
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const formatTimestamp = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <aside 
      className={`bg-obsidian-soft border-r border-vault-border flex flex-col shrink-0 transition-all duration-300 ease-in-out hidden md:flex ${
        isCollapsed ? 'w-16' : 'w-72'
      }`}
    >
      <div className={`flex items-center justify-between transition-all duration-300 ${isCollapsed ? 'p-4' : 'p-8'}`}>
        {!isCollapsed && (
          <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
            <div className="w-8 h-8 bg-emerald-vault rounded flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <Shield className="w-5 h-5 text-black" strokeWidth={2.5} />
            </div>
            <span className="font-extrabold text-white tracking-[-0.05em] text-xl">VAULT</span>
          </div>
        )}
        
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-vault-dim hover:text-emerald-vault transition-all bg-white/5 ${isCollapsed ? 'mx-auto' : ''}`}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      <div className="px-5 mb-6">
        <button 
          onClick={onCreate}
          className={`w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-emerald-vault/5 border border-emerald-vault/20 text-emerald-vault hover:bg-emerald-vault/10 transition-all group overflow-hidden ${isCollapsed ? 'px-0' : 'px-4'}`}
          title="Create Draft"
        >
          <Plus size={18} className="shrink-0" />
          {!isCollapsed && <span className="text-[11px] font-black uppercase tracking-[0.2em] whitespace-nowrap">New Draft</span>}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-2 no-scrollbar pb-10">
        {!isCollapsed && (
          <div className="px-4 py-2 mb-1 animate-in fade-in duration-500">
            <span className="text-[9px] uppercase tracking-[0.3em] text-vault-dim/30 font-bold">Encrypted Shards</span>
          </div>
        )}
        
        {documents.map((doc) => (
          <div 
            key={doc.id}
            onClick={() => onSelect(doc.id)}
            className={`group relative flex flex-col gap-1 rounded-xl cursor-pointer transition-all duration-200 border ${
              isCollapsed ? 'p-3 items-center' : 'px-4 py-3'
            } ${
              activeId === doc.id 
                ? 'bg-emerald-vault/5 border-emerald-vault/40 text-white shadow-[inset_0_0_20px_rgba(16,185,129,0.02)]' 
                : 'border-transparent text-vault-dim hover:bg-white/[0.03] hover:text-vault-text'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              {isCollapsed ? (
                <div className="w-6 h-6 flex items-center justify-center shrink-0">
                  <FileText size={16} className={activeId === doc.id ? 'text-emerald-vault' : ''} />
                </div>
              ) : (
                <div className="flex flex-col gap-1 w-full overflow-hidden">
                  <input
                    className="bg-transparent border-none focus:outline-none font-bold text-sm w-full cursor-pointer selection:bg-emerald-vault/40 text-vault-text group-hover:text-white transition-colors"
                    value={doc.title}
                    onChange={(e) => onRename(doc.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Untitled Archive"
                  />
                  <div className="flex items-center gap-3 opacity-40">
                    <div className="flex items-center gap-1 text-[9px] font-mono">
                      <Clock size={10} />
                      <span>{formatTimestamp(doc.lastModified)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[9px] font-mono">
                      <FileText size={10} />
                      <span>{doc.metadata.wordCount} words</span>
                    </div>
                  </div>
                </div>
              )}
              
              {!isCollapsed && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(doc.id); }}
                  className="opacity-0 group-hover:opacity-100 p-2 hover:text-red-500 transition-all hover:bg-red-500/10 rounded-lg ml-2 shrink-0"
                  title="Purge Shard"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>

            {activeId === doc.id && (
              <div className={`absolute left-0 top-3 bottom-3 w-1 bg-emerald-vault rounded-full shadow-[0_0_10px_rgba(16,185,129,1)] transition-all duration-500 ${isCollapsed ? '-left-1' : 'left-0'}`} />
            )}
          </div>
        ))}
      </div>

      <div className={`p-6 border-t border-vault-border space-y-4 ${isCollapsed ? 'items-center flex flex-col' : ''}`}>
        <SidebarStaticItem icon={<Hash size={18} />} label="Tags" isCollapsed={isCollapsed} />
        <SidebarStaticItem icon={<Settings size={18} />} label="Config" isCollapsed={isCollapsed} />
      </div>
    </aside>
  );
};

const SidebarStaticItem = ({ icon, label, isCollapsed }: { icon: any, label: string, isCollapsed: boolean }) => (
  <button 
    className={`flex items-center gap-4 transition-all group ${isCollapsed ? 'justify-center w-full p-2' : 'w-full px-4 py-2 text-vault-dim/50 hover:text-vault-text hover:bg-white/[0.02] rounded-lg'}`}
    title={label}
  >
    <div className="group-hover:text-emerald-vault transition-colors">{icon}</div>
    {!isCollapsed && <span className="text-[10px] font-black tracking-[0.3em] uppercase">{label}</span>}
  </button>
);
