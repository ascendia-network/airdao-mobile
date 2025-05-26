import { create } from 'zustand';

interface ErrorState {
  error: {
    title: string;
    message: string;
  } | null;
  setError: (error: { title: string; message: string }) => void;
  clearError: () => void;
}

export const useErrorStore = create<ErrorState>((set) => ({
  error: null,
  setError: (error) => set({ error }),
  clearError: () => set({ error: null })
}));
