# worship-chord

**Japanese hymns shared with the world.** A non-commercial, dark-mode viewer for public-domain hymn chord sheets — focused on Japanese translations of historic hymns from the Meiji and Taishō eras, alongside their English originals.

Live: <https://emuzcode.github.io/worship-chord/>

## Why this exists

Many Japanese church songs translated by missionaries and early Japanese Christians are now in the public domain (translator's death + 70 years has elapsed), yet they're rarely available outside Japan in a form a guitarist can read and sing. worship-chord aims to make these songs discoverable to English-speaking Christians who love the global church, with romanization so anyone can sing along.

## What's inside

- **Japanese public-domain hymns** with Japanese lyrics and romanization side by side, so non-Japanese speakers can follow.
- **English public-domain hymns** (Amazing Grace, Be Thou My Vision, It Is Well, Holy Holy Holy, Great Is Thy Faithfulness) as cultural reference points — many of them are the originals of the Japanese translations on the site.
- **±semitone chord transposition** powered by ChordSheetJS.
- **Dark theme by default**, optimized for low-light environments (church, evening live, stage wings). A ☀ / ☾ toggle in the player bar switches to light.
- **Screen wake lock** while viewing a hymn, so the screen stays on while you play.
- **PWA**, installable on iOS Safari and Android, with offline cache via service worker.
- **/my**: write and store your own hymns locally in the browser (IndexedDB). They are never uploaded or shared.

See [CREDITS.md](./CREDITS.md) for the public-domain basis of each included hymn.

## Tech stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- ChordSheetJS v15.3.1+ (ChordPro parsing & transposition)
- Zustand (state) + Dexie.js (IndexedDB for user-added songs)
- Manual PWA setup (`app/manifest.ts` + `public/sw.js`)
- Deployed on GitHub Pages (`output: 'export'` + `basePath: '/worship-chord'`)

## Development

```bash
npm install
npm run dev
```

## Non-commercial

This project does not run ads, sell subscriptions, or accept payment. The goal is simply to make Japan's hymn tradition more reachable. If you find a song you love, sing it.

## License

[MIT](./LICENSE) for the code. Public-domain hymn texts are credited individually in [CREDITS.md](./CREDITS.md). User-added songs are stored locally in the user's browser (IndexedDB) and never transmitted to the server.
