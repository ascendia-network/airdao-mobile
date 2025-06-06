import { create } from 'zustand';

interface GlobalErrorState {
  error: { title: string; message: string } | null;
  setError: (error: { title: string; message: string }) => void;
  clearError: () => void;
}

const useGlobalErrorStore = create<GlobalErrorState>((set) => ({
  error: null,
  setError: (error) => set({ error }),
  clearError: () => set({ error: null })
}));

export { useGlobalErrorStore };
