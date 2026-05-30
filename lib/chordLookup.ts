/**
 * Chord name → fingering lookup, backed by @tombatossals/chords-db.
 *
 * The db indexes by 12 keys (`C`, `Csharp`, `D`, `Eb`, `E`, `F`, `Fsharp`, `G`,
 * `Ab`, `A`, `Bb`, `B`) and per-key suffixes like `major`, `minor`, `7`,
 * `maj7`, `minor7`, `sus4`, etc. Positions store six-element `frets` and
 * `fingers` arrays in low-E → high-E order (string 6 → string 1).
 */
import guitarDb from "@tombatossals/chords-db/lib/guitar.json";

export type ChordPosition = {
  frets: number[];
  fingers: number[];
  baseFret: number;
  barres: number[];
};

// User-facing root → chords-db key
const KEY_MAP: Record<string, string> = {
  C: "C",
  "C#": "Csharp",
  Db: "Db",
  D: "D",
  "D#": "Eb",
  Eb: "Eb",
  E: "E",
  Fb: "E",
  "E#": "F",
  F: "F",
  "F#": "Fsharp",
  Gb: "Fsharp",
  G: "G",
  "G#": "Ab",
  Ab: "Ab",
  A: "A",
  "A#": "Bb",
  Bb: "Bb",
  B: "B",
  Cb: "B",
  "B#": "C",
};

// ChordPro suffix → chords-db suffix
const SUFFIX_MAP: Record<string, string> = {
  "": "major",
  maj: "major",
  M: "major",
  m: "minor",
  min: "minor",
  "7": "7",
  M7: "maj7",
  maj7: "maj7",
  m7: "minor7",
  sus4: "sus4",
  sus2: "sus2",
  sus: "sus4",
  "6": "6",
  m6: "minor6",
  "9": "9",
  m9: "minor9",
  maj9: "maj9",
  add9: "add9",
  "11": "11",
  "13": "13",
  aug: "aug",
  dim: "dim",
  dim7: "dim7",
  "7b5": "7b5",
  mmaj7: "minormaj7",
};

type DbChordEntry = {
  key: string;
  suffix: string;
  positions: Array<{
    frets: number[];
    fingers: number[];
    baseFret?: number;
    barres?: number[];
    capo?: boolean;
  }>;
};

const dbChords = (guitarDb as { chords: Record<string, DbChordEntry[]> }).chords;

export function lookupChord(name: string): ChordPosition | null {
  const m = name.match(/^([A-G][#b]?)(.*)$/);
  if (!m) return null;
  const root = m[1];
  const suffix = m[2] ?? "";
  const dbKey = KEY_MAP[root];
  if (!dbKey) return null;
  const dbSuffix = SUFFIX_MAP[suffix] ?? suffix;

  const chordList = dbChords[dbKey];
  if (!chordList) return null;

  let entry = chordList.find((c) => c.suffix === dbSuffix);
  // Graceful fallback: any unknown suffix falls back to the plain major chord
  if (!entry) entry = chordList.find((c) => c.suffix === "major");
  if (!entry || !entry.positions || entry.positions.length === 0) return null;

  // Prefer an open-position voicing when available (baseFret 1, no large barres)
  const sorted = [...entry.positions].sort((a, b) => {
    const ab = (a.baseFret ?? 1) + (a.barres?.length ?? 0) * 2;
    const bb = (b.baseFret ?? 1) + (b.barres?.length ?? 0) * 2;
    return ab - bb;
  });
  const pos = sorted[0];
  return {
    frets: pos.frets,
    fingers: pos.fingers,
    baseFret: pos.baseFret ?? 1,
    barres: pos.barres ?? [],
  };
}

/** Return the set of unique chord tokens that appear inside `[...]` brackets in a ChordPro source. */
export function chordsInChordPro(chordpro: string): string[] {
  const re = /\[([A-G][#b]?[a-zA-Z0-9/+#-]*)\]/g;
  const set = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(chordpro))) {
    set.add(m[1]);
  }
  return Array.from(set);
}
