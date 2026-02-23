import React, { useRef, useEffect, useState, useCallback } from 'react';
import { VaultFont } from '../types';
import { Undo2, Redo2, Image as ImageIcon } from 'lucide-react';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  font?: VaultFont;
  activeDocId?: string | null;
  onImageUpload?: (file: File) => void;
}

/**
 * Editor: Sovereign Text Entry Interface
 * Enhanced with state-tracked Undo/Redo protocol.
 */
export const Editor = React.forwardRef<HTMLTextAreaElement, EditorProps>(({ value, onChange, font = 'mono', activeDocId, onImageUpload }, ref) => {
  const fontClass = font === 'mono' ? 'font-mono' : 'font-sans';
  const internalRef = useRef<HTMLTextAreaElement>(null);
  
  // Combine refs
  useEffect(() => {
    if (!ref) return;
    if (typeof ref === 'function') {
      ref(internalRef.current);
    } else if (ref) {
      ref.current = internalRef.current;
    }
  }, [ref]);

  const lastScrolledId = useRef<string | null>(null);
  
  const [internalValue, setInternalValue] = useState(value);
  const [history, setHistory] = useState<string[]>([value]);
  const [pointer, setPointer] = useState(0);
  const historyTimeout = useRef<number | null>(null);

  // Sync internal value and reset history when switching documents
  useEffect(() => {
    if (activeDocId && activeDocId !== lastScrolledId.current) {
      setHistory([value]);
      setPointer(0);
      setInternalValue(value);
      
      if (internalRef.current) {
        const el = internalRef.current;
        requestAnimationFrame(() => {
          el.scrollTop = el.scrollHeight;
          lastScrolledId.current = activeDocId;
        });
      }
    } else if (value !== internalValue) {
      // Handle external forced changes (e.g. Refinement)
      setInternalValue(value);
      setHistory(prev => {
        const newHistory = prev.slice(0, pointer + 1);
        if (newHistory[newHistory.length - 1] === value) return prev;
        newHistory.push(value);
        if (newHistory.length > 50) newHistory.shift();
        setPointer(newHistory.length - 1);
        return newHistory;
      });
    }
  }, [activeDocId, value]);

  const pushToHistory = useCallback((newValue: string) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, pointer + 1);
      if (newHistory[newHistory.length - 1] === newValue) return prev;
      newHistory.push(newValue);
      if (newHistory.length > 50) newHistory.shift();
      setPointer(newHistory.length - 1);
      return newHistory;
    });
  }, [pointer]);

  const handleUndo = useCallback(() => {
    if (pointer > 0) {
      const newPointer = pointer - 1;
      const val = history[newPointer];
      setPointer(newPointer);
      setInternalValue(val);
      onChange(val);
    }
  }, [pointer, history, onChange]);

  const handleRedo = useCallback(() => {
    if (pointer < history.length - 1) {
      const newPointer = pointer + 1;
      const val = history[newPointer];
      setPointer(newPointer);
      setInternalValue(val);
      onChange(val);
    }
  }, [pointer, history, onChange]);

  const handleImageClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file && onImageUpload) {
        onImageUpload(file);
      }
    };
    input.click();
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/') && onImageUpload) {
      onImageUpload(file);
    }
  }, [onImageUpload]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    onChange(newValue);

    if (historyTimeout.current) window.clearTimeout(historyTimeout.current);
    historyTimeout.current = window.setTimeout(() => {
      pushToHistory(newValue);
    }, 800);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-obsidian">
      <div className="h-10 px-4 flex items-center justify-between bg-obsidian-soft border-b border-vault-border text-[10px] uppercase tracking-widest text-vault-dim font-bold shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-vault/40" />
          <span>Source Editor</span>
        </div>

        <div className="flex items-center gap-1">
          <button 
            onClick={handleUndo}
            disabled={pointer <= 0}
            className="p-1.5 hover:bg-white/5 rounded-md disabled:opacity-20 transition-all text-vault-dim hover:text-white active:scale-90"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={14} />
          </button>
          <button 
            onClick={handleRedo}
            disabled={pointer >= history.length - 1}
            className="p-1.5 hover:bg-white/5 rounded-md disabled:opacity-20 transition-all text-vault-dim hover:text-white active:scale-90"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 size={14} />
          </button>
          <div className="w-px h-3 bg-vault-border mx-1" />
          <button 
            onClick={handleImageClick}
            className="p-1.5 hover:bg-white/5 rounded-md transition-all text-vault-dim hover:text-white active:scale-90"
            title="Insert Image"
          >
            <ImageIcon size={14} />
          </button>
          <div className="w-px h-3 bg-vault-border mx-1" />
          <span className="text-[9px] opacity-50 font-mono">MD.GFM</span>
        </div>
      </div>
      <div className="flex-1 relative overflow-hidden">
        <textarea
          ref={internalRef}
          value={internalValue}
          onChange={handleChange}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={`absolute inset-0 w-full h-full bg-obsidian p-8 md:p-12 pb-[200px] md:pb-[200px] focus:outline-none resize-none text-sm leading-relaxed text-vault-text placeholder:text-zinc-800 caret-emerald-vault transition-colors overflow-y-auto vault-editor-scroll ${fontClass}`}
          placeholder="Commence entry..."
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
      </div>
    </div>
  );
});