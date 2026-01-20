
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { Sidebar } from './components/Sidebar';
import { Toolbar } from './components/Toolbar';
import { ExportModal } from './components/modals/ExportModal';
import { VaultConverter } from './services/exportService';
import { StorageService } from './services/storageService';
import { VaultRefiner } from './services/VaultRefiner';
import { SovereignDocument } from './types';
import { Check, AlertCircle, Shield, Terminal, Database, Activity } from 'lucide-react';

export default function App() {
  const [documents, setDocuments] = useState<SovereignDocument[]>([]);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStage, setExportStage] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [pendingFormat, setPendingFormat] = useState<'pdf' | 'docx' | null>(null);
  const [suggestedName, setSuggestedName] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const activeDoc = documents.find(d => d.id === activeDocId);
  const saveTimeoutRef = useRef<number | null>(null);

  // Initialize Vault from IndexedDB
  useEffect(() => {
    const initVault = async () => {
      const allDocs = await StorageService.getAllDocuments();
      if (allDocs.length === 0) {
        const firstDoc = await StorageService.createNewDocument();
        setDocuments([firstDoc]);
        setActiveDocId(firstDoc.id);
      } else {
        setDocuments(allDocs);
        setActiveDocId(allDocs[0].id);
      }
    };
    initVault();
  }, []);

  // Notification auto-clear
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Persistent storage logic
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
          estimatedReadTime: Math.ceil(wordCount / 200)
        }
      };
      await StorageService.saveDocument(updatedDoc);
      // Batch state update for performance
      setDocuments(prev => prev.map(d => d.id === updatedDoc.id ? updatedDoc : d));
    } finally {
      // Mechanical delay for UI feedback
      setTimeout(() => setIsSaving(false), 800);
    }
  }, []);

  const handleContentChange = (content: string) => {
    if (!activeDoc) return;
    const updated = { ...activeDoc, content };
    setDocuments(prev => prev.map(d => d.id === activeDoc.id ? updated : d));
    if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = window.setTimeout(() => persistChanges(updated), 1000);
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
  };

  const handleDelete = async (id: string) => {
    await StorageService.deleteDocument(id);
    const updatedDocs = documents.filter(d => d.id !== id);
    setDocuments(updatedDocs);
    if (activeDocId === id) setActiveDocId(updatedDocs[0]?.id || null);
    setNotification({ message: 'Draft purged from local vault', type: 'success' });
  };

  const handleRenameDraft = (id: string, newTitle: string) => {
    const doc = documents.find(d => d.id === id);
    if (!doc) return;
    const updated = { ...doc, title: newTitle };
    setDocuments(prev => prev.map(d => d.id === id ? updated : d));
    // Persist title changes immediately
    StorageService.saveDocument(updated);
  };

  const onExportClick = (format: 'pdf' | 'docx') => {
    if (!activeDoc) return;
    const suggestion = VaultRefiner.suggestFilename(activeDoc.content);
    setSuggestedName(suggestion);
    setPendingFormat(format);
  };

  const startExportSequence = async (customName: string) => {
    if (!activeDoc || !pendingFormat) return;
    setPendingFormat(null);
    setIsExporting(true);
    setProgress(0);
    
    try {
      const logs = [
        { msg: '> INITIALIZING SOVEREIGN PIPELINE...', delay: 400, p: 10 },
        { msg: '> LOADED LOCAL REFINER ENGINE...', delay: 300, p: 25 },
        { msg: '> REFINING TYPOGRAPHY AND RHYTHM...', delay: 600, p: 45 },
        { msg: '> HARDENING DOCUMENT STRUCTURE...', delay: 500, p: 65 },
        { msg: '> HYDRATING VIRTUAL FONT SYSTEM...', delay: 600, p: 85 },
        { msg: '> GENERATING BINARY BLOB...', delay: 800, p: 95 }
      ];

      for (const log of logs) {
        setExportStage(log.msg);
        setProgress(log.p);
        await new Promise(r => setTimeout(r, log.delay));
      }

      const refined = VaultRefiner.refine(activeDoc.content);
      const fileName = (customName || suggestedName).replace(/[^a-z0-9 _-]/gi, '').trim().replace(/\s+/g, '_').toLowerCase();
      
      if (pendingFormat === 'pdf') {
        await VaultConverter.toPDF('preview-area', `${fileName}.pdf`);
      } else {
        await VaultConverter.toDocx(refined, `${fileName}.docx`);
      }
      
      setProgress(100);
      await new Promise(r => setTimeout(r, 400));
      setNotification({ message: `Sovereign vault archive secured`, type: 'success' });
    } catch (err) {
      console.error(err);
      setNotification({ message: 'Vault pipeline failure', type: 'error' });
    } finally {
      setIsExporting(false);
      setExportStage('');
      setProgress(0);
    }
  };

  return (
    <div className="flex h-screen w-full bg-obsidian text-vault-text overflow-hidden font-sans selection:bg-emerald-vault/30">
      <Sidebar 
        documents={documents} 
        activeId={activeDocId} 
        onSelect={(id) => {
          // Instant selection switch
          setActiveDocId(id);
        }} 
        onCreate={handleCreateNew}
        onDelete={handleDelete}
        onRename={handleRenameDraft}
      />

      <main className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Toolbar 
          markdown={activeDoc?.content || ''}
          isExporting={isExporting}
          isSaving={isSaving}
          onExport={onExportClick}
          onLocalRefine={handleLocalRefine}
        />

        <div className="flex flex-1 overflow-hidden relative">
          <section className="w-1/2 vanish-border border-r border-vault-border flex flex-col min-w-0 bg-obsidian">
            {activeDoc ? (
              <Editor value={activeDoc.content} onChange={handleContentChange} />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-vault-dim/20 gap-4 animate-in fade-in duration-1000">
                <Shield size={48} strokeWidth={0.5} />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] italic">Vault Standby</span>
              </div>
            )}
          </section>

          <section className="w-1/2 bg-obsidian-soft flex flex-col min-w-0">
            <Preview content={activeDoc?.content || ''} />
          </section>
        </div>
      </main>

      <ExportModal 
        format={pendingFormat}
        initialName={suggestedName}
        onCancel={() => setPendingFormat(null)}
        onConfirm={startExportSequence}
      />

      {isExporting && (
        <div className="fixed inset-0 bg-obsidian/98 backdrop-blur-3xl z-[200] flex flex-col items-center justify-center animate-in fade-in duration-700">
          <div className="w-full max-w-md space-y-10 px-8">
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-vault/10 blur-[80px] rounded-full scale-[2.5]" />
                <div className="relative w-28 h-28 border border-white/10 rounded-3xl bg-obsidian-soft flex items-center justify-center shadow-sovereign">
                  <Shield className="w-12 h-12 text-emerald-vault animate-pulse" />
                </div>
              </div>
              <div className="flex flex-col items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-[0.6em] text-emerald-vault/80">Vault Hardening Protocol</span>
                <div className="flex items-center gap-2 text-vault-dim">
                  <Activity size={12} className="text-emerald-vault/40" />
                  <span className="text-[9px] font-mono uppercase tracking-[0.2em]">Local Computation Node Active</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="h-[2px] w-full bg-white/[0.03] relative overflow-hidden rounded-full">
                <div 
                  className="h-full bg-emerald-vault shadow-[0_0_20px_rgba(16,185,129,0.9)] transition-all duration-1000 ease-in-out" 
                  style={{ width: `${progress}%` }} 
                />
              </div>
              
              <div className="flex flex-col gap-3 min-h-[60px] p-4 bg-white/[0.01] rounded-lg border border-vault-border">
                <div className="flex items-center gap-3">
                  <Terminal size={12} className="text-emerald-vault/60" />
                  <p className="text-[11px] font-mono text-emerald-vault tracking-tight uppercase">
                    {exportStage || 'Initializing sovereign sequence...'}
                  </p>
                </div>
                {progress > 40 && (
                  <div className="flex items-center gap-2 pl-6 animate-in fade-in slide-in-from-left-2 duration-500">
                    <Database size={10} className="text-vault-dim/50" />
                    <p className="text-[9px] font-mono text-vault-dim/50 uppercase tracking-widest">
                      Processing memory shards...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {notification && (
        <div className="fixed bottom-8 right-8 px-6 py-4 rounded-lg border border-white/10 bg-obsidian-soft flex items-center gap-4 shadow-sovereign z-[250] animate-in fade-in slide-in-from-bottom-4 backdrop-blur-md">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/5">
            {notification.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-vault" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )}
          </div>
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-vault-text">
            {notification.message}
          </span>
        </div>
      )}
    </div>
  );
}
