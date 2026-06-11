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
 * video-pixel space; we mirror for DISPLAY only (`mx = canvas.width - kp.x*sx`).
 * The rep engine consumes the raw, un-mirrored keypoints elsewhere.
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

  // Mirror the video image only.
  ctx.save();
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  ctx.restore();

  if (video.videoWidth === 0 || video.videoHeight === 0) return;
  const sx = canvas.width / video.videoWidth;
  const sy = canvas.height / video.videoHeight;

  const mapped = new Map<KeypointName, MappedPoint>();
  for (const kp of keypoints) {
    mapped.set(kp.name, {
      x: canvas.width - kp.x * sx, // mirror for display
      y: kp.y * sy,
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
