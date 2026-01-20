import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
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
   * Implements 0.5mm overlap (bleed) to remove stitching lines and JPEG 0.75 compression for lightweight exports.
   */
  static async toPDF(elementId: string, fileName: string = 'vault-export.pdf', fontMode: VaultFont = 'sans'): Promise<void> {
    const sourceElement = document.getElementById(elementId);
    if (!sourceElement) throw new Error("Source element not found");

    // Hide UI elements to prevent black/gray boxes in export (Layer Integrity)
    const elementsToHide = document.querySelectorAll('.fixed, .sidebar, button, .md\\:hidden');
    elementsToHide.forEach(el => (el as HTMLElement).style.opacity = '0');

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      await FontLoader.loadForPDF(pdf);

      const canvas = await html2canvas(sourceElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          const area = clonedDoc.getElementById(elementId);
          if (area) {
            // Renderer Reset: Clear container before hardening to stop duplication
            const currentHTML = area.innerHTML;
            area.innerHTML = '';
            area.innerHTML = currentHTML;

            area.style.backgroundColor = '#ffffff';
            area.style.color = '#000000';
            area.style.padding = '20mm';
            area.style.height = 'auto';
            area.style.width = '794px'; // Standard A4 pixel width at 96dpi
            
            if (fontMode === 'mono') {
              area.style.fontFamily = "'JetBrains Mono', monospace";
            } else {
              area.style.fontFamily = "'Inter', sans-serif";
            }

            area.querySelectorAll('*').forEach(child => {
              const el = child as HTMLElement;
              el.style.color = '#000000';
              if (el.tagName.startsWith('H')) {
                el.style.color = '#10B981'; // Emerald headers for executive branding
                el.style.borderBottom = '1px solid rgba(16, 185, 129, 0.2)';
              }
            });
          }
        }
      });

      // Hardened JPEG compression at 0.75 to maintain fidelity under 1MB
      const imgData = canvas.toDataURL('image/jpeg', 0.75); 
      const pdfWidth = 210;
      const pdfHeight = 297;
      const imgProps = pdf.getImageProperties(imgData);
      const pdfImgHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      let heightLeft = pdfImgHeight;
      let position = 0;

      // Slice loop with 0.5mm overlap to eliminate white stitching lines
      while (heightLeft > 0) {
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfImgHeight, undefined, 'FAST');
        
        heightLeft -= (pdfHeight - 0.5); 
        position -= (pdfHeight - 0.5);

        if (heightLeft > 0) {
          pdf.addPage();
        }
      }

      const blob = pdf.output('blob');
      triggerSovereignDownload(blob, fileName);
    } finally {
      elementsToHide.forEach(el => (el as HTMLElement).style.opacity = '');
    }
  }

  /**
   * toDocx: Structural Native Word Mirroring.
   * Maps Markdown tokens to native Microsoft Word Heading Styles with Emerald UI branding.
   */
  static async toDocx(markdown: string, fileName: string = 'vault-export.docx'): Promise<void> {
    const tokens = marked.lexer(markdown);
    const children: any[] = [];

    tokens.forEach((token) => {
      switch (token.type) {
        case 'heading':
          children.push(new Paragraph({
            children: [new TextRun({ 
              text: token.text, 
              color: '10B981', 
              bold: true,
              font: 'Inter',
              size: token.depth === 1 ? 48 : (token.depth === 2 ? 36 : 28)
            })],
            heading: token.depth === 1 ? HeadingLevel.HEADING_1 : 
                     token.depth === 2 ? HeadingLevel.HEADING_2 : 
                     HeadingLevel.HEADING_3,
            spacing: { before: 400, after: 200, line: 360 },
          }));
          break;
        case 'paragraph':
          children.push(new Paragraph({
            children: [new TextRun({ text: token.text, size: 24, font: 'Inter' })],
            spacing: { after: 240, line: 360 },
          }));
          break;
        case 'list':
          token.items.forEach((item: any) => {
            children.push(new Paragraph({
              text: item.text,
              bullet: { level: 0 },
              spacing: { after: 120, line: 360 },
              children: [new TextRun({ text: item.text, font: 'Inter', size: 24 })]
            }));
          });
          break;
        case 'blockquote':
          children.push(new Paragraph({
            children: [new TextRun({ text: token.text, italic: true, color: '10B981', font: 'Inter', size: 24 })],
            indent: { left: 720 },
            spacing: { before: 200, after: 200, line: 360 },
          }));
          break;
        case 'hr':
          children.push(new ThematicBreak());
          break;
        default:
          if ('text' in token) {
            children.push(new Paragraph({ 
              children: [new TextRun({ text: token.text, font: 'Inter', size: 24 })] 
            }));
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