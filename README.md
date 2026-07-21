# Explorer Sunset — Suite Experience Prototype

This prototype illustrates the **target state of SAP Signavio** once the legacy Editor and Explorer are sunset. It shows how users will navigate and manage their workspace exclusively through the Suite shell — covering the Repository, Workspace Settings, and the full interaction model that replaces the Explorer.

The mockup is built with [UI5 Web Components for React](https://sap.github.io/ui5-webcomponents-react/) and [SAP Signavio UIxtension](https://www.npmjs.com/package/@signavio/sap-signavio-uixtension) to reflect the target visual language and component library.

<div align="center">
  <br>
  <a href="https://pages.github.tools.sap/signavio-experience/explorer-sunset/" target="_blank">
    <img src="https://img.shields.io/badge/Open%20Prototype-%E2%86%92-0070f3?style=for-the-badge&labelColor=0070f3&color=0054a6&logoColor=white" alt="Open Prototype" />
  </a>
  <br><br>
</div>

> **[https://pages.github.tools.sap/signavio-experience/explorer-sunset/](https://pages.github.tools.sap/signavio-experience/explorer-sunset/)**

---

## What this covers

- **Repository** — table, list, and grid views with SigDomainObject icons, context overflow menus (per asset type), and filter/sort/column management
- **Workspace Settings** — full navigation (7 groups, 28 pages) with realistic UI and interactions
- **Suite shell** — ShellBar with SigChipV2 workspace view selector (Published / Preview), side navigation, user settings
- Audience-scoped settings pattern
- All major settings pages with realistic content

## Local development

This prototype embeds the **Process Consulting Agent** from a separate repo as a pre-built static app:

> [github.tools.sap/signavio-experience/SUITE-REPO-PCA](https://github.tools.sap/signavio-experience/SUITE-REPO-PCA)

The built output lives in `public/signavio-experience/SUITE-REPO-PCA/` and is served by a local static server on port 5174. The PCA is iframed into the settings mockup at the `/process-consulting-agent` route.

**Starting both servers together:**

```bash
npm install
npm run dev:all   # starts Vite (port 5173) + PCA static server (port 5174)
```

Or separately:

```bash
npm run dev        # Vite only
npm run serve-pca  # PCA static server only
```

**Updating the PCA to the latest version from SUITE-REPO-PCA:**

```bash
npm run update-pca
```

This re-downloads the repo's `docs/` build output via the `gh` CLI (must be authenticated against `github.tools.sap`) and re-applies the CSS override that hides the PCA's own shellbar and sidenav (since this app provides those). Restart `npm run serve-pca` afterwards.

## Deploy

```bash
npm run build
git add docs/
git commit -m "Deploy"
git push origin main
```

The site deploys from the `docs/` folder on `main` via GitHub Pages.
