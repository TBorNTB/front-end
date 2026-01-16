"use client";

import toast, { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        // Default styles
        style: {
          background: '#333',
          color: '#fff',
          fontSize: '14px',
          borderRadius: '8px',
          padding: '12px 16px',
        },
        // Default options
        duration: 4000,
        // Success toast
        success: {
          style: {
            background: '#22c55e', // Tailwind green-500
          },
          duration: 3000,
        },
        // Error toast
        error: {
          style: {
            background: '#ef4444', // Tailwind red-500
          },
          duration: 4000,
        },
      }}
      containerStyle={{
        zIndex: 9999,
      }}
    >
      {(t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } flex items-center gap-3 pointer-events-auto`}
          style={{
            ...t.style,
            padding: '12px 16px',
          }}
        >
          <div className="flex-1">
            {typeof t.message === 'function' ? t.message(t) : t.message}
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="flex-shrink-0 rounded-full p-1 hover:bg-white/10 transition-colors"
            aria-label="Close notification"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      )}
    </Toaster>
  );
}
