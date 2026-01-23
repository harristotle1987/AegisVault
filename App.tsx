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
import { InstallPrompt } from './components/InstallPrompt';
import { ScannerOverlay } from './components/ScannerOverlay';
import { VaultRefiner } from './services/localRefineService';
import { VaultConverter } from './services/exportService';
import { useVault } from './hooks/useVault';
// Added ExportFormat to resolve missing type usage in pendingFormat state
import { VaultFont, ExportFormat } from './types';
import { Shield, ShieldCheck, Volume2, BookOpen, Scan } from 'lucide-react';
import { marked } from 'marked';

type ModalType = 'config' | 'tags' | 'purge' | 'scanner' | 'export' | 'success' | null;

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
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [activeFont, setActiveFont] = useState<VaultFont>('sans');
  const [docToPurge, setDocToPurge] = useState<string | null>(null);
  const [vaultSynced, setVaultSynced] = useState(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isWindows, setIsWindows] = useState(false);
  // Added pendingFormat state to resolve 'Cannot find name' errors in export flow
  const [pendingFormat, setPendingFormat] = useState<ExportFormat | null>(null);

  const saveTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsMobile(/android|iphone|ipad|ipod/i.test(userAgent));
    setIsWindows(/windows|win32/i.test(userAgent));
  }, []);

  // Async Audio Synthesis Init
  const handleListen = useCallback(() => {
    if (!activeDoc) return;
    
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const html = marked.parse(activeDoc.content);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html as string;
    
    // Scrubber Logic: Read Rendered Text, Strip MD symbols and artifacts
    const scrubbedText = (tempDiv.textContent || tempDiv.innerText || "")
      .replace(/__\d+\.__/g, '') 
      .replace(/[\$@#\*:`>_\-\+\[\]\(\)\!@:;=]/g, ' ') 
      .replace(/\s+/g, ' ')                   
      .trim();

    if (!scrubbedText) return;

    const utter = new SpeechSynthesisUtterance(scrubbedText);
    utter.onstart = () => setIsPlayingAudio(true);
    utter.onend = () => setIsPlayingAudio(false);
    utter.onerror = () => setIsPlayingAudio(false);
    
    // Async Start to prevent main thread blocking on mobile
    setTimeout(() => {
      window.speechSynthesis.speak(utter);
    }, 50);
  }, [activeDoc]);

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
    setNotification({ message: 'Shard Hardened', type: 'success' });
    setTimeout(() => setNotification(null), 2000);
  };

  const handleScannerCapture = (base64Img: string) => {
    if (!activeDoc) return;
    const imgMarkdown = `\n\n![Sovereign Image Plate](${base64Img})\n\n`;
    handleContentChange(activeDoc.content + imgMarkdown);
    setActiveModal(null);
  };

  return (
    <div className="fixed inset-0 overflow-hidden flex flex-row bg-black text-white">
      {isSidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-[10000]" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {(!isWindows || isMobile) && (
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
          />
        </div>
      )}

      <main className="flex-1 flex flex-col relative overflow-hidden h-full">
        <Toolbar 
          showMenu={!isWindows || isMobile}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <div className="flex-1 flex overflow-hidden relative min-h-0">
          {activeDoc ? (
            <>
              <div className={`flex-1 flex flex-col h-full overflow-hidden ${mobileTab === 'preview' ? 'hidden md:flex' : 'flex'}`}>
                <Editor font={activeFont} value={activeDoc.content} onChange={handleContentChange} activeDocId={activeDocId} />
              </div>
              <div className="hidden md:block w-px z-10 h-full bg-vault-border" />
              <div className={`flex-1 flex flex-col h-full overflow-hidden bg-obsidian ${mobileTab === 'editor' ? 'hidden md:flex' : 'flex'}`}>
                <Preview font={activeFont} content={activeDoc.content} activeDocId={activeDocId} />
              </div>
            </>
          ) : (
             <div className="flex-1 flex items-center justify-center text-vault-dim uppercase tracking-widest text-xs font-bold">No Active Shard</div>
          )}
        </div>

        {/* Action Bank: Anti-Overlap Logic */}
        <div 
          className={`fixed top-4 right-4 md:right-8 flex items-center gap-10 z-[10002] transition-all duration-300 origin-right ${
            isSidebarOpen && isMobile ? 'scale-[0.7] translate-x-12 opacity-40' : 'scale-100 translate-x-0'
          }`}
        >
           <button onClick={() => setActiveModal('scanner')} className="flex flex-col items-center gap-1 group">
             <div className="p-2.5 bg-white/5 border border-white/10 rounded-full text-emerald-vault group-hover:bg-emerald-vault/20 transition-all">
               <Scan size={20} />
             </div>
             <span className="text-[9px] font-black uppercase tracking-widest text-white/80">Scan</span>
           </button>

           <button onClick={handleListen} className="flex flex-col items-center gap-1 group">
             <div className={`p-2.5 border rounded-full transition-all ${isPlayingAudio ? 'bg-emerald-vault text-black shadow-emerald-glow' : 'bg-white/5 border-white/10 text-emerald-vault group-hover:bg-emerald-vault/20'}`}>
               {isPlayingAudio ? <BookOpen size={20} className="animate-pulse" /> : <Volume2 size={20} />}
             </div>
             <span className="text-[9px] font-black uppercase tracking-widest text-white/80">Listen</span>
           </button>
           
           <div className="p-1 border-l border-white/10 pl-8 flex flex-col items-center gap-1 shrink-0 opacity-40">
             <div className={`w-2 h-2 rounded-full transition-all duration-700 ${vaultSynced ? "bg-emerald-vault/20" : "bg-emerald-vault animate-pulse shadow-emerald-glow"}`} />
             <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">Saved</span>
           </div>
        </div>

        <MobileActionBar 
          onHarden={handleLocalRefine}
          onExportDocx={() => { setPendingFormat('docx'); setActiveModal('export'); }}
          onExportPdf={() => { setPendingFormat('pdf'); setActiveModal('export'); }}
        />
        
        <div className="md:hidden fixed bottom-40 right-6 z-[9999]">
           <button 
             onClick={() => setMobileTab(prev => prev === 'editor' ? 'preview' : 'editor')} 
             className="w-14 h-14 rounded-full bg-emerald-vault text-black flex items-center justify-center shadow-lg active:scale-90 transition-transform"
           >
             <Shield size={28} />
           </button>
        </div>

        {notification && (
          <div className="fixed top-24 right-8 z-[250] flex items-center gap-3 px-5 py-3 rounded-xl border backdrop-blur-md bg-emerald-vault/10 border-emerald-vault/30 text-emerald-vault">
            <ShieldCheck size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">{notification.message}</span>
          </div>
        )}
      </main>

      {activeModal === 'scanner' && <ScannerOverlay onCapture={handleScannerCapture} onClose={() => setActiveModal(null)} />}
      <InstallPrompt forceAndroidOnly={true} />
      <ConfigModal isOpen={activeModal === 'config'} onClose={() => setActiveModal(null)} docCount={documents.length} activeFont={activeFont} setActiveFont={setActiveFont} />
      <TagsModal isOpen={activeModal === 'tags'} onClose={() => setActiveModal(null)} documents={documents} />
      <PurgeModal isOpen={activeModal === 'purge'} onConfirm={async () => { docToPurge && await deleteDraft(docToPurge); setActiveModal(null); }} onCancel={() => setActiveModal(null)} draftTitle={documents.find(d => d.id === docToPurge)?.title || ""} />
      <ExportModal initialName={activeDoc?.title || ""} format={pendingFormat} onConfirm={async (name) => {
        if (!activeDoc || !pendingFormat) return;
        try {
          if (pendingFormat === 'pdf') await VaultConverter.toPDF(activeDoc.content, `${name}.pdf`, activeFont);
          else await VaultConverter.toDocx(activeDoc.content, `${name}.docx`);
          setActiveModal('success');
        } catch (e) { setNotification({ message: 'Export failure', type: 'error' }); }
        finally { setPendingFormat(null); }
      }} onCancel={() => { setActiveModal(null); setPendingFormat(null); }} />
      <DownloadSuccessModal isOpen={activeModal === 'success'} onClose={() => setActiveModal(null)} fileName="" format={null} blobUrl={null} />
    </div>
  );
}
