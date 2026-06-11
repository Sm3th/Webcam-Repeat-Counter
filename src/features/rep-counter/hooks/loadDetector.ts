import type { PoseDetector } from '@tensorflow-models/pose-detection';

export type MoveNetModelType = 'lightning' | 'thunder';

/**
 * Dynamically imports TensorFlow.js + the pose model so they land in their own
 * lazily-loaded chunk instead of the app shell. The first call triggers the
 * download; afterwards the chunk (and, via the PWA cache, the model weights) are
 * cached. Keeping the imports inside the function is what splits the ~1.9 MB of TF
 * out of the initial bundle.
 */
export async function createMoveNetDetector(
  model: MoveNetModelType,
): Promise<PoseDetector> {
  const tf = await import('@tensorflow/tfjs-core');
  await import('@tensorflow/tfjs-backend-webgl');
  const poseDetection = await import('@tensorflow-models/pose-detection');

  await tf.setBackend('webgl');
  await tf.ready();

  const modelType =
    model === 'thunder'
      ? poseDetection.movenet.modelType.SINGLEPOSE_THUNDER
      : poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING;

  return poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, {
    modelType,
  });
}
