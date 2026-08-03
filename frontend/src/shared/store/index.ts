import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Language } from '../i18n';
import { getTranslation } from '../i18n';

/* ============================================
   Language Store
   ============================================ */
interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'en',
      setLanguage: (lang) => set({ language: lang }),
      t: (key, params) => getTranslation(get().language, key, params),
    }),
    { name: 'hospiguide-language' }
  )
);

/* ============================================
   Session Store
   ============================================ */
interface SessionState {
  sessionId: string;
  entranceId: string | null;
  onboardingComplete: boolean;
  permissionsGranted: {
    bluetooth: boolean;
    motion: boolean;
    microphone: boolean;
  };
  setSessionId: (id: string) => void;
  setEntranceId: (id: string) => void;
  setOnboardingComplete: (complete: boolean) => void;
  setPermission: (type: 'bluetooth' | 'motion' | 'microphone', granted: boolean) => void;
  reset: () => void;
}

const generateSessionId = () =>
  'session-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);

export const useSessionStore = create<SessionState>()((set) => ({
  sessionId: generateSessionId(),
  entranceId: null,
  onboardingComplete: false,
  permissionsGranted: {
    bluetooth: false,
    motion: false,
    microphone: false,
  },
  setSessionId: (id) => set({ sessionId: id }),
  setEntranceId: (id) => set({ entranceId: id }),
  setOnboardingComplete: (complete) => set({ onboardingComplete: complete }),
  setPermission: (type, granted) =>
    set((state) => ({
      permissionsGranted: {
        ...state.permissionsGranted,
        [type]: granted,
      },
    })),
  reset: () =>
    set({
      sessionId: generateSessionId(),
      entranceId: null,
      onboardingComplete: false,
      permissionsGranted: { bluetooth: false, motion: false, microphone: false },
    }),
}));

/* ============================================
   Navigation Store
   ============================================ */
export interface NavigationStep {
  instruction: string;
  instructionKey: string;
  distance: number;
  landmark?: string;
  nodeId: number;
  floor: number;
}

interface NavigationState {
  isNavigating: boolean;
  destinationNodeId: number | null;
  destinationName: string;
  departmentName: string;
  roomNumber: string;
  currentStepIndex: number;
  steps: NavigationStep[];
  routeCoordinates: [number, number][];
  totalDistance: number;
  remainingDistance: number;
  eta: number; // minutes
  isRecalculating: boolean;
  voiceEnabled: boolean;
  avoidStairs: boolean;
  startNavigation: (params: {
    destinationNodeId: number;
    destinationName: string;
    departmentName: string;
    roomNumber: string;
    steps: NavigationStep[];
    routeCoordinates: [number, number][];
    totalDistance: number;
    eta: number;
  }) => void;
  advanceStep: () => void;
  setRecalculating: (val: boolean) => void;
  setRemainingDistance: (dist: number) => void;
  toggleVoice: () => void;
  setAvoidStairs: (val: boolean) => void;
  stopNavigation: () => void;
}

export const useNavigationStore = create<NavigationState>()(
  persist(
    (set) => ({
      isNavigating: false,
      destinationNodeId: null,
      destinationName: '',
      departmentName: '',
      roomNumber: '',
      currentStepIndex: 0,
      steps: [],
      routeCoordinates: [],
      totalDistance: 0,
      remainingDistance: 0,
      eta: 0,
      isRecalculating: false,
      voiceEnabled: true,
      avoidStairs: false,
      startNavigation: (params) =>
        set({
          isNavigating: true,
          ...params,
          remainingDistance: params.totalDistance,
          currentStepIndex: 0,
          isRecalculating: false,
        }),
      advanceStep: () =>
        set((state) => ({
          currentStepIndex: Math.min(state.currentStepIndex + 1, state.steps.length - 1),
        })),
      setRecalculating: (val) => set({ isRecalculating: val }),
      setRemainingDistance: (dist) => set({ remainingDistance: dist }),
      toggleVoice: () => set((state) => ({ voiceEnabled: !state.voiceEnabled })),
      setAvoidStairs: (val) => set({ avoidStairs: val }),
      stopNavigation: () =>
        set({
          isNavigating: false,
          destinationNodeId: null,
          destinationName: '',
          departmentName: '',
          roomNumber: '',
          currentStepIndex: 0,
          steps: [],
          routeCoordinates: [],
          totalDistance: 0,
          remainingDistance: 0,
          eta: 0,
          isRecalculating: false,
        }),
    }),
    {
      name: 'hospiguide-navigation',
      partialize: (state) => ({
        voiceEnabled: state.voiceEnabled,
        avoidStairs: state.avoidStairs,
      }),
    }
  )
);

/* ============================================
   Map / Position Store
   ============================================ */
interface MapState {
  currentFloor: number;
  userPosition: { x: number; y: number } | null;
  userHeading: number; // degrees
  positionConfidence: number;
  setCurrentFloor: (floor: number) => void;
  setUserPosition: (pos: { x: number; y: number }) => void;
  setUserHeading: (heading: number) => void;
  setPositionConfidence: (conf: number) => void;
}

export const useMapStore = create<MapState>()((set) => ({
  currentFloor: 1,
  userPosition: null,
  userHeading: 0,
  positionConfidence: 0,
  setCurrentFloor: (floor) => set({ currentFloor: floor }),
  setUserPosition: (pos) => set({ userPosition: pos }),
  setUserHeading: (heading) => set({ userHeading: heading }),
  setPositionConfidence: (conf) => set({ positionConfidence: conf }),
}));
