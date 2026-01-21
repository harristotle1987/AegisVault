
import { useState, useEffect, useCallback } from 'react';
import { StorageService } from '../services/storageService';
import { SovereignDocument } from '../types';

/**
 * Role: Senior Architect
 * Feature: Vault CRUD Logic
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
    return newDoc;
  }, [refresh]);

  const renameDraft = useCallback(async (id: string, title: string) => {
    const doc = documents.find(d => d.id === id);
    if (!doc) return;
    const updated = { ...doc, title };
    await StorageService.saveDocument(updated);
    await refresh();
  }, [documents, refresh]);

  useEffect(() => {
    const init = async () => {
      const docs = await refresh();
      if (docs.length > 0 && !activeDocId) {
        setActiveDocId(docs[0].id);
      }
    };
    init();
  }, [refresh]);

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
