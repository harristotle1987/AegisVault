import React, { useEffect } from 'react';
import { X, Hash, Info } from 'lucide-react';
import { SovereignDocument } from '../../types';

interface TagsModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: SovereignDocument[];
}

export const TagsModal: React.FC<TagsModalProps> = ({ isOpen, onClose, documents }) => {
  // Prevent background scrolling
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const allTags = documents.reduce((acc, doc) => {
    doc.metadata.tags.forEach(t => {
      acc[t] = (acc[t] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const sortedTags = Object.entries(allTags).sort((a, b) => (b[1] as number) - (a[1] as number));

  return (
    <>
      {/* Hardened Backdrop with Interaction Lock Fix */}
      <div 
        className={`fixed inset-0 z-[190] bg-obsidian/60 backdrop-blur-md transition-all duration-500 ease-in-out
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none invisible'}`}
        onClick={onClose}
      />

      <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-all duration-500 ease-in-out pointer-events-none
        ${isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95 invisible'}`}>
        
        <div className="w-full max-w-lg bg-obsidian-soft border border-vault-border rounded-2xl shadow-sovereign overflow-hidden pointer-events-auto">
          <div className="p-6 flex items-center justify-between border-b border-vault-border bg-white/[0.01]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-vault/10 flex items-center justify-center border border-emerald-vault/20">
                <Hash className="w-5 h-5 text-emerald-vault" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-black tracking-[0.4em] uppercase text-vault-dim">Tag Registry</span>
                <span className="text-[9px] font-mono text-emerald-vault/40 uppercase tracking-widest">Shard.Index: Local</span>
              </div>
            </div>
            <button onClick={onClose} className="text-vault-dim hover:text-white transition-all p-2 hover:bg-white/5 rounded-full">
              <X size={20} />
            </button>
          </div>

          <div className="p-8 min-h-[300px] overflow-y-auto max-h-[60vh] no-scrollbar">
            {sortedTags.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                 {sortedTags.map(([tag, count]) => (
                   <div key={tag} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-vault-border rounded-lg hover:bg-white/10 transition-colors group cursor-pointer active:scale-95">
                      <span className="text-emerald-vault font-mono text-xs">#</span>
                      <span className="text-xs font-bold text-vault-text">{tag}</span>
                      <span className="text-[10px] text-vault-dim opacity-40 group-hover:opacity-100">{count}</span>
                   </div>
                 ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-12 gap-6 opacity-40">
                 <div className="relative">
                    <Hash size={48} className="text-vault-dim" strokeWidth={1} />
                    <div className="absolute inset-0 bg-emerald-vault/5 blur-3xl rounded-full" />
                 </div>
                 <div className="text-center space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Registry Data</p>
                    <p className="text-[10px] font-medium leading-relaxed max-w-[200px] mx-auto text-vault-dim">Apply tags in document metadata to begin indexing your shards.</p>
                 </div>
              </div>
            )}
          </div>

          <div className="p-6 bg-white/[0.02] border-t border-vault-border flex items-start gap-4">
             <Info size={14} className="text-vault-dim shrink-0 mt-0.5" />
             <p className="text-[10px] text-vault-dim leading-relaxed italic">The Tag Registry allows for rapid thematic filtering across your local sovereign archive.</p>
          </div>
        </div>
      </div>
    </>
  );
};