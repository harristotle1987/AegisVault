
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
import { VaultConverter } from './services/exportService';
// Consolidated casing to vaultRefiner.ts to resolve TS casing conflict
import { VaultRefiner } from './services/vaultRefiner';
import { useVault } from './hooks/useVault';
import { VaultFont } from './types';
import { Check, Shield, CheckCircle2, ShieldAlert } from 'lucide-react';
import { usePWAInstall } from './hooks/usePWAInstall';

type ModalType = 'export' | 'config' | 'tags' | 'purge' | 'success' | null;

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
    renameDraft
  } = useVault();

  const [isExporting, setIsExporting] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [pendingFormat, setPendingFormat] = useState<'pdf' | 'docx' | null>(null);
  const [suggestedName, setSuggestedName] = useState<string>("");
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [activeFont, setActiveFont] = useState<VaultFont>('sans');
  const [docToPurge, setDocToPurge] = useState<string | null>(null);
  const [vaultSynced, setVaultSynced] = useState(true);
  
  // Track successful export for final popup
  const [lastExportedFile, setLastExportedFile] = useState<{name: string, format: 'pdf' | 'docx' | null, blobUrl: string | null}>({
    name: "", 
    format: null, 
    blobUrl: null
  });

  const saveTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    document.body.setAttribute('data-font-mode', activeFont);
  }, [activeFont]);
  
  const { isInstallable, install } = usePWAInstall();

  /**
   * Redundant Integrity Protocol: 30-second Auto-Save Loop
   */
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

  const handleExport = async (name: string) => {
    if (!activeDoc || !pendingFormat) return;
    setIsExporting(true);
    setActiveModal(null);
    try {
      let blob: Blob;
      if (pendingFormat === 'pdf') {
        blob = await VaultConverter.toPDF(activeDoc.content, name + '.pdf', activeFont);
      } else {
        blob = await VaultConverter.toDocx(activeDoc.content, name + '.docx');
      }
      
      const blobUrl = URL.createObjectURL(blob);
      setLastExportedFile({ name, format: pendingFormat, blobUrl });
      setActiveModal('success');
    } catch (e) {
      console.error(e);
      setNotification({ message: 'Export failed', type: 'error' });
    } finally {
      setIsExporting(false);
      setPendingFormat(null);
    }
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
    <div className="flex h-screen bg-obsidian text-vault-text overflow-hidden selection:bg-emerald-vault/30">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] animate-in fade-in duration-300" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="sidebar relative z-[9999]">
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

      <main className="flex-1 flex flex-col relative overflow-hidden transition-all duration-300">
        <Toolbar 
          markdown={activeDoc?.content || ''}
          isExporting={isExporting}
          isSaving={isSaving || !vaultSynced}
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

        {/* Sovereign Sync Status Indicator */}
        <div className="fixed bottom-24 right-6 md:bottom-8 md:right-8 flex items-center justify-center p-2 rounded-full bg-obsidian/60 backdrop-blur-md border border-emerald-vault/20 shadow-lg z-[130] pointer-events-none">
          <CheckCircle2 size={16} className={vaultSynced ? "text-emerald-vault" : "text-emerald-vault/30 animate-pulse"} />
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
        
        <div className="md:hidden fixed bottom-24 right-20 z-[120]">
           <button 
             onClick={() => setMobileTab(prev => prev === 'editor' ? 'preview' : 'editor')}
             className="w-12 h-12 rounded-full bg-emerald-vault text-black flex items-center justify-center shadow-lg shadow-emerald-vault/30 active:scale-90 transition-transform"
           >
             <Shield size={20} />
           </button>
        </div>

        <div className={`fixed top-20 right-6 z-[250] transition-all duration-500 transform ${notification ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0 pointer-events-none'}`}>
          {notification && (
            <div className={`flex items-center gap-3 px-5 py-3 rounded-xl border backdrop-blur-md shadow-2xl ${
              notification.type === 'success' ? 'bg-emerald-vault/10 border-emerald-vault/30 text-emerald-vault' : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
              {notification.type === 'success' ? <Check size={16} /> : <ShieldAlert size={16} />}
              <span className="text-xs font-bold uppercase tracking-wider">{notification.message}</span>
            </div>
          )}
        </div>

        {/* Processing Protocol Pop up */}
        {isExporting && (
          <div className="fixed inset-0 z-[600] bg-obsidian/80 backdrop-blur-xl flex items-center justify-center pointer-events-auto cursor-wait animate-in fade-in duration-300">
             <div className="w-full max-w-sm p-10 rounded-3xl bg-obsidian-soft border border-emerald-vault/20 shadow-sovereign flex flex-col items-center gap-8 animate-in zoom-in-95 duration-300">
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
                <p className="text-[9px] text-vault-dim italic opacity-40">Hardening typographic rhythm within local memory...</p>
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
