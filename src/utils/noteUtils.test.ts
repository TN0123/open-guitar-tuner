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
    const result = frequencyToNote(430);
    expect(result.name).toBe("A");
    expect(result.octave).toBe(4);
    expect(result.cents).toBeLessThan(0);
    expect(result.cents).toBeGreaterThan(-50);
  });

  it("returns positive cents when sharp", () => {
    const result = frequencyToNote(450);
    expect(result.name).toBe("A");
    expect(result.octave).toBe(4);
    expect(result.cents).toBeGreaterThan(0);
    expect(result.cents).toBeLessThan(50);
  });

  it("handles all chromatic notes", () => {
    const c4 = frequencyToNote(261.63);
    expect(c4.name).toBe("C");
    expect(c4.octave).toBe(4);

    const g3 = frequencyToNote(196.0);
    expect(g3.name).toBe("G");
    expect(g3.octave).toBe(3);

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
