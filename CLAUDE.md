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

## Deployment
Deploys to Netlify. CI builds and deploys from the `4.x` branch. The `build:public` script creates the deployable `public/` folder.
