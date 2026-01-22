import { StorageService } from './storageService';
import { SovereignDocument } from '../types';

/**
 * Cloud Shadow Sync Protocol
 * Role: Senior Lead Architect
 * Feature: Decentralized Vault Mirroring (Pretty-Printed Readable JSON)
 */
export const SyncService = {
  /**
   * Generates a 'Vault Shadow' - pretty-printed JSON for readable forensic inspection.
   */
  async generateVaultShadow(): Promise<Blob> {
    const documents = await StorageService.getAllDocuments();
    const shadowPayload = {
      version: '1.2.0',
      timestamp: Date.now(),
      documents,
      signature: 'SOVEREIGN_VAULT_SHADOW'
    };
    
    // Pretty-printed for user readability as requested
    const jsonString = JSON.stringify(shadowPayload, null, 2);
    return new Blob([jsonString], { type: 'application/json' });
  },

  /**
   * Ingests a 'Vault Shadow' with high-fidelity validation and resilient parsing.
   */
  async ingestVaultShadow(file: File): Promise<{ success: number; skipped: number }> {
    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      
      if (!payload || payload.signature !== 'SOVEREIGN_VAULT_SHADOW') {
        throw new Error('Invalid Shadow Protocol Identifier.');
      }

      const remoteDocs: SovereignDocument[] = payload.documents;
      if (!Array.isArray(remoteDocs)) {
        throw new Error('Corrupt Shadow Document Array.');
      }

      const localDocs = await StorageService.getAllDocuments();
      const localIds = new Set(localDocs.map(d => d.id));
      
      let success = 0;
      let skipped = 0;

      for (const doc of remoteDocs) {
        if (!localIds.has(doc.id)) {
          // New shard discovery
          await StorageService.importDocument(doc);
          success++;
        } else {
          // Conflict Resolution: Remote shard must have a newer modification timestamp to trigger override
          const local = localDocs.find(d => d.id === doc.id);
          if (local && doc.lastModified > local.lastModified) {
            await StorageService.importDocument(doc);
            success++;
          } else {
            skipped++;
          }
        }
      }

      return { success, skipped };
    } catch (err) {
      console.error('Shadow Ingestion Critical Failure:', err);
      throw new Error('Sovereign Import Protocol Terminated: Data structure corruption detected.');
    }
  }
};