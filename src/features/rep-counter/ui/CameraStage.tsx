import { useEffect, useRef } from 'react';
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
}: CameraStageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
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

  return (
    <div
      ref={containerRef}
      className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-border bg-surface"
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
    </div>
  );
}
