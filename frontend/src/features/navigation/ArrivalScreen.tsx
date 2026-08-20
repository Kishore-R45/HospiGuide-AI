import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguageStore, useNavigationStore } from '../../shared/store';
import { Button } from '../../shared/components';
import { CheckCircle, Search, Home } from 'lucide-react';

const ArrivalScreen: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguageStore();
  const { departmentName, roomNumber, stopNavigation } = useNavigationStore();

  // Clean up navigation state when leaving this screen
  useEffect(() => {
    return () => {
      stopNavigation();
    };
  }, [stopNavigation]);

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-surface-950 p-6 relative overflow-hidden">
      {/* Celebration background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-green-500/10 blur-[100px] pointer-events-none animate-pulse-slow" />
      
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center text-center">
        {/* Animated checkmark */}
        <div className="relative mb-8 animate-scale-in">
          <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>
          <div className="absolute inset-0 rounded-full border-2 border-green-400/40 animate-ping" style={{ animationDuration: '2s' }} />
        </div>

        <h1 className="text-3xl font-bold text-white mb-3 animate-fade-in-up delay-100">
          {t('arrival.title')}
        </h1>
        
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 w-full mb-10 animate-fade-in-up delay-200">
          <p className="text-surface-300 text-sm mb-2">You have reached</p>
          <h2 className="text-2xl font-bold text-primary-400 mb-1">{departmentName || 'Destination'}</h2>
          {roomNumber && (
            <p className="text-lg text-white">Room {roomNumber}</p>
          )}
        </div>

        <div className="w-full space-y-4 animate-fade-in-up delay-300">
          <Button 
            variant="primary" 
            size="lg" 
            fullWidth 
            icon={<Search className="w-5 h-5" />}
            onClick={() => navigate('/assistant')}
          >
            {t('arrival.findAnother')}
          </Button>
          <Button 
            variant="ghost" 
            size="lg" 
            fullWidth 
            icon={<Home className="w-5 h-5" />}
            onClick={() => navigate('/assistant')}
          >
            {t('arrival.done')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ArrivalScreen;
