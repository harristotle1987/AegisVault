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
  ThematicBreak,
  AlignmentType,
  BorderStyle
} from 'docx';
import { marked } from 'marked';

/**
 * triggerSovereignDownload: Hardened Mobile Download Sequence.
 * Ensures binary blobs are delivered reliably across mobile OS boundaries.
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
   * toPDF: High-fidelity Multi-page Slicing Engine.
   * Renders to a high-res canvas and slices into A4 segments (297mm height)
   * to support long Lesson Plans without truncation.
   */
  static async toPDF(elementId: string, fileName: string = 'vault-export.pdf'): Promise<void> {
    const sourceElement = document.getElementById(elementId);
    if (!sourceElement) throw new Error("Source element not found");

    // Clone and harden for PDF rendering
    const container = document.createElement('div');
    container.className = 'vault-pdf-container';
    container.innerHTML = sourceElement.innerHTML;

    const style = document.createElement('style');
    style.innerHTML = `
      .vault-pdf-container {
        padding: 20mm;
        background-color: #ffffff !important;
        color: #000000 !important;
        font-family: 'Inter', sans-serif;
        line-height: 1.6;
        width: 210mm;
      }
      .vault-pdf-container h1 { font-size: 32pt; font-weight: 800; border-bottom: 2pt solid #10b981; padding-bottom: 12pt; margin-bottom: 24pt; color: #000000 !important; font-family: 'Playfair Display', serif; }
      .vault-pdf-container h2 { font-size: 22pt; font-weight: 700; margin-top: 32pt; margin-bottom: 16pt; color: #111111 !important; font-family: 'Playfair Display', serif; }
      .vault-pdf-container h3 { font-size: 16pt; font-weight: 700; margin-top: 24pt; color: #222222 !important; }
      .vault-pdf-container p { font-size: 11pt; margin-bottom: 14pt; color: #333333 !important; text-align: justify; }
      .vault-pdf-container blockquote { border-left: 4pt solid #10b981; padding: 15pt 20pt; font-style: italic; color: #555555 !important; background: #f9f9f9; margin: 20pt 0; font-family: 'Playfair Display', serif; font-size: 13pt; }
      .vault-pdf-container table { width: 100%; border-collapse: collapse; margin: 24pt 0; }
      .vault-pdf-container th, .vault-pdf-container td { border: 1px solid #ddd; padding: 10pt; text-align: left; font-size: 10pt; }
      .vault-pdf-container ul, .vault-pdf-container ol { padding-left: 20pt; margin-bottom: 14pt; }
      .vault-pdf-container li { margin-bottom: 6pt; font-size: 11pt; }
      .vault-pdf-container code { background: #f0f0f0; padding: 2pt 4pt; border-radius: 4pt; font-family: 'JetBrains Mono'; color: #10b981; }
    `;
    container.appendChild(style);
    document.body.appendChild(container);

    try {
      const canvas = await html2canvas(container, {
        scale: 2, // Executive Fidelity
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 794, // 210mm at 96dpi
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = 210;
      const pdfHeight = 297;
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Canvas pixels per PDF page height
      const pageHeightCanvas = (imgWidth * pdfHeight) / pdfWidth;

      let heightLeft = imgHeight;
      let position = 0;

      while (heightLeft > 0) {
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = imgWidth;
        pageCanvas.height = Math.min(heightLeft, pageHeightCanvas);
        
        const ctx = pageCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(canvas, 0, position, imgWidth, pageCanvas.height, 0, 0, imgWidth, pageCanvas.height);
          const pageData = pageCanvas.toDataURL('image/jpeg', 0.98);
          pdf.addImage(pageData, 'JPEG', 0, 0, pdfWidth, (pageCanvas.height * pdfWidth) / imgWidth);
        }
        
        heightLeft -= pageHeightCanvas;
        position += pageHeightCanvas;

        if (heightLeft > 0) {
          pdf.addPage();
        }
      }

      const blob = pdf.output('blob');
      triggerSovereignDownload(blob, fileName);
    } finally {
      document.body.removeChild(container);
    }
  }

  /**
   * toDocx: Structural Native Word Transformation.
   * Direct hierarchical mapping of Markdown tokens to Word Heading Levels.
   */
  static async toDocx(markdown: string, fileName: string = 'vault-export.docx'): Promise<void> {
    const tokens = marked.lexer(markdown);
    const children: any[] = [];

    tokens.forEach((token) => {
      switch (token.type) {
        case 'heading':
          children.push(new Paragraph({
            text: token.text,
            heading: token.depth === 1 ? HeadingLevel.HEADING_1 : 
                     token.depth === 2 ? HeadingLevel.HEADING_2 : 
                     HeadingLevel.HEADING_3,
            spacing: { before: 400, after: 200 },
          }));
          break;
        case 'paragraph':
          children.push(new Paragraph({
            children: [new TextRun({ text: token.text, size: 24, font: 'Inter' })],
            spacing: { after: 240 },
          }));
          break;
        case 'list':
          token.items.forEach((item: any) => {
            children.push(new Paragraph({
              text: item.text,
              bullet: { level: 0 },
              spacing: { after: 120 },
            }));
          });
          break;
        case 'blockquote':
          children.push(new Paragraph({
            children: [new TextRun({ text: token.text, italic: true, color: '10b981' })],
            indent: { left: 720 },
            spacing: { before: 200, after: 200 },
            shading: { fill: 'F9F9F9' }
          }));
          break;
        case 'hr':
          children.push(new ThematicBreak());
          break;
        case 'table':
          children.push(new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: token.header.map((h: any) => new TableCell({
                  children: [new Paragraph({ text: h.text, bold: true })],
                  shading: { fill: 'F2F2F2' }
                }))
              }),
              ...token.rows.map((row: any) => new TableRow({
                children: row.map((cell: any) => new TableCell({
                  children: [new Paragraph({ text: cell.text })]
                }))
              }))
            ]
          }));
          break;
        default:
          if ('text' in token) {
            children.push(new Paragraph({ text: token.text }));
          }
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
