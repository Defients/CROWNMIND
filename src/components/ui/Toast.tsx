import React from 'react';
import { LucideIcon } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  icon?: LucideIcon;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

const typeConfig: Record<ToastType, { color: string; bg: string; border: string; defaultIcon: LucideIcon }> = {
  success: { color: 'text-[#38e68b]', bg: 'bg-[#38e68b]/5', border: 'border-[#38e68b]/30', defaultIcon: null as any },
  error: { color: 'text-[#ff4d6d]', bg: 'bg-[#ff4d6d]/5', border: 'border-[#ff4d6d]/30', defaultIcon: null as any },
  info: { color: 'text-[#26f4ff]', bg: 'bg-[#26f4ff]/5', border: 'border-[#26f4ff]/30', defaultIcon: null as any },
  warning: { color: 'text-[#ffb84d]', bg: 'bg-[#ffb84d]/5', border: 'border-[#ffb84d]/30', defaultIcon: null as any },
};

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 safe-bottom safe-right"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const cfg = typeConfig[toast.type];
        const Icon = toast.icon;
        return (
          <div
            key={toast.id}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border ${cfg.bg} ${cfg.border} bg-[#150d1f] animate-toast-in max-w-sm shadow-lg`}
            role="status"
          >
            {Icon && <Icon className={`w-4 h-4 ${cfg.color} flex-shrink-0`} />}
            <span className={`text-xs font-mono ${cfg.color} flex-1`}>{toast.message}</span>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
              className="text-[#eee8ff]/40 hover:text-[#eee8ff] transition-colors flex-shrink-0"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}

export type { ToastItem, ToastType };
