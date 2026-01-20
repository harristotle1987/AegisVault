import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  BorderStyle,
  ShadingType,
  AlignmentType,
  ThematicBreak
} from 'docx';
import { marked } from 'marked';
import { FontLoader } from './FontLoader';

/**
 * triggerSovereignDownload: Hardened Mobile Download Sequence.
 */
const triggerSovereignDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
};

export class VaultConverter {
  /**
   * High-fidelity Multi-page PDF Rendering.
   */
  static async toPDF(elementId: string, fileName: string = 'vault-export.pdf'): Promise<void> {
    const sourceElement = document.getElementById(elementId);
    if (!sourceElement) throw new Error("Source element not found");

    // Create a high-fidelity render container for A4 dimensions
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '210mm';
    container.className = 'vault-pdf-container';
    container.innerHTML = sourceElement.innerHTML;

    const style = document.createElement('style');
    style.innerHTML = `
      .vault-pdf-container {
        padding: 25mm;
        background-color: #050505 !important;
        color: #e2e8f0 !important;
        font-family: 'Inter', sans-serif;
      }
      .vault-pdf-container h1 { font-size: 24pt; color: #ffffff; border-bottom: 1pt solid #10b981; padding-bottom: 10pt; margin-bottom: 20pt; }
      .vault-pdf-container h2 { font-size: 18pt; color: #f8fafc; margin-top: 30pt; }
      .vault-pdf-container p { font-size: 11pt; line-height: 1.6; margin-bottom: 12pt; }
      .vault-pdf-container code { font-family: 'JetBrains Mono'; background: #111; color: #10b981; }
      .vault-pdf-container blockquote { border-left: 4pt solid #10b981; padding-left: 15pt; font-style: italic; margin: 15pt 0; }
    `;
    container.appendChild(style);
    document.body.appendChild(container);

    try {
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#050505',
        logging: false,
        width: 210 * 3.7795275591, // mm to px approx
        windowWidth: 210 * 3.7795275591,
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      await FontLoader.loadForPDF(pdf);

      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      let heightLeft = pdfHeight;
      let position = 0;

      // Primary Page
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
      position -= pageHeight;

      // Multi-page Loop
      while (heightLeft > 0) {
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
        position -= pageHeight;
      }

      const blob = pdf.output('blob');
      triggerSovereignDownload(blob, fileName);
    } finally {
      document.body.removeChild(container);
    }
  }

  /**
   * Hardened DOCX generation using binary Packer stream.
   */
  static async toDocx(markdown: string, fileName: string = 'vault-export.docx'): Promise<void> {
    const tokens = marked.lexer(markdown);
    const children: any[] = [];

    tokens.forEach((token) => {
      if (token.type === 'heading') {
        children.push(new Paragraph({
          text: token.text,
          heading: token.depth === 1 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 },
        }));
      } else if (token.type === 'paragraph') {
        children.push(new Paragraph({
          children: [new TextRun({ text: token.text, size: 24 })],
          spacing: { after: 200 },
        }));
      } else if (token.type === 'hr') {
        children.push(new ThematicBreak());
      }
    });

    const doc = new Document({
      sections: [{
        properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
        children: children,
      }],
    });

    const blob = await Packer.toBlob(doc);
    triggerSovereignDownload(blob, fileName);
  }
}