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
   * Feature: High-Fidelity Vector PDF Mirror
   * Logic: Strict Bold Black (#000000) Headings for executive clarity.
   */
  static async toPDF(markdown: string, fileName: string = 'vault-export.pdf', fontMode: VaultFont = 'sans'): Promise<Blob> {
    const pdf = new jsPDF('p', 'mm', 'a4');
    await FontLoader.loadForPDF(pdf);

    const tokens = marked.lexer(markdown);
    const margin = 25.4; 
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

    const renderStyledLine = (inlineTokens: any[], fontSize: number, baseStyle: string = 'normal', indent: number = 0, color: [number, number, number] = [0, 0, 0]) => {
      let cursorX = margin + indent;
      const lineHeight = (fontSize * 0.3527) * 1.6;
      const fontName = fontMode === 'mono' ? 'Courier' : 'Helvetica';
      
      pdf.setFont(fontName, baseStyle);
      pdf.setFontSize(fontSize);
      pdf.setTextColor(color[0], color[1], color[2]);

      const words: { text: string; style: string }[] = [];
      inlineTokens.forEach(token => {
        let style = baseStyle;
        if (token.type === 'strong') style = 'bold';
        if (token.type === 'em') style = 'italic';
        
        const content = token.text || token.raw || '';
        content.split(/(\s+)/).forEach((word: string) => {
          if (word) words.push({ text: word, style });
        });
      });

      words.forEach((wordObj) => {
        pdf.setFont(fontName, wordObj.style);
        const wordWidth = pdf.getTextWidth(wordObj.text);

        if (cursorX + wordWidth > margin + contentWidth) {
          cursorY += lineHeight;
          cursorX = margin + indent;
          checkPageBreak(lineHeight);
        }

        pdf.text(wordObj.text, cursorX, cursorY + (fontSize * 0.3527));
        cursorX += wordWidth;
      });

      cursorY += lineHeight;
    };

    tokens.forEach((token) => {
      switch (token.type) {
        case 'heading':
          const hSize = token.depth === 1 ? 24 : (token.depth === 2 ? 18 : 14);
          const spacingBefore = token.depth === 1 ? 12 : 8;
          cursorY += spacingBefore;
          checkPageBreak(hSize * 0.3527 + 10);
          
          // Force bold black (#000000) for all headings
          renderStyledLine(token.tokens || [{ text: token.text }], hSize, 'bold', 0, [0, 0, 0]);
          
          if (token.depth <= 2) {
            pdf.setDrawColor(0, 0, 0);
            pdf.setLineWidth(0.3);
            pdf.line(margin, cursorY - 1, margin + contentWidth, cursorY - 1);
            cursorY += 2;
          }
          cursorY += 4;
          break;

        case 'paragraph':
          checkPageBreak(11 * 0.3527 * 2);
          renderStyledLine(token.tokens || [{ text: token.text }], 11);
          cursorY += 4;
          break;

        case 'list':
          const isOrdered = (token as any).ordered;
          let itemCounter = (token as any).start || 1;

          token.items.forEach((item: any) => {
            checkPageBreak(11 * 0.3527 * 2);
            pdf.setFontSize(11);
            pdf.setFont(fontMode === 'mono' ? 'Courier' : 'Helvetica', 'normal');
            
            const indicator = isOrdered ? `${itemCounter}.` : '•';
            pdf.text(indicator, margin + 2, cursorY + (11 * 0.3527));
            
            const textIndent = isOrdered ? 10 : 8;
            renderStyledLine(item.tokens || [{ text: item.text }], 11, 'normal', textIndent);
            
            if (isOrdered) itemCounter++;
          });
          cursorY += 4;
          break;

        case 'blockquote':
          const startY = cursorY;
          pdf.setDrawColor(16, 185, 129); 
          pdf.setLineWidth(1.5);
          renderStyledLine([{ text: token.text }], 11, 'italic', 12, [80, 80, 80]);
          pdf.line(margin, startY, margin, cursorY - 2);
          cursorY += 4;
          break;

        case 'hr':
          cursorY += 6;
          pdf.setDrawColor(230, 230, 230);
          pdf.line(margin, cursorY, margin + contentWidth, cursorY);
          cursorY += 10;
          break;
      }
    });

    const blob = pdf.output('blob');
    triggerSovereignDownload(blob, fileName);
    return blob;
  }

  static async toDocx(markdown: string, fileName: string = 'vault-export.docx'): Promise<Blob> {
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
            children: mapInlineTokens(token.tokens, hSize, true),
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
          const isOrdered = (token as any).ordered;
          let itemCounter = (token as any).start || 1;

          token.items.forEach((item: any) => {
            const pConfig: any = {
              spacing: { after: 120, line: 360 },
              children: mapInlineTokens(item.tokens, 22)
            };

            if (isOrdered) {
              const prefix = new TextRun({ 
                text: `${itemCounter}. `, 
                bold: true, 
                font: 'Inter', 
                size: 22 
              });
              pConfig.children.unshift(prefix);
              pConfig.indent = { left: 720, hanging: 360 };
              itemCounter++;
            } else {
              pConfig.bullet = { level: 0 };
            }

            children.push(new Paragraph(pConfig));
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

    const blob = await Packer.toBlob(doc);
    triggerSovereignDownload(blob, fileName);
    return blob;
  }
}