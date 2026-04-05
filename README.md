# Open Guitar Tuner

A chromatic guitar tuner that runs in your browser. Uses your microphone to detect pitch in real-time and shows how in-tune you are with a visual gauge.

## Features

- Real-time pitch detection via microphone
- Visual needle gauge showing cents sharp/flat
- Chromatic detection across all 12 notes
- Smoothed readings for stable display
- Works offline as a PWA
- Dark theme UI

## Tech Stack

React, TypeScript, Vite, and [Pitchy](https://github.com/ianprime0509/pitchy) for pitch detection via the Web Audio API.

## Getting Started

```bash
npm install
npm run dev
```

Open [localhost:5173](http://localhost:5173) and allow microphone access.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run test` | Run tests |
| `npm run lint` | Lint code |

## How It Works

The app captures audio from your microphone, runs it through FFT-based pitch detection, converts the detected frequency to the nearest musical note (A4 = 440 Hz), and displays how many cents sharp or flat you are. A reading within ±5 cents shows as in-tune.

## License

MIT
