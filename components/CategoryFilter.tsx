"use client";

export type HymnCategory = "all" | "japanese" | "english" | "my";

const OPTIONS: Array<{ value: HymnCategory; label: string }> = [
  { value: "all", label: "All" },
  { value: "japanese", label: "日本語" },
  { value: "english", label: "English" },
  { value: "my", label: "My Songs" },
];

type Props = {
  value: HymnCategory;
  counts: Record<HymnCategory, number>;
  onChange: (next: HymnCategory) => void;
};

export function CategoryFilter({ value, counts, onChange }: Props) {
  return (
    <nav
      aria-label="Hymn category filter"
      className="flex flex-wrap gap-1 mb-6 border border-foreground/10 rounded-md p-1 bg-foreground/[0.02]"
    >
      {OPTIONS.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={active}
            className={`flex-1 min-w-[80px] px-3 py-2 rounded-md text-xs font-medium tracking-wide transition-colors ${
              active
                ? "bg-foreground/10 text-foreground"
                : "text-foreground/60 hover:text-foreground hover:bg-foreground/5"
            }`}
          >
            <span className="block">{opt.label}</span>
            <span className="block text-[10px] opacity-60 mt-0.5 font-mono">
              {counts[opt.value]}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
