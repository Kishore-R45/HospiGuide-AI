import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useLanguageStore, useUIStore } from '../../shared/store';
import type { BottomTab } from '../../shared/store';
import { MessageSquare, Map as MapIcon, Stethoscope, Settings } from 'lucide-react';
import { Toast } from '../../shared/components';

export const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguageStore();
  const { activeTab, setActiveTab, isFullscreen, toast, clearToast } = useUIStore();

  // Sync active tab with current route
  React.useEffect(() => {
    const path = location.pathname;
    if (path.includes('/app/chat')) setActiveTab('chat');
    else if (path.includes('/app/map')) setActiveTab('map');
    else if (path.includes('/app/doctors')) setActiveTab('doctors');
    else if (path.includes('/app/settings')) setActiveTab('settings');
  }, [location, setActiveTab]);

  const handleTabClick = (tab: BottomTab, route: string) => {
    setActiveTab(tab);
    navigate(route);
  };

  return (
    <div className="flex flex-col h-[100dvh] max-h-[100dvh] overflow-hidden relative bg-surface-0">
      {/* Global Toast */}
      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          visible={!!toast}
          onClose={clearToast}
        />
      )}

      {/* Header - Hidden in fullscreen mode */}
      {!isFullscreen && (
        <header className="sticky top-0 z-[100] h-[56px] flex items-center px-4 bg-white/88 backdrop-blur-md border-b border-surface-200 shrink-0">
          <img src="/assets/Logo- HospiGuide AI.png" alt="Logo" className="w-8 h-8 mr-3 object-contain" />
          <h1 className="text-lg font-bold text-surface-900 m-0">HospiGuide AI</h1>
        </header>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <Outlet />
      </main>

      {/* Bottom Navigation - Hidden in fullscreen mode */}
      {!isFullscreen && (
        <nav className="fixed bottom-0 left-0 right-0 h-[calc(64px+env(safe-area-inset-bottom))] bg-surface-0 border-t border-surface-200 flex justify-around items-center px-2 pb-[env(safe-area-inset-bottom)] z-[100] transition-transform duration-300">
          <button
            className={`flex flex-col items-center justify-center w-[22%] min-w-[64px] h-[56px] cursor-pointer select-none transition-colors duration-200 ${activeTab === 'chat' ? 'text-primary-600' : 'text-surface-400 hover:text-surface-600'}`}
            onClick={() => handleTabClick('chat', '/app/chat')}
          >
            <MessageSquare className={`w-6 h-6 mb-1 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${activeTab === 'chat' ? 'scale-110' : ''}`} />
            <span className="text-[10px] font-medium tracking-[0.01em]">{t('nav.chatbot')}</span>
          </button>
          <button
            className={`flex flex-col items-center justify-center w-[22%] min-w-[64px] h-[56px] cursor-pointer select-none transition-colors duration-200 ${activeTab === 'map' ? 'text-primary-600' : 'text-surface-400 hover:text-surface-600'}`}
            onClick={() => handleTabClick('map', '/app/map')}
          >
            <MapIcon className={`w-6 h-6 mb-1 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${activeTab === 'map' ? 'scale-110' : ''}`} />
            <span className="text-[10px] font-medium tracking-[0.01em]">{t('nav.indoorMap')}</span>
          </button>
          <button
            className={`flex flex-col items-center justify-center w-[22%] min-w-[64px] h-[56px] cursor-pointer select-none transition-colors duration-200 ${activeTab === 'doctors' ? 'text-primary-600' : 'text-surface-400 hover:text-surface-600'}`}
            onClick={() => handleTabClick('doctors', '/app/doctors')}
          >
            <Stethoscope className={`w-6 h-6 mb-1 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${activeTab === 'doctors' ? 'scale-110' : ''}`} />
            <span className="text-[10px] font-medium tracking-[0.01em]">{t('nav.doctors')}</span>
          </button>
          <button
            className={`flex flex-col items-center justify-center w-[22%] min-w-[64px] h-[56px] cursor-pointer select-none transition-colors duration-200 ${activeTab === 'settings' ? 'text-primary-600' : 'text-surface-400 hover:text-surface-600'}`}
            onClick={() => handleTabClick('settings', '/app/settings')}
          >
            <Settings className={`w-6 h-6 mb-1 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${activeTab === 'settings' ? 'scale-110' : ''}`} />
            <span className="text-[10px] font-medium tracking-[0.01em]">{t('nav.settings')}</span>
          </button>
        </nav>
      )}
    </div>
  );
};
