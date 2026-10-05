import { create } from 'zustand';

interface UiState {
  toast: { msg: string; id: number } | null;
  login: { open: boolean; onDone?: () => void };
  demoOpen: boolean;
  showToast(msg: string): void;
  openLogin(onDone?: () => void): void;
  closeLogin(): void;
  setDemoOpen(v: boolean): void;
}

export const useUi = create<UiState>()((set) => ({
  toast: null,
  login: { open: false },
  demoOpen: false,
  showToast: (msg) => set({ toast: { msg, id: Date.now() } }),
  openLogin: (onDone) => set({ login: { open: true, onDone } }),
  closeLogin: () => set({ login: { open: false } }),
  setDemoOpen: (demoOpen) => set({ demoOpen }),
}));

export const toast = (msg: string) => useUi.getState().showToast(msg);
