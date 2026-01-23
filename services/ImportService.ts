
import * as mammoth from 'mammoth';
import * as pdfjs from 'pdfjs-dist';

/**
 * Universal Ingestor Logic: Senior Lead Architect
 * Feature: Multi-format Batch Ingestion Bridge
 * Resolve: High-resiliency handshake for esm.sh modules.
 */
export const ImportService = {
  initialized: false,

  async initPdf() {
    if (this.initialized) return;
    try {
      // Handle the complex export structure of pdfjs-dist on esm.sh
      const pdfjsLib: any = pdfjs;
      const GlobalWorkerOptions = pdfjsLib.GlobalWorkerOptions || pdfjsLib.default?.GlobalWorkerOptions;
      const version = pdfjsLib.version || pdfjsLib.default?.version || '3.11.174';
      
      if (GlobalWorkerOptions) {
        GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;
      }
      this.initialized = true;
    } catch (e) {
      console.warn("Sovereign PDF engine initialization deferred.");
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
          const docxBuffer = await file.arrayBuffer();
          const m: any = mammoth;
          
          // prioritize property access, then default object access, then the module itself
          let conversionFn = m.convertToMarkdown || m.default?.convertToMarkdown;
          
          if (typeof conversionFn !== 'function' && typeof m.default === 'function') {
             conversionFn = m.default;
          }

          if (typeof conversionFn !== 'function') {
            console.error("Mammoth Resolution Failure. Module Keys:", Object.keys(m));
            throw new Error("Conversion engine (Mammoth) failed to resolve correctly.");
          }
          
          const result = await conversionFn({ arrayBuffer: new Uint8Array(docxBuffer) });
          content = result.value || `# ${title}\n\n[Bridge.Notice]: Content converted.`;
          break;

        case 'pdf':
          await this.initPdf();
          content = await this.extractPdfText(file);
          break;

        default:
          throw new Error(`Format '${extension}' is not currently bridged.`);
      }

      return { title, content: this.sanitize(content) };
    } catch (err) {
      console.error('Sovereign Bridge Failure Detail:', err);
      const msg = err instanceof Error ? err.message : 'Bridge failure: Ingestion sequence interrupted';
      throw new Error(msg);
    }
  },

  async extractPdfText(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfjsLib: any = pdfjs;
    const getDocument = pdfjsLib.getDocument || pdfjsLib.default?.getDocument;
    
    if (!getDocument) throw new Error("PDF engine (pdfjs) handshake failed.");

    const loadingTask = getDocument({ data: new Uint8Array(arrayBuffer), useWorkerFetch: false });
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
