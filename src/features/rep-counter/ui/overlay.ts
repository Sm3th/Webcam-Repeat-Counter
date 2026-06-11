import type { Keypoint, KeypointName } from '../engine/types';

/** Standard MoveNet / COCO skeleton edges. */
const EDGES: Array<[KeypointName, KeypointName]> = [
  ['left_shoulder', 'right_shoulder'],
  ['left_shoulder', 'left_elbow'],
  ['left_elbow', 'left_wrist'],
  ['right_shoulder', 'right_elbow'],
  ['right_elbow', 'right_wrist'],
  ['left_shoulder', 'left_hip'],
  ['right_shoulder', 'right_hip'],
  ['left_hip', 'right_hip'],
  ['left_hip', 'left_knee'],
  ['left_knee', 'left_ankle'],
  ['right_hip', 'right_knee'],
  ['right_knee', 'right_ankle'],
];

interface DrawOptions {
  ctx: CanvasRenderingContext2D;
  video: HTMLVideoElement;
  canvas: HTMLCanvasElement;
  keypoints: Keypoint[];
  minScore: number;
  /** Joints belonging to the active exercise's tracked side — drawn in accent. */
  activeJoints: Set<KeypointName>;
  /** CSS variable lookups resolved by the caller (no hardcoded hex here). */
  colors: { accent: string; dim: string };
}

interface MappedPoint {
  x: number;
  y: number;
  score: number;
  name: KeypointName;
}

/**
 * Draws the mirrored video frame plus a mirrored skeleton. Keypoints arrive in
 * video-pixel space; we letterbox the video to preserve aspect ratio and mirror
 * for DISPLAY only. The rep engine consumes the raw, un-mirrored keypoints
 * elsewhere.
 */
export function drawFrame({
  ctx,
  video,
  canvas,
  keypoints,
  minScore,
  activeJoints,
  colors,
}: DrawOptions): void {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (video.videoWidth === 0 || video.videoHeight === 0) return;

  // Aspect-preserving "contain" fit: scale the video to fit the canvas and
  // center it, so it never stretches (e.g. 4:3 cam on a 16:9 fullscreen).
  const scale = Math.min(
    canvas.width / video.videoWidth,
    canvas.height / video.videoHeight,
  );
  const drawW = video.videoWidth * scale;
  const drawH = video.videoHeight * scale;
  const offsetX = (canvas.width - drawW) / 2;
  const offsetY = (canvas.height - drawH) / 2;

  // Mirror the video image only.
  ctx.save();
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, offsetX, offsetY, drawW, drawH);
  ctx.restore();

  const mapped = new Map<KeypointName, MappedPoint>();
  for (const kp of keypoints) {
    mapped.set(kp.name, {
      x: canvas.width - (offsetX + kp.x * scale), // mirror for display
      y: offsetY + kp.y * scale,
      score: kp.score,
      name: kp.name,
    });
  }

  // Edges: only when both endpoints clear the score threshold.
  ctx.lineWidth = Math.max(2, canvas.width * 0.004);
  for (const [a, b] of EDGES) {
    const pa = mapped.get(a);
    const pb = mapped.get(b);
    if (!pa || !pb || pa.score < minScore || pb.score < minScore) continue;
    const active = activeJoints.has(a) && activeJoints.has(b);
    ctx.strokeStyle = active ? colors.accent : colors.dim;
    ctx.beginPath();
    ctx.moveTo(pa.x, pa.y);
    ctx.lineTo(pb.x, pb.y);
    ctx.stroke();
  }

  // Joints.
  const r = Math.max(3, canvas.width * 0.006);
  for (const p of mapped.values()) {
    if (p.score < minScore) continue;
    ctx.fillStyle = activeJoints.has(p.name) ? colors.accent : colors.dim;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}
