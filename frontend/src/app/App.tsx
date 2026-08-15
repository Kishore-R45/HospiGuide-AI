import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSessionStore } from '../shared/store';
import { ErrorBoundary } from '../shared/components';

// Layout
import { MainLayout } from '../features/layout/MainLayout';

// Screens
import SplashScreen from '../features/onboarding/SplashScreen';
import LanguageScreen from '../features/onboarding/LanguageScreen';
import PermissionsScreen from '../features/onboarding/PermissionsScreen';
import AssistantScreen from '../features/assistant/AssistantScreen';
import MapScreen from '../features/map/MapScreen';
import DoctorScreen from '../features/assistant/DoctorScreen';
import SettingsScreen from '../features/assistant/SettingsScreen';
import NotFoundScreen from '../features/notfound/NotFoundScreen';
import AdminScreen from '../features/admin/AdminScreen';

const queryClient = new QueryClient();

// Protected route guard for main app flow
const ProtectedRoute = () => {
  const { onboardingComplete } = useSessionStore();
  
  if (!onboardingComplete) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            {/* Onboarding Flow */}
            <Route path="/" element={<SplashScreen />} />
            <Route path="/language" element={<LanguageScreen />} />
            <Route path="/permissions" element={<PermissionsScreen />} />
            
            {/* Main App Flow (Requires Onboarding) */}
            <Route path="/app" element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route index element={<Navigate to="chat" replace />} />
                <Route path="chat" element={<AssistantScreen />} />
                <Route path="map" element={<MapScreen />} />
                <Route path="doctors" element={<DoctorScreen />} />
                <Route path="settings" element={<SettingsScreen />} />
              </Route>
            </Route>
            
            {/* Admin Flow */}
            <Route path="/admin" element={<AdminScreen />} />
            
            {/* Fallback 404 */}
            <Route path="*" element={<NotFoundScreen />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
