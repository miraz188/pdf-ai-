import { useCallback } from 'react';
import toast from 'react-hot-toast';

export const useToast = () => {
  const showSuccess = useCallback((message) => {
    toast.success(message, {
      duration: 3000,
      position: 'top-right',
      style: { background: '#065f46', color: '#d1fae5', borderRadius: '12px' },
    });
  }, []);

  const showError = useCallback((message) => {
    toast.error(message, {
      duration: 4000,
      position: 'top-right',
      style: { background: '#991b1b', color: '#fecaca', borderRadius: '12px' },
    });
  }, []);

  const showLoading = useCallback((message) => {
    return toast.loading(message, {
      position: 'top-right',
      style: { background: '#1e293b', color: '#e2e8f0', borderRadius: '12px' },
    });
  }, []);

  const dismissToast = useCallback((toastId) => {
    toast.dismiss(toastId);
  }, []);

  return { showSuccess, showError, showLoading, dismissToast };
};
