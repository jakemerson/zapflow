import React, { useRef, useState } from 'react';
import {
  Upload,
  FileJson,
  Sparkles,
  AlertTriangle,
  Layers,
  Code2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { SAMPLE_ZAPS } from '../constants/sampleZaps';
import { useMigration } from '../context/MigrationContext';
import { extractJsonFromZip } from '../services/zipReader';

export const UploadDropzone: React.FC = () => {
  const {
    rawJsonInput,
    activeSampleId,
    convertedItems,
    selectedZapIndex,
    parseError,
    setSelectedZapIndex,
    loadSampleZap,
    handleJsonUploadOrPaste,
    showToast,
  } = useMigration();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showRawEditor, setShowRawEditor] = useState(false);

  const handleFileChange = async (file?: File) => {
    if (!file) return;

    if (file.name.toLowerCase().endsWith('.zip')) {
      try {
        const buffer = await file.arrayBuffer();
        const extracted = await extractJsonFromZip(buffer);
        if (extracted) {
          handleJsonUploadOrPaste(extracted);
          showToast(`Arquivo ZIP "${file.name}" descompactado e processado com sucesso!`, 'success');
          return;
        }
        showToast('Nenhum arquivo .json foi encontrado dentro do arquivo ZIP.', 'warning');
      } catch {
        showToast('Não foi possível ler o arquivo ZIP.', 'warning');
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = String(e.target?.result || '');
      handleJsonUploadOrPaste(content);
      showToast(`Arquivo "${file.name}" importado e processado!`, 'success');
    };
    reader.readAsText(file);
  };

  return (
    <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
      {/* Sample Presets Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span>1. Escolha um Zap Real de Exemplo (1 Clique) ou Suba seu JSON do Zapier</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Clique em qualquer cenário abaixo para inspecionar a transpilação AST instantânea de gatilhos, filtros, ramificações e scripts:
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-orange-500/15 hover:bg-orange-500/25 text-orange-300 border border-orange-500/30 transition cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Importar .json do Zapier</span>
          </button>

          <button
            type="button"
            onClick={() => setShowRawEditor((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
          >
            <Code2 className="w-3.5 h-3.5 text-rose-400" />
            <span>{showRawEditor ? 'Ocultar JSON de Entrada' : 'Editar / Colar JSON do Zapier'}</span>
            {showRawEditor ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.zip,application/json,application/zip"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0])}
          />
        </div>
      </div>

      {/* 5 Sample Zap Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 mt-4">
        {SAMPLE_ZAPS.map((sample) => {
          const isSelected = activeSampleId === sample.id;
          return (
            <button
              key={sample.id}
              type="button"
              onClick={() => loadSampleZap(sample.id)}
              className={`text-left p-3 rounded-xl border transition flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-br from-orange-500/15 via-rose-500/15 to-purple-500/15 border-rose-500/60 shadow-lg shadow-rose-500/10'
                  : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800/90 text-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      sample.isBatch
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : isSelected
                          ? 'bg-rose-500/25 text-rose-200 border border-rose-500/40'
                          : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {sample.badge}
                  </span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                </div>
                <p className="text-xs font-bold text-slate-100 line-clamp-2 leading-snug">
                  {sample.name}
                </p>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 font-mono truncate">
                {sample.stepsSummary}
              </p>
            </button>
          );
        })}
      </div>

      {/* Collapsible Drag & Drop + Raw JSON Editor */}
      {showRawEditor && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFileChange(e.dataTransfer.files?.[0]);
          }}
          className={`mt-4 rounded-xl border-2 border-dashed p-3 transition ${
            isDragging
              ? 'border-rose-500 bg-rose-500/10'
              : 'border-slate-700/80 bg-slate-950/90'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <FileJson className="w-4 h-4 text-orange-400" />
              JSON de Exportação do Zapier (Edite em tempo real ou arraste um arquivo .json aqui)
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              Suporta: {'{ "steps": [...] }'}, {'{ "zaps": [...] }'} ou {'{ "nodes": {...} }'}
            </span>
          </div>
          <textarea
            value={rawJsonInput}
            onChange={(e) => handleJsonUploadOrPaste(e.target.value)}
            rows={10}
            spellCheck={false}
            className="w-full rounded-lg bg-slate-900 border border-slate-800 p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-rose-500/60"
            placeholder='Cole aqui o JSON exportado do Zapier...'
          />
        </div>
      )}

      {/* Parse Error Alert */}
      {parseError && (
        <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs text-red-300">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{parseError}</span>
          </div>
          <button
            type="button"
            onClick={() => loadSampleZap(SAMPLE_ZAPS[0].id)}
            className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs font-semibold shrink-0 cursor-pointer"
          >
            Restaurar Exemplo Válido
          </button>
        </div>
      )}

      {/* Multi-Zap Batch Selector Bar (when more than 1 Zap is detected in input) */}
      {convertedItems.length > 1 && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-lg">
              <Layers className="w-3.5 h-3.5" />
              Lote Detectado: {convertedItems.length} Zaps Convertidos
            </span>
            <span className="text-xs text-slate-400">
              Selecione um workflow abaixo para inspecionar seus nós:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {convertedItems.map((item, idx) => (
              <button
                key={item.zap.id}
                type="button"
                onClick={() => setSelectedZapIndex(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  selectedZapIndex === idx
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25'
                    : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {item.zap.title} ({item.report.overallConfidence}%)
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
