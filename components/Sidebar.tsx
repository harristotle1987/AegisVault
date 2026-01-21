
import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Shield, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  X, 
  DownloadCloud, 
  Database,
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
  const [searchQuery, setSearchQuery] = useState('');

  const formatTimestamp = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const filteredDocs = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside 
      className={`
        bg-obsidian border-r border-vault-border flex flex-col shrink-0 transition-all duration-300 ease-in-out z-[110]
        fixed md:static inset-y-0 left-0 h-full shadow-2xl md:shadow-none pointer-events-auto
        overflow-y-auto overflow-x-hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${isCollapsed ? 'md:w-16 w-64' : 'w-72'}
      `}
    >
      {/* Navigator Header */}
      <div className={`flex items-center justify-between transition-all duration-300 ${isCollapsed ? 'p-4' : 'p-6 md:p-8'}`}>
        {(!isCollapsed || window.innerWidth < 768) && (
          <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
            <div className="w-8 h-8 bg-emerald-vault rounded flex items-center justify-center shadow-emerald-glow">
              <Shield className="w-5 h-5 text-black" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-white tracking-[-0.05em] text-lg uppercase leading-none">AegisVault</span>
              <span className="text-[8px] font-mono text-emerald-vault/50 uppercase tracking-[0.2em] mt-1">Sovereign Navigator</span>
            </div>
          </div>
        )}
        
        <button 
          onClick={onClose}
          className="md:hidden w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-vault-dim hover:text-white transition-all bg-white/5 active:scale-90"
        >
          <X size={18} />
        </button>

        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`hidden md:flex w-8 h-8 rounded-full border border-white/10 items-center justify-center text-vault-dim hover:text-emerald-vault transition-all bg-white/5 ${isCollapsed ? 'mx-auto' : ''} active:scale-90`}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Provision Action */}
      <div className="px-5 mb-4">
        <button 
          onClick={onCreate}
          className={`w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-emerald-vault hover:bg-emerald-vault/90 text-black transition-all group overflow-hidden active:scale-[0.98] shadow-lg shadow-emerald-vault/10 ${isCollapsed ? 'px-0' : 'px-4'}`}
          title="Provision New Shard"
        >
          <Plus size={18} strokeWidth={3} className="shrink-0" />
          {(!isCollapsed || window.innerWidth < 768) && <span className="text-[11px] font-black uppercase tracking-[0.2em]">Provision Entry</span>}
        </button>
      </div>

      {/* Registry Search */}
      {(!isCollapsed || window.innerWidth < 768) && (
        <div className="px-5 mb-6 animate-in fade-in slide-in-from-top-1 duration-500">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-vault-dim/40 group-focus-within:text-emerald-vault transition-colors" size={12} />
            <input 
              type="text"
              placeholder="Query Registry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-obsidian-muted border border-vault-border rounded-lg pl-9 pr-4 py-2 text-[10px] font-mono uppercase tracking-widest text-vault-text focus:outline-none focus:border-emerald-vault/30 transition-all placeholder:text-vault-dim/20"
            />
          </div>
        </div>
      )}

      {/* Draft Shards List */}
      <div className="flex-1 overflow-y-auto px-4 space-y-2 no-scrollbar pb-10">
        {(!isCollapsed || window.innerWidth < 768) && (
          <div className="px-4 py-2 mb-1 flex items-center justify-between border-b border-vault-border/50">
            <span className="text-[9px] uppercase tracking-[0.3em] text-vault-dim font-black text-white/40 uppercase tracking-widest">Vault Registry</span>
            <span className="text-[8px] font-mono text-vault-dim/30">{filteredDocs.length} Shards</span>
          </div>
        )}
        
        {filteredDocs.map((doc) => (
          <div 
            key={doc.id}
            onClick={() => onSelect(doc.id)}
            className={`group relative flex flex-col gap-1 rounded-xl cursor-pointer transition-all duration-300 border active:scale-[0.98] ${
              isCollapsed && window.innerWidth >= 768 ? 'p-3 items-center' : 'px-4 py-3'
            } ${
              activeId === doc.id 
                ? 'bg-obsidian-soft border-emerald-vault/40 text-white shadow-emerald-glow/5' 
                : 'border-transparent text-vault-dim hover:bg-white/[0.02] hover:text-vault-text'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              {isCollapsed && window.innerWidth >= 768 ? (
                <div className="w-6 h-6 flex items-center justify-center shrink-0">
                  <FileText size={16} className={activeId === doc.id ? 'text-emerald-vault' : ''} />
                </div>
              ) : (
                <div className="flex flex-col gap-1 w-full overflow-hidden">
                  <div className="flex items-center justify-between">
                    <input
                      className={`bg-transparent border-none focus:outline-none font-bold text-sm w-full cursor-pointer transition-colors ${activeId === doc.id ? 'text-emerald-vault' : 'text-vault-text'}`}
                      value={doc.title}
                      onChange={(e) => onRename(doc.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Untitled Shard"
                    />
                    {activeId === doc.id && (
                      <div className="px-1.5 py-0.5 rounded-sm bg-emerald-vault/10 border border-emerald-vault/20 text-[7px] font-black text-emerald-vault uppercase tracking-tighter shrink-0 animate-pulse">
                        Sovereign
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 opacity-30 group-hover:opacity-50 transition-opacity">
                    <div className="flex items-center gap-1 text-[8px] font-mono">
                      <Clock size={10} />
                      <span>{formatTimestamp(doc.lastModified)}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {(!isCollapsed || window.innerWidth < 768) && (
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onSelect(doc.id, 'view'); }}
                    className="p-1.5 hover:text-emerald-vault text-vault-dim rounded-md hover:bg-white/5"
                    title="View"
                  >
                    <Eye size={14} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onSelect(doc.id, 'edit'); }}
                    className="p-1.5 hover:text-emerald-vault text-vault-dim rounded-md hover:bg-white/5"
                    title="Edit"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(doc.id); }}
                    className="p-1.5 hover:text-red-500 text-vault-dim rounded-md hover:bg-red-500/10"
                    title="Purge Shard"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>

            {activeId === doc.id && (
              <div className={`absolute left-0 top-3 bottom-3 w-1 bg-emerald-vault rounded-full shadow-emerald-glow transition-all duration-500 ${isCollapsed && window.innerWidth >= 768 ? '-left-0.5' : 'left-0'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Navigator Footer Actions */}
      <div className={`p-6 border-t border-vault-border space-y-4 ${isCollapsed && window.innerWidth >= 768 ? 'items-center flex flex-col' : ''}`}>
        <SidebarStaticItem 
          icon={<Hash size={18} />} 
          label="Tag Registry" 
          isCollapsed={isCollapsed} 
          onClick={onOpenTags}
        />
        <SidebarStaticItem 
          icon={<Settings size={18} />} 
          label="System Config" 
          isCollapsed={isCollapsed} 
          onClick={onOpenConfig}
        />
        
        {installPrompt?.isInstallable && (
          <button 
            onClick={installPrompt.install}
            className={`flex items-center gap-4 transition-all group w-full active:scale-[0.98] ${isCollapsed && window.innerWidth >= 768 ? 'justify-center p-2' : 'px-4 py-3 border border-emerald-vault/30 text-emerald-vault rounded-xl hover:bg-emerald-vault/10 shadow-emerald-glow/10'}`}
            title="Sovereign Install"
          >
            <DownloadCloud size={18} />
            {(!isCollapsed || window.innerWidth < 768) && <span className="text-[10px] font-black tracking-[0.3em] uppercase">Sovereign Link</span>}
          </button>
        )}
      </div>
    </aside>
  );
};

const SidebarStaticItem = ({ icon, label, isCollapsed, onClick }: { icon: any, label: string, isCollapsed: boolean, onClick: () => void }) => (
  <button 
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    className={`
      flex items-center gap-4 transition-all group relative z-[120] active:scale-95
      ${isCollapsed && window.innerWidth >= 768 ? 'justify-center w-full p-2 text-vault-dim hover:text-emerald-vault' : 'w-full px-4 py-2 text-vault-dim/60 hover:text-vault-text hover:bg-white/[0.04] rounded-lg border border-transparent hover:border-vault-border'}
    `}
    title={label}
  >
    <div className="group-hover:text-emerald-vault transition-colors">{icon}</div>
    {(!isCollapsed || window.innerWidth < 768) && <span className="text-[10px] font-black tracking-[0.3em] uppercase">{label}</span>}
  </button>
);
