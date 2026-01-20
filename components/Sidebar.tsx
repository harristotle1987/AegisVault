
import React, { useState } from 'react';
import { Plus, Hash, Trash2, Shield, Settings, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
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

  return (
    <aside 
      className={`bg-obsidian-soft border-r border-vault-border flex flex-col shrink-0 transition-all duration-300 ease-in-out hidden md:flex ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className={`flex items-center justify-between transition-all duration-300 ${isCollapsed ? 'p-4' : 'p-8'}`}>
        {!isCollapsed && (
          <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
            <div className="w-8 h-8 bg-emerald-vault rounded flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.3)]">
              <Shield className="w-5 h-5 text-black" />
            </div>
            <span className="font-extrabold text-white tracking-[-0.05em] text-lg">VAULT</span>
          </div>
        )}
        
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-vault-dim hover:text-emerald-vault transition-all bg-white/5 ${isCollapsed ? 'mx-auto' : ''}`}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      <div className="px-4 mb-4">
        <button 
          onClick={onCreate}
          className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-vault/5 border border-emerald-vault/20 text-emerald-vault hover:bg-emerald-vault/10 transition-all group overflow-hidden ${isCollapsed ? 'px-0' : 'px-4'}`}
          title="New Entry"
        >
          <Plus size={18} className="shrink-0" />
          {!isCollapsed && <span className="text-[11px] font-black uppercase tracking-widest whitespace-nowrap">Create Draft</span>}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-2 no-scrollbar">
        {!isCollapsed && (
          <div className="px-4 py-2 animate-in fade-in duration-500">
            <span className="text-[9px] uppercase tracking-[0.25em] text-vault-dim/40 font-bold">Local Archives</span>
          </div>
        )}
        
        {documents.map((doc) => (
          <div 
            key={doc.id}
            onClick={() => onSelect(doc.id)}
            className={`group relative flex flex-col gap-1 rounded-lg cursor-pointer transition-all duration-200 border ${
              isCollapsed ? 'p-3 items-center' : 'px-4 py-3'
            } ${
              activeId === doc.id 
                ? 'bg-emerald-glow border-emerald-vault/30 text-white shadow-[0_0_15px_rgba(16,185,129,0.05)]' 
                : 'border-transparent text-vault-dim hover:bg-white/[0.03] hover:text-vault-text'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              {isCollapsed ? (
                <div className="w-6 h-6 flex items-center justify-center shrink-0">
                  <FileText size={16} className={activeId === doc.id ? 'text-emerald-vault' : ''} />
                </div>
              ) : (
                <input
                  className="bg-transparent border-none focus:outline-none font-bold text-xs w-full cursor-pointer selection:bg-emerald-vault/40"
                  value={doc.title}
                  onChange={(e) => onRename(doc.id, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Untitled"
                />
              )}
              
              {!isCollapsed && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(doc.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-opacity ml-2 shrink-0"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>

            {!isCollapsed && (
              <div className="flex items-center gap-2 text-[9px] font-mono opacity-50">
                <FileText size={10} />
                <span>{doc.metadata.wordCount} words</span>
              </div>
            )}
            
            {activeId === doc.id && !isCollapsed && (
              <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-emerald-vault rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
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
    className={`flex items-center gap-4 transition-colors group ${isCollapsed ? 'justify-center w-full p-2' : 'w-full px-4 py-2 text-vault-dim hover:text-vault-text'}`}
    title={label}
  >
    <div className="group-hover:text-emerald-vault transition-colors text-vault-dim">{icon}</div>
    {!isCollapsed && <span className="text-[10px] font-bold tracking-widest uppercase">{label}</span>}
  </button>
);
