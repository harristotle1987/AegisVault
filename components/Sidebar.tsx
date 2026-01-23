import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  X, 
  DownloadCloud, 
  Search,
  Hash,
  Eye,
  Edit3,
  FileText
} from 'lucide-react';
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
  installPrompt?: { isInstallable: boolean; install: () => void };
}

interface RegistryItemProps {
  doc: SovereignDocument;
  isActive: boolean;
  isCollapsed: boolean;
  onSelect: (id: string, mode?: 'view' | 'edit') => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

const RegistryItem: React.FC<RegistryItemProps> = ({ 
  doc, 
  isActive, 
  isCollapsed, 
  onSelect, 
  onRename, 
  onDelete 
}) => {
  const [localTitle, setLocalTitle] = useState(doc.title);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    setLocalTitle(doc.title);
  }, [doc.title]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setLocalTitle(newVal);
    
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    
    debounceRef.current = window.setTimeout(() => {
      onRename(doc.id, newVal);
      debounceRef.current = null;
    }, 500);
  };

  const formatTimestamp = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <div 
      onClick={() => onSelect(doc.id)}
      className={`group relative flex flex-col gap-1 rounded-xl cursor-pointer transition-all duration-300 border active:scale-[0.98] ${
        isCollapsed && window.innerWidth >= 768 ? 'p-3 items-center' : 'px-4 py-3'
      } ${
        isActive 
          ? 'bg-obsidian-soft border-emerald-vault/40 text-white shadow-emerald-glow/5' 
          : 'border-transparent text-vault-dim hover:bg-white/[0.02] hover:text-vault-text'
      }`}
    >
      <div className="flex items-center justify-between w-full">
        {isCollapsed && window.innerWidth >= 768 ? (
          <div className="w-6 h-6 flex items-center justify-center shrink-0">
            <FileText size={16} className={isActive ? 'text-emerald-vault' : ''} />
          </div>
        ) : (
          <div className="flex flex-col gap-1 w-full overflow-hidden">
            <div className="flex items-center justify-between gap-2">
              <input
                className={`bg-transparent border-none focus:outline-none font-bold text-sm w-full cursor-pointer transition-colors ${isActive ? 'text-emerald-vault' : 'text-vault-text'}`}
                value={localTitle}
                onChange={handleTitleChange}
                onClick={(e) => e.stopPropagation()}
                placeholder="Untitled Shard"
              />
              {isActive && (
                <div className="px-1.5 py-0.5 rounded-sm bg-emerald-vault/10 border border-emerald-vault/20 text-[7px] font-black text-emerald-vault uppercase tracking-tighter shrink-0 animate-pulse">
                  ACTIVE
                </div>
              )}
            </div>
          </div>
        )}
        
        {(!isCollapsed || window.innerWidth < 768) && (
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
            <button 
              onClick={(e) => { e.stopPropagation(); onSelect(doc.id, 'view'); }}
              className="p-1.5 hover:text-emerald-vault text-vault-dim rounded-md hover:bg-white/5"
            >
              <Eye size={14} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(doc.id); }}
              className="p-1.5 hover:text-red-500 text-vault-dim rounded-md hover:bg-red-500/10"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      {isActive && (
        <div className={`absolute left-0 top-3 bottom-3 w-1 bg-emerald-vault rounded-full shadow-emerald-glow transition-all duration-500 ${isCollapsed && window.innerWidth >= 768 ? '-left-0.5' : 'left-0'}`} />
      )}
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ 
  documents, 
  activeId, 
  onSelect, 
  onCreate, 
  onDelete,
  onRename,
  onOpenConfig,
  onOpenTags,
  isOpen,
  onClose,
  installPrompt
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside 
      className={`
        bg-obsidian border-r border-vault-border flex flex-col shrink-0 transition-all duration-300 ease-in-out z-[10001]
        fixed md:static inset-y-0 left-0 h-full shadow-2xl md:shadow-none pointer-events-auto
        overflow-y-auto overflow-x-hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${isCollapsed ? 'md:w-16 w-64' : 'w-72'}
      `}
    >
      <div className={`flex items-center justify-between transition-all duration-300 ${isCollapsed ? 'p-4' : 'p-6 md:p-8'}`}>
        {!isCollapsed && (
          <div className="flex flex-col">
            <span className="font-extrabold text-white tracking-[-0.05em] text-lg uppercase leading-none">AegisVault</span>
            <span className="text-[8px] font-mono text-emerald-vault/50 uppercase tracking-[0.2em] mt-1">Sovereign Shard</span>
          </div>
        )}
        
        <button 
          onClick={onClose}
          className="md:hidden w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-vault-dim hover:text-white transition-all bg-white/10 active:scale-90"
        >
          <X size={24} />
        </button>

        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`hidden md:flex w-8 h-8 rounded-full border border-white/10 items-center justify-center text-vault-dim hover:text-emerald-vault transition-all bg-white/5 ${isCollapsed ? 'mx-auto' : ''} active:scale-90`}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      <div className="px-5 mb-4">
        <button 
          onClick={onCreate}
          className={`w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-emerald-vault hover:bg-emerald-vault/90 text-black transition-all group overflow-hidden active:scale-[0.98] shadow-lg shadow-emerald-vault/10 ${isCollapsed ? 'px-0' : 'px-4'}`}
        >
          <Plus size={18} strokeWidth={3} className="shrink-0" />
          {(!isCollapsed || window.innerWidth < 768) && <span className="text-[11px] font-black uppercase tracking-[0.2em]">Provision</span>}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-2 no-scrollbar pb-10">
        {documents.map((doc) => (
          <RegistryItem 
            key={doc.id}
            doc={doc}
            isActive={activeId === doc.id}
            isCollapsed={isCollapsed}
            onSelect={onSelect}
            onRename={onRename}
            onDelete={onDelete}
          />
        ))}
      </div>

      <div className={`p-6 border-t border-vault-border space-y-4 ${isCollapsed && window.innerWidth >= 768 ? 'items-center flex flex-col' : ''}`}>
        <SidebarStaticItem icon={<Hash size={18} />} label="Tag Registry" isCollapsed={isCollapsed} onClick={onOpenTags} />
        <SidebarStaticItem icon={<Settings size={18} />} label="System Config" isCollapsed={isCollapsed} onClick={onOpenConfig} />
      </div>
    </aside>
  );
};

const SidebarStaticItem = ({ icon, label, isCollapsed, onClick }: { icon: any, label: string, isCollapsed: boolean, onClick: () => void }) => (
  <button 
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    className={`
      flex items-center gap-4 transition-all group relative active:scale-95
      ${isCollapsed && window.innerWidth >= 768 ? 'justify-center w-full p-2 text-vault-dim hover:text-emerald-vault' : 'w-full px-4 py-2 text-vault-dim/60 hover:text-vault-text hover:bg-white/[0.04] rounded-lg'}
    `}
  >
    <div className="group-hover:text-emerald-vault transition-colors">{icon}</div>
    {(!isCollapsed || window.innerWidth < 768) && <span className="text-[10px] font-black tracking-[0.3em] uppercase">{label}</span>}
  </button>
);