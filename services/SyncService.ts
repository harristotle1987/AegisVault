import { StorageService } from './storageService';
import { SovereignDocument } from '../types';

/**
 * Cloud Shadow Sync Protocol
 * Role: Senior Lead Architect
 * Feature: Decentralized Vault Mirroring (No-Backend)
 * Logic: Encapsulates all HD Plates and Markdown Shards into a Portable Sovereign Binary.
 */
export const SyncService = {
  /**
   * Generates a 'Vault Shadow' - a portable binary shard containing the entire archive.
   */
  async generateVaultShadow(): Promise<Blob> {
    const documents = await StorageService.getAllDocuments();
    const shadowPayload = {
      version: '1.1.0',
      timestamp: Date.now(),
      documents,
      signature: 'SOVEREIGN_VAULT_SHADOW'
    };
    
    const jsonString = JSON.stringify(shadowPayload);
    return new Blob([jsonString], { type: 'application/vault-shadow' });
  },

  /**
   * Ingests a 'Vault Shadow' to mirror the state of another device.
   * Performs a non-destructive merge (unique ID reconciliation).
   */
  async ingestVaultShadow(file: File): Promise<{ success: number; skipped: number }> {
    const text = await file.text();
    const payload = JSON.parse(text);
    
    if (payload.signature !== 'SOVEREIGN_VAULT_SHADOW') {
      throw new Error('Invalid Shadow Protocol Identifier.');
    }

    const remoteDocs: SovereignDocument[] = payload.documents;
    const localDocs = await StorageService.getAllDocuments();
    const localIds = new Set(localDocs.map(d => d.id));
    
    let success = 0;
    let skipped = 0;

    for (const doc of remoteDocs) {
      if (!localIds.has(doc.id)) {
        await StorageService.saveDocument(doc);
        success++;
      } else {
        // Resolve conflict: If remote is newer, overwrite.
        const local = localDocs.find(d => d.id === doc.id);
        if (local && doc.lastModified > local.lastModified) {
          await StorageService.saveDocument(doc);
          success++;
        } else {
          skipped++;
        }
      }
    }

    return { success, skipped };
  }
};