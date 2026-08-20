import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguageStore, useSessionStore } from '../../shared/store';

const SplashScreen: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useLanguageStore();
  const { setEntranceId, onboardingComplete } = useSessionStore();

  useEffect(() => {
    // Capture entrance param from QR code
    const entrance = searchParams.get('entrance');
    if (entrance) {
      setEntranceId(entrance);
    }

    // Skip splash if onboarding already done
    if (onboardingComplete) {
      navigate('/app/chat', { replace: true });
      return;
    }

    const timer = setTimeout(() => {
      navigate('/language');
    }, 1500);

    return () => clearTimeout(timer);
  }, [navigate, searchParams, setEntranceId, onboardingComplete]);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[100dvh] bg-surface-0 overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-primary-200/50 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-primary-100/50 rounded-full blur-3xl" />

      <div className="relative flex items-center justify-center w-48 h-48 mb-8 animate-bounce">
        <img 
          src="/assets/Logo- HospiGuide AI.png" 
          alt="HospiGuide AI Logo" 
          className="w-40 h-40 object-cover rounded-full shadow-lg z-10 bg-white" 
        />
        <div className="absolute inset-0 rounded-full border-4 border-primary-100 animate-ping opacity-50" />
      </div>

      <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400 text-center mb-2">
        {t('app.name')}
      </h1>
    </div>
  );
};

export default SplashScreen;
