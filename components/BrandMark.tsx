type Props = {
  /**
   * Optional rendered height in pixels. Width is set at the natural 4:1
   * ratio. When omitted, the SVG has no fixed dimensions and scales to
   * whatever width the parent (or className) sets — the viewBox keeps
   * the aspect.
   */
  size?: number;
  className?: string;
};

/**
 * Inline brand mark — the word MIZMOR built entirely from music-notation
 * shapes. Each glyph is constructed in SVG paths so currentColor inherits
 * cleanly across light/dark themes:
 *
 *   M = 2-peak sine wave (Q-Bezier)
 *   I = note stem + tilted quarter-note head
 *   Z = sawtooth wave (top horizontal → diagonal → bottom horizontal)
 *   M = 2-peak sine wave
 *   O = three concentric cymatic rings (432 Hz nodal pattern)
 *   R = arc bowl + diagonal leg
 *
 * The compact-square favicon and OG card use the same vocabulary at
 * different scales so the brand reads consistently across surfaces.
 */
export function BrandMark({ size, className }: Props) {
  const width = size ? Math.round(size * 4) : undefined;
  return (
    <svg
      viewBox="0 0 240 60"
      width={width}
      height={size}
      aria-hidden="true"
      className={className}
    >
      {/* M — sine 2-peak */}
      <path
        d="M 6 50 Q 14 10 22 50 Q 30 10 38 50"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* I — quarter-note stem + tilted head */}
      <line
        x1="50"
        y1="8"
        x2="50"
        y2="48"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <ellipse
        cx="48"
        cy="50"
        rx="5"
        ry="3.5"
        fill="currentColor"
        transform="rotate(-22 48 50)"
      />
      {/* Z — sawtooth wave */}
      <path
        d="M 66 16 L 96 16 L 66 50 L 96 50"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* M — sine 2-peak */}
      <path
        d="M 108 50 Q 116 10 124 50 Q 132 10 140 50"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* O — cymatic concentric rings */}
      <circle
        cx="170"
        cy="32"
        r="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
      <circle
        cx="170"
        cy="32"
        r="12"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.7"
        opacity="0.5"
      />
      <circle
        cx="170"
        cy="32"
        r="6"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.6"
        opacity="0.35"
      />
      {/* R — arc bowl + diagonal leg */}
      <path
        d="M 200 50 L 200 16 L 218 16 Q 228 16 228 24 Q 228 32 218 32 L 200 32"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="218"
        y1="32"
        x2="232"
        y2="50"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
