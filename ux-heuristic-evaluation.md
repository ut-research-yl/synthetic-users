# Heuristic Evaluation: Workspace Settings UI

*4-agent review covering 60+ pages across all setting clusters*

---

## Executive Summary

The codebase has solid bones — `PageHeader`, `SettingsPageLayout`, and `SigTableWrapper` form a coherent pattern system — but **adoption of these shared components is inconsistent**, and several pages have evolved divergent implementations for functionally identical concerns. The most impactful issues cluster around: the save/reset semantic contract, list management patterns, and content duplication.

---

## Theme 1: Save/Reset Contract Violations

The project's documented rule is clear: **staged save → `CheckBox`; immediate effect → `Switch`**. Multiple pages break this.

| Page | Issue | File |
|---|---|---|
| `AccessConfiguration` | Uses `Switch` inside a `PageHeader` with Save/Reset footer | `src/pages/AccessConfiguration.tsx:61` |
| `ModelingLanguages` | Uses `Switch` for language active toggle, `CheckBox` for other toggles on the same page | `src/pages/ModelingLanguages.tsx:193` |
| `Reporting` | Uses `Switch` for sync enable/disable with no staged save | `src/pages/Reporting.tsx:296` |
| `ContentAccess` | Wraps in `PageHeader` but passes no `onSave`/`onReset` — no save affordance at all | `src/pages/ContentAccess.tsx:133` |
| `CloudALM` | Passes `onSave={() => {}}` stub — footer hidden, but buttons are silent no-ops | `src/pages/CloudALM.tsx:7` |

**Pattern recommendation:** Any page using `PageHeader` must either pass `onSave`+`onReset`+`isDirty` (staged save) or pass none of them (no save boundary). Hybrid or stub wiring must be eliminated.

---

## Theme 2: `SettingsPageLayout` Adoption Gap

The centering wrapper exists and is documented, but is skipped by the majority of pages.

**Uses it correctly:** `GeneralSettings`, `Collaboration`, `ExternalEmbedding`, `WalkMe`, `Authentication`, `NetworkPrivacy`, `DataSharingIndustry`, `DataPrivacyManagement`, `CloudALM`, `JourneyModelApproval`, `ModelingPreferences`

**Rolls its own identical div:** `Security` (`src/pages/Security.tsx:168`), `DataCollectionConfig` (`src/pages/DataCollectionConfig.tsx:47`)

**Uses no wrapper at all:** `AIServices`, `DiagramDownload`, `ProcessInsights`, `FactSheet`, `Comments`, `ProcessRating`, `ReadConfirmation`

On wide viewports, the no-wrapper pages spread content edge-to-edge while adjacent pages cap at 48 rem — a visually jarring inconsistency during navigation.

---

## Theme 3: Content Duplication (Three Cases)

Three independent duplication problems exist, each representing a maintenance hazard.

**Case A — Security ↔ Authentication:** `src/pages/Security.tsx:294–391` duplicates the entire SAML 2.0 block and password policy from `src/pages/Authentication.tsx:145–241`. These are separate nav entries with identical content.

**Case B — Collaboration ↔ Comments + ProcessRating:** `Collaboration.tsx` embeds both `Comments` and `ProcessRating` as an integrated page. The two standalone pages (`Comments.tsx`, `ProcessRating.tsx`) duplicate the same logic independently — three representations of the same domain, with conflicting state if navigated between.

**Case C — CloudALM ↔ Reporting:** `src/pages/Reporting.tsx:265–308` contains a full "SAP Cloud ALM Synchronizations" tab with the same domain as the dedicated `CloudALM.tsx` page. `CloudALM` shows an empty-state error; `Reporting` has a working table — same feature, incompatible states.

---

## Theme 4: List Management Pattern Fragmentation

Pages managing lists of items use four different containers with no consistent rule governing the choice:

| Pattern | Pages |
|---|---|
| `SigTableWrapper` + UI5 `Table`/`List` | `AttributeDefinitions`, `DictionaryCategories`, `HelpResources`, `Audience`, `AssetTypes`, `ModelingConventions`, `AllResources` |
| Custom `div` flex + bespoke item divs | `AttributeGroups`, `ModelingLanguages`, `HelpLinks` |
| `Card` + `CardHeader` + custom list | `HelpLinks` |
| Raw `DynamicPage` (bypasses `PageHeader`) | `DictionaryCategoryDetail`, `AssetTypeDetail`, `VariantManagement`, `Reporting`, `SmartFolder` |

**Sharpest inconsistency:** `HelpLinks` and `HelpResources` are structurally identical pages managing the same data type. They use different list containers, different drag-and-drop mechanisms (HTML5 native vs. UI5 `movable`), and different delete placement (always-visible inline icon vs. overflow menu). See `src/pages/HelpLinks.tsx:201` vs `src/pages/HelpResources.tsx:168`.

**Master/detail pages** (`AttributeGroups`, `ModelingLanguages`) both hand-roll `div[role=button]` navigation panels instead of using `List`/`ListItemStandard` — losing keyboard navigation, focus management, and hover states. See `src/pages/AttributeGroups.tsx:91` and `src/pages/ModelingLanguages.tsx:144`.

---

## Theme 5: Card/Section Heading Inconsistency

Three competing patterns for titling a card section, with no rule governing the choice:

| Pattern | Used by |
|---|---|
| Bold `Text` with `fontWeight:600` + `sapFontLargeSize` | `GeneralSettings`, `Authentication`, `Security`, `NetworkPrivacy`, `WalkMe`, `DataSharingIndustry`, `ExternalEmbedding` |
| `CardHeader` with `titleText` prop | `DataCollectionConfig`, `ProcessRating`, `Collaboration` (some cards), `AIServices` |
| Plain `Label` or no title | `Comments`, `DiagramDownload`, `ReadConfirmation` |

`Collaboration.tsx` has both patterns on the same page — the Criteria card uses `CardHeader` while adjacent cards use bold `Text` (`src/pages/Collaboration.tsx:91`).

Also inconsistent: description/subline text uses `sapFontSize` on some pages and `sapFontSmallSize` on others — e.g., `src/pages/Authentication.tsx:148` vs `src/pages/Security.tsx:298` for identical content.

---

## Theme 6: Audience-Scoped Pages Missing Consistent Affordances

Pages with per-audience settings should provide `AudienceSectionBar` + `onDuplicate`. Several don't:

| Page | AudienceSectionBar | onDuplicate |
|---|---|---|
| `AttributeVisibility` | ✅ | ✅ |
| `OverlaysVisibility` | ✅ | ✅ |
| `Navigation` | ✅ | ✅ |
| `Theme` | ✅ | ✅ |
| `AttributeVisualization` | ❌ (audience buried in sub-view) | ❌ |
| `ProcessRating` (standalone) | ❌ | ❌ |
| `DiagramDownload` | ✅ | ❌ |

`AttributeVisualization` contains a "Visibility per Audience" table but the audience context is unreachable without drilling into the Visibility Matrix sub-view. See `src/pages/AttributeVisualization.tsx:840`.

---

## Theme 7: Specific High-Severity Bugs

Beyond patterns, these are concrete functional issues found during review:

| Issue | Location | Severity |
|---|---|---|
| `dataSharingEnabled` state has no setter — Edit button permanently broken | `src/pages/DataSharingIndustry.tsx:32` | High |
| `window.prompt()` used as add/edit dialogs (no validation, no a11y) | `src/pages/AssetAttributeSetup.tsx:506` | High |
| Navigation tile click fires both `div onClick` and `RadioButton onChange` — double state update | `src/pages/Navigation.tsx:188` | Medium |
| `AssetTypeDetail` breadcrumb first item navigates to `/audience` (unrelated page) | `src/pages/AssetTypeDetail.tsx:83` | Medium |
| Delete in `HelpLinks`/`HelpResources` has no confirmation, yet page uses staged save — deletion is immediate while other changes are staged | `src/pages/HelpLinks.tsx:237` | Medium |
| `Security.tsx` delete icon is a raw `<Icon>` with cursor:pointer — not a Button, not accessible | `src/pages/Security.tsx:255` | Medium |
| `ModelingConventions` convention name `<span>` acts as a click target without `role` or `tabIndex` | `src/pages/ModelingConventions.tsx:709` | Medium |

---

## Recommended Standardization Priorities

### Immediate (breaks the save contract or has functional bugs)

1. Fix `dataSharingEnabled` missing setter in `DataSharingIndustry`
2. Replace `window.prompt()` calls in `AssetAttributeSetup` with proper dialogs
3. Fix `Switch` → `CheckBox` in `AccessConfiguration`, `ModelingLanguages`, `Reporting`
4. Fix `ContentAccess` to have a proper save boundary or explicit no-save semantics

### High value (reduce maintenance surface, eliminate duplication)

5. Consolidate `Security`/`Authentication` — one page or extract shared content
6. Decide on canonical `Collaboration` vs. standalone `Comments`/`ProcessRating` — keep one representation
7. Wrap all settings pages in `SettingsPageLayout` (trivial per-page change)
8. Unify `HelpLinks`/`HelpResources` to use the same list container, drag mechanism, and action placement

### Standards (improve consistency across the board)

9. Adopt `CardHeader` as the single card title pattern (or document when `Text` is acceptable)
10. Standardize description text to `sapFontSmallSize` throughout
11. Replace bespoke `div[role=button]` master-list panels with `List`/`ListItemStandard`
12. Add `AudienceSectionBar` and `onDuplicate` to all audience-scoped pages consistently

---

## Appendix: Per-Page Detail Findings

### Form/Settings Pages (GeneralSettings, Authentication, Security, DataPrivacy, Collaboration cluster)

- **Security ↔ Authentication content overlap:** SAML 2.0 block (`Security.tsx:294–391`) and password policy block duplicated verbatim from `Authentication.tsx:145–241`. Either merge into one page or extract a shared component.
- **`SettingsPageLayout` not used:** `Security.tsx:168`, `DataCollectionConfig.tsx:47`, `Comments.tsx`, `ProcessRating.tsx`, `ReadConfirmation.tsx` all hand-roll identical centring divs or have no wrapper.
- **`AudienceSectionBar` placement:** `Collaboration.tsx:77` places it inside the "Commenting" section group, visually scoping it to only that feature. If it governs the whole page, it should sit above all sections.
- **`DataSharingIndustry` Edit pattern orphaned:** `DataSharingIndustry.tsx:90` renders an Edit button bypassing the staged-save pattern; `dataSharingEnabled` at line 32 is destructured without a setter.
- **`ReadConfirmation` context missing:** A single checkbox with no card title, no description. Every other boolean setting provides both.
- **Font size inconsistency:** `sapFontSize` used in `Authentication`, `sapFontSmallSize` in `Security` for identical descriptive text.

### List Management Pages (UserManagement, AttributeDefinitions, DictionaryCategories, HelpLinks, AssetTypes cluster)

- **`DictionaryCategoryDetail` / `AssetTypeDetail` bypass `PageHeader`:** Both construct raw `DynamicPage` to add breadcrumbs. `PageHeader` should support an optional breadcrumbs slot to avoid duplication.
- **`AssetTypeDetail` breadcrumb bug:** First crumb links to `/audience` with label "Workspace Settings" — unrelated route.
- **HelpLinks vs. HelpResources:** Same data type, same dialogs, but `HelpLinks` uses `Card`+HTML5 drag+inline delete; `HelpResources` uses `SigTableWrapper`+UI5 movable+overflow delete. Neither is a reference implementation.
- **No confirmation on delete in `HelpLinks`/`HelpResources`:** `deleteLink()` is called immediately while other changes are staged. Users cannot distinguish immediate from staged mutations.
- **Empty state approach:** `AnalyticalTable` uses `noDataText`; `AssetTypes` uses an inactive list row; `HelpLinks`/`HelpResources` use a plain `div`+`Text`. `IllustratedMessage` is used only in the placeholder `VariantManagement` page, not in any active list.
- **`DictionaryCategories` footer suppression:** Footer is entirely absent until `isDirty` — differs from other pages where footer renders but is disabled.

### Access/Permissions/Visualization Pages (AccessConfiguration, ContentAccess, FeatureAccess, AttributeVisibility cluster)

- **`ContentAccess` no save semantics:** Changes are applied immediately to state with no footer and no `isDirty`. Users cannot discard changes.
- **Terminology drift between `OverlaysVisibility` and `AttributeVisualization`:** Three-state visibility uses "Visible and active / Visible / Hidden" vs. "Enabled and active / Enabled / Disabled" — same concept, incompatible labels.
- **`AttributeVisualization` page title mismatch:** `PageHeader title="Attribute Overlays"` but filename and nav entry are "Attribute Visualization".
- **Navigation.tsx double-fire:** Tile `div onClick` and inner `RadioButton onChange` both call `setNavDefaultState` — same value set twice, `setIsDirty(true)` fires twice per click.
- **Custom div-grid tables vs. UI5 Table:** `ContentAccess`, `JourneyModelApproval`, `AttributeVisibility`, `ModelingConventions` all use CSS grid with manual layout; `AccessConfiguration`, `OverlaysVisibility`, `Audience` use UI5 `Table`. Mixed accessibility surface.

### Integration/Advanced/Reporting Pages (AIServices, Reporting, AssetAttributeSetup cluster)

- **`Reporting` bypasses `PageHeader` entirely:** The only multi-tab page that renders its own `DynamicPage`. `AssetAttributeSetup` uses `PageHeader`'s `tabBar` prop for the same need. Neither approach is documented as canonical.
- **`window.prompt()` in `AssetAttributeSetup`:** Five call sites for add/edit operations — no validation, no accessible labels, no error feedback.
- **`ProcessInsights` floating action button:** "Add Connection" in a free `div` above the card, not in a toolbar or section header. A second identical button appears in the empty state.
- **`ProcessInsights` status coloring:** Raw token value applied to `Text` color vs. `StatusBadge` component used in `Reporting` for equivalent status concept.
- **`AllResources`/`SmartFolder` categorization:** These are browsing/navigation pages with no settings semantics. Their presence alongside settings pages suggests a page categorization problem.
