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
  const prevNoteRef = useRef<string | null>(null);
  const animFrameRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const cleanup = () => {
    cancelAnimationFrame(animFrameRef.current);
    audioContextRef.current?.close();
    audioContextRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const startListening = () => {
    cleanup();
    setState({ status: "requesting" });

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        streamRef.current = stream;
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

          if (clarity >= CLARITY_THRESHOLD && frequency > 55 && frequency < 1200) {
            const rawNote = frequencyToNote(frequency);
            const noteKey = rawNote.name + rawNote.octave;

            if (prevNoteRef.current !== noteKey) {
              smoothedCentsRef.current = null;
              prevNoteRef.current = noteKey;
            }

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
    return cleanup;
  }, []);

  return {
    state,
    retry: startListening,
  };
}
