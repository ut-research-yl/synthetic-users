# Workspace Settings — Information Architecture Review

## Current Structure

| Group | Pages |
|---|---|
| Users and Access | Audience, User Management, Resource Access, Feature Access, AI Services, Security |
| Workspace Experience | General Settings, Home Page, Navigation, Theme, Diagram Page, Diagram Download, Fact Sheet |
| Help Resources | Help Links, WalkMe Digital Adoption Platform |
| Assets and Attributes | Attribute Groups, Attribute Visibility, Attribute Visualization, Overlays Visibility, Asset and Attribute Setup |
| Modeling | Modeling Preferences, Modeling Languages and Elements |
| Collaboration and Governance | Comments, Read Confirmation, Process Rating, Approval Workflows |
| Integrations | SAP Signavio Process Insights, SAP Cloud ALM, External Embedding |

Total: 7 groups, 28 pages (+ 2 pages with no nav entry: Created Accelerators, Installed Accelerators)

---

## High-Level Findings

**1. Group sizes are unbalanced.** "Help Resources" has 2 items. "Modeling" has 2 items. "Workspace Experience" has 7. Groups with 2 items either need more items or should be merged elsewhere. Groups with 7+ items should be checked for internal coherence.

**2. Several pages are too simple to stand alone.** WalkMe (2 radio buttons), External Embedding (1 toggle), Read Confirmation (1 checkbox), and Comments (1 dropdown) don't merit individual pages. They create navigation overhead disproportionate to their content.

**3. Page naming is inconsistent.** Some pages are named after the object ("Audience", "Theme"), others after the action ("Resource Access", "Feature Access"), and others after the product ("WalkMe Digital Adoption Platform", "SAP Cloud ALM Synchronization"). This makes the nav harder to scan.

**4. The "Audience" concept underpins 10+ pages but the definition page is buried third in the first group.** Users who don't understand what "audiences" are will be confused by the audience selector that appears on nearly every page.

**5. Two pages exist without a nav entry.** Created Accelerators and Installed Accelerators are implemented but not reachable via the navigation.

**6. "Security" is misclassified.** It contains five conceptually distinct concerns (data retention, IP filtering, domain policies, SAML/SSO, password policies) and is grouped under "Users and Access" as a peer of User Management. It is large enough for its own group.

**7. "Assets and Attributes" ordering is backwards.** Setup comes last but is the prerequisite for Groups, Visibility, and Visualization. The order implies equal weight between the pages, not a dependency chain.

---

## Group-by-Group Analysis

### Users and Access

**What's right:** Access control, user management, and audience definition belong together.

**Issues:**
- **AI Services does not belong here.** It configures which AI features are available per audience, which is closer to Feature Access than to security or identity management. Its placement implies a relationship to "access credentials" that doesn't exist.
- **Security is too large to be a peer item.** It is effectively a separate settings area on its own.
- **Resource Access is misnamed.** The page shows a content tree (folders, objectives). The name implies network/API access. A better name is "Content Permissions" or "Folder Permissions".
- **Audience should be first.** As the foundational concept that all other pages depend on, it should be the entry point to the settings.

**Action items:**
- [ ] Rename "Resource Access" → "Content Permissions"
- [ ] Move "AI Services" to the "Collaboration and Governance" group or merge it into Feature Access as a tab/section
- [ ] Move "Security" to its own group (see below)
- [ ] Keep ordering: Audience → User Management → Content Permissions → Feature Access

---

### Workspace Experience

**What's right:** Broad concept of what workspace users see and how the workspace is presented.

**Issues:**
- **"General Settings" is too vague.** It contains workspace name, organization name, private folder, currency, subscriptions, file upload, and additional info. A better name would be "Workspace Configuration" or "Workspace Details".
- **"Diagram Page" and "Diagram Download" should be one page.** Both are about the diagram view experience. Splitting them creates extra navigation for tightly related settings. Combine as "Diagram Settings" with internal sections or tabs.
- **"Fact Sheet" could be grouped with "Diagram Page".** Both configure the content display layer for a process. Alternatively, keep separate but consider a "Content Display" sub-label or group.
- **"Help Resources" group (2 items) belongs here.** Help Links and WalkMe are workspace experience settings, not a distinct category.

**Action items:**
- [ ] Rename "General Settings" → "Workspace Details" (or "Workspace Configuration")
- [ ] Merge "Diagram Page" and "Diagram Download" into "Diagram Settings" (tabbed page)
- [ ] Absorb "Help Resources" group into this group: Help Links, WalkMe
- [ ] Rename "WalkMe Digital Adoption Platform" → "WalkMe" (full product name belongs in the page header, not the nav)
- [ ] Revised group: Workspace Details, Home Page, Navigation, Theme, Diagram Settings, Fact Sheet, Help Links, WalkMe

---

### Help Resources *(proposed: dissolved)*

**Issue:** Two items do not justify a standalone group. Both are logically part of Workspace Experience.

**Action items:**
- [ ] Dissolve this group; move items to Workspace Experience

---

### Assets and Attributes

**What's right:** Grouping all attribute-related pages together is correct.

**Issues:**
- **The ordering is the inverse of the workflow dependency.** A user must first set up attributes (Asset and Attribute Setup), then group them (Attribute Groups), then configure visibility and visualization. The current order is: Groups → Visibility → Visualization → Overlays → Setup. Setup should be first.
- **"Overlays Visibility" does not belong here.** Overlays (Comments, Linked Documents, Risk & Controls) are a content viewing feature, not an attribute. This page belongs in Workspace Experience (alongside Diagram Settings and Fact Sheet).
- **The group name "Assets and Attributes" could be simplified to "Attributes".** The "Asset" concept is only relevant within the Setup page; the other pages are all about attributes specifically.

**Action items:**
- [ ] Reorder pages: Asset and Attribute Setup → Attribute Groups → Attribute Visibility → Attribute Visualization
- [ ] Move "Overlays Visibility" to Workspace Experience (near Diagram Settings)
- [ ] Evaluate renaming the group to "Attributes" (or keep if "Assets" is a meaningful product concept)

---

### Modeling

**What's right:** Modeling-specific settings are logically isolated.

**Issues:**
- **Two items is thin for a group.** Consider whether Attribute Visualization belongs here, since it directly configures what users see in the graphical editor (shared concern with modeling).
- **"Modeling Languages and Elements" is a long name.** "Modeling Languages" would be more scannable.

**Action items:**
- [ ] Evaluate moving "Attribute Visualization" here (it is editor-specific, not purely an attribute concept)
- [ ] Rename "Modeling Languages and Elements" → "Modeling Languages"

---

### Collaboration and Governance

**What's right:** Grouping collaboration features together makes sense.

**Issues:**
- **The group mixes two distinct concerns.** Comments, Read Confirmation, and Process Rating are collaboration features (participation, engagement). Approval Workflows is a formal governance process. These have different audiences — collaboration settings are simpler, approval workflows are admin-heavy and complex.
- **Three of the four pages are extremely sparse.** Comments (1 dropdown), Read Confirmation (1 checkbox), and Process Rating (2 cards) are candidates for consolidation into a single "Collaboration Settings" page.
- **AI Services could naturally live here** if moved from "Users and Access" (see above).

**Action items:**
- [ ] Consolidate Comments, Read Confirmation, and Process Rating into a single "Collaboration Settings" page with sections
- [ ] Consider renaming the group to "Governance" and moving simpler collaboration settings elsewhere, or split into two groups: "Collaboration" and "Governance"

---

### Integrations

**What's right:** Third-party/system connections belong in one place.

**Issues:**
- **"External Embedding" does not belong here.** It configures whether Signavio *can be* embedded in other apps. That is a security/trust boundary setting, not an integration with an external system. It belongs alongside domain policies in "Security".
- **Both SAP product pages are stubs.** Process Insights (add connection form) and Cloud ALM (not configured message) are essentially empty. They should look and behave consistently and set clear expectations.
- **The group would have only 2 items after removing External Embedding.** Consider whether 2 items justify a group.

**Action items:**
- [ ] Move "External Embedding" to a "Security" group or page (alongside domain policies and IP filtering)
- [ ] If more integrations are expected, keep the group; if not, consider merging into another group

---

### Security *(proposed: new standalone group)*

**Issue:** Currently a single page buried at the bottom of "Users and Access". With 5 distinct sections — Data Protection & Privacy, IP Address Filter, Domain Policies, SAML 2.0, and Password Policies — and with External Embedding being moved here, Security warrants its own group.

**Action items:**
- [ ] Create a new "Security" group
- [ ] Move "Security" page (renamed sections) here
- [ ] Add "External Embedding" (domain trust boundary) to this group
- [ ] Consider splitting the Security page into sub-pages if it continues to grow: "Authentication" (SSO, SAML) and "Network & Data" (IP filter, domain policies, data retention)

---

### Accelerators *(proposed: new group, currently missing)*

**Issue:** Two implemented pages (Created Accelerators, Installed Accelerators) have no nav entry.

**Action items:**
- [ ] Add "Accelerators" group with Created Accelerators and Installed Accelerators
- [ ] These could also be merged into a single tabbed "Accelerators" page

---

## Proposed Revised Structure

```
Users and Access
  ├── Audience                      ← define before configuring
  ├── User Management
  ├── Content Permissions           ← renamed from Resource Access
  └── Feature Access                ← AI Services merged in as tab/section

Workspace Experience
  ├── Workspace Details             ← renamed from General Settings
  ├── Home Page
  ├── Navigation
  ├── Theme
  ├── Diagram Settings              ← merged from Diagram Page + Diagram Download
  ├── Fact Sheet
  ├── Overlays Visibility           ← moved from Assets and Attributes
  ├── Help Links
  └── WalkMe                        ← shortened name

Attributes
  ├── Asset and Attribute Setup     ← reordered first
  ├── Attribute Groups
  ├── Attribute Visibility
  └── Attribute Visualization

Modeling
  ├── Modeling Preferences
  └── Modeling Languages            ← shortened name

Governance
  ├── Collaboration Settings        ← merged: Comments + Read Confirmation + Process Rating
  └── Approval Workflows

Accelerators                        ← new group (was missing)
  ├── Installed Accelerators
  └── Created Accelerators

Integrations
  ├── Process Insights              ← shortened name
  └── Cloud ALM                     ← shortened name

Security                            ← new group (was single page in Users and Access)
  ├── Security                      ← or split into sub-pages
  └── External Embedding            ← moved from Integrations
```

**Result:** 8 groups (vs 7), 22 nav items (vs 28), more consistent item depth, and all existing pages reachable.

---

## Cross-Cutting Issues

### Audience Selector Pattern
The audience selector appears on ~10 pages but the Audience page is not surfaced as a prerequisite. Users who arrive at a page like "Diagram Page" and see the audience selector have no context. Consider:
- Adding a tooltip or helper link "Manage audiences" on every selector
- Making Audience the home/landing page of the settings

### Page Title Naming Convention
Adopt a single convention. Recommendation: **noun phrase describing the thing being configured**, not the action or the product name.
- "Feature Access" → "Feature Permissions"
- "Resource Access" → "Content Permissions"
- "WalkMe Digital Adoption Platform" → "WalkMe"
- "SAP Signavio Process Insights" → "Process Insights"
- "SAP Cloud ALM Synchronization" → "Cloud ALM"

### Sparse Pages
The following pages have so little content they create navigation overhead without delivering value as standalone pages. Candidates for consolidation:
- Comments (1 dropdown)
- Read Confirmation (1 checkbox)
- WalkMe (2 radio buttons)
- External Embedding (1 toggle)
- DiagramDownload (1 checkbox)
- CloudALM (read-only message + 1 link)

### Missing Save State Feedback
Not strictly IA but adjacent: the Save/Reset buttons are present on all pages but there is no visible "unsaved changes" indicator. Users editing multiple pages in sequence may not know which pages have pending changes.
