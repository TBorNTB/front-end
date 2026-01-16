"use client";

import toast, { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        // Default styles
        style: {
          background: "var(--color-info)",
          color: "#fff",
          fontSize: "14px",
          borderRadius: "8px",
          padding: "12px 16px",
        },
        duration: 4000,

        // Success toast
        success: {
          style: { background: "var(--color-success)" },
          duration: 3000,
        },

        // Error toast
        error: {
          style: { background: "var(--color-error)" },
          duration: 4000,
        },

        // Loading toast
        loading: {
          duration: Infinity,
        },
      }}
      containerStyle={{
        zIndex: 9999,
      }}
    >
      {(t) => (
        <div
          className={`${
            t.visible ? "animate-enter" : "animate-leave"
          } flex items-center gap-3 pointer-events-auto`}
          style={{
            ...t.style,
            padding: "12px 16px",
          }}
        >
          <div className="flex-1">
            {typeof t.message === "function" ? t.message(t) : t.message}
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="flex-shrink-0 rounded-full p-1 hover:bg-white/10 transition-colors"
            aria-label="Close notification"
          >
            ✕
          </button>
        </div>
      )}
    </Toaster>
  );
}