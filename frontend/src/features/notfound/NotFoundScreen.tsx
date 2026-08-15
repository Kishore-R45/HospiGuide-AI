import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguageStore } from '../../shared/store';
import { Button } from '../../shared/components';
import { Home } from 'lucide-react';

const NotFoundScreen: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguageStore();

  return (
    <div className="not-found animate-fade-in">
      <div className="not-found-code">404</div>
      <h1 className="not-found-title">{t('errors.notFound')}</h1>
      <p className="not-found-desc">{t('errors.notFoundDesc')}</p>
      
      <Button 
        variant="primary" 
        size="lg" 
        icon={<Home width={20} height={20} />}
        onClick={() => navigate('/app/chat')}
      >
        {t('errors.goHome')}
      </Button>
    </div>
  );
};

export default NotFoundScreen;
