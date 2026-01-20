
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
import { VaultRefiner } from './services/vaultRefiner';
import { SovereignDocument } from './types';
import { Check, Shield, Cpu, Sparkles, FileText } from 'lucide-react';
import { usePWAInstall } from './hooks/usePWAInstall';
import { GoogleGenAI } from "@google/genai";

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
  const [isAIRefining, setIsAIRefining] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [pendingFormat, setPendingFormat] = useState<'pdf' | 'docx' | null>(null);
  const [suggestedName, setSuggestedName] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  
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
      } else if (!activeDocId && allDocs.length > 0) {
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
        const sorted = [updatedDoc, ...others].sort((a, b) => b.lastModified - a.lastModified);
        return sorted;
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

  const handleAIRefine = async () => {
    if (!activeDoc || isAIRefining) return;
    setIsAIRefining(true);
    try {
      // Hardened Initialization: Create fresh instance with API Key for every request
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Refine this markdown document for a sovereign, executive audience. 
        Enforce perfect vertical rhythm, clear hierarchies, and professional clarity. 
        Do not change the fundamental meaning. Return only the refined markdown.
        
        DOCUMENT:
        ${activeDoc.content}`,
        config: {
          systemInstruction: "You are an elite sovereign editor for high-stakes documentation. Your output is precise, structured, and typographically superior.",
          temperature: 0.4
        }
      });
      
      const refinedContent = response.text || activeDoc.content;
      handleContentChange(refinedContent);
      if ('vibrate' in navigator) navigator.vibrate([20, 10, 20]);
      setNotification({ message: 'Executive AI hardening applied', type: 'success' });
    } catch (err) {
      console.error("AI Protocol Failure:", err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown Protocol Error';
      setNotification({ message: `AI Protocol failure: ${errorMessage}`, type: 'error' });
    } finally {
      setIsAIRefining(false);
    }
  };

  const handleCreateNew = async () => {
    const newDoc = await StorageService.createNewDocument();
    setDocuments(prev => [newDoc, ...prev]);
    setActiveDocId(newDoc.id);
    setIsSidebarOpen(false);
    setMobileTab('editor');
    if ('vibrate' in navigator) navigator.vibrate(10);
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
    // Immediate state update, delayed persistence handled by effect if needed, but direct save is safer here
    if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = window.setTimeout(() => persistChanges(updated), 800);
  };

  const handleShare = async () => {
    if (!activeDoc) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: activeDoc.title,
          text: activeDoc.content,
          // url: REMOVED. Passing local/file URLs causes 'Invalid URL' errors in many contexts.
          // Sharing raw text/title is more sovereign and compatible.
        });
        setNotification({ message: 'Beam successful', type: 'success' });
      } else {
         await navigator.clipboard.writeText(activeDoc.content);
         setNotification({ message: 'Copied to clipboard', type: 'success' });
      }
    } catch (err) {
      // Ignore user aborts, alert on real errors
      if ((err as Error).name !== 'AbortError') {
         console.error('Beam failed:', err);
         setNotification({ message: 'Beam aborted', type: 'error' });
      }
    }
  };

  const handleExport = async (name: string) => {
    if (!activeDoc || !pendingFormat) return;
    setIsExporting(true);
    setActiveModal(null);
    try {
      if (pendingFormat === 'pdf') {
        // Ensure Preview is rendered (even if hidden) for ID capture
        await VaultConverter.toPDF('preview-area', name);
      } else {
        await VaultConverter.toDocx(activeDoc.content, name);
      }
      setNotification({ message: 'Export sequence complete', type: 'success' });
    } catch (e) {
      console.error(e);
      setNotification({ message: 'Export failed', type: 'error' });
    } finally {
      setIsExporting(false);
      setPendingFormat(null);
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
          isAIRefining={isAIRefining}
          onExport={(format) => {
             setPendingFormat(format);
             setSuggestedName(activeDoc?.title || "vault-export");
             setActiveModal('export');
          }}
          onShare={handleShare}
          onLocalRefine={handleLocalRefine}
          onAIRefine={handleAIRefine}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenTags={() => setActiveModal('tags')}
          onOpenConfig={() => setActiveModal('config')}
        />

        <div className="flex-1 flex overflow-hidden relative">
          {activeDoc ? (
            <>
              {/* Mobile: Toggle Visibility based on Tab State */}
              <div className={`flex-1 flex flex-col h-full overflow-hidden ${mobileTab === 'preview' ? 'hidden md:flex' : 'flex'}`}>
                <Editor value={activeDoc.content} onChange={handleContentChange} />
              </div>
              
              {/* Vertical Divider (Desktop) */}
              <div className="hidden md:block w-px bg-vault-border z-10" />

              {/* Preview Area: Always mount for PDF generation, hide via CSS on mobile if needed */}
              <div className={`flex-1 flex flex-col h-full overflow-hidden bg-obsidian-soft ${mobileTab === 'editor' ? 'hidden md:flex' : 'flex'}`}>
                <Preview content={activeDoc.content} />
              </div>
            </>
          ) : (
             <div className="flex-1 flex items-center justify-center text-vault-dim opacity-50 uppercase tracking-widest text-xs font-bold">
               No Active Shard
             </div>
          )}
        </div>

        {/* Mobile Action Bar */}
        <MobileActionBar 
          isExporting={isExporting}
          onExport={(format) => {
             setPendingFormat(format);
             setSuggestedName(activeDoc?.title || "vault-export");
             setActiveModal('export');
          }}
          onLocalRefine={handleLocalRefine}
        />
        
        {/* Mobile View Toggle (Floating) - If strict tabs are preferred over the action bar integration */}
        <div className="md:hidden fixed bottom-24 right-6 z-[120]">
           <button 
             onClick={() => setMobileTab(prev => prev === 'editor' ? 'preview' : 'editor')}
             className="w-12 h-12 rounded-full bg-emerald-vault text-black flex items-center justify-center shadow-lg shadow-emerald-vault/30 active:scale-90 transition-transform"
           >
             {mobileTab === 'editor' ? <Check size={20} /> : <FileText size={20} />}
           </button>
        </div>

        {/* Global Notification Toast */}
        <div className={`fixed top-20 right-6 z-[200] transition-all duration-500 transform ${notification ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0 pointer-events-none'}`}>
          {notification && (
            <div className={`flex items-center gap-3 px-5 py-3 rounded-xl border backdrop-blur-md shadow-2xl ${
              notification.type === 'success' 
                ? 'bg-emerald-vault/10 border-emerald-vault/30 text-emerald-vault' 
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
              {notification.type === 'success' ? <Check size={16} /> : <Shield size={16} />}
              <span className="text-xs font-bold uppercase tracking-wider">{notification.message}</span>
            </div>
          )}
        </div>
      </main>

      {/* Modals Layer */}
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
      />
      <TagsModal 
        isOpen={activeModal === 'tags'} 
        onClose={() => setActiveModal(null)}
        documents={documents}
      />
    </div>
  );
}
