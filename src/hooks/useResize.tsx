"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";

export type ResizeDirection =
  | "n"
  | "s"
  | "e"
  | "w"
  | "ne"
  | "nw"
  | "se"
  | "sw";

const MIN_W = 320;
const MIN_H = 400;
const MAX_W = 900;
const MAX_H = 900;

export function useResize(
  position: { x: number; y: number },
  size: { w: number; h: number },
  onPositionChange: (pos: { x: number; y: number }) => void,
  onSizeChange: (size: { w: number; h: number }) => void
) {
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartRef = useRef<{
    mouseX: number;
    mouseY: number;
    x: number;
    y: number;
    w: number;
    h: number;
    direction: ResizeDirection;
  } | null>(null);

  const startResize = useCallback(
    (e: React.MouseEvent, direction: ResizeDirection) => {
      e.preventDefault();
      e.stopPropagation();
      resizeStartRef.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        x: position.x,
        y: position.y,
        w: size.w,
        h: size.h,
        direction,
      };
      setIsResizing(true);
    },
    [position, size]
  );

  useEffect(() => {
    if (!isResizing || !resizeStartRef.current) return;
    const start = resizeStartRef.current;
    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - start.mouseX;
      const dy = e.clientY - start.mouseY;
      const d = start.direction;
      let x = start.x;
      let y = start.y;
      let w = start.w;
      let h = start.h;

      if (d === "e" || d === "ne" || d === "se") w = start.w + dx;
      if (d === "w" || d === "nw" || d === "sw") {
        w = start.w - dx;
        if (w >= MIN_W) x = start.x + dx;
        else {
          w = MIN_W;
          x = start.x + (start.w - MIN_W);
        }
      }
      if (d === "s" || d === "se" || d === "sw") h = start.h + dy;
      if (d === "n" || d === "ne" || d === "nw") {
        h = start.h - dy;
        if (h >= MIN_H) y = start.y + dy;
        else {
          h = MIN_H;
          y = start.y + (start.h - MIN_H);
        }
      }

      const maxW = (typeof window !== "undefined" ? window.innerWidth : 0) - x;
      const maxH = (typeof window !== "undefined" ? window.innerHeight : 0) - y;
      w = Math.max(MIN_W, Math.min(MAX_W, w, maxW));
      h = Math.max(MIN_H, Math.min(MAX_H, h, maxH));
      if (d.includes("w")) x = start.x + (start.w - w);
      if (d.includes("n")) y = start.y + (start.h - h);
      x = Math.max(0, Math.min((typeof window !== "undefined" ? window.innerWidth : 0) - w, x));
      y = Math.max(0, Math.min((typeof window !== "undefined" ? window.innerHeight : 0) - h, y));

      onPositionChange({ x, y });
      onSizeChange({ w, h });
    };
    const handleMouseUp = () => {
      setIsResizing(false);
      resizeStartRef.current = null;
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.userSelect = "none";
    document.body.style.cursor = "nwse-resize";
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [isResizing, onPositionChange, onSizeChange]);

  return { isResizing, startResize };
}

const handleStyle = "absolute bg-transparent z-10 hover:bg-primary-500/20 transition-colors";
const edgeSize = 4;
const cornerSize = 12;

export function ResizeHandles({
  onStartResize,
}: {
  onStartResize: (e: React.MouseEvent, dir: ResizeDirection) => void;
}) {
  return (
    <>
      {/* corners */}
      <div
        className={`${handleStyle} left-0 top-0 cursor-nwse-resize`}
        style={{ width: cornerSize, height: cornerSize }}
        onMouseDown={(e) => onStartResize(e, "nw")}
        aria-label="Resize top-left"
      />
      <div
        className={`${handleStyle} top-0 cursor-nesw-resize`}
        style={{ width: cornerSize, height: cornerSize, right: 0 }}
        onMouseDown={(e) => onStartResize(e, "ne")}
        aria-label="Resize top-right"
      />
      <div
        className={`${handleStyle} right-0 bottom-0 cursor-nwse-resize`}
        style={{ width: cornerSize, height: cornerSize, right: 0, bottom: 0 }}
        onMouseDown={(e) => onStartResize(e, "se")}
        aria-label="Resize bottom-right"
      />
      <div
        className={`${handleStyle} left-0 bottom-0 cursor-nesw-resize`}
        style={{ width: cornerSize, height: cornerSize, bottom: 0 }}
        onMouseDown={(e) => onStartResize(e, "sw")}
        aria-label="Resize bottom-left"
      />
      {/* edges */}
      <div
        className={`${handleStyle} left-0 cursor-ew-resize`}
        style={{ left: 0, top: cornerSize, bottom: cornerSize, width: edgeSize }}
        onMouseDown={(e) => onStartResize(e, "w")}
        aria-label="Resize left"
      />
      <div
        className={`${handleStyle} right-0 cursor-ew-resize`}
        style={{ right: 0, top: cornerSize, bottom: cornerSize, width: edgeSize }}
        onMouseDown={(e) => onStartResize(e, "e")}
        aria-label="Resize right"
      />
      <div
        className={`${handleStyle} top-0 cursor-ns-resize`}
        style={{ top: 0, left: cornerSize, right: cornerSize, height: edgeSize }}
        onMouseDown={(e) => onStartResize(e, "n")}
        aria-label="Resize top"
      />
      <div
        className={`${handleStyle} bottom-0 cursor-ns-resize`}
        style={{ bottom: 0, left: cornerSize, right: cornerSize, height: edgeSize }}
        onMouseDown={(e) => onStartResize(e, "s")}
        aria-label="Resize bottom"
      />
    </>
  );
}
