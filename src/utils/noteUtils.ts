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
