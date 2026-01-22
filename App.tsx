import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { Sidebar } from './components/Sidebar';
import { Toolbar } from './components/Toolbar';
import { MobileActionBar } from './components/MobileActionBar';
import { ExportModal } from './components/modals/ExportModal';
import { ConfigModal } from './components/modals/ConfigModal';
import { TagsModal } from './components/modals/TagsModal';
import { PurgeModal } from './components/modals/PurgeModal';
import { DownloadSuccessModal } from './components/modals/DownloadSuccessModal';
import { InstallPrompt } from './components/InstallPrompt';
import { ScannerOverlay } from './components/ScannerOverlay';
import { VaultConverter } from './services/exportService';
import { VaultRefiner } from './services/localRefineService';
import { ImportService } from './services/ImportService';
import { SyncService } from './services/SyncService';
import { useVault } from './hooks/useVault';
import { VaultFont } from './types';
import { Shield, ShieldCheck } from 'lucide-react';
import { usePWAInstall } from './hooks/usePWAInstall';

type ModalType = 'export' | 'config' | 'tags' | 'purge' | 'success' | 'scanner' | null;

export default function App() {
  const { 
    documents, 
    activeDoc, 
    activeDocId, 
    setActiveDocId, 
    isSaving, 
    saveDraft, 
    deleteDraft, 
    createDraft,
    renameDraft,
    refresh
  } = useVault();

  const [isExporting, setIsExporting] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [pendingFormat, setPendingFormat] = useState<'pdf' | 'docx' | 'html' | 'txt' | 'rtf' | null>(null);
  const [suggestedName, setSuggestedName] = useState<string>("");
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [activeFont, setActiveFont] = useState<VaultFont>('sans');
  const [docToPurge, setDocToPurge] = useState<string | null>(null);
  const [vaultSynced, setVaultSynced] = useState(true);
  
  const [lastExportedFile, setLastExportedFile] = useState<{name: string, format: any, blobUrl: string | null}>({
    name: "", 
    format: null, 
    blobUrl: null
  });

  const saveTimeoutRef = useRef<number | null>(null);
  const { isInstallable, install } = usePWAInstall();

  // Shadow Sync: Export Protocol (Pretty-Printed)
  const handleCloudShadowExport = async () => {
    try {
      const blob = await SyncService.generateVaultShadow();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Vault_Shadow_${new Date().toISOString().split('T')[0]}.vshadow.json`;
      link.click();
      setNotification({ message: 'Shadow Shard Exported', type: 'success' });
    } catch (e) {
      setNotification({ message: 'Shadow Sync Failure', type: 'error' });
    }
  };

  // Shadow Sync: Import Protocol (Resilient)
  const handleCloudShadowImport = async (file: File) => {
    try {
      const result = await SyncService.ingestVaultShadow(file);
      await refresh();
      setNotification({ message: `Shadow Synced: ${result.success} shards ingested`, type: 'success' });
      setActiveModal(null);
    } catch (e) {
      setNotification({ message: 'Corrupt Shadow Binary', type: 'error' });
    }
  };

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (activeModal || isSidebarOpen) {
        event.preventDefault();
        setActiveModal(null);
        setIsSidebarOpen(false);
        window.history.pushState({ overlay: false }, '');
      }
    };
    window.addEventListener('popstate', handlePopState);
    if (window.history.state?.overlay !== false) {
      window.history.replaceState({ overlay: false }, '');
    }
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeModal, isSidebarOpen]);

  useEffect(() => {
    if (activeModal || isSidebarOpen) {
      window.history.pushState({ overlay: true }, '');
    }
  }, [activeModal, isSidebarOpen]);

  useEffect(() => {
    document.body.setAttribute('data-font-mode', activeFont);
  }, [activeFont]);
  
  useEffect(() => {
    const integrityInterval = setInterval(() => {
      if (activeDoc && !isSaving && !vaultSynced) {
        saveDraft(activeDoc);
        setVaultSynced(true);
      }
    }, 30000);
    return () => clearInterval(integrityInterval);
  }, [activeDoc, isSaving, vaultSynced, saveDraft]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleContentChange = (content: string) => {
    if (!activeDoc) return;
    setVaultSynced(false);
    const updated = { ...activeDoc, content };
    if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = window.setTimeout(() => {
      saveDraft(updated);
      setVaultSynced(true);
    }, 800);
  };

  const handleLocalRefine = () => {
    if (!activeDoc) return;
    const refined = VaultRefiner.refine(activeDoc.content);
    saveDraft({ ...activeDoc, content: refined });
    if ('vibrate' in navigator) navigator.vibrate(15);
    setNotification({ message: 'Structural hardening complete', type: 'success' });
  };

  const handleBatchImport = async (files: FileList) => {
    setNotification({ message: `Queueing ${files.length} assets...`, type: 'success' });
    let successCount = 0;
    
    for (const file of Array.from(files)) {
      if (file.name.includes('.vshadow')) {
        await handleCloudShadowImport(file);
        continue;
      }
      try {
        const { title, content } = await ImportService.processFile(file);
        const newDoc = await createDraft();
        if (newDoc) {
          await saveDraft({ ...newDoc, title, content });
          successCount++;
        }
      } catch (err) {
        console.error('Batch error:', err);
      }
    }
    if (successCount > 0) {
      setNotification({ message: `Batch Processing Complete: ${successCount} assets`, type: 'success' });
    }
  };

  const handleScannerCapture = async (capturedMarkdown: string) => {
    if (!activeDoc) return;
    const updatedContent = activeDoc.content + capturedMarkdown;
    handleContentChange(updatedContent);
    setNotification({ message: 'HD Plate Shard Hardened', type: 'success' });
    setActiveModal(null);
  };

  const handleShare = async () => {
    if (!activeDoc) return;
    const shareData = { title: activeDoc.title, text: activeDoc.content };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setNotification({ message: 'Beam successful', type: 'success' });
      } else {
        await navigator.clipboard.writeText(activeDoc.content);
        setNotification({ message: 'Copied to clipboard', type: 'success' });
      }
    } catch (err) {
      setNotification({ message: 'Beam failed', type: 'error' });
    }
  };

  const sanitizeFilename = (title: string): string => {
    return title.replace(/[^\w\s-]/gi, '').trim().replace(/\s+/g, '_');
  };

  const handleExport = async (name: string) => {
    if (!activeDoc || !pendingFormat) return;
    setIsExporting(true);
    setActiveModal(null);
    try {
      let blob: Blob;
      const fileName = name + '.' + pendingFormat;
      if (pendingFormat === 'pdf') {
        blob = await VaultConverter.toPDF(activeDoc.content, fileName, activeFont);
      } else if (pendingFormat === 'docx') {
        blob = await VaultConverter.toDocx(activeDoc.content, fileName);
      } else if (pendingFormat === 'html') {
        blob = await VaultConverter.toHTML(activeDoc.content, fileName);
      } else if (pendingFormat === 'txt') {
        blob = await VaultConverter.toTXT(activeDoc.content, fileName);
      } else if (pendingFormat === 'rtf') {
        blob = await VaultConverter.toRTF(activeDoc.content, fileName);
      } else {
        throw new Error("Format not supported");
      }
      
      const blobUrl = URL.createObjectURL(blob);
      setLastExportedFile({ name, format: pendingFormat, blobUrl });
      setActiveModal('success');
    } catch (e) {
      setNotification({ message: 'Export failed', type: 'error' });
    } finally {
      setIsExporting(false);
      setPendingFormat(null);
    }
  };

  const initiateExport = (format: 'pdf' | 'docx' | 'html' | 'txt' | 'rtf') => {
    if (!activeDoc) return;
    setPendingFormat(format);
    setSuggestedName(sanitizeFilename(activeDoc.title) || "vault_export");
    setActiveModal('export');
  };

  const closeSuccessModal = () => {
    if (lastExportedFile.blobUrl) {
      URL.revokeObjectURL(lastExportedFile.blobUrl);
    }
    setLastExportedFile(prev => ({ ...prev, blobUrl: null }));
    setActiveModal(null);
  };

  const triggerPurge = (id: string) => {
    setDocToPurge(id);
    setActiveModal('purge');
  };

  const executePurge = async () => {
    if (docToPurge) {
      await deleteDraft(docToPurge);
      setNotification({ message: 'Archive shard purged', type: 'success' });
    }
    setActiveModal(null);
    setDocToPurge(null);
  };

  const handleSelectShard = (id: string, mode: 'view' | 'edit' = 'edit') => {
    setActiveDocId(id);
    setIsSidebarOpen(false);
    if (mode === 'view') setMobileTab('preview');
    else setMobileTab('editor');
  };

  return (
    <div className={`fixed inset-0 overflow-hidden selection:bg-emerald-vault/30 flex flex-row bg-black text-white`}>
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] animate-in fade-in duration-300" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="sidebar relative z-[9999] h-full shrink-0">
        <Sidebar 
          documents={documents}
          activeId={activeDocId}
          onSelect={(id, mode) => handleSelectShard(id, mode)}
          onCreate={createDraft}
          onDelete={triggerPurge}
          onRename={renameDraft}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onOpenConfig={() => setActiveModal('config')}
          onOpenTags={() => setActiveModal('tags')}
          installPrompt={{ isInstallable, install }}
        />
      </div>

      <main className="flex-1 flex flex-col relative overflow-hidden transition-all duration-300 h-full">
        <Toolbar 
          markdown={activeDoc?.content || ''}
          isExporting={isExporting}
          isSaving={isSaving || !vaultSynced}
          onExport={initiateExport as any}
          onShare={handleShare}
          onLocalRefine={handleLocalRefine}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenTags={() => setActiveModal('tags')}
          onOpenConfig={() => setActiveModal('config')}
          onImport={handleBatchImport}
          onOpenScanner={() => setActiveModal('scanner')}
        />

        <div className="flex-1 flex overflow-hidden relative min-h-0">
          {activeDoc ? (
            <>
              <div className={`flex-1 flex flex-col h-full overflow-hidden ${mobileTab === 'preview' ? 'hidden md:flex' : 'flex'}`}>
                <Editor 
                  font={activeFont} 
                  value={activeDoc.content} 
                  onChange={handleContentChange} 
                  activeDocId={activeDocId}
                />
              </div>
              <div className={`hidden md:block w-px z-10 h-full bg-vault-border`} />
              <div className={`flex-1 flex flex-col h-full overflow-hidden bg-obsidian-soft ${mobileTab === 'editor' ? 'hidden md:flex' : 'flex'}`}>
                <Preview 
                  font={activeFont} 
                  content={activeDoc.content} 
                  activeDocId={activeDocId}
                />
              </div>
            </>
          ) : (
             <div className="flex-1 flex items-center justify-center text-vault-dim opacity-50 uppercase tracking-widest text-xs font-bold">
               No Active Shard
             </div>
          )}
        </div>

        {/* Global Sovereign Status Matrix */}
        <div className="fixed top-4 right-4 flex items-center gap-2 z-[10000]">
           <div className="p-2">
             <div 
               className={`w-2.5 h-2.5 rounded-full transition-all duration-700 shadow-emerald-glow ${vaultSynced ? "opacity-10" : "opacity-100 animate-pulse"}`} 
               style={{ backgroundColor: '#10B981' }}
             />
           </div>
        </div>

        <MobileActionBar 
          isExporting={isExporting}
          onExport={initiateExport as any}
          onLocalRefine={handleLocalRefine}
        />
        
        <div className="md:hidden fixed bottom-32 right-8 z-[9999]">
           <button 
             onClick={() => setMobileTab(prev => prev === 'editor' ? 'preview' : 'editor')}
             className="w-16 h-16 rounded-full bg-emerald-vault text-black flex items-center justify-center shadow-lg shadow-emerald-vault/30 active:scale-90 transition-transform"
           >
             <Shield size={32} />
           </button>
        </div>

        <div className={`fixed top-16 right-6 z-[250] transition-all duration-500 transform ${notification ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0 pointer-events-none'}`}>
          {notification && (
            <div className={`flex items-center gap-3 px-5 py-3 rounded-xl border backdrop-blur-md shadow-2xl ${
              notification.type === 'success' 
                ? 'bg-emerald-vault/10 border-emerald-vault/30 text-emerald-vault' 
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
              <ShieldCheck size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">{notification.message}</span>
            </div>
          )}
        </div>

        {isExporting && (
          <div className="fixed inset-0 z-[10001] bg-black/80 backdrop-blur-xl flex items-center justify-center pointer-events-auto cursor-wait animate-in fade-in duration-300">
             <div className="w-full max-sm p-10 rounded-3xl bg-obsidian-soft border border-emerald-vault/20 shadow-sovereign flex flex-col items-center gap-8 animate-in zoom-in-95 duration-300">
                <div className="relative">
                   <div className="w-20 h-20 rounded-full border-4 border-emerald-vault/5 border-t-emerald-vault animate-spin" />
                   <div className="absolute inset-0 flex items-center justify-center">
                      <Shield className="w-8 h-8 text-emerald-vault animate-pulse" />
                   </div>
                </div>
                <div className="text-center space-y-3">
                   <h3 className="text-white font-black uppercase tracking-[0.4em] text-xs">Binary Sharding</h3>
                   <div className="flex flex-col gap-1">
                      <p className="text-vault-dim text-[10px] font-mono uppercase tracking-widest opacity-60">Rendering Vector Asset</p>
                      <div className="w-32 h-0.5 bg-white/5 mx-auto rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-vault w-1/2 animate-[shimmer_1.5s_infinite]" />
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}
      </main>

      {activeModal === 'scanner' && (
        <ScannerOverlay 
          onCapture={handleScannerCapture} 
          onClose={() => setActiveModal(null)} 
        />
      )}

      <InstallPrompt />

      <ExportModal 
        initialName={suggestedName}
        format={pendingFormat as any}
        onConfirm={handleExport}
        onCancel={() => { setActiveModal(null); setPendingFormat(null); }}
      />
      <ConfigModal 
        isOpen={activeModal === 'config'} 
        onClose={() => setActiveModal(null)} 
        docCount={documents.length}
        activeFont={activeFont}
        setActiveFont={setActiveFont}
        onShadowExport={handleCloudShadowExport}
        onShadowImport={handleCloudShadowImport}
      />
      <TagsModal isOpen={activeModal === 'tags'} onClose={() => setActiveModal(null)} documents={documents} />
      
      <PurgeModal 
        isOpen={activeModal === 'purge'}
        onConfirm={executePurge}
        onCancel={() => { setActiveModal(null); setDocToPurge(null); }}
        draftTitle={documents.find(d => d.id === docToPurge)?.title || "Unknown Shard"}
      />

      <DownloadSuccessModal 
        isOpen={activeModal === 'success'}
        onClose={closeSuccessModal}
        fileName={lastExportedFile.name}
        format={lastExportedFile.format}
        blobUrl={lastExportedFile.blobUrl}
      />

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}