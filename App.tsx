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
import { StorageService } from './storageService';
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
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [activeFont, setActiveFont] = useState<VaultFont>('sans');
  const [speechRate, setSpeechRate] = useState(1.0);
  const [speechPitch, setSpeechPitch] = useState(1.0);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string | null>(null);
  const [docToPurge, setDocToPurge] = useState<string | null>(null);
  const [vaultSynced, setVaultSynced] = useState(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [speechReady, setSpeechReady] = useState(false);
  const [pendingFormat, setPendingFormat] = useState<'pdf' | 'docx' | null>(null);
  const [rescanTargetSrc, setRescanTargetSrc] = useState<string | null>(null);
  const [splitPosition, setSplitPosition] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
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

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

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

  const startResizing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isResizing) return;
    let clientX: number;
    if (e instanceof MouseEvent) {
      clientX = e.clientX;
    } else {
      clientX = (e as TouchEvent).touches[0].clientX;
    }
    const newPosition = (clientX / window.innerWidth) * 100;
    if (newPosition > 15 && newPosition < 85) {
      setSplitPosition(newPosition);
    }
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
      window.addEventListener('touchmove', resize);
      window.addEventListener('touchend', stopResizing);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
      window.removeEventListener('touchmove', resize);
      window.removeEventListener('touchend', stopResizing);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
      window.removeEventListener('touchmove', resize);
      window.removeEventListener('touchend', stopResizing);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, resize, stopResizing]);

  const playNextChunk = useCallback(() => {
    if (currentUtteranceIndex.current >= utterances.current.length) {
      setIsPlayingAudio(false);
      persistAudioProgress(0); // Reset on completion
      return;
    }

    const text = utterances.current[currentUtteranceIndex.current];
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = speechRate;
    utter.pitch = speechPitch;
    
    if (selectedVoiceURI) {
      const voices = window.speechSynthesis.getVoices();
      const [uri, name, lang, indexStr] = selectedVoiceURI.split('||');
      const index = parseInt(indexStr, 10);
      
      // Multi-stage matching
      let voice = voices[index];
      if (!voice || voice.voiceURI !== uri || voice.name !== name) {
        voice = voices.find(v => v.voiceURI === uri && v.name === name) || 
                voices.find(v => v.voiceURI === uri) || 
                null;
      }

      if (voice) {
        utter.voice = voice;
        utter.lang = voice.lang;
      }
    }
    
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
  }, [speechRate, selectedVoiceURI, persistAudioProgress]);

  const prevVoiceRef = useRef<string | null>(null);
  const prevRateRef = useRef<number>(1.0);
  const prevPitchRef = useRef<number>(1.0);
  useEffect(() => {
    if (!speechReady) return;
    
    const voiceChanged = selectedVoiceURI !== prevVoiceRef.current;
    const rateChanged = speechRate !== prevRateRef.current;
    const pitchChanged = speechPitch !== prevPitchRef.current;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      playNextChunk();
    } else if ((voiceChanged || rateChanged || pitchChanged) && activeModal === 'config') {
      // Play sample only when changed in config modal and not reading
      window.speechSynthesis.cancel();
      
      // Small delay to ensure cancellation is processed
      setTimeout(() => {
        const utter = new SpeechSynthesisUtterance("Voice profile synchronized");
        utter.rate = speechRate;
        utter.pitch = speechPitch;
        
        const voicesList = window.speechSynthesis.getVoices();
        if (selectedVoiceURI) {
          const [uri, name, lang, indexStr] = selectedVoiceURI.split('||');
          const index = parseInt(indexStr, 10);
          
          let voice = voicesList[index];
          if (!voice || voice.voiceURI !== uri || voice.name !== name) {
            voice = voicesList.find(v => v.voiceURI === uri && v.name === name) || 
                    voicesList.find(v => v.voiceURI === uri) || 
                    null;
          }

          if (voice) {
            utter.voice = voice;
            utter.lang = voice.lang;
          }
        }
        
        window.speechSynthesis.speak(utter);
      }, 100);
    }
    prevVoiceRef.current = selectedVoiceURI;
    prevRateRef.current = speechRate;
    prevPitchRef.current = speechPitch;
  }, [selectedVoiceURI, speechRate, speechPitch, isPlayingAudio, speechReady, playNextChunk, activeModal]);

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

    // Transformative Rendering for Audio: Strip artifacts from vocal stream
    const transformedContent = activeDoc.content.replace(/__(\d+)\.__/g, '$1.');
    const html = marked.parse(transformedContent);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html as string;
    
    // TRIPLE-PASS STRIP: Absolute artifact removal for vocal stream
    const cleanText = (tempDiv.textContent || tempDiv.innerText || "")
      .replace(/[\$@#\*:`>_\-\+\[\]\(\)\!@:;=]/g, ' ') // Strip remaining Markdown symbols
      .replace(/\s+/g, ' ')                   
      .trim();

    if (!cleanText) return;

    // Segment Streaming: 1000 characters per segment
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

  const handleFormatTables = () => {
    if (!activeDoc) return;
    const formatted = VaultRefiner.formatTables(activeDoc.content);
    handleContentChange(formatted);
    setNotification({ message: 'Tables Synchronized', type: 'success' });
    setTimeout(() => setNotification(null), 2000);
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
    input.accept = '.docx,.pdf,.txt,.md,.json,.csv';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const { title, content } = await ImportService.processFile(file);
        const refinedContent = VaultRefiner.refine(content);
        
        // Immediate Mock Eviction
        await StorageService.purgeMocks();
        
        // UUID PROVISIONING before DB put to ensure state integrity
        const newId = crypto.randomUUID();
        const newDoc: SovereignDocument = {
          id: newId,
          title,
          content: refinedContent,
          createdAt: Date.now(),
          lastModified: Date.now(),
          status: 'draft',
          metadata: {
            wordCount: content.split(/\s+/).length,
            estimatedReadTime: Math.ceil(content.split(/\s+/).length / 200),
            tags: [],
            audioProgress: 0
          },
          theme: 'obsidian'
        };
        
        await StorageService.saveDocument(newDoc);
        setActiveDocId(newId);
        
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
    <div className={`min-h-screen selection:bg-emerald-vault/30 flex flex-row bg-obsidian text-vault-text`}>
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

      <ConfigModal 
        isOpen={activeModal === 'config'} 
        onClose={() => setActiveModal(null)}
        docCount={documents.length}
        activeFont={activeFont}
        setActiveFont={setActiveFont}
        speechRate={speechRate}
        setSpeechRate={setSpeechRate}
        speechPitch={speechPitch}
        setSpeechPitch={setSpeechPitch}
        selectedVoiceURI={selectedVoiceURI}
        setSelectedVoiceURI={setSelectedVoiceURI}
      />

      <main className="flex-1 flex flex-col relative min-h-full overflow-x-auto">
        <Toolbar 
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onShare={() => {}} 
          onLocalRefine={handleLocalRefine}
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode(!isDarkMode)}
          onListen={handleListen}
          onScan={() => setActiveModal('scanner')}
          onOpenConfig={() => setActiveModal('config')}
          isPlayingAudio={isPlayingAudio}
          vaultSynced={vaultSynced}
        />

        <div className="flex-1 flex relative min-h-0 overflow-hidden">
          {activeDoc ? (
            <>
              <div 
                className={`flex flex-col min-h-full ${mobileTab === 'preview' ? 'hidden md:flex' : 'flex'}`}
                style={{ width: window.innerWidth < 768 ? '100%' : `${splitPosition}%`, minWidth: window.innerWidth < 768 ? '0' : '200px' }}
              >
                <Editor 
                  font={activeFont} 
                  value={activeDoc.content} 
                  onChange={handleContentChange} 
                  onFormat={handleFormatTables}
                  activeDocId={activeDocId} 
                />
              </div>
              
              <div 
                onMouseDown={startResizing}
                onTouchStart={startResizing}
                className="hidden md:flex w-1.5 z-50 h-full bg-vault-border hover:bg-emerald-vault cursor-col-resize items-center justify-center transition-colors group"
              >
                <div className="w-0.5 h-8 bg-vault-dim/20 rounded-full group-hover:bg-emerald-vault/50" />
              </div>

              <div 
                className={`flex flex-col min-h-full bg-obsidian-soft ${mobileTab === 'editor' ? 'hidden md:flex' : 'flex'}`}
                style={{ width: window.innerWidth < 768 ? '100%' : `${100 - splitPosition}%`, minWidth: window.innerWidth < 768 ? '0' : '200px' }}
              >
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

        {/* Mobile Action Bar */}
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