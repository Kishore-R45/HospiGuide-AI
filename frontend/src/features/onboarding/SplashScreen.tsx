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
      navigate('/assistant', { replace: true });
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
    <div className="min-h-dvh flex flex-col items-center justify-center bg-surface-950 relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary-600/8 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-15%] w-[400px] h-[400px] rounded-full bg-primary-500/6 blur-[80px] pointer-events-none" />
      <div className="absolute top-[30%] right-[10%] w-[200px] h-[200px] rounded-full bg-accent-500/4 blur-[60px] pointer-events-none" />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'radial-gradient(circle, rgba(148,163,184,0.5) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }} />

      <div className="relative z-10 flex flex-col items-center text-center px-8">
        {/* Logo */}
        <div className="relative mb-8 animate-scale-in">
          <div className="w-24 h-24 rounded-[var(--radius-xl)] bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-glow">
            <Navigation className="w-12 h-12 text-white" strokeWidth={1.5} />
          </div>
          {/* Pulse rings */}
          <div className="absolute inset-0 rounded-[var(--radius-xl)] border-2 border-primary-400/30 animate-ping" style={{ animationDuration: '2s' }} />
          <div className="absolute -inset-2 rounded-[28px] border border-primary-400/10 animate-ping" style={{ animationDuration: '3s', animationDelay: '0.5s' }} />
        </div>

        {/* Title */}
        <h1 className="text-4xl font-extrabold text-white mb-2 animate-fade-in-up delay-200">
          {t('app.name')}
        </h1>
        <p className="text-primary-400 text-lg font-medium mb-2 animate-fade-in-up delay-300">
          {t('splash.subtitle')}
        </p>
        <p className="text-surface-400 text-sm animate-fade-in-up delay-400">
          {t('app.tagline')}
        </p>

        {/* Capability check icons */}
        <div className="flex items-center gap-6 mt-10 mb-8 animate-fade-in-up delay-500">
          {[
            { icon: <Shield className="w-5 h-5" />, label: 'BLE' },
            { icon: <Cpu className="w-5 h-5" />, label: 'Sensors' },
            { icon: <Navigation className="w-5 h-5" />, label: 'Maps' },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                progress > (i + 1) * 25
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'bg-surface-800/50 text-surface-500'
              }`}>
                {item.icon}
              </div>
              <span className="text-xs text-surface-500">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="w-48 h-1.5 bg-surface-800 rounded-full overflow-hidden animate-fade-in delay-600">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-200 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-surface-500 text-xs mt-3 animate-fade-in delay-600">
          {t('splash.checking')}
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;
