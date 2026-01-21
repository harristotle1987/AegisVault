
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
    // Added missing backtick to properly close the template literal
    content: `# The Philosophy of Digital Sovereignty\n\n> "Privacy is not a feature; it is the foundation of the modern architect."\n\nIn an era of centralized sharding and data harvesting, the **Sovereign Vault** stands as a beacon of local-first integrity. Your ideas are not commodities; they are assets that require a hardened environment for refinement.\n\n## The Three Pillars\n\n1. **Absolute Locality**: Data never crosses the wire. Every byte of markdown is processed within the browser's volatile memory.\n2. **Typographic Integrity**: We utilize professional-grade sharding for Inter and JetBrains Mono to ensure your exports are executive-ready.\n3. **Volatile Processing**: Refinement occurs in-situ, leaving no forensic trace on external servers.\n\n### Implementation Protocol\n\n* **Render**: Live GFM translation with real-time feedback.\n* **Harden**: Structural refinement via VaultRefiner logic.\n* **Beam**: Secure binary delivery directly to the file system.\n\n--- \n\n### Confidential Notes\n*Draft Version: 1.0.4*\n*Security Clearance: ARCHITECT*"`,
    status: 'vault',
    metadata: { wordCount: 142, estimatedReadTime: 1, tags: ['Philosophy', 'Manifesto', 'Sovereignty'] },
    theme: 'obsidian'
  },
  {
    title: 'Aegis V1: Technical Specification',
    content: `# Technical Specification: Aegis Shield\n\n## System Overview\n\nThis archive details the architectural hardening of the AegisVault conversion pipeline. \n\n### 1. Vector Rendering Engine\n\n* **Format**: PDF/A-3 Compliance\n* **Typography**: Base64 VFS Embedding (Inter/Mono)\n* **Margin Logic**: ISO 216 Standard (A4 Dimensions)\n\n### 2. Encryption Layers\n\n\`\`\`javascript\n// Secure Zero-Knowledge Hash Implementation\nconst finalizeShard = (data) => {\n  return crypto.subtle.digest('SHA-256', data);\n}\n\nconsole.log("Integrity Verified");\n\`\`\`\n\n### 3. Structural Intelligence\n\nOur refinement logic utilizes complex regex sharding to standardize vertical rhythm and executive spacing. This ensures that every exported shard maintains a professional cadence, regardless of input quality.\n\n> "Complexity is the enemy of security." - Vault Architect`,
    status: 'draft',
    metadata: { wordCount: 125, estimatedReadTime: 1, tags: ['Technical', 'Specification', 'Security'] },
    theme: 'minimal'
  },
  {
    title: 'Vault User Guide: Tactical Operations',
    content: `# Tactical Guide: Managing Your Shards\n\nWelcome to the **Sovereign Editor**. This document serves as your operational manual for the vault environment.\n\n## Core Operations\n\n### 1. Provisioning\nClick the **Provision Entry** button in the sidebar to create a new volatile memory shard. Each shard is unique and locally persistent.\n\n### 2. Hardening (Local Refine)\nUse the **Harden** tool (Brush icon) to apply structural intelligence to your text. This will:\n* Fix curly quotes and typographic symbols.\n* Standardize vertical whitespace.\n* Inject professional headers.\n\n### 3. Beaming (Exporting)\nWhen your archive is ready for finalization, choose between **PDF** or **DOCX**. \n\n1. **Select** your target format.\n2. **Sanitize** the identifier (Filename).\n3. **Execute** the binary export.\n4. **View Shard** immediately within the browser to verify integrity.\n\n--- \n\n*End of transmission.*`,
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
      // Use for...of to maintain order
      for (let i = 0; i < MOCK_ARCHIVES.length; i++) {
        const mock = MOCK_ARCHIVES[i];
        await db.documents.add({
          ...mock,
          id: crypto.randomUUID(),
          createdAt: now - (i * 1000), // Offset slightly for sorting
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
