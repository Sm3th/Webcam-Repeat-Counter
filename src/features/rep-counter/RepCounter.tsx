import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { RepCounterProps, CompletedSet, PerRep } from './integration/contracts';
import { EN } from './i18n/labels';
import { angleABC } from './engine/angles';
import { Ema } from './engine/smoothing';
import { RepCounter as RepEngine } from './engine/repCounter';
import { RepCues } from './engine/audio';
import { byName, pickSide, estimateOrientation } from './engine/keypoints';
import type { Keypoint, KeypointName, Orientation, Phase } from './engine/types';
import { useCamera } from './hooks/useCamera';
import { usePoseDetector, type PoseFrame } from './hooks/usePoseDetector';
import { CameraStage } from './ui/CameraStage';
import { RepHud } from './ui/RepHud';
import { StatusBar } from './ui/StatusBar';
import { Controls } from './ui/Controls';
import { ErrorPanel, type RepCounterErrorKind } from './ui/ErrorPanel';
import { OverlayHud } from './ui/OverlayHud';
import { SessionStats, type SessionSummary } from './ui/SessionStats';
import { SetSummary } from './ui/SetSummary';

interface HudState {
  count: number;
  phase: Phase;
  lastRepGoodForm: boolean | null;
  fps: number;
  inFrame: boolean;
  /** Expected orientation to nudge toward when the user is framed wrong, else null. */
  orientationWarn: Orientation | null;
}

const INITIAL_HUD: HudState = {
  count: 0,
  phase: 'up',
  lastRepGoodForm: null,
  fps: 0,
  inFrame: false,
  orientationWarn: null,
};

export function RepCounter({
  exercise,
  exerciseId,
  active,
  labels = EN,
  theme = 'standalone',
  modelType = 'lightning',
  sound = false,
  voice = false,
  restSeconds = 0,
  sink,
  onRep,
  onSetComplete,
  children,
}: RepCounterProps) {
  const resolvedExerciseId = exerciseId ?? exercise.id;

  const { videoRef, status: cameraStatus, start, stop } = useCamera();
  const [running, setRunning] = useState(false);
  const enabled = active && running && cameraStatus === 'ready';

  // Engine instances live in refs; recreated when the exercise profile changes.
  const engineRef = useRef(new RepEngine(exercise));
  const emaRef = useRef(new Ema(exercise.smoothingAlpha));
  const keypointsRef = useRef<Keypoint[]>([]);
  const prevCountRef = useRef(0);

  // Current set accumulator.
  const setStartRef = useRef(0);
  const perRepRef = useRef<PerRep[]>([]);

  const [hud, setHud] = useState<HudState>(INITIAL_HUD);

  // Cumulative session totals across finalized sets.
  const sessionRef = useRef<SessionSummary>({
    totalReps: 0,
    sets: 0,
    goodReps: 0,
    bestSet: 0,
  });
  const [session, setSession] = useState<SessionSummary>(sessionRef.current);
  // The most recently completed set, shown as a summary modal until dismissed.
  const [summary, setSummary] = useState<CompletedSet | null>(null);

  // Keep latest callbacks/labels reachable from imperative handlers.
  const onRepRef = useRef(onRep);
  onRepRef.current = onRep;
  const onSetCompleteRef = useRef(onSetComplete);
  onSetCompleteRef.current = onSetComplete;
  const sinkRef = useRef(sink);
  sinkRef.current = sink;
  const exerciseIdRef = useRef(resolvedExerciseId);
  exerciseIdRef.current = resolvedExerciseId;
  const soundRef = useRef(sound);
  soundRef.current = sound;
  const voiceRef = useRef(voice);
  voiceRef.current = voice;

  // Audio cues (beep / spoken count) — created lazily, disposed on unmount.
  const cuesRef = useRef<RepCues | null>(null);
  useEffect(() => {
    cuesRef.current = new RepCues();
    return () => {
      cuesRef.current?.dispose();
      cuesRef.current = null;
    };
  }, []);

  const beginSet = useCallback(() => {
    setStartRef.current = Date.now();
    perRepRef.current = [];
    prevCountRef.current = 0;
  }, []);

  /** Finalize the current set if it has any reps, emitting it to listeners + sink. */
  const finalizeSet = useCallback(() => {
    const reps = perRepRef.current.length;
    if (reps === 0) return;
    const endedAt = Date.now();
    const startedAt = setStartRef.current || endedAt;
    const set: CompletedSet = {
      exerciseId: exerciseIdRef.current,
      reps,
      goodFormReps: perRepRef.current.filter((r) => r.goodForm === true).length,
      startedAt,
      endedAt,
      durationMs: endedAt - startedAt,
      perRep: [...perRepRef.current],
    };
    onSetCompleteRef.current?.(set);
    void sinkRef.current?.saveSet(set);
    perRepRef.current = [];

    const prev = sessionRef.current;
    const next: SessionSummary = {
      totalReps: prev.totalReps + set.reps,
      sets: prev.sets + 1,
      goodReps: prev.goodReps + set.goodFormReps,
      bestSet: Math.max(prev.bestSet, set.reps),
    };
    sessionRef.current = next;
    setSession(next);
    setSummary(set);
  }, []);

  const resetEngine = useCallback(() => {
    engineRef.current.reset();
    emaRef.current.reset();
    keypointsRef.current = [];
    setHud(INITIAL_HUD);
  }, []);

  // Recreate the engine when the exercise profile changes (also ends the set).
  const exerciseKey = exercise.id;
  useEffect(() => {
    finalizeSet();
    engineRef.current = new RepEngine(exercise);
    emaRef.current = new Ema(exercise.smoothingAlpha);
    resetEngine();
    beginSet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exerciseKey]);

  // Camera lifecycle follows `active && running`.
  useEffect(() => {
    if (active && running) {
      void start();
      beginSet();
    } else {
      stop();
      finalizeSet();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, running]);

  // Process one detector frame: angle → smooth → state machine → HUD/events.
  const handleFrame = useCallback(
    ({ keypoints, fps }: PoseFrame) => {
      keypointsRef.current = keypoints;
      const map = byName(keypoints);
      const { side, score } = pickSide(map, exercise.leftTriplet, exercise.rightTriplet);
      const valid = score >= exercise.minKeypointScore;

      let smoothed = emaRef.current.current() ?? NaN;
      if (valid) {
        const triplet = side === 'left' ? exercise.leftTriplet : exercise.rightTriplet;
        const a = map.get(triplet[0])!;
        const b = map.get(triplet[1])!;
        const c = map.get(triplet[2])!;
        const raw = angleABC(a, b, c);
        if (!Number.isNaN(raw)) smoothed = emaRef.current.next(raw);
      }

      const result = engineRef.current.update(smoothed, valid, performance.now());

      if (result.count > prevCountRef.current) {
        prevCountRef.current = result.count;
        const at = Date.now();
        const tempoMs =
          result.lastRepTempoMs != null ? Math.round(result.lastRepTempoMs) : undefined;
        const romDeg =
          result.lastRepRomDeg != null ? Math.round(result.lastRepRomDeg) : undefined;
        perRepRef.current.push({ goodForm: result.lastRepGoodForm, at, tempoMs, romDeg });
        if (soundRef.current) cuesRef.current?.beep();
        if (voiceRef.current) cuesRef.current?.speak(String(result.count));
        onRepRef.current?.({
          exerciseId: exerciseIdRef.current,
          index: result.count,
          goodForm: result.lastRepGoodForm,
          at,
          tempoMs,
          romDeg,
        });
      }

      const orient = estimateOrientation(map, exercise.minKeypointScore);
      const orientationWarn =
        orient && orient !== exercise.orientation ? exercise.orientation : null;

      setHud({
        count: result.count,
        phase: result.phase,
        lastRepGoodForm: result.lastRepGoodForm,
        fps,
        inFrame: valid,
        orientationWarn,
      });
    },
    [exercise],
  );

  const { status: detectorStatus, retry: retryDetector } = usePoseDetector({
    videoRef,
    enabled,
    modelType,
    onFrame: handleFrame,
  });

  const handleReset = useCallback(() => {
    finalizeSet();
    resetEngine();
    beginSet();
  }, [finalizeSet, resetEngine, beginSet]);

  const handleToggle = useCallback(() => setRunning((r) => !r), []);

  const handleRetry = useCallback(() => {
    if (detectorStatus === 'error') retryDetector();
    else void start();
  }, [detectorStatus, retryDetector, start]);

  const activeJoints = useMemo<Set<KeypointName>>(
    () => new Set<KeypointName>([...exercise.leftTriplet, ...exercise.rightTriplet]),
    [exercise],
  );

  const errorKind: RepCounterErrorKind | null = useMemo(() => {
    if (
      cameraStatus === 'denied' ||
      cameraStatus === 'nocamera' ||
      cameraStatus === 'inuse' ||
      cameraStatus === 'insecure'
    ) {
      return cameraStatus;
    }
    if (detectorStatus === 'error') return 'model';
    return null;
  }, [cameraStatus, detectorStatus]);

  const rootClass = theme === 'standalone' ? 'rc-theme-standalone' : 'rc-theme-inherit';
  const exerciseName = labels.exercises[exercise.id] ?? exercise.label;

  // Live session totals = finalized sets + the in-progress set.
  const currentGood = perRepRef.current.filter((r) => r.goodForm === true).length;
  const liveSummary: SessionSummary = {
    totalReps: session.totalReps + hud.count,
    sets: session.sets,
    goodReps: session.goodReps + currentGood,
    bestSet: Math.max(session.bestSet, hud.count),
  };

  return (
    <div className={`${rootClass} relative flex w-full flex-col gap-6`}>
      {children}
      <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        <div className="flex flex-col gap-4">
          {errorKind && running ? (
            <ErrorPanel kind={errorKind} onRetry={handleRetry} labels={labels} />
          ) : (
            <CameraStage
              videoRef={videoRef}
              keypointsRef={keypointsRef}
              activeJoints={activeJoints}
              minScore={exercise.minKeypointScore}
              active={enabled}
              fullscreenLabel={labels.fullscreen}
              exitFullscreenLabel={labels.exitFullscreen}
              overlay={
                <OverlayHud
                  exerciseName={exerciseName}
                  count={hud.count}
                  phase={hud.phase}
                  lastRepGoodForm={hud.lastRepGoodForm}
                  inFrame={hud.inFrame}
                  running={running}
                  labels={labels}
                />
              }
            />
          )}
          <StatusBar
            fps={hud.fps}
            inFrame={hud.inFrame}
            orientationWarn={hud.orientationWarn}
            labels={labels}
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-center gap-6 rounded-xl border border-border bg-surface p-6">
            <RepHud
              count={hud.count}
              phase={hud.phase}
              lastRepGoodForm={hud.lastRepGoodForm}
              labels={labels}
            />
            <Controls
              running={running}
              onToggle={handleToggle}
              onReset={handleReset}
              labels={labels}
            />
            {detectorStatus === 'loading' && running && (
              <p className="text-xs text-text-dim">{labels.loadingModel}</p>
            )}
            <p className="text-center text-xs text-text-dim">{exercise.hint}</p>
          </div>

          <SessionStats summary={liveSummary} labels={labels} />
        </div>
      </div>

      {summary && (
        <SetSummary
          set={summary}
          exerciseName={exerciseName}
          restSeconds={restSeconds}
          labels={labels}
          onClose={() => setSummary(null)}
        />
      )}
    </div>
  );
}
