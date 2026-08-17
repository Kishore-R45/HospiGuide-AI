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
    <div className="page">
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
        <header className="app-header">
          <img src="/assets/Logo- HospiGuide AI.png" alt="Logo" className="header-logo" />
          <h1 className="header-title">HospiGuide AI</h1>
        </header>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <Outlet />
      </main>

      {/* Bottom Navigation - Hidden in fullscreen mode */}
      {!isFullscreen && (
        <nav className="bottom-nav">
          <button
            className={`bottom-nav-item ${activeTab === 'chat' ? 'bottom-nav-item-active' : ''}`}
            onClick={() => handleTabClick('chat', '/app/chat')}
          >
            <MessageSquare className="bottom-nav-icon" />
            <span className="bottom-nav-label">{t('nav.chatbot')}</span>
          </button>
          <button
            className={`bottom-nav-item ${activeTab === 'map' ? 'bottom-nav-item-active' : ''}`}
            onClick={() => handleTabClick('map', '/app/map')}
          >
            <MapIcon className="bottom-nav-icon" />
            <span className="bottom-nav-label">{t('nav.indoorMap')}</span>
          </button>
          <button
            className={`bottom-nav-item ${activeTab === 'doctors' ? 'bottom-nav-item-active' : ''}`}
            onClick={() => handleTabClick('doctors', '/app/doctors')}
          >
            <Stethoscope className="bottom-nav-icon" />
            <span className="bottom-nav-label">{t('nav.doctors')}</span>
          </button>
          <button
            className={`bottom-nav-item ${activeTab === 'settings' ? 'bottom-nav-item-active' : ''}`}
            onClick={() => handleTabClick('settings', '/app/settings')}
          >
            <Settings className="bottom-nav-icon" />
            <span className="bottom-nav-label">{t('nav.settings')}</span>
          </button>
        </nav>
      )}
    </div>
  );
};
