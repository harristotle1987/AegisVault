
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
import saveAs from 'file-saver';
import { marked } from 'marked';
import { FontLoader } from './FontLoader';

/**
 * VaultConverter: High-performance local transformation engine.
 */
export class VaultConverter {
  /**
   * Renders a Sovereign-grade PDF with the Vault-Executive Theme.
   */
  static async toPDF(elementId: string, fileName: string = 'vault-export.pdf'): Promise<void> {
    const sourceElement = document.getElementById(elementId);
    if (!sourceElement) throw new Error("Source element not found");

    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = '210mm';
    container.className = 'vault-pdf-container';
    
    // Vault-Executive PDF Theme Base
    container.style.backgroundColor = '#050505'; 
    container.style.color = '#e2e8f0';
    container.innerHTML = sourceElement.innerHTML;

    const style = document.createElement('style');
    style.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800&family=JetBrains+Mono&display=swap');
      
      .vault-pdf-container {
        width: 210mm;
        padding: 40mm;
        background-color: #050505;
        color: #e2e8f0;
        font-family: 'Inter', sans-serif;
        line-height: 1.6;
      }

      .vault-pdf-container h1 {
        color: #ffffff;
        font-size: 28pt;
        font-weight: 800;
        border-bottom: 1px solid rgba(16, 185, 129, 0.3);
        padding-bottom: 10px;
        margin-bottom: 20px;
        letter-spacing: -0.04em;
      }

      .vault-pdf-container h2 {
        color: #f8fafc;
        font-size: 18pt;
        font-weight: 700;
        margin-top: 30pt;
        margin-bottom: 15pt;
      }

      .vault-pdf-container p {
        margin-bottom: 15pt;
        font-size: 11pt;
      }

      .vault-pdf-container code {
        font-family: 'JetBrains Mono', monospace;
        background-color: #111111;
        color: #10b981;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 0.9em;
      }

      .vault-pdf-container pre {
        background-color: #000000;
        border: 1px solid rgba(255,255,255,0.08);
        padding: 20px;
        border-radius: 8px;
        margin: 20pt 0;
      }

      .vault-pdf-container blockquote {
        border-left: 4px solid #10b981;
        padding-left: 20px;
        color: #94a3b8;
        font-style: italic;
        margin: 20pt 0;
        background: rgba(16, 185, 129, 0.03);
      }

      .vault-pdf-container hr {
        border: none;
        border-top: 1px solid rgba(255,255,255,0.05);
        margin: 40pt 0;
      }

      .vault-pdf-container table {
        width: 100%;
        border-collapse: collapse;
        margin: 20pt 0;
      }

      .vault-pdf-container th, .vault-pdf-container td {
        border: 1px solid rgba(255,255,255,0.05);
        padding: 10pt;
        text-align: left;
      }

      .vault-pdf-container th {
        background: rgba(255,255,255,0.02);
        color: #ffffff;
        font-weight: 700;
      }
    `;
    container.appendChild(style);
    document.body.appendChild(container);

    try {
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#050505',
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ format: 'a4', unit: 'mm' });
      
      await FontLoader.loadForPDF(pdf);

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      pdf.save(fileName);
    } finally {
      document.body.removeChild(container);
    }
  }

  /**
   * Generates a "White-Glove Executive" Docx.
   */
  static async toDocx(markdown: string, fileName: string = 'vault-export.docx'): Promise<void> {
    const tokens = marked.lexer(markdown);
    const docChildren: any[] = [];

    tokens.forEach((token) => {
      switch (token.type) {
        case 'heading':
          docChildren.push(new Paragraph({
            text: token.text,
            heading: token.depth === 1 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2,
            spacing: { before: token.depth === 1 ? 800 : 400, after: 240 },
            alignment: token.depth === 1 ? AlignmentType.CENTER : AlignmentType.LEFT,
          }));
          break;
        case 'paragraph':
          docChildren.push(new Paragraph({
            children: [new TextRun({ text: token.text, size: 22, font: 'Inter' })],
            spacing: { after: 200 },
          }));
          break;
        case 'hr':
          docChildren.push(new ThematicBreak());
          break;
        case 'blockquote':
          docChildren.push(new Paragraph({
            children: [new TextRun({ text: token.text, italic: true, color: '64748b' })],
            indent: { left: 720 },
            spacing: { before: 200, after: 200 },
          }));
          break;
        case 'code':
          docChildren.push(new Paragraph({
            children: [new TextRun({ text: token.text, font: 'JetBrains Mono', size: 18, color: '065f46' })],
            shading: { fill: "f8fafc", type: ShadingType.CLEAR },
            border: {
              top: { style: BorderStyle.SINGLE, size: 1, color: "e2e8f0" },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "e2e8f0" },
              left: { style: BorderStyle.SINGLE, size: 6, color: "10b981" },
              right: { style: BorderStyle.SINGLE, size: 1, color: "e2e8f0" },
            },
            spacing: { before: 240, after: 240 },
          }));
          break;
        case 'table':
          docChildren.push(new Table({
            rows: [
              new TableRow({
                children: token.header.map((h: any) => new TableCell({
                  children: [new Paragraph({ text: h.text, bold: true })],
                  shading: { fill: "f1f5f9" },
                  margins: { top: 120, bottom: 120, left: 120, right: 120 },
                })),
              }),
              ...token.rows.map((row: any) => new TableRow({
                children: row.map((c: any) => new TableCell({
                  children: [new Paragraph({ text: c.text })],
                  margins: { top: 120, bottom: 120, left: 120, right: 120 },
                })),
              })),
            ],
            width: { size: 100, type: WidthType.PERCENTAGE },
          }));
          break;
      }
    });

    const doc = new Document({
      sections: [{
        properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
        children: docChildren,
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, fileName);
  }
}
