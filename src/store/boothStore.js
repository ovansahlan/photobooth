// src/store/boothStore.js
import { create } from 'zustand';

// PASTIKAN ADA KATA "export const useBoothStore" DI SINI
export const useBoothStore = create((set) => ({
  currentPhase: 'landing',
  capturedPhotos: [],
  selectedLayout: 'strip-4',
  selectedFrame: 'classic-white',
  
  setPhase: (phase) => set({ currentPhase: phase }),
  addPhoto: (photoBase64) => set((state) => ({ 
    capturedPhotos: [...state.capturedPhotos, photoBase64] 
  })),
  resetSession: () => set({ 
    capturedPhotos: [], 
    currentPhase: 'landing' 
  }),
  setLayout: (layout) => set({ selectedLayout: layout }),
}));