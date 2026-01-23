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
      const GlobalWorkerOptions = pdfjsLib.GlobalWorkerOptions || pdfjsLib.default?.GlobalWorkerOptions;
      const version = pdfjsLib.version || pdfjsLib.default?.version || '3.11.174';
      
      if (GlobalWorkerOptions) {
        GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;
      }
      this.initialized = true;
    } catch (e) {
      console.warn("PDF engine initialization deferred.");
    }
  },

  sanitize(content: string): string {
    return content
      .replace(/__\d+\.__/g, '')
      .replace(/_\d+\._/g, '')
      .replace(/\d+\.\s\_\_/g, ' ')
      .replace(/@\w+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  },

  /**
   * processFile: Hardened binary bridge for local ingestion.
   */
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
          const arrayBuffer = await file.arrayBuffer();
          // Multi-path library resolution for mammoth
          const m: any = mammoth;
          const converter = m.convertToMarkdown || m.default?.convertToMarkdown;
          
          if (!converter) throw new Error("Conversion engine handshake failed.");
          
          const result = await converter({ arrayBuffer: new Uint8Array(arrayBuffer) });
          content = result.value || `# ${title}\n\n[Bridge.Notice]: Content converted.`;
          break;

        case 'pdf':
          await this.initPdf();
          content = await this.extractPdfText(file);
          break;

        default:
          throw new Error('Unsupported binary format.');
      }

      return { title, content: this.sanitize(content) };
    } catch (err) {
      console.error('Sovereign Bridge Failure Trace:', err);
      throw err;
    }
  },

  async extractPdfText(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfjsLib: any = pdfjs;
    const getDocument = pdfjsLib.getDocument || pdfjsLib.default?.getDocument;
    if (!getDocument) throw new Error("PDF engine handshake failed.");

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