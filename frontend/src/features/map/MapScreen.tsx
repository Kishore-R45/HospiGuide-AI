import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, ImageOverlay, Polyline, Marker, useMap, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLanguageStore, useNavigationStore, useMapStore, useUIStore } from '../../shared/store';
import { BottomSheet, Button } from '../../shared/components';
import { X, Navigation2, Volume2, VolumeX, Layers, CheckCircle2, ArrowRightCircle, Maximize2, Minimize2 } from 'lucide-react';

// Custom icons
const createCustomIcon = (color: string, iconHtml: string) => L.divIcon({
  className: 'custom-leaflet-icon',
  html: `<div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); color: white;">${iconHtml}</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const destIcon = createCustomIcon('#ef4444', '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>');

const MapController: React.FC<{
  currentFloor: number;
  userPosition: { x: number; y: number } | null;
  shouldRecenter: boolean;
  onRecentered: () => void;
  floorPlan: { width: number; height: number } | null;
}> = ({ userPosition, shouldRecenter, onRecentered, floorPlan }) => {
  const map = useMap();

  useEffect(() => {
    if (floorPlan) {
      const bounds = new L.LatLngBounds([0, 0], [floorPlan.height, floorPlan.width]);
      map.setMaxBounds(bounds);
      if (!userPosition) {
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }, [map, floorPlan, userPosition]);

  useEffect(() => {
    if (shouldRecenter && userPosition) {
      map.flyTo([userPosition.y, userPosition.x], map.getZoom() || 1, { duration: 0.5 });
      onRecentered();
    }
  }, [shouldRecenter, userPosition, map, onRecentered]);

  return null;
};

const BlueDot: React.FC<{ position: [number, number]; heading: number }> = ({ position, heading }) => {
  const icon = L.divIcon({
    className: 'blue-dot-marker',
    html: `
      <div class="ring"></div>
      <div class="dot" style="transform: rotate(${heading}deg)">
         <div style="position: absolute; top: -6px; left: 50%; width: 0; height: 0; margin-left: -4px; border-left: 4px solid transparent; border-right: 4px solid transparent; border-bottom: 6px solid white;"></div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });

  return <Marker position={position} icon={icon} zIndexOffset={1000} />;
};

const MapScreen: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguageStore();
  const {
    isNavigating, destinationName, steps, currentStepIndex,
    routeCoordinates, voiceEnabled, remainingDistance, eta,
    stopNavigation, toggleVoice
  } = useNavigationStore();
  const { currentFloor, userPosition, userHeading, setCurrentFloor } = useMapStore();
  const { isFullscreen, setFullscreen } = useUIStore();

  const [showBottomSheet, setShowBottomSheet] = useState(true);
  const [shouldRecenter, setShouldRecenter] = useState(true);
  const [showFloorPicker, setShowFloorPicker] = useState(false);

  // Hardcoded floor plans config to avoid mockData dependency
  const floorPlans = [
    { floorNumber: 1, name: "Ground Floor", imageUrl: "/maps/floor-1.svg", width: 800, height: 600 },
    { floorNumber: 2, name: "First Floor", imageUrl: "/maps/floor-2.svg", width: 800, height: 600 },
  ];

  const floorPlan = floorPlans.find(f => f.floorNumber === currentFloor) || null;
  const bounds: L.LatLngBoundsExpression = floorPlan
    ? [[0, 0], [floorPlan.height, floorPlan.width]]
    : [[0, 0], [1000, 1000]];

  // Cleanup fullscreen on unmount
  useEffect(() => {
    return () => setFullscreen(false);
  }, [setFullscreen]);

  if (!isNavigating) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-surface-50 p-6 text-center">
        <Navigation2 width={64} height={64} className="text-surface-300 mb-4" />
        <h2 className="text-xl font-bold text-surface-800 mb-2">No Active Route</h2>
        <p className="text-base text-surface-500 mb-6">Please select a destination from the assistant screen.</p>
        <Button onClick={() => navigate('/app/chat')}>Back to Assistant</Button>
      </div>
    );
  }

  const currentStep = steps[currentStepIndex];
  const polylinePositions: L.LatLngTuple[] = routeCoordinates.map(([x, y]) => [y, x]);

  return (
    <div className={`flex-1 flex flex-col min-h-0 bg-surface-50 relative overflow-hidden transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-[999] bg-surface-0' : ''}`}>
      {/* Fullscreen Toggle Button */}
      <button 
        className="absolute top-4 right-4 z-[400] w-10 h-10 bg-surface-0 rounded-lg shadow-md flex items-center justify-center text-surface-600 transition-colors duration-200 hover:bg-surface-50"
        onClick={() => setFullscreen(!isFullscreen)}
        aria-label={isFullscreen ? t('map.exitFullscreen') : t('map.fullscreen')}
      >
        {isFullscreen ? <Minimize2 width={20} height={20} /> : <Maximize2 width={20} height={20} />}
      </button>

      {/* Map Container */}
      <div className="flex-1 w-full h-full min-h-[50vh] bg-surface-100">
        <MapContainer
          crs={L.CRS.Simple}
          bounds={bounds}
          className="w-full h-full"
          zoomControl={false}
          attributionControl={false}
          minZoom={-2}
          maxZoom={2}
        >
          <MapController 
            currentFloor={currentFloor} 
            userPosition={userPosition} 
            shouldRecenter={shouldRecenter} 
            onRecentered={() => setShouldRecenter(false)} 
            floorPlan={floorPlan}
          />
          
          {floorPlan && (
            <ImageOverlay url={floorPlan.imageUrl} bounds={bounds} />
          )}

          {polylinePositions.length > 0 && (
            <Polyline 
              positions={polylinePositions} 
              pathOptions={{ color: '#0d9488', weight: 6, opacity: 0.8, lineCap: 'round', lineJoin: 'round' }} 
            />
          )}

          {routeCoordinates.length > 0 && (
            <Marker position={[routeCoordinates[routeCoordinates.length-1][1], routeCoordinates[routeCoordinates.length-1][0]]} icon={destIcon}>
              <Popup><strong>{destinationName}</strong></Popup>
            </Marker>
          )}

          {userPosition && (
            <BlueDot position={[userPosition.y, userPosition.x]} heading={userHeading} />
          )}
        </MapContainer>
      </div>

      {/* Floating Controls */}
      <div className="absolute right-4 bottom-32 z-[400] flex flex-col gap-3 pointer-events-auto">
        <div className="relative">
          {showFloorPicker && (
            <div className="absolute bottom-full right-0 mb-3 bg-surface-0 border border-surface-200 rounded-md overflow-hidden shadow-lg animate-fade-in-up flex flex-col w-[120px]">
              {floorPlans.map(fp => (
                <button
                  key={fp.floorNumber}
                  onClick={() => { setCurrentFloor(fp.floorNumber); setShowFloorPicker(false); setShouldRecenter(true); }}
                  className={`w-full px-4 py-3 text-sm font-medium text-left transition-colors ${currentFloor === fp.floorNumber ? 'bg-primary-50 text-primary-600' : 'bg-transparent text-surface-700 hover:bg-surface-50'}`}
                >
                  {fp.name}
                </button>
              ))}
            </div>
          )}
          <button className="w-12 h-12 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.15)] flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 bg-surface-0 text-primary-600" onClick={() => setShowFloorPicker(!showFloorPicker)}>
            <Layers width={20} height={20} />
          </button>
        </div>
        
        <button className="w-12 h-12 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.15)] flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 bg-surface-0 text-primary-600" onClick={toggleVoice}>
          {voiceEnabled ? <Volume2 width={20} height={20} /> : <VolumeX width={20} height={20} className="text-surface-400" />}
        </button>
        
        <button className="w-12 h-12 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.15)] flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 bg-primary-500 text-white" onClick={() => setShouldRecenter(true)}>
          <Navigation2 width={20} height={20} />
        </button>
      </div>

      {/* Navigation Instructions Panel */}
      <div className="absolute left-4 right-4 bottom-[calc(env(safe-area-inset-bottom)+80px)] z-[400] bg-surface-0 rounded-2xl p-4 shadow-[0_4px_24px_rgba(0,0,0,0.1)] pointer-events-auto relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary-600">{remainingDistance} {t('common.meters')}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-surface-300" />
            <span className="text-sm font-medium text-surface-500">{eta} {t('common.minutes')} ETA</span>
          </div>
          <button
            onClick={() => { stopNavigation(); navigate('/app/chat'); }}
            className="w-8 h-8 rounded-full bg-surface-100 flex items-center justify-center text-surface-500 hover:text-surface-800 hover:bg-surface-200 transition-colors"
          >
            <X width={16} height={16} />
          </button>
        </div>

        <div className="flex items-center gap-4 bg-primary-50 p-4 rounded-xl cursor-pointer transition-colors duration-200 hover:bg-primary-100" onClick={() => setShowBottomSheet(true)}>
          <div className="w-12 h-12 bg-surface-0 rounded-full shadow-sm flex items-center justify-center text-primary-600 shrink-0">
            <ArrowRightCircle width={24} height={24} />
          </div>
          <div className="flex-1">
            <div className="text-base font-bold text-surface-900 leading-tight mb-1">
              {currentStep ? t(currentStep.instructionKey) : t('navigation.instructions.destination')}
            </div>
            {currentStep?.landmark && (
              <div className="text-sm text-surface-500">near {currentStep.landmark}</div>
            )}
          </div>
        </div>
      </div>

      {/* Steps Bottom Sheet */}
      <BottomSheet 
        isOpen={showBottomSheet} 
        onClose={() => setShowBottomSheet(false)}
        title={`${t('navigation.steps')} (${steps.length})`}
      >
        <div className="flex flex-col gap-4 mt-2">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            
            return (
              <div 
                key={idx} 
                className={`flex gap-4 p-3 rounded-md transition-colors ${isCurrent ? 'bg-primary-50 border border-primary-200' : 'bg-transparent border border-transparent'} ${!isCurrent && !isCompleted ? 'opacity-60' : ''}`}
              >
                <div className="flex flex-col items-center mt-1">
                  {isCompleted ? (
                    <CheckCircle2 width={20} height={20} className="text-success" />
                  ) : (
                    <div 
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isCurrent ? 'border-primary-400' : 'border-surface-300'}`}
                    >
                      {isCurrent && <div className="w-2 h-2 rounded-full bg-primary-400" />}
                    </div>
                  )}
                  {idx < steps.length - 1 && (
                    <div 
                      className={`w-0.5 h-full my-1 ${isCompleted ? 'bg-success/50' : 'bg-surface-200'}`}
                    />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <p 
                    className={`font-semibold ${isCurrent ? 'text-primary-700' : isCompleted ? 'text-surface-400 line-through' : 'text-surface-700'}`}
                  >
                    {t(step.instructionKey)}
                  </p>
                  {step.landmark && (
                    <p className="text-sm text-surface-500 mt-1">near {step.landmark}</p>
                  )}
                  <p className="text-xs text-surface-400 font-mono mt-1">{step.distance}m • Floor {step.floor}</p>
                </div>
              </div>
            );
          })}
          {steps.length === 0 && (
            <p className="text-center text-surface-500 py-4">No detailed steps available.</p>
          )}
        </div>
      </BottomSheet>
    </div>
  );
};

export default MapScreen;
