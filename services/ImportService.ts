import * as mammoth from 'mammoth';
import * as pdfjs from 'pdfjs-dist';

/**
 * Universal Ingestor Logic: Senior Lead Architect
 * Feature: Multi-format Batch Ingestion Bridge with Triple-Pass Artifact Scrubbing
 * Resolve: High-resiliency structural conversion for DOCX/PDF.
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
      console.warn("Sovereign PDF engine initialization deferred.");
    }
  },

  /**
   * Triple-Pass Artifact Scrub:
   * Removes sequence sharding artifacts like __1.__, __2.__, etc.
   */
  sanitize(content: string): string {
    return content
      .replace(/__\d+\.__/g, '') // Scrub pattern: underscore underscore digits period underscore underscore
      .replace(/_\d+\._/g, '')   
      .replace(/\d+\.\s\_\_/g, ' ')
      .replace(/@\w+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  },

  /**
   * processFile: Hardened binary bridge for structural conversion.
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
          
          let conversionFn = m.convertToMarkdown || m.default?.convertToMarkdown;
          
          if (typeof conversionFn !== 'function' && typeof m.default === 'function') {
             conversionFn = m.default;
          }

          if (typeof conversionFn !== 'function') {
            throw new Error("Conversion engine handshake failure.");
          }
          
          const result = await conversionFn({ arrayBuffer: new Uint8Array(docxBuffer) });
          content = result.value || `# ${title}\n\n[Bridge.Notice]: Content converted.`;
          break;

        case 'pdf':
          await this.initPdf();
          content = await this.extractPdfText(file);
          break;

        default:
          throw new Error(`Format '${extension}' is not bridged.`);
      }

      return { title, content: this.sanitize(content) };
    } catch (err) {
      console.error('Sovereign Bridge Failure:', err);
      throw new Error(err instanceof Error ? err.message : 'Ingestion sequence interrupted');
    }
  },

  async extractPdfText(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfjsLib: any = pdfjs;
    const getDocument = pdfjsLib.getDocument || pdfjsLib.default?.getDocument;
    
    if (!getDocument) throw new Error("PDF engine handshake failed.");

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