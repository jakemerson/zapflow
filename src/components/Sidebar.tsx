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
  CheckCircle2,
  Server,
  Plus,
} from 'lucide-react';
import { SAMPLE_ZAPS } from '../constants/sampleZaps';
import { useMigration } from '../context/MigrationContext';
import { extractJsonFromZip } from '../services/zipReader';

function getZapIcon(title: string, rawApp = '') {
  const t = (title + rawApp).toLowerCase();
  if (t.includes('zoom')) return <Video className="w-4 h-4 text-blue-600" />;
  if (t.includes('gmail') || t.includes('mail')) return <Mail className="w-4 h-4 text-red-600" />;
  if (t.includes('stripe') || t.includes('card')) return <CreditCard className="w-4 h-4 text-purple-600" />;
  if (t.includes('code') || t.includes('ai') || t.includes('openai')) return <Sparkles className="w-4 h-4 text-emerald-600" />;
  return <Webhook className="w-4 h-4 text-orange-600" />;
}

export const Sidebar: React.FC = () => {
  const {
    convertedItems,
    selectedZapIndex,
    setSelectedZapIndex,
    loadSampleZap,
    handleJsonUploadOrPaste,
    rawJsonInput,
    railwayDeployUrl,
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
          showToast(`Arquivo ZIP "${file.name}" descompactado com sucesso!`, 'success');
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
    <aside className="w-72 sm:w-80 border-r border-slate-200 bg-white flex flex-col justify-between shrink-0 h-full select-none text-slate-800">
      {/* Top Section: Dropzone & Zap List */}
      <div className="p-4 space-y-4 overflow-y-auto flex-1">
        {/* Clean, Obvious Dropzone */}
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
          className={`rounded-xl border-2 border-dashed p-4 flex flex-col items-center justify-center text-center cursor-pointer transition ${
            isDragging
              ? 'border-orange-500 bg-orange-50'
              : 'border-slate-300 bg-slate-50 hover:bg-orange-50/40 hover:border-orange-400'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 mb-2 shadow-xs">
            <Upload className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-slate-900">
            Arraste seu .zip ou .json
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            ou clique para escolher do computador
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.zip"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0])}
          />
        </div>

        {/* Action: Colar JSON manual */}
        <div className="flex items-center justify-between px-1">
          <button
            type="button"
            onClick={() => {
              setRawText(rawJsonInput);
              setShowRawModal(true);
            }}
            className="text-[11px] text-orange-600 hover:text-orange-700 font-semibold inline-flex items-center gap-1 cursor-pointer"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Colar JSON manualmente</span>
          </button>
        </div>

        {/* Imported Zaps List */}
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Workflows Importados ({convertedItems.length})
            </span>
          </div>

          <div className="space-y-1.5">
            {convertedItems.map((item, idx) => {
              const isSelected = idx === selectedZapIndex;
              const firstStepApp = item.zap.steps[0]?.rawApp || item.zap.steps[0]?.appKey || '';

              return (
                <button
                  key={item.zap.id || `zap-${idx}`}
                  type="button"
                  onClick={() => setSelectedZapIndex(idx)}
                  className={`w-full text-left p-3 rounded-xl border transition flex items-start gap-2.5 cursor-pointer ${
                    isSelected
                      ? 'bg-orange-50/80 border-orange-400 shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-white border border-slate-200 shrink-0 mt-0.5 shadow-2xs">
                    {getZapIcon(item.zap.title, firstStepApp)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-bold truncate ${isSelected ? 'text-orange-950' : 'text-slate-900'}`}>
                      {item.zap.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                      <span>{item.report.totalSteps} nós</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-medium">Pronto para n8n</span>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-orange-600 mt-2 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Section: Samples & 1-Click Hosting Callout */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3 shrink-0">
        <div>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2 px-1">
            Modelos de Exemplo
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SAMPLE_ZAPS.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => loadSampleZap(sample.id)}
                className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300 transition cursor-pointer"
              >
                {sample.name}
              </button>
            ))}
          </div>
        </div>

        {/* 1-Click Hosting Box in Sidebar */}
        <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200 text-left">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950 mb-1">
            <Server className="w-3.5 h-3.5 text-indigo-600" />
            <span>Ainda não tem seu n8n?</span>
          </div>
          <p className="text-[11px] text-indigo-900/80 leading-relaxed mb-2">
            Hospede seu n8n com PostgreSQL e tarefas ilimitadas por ~$5/mês.
          </p>
          <a
            href={railwayDeployUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 px-3 rounded-lg shadow-xs transition"
          >
            Criar com 1 clique ↗
          </a>
        </div>
      </div>

      {/* Modal: Colar JSON manual */}
      {showRawModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Colar Código JSON do Zapier
            </h3>
            <p className="text-xs text-slate-600 mb-3">
              Cole o conteúdo exportado do seu Zap aqui para converter:
            </p>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              rows={10}
              className="w-full p-3 font-mono text-xs rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-orange-500 focus:outline-hidden text-slate-900"
              placeholder='{ "title": "Meu Zap", "steps": [...] }'
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setShowRawModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleApplyRaw}
                className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-sm transition cursor-pointer"
              >
                Converter Workflow
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
