import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguageStore, useSessionStore } from '../../shared/store';
import { Button } from '../../shared/components';
import { Bluetooth, Activity, Mic, CheckCircle, ChevronRight, Shield } from 'lucide-react';

interface PermissionItem {
  key: 'bluetooth' | 'motion' | 'microphone';
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const permissions: PermissionItem[] = [
  {
    key: 'bluetooth',
    icon: <Bluetooth className="w-6 h-6" />,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10 border-blue-500/20',
  },
  {
    key: 'motion',
    icon: <Activity className="w-6 h-6" />,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10 border-purple-500/20',
  },
  {
    key: 'microphone',
    icon: <Mic className="w-6 h-6" />,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10 border-amber-500/20',
  },
];

const PermissionsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguageStore();
  const { setPermission, setOnboardingComplete, permissionsGranted } = useSessionStore();
  const [requesting, setRequesting] = useState<string | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  const requestPermission = async (key: 'bluetooth' | 'motion' | 'microphone') => {
    setRequesting(key);

    try {
      switch (key) {
        case 'bluetooth':
          if ('bluetooth' in navigator) {
            // Just check availability, don't actually request scan yet
            const available = await (navigator as any).bluetooth?.getAvailability?.();
            setPermission('bluetooth', available !== false);
          } else {
            setPermission('bluetooth', false);
          }
          break;

        case 'motion':
          if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
            // iOS requires explicit permission request
            const result = await (DeviceMotionEvent as any).requestPermission();
            setPermission('motion', result === 'granted');
          } else {
            // Android/Desktop — permission not needed, API available
            setPermission('motion', 'DeviceMotionEvent' in window);
          }
          break;

        case 'microphone':
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            setPermission('microphone', true);
          } catch {
            setPermission('microphone', false);
          }
          break;
      }
    } catch {
      setPermission(key, false);
    }

    // Mark as completed after a brief animation delay
    setTimeout(() => {
      setCompleted(prev => new Set([...prev, key]));
      setRequesting(null);
    }, 800);
  };

  const handleContinue = () => {
    setOnboardingComplete(true);
    navigate('/assistant', { replace: true });
  };

  const handleSkip = () => {
    setOnboardingComplete(true);
    navigate('/assistant', { replace: true });
  };

  return (
    <div className="min-h-dvh flex flex-col bg-surface-950 relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-[-10%] left-[50%] -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary-600/6 blur-[120px] pointer-events-none" />

      <div className="flex-1 flex flex-col px-6 py-12 max-w-sm mx-auto w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="w-14 h-14 rounded-[var(--radius-lg)] bg-primary-500/10 flex items-center justify-center mx-auto mb-5">
            <Shield className="w-7 h-7 text-primary-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{t('permissions.title')}</h1>
          <p className="text-surface-400 text-sm">{t('permissions.subtitle')}</p>
        </div>

        {/* Permission Cards */}
        <div className="space-y-4 mb-8">
          {permissions.map((perm, index) => {
            const isCompleted = completed.has(perm.key);
            const isRequesting = requesting === perm.key;
            const isGranted = permissionsGranted[perm.key];

            return (
              <button
                key={perm.key}
                onClick={() => !isCompleted && requestPermission(perm.key)}
                disabled={isCompleted || isRequesting}
                className={`w-full flex items-center gap-4 p-4 rounded-[var(--radius-lg)] border transition-all duration-500 animate-fade-in-up text-left min-h-[72px] ${
                  isCompleted
                    ? 'bg-surface-800/40 border-surface-700/30'
                    : 'bg-surface-800/60 border-surface-700/50 hover:border-primary-500/30 hover:bg-surface-800/80 active:scale-[0.98] cursor-pointer'
                }`}
                style={{ animationDelay: `${(index + 2) * 100}ms` }}
              >
                {/* Icon */}
                <div className={`w-12 h-12 rounded-[var(--radius-md)] flex items-center justify-center flex-shrink-0 border ${
                  isCompleted ? 'bg-surface-700/30 border-surface-600/30' : perm.bgColor
                } transition-all duration-500`}>
                  {isCompleted ? (
                    <CheckCircle className={`w-6 h-6 ${isGranted ? 'text-green-400' : 'text-surface-500'}`} />
                  ) : isRequesting ? (
                    <div className="w-5 h-5 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span className={perm.color}>{perm.icon}</span>
                  )}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold ${isCompleted ? 'text-surface-400' : 'text-surface-100'} transition-colors duration-300`}>
                    {t(`permissions.${perm.key}`)}
                  </p>
                  <p className={`text-sm mt-0.5 ${isCompleted ? 'text-surface-500' : 'text-surface-400'} transition-colors duration-300`}>
                    {t(`permissions.${perm.key}Desc`)}
                  </p>
                </div>

                {/* Arrow / Status */}
                {!isCompleted && !isRequesting && (
                  <ChevronRight className="w-5 h-5 text-surface-500 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Actions */}
        <div className="space-y-3 animate-fade-in-up delay-600">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleContinue}
            icon={<ChevronRight className="w-5 h-5" />}
          >
            {t('permissions.continue')}
          </Button>
          <button
            className="w-full text-center text-sm text-surface-500 hover:text-surface-300 transition-colors py-2"
            onClick={handleSkip}
          >
            {t('permissions.skip')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermissionsScreen;
