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
  setSessionId: (id: string) => void;
  setEntranceId: (id: string) => void;
  setOnboardingComplete: (complete: boolean) => void;
  reset: () => void;
}

const generateSessionId = () =>
  'session-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);

export const useSessionStore = create<SessionState>()((set) => ({
  sessionId: generateSessionId(),
  entranceId: null,
  onboardingComplete: false,
  setSessionId: (id) => set({ sessionId: id }),
  setEntranceId: (id) => set({ entranceId: id }),
  setOnboardingComplete: (complete) => set({ onboardingComplete: complete }),
  reset: () =>
    set({
      sessionId: generateSessionId(),
      entranceId: null,
      onboardingComplete: false,
    }),
}));

/* ============================================
   Permission Store
   ============================================ */
interface PermissionState {
  bluetooth: boolean;
  location: boolean;
  microphone: boolean;
  setPermission: (type: 'bluetooth' | 'location' | 'microphone', granted: boolean) => void;
  requestPermission: (type: 'bluetooth' | 'location' | 'microphone') => Promise<boolean>;
  requestAllPermissions: () => Promise<void>;
}

export const usePermissionStore = create<PermissionState>()(
  persist(
    (set, get) => ({
      bluetooth: false,
      location: false,
      microphone: false,
      setPermission: (type, granted) =>
        set({ [type]: granted }),
      requestPermission: async (type) => {
        try {
          if (type === 'microphone') {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach((track) => track.stop());
            set({ microphone: true });
            return true;
          }
          if (type === 'location') {
            return new Promise<boolean>((resolve) => {
              navigator.geolocation.getCurrentPosition(
                () => { set({ location: true }); resolve(true); },
                () => { resolve(false); },
                { timeout: 10000 }
              );
            });
          }
          if (type === 'bluetooth') {
            // Bluetooth Web API requires user gesture and may not be available
            if ('bluetooth' in navigator) {
              try {
                // Just check if API is available, don't request device
                set({ bluetooth: true });
                return true;
              } catch {
                return false;
              }
            }
            // Mark as granted if API not available (will handle gracefully)
            set({ bluetooth: true });
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },
      requestAllPermissions: async () => {
        const state = get();
        await state.requestPermission('location');
        await state.requestPermission('microphone');
        await state.requestPermission('bluetooth');
      },
    }),
    {
      name: 'hospiguide-permissions',
    }
  )
);

/* ============================================
   UI Store
   ============================================ */
export type BottomTab = 'chat' | 'map' | 'doctors' | 'settings';

interface ToastMessage {
  id: string;
  message: string;
  variant: 'info' | 'success' | 'warning' | 'error';
}

interface UIState {
  activeTab: BottomTab;
  isFullscreen: boolean;
  toast: ToastMessage | null;
  setActiveTab: (tab: BottomTab) => void;
  setFullscreen: (val: boolean) => void;
  showToast: (message: string, variant?: ToastMessage['variant']) => void;
  clearToast: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  activeTab: 'chat',
  isFullscreen: false,
  toast: null,
  setActiveTab: (tab) => set({ activeTab: tab }),
  setFullscreen: (val) => set({ isFullscreen: val }),
  showToast: (message, variant = 'info') =>
    set({
      toast: {
        id: Date.now().toString(),
        message,
        variant,
      },
    }),
  clearToast: () => set({ toast: null }),
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
  eta: number;
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
  userHeading: number;
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
