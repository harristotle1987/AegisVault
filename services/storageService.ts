
import { Dexie } from 'dexie';
import type { Table } from 'dexie';
import { SovereignDocument } from '../types';

/**
 * VaultDatabase: Sovereign storage engine using Dexie.js for persistent local states.
 */
export class VaultDatabase extends Dexie {
  documents!: Table<SovereignDocument>;

  constructor() {
    super('ObsidianVaultDB');
    (this as any).version(1).stores({
      documents: 'id, title, lastModified, status'
    });
  }
}

export const db = new VaultDatabase();

export const StorageService = {
  /**
   * Persists a document and ensures the timeline is updated.
   */
  async saveDocument(doc: SovereignDocument): Promise<void> {
    await db.documents.put({
      ...doc,
      lastModified: Date.now()
    });
  },

  /**
   * Retrieves a specific document by ID.
   */
  async getDocument(id: string): Promise<SovereignDocument | undefined> {
    return await db.documents.get(id);
  },

  /**
   * Returns all documents ordered by last modification date (DESC).
   */
  async getAllDocuments(): Promise<SovereignDocument[]> {
    return await db.documents.orderBy('lastModified').reverse().toArray();
  },

  /**
   * Purges a document from the local archive permanently.
   */
  async deleteDocument(id: string): Promise<void> {
    await db.documents.delete(id);
  },

  /**
   * Generates a new sovereign document with executive metadata.
   */
  async createNewDocument(): Promise<SovereignDocument> {
    const newDoc: SovereignDocument = {
      id: crypto.randomUUID(),
      title: 'New Archive Shard',
      content: '# Sovereign Entry\n\nBegin your architectural draft here...',
      createdAt: Date.now(),
      lastModified: Date.now(),
      status: 'draft',
      metadata: {
        wordCount: 0,
        estimatedReadTime: 1,
        tags: []
      },
      theme: 'obsidian'
    };
    await this.saveDocument(newDoc);
    return newDoc;
  }
};
