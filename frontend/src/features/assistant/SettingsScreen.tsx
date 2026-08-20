import React, { useState } from 'react';
import { useLanguageStore, useNavigationStore } from '../../shared/store';
import { Toggle } from '../../shared/components';
import { Globe, Accessibility, Volume2, Mail, Phone, MessageSquare, Shield, FileText, Trash2 } from 'lucide-react';

const SettingsScreen: React.FC = () => {
  const { t, language, setLanguage } = useLanguageStore();
  const { avoidStairs, setAvoidStairs, voiceEnabled, toggleVoice } = useNavigationStore();
  const [email] = useState('');
  const [phone] = useState('');

  const handleResetApp = () => {
    if (window.confirm('Are you sure you want to reset all app data?')) {
      localStorage.clear();
      window.location.href = '/';
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-surface-50 overflow-y-auto pb-[calc(64px+env(safe-area-inset-bottom)+32px)]">
      <div className="sticky top-0 z-10 bg-surface-0 border-b border-surface-200 shadow-sm px-4 pt-4 pb-3 mb-6">
        <h2 className="text-xl font-bold text-surface-900">{t('settings.title')}</h2>
      </div>

      <div className="px-4 space-y-8 animate-fade-in-up">
        
        {/* Language Section */}
        <section className="mb-6">
          <h3 className="text-sm font-bold text-surface-500 uppercase tracking-wider mb-3 px-1">{t('settings.language')}</h3>
          <div className="bg-surface-0 border border-surface-200 rounded-xl overflow-hidden shadow-sm">
            <div 
              className={`flex items-center justify-between p-4 cursor-pointer transition-colors duration-200 hover:bg-surface-50 ${language === 'en' ? 'bg-primary-50' : 'bg-surface-0'}`}
              onClick={() => setLanguage('en')}
            >
              <div className="flex items-center gap-3">
                <Globe width={20} height={20} className={language === 'en' ? 'text-primary-500' : 'text-surface-400'} />
                <span className={`font-medium ${language === 'en' ? 'text-primary-700' : 'text-surface-700'}`}>English</span>
              </div>
              {language === 'en' && <div className="w-2 h-2 rounded-full bg-primary-500" />}
            </div>
            <div 
              className={`flex items-center justify-between p-4 border-t border-surface-100 cursor-pointer transition-colors duration-200 hover:bg-surface-50 ${language === 'ta' ? 'bg-primary-50' : 'bg-surface-0'}`}
              onClick={() => setLanguage('ta')}
            >
              <div className="flex items-center gap-3">
                <Globe width={20} height={20} className={language === 'ta' ? 'text-primary-500' : 'text-surface-400'} />
                <span className={`font-medium font-tamil ${language === 'ta' ? 'text-primary-700' : 'text-surface-700'}`}>தமிழ்</span>
              </div>
              {language === 'ta' && <div className="w-2 h-2 rounded-full bg-primary-500" />}
            </div>
          </div>
        </section>

        {/* Preferences Section */}
        <section className="mb-6">
          <h3 className="text-sm font-bold text-surface-500 uppercase tracking-wider mb-3 px-1">{t('settings.accessibility')}</h3>
          <div className="bg-surface-0 border border-surface-200 rounded-xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between p-4 bg-surface-0 cursor-pointer transition-colors duration-200 hover:bg-surface-50">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg shrink-0 mr-4 bg-warning-bg text-warning">
                <Accessibility width={20} height={20} />
              </div>
              <div className="flex-1 pr-4">
                <div className="text-[15px] font-semibold text-surface-800">{t('settings.avoidStairs')}</div>
                <div className="text-[13px] text-surface-500 mt-1">{t('settings.avoidStairsDesc')}</div>
              </div>
              <Toggle checked={avoidStairs} onChange={setAvoidStairs} />
            </div>
            
            <div className="flex items-center justify-between p-4 border-t border-surface-100 bg-surface-0 cursor-pointer transition-colors duration-200 hover:bg-surface-50">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg shrink-0 mr-4 bg-info-bg text-info">
                <Volume2 width={20} height={20} />
              </div>
              <div className="flex-1 pr-4">
                <div className="text-[15px] font-semibold text-surface-800">{t('settings.voiceGuidance')}</div>
                <div className="text-[13px] text-surface-500 mt-1">{t('settings.voiceGuidanceDesc')}</div>
              </div>
              <Toggle checked={voiceEnabled} onChange={toggleVoice} />
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="mb-6">
          <h3 className="text-sm font-bold text-surface-500 uppercase tracking-wider mb-3 px-1">{t('settings.contactUs')}</h3>
          <div className="bg-surface-0 border border-surface-200 rounded-xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between p-4 bg-surface-0 cursor-pointer transition-colors duration-200 hover:bg-surface-50">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg shrink-0 mr-4 bg-primary-50 text-primary-600">
                <Mail width={20} height={20} />
              </div>
              <div className="flex-1 pr-4">
                <div className="text-[15px] font-semibold text-surface-800">{t('settings.email')}</div>
                <div className="text-[13px] text-surface-500 mt-1">{email || 'Not configured'}</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border-t border-surface-100 bg-surface-0 cursor-pointer transition-colors duration-200 hover:bg-surface-50">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg shrink-0 mr-4 bg-primary-50 text-primary-600">
                <Phone width={20} height={20} />
              </div>
              <div className="flex-1 pr-4">
                <div className="text-[15px] font-semibold text-surface-800">{t('settings.phone')}</div>
                <div className="text-[13px] text-surface-500 mt-1">{phone || 'Not configured'}</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border-t border-surface-100 bg-surface-0 cursor-pointer transition-colors duration-200 hover:bg-surface-50">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg shrink-0 mr-4 bg-primary-50 text-primary-600">
                <MessageSquare width={20} height={20} />
              </div>
              <div className="flex-1 pr-4">
                <div className="text-[15px] font-semibold text-surface-800">{t('settings.feedback')}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Legal & About Section */}
        <section className="mb-6">
          <h3 className="text-sm font-bold text-surface-500 uppercase tracking-wider mb-3 px-1">{t('settings.about')}</h3>
          <div className="bg-surface-0 border border-surface-200 rounded-xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between p-4 bg-surface-0 cursor-pointer transition-colors duration-200 hover:bg-surface-50">
              <Shield width={20} height={20} className="text-surface-400 mr-4" />
              <div className="flex-1 pr-4">
                <div className="text-[15px] font-semibold text-surface-800">{t('settings.privacyPolicy')}</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border-t border-surface-100 bg-surface-0 cursor-pointer transition-colors duration-200 hover:bg-surface-50">
              <FileText width={20} height={20} className="text-surface-400 mr-4" />
              <div className="flex-1 pr-4">
                <div className="text-[15px] font-semibold text-surface-800">{t('settings.termsOfService')}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <div className="flex justify-center mt-8 pb-8">
          <button 
            className="flex items-center gap-2 text-error font-medium text-sm py-2 px-4 rounded-md hover:bg-error-bg transition-colors"
            onClick={handleResetApp}
          >
            <Trash2 width={16} height={16} />
            {t('settings.resetApp')}
          </button>
        </div>

      </div>
    </div>
  );
};

export default SettingsScreen;
