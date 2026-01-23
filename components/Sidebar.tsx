import React, { useState } from 'react';
import { Plus, Trash2, Settings, ChevronLeft, ChevronRight, X, Hash, FileText } from 'lucide-react';
import { SovereignDocument } from '../types';

interface SidebarProps {
  documents: SovereignDocument[];
  activeId: string | null;
  onSelect: (id: string, mode?: 'view' | 'edit') => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onOpenConfig: () => void;
  onOpenTags: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  documents, activeId, onSelect, onCreate, onDelete, onRename, onOpenConfig, onOpenTags, isOpen, onClose
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside className={`bg-black border-r border-vault-border flex flex-col shrink-0 transition-all duration-300 z-[10001] fixed md:static inset-y-0 left-0 h-full shadow-2xl ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} ${isCollapsed ? 'md:w-16 w-64' : 'w-72'}`}>
      <div className={`flex items-center justify-between p-6 ${isCollapsed ? 'md:p-4' : ''}`}>
        {!isCollapsed && (
          <div className="flex flex-col">
            <span className="font-extrabold text-white text-lg uppercase leading-none">AegisVault</span>
            <span className="text-[8px] font-mono text-emerald-vault/50 uppercase tracking-widest mt-1">Sovereign Shard</span>
          </div>
        )}
        <button onClick={onClose} className="md:hidden w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-vault-dim hover:text-white transition-all bg-white/5 active:scale-90">
          <X size={24} />
        </button>
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="hidden md:flex w-8 h-8 rounded-full border border-white/10 items-center justify-center text-vault-dim hover:text-emerald-vault transition-all bg-white/5">
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      <div className="px-5 mb-4">
        <button onClick={onCreate} className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-emerald-vault text-black transition-all shadow-lg active:scale-95">
          <Plus size={18} /> {!isCollapsed && <span className="text-[11px] font-black uppercase tracking-widest">Provision</span>}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-2 no-scrollbar">
        {documents.map((doc) => (
          <div key={doc.id} onClick={() => onSelect(doc.id)} className={`p-4 rounded-xl cursor-pointer border transition-all ${activeId === doc.id ? 'bg-white/5 border-emerald-vault/40 text-emerald-vault' : 'border-transparent text-vault-dim hover:bg-white/5'}`}>
             {!isCollapsed && <input className="bg-transparent focus:outline-none w-full font-bold text-sm" value={doc.title} onChange={(e) => onRename(doc.id, e.target.value)} onClick={(e) => e.stopPropagation()} />}
             {isCollapsed && <FileText size={16} />}
          </div>
        ))}
      </div>

      <div className="p-6 border-t border-vault-border space-y-4">
        <button onClick={onOpenTags} className="flex items-center gap-4 text-vault-dim hover:text-emerald-vault transition-all">
          <Hash size={18} /> {!isCollapsed && <span className="text-[10px] font-black uppercase tracking-widest">Tags</span>}
        </button>
        <button onClick={onOpenConfig} className="flex items-center gap-4 text-vault-dim hover:text-emerald-vault transition-all">
          <Settings size={18} /> {!isCollapsed && <span className="text-[10px] font-black uppercase tracking-widest">Config</span>}
        </button>
      </div>
    </aside>
  );
};