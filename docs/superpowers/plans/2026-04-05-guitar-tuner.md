# Open Guitar Tuner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a chromatic guitar tuner PWA that listens via microphone and displays a needle gauge showing note and cents offset, with a Linear/Vercel-inspired dark aesthetic.

**Architecture:** Single-page React app. Microphone audio flows through Web Audio API's AnalyserNode into `pitchy` for pitch detection, then through a utility layer that maps frequency to note name + cents offset. A single fullscreen component renders an SVG needle gauge. `vite-plugin-pwa` handles service worker and installability.

**Tech Stack:** React 19, Vite, TypeScript, pitchy, vite-plugin-pwa

---

## File Map

| File | Responsibility |
|------|---------------|
| `src/utils/noteUtils.ts` | Frequency → note name + octave + cents offset math |
| `src/utils/noteUtils.test.ts` | Tests for note conversion logic |
| `src/hooks/usePitchDetection.ts` | Mic access, AudioContext, AnalyserNode, pitchy loop, EMA smoothing |
| `src/components/Gauge.tsx` | SVG semicircular needle gauge, accepts cents + inTune props |
| `src/components/Tuner.tsx` | Composes Gauge + note name + cents readout |
| `src/App.tsx` | Mic permission flow, error state, renders Tuner |
| `src/index.css` | Dark theme CSS variables, global styles, typography |
| `src/main.tsx` | React entry point |
| `index.html` | HTML shell with dark meta theme-color |
| `vite.config.ts` | Vite config with PWA plugin |
| `public/icons/icon-192.svg` | PWA icon 192x192 |
| `public/icons/icon-512.svg` | PWA icon 512x512 |

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`, `src/vite-env.d.ts`

- [ ] **Step 1: Scaffold Vite + React + TypeScript project**

```bash
npm create vite@latest . -- --template react-ts
```

Select current directory when prompted. This generates the standard Vite React TS template.

- [ ] **Step 2: Install dependencies**

```bash
npm install pitchy
npm install -D vite-plugin-pwa
```

- [ ] **Step 3: Configure Vite with PWA plugin**

Replace `vite.config.ts` with:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Guitar Tuner",
        short_name: "Tuner",
        description: "Chromatic guitar tuner",
        theme_color: "#0a0a0a",
        background_color: "#0a0a0a",
        display: "standalone",
        icons: [
          {
            src: "/icons/icon-192.svg",
            sizes: "192x192",
            type: "image/svg+xml",
          },
          {
            src: "/icons/icon-512.svg",
            sizes: "512x512",
            type: "image/svg+xml",
          },
        ],
      },
    }),
  ],
});
```

- [ ] **Step 4: Set up index.html**

Replace `index.html` content with:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#0a0a0a" />
    <title>Guitar Tuner</title>
    <link rel="icon" type="image/svg+xml" href="/icons/icon-192.svg" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Create minimal App.tsx placeholder**

Replace `src/App.tsx` with:

```tsx
export default function App() {
  return <div>Guitar Tuner</div>;
}
```

- [ ] **Step 6: Set up main.tsx**

Replace `src/main.tsx` with:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- [ ] **Step 7: Create PWA icons**

Create `public/icons/icon-192.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
  <rect width="192" height="192" rx="40" fill="#0a0a0a"/>
  <path d="M 96 40 A 56 56 0 0 1 152 96" fill="none" stroke="#e5e5e5" stroke-width="6" stroke-linecap="round"/>
  <path d="M 96 40 A 56 56 0 0 0 40 96" fill="none" stroke="#e5e5e5" stroke-width="6" stroke-linecap="round"/>
  <line x1="96" y1="96" x2="96" y2="46" stroke="#22c55e" stroke-width="3" stroke-linecap="round"/>
  <circle cx="96" cy="96" r="5" fill="#e5e5e5"/>
</svg>
```

Create `public/icons/icon-512.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="108" fill="#0a0a0a"/>
  <path d="M 256 106 A 150 150 0 0 1 406 256" fill="none" stroke="#e5e5e5" stroke-width="12" stroke-linecap="round"/>
  <path d="M 256 106 A 150 150 0 0 0 106 256" fill="none" stroke="#e5e5e5" stroke-width="12" stroke-linecap="round"/>
  <line x1="256" y1="256" x2="256" y2="116" stroke="#22c55e" stroke-width="6" stroke-linecap="round"/>
  <circle cx="256" cy="256" r="12" fill="#e5e5e5"/>
</svg>
```

- [ ] **Step 8: Replace index.css with empty file**

Replace `src/index.css` with:

```css
/* Styles added in Task 6 */
```

- [ ] **Step 9: Clean up generated files**

```bash
rm -f src/App.css src/assets/react.svg public/vite.svg
```

- [ ] **Step 10: Verify the app runs**

```bash
npm run dev
```

Expected: Dev server starts, browser shows "Guitar Tuner" text on white background. Kill the server after confirming.

- [ ] **Step 11: Install vitest for testing**

```bash
npm install -D vitest
```

Add test script to `package.json` scripts:

```json
"test": "vitest run"
```

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: scaffold Vite + React + TS project with PWA config"
```

---

### Task 2: Note Utilities (TDD)

**Files:**
- Create: `src/utils/noteUtils.ts`
- Create: `src/utils/noteUtils.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/utils/noteUtils.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { frequencyToNote } from "./noteUtils";

describe("frequencyToNote", () => {
  it("returns A4 with 0 cents for 440Hz", () => {
    const result = frequencyToNote(440);
    expect(result.name).toBe("A");
    expect(result.octave).toBe(4);
    expect(result.cents).toBe(0);
  });

  it("returns E2 with 0 cents for 82.41Hz", () => {
    const result = frequencyToNote(82.41);
    expect(result.name).toBe("E");
    expect(result.octave).toBe(2);
    expect(Math.abs(result.cents)).toBeLessThan(1);
  });

  it("returns negative cents when flat", () => {
    // 430Hz is ~40 cents flat of A4
    const result = frequencyToNote(430);
    expect(result.name).toBe("A");
    expect(result.octave).toBe(4);
    expect(result.cents).toBeLessThan(0);
    expect(result.cents).toBeGreaterThan(-50);
  });

  it("returns positive cents when sharp", () => {
    // 450Hz is ~39 cents sharp of A4
    const result = frequencyToNote(450);
    expect(result.name).toBe("A");
    expect(result.octave).toBe(4);
    expect(result.cents).toBeGreaterThan(0);
    expect(result.cents).toBeLessThan(50);
  });

  it("handles all chromatic notes", () => {
    // C4 = 261.63Hz
    const c4 = frequencyToNote(261.63);
    expect(c4.name).toBe("C");
    expect(c4.octave).toBe(4);

    // G3 = 196.00Hz
    const g3 = frequencyToNote(196.0);
    expect(g3.name).toBe("G");
    expect(g3.octave).toBe(3);

    // B3 = 246.94Hz
    const b3 = frequencyToNote(246.94);
    expect(b3.name).toBe("B");
    expect(b3.octave).toBe(3);
  });

  it("handles all 6 standard guitar strings", () => {
    const strings = [
      { freq: 82.41, name: "E", octave: 2 },
      { freq: 110.0, name: "A", octave: 2 },
      { freq: 146.83, name: "D", octave: 3 },
      { freq: 196.0, name: "G", octave: 3 },
      { freq: 246.94, name: "B", octave: 3 },
      { freq: 329.63, name: "E", octave: 4 },
    ];
    for (const s of strings) {
      const result = frequencyToNote(s.freq);
      expect(result.name).toBe(s.name);
      expect(result.octave).toBe(s.octave);
      expect(Math.abs(result.cents)).toBeLessThan(1);
    }
  });

  it("marks as inTune when within ±5 cents", () => {
    const result = frequencyToNote(440);
    expect(result.inTune).toBe(true);
  });

  it("marks as not inTune when outside ±5 cents", () => {
    const result = frequencyToNote(430);
    expect(result.inTune).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/utils/noteUtils.test.ts
```

Expected: FAIL — module `./noteUtils` not found.

- [ ] **Step 3: Implement noteUtils.ts**

Create `src/utils/noteUtils.ts`:

```ts
const NOTE_NAMES = [
  "C", "C#", "D", "D#", "E", "F",
  "F#", "G", "G#", "A", "A#", "B",
] as const;

const A4_FREQUENCY = 440;
const A4_MIDI = 69;
const IN_TUNE_THRESHOLD = 5;

export interface NoteInfo {
  name: string;
  octave: number;
  cents: number;
  inTune: boolean;
  frequency: number;
}

export function frequencyToNote(frequency: number): NoteInfo {
  const semitonesFromA4 = 12 * Math.log2(frequency / A4_FREQUENCY);
  const roundedSemitones = Math.round(semitonesFromA4);
  const cents = Math.round((semitonesFromA4 - roundedSemitones) * 100);

  const midiNote = A4_MIDI + roundedSemitones;
  const name = NOTE_NAMES[((midiNote % 12) + 12) % 12];
  const octave = Math.floor(midiNote / 12) - 1;

  return {
    name,
    octave,
    cents,
    inTune: Math.abs(cents) <= IN_TUNE_THRESHOLD,
    frequency,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/utils/noteUtils.test.ts
```

Expected: All 8 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/noteUtils.ts src/utils/noteUtils.test.ts
git commit -m "feat: add frequency-to-note conversion utility with tests"
```

---

### Task 3: Pitch Detection Hook

**Files:**
- Create: `src/hooks/usePitchDetection.ts`

- [ ] **Step 1: Create the pitch detection hook**

Create `src/hooks/usePitchDetection.ts`:

```ts
import { useEffect, useRef, useState } from "react";
import { PitchDetector } from "pitchy";
import { frequencyToNote, type NoteInfo } from "../utils/noteUtils";

const CLARITY_THRESHOLD = 0.9;
const EMA_ALPHA = 0.3;
const FFT_SIZE = 2048;

export type PitchState =
  | { status: "requesting" }
  | { status: "denied" }
  | { status: "listening"; note: NoteInfo | null };

export function usePitchDetection(): {
  state: PitchState;
  retry: () => void;
} {
  const [state, setState] = useState<PitchState>({ status: "requesting" });
  const smoothedCentsRef = useRef<number | null>(null);
  const animFrameRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);

  const startListening = () => {
    setState({ status: "requesting" });

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = FFT_SIZE;
        source.connect(analyser);

        const detector = PitchDetector.forFloat32Array(analyser.fftSize);
        const buffer = new Float32Array(analyser.fftSize);

        setState({ status: "listening", note: null });

        const detect = () => {
          analyser.getFloatTimeDomainData(buffer);
          const [frequency, clarity] = detector.findPitch(
            buffer,
            audioContext.sampleRate
          );

          if (clarity >= CLARITY_THRESHOLD && frequency > 60 && frequency < 1200) {
            const rawNote = frequencyToNote(frequency);

            if (smoothedCentsRef.current === null) {
              smoothedCentsRef.current = rawNote.cents;
            } else {
              smoothedCentsRef.current =
                EMA_ALPHA * rawNote.cents +
                (1 - EMA_ALPHA) * smoothedCentsRef.current;
            }

            const smoothedCents = Math.round(smoothedCentsRef.current);

            setState({
              status: "listening",
              note: {
                ...rawNote,
                cents: smoothedCents,
                inTune: Math.abs(smoothedCents) <= 5,
              },
            });
          }

          animFrameRef.current = requestAnimationFrame(detect);
        };

        animFrameRef.current = requestAnimationFrame(detect);
      })
      .catch(() => {
        setState({ status: "denied" });
      });
  };

  useEffect(() => {
    startListening();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      audioContextRef.current?.close();
    };
  }, []);

  return {
    state,
    retry: startListening,
  };
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/usePitchDetection.ts
git commit -m "feat: add pitch detection hook with mic access and EMA smoothing"
```

---

### Task 4: SVG Gauge Component

**Files:**
- Create: `src/components/Gauge.tsx`

- [ ] **Step 1: Create the Gauge component**

Create `src/components/Gauge.tsx`:

```tsx
interface GaugeProps {
  cents: number;
  inTune: boolean;
}

export default function Gauge({ cents, inTune }: GaugeProps) {
  // Map cents (-50 to +50) to angle (-90° to +90°)
  const clampedCents = Math.max(-50, Math.min(50, cents));
  const angle = (clampedCents / 50) * 90;

  const accentColor = inTune ? "var(--color-in-tune)" : "var(--color-accent)";

  return (
    <svg
      viewBox="0 0 300 170"
      style={{ width: "100%", maxWidth: 340 }}
      aria-label={`Tuning gauge: ${cents} cents ${cents < 0 ? "flat" : cents > 0 ? "sharp" : "in tune"}`}
    >
      {/* Arc track */}
      <path
        d="M 30 150 A 120 120 0 0 1 270 150"
        fill="none"
        stroke="var(--color-border)"
        strokeWidth="2"
      />

      {/* Tick marks */}
      {[-50, -25, 0, 25, 50].map((tick) => {
        const tickAngle = (tick / 50) * 90 - 90;
        const rad = (tickAngle * Math.PI) / 180;
        const cx = 150;
        const cy = 150;
        const r1 = 118;
        const r2 = tick === 0 ? 105 : 110;
        const x1 = cx + r1 * Math.cos(rad);
        const y1 = cy + r1 * Math.sin(rad);
        const x2 = cx + r2 * Math.cos(rad);
        const y2 = cy + r2 * Math.sin(rad);
        return (
          <line
            key={tick}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={tick === 0 ? "var(--color-in-tune)" : "var(--color-muted)"}
            strokeWidth={tick === 0 ? 2 : 1}
          />
        );
      })}

      {/* Needle */}
      <line
        x1="150"
        y1="150"
        x2="150"
        y2="35"
        stroke={accentColor}
        strokeWidth="2"
        strokeLinecap="round"
        transform={`rotate(${angle}, 150, 150)`}
        style={{ transition: "transform 0.12s ease-out" }}
      />

      {/* Center pivot */}
      <circle cx="150" cy="150" r="4" fill={accentColor} />
    </svg>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/Gauge.tsx
git commit -m "feat: add SVG needle gauge component"
```

---

### Task 5: Tuner Component

**Files:**
- Create: `src/components/Tuner.tsx`

- [ ] **Step 1: Create the Tuner component**

Create `src/components/Tuner.tsx`:

```tsx
import Gauge from "./Gauge";
import type { NoteInfo } from "../utils/noteUtils";

interface TunerProps {
  note: NoteInfo | null;
}

export default function Tuner({ note }: TunerProps) {
  if (!note) {
    return (
      <div className="tuner">
        <div className="tuner-waiting">Play a note...</div>
      </div>
    );
  }

  const displayClass = note.inTune ? "in-tune" : "";

  return (
    <div className={`tuner ${displayClass}`}>
      <div className="note-display">
        <span className="note-name">{note.name}</span>
        <span className="note-octave">{note.octave}</span>
      </div>

      <Gauge cents={note.cents} inTune={note.inTune} />

      <div className="cents-display">
        {note.cents === 0
          ? "In tune"
          : `${note.cents > 0 ? "+" : ""}${note.cents} cents`}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/Tuner.tsx
git commit -m "feat: add Tuner display component"
```

---

### Task 6: Global Styles

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Write the dark theme CSS**

Replace `src/index.css` with:

```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

:root {
  --color-bg: #0a0a0a;
  --color-surface: #111111;
  --color-text: #ededed;
  --color-muted: #555555;
  --color-border: #222222;
  --color-accent: #a0a0a0;
  --color-in-tune: #22c55e;
  --font-family: 'DM Sans', system-ui, sans-serif;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #root {
  height: 100%;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-family);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#root {
  display: flex;
  align-items: center;
  justify-content: center;
}

.tuner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 32px;
  width: 100%;
  max-width: 400px;
}

.tuner-waiting {
  font-size: 18px;
  color: var(--color-muted);
  font-weight: 300;
  letter-spacing: 0.02em;
}

.note-display {
  display: flex;
  align-items: baseline;
  gap: 2px;
  transition: color 0.2s ease;
}

.note-name {
  font-size: 72px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: -0.03em;
  color: var(--color-accent);
  transition: color 0.2s ease;
}

.note-octave {
  font-size: 28px;
  font-weight: 300;
  color: var(--color-muted);
}

.in-tune .note-name {
  color: var(--color-in-tune);
}

.cents-display {
  font-size: 16px;
  font-weight: 400;
  color: var(--color-muted);
  letter-spacing: 0.01em;
  transition: color 0.2s ease;
}

.in-tune .cents-display {
  color: var(--color-in-tune);
}

.mic-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
  padding: 32px;
}

.mic-error p {
  font-size: 16px;
  color: var(--color-muted);
  font-weight: 300;
  line-height: 1.5;
  max-width: 280px;
}

.mic-error button {
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-family: var(--font-family);
  cursor: pointer;
  transition: border-color 0.15s ease;
}

.mic-error button:hover {
  border-color: var(--color-muted);
}
```

- [ ] **Step 2: Verify the app still runs**

```bash
npm run dev
```

Expected: Dev server starts, dark background visible in browser. Kill after confirming.

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat: add dark theme styles inspired by Linear/Vercel aesthetic"
```

---

### Task 7: Wire Up App.tsx

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Connect everything in App.tsx**

Replace `src/App.tsx` with:

```tsx
import { usePitchDetection } from "./hooks/usePitchDetection";
import Tuner from "./components/Tuner";

export default function App() {
  const { state, retry } = usePitchDetection();

  if (state.status === "requesting") {
    return null;
  }

  if (state.status === "denied") {
    return (
      <div className="mic-error">
        <p>Microphone access is needed to detect pitch. Please allow access and try again.</p>
        <button onClick={retry}>Allow Microphone</button>
      </div>
    );
  }

  return <Tuner note={state.note} />;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Verify the full app runs**

```bash
npm run dev
```

Expected: Dev server starts. Browser requests mic permission. On grant, shows "Play a note..." text centered on dark background. Playing a note near the mic shows the detected note with the needle gauge.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: wire up App with mic permission flow and tuner display"
```

---

### Task 8: Build Verification and Production Check

**Files:** None (verification only)

- [ ] **Step 1: Run all tests**

```bash
npm test
```

Expected: All noteUtils tests pass.

- [ ] **Step 2: Run production build**

```bash
npm run build
```

Expected: Build succeeds, outputs to `dist/`. PWA service worker generated.

- [ ] **Step 3: Preview production build**

```bash
npm run preview
```

Expected: Production build serves correctly. Tuner works end-to-end with mic input. PWA installs when prompted.

- [ ] **Step 4: Commit any fixes if needed, then tag**

```bash
git add -A
git commit -m "chore: verify production build and PWA"
```
