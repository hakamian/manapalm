// Fix: Created the full content for ToastContainer.tsx.
import React from 'react';
import Toast from './Toast.tsx';

interface ToastData {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContainerProps {
  toasts: ToastData[];
  onDismiss: (id: number) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-[100] space-y-3">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onDismiss={() => onDismiss(toast.id)}
        />
      ))}
    </div>
  );
};

export default ToastContainer;