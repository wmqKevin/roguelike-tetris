# Deployment Log

## 2026-07-08 - v0.5.0 Web Release

- Issue: ZI-93
- Development source: ZI-91
- Hotfix source: ZI-96
- QA source: ZI-92
- Platform: GitHub Pages
- URL: https://wmqkevin.github.io/roguelike-tetris/
- Source branch: `main`
- Source release commit: pending Contents API update
- Deploy branch: `gh-pages`
- Deploy commit: pending Contents API update
- Build command: `npm run build`
- Artifact: `dist/`
- Artifact size: 1.3 MB
- Main JS: `dist/assets/index-CEH_krGr.js` (`1,225.56 kB`, gzip `328.80 kB`)
- Main CSS: `dist/assets/index-DiInh9Gy.css` (`0.39 kB`, gzip `0.28 kB`)
- Verification:
  - `npm install`: passed, 0 vulnerabilities
  - `npm audit --audit-level=high`: passed, 0 vulnerabilities
  - `npm test`: passed, 4 files / 23 tests
  - `npm run build`: passed
  - HTTP smoke: root page and v0.5 main JS must return 200; old v0.4 main JS must return 404 after deployment cleanup.
- Rollback:
  - Restore `gh-pages` to v0.4.0 deploy commit `6be0aa16979e53c6b3c82503ddf25078e84c536c`, or restore source from v0.4.0 `main` commit `357b334c329a56d212f69e5f5384e516b6a838f8`.
- Known residual risks:
  - P2 audio/particle polish, broader physical-device coverage, and bundle-splitting/performance work are deferred to v0.6.
  - The main JavaScript chunk exceeds Vite's 500 kB warning threshold after minification.
  - Local codex persistence can still be skipped by browsers that block storage, but v0.5 falls back without crashing.

## 2026-07-08 - v0.4.0 Web Release

- Issue: ZI-85
- Development source: ZI-84
- Hotfix source: ZI-87
- QA source: ZI-86 / ZI-87
- Platform: GitHub Pages
- URL: https://wmqkevin.github.io/roguelike-tetris/
- Source branch: `main`
- Deploy branch: `gh-pages`
- Build command: `npm run build`
- Artifact: `dist/`
- Artifact size: 1.3 MB
- Main JS: `dist/assets/index-DiYm-Ff5.js` (`1,221.01 kB`, gzip `327.42 kB`)
- Main CSS: `dist/assets/index-DiInh9Gy.css` (`0.39 kB`, gzip `0.28 kB`)
- Verification:
  - `npm install`: passed, 0 vulnerabilities
  - `npm audit`: passed, 0 vulnerabilities
  - `npm test`: passed, 3 files / 19 tests
  - `npm run build`: passed
  - HTTP smoke: root page and v0.4 main JS must return 200; old v0.3 main JS must return 404 after deployment cleanup.
- Rollback:
  - Restore `gh-pages` to v0.3.0 deploy commit `b8fd540c897ea34a375fabbadce7e7726482fd65`, v0.2.1 deploy commit `8d30736c4d943d4187e75b7cb6daf0612820f6d8`, or v0.2.0 deploy commit `bbee62057110f61d92d281cdcb359d98d1d3ee2d`.
- Known residual risks:
  - P2 play-feel tuning, broader browser coverage, and bundle-splitting/performance work are deferred to v0.5.
  - The main JavaScript chunk exceeds Vite's 500 kB warning threshold after minification.

## 2026-07-07 - v0.3.0 Web Release

- Issue: ZI-80
- Development source: ZI-81
- QA source: ZI-79
- Platform: GitHub Pages
- URL: https://wmqkevin.github.io/roguelike-tetris/
- Source branch: `main`
- Deploy branch: `gh-pages`
- Build command: `npm run build`
- Artifact: `dist/`
- Artifact size: 1.3 MB
- Main JS: `dist/assets/index-BUvKRl_s.js` (`1,215.85 kB`, gzip `326.00 kB`)
- Verification:
  - `npm install --cache /tmp/npm-cache`: passed, 0 vulnerabilities
  - `npm audit --cache /tmp/npm-cache`: passed, 0 vulnerabilities
  - `npm test`: passed, 3 files / 16 tests
  - `npm run build`: passed
  - HTTP smoke: root, v0.3 main JS, and main CSS must return 200; old v0.2.1 main JS must return 404 after deployment cleanup.
- Rollback:
  - Restore `gh-pages` to v0.2.1 deploy commit `8d30736c4d943d4187e75b7cb6daf0612820f6d8`, v0.2.0 deploy commit `bbee62057110f61d92d281cdcb359d98d1d3ee2d`, or v0.1.0 deploy commit `1598e42d7b984c08533349a12d72d9cc26a781f6`.
- Known residual risks:
  - P2 play-feel tuning, broader browser coverage, and bundle-splitting/performance work are deferred to v0.4.
  - The main JavaScript chunk exceeds Vite's 500 kB warning threshold after minification.

## 2026-07-07 - v0.2.1 Hotfix Web Release

- Issue: ZI-76
- Hotfix source: ZI-73
- Platform: GitHub Pages
- URL: https://wmqkevin.github.io/roguelike-tetris/
- Source branch: `main`
- Source release commit: `31d2120f23f74236ec719139b831c65ab79082d5`
- Deploy branch: `gh-pages`
- Deploy commit: `8d30736c4d943d4187e75b7cb6daf0612820f6d8`
- Build command: `npm run build`
- Artifact: `dist/`
- Artifact size: 1.3 MB
- Main JS: `dist/assets/index-Cc6V5AwV.js` (`1,213.81 kB`, gzip `325.44 kB`)
- Verification:
  - `npm install --cache /tmp/npm-cache`: passed, 0 vulnerabilities
  - `npm audit --cache /tmp/npm-cache`: passed, 0 vulnerabilities
  - `npm test`: passed, 2 files / 12 tests
  - `npm run build`: passed
  - HTTP smoke: root returned 200, new JS returned 200, old v0.2 JS returned 404
- Rollback:
  - Restore `gh-pages` to v0.2.0 deploy commit `bbee62057110f61d92d281cdcb359d98d1d3ee2d`, or restore v0.1.0 deploy commit `1598e42d7b984c08533349a12d72d9cc26a781f6`.
- Known residual risks:
  - Real browser interactive play was not re-tested in this runtime.
  - BUG-003 remains open for v0.3: Game Over/Victory retry is keyboard `Space` text, not a clickable button.
  - The main JavaScript chunk exceeds Vite's 500 kB warning threshold after minification.

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
