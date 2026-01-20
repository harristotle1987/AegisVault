
export type ExportFormat = 'pdf' | 'docx';
export type DocumentStatus = 'draft' | 'vault';
export type VaultTheme = 'obsidian' | 'minimal' | 'executive';

export interface SovereignDocument {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  lastModified: number;
  status: DocumentStatus;
  metadata: {
    wordCount: number;
    estimatedReadTime: number;
    tags: string[];
  };
  theme: VaultTheme;
}

export interface AppState {
  documents: SovereignDocument[];
  activeDocumentId: string | null;
  isExporting: boolean;
  isSaving: boolean;
}
