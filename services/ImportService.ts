import * as mammoth from 'mammoth';
import * as pdfjs from 'pdfjs-dist';

/**
 * Universal Ingestor Logic: Senior Lead Architect
 * Feature: Multi-format Batch Ingestion Bridge
 */
export const ImportService = {
  initialized: false,

  async initPdf() {
    if (this.initialized) return;
    try {
      const pdfjsLib: any = pdfjs;
      // Handle different ESM.sh export structures
      const GlobalWorkerOptions = pdfjsLib.GlobalWorkerOptions || pdfjsLib.default?.GlobalWorkerOptions;
      const version = pdfjsLib.version || pdfjsLib.default?.version || '3.11.174';
      
      if (GlobalWorkerOptions) {
        GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;
      }
      this.initialized = true;
    } catch (e) {
      console.warn("PDF engine initialization deferred:", e);
    }
  },

  /**
   * Sovereign Sanitizer: Absolute regex purge of legacy artifacts and numbering noise.
   */
  sanitize(content: string): string {
    return content
      // Remove __1.__ pattern (and any digit variation)
      .replace(/__\d+\.__/g, '')
      // Remove underscore-digit-underscore variations
      .replace(/_\d+\._/g, '')
      // Remove artifacts like @ or $ symbols often found in math/OCR
      .replace(/[\$@]/g, '')
      // Clean up multiple newlines
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  },

  async processFile(file: File): Promise<{ title: string, content: string }> {
    const extension = file.name.split('.').pop()?.toLowerCase();
    const title = file.name.replace(/\.[^/.]+$/, "");
    
    try {
      let content = '';
      switch (extension) {
        case 'txt':
        case 'md':
          content = await file.text();
          break;
        
        case 'docx':
          const docxBuffer = await file.arrayBuffer();
          // mammoth on esm.sh can sometimes be nested under .default
          const converter = (mammoth as any).convertToMarkdown || (mammoth as any).default?.convertToMarkdown;
          if (!converter) throw new Error("Mammoth engine not found");
          
          const result = await converter({ arrayBuffer: docxBuffer });
          content = result.value || `# ${title}\n\n[Bridge.Notice]: Content converted.`;
          break;

        case 'pdf':
          await this.initPdf();
          content = await this.extractPdfText(file);
          break;

        default:
          throw new Error('Unsupported format.');
      }

      return { title, content: this.sanitize(content) };
    } catch (err) {
      console.error('Ingestion Bridge Failure Detail:', err);
      throw err;
    }
  },

  async extractPdfText(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfjsLib: any = pdfjs;
    const getDocument = pdfjsLib.getDocument || pdfjsLib.default?.getDocument;
    if (!getDocument) throw new Error("PDF engine failure.");

    const loadingTask = getDocument({ data: arrayBuffer, useWorkerFetch: false });
    const pdf = await loadingTask.promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const items = (textContent.items as any[]);
      fullText += items.map(item => item.str).join(' ') + '\n\n';
    }
    
    return fullText.trim();
  }
};