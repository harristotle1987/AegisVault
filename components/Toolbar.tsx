import React, { useRef, useState } from 'react';
import { 
  FileText, 
  Download, 
  ShieldCheck, 
  Loader2,
  Brush,
  Menu,
  Share2,
  Tag,
  Settings,
  Upload,
  Scan,
  ChevronDown
} from 'lucide-react';

interface ToolbarProps {
  markdown: string;
  isExporting: boolean;
  isSaving: boolean;
  onExport: (format: 'pdf' | 'docx' | 'html' | 'txt' | 'rtf') => void;
  onShare: () => void;
  onLocalRefine: () => void;
  onToggleSidebar: () => void;
  onOpenTags: () => void;
  onOpenConfig: () => void;
  onImport: (files: FileList) => void;
  onOpenScanner: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ 
  markdown, 
  isExporting, 
  isSaving,
  onExport, 
  onShare, 
  onLocalRefine,
  onToggleSidebar,
  onOpenTags,
  onOpenConfig,
  onImport,
  onOpenScanner
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) onImport(files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formats: { id: 'pdf' | 'docx' | 'html' | 'txt' | 'rtf', label: string }[] = [
    { id: 'pdf', label: 'PDF Vector' },
    { id: 'docx', label: 'DOCX Word' },
    { id: 'html', label: 'HTML Web' },
    { id: 'rtf', label: 'RTF Executive' },
    { id: 'txt', label: 'Plain TXT' },
  ];

  return (
    <nav className="h-16 md:h-14 border-b border-vault-border bg-obsidian-soft/80 backdrop-blur-md flex items-center justify-between px-4 md:px-6 shrink-0 z-[9999] relative">
      <div className="flex items-center gap-4 md:gap-6 h-full">
        <button 
          onClick={(e) => {
            e.preventDefault();
            onToggleSidebar();
          }}
          className="md:hidden p-2 -ml-2 text-vault-dim hover:text-white transition-all min-h-[48px] min-w-[48px] flex items-center justify-center active:scale-90 z-[9999]"
          aria-label="Toggle Sidebar"
        >
          <Menu size={22} />
        </button>

        <div className="flex items-center gap-2 z-[9999]">
          <ShieldCheck className="text-emerald-vault w-5 h-5 md:w-4 md:h-4" />
        </div>
      </div>

      <div className="flex gap-2 h-full items-center">
        <div className="flex items-center gap-1.5 mr-2 md:mr-4 border-r border-white/5 pr-2 md:pr-4">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept=".md,.txt,.html,.htm,.docx,.odt,.pdf,.rtf,.pptx"
            multiple
          />
          <button 
            onClick={onOpenScanner}
            className="p-2.5 rounded-lg border border-vault-border bg-obsidian-muted hover:bg-emerald-glow hover:border-emerald-vault/50 transition-all text-vault-dim hover:text-emerald-vault active:scale-95"
            title="Sovereign Plate Scanner"
          >
            <Scan size={18} />
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-lg border border-vault-border bg-obsidian-muted hover:bg-emerald-glow hover:border-emerald-vault/50 transition-all text-vault-dim hover:text-emerald-vault active:scale-95"
            title="Batch Ingest Assets"
          >
            <Upload size={18} />
          </button>
        </div>

        <div className="hidden sm:flex gap-2 items-center">
          <button 
            onClick={onLocalRefine}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 transition text-[10px] font-bold uppercase tracking-widest text-vault-dim border border-vault-border active:scale-95"
          >
            <Brush size={14} /> <span className="hidden lg:inline">Harden</span>
          </button>

          <button 
            onClick={onShare}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 transition text-[10px] font-bold uppercase tracking-widest text-vault-dim border border-vault-border active:scale-95"
          >
            <Share2 size={14} /> <span className="hidden lg:inline">Beam</span>
          </button>

          <div className="w-px h-6 bg-vault-border mx-1 md:mx-2" />

          <div className="relative">
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={isExporting}
              className="min-w-[130px] flex items-center justify-between gap-2 px-4 py-1.5 bg-emerald-vault hover:bg-emerald-vault/90 text-black rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50 shadow-lg active:scale-95 transition-all"
            >
              <div className="flex items-center gap-2">
                {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                <span>Execute Export</span>
              </div>
              <ChevronDown size={14} />
            </button>

            {showExportMenu && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-obsidian border border-vault-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {formats.map(f => (
                  <button
                    key={f.id}
                    onClick={() => {
                      onExport(f.id);
                      setShowExportMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-vault-dim hover:text-emerald-vault hover:bg-white/5 transition-all border-b border-vault-border/50 last:border-0"
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};