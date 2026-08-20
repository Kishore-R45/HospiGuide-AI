import React, { useState } from 'react';
import { useLanguageStore } from '../../shared/store';
import { Card, Input, StatusBadge, Modal } from '../../shared/components';
import { Search, ChevronDown, User, MapPin, Clock, Stethoscope } from 'lucide-react';

import { useQuery } from '@tanstack/react-query';
import { getDepartments, getDoctors } from '../../shared/api/doctorService';
import type { Doctor } from '../../shared/api/doctorService';

const DoctorScreen: React.FC = () => {
  const { t } = useLanguageStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  // Fetch data from backend
  const { data: departmentsData = [], isLoading: isLoadingDepts } = useQuery({
    queryKey: ['departments'],
    queryFn: getDepartments
  });

  const { data: doctorsData = [], isLoading: isLoadingDocs } = useQuery({
    queryKey: ['doctors'],
    queryFn: getDoctors
  });

  const isLoading = isLoadingDepts || isLoadingDocs;

  // Filter departments and doctors based on search
  const filteredDepartments = departmentsData.filter(dept => 
    dept.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const doctors = doctorsData.map(doc => {
    // Simple availability logic: just marking everyone available for now.
    // In a real app, parse `doc.timing` and `doc.days` against current Date.
    return {
      ...doc,
      isAvailableNow: true
    };
  });

  const handleToggleAccordion = (deptId: number) => {
    setOpenAccordion(openAccordion === deptId ? null : deptId);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-surface-50">
      {/* Header & Search */}
      <div className="sticky top-0 z-10 bg-surface-0 border-b border-surface-200 shadow-sm">
        <div className="px-4 pt-4 pb-3">
          <h2 className="text-xl font-bold text-surface-900 mb-3">{t('doctors.title')}</h2>
          <Input
            icon={<Search width={18} height={18} />}
            placeholder={t('doctors.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="!rounded-full"
          />
        </div>
      </div>

      {/* Departments List */}
      <div className="flex-1 overflow-y-auto min-h-0 p-4 pb-[calc(64px+env(safe-area-inset-bottom)+24px)]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-60">
            <Stethoscope width={48} height={48} className="text-surface-400 mb-4 animate-pulse" />
            <h3 className="text-lg font-semibold text-surface-700 mb-1">Loading Data...</h3>
          </div>
        ) : filteredDepartments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-60">
            <Stethoscope width={48} height={48} className="text-surface-400 mb-4" />
            <h3 className="text-lg font-semibold text-surface-700 mb-1">No Data Available</h3>
            <p className="text-sm text-surface-500">{t('doctors.noResults')}</p>
          </div>
        ) : (
          filteredDepartments.map((dept) => {
            const deptDoctors = doctors.filter(d => d.department_id === dept.id);
            const isOpen = openAccordion === dept.id;

            return (
              <div key={dept.id} className="bg-surface-0 border border-surface-200 rounded-xl mb-3 overflow-hidden shadow-sm animate-fade-in-up">
                <button
                  className={`flex items-center w-full p-4 cursor-pointer select-none transition-colors duration-200 hover:bg-surface-50 ${isOpen ? 'bg-primary-50 border-b border-primary-100 hover:bg-primary-50' : 'bg-surface-0'}`}
                  onClick={() => handleToggleAccordion(dept.id)}
                  type="button"
                >
                  <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-surface-100 text-primary-600 mr-3 shrink-0">
                    <Stethoscope width={20} height={20} />
                  </div>
                  <div className="flex-1 text-[15px] font-bold text-surface-800 text-left">{dept.name}</div>
                  <div className="text-xs font-semibold text-primary-600 bg-primary-100 px-2.5 py-1 rounded-full mr-3">{deptDoctors.length} Doctors</div>
                  <ChevronDown
                    width={20}
                    height={20}
                    className={`text-surface-400 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isOpen ? '-rotate-180 !text-primary-600' : ''}`}
                  />
                </button>

                <div 
                  className="bg-surface-0 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                  style={{ maxHeight: isOpen ? '1000px' : '0px' }}
                >
                  <div className="p-2">
                    {deptDoctors.map((doc) => (
                      <div 
                        key={doc.id} 
                        className={`flex items-center p-3 rounded-lg mb-1 cursor-pointer transition-colors duration-200 hover:bg-surface-50 ${!doc.isAvailableNow ? 'opacity-60 grayscale hover:bg-transparent cursor-not-allowed' : ''}`}
                        onClick={() => setSelectedDoctor(doc)}
                      >
                        <div className="w-10 h-10 rounded-full bg-surface-100 flex items-center justify-center text-surface-400 mr-3 shrink-0">
                          <User width={20} height={20} />
                        </div>
                        <div className="flex-1 pr-3">
                          <div className="text-[15px] font-semibold text-surface-800">{doc.name}</div>
                          <div className="text-[13px] text-surface-500 flex items-center gap-2 mt-1">
                            <MapPin width={12} height={12} /> Room {doc.room_number}
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
        {selectedDoctor && (() => {
          const dept = departmentsData.find(d => d.id === selectedDoctor.department_id);
          return (
          <div className="flex flex-col gap-4 mt-2">
            <div className="flex items-center gap-4 p-4 bg-surface-50 rounded-2xl border border-surface-200">
              <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <User width={28} height={28} className="text-primary-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-surface-900">{selectedDoctor.name}</h3>
                <p className="text-sm text-surface-500 font-medium mt-1">
                  {dept?.name}
                </p>
              </div>
            </div>

            <Card className="p-4">
              <div className="flex items-start gap-3 mb-4">
                <Clock width={20} height={20} className="text-surface-400 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-surface-800 mb-1">{t('doctors.availableTime')}</div>
                  <div className="text-sm text-surface-600">{selectedDoctor.timing} ({selectedDoctor.days})</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin width={20} height={20} className="text-surface-400 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-surface-800 mb-1">{t('doctors.room')}</div>
                  <div className="text-sm text-surface-600">
                    {dept ? `Block ${dept.block_id}, ${dept.floor}, ` : ''}Room {selectedDoctor.room_number}
                  </div>
                </div>
              </div>
            </Card>
          </div>
          );
        })()}
      </Modal>
    </div>
  );
};

export default DoctorScreen;
