import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { ResumeAudioModal } from './components/modals/ResumeAudioModal';
import { InstallPrompt } from './components/InstallPrompt';
import { ScannerOverlay } from './components/ScannerOverlay';
import { VaultRefiner } from './services/localRefineService';
import { VaultConverter } from './services/exportService';
import { ImportService } from './services/ImportService';
import { StorageService } from './services/storageService';
import { useVault } from './hooks/useVault';
import { VaultFont, SovereignDocument } from './types';
import { Shield, ShieldCheck, Volume2, BookOpen, Scan } from 'lucide-react';
import { usePWAInstall } from './hooks/usePWAInstall';
import { marked } from 'marked';

type ModalType = 'config' | 'tags' | 'purge' | 'scanner' | 'export' | 'success' | 'resume' | null;

export default function App() {
  const { 
    documents, 
    activeDoc, 
    activeDocId, 
    setActiveDocId, 
    saveDraft, 
    deleteDraft, 
    createDraft,
    renameDraft
  } = useVault();

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [activeFont, setActiveFont] = useState<VaultFont>('sans');
  const [speechRate, setSpeechRate] = useState(1.0);
  const [docToPurge, setDocToPurge] = useState<string | null>(null);
  const [vaultSynced, setVaultSynced] = useState(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [speechReady, setSpeechReady] = useState(false);
  const [pendingFormat, setPendingFormat] = useState<'pdf' | 'docx' | null>(null);
  const [rescanTargetSrc, setRescanTargetSrc] = useState<string | null>(null);
  const [lastExportedFile, setLastExportedFile] = useState<{name: string, format: any, blobUrl: string | null}>({
    name: "", 
    format: null, 
    blobUrl: null
  });

  const saveTimeoutRef = useRef<number | null>(null);
  const currentUtteranceIndex = useRef(0);
  const utterances = useRef<string[]>([]);
  const { isInstallable, install } = usePWAInstall();

  const [isWindows, setIsWindows] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsWindows(/windows|win32/i.test(userAgent));
  }, []);

  const initSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) setSpeechReady(true);
      window.speechSynthesis.onvoiceschanged = () => {
        const updatedVoices = window.speechSynthesis.getVoices();
        if (updatedVoices.length > 0) setSpeechReady(true);
      };
    }
  }, []);

  const persistAudioProgress = useCallback((index: number) => {
    if (!activeDoc) return;
    saveDraft({
      ...activeDoc,
      metadata: {
        ...activeDoc.metadata,
        audioProgress: index
      }
    });
  }, [activeDoc, saveDraft]);

  const playNextChunk = useCallback(() => {
    if (currentUtteranceIndex.current >= utterances.current.length) {
      setIsPlayingAudio(false);
      persistAudioProgress(0); // Reset on finish
      return;
    }

    const text = utterances.current[currentUtteranceIndex.current];
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = speechRate;
    
    utter.onstart = () => {
      persistAudioProgress(currentUtteranceIndex.current);
    };

    utter.onend = () => {
      currentUtteranceIndex.current++;
      playNextChunk();
    };
    utter.onerror = () => {
      setIsPlayingAudio(false);
    };
    
    window.speechSynthesis.speak(utter);
  }, [speechRate, persistAudioProgress]);

  const startPlayback = useCallback((startIndex: number = 0) => {
    currentUtteranceIndex.current = startIndex;
    setIsPlayingAudio(true);
    playNextChunk();
    setActiveModal(null);
  }, [playNextChunk]);

  const handleListen = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!speechReady) {
      initSpeech();
      return; 
    }

    if (window.speechSynthesis.speaking || isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    if (!activeDoc) return;

    const html = marked.parse(activeDoc.content);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html as string;
    
    // Hardened Sanitization Protocol: Strip Markdown symbols ($@, #, *, :) and sharding markers
    const cleanText = (tempDiv.textContent || tempDiv.innerText || "")
      .replace(/__\d+\.__/g, '') 
      .replace(/[\$@#\*:`>_\-\+\[\]\(\)\!@:;=]/g, ' ') 
      .replace(/\s+/g, ' ')                   
      .trim();

    if (!cleanText) return;

    // Segment Streaming Logic (1000 characters per volatile chunk)
    const chunkSize = 1000;
    const chunks = [];
    for (let i = 0; i < cleanText.length; i += chunkSize) {
      chunks.push(cleanText.substring(i, i + chunkSize));
    }

    utterances.current = chunks;

    const savedProgress = activeDoc.metadata.audioProgress || 0;
    if (savedProgress > 0 && savedProgress < chunks.length) {
      setActiveModal('resume');
    } else {
      startPlayback(0);
    }
  }, [activeDoc, speechReady, initSpeech, isPlayingAudio, startPlayback]);

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
    handleContentChange(refined);
    setNotification({ message: 'Hardened State Active', type: 'success' });
    setTimeout(() => setNotification(null), 2000);
  };

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.docx,.pdf,.txt,.md';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const { title, content } = await ImportService.processFile(file);
        
        await StorageService.purgeMocks();
        
        // UUID Provisioning BEFORE database insertion
        const newDoc = await createDraft();
        const fullDoc = { ...newDoc, title, content };
        
        await saveDraft(fullDoc);
        setActiveDocId(newDoc.id);
        
        setNotification({ message: 'Protocol: Asset Ingested', type: 'success' });
      } catch (err) {
        setNotification({ 
          message: err instanceof Error ? err.message : 'Bridge failure: Engine unresolved', 
          type: 'error' 
        });
      }
    };
    input.click();
  };

  const handleScannerCapture = async (base64Img: string) => {
    if (!activeDoc) return;
    await StorageService.purgeMocks();

    if (rescanTargetSrc) {
      const targetMd = `![Sovereign Plate](${rescanTargetSrc})`;
      const replacementMd = `![Sovereign Plate](${base64Img})`;
      const newContent = activeDoc.content.replace(targetMd, replacementMd);
      handleContentChange(newContent);
      setRescanTargetSrc(null);
      setNotification({ message: 'Shard Re-calibrated', type: 'success' });
    } else {
      const imgMd = `\n\n![Sovereign Plate](${base64Img})\n\n`;
      handleContentChange(activeDoc.content + imgMd);
      setNotification({ message: 'HD Plate Ingested', type: 'success' });
    }
    setActiveModal(null);
  };

  const handleRemoveImage = (src: string) => {
    if (!activeDoc) return;
    const targetMd = `![Sovereign Plate](${src})`;
    const newContent = activeDoc.content.split(targetMd).join('').trim();
    handleContentChange(newContent);
    setNotification({ message: 'Shard Plate Purged', type: 'success' });
  };

  const handleRescanImage = (src: string) => {
    setRescanTargetSrc(src);
    setActiveModal('scanner');
  };

  return (
    <div className={`fixed inset-0 overflow-hidden selection:bg-emerald-vault/30 flex flex-row bg-black text-white`}>
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
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onShare={() => {}} 
          onLocalRefine={handleLocalRefine}
        />

        <div className="flex-1 flex overflow-hidden relative min-h-0">
          {activeDoc ? (
            <>
              <div className={`flex-1 flex flex-col h-full overflow-hidden ${mobileTab === 'preview' ? 'hidden md:flex' : 'flex'}`}>
                <Editor font={activeFont} value={activeDoc.content} onChange={handleContentChange} activeDocId={activeDocId} />
              </div>
              <div className={`hidden md:block w-px z-10 h-full bg-vault-border`} />
              <div className={`flex-1 flex flex-col h-full overflow-hidden bg-obsidian-soft ${mobileTab === 'editor' ? 'hidden md:flex' : 'flex'}`}>
                <Preview 
                  font={activeFont} 
                  content={activeDoc.content} 
                  activeDocId={activeDocId} 
                  onRemoveImage={handleRemoveImage}
                  onRescanImage={handleRescanImage}
                />
              </div>
            </>
          ) : (
             <div className="flex-1 flex items-center justify-center text-vault-dim opacity-50 uppercase tracking-widest text-xs font-bold">No Active Shard</div>
          )}
        </div>

        {/* Action Bank: Positioned Far Right, Collision-Resistant on Mobile */}
        <div 
          className={`fixed top-[18px] md:top-[12px] right-4 md:right-8 flex items-center gap-6 md:gap-10 z-[10002] pointer-events-auto transition-all duration-300 ease-in-out origin-right ${
            isSidebarOpen ? 'scale-[0.6] translate-x-14 opacity-20 pointer-events-none' : 'scale-100 translate-x-0 opacity-100'
          }`}
        >
           <button 
             onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveModal('scanner'); }} 
             className="flex flex-col items-center gap-1 transition-all active:scale-90 group"
           >
             <div className="p-2.5 bg-white/5 border border-white/10 rounded-full text-emerald-vault group-hover:bg-emerald-vault/20 transition-all">
               <Scan size={18} />
             </div>
             <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/80">Scan</span>
           </button>

           <button 
             onClick={handleListen} 
             className="flex flex-col items-center gap-1 transition-all active:scale-90 group"
           >
             <div className={`p-2.5 border rounded-full transition-all ${isPlayingAudio ? 'bg-emerald-vault text-black shadow-emerald-glow' : 'bg-white/5 border-white/10 text-emerald-vault group-hover:bg-emerald-vault/20'}`}>
               {isPlayingAudio ? <BookOpen size={18} className="animate-pulse" /> : <Volume2 size={18} />}
             </div>
             <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/80">Listen</span>
           </button>
           
           <div className="hidden lg:flex p-1 border-l border-white/10 pl-6 flex-col items-center gap-1 shrink-0 opacity-40">
             <div className={`w-2 h-2 rounded-full transition-all duration-700 ${vaultSynced ? "bg-emerald-vault/20" : "bg-emerald-vault animate-pulse shadow-emerald-glow"}`} />
             <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.1em]">Saved</span>
           </div>
        </div>

        <MobileActionBar 
          isMenuOpen={isExportMenuOpen}
          onToggleMenu={() => setIsExportMenuOpen(!isExportMenuOpen)}
          onHarden={handleLocalRefine}
          onImport={handleImport}
          onExportDocx={() => { setPendingFormat('docx'); setActiveModal('export'); setIsExportMenuOpen(false); }}
          onExportPdf={() => { setPendingFormat('pdf'); setActiveModal('export'); setIsExportMenuOpen(false); }}
        />
        
        <div 
          className={`md:hidden fixed right-6 z-[125] transition-all duration-500 ease-in-out ${
            isExportMenuOpen ? 'bottom-72' : 'bottom-40'
          }`}
        >
           <button 
             onClick={() => setMobileTab(prev => prev === 'editor' ? 'preview' : 'editor')} 
             className="w-14 h-14 rounded-full bg-emerald-vault text-black flex items-center justify-center shadow-[0_15px_35px_rgba(16,185,129,0.4)] active:scale-90 transition-transform"
           >
             <Shield size={28} />
           </button>
        </div>

        {notification && (
          <div className="fixed top-24 right-8 z-[250] flex items-center gap-3 px-5 py-3 rounded-xl border backdrop-blur-md bg-emerald-vault/10 border-emerald-vault/30 text-emerald-vault animate-in slide-in-from-right-10 duration-500 max-w-[80vw]">
            <ShieldCheck size={16} className="shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider">{notification.message}</span>
          </div>
        )}
      </main>

      {activeModal === 'scanner' && <ScannerOverlay onCapture={handleScannerCapture} onClose={() => { setActiveModal(null); setRescanTargetSrc(null); }} />}
      <InstallPrompt />
      <ConfigModal 
        isOpen={activeModal === 'config'} 
        onClose={() => setActiveModal(null)} 
        docCount={documents.length} 
        activeFont={activeFont} 
        setActiveFont={setActiveFont} 
        speechRate={speechRate}
        setSpeechRate={setSpeechRate}
      />
      <TagsModal isOpen={activeModal === 'tags'} onClose={() => setActiveModal(null)} documents={documents} />
      <PurgeModal isOpen={activeModal === 'purge'} onConfirm={async () => { docToPurge && await deleteDraft(docToPurge); setActiveModal(null); }} onCancel={() => setActiveModal(null)} draftTitle={documents.find(d => d.id === docToPurge)?.title || ""} />
      
      {activeModal === 'resume' && (
        <ResumeAudioModal 
          isOpen={true}
          progress={activeDoc?.metadata.audioProgress || 0}
          total={utterances.current.length}
          onResume={() => startPlayback(activeDoc?.metadata.audioProgress || 0)}
          onRestart={() => startPlayback(0)}
          onCancel={() => setActiveModal(null)}
        />
      )}

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
      <DownloadSuccessModal isOpen={activeModal === 'success'} onClose={() => { if (lastExportedFile.blobUrl) URL.revokeObjectURL(lastExportedFile.blobUrl); setActiveModal(null); }} fileName={lastExportedFile.name} format={lastExportedFile.format} blobUrl={lastExportedFile.blobUrl} />
    </div>
  );
}