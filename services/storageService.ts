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

const MOCK_ARCHIVES: Omit<SovereignDocument, 'id' | 'createdAt' | 'lastModified'>[] = [
  {
    title: 'Executive Manifesto: Digital Sovereignty',
    content: `# The Philosophy of Digital Sovereignty

> "Privacy is not a feature; it is the foundation of the modern architect."

In an era of centralized sharding and data harvesting, the **Sovereign Vault** stands as a beacon of local-first integrity. Your ideas are not commodities; they are assets that require a hardened environment for refinement.

## The Three Pillars

1. **Absolute Locality**: Data never crosses the wire. Every byte of markdown is processed within the browser's volatile memory.
2. **Typographic Integrity**: We utilize professional-grade sharding for Inter and JetBrains Mono to ensure your exports are executive-ready.
3. **Volatile Processing**: Refinement occurs in-situ, leaving no forensic trace on external servers.`,
    status: 'vault',
    metadata: { wordCount: 142, estimatedReadTime: 1, tags: ['Philosophy', 'Manifesto', 'Sovereignty'] },
    theme: 'obsidian'
  }
];

export const StorageService = {
  /**
   * Seeding Protocol: Injects high-quality mocks if the vault is empty.
   */
  async seedIfEmpty(): Promise<void> {
    const count = await db.documents.count();
    if (count === 0) {
      const now = Date.now();
      for (let i = 0; i < MOCK_ARCHIVES.length; i++) {
        const mock = MOCK_ARCHIVES[i];
        await db.documents.put({
          ...mock,
          id: `mock-${i}`, 
          createdAt: now - (i * 1000), 
          lastModified: now - (i * 1000)
        } as SovereignDocument);
      }
    }
  },

  /**
   * Absolute Mock Purge: Evicts all placeholder data from the registry.
   */
  async purgeMocks(): Promise<void> {
    const mocks = await db.documents.filter(doc => doc.id.startsWith('mock-')).toArray();
    for (const mock of mocks) {
      await db.documents.delete(mock.id);
    }
  },

  async saveDocument(doc: SovereignDocument): Promise<void> {
    if (!doc.id) {
      throw new Error("Provisioning Failure: Primary Key missing from entry.");
    }
    await db.documents.put({
      ...doc,
      lastModified: Date.now()
    });
  },

  async renameDocument(id: string, title: string): Promise<void> {
    await db.documents.update(id, { title });
  },

  async getDocument(id: string): Promise<SovereignDocument | undefined> {
    return await db.documents.get(id);
  },

  async getAllDocuments(): Promise<SovereignDocument[]> {
    return await db.documents.orderBy('lastModified').reverse().toArray();
  },

  async deleteDocument(id: string): Promise<void> {
    await db.documents.delete(id);
  },

  /**
   * Provisions a new shard and purges all mocks to ensure workspace sovereignty.
   */
  async createNewDocument(): Promise<SovereignDocument> {
    await this.purgeMocks();
    
    const newDoc: SovereignDocument = {
      id: crypto.randomUUID(),
      title: 'New Sovereign Entry',
      content: '# Sovereign Entry\n\nBegin architectural draft...',
      createdAt: Date.now(),
      lastModified: Date.now(),
      status: 'draft',
      metadata: {
        wordCount: 0,
        estimatedReadTime: 1,
        tags: [],
        audioProgress: 0
      },
      theme: 'obsidian'
    };
    await db.documents.put(newDoc);
    return newDoc;
  }
};