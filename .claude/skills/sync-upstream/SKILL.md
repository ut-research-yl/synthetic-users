---
description: Sync changes from explorer-sunset upstream repo, skipping Modeler files, and re-applying NGM overrides
---

Upstream repo: https://github.tools.sap/signavio-experience/explorer-sunset

## Steps

### 1. Clone upstream to /tmp

```bash
rm -rf /tmp/explorer-sunset
git clone https://github.tools.sap/signavio-experience/explorer-sunset /tmp/explorer-sunset
```

### 2. Diff and copy changed/new files

Run a recursive diff between `/tmp/explorer-sunset/src` and `./src`.
- Copy all **changed** and **new** files from upstream into `./src`
- **NEVER touch** any file whose name contains `Modeler` — these are NGM-only and must never be overwritten:
  - `src/pages/ModelerLayout.tsx`
  - `src/pages/ModelerLobby.tsx`
  - `src/pages/JourneyModelerLayout.tsx`
  - any other file with `Modeler` in the filename
- Also skip `DataPanel.tsx` and `ElementsPanel.tsx` (NGM-specific)

Use `diff -rq` to identify the file list, then copy with `cp`.

### 3. Fix @signavio/icons group references

After copying, replace all `@signavio/icons/dist/group` imports with `group-frame` (the icon was renamed in the installed package version):

```bash
grep -rn "@signavio/icons/dist/group['\"]" src/ --include="*.ts" --include="*.tsx"
# Replace each occurrence: group' → group-frame' and group" → group-frame"
```

Files that typically need this fix:
- `src/components/pca/PCAGraphView.tsx`
- `src/components/pca/BpmnTreeList.tsx`
- `src/components/pca/PCACrossGraph.tsx`
- `src/components/pca/PCAConversationPage.tsx`

### 4. Apply NGM overrides to Shell.tsx

After syncing, `src/components/Shell.tsx` needs three fixes:

**A. WIP banner — restore the original blue banner (do NOT use the Explorer Migration banner):**

The `wipBannerVisible` block inside `<div slot="header">` must be:
```tsx
{wipBannerVisible && (
  <div style={{
    height: '2.75rem',
    background: 'var(--sapHighlightColor)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '0 3rem',
    position: 'relative',
  }}>
    <Text style={{ color: 'var(--sapHighlightTextColor)', textAlign: 'center', fontSize: 'var(--sapFontSmallSize)' }}>
      <strong>Work in progress</strong> — placement and user experience are still being designed and may change.
    </Text>
    <Button
      design="Transparent"
      icon="decline"
      onClick={() => setWipBannerVisible(false)}
      tooltip="Dismiss"
      style={{
        position: 'absolute', right: '0.75rem',
        '--ui5-button-text-color': 'var(--sapContent_ContrastIconColor)',
        '--ui5-button-base-background': 'transparent',
        '--ui5-button-base-border-color': 'transparent',
        '--ui5-button-hover-background': 'rgba(255,255,255,0.15)',
        '--ui5-button-hover-border-color': 'transparent',
        '--ui5-button-active-background': 'rgba(255,255,255,0.25)',
        '--ui5-button-active-border-color': 'transparent',
      } as React.CSSProperties}
    />
  </div>
)}
```

**B. ShellBar content chip — keep "NGM Prototype", remove release selector:**

The `slot="content"` div must be:
```tsx
<div slot="content" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
  <SigChipV2
    value="NGM Prototype"
    design="none"
    className="shellbar-chip--transparent"
  />
</div>
```

**C. Remove HotspotTooltip popup:**
- Remove the `import HotspotTooltip from './HotspotTooltip'` line
- Remove `const [hotspotVisible, setHotspotVisible] = useState(true)`
- Remove `{hotspotVisible && <HotspotTooltip onDismiss={() => setHotspotVisible(false)} />}`

### 5. Preserve NGM-specific App.tsx routes

`src/App.tsx` must keep the JourneyModelerLayout route. After syncing, verify these lines exist:
```tsx
import JourneyModelerLayout from './pages/JourneyModelerLayout'
// ...
<Route path="modeler/new-journey" element={<JourneyModelerLayout />} />
```

### 6. Verify build

```bash
npx vite build
```

Fix any remaining errors before declaring done.
