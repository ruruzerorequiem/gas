import React from 'react';
import { useApp } from '../context/AppContext';

export default function ToastContainer() {
  const { toasts, removerToast } = useApp();

  if (!toasts || toasts.length === 0) return null;

  const getIcon = (tipo) => {
    switch (tipo) {
      case 'success':
        return 'bi-check-circle-fill text-success';
      case 'warning':
        return 'bi-exclamation-triangle-fill text-warning';
      case 'error':
        return 'bi-x-circle-fill text-danger';
      default:
        return 'bi-info-circle-fill text-primary';
    }
  };

  return (
    <div
      className="toast-notification-wrapper position-fixed bottom-0 end-0 p-3"
      style={{ zIndex: 1080, maxWidth: '380px', width: '100%' }}
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="d-flex flex-column gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="toast-custom shadow d-flex align-items-center justify-content-between p-3"
            role="status"
          >
            <div className="d-flex align-items-center gap-2 pe-2">
              <i className={`bi ${getIcon(toast.tipo)} fs-5`}></i>
              <span className="toast-text small fw-medium">{toast.mensaje}</span>
            </div>
            <button
              type="button"
              className="btn-close-toast"
              onClick={() => removerToast(toast.id)}
              aria-label="Cerrar notificación"
            >
              <i className="bi bi-x fs-5"></i>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
