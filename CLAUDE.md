# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Indonesian wedding invitation template ("undangan pernikahan") built with vanilla HTML/CSS/JavaScript. Uses Bootstrap 5.3.8, AOS animations, FontAwesome, and Canvas Confetti. No frontend framework — just ES modules bundled with esbuild.

The app has two pages:
- **`index.html`** — Guest-facing invitation with countdown, comments, RSVP, photo gallery, audio/video
- **`dashboard.html`** — Admin panel for managing comments, settings, and user stats

## Commands

```bash
npm install              # Install dependencies
npm run dev              # Dev server at http://localhost:8080 (esbuild serve)
npm run build            # Bundle + minify JS to dist/
npm run build:public     # Build + copy assets/css/dist/html into public/ for deployment
npm run lint:js          # ESLint (js/)
npm run lint:css         # Stylelint (css/)
npm run lint:html        # HTMLHint (all .html files)
npx madge --circular js  # Check for circular dependencies
```

## Architecture

### Entry Points
- **`js/guest.js`** → imports `js/app/guest/guest.js` → initializes guest page, exposes `window.undangan`
- **`js/admin.js`** → imports `js/app/admin/admin.js` → initializes admin dashboard, exposes `window.undangan`

esbuild bundles `js/*.js` (both entry points) into `dist/`.

### Module Structure
- **`js/app/guest/`** — Guest page modules: audio player, video, image gallery, progress loader, slideshow
- **`js/app/admin/`** — Admin modules: auth (JWT), navbar, user management
- **`js/app/components/`** — Shared UI: comment system, card rendering, GIF (Tenor API), like button, pagination
- **`js/common/`** — Shared utilities: theme (dark/light/auto), language (i18n), offline detection, localStorage wrapper (`storage`), session management, DOM helpers (`util`)
- **`js/connection/`** — HTTP layer: `request.js` (fetch wrapper with caching, retry, abort, download support), `dto.js` (response transforms), `cache.js` (Cache API wrapper for assets)
- **`js/libs/`** — Bootstrap modal/tooltip helpers, confetti animations, CDN resource loader

### Backend Connection
The backend URL and access key are configured via `data-url` and `data-key` attributes on `<body>` in HTML files. The `request()` function builds URLs relative to `data-url`. Auth uses JWT tokens (Bearer) for admin, access keys (`x-access-key` header) for guests.

### Key Patterns
- All modules use the **revealing module pattern** (IIFE returning public API)
- `pool.init(callback, cacheNames)` initializes Cache API pools and must be called before any requests
- `progress` tracks loading of multiple resources (images, video, audio, libs) before showing the page
- `storage(name)` is a thin wrapper over `localStorage` with JSON serialization
- HTML uses inline `onclick` handlers calling `window.undangan.*` methods

## Linting Rules
- ESLint enforces: semicolons, `===`, `prefer-const`, `no-var`, `no-console` (warn/error allowed), no circular deps
- Stylelint uses `stylelint-config-recommended`
- CI runs all linters + circular dependency check on the `4.x` branch

## Gallery
Photos in `assets/gallery/` are auto-loaded into the gallery section:
1. `npm run gallery` (or `npm run build`) scans the folder → generates `assets/gallery/gallery.json`
2. `js/app/guest/gallery.js` fetches the JSON at runtime and dynamically builds a Bootstrap carousel
3. All images in one carousel, sorted by filename

## Image Customizations
- `assets/images/couple.jpg` — homepage circle photo + background (used everywhere `bg.webp` was)
- `assets/images/couple-loading.jpg` — welcome/loading page photo
- `assets/images/husband.png` / `wife.png` — individual photos in the bride section
- Desktop slideshow uses `couple.jpg` (was picsum.photos external URLs)

## Deployment (GitHub Pages)

**Repo**: https://github.com/MathewXie/wedding-indonesianstyle1

### Deploy Commands

```bash
npm run build:public

# IMPORTANT: Do NOT use `npx gh-pages -d public`
# Root .gitignore contains "dist", which causes gh-pages tool to skip public/dist/
# Instead, manually push from public/:

cd public
git init
git checkout -b gh-pages
git add -A
git commit -m "deploy"
git remote add origin https://<TOKEN>@github.com/MathewXie/wedding-indonesianstyle1.git
git push origin gh-pages --force
cd ..
rm -rf public/.git
```

GitHub Pages settings: Settings → Pages → Source: `gh-pages` branch, `/ (root)`.
Live URL: https://mathewxie.github.io/wedding-indonesianstyle1/

### Known Pitfalls

1. **`npx gh-pages -d public` skips `dist/` folder** — Root `.gitignore` has `dist`, the tool applies it to `public/dist/` too. `-t` flag and `public/.gitignore` overrides do NOT work. Must use manual git push from inside `public/`.

2. **External image URLs block page loading** — The progress system waits for ALL resources before showing the page. If any image URL is unreachable (e.g. `picsum.photos` blocked in China), the page stays stuck on the loading bar forever. Always use local images.

3. **GitHub fine-grained token permissions** — Needs these Repository permissions:
   - **Contents**: Read and write
   - **Workflows**: Read and write (repo has `.github/workflows/`)
   - **Pages**: Read and write

4. **CDN dependencies** — Bootstrap, FontAwesome, AOS, Confetti, Google Fonts load from `cdn.jsdelivr.net` and `fonts.googleapis.com`. May be slow in China. If issues arise, consider bundling locally.

### Build Pipeline
1. `npm run gallery` → scans `assets/gallery/` → generates `gallery.json`
2. `npm run build` → runs gallery + esbuild bundles `js/*.js` → `dist/`
3. `npm run build:public` → runs build + copies assets/css/dist/html → `public/`
