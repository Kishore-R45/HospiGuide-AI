import React, { useState } from 'react';
import { useLanguageStore } from '../../shared/store';
import { Button, Input, Card } from '../../shared/components';
import { Lock, ShieldCheck, Database, Map, UserPlus, Radio, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminScreen: React.FC = () => {
  const { t } = useLanguageStore();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'locations' | 'departments' | 'doctors' | 'beacons'>('locations');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
    } else {
      alert('Invalid password (use: admin123)');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-surface-950 p-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary-600/5 blur-[100px] pointer-events-none" />
        
        <Card variant="glass" className="w-full max-w-sm p-6 relative z-10">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-primary-500/10 flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-primary-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">{t('admin.title')}</h1>
            <p className="text-sm text-surface-400">Staff access only</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="password"
              placeholder={t('admin.password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<ShieldCheck className="w-5 h-5" />}
              autoFocus
            />
            <Button type="submit" fullWidth size="lg">
              {t('admin.loginBtn')}
            </Button>
            <Button type="button" variant="ghost" fullWidth onClick={() => navigate('/assistant')}>
              {t('common.cancel')}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  const tabs = [
    { id: 'locations', label: t('admin.locations'), icon: <Map className="w-4 h-4" /> },
    { id: 'departments', label: t('admin.departments'), icon: <Database className="w-4 h-4" /> },
    { id: 'doctors', label: t('admin.doctors'), icon: <UserPlus className="w-4 h-4" /> },
    { id: 'beacons', label: t('admin.beacons'), icon: <Radio className="w-4 h-4" /> },
  ] as const;

  return (
    <div className="min-h-dvh flex flex-col bg-surface-950">
      {/* Header */}
      <header className="glass sticky top-0 z-30 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/assistant')}
            className="w-10 h-10 rounded-full bg-surface-800/60 flex items-center justify-center text-surface-200 hover:bg-surface-700/60 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-white">{t('admin.title')}</h1>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setIsAuthenticated(false)}>Logout</Button>
      </header>

      {/* Tabs */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide border-b border-surface-800">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id 
                ? 'bg-primary-500 text-white' 
                : 'bg-surface-800/50 text-surface-300 hover:bg-surface-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 p-4">
        <Card variant="glass" className="h-[60vh] flex flex-col items-center justify-center p-6 text-center border-dashed border-2 border-surface-700/50">
          <Database className="w-12 h-12 text-surface-600 mb-4" />
          <h2 className="text-lg font-semibold text-surface-200 mb-2">Data Management Module</h2>
          <p className="text-sm text-surface-400 max-w-xs">
            This is a functional placeholder for the admin CRUD panel as specified in §13.9. 
            In the actual implementation, this will render editable tables for {activeTab}.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default AdminScreen;
