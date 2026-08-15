import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguageStore } from '../../shared/store';
import { Globe } from 'lucide-react';

const LanguageScreen: React.FC = () => {
  const navigate = useNavigate();
  const { setLanguage } = useLanguageStore();

  const handleSelectLanguage = (lang: 'en' | 'ta') => {
    setLanguage(lang);
    navigate('/permissions');
  };

  return (
    <div className="page-center">
      <div className="flex flex-col items-center text-center w-full animate-fade-in-up">
        <div 
          className="mb-6 flex items-center justify-center rounded-[var(--radius-full)]" 
          style={{ width: 64, height: 64, background: 'var(--primary-50)', color: 'var(--primary-600)' }}
        >
          <Globe width={32} height={32} />
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Select Your Language</h1>
        <p className="text-base text-[var(--surface-500)] mb-12">
          தொடர உங்கள் விருப்பமான மொழியைத் தேர்ந்தெடுக்கவும்
        </p>

        <div className="w-full max-w-[400px]">
          <button 
            className="lang-card"
            onClick={() => handleSelectLanguage('en')}
          >
            <div className="lang-icon">
              <span className="font-bold text-xl">A</span>
            </div>
            <div className="text-left flex-1">
              <div className="lang-name">English</div>
              <div className="lang-native">English</div>
            </div>
          </button>

          <button 
            className="lang-card"
            onClick={() => handleSelectLanguage('ta')}
          >
            <div className="lang-icon font-tamil">
              <span className="font-bold text-xl">அ</span>
            </div>
            <div className="text-left flex-1">
              <div className="lang-name font-tamil">தமிழ்</div>
              <div className="lang-native">Tamil</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LanguageScreen;
