import React, { useMemo, useRef, useEffect, useLayoutEffect } from 'react';
import { marked } from 'marked';
import { VaultFont } from '../types';
import { Trash2, RefreshCcw } from 'lucide-react';

interface PreviewProps {
  content: string;
  font?: VaultFont;
  activeDocId?: string | null;
  onRemoveImage?: (src: string) => void;
  onRescanImage?: (src: string) => void;
}

export const Preview: React.FC<PreviewProps> = ({ 
  content, 
  font = 'sans', 
  activeDocId,
  onRemoveImage,
  onRescanImage
}) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastScrolledId = useRef<string | null>(null);

  const html = useMemo(() => {
    // Transformative Rendering: Refactor __1.__ patterns to clean $1. (e.g. 4.)
    const transformedContent = content.replace(/__(\d+)\.__/g, '$1.');
    
    return marked.parse(transformedContent, { 
      breaks: true, 
      gfm: true,
      mangle: false,
      headerIds: false
    });
  }, [content]);

  /**
   * Renderer Sync & Image Action Injunction
   */
  useEffect(() => {
    if (previewRef.current) {
      previewRef.current.innerHTML = html;

      // Scan for Sovereign Plates and inject actions + responsive constraints
      const images = previewRef.current.querySelectorAll('img');
      images.forEach((img) => {
        if (img.alt === 'Sovereign Plate') {
          // Wrap image in a relative container that enforces bounds
          const wrapper = document.createElement('div');
          wrapper.className = 'relative group mb-8 overflow-hidden rounded-xl border border-vault-border shadow-lg max-w-full bg-vault-dim/5';
          img.parentNode?.insertBefore(wrapper, img);
          wrapper.appendChild(img);
          
          // Enforce image fit within its wrapper and the screen
          img.className = 'w-full max-w-full h-auto block grayscale contrast-125 object-contain';

          // Action Overlay
          const overlay = document.createElement('div');
          overlay.className = 'absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20';
          
          // Rescan Button
          if (onRescanImage) {
            const rescanBtn = document.createElement('button');
            rescanBtn.className = 'p-2.5 bg-obsidian/80 backdrop-blur-md border border-emerald-vault/30 text-emerald-vault rounded-lg hover:bg-emerald-vault hover:text-black transition-all shadow-lg active:scale-90';
            rescanBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>';
            rescanBtn.onclick = (e) => {
              e.preventDefault();
              onRescanImage(img.src);
            };
            overlay.appendChild(rescanBtn);
          }

          // Delete Button
          if (onRemoveImage) {
            const delBtn = document.createElement('button');
            delBtn.className = 'p-2.5 bg-obsidian/80 backdrop-blur-md border border-red-500/30 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-90';
            delBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>';
            delBtn.onclick = (e) => {
              e.preventDefault();
              onRemoveImage(img.src);
            };
            overlay.appendChild(delBtn);
          }

          wrapper.appendChild(overlay);
        }
      });
    }
  }, [html, onRemoveImage, onRescanImage]);

  /**
   * Sovereign Scroll Stability Protocol
   */
  useLayoutEffect(() => {
    if (activeDocId && activeDocId !== lastScrolledId.current) {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        container.scrollTo({
          top: 0, // Reset to top for new documents
          behavior: 'auto'
        });
        lastScrolledId.current = activeDocId;
      }
    }
  }, [activeDocId]);

  const fontClass = font === 'mono' ? 'font-mono' : 'font-sans';

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="h-10 px-6 flex items-center justify-between bg-obsidian-soft border-b border-vault-border shrink-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-vault animate-pulse" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-vault-dim font-bold">
            Live Rendering
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[9px] font-mono text-vault-dim/30 border border-vault-border px-2 py-0.5 rounded">ISO 216: A4</span>
        </div>
      </div>

      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto bg-obsidian-soft no-scrollbar vault-editor-scroll"
      >
        <div className="max-w-4xl mx-auto min-h-full flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.4)]">
          <div 
            id="preview-area"
            ref={previewRef}
            className={`flex-1 p-8 md:p-24 pb-[200px] md:pb-[200px] prose-vault selection:bg-emerald-vault/20 transition-all duration-500 ease-in-out ${fontClass}`}
          />
          
          <div className="h-32 flex items-center justify-center border-t border-vault-border/20 mt-8 mb-24">
            <div className="flex flex-col items-center gap-2 opacity-20">
              <div className="w-1 h-1 rounded-full bg-vault-text" />
              <span className="text-[8px] font-mono uppercase tracking-[0.4em] text-vault-text">End of Draft</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};