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
