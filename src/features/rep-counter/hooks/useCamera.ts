import { useCallback, useEffect, useRef, useState } from 'react';

export type CameraStatus =
  | 'idle'
  | 'requesting'
  | 'ready'
  | 'denied'
  | 'nocamera'
  | 'inuse'
  | 'insecure'
  | 'error';

export interface UseCameraResult {
  videoRef: React.RefObject<HTMLVideoElement>;
  status: CameraStatus;
  /** Acquire the stream and attach it to the video element. Idempotent. */
  start: () => Promise<void>;
  /** Stop all tracks and release the camera. Idempotent. */
  stop: () => void;
}

function classifyError(err: unknown): CameraStatus {
  if (err && typeof err === 'object' && 'name' in err) {
    switch ((err as DOMException).name) {
      case 'NotAllowedError':
      case 'SecurityError':
        return 'denied';
      case 'NotFoundError':
      case 'OverconstrainedError':
        return 'nocamera';
      case 'NotReadableError':
      case 'AbortError':
        return 'inuse';
    }
  }
  return 'error';
}

/**
 * Owns the getUserMedia lifecycle for a single hidden <video>. Cleans up every
 * track on stop/unmount so the camera indicator turns off and no leak remains.
 */
export function useCamera(): UseCameraResult {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const startingRef = useRef(false);
  const [status, setStatus] = useState<CameraStatus>('idle');

  const stop = useCallback(() => {
    startingRef.current = false;
    const stream = streamRef.current;
    if (stream) {
      for (const track of stream.getTracks()) track.stop();
      streamRef.current = null;
    }
    const video = videoRef.current;
    if (video) {
      video.srcObject = null;
    }
    setStatus('idle');
  }, []);

  const start = useCallback(async () => {
    // Idempotent: already running or mid-acquire.
    if (streamRef.current || startingRef.current) return;

    if (
      typeof window === 'undefined' ||
      !window.isSecureContext ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      setStatus('insecure');
      return;
    }

    startingRef.current = true;
    setStatus('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      // The component may have unmounted / called stop() while we awaited.
      if (!startingRef.current) {
        for (const track of stream.getTracks()) track.stop();
        return;
      }

      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) {
        for (const track of stream.getTracks()) track.stop();
        streamRef.current = null;
        startingRef.current = false;
        return;
      }

      video.srcObject = stream;
      await new Promise<void>((resolve) => {
        const done = () => {
          video.removeEventListener('loadeddata', done);
          resolve();
        };
        if (video.readyState >= 2) resolve();
        else video.addEventListener('loadeddata', done);
      });
      await video.play().catch(() => {
        /* autoplay may be blocked until user gesture; frames still flow once playing */
      });

      startingRef.current = false;
      setStatus('ready');
    } catch (err) {
      startingRef.current = false;
      streamRef.current = null;
      setStatus(classifyError(err));
    }
  }, []);

  // Stop the camera if the component unmounts while live.
  useEffect(() => stop, [stop]);

  return { videoRef, status, start, stop };
}
