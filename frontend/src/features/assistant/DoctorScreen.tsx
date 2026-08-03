import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguageStore } from '../../shared/store';
import { Card, StatusBadge } from '../../shared/components';
import { ArrowLeft, User, MapPin, Clock } from 'lucide-react';
import { departments, doctors } from '../../data/mockData';

const DoctorScreen: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguageStore();

  const deptId = parseInt(id || '0', 10);
  const department = departments.find(d => d.id === deptId);
  const deptDoctors = doctors.filter(d => d.departmentId === deptId);

  if (!department) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-surface-950 p-6 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Department Not Found</h2>
        <button className="text-primary-400" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

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
        <div>
          <h1 className="text-xl font-bold text-white">{department.name}</h1>
          <p className="text-sm text-surface-400">{t('doctors.title')}</p>
        </div>
      </header>

      <div className="flex-1 p-4 space-y-4">
        {deptDoctors.length === 0 ? (
          <div className="text-center text-surface-400 mt-10">
            No doctors available for this department.
          </div>
        ) : (
          deptDoctors.map((doc) => (
            <Card key={doc.id} variant="glass" className="p-4 animate-fade-in-up" animate>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-500/15 flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-6 h-6 text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-white truncate">{doc.name}</h3>
                  <div className="mt-2 mb-3">
                    <StatusBadge 
                      status={doc.isAvailableNow ? 'available' : 'soon'} 
                      label={doc.isAvailableNow ? t('doctors.available') : t('doctors.availableFrom', { time: doc.availability.split(' - ')[0] })} 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-sm text-surface-300 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-surface-500" />
                      {doc.availability}
                    </p>
                    <p className="text-sm text-surface-300 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-surface-500" />
                      {t('doctors.room')} {doc.roomNumber}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default DoctorScreen;
