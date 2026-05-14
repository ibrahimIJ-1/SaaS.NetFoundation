"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { DocumentHighlight } from "@/types/document";
import { cn } from "@/lib/utils";

interface ImageViewerProps {
  fileUrl: string;
  highlights: DocumentHighlight[];
  onSelectionComplete: (selection: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    pageNumber: number;
  }) => void;
  onHighlightClick: (highlight: DocumentHighlight) => void;
  activeHighlightId?: string | null;
}

interface SelectionBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export function ImageViewer({
  fileUrl,
  highlights,
  onSelectionComplete,
  onHighlightClick,
  activeHighlightId,
}: ImageViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageRect, setImageRect] = useState<DOMRect | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [currentSelection, setCurrentSelection] = useState<SelectionBox | null>(null);
  const [cursor, setCursor] = useState("default");

  const getCanvasContext = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    return { canvas, ctx };
  }, []);

  function redrawAll(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.clearRect(0, 0, w, h);

    for (const hl of highlights) {
      const x = (hl.x1 / 100) * w;
      const y = (hl.y1 / 100) * h;
      const rw = ((hl.x2 - hl.x1) / 100) * w;
      const rh = ((hl.y2 - hl.y1) / 100) * h;

      ctx.fillStyle = hl.color + "66";
      ctx.fillRect(x, y, rw, rh);
      ctx.strokeStyle = hl.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, rw, rh);
    }

    if (currentSelection) {
      const sx = (currentSelection.x1 / 100) * w;
      const sy = (currentSelection.y1 / 100) * h;
      const sw = ((currentSelection.x2 - currentSelection.x1) / 100) * w;
      const sh = ((currentSelection.y2 - currentSelection.y1) / 100) * h;

      ctx.fillStyle = "rgba(59, 130, 246, 0.2)";
      ctx.fillRect(sx, sy, sw, sh);
      ctx.strokeStyle = "#3B82F6";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 3]);
      ctx.strokeRect(sx, sy, sw, sh);
      ctx.setLineDash([]);
    }
  }

  const syncCanvas = useCallback(() => {
    const img = imageRef.current;
    const container = containerRef.current;
    if (!img || !container) return;

    const cRect = container.getBoundingClientRect();
    const imgNaturalWidth = img.naturalWidth;
    const imgNaturalHeight = img.naturalHeight;
    if (imgNaturalWidth === 0 || imgNaturalHeight === 0) return;

    const containerRatio = cRect.width / cRect.height;
    const imageRatio = imgNaturalWidth / imgNaturalHeight;

    let displayW: number;
    let displayH: number;
    let offsetX: number;
    let offsetY: number;

    if (imageRatio > containerRatio) {
      displayW = cRect.width;
      displayH = cRect.width / imageRatio;
      offsetX = 0;
      offsetY = (cRect.height - displayH) / 2;
    } else {
      displayH = cRect.height;
      displayW = cRect.height * imageRatio;
      offsetX = (cRect.width - displayW) / 2;
      offsetY = 0;
    }

    const computedRect = new DOMRect(
      cRect.left + offsetX,
      cRect.top + offsetY,
      displayW,
      displayH,
    );

    setImageRect(computedRect);

    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = displayW;
    canvas.height = displayH;
    canvas.style.width = `${displayW}px`;
    canvas.style.height = `${displayH}px`;
    canvas.style.left = `${offsetX}px`;
    canvas.style.top = `${offsetY}px`;

    const ctx = canvas.getContext("2d");
    if (ctx) redrawAll(ctx, displayW, displayH);
  }, [highlights, currentSelection]);

  // Sync canvas on image load and on resize
  useEffect(() => {
    if (!imageLoaded) return;
    syncCanvas();

    const ro = new ResizeObserver(() => syncCanvas());
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("scroll", syncCanvas, { passive: true });

    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", syncCanvas);
    };
  }, [imageLoaded, syncCanvas]);

  // Redraw when selection or highlights change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvas.width === 0) return;
    const ctx = canvas.getContext("2d");
    if (ctx) redrawAll(ctx, canvas.width, canvas.height);
  }, [highlights, currentSelection]);

  const toPercent = useCallback(
    (clientX: number, clientY: number) => {
      if (!imageRect) return { x: 0, y: 0 };
      return {
        x: ((clientX - imageRect.left) / imageRect.width) * 100,
        y: ((clientY - imageRect.top) / imageRect.height) * 100,
      };
    },
    [imageRect],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!imageRect) return;
      const p = toPercent(e.clientX, e.clientY);
      const clampedX = Math.max(0, Math.min(100, p.x));
      const clampedY = Math.max(0, Math.min(100, p.y));
      setCurrentSelection({ x1: clampedX, y1: clampedY, x2: clampedX, y2: clampedY });
      setIsSelecting(true);
    },
    [imageRect, toPercent],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isSelecting || !currentSelection || !imageRect) return;
      const p = toPercent(e.clientX, e.clientY);
      setCurrentSelection((prev) =>
        prev
          ? {
              ...prev,
              x2: Math.max(0, Math.min(100, p.x)),
              y2: Math.max(0, Math.min(100, p.y)),
            }
          : null,
      );
    },
    [isSelecting, currentSelection, imageRect, toPercent],
  );

  const handlePointerUp = useCallback(() => {
    if (!isSelecting || !currentSelection) return;
    setIsSelecting(false);

    const x1 = Math.min(currentSelection.x1, currentSelection.x2);
    const y1 = Math.min(currentSelection.y1, currentSelection.y2);
    const x2 = Math.max(currentSelection.x1, currentSelection.x2);
    const y2 = Math.max(currentSelection.y1, currentSelection.y2);

    const minSize = 0.5;
    if (x2 - x1 < minSize || y2 - y1 < minSize) {
      setCurrentSelection(null);
      return;
    }

    onSelectionComplete({ x1, y1, x2, y2, pageNumber: 1 });
    setCurrentSelection(null);
  }, [isSelecting, currentSelection, onSelectionComplete]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 overflow-hidden"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      style={{ touchAction: "none", cursor: isSelecting ? "crosshair" : cursor }}
    >
      <img
        ref={imageRef}
        src={fileUrl}
        alt="Document"
        className="max-w-full max-h-full object-scale-down select-none"
        draggable={false}
        onLoad={() => setImageLoaded(true)}
        onMouseEnter={() => setCursor("crosshair")}
        onMouseLeave={() => setCursor("default")}
      />
      <canvas
        ref={canvasRef}
        className="absolute pointer-events-none"
        style={{ position: "absolute" }}
      />

      {/* Saved highlight clickable overlays */}
      {imageRect &&
        highlights.map((h) => {
          const containerRect = containerRef.current?.getBoundingClientRect();
          if (!containerRect) return null;
          const x = (h.x1 / 100) * imageRect.width + imageRect.left - containerRect.left;
          const y = (h.y1 / 100) * imageRect.height + imageRect.top - containerRect.top;
          const w = ((h.x2 - h.x1) / 100) * imageRect.width;
          const hgt = ((h.y2 - h.y1) / 100) * imageRect.height;

          return (
            <button
              key={h.id}
              className={cn(
                "absolute border-2 rounded-sm transition-all hover:brightness-110",
                activeHighlightId === h.id
                  ? "ring-2 ring-primary z-20"
                  : "z-10",
              )}
              style={{
                left: x,
                top: y,
                width: w,
                height: hgt,
                backgroundColor: h.color + "33",
                borderColor: h.color,
              }}
              onClick={(e) => {
                e.stopPropagation();
                onHighlightClick(h);
              }}
            />
          );
        })}
    </div>
  );
}
