import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguageStore } from '../../shared/store';
import { Languages } from 'lucide-react';

const LanguageScreen: React.FC = () => {
  const navigate = useNavigate();
  const { setLanguage } = useLanguageStore();

  const handleSelect = (lang: 'en' | 'ta') => {
    setLanguage(lang);
    navigate('/permissions');
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-surface-950 relative overflow-hidden px-6">
      {/* Background */}
      <div className="absolute top-[-15%] right-[-10%] w-[400px] h-[400px] rounded-full bg-primary-600/8 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-15%] w-[350px] h-[350px] rounded-full bg-primary-500/5 blur-[80px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
        {/* Icon */}
        <div className="w-16 h-16 rounded-[var(--radius-lg)] bg-primary-500/10 flex items-center justify-center mb-6 animate-scale-in">
          <Languages className="w-8 h-8 text-primary-400" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-white mb-2 text-center animate-fade-in-up delay-100">
          Choose Your Language
        </h1>
        <p className="text-surface-400 text-sm mb-10 text-center animate-fade-in-up delay-200">
          மொழியைத் தேர்ந்தெடுக்கவும் / Select your preferred language
        </p>

        {/* Language Buttons */}
        <div className="w-full space-y-4 animate-fade-in-up delay-300">
          {/* Tamil */}
          <button
            onClick={() => handleSelect('ta')}
            className="w-full group relative overflow-hidden rounded-[var(--radius-lg)] border-2 border-surface-700/60 hover:border-primary-500/50 bg-surface-800/50 hover:bg-primary-500/5 transition-all duration-400 ease-out p-6 text-left active:scale-[0.98] min-h-[80px]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/0 to-primary-500/0 group-hover:from-primary-500/5 group-hover:to-transparent transition-all duration-500" />
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🇮🇳</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-white font-tamil">தமிழ்</p>
                <p className="text-sm text-surface-400">Tamil</p>
              </div>
            </div>
          </button>

          {/* English */}
          <button
            onClick={() => handleSelect('en')}
            className="w-full group relative overflow-hidden rounded-[var(--radius-lg)] border-2 border-surface-700/60 hover:border-primary-500/50 bg-surface-800/50 hover:bg-primary-500/5 transition-all duration-400 ease-out p-6 text-left active:scale-[0.98] min-h-[80px]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/0 to-primary-500/0 group-hover:from-primary-500/5 group-hover:to-transparent transition-all duration-500" />
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🌐</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">English</p>
                <p className="text-sm text-surface-400">ஆங்கிலம்</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LanguageScreen;
