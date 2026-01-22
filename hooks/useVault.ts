
import { useState, useEffect, useCallback } from 'react';
import { StorageService } from '../services/storageService';
import { SovereignDocument } from '../types';

/**
 * Role: Senior Architect
 * Feature: Vault CRUD Logic & Seeding Integration
 * Logic: Ensures absolute local state persistence with automatic recovery.
 */
export const useVault = () => {
  const [documents, setDocuments] = useState<SovereignDocument[]>([]);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const refresh = useCallback(async () => {
    const allDocs = await StorageService.getAllDocuments();
    setDocuments(allDocs);
    return allDocs;
  }, []);

  /**
   * Boot Protocol: Seeds the vault with mock archives if empty on first launch.
   */
  useEffect(() => {
    const initVault = async () => {
      await StorageService.seedIfEmpty();
      const docs = await refresh();
      if (docs.length > 0 && !activeDocId) {
        setActiveDocId(docs[0].id);
      }
    };
    initVault();
  }, [refresh, activeDocId]);

  const saveDraft = useCallback(async (doc: SovereignDocument) => {
    setIsSaving(true);
    try {
      await StorageService.saveDocument(doc);
      await refresh();
    } finally {
      setIsSaving(false);
    }
  }, [refresh]);

  const deleteDraft = useCallback(async (id: string) => {
    await StorageService.deleteDocument(id);
    const updated = await refresh();
    if (activeDocId === id) {
      setActiveDocId(updated[0]?.id || null);
    }
  }, [activeDocId, refresh]);

  const createDraft = useCallback(async () => {
    const newDoc = await StorageService.createNewDocument();
    await refresh();
    setActiveDocId(newDoc.id);
  }, [refresh]);

  /**
   * Atomic Renaming: Overwrites the title without shifting the sorting order mid-keystroke.
   */
  const renameDraft = useCallback(async (id: string, title: string) => {
    await StorageService.renameDocument(id, title);
    // Optimistic local state update to keep the UI fluid and focused
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, title } : d));
  }, []);

  const activeDoc = documents.find(d => d.id === activeDocId) || null;

  return {
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
  };
};
