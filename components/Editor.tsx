import React, { useRef, useEffect, useState, useDeferredValue, useCallback } from 'react';
import { VaultFont } from '../types';
import { RotateCcw, RotateCw } from 'lucide-react';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  font?: VaultFont;
  activeDocId?: string | null;
}

export const Editor: React.FC<EditorProps> = ({ value, onChange, font = 'mono', activeDocId }) => {
  const fontClass = font === 'mono' ? 'font-mono' : 'font-sans';
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastScrolledId = useRef<string | null>(null);
  
  // Internal content state
  const [internalValue, setInternalValue] = useState(value);
  const deferredValue = useDeferredValue(internalValue);

  // Undo/Redo History Stack
  const [history, setHistory] = useState<string[]>([value]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Sync internal value when switching documents
  useEffect(() => {
    setInternalValue(value);
    setHistory([value]);
    setHistoryIndex(0);
  }, [activeDocId]);

  // Propagate changes with deferred logic
  useEffect(() => {
    if (deferredValue !== value) {
      onChange(deferredValue);
    }
  }, [deferredValue, onChange, value]);

  const addToHistory = useCallback((newValue: string) => {
    if (newValue === history[historyIndex]) return;
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newValue);
    if (newHistory.length > 100) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setInternalValue(prev);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setInternalValue(next);
    }
  }, [history, historyIndex]);

  // Keyboard Command Intercept
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isZ = e.key.toLowerCase() === 'z';
      const isY = e.key.toLowerCase() === 'y';
      const isCtrl = e.ctrlKey || e.metaKey;

      if (isCtrl && isZ) {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if (isCtrl && isY) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    setInternalValue(newVal);
  };

  const handleBlur = () => {
    addToHistory(internalValue);
  };

  // Sovereign Scroll Stability Protocol
  useEffect(() => {
    if (activeDocId && activeDocId !== lastScrolledId.current) {
      if (textareaRef.current) {
        const el = textareaRef.current;
        requestAnimationFrame(() => {
          el.scrollTop = el.scrollHeight;
          lastScrolledId.current = activeDocId;
        });
      }
    }
  }, [activeDocId]);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-obsidian">
      <div className="h-10 px-4 flex items-center justify-between bg-obsidian-soft border-b border-vault-border text-[10px] uppercase tracking-widest text-vault-dim font-bold shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-vault/40" />
            <span>Source Editor</span>
          </div>
          <div className="flex items-center gap-1 border-l border-vault-border pl-4">
            <button 
              onClick={handleUndo} 
              disabled={historyIndex <= 0}
              className={`p-1 transition-all ${historyIndex > 0 ? 'text-emerald-vault hover:text-white' : 'text-vault-dim opacity-20'}`}
              title="Undo (Ctrl+Z)"
            >
              <RotateCcw size={14} />
            </button>
            <button 
              onClick={handleRedo} 
              disabled={historyIndex >= history.length - 1}
              className={`p-1 transition-all ${historyIndex < history.length - 1 ? 'text-emerald-vault hover:text-white' : 'text-vault-dim opacity-20'}`}
              title="Redo (Ctrl+Y)"
            >
              <RotateCw size={14} />
            </button>
          </div>
        </div>
        <span className="text-[9px] opacity-50 font-mono">MD.GFM</span>
      </div>
      <div className="flex-1 relative overflow-hidden">
        <textarea
          ref={textareaRef}
          value={internalValue}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`absolute inset-0 w-full h-full bg-obsidian p-8 md:p-12 pb-[200px] focus:outline-none resize-none text-sm leading-relaxed text-vault-text placeholder:text-zinc-800 caret-emerald-vault transition-colors overflow-y-auto vault-editor-scroll ${fontClass}`}
          placeholder="Commence entry..."
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
      </div>
    </div>
  );
};