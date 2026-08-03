import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, ImageOverlay, Polyline, Marker, useMap, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLanguageStore, useNavigationStore, useMapStore } from '../../shared/store';
import { BottomSheet, FAB, Button } from '../../shared/components';
import { floorPlans } from '../../data/mockData';
import { X, Navigation2, Volume2, VolumeX, Layers, CheckCircle2, ArrowRightCircle } from 'lucide-react';

// Custom icons
const createCustomIcon = (color: string, iconHtml: string) => L.divIcon({
  className: 'custom-leaflet-icon',
  html: `<div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); color: white;">${iconHtml}</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const destIcon = createCustomIcon('#ef4444', '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>');

// A component to handle map interactions like recentering and bounds
const MapController: React.FC<{
  currentFloor: number;
  userPosition: { x: number; y: number } | null;
  shouldRecenter: boolean;
  onRecentered: () => void;
}> = ({ currentFloor, userPosition, shouldRecenter, onRecentered }) => {
  const map = useMap();
  const floorPlan = floorPlans.find(f => f.floorNumber === currentFloor);

  useEffect(() => {
    if (floorPlan) {
      // Set bounds based on image dimensions
      const bounds = new L.LatLngBounds(
        [0, 0],
        [floorPlan.height, floorPlan.width]
      );
      map.setMaxBounds(bounds);
      
      // Initial fit bounds if no position
      if (!userPosition) {
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }, [map, currentFloor, floorPlan]);

  useEffect(() => {
    if (shouldRecenter && userPosition) {
      map.flyTo([userPosition.y, userPosition.x], map.getZoom() || 1, {
        duration: 0.5,
      });
      onRecentered();
    }
  }, [shouldRecenter, userPosition, map, onRecentered]);

  return null;
};

// Component for the blue dot marker
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
    stopNavigation, advanceStep, toggleVoice
  } = useNavigationStore();
  const { currentFloor, userPosition, userHeading, setCurrentFloor, setUserPosition } = useMapStore();

  const [showBottomSheet, setShowBottomSheet] = useState(true);
  const [shouldRecenter, setShouldRecenter] = useState(true);
  const [showFloorPicker, setShowFloorPicker] = useState(false);

  const floorPlan = floorPlans.find(f => f.floorNumber === currentFloor);
  const bounds: L.LatLngBoundsExpression = floorPlan
    ? [[0, 0], [floorPlan.height, floorPlan.width]]
    : [[0, 0], [1000, 1000]];

  // Mock movement simulation for prototype
  useEffect(() => {
    if (!isNavigating || routeCoordinates.length === 0) return;

    let index = 0;
    const interval = setInterval(() => {
      if (index < routeCoordinates.length) {
        const [x, y] = routeCoordinates[index];
        setUserPosition({ x, y });
        
        // Calculate mock heading
        if (index > 0) {
          // but image overlay usually has Y going down in typical web, 
          // however Leaflet Simple puts [0,0] at bottom-left. 
          // We will just use the angle directly for prototype.
        }

        // Auto advance steps based on distance (simplified mock)
        if (index % Math.max(1, Math.floor(routeCoordinates.length / steps.length)) === 0) {
           advanceStep();
        }

        index++;
      } else {
        clearInterval(interval);
        setTimeout(() => navigate('/arrival'), 1500);
      }
    }, 1000); // move every 1s

    return () => clearInterval(interval);
  }, [isNavigating, routeCoordinates, setUserPosition, advanceStep, navigate, steps.length]);


  if (!isNavigating) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-surface-950 p-6 text-center">
        <Navigation2 className="w-16 h-16 text-surface-600 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">No Active Route</h2>
        <p className="text-surface-400 mb-6">Please select a destination from the assistant screen.</p>
        <Button onClick={() => navigate('/assistant')}>Back to Assistant</Button>
      </div>
    );
  }

  const currentStep = steps[currentStepIndex];

  // Map coordinates to Leaflet LatLng [y, x] format
  const polylinePositions: L.LatLngTuple[] = routeCoordinates.map(([x, y]: [number, number]) => [y, x]);

  return (
    <div className="h-dvh flex flex-col bg-surface-950 relative overflow-hidden">
      {/* Top Status Bar */}
      <div className="absolute top-0 inset-x-0 z-[400] p-4 pointer-events-none">
        <div className="glass-card rounded-[var(--radius-lg)] p-4 flex items-center justify-between pointer-events-auto">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-primary-400 font-bold text-xl">{remainingDistance} {t('common.meters')}</span>
              <span className="w-1 h-1 rounded-full bg-surface-600" />
              <span className="text-surface-300 text-sm">{eta} {t('common.minutes')} ETA</span>
            </div>
            <h2 className="text-white font-semibold text-lg leading-tight flex items-center gap-2">
              <ArrowRightCircle className="w-5 h-5 text-primary-400" />
              {currentStep ? t(currentStep.instructionKey) : t('navigation.instructions.destination')}
            </h2>
            {currentStep?.landmark && (
              <p className="text-sm text-surface-400 mt-0.5 ml-7">near {currentStep.landmark}</p>
            )}
          </div>
          <button
            onClick={() => { stopNavigation(); navigate('/assistant'); }}
            className="w-10 h-10 rounded-full bg-surface-700/50 flex items-center justify-center text-surface-300 hover:text-white hover:bg-surface-600 transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 w-full relative z-0">
        <MapContainer
          crs={L.CRS.Simple}
          bounds={bounds}
          className="w-full h-full bg-surface-900"
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
          />
          
          {floorPlan && (
            <ImageOverlay
              url={floorPlan.imageUrl}
              bounds={bounds}
            />
          )}

          {/* Route Polyline */}
          <Polyline 
            positions={polylinePositions} 
            pathOptions={{ color: '#0d9488', weight: 6, opacity: 0.8, lineCap: 'round', lineJoin: 'round', className: 'route-animated' }} 
          />

          {/* Destination Marker */}
          {routeCoordinates.length > 0 && (
             <Marker position={[routeCoordinates[routeCoordinates.length-1][1], routeCoordinates[routeCoordinates.length-1][0]]} icon={destIcon}>
               <Popup className="custom-popup">
                 <strong>{destinationName}</strong>
               </Popup>
             </Marker>
          )}

          {/* User Location */}
          {userPosition && (
            <BlueDot position={[userPosition.y, userPosition.x]} heading={userHeading} />
          )}

        </MapContainer>
      </div>

      {/* Floating Controls */}
      <div className="absolute right-4 bottom-24 z-[400] flex flex-col gap-3 pointer-events-auto">
        <div className="relative">
          {showFloorPicker && (
            <div className="absolute bottom-full right-0 mb-3 bg-surface-800 border border-surface-700 rounded-[var(--radius-md)] overflow-hidden shadow-lg animate-fade-in-up">
              {floorPlans.map(fp => (
                <button
                  key={fp.floorNumber}
                  onClick={() => { setCurrentFloor(fp.floorNumber); setShowFloorPicker(false); setShouldRecenter(true); }}
                  className={`w-full px-4 py-2 text-sm font-medium text-left transition-colors ${currentFloor === fp.floorNumber ? 'bg-primary-500/20 text-primary-400' : 'text-surface-300 hover:bg-surface-700'}`}
                >
                  Floor {fp.floorNumber}
                </button>
              ))}
            </div>
          )}
          <FAB 
            icon={<Layers className="w-5 h-5" />} 
            variant="secondary" 
            onClick={() => setShowFloorPicker(!showFloorPicker)} 
            label={`F${currentFloor}`}
          />
        </div>
        
        <FAB 
          icon={voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-surface-400" />} 
          variant="secondary" 
          onClick={toggleVoice} 
        />
        
        <FAB 
          icon={<Navigation2 className="w-5 h-5" />} 
          variant="primary" 
          onClick={() => setShouldRecenter(true)} 
        />
      </div>

      {/* Bottom Sheet Handle (when collapsed) */}
      {!showBottomSheet && (
        <div 
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[400] glass-card px-6 py-2 rounded-full flex items-center gap-2 cursor-pointer animate-fade-in-up"
          onClick={() => setShowBottomSheet(true)}
        >
          <span className="w-8 h-1 rounded-full bg-surface-500" />
          <span className="text-sm font-medium text-surface-200">View Steps</span>
        </div>
      )}

      {/* Steps Bottom Sheet */}
      <BottomSheet 
        isOpen={showBottomSheet} 
        onClose={() => setShowBottomSheet(false)}
        title={`${t('navigation.steps')} (${steps.length})`}
      >
        <div className="space-y-4">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            
            return (
              <div key={idx} className={`flex gap-4 p-3 rounded-[var(--radius-md)] transition-colors ${isCurrent ? 'bg-primary-500/10 border border-primary-500/20' : 'opacity-70'}`}>
                <div className="flex flex-col items-center mt-1">
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isCurrent ? 'border-primary-400' : 'border-surface-500'}`}>
                      {isCurrent && <div className="w-2 h-2 rounded-full bg-primary-400" />}
                    </div>
                  )}
                  {idx < steps.length - 1 && (
                    <div className={`w-0.5 h-full my-1 ${isCompleted ? 'bg-green-500/50' : 'bg-surface-700'}`} />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <p className={`font-semibold ${isCurrent ? 'text-primary-300' : isCompleted ? 'text-surface-400 line-through' : 'text-surface-200'}`}>
                    {t(step.instructionKey)}
                  </p>
                  {step.landmark && (
                    <p className="text-sm text-surface-500 mt-1">near {step.landmark}</p>
                  )}
                  <p className="text-xs text-surface-500 font-mono mt-1">{step.distance}m • Floor {step.floor}</p>
                </div>
              </div>
            );
          })}
        </div>
      </BottomSheet>
    </div>
  );
};

export default MapScreen;
