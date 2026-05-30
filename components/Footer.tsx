const REPO = "https://github.com/emuzcode/worship-chord";

export function Footer() {
  return (
    <footer className="w-full max-w-3xl mx-auto px-4 py-4 text-[11px] opacity-50 text-center content-backdrop">
      <p>
        Public-domain hymns · non-commercial ·{" "}
        <a
          href={REPO}
          target="_blank"
          rel="noreferrer"
          className="underline hover:opacity-100 transition-opacity"
        >
          source
        </a>{" "}
        ·{" "}
        <a
          href={`${REPO}/blob/main/CREDITS.md`}
          target="_blank"
          rel="noreferrer"
          className="underline hover:opacity-100 transition-opacity"
        >
          credits
        </a>
      </p>
    </footer>
  );
}
