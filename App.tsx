
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { Sidebar } from './components/Sidebar';
import { Toolbar } from './components/Toolbar';
import { MobileActionBar } from './components/MobileActionBar';
import { ExportModal } from './components/modals/ExportModal';
import { ConfigModal } from './components/modals/ConfigModal';
import { TagsModal } from './components/modals/TagsModal';
import { InstallPrompt } from './components/InstallPrompt';
import { VaultConverter } from './services/exportService';
import { StorageService } from './services/storageService';
// Consolidating to lowercase filename to avoid filesystem casing conflicts in the build environment
import { VaultRefiner } from './services/vaultRefiner';
import { SovereignDocument, VaultFont } from './types';
import { Check, Shield, Loader2, FileText } from 'lucide-react';
import { usePWAInstall } from './hooks/usePWAInstall';

type ModalType = 'export' | 'config' | 'tags' | null;

export default function App() {
  const [documents, setDocuments] = useState<SovereignDocument[]>([]);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [pendingFormat, setPendingFormat] = useState<'pdf' | 'docx' | null>(null);
  const [suggestedName, setSuggestedName] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  
  const [activeFont, setActiveFont] = useState<VaultFont>('sans');

  useEffect(() => {
    document.body.setAttribute('data-font-mode', activeFont);
  }, [activeFont]);
  
  const { isInstallable, install } = usePWAInstall();

  const isMounted = useRef(true);
  useEffect(() => {
    return () => { isMounted.current = false; };
  }, []);

  const activeDoc = documents.find(d => d.id === activeDocId);
  const saveTimeoutRef = useRef<number | null>(null);

  const refreshDocuments = async () => {
    const allDocs = await StorageService.getAllDocuments();
    if (isMounted.current) setDocuments(allDocs);
    return allDocs;
  };

  useEffect(() => {
    const initVault = async () => {
      const allDocs = await refreshDocuments();
      if (allDocs.length === 0) {
        const firstDoc = await StorageService.createNewDocument();
        firstDoc.content = `# Welcome to AegisVault\n\n**Sovereign Architecture** meets **Executive Typography**.\n\n### Commands\n- **Harden**: Standardizes typography.\n- **Export**: Generates binary assets.\n- **Beam**: Shares archive entries.`;
        await StorageService.saveDocument(firstDoc);
        if (isMounted.current) {
          setDocuments([firstDoc]);
          setActiveDocId(firstDoc.id);
        }
      } else if (!activeDocId && allDocs.length > 0) {
        if (isMounted.current) setActiveDocId(allDocs[0].id);
      }
    };
    initVault();
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => { if (isMounted.current) setNotification(null); }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const persistChanges = useCallback(async (doc: SovereignDocument) => {
    if (isMounted.current) setIsSaving(true);
    try {
      const wordCount = doc.content.split(/\s+/).filter(x => x).length;
      const updatedDoc = {
        ...doc,
        lastModified: Date.now(),
        metadata: {
          ...doc.metadata,
          wordCount,
          estimatedReadTime: Math.max(1, Math.ceil(wordCount / 200))
        }
      };
      await StorageService.saveDocument(updatedDoc);
      if (isMounted.current) {
        setDocuments(prev => {
          const others = prev.filter(d => d.id !== updatedDoc.id);
          return [updatedDoc, ...others].sort((a, b) => b.lastModified - a.lastModified);
        });
      }
    } finally {
      setTimeout(() => { if (isMounted.current) setIsSaving(false); }, 400);
    }
  }, []);

  const handleContentChange = (content: string) => {
    if (!activeDoc) return;
    const updated = { ...activeDoc, content };
    setDocuments(prev => prev.map(d => d.id === activeDoc.id ? updated : d));
    if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = window.setTimeout(() => persistChanges(updated), 800);
  };

  const handleLocalRefine = () => {
    if (!activeDoc) return;
    const refined = VaultRefiner.refine(activeDoc.content);
    handleContentChange(refined);
    if ('vibrate' in navigator) navigator.vibrate(15);
    setNotification({ message: 'Structural hardening complete', type: 'success' });
  };

  const handleCreateNew = async () => {
    const newDoc = await StorageService.createNewDocument();
    setDocuments(prev => [newDoc, ...prev]);
    setActiveDocId(newDoc.id);
    setIsSidebarOpen(false);
    setMobileTab('editor');
  };

  const handleDelete = async (id: string) => {
    await StorageService.deleteDocument(id);
    const updatedDocs = documents.filter(d => d.id !== id);
    setDocuments(updatedDocs);
    if (activeDocId === id) setActiveDocId(updatedDocs[0]?.id || null);
  };

  const handleRename = (id: string, newTitle: string) => {
    const doc = documents.find(d => d.id === id);
    if (!doc) return;
    const updated = { ...doc, title: newTitle };
    setDocuments(prev => prev.map(d => d.id === id ? updated : d));
    if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = window.setTimeout(() => persistChanges(updated), 800);
  };

  const handleShare = async () => {
    if (!activeDoc) return;
    const shareData = { title: activeDoc.title, text: activeDoc.content };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        if (isMounted.current) setNotification({ message: 'Beam successful', type: 'success' });
      } else {
        await navigator.clipboard.writeText(activeDoc.content);
        if (isMounted.current) setNotification({ message: 'Copied to clipboard', type: 'success' });
      }
    } catch (err) {
      if (isMounted.current) setNotification({ message: 'Beam failed', type: 'error' });
    }
  };

  const handleExport = async (name: string) => {
    if (!activeDoc || !pendingFormat) return;
    setIsExporting(true);
    setActiveModal(null);
    try {
      if (pendingFormat === 'pdf') {
        await VaultConverter.toPDF('preview-area', name + '.pdf', activeFont);
      } else {
        await VaultConverter.toDocx(activeDoc.content, name + '.docx');
      }
      if (isMounted.current) setNotification({ message: 'Export sequence complete', type: 'success' });
    } catch (e) {
      if (isMounted.current) setNotification({ message: 'Export failed', type: 'error' });
    } finally {
      if (isMounted.current) {
        setIsExporting(false);
        setPendingFormat(null);
      }
    }
  };

  return (
    <div className="flex h-screen bg-obsidian text-vault-text overflow-hidden selection:bg-emerald-vault/30">
      <Sidebar 
        documents={documents}
        activeId={activeDocId}
        onSelect={(id) => { setActiveDocId(id); setIsSidebarOpen(false); }}
        onCreate={handleCreateNew}
        onDelete={handleDelete}
        onRename={handleRename}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenConfig={() => setActiveModal('config')}
        onOpenTags={() => setActiveModal('tags')}
        installPrompt={{ isInstallable, install }}
      />

      <main className="flex-1 flex flex-col relative overflow-hidden transition-all duration-300">
        <Toolbar 
          markdown={activeDoc?.content || ''}
          isExporting={isExporting}
          isSaving={isSaving}
          onExport={(format) => {
             setPendingFormat(format);
             setSuggestedName(activeDoc?.title || "vault-export");
             setActiveModal('export');
          }}
          onShare={handleShare}
          onLocalRefine={handleLocalRefine}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenTags={() => setActiveModal('tags')}
          onOpenConfig={() => setActiveModal('config')}
        />

        <div className="flex-1 flex overflow-hidden relative">
          {activeDoc ? (
            <>
              <div className={`flex-1 flex flex-col h-full overflow-hidden ${mobileTab === 'preview' ? 'hidden md:flex' : 'flex'}`}>
                <Editor font={activeFont} value={activeDoc.content} onChange={handleContentChange} />
              </div>
              <div className="hidden md:block w-px bg-vault-border z-10" />
              <div className={`flex-1 flex flex-col h-full overflow-hidden bg-obsidian-soft no-scrollbar ${mobileTab === 'editor' ? 'hidden md:flex' : 'flex'}`}>
                <Preview font={activeFont} content={activeDoc.content} />
              </div>
            </>
          ) : (
             <div className="flex-1 flex items-center justify-center text-vault-dim opacity-50 uppercase tracking-widest text-xs font-bold">
               No Active Shard
             </div>
          )}
        </div>

        <MobileActionBar 
          isExporting={isExporting}
          onExport={(format) => {
             setPendingFormat(format);
             setSuggestedName(activeDoc?.title || "vault-export");
             setActiveModal('export');
          }}
          onLocalRefine={handleLocalRefine}
        />
        
        <div className="md:hidden fixed bottom-24 right-6 z-[120]">
           <button 
             onClick={() => setMobileTab(prev => prev === 'editor' ? 'preview' : 'editor')}
             className="w-12 h-12 rounded-full bg-emerald-vault text-black flex items-center justify-center shadow-lg shadow-emerald-vault/30 active:scale-90 transition-transform"
           >
             {mobileTab === 'editor' ? <Check size={20} /> : <FileText size={20} />}
           </button>
        </div>

        <div className={`fixed top-20 right-6 z-[250] transition-all duration-500 transform ${notification ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0 pointer-events-none'}`}>
          {notification && (
            <div className={`flex items-center gap-3 px-5 py-3 rounded-xl border backdrop-blur-md shadow-2xl ${
              notification.type === 'success' ? 'bg-emerald-vault/10 border-emerald-vault/30 text-emerald-vault' : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
              {notification.type === 'success' ? <Check size={16} /> : <Shield size={16} />}
              <span className="text-xs font-bold uppercase tracking-wider">{notification.message}</span>
            </div>
          )}
        </div>

        {isExporting && (
          <div className="fixed inset-0 z-[600] bg-obsidian/90 backdrop-blur-md flex flex-col items-center justify-center pointer-events-auto cursor-wait">
             <div className="p-10 rounded-3xl bg-obsidian-soft border border-emerald-vault/20 shadow-sovereign flex flex-col items-center gap-6 animate-in zoom-in-95 duration-300">
                <div className="relative">
                   <div className="w-16 h-16 rounded-full border-4 border-emerald-vault/10 border-t-emerald-vault animate-spin" />
                   <div className="absolute inset-0 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-emerald-vault animate-pulse" />
                   </div>
                </div>
                <div className="text-center space-y-2">
                   <h3 className="text-white font-black uppercase tracking-[0.4em] text-xs">Architectural Sharding</h3>
                   <p className="text-vault-dim text-[10px] font-mono uppercase tracking-widest opacity-60">Rendering Multi-page Binary Assets</p>
                </div>
             </div>
          </div>
        )}
      </main>

      <InstallPrompt />

      <ExportModal 
        initialName={suggestedName}
        format={pendingFormat}
        onConfirm={handleExport}
        onCancel={() => { setActiveModal(null); setPendingFormat(null); }}
      />
      <ConfigModal 
        isOpen={activeModal === 'config'} 
        onClose={() => setActiveModal(null)} 
        docCount={documents.length}
        activeFont={activeFont}
        setActiveFont={setActiveFont}
      />
      <TagsModal isOpen={activeModal === 'tags'} onClose={() => setActiveModal(null)} documents={documents} />
    </div>
  );
}
