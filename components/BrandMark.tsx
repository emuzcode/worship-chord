type Props = {
  size?: number;
  className?: string;
};

/**
 * Inline brand mark — the 賛 kanji (賛美 = worship) rendered as an SVG so it
 * inherits currentColor and the parent's font-smoothing. Matches the favicon
 * and apple-touch-icon assets in app/ + public/.
 */
export function BrandMark({ size = 32, className }: Props) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      aria-hidden="true"
      className={className}
    >
      <text
        x="50"
        y="78"
        textAnchor="middle"
        fontSize="84"
        fontWeight="700"
        fontFamily="'Hiragino Sans', 'Yu Gothic', 'Noto Sans CJK JP', sans-serif"
        fill="currentColor"
      >
        賛
      </text>
    </svg>
  );
}
