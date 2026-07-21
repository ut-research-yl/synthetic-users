# Project Instructions

## UI Patterns

### Popover padding
`ui5-popover` has default inner padding. To remove it, add the `no-padding-popover` CSS class — it targets `::part(content)` in `App.css`:

```tsx
<Popover className="no-padding-popover" ...>
```

Always use this class on popovers that contain a `List` or other flush content.

### UIxtension / @signavio/icons usage

Icons from `@signavio/icons` register themselves into the `SAP-icons-v4` collection. To use one:

1. **Register it** in [src/icons/registerIcons.ts](src/icons/registerIcons.ts) — import the specific file (never `AllIcons.js`, it overrides UI5 icons):
   ```ts
   import '@signavio/icons/dist/company-memory.js'
   ```

2. **Reference it** with the `SAP-icons-v4/` prefix:
   ```tsx
   <SideNavigationItem icon="SAP-icons-v4/company-memory" ... />
   <Icon name="SAP-icons-v4/company-memory" />
   ```

The icon's JS file exports its collection name as its default export (e.g. `"SAP-icons-v4/company-memory"`), which confirms the correct reference string.

### Dialog body padding

UI5 `Dialog` applies built-in content padding (both block and inline). All padding is stripped globally in `App.css`:
```css
ui5-dialog::part(content) { padding: 0; }
```

To get uniform `1rem` padding, add it on the direct child wrapper div inside the dialog body:
```tsx
<div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
```

Do **not** use CSS variable overrides on the `<Dialog>` style prop — they don't work with this UI5 version.

For dialogs with flush/custom-layout content (e.g. full-width lists, two-column layouts), skip the wrapper padding and handle spacing inside the content itself.

### Toggle vs CheckBox for boolean settings

Pages with **manual save** (Save/Reset buttons in the PageHeader) must use `CheckBox` for boolean settings — not `Switch`/`Toggle`. `Switch` implies immediate effect; `CheckBox` is appropriate when changes are staged and committed on save.

### Read-only vs editable fields

Use the same component for both read-only and editable states — pass `readonly` prop to make it non-interactive. Do **not** swap to a plain `Text`, `Icon`, or other display-only element in read-only mode. This keeps layout and visual weight consistent.

### CheckBox / RadioButton subline indent

Descriptive subline text rendered below a `CheckBox` or `RadioButton` must use `paddingLeft: '1.5rem'` to align with the label text (accounts for the `-0.5rem` negative margin on the checkbox):

```tsx
<CheckBox text="Enable feature" style={{ marginLeft: '-0.5rem' }} ... />
<div style={{ paddingLeft: '1.5rem' }}>
  <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>
    Description text here.
  </Text>
</div>
```

Note: `2rem` would be needed only if no negative margin is applied to the CheckBox.

### Page layout patterns

Every settings page uses `PageHeader` as the root — it provides the `DynamicPage` shell, title, Save/Cancel footer, and the container query anchor for responsive padding.

**Settings pages (form-like content):**
```tsx
<PageHeader title="..." isDirty={isDirty} onSave={handleSave} onReset={handleReset}>
  <AudienceSectionBar value={audience} onChange={setAudience} className={s.narrowContent} />
  <SettingsPageLayout>
    <SettingsSection title="Section Title">
      <div className={s.rowWide}>...</div>
    </SettingsSection>
  </SettingsPageLayout>
</PageHeader>
```

**Table pages (SigTableWrapper):**  
`SigTableWrapper` goes directly inside `PageHeader` — no `SettingsPageLayout` or `SettingsSection` wrapper. The title goes into `titleSlot`:
```tsx
<PageHeader title="...">
  <SigTableWrapper
    titleSlot={
      <ToolbarItem>
        <Title level="H3" wrappingType="None" style={{ fontSize: '16px' }}>Table Title</Title>
      </ToolbarItem>
    }
  >
    <Table ...>...</Table>
  </SigTableWrapper>
</PageHeader>
```

**Tab pages:** Use `ObjectPage` with `mode="IconTabBar"` — no `PageHeader`.

**`SettingsPageLayout flush` prop:** Use only when `SigTableWrapper` is nested inside a `SettingsSection` — it suppresses the container-query horizontal padding so the table toolbar sits flush. Not needed when `SigTableWrapper` is a direct child of `PageHeader`.

**Container query padding:** `.layout` and `.narrowContent` get `padding: 0 1rem` below 600px container width. `AudienceSectionBar` must always receive `className={s.narrowContent}` except on pages where the content below is full-width (e.g. `HelpResources`).
