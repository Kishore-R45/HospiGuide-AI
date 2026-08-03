import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguageStore, useNavigationStore } from '../../shared/store';
import { Toggle, SectionHeader } from '../../shared/components';
import { ArrowLeft, Globe, Accessibility, Volume2, Info } from 'lucide-react';

const SettingsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguageStore();
  const { avoidStairs, setAvoidStairs, voiceEnabled, toggleVoice } = useNavigationStore();

  return (
    <div className="min-h-dvh flex flex-col bg-surface-950">
      {/* Header */}
      <header className="glass sticky top-0 z-30 px-4 py-4 flex items-center gap-3">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-surface-800/60 flex items-center justify-center text-surface-200 hover:bg-surface-700/60 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-white">{t('settings.title')}</h1>
      </header>

      <div className="flex-1 p-6 space-y-8 animate-fade-in-up">
        
        {/* Language Section */}
        <section>
          <SectionHeader title={t('settings.language')} />
          <div className="glass-card rounded-[var(--radius-lg)] overflow-hidden">
            <div 
              className={`p-4 flex items-center justify-between border-b border-surface-700/50 cursor-pointer hover:bg-surface-800/50 transition-colors ${language === 'en' ? 'bg-primary-500/10' : ''}`}
              onClick={() => setLanguage('en')}
            >
              <div className="flex items-center gap-3">
                <Globe className={`w-5 h-5 ${language === 'en' ? 'text-primary-400' : 'text-surface-400'}`} />
                <span className={`font-medium ${language === 'en' ? 'text-white' : 'text-surface-300'}`}>English</span>
              </div>
              {language === 'en' && <div className="w-2 h-2 rounded-full bg-primary-400" />}
            </div>
            <div 
              className={`p-4 flex items-center justify-between cursor-pointer hover:bg-surface-800/50 transition-colors ${language === 'ta' ? 'bg-primary-500/10' : ''}`}
              onClick={() => setLanguage('ta')}
            >
              <div className="flex items-center gap-3">
                <Globe className={`w-5 h-5 ${language === 'ta' ? 'text-primary-400' : 'text-surface-400'}`} />
                <span className={`font-medium font-tamil ${language === 'ta' ? 'text-white' : 'text-surface-300'}`}>தமிழ்</span>
              </div>
              {language === 'ta' && <div className="w-2 h-2 rounded-full bg-primary-400" />}
            </div>
          </div>
        </section>

        {/* Preferences Section */}
        <section>
          <SectionHeader title="Preferences" />
          <div className="glass-card rounded-[var(--radius-lg)] overflow-hidden">
            <div className="p-4 flex items-center justify-between border-b border-surface-700/50">
              <div className="flex gap-3">
                <Accessibility className="w-5 h-5 text-surface-400 mt-0.5" />
                <div>
                  <p className="font-medium text-white">{t('settings.avoidStairs')}</p>
                  <p className="text-sm text-surface-400 mt-0.5">{t('settings.avoidStairsDesc')}</p>
                </div>
              </div>
              <Toggle checked={avoidStairs} onChange={setAvoidStairs} />
            </div>
            
            <div className="p-4 flex items-center justify-between">
              <div className="flex gap-3">
                <Volume2 className="w-5 h-5 text-surface-400 mt-0.5" />
                <div>
                  <p className="font-medium text-white">{t('settings.voiceGuidance')}</p>
                  <p className="text-sm text-surface-400 mt-0.5">{t('settings.voiceGuidanceDesc')}</p>
                </div>
              </div>
              <Toggle checked={voiceEnabled} onChange={toggleVoice} />
            </div>
          </div>
        </section>

        {/* About Section */}
        <section>
          <SectionHeader title={t('settings.about')} />
          <div className="glass-card rounded-[var(--radius-lg)] p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-[var(--radius-md)] bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                <Info className="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <h3 className="font-bold text-white">{t('settings.aboutTitle')}</h3>
                <p className="text-sm text-surface-400 mt-2 leading-relaxed">
                  {t('settings.aboutDesc')}
                </p>
                <div className="mt-4 pt-4 border-t border-surface-700/50 text-xs text-surface-500">
                  {t('settings.version')}
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default SettingsScreen;
