import React, { useState, useEffect, useCallback, useRef, useDeferredValue } from 'react';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { Sidebar } from './components/Sidebar';
import { Toolbar } from './components/Toolbar';
import { MobileActionBar } from './components/MobileActionBar';
import { ConfigModal } from './components/modals/ConfigModal';
import { TagsModal } from './components/modals/TagsModal';
import { PurgeModal } from './components/modals/PurgeModal';
import { ExportModal } from './components/modals/ExportModal';
import { DownloadSuccessModal } from './components/modals/DownloadSuccessModal';
import { InstallPrompt } from './components/InstallPrompt';
import { ScannerOverlay } from './components/ScannerOverlay';
import { VaultRefiner } from './services/localRefineService';
import { VaultConverter } from './services/exportService';
import { useVault } from './hooks/useVault';
import { VaultFont } from './types';
import { Shield, ShieldCheck, Volume2, BookOpen, Scan } from 'lucide-react';
import { usePWAInstall } from './hooks/usePWAInstall';
import { marked } from 'marked';

type ModalType = 'config' | 'tags' | 'purge' | 'scanner' | 'export' | 'success' | null;

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

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [activeFont, setActiveFont] = useState<VaultFont>('sans');
  const [docToPurge, setDocToPurge] = useState<string | null>(null);
  const [vaultSynced, setVaultSynced] = useState(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [speechReady, setSpeechReady] = useState(false);
  const [pendingFormat, setPendingFormat] = useState<'pdf' | 'docx' | null>(null);
  const [lastExportedFile, setLastExportedFile] = useState<{name: string, format: any, blobUrl: string | null}>({
    name: "", 
    format: null, 
    blobUrl: null
  });

  const saveTimeoutRef = useRef<number | null>(null);
  const listenMutexRef = useRef(false);
  const { isInstallable, install } = usePWAInstall();

  // Async Audio Stabilization Protocol
  useEffect(() => {
    const initSpeech = () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const checkVoices = () => {
          const voices = window.speechSynthesis.getVoices();
          if (voices.length > 0) setSpeechReady(true);
        };
        checkVoices();
        window.speechSynthesis.onvoiceschanged = checkVoices;
      }
    };
    initSpeech();
    return () => window.speechSynthesis.cancel();
  }, []);

  const handleListen = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Hardware-Tap Debounce / Mutex: Prevents double-clicking race condition
    if (listenMutexRef.current || !activeDoc || !speechReady) return;
    listenMutexRef.current = true;
    setTimeout(() => { listenMutexRef.current = false; }, 500);
    
    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    // Direct-from-Render Sanitization: Extract text only, purge all Markdown/Legacy artifacts
    const html = marked.parse(activeDoc.content);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html as string;
    
    const cleanText = (tempDiv.textContent || tempDiv.innerText || "")
      .replace(/__\d+\.__/g, '') // Scrub legacy artifacts from audio buffer
      .replace(/[#*`>_\-\+\[\]\(\)\$\!@:;]/g, ' ') 
      .replace(/\s+/g, ' ')                   
      .trim();

    if (!cleanText) return;

    const utter = new SpeechSynthesisUtterance(cleanText);
    utter.onend = () => setIsPlayingAudio(false);
    utter.onerror = () => setIsPlayingAudio(false);
    utter.rate = 1.0; 
    utter.pitch = 1.0;
    
    window.speechSynthesis.speak(utter);
    setIsPlayingAudio(true);
  }, [activeDoc, speechReady, isPlayingAudio]);

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

  const handleScannerCapture = async (capturedMarkdown: string) => {
    if (!activeDoc) return;
    const updatedContent = activeDoc.content + capturedMarkdown;
    handleContentChange(updatedContent);
    setNotification({ message: 'HD Plate Shard Hardened', type: 'success' });
    setActiveModal(null);
  };

  return (
    <div className={`fixed inset-0 overflow-hidden selection:bg-emerald-vault/30 flex flex-row bg-black text-white`}>
      {/* Sidebar Overlay with High Z-Index & Backdrop Exit */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-[10000] animate-in fade-in duration-300" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="sidebar relative z-[10001] h-full shrink-0">
        <Sidebar 
          documents={documents}
          activeId={activeDocId}
          onSelect={(id, mode) => { setActiveDocId(id); setIsSidebarOpen(false); if (mode === 'view') setMobileTab('preview'); }}
          onCreate={createDraft}
          onDelete={(id) => { setDocToPurge(id); setActiveModal('purge'); }}
          onRename={renameDraft}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onOpenConfig={() => setActiveModal('config')}
          onOpenTags={() => setActiveModal('tags')}
          installPrompt={{ isInstallable, install }}
        />
      </div>

      <main className="flex-1 flex flex-col relative overflow-hidden h-full">
        <Toolbar 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onShare={() => {}} 
          onLocalRefine={() => activeDoc && saveDraft({ ...activeDoc, content: VaultRefiner.refine(activeDoc.content) })}
        />

        <div className="flex-1 flex overflow-hidden relative min-h-0">
          {activeDoc ? (
            <>
              <div className={`flex-1 flex flex-col h-full overflow-hidden ${mobileTab === 'preview' ? 'hidden md:flex' : 'flex'}`}>
                <Editor font={activeFont} value={activeDoc.content} onChange={handleContentChange} activeDocId={activeDocId} />
              </div>
              <div className={`hidden md:block w-px z-10 h-full bg-vault-border`} />
              <div className={`flex-1 flex flex-col h-full overflow-hidden bg-obsidian-soft ${mobileTab === 'editor' ? 'hidden md:flex' : 'flex'}`}>
                <Preview font={activeFont} content={activeDoc.content} activeDocId={activeDocId} />
              </div>
            </>
          ) : (
             <div className="flex-1 flex items-center justify-center text-vault-dim opacity-50 uppercase tracking-widest text-xs font-bold">No Active Shard</div>
          )}
        </div>

        {/* Action Bank: Quadrant-Locked to Absolute Right Edge with 3rem gap */}
        <div className="fixed top-3 md:top-4 right-4 md:right-8 flex items-center gap-12 z-[10002] pointer-events-auto">
           <button 
             onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveModal('scanner'); }} 
             className="flex flex-col items-center gap-1 transition-all active:scale-90 group"
           >
             <div className="p-2 bg-white/5 border border-white/10 rounded-full text-emerald-vault group-hover:bg-emerald-vault/10">
               <Scan size={18} />
             </div>
             <span className="text-[9px] font-black uppercase tracking-widest text-white/80">Scan</span>
           </button>

           <button 
             onClick={handleListen} 
             className="flex flex-col items-center gap-1 transition-all active:scale-90 group"
           >
             <div className={`p-2 border rounded-full transition-all ${isPlayingAudio ? 'bg-emerald-vault text-black shadow-emerald-glow' : 'bg-white/5 border-white/10 text-emerald-vault group-hover:bg-emerald-vault/10'}`}>
               {isPlayingAudio ? <BookOpen size={18} className="animate-pulse" /> : <Volume2 size={18} />}
             </div>
             <span className="text-[9px] font-black uppercase tracking-widest text-white/80">Listen</span>
           </button>
           
           <div className="p-1 border-l border-white/10 pl-6 flex flex-col items-center gap-1 shrink-0 opacity-40">
             <div className={`w-2 h-2 rounded-full transition-all duration-700 ${vaultSynced ? "bg-emerald-vault/20" : "bg-emerald-vault animate-pulse shadow-emerald-glow"}`} />
             <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">Saved</span>
           </div>
        </div>

        <MobileActionBar 
          onExportDocx={() => { setPendingFormat('docx'); setActiveModal('export'); }}
          onExportPdf={() => { setPendingFormat('pdf'); setActiveModal('export'); }}
        />
        
        <div className="md:hidden fixed bottom-32 right-6 z-[9999]">
           <button onClick={() => setMobileTab(prev => prev === 'editor' ? 'preview' : 'editor')} className="w-14 h-14 rounded-full bg-emerald-vault text-black flex items-center justify-center shadow-lg active:scale-90 transition-transform">
             <Shield size={28} />
           </button>
        </div>

        {notification && (
          <div className="fixed top-24 right-8 z-[250] flex items-center gap-3 px-5 py-3 rounded-xl border backdrop-blur-md bg-emerald-vault/10 border-emerald-vault/30 text-emerald-vault animate-in slide-in-from-right-10 duration-500">
            <ShieldCheck size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">{notification.message}</span>
          </div>
        )}
      </main>

      {activeModal === 'scanner' && <ScannerOverlay onCapture={handleScannerCapture} onClose={() => setActiveModal(null)} />}
      <InstallPrompt />
      <ConfigModal isOpen={activeModal === 'config'} onClose={() => setActiveModal(null)} docCount={documents.length} activeFont={activeFont} setActiveFont={setActiveFont} />
      <TagsModal isOpen={activeModal === 'tags'} onClose={() => setActiveModal(null)} documents={documents} />
      <PurgeModal isOpen={activeModal === 'purge'} onConfirm={async () => { docToPurge && await deleteDraft(docToPurge); setActiveModal(null); }} onCancel={() => setActiveModal(null)} draftTitle={documents.find(d => d.id === docToPurge)?.title || ""} />
      <ExportModal initialName={activeDoc?.title || ""} format={pendingFormat} onConfirm={async (name) => {
        if (!activeDoc || !pendingFormat) return;
        try {
          const fileName = `${name}.${pendingFormat}`;
          let blob: Blob;
          if (pendingFormat === 'pdf') blob = await VaultConverter.toPDF(activeDoc.content, fileName, activeFont);
          else blob = await VaultConverter.toDocx(activeDoc.content, fileName);
          setLastExportedFile({ name, format: pendingFormat, blobUrl: URL.createObjectURL(blob) });
          setActiveModal('success');
        } catch (e) { setNotification({ message: 'Export sequence failure', type: 'error' }); }
        finally { setPendingFormat(null); }
      }} onCancel={() => { setActiveModal(null); setPendingFormat(null); }} />
      <DownloadSuccessModal isOpen={activeModal === 'success'} onClose={() => { URL.revokeObjectURL(lastExportedFile.blobUrl!); setActiveModal(null); }} fileName={lastExportedFile.name} format={lastExportedFile.format} blobUrl={lastExportedFile.blobUrl} />
    </div>
  );
}