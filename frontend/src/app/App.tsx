import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSessionStore } from '../shared/store';

// Screens
import SplashScreen from '../features/onboarding/SplashScreen';
import LanguageScreen from '../features/onboarding/LanguageScreen';
import PermissionsScreen from '../features/onboarding/PermissionsScreen';
import AssistantScreen from '../features/assistant/AssistantScreen';
import MapScreen from '../features/map/MapScreen';
import ArrivalScreen from '../features/navigation/ArrivalScreen';
import SettingsScreen from '../features/assistant/SettingsScreen';
import DoctorScreen from '../features/assistant/DoctorScreen';
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
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Onboarding Flow */}
          <Route path="/" element={<SplashScreen />} />
          <Route path="/language" element={<LanguageScreen />} />
          <Route path="/permissions" element={<PermissionsScreen />} />
          
          {/* Main App Flow (Requires Onboarding) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/assistant" element={<AssistantScreen />} />
            <Route path="/map" element={<MapScreen />} />
            <Route path="/arrival" element={<ArrivalScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />
            <Route path="/doctors/:id" element={<DoctorScreen />} />
          </Route>
          
          {/* Admin Flow */}
          <Route path="/admin" element={<AdminScreen />} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
