---
description: Build and deploy CROWNMIND to Neocities static hosting
---

# Deploy CROWNMIND to Neocities

This workflow prepares the production build for static hosting at `https://deffy.me/CROWNMIND/`.

1. Verify the Vite base path in `vite.config.ts` is set to `/CROWNMIND/`.
2. Build the production bundle:
   ```bash
   npm run build
   ```
3. Confirm the `dist/` folder contains `index.html` and the `assets/` subfolder.
4. Open the Neocities site manager for the target site.
5. Upload **all contents of `dist/`** (not the `dist` folder itself) into the `/CROWNMIND/` directory on the site.
6. Visit `https://deffy.me/CROWNMIND/` and verify the page loads and asset URLs (e.g. `/CROWNMIND/assets/index-*.js`) resolve correctly.

**Constraints:** Neocities serves static files only. Server-side features, API secrets, or backend integrations must be handled separately and are not supported by this hosting path.
