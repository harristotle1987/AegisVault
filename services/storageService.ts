
import { Dexie } from 'dexie';
import type { Table } from 'dexie';
import { SovereignDocument } from '../types';

/**
 * VaultDatabase: Sovereign storage engine using Dexie.js for persistent local states.
 */
export class VaultDatabase extends Dexie {
  documents!: Table<SovereignDocument>;

  constructor() {
    // Correctly initialize Dexie by calling super with the database name.
    super('ObsidianVaultDB');
    
    // Explicitly cast 'this' to any to resolve property name collision between 
    // the 'version' property and 'version()' method in certain TypeScript configurations.
    (this as any).version(1).stores({
      documents: 'id, title, lastModified, status'
    });
  }
}

export const db = new VaultDatabase();

export const StorageService = {
  /**
   * Persists a document to the local vault.
   */
  async saveDocument(doc: SovereignDocument): Promise<void> {
    await db.documents.put(doc);
  },

  /**
   * Retrieves a specific document by ID.
   */
  async getDocument(id: string): Promise<SovereignDocument | undefined> {
    return await db.documents.get(id);
  },

  /**
   * Returns all documents ordered by last modification date.
   */
  async getAllDocuments(): Promise<SovereignDocument[]> {
    return await db.documents.orderBy('lastModified').reverse().toArray();
  },

  /**
   * Purges a document from the local archive.
   */
  async deleteDocument(id: string): Promise<void> {
    await db.documents.delete(id);
  },

  /**
   * Generates a new sovereign document with default metadata.
   */
  async createNewDocument(): Promise<SovereignDocument> {
    const newDoc: SovereignDocument = {
      id: crypto.randomUUID(),
      title: 'Untitled Archive',
      content: '# New Entry\n\nBegin your architectural draft here...',
      createdAt: Date.now(),
      lastModified: Date.now(),
      status: 'draft',
      metadata: {
        wordCount: 0,
        estimatedReadTime: 0,
        tags: []
      },
      theme: 'obsidian'
    };
    await this.saveDocument(newDoc);
    return newDoc;
  }
};
