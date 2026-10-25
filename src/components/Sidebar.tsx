import React, { useRef, useState } from 'react';
import {
  Upload,
  Video,
  Mail,
  Webhook,
  CreditCard,
  Sparkles,
  Layers,
  Code2,
  FileText,
} from 'lucide-react';
import { SAMPLE_ZAPS } from '../constants/sampleZaps';
import { useMigration } from '../context/MigrationContext';
import { extractJsonFromZip } from '../services/zipReader';

function getZapIcon(title: string, rawApp = '') {
  const t = (title + rawApp).toLowerCase();
  if (t.includes('zoom')) return <Video className="w-3.5 h-3.5 text-blue-400" />;
  if (t.includes('gmail') || t.includes('mail')) return <Mail className="w-3.5 h-3.5 text-red-400" />;
  if (t.includes('stripe') || t.includes('card')) return <CreditCard className="w-3.5 h-3.5 text-purple-400" />;
  if (t.includes('code') || t.includes('ai') || t.includes('openai')) return <Sparkles className="w-3.5 h-3.5 text-emerald-400" />;
  return <Webhook className="w-3.5 h-3.5 text-orange-400" />;
}

export const Sidebar: React.FC = () => {
  const {
    convertedItems,
    selectedZapIndex,
    setSelectedZapIndex,
    loadSampleZap,
    handleJsonUploadOrPaste,
    rawJsonInput,
    showToast,
  } = useMigration();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showRawModal, setShowRawModal] = useState(false);
  const [rawText, setRawText] = useState(rawJsonInput);

  const handleFileChange = async (file?: File) => {
    if (!file) return;

    if (file.name.toLowerCase().endsWith('.zip')) {
      try {
        const buffer = await file.arrayBuffer();
        const extracted = await extractJsonFromZip(buffer);
        if (extracted) {
          handleJsonUploadOrPaste(extracted);
          showToast(`Arquivo ZIP "${file.name}" descompactado e processado!`, 'success');
          return;
        }
        showToast('Nenhum arquivo .json encontrado dentro do ZIP.', 'warning');
      } catch {
        showToast('Erro ao ler o arquivo ZIP.', 'warning');
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = String(e.target?.result || '');
      handleJsonUploadOrPaste(content);
      showToast(`Arquivo "${file.name}" importado com sucesso!`, 'success');
    };
    reader.readAsText(file);
  };

  const handleApplyRaw = () => {
    handleJsonUploadOrPaste(rawText);
    setShowRawModal(false);
  };

  return (
    <aside className="w-72 sm:w-80 border-r border-[#181f30] bg-[#090c14] flex flex-col justify-between shrink-0 h-full select-none">
      {/* Top Section: Dropzone & Zap List */}
      <div className="p-4 space-y-4 overflow-y-auto flex-1">
        {/* Minimalist Dropzone */}
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
          onClick={() => fileInputRef.current?.click()}
          className={`rounded-xl border border-dashed p-4 flex flex-col items-center justify-center text-center cursor-pointer transition ${
            isDragging
              ? 'border-[#ea4b71] bg-[#ea4b71]/10'
              : 'border-[#222b40] bg-[#0d121c] hover:bg-[#121824] hover:border-slate-600'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-[#151c2a] flex items-center justify-center text-slate-400 mb-2">
            <Upload className="w-4 h-4" />
          </div>
          <span className="text-xs font-medium text-slate-300">
            Arraste <strong className="text-white">.json</strong> ou <strong className="text-white">.zip</strong> aqui
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5">ou clique para selecionar</span>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.zip,application/json,application/zip"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0])}
          />
        </div>

        {/* Imported Zaps List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium px-1">
            <span>Zaps Detectados ({convertedItems.length})</span>
            <button
              type="button"
              onClick={() => {
                setRawText(rawJsonInput);
                setShowRawModal(true);
              }}
              className="text-[11px] text-slate-500 hover:text-slate-300 flex items-center gap-1 cursor-pointer"
            >
              <Code2 className="w-3 h-3" />
              <span>Colar JSON</span>
            </button>
          </div>

          <div className="space-y-1">
            {convertedItems.map((item, idx) => {
              const active = selectedZapIndex === idx;
              const firstStep = item.zap.steps[0];
              return (
                <button
                  key={item.zap.id}
                  type="button"
                  onClick={() => setSelectedZapIndex(idx)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg border text-xs flex items-center justify-between gap-2.5 transition cursor-pointer ${
                    active
                      ? 'bg-[#141b2a] border-[#293652] text-white shadow-sm'
                      : 'bg-transparent hover:bg-[#0f1422] border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-6 h-6 rounded bg-[#182133] border border-[#23304a] flex items-center justify-center shrink-0">
                      {getZapIcon(item.zap.title, firstStep?.rawApp)}
                    </div>
                    <span className="truncate font-medium">{item.zap.title}</span>
                  </div>

                  <span className="text-[10px] font-mono text-slate-500 shrink-0">
                    {item.report.totalSteps} nós
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Section: Sample Presets */}
      <div className="p-4 border-t border-[#181f30] bg-[#0b0e17] space-y-2">
        <span className="text-[11px] font-semibold text-slate-400 block px-1">
          Ou teste com exemplos prontos:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {SAMPLE_ZAPS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => loadSampleZap(s.id)}
              className="px-2 py-1 rounded bg-[#121623] hover:bg-[#1a2033] border border-[#1e273d] text-slate-300 text-[10px] font-medium transition cursor-pointer"
            >
              {s.badge}
            </button>
          ))}
        </div>
      </div>

      {/* Raw JSON Paste Modal */}
      {showRawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl bg-[#0c1019] border border-[#1e273d] rounded-xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                Colar JSON do Zapier
              </span>
              <button
                type="button"
                onClick={() => setShowRawModal(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                Cancelar
              </button>
            </div>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              rows={12}
              className="w-full p-3 rounded-lg bg-[#07090f] border border-[#1e273d] font-mono text-xs text-slate-200 focus:outline-none focus:border-slate-500"
              placeholder='Cole aqui seu JSON do Zapier...'
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRawModal(false)}
                className="px-3 py-1.5 rounded-lg bg-[#121623] text-slate-300 text-xs font-medium cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleApplyRaw}
                className="px-4 py-1.5 rounded-lg bg-[#ea4b71] hover:bg-[#d93f64] text-white text-xs font-semibold cursor-pointer"
              >
                Processar JSON
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
