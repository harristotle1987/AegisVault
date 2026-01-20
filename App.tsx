
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { Sidebar } from './components/Sidebar';
import { Toolbar } from './components/Toolbar';
import { MobileActionBar } from './components/MobileActionBar';
import { ExportModal } from './components/modals/ExportModal';
import { VaultConverter } from './services/exportService';
import { StorageService } from './services/storageService';
// Logic consolidated in services/vaultRefiner.ts to resolve casing collision errors
import { VaultRefiner } from './services/vaultRefiner';
import { SovereignDocument } from './types';
import { Check, AlertCircle, Shield, Terminal, Database, Activity, Cpu, Layers, HardDrive } from 'lucide-react';
import { usePWAInstall } from './hooks/usePWAInstall';

interface ExportTask {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'complete' | 'error';
}

export default function App() {
  const [documents, setDocuments] = useState<SovereignDocument[]>([]);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportTasks, setExportTasks] = useState<ExportTask[]>([]);
  const [progress, setProgress] = useState(0);
  const [pendingFormat, setPendingFormat] = useState<'pdf' | 'docx' | null>(null);
  const [suggestedName, setSuggestedName] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const { isInstallable, install } = usePWAInstall();

  const activeDoc = documents.find(d => d.id === activeDocId);
  const saveTimeoutRef = useRef<number | null>(null);

  // Initialize Vault from IndexedDB with strict descending order
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
      // Synchronize state without triggering full re-render of list if possible, but keep list sorted
      setDocuments(prev => {
        const others = prev.filter(d => d.id !== updatedDoc.id);
        return [updatedDoc, ...others].sort((a, b) => b.lastModified - a.lastModified);
      });
    } finally {
      setTimeout(() => setIsSaving(false), 600);
    }
  }, []);

  const handleContentChange = (content: string) => {
    if (!activeDoc) return;
    const updated = { ...activeDoc, content };
    // Optimistic local state update for zero-latency typing
    setDocuments(prev => prev.map(d => d.id === activeDoc.id ? updated : d));
    
    if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = window.setTimeout(() => persistChanges(updated), 800);
  };

  const handleLocalRefine = () => {
    if (!activeDoc) return;
    const refined = VaultRefiner.refine(activeDoc.content);
    handleContentChange(refined);
    setNotification({ message: 'Structural hardening complete', type: 'success' });
  };

  const handleCreateNew = async () => {
    const newDoc = await StorageService.createNewDocument();
    setDocuments(prev => [newDoc, ...prev]);
    setActiveDocId(newDoc.id);
    setIsSidebarOpen(false); // Close sidebar on mobile
  };

  const handleDelete = async (id: string) => {
    await StorageService.deleteDocument(id);
    const updatedDocs = documents.filter(d => d.id !== id);
    setDocuments(updatedDocs);
    if (activeDocId === id) setActiveDocId(updatedDocs[0]?.id || null);
    setNotification({ message: 'Archive purged successfully', type: 'success' });
  };

  const handleRenameDraft = (id: string, newTitle: string) => {
    const doc = documents.find(d => d.id === id);
    if (!doc) return;
    const updated = { ...doc, title: newTitle, lastModified: Date.now() };
    setDocuments(prev => prev.map(d => d.id === id ? updated : d).sort((a, b) => b.lastModified - a.lastModified));
    StorageService.saveDocument(updated);
  };

  const handleSelectDoc = (id: string) => {
    setActiveDocId(id);
    setIsSidebarOpen(false); // Close sidebar on mobile select
  };

  const onExportClick = (format: 'pdf' | 'docx') => {
    if (!activeDoc) return;
    const suggestion = VaultRefiner.suggestFilename(activeDoc.content);
    setSuggestedName(suggestion);
    setPendingFormat(format);
  };

  const updateTaskStatus = (id: string, status: ExportTask['status']) => {
    setExportTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  const startExportSequence = async (customName: string) => {
    if (!activeDoc || !pendingFormat) return;
    const currentFormat = pendingFormat;
    setPendingFormat(null);
    setIsExporting(true);
    setProgress(0);
    
    const tasks: ExportTask[] = [
      { id: 'refine', label: 'Structural Refinement', status: 'pending' },
      { id: 'hydrate', label: 'VFS Font Hydration', status: 'pending' },
      { id: 'render', label: 'High-Fidelity Rendering', status: 'pending' },
      { id: 'binary', label: 'Binary Shard Encoding', status: 'pending' }
    ];
    setExportTasks(tasks);

    try {
      // 1. Refinement
      updateTaskStatus('refine', 'active');
      setProgress(15);
      await new Promise(r => setTimeout(r, 400));
      const refined = VaultRefiner.refine(activeDoc.content);
      updateTaskStatus('refine', 'complete');

      // 2. Hydration
      updateTaskStatus('hydrate', 'active');
      setProgress(40);
      await new Promise(r => setTimeout(r, 300));
      updateTaskStatus('hydrate', 'complete');

      // 3. Rendering
      updateTaskStatus('render', 'active');
      setProgress(65);
      await new Promise(r => setTimeout(r, 600));
      updateTaskStatus('render', 'complete');

      // 4. Binary Encoding
      updateTaskStatus('binary', 'active');
      setProgress(85);
      const fileName = (customName || suggestedName).replace(/[^a-z0-9 _-]/gi, '').trim().replace(/\s+/g, '_').toLowerCase();
      
      if (currentFormat === 'pdf') {
        await VaultConverter.toPDF('preview-area', `${fileName}.pdf`);
      } else {
        await VaultConverter.toDocx(refined, `${fileName}.docx`);
      }
      
      updateTaskStatus('binary', 'complete');
      setProgress(100);
      await new Promise(r => setTimeout(r, 400));
      setNotification({ message: 'Binary asset exported', type: 'success' });
    } catch (err) {
      console.error(err);
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
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        installPrompt={{ isInstallable, install }}
      />

      {/* Mobile Overlay for Sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className="flex flex-1 flex-col overflow-hidden min-w-0 relative">
        <Toolbar 
          markdown={activeDoc?.content || ''}
          isExporting={isExporting}
          isSaving={isSaving}
          onExport={onExportClick}
          onLocalRefine={handleLocalRefine}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <div className="flex-1 overflow-hidden relative flex flex-col md:flex-row pb-20 md:pb-0">
          <section className="flex-1 md:w-1/2 vanish-border border-b md:border-b-0 md:border-r border-vault-border flex flex-col min-w-0 bg-obsidian overflow-hidden">
            {activeDoc ? (
              <Editor key={activeDoc.id} value={activeDoc.content} onChange={handleContentChange} />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-vault-dim/20 gap-4 animate-in fade-in duration-1000">
                <Shield size={48} strokeWidth={0.5} />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] italic">Vault Standby</span>
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
        onCancel={() => setPendingFormat(null)}
        onConfirm={startExportSequence}
      />

      {isExporting && (
        <div className="fixed inset-0 bg-obsidian/98 backdrop-blur-3xl z-[200] flex flex-col items-center justify-center animate-in fade-in duration-500">
          <div className="w-full max-w-lg space-y-12 px-8">
            {/* Loading UI */}
            <div className="flex flex-col items-center gap-8">
               <div className="relative w-32 h-32 border border-white/10 rounded-[2rem] bg-obsidian-soft flex items-center justify-center shadow-sovereign overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-vault/5 to-transparent opacity-50" />
                  <Shield className="w-14 h-14 text-emerald-vault animate-pulse relative z-10" />
                </div>
                <div className="flex items-center gap-3 text-vault-dim/60">
                  <Cpu size={14} className="animate-spin duration-[4000ms]" />
                  <span className="text-[10px] font-mono uppercase tracking-[0.3em]">Executing Shard Encoding</span>
                </div>
            </div>
            {/* Progress bar */}
            <div className="space-y-4">
                <div className="h-[2px] w-full bg-white/[0.05] relative overflow-hidden rounded-full">
                  <div 
                    className="h-full bg-emerald-vault shadow-[0_0_20px_rgba(16,185,129,1)] transition-all duration-500 ease-out" 
                    style={{ width: `${progress}%` }} 
                  />
                </div>
            </div>
          </div>
        </div>
      )}

      {notification && (
        <div className="fixed bottom-24 md:bottom-8 right-8 px-6 py-4 rounded-lg border border-white/10 bg-obsidian-soft flex items-center gap-4 shadow-sovereign z-[250] animate-in fade-in slide-in-from-bottom-4 backdrop-blur-md">
          <Check className="w-4 h-4 text-emerald-vault" />
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-vault-text">
            {notification.message}
          </span>
        </div>
      )}
    </div>
  );
}
