import React, { useState } from 'react';
import {
  Zap,
  Copy,
  Check,
  Sparkles,
  Settings,
  Download,
} from 'lucide-react';
import { useMigration } from '../context/MigrationContext';

interface HeaderProps {
  onOpenRoiDrawer: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenRoiDrawer }) => {
  const {
    activeItem,
    copyWorkflowToClipboard,
    downloadSingleWorkflowJson,
    setAiModalOpen,
  } = useMigration();

  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyWorkflowToClipboard();
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  const zapTitle = activeItem?.zap.title || 'Workflow Ativo';
  const totalSteps = activeItem?.report.totalSteps || 0;

  return (
    <header className="h-14 border-b border-[#181f30] bg-[#090c14] px-4 sm:px-6 flex items-center justify-between gap-4 select-none shrink-0">
      {/* Brand & Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-[#151a27] border border-[#222b40] flex items-center justify-center text-[#ea4b71]">
            <Zap className="w-3.5 h-3.5 fill-[#ea4b71]" />
          </div>
          <span className="font-bold text-sm tracking-tight text-white">ZapFlow</span>
        </div>

        <span className="text-slate-600 hidden sm:inline">/</span>

        <div className="flex items-center gap-1.5 text-xs text-slate-400 truncate">
          <span className="font-mono text-slate-500 hidden md:inline">zapfile.json ›</span>
          <span className="text-slate-200 font-medium truncate">{zapTitle}</span>
          <span className="text-slate-500 font-mono shrink-0">({totalSteps} nós)</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => setAiModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-[#121623] hover:bg-[#1a2033] border border-[#1e273d] transition cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden sm:inline">Refinar Código</span>
        </button>

        <button
          type="button"
          onClick={() => downloadSingleWorkflowJson()}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#151a27] border border-transparent hover:border-[#222b40] transition cursor-pointer"
          title="Baixar .n8n.json"
        >
          <Download className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onOpenRoiDrawer}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#151a27] border border-transparent hover:border-[#222b40] transition cursor-pointer"
          title="Configurações & ROI"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Primary Action Button (Coral-Rose) */}
        <button
          type="button"
          onClick={handleCopy}
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition shadow-sm cursor-pointer ${
            copied
              ? 'bg-emerald-600 text-white'
              : 'bg-[#ea4b71] hover:bg-[#d93f64] text-white active:scale-95'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Copiado! (Ctrl+V)</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copiar para n8n (⌘V)</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
