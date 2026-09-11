import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Tooltip, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigationStore, useUIStore } from '../../shared/store';
import { Navigation2, Maximize2, Minimize2, Search, X, LocateFixed, Building2 } from 'lucide-react';

// ─── GeoJSON Type Aliases ───
type GeoJSONData = GeoJSON.FeatureCollection;

// ─── Building file registry ───
// Each entry: [filename (without .geojson), display name]
const BUILDING_FILES: [string, string][] = [
  ['Block-1', 'Block 1'],
  ['Block-2', 'Block 2'],
  ['Block-3', 'Block 3'],
  ['Canteen', 'Canteen'],
  ['Dental Block', 'Dental Block'],
  ['Main Block', 'Main Block'],
  ['Marchary Block', 'Marchary Block'],
  ['Out Patient Block', 'Out Patient Block'],
  ['Pergerancy Block', 'Pergerancy Block'],
  ['Pharmacy', 'Pharmacy'],
  ['Siddha & Ayurvedha Block', 'Siddha & Ayurvedha Block'],
];

const WALKWAY_FILE = 'Walkways or roads';
const POINT_FILES = ['Entrance', 'Exit'] as const;

// ─── Building Color Palette ───
// Curated colors that are visually distinct and harmonious on a map
const BUILDING_COLORS: Record<string, { fill: string; border: string }> = {
  'Block 1':                   { fill: '#6366f1', border: '#4338ca' },  // indigo
  'Block 2':                   { fill: '#8b5cf6', border: '#6d28d9' },  // violet
  'Block 3':                   { fill: '#0ea5e9', border: '#0284c7' },  // sky
  'Canteen':                   { fill: '#f59e0b', border: '#d97706' },  // amber
  'Dental Block':              { fill: '#06b6d4', border: '#0891b2' },  // cyan
  'Main Block':                { fill: '#0d9488', border: '#0f766e' },  // teal (primary)
  'Marchary Block':            { fill: '#ec4899', border: '#db2777' },  // pink
  'Out Patient Block':         { fill: '#3b82f6', border: '#2563eb' },  // blue
  'Pergerancy Block':          { fill: '#ef4444', border: '#dc2626' },  // red
  'Pharmacy':                  { fill: '#22c55e', border: '#16a34a' },  // green
  'Siddha & Ayurvedha Block':  { fill: '#f97316', border: '#ea580c' },  // orange
};

// ─── Campus bounds (computed from all GeoJSON coordinates) ───
// Slight padding around the campus so the user can see the context
const CAMPUS_CENTER: L.LatLngTuple = [13.03265, 80.17910];
const CAMPUS_BOUNDS: L.LatLngBoundsExpression = [
  [13.03140, 80.17680],  // SW corner
  [13.03380, 80.18080],  // NE corner
];

// ─── Custom marker icons ───
const createGateIcon = (type: 'Entrance' | 'Exit') => {
  const color = type === 'Entrance' ? '#16a34a' : '#ef4444';
  const arrow = type === 'Entrance'
    ? '<path d="M5 12h14M12 5l7 7-7 7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    : '<path d="M19 12H5M12 19l-7-7 7-7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';

  return L.divIcon({
    className: 'custom-gate-icon',
    html: `
      <div style="
        position: relative;
        width: 36px; height: 36px;
      ">
        <div style="
          position: absolute; inset: 0;
          background: ${color};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2.5px solid white;
          box-shadow: 0 3px 8px rgba(0,0,0,0.3);
        "></div>
        <div style="
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
        ">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">${arrow}</svg>
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

const entranceIcon = createGateIcon('Entrance');
const exitIcon = createGateIcon('Exit');

// ─── Helper: fetch a GeoJSON file from the public directory ───
async function fetchGeoJSON(subfolder: string, filename: string): Promise<GeoJSONData | null> {
  try {
    const url = `/Map Data/${subfolder}/${encodeURIComponent(filename)}.geojson`;
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    console.warn(`Failed to load GeoJSON: ${subfolder}/${filename}`);
    return null;
  }
}

// ─── Map auto-fit controller ───
const MapFitBounds: React.FC<{ bounds: L.LatLngBoundsExpression }> = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(bounds, { padding: [30, 30], maxZoom: 19 });
  }, [map, bounds]);
  return null;
};

// ─── Recenter button handler ───
const RecenterControl: React.FC<{ trigger: number }> = ({ trigger }) => {
  const map = useMap();
  useEffect(() => {
    if (trigger > 0) {
      map.flyToBounds(CAMPUS_BOUNDS, { padding: [30, 30], maxZoom: 19, duration: 0.6 });
    }
  }, [map, trigger]);
  return null;
};

// ─── Individual Building Layer ───
const BuildingLayer: React.FC<{
  data: GeoJSONData;
  name: string;
  isSelected: boolean;
  onSelect: (name: string) => void;
}> = ({ data, name, isSelected, onSelect }) => {
  const colors = BUILDING_COLORS[name] || { fill: '#6b7280', border: '#4b5563' };

  const style = useCallback((): L.PathOptions => ({
    fillColor: colors.fill,
    fillOpacity: isSelected ? 0.65 : 0.45,
    color: isSelected ? '#ffffff' : colors.border,
    weight: isSelected ? 3 : 2,
    opacity: 1,
  }), [colors, isSelected]);

  const onEachFeature = useCallback((_feature: GeoJSON.Feature, layer: L.Layer) => {
    layer.on({
      click: () => onSelect(name),
      mouseover: (e: L.LeafletMouseEvent) => {
        const target = e.target as L.Path;
        target.setStyle({
          fillOpacity: 0.65,
          weight: 3,
          color: '#ffffff',
        });
        target.bringToFront();
      },
      mouseout: (e: L.LeafletMouseEvent) => {
        if (!isSelected) {
          const target = e.target as L.Path;
          target.setStyle({
            fillOpacity: 0.45,
            weight: 2,
            color: colors.border,
          });
        }
      },
    });
  }, [name, onSelect, isSelected, colors]);

  return (
    <GeoJSON
      key={`${name}-${isSelected}`}
      data={data}
      style={style}
      onEachFeature={onEachFeature}
    >
      <Tooltip
        direction="center"
        permanent
        className="building-label"
      >
        {name}
      </Tooltip>
    </GeoJSON>
  );
};

// ─── Walkways Layer ───
const WalkwayLayer: React.FC<{ data: GeoJSONData }> = ({ data }) => {
  const style = useCallback((): L.PathOptions => ({
    color: '#94a3b8',
    weight: 3,
    opacity: 0.7,
    dashArray: '8, 6',
    lineCap: 'round',
    lineJoin: 'round',
  }), []);

  return <GeoJSON data={data} style={style} />;
};

// ─── Navigation Route Layer ───
const NavigationRouteLayer: React.FC<{ data: GeoJSONData }> = ({ data }) => {
  const style = useCallback((): L.PathOptions => ({
    color: '#0d9488',
    weight: 5,
    opacity: 0.9,
    lineCap: 'round',
    lineJoin: 'round',
  }), []);

  return <GeoJSON data={data} style={style} />;
};

// ─── Main MapScreen Component ───
const MapScreen: React.FC = () => {
  const { isNavigating, destinationName, routeCoordinates, stopNavigation } = useNavigationStore();
  const { isFullscreen, setFullscreen } = useUIStore();

  // Map data state
  const [buildings, setBuildings] = useState<{ name: string; data: GeoJSONData }[]>([]);
  const [walkways, setWalkways] = useState<GeoJSONData | null>(null);
  const [points, setPoints] = useState<{ type: 'Entrance' | 'Exit'; coords: L.LatLngTuple }[]>([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [recenterTrigger, setRecenterTrigger] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // ─── Load all GeoJSON data ───
  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      setLoading(true);

      // Load buildings
      const buildingResults = await Promise.all(
        BUILDING_FILES.map(async ([file, displayName]) => {
          const data = await fetchGeoJSON('Buildings', file);
          return data ? { name: displayName, data } : null;
        })
      );

      // Load walkways
      const walkwayData = await fetchGeoJSON('Walkways', WALKWAY_FILE);

      // Load points
      const pointResults = await Promise.all(
        POINT_FILES.map(async (name) => {
          const data = await fetchGeoJSON('Points', name);
          if (data && data.features.length > 0) {
            const geom = data.features[0].geometry;
            if (geom.type === 'Point') {
              const [lng, lat] = geom.coordinates;
              return { type: name as 'Entrance' | 'Exit', coords: [lat, lng] as L.LatLngTuple };
            }
          }
          return null;
        })
      );

      if (!cancelled) {
        setBuildings(buildingResults.filter((b): b is { name: string; data: GeoJSONData } => b !== null));
        setWalkways(walkwayData);
        setPoints(pointResults.filter((p): p is { type: 'Entrance' | 'Exit'; coords: L.LatLngTuple } => p !== null));
        setLoading(false);
      }
    }

    loadAll();
    return () => { cancelled = true; };
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  // Cleanup fullscreen on unmount
  useEffect(() => {
    return () => setFullscreen(false);
  }, [setFullscreen]);

  // ─── Filtered buildings for search ───
  const filteredBuildings = useMemo(() => {
    if (!searchQuery.trim()) return buildings;
    const q = searchQuery.toLowerCase();
    return buildings.filter(b => b.name.toLowerCase().includes(q));
  }, [buildings, searchQuery]);

  // ─── Navigation route as GeoJSON ───
  const navigationGeoJSON = useMemo((): GeoJSONData | null => {
    if (!isNavigating || routeCoordinates.length < 2) return null;
    return {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: routeCoordinates,
        }
      }]
    };
  }, [isNavigating, routeCoordinates]);

  const handleBuildingSelect = useCallback((name: string) => {
    setSelectedBuilding(prev => prev === name ? null : name);
  }, []);

  const handleRecenter = useCallback(() => {
    setRecenterTrigger(prev => prev + 1);
  }, []);

  const handleSearchSelect = useCallback((name: string) => {
    setSelectedBuilding(name);
    setSearchQuery('');
    setShowSearch(false);
  }, []);

  // ─── Loading State ───
  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-surface-50 gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-surface-200" />
          <div className="absolute inset-0 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
        </div>
        <p className="text-surface-500 font-medium text-sm animate-pulse">Loading campus map…</p>
      </div>
    );
  }

  return (
    <div className={`flex-1 flex flex-col min-h-0 bg-surface-50 relative overflow-hidden transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-[999] bg-surface-0' : ''}`}>

      {/* ─── Top Bar: Search ─── */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex items-center gap-3 pointer-events-none">
        {/* Search Bar */}
        <div className={`pointer-events-auto transition-all duration-300 ${showSearch ? 'flex-1' : 'w-auto'}`}>
          {showSearch ? (
            <div className="relative">
              <div className="flex items-center bg-surface-0 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.12)] overflow-hidden border border-surface-200/50">
                <Search width={18} height={18} className="ml-4 text-surface-400 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search buildings..."
                  className="flex-1 bg-transparent text-surface-800 placeholder-surface-400 px-3 py-3.5 text-sm font-medium outline-none"
                />
                <button
                  onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                  className="p-3 text-surface-400 hover:text-surface-600 transition-colors"
                >
                  <X width={18} height={18} />
                </button>
              </div>

              {/* Search Results Dropdown */}
              {searchQuery.trim() && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-surface-0 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-surface-200/50 overflow-hidden max-h-[280px] overflow-y-auto">
                  {filteredBuildings.length > 0 ? (
                    filteredBuildings.map((b) => {
                      const colors = BUILDING_COLORS[b.name] || { fill: '#6b7280', border: '#4b5563' };
                      return (
                        <button
                          key={b.name}
                          onClick={() => handleSearchSelect(b.name)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-50 transition-colors text-left border-b border-surface-100 last:border-b-0"
                        >
                          <div
                            className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                            style={{ backgroundColor: colors.fill, border: `2px solid ${colors.border}` }}
                          />
                          <span className="text-sm font-medium text-surface-700">{b.name}</span>
                        </button>
                      );
                    })
                  ) : (
                    <div className="px-4 py-6 text-center text-sm text-surface-400">
                      No buildings found
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              className="w-11 h-11 bg-surface-0 rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.1)] flex items-center justify-center text-surface-600 hover:bg-surface-50 transition-all duration-200 active:scale-95 border border-surface-200/50"
            >
              <Search width={18} height={18} />
            </button>
          )}
        </div>

        {/* Fullscreen Toggle */}
        <button
          className="pointer-events-auto w-11 h-11 bg-surface-0 rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.1)] flex items-center justify-center text-surface-600 hover:bg-surface-50 transition-all duration-200 active:scale-95 border border-surface-200/50"
          onClick={() => setFullscreen(!isFullscreen)}
        >
          {isFullscreen ? <Minimize2 width={18} height={18} /> : <Maximize2 width={18} height={18} />}
        </button>
      </div>

      {/* ─── Right Controls ─── */}
      <div className="absolute right-4 bottom-28 z-[1000] flex flex-col gap-2.5 pointer-events-auto">
        <button
          className="w-11 h-11 rounded-xl bg-surface-0 shadow-[0_4px_16px_rgba(0,0,0,0.1)] flex items-center justify-center text-primary-600 hover:bg-primary-50 transition-all duration-200 active:scale-95 border border-surface-200/50"
          onClick={handleRecenter}
          title="Recenter map"
        >
          <LocateFixed width={20} height={20} />
        </button>
      </div>

      {/* ─── Map Container ─── */}
      <div className="flex-1 w-full h-full min-h-[50vh]">
        <MapContainer
          center={CAMPUS_CENTER}
          zoom={18}
          className="w-full h-full"
          zoomControl={false}
          attributionControl={false}
          minZoom={16}
          maxZoom={20}
          maxBounds={CAMPUS_BOUNDS}
          maxBoundsViscosity={0.9}
        >
          <MapFitBounds bounds={CAMPUS_BOUNDS} />
          <RecenterControl trigger={recenterTrigger} />

          {/* Base Tile Layer - OpenStreetMap */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={20}
          />

          {/* Walkways Layer (render beneath buildings) */}
          {walkways && <WalkwayLayer data={walkways} />}

          {/* Navigation Route (when actively navigating) */}
          {navigationGeoJSON && <NavigationRouteLayer data={navigationGeoJSON} />}

          {/* Building Layers */}
          {buildings.map((b) => (
            <BuildingLayer
              key={b.name}
              data={b.data}
              name={b.name}
              isSelected={selectedBuilding === b.name}
              onSelect={handleBuildingSelect}
            />
          ))}

          {/* Entrance & Exit Markers */}
          {points.map((p) => (
            <Marker
              key={p.type}
              position={p.coords}
              icon={p.type === 'Entrance' ? entranceIcon : exitIcon}
            >
              <Popup className="custom-popup">
                <div className="font-semibold text-sm">{p.type}</div>
                <div className="text-xs text-surface-500 mt-0.5">Hospital {p.type}</div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* ─── Selected Building Info Panel ─── */}
      {selectedBuilding && (
        <div className="absolute left-4 right-4 bottom-24 z-[1000] pointer-events-auto animate-fade-in-up">
          <div className="bg-surface-0/95 backdrop-blur-md rounded-2xl p-4 shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-surface-200/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                  style={{
                    backgroundColor: (BUILDING_COLORS[selectedBuilding]?.fill || '#6b7280') + '20',
                  }}
                >
                  <Building2
                    width={20}
                    height={20}
                    style={{ color: BUILDING_COLORS[selectedBuilding]?.fill || '#6b7280' }}
                  />
                </div>
                <div>
                  <h3 className="text-base font-bold text-surface-800">{selectedBuilding}</h3>
                  <p className="text-xs text-surface-400 mt-0.5">Tap for navigation</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBuilding(null)}
                className="w-8 h-8 rounded-lg bg-surface-100 flex items-center justify-center text-surface-400 hover:text-surface-600 hover:bg-surface-200 transition-colors"
              >
                <X width={14} height={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Active Navigation Banner ─── */}
      {isNavigating && (
        <div className="absolute left-4 right-4 bottom-24 z-[1000] pointer-events-auto animate-fade-in-up">
          <div className="bg-primary-600 rounded-2xl p-4 shadow-[0_8px_30px_rgba(13,148,136,0.3)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Navigation2 width={20} height={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Navigating to</h3>
                  <p className="text-white/80 text-xs">{destinationName}</p>
                </div>
              </div>
              <button
                onClick={stopNavigation}
                className="px-3 py-1.5 bg-white/20 rounded-lg text-white text-xs font-semibold hover:bg-white/30 transition-colors"
              >
                Stop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapScreen;
