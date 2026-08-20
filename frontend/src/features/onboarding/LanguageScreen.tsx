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
    <div className="flex flex-col items-center justify-center min-h-[100dvh] p-4 bg-surface-50">
      <div className="flex flex-col items-center text-center w-full animate-fade-in-up">
        <div 
          className="mb-6 flex items-center justify-center rounded-full w-16 h-16 bg-primary-50 text-primary-600" 
        >
          <Globe width={32} height={32} />
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Select Your Language</h1>
        <p className="text-base text-surface-500 mb-12">
          தொடர உங்கள் விருப்பமான மொழியைத் தேர்ந்தெடுக்கவும்
        </p>

        <div className="w-full max-w-[400px]">
          <button 
            className="flex items-center w-full p-4 mb-4 bg-surface-0 border-[1.5px] border-surface-200 rounded-xl transition-all duration-200 cursor-pointer hover:border-primary-400 hover:shadow-md hover:-translate-y-[2px] active:translate-y-0"
            onClick={() => handleSelectLanguage('en')}
          >
            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-surface-100 text-primary-600 mr-4 shrink-0">
              <span className="font-bold text-xl">A</span>
            </div>
            <div className="text-left flex-1">
              <div className="text-[17px] font-bold text-surface-900">English</div>
              <div className="text-[13px] text-surface-500">English</div>
            </div>
          </button>

          <button 
            className="flex items-center w-full p-4 mb-4 bg-surface-0 border-[1.5px] border-surface-200 rounded-xl transition-all duration-200 cursor-pointer hover:border-primary-400 hover:shadow-md hover:-translate-y-[2px] active:translate-y-0"
            onClick={() => handleSelectLanguage('ta')}
          >
            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-surface-100 text-primary-600 mr-4 shrink-0 font-tamil">
              <span className="font-bold text-xl">அ</span>
            </div>
            <div className="text-left flex-1">
              <div className="text-[17px] font-bold text-surface-900 font-tamil">தமிழ்</div>
              <div className="text-[13px] text-surface-500">Tamil</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LanguageScreen;
