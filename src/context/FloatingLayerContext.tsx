"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

const BASE_Z = 100;

interface FloatingLayerContextType {
  /** Register a layer id (call when panel mounts). */
  register: (id: string) => void;
  /** Move this layer to front (call when panel opens or is clicked). */
  bringToFront: (id: string) => void;
  /** Get z-index for this layer (higher = on top). */
  getZIndex: (id: string) => number;
}

const FloatingLayerContext = createContext<FloatingLayerContextType | undefined>(undefined);

export function FloatingLayerProvider({ children }: { children: React.ReactNode }) {
  const [order, setOrder] = useState<string[]>([]);

  const register = useCallback((id: string) => {
    setOrder((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const bringToFront = useCallback((id: string) => {
    setOrder((prev) => {
      const next = prev.filter((x) => x !== id);
      next.push(id);
      return next;
    });
  }, []);

  const getZIndex = useCallback(
    (id: string) => {
      const index = order.indexOf(id);
      return index === -1 ? BASE_Z : BASE_Z + index;
    },
    [order]
  );

  return (
    <FloatingLayerContext.Provider value={{ register, bringToFront, getZIndex }}>
      {children}
    </FloatingLayerContext.Provider>
  );
}

export function useFloatingLayer(id: string) {
  const ctx = useContext(FloatingLayerContext);
  if (ctx === undefined) {
    throw new Error("useFloatingLayer must be used within FloatingLayerProvider");
  }
  return ctx;
}
