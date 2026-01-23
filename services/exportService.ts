import { jsPDF } from 'jspdf';
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  ThematicBreak,
  ImageRun
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

const getImageDimensions = (base64: string): Promise<{ w: number, h: number }> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => resolve({ w: 800, h: 600 });
    img.src = base64;
  });
};

const base64ToUint8Array = (base64: string): Uint8Array => {
  const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
  const binaryString = window.atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

/**
 * Artifact Scrubbing Logic for Export Pass
 * Permanently removes sharding artifacts.
 */
const scrubMarkdown = (markdown: string): string => {
  return markdown.replace(/__\d+\.__/g, '');
};

export class VaultConverter {
  /**
   * PDF Mirror: Precision Image Vector Scaling
   */
  static async toPDF(markdown: string, fileName: string = 'vault-export.pdf', fontMode: VaultFont = 'sans'): Promise<Blob> {
    const pdf = new jsPDF('p', 'mm', 'a4');
    await FontLoader.loadForPDF(pdf);

    // Apply Triple-Pass scrub before tokenization
    const cleanMarkdown = scrubMarkdown(markdown);
    const tokens = marked.lexer(cleanMarkdown);
    
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

    for (const token of tokens) {
      switch (token.type) {
        case 'heading':
          const hSize = token.depth === 1 ? 24 : (token.depth === 2 ? 18 : 14);
          cursorY += token.depth === 1 ? 12 : 8;
          checkPageBreak(hSize * 0.3527 + 10);
          renderStyledLine(token.tokens || [{ text: token.text }], hSize, 'bold', 0, [16, 185, 129]); // Emerald headings
          cursorY += 4;
          break;

        case 'paragraph':
          const imgToken = token.tokens?.find((t: any) => t.type === 'image');
          if (imgToken) {
            const dims = await getImageDimensions(imgToken.href);
            const scale = Math.min(contentWidth / dims.w, 1);
            const w = dims.w * scale;
            const h = dims.h * scale;
            checkPageBreak(h + 8);
            
            const format = imgToken.href.includes('png') ? 'PNG' : 'JPEG';
            pdf.addImage(imgToken.href, format, margin, cursorY, w, h);
            cursorY += h + 8;
          } else {
            checkPageBreak(12);
            renderStyledLine(token.tokens || [{ text: token.text }], 11);
            cursorY += 4;
          }
          break;

        case 'list':
          const isOrdered = (token as any).ordered;
          let itemCounter = (token as any).start || 1;
          for (const item of token.items) {
            checkPageBreak(10);
            const indicator = isOrdered ? `${itemCounter}.` : '•';
            pdf.text(indicator, margin + 2, cursorY + 4);
            renderStyledLine(item.tokens || [{ text: item.text }], 11, 'normal', isOrdered ? 10 : 8);
            if (isOrdered) itemCounter++;
          }
          cursorY += 4;
          break;

        case 'hr':
          cursorY += 6;
          pdf.setDrawColor(220, 220, 220);
          pdf.line(margin, cursorY, margin + contentWidth, cursorY);
          cursorY += 10;
          break;
      }
    }

    const blob = pdf.output('blob');
    triggerSovereignDownload(blob, fileName);
    return blob;
  }

  /**
   * DOCX Shard: Structural Standard Markdown Export
   */
  static async toDocx(markdown: string, fileName: string = 'vault-export.docx'): Promise<Blob> {
    // Apply Triple-Pass scrub
    const cleanMarkdown = scrubMarkdown(markdown);
    const tokens = marked.lexer(cleanMarkdown);
    const children: any[] = [];

    const mapInlineTokens = async (inlineTokens: any[] = [], defaultSize: number = 24, parentBold: boolean = false): Promise<any[]> => {
      const runs = [];
      for (const t of inlineTokens) {
        if (t.type === 'image') {
          try {
            const dims = await getImageDimensions(t.href);
            const maxWidth = 550; 
            const scale = Math.min(maxWidth / dims.w, 1);
            const binaryData = base64ToUint8Array(t.href);
            
            runs.push(new ImageRun({
              data: binaryData,
              transformation: {
                width: dims.w * scale,
                height: dims.h * scale,
              }
            }));
          } catch (e) {
            runs.push(new TextRun({ text: "[Image_Shard_Corrupted]", color: 'FF0000', size: 16 }));
          }
          continue;
        }

        const isStrong = t.type === 'strong' || parentBold;
        const isEm = t.type === 'em';
        
        if (t.tokens && t.tokens.length > 0) {
          runs.push(...(await mapInlineTokens(t.tokens, defaultSize, isStrong)));
        } else {
          runs.push(new TextRun({ 
            text: t.text || t.raw || '', 
            bold: isStrong, 
            italic: isEm,
            size: defaultSize, 
            font: 'Inter'
          }));
        }
      }
      return runs;
    };

    for (const token of tokens) {
      switch (token.type) {
        case 'heading':
          const hSize = token.depth === 1 ? 48 : (token.depth === 2 ? 36 : 28);
          children.push(new Paragraph({
            children: await mapInlineTokens(token.tokens, hSize, true),
            heading: token.depth === 1 ? HeadingLevel.HEADING_1 : 
                     token.depth === 2 ? HeadingLevel.HEADING_2 : 
                     HeadingLevel.HEADING_3,
            spacing: { before: 400, after: 200 },
          }));
          break;
        case 'paragraph':
          children.push(new Paragraph({
            children: await mapInlineTokens(token.tokens, 22),
            spacing: { after: 240 },
          }));
          break;
        case 'list':
          const isOrdered = (token as any).ordered;
          let itemCounter = (token as any).start || 1;
          for (const item of token.items) {
            const pConfig: any = {
              children: await mapInlineTokens(item.tokens, 22),
              spacing: { after: 120 }
            };
            if (isOrdered) {
              const prefix = new TextRun({ text: `${itemCounter}. `, bold: true, size: 22 });
              pConfig.children.unshift(prefix);
              itemCounter++;
            } else {
              pConfig.bullet = { level: 0 };
            }
            children.push(new Paragraph(pConfig));
          }
          break;
        case 'hr':
          children.push(new ThematicBreak());
          break;
      }
    }

    const doc = new Document({
      sections: [{
        properties: {},
        children: children,
      }],
    });

    const blob = await Packer.toBlob(doc);
    triggerSovereignDownload(blob, fileName);
    return blob;
  }
}