"use client";

export function ChordProHelp() {
  return (
    <details className="rounded-lg border border-foreground/10 mt-4">
      <summary className="cursor-pointer px-4 py-3 text-sm font-semibold opacity-80 select-none">
        How to write ChordPro
      </summary>
      <div className="px-4 pb-4 text-sm opacity-70 space-y-3">
        <p>
          A song is plain text with{" "}
          <code className="font-mono">{"{directives}"}</code> for metadata and{" "}
          <code className="font-mono">[chord]</code> markers inline with lyrics.
        </p>
        <pre className="font-mono text-xs bg-foreground/5 p-3 rounded overflow-x-auto whitespace-pre">
{`{title: Amazing Grace}
{key: G}

{start_of_verse}
[G]Amazing [G7]grace! How [C]sweet the [G]sound
That [G]saved a wretch like [D]me!
{end_of_verse}
`}
        </pre>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <code className="font-mono">{"{title: ...}"}</code>,{" "}
            <code className="font-mono">{"{key: ...}"}</code>,{" "}
            <code className="font-mono">{"{capo: ...}"}</code>,{" "}
            <code className="font-mono">{"{tempo: ...}"}</code> for metadata
          </li>
          <li>
            <code className="font-mono">{"{start_of_verse}"}</code> /{" "}
            <code className="font-mono">{"{end_of_verse}"}</code>,{" "}
            <code className="font-mono">{"{start_of_chorus}"}</code> /{" "}
            <code className="font-mono">{"{end_of_chorus}"}</code> for sections
          </li>
          <li>
            <code className="font-mono">[C]</code>,{" "}
            <code className="font-mono">[G7]</code>,{" "}
            <code className="font-mono">[Em]</code> placed inline before lyrics —
            they will render above the next word
          </li>
        </ul>
        <p>
          Once saved, the ±semitone buttons on the detail view transpose every
          chord automatically.
        </p>
      </div>
    </details>
  );
}
