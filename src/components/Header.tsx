import React, { useState } from 'react';
import {
  Zap,
  Copy,
  Check,
  Sparkles,
  Settings,
  Download,
  ArrowLeft,
  Server,
  ExternalLink,
} from 'lucide-react';
import { useMigration } from '../context/MigrationContext';

interface HeaderProps {
  onOpenRoiDrawer: () => void;
  onBackToLanding?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenRoiDrawer, onBackToLanding }) => {
  const {
    activeItem,
    copyWorkflowToClipboard,
    downloadSingleWorkflowJson,
    setAiModalOpen,
    railwayDeployUrl,
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
    <header className="h-14 border-b border-slate-200 bg-white px-4 sm:px-6 flex items-center justify-between gap-4 select-none shrink-0 shadow-xs">
      {/* Brand & Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        {onBackToLanding && (
          <button
            type="button"
            onClick={onBackToLanding}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 px-2 py-1 rounded-md hover:bg-slate-100 transition mr-1 cursor-pointer"
            title="Voltar para a página inicial"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Início</span>
          </button>
        )}

        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center text-white shadow-xs">
            <Zap className="w-4 h-4 fill-white" />
          </div>
          <span className="font-bold text-sm tracking-tight text-slate-900">ZapFlow</span>
        </div>

        <span className="text-slate-300 hidden sm:inline">/</span>

        <div className="flex items-center gap-1.5 text-xs text-slate-600 truncate">
          <span className="font-medium text-slate-900 truncate">{zapTitle}</span>
          <span className="text-slate-400 font-mono text-[11px] shrink-0 bg-slate-100 px-1.5 py-0.5 rounded">
            {totalSteps} nós
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* 1-Click Hosting Highlight Button */}
        <a
          href={railwayDeployUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition"
        >
          <Server className="w-3.5 h-3.5 text-indigo-600" />
          <span>Ainda não tem seu n8n hospedado?</span>
          <span className="font-bold">Criar com 1 clique ↗</span>
        </a>

        <button
          type="button"
          onClick={() => setAiModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span className="hidden lg:inline">Refinar Código IA</span>
        </button>

        <button
          type="button"
          onClick={() => downloadSingleWorkflowJson()}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
          title="Baixar arquivo JSON do n8n"
        >
          <Download className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onOpenRoiDrawer}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
          title="Calculadora de Economia & ROI"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Primary Action: Copiar para n8n */}
        <button
          type="button"
          onClick={handleCopy}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow-sm cursor-pointer ${
            copied
              ? 'bg-emerald-600 text-white'
              : 'bg-orange-600 hover:bg-orange-700 text-white active:scale-95'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Copiado! Aperte Ctrl+V no n8n</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copiar para n8n (Ctrl+V)</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
