import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguageStore, useSessionStore } from '../../shared/store';
import { Navigation, Cpu, Shield } from 'lucide-react';

const SplashScreen: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useLanguageStore();
  const { setEntranceId, onboardingComplete } = useSessionStore();
  const [progress, setProgress] = useState(0);

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

    // Simulated capability check
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => navigate('/language'), 500);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(timer);
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
      
      <p className="text-primary-600 font-medium mb-12 animate-fade-in-up delay-200">
        {t('app.tagline')}
      </p>

      {/* Capability check icons */}
      <div className="flex items-center gap-6 mb-8 animate-fade-in-up delay-300">
        {[
          { icon: <Shield width={20} height={20} />, label: 'BLE' },
          { icon: <Cpu width={20} height={20} />, label: 'Sensors' },
          { icon: <Navigation width={20} height={20} />, label: 'Maps' },
        ].map((item, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div 
              className={`w-[40px] h-[40px] rounded-[50%] flex items-center justify-center transition-all duration-500 ${
                progress > (i + 1) * 25
                  ? 'bg-[var(--primary-100)] text-[var(--primary-600)]'
                  : 'bg-[var(--surface-100)] text-[var(--surface-400)]'
              }`}
            >
              {item.icon}
            </div>
            <span className="text-xs font-medium text-[var(--surface-500)]">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-[200px] h-[6px] bg-[var(--surface-200)] rounded-[var(--radius-full)] overflow-hidden animate-fade-in delay-400">
        <div
          className="h-full bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-400)] rounded-[var(--radius-full)] transition-all duration-200 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs font-medium text-[var(--surface-500)] mt-3 animate-fade-in delay-400">
        {t('splash.checking')}
      </p>
    </div>
  );
};

export default SplashScreen;
