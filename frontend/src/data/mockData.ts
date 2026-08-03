/* ============================================
   HospiGuide AI — Mock Data
   Realistic data per spec §6, §15
   College→Hospital mapping per §1
   ============================================ */

/* ---------- Category Enum ---------- */
export type LocationCategory =
  | 'ENTRANCE'
  | 'REGISTRATION'
  | 'PHARMACY'
  | 'LAB'
  | 'DEPARTMENT'
  | 'LIFT'
  | 'STAIRCASE'
  | 'WASHROOM'
  | 'CAFETERIA'
  | 'OPD'
  | 'WARD'
  | 'CORRIDOR'
  | 'EMERGENCY';

export type EdgeType = 'CORRIDOR' | 'LIFT' | 'STAIRCASE';

/* ---------- Location (Node) ---------- */
export interface Location {
  id: number;
  name: string;
  category: LocationCategory;
  floor: number;
  block: string;
  x: number; // pixel coordinates on floor plan image
  y: number;
  landmark?: string;
}

export const locations: Location[] = [
  // Floor 1
  { id: 1, name: 'Main Entrance', category: 'ENTRANCE', floor: 1, block: 'A', x: 400, y: 580, landmark: 'Main Gate' },
  { id: 2, name: 'Registration Counter', category: 'REGISTRATION', floor: 1, block: 'A', x: 400, y: 480, landmark: 'Reception Desk' },
  { id: 3, name: 'Corridor Junction A', category: 'CORRIDOR', floor: 1, block: 'A', x: 400, y: 380 },
  { id: 4, name: 'Pharmacy', category: 'PHARMACY', floor: 1, block: 'A', x: 250, y: 380, landmark: 'Pharmacy Counter' },
  { id: 5, name: 'Emergency Department', category: 'EMERGENCY', floor: 1, block: 'A', x: 550, y: 380, landmark: 'Red Cross Sign' },
  { id: 6, name: 'Corridor Junction B', category: 'CORRIDOR', floor: 1, block: 'A', x: 400, y: 280 },
  { id: 7, name: 'Diagnostic Lab', category: 'LAB', floor: 1, block: 'A', x: 250, y: 280, landmark: 'Lab Window' },
  { id: 8, name: 'General OPD', category: 'OPD', floor: 1, block: 'A', x: 550, y: 280, landmark: 'OPD Waiting Area' },
  { id: 9, name: 'Lift - Floor 1', category: 'LIFT', floor: 1, block: 'A', x: 400, y: 200, landmark: 'Elevator' },
  { id: 10, name: 'Staircase - Floor 1', category: 'STAIRCASE', floor: 1, block: 'A', x: 300, y: 200, landmark: 'Staircase' },
  { id: 11, name: 'Cafeteria', category: 'CAFETERIA', floor: 1, block: 'A', x: 550, y: 200, landmark: 'Food Counter' },
  { id: 12, name: 'Washroom - F1', category: 'WASHROOM', floor: 1, block: 'A', x: 150, y: 380 },

  // Floor 2
  { id: 13, name: 'Lift - Floor 2', category: 'LIFT', floor: 2, block: 'A', x: 400, y: 200, landmark: 'Elevator' },
  { id: 14, name: 'Staircase - Floor 2', category: 'STAIRCASE', floor: 2, block: 'A', x: 300, y: 200, landmark: 'Staircase' },
  { id: 15, name: 'Corridor Junction C', category: 'CORRIDOR', floor: 2, block: 'A', x: 400, y: 280 },
  { id: 16, name: 'Ophthalmology', category: 'DEPARTMENT', floor: 2, block: 'A', x: 250, y: 280, landmark: 'Eye Clinic Sign' },
  { id: 17, name: 'Cardiology', category: 'DEPARTMENT', floor: 2, block: 'A', x: 550, y: 280, landmark: 'Heart Ward Sign' },
  { id: 18, name: 'Corridor Junction D', category: 'CORRIDOR', floor: 2, block: 'A', x: 400, y: 380 },
  { id: 19, name: 'Orthopedics', category: 'DEPARTMENT', floor: 2, block: 'A', x: 250, y: 380, landmark: 'Ortho Clinic' },
  { id: 20, name: 'Dermatology', category: 'DEPARTMENT', floor: 2, block: 'A', x: 550, y: 380, landmark: 'Skin Clinic' },
  { id: 21, name: 'Corridor Junction E', category: 'CORRIDOR', floor: 2, block: 'A', x: 400, y: 480 },
  { id: 22, name: 'ENT Department', category: 'DEPARTMENT', floor: 2, block: 'A', x: 250, y: 480, landmark: 'ENT Sign' },
  { id: 23, name: 'Neurology', category: 'DEPARTMENT', floor: 2, block: 'A', x: 550, y: 480, landmark: 'Neuro Ward' },
  { id: 24, name: 'Washroom - F2', category: 'WASHROOM', floor: 2, block: 'A', x: 150, y: 280 },
];

/* ---------- Connection (Edge) ---------- */
export interface Connection {
  id: number;
  fromNode: number;
  toNode: number;
  distanceMeters: number;
  edgeType: EdgeType;
}

export const connections: Connection[] = [
  // Floor 1 graph
  { id: 1, fromNode: 1, toNode: 2, distanceMeters: 15, edgeType: 'CORRIDOR' },
  { id: 2, fromNode: 2, toNode: 3, distanceMeters: 15, edgeType: 'CORRIDOR' },
  { id: 3, fromNode: 3, toNode: 4, distanceMeters: 20, edgeType: 'CORRIDOR' },
  { id: 4, fromNode: 3, toNode: 5, distanceMeters: 20, edgeType: 'CORRIDOR' },
  { id: 5, fromNode: 3, toNode: 6, distanceMeters: 15, edgeType: 'CORRIDOR' },
  { id: 6, fromNode: 6, toNode: 7, distanceMeters: 20, edgeType: 'CORRIDOR' },
  { id: 7, fromNode: 6, toNode: 8, distanceMeters: 20, edgeType: 'CORRIDOR' },
  { id: 8, fromNode: 6, toNode: 9, distanceMeters: 12, edgeType: 'CORRIDOR' },
  { id: 9, fromNode: 6, toNode: 10, distanceMeters: 15, edgeType: 'CORRIDOR' },
  { id: 10, fromNode: 6, toNode: 11, distanceMeters: 22, edgeType: 'CORRIDOR' },
  { id: 11, fromNode: 4, toNode: 12, distanceMeters: 12, edgeType: 'CORRIDOR' },

  // Vertical connections (Floor 1 → Floor 2)
  { id: 12, fromNode: 9, toNode: 13, distanceMeters: 5, edgeType: 'LIFT' },
  { id: 13, fromNode: 10, toNode: 14, distanceMeters: 8, edgeType: 'STAIRCASE' },

  // Floor 2 graph
  { id: 14, fromNode: 13, toNode: 15, distanceMeters: 12, edgeType: 'CORRIDOR' },
  { id: 15, fromNode: 14, toNode: 15, distanceMeters: 15, edgeType: 'CORRIDOR' },
  { id: 16, fromNode: 15, toNode: 16, distanceMeters: 20, edgeType: 'CORRIDOR' },
  { id: 17, fromNode: 15, toNode: 17, distanceMeters: 20, edgeType: 'CORRIDOR' },
  { id: 18, fromNode: 15, toNode: 18, distanceMeters: 15, edgeType: 'CORRIDOR' },
  { id: 19, fromNode: 18, toNode: 19, distanceMeters: 20, edgeType: 'CORRIDOR' },
  { id: 20, fromNode: 18, toNode: 20, distanceMeters: 20, edgeType: 'CORRIDOR' },
  { id: 21, fromNode: 18, toNode: 21, distanceMeters: 15, edgeType: 'CORRIDOR' },
  { id: 22, fromNode: 21, toNode: 22, distanceMeters: 20, edgeType: 'CORRIDOR' },
  { id: 23, fromNode: 21, toNode: 23, distanceMeters: 20, edgeType: 'CORRIDOR' },
  { id: 24, fromNode: 15, toNode: 24, distanceMeters: 12, edgeType: 'CORRIDOR' },
];

/* ---------- Department ---------- */
export interface Department {
  id: number;
  name: string;
  locationId: number;
  icon: string; // Lucide icon name
  color: string;
}

export const departments: Department[] = [
  { id: 1, name: 'Registration', locationId: 2, icon: 'clipboard-list', color: '#3b82f6' },
  { id: 2, name: 'Pharmacy', locationId: 4, icon: 'pill', color: '#22c55e' },
  { id: 3, name: 'Emergency', locationId: 5, icon: 'siren', color: '#ef4444' },
  { id: 4, name: 'Diagnostic Lab', locationId: 7, icon: 'microscope', color: '#8b5cf6' },
  { id: 5, name: 'General OPD', locationId: 8, icon: 'stethoscope', color: '#0d9488' },
  { id: 6, name: 'Ophthalmology', locationId: 16, icon: 'eye', color: '#06b6d4' },
  { id: 7, name: 'Cardiology', locationId: 17, icon: 'heart-pulse', color: '#f43f5e' },
  { id: 8, name: 'Orthopedics', locationId: 19, icon: 'bone', color: '#f97316' },
  { id: 9, name: 'Dermatology', locationId: 20, icon: 'hand', color: '#ec4899' },
  { id: 10, name: 'ENT', locationId: 22, icon: 'ear', color: '#a855f7' },
  { id: 11, name: 'Neurology', locationId: 23, icon: 'brain', color: '#6366f1' },
];

/* ---------- Doctor ---------- */
export interface Doctor {
  id: number;
  name: string;
  departmentId: number;
  roomNumber: string;
  availability: string;
  isAvailableNow: boolean;
  isSimulated: boolean;
}

export const doctors: Doctor[] = [
  // Registration
  { id: 1, name: 'Staff Counter A', departmentId: 1, roomNumber: 'G-01', availability: '8:00 AM - 4:00 PM', isAvailableNow: true, isSimulated: true },
  // Pharmacy
  { id: 2, name: 'Pharmacist On Duty', departmentId: 2, roomNumber: 'G-04', availability: '8:00 AM - 8:00 PM', isAvailableNow: true, isSimulated: true },
  // Emergency
  { id: 3, name: 'Dr. Priya Krishnan', departmentId: 3, roomNumber: 'G-05', availability: '24/7', isAvailableNow: true, isSimulated: true },
  { id: 4, name: 'Dr. Arun Kumar', departmentId: 3, roomNumber: 'G-05', availability: '24/7', isAvailableNow: true, isSimulated: true },
  // Diagnostic Lab
  { id: 5, name: 'Dr. Meena Lakshmi', departmentId: 4, roomNumber: 'G-07', availability: '9:00 AM - 5:00 PM', isAvailableNow: true, isSimulated: true },
  // General OPD
  { id: 6, name: 'Dr. Rajesh Venkat', departmentId: 5, roomNumber: 'G-08', availability: '9:00 AM - 1:00 PM', isAvailableNow: true, isSimulated: true },
  { id: 7, name: 'Dr. Santhiya Devi', departmentId: 5, roomNumber: 'G-09', availability: '2:00 PM - 5:00 PM', isAvailableNow: false, isSimulated: true },
  // Ophthalmology
  { id: 8, name: 'Dr. Karthik Raman', departmentId: 6, roomNumber: '201', availability: '9:00 AM - 1:00 PM', isAvailableNow: true, isSimulated: true },
  { id: 9, name: 'Dr. Anitha Suresh', departmentId: 6, roomNumber: '202', availability: '2:00 PM - 5:00 PM', isAvailableNow: false, isSimulated: true },
  // Cardiology
  { id: 10, name: 'Dr. Vikram Subramani', departmentId: 7, roomNumber: '205', availability: '10:00 AM - 2:00 PM', isAvailableNow: true, isSimulated: true },
  { id: 11, name: 'Dr. Lakshmi Narayanan', departmentId: 7, roomNumber: '206', availability: '2:00 PM - 6:00 PM', isAvailableNow: false, isSimulated: true },
  // Orthopedics
  { id: 12, name: 'Dr. Senthil Murugan', departmentId: 8, roomNumber: '210', availability: '9:00 AM - 12:00 PM', isAvailableNow: true, isSimulated: true },
  // Dermatology
  { id: 13, name: 'Dr. Deepa Raghavan', departmentId: 9, roomNumber: '215', availability: '10:00 AM - 3:00 PM', isAvailableNow: true, isSimulated: true },
  // ENT
  { id: 14, name: 'Dr. Balamurugan S', departmentId: 10, roomNumber: '220', availability: '9:00 AM - 1:00 PM', isAvailableNow: true, isSimulated: true },
  // Neurology
  { id: 15, name: 'Dr. Harini Prakash', departmentId: 11, roomNumber: '225', availability: '10:00 AM - 2:00 PM', isAvailableNow: true, isSimulated: true },
  { id: 16, name: 'Dr. Mohan Raj', departmentId: 11, roomNumber: '226', availability: '3:00 PM - 6:00 PM', isAvailableNow: false, isSimulated: true },
];

/* ---------- Symptom → Department Mapping (for AI mock) ---------- */
export interface SymptomMapping {
  keywords: string[];
  departmentId: number;
  confidence: number;
  urgency: 'routine' | 'prompt' | 'emergency';
}

export const symptomMappings: SymptomMapping[] = [
  // Emergency
  { keywords: ['chest pain', 'breathing difficulty', 'severe bleeding', 'unconscious', 'heart attack', 'stroke', 'accident'], departmentId: 3, confidence: 0.98, urgency: 'emergency' },
  // Ophthalmology
  { keywords: ['eye pain', 'blurred vision', 'eye infection', 'vision loss', 'red eye', 'eye swelling', 'cannot see'], departmentId: 6, confidence: 0.92, urgency: 'routine' },
  // Cardiology
  { keywords: ['heart palpitation', 'high blood pressure', 'chest tightness', 'irregular heartbeat', 'bp', 'blood pressure'], departmentId: 7, confidence: 0.88, urgency: 'prompt' },
  // Orthopedics
  { keywords: ['bone pain', 'fracture', 'joint pain', 'knee pain', 'back pain', 'sprain', 'broken bone', 'shoulder pain'], departmentId: 8, confidence: 0.90, urgency: 'routine' },
  // Dermatology
  { keywords: ['skin rash', 'itching', 'acne', 'eczema', 'skin infection', 'allergy skin', 'pimples', 'skin burn'], departmentId: 9, confidence: 0.91, urgency: 'routine' },
  // ENT
  { keywords: ['ear pain', 'sore throat', 'hearing loss', 'nose bleed', 'tonsils', 'sinus', 'throat pain', 'ear infection'], departmentId: 10, confidence: 0.89, urgency: 'routine' },
  // Neurology
  { keywords: ['headache', 'migraine', 'dizziness', 'seizure', 'numbness', 'memory loss', 'nerve pain', 'tremor'], departmentId: 11, confidence: 0.87, urgency: 'routine' },
  // General OPD (fallback)
  { keywords: ['fever', 'cold', 'cough', 'vomiting', 'stomach pain', 'diarrhea', 'weakness', 'body pain', 'general', 'not feeling well', 'unwell'], departmentId: 5, confidence: 0.85, urgency: 'routine' },
  // Diagnostic Lab
  { keywords: ['blood test', 'urine test', 'x-ray', 'scan', 'lab test', 'check up', 'test report'], departmentId: 4, confidence: 0.93, urgency: 'routine' },
];

/* ---------- BLE Beacon ---------- */
export interface BLEBeacon {
  id: number;
  uuid: string;
  major: number;
  minor: number;
  locationId: number;
  txPowerAt1m: number;
  batteryInstalledDate: string;
}

export const bleBeacons: BLEBeacon[] = [
  { id: 1, uuid: 'f7826da6-4fa2-4e98-8024-bc5b71e0893e', major: 1, minor: 1, locationId: 1, txPowerAt1m: -59, batteryInstalledDate: '2025-01-15' },
  { id: 2, uuid: 'f7826da6-4fa2-4e98-8024-bc5b71e0893e', major: 1, minor: 3, locationId: 3, txPowerAt1m: -59, batteryInstalledDate: '2025-01-15' },
  { id: 3, uuid: 'f7826da6-4fa2-4e98-8024-bc5b71e0893e', major: 1, minor: 6, locationId: 6, txPowerAt1m: -59, batteryInstalledDate: '2025-01-15' },
  { id: 4, uuid: 'f7826da6-4fa2-4e98-8024-bc5b71e0893e', major: 1, minor: 9, locationId: 9, txPowerAt1m: -59, batteryInstalledDate: '2025-01-15' },
  { id: 5, uuid: 'f7826da6-4fa2-4e98-8024-bc5b71e0893e', major: 2, minor: 13, locationId: 13, txPowerAt1m: -59, batteryInstalledDate: '2025-01-15' },
  { id: 6, uuid: 'f7826da6-4fa2-4e98-8024-bc5b71e0893e', major: 2, minor: 15, locationId: 15, txPowerAt1m: -59, batteryInstalledDate: '2025-01-15' },
];

/* ---------- Floor Plan Metadata ---------- */
export interface FloorPlan {
  floorNumber: number;
  name: string;
  imageUrl: string;
  width: number;
  height: number;
  pixelScale: number; // 1 pixel = N centimeters
}

export const floorPlans: FloorPlan[] = [
  { floorNumber: 1, name: 'Ground Floor', imageUrl: '/maps/floor-1.svg', width: 700, height: 650, pixelScale: 5 },
  { floorNumber: 2, name: 'First Floor', imageUrl: '/maps/floor-2.svg', width: 700, height: 650, pixelScale: 5 },
];

/* ---------- Mock Navigation Route ---------- */
export function getMockRoute(fromId: number, toId: number) {
  const from = locations.find(l => l.id === fromId);
  const to = locations.find(l => l.id === toId);
  if (!from || !to) return null;

  // Simple pathfinding mock - return realistic route data
  const routeMap: Record<string, { path: number[]; distance: number; eta: number }> = {
    '1-16': { path: [1, 2, 3, 6, 9, 13, 15, 16], distance: 94, eta: 3 },
    '1-17': { path: [1, 2, 3, 6, 9, 13, 15, 17], distance: 94, eta: 3 },
    '1-4': { path: [1, 2, 3, 4], distance: 50, eta: 2 },
    '1-5': { path: [1, 2, 3, 5], distance: 50, eta: 2 },
    '1-7': { path: [1, 2, 3, 6, 7], distance: 70, eta: 2 },
    '1-8': { path: [1, 2, 3, 6, 8], distance: 70, eta: 2 },
    '1-19': { path: [1, 2, 3, 6, 9, 13, 15, 18, 19], distance: 109, eta: 4 },
    '1-20': { path: [1, 2, 3, 6, 9, 13, 15, 18, 20], distance: 109, eta: 4 },
    '1-22': { path: [1, 2, 3, 6, 9, 13, 15, 18, 21, 22], distance: 129, eta: 4 },
    '1-23': { path: [1, 2, 3, 6, 9, 13, 15, 18, 21, 23], distance: 129, eta: 4 },
    '1-2': { path: [1, 2], distance: 15, eta: 1 },
  };

  const key = `${fromId}-${toId}`;
  const route = routeMap[key];

  if (!route) {
    // Fallback: generate a simple direct route
    return {
      path: [fromId, toId],
      coordinates: [[from.x, from.y], [to.x, to.y]] as [number, number][],
      distance: Math.sqrt((to.x - from.x) ** 2 + (to.y - from.y) ** 2) * 0.05, // rough pixel to meter
      eta: 2,
      steps: [
        {
          instruction: `Walk towards ${to.name}`,
          instructionKey: 'navigation.instructions.straight',
          distance: 30,
          landmark: to.landmark,
          nodeId: toId,
          floor: to.floor,
        },
      ],
    };
  }

  const pathLocations = route.path.map(id => locations.find(l => l.id === id)!);
  const coordinates: [number, number][] = pathLocations.map(l => [l.x, l.y]);

  // Generate turn-by-turn steps
  const steps: Array<{
    instruction: string;
    instructionKey: string;
    distance: number;
    landmark?: string;
    nodeId: number;
    floor: number;
  }> = [];

  for (let i = 1; i < pathLocations.length; i++) {
    const prev = pathLocations[i - 1];
    const curr = pathLocations[i];
    const next = i < pathLocations.length - 1 ? pathLocations[i + 1] : null;

    // Determine instruction
    let instruction = '';
    let instructionKey = 'navigation.instructions.straight';

    if (curr.category === 'LIFT') {
      instruction = `Take the elevator to Floor ${curr.floor === 1 ? '2' : '1'}`;
      instructionKey = 'navigation.instructions.elevator';
    } else if (curr.category === 'STAIRCASE') {
      instruction = `Take the staircase`;
      instructionKey = curr.floor > prev.floor ? 'navigation.instructions.upstairs' : 'navigation.instructions.downstairs';
    } else if (next) {
      // Calculate turn direction
      const inAngle = Math.atan2(curr.y - prev.y, curr.x - prev.x);
      const outAngle = Math.atan2(next.y - curr.y, next.x - curr.x);
      let turnAngle = ((outAngle - inAngle) * 180) / Math.PI;
      if (turnAngle > 180) turnAngle -= 360;
      if (turnAngle < -180) turnAngle += 360;

      if (Math.abs(turnAngle) < 20) {
        instruction = `Continue straight${curr.landmark ? ` past ${curr.landmark}` : ''}`;
        instructionKey = 'navigation.instructions.straight';
      } else if (turnAngle > 0) {
        instruction = `Turn right${curr.landmark ? ` at ${curr.landmark}` : ''}`;
        instructionKey = 'navigation.instructions.right';
      } else {
        instruction = `Turn left${curr.landmark ? ` at ${curr.landmark}` : ''}`;
        instructionKey = 'navigation.instructions.left';
      }
    } else {
      instruction = `Your destination ${curr.name} is ahead`;
      instructionKey = 'navigation.instructions.destination';
    }

    const dist = Math.sqrt((curr.x - prev.x) ** 2 + (curr.y - prev.y) ** 2) * 0.05;

    steps.push({
      instruction,
      instructionKey,
      distance: Math.round(dist * 10) / 10,
      landmark: curr.landmark,
      nodeId: curr.id,
      floor: curr.floor,
    });
  }

  return {
    path: route.path,
    coordinates,
    distance: route.distance,
    eta: route.eta,
    steps,
  };
}

/* ---------- Mock AI Response ---------- */
export function getMockAIResponse(text: string): {
  department: string;
  departmentId: number;
  confidence: number;
  urgency: 'routine' | 'prompt' | 'emergency';
  doctorName: string;
  roomNumber: string;
  walkTime: number;
  locationId: number;
  clarifyingQuestion?: string;
} | null {
  const lower = text.toLowerCase();

  // Direct department requests
  const directMappings: Record<string, number> = {
    'registration': 1, 'register': 1,
    'pharmacy': 2, 'medicine': 2, 'drug': 2,
    'emergency': 3, 'urgent': 3,
    'lab': 4, 'test': 4, 'blood test': 4,
    'opd': 5, 'general': 5,
  };

  for (const [keyword, deptId] of Object.entries(directMappings)) {
    if (lower.includes(keyword)) {
      const dept = departments.find(d => d.id === deptId)!;
      const doctor = doctors.find(d => d.departmentId === deptId && d.isAvailableNow)!;
      return {
        department: dept.name,
        departmentId: dept.id,
        confidence: 0.95,
        urgency: deptId === 3 ? 'emergency' : 'routine',
        doctorName: doctor?.name || 'Staff on duty',
        roomNumber: doctor?.roomNumber || 'See reception',
        walkTime: 2,
        locationId: dept.locationId,
      };
    }
  }

  // Symptom-based matching
  for (const mapping of symptomMappings) {
    const matched = mapping.keywords.some(kw => lower.includes(kw));
    if (matched) {
      const dept = departments.find(d => d.id === mapping.departmentId)!;
      const doctor = doctors.find(d => d.departmentId === mapping.departmentId && d.isAvailableNow);
      return {
        department: dept.name,
        departmentId: dept.id,
        confidence: mapping.confidence,
        urgency: mapping.urgency,
        doctorName: doctor?.name || 'Staff on duty',
        roomNumber: doctor?.roomNumber || 'See reception',
        walkTime: dept.locationId > 12 ? 4 : 2,
        locationId: dept.locationId,
      };
    }
  }

  // No match — return clarifying question
  return null;
}
