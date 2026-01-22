import React, { useRef, useState } from 'react';
import { 
  Download, 
  ShieldCheck, 
  Loader2,
  Brush,
  Menu,
  Share2,
  Upload,
  Scan,
  ChevronDown
} from 'lucide-react';

interface ToolbarProps {
  markdown: string;
  isExporting: boolean;
  isSaving: boolean;
  onExport: (format: 'pdf' | 'docx' | 'html' | 'txt' | 'rtf' | 'odt' | 'pptx') => void;
  onShare: () => void;
  onLocalRefine: () => void;
  onToggleSidebar: () => void;
  onOpenTags: () => void;
  onOpenConfig: () => void;
  onImport: (files: FileList) => void;
  onOpenScanner: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ 
  isExporting, 
  onExport, 
  onShare, 
  onLocalRefine,
  onToggleSidebar,
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

  const formats: { id: 'pdf' | 'docx' | 'html' | 'txt' | 'rtf' | 'odt' | 'pptx', label: string }[] = [
    { id: 'pdf', label: 'PDF Vector' },
    { id: 'docx', label: 'DOCX Word' },
    { id: 'odt', label: 'ODT Writer' },
    { id: 'pptx', label: 'PPTX Presentation' },
    { id: 'html', label: 'HTML Web' },
    { id: 'rtf', label: 'RTF Executive' },
    { id: 'txt', label: 'Plain TXT' },
  ];

  return (
    <nav className="h-20 md:h-16 border-b border-vault-border bg-obsidian-soft/80 backdrop-blur-md flex items-center justify-between px-4 md:px-6 shrink-0 z-[9999] relative">
      <div className="flex items-center gap-4 md:gap-6 h-full">
        <button 
          onClick={(e) => {
            e.preventDefault();
            onToggleSidebar();
          }}
          className="md:hidden p-2 -ml-2 text-vault-dim hover:text-white transition-all min-h-[48px] min-w-[48px] flex items-center justify-center active:scale-90 z-[10001]"
          aria-label="Toggle Sidebar"
        >
          <Menu size={22} />
        </button>

        <div className="flex items-center gap-2">
          <ShieldCheck className="text-emerald-vault w-5 h-5 md:w-4 md:h-4" />
          <span className="hidden sm:inline text-[9px] font-black uppercase tracking-widest text-vault-dim opacity-30">Vault.Core</span>
        </div>
      </div>

      <div className="flex gap-4 h-full items-center">
        <div className="flex items-center gap-4 mr-2 md:mr-4 border-r border-white/5 pr-4 md:pr-6">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept=".md,.txt,.html,.htm,.docx,.odt,.pdf,.rtf,.pptx,.vshadow"
            multiple
          />
          <button 
            onClick={onOpenScanner}
            className="flex flex-col items-center gap-1 group active:scale-95"
            title="HD Plate Scanner"
          >
            <div className="p-2.5 rounded-lg border border-vault-border bg-obsidian-muted group-hover:bg-emerald-glow group-hover:border-emerald-vault/50 transition-all text-vault-dim group-hover:text-emerald-vault">
              <Scan size={18} />
            </div>
            <span className="text-[7px] font-black uppercase tracking-widest text-vault-dim group-hover:text-emerald-vault">Scanner</span>
          </button>
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-1 group active:scale-95"
            title="Batch Bridge Ingest"
          >
            <div className="p-2.5 rounded-lg border border-vault-border bg-obsidian-muted group-hover:bg-emerald-glow group-hover:border-emerald-vault/50 transition-all text-vault-dim group-hover:text-emerald-vault">
              <Upload size={18} />
            </div>
            <span className="text-[7px] font-black uppercase tracking-widest text-vault-dim group-hover:text-emerald-vault">Ingest</span>
          </button>
        </div>

        <div className="hidden sm:flex gap-4 items-center">
          <button 
            onClick={onLocalRefine}
            className="flex flex-col items-center gap-1 group active:scale-95"
            title="Harden Markdown"
          >
            <div className="p-2.5 rounded-lg border border-vault-border bg-white/5 group-hover:bg-white/10 transition-all text-vault-dim group-hover:text-white">
              <Brush size={16} />
            </div>
            <span className="text-[7px] font-black uppercase tracking-widest text-vault-dim group-hover:text-white">Harden</span>
          </button>

          <button 
            onClick={onShare}
            className="flex flex-col items-center gap-1 group active:scale-95"
            title="Beam Shard"
          >
            <div className="p-2.5 rounded-lg border border-vault-border bg-white/5 group-hover:bg-white/10 transition-all text-vault-dim group-hover:text-white">
              <Share2 size={16} />
            </div>
            <span className="text-[7px] font-black uppercase tracking-widest text-vault-dim group-hover:text-white">Beam</span>
          </button>

          <div className="w-px h-8 bg-vault-border mx-1 md:mx-2" />

          <div className="relative">
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={isExporting}
              className="flex flex-col items-center gap-1 group active:scale-95"
              title="Execute Export"
            >
              <div className="min-w-[120px] flex items-center justify-between gap-3 px-4 py-2.5 bg-emerald-vault hover:bg-emerald-vault/90 text-black rounded-xl shadow-lg transition-all">
                <div className="flex items-center gap-2">
                  {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                  <span className="text-[9px] font-black uppercase tracking-widest">Execute</span>
                </div>
                <ChevronDown size={14} />
              </div>
              <span className="text-[7px] font-black uppercase tracking-widest text-emerald-vault opacity-60">Output Matrix</span>
            </button>

            {showExportMenu && (
              <div className="absolute top-full right-0 mt-3 w-56 bg-obsidian border border-vault-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[10010]">
                <div className="p-3 border-b border-vault-border bg-white/[0.02]">
                  <span className="text-[8px] font-black uppercase tracking-[0.3em] text-vault-dim">Select Format</span>
                </div>
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
