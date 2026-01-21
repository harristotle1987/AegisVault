
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  ThematicBreak,
  AlignmentType
} from 'docx';
import { marked } from 'marked';
import { FontLoader } from './FontLoader';
import { VaultFont } from '../types';

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
   * Role: Senior Lead Architect
   * Feature: Seamless PDF Slicing & Black Heading Force
   */
  static async toPDF(elementId: string, fileName: string = 'vault-export.pdf', fontMode: VaultFont = 'sans'): Promise<void> {
    const sourceElement = document.getElementById(elementId);
    if (!sourceElement) throw new Error("Source element not found");

    const elementsToHide = document.querySelectorAll('.fixed, .sidebar, button, .md\\:hidden');
    elementsToHide.forEach(el => (el as HTMLElement).style.opacity = '0');

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      await FontLoader.loadForPDF(pdf);

      const canvas = await html2canvas(sourceElement, {
        scale: 2,
        width: 794, 
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          const area = clonedDoc.getElementById(elementId);
          if (area) {
            area.style.backgroundColor = '#ffffff';
            area.style.color = '#000000';
            area.style.padding = '20mm';
            area.style.width = '794px';
            area.style.height = 'auto';
            area.style.fontFamily = fontMode === 'mono' ? "'JetBrains Mono', monospace" : "'Inter', sans-serif";

            // Hardened Heading Styles for Professional Integrity
            area.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(h => {
              const el = h as HTMLElement;
              el.style.color = '#000000';
              el.style.fontWeight = '800';
              el.style.borderBottom = el.tagName === 'H1' ? '1px solid #eeeeee' : 'none';
              el.style.marginBottom = '1.5rem';
              el.style.marginTop = '2rem';
            });

            area.querySelectorAll('p, li, blockquote').forEach(p => {
              (p as HTMLElement).style.color = '#000000';
              (p as HTMLElement).style.lineHeight = '1.6';
            });
          }
        }
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.7); // Optimized size
      const pdfWidth = 210;
      const pdfHeight = 297;
      const imgProps = pdf.getImageProperties(imgData);
      const pdfImgHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      let heightLeft = pdfImgHeight;
      let position = 0;

      // Logic: Slicing with 0.2mm precision overlap to prevent stitching lines
      while (heightLeft > 0) {
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfImgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
        position -= (pdfHeight - 0.2); // Micro-overlap for seamless stitching
        if (heightLeft > 0) {
          pdf.addPage();
        }
      }

      triggerSovereignDownload(pdf.output('blob'), fileName);
    } finally {
      elementsToHide.forEach(el => (el as HTMLElement).style.opacity = '');
    }
  }

  /**
   * Role: Senior Lead Architect
   * Feature: Hardened Recursive Bold Logic
   */
  static async toDocx(markdown: string, fileName: string = 'vault-export.docx'): Promise<void> {
    const tokens = marked.lexer(markdown);
    const children: any[] = [];

    const mapInlineTokens = (inlineTokens: any[] = [], defaultSize: number = 24, isBold: boolean = false): TextRun[] => {
      return inlineTokens.flatMap(t => {
        const content = t.text || t.raw || '';
        const currentBold = isBold || t.type === 'strong';
        const currentItalic = t.type === 'em';

        if (t.tokens && t.tokens.length > 0) {
          return mapInlineTokens(t.tokens, defaultSize, currentBold);
        }

        return [new TextRun({ 
          text: content, 
          bold: currentBold, 
          italic: currentItalic,
          size: defaultSize, 
          font: 'Inter',
          color: '000000'
        })];
      });
    };

    tokens.forEach((token) => {
      switch (token.type) {
        case 'heading':
          const hSize = token.depth === 1 ? 48 : (token.depth === 2 ? 36 : 28);
          children.push(new Paragraph({
            children: mapInlineTokens(token.tokens, hSize, true),
            heading: token.depth === 1 ? HeadingLevel.HEADING_1 : 
                     token.depth === 2 ? HeadingLevel.HEADING_2 : 
                     HeadingLevel.HEADING_3,
            spacing: { before: 400, after: 200, line: 360 },
          }));
          break;
        case 'paragraph':
          children.push(new Paragraph({
            children: mapInlineTokens(token.tokens, 24),
            spacing: { after: 240, line: 360 },
          }));
          break;
        case 'list':
          token.items.forEach((item: any) => {
            children.push(new Paragraph({
              bullet: { level: 0 },
              spacing: { after: 120, line: 360 },
              children: mapInlineTokens(item.tokens, 24)
            }));
          });
          break;
        case 'blockquote':
          children.push(new Paragraph({
            children: [new TextRun({ text: token.text, italic: true, color: '666666', font: 'Inter', size: 24 })],
            indent: { left: 720 },
            spacing: { before: 200, after: 200, line: 360 },
          }));
          break;
        case 'hr':
          children.push(new ThematicBreak());
          break;
        default:
          if ('tokens' in token) {
            children.push(new Paragraph({ children: mapInlineTokens((token as any).tokens, 24) }));
          }
      }
    });

    const doc = new Document({
      sections: [{
        properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
        children: children,
      }],
    });

    triggerSovereignDownload(await Packer.toBlob(doc), fileName);
  }
}
