# NGM Process Modeler — Micro-Interactions Prototype

This prototype explores the **next-generation modeler (NGM)** interaction model for SAP Signavio — focusing on canvas micro-interactions, shape lifecycle, and the Live Insights integration layer.

Built with [UI5 Web Components for React](https://sap.github.io/ui5-webcomponents-react/) and [SAP Signavio UIxtension](https://www.npmjs.com/package/@signavio/sap-signavio-uixtension) to reflect the target visual language.

<div align="center">
  <br>
  <a href="https://pages.github.tools.sap/signavio-experience/ngm-process-modeler/" target="_blank">
    <img src="https://img.shields.io/badge/Open%20Prototype-%E2%86%92-0070f3?style=for-the-badge&labelColor=0070f3&color=0054a6&logoColor=white" alt="Open Prototype" />
  </a>
  <br><br>
</div>

> **[https://pages.github.tools.sap/signavio-experience/ngm-process-modeler/](https://pages.github.tools.sap/signavio-experience/ngm-process-modeler/)**

---

## What this covers

- **Canvas interactions** — drag-and-drop shape placement, selection, multi-select, rubber-band, pan & zoom
- **Shape label editing** — double-click to edit; inline input appears below small shapes (events, gateways, IT systems); auto-activated on drop
- **Elements panel** — quick-access shape palette with drag-to-canvas; More Elements drawer for the full BPMN shape set
- **Live Insights (LI) shapes** — contextual right panel that surfaces process intelligence data per shape
- **Workspace Settings** — full navigation with realistic UI carried over from the explorer-sunset prototype
- **Suite shell** — ShellBar, side navigation, user settings

---

## Local development

```bash
npm install
npm run dev:all   # Vite (port 5173) + PCA static server (port 5174)
```

Or separately:

```bash
npm run dev        # Vite only
npm run serve-pca  # PCA static server only
```

**Updating the Process Consulting Agent** to the latest build from [SUITE-REPO-PCA](https://github.tools.sap/signavio-experience/SUITE-REPO-PCA):

```bash
npm run update-pca
```

Requires `gh` CLI authenticated against `github.tools.sap`. Restart `npm run serve-pca` afterwards.

## Deploy

```bash
npm run build
git add docs/
git commit -m "Deploy"
git push origin main
```

Deploys from `docs/` on `main` via GitHub Pages.
