/**
 * Ambient hairline motif library — 17 generators across three families:
 *   - 432 Hz cymatic (sound visualizations)
 *   - Biblical (Christian iconography in minimal abstract form)
 *   - Supporting geometric (anchors, dividers, annotations)
 *
 * Each generator draws into a provided <g> element at its local origin
 * and returns the approximate combined stroke length (used to size
 * `stroke-dasharray` so the draw animation duration looks even).
 *
 * Ported from ~/Documents/worship-chord-mocks/aesthetic-trial.html.
 */

const SVG_NS = "http://www.w3.org/2000/svg";

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const pick = <T,>(arr: readonly T[]): T =>
  arr[Math.floor(Math.random() * arr.length)] as T;

function makeEl<K extends keyof SVGElementTagNameMap>(
  name: K,
  attrs: Record<string, string | number> = {},
  parent?: SVGElement
): SVGElementTagNameMap[K] {
  const el = document.createElementNS(SVG_NS, name);
  for (const [k, v] of Object.entries(attrs)) {
    el.setAttribute(k, String(v));
  }
  if (parent) parent.appendChild(el);
  return el;
}

export type MotifFn = (g: SVGGElement) => number;

// =====================================================
// 432 Hz cymatic motifs
// =====================================================

const concentric: MotifFn = (g) => {
  const rings = Math.floor(rand(3, 6));
  const base = rand(8, 16);
  let len = 0;
  for (let i = 0; i < rings; i++) {
    const r = base * (i + 1);
    makeEl("circle", { cx: 0, cy: 0, r }, g);
    len += 2 * Math.PI * r;
  }
  return len + 20;
};

const sineWave: MotifFn = (g) => {
  const width = rand(60, 140);
  const amp = rand(6, 16);
  const periods = rand(2, 4);
  const steps = 40;
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const x = -width / 2 + (width * i) / steps;
    const y = Math.sin((i / steps) * Math.PI * 2 * periods) * amp;
    d += (i === 0 ? "M" : "L") + x.toFixed(1) + "," + y.toFixed(1) + " ";
  }
  makeEl("path", { d }, g);
  return width * periods * 1.3 + 20;
};

const lissajous: MotifFn = (g) => {
  const size = rand(28, 60);
  const a = pick([1, 2, 3, 3] as const);
  const b = pick([2, 3, 4, 5] as const);
  const phase = rand(0, Math.PI);
  const steps = 90;
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const x = Math.sin(a * t + phase) * size;
    const y = Math.sin(b * t) * size;
    d += (i === 0 ? "M" : "L") + x.toFixed(1) + "," + y.toFixed(1) + " ";
  }
  makeEl("path", { d }, g);
  return size * 8 + 20;
};

const radialBurst: MotifFn = (g) => {
  const spokes = Math.floor(rand(8, 18));
  const inner = rand(4, 10);
  const outer = inner + rand(16, 36);
  let len = 0;
  for (let i = 0; i < spokes; i++) {
    const a = (Math.PI * 2 * i) / spokes;
    const x1 = Math.cos(a) * inner,
      y1 = Math.sin(a) * inner;
    const x2 = Math.cos(a) * outer,
      y2 = Math.sin(a) * outer;
    makeEl("line", { x1, y1, x2, y2 }, g);
    len += outer - inner;
  }
  makeEl("circle", { cx: 0, cy: 0, r: inner }, g);
  return len + 2 * Math.PI * inner + 20;
};

const phyllotaxis: MotifFn = (g) => {
  const points = Math.floor(rand(20, 45));
  const c = rand(2.4, 3.2);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < points; i++) {
    const r = c * Math.sqrt(i);
    const a = i * golden;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    makeEl("circle", { cx: x, cy: y, r: 0.8, class: "dot" }, g);
  }
  return points * 5 + 20;
};

const standingWave: MotifFn = (g) => {
  const width = rand(70, 130);
  const amp = rand(8, 16);
  const steps = 32;
  let dUp = "",
    dDown = "";
  for (let i = 0; i <= steps; i++) {
    const x = -width / 2 + (width * i) / steps;
    const env = Math.sin((i / steps) * Math.PI);
    const yU = -env * amp;
    const yD = env * amp;
    dUp += (i === 0 ? "M" : "L") + x.toFixed(1) + "," + yU.toFixed(1) + " ";
    dDown += (i === 0 ? "M" : "L") + x.toFixed(1) + "," + yD.toFixed(1) + " ";
  }
  makeEl("path", { d: dUp }, g);
  makeEl("path", { d: dDown }, g);
  makeEl(
    "circle",
    { cx: -width / 2, cy: 0, r: 1.4, class: "dot accent" },
    g
  );
  makeEl("circle", { cx: width / 2, cy: 0, r: 1.4, class: "dot accent" }, g);
  return width * 2.6 + 20;
};

// =====================================================
// Biblical motifs
// =====================================================

const cross: MotifFn = (g) => {
  const h = rand(30, 56);
  const w = h * 0.62;
  const armY = -h * 0.18;
  makeEl("line", { x1: 0, y1: -h / 2, x2: 0, y2: h / 2 }, g);
  makeEl("line", { x1: -w / 2, y1: armY, x2: w / 2, y2: armY }, g);
  return h + w + 20;
};

const vesicaPiscis: MotifFn = (g) => {
  const r = rand(20, 38);
  const d = r * 0.85;
  makeEl("circle", { cx: -d / 2, cy: 0, r }, g);
  makeEl("circle", { cx: d / 2, cy: 0, r }, g);
  return 4 * Math.PI * r + 20;
};

const trinity: MotifFn = (g) => {
  const s = rand(28, 48);
  const h = (s * Math.sqrt(3)) / 2;
  const pts: [number, number][] = [
    [0, (-h * 2) / 3],
    [-s / 2, h / 3],
    [s / 2, h / 3],
  ];
  for (let i = 0; i < 3; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % 3];
    makeEl("line", { x1, y1, x2, y2 }, g);
  }
  for (const [x, y] of pts) {
    makeEl("circle", { cx: x, cy: y, r: 1.6, class: "dot" }, g);
  }
  return s * 3 + 20;
};

const chiRho: MotifFn = (g) => {
  const s = rand(20, 38);
  makeEl("line", { x1: -s, y1: -s, x2: s, y2: s }, g);
  makeEl("line", { x1: -s, y1: s, x2: s, y2: -s }, g);
  makeEl("line", { x1: 0, y1: -s * 1.2, x2: 0, y2: s * 1.2 }, g);
  makeEl("circle", { cx: s * 0.25, cy: -s * 0.7, r: s * 0.25 }, g);
  return s * 8 + 20;
};

const roseWindow: MotifFn = (g) => {
  const r = rand(28, 46);
  const petals = pick([6, 8, 12] as const);
  makeEl("circle", { cx: 0, cy: 0, r }, g);
  makeEl("circle", { cx: 0, cy: 0, r: r * 0.45 }, g);
  for (let i = 0; i < petals; i++) {
    const a = (Math.PI * 2 * i) / petals;
    const x1 = Math.cos(a) * r * 0.45;
    const y1 = Math.sin(a) * r * 0.45;
    const x2 = Math.cos(a) * r;
    const y2 = Math.sin(a) * r;
    makeEl("line", { x1, y1, x2, y2 }, g);
  }
  return 2 * Math.PI * r + 2 * Math.PI * r * 0.45 + petals * r * 0.55 + 20;
};

const menorah: MotifFn = (g) => {
  const w = rand(40, 64);
  const armH = rand(14, 22);
  const stemH = armH + rand(10, 18);
  const arms = 7;
  const baseY = stemH;
  const tipY = -armH;
  let len = 0;
  makeEl("line", { x1: -w / 2, y1: baseY, x2: w / 2, y2: baseY }, g);
  len += w;
  for (let i = 0; i < arms; i++) {
    const x = -w / 2 + (w * i) / (arms - 1);
    makeEl("line", { x1: x, y1: baseY, x2: x, y2: tipY }, g);
    len += baseY - tipY;
    makeEl(
      "circle",
      { cx: x, cy: tipY - 2, r: 1.2, class: "dot accent" },
      g
    );
  }
  return len + 20;
};

const celticCross: MotifFn = (g) => {
  const h = rand(32, 52);
  const w = h * 0.7;
  const ringR = h * 0.32;
  makeEl("line", { x1: 0, y1: -h / 2, x2: 0, y2: h / 2 }, g);
  makeEl("line", { x1: -w / 2, y1: 0, x2: w / 2, y2: 0 }, g);
  makeEl("circle", { cx: 0, cy: 0, r: ringR }, g);
  return h + w + 2 * Math.PI * ringR + 20;
};

const dove: MotifFn = (g) => {
  const s = rand(18, 28);
  makeEl(
    "line",
    { x1: -s * 1.6, y1: 0, x2: -s * 0.3, y2: -s * 0.3 },
    g
  );
  makeEl(
    "line",
    { x1: -s * 0.3, y1: -s * 0.3, x2: s * 0.3, y2: -s * 0.3 },
    g
  );
  makeEl(
    "line",
    { x1: s * 0.3, y1: -s * 0.3, x2: s * 1.6, y2: 0 },
    g
  );
  makeEl(
    "line",
    { x1: -s * 0.3, y1: -s * 0.3, x2: 0, y2: s * 0.6 },
    g
  );
  makeEl(
    "line",
    { x1: s * 0.3, y1: -s * 0.3, x2: 0, y2: s * 0.6 },
    g
  );
  return s * 7 + 20;
};

// =====================================================
// Supporting geometric motifs
// =====================================================

const circle: MotifFn = (g) => {
  const r = rand(18, 56);
  makeEl("circle", { cx: 0, cy: 0, r }, g);
  return 2 * Math.PI * r + 20;
};

const hex: MotifFn = (g) => {
  const s = rand(14, 26);
  let len = 0;
  const pts: [number, number][] = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i;
    pts.push([Math.cos(a) * s, Math.sin(a) * s]);
  }
  for (let i = 0; i < 6; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % 6];
    makeEl("line", { x1, y1, x2, y2 }, g);
    len += Math.hypot(x2 - x1, y2 - y1);
  }
  if (Math.random() < 0.4) {
    for (let i = 0; i < 6; i += 2) {
      const [x, y] = pts[i];
      makeEl("line", { x1: 0, y1: 0, x2: x, y2: y }, g);
      len += Math.hypot(x, y);
    }
  }
  return len + 20;
};

const triGrid: MotifFn = (g) => {
  const s = rand(16, 24);
  let len = 0;
  const offsets: [number, number][] = [
    [0, 0],
    [s, s * 0.6],
    [-s, s * 0.6],
    [s * 2, 0],
    [-s * 2, 0],
  ];
  for (const [ox, oy] of offsets) {
    const a: [number, number] = [ox, oy - s * 0.4];
    const b: [number, number] = [ox - s * 0.5, oy + s * 0.3];
    const c: [number, number] = [ox + s * 0.5, oy + s * 0.3];
    makeEl("line", { x1: a[0], y1: a[1], x2: b[0], y2: b[1] }, g);
    makeEl("line", { x1: b[0], y1: b[1], x2: c[0], y2: c[1] }, g);
    makeEl("line", { x1: c[0], y1: c[1], x2: a[0], y2: a[1] }, g);
    len += s * 3;
  }
  return len + 20;
};

const lineCluster: MotifFn = (g) => {
  const count = Math.floor(rand(3, 7));
  let len = 0;
  for (let i = 0; i < count; i++) {
    const x1 = rand(-50, 50),
      y1 = rand(-30, 30);
    const x2 = x1 + rand(-60, 60),
      y2 = y1 + rand(-60, 60);
    makeEl("line", { x1, y1, x2, y2 }, g);
    len += Math.hypot(x2 - x1, y2 - y1);
  }
  return len + 20;
};

const annotation: MotifFn = (g) => {
  // CAD-style note: a dot + lead line + small perpendicular tick
  const accent = Math.random() < 0.6;
  const cls = accent ? "accent" : "";
  const r = 5;
  makeEl("circle", { cx: 0, cy: 0, r, class: "dot" + (accent ? " accent" : "") }, g);
  const len = rand(28, 70);
  makeEl(
    "line",
    { x1: r, y1: 0, x2: r + len, y2: 0, class: cls },
    g
  );
  makeEl(
    "line",
    { x1: r + len, y1: -6, x2: r + len, y2: 6, class: cls },
    g
  );
  return r * Math.PI * 2 + len + 20;
};

// =====================================================
// Motif pool (weighted by repetition)
// =====================================================

export const MOTIFS: Record<string, MotifFn> = {
  // 432 Hz cymatic
  concentric,
  sineWave,
  lissajous,
  radialBurst,
  phyllotaxis,
  standingWave,
  // Biblical
  cross,
  vesicaPiscis,
  trinity,
  chiRho,
  roseWindow,
  menorah,
  celticCross,
  dove,
  // Supporting geometric
  circle,
  hex,
  triGrid,
  lineCluster,
  annotation,
};

/**
 * Weighted motif name pool (cymatic + biblical core get 2x weight,
 * supporting cast 1x). Pick uniformly from this array.
 */
export const MOTIF_POOL: string[] = [
  "concentric",
  "concentric",
  "sineWave",
  "sineWave",
  "lissajous",
  "radialBurst",
  "phyllotaxis",
  "standingWave",
  "cross",
  "cross",
  "vesicaPiscis",
  "vesicaPiscis",
  "trinity",
  "chiRho",
  "roseWindow",
  "menorah",
  "celticCross",
  "dove",
  "circle",
  "hex",
  "triGrid",
  "lineCluster",
  "annotation",
];

/**
 * Pick a point that avoids the central readable area of the viewport.
 * The viewBox is dynamic (matches innerWidth/innerHeight), so margins
 * are expressed as ratios of the available width/height.
 */
export function pickEdgePosition(
  width: number,
  height: number
): [number, number] {
  // Reserve a central rectangle (~ 16-86% horizontally, 18-82% vertically) for content.
  const xMargin = width * 0.16;
  const yMargin = height * 0.18;
  const zones = [
    { x1: 0, x2: width, y1: 0, y2: yMargin }, // top band
    { x1: 0, x2: width, y1: height - yMargin, y2: height }, // bottom band
    { x1: 0, x2: xMargin, y1: 0, y2: height }, // left band
    { x1: width - xMargin, x2: width, y1: 0, y2: height }, // right band
    // Corner weights — picked twice to bias toward corners
    { x1: 0, x2: xMargin, y1: 0, y2: yMargin },
    { x1: width - xMargin, x2: width, y1: 0, y2: yMargin },
    { x1: 0, x2: xMargin, y1: height - yMargin, y2: height },
    { x1: width - xMargin, x2: width, y1: height - yMargin, y2: height },
  ];
  const z = pick(zones);
  return [rand(z.x1, z.x2), rand(z.y1, z.y2)];
}

export { makeEl, rand, pick };
