
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
3. **Volatile Processing**: Refinement occurs in-situ, leaving no forensic trace on external servers.

### Implementation Protocol

* **Render**: Live GFM translation with real-time feedback.
* **Harden**: Structural refinement via VaultRefiner logic.
* **Beam**: Secure binary delivery directly to the file system.

--- 

### Confidential Notes
*Draft Version: 1.0.4*
*Security Clearance: ARCHITECT*`,
    status: 'vault',
    metadata: { wordCount: 142, estimatedReadTime: 1, tags: ['Philosophy', 'Manifesto', 'Sovereignty'] },
    theme: 'obsidian'
  },
  {
    title: 'Aegis V1: Technical Specification',
    content: `# Technical Specification: Aegis Shield

## System Overview

This archive details the architectural hardening of the AegisVault conversion pipeline. 

### 1. Vector Rendering Engine

* **Format**: PDF/A-3 Compliance
* **Typography**: Base64 VFS Embedding (Inter/Mono)
* **Margin Logic**: ISO 216 Standard (A4 Dimensions)

### 2. Encryption Layers

\`\`\`javascript
// Secure Zero-Knowledge Hash Implementation
const finalizeShard = (data) => {
  return crypto.subtle.digest('SHA-256', data);
}

console.log("Integrity Verified");
\`\`\`

### 3. Structural Intelligence

Our refinement logic utilizes complex regex sharding to standardize vertical rhythm and executive spacing. This ensures that every exported shard maintains a professional cadence, regardless of input quality.

> "Complexity is the enemy of security." - Vault Architect`,
    status: 'draft',
    metadata: { wordCount: 125, estimatedReadTime: 1, tags: ['Technical', 'Specification', 'Security'] },
    theme: 'minimal'
  },
  {
    title: 'Vault User Guide: Tactical Operations',
    content: `# Tactical Guide: Managing Your Shards

Welcome to the **Sovereign Editor**. This document serves as your operational manual for the vault environment.

## Core Operations

### 1. Provisioning
Click the **Provision Entry** button in the sidebar to create a new volatile memory shard. Each shard is unique and locally persistent.

### 2. Hardening (Local Refine)
Use the **Harden** tool (Brush icon) to apply structural intelligence to your text. This will:
* Fix curly quotes and typographic symbols.
* Standardize vertical whitespace.
* Inject professional headers.

### 3. Beaming (Exporting)
When your archive is ready for finalization, choose between **PDF** or **DOCX**. 

1. **Select** your target format.
2. **Sanitize** the identifier (Filename).
3. **Execute** the binary export.
4. **View Shard** immediately within the browser to verify integrity.

--- 

*End of transmission.*`,
    status: 'draft',
    metadata: { wordCount: 168, estimatedReadTime: 1, tags: ['Tutorial', 'Guide', 'Ops'] },
    theme: 'executive'
  }
];

export const StorageService = {
  /**
   * Seeding Protocol: Injects high-quality mocks if the vault is empty.
   */
  async seedIfEmpty(): Promise<void> {
    const count = await db.documents.count();
    if (count === 0) {
      console.log('🛡️ Vault: Seeding high-fidelity archives...');
      const now = Date.now();
      for (let i = 0; i < MOCK_ARCHIVES.length; i++) {
        const mock = MOCK_ARCHIVES[i];
        await db.documents.add({
          ...mock,
          id: crypto.randomUUID(),
          createdAt: now - (i * 1000), 
          lastModified: now - (i * 1000)
        } as SovereignDocument);
      }
    }
  },

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
   * Atomic Rename Protocol: Updates only the title field to ensure stable sorting during edits.
   */
  async renameDocument(id: string, title: string): Promise<void> {
    await db.documents.update(id, { title });
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
