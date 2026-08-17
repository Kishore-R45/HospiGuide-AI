import React, { useState } from 'react';
import { useLanguageStore, useNavigationStore } from '../../shared/store';
import { Toggle } from '../../shared/components';
import { Globe, Accessibility, Volume2, Info, Mail, Phone, MessageSquare, Shield, FileText, Trash2 } from 'lucide-react';

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
    <div className="flex-1 flex flex-col min-h-0 bg-[var(--surface-50)] overflow-y-auto" style={{ paddingBottom: 'calc(var(--bottom-nav-height) + var(--safe-area-bottom) + 32px)' }}>
      <div className="sticky top-0 z-10 bg-[var(--surface-0)] border-b border-[var(--surface-200)] shadow-sm px-4 pt-4 pb-3 mb-6">
        <h2 className="text-xl font-bold text-[var(--surface-900)]">{t('settings.title')}</h2>
      </div>

      <div className="px-4 space-y-8 animate-fade-in-up">
        
        {/* Language Section */}
        <section className="settings-section">
          <h3 className="settings-section-title">{t('settings.language')}</h3>
          <div className="settings-card">
            <div 
              className="settings-item"
              style={{ background: language === 'en' ? 'var(--primary-50)' : undefined }}
              onClick={() => setLanguage('en')}
            >
              <div className="flex items-center gap-3">
                <Globe width={20} height={20} color={language === 'en' ? 'var(--primary-500)' : 'var(--surface-400)'} />
                <span className="font-medium" style={{ color: language === 'en' ? 'var(--primary-700)' : 'var(--surface-700)' }}>English</span>
              </div>
              {language === 'en' && <div className="w-2 h-2 rounded-full bg-[var(--primary-500)]" />}
            </div>
            <div 
              className="settings-item border-t border-[var(--surface-100)]"
              style={{ background: language === 'ta' ? 'var(--primary-50)' : undefined }}
              onClick={() => setLanguage('ta')}
            >
              <div className="flex items-center gap-3">
                <Globe width={20} height={20} color={language === 'ta' ? 'var(--primary-500)' : 'var(--surface-400)'} />
                <span className="font-medium font-tamil" style={{ color: language === 'ta' ? 'var(--primary-700)' : 'var(--surface-700)' }}>தமிழ்</span>
              </div>
              {language === 'ta' && <div className="w-2 h-2 rounded-full bg-[var(--primary-500)]" />}
            </div>
          </div>
        </section>

        {/* Preferences Section */}
        <section className="settings-section">
          <h3 className="settings-section-title">{t('settings.accessibility')}</h3>
          <div className="settings-card">
            <div className="settings-item">
              <div className="settings-item-icon settings-item-icon-warning">
                <Accessibility width={20} height={20} />
              </div>
              <div className="settings-item-text">
                <div className="settings-item-title">{t('settings.avoidStairs')}</div>
                <div className="settings-item-desc">{t('settings.avoidStairsDesc')}</div>
              </div>
              <Toggle checked={avoidStairs} onChange={setAvoidStairs} />
            </div>
            
            <div className="settings-item border-t border-[var(--surface-100)]">
              <div className="settings-item-icon settings-item-icon-info">
                <Volume2 width={20} height={20} />
              </div>
              <div className="settings-item-text">
                <div className="settings-item-title">{t('settings.voiceGuidance')}</div>
                <div className="settings-item-desc">{t('settings.voiceGuidanceDesc')}</div>
              </div>
              <Toggle checked={voiceEnabled} onChange={toggleVoice} />
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="settings-section">
          <h3 className="settings-section-title">{t('settings.contactUs')}</h3>
          <div className="settings-card">
            <div className="settings-item">
              <div className="settings-item-icon settings-item-icon-primary">
                <Mail width={20} height={20} />
              </div>
              <div className="settings-item-text">
                <div className="settings-item-title">{t('settings.email')}</div>
                <div className="settings-item-desc">{email || 'Not configured'}</div>
              </div>
            </div>
            <div className="settings-item border-t border-[var(--surface-100)]">
              <div className="settings-item-icon settings-item-icon-primary">
                <Phone width={20} height={20} />
              </div>
              <div className="settings-item-text">
                <div className="settings-item-title">{t('settings.phone')}</div>
                <div className="settings-item-desc">{phone || 'Not configured'}</div>
              </div>
            </div>
            <div className="settings-item border-t border-[var(--surface-100)]">
              <div className="settings-item-icon settings-item-icon-primary">
                <MessageSquare width={20} height={20} />
              </div>
              <div className="settings-item-text">
                <div className="settings-item-title">{t('settings.feedback')}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Legal & About Section */}
        <section className="settings-section">
          <h3 className="settings-section-title">{t('settings.about')}</h3>
          <div className="settings-card">
            <div className="settings-item flex-col items-start gap-4 p-5 bg-[var(--surface-0)] cursor-default hover:bg-[var(--surface-0)]">
              <div className="flex items-start gap-4">
                <div className="settings-item-icon settings-item-icon-primary" style={{ width: 48, height: 48 }}>
                  <Info width={24} height={24} />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--surface-900)]">{t('settings.aboutTitle')}</h3>
                  <p className="text-sm text-[var(--surface-500)] mt-2 leading-relaxed">
                    {t('settings.aboutDesc')}
                  </p>
                  <div className="mt-4 pt-4 border-t border-[var(--surface-100)] text-xs text-[var(--surface-400)]">
                    {t('settings.version')}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="settings-item border-t border-[var(--surface-100)]">
              <Shield width={20} height={20} color="var(--surface-400)" />
              <div className="settings-item-text">
                <div className="settings-item-title">{t('settings.privacyPolicy')}</div>
              </div>
            </div>
            
            <div className="settings-item border-t border-[var(--surface-100)]">
              <FileText width={20} height={20} color="var(--surface-400)" />
              <div className="settings-item-text">
                <div className="settings-item-title">{t('settings.termsOfService')}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <div className="flex justify-center mt-8 pb-8">
          <button 
            className="flex items-center gap-2 text-[var(--color-error)] font-medium text-sm py-2 px-4 rounded-[var(--radius-md)] hover:bg-[var(--color-error-bg)] transition-colors"
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
