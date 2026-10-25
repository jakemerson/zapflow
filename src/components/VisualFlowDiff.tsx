import React from 'react';
import {
  ArrowRight,
  GitBranch,
  KeyRound,
  Sparkles,
  StickyNote,
  CheckCircle2,
  AlertCircle,
  Cpu,
} from 'lucide-react';
import { useMigration } from '../context/MigrationContext';

export const VisualFlowDiff: React.FC = () => {
  const { activeItem, refineStepCodeWithAi, isRefiningCode } = useMigration();

  if (!activeItem) return null;

  const { zap, workflow, report } = activeItem;
  const stickyNode = workflow.nodes.find(
    (n) => n.type === 'n8n-nodes-base.stickyNote'
  );

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-rose-400" />
            <span>2. Mapa Visual de Transpilação (Passos Zapier → Grafo DAG n8n)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Workflow: <strong className="text-slate-200">{zap.title}</strong> •{' '}
            {report.totalSteps} nós operacionais + 1 Sticky Note gerados
          </p>
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium">
            {report.nativeMappedCount} Mapeamentos 1:1
          </span>
          {report.heuristicMappedCount > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/30 font-medium">
              {report.heuristicMappedCount} Code AST
            </span>
          )}
          {report.fallbackCount > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 font-medium">
              {report.fallbackCount} HTTP Fallback
            </span>
          )}
        </div>
      </div>

      {/* Preview of Auto-Injected n8n Sticky Note */}
      {stickyNode && (
        <div className="rounded-xl bg-amber-400/10 border border-amber-400/30 p-3.5 text-xs text-amber-100/90">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 font-bold text-amber-300">
              <StickyNote className="w-4 h-4" />
              Sticky Note Injetada no Topo do Canvas do n8n (Posição [{stickyNode.position[0]}, {stickyNode.position[1]}])
            </span>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-400/20 text-amber-200">
              n8n-nodes-base.stickyNote
            </span>
          </div>
          <pre className="whitespace-pre-wrap font-mono text-[11px] text-amber-100/80 bg-slate-950/60 p-2.5 rounded-lg border border-amber-500/20">
            {String(stickyNode.parameters.content || '')}
          </pre>
        </div>
      )}

      {/* Step-by-Step Comparison List */}
      <div className="space-y-2.5">
        {report.stepResults.map((stepRes, idx) => {
          const badgeStyle =
            stepRes.mappingStatus === 'native'
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              : stepRes.mappingStatus === 'heuristic'
                ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                : 'bg-amber-500/15 text-amber-300 border-amber-500/30';

          const badgeLabel =
            stepRes.mappingStatus === 'native'
              ? 'Nó Nativo n8n'
              : stepRes.mappingStatus === 'heuristic'
                ? 'Code AST'
                : 'HTTP Request Fallback';

          return (
            <div
              key={stepRes.n8nNodeId}
              className="rounded-xl bg-slate-950/80 border border-slate-800/90 p-3 hover:border-slate-700 transition"
            >
              <div className="grid grid-cols-1 md:grid-cols-11 items-center gap-3">
                {/* Left: Zapier Original Step */}
                <div className="md:col-span-5 flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-orange-500/20 border border-orange-500/40 text-orange-300 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-orange-500/15 text-orange-300">
                        Zapier {stepRes.zapRole}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {stepRes.zapAppKey}.{stepRes.zapActionKey}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-200 mt-1 truncate">
                      {stepRes.zapStepTitle}
                    </p>
                  </div>
                </div>

                {/* Arrow */}
                <div className="md:col-span-1 flex items-center justify-center">
                  <div className="w-7 h-7 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-rose-400">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Right: Generated n8n Node */}
                <div className="md:col-span-5 flex flex-col justify-between bg-slate-900/90 border border-slate-800 rounded-lg p-2.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs font-bold text-rose-300 truncate">
                      {stepRes.n8nNodeName}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${badgeStyle}`}
                    >
                      {badgeLabel} ({stepRes.confidenceScore}%)
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-1.5 text-[11px] text-slate-400 font-mono">
                    <span className="truncate">{stepRes.n8nNodeType}</span>
                    <span className="text-slate-500 shrink-0">
                      [{stepRes.n8nPosition[0]}, {stepRes.n8nPosition[1]}]
                    </span>
                  </div>

                  {/* Metadata & Actions row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-800/80 text-[11px]">
                    <div className="flex flex-wrap items-center gap-2">
                      {stepRes.expressionsConverted > 0 && (
                        <span className="inline-flex items-center gap-1 text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" />
                          {stepRes.expressionsConverted} expr{' '}
                          <code className="text-[10px]">{'={{ $json }}'}</code>
                        </span>
                      )}
                      {stepRes.requiredCredential && (
                        <span className="inline-flex items-center gap-1 text-amber-300">
                          <KeyRound className="w-3 h-3" />
                          {stepRes.requiredCredential}
                        </span>
                      )}
                    </div>

                    {stepRes.isCodeStep && (
                      <button
                        type="button"
                        disabled={isRefiningCode}
                        onClick={() => refineStepCodeWithAi(stepRes.n8nNodeId)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/40 font-semibold text-[11px] transition cursor-pointer disabled:opacity-50"
                      >
                        {isRefiningCode ? (
                          <Cpu className="w-3 h-3 animate-spin" />
                        ) : (
                          <Sparkles className="w-3 h-3 text-purple-300" />
                        )}
                        <span>Refinar Código c/ IA</span>
                      </button>
                    )}
                  </div>

                  {stepRes.warnings.length > 0 && (
                    <div className="mt-2 p-2 rounded bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200 flex items-start gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{stepRes.warnings[0]}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
