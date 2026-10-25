import React, { useState } from 'react';
import { MigrationProvider, useMigration } from './context/MigrationContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { CanvasWorkbench } from './components/CanvasWorkbench';
import { StatusBar } from './components/StatusBar';
import { RoiDrawer } from './components/RoiDrawer';
import { AiCopilotModal } from './components/AiCopilotModal';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

const WorkbenchContent: React.FC = () => {
  const { toast } = useMigration();
  const [isRoiDrawerOpen, setIsRoiDrawerOpen] = useState(false);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#08090d] text-slate-100 overflow-hidden font-sans selection:bg-[#ea4b71]/30 selection:text-white">
      {/* Linear-style Top Navigation */}
      <Header onOpenRoiDrawer={() => setIsRoiDrawerOpen(true)} />

      {/* Main Studio Two-Panel Layout */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Sidebar: Dropzone + Imported Zaps + Presets */}
        <Sidebar />

        {/* Right Studio Canvas: Visual Node Flow + JSON n8n + Audit Checklist */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#08090d] overflow-hidden">
          <CanvasWorkbench />
        </main>
      </div>

      {/* Pinned Bottom Status Bar */}
      <StatusBar onOpenRoiDrawer={() => setIsRoiDrawerOpen(true)} />

      {/* Slide-over ROI & Railway Settings Drawer */}
      <RoiDrawer
        isOpen={isRoiDrawerOpen}
        onClose={() => setIsRoiDrawerOpen(false)}
      />

      {/* AI Copilot & Expression Refiner Modal */}
      <AiCopilotModal />

      {/* Minimalist Floating Toast */}
      {toast && (
        <div className="fixed bottom-14 right-6 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div
            className={`px-3.5 py-2.5 rounded-lg border shadow-xl flex items-center gap-2.5 text-xs font-medium backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-[#0f1f18]/95 border-emerald-500/40 text-emerald-200'
                : toast.type === 'warning'
                  ? 'bg-[#221708]/95 border-amber-500/40 text-amber-200'
                  : 'bg-[#151222]/95 border-purple-500/40 text-purple-200'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : toast.type === 'warning' ? (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            ) : (
              <Info className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
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
