import React, { useState } from 'react';
import {
  Copy,
  Check,
  Download,
  PackageCheck,
  Terminal,
  Sparkles,
} from 'lucide-react';
import { useMigration } from '../context/MigrationContext';

export const CodeInspector: React.FC = () => {
  const {
    activeItem,
    convertedItems,
    copyWorkflowToClipboard,
    downloadSingleWorkflowJson,
    downloadBatchBundle,
  } = useMigration();

  const [copied, setCopied] = useState(false);

  if (!activeItem) return null;

  const { workflow, workflowJsonString } = activeItem;

  const handleCopy = async () => {
    await copyWorkflowToClipboard();
    setCopied(true);
    setTimeout(() => setCopied(false), 2800);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col h-full">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>3. Workflow JSON do n8n (Pronto para Colar ou Importar)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Dica Pro: Clique em <strong className="text-emerald-300">Copiar Workflow</strong>, abra o canvas do n8n no navegador e pressione{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 font-mono text-[10px]">
              Ctrl+V
            </kbd>{' '}
            /{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 font-mono text-[10px]">
              Cmd+V
            </kbd>
            !
          </p>
        </div>

        <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
          {workflow.nodes.length} nodes • {Object.keys(workflow.connections).length} conexões
        </span>
      </div>

      {/* Primary Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3">
        <button
          type="button"
          onClick={handleCopy}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-lg cursor-pointer ${
            copied
              ? 'bg-emerald-600 text-white shadow-emerald-600/25'
              : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-emerald-500/20'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              <span>Copiado! Pressione Ctrl+V no Canvas do n8n</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copiar Workflow (Colar c/ Ctrl+V no n8n)</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => downloadSingleWorkflowJson()}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-rose-400" />
            <span>Baixar .n8n.json</span>
          </button>

          {convertedItems.length > 1 && (
            <button
              type="button"
              onClick={downloadBatchBundle}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition cursor-pointer"
              title="Exportar todos os workflows convertidos em um único pacote"
            >
              <PackageCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Baixar Lote ({convertedItems.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* JSON Code Viewer */}
      <div className="relative mt-3 flex-1 min-h-[360px] max-h-[540px] overflow-auto rounded-xl bg-slate-950 border border-slate-800/90 p-3.5">
        <div className="sticky top-0 right-0 flex justify-end pointer-events-none">
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900/90 text-emerald-400 border border-slate-800">
            <Sparkles className="w-3 h-3" /> n8n Schema v1 Validated
          </span>
        </div>
        <pre className="text-[11px] font-mono text-slate-200 leading-relaxed select-all">
          {workflowJsonString}
        </pre>
      </div>
    </div>
  );
};
