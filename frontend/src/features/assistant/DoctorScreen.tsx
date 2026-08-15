import React, { useState } from 'react';
import { useLanguageStore } from '../../shared/store';
import { Card, Input, StatusBadge, Modal } from '../../shared/components';
import { Search, ChevronDown, User, MapPin, Clock, Stethoscope } from 'lucide-react';

// Type definitions for empty state representation
interface Doctor {
  id: number;
  name: string;
  departmentId: number;
  availability: string;
  roomNumber: string;
  isAvailableNow: boolean;
}

interface Department {
  id: number;
  name: string;
  icon: string;
}

const DoctorScreen: React.FC = () => {
  const { t } = useLanguageStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  // Empty data arrays - waiting for backend API
  const departments: Department[] = [];
  const doctors: Doctor[] = [];

  const handleToggleAccordion = (deptId: number) => {
    setOpenAccordion(openAccordion === deptId ? null : deptId);
  };

  return (
    <div className="flex-1 flex flex-col bg-[var(--surface-50)]">
      {/* Header & Search */}
      <div className="sticky top-0 z-10 bg-[var(--surface-0)] border-b border-[var(--surface-200)] shadow-sm">
        <div className="px-4 pt-4 pb-3">
          <h2 className="text-xl font-bold text-[var(--surface-900)] mb-3">{t('doctors.title')}</h2>
          <Input
            icon={<Search width={18} height={18} />}
            placeholder={t('doctors.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Departments List */}
      <div className="flex-1 overflow-y-auto p-4">
        {departments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-60">
            <Stethoscope width={48} height={48} color="var(--surface-400)" className="mb-4" />
            <h3 className="text-lg font-semibold text-[var(--surface-700)] mb-1">No Data Available</h3>
            <p className="text-sm text-[var(--surface-500)]">{t('doctors.noResults')}</p>
          </div>
        ) : (
          departments.map((dept) => {
            const deptDoctors = doctors.filter(d => d.departmentId === dept.id);
            const isOpen = openAccordion === dept.id;

            return (
              <div key={dept.id} className="accordion animate-fade-in-up">
                <button
                  className={`accordion-header ${isOpen ? 'accordion-header-open' : ''}`}
                  onClick={() => handleToggleAccordion(dept.id)}
                  type="button"
                >
                  <div className="accordion-icon">
                    <Stethoscope width={20} height={20} />
                  </div>
                  <div className="accordion-title">{dept.name}</div>
                  <div className="accordion-count">{deptDoctors.length} Doctors</div>
                  <ChevronDown
                    width={20}
                    height={20}
                    className={`accordion-chevron ${isOpen ? 'accordion-chevron-open' : ''}`}
                  />
                </button>

                <div 
                  className="accordion-body"
                  style={{ maxHeight: isOpen ? '1000px' : '0px' }}
                >
                  <div className="accordion-body-content">
                    {deptDoctors.map((doc) => (
                      <div 
                        key={doc.id} 
                        className={`doctor-item ${!doc.isAvailableNow ? 'doctor-item-unavailable' : ''}`}
                        onClick={() => setSelectedDoctor(doc)}
                      >
                        <div className="doctor-avatar">
                          <User width={20} height={20} />
                        </div>
                        <div className="doctor-info">
                          <div className="doctor-name">{doc.name}</div>
                          <div className="doctor-meta flex items-center gap-2 mt-1">
                            <MapPin width={12} height={12} /> Room {doc.roomNumber}
                          </div>
                        </div>
                        <StatusBadge
                          status={doc.isAvailableNow ? 'available' : 'unavailable'}
                          label={doc.isAvailableNow ? t('doctors.available') : t('doctors.unavailable')}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Doctor Details Modal */}
      <Modal
        isOpen={!!selectedDoctor}
        onClose={() => setSelectedDoctor(null)}
        title="Doctor Details"
      >
        {selectedDoctor && (
          <div className="flex flex-col gap-4 mt-2">
            <div className="flex items-center gap-4 p-4 bg-[var(--surface-50)] rounded-[var(--radius-lg)] border border-[var(--surface-200)]">
              <div className="w-[56px] h-[56px] rounded-[50%] bg-[var(--primary-100)] flex items-center justify-center flex-shrink-0">
                <User width={28} height={28} color="var(--primary-600)" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[var(--surface-900)]">{selectedDoctor.name}</h3>
                <p className="text-sm text-[var(--surface-500)] font-medium mt-1">
                  {departments.find(d => d.id === selectedDoctor.departmentId)?.name}
                </p>
              </div>
            </div>

            <Card style={{ padding: 'var(--space-lg)' }}>
              <div className="flex items-start gap-3 mb-4">
                <Clock width={20} height={20} color="var(--surface-400)" className="mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-[var(--surface-800)] mb-1">{t('doctors.availableTime')}</div>
                  <div className="text-sm text-[var(--surface-600)]">{selectedDoctor.availability}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin width={20} height={20} color="var(--surface-400)" className="mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-[var(--surface-800)] mb-1">{t('doctors.room')}</div>
                  <div className="text-sm text-[var(--surface-600)]">{selectedDoctor.roomNumber}</div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DoctorScreen;
