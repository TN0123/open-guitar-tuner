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
