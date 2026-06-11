import { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import * as poseDetection from '@tensorflow-models/pose-detection';
import type { Keypoint, KeypointName } from '../engine/types';

export type DetectorStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface PoseFrame {
  keypoints: Keypoint[];
  fps: number;
}

interface UsePoseDetectorArgs {
  videoRef: React.RefObject<HTMLVideoElement>;
  /** Run detection only while true (e.g. camera ready). */
  enabled: boolean;
  /** Called once per processed frame with raw (un-mirrored) keypoints. */
  onFrame: (frame: PoseFrame) => void;
}

const TARGET_FPS = 30;
const FRAME_INTERVAL = 1000 / TARGET_FPS;

export function usePoseDetector({ videoRef, enabled, onFrame }: UsePoseDetectorArgs): {
  status: DetectorStatus;
  retry: () => void;
} {
  const [status, setStatus] = useState<DetectorStatus>('idle');
  const [retryToken, setRetryToken] = useState(0);

  // Keep the latest callback without restarting the loop.
  const onFrameRef = useRef(onFrame);
  onFrameRef.current = onFrame;

  useEffect(() => {
    if (!enabled) {
      setStatus('idle');
      return;
    }

    // Guards against React 18 StrictMode double-mount and unmount-during-load:
    // a single isActive flag gates every async continuation and the rAF loop.
    let isActive = true;
    let rafId = 0;
    let detector: poseDetection.PoseDetector | null = null;
    let lastFrameTime = 0;
    let fpsEma: number | null = null;
    let lastTimestamp = performance.now();
    let paused = document.hidden;

    const onVisibility = () => {
      paused = document.hidden;
      if (!paused) {
        lastTimestamp = performance.now();
        lastFrameTime = 0;
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    const loop = async () => {
      if (!isActive) return;
      rafId = requestAnimationFrame(loop);

      if (paused || !detector) return;

      const now = performance.now();
      if (now - lastFrameTime < FRAME_INTERVAL) return;
      lastFrameTime = now;

      const video = videoRef.current;
      if (!video || video.readyState < 2 || video.videoWidth === 0) return;

      let poses: poseDetection.Pose[];
      try {
        poses = await detector.estimatePoses(video, { flipHorizontal: false });
      } catch {
        return; // transient inference hiccup; try again next frame
      }
      if (!isActive) return;

      // FPS as an EMA over inter-frame deltas.
      const dt = now - lastTimestamp;
      lastTimestamp = now;
      if (dt > 0) {
        const inst = 1000 / dt;
        fpsEma = fpsEma === null ? inst : 0.2 * inst + 0.8 * fpsEma;
      }

      const pose = poses[0];
      const keypoints: Keypoint[] = pose
        ? pose.keypoints
            .filter((k) => k.name)
            .map((k) => ({
              x: k.x,
              y: k.y,
              score: k.score ?? 0,
              name: k.name as KeypointName,
            }))
        : [];

      onFrameRef.current({ keypoints, fps: fpsEma ?? 0 });
    };

    (async () => {
      setStatus('loading');
      try {
        await tf.setBackend('webgl');
        await tf.ready();
        const created = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING },
        );
        if (!isActive) {
          created.dispose();
          return;
        }
        detector = created;
        setStatus('ready');
        rafId = requestAnimationFrame(loop);
      } catch {
        if (isActive) setStatus('error');
      }
    })();

    return () => {
      isActive = false;
      cancelAnimationFrame(rafId);
      document.removeEventListener('visibilitychange', onVisibility);
      detector?.dispose();
      detector = null;
    };
  }, [enabled, videoRef, retryToken]);

  return { status, retry: () => setRetryToken((n) => n + 1) };
}
