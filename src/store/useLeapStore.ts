// src/store/useLeapStore.ts
import type { LeapJourney } from "@/types/leapLogs";
import { create } from "zustand";

interface LeapState {
  journeys: LeapJourney[];
  selectedTid: string | null;
  isLoading: boolean;

  // Actions
  setJourneys: (data: LeapJourney[]) => void;
  setSelectedTid: (tid: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useLeapStore = create<LeapState>((set) => ({
  journeys: [],
  selectedTid: null,
  isLoading: false,

  setJourneys: (journeys) => set({ journeys }),
  setSelectedTid: (tid) => set({ selectedTid: tid }),
  setIsLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ journeys: [], selectedTid: null, isLoading: false }),
}));
