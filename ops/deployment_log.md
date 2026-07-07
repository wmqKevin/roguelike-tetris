# Deployment Log

## 2026-07-07 - v0.2 Web Release

- Issue: ZI-71
- Platform: GitHub Pages
- URL: https://wmqkevin.github.io/roguelike-tetris/
- Source branch: `main`
- Source release commit: `c6cae43219e4be030fb1f49d22ff2111b337c49e`
- Deploy branch: `gh-pages`
- Deploy commit: `bbee62057110f61d92d281cdcb359d98d1d3ee2d`
- Build command: `npm run build`
- Artifact: `dist/`
- Artifact size: 1.3 MB
- Main JS: `dist/assets/index-D37DjcST.js` (`1,213.75 kB`, gzip `325.43 kB`)
- Verification:
  - `npm install --cache /tmp/npm-cache`: passed, 0 vulnerabilities
  - `npm audit --cache /tmp/npm-cache`: passed, 0 vulnerabilities
  - `npm test -- --run`: passed, 2 files / 9 tests
  - `npm run build`: passed
  - HTTP smoke: page, v0.2 main JS, and main CSS returned 200; old v0.1 main JS returned 404
- Rollback:
  - Restore `gh-pages` to the previous known-good v0.1.0 deploy commit `1598e42d7b984c08533349a12d72d9cc26a781f6`, or disable Pages / change Pages source in repository settings if availability issues occur.
- Known residual risks:
  - Real browser feel was not re-tested because Chrome/Chromium is unavailable in this runtime.
  - BUG-003 remains open for v0.3: Game Over/Victory retry is keyboard `Space` text, not a clickable button.
  - The main JavaScript chunk exceeds Vite's 500 kB warning threshold after minification.

## 2026-07-07 - v0.1.0 Web MVP

- Issue: ZI-63
- Platform: GitHub Pages
- URL: https://wmqkevin.github.io/roguelike-tetris/
- Source branch: `main`
- Source release note commit: `eca6c84106f918947b79aed6a1b41a755d548ae3`
- Deploy branch: `gh-pages`
- Deploy commit: `1598e42d7b984c08533349a12d72d9cc26a781f6`
- Build command: `npm run build`
- Artifact: `dist/`
- Artifact size: 1.2 MB
- Main JS: `dist/assets/index-CQHPF2iC.js` (`1,208.78 kB`, gzip `323.79 kB`)
- Verification:
  - `npm install --cache /tmp/npm-cache`: passed, 0 vulnerabilities
  - `npm audit --cache /tmp/npm-cache`: passed, 0 vulnerabilities
  - `npm test -- --run`: passed, 2 files / 7 tests
  - `npm run build`: passed
  - HTTP smoke: page, main JS, and main CSS returned 200
- Rollback:
  - Restore `gh-pages` to the previous known-good deploy commit, or disable Pages / change Pages source in repository settings if availability issues occur.
- Known residual risks:
  - Reward cards look clickable but currently support keyboard `1` / `2` / `3` selection only.
  - Browser compatibility is smoke-only in this runtime; no real multi-browser screenshot run was performed.
