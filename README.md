# worship-chord

Dark-mode chord & lyric viewer for public-domain hymns, built with Next.js 16 + ChordSheetJS + Tailwind v4.

## Vision

- **Dark mode default** — black background (#0a0a0a), white text. Optimized for low-light environments (church, evening live, stage wings).
- **Public-domain hymns only** — initial MVP includes 5 PD-confirmed English hymns. User-added songs stay in browser IndexedDB and are never included in the repository.
- **Chord transposition** — ±semitone control, snappy CSS transitions (≤100ms).
- **PWA** — installable on iOS Safari, screen wake lock for hands-free reading.

See [CREDITS.md](./CREDITS.md) for the public-domain basis of each included hymn.

## Tech stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- ChordSheetJS v15.3.1+ (ChordPro parsing & transposition)
- Zustand (state) + Dexie.js (IndexedDB for user-added songs)
- Manual PWA setup (`app/manifest.ts` + `public/sw.js`)
- Deployed on Vercel

## Development

```bash
npm install
npm run dev
```

## License

[MIT](./LICENSE) for the code. Public-domain hymn texts are credited individually in [CREDITS.md](./CREDITS.md). User-added songs are stored locally in the user's browser (IndexedDB) and never transmitted to the server.
