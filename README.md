# Oathsworn Companion

A private, spoiler-safe campaign companion for Thundercon 2026. Built with Vite, React, and TypeScript.

## Run locally

Use Node.js 20 or newer.

```bash
nvm use
npm install
npm run dev
```

Open the local URL printed by Vite. Campaign data is saved only in that browser's local storage.

Because this is a GitHub Pages project, Vite serves the app beneath the `/oathsworn-companion/` path.

## Production build

```bash
npm run build
```

## Deployment

Pushes to `main` run the GitHub Actions workflow in `.github/workflows/deploy.yml`. The workflow installs the locked dependencies, lints and builds the app, and deploys `dist` to GitHub Pages.

In the repository's GitHub settings, select **Pages → Build and deployment → GitHub Actions** as the source. The published site will be available at:

```text
https://jerry77oz.github.io/oathsworn-companion/
```

## Data and privacy

- No backend, account, analytics, or cloud sync
- Export/import JSON backups from the Archive tab
- No copyrighted story text or hidden game content is included
- Clearing browser storage will remove campaign data unless you have exported a backup
