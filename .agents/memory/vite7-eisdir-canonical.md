---
name: Vite 7 EISDIR on href="/"
description: Vite 7 changed build-html to process all <link href> attrs as local assets — href="/" causes EISDIR crash during production build.
---

**The bug:** A `<link rel="canonical" href="/" />` in `index.html` caused the Vite 7 production build to fail with:
```
[vite:build-html] EISDIR: illegal operation on a directory, read
file: .../index.html
```

**Why:** Vite 7's `build-html` plugin calls `processAssetUrl` on every `<link href>` attribute (not just stylesheets). When `href="/"` is resolved relative to the Vite project root, it resolves to the project directory. Vite's `fileToBuiltUrl` then calls `readFile()` on that directory path, which throws `EISDIR`.

**Fix:** Remove `<link rel="canonical" href="/" />` from `index.html`. Self-referential canonical tags on a SPA root are redundant. If canonical links are needed, inject them dynamically in React (e.g. using a `<Helmet>` equivalent or `document.head`).

**How to apply:** Any time `<link href>` in `index.html` uses a value that resolves to a directory (e.g. `"/"`, `"./"`, `"../"`), Vite 7 will throw EISDIR during build. Keep `<link href>` values pointing to actual files (`/favicon.svg`, `/sitemap.xml`) or absolute external URLs.
