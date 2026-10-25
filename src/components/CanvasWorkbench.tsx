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
  ArrowRight,
  Server,
  Info,
} from 'lucide-react';
import { useMigration } from '../context/MigrationContext';

type TabMode = 'visual' | 'json' | 'audit';

function getNodeIcon(type: string, name: string) {
  const t = (type + name).toLowerCase();
  if (t.includes('zoom')) return <Video className="w-4 h-4 text-blue-600" />;
  if (t.includes('gmail') || t.includes('mail')) return <Mail className="w-4 h-4 text-red-600" />;
  if (t.includes('stripe')) return <CreditCard className="w-4 h-4 text-purple-600" />;
  if (t.includes('code') || t.includes('ai') || t.includes('openai')) return <Sparkles className="w-4 h-4 text-emerald-600" />;
  if (t.includes('webhook')) return <Webhook className="w-4 h-4 text-orange-600" />;
  return <GitBranch className="w-4 h-4 text-slate-600" />;
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
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-500 text-sm bg-slate-50">
        <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mb-3">
          <GitBranch className="w-6 h-6" />
        </div>
        <p className="font-semibold text-slate-800">Nenhum workflow selecionado</p>
        <p className="text-xs text-slate-500 mt-1">
          Arraste um arquivo .zip ou selecione um modelo ao lado para visualizar.
        </p>
      </div>
    );
  }

  const { zap, workflow, report, workflowJsonString } = activeItem;

  const handleCopy = async () => {
    await copyWorkflowToClipboard();
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 select-none overflow-hidden">
      {/* Workbench Tab Navigation */}
      <div className="h-12 border-b border-slate-200 bg-white px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('visual')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'visual'
                ? 'bg-orange-50 text-orange-700 border border-orange-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5 text-orange-600" />
            <span>Fluxo Visual</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('json')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'json'
                ? 'bg-orange-50 text-orange-700 border border-orange-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Código JSON n8n</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-orange-50 text-orange-700 border border-orange-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Checklist de Migração</span>
          </button>
        </div>

        {/* Copy CTA */}
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition cursor-pointer border border-orange-200"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700">Copiado para a área de transferência!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copiar JSON</span>
            </>
          )}
        </button>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {/* TAB 1: VISUAL FLOW GRAPH */}
        {activeTab === 'visual' && (
          <div className="space-y-5 max-w-5xl mx-auto">
            {/* Friendly How-To-Paste Instruction Card */}
            <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-4 text-xs shadow-xs text-amber-950 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-amber-200/70 flex items-center justify-center shrink-0 text-amber-800">
                <StickyNote className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-amber-900 text-sm">
                  💡 Como colar no n8n em 3 segundos:
                </p>
                <p className="text-amber-800/90 mt-1 leading-relaxed">
                  1. Clique em <strong className="text-amber-950">"Copiar para n8n (Ctrl+V)"</strong> no topo da página.{' '}
                  2. Abra uma aba com seu n8n e clique em qualquer parte em branco do editor.{' '}
                  3. Pressione <kbd className="px-1.5 py-0.5 bg-amber-200/80 rounded font-mono text-[11px] font-bold">Ctrl+V</kbd> (ou <kbd className="px-1.5 py-0.5 bg-amber-200/80 rounded font-mono text-[11px] font-bold">⌘V</kbd> no Mac). Os nós serão colados conectados automaticamente!
                </p>
              </div>
            </div>

            {/* Visual Node Diagram (Horizontal Flow) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm overflow-x-auto">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-6 flex items-center justify-between">
                <span>Diagrama de Execução ({workflow.nodes.length} nós)</span>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px] font-semibold">
                  Sintaxe n8n v1 Validada
                </span>
              </div>

              <div className="flex items-center gap-3 min-w-max py-4">
                {workflow.nodes.map((node, i) => {
                  const isTrigger = i === 0;
                  const stepParams = Object.entries(node.parameters || {}).filter(
                    ([k]) => !['jsCode', 'rules'].includes(k)
                  );

                  return (
                    <React.Fragment key={node.id}>
                      {/* Node Card */}
                      <div className="w-64 rounded-xl border border-slate-200 bg-slate-50/60 p-4 shadow-xs hover:shadow-md hover:border-slate-300 transition">
                        <div className="flex items-center justify-between mb-2.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                              {getNodeIcon(node.type, node.name)}
                            </div>
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {node.name}
                            </span>
                          </div>

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              isTrigger
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {isTrigger ? 'Gatilho' : 'Ação'}
                          </span>
                        </div>

                        <div className="text-[11px] font-mono text-slate-500 bg-white border border-slate-200 rounded p-1.5 truncate mb-2">
                          {node.type.replace('n8n-nodes-base.', '')}
                        </div>

                        {/* Parameter Chips */}
                        {stepParams.length > 0 && (
                          <div className="space-y-1 mt-2 pt-2 border-t border-slate-200">
                            {stepParams.slice(0, 3).map(([key, val]) => (
                              <div
                                key={key}
                                className="text-[10px] font-mono text-slate-600 bg-white px-2 py-1 rounded border border-slate-200/80 truncate"
                              >
                                <span className="text-orange-600 font-semibold">{key}: </span>
                                <span>{typeof val === 'object' ? JSON.stringify(val) : String(val)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Horizontal Connector Arrow */}
                      {i < workflow.nodes.length - 1 && (
                        <div className="flex items-center text-slate-300 px-1">
                          <ArrowRight className="w-5 h-5 text-slate-400" />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Quick 1-Click Hosting Reminder at Bottom of Canvas */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-indigo-950">
                <Server className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  <strong>Ainda não tem seu n8n hospedado na nuvem?</strong> Crie seu servidor com 1 clique por ~$5/mês e tarefas ilimitadas.
                </span>
              </div>
              <a
                href={railwayDeployUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3.5 py-1.5 rounded-lg shadow-2xs transition"
              >
                Criar com 1 clique ↗
              </a>
            </div>
          </div>
        )}

        {/* TAB 2: CODE JSON INSPECTOR */}
        {activeTab === 'json' && (
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-xs text-slate-600">
                JSON nativo gerado no schema oficial do <strong className="text-slate-900">n8n v1</strong>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xs transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado!' : 'Copiar JSON'}</span>
              </button>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 overflow-x-auto shadow-md">
              <pre className="font-mono text-xs text-slate-200 leading-relaxed">
                {workflowJsonString}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 3: AUDIT CHECKLIST */}
        {activeTab === 'audit' && (
          <div className="max-w-3xl mx-auto space-y-5">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Checklist de Ativação do Workflow
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Itens necessários para ativar seu fluxo no n8n após colar:
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    {report.overallConfidence}% de Confiança
                  </span>
                </div>
              </div>

              {/* Required Credentials List */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 block mb-1">
                  Credenciais Necessárias:
                </span>
                {report.requiredCredentials.map((cred) => (
                  <div
                    key={cred}
                    className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/70"
                  >
                    <KeyRound className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-slate-900">
                        {cred}
                      </span>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Configure a conta ou chave de autenticação para este serviço dentro do n8n.
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Activation Checklist with Checkboxes */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-700 block mb-1">
                  Etapas de Validação:
                </span>
                {report.checklist.map((item, idx) => {
                  const isChecked = !!checkedItems[`item-${idx}`];
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleCheck(`item-${idx}`)}
                      className="w-full flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition text-left cursor-pointer"
                    >
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      )}
                      <span
                        className={`text-xs ${
                          isChecked ? 'line-through text-slate-400' : 'text-slate-800'
                        }`}
                      >
                        {item}
                      </span>
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
