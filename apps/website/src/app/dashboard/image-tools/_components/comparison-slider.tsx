"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { ChevronsLeftRight } from "lucide-react";

interface ComparisonSliderProps {
  originalUrl: string;
  resultUrl: string;
  originalLabel?: string;
  resultLabel?: string;
}

export function ComparisonSlider({
  originalUrl,
  resultUrl,
  originalLabel = "Original",
  resultLabel = "Result",
}: ComparisonSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(pct);
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      updatePosition(e.clientX);
    },
    [updatePosition]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      setIsDragging(true);
      updatePosition(e.touches[0].clientX);
    },
    [updatePosition]
  );

  // Bind move/end to window so fast drags outside the container don't get stuck
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      updatePosition(e.clientX);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      updatePosition(e.touches[0].clientX);
    };
    const onEnd = () => setIsDragging(false);

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onEnd);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, [isDragging, updatePosition]);

  // Keyboard support
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") setSliderPosition((p) => Math.max(0, p - 2));
    if (e.key === "ArrowRight") setSliderPosition((p) => Math.min(100, p + 2));
  }, []);

  // Fade labels near edges to avoid overlapping the handle
  const originalOpacity = Math.min(1, sliderPosition / 15);
  const resultOpacity = Math.min(1, (100 - sliderPosition) / 15);

  return (
    <div className="space-y-3">
      {/* Comparison container — natural image height */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-2xl border border-white/10 cursor-ew-resize select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onKeyDown={handleKeyDown}
        role="slider"
        aria-label="Before / after comparison slider"
        aria-valuenow={Math.round(sliderPosition)}
        aria-valuemin={0}
        aria-valuemax={100}
        tabIndex={0}
      >
        {/* Result image — sets container height via natural dimensions */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={resultUrl}
          alt={resultLabel}
          className="w-full h-auto block"
          draggable={false}
        />

        {/* Original image — clipped with clip-path for pixel-perfect edges */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={originalUrl}
          alt={originalLabel}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
          draggable={false}
        />

        {/* Divider line & Handle */}
        <div
          className="absolute top-0 bottom-0 w-[2px] bg-white shadow-[0_0_12px_rgba(255,255,255,0.5)] pointer-events-none"
          style={{ left: `calc(${sliderPosition}% - 1px)` }}
        >
          <div
            className="absolute top-1/2 left-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-[0_4px_24px_rgba(0,0,0,0.35)] transition-transform duration-75"
            style={{
              transform: `translate(-50%, -50%) scale(${isDragging ? 1.1 : 1})`,
            }}
          >
            <ChevronsLeftRight className="h-4 w-4 text-gray-500" />
          </div>
        </div>

        {/* Labels */}
        <span
          className="absolute top-4 left-4 rounded-md bg-black/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm pointer-events-none transition-opacity duration-150"
          style={{ opacity: originalOpacity }}
        >
          {originalLabel}
        </span>
        <span
          className="absolute top-4 right-4 rounded-md bg-black/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm pointer-events-none transition-opacity duration-150"
          style={{ opacity: resultOpacity }}
        >
          {resultLabel}
        </span>
      </div>

      {/* Hint */}
      <p className="text-center text-xs text-white/30">
        Drag the slider — or use ← → keys — to compare
      </p>
    </div>
  );
}
