# Migration Guide: DynamicPage with Tab Subheader → ObjectPage with IconTabBar

This guide describes how to replace the non-standard pattern of putting a `TabContainer` into a `DynamicPage`'s `subheading` slot with the correct SAP Fiori pattern: `ObjectPage` with `mode="IconTabBar"`.

---

## Why migrate?

Putting a `TabContainer` in `DynamicPageTitle`'s `subheading` slot is a workaround, not a supported pattern. It requires shadow-DOM patching to make the tab strip fill the available width, and breaks whenever the underlying component internals change. The `ObjectPage` with `IconTabBar` mode is the SAP-recommended way to combine a page header with tabs.

---

## Before (DynamicPage + custom tab subheader)

```tsx
import {
  DynamicPage, DynamicPageTitle,
  TabContainer, Tab,
  Toolbar, Button, Title,
} from '@ui5/webcomponents-react'

// Shadow-DOM workaround: fixes max-width on subheading slot
useEffect(() => {
  const dpt = document.querySelector('ui5-dynamic-page-title')
  if (!dpt?.shadowRoot) return
  const style = document.createElement('style')
  style.textContent = `.ui5-dynamic-page-title--subheading { max-width: 100% !important; }`
  dpt.shadowRoot.appendChild(style)
}, [])

return (
  <DynamicPage
    style={{ height: '100%' }}
    hidePinButton
    titleArea={
      <DynamicPageTitle>
        <Title slot="heading" level="H3">Page Title</Title>
        <Toolbar slot="actionsBar">
          <Button>Action</Button>
        </Toolbar>
        <TabContainer
          slot="subheading"
          collapsed                          // suppress built-in content panels
          onTabSelect={(e) => setTab(e.detail.tabIndex)}
        >
          <Tab text="Tab One" selected={tab === 0} />
          <Tab text="Tab Two" selected={tab === 1} />
          <Tab text="Tab Three" selected={tab === 2} />
        </TabContainer>
      </DynamicPageTitle>
    }
  >
    {tab === 0 && <div>Content for Tab One</div>}
    {tab === 1 && <div>Content for Tab Two</div>}
    {tab === 2 && <div>Content for Tab Three</div>}
  </DynamicPage>
)
```

---

## After (ObjectPage + IconTabBar)

```tsx
import {
  ObjectPage, ObjectPageTitle, ObjectPageSection, ObjectPageMode,
  Toolbar, Button, Title,
} from '@ui5/webcomponents-react'

const SECTION_IDS = ['tab-one', 'tab-two', 'tab-three']

return (
  // Use a fragment if you have dialogs/toasts — ObjectPage only accepts
  // ObjectPageSection as children, not arbitrary ReactNode.
  <>
    <ObjectPage
      style={{ height: '100%' }}
      mode={ObjectPageMode.IconTabBar}
      hidePinButton
      selectedSectionId={SECTION_IDS[tab]}
      onSelectedSectionChange={(e) => setTab(e.detail.selectedSectionIndex)}
      titleArea={
        <ObjectPageTitle
          header={<Title level="H3">Page Title</Title>}
          actionsBar={
            <Toolbar>
              <Button>Action</Button>
            </Toolbar>
          }
        />
      }
    >
      <ObjectPageSection id="tab-one" titleText="Tab One" hideTitleText>
        <div>Content for Tab One</div>
      </ObjectPageSection>

      <ObjectPageSection id="tab-two" titleText="Tab Two" hideTitleText>
        <div>Content for Tab Two</div>
      </ObjectPageSection>

      <ObjectPageSection id="tab-three" titleText="Tab Three" hideTitleText>
        <div>Content for Tab Three</div>
      </ObjectPageSection>
    </ObjectPage>

    {/* Dialogs, toasts, message boxes go here — outside ObjectPage */}
    <MyDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
  </>
)
```

---

## Key changes

| Old | New |
|-----|-----|
| `DynamicPage` | `ObjectPage` with `mode={ObjectPageMode.IconTabBar}` |
| `DynamicPageTitle` | `ObjectPageTitle` |
| `TabContainer` in `subheading` slot | `ObjectPageSection` children (tabs are generated automatically) |
| `Tab` components | `ObjectPageSection` with `id` and `titleText` |
| `collapsed` on TabContainer | Not needed — IconTabBar handles this |
| `onTabSelect` → `e.detail.tabIndex` | `onSelectedSectionChange` → `e.detail.selectedSectionIndex` |
| Selected tab: `selected` prop on `<Tab>` | `selectedSectionId` on `<ObjectPage>` |
| Shadow-DOM `useEffect` workaround | Delete entirely |
| Dialogs as DynamicPage children | Move outside ObjectPage (wrap in React fragment) |
| _(nothing)_ | Add `hidePinButton` — ObjectPage shows a pin icon by default; DynamicPage did not |
| Inline `style` padding hacks on `DynamicPageTitle` | Delete — `ObjectPageTitle` has correct padding by default |

---

## ObjectPageTitle props reference

| Prop | Replaces | Notes |
|------|----------|-------|
| `header` | `<Title slot="heading">` | Any ReactNode — Title, or a flex row with extra elements |
| `actionsBar` | `<Toolbar slot="actionsBar">` | Should be a `Toolbar` |
| `breadcrumbs` | `<Breadcrumbs slot="breadcrumbs">` | Optional |
| `subHeader` | `<Label slot="subheading">` | Optional — text below the title |
| `navigationBar` | `<Toolbar slot="navigationActions">` | Optional — nav buttons to the right |

---

## Hiding the in-page section heading

In `IconTabBar` mode, `ObjectPageSection.titleText` is used only for the tab label. Setting `hideTitleText` prevents the section title from also appearing as a heading above the section content — which is usually desirable when you are using the component purely for tab-based navigation.

---

## CSS cleanup

Remove any CSS that was written to work around the old pattern:

```css
/* DELETE — no longer needed */
.page-tabs { position: relative; left: -16px; ... }          /* tab strip offset */
.dynamic-page-home-title { padding-top: ...; padding-bottom: 0; }  /* title area padding */
.dynamic-page-home { --_ui5_dynamic_page_content_padding_*: ...; }  /* content padding */
.customized-title { --_ui5_dynamic_page_title_min_height: auto; }   /* title min-height */
```

Also delete any inline `style` padding hacks on `DynamicPageTitle` (e.g. `paddingBlockStart`, `paddingBottom`) — `ObjectPageTitle` has correct spacing by default.

---

## Section content height and focus ring

After migration, two visual issues appear that require explicit CSS fixes.

### ObjectPageSection internal structure

The `ObjectPageSection` CSS module already sets `height: 100%` on both `_sectionContent` and `_sectionContentInner`. The only missing piece is making the section element itself a definite-height container so those percentages resolve.

The section DOM structure (from `ObjectPageSection/index.js`):

```
section#ObjectPageSection-<id>          ← height: 100% needed here
  div._outlineSpacerDiv  aria-hidden    ← 2px tall, anchors focus outline
  div._sectionContent                   ← height: 100% already in CSS module
    div._sectionContentInner            ← height: 100%, box-sizing: border-box, padding-block-start: 1rem
      your content
```

### 1. Section height, margin overflow, and spacer

The `ObjectPageSection` CSS module sets:
- `margin-block-end: 1rem` on the section (16px bottom)
- `margin-block-start: 1px` on `:first-of-type` (1px top)
- `height: 2px` on `_outlineSpacerDiv`

All three contribute scroll overflow when the section fills the viewport:

```css
/* Give the section a definite height so _sectionContent's height:100% resolves.
   Zero both block margins to prevent them adding to the ObjectPage scroll area.
   (In IconTabBar mode only one section is visible, so inter-section spacing is moot.) */
section[id^="ObjectPageSection-"] {
  height: 100%;
  margin-block: 0;
}

/* _outlineSpacerDiv anchors the focus outline (outline-offset: -2px).
   Zero it out since we suppress the outline anyway — otherwise
   spacer(2px) + _sectionContent(100%) overflows the section by 2px. */
section[id^="ObjectPageSection-"] > [class*="outlineSpacerDiv"] {
  height: 0;
}
```

> **Why not `min-height`?** `min-height: 100%` on the section resolves against the parent's height correctly, but it does not give the section a *definite* height — so `_sectionContent`'s `height: 100%` would still resolve to `auto`. Using `height: 100%` is required to propagate a definite height downward. The inner wrappers already handle this via `box-sizing: border-box`.

> **Do not cascade `height: 100%` to `_sectionContent` or `_sectionContentInner`** — the CSS module already sets that. Adding it again is redundant. Avoid using `:last-child` or `> *` to cascade heights — the spacer div is the first child and giving it `height: 100%` would push the entire content off-screen.

### 2. Focus ring after tab click

The CSS module sets `outline` and `outline-offset: calc(var(--sapContent_FocusWidth) * -1)` on the section's `:focus` rule. Suppress both:

```css
/* Suppress the browser focus ring after a tab click.
   outline-offset is also reset — the CSS module sets a negative value on :focus
   which can contribute to scroll area calculations in some browsers. */
section[id^="ObjectPageSection-"]:focus,
section[id^="ObjectPageSection-"]:focus-visible {
  outline: none;
  outline-offset: 0;
}
```

---

## Card shadow clipping in the content area

`ObjectPageSection` provides `padding-inline: 2rem` (32px at standard desktop width) via its CSS module. If your content wrapper sets `overflow: auto` for scrolling, the browser clips anything — including box shadows — that extends beyond the element boundary, cutting off card shadow edges.

### The fix: negative-margin compensation

Add `padding-inline` just wide enough for the shadows, then cancel it with a matching negative `margin-inline` so visual alignment stays at the section's native `2rem`:

```css
.page-content {
  flex: 1;
  overflow: auto;
  /* 2rem inline padding keeps card box-shadows inside the overflow clip boundary.
     The negative margin pulls the container outward by the same amount so visual
     content alignment stays at the ObjectPageSection's native padding-inline (2rem). */
  margin-inline: -2rem;
  padding: 0 2rem var(--spacing-md);
}
```

The `margin-inline: -2rem` and `padding-inline: 2rem` cancel each other out, so card content is still visually at `2rem` from the section edge. The overflow container's clip boundary is `2rem` wider on each side, giving shadows room to render fully.

Adjust the `2rem` value to match your shadow's actual spread/blur radius (SAP UI5 card shadows are typically 1–2px, so `4px` / `0.25rem` is technically sufficient; `2rem` provides generous clearance for larger hover shadows).

---

---

## Optional tweak: separator shadow on pages without a tab bar

On `ObjectPage` instances **without** a real tab bar (single section, no `IconTabBar` mode), the ObjectPage renders a 1px `_tabContainerPlaceholder_` div between the title header and the content. This placeholder carries the same `box-shadow` as the real tab strip, but with only 1px of height the shadow is imperceptible against the grey section background.

Setting the placeholder to `5px` gives it enough height to cast a visible separator shadow — and slightly improves the vertical centering of the title text in the header bar.

Add `className="page-no-tabs"` to each affected `ObjectPage`:

```tsx
<ObjectPage className="page-no-tabs" style={{ height: '100%' }} hidePinButton ...>
```

Then in CSS:

```css
/* Pages without a tab bar miss the separator shadow the Home page's tab strip provides.
   Enlarging the placeholder gives its existing shadow room to show against the grey
   section background, and improves title vertical centering. */
.page-no-tabs [class*="tabContainerPlaceholder"] {
  height: 5px;
}
```

This affects only `ObjectPage` instances that carry the class, and only the 1px placeholder — no impact on the header or content layout.

The `ObjectPage` has an optional collapsible `headerArea` (below the title, above the content). If you do not need a collapsible header section, simply omit `headerArea`. The `ObjectPageHeader` component is what goes there (not `DynamicPageHeader`):

```tsx
import { ObjectPageHeader } from '@ui5/webcomponents-react'

headerArea={
  <ObjectPageHeader>
    {/* KPI tiles, key facts, etc. */}
  </ObjectPageHeader>
}
```

> **Note:** `ObjectPageHeader` is essentially `DynamicPageHeader` renamed to avoid naming conflicts with the `DynamicPageHeader` from `@ui5/webcomponents`. Pass through all props when wrapping it in a custom component.
