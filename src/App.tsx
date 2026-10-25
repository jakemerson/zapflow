import React, { useState } from 'react';
import { MigrationProvider, useMigration } from './context/MigrationContext';
import { LandingPage } from './components/LandingPage';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { CanvasWorkbench } from './components/CanvasWorkbench';
import { StatusBar } from './components/StatusBar';
import { RoiDrawer } from './components/RoiDrawer';
import { AiCopilotModal } from './components/AiCopilotModal';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

const MainApp: React.FC = () => {
  const { toast } = useMigration();
  const [currentView, setCurrentView] = useState<'landing' | 'migrator'>('landing');
  const [isRoiDrawerOpen, setIsRoiDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-orange-100 selection:text-orange-900">
      {currentView === 'landing' ? (
        <LandingPage onOpenMigrator={() => setCurrentView('migrator')} />
      ) : (
        <div className="h-screen w-screen flex flex-col bg-slate-50 text-slate-900 overflow-hidden">
          {/* Header */}
          <Header
            onOpenRoiDrawer={() => setIsRoiDrawerOpen(true)}
            onBackToLanding={() => setCurrentView('landing')}
          />

          {/* 2-Panel Migrator Studio */}
          <div className="flex-1 flex min-h-0 overflow-hidden">
            {/* Left Sidebar: Upload / Presets / Zap List */}
            <Sidebar />

            {/* Main Workbench: Visual Flow / JSON / Checklist */}
            <main className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden">
              <CanvasWorkbench />
            </main>
          </div>

          {/* Bottom Status Bar */}
          <StatusBar onOpenRoiDrawer={() => setIsRoiDrawerOpen(true)} />
        </div>
      )}

      {/* ROI & Hosting Settings Slide-Over Drawer */}
      <RoiDrawer
        isOpen={isRoiDrawerOpen}
        onClose={() => setIsRoiDrawerOpen(false)}
      />

      {/* AI Script Refiner Modal */}
      <AiCopilotModal />

      {/* Modern Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-14 right-6 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div
            className={`px-4 py-3 rounded-xl border shadow-xl flex items-center gap-2.5 text-xs font-semibold backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : toast.type === 'warning'
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-purple-50 border-purple-300 text-purple-900'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : toast.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-purple-600 shrink-0" />
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
      <MainApp />
    </MigrationProvider>
  );
}
