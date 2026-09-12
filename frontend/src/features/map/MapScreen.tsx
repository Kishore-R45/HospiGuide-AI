import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { MapContainer, GeoJSON, Marker, Tooltip, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigationStore, useUIStore } from '../../shared/store';
import { Navigation2, Maximize2, Minimize2, Search, X, LocateFixed, Building2, Route } from 'lucide-react';

// ─── GeoJSON Type Aliases ───
type GeoJSONData = GeoJSON.FeatureCollection;
type Coordinate = [number, number];
type GraphNode = { id: string; coordinate: Coordinate; neighbors: string[] };
type WalkwaySegment = { fromId: string; toId: string };
type RouteResult = {
  coordinates: Coordinate[];
  totalDistance: number;
  steps: {
    instruction: string;
    instructionKey: string;
    distance: number;
    landmark?: string;
    nodeId: number;
    floor: number;
  }[];
};

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
const RecenterControl: React.FC<{ trigger: number; bounds: L.LatLngBoundsExpression }> = ({ trigger, bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (trigger > 0) {
      map.flyToBounds(bounds, { padding: [30, 30], maxZoom: 19, duration: 0.6 });
    }
  }, [bounds, map, trigger]);
  return null;
};

const getFeatureCoordinate = (data: GeoJSONData): Coordinate | null => {
  const feature = data.features[0];
  if (!feature) return null;

  if (feature.geometry.type === 'Point') {
    const [lng, lat] = feature.geometry.coordinates;
    return [lat, lng];
  }

  if (feature.geometry.type === 'Polygon') {
    const ring = feature.geometry.coordinates[0];
    if (!ring?.length) return null;
    const totals = ring.reduce((sum, [lng, lat]) => ({
      lat: sum.lat + lat,
      lng: sum.lng + lng,
    }), { lat: 0, lng: 0 });
    return [totals.lat / ring.length, totals.lng / ring.length];
  }

  return null;
};

const coordinateDistance = (from: Coordinate, to: Coordinate) => {
  const latitudeScale = 111_320;
  const longitudeScale = latitudeScale * Math.cos((from[0] * Math.PI) / 180);
  const latitudeDistance = (to[0] - from[0]) * latitudeScale;
  const longitudeDistance = (to[1] - from[1]) * longitudeScale;
  return Math.sqrt(latitudeDistance ** 2 + longitudeDistance ** 2);
};

const WALKWAY_MERGE_DISTANCE_METERS = 2;

const getOrCreateWalkwayNode = (nodes: Map<string, GraphNode>, coordinate: Coordinate, nextId: () => string) => {
  let nearestId: string | null = null;
  let nearestDistance = WALKWAY_MERGE_DISTANCE_METERS;

  nodes.forEach((node) => {
    const distance = coordinateDistance(coordinate, node.coordinate);
    if (distance <= nearestDistance) {
      nearestDistance = distance;
      nearestId = node.id;
    }
  });

  if (nearestId) return nearestId;

  const id = nextId();
  nodes.set(id, { id, coordinate, neighbors: [] });
  return id;
};

const connectWalkwayNodes = (nodes: Map<string, GraphNode>, fromId: string, toId: string) => {
  if (fromId === toId) return;
  const from = nodes.get(fromId);
  const to = nodes.get(toId);
  if (!from || !to) return;
  if (!from.neighbors.includes(toId)) from.neighbors.push(toId);
  if (!to.neighbors.includes(fromId)) to.neighbors.push(fromId);
};

const projectPointToSegment = (point: Coordinate, from: Coordinate, to: Coordinate) => {
  const longitudeScale = 111_320 * Math.cos((point[0] * Math.PI) / 180);
  const latitudeScale = 111_320;
  const pointX = point[1] * longitudeScale;
  const pointY = point[0] * latitudeScale;
  const fromX = from[1] * longitudeScale;
  const fromY = from[0] * latitudeScale;
  const toX = to[1] * longitudeScale;
  const toY = to[0] * latitudeScale;
  const deltaX = toX - fromX;
  const deltaY = toY - fromY;
  const lengthSquared = deltaX ** 2 + deltaY ** 2;
  const projection = lengthSquared === 0
    ? 0
    : Math.max(0, Math.min(1, ((pointX - fromX) * deltaX + (pointY - fromY) * deltaY) / lengthSquared));
  const projected: Coordinate = [
    (fromY + projection * deltaY) / latitudeScale,
    (fromX + projection * deltaX) / longitudeScale,
  ];
  return { coordinate: projected, distance: coordinateDistance(point, projected), projection };
};

const attachEndpointToWalkway = (
  nodes: Map<string, GraphNode>,
  segments: WalkwaySegment[],
  coordinate: Coordinate,
  id: string,
) => {
  let nearestSegment: WalkwaySegment | null = null;
  let nearestProjection: Coordinate | null = null;
  let nearestDistance = Number.POSITIVE_INFINITY;

  segments.forEach((segment) => {
    const from = nodes.get(segment.fromId);
    const to = nodes.get(segment.toId);
    if (!from || !to) return;
    const projected = projectPointToSegment(coordinate, from.coordinate, to.coordinate);
    if (projected.distance < nearestDistance) {
      nearestDistance = projected.distance;
      nearestSegment = segment;
      nearestProjection = projected.coordinate;
    }
  });

  if (!nearestSegment || !nearestProjection) return null;
  const selectedSegment = nearestSegment as WalkwaySegment;
  nodes.set(id, { id, coordinate: nearestProjection, neighbors: [] });
  connectWalkwayNodes(nodes, id, selectedSegment.fromId);
  connectWalkwayNodes(nodes, id, selectedSegment.toId);
  return id;
};

const getBearing = (from: Coordinate, to: Coordinate) => {
  const latitude1 = (from[0] * Math.PI) / 180;
  const latitude2 = (to[0] * Math.PI) / 180;
  const longitudeDelta = ((to[1] - from[1]) * Math.PI) / 180;
  const y = Math.sin(longitudeDelta) * Math.cos(latitude2);
  const x = Math.cos(latitude1) * Math.sin(latitude2)
    - Math.sin(latitude1) * Math.cos(latitude2) * Math.cos(longitudeDelta);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
};

const getTurnInstruction = (from: Coordinate, pivot: Coordinate, to: Coordinate) => {
  const turn = ((getBearing(pivot, to) - getBearing(from, pivot) + 540) % 360) - 180;
  if (Math.abs(turn) < 25) return { instruction: 'Continue straight', instructionKey: 'straight' };
  if (turn > 0) return { instruction: 'Turn right', instructionKey: 'right' };
  return { instruction: 'Turn left', instructionKey: 'left' };
};

const findShortestPath = (
  walkwayData: GeoJSONData,
  start: Coordinate,
  destination: Coordinate,
): RouteResult | null => {
  const nodes = new Map<string, GraphNode>();
  const segments: WalkwaySegment[] = [];
  let vertexIndex = 0;
  const nextId = () => `walkway-${vertexIndex++}`;

  walkwayData.features.forEach((feature) => {
    if (feature.geometry.type !== 'LineString') return;
    const line = feature.geometry.coordinates;
    let previousId: string | null = null;
    line.forEach(([lng, lat]) => {
      const currentId = getOrCreateWalkwayNode(nodes, [lat, lng], nextId);
      if (previousId) {
        connectWalkwayNodes(nodes, previousId, currentId);
        segments.push({ fromId: previousId, toId: currentId });
      }
      previousId = currentId;
    });
  });

  const startId = attachEndpointToWalkway(nodes, segments, start, 'route-start');
  const destinationId = attachEndpointToWalkway(nodes, segments, destination, 'route-destination');
  if (!startId || !destinationId) return null;

  const distances = new Map<string, number>([[startId, 0]]);
  const previous = new Map<string, string>();
  const pending = new Set(nodes.keys());

  while (pending.size > 0) {
    let currentId: string | null = null;
    let currentDistance = Number.POSITIVE_INFINITY;
    pending.forEach((id) => {
      const distance = distances.get(id) ?? Number.POSITIVE_INFINITY;
      if (distance < currentDistance) {
        currentId = id;
        currentDistance = distance;
      }
    });

    if (!currentId || currentId === destinationId) break;
    pending.delete(currentId);

    const currentNodeId = currentId;
    const current = nodes.get(currentNodeId);
    if (!current) continue;
    current.neighbors.forEach((neighborId) => {
      if (!pending.has(neighborId)) return;
      const neighbor = nodes.get(neighborId);
      if (!neighbor) return;
      const candidateDistance = currentDistance + coordinateDistance(current.coordinate, neighbor.coordinate);
      if (candidateDistance < (distances.get(neighborId) ?? Number.POSITIVE_INFINITY)) {
        distances.set(neighborId, candidateDistance);
        previous.set(neighborId, currentNodeId);
      }
    });
  }

  if (startId !== destinationId && !previous.has(destinationId)) return null;

  const path: Coordinate[] = [];
  let currentId: string | undefined = destinationId;
  while (currentId) {
    const node = nodes.get(currentId);
    if (node) path.unshift(node.coordinate);
    currentId = previous.get(currentId);
  }
  if (path.length < 2) return null;

  const segmentDistances = path.slice(1).map((coordinate, index) => (
    coordinateDistance(path[index], coordinate)
  ));
  const totalDistance = segmentDistances.reduce((total, distance) => total + distance, 0);
  const steps: RouteResult['steps'] = [];
  let stepStartIndex = 0;

  for (let index = 1; index < path.length - 1; index += 1) {
    const turn = getTurnInstruction(path[index - 1], path[index], path[index + 1]);
    if (turn.instructionKey === 'straight') continue;
    const distance = segmentDistances.slice(stepStartIndex, index + 1).reduce((total, value) => total + value, 0);
    steps.push({
      ...turn,
      distance,
      nodeId: index,
      floor: 1,
    });
    stepStartIndex = index + 1;
  }

  const finalDistance = segmentDistances.slice(stepStartIndex).reduce((total, value) => total + value, 0);
  steps.unshift({
    instruction: 'Follow the walkway',
    instructionKey: 'straight',
    distance: segmentDistances.slice(0, 1).reduce((total, value) => total + value, 0),
    nodeId: 0,
    floor: 1,
  });
  steps.push({
    instruction: 'You have arrived at your destination',
    instructionKey: 'destination',
    distance: finalDistance,
    nodeId: path.length - 1,
    floor: 1,
  });

  return { coordinates: path, totalDistance, steps };
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
  const {
    isNavigating,
    destinationName,
    routeCoordinates,
    currentStepIndex,
    steps,
    stopNavigation,
    startNavigation,
  } = useNavigationStore();
  const { isFullscreen, setFullscreen } = useUIStore();

  // Map data state
  const [buildings, setBuildings] = useState<{ name: string; data: GeoJSONData }[]>([]);
  const [walkways, setWalkways] = useState<GeoJSONData | null>(null);
  const [points, setPoints] = useState<{ type: 'Entrance' | 'Exit'; coords: Coordinate }[]>([]);
  const [mapBounds, setMapBounds] = useState<L.LatLngBoundsExpression>(CAMPUS_BOUNDS);
  const [loading, setLoading] = useState(true);

  // UI state
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [recenterTrigger, setRecenterTrigger] = useState(0);
  const [fromAddress, setFromAddress] = useState('Entrance');
  const [toAddress, setToAddress] = useState('');
  const [routeError, setRouteError] = useState('');
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
              return { type: name as 'Entrance' | 'Exit', coords: [lat, lng] as Coordinate };
            }
          }
          return null;
        })
      );

      if (!cancelled) {
        const loadedBuildings = buildingResults.filter((b): b is { name: string; data: GeoJSONData } => b !== null);
        const buildingBounds = L.latLngBounds([]);
        loadedBuildings.forEach((building) => {
          buildingBounds.extend(L.geoJSON(building.data).getBounds());
        });
        if (buildingBounds.isValid()) setMapBounds(buildingBounds);
        setBuildings(loadedBuildings);
        setWalkways(walkwayData);
        setPoints(pointResults.filter((p): p is { type: 'Entrance' | 'Exit'; coords: Coordinate } => p !== null));
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

  const locationOptions = useMemo(() => ['Entrance', 'Exit', ...buildings.map((building) => building.name)], [buildings]);

  const resolveLocation = useCallback((address: string): Coordinate | null => {
    const normalizedAddress = address.trim().toLowerCase();
    if (!normalizedAddress) return null;

    const point = points.find((item) => item.type.toLowerCase() === normalizedAddress);
    if (point) return point.coords;

    const building = buildings.find((item) => {
      const normalizedName = item.name.toLowerCase();
      return normalizedAddress.includes(normalizedName) || normalizedName.includes(normalizedAddress);
    });
    return building ? getFeatureCoordinate(building.data) : null;
  }, [buildings, points]);

  const handleConstructRoute = useCallback(() => {
    const start = resolveLocation(fromAddress);
    const destination = resolveLocation(toAddress);
    if (!start || !destination) {
      setRouteError('Select or enter a recognized entrance, exit, or building name. Department and room details must include a recognized building.');
      return;
    }

    if (!walkways) {
      setRouteError('Walkway data is still loading. Please try again in a moment.');
      return;
    }

    const route = findShortestPath(walkways, start, destination);
    if (!route) {
      setRouteError('No connected walkway route exists between these locations. Choose endpoints connected to the mapped walkways.');
      return;
    }

    startNavigation({
      destinationNodeId: 0,
      destinationName: toAddress.trim(),
      departmentName: toAddress.trim(),
      roomNumber: '',
      steps: route.steps,
      routeCoordinates: route.coordinates,
      totalDistance: route.totalDistance,
      eta: Math.ceil(route.totalDistance / 1.2 / 60),
    });
    setRouteError('');
  }, [fromAddress, resolveLocation, startNavigation, toAddress, walkways]);

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
          coordinates: routeCoordinates.map(([lat, lng]) => [lng, lat]),
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

      {/* ─── Route Builder ─── */}
      <div className="shrink-0 bg-surface-0 border-b border-surface-200 p-3 z-[1001]">
        <div className="flex flex-col gap-2 md:flex-row md:items-end">
          <label className="flex-1 text-xs font-semibold text-surface-600">
            From
            <input
              value={fromAddress}
              onChange={(event) => setFromAddress(event.target.value)}
              list="map-location-options"
              placeholder="Entrance, building, department, or room"
              className="mt-1 w-full rounded-lg border border-surface-200 bg-surface-50 px-3 py-2.5 text-sm font-normal text-surface-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </label>
          <label className="flex-1 text-xs font-semibold text-surface-600">
            To
            <input
              value={toAddress}
              onChange={(event) => setToAddress(event.target.value)}
              list="map-location-options"
              placeholder="Building, department, or room"
              className="mt-1 w-full rounded-lg border border-surface-200 bg-surface-50 px-3 py-2.5 text-sm font-normal text-surface-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </label>
          <button
            type="button"
            onClick={handleConstructRoute}
            disabled={!toAddress.trim()}
            className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Route width={17} height={17} />
            Route
          </button>
        </div>
        <datalist id="map-location-options">
          {locationOptions.map((option) => <option key={option} value={option} />)}
        </datalist>
        {routeError && <p className="mt-2 text-xs font-medium text-error">{routeError}</p>}
      </div>

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
          <MapFitBounds bounds={mapBounds} />
          <RecenterControl trigger={recenterTrigger} bounds={mapBounds} />

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
                {steps.length > 1 && (
                  <div className="mt-3 max-h-28 overflow-y-auto border-t border-white/20 pt-2">
                    {steps.map((step, index) => (
                      <div
                        key={`${step.nodeId}-${step.instructionKey}-${index}`}
                        className={`flex items-center justify-between gap-3 py-1 text-xs ${index === currentStepIndex ? 'font-bold text-white' : 'text-white/70'}`}
                      >
                        <span>{index + 1}. {step.instruction}</span>
                        <span className="shrink-0">{Math.round(step.distance)} m</span>
                      </div>
                    ))}
                  </div>
                )}
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
                  {steps[currentStepIndex] && (
                    <p className="mt-1 text-sm font-semibold text-white">
                      {steps[currentStepIndex].instruction}
                    </p>
                  )}
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
