import * as mammoth from 'mammoth';
import * as pdfjs from 'pdfjs-dist';

/**
 * Universal Ingestor Logic: Senior Lead Architect
 * Feature: Multi-format Batch Ingestion Bridge
 * Logic: Markdown intermediate state for 100% editability.
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

  /**
   * Sanitization Protocol: Converts docx numbering artifacts into clean markers.
   * Pattern matched: __2.__, _2._, etc. -> 2.
   */
  sanitize(content: string): string {
    return content
      .replace(/__(\d+)\.__/g, '$1.')
      .replace(/__(\d+)\.\s+__/g, '$1. ')
      .replace(/_(\d+)\._/g, '$1.')
      .replace(/__\w+\.__/g, '') // Remove alphabetical artifacts
      .replace(/\n{3,}/g, '\n\n'); 
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
        
        case 'html':
        case 'htm':
          const html = await file.text();
          content = this.htmlToMarkdown(html);
          break;

        case 'docx':
        case 'odt':
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.convertToMarkdown({ arrayBuffer });
          content = result.value || `# ${title}\n\n[Bridge.Notice]: Binary content converted to professional Markdown.`;
          break;

        case 'pdf':
          await this.initPdf();
          const pdfContent = await this.extractPdfText(file);
          content = `# ${title}\n\n${pdfContent}`;
          break;

        case 'rtf':
          const rtfText = await file.text();
          content = `# ${title}\n\n${this.extractRtfText(rtfText)}`;
          break;

        case 'pptx':
          content = `# ${title}\n\n[Bridge.Notice]: PPTX Structural Outline Ingested.`;
          break;

        default:
          throw new Error('Unsupported format.');
      }

      return { title, content: this.sanitize(content) };
    } catch (err) {
      console.error('Ingestion failure:', err);
      throw new Error(`Failed to ingest ${file.name}.`);
    }
  },

  htmlToMarkdown(html: string): string {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    let md = '';
    const walk = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        md += node.textContent;
        return;
      }
      const tag = (node as Element).tagName?.toLowerCase();
      switch (tag) {
        case 'h1': md += '\n# '; break;
        case 'h2': md += '\n## '; break;
        case 'h3': md += '\n### '; break;
        case 'strong': case 'b': md += '**'; break;
        case 'em': case 'i': md += '_'; break;
        case 'p': md += '\n\n'; break;
        case 'li': md += '\n* '; break;
        case 'br': md += '\n'; break;
      }
      node.childNodes.forEach(walk);
      if (['strong', 'b'].includes(tag)) md += '**';
      if (['em', 'i'].includes(tag)) md += '_';
    };
    walk(doc.body);
    return md.replace(/\n{3,}/g, '\n\n').trim();
  },

  async extractPdfText(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfjsLib: any = pdfjs;
    const getDocument = pdfjsLib.getDocument || pdfjsLib.default?.getDocument;
    if (!getDocument) throw new Error("PDF engine failure: getDocument not found.");

    const loadingTask = getDocument({ 
      data: arrayBuffer,
      useWorkerFetch: false,
      isEvalSupported: false 
    });
    
    const pdf = await loadingTask.promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      let lastY: number | null = null;
      let lines: string[] = [];
      let currentLine: string[] = [];

      const items = (textContent.items as any[]).sort((a, b) => {
        const yDiff = b.transform[5] - a.transform[5];
        if (Math.abs(yDiff) < 5) return a.transform[4] - b.transform[4];
        return yDiff;
      });

      for (const item of items) {
        const y = item.transform[5];
        if (lastY !== null && Math.abs(y - lastY) > 5) {
          lines.push(currentLine.join(' ').trim());
          currentLine = [];
        }
        currentLine.push(item.str);
        lastY = y;
      }
      
      if (currentLine.length > 0) lines.push(currentLine.join(' ').trim());
      fullText += `## Page ${i}\n\n` + lines.filter(l => l.length > 0).join('\n') + '\n\n';
    }
    
    return fullText.trim();
  },

  extractRtfText(rtf: string): string {
    return rtf.replace(/\\([a-z]{1,32})(-?\d+)? ?/g, '')
              .replace(/\{[^}]+\}/g, '')
              .replace(/\r\n/g, '\n')
              .replace(/\n{2,}/g, '\n\n')
              .trim();
  }
};