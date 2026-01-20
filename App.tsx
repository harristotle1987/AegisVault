
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { Sidebar } from './components/Sidebar';
import { Toolbar } from './components/Toolbar';
import { MobileActionBar } from './components/MobileActionBar';
import { ExportModal } from './components/modals/ExportModal';
import { ConfigModal } from './components/modals/ConfigModal';
import { TagsModal } from './components/modals/TagsModal';
import { VaultConverter } from './services/exportService';
import { StorageService } from './services/storageService';
// Fix: Use lowercase path to match the primary included file and avoid casing collision errors
import { VaultRefiner } from './services/vaultRefiner';
import { SovereignDocument } from './types';
import { Check, Shield, Cpu } from 'lucide-react';
import { usePWAInstall } from './hooks/usePWAInstall';

interface ExportTask {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'complete' | 'error';
}

type ModalType = 'export' | 'config' | 'tags' | null;

export default function App() {
  const [documents, setDocuments] = useState<SovereignDocument[]>([]);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportTasks, setExportTasks] = useState<ExportTask[]>([]);
  const [progress, setProgress] = useState(0);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [pendingFormat, setPendingFormat] = useState<'pdf' | 'docx' | null>(null);
  const [suggestedName, setSuggestedName] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const { isInstallable, install } = usePWAInstall();

  const activeDoc = documents.find(d => d.id === activeDocId);
  const saveTimeoutRef = useRef<number | null>(null);

  const refreshDocuments = async () => {
    const allDocs = await StorageService.getAllDocuments();
    setDocuments(allDocs);
    return allDocs;
  };

  useEffect(() => {
    const initVault = async () => {
      const allDocs = await refreshDocuments();
      if (allDocs.length === 0) {
        const firstDoc = await StorageService.createNewDocument();
        firstDoc.content = `# Welcome to AegisVault\n\n**Sovereign Architecture** meets **Executive Typography**.\n\n### Why AegisVault?\n1. **Local Sovereignty**: Your drafts never leave your browser RAM.\n2. **Binary Sharding**: Export high-fidelity PDFs and DOCX files.\n3. **Hardened Refinement**: Auto-cleanup of vertical rhythm and typography.\n\n--- \n\n### Commands\n- **Harden**: Standardizes typography and vertical rhythm.\n- **Export**: Generates binary assets from your markdown.\n- **Beam**: Shares your vault entry instantly via Native OS APIs.\n\n*Begin your first archive shard now...*`;
        await StorageService.saveDocument(firstDoc);
        setDocuments([firstDoc]);
        setActiveDocId(firstDoc.id);
      } else if (!activeDocId) {
        setActiveDocId(allDocs[0].id);
      }
    };
    initVault();
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const persistChanges = useCallback(async (doc: SovereignDocument) => {
    setIsSaving(true);
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
      setDocuments(prev => {
        const others = prev.filter(d => d.id !== updatedDoc.id);
        return [updatedDoc, ...others].sort((a, b) => b.lastModified - a.lastModified);
      });
    } finally {
      setTimeout(() => setIsSaving(false), 400);
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
  };

  const handleDelete = async (id: string) => {
    await StorageService.deleteDocument(id);
    const updatedDocs = documents.filter(d => d.id !== id);
    setDocuments(updatedDocs);
    if (activeDocId === id) setActiveDocId(updatedDocs[0]?.id || null);
    if ('vibrate' in navigator) navigator.vibrate([10, 50, 10]);
    setNotification({ message: 'Archive purged successfully', type: 'success' });
  };

  const handleRenameDraft = (id: string, name: string) => {
    const doc = documents.find(d => d.id === id);
    if (!doc) return;
    const updated = { ...doc, title: name };
    persistChanges(updated);
  };

  const handleSelectDoc = (id: string) => {
    setActiveDocId(id);
    setIsSidebarOpen(false);
  };

  const onExportClick = (format: 'pdf' | 'docx') => {
    if (!activeDoc) return;
    const suggestion = VaultRefiner.suggestFilename(activeDoc.content);
    setSuggestedName(suggestion);
    setPendingFormat(format);
    setActiveModal('export');
  };

  const handleShare = async () => {
    if (!activeDoc) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: activeDoc.title,
          text: activeDoc.content,
          url: window.location.href,
        });
        if ('vibrate' in navigator) navigator.vibrate(20);
      } catch (err) {
        console.error("Beam aborted", err);
      }
    } else {
      setNotification({ message: "Sharing not supported", type: 'error' });
    }
  };

  const updateTaskStatus = (id: string, status: ExportTask['status']) => {
    setExportTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  const startExportSequence = async (customName: string) => {
    if (!activeDoc || !pendingFormat) return;
    const currentFormat = pendingFormat;
    setActiveModal(null);
    setPendingFormat(null);
    setIsExporting(true);
    setProgress(0);
    
    const tasks: ExportTask[] = [
      { id: 'refine', label: 'Structural Refinement', status: 'pending' },
      { id: 'render', label: 'High-Fidelity Rendering', status: 'pending' },
      { id: 'binary', label: 'Binary Shard Encoding', status: 'pending' }
    ];
    setExportTasks(tasks);

    try {
      updateTaskStatus('refine', 'active');
      setProgress(20);
      await new Promise(r => setTimeout(r, 400));
      const refined = VaultRefiner.refine(activeDoc.content);
      updateTaskStatus('refine', 'complete');

      updateTaskStatus('render', 'active');
      setProgress(60);
      await new Promise(r => setTimeout(r, 600));
      updateTaskStatus('render', 'complete');

      updateTaskStatus('binary', 'active');
      setProgress(90);
      const fileName = (customName || suggestedName).replace(/[^a-z0-9 _-]/gi, '').trim().replace(/\s+/g, '_').toLowerCase();
      
      if (currentFormat === 'pdf') {
        await VaultConverter.toPDF('preview-area', `${fileName}.pdf`);
      } else {
        await VaultConverter.toDocx(refined, `${fileName}.docx`);
      }
      
      updateTaskStatus('binary', 'complete');
      setProgress(100);
      if ('vibrate' in navigator) navigator.vibrate(30);
      await new Promise(r => setTimeout(r, 400));
      setNotification({ message: 'Binary asset exported', type: 'success' });
    } catch (err) {
      setExportTasks(prev => prev.map(t => t.status === 'active' ? { ...t, status: 'error' } : t));
      setNotification({ message: 'Export pipeline failure', type: 'error' });
    } finally {
      setTimeout(() => setIsExporting(false), 500);
    }
  };

  return (
    <div className="flex h-screen w-full bg-obsidian text-vault-text overflow-hidden font-sans selection:bg-emerald-vault/30">
      <Sidebar 
        documents={documents} 
        activeId={activeDocId} 
        onSelect={handleSelectDoc} 
        onCreate={handleCreateNew}
        onDelete={handleDelete}
        onRename={handleRenameDraft}
        onOpenConfig={() => setActiveModal('config')}
        onOpenTags={() => setActiveModal('tags')}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        installPrompt={{ isInstallable, install }}
      />

      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-[65] md:hidden animate-in fade-in duration-300 pointer-events-auto"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className="flex flex-1 flex-col overflow-hidden min-w-0 relative">
        <Toolbar 
          markdown={activeDoc?.content || ''}
          isExporting={isExporting}
          isSaving={isSaving}
          onExport={onExportClick}
          onShare={handleShare}
          onLocalRefine={handleLocalRefine}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <div className="flex-1 overflow-hidden relative flex flex-col md:flex-row pb-20 md:pb-0">
          <section className="flex-1 md:w-1/2 border-b md:border-b-0 md:border-r border-vault-border flex flex-col min-w-0 bg-obsidian overflow-hidden transition-all duration-300">
            {activeDoc ? (
              <Editor key={activeDoc.id} value={activeDoc.content} onChange={handleContentChange} />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-vault-dim/10 gap-6">
                <div className="relative">
                  <Shield size={64} strokeWidth={0.5} className="animate-pulse" />
                  <div className="absolute inset-0 bg-emerald-vault/5 blur-3xl rounded-full" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.6em] italic opacity-40">Vault Standby</span>
              </div>
            )}
          </section>

          <section className="flex-1 md:w-1/2 bg-obsidian-soft flex flex-col min-w-0 overflow-hidden">
            <Preview content={activeDoc?.content || ''} />
          </section>
        </div>
      </main>

      <MobileActionBar 
        isExporting={isExporting} 
        onExport={onExportClick} 
        onLocalRefine={handleLocalRefine} 
      />

      <ExportModal 
        format={pendingFormat}
        initialName={suggestedName}
        onCancel={() => setActiveModal(null)}
        onConfirm={startExportSequence}
      />

      <ConfigModal 
        isOpen={activeModal === 'config'} 
        onClose={() => setActiveModal(null)}
        docCount={documents.length}
      />

      <TagsModal
        isOpen={activeModal === 'tags'}
        onClose={() => setActiveModal(null)}
        documents={documents}
      />

      {isExporting && (
        <div className="fixed inset-0 bg-obsidian/95 backdrop-blur-3xl z-[200] flex flex-col items-center justify-center animate-in fade-in duration-500">
          <div className="w-full max-w-sm space-y-12 px-8">
            <div className="flex flex-col items-center gap-8">
               <div className="relative w-24 h-24 border border-white/5 rounded-[2rem] bg-obsidian-soft flex items-center justify-center shadow-sovereign overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-vault/10 to-transparent" />
                  <Shield className="w-10 h-10 text-emerald-vault animate-pulse relative z-10" />
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-3 text-vault-dim/60">
                    <Cpu size={12} className="animate-spin duration-[4000ms]" />
                    <span className="text-[10px] font-mono uppercase tracking-[0.3em]">Executing Shard Encoding</span>
                  </div>
                </div>
            </div>
            
            <div className="space-y-4">
                <div className="h-[2px] w-full bg-white/[0.05] relative overflow-hidden rounded-full">
                  <div 
                    className="h-full bg-emerald-vault shadow-[0_0_20px_rgba(16,185,129,0.8)] transition-all duration-500 ease-out" 
                    style={{ width: `${progress}%` }} 
                  />
                </div>
                <div className="flex justify-between text-[8px] font-mono text-vault-dim/40 uppercase tracking-widest">
                  <span>Binary.Shard.Gen</span>
                  <span>{progress}%</span>
                </div>
            </div>
          </div>
        </div>
      )}

      {notification && (
        <div className="fixed bottom-28 md:bottom-10 left-1/2 -translate-x-1/2 px-6 py-3.5 rounded-2xl border border-white/10 bg-obsidian-soft/90 flex items-center gap-4 shadow-sovereign z-[250] animate-in fade-in slide-in-from-bottom-6 backdrop-blur-2xl pointer-events-none">
          <div className="w-6 h-6 rounded-full bg-emerald-vault/10 flex items-center justify-center">
            <Check className="w-3.5 h-3.5 text-emerald-vault" strokeWidth={3} />
          </div>
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-vault-text">
            {notification.message}
          </span>
        </div>
      )}
    </div>
  );
}
