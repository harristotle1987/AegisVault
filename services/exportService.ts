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
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          const area = clonedDoc.getElementById(elementId);
          if (area) {
            // ROLE: Senior Lead Architect
            // Task: Final Sovereign Integrity Deployment
            // Logic: CLEAR CONTAINER FIRST TO STOP DUPLICATION
            const rawContent = area.innerHTML;
            area.innerHTML = ""; 
            area.innerHTML = rawContent;

            area.style.backgroundColor = '#ffffff';
            area.style.color = '#000000';
            area.style.padding = '20mm';
            area.style.height = 'auto';
            area.style.width = '794px';
            
            area.style.fontFamily = fontMode === 'mono' ? "'JetBrains Mono', monospace" : "'Inter', sans-serif";

            area.querySelectorAll('*').forEach(child => {
              const el = child as HTMLElement;
              el.style.color = '#000000';
              if (el.tagName.startsWith('H')) {
                el.style.color = '#10B981';
                el.style.borderBottom = '1px solid rgba(16, 185, 129, 0.2)';
              }
            });
          }
        }
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.75); 
      const pdfWidth = 210;
      const pdfHeight = 297;
      const imgProps = pdf.getImageProperties(imgData);
      const pdfImgHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      let heightLeft = pdfImgHeight;
      let position = 0;

      while (heightLeft > 0) {
        // 0.5mm overlap to remove stitching lines
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfImgHeight, undefined, 'FAST');
        heightLeft -= (pdfHeight - 0.5); 
        position -= (pdfHeight - 0.5);
        if (heightLeft > 0) pdf.addPage();
      }

      triggerSovereignDownload(pdf.output('blob'), fileName);
    } finally {
      elementsToHide.forEach(el => (el as HTMLElement).style.opacity = '');
    }
  }

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
              bullet: { level: 0 },
              spacing: { after: 120, line: 360 },
              // Removed 'text' property from Paragraph to stop DOCX duplication bug
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

    triggerSovereignDownload(await Packer.toBlob(doc), fileName);
  }
}