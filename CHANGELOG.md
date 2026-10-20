# Changelog — Babunest Storefront

Newest first. Rules and entry format are in `CLAUDE.md`. Entries before
2026-10-20 belong to the Brownmoor project and are not carried over.

<!-- entries -->

### 2026-10-20 · config · Prepare the storefront for Railway hosting
- **What:** `npm start` now listens on `$PORT` (default 3001). Removed the Vercel Blob image host from `next.config.ts`. `DEPLOYMENT.md` now covers Railway.
- **Why:** Railway hosts both apps; images are served by the backend from its volume.
- **Files:** `package.json`, `next.config.ts`, `src/lib/pixel.ts` (comment), `DEPLOYMENT.md`, `CODEMAP.md`
- **Status:** `tsc` and `npm run build` pass, and `PORT=4123 npm start` listened on 4123. Not yet deployed.

### 2026-10-20 · docs · Set up guidelines, code map and changelog for the fresh start
- **What:** Rewrote `CLAUDE.md` as short rules (read the map, log every change, keep replies to the user short) and added `CODEMAP.md`, a map of the current code. Restarted this changelog in a compact format.
- **Why:** So AI sessions read one map and the latest entries instead of re-reading the source each time, which saves tokens.
- **Files:** `CLAUDE.md`, `CODEMAP.md`, `CHANGELOG.md`
- **Status:** The map was written from a full read of the code on 2026-10-20. It is not checked by any tool and stays correct only if each change updates it.
