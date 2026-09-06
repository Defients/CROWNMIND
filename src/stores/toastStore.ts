import { create } from 'zustand';
import type { LucideIcon } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  icon?: LucideIcon;
}

interface ToastStore {
  toasts: ToastItem[];
  add: (type: ToastType, message: string, icon?: LucideIcon) => void;
  dismiss: (id: string) => void;
  success: (message: string, icon?: LucideIcon) => void;
  error: (message: string, icon?: LucideIcon) => void;
  info: (message: string, icon?: LucideIcon) => void;
  warning: (message: string, icon?: LucideIcon) => void;
}

let toastId = 0;

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],

  add: (type, message, icon) => {
    const id = `toast_${toastId++}`;
    set((s) => ({ toasts: [...s.toasts, { id, type, message, icon }] }));
    setTimeout(() => {
      get().dismiss(id);
    }, 3500);
  },

  dismiss: (id) => {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },

  success: (message, icon) => get().add('success', message, icon),
  error: (message, icon) => get().add('error', message, icon),
  info: (message, icon) => get().add('info', message, icon),
  warning: (message, icon) => get().add('warning', message, icon),
}));

export function useToast() {
  const store = useToastStore();
  return {
    success: store.success,
    error: store.error,
    info: store.info,
    warning: store.warning,
  };
}
