import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguageStore, usePermissionStore, useSessionStore } from '../../shared/store';
import { Bluetooth, MapPin, Mic } from 'lucide-react';
import { Button } from '../../shared/components';

const PermissionsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguageStore();
  const { requestAllPermissions } = usePermissionStore();
  const { setOnboardingComplete } = useSessionStore();
  const [isRequesting, setIsRequesting] = useState(false);

  const handleAllowAll = async () => {
    setIsRequesting(true);
    await requestAllPermissions();
    setOnboardingComplete(true);
    setIsRequesting(false);
    navigate('/app/chat');
  };

  const handleSkip = () => {
    setOnboardingComplete(true);
    navigate('/app/chat');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] p-6 bg-surface-50">
      <div className="flex flex-col items-center w-full max-w-[480px] animate-fade-in-up">
        <div 
          className="mb-6 flex items-center justify-center rounded-full w-16 h-16 bg-primary-50 text-primary-600" 
        >
          <ShieldCheckIcon />
        </div>
        
        <h1 className="text-2xl font-bold mb-2 text-center text-surface-900">
          {t('permissions.title')}
        </h1>
        <p className="text-base text-center mb-8 text-surface-500">
          {t('permissions.subtitle')}
        </p>

        <div className="w-full bg-surface-0 border border-surface-200 rounded-lg shadow-card mb-8 overflow-hidden">
          <div className="flex items-start p-4 border-b border-surface-100">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-primary-50 text-primary-600 mr-4 shrink-0">
              <Bluetooth width={24} height={24} />
            </div>
            <div>
              <div className="text-[15px] font-bold text-surface-800 mb-1">{t('permissions.bluetooth')}</div>
              <div className="text-[13px] text-surface-500 leading-relaxed">{t('permissions.bluetoothDesc')}</div>
            </div>
          </div>
          <div className="flex items-start p-4 border-b border-surface-100">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-primary-50 text-primary-600 mr-4 shrink-0">
              <MapPin width={24} height={24} />
            </div>
            <div>
              <div className="text-[15px] font-bold text-surface-800 mb-1">{t('permissions.location')}</div>
              <div className="text-[13px] text-surface-500 leading-relaxed">{t('permissions.locationDesc')}</div>
            </div>
          </div>
          <div className="flex items-start p-4">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-primary-50 text-primary-600 mr-4 shrink-0">
              <Mic width={24} height={24} />
            </div>
            <div>
              <div className="text-[15px] font-bold text-surface-800 mb-1">{t('permissions.microphone')}</div>
              <div className="text-[13px] text-surface-500 leading-relaxed">{t('permissions.microphoneDesc')}</div>
            </div>
          </div>
        </div>

        <div className="w-full flex flex-col gap-3">
          <Button 
            variant="primary" 
            size="lg" 
            fullWidth 
            onClick={handleAllowAll}
            loading={isRequesting}
          >
            {t('permissions.allowAll')}
          </Button>
          <Button 
            variant="ghost" 
            size="lg" 
            fullWidth 
            onClick={handleSkip}
            disabled={isRequesting}
          >
            {t('permissions.skipNow')}
          </Button>
        </div>
      </div>
    </div>
  );
};

const ShieldCheckIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

export default PermissionsScreen;
