
import { jsPDF } from 'jspdf';
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  ThematicBreak
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
   * Feature: Vector-Based PDF Mirroring
   * Logic: Native text rendering with inline style support to match DOCX high-fidelity output.
   */
  static async toPDF(markdown: string, fileName: string = 'vault-export.pdf', fontMode: VaultFont = 'sans'): Promise<void> {
    const pdf = new jsPDF('p', 'mm', 'a4');
    await FontLoader.loadForPDF(pdf);

    const tokens = marked.lexer(markdown);
    const margin = 25.4; // 1 inch to match DOCX default
    const pageWidth = 210;
    const contentWidth = pageWidth - (margin * 2);
    const pageHeight = 297;
    let cursorY = margin;

    const addNewPage = () => {
      pdf.addPage();
      cursorY = margin;
    };

    const checkPageBreak = (neededHeight: number) => {
      if (cursorY + neededHeight > pageHeight - margin) {
        addNewPage();
      }
    };

    /**
     * Renders a block of text containing potential inline styles (bold/italic)
     * Tracks cursor position precisely across multiple lines.
     */
    const renderBlock = (inlineTokens: any[], baseSize: number, baseStyle: string = 'normal', indent: number = 0) => {
      let cursorX = margin + indent;
      const lineHeight = (baseSize * 0.3527) * 1.5;
      
      pdf.setFont(fontMode === 'mono' ? 'Courier' : 'Helvetica', baseStyle);
      pdf.setFontSize(baseSize);

      // Simple word-wrap engine for multi-style lines
      const words: { text: string; style: string }[] = [];
      
      inlineTokens.forEach(t => {
        let style = baseStyle;
        if (t.type === 'strong') style = 'bold';
        if (t.type === 'em') style = 'italic';
        
        const rawText = t.text || t.raw || '';
        rawText.split(/(\s+)/).forEach((word: string) => {
          if (word) words.push({ text: word, style });
        });
      });

      words.forEach((wordObj) => {
        pdf.setFont(fontMode === 'mono' ? 'Courier' : 'Helvetica', wordObj.style);
        const wordWidth = pdf.getTextWidth(wordObj.text);

        if (cursorX + wordWidth > margin + contentWidth) {
          cursorY += lineHeight;
          cursorX = margin + indent;
          checkPageBreak(lineHeight);
        }

        pdf.text(wordObj.text, cursorX, cursorY + (baseSize * 0.3527));
        cursorX += wordWidth;
      });

      cursorY += lineHeight;
    };

    tokens.forEach((token) => {
      switch (token.type) {
        case 'heading':
          // Match DOCX sizing exactly (h1=24pt, h2=18pt, h3=14pt)
          const hSize = token.depth === 1 ? 24 : (token.depth === 2 ? 18 : 14);
          cursorY += 6;
          checkPageBreak(hSize * 0.3527 + 10);
          renderBlock(token.tokens || [{ text: token.text }], hSize, 'bold');
          
          if (token.depth <= 2) {
            pdf.setDrawColor(0, 0, 0);
            pdf.setLineWidth(0.1);
            pdf.line(margin, cursorY - 2, margin + contentWidth, cursorY - 2);
            cursorY += 2;
          }
          cursorY += 4;
          break;

        case 'paragraph':
          checkPageBreak(11 * 0.3527 * 2);
          renderBlock(token.tokens || [{ text: token.text }], 11);
          cursorY += 4;
          break;

        case 'list':
          token.items.forEach((item: any) => {
            checkPageBreak(11 * 0.3527 * 2);
            pdf.setFontSize(11);
            pdf.text('•', margin + 2, cursorY + (11 * 0.3527));
            renderBlock(item.tokens || [{ text: item.text }], 11, 'normal', 7);
          });
          cursorY += 4;
          break;

        case 'blockquote':
          const startY = cursorY;
          pdf.setDrawColor(16, 185, 129);
          pdf.setLineWidth(1);
          renderBlock([{ text: token.text }], 11, 'italic', 10);
          pdf.line(margin, startY, margin, cursorY - 2);
          cursorY += 4;
          break;

        case 'hr':
          cursorY += 4;
          pdf.setDrawColor(200, 200, 200);
          pdf.line(margin, cursorY, margin + contentWidth, cursorY);
          cursorY += 8;
          break;
      }
    });

    triggerSovereignDownload(pdf.output('blob'), fileName);
  }

  /**
   * Role: Senior Lead Architect
   * Logic: Native DOCX mapping for high-fidelity Microsoft Word assets.
   */
  static async toDocx(markdown: string, fileName: string = 'vault-export.docx'): Promise<void> {
    const tokens = marked.lexer(markdown);
    const children: any[] = [];

    const mapInlineTokens = (inlineTokens: any[] = [], defaultSize: number = 24, parentBold: boolean = false): TextRun[] => {
      return inlineTokens.flatMap(t => {
        const isStrong = t.type === 'strong' || parentBold;
        const isEm = t.type === 'em';
        
        if (t.tokens && t.tokens.length > 0) {
          return mapInlineTokens(t.tokens, defaultSize, isStrong);
        }

        return [new TextRun({ 
          text: t.text || t.raw || '', 
          bold: isStrong, 
          italic: isEm,
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
            children: mapInlineTokens(token.tokens, hSize, token.depth <= 2),
            heading: token.depth === 1 ? HeadingLevel.HEADING_1 : 
                     token.depth === 2 ? HeadingLevel.HEADING_2 : 
                     HeadingLevel.HEADING_3,
            spacing: { before: 400, after: 200, line: 360 },
          }));
          break;
        case 'paragraph':
          children.push(new Paragraph({
            children: mapInlineTokens(token.tokens, 22),
            spacing: { after: 240, line: 360 },
          }));
          break;
        case 'list':
          token.items.forEach((item: any) => {
            children.push(new Paragraph({
              bullet: { level: 0 },
              spacing: { after: 120, line: 360 },
              children: mapInlineTokens(item.tokens, 22)
            }));
          });
          break;
        case 'blockquote':
          children.push(new Paragraph({
            children: [new TextRun({ text: token.text, italic: true, color: '666666', font: 'Inter', size: 22 })],
            indent: { left: 720 },
            spacing: { before: 200, after: 200, line: 360 },
          }));
          break;
        case 'hr':
          children.push(new ThematicBreak());
          break;
        default:
          if ('tokens' in token) {
            children.push(new Paragraph({ children: mapInlineTokens((token as any).tokens, 22) }));
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
