export { RepCounter } from './RepCounter';
export * from './integration/contracts';
export * from './i18n/labels';
export { EXERCISES } from './engine/exercises';
export type { ExerciseConfig, ExerciseId } from './engine/exercises';
// pure engine re-exported for reuse/testing
export { angleABC } from './engine/angles';
export { Ema } from './engine/smoothing';
export { RepCounter as RepEngine } from './engine/repCounter';
export type { RepCounterConfig, RepUpdate } from './engine/repCounter';
export type { Keypoint, KeypointName, Point, Phase, Side } from './engine/types';
