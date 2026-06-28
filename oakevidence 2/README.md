# OakEvidence — Marketing Site

A static site (plain HTML/CSS/JS, no build step). Everything lives under one
folder, with `index.html` at the root and all assets in `assets/`.

```
oakevidence/
├── index.html
├── netlify.toml
└── assets/
    ├── css/styles.css
    ├── js/main.js
    ├── fonts/  (DM Sans)
    └── images/ (logo + favicons)
```

## Option 1 — Netlify (fastest, no GitHub needed)

1. Go to **https://app.netlify.com/drop**
2. Drag the whole `oakevidence` folder (or the `.zip`) onto the page.
3. Done — Netlify gives you a live URL in a few seconds.

You can rename the site or add a custom domain afterwards from the Netlify
site dashboard under **Site settings → Domain management**.

## Option 2 — GitHub → Netlify (recommended if you'll keep editing)

**A. Push the code to GitHub**

A git repo is already initialized in this folder with everything committed,
so you just need to point it at a new GitHub repo:

1. Create a new empty repo on GitHub (no README/license, so it stays empty) —
   e.g. `oakevidence-site`.
2. In a terminal, inside this folder:
   ```
   git remote add origin https://github.com/<your-username>/oakevidence-site.git
   git branch -M main
   git push -u origin main
   ```

**B. Connect it to Netlify**

1. In Netlify: **Add new site → Import an existing project → GitHub**.
2. Pick the repo you just pushed.
3. Build command: leave **blank**. Publish directory: `.` (already set in
   `netlify.toml`, so Netlify should fill this in automatically).
4. Click **Deploy**. Every future `git push` will auto-redeploy the site.

## Option 3 — GitHub Pages (free, no Netlify at all)

1. Push the code to GitHub as in Option 2A above.
2. On GitHub, go to the repo's **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **Deploy from a branch**.
4. Branch: `main`, folder: `/ (root)` → **Save**.
5. GitHub gives you a URL like `https://<your-username>.github.io/oakevidence-site/`
   within a minute or two.

All asset paths in this project are relative (`assets/...`, not `/assets/...`),
so it works correctly whether it's served from a domain root (Netlify) or a
sub-path (GitHub Pages project sites) — no path fixes needed either way.

## Editing later

- Copy/content: edit `index.html` directly.
- Colors/type/spacing: edit `assets/css/styles.css` (tokens are at the top of
  the file under `:root`).
- Animations/interactions: `assets/js/main.js`.
