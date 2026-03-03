import { cn } from "@workspace/ui/lib/utils";
import type { COBEOptions } from "cobe";
import createGlobe from "cobe";
import { useEffect, useRef } from "react";

const MOVEMENT_DAMPING = 1400;

const GLOBE_CONFIG: COBEOptions = {
  baseColor: [1, 1, 1],
  dark: 0,
  devicePixelRatio: 1,
  diffuse: 0.4,
  glowColor: [1, 1, 1],
  height: 800,
  mapBrightness: 1.2,
  mapSamples: 8000,
  markerColor: [10 / 255, 10 / 255, 10 / 255],
  markers: [
    { location: [40.7128, -74.006], size: 0.1 },
    { location: [51.5074, -0.1278], size: 0.1 },
    { location: [35.6762, 139.6503], size: 0.1 },
    { location: [-33.8688, 151.2093], size: 0.08 },
    { location: [48.8566, 2.3522], size: 0.09 },
    { location: [1.3521, 103.8198], size: 0.08 },
    { location: [-23.5505, -46.6333], size: 0.1 },
    { location: [52.52, 13.405], size: 0.07 },
    { location: [37.7749, -122.4194], size: 0.08 },
    { location: [55.7558, 37.6176], size: 0.08 },
  ],
  onRender: () => {},
  phi: 0,
  theta: 0.3,
  width: 800,
};

export function Globe({
  className,
  config,
}: {
  className?: string;
  config?: Partial<COBEOptions>;
}) {
  const phi = useRef(0);
  const width = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const r = useRef(0);

  const updatePointerInteraction = (value: number | null) => {
    pointerInteracting.current = value;
    if (canvasRef.current) {
      canvasRef.current.style.cursor = value !== null ? "grabbing" : "grab";
    }
  };

  const updateMovement = (clientX: number) => {
    if (pointerInteracting.current !== null) {
      const delta = clientX - pointerInteracting.current;
      r.current += delta / MOVEMENT_DAMPING;
    }
  };

  useEffect(() => {
    const mergedConfig: COBEOptions = { ...GLOBE_CONFIG, ...config };

    const onResize = () => {
      if (canvasRef.current) {
        width.current = canvasRef.current.offsetWidth;
      }
    };

    window.addEventListener("resize", onResize);
    onResize();

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const globe = createGlobe(canvasRef.current!, {
      ...mergedConfig,
      width: width.current * 2,
      height: width.current * 2,
      onRender: (state) => {
        if (!pointerInteracting.current && !prefersReducedMotion)
          phi.current += 0.005;
        state.phi = phi.current + r.current;
        state.width = width.current * 2;
        state.height = width.current * 2;
      },
    });

    setTimeout(() => {
      if (canvasRef.current) canvasRef.current.style.opacity = "1";
    }, 0);

    return () => {
      globe.destroy();
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- config is expected to be static; re-creating the WebGL globe on every render would be expensive
  }, []);

  return (
    <div
      className={cn("mx-auto aspect-square w-full max-w-[600px]", className)}
    >
      <canvas
        aria-label="Interactive globe"
        className="size-full opacity-0 transition-opacity duration-500 contain-[layout_paint_size]"
        role="img"
        onMouseMove={(e) => updateMovement(e.clientX)}
        onPointerDown={(e) => {
          pointerInteracting.current = e.clientX;
          updatePointerInteraction(e.clientX);
        }}
        onPointerOut={() => updatePointerInteraction(null)}
        onPointerUp={() => updatePointerInteraction(null)}
        onTouchMove={(e) =>
          e.touches[0] && updateMovement(e.touches[0].clientX)
        }
        ref={canvasRef}
      />
    </div>
  );
}
