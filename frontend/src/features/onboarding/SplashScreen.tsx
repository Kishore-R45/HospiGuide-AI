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
    <div className="splash">
      <div className="splash-bg-orb splash-bg-orb-1" />
      <div className="splash-bg-orb splash-bg-orb-2" />

      <div className="splash-logo-wrapper">
        <img 
          src="/assets/Logo- HospiGuide AI.png" 
          alt="HospiGuide AI Logo" 
          className="splash-logo" 
        />
        <div className="splash-logo-ring" />
        <div className="splash-logo-ring-2" />
      </div>

      <h1 className="splash-title text-center mb-2">
        {t('app.name')}
      </h1>
    </div>
  );
};

export default SplashScreen;
