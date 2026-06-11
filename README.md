# Rep Counter

**Count calisthenics reps in real time with your webcam — fully on-device, nothing uploaded.**

[![Live demo](https://img.shields.io/badge/demo-live-c6f432)](#) <!-- TODO: add Vercel URL -->

![demo](./docs/demo.gif) <!-- TODO: record demo gif -->

Rep Counter watches your webcam with [TensorFlow.js](https://www.tensorflow.org/js)
and the **MoveNet** pose model, tracks the joint angle that defines each exercise,
and counts your push-ups, squats, and pull-ups as you do them. Every frame is
processed in your browser — **no video ever leaves your device** — and the app is
an installable, offline-capable PWA.

## Features

- 🎥 **Real-time rep counting** for push-ups, squats, and pull-ups via webcam pose detection.
- 🧠 **On-device only** — MoveNet (SinglePose Lightning) runs on the WebGL backend; no uploads, no account.
- ✅ **Form feedback** — each rep is graded against a target depth (`Good` / `Go lower`).
- 🪞 **Mirrored selfie view** with a live skeleton overlay; tracked joints highlighted.
- 📊 **Live status** — FPS, "in frame" indicator, and a persistent privacy note.
- 🌍 **i18n** — English, Türkçe, Polski out of the box.
- 📦 **Installable PWA** — works offline after first load (app shell + model cached).
- ♿ **Accessible** — keyboard-operable controls, `aria-live` rep count, respects `prefers-reduced-motion`.
- 🧩 **Embeddable** — ships as a single self-contained feature module (see below).

## Tech stack

- React 18 + TypeScript + Vite
- Tailwind CSS ("Athletic Minimalism" dark theme)
- `@tensorflow/tfjs` + `@tensorflow-models/pose-detection` (MoveNet, WebGL backend)
- `vite-plugin-pwa` (Workbox service worker, model + app-shell caching)
- Vitest + Testing Library

## Getting started

Requires Node 18+.

```bash
npm install      # install dependencies
npm run dev      # start the dev server (camera needs HTTPS or localhost)
npm run build    # type-check + production build
npm run preview  # serve the production build
npm test         # run the unit tests
npm run lint     # lint
```

Open the dev URL on **localhost** (a secure context) and allow camera access.
Stand **side-on** for push-ups and squats, **facing** the camera for pull-ups, and
keep the relevant joints in frame.

## How rep counting works

The counting logic is a pure, framework-free engine (`src/features/rep-counter/engine/`)
that the React/TF layer feeds with plain numbers:

1. **Keypoints** — MoveNet returns 17 named body keypoints (with confidence scores)
   per frame, in video-pixel space.
2. **Side selection** — for the active exercise we pick the left/right side whose
   three tracked joints have the higher *minimum* confidence; if that minimum is
   below threshold the frame is marked **invalid** and ignored.
3. **Angle** — we compute the interior joint angle (e.g. shoulder–elbow–wrist for
   push-ups) with `angleABC`. Angles are mirror-invariant, so the engine always
   uses **raw** keypoints; mirroring is display-only.
4. **Smoothing** — the angle passes through an exponential moving average (`Ema`)
   to suppress jitter.
5. **State machine** — `RepCounter` uses **hysteresis** (separate `downEnter` /
   `upEnter` thresholds so noise can't flicker the count) plus a **debounce**
   (`minRepMs` rejects twitches). One rep = large angle → small angle → large angle.
   If the dip reaches the exercise's `targetDepth`, the rep is flagged good-form.

Because the engine imports neither React nor TensorFlow, it's fully unit-tested
(`tests/`) — angles, smoothing, the rep state machine (hysteresis, debounce,
confidence gating, form), and side selection.

## Privacy

**All processing happens on your device.** The webcam frames are read directly into
the browser, run through the pose model locally, and never sent anywhere. There is
no backend, no account, and no telemetry.

## Install as an app (PWA)

In a supported browser, use **Install app** (or your browser's install action) to
add Rep Counter to your home screen / desktop. After the first online load, the app
shell and the MoveNet model are cached, so it boots and counts **offline** on repeat
visits.

## Embedding (`features/rep-counter`)

The whole tool is a self-contained feature module reachable through one entry point,
`src/features/rep-counter/index.ts`. The standalone `src/app/App.tsx` is only a thin
host that injects labels, a persistence sink, and theme:

```tsx
import { RepCounter, EXERCISES, TR } from './features/rep-counter';

<RepCounter
  exercise={EXERCISES.pushup}   // a detection profile (or a custom ExerciseConfig)
  exerciseId="my-app-pushup-id" // host's stable id, defaults to exercise.id
  active={true}                 // lifecycle gate: true = run, false = release camera
  labels={TR}                   // injected i18n (EN/TR/PL provided)
  theme="inherit"               // consume the host's CSS theme vars
  sink={mySink}                 // RepSessionSink: where completed sets are saved
  onRep={(e) => {/* RepEvent */}}
  onSetComplete={(s) => {/* CompletedSet */}}
/>
```

The pure engine reads CSS variables for color (`--accent`, `--bg`, `--surface`, …)
and never hardcodes hex, so `theme="inherit"` lets a host's own dark theme drive it.
`onSetComplete` / `sink` emit a `CompletedSet` (reps, good-form reps, timing,
per-rep detail) that maps directly onto a workout/set log.

## License

[MIT](./LICENSE)
