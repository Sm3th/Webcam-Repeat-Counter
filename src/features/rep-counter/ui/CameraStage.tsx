import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Keypoint, KeypointName } from '../engine/types';
import { drawFrame } from './overlay';

interface CameraStageProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  /** Latest raw keypoints, read each animation frame (ref avoids re-renders). */
  keypointsRef: React.MutableRefObject<Keypoint[]>;
  activeJoints: Set<KeypointName>;
  minScore: number;
  /** Draw only while the camera is live. */
  active: boolean;
  /** HUD / chrome drawn on top of the canvas (visible in fullscreen too). */
  overlay?: ReactNode;
  fullscreenLabel: string;
  exitFullscreenLabel: string;
}

function readColors(el: HTMLElement): { accent: string; dim: string } {
  const cs = getComputedStyle(el);
  return {
    accent: cs.getPropertyValue('--accent').trim() || '#c6f432',
    dim: cs.getPropertyValue('--text-dim').trim() || '#9a9a9a',
  };
}

/** One visible canvas; the <video> is hidden and rendered into the canvas mirrored. */
export function CameraStage({
  videoRef,
  keypointsRef,
  activeJoints,
  minScore,
  active,
  overlay,
  fullscreenLabel,
  exitFullscreenLabel,
}: CameraStageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Keep mutable inputs in refs so the draw loop never needs to restart.
  const activeJointsRef = useRef(activeJoints);
  activeJointsRef.current = activeJoints;
  const minScoreRef = useRef(minScore);
  minScoreRef.current = minScore;

  // Size the canvas backing store to CSS size × devicePixelRatio.
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = container.getBoundingClientRect();
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // The draw loop.
  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    const colors = readColors(canvas);

    const draw = () => {
      rafId = requestAnimationFrame(draw);
      if (video.readyState < 2) return;
      drawFrame({
        ctx,
        video,
        canvas,
        keypoints: keypointsRef.current,
        minScore: minScoreRef.current,
        activeJoints: activeJointsRef.current,
        colors,
      });
    };
    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [active, videoRef, keypointsRef]);

  // Keep the fullscreen flag in sync with the actual document state.
  useEffect(() => {
    const onChange = () =>
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen?.();
    } else {
      void el.requestFullscreen?.();
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="rc-stage group relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-black"
    >
      {/* Hidden source video; we paint it onto the canvas ourselves (mirrored). */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute h-px w-px opacity-0"
        aria-hidden="true"
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* On-camera HUD overlay — stays visible in fullscreen. */}
      {overlay && (
        <div className="pointer-events-none absolute inset-0">{overlay}</div>
      )}

      <button
        type="button"
        onClick={toggleFullscreen}
        aria-label={isFullscreen ? exitFullscreenLabel : fullscreenLabel}
        title={isFullscreen ? exitFullscreenLabel : fullscreenLabel}
        className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-lg border border-border bg-black/50 text-text backdrop-blur transition-colors hover:bg-black/70 hover:text-accent"
      >
        {isFullscreen ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M9 3v3a3 3 0 0 1-3 3H3m18 0h-3a3 3 0 0 1-3-3V3M3 15h3a3 3 0 0 1 3 3v3m6 0v-3a3 3 0 0 1 3-3h3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M3 9V6a3 3 0 0 1 3-3h3m12 6V6a3 3 0 0 0-3-3h-3M3 15v3a3 3 0 0 0 3 3h3m12-6v3a3 3 0 0 1-3 3h-3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
