import React, { useState } from 'react';
import {
  GitBranch,
  FileCode2,
  ShieldCheck,
  StickyNote,
  Copy,
  Check,
  Video,
  Mail,
  Webhook,
  Sparkles,
  CreditCard,
  KeyRound,
  CheckSquare,
  Square,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { useMigration } from '../context/MigrationContext';

type TabMode = 'visual' | 'json' | 'audit';

function getNodeIcon(type: string, name: string) {
  const t = (type + name).toLowerCase();
  if (t.includes('zoom')) return <Video className="w-4 h-4 text-blue-400" />;
  if (t.includes('gmail') || t.includes('mail')) return <Mail className="w-4 h-4 text-red-400" />;
  if (t.includes('stripe')) return <CreditCard className="w-4 h-4 text-purple-400" />;
  if (t.includes('code') || t.includes('ai') || t.includes('openai')) return <Sparkles className="w-4 h-4 text-emerald-400" />;
  if (t.includes('webhook')) return <Webhook className="w-4 h-4 text-orange-400" />;
  return <GitBranch className="w-4 h-4 text-slate-400" />;
}

export const CanvasWorkbench: React.FC = () => {
  const {
    activeItem,
    copyWorkflowToClipboard,
    railwayDeployUrl,
  } = useMigration();

  const [activeTab, setActiveTab] = useState<TabMode>('visual');
  const [copied, setCopied] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  if (!activeItem) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-slate-500 text-xs">
        Selecione ou importe um Zap para começar.
      </div>
    );
  }

  const { zap, workflow, report, workflowJsonString } = activeItem;

  const handleCopy = async () => {
    await copyWorkflowToClipboard();
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  const stickyNode = workflow.nodes.find((n) => n.type === 'n8n-nodes-base.stickyNote');
  const operationalNodes = workflow.nodes.filter((n) => n.type !== 'n8n-nodes-base.stickyNote');

  return (
    <div className="flex-1 flex flex-col h-full bg-[#08090d] overflow-hidden select-none">
      {/* Tab Navigation Strip */}
      <div className="h-11 border-b border-[#181f30] px-6 flex items-center justify-between bg-[#0a0d14] shrink-0">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('visual')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'visual'
                ? 'bg-[#141b2a] text-white border border-[#232f47]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5 text-[#ea4b71]" />
            <span>Fluxo Visual</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('json')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'json'
                ? 'bg-[#141b2a] text-white border border-[#232f47]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5 text-blue-400" />
            <span>JSON n8n</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'audit'
                ? 'bg-[#141b2a] text-white border border-[#232f47]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Auditoria ({report.overallConfidence}%)</span>
          </button>
        </div>

        <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
          {operationalNodes.length} nós • {report.expressionsConvertedCount} expressões ={'{{ $json }}'}
        </span>
      </div>

      {/* Main Tab Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* TAB 1: VISUAL FLOW CANVAS */}
        {activeTab === 'visual' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Sticky Note Canvas Preview */}
            {stickyNode && (
              <div className="rounded-xl bg-[#2b2716] border border-[#524a29] p-4 text-xs text-[#fef3c7] shadow-sm">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-semibold flex items-center gap-1.5 text-amber-300">
                    <StickyNote className="w-4 h-4 text-amber-400" />
                    Guia de Migração (Sticky Note no Canvas do n8n)
                  </span>
                  <span className="text-[10px] font-mono text-amber-300/60 uppercase">
                    n8n-nodes-base.stickyNote
                  </span>
                </div>
                <div className="space-y-1.5 font-mono text-[11px] text-[#fef3c7]/90 leading-relaxed">
                  <p className="font-bold text-amber-200">⚡ Migrado de: {zap.title}</p>
                  {report.requiredCredentials.length > 0 ? (
                    <p>
                      <strong>Credenciais necessárias:</strong> {report.requiredCredentials.join(', ')}
                    </p>
                  ) : (
                    <p className="text-emerald-300">✓ Nenhuma credencial OAuth externa obrigatória</p>
                  )}
                  <p className="text-slate-400 text-[10px] pt-1">
                    💡 Dica: Suba seu n8n na Railway por ~$5/mês com banco de dados dedicado.
                  </p>
                </div>
              </div>
            )}

            {/* Visual Node Sequence */}
            <div className="space-y-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                Nós Gerados em Sequência (DAG):
              </span>

              <div className="flex flex-col sm:flex-row items-center justify-start gap-3 sm:gap-4 overflow-x-auto pb-4">
                {operationalNodes.map((node, index) => {
                  const isLast = index === operationalNodes.length - 1;
                  const stepRes = report.stepResults.find((s) => s.n8nNodeId === node.id);

                  // Extract 1 or 2 parameter snippets to display
                  const paramKeys = Object.keys(node.parameters || {}).filter(
                    (k) => typeof node.parameters[k] === 'string' && (node.parameters[k] as string).includes('{{')
                  );

                  return (
                    <React.Fragment key={node.id}>
                      {/* Node Card */}
                      <div className="w-full sm:w-64 rounded-xl bg-[#0f1422] border border-[#1f283d] p-3.5 flex flex-col justify-between shrink-0 shadow-sm hover:border-[#2f3d5c] transition">
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded bg-[#182133] border border-[#26344f] flex items-center justify-center">
                                {getNodeIcon(node.type, node.name)}
                              </div>
                              <span className="text-xs font-semibold text-white truncate max-w-[130px]">
                                {node.name}
                              </span>
                            </div>

                            <span className="text-[10px] font-mono text-slate-400 bg-[#161c2b] px-1.5 py-0.5 rounded border border-[#232c42]">
                              {index === 0 ? 'trigger' : 'action'}
                            </span>
                          </div>

                          <span className="text-[10px] font-mono text-slate-400 block truncate mb-2">
                            {node.type.replace('n8n-nodes-base.', '')}
                          </span>

                          {/* Parameters snippet preview */}
                          {paramKeys.length > 0 ? (
                            <div className="space-y-1 bg-[#090d16] p-2 rounded-lg border border-[#182033] font-mono text-[10px] text-slate-300">
                              {paramKeys.slice(0, 2).map((key) => (
                                <div key={key} className="truncate">
                                  <span className="text-slate-400">{key}: </span>
                                  <span className="text-rose-300 font-semibold">
                                    {String(node.parameters[key])}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="bg-[#090d16] p-2 rounded-lg border border-[#182033] text-[10px] text-slate-400">
                              Configuração padrão gerada
                            </div>
                          )}
                        </div>

                        {/* Status bar in card */}
                        <div className="mt-3 pt-2 border-t border-[#182033] flex items-center justify-between text-[10px]">
                          <span className="text-slate-400">
                            Posição: [{node.position[0]}, {node.position[1]}]
                          </span>
                          {stepRes?.requiredCredential && (
                            <span className="text-amber-400 truncate max-w-[90px]">
                              🔑 {stepRes.requiredCredential.split(' ')[0]}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Connector Arrow */}
                      {!isLast && (
                        <div className="hidden sm:flex items-center justify-center text-slate-600">
                          <svg width="28" height="16" viewBox="0 0 28 16" fill="none">
                            <path
                              d="M0 8H24M24 8L18 2M24 8L18 14"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: JSON OUTPUT */}
        {activeTab === 'json' && (
          <div className="max-w-4xl mx-auto space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Workflow JSON oficial compatível com n8n v1+</span>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141b2a] hover:bg-[#1a2336] text-slate-200 border border-[#232f47] transition cursor-pointer font-medium"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado!' : 'Copiar JSON'}</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-[#090d16] border border-[#182033] font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed max-h-[560px]">
              {workflowJsonString}
            </pre>
          </div>
        )}

        {/* TAB 3: AUDITORIA & CREDENCIAIS */}
        {activeTab === 'audit' && (
          <div className="max-w-3xl mx-auto space-y-6 text-xs">
            {/* Score Banner */}
            <div className="p-4 rounded-xl bg-[#0f1422] border border-[#1f283d] flex items-center justify-between">
              <div>
                <span className="font-semibold text-white text-sm block">
                  Score de Confiança: {report.overallConfidence}%
                </span>
                <p className="text-slate-400 text-xs mt-0.5">
                  {report.nativeMappedCount} nós com mapeamento 1:1 • {report.expressionsConvertedCount} expressões transpiladas
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            {/* Credentials to connect */}
            <div className="space-y-2">
              <span className="font-semibold text-slate-300 block">
                Credenciais Necessárias no n8n:
              </span>
              {report.requiredCredentials.length === 0 ? (
                <p className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg">
                  ✓ Nenhuma credencial OAuth externa obrigatória detectada neste Zap.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {report.requiredCredentials.map((cred) => (
                    <div
                      key={cred}
                      className="p-3 rounded-lg bg-[#0e1320] border border-[#1c2538] flex items-center gap-2 text-amber-200"
                    >
                      <KeyRound className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{cred}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Step-by-step checklist */}
            <div className="space-y-2">
              <span className="font-semibold text-slate-300 block">
                Checklist de Ativação pós-migração:
              </span>
              <div className="space-y-1.5">
                {report.checklist.map((item, idx) => {
                  const key = `audit-${idx}`;
                  const isDone = Boolean(checkedItems[key]);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() =>
                        setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }))
                      }
                      className={`w-full text-left p-3 rounded-lg border flex items-start gap-2.5 transition cursor-pointer ${
                        isDone
                          ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-500 line-through'
                          : 'bg-[#0e1320] border-[#1c2538] text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {isDone ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                      )}
                      <span>{item}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
