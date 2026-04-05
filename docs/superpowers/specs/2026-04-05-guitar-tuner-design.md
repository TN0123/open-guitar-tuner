# Open Guitar Tuner — Design Spec

## Overview

A chromatic guitar tuner PWA. Opens, requests microphone access, and starts detecting pitch immediately. Single screen with a needle gauge showing the detected note and how many cents sharp or flat. Turns green when in tune.

## Tech Stack

- **React + Vite** with TypeScript
- **`pitchy`** for pitch detection (McLeod autocorrelation, ~4KB)
- **`vite-plugin-pwa`** for service worker and installability
- Deployed to **Vercel**

## Audio Pipeline

1. On load, call `navigator.mediaDevices.getUserMedia({ audio: true })`.
2. Create an `AudioContext` and connect the mic stream to an `AnalyserNode` (FFT size 2048, sufficient for the lowest guitar string E2 at ~82Hz).
3. On each `requestAnimationFrame` tick, pull float32 time-domain data from the analyser.
4. Pass the buffer to `pitchy`'s `PitchDetector.forFloat32Array()` to get frequency and clarity.
5. Only update the display when clarity exceeds a threshold (~0.9) to filter out ambient noise and prevent flicker.
6. Convert frequency to the nearest semitone name and cents offset: `cents = 1200 * log2(freq / refFreq)` where refFreq is the nearest equal-temperament frequency.
7. Apply a light exponential moving average to the cents value to reduce jitter while maintaining responsiveness.

## Display

### Layout

Single centered screen with three elements stacked vertically:

1. **Note name** — large, prominent (e.g. "E2")
2. **Needle gauge** — semicircular arc with a rotating needle. Center = in tune, left = flat, right = sharp.
3. **Cents readout** — numeric offset below the gauge (e.g. "-8 cents")

### In-Tune State

When the detected pitch is within ±5 cents of the target note, the UI transitions to green: the needle, note name, and accent color all shift to a green tone. Outside this range, the accent is a neutral/warm tone.

### Aesthetic Direction

Linear/Vercel/Cursor-inspired dark theme:

- Near-black background (#0a0a0a or similar)
- Subtle gray tones for secondary elements and borders
- Clean sans-serif typography — no monospace, no generic fonts
- Restrained accent color (warm neutral when out of tune, green when in tune)
- Generous whitespace and spacing
- Minimal chrome — no heavy borders, shadows, or decorative elements
- SVG-based gauge for crisp rendering at all sizes

## PWA Configuration

- `vite-plugin-pwa` with `registerType: 'autoUpdate'`
- Manifest: app name "Guitar Tuner", `display: standalone`, dark theme color matching background
- PWA icons at required sizes (192x192, 512x512)
- Fully offline-capable — the entire app is client-side with no API calls

## Mic Permission Flow

No onboarding or splash screen. On first load:

1. Immediately call `getUserMedia`.
2. If the user grants permission, start pitch detection.
3. If the user denies permission, show a centered message explaining that microphone access is required, with a button to retry.

## Project Structure

```
src/
  App.tsx                    — root component, mic permission and audio context setup
  components/
    Tuner.tsx                — main tuner display (gauge + note + cents)
    Gauge.tsx                — SVG needle gauge component
  hooks/
    usePitchDetection.ts     — audio pipeline hook (mic → analyser → pitchy → note data)
  utils/
    noteUtils.ts             — frequency-to-note conversion and cents calculation
  main.tsx                   — entry point
  index.css                  — global styles, CSS variables for dark theme
public/
  icons/                     — PWA icons
index.html
vite.config.ts               — Vite config with PWA plugin
```

## Out of Scope

- Note history or waveform visualization
- Alternate tuning presets
- Reference pitch adjustment (A440 is fixed)
- Settings screen
- Backend or API
