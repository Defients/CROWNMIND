import React from 'react';
import { useToastStore } from '../stores/toastStore';
import { ToastContainer } from './ui/Toast';

export default function ToastProvider() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return <ToastContainer toasts={toasts} onDismiss={dismiss} />;
}
