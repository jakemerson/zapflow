import React from 'react';
import { MigrationProvider, useMigration } from './context/MigrationContext';
import { Header } from './components/Header';
import { UploadDropzone } from './components/UploadDropzone';
import { VisualFlowDiff } from './components/VisualFlowDiff';
import { CodeInspector } from './components/CodeInspector';
import { MigrationReportCard } from './components/MigrationReportCard';
import { RoiAffiliateBanner } from './components/RoiAffiliateBanner';
import { AiCopilotModal } from './components/AiCopilotModal';
import { PaywallModal } from './components/PaywallModal';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

const WorkbenchContent: React.FC = () => {
  const { toast } = useMigration();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header />

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md animate-bounce">
          <div
            className={`px-4 py-3 rounded-xl border shadow-2xl flex items-center gap-2.5 text-xs font-semibold ${
              toast.type === 'success'
                ? 'bg-emerald-950/95 border-emerald-500/50 text-emerald-200'
                : toast.type === 'warning'
                  ? 'bg-amber-950/95 border-amber-500/50 text-amber-200'
                  : 'bg-slate-900/95 border-purple-500/50 text-purple-200'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : toast.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-purple-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Step 1: Upload / Paste / 5 Real Sample Zaps */}
        <UploadDropzone />

        {/* Step 2 & 3: Workbench Grid (Visual Flow Diff + Report on Left | n8n JSON Inspector on Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-6">
            <VisualFlowDiff />
            <MigrationReportCard />
          </div>

          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <CodeInspector />
          </div>
        </div>

        {/* Step 4: Dual Monetization Engine — Interactive ROI Calculator + 1-Click Railway Affiliate Deploy */}
        <RoiAffiliateBanner />
      </main>

      <footer className="border-t border-slate-900 bg-slate-950/90 py-5 px-4 text-center text-xs text-slate-500">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            <strong>ZapFlow (ZapierToN8N MigrationHelper)</strong> • Projeto 05 do Desafio 12 Projetos em 12 Semanas
          </span>
          <span>
            100% Client-Side AST • Compatível com n8n v1.x (Self-Hosted Railway & Cloud)
          </span>
        </div>
      </footer>

      <AiCopilotModal />
      <PaywallModal />
    </div>
  );
};

export default function App() {
  return (
    <MigrationProvider>
      <WorkbenchContent />
    </MigrationProvider>
  );
}
