import { createContext, useCallback, useContext, useMemo } from 'react';
import { toastManager, ToastProvider as ToastProviderStack } from '@/components/ui/toast';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const success = useCallback((title, description) => {
    toastManager.create({ type: 'success', title, description, timeout: 4000 });
  }, []);

  const error = useCallback((title, description) => {
    toastManager.create({ type: 'error', title, description, timeout: 6000 });
  }, []);

  const info = useCallback((title, description) => {
    toastManager.create({ type: 'info', title, description, timeout: 4000 });
  }, []);

  const loading = useCallback((title, description) => {
    toastManager.create({ type: 'loading', title, description, timeout: 0 });
  }, []);

  const dismiss = useCallback((id) => toastManager.close(id), []);

  const value = useMemo(
    () => ({ toast: { success, error, info, loading, dismiss } }),
    [success, error, info, loading, dismiss]
  );

  return (
    <ToastContext.Provider value={value}>
      <ToastProviderStack position="bottom-right">{children}</ToastProviderStack>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}