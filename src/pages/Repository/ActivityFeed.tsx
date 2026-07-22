import React, { useRef, useState } from 'react'
import { Avatar, Button, Menu, MenuItem, Text, type MenuDomRef, IllustratedMessage } from '@ui5/webcomponents-react'
import { SigChipV2 } from '@signavio/sap-signavio-uixtension'

type ActivityEntry = {
  id: string
  author: string
  initials: string
  action: string
  value?: string
  comment?: string
  timestamp: string
  revision?: number
  type: 'change' | 'comment' | 'publish' | 'create'
}

type RevisionGroup = {
  revision: number
  description: string
  createdAt: string
  createdBy?: string
  entries: ActivityEntry[]
}

// ── Process Model data (revision-grouped, newest first) ──────────────────────

const PM_REVISION_GROUPS: RevisionGroup[] = [
  {
    revision: 4,
    description: 'Created automatically',
    createdAt: 'May 20, 2026 · 02:31 PM',
    createdBy: 'Ludwig Grohe',
    entries: [
      {
        id: 'a1', author: 'Ludwig Grohe', initials: 'LG',
        action: 'published revision 4.',
        timestamp: 'Today · 10:42 AM', revision: 4, type: 'publish',
      },
      {
        id: 'a2', author: 'Ludwig Grohe', initials: 'LG',
        action: 'updated the Process Owner to:',
        value: 'Lina Davis',
        timestamp: 'Today · 10:38 AM', revision: 4, type: 'change',
      },
      {
        id: 'a3', author: 'Marie Carlsen', initials: 'MC',
        action: 'added a comment:',
        comment: 'Hi @Ludwig Grohe, the escalation path in step 4 still references the old SLA matrix. Can you update before we publish?',
        timestamp: 'Today · 09:15 AM', revision: 4, type: 'comment',
      },
      {
        id: 'a4', author: 'Ludwig Grohe', initials: 'LG',
        action: 'updated the Description to:',
        value: 'Full Procure-to-Pay process from purchase requisition through supplier payment, including three-way match and exception handling.',
        timestamp: 'Today · 09:10 AM', revision: 4, type: 'change',
      },
    ],
  },
  {
    revision: 3,
    description: 'Created automatically',
    createdAt: 'May 14, 2026 · 02:31 PM',
    createdBy: 'Paul Gray',
    entries: [
      {
        id: 'b1', author: 'Paul Gray', initials: 'PG',
        action: 'updated the Status to:',
        value: 'Draft',
        timestamp: 'Yesterday · 04:51 PM', revision: 3, type: 'change',
      },
      {
        id: 'b2', author: 'Lina Davis', initials: 'LD',
        action: 'updated the Department to:',
        value: 'Procurement',
        timestamp: 'Yesterday · 03:20 PM', revision: 3, type: 'change',
      },
      {
        id: 'b3', author: 'Tim Green', initials: 'TG',
        action: 'added a comment:',
        comment: 'Looks good overall. One question — should the three-way match exception route back to the requisitioner or go straight to AP?',
        timestamp: 'Yesterday · 11:05 AM', revision: 3, type: 'comment',
      },
      {
        id: 'c1', author: 'Paul Gray', initials: 'PG',
        action: 'published revision 3.',
        timestamp: 'May 20, 2026 · 02:30 PM', revision: 3, type: 'publish',
      },
    ],
  },
  {
    revision: 2,
    description: 'Created automatically',
    createdAt: 'Feb 14, 2024 · 11:22 AM',
    createdBy: 'Sarah Kim',
    entries: [
      {
        id: 'c2', author: 'Paul Gray', initials: 'PG',
        action: 'published revision 2.',
        timestamp: 'May 14, 2026 · 02:30 PM', revision: 2, type: 'publish',
      },
      {
        id: 'c3', author: 'Saskia Wulf', initials: 'SW',
        action: 'updated the Responsible Person to:',
        value: 'Paul Gray',
        timestamp: 'May 14, 2026 · 01:18 PM', revision: 2, type: 'change',
      },
      {
        id: 'c4', author: 'Paul Gray', initials: 'PG',
        action: 'updated the name to:',
        value: 'Procure-to-Pay Process',
        timestamp: 'May 13, 2026 · 09:44 AM', revision: 2, type: 'change',
      },
    ],
  },
  {
    revision: 1,
    description: 'Created when model was created',
    createdAt: 'Feb 14, 2024 · 11:20 AM',
    createdBy: 'Paul Gray',
    entries: [
      {
        id: 'c5', author: 'Paul Gray', initials: 'PG',
        action: 'created this model.',
        timestamp: 'Feb 14, 2024 · 11:20 AM', revision: 1, type: 'create',
      },
    ],
  },
]

// ── Customer Journey data ─────────────────────────────────────────────────────

const CJ_TODAY: ActivityEntry[] = [
  {
    id: 'cj1', author: 'Anna Schmidt', initials: 'AS',
    action: 'updated the Touchpoints to:',
    value: 'Web, Mobile App, Call Centre, In-Store',
    timestamp: 'Today · 11:05 AM', type: 'change',
  },
  {
    id: 'cj2', author: 'Marc Fontaine', initials: 'MF',
    action: 'added a comment:',
    comment: 'The pain-point annotation on step 3 is missing a severity rating. Can someone add it before we share with stakeholders?',
    timestamp: 'Today · 09:30 AM', type: 'comment',
  },
]

const CJ_YESTERDAY: ActivityEntry[] = [
  {
    id: 'cj3', author: 'Anna Schmidt', initials: 'AS',
    action: 'updated the Status to:',
    value: 'Draft',
    timestamp: 'Yesterday · 03:45 PM', type: 'change',
  },
  {
    id: 'cj4', author: 'Marc Fontaine', initials: 'MF',
    action: 'updated the Persona to:',
    value: 'Returning B2C Customer',
    timestamp: 'Yesterday · 10:20 AM', type: 'change',
  },
]

const CJ_EARLIER: ActivityEntry[] = [
  {
    id: 'cj5', author: 'Anna Schmidt', initials: 'AS',
    action: 'published revision 1.',
    timestamp: 'May 10, 2026 · 01:00 PM', type: 'publish',
  },
  {
    id: 'cj6', author: 'Anna Schmidt', initials: 'AS',
    action: 'created this journey.',
    timestamp: 'Mar 3, 2025 · 09:00 AM', type: 'create',
  },
]

// ── Navigation Map data ───────────────────────────────────────────────────────

const NM_TODAY: ActivityEntry[] = [
  {
    id: 'nm1', author: 'Felix Braun', initials: 'FB',
    action: 'added a link to:',
    value: 'Supplier Onboarding Process',
    timestamp: 'Today · 08:55 AM', type: 'change',
  },
]

const NM_YESTERDAY: ActivityEntry[] = [
  {
    id: 'nm2', author: 'Sofia Reyes', initials: 'SR',
    action: 'updated the Category to:',
    value: 'Source-to-Pay',
    timestamp: 'Yesterday · 04:10 PM', type: 'change',
  },
  {
    id: 'nm3', author: 'Felix Braun', initials: 'FB',
    action: 'added a comment:',
    comment: 'Should we group the finance sub-maps under a separate node? The current flat structure is getting hard to navigate.',
    timestamp: 'Yesterday · 02:30 PM', type: 'comment',
  },
]

const NM_EARLIER: ActivityEntry[] = [
  {
    id: 'nm4', author: 'Sofia Reyes', initials: 'SR',
    action: 'published revision 2.',
    timestamp: 'May 12, 2026 · 11:00 AM', type: 'publish',
  },
  {
    id: 'nm5', author: 'Felix Braun', initials: 'FB',
    action: 'created this map.',
    timestamp: 'Jun 1, 2024 · 10:00 AM', type: 'create',
  },
]

// ── Value Chain data ──────────────────────────────────────────────────────────

const VC_TODAY: ActivityEntry[] = [
  {
    id: 'vc1', author: 'Irene Koch', initials: 'IK',
    action: 'updated the Owner to:',
    value: 'Chief Operating Officer',
    timestamp: 'Today · 10:00 AM', type: 'change',
  },
]

const VC_YESTERDAY: ActivityEntry[] = [
  {
    id: 'vc2', author: 'Irene Koch', initials: 'IK',
    action: 'added a comment:',
    comment: 'The "Deliver" stage is missing the reverse logistics sub-chain. Adding it next sprint.',
    timestamp: 'Yesterday · 01:15 PM', type: 'comment',
  },
  {
    id: 'vc3', author: 'David Park', initials: 'DP',
    action: 'updated the Status to:',
    value: 'Published',
    timestamp: 'Yesterday · 09:50 AM', type: 'change',
  },
]

const VC_EARLIER: ActivityEntry[] = [
  {
    id: 'vc4', author: 'David Park', initials: 'DP',
    action: 'published revision 1.',
    timestamp: 'May 8, 2026 · 03:00 PM', type: 'publish',
  },
  {
    id: 'vc5', author: 'David Park', initials: 'DP',
    action: 'created this value chain.',
    timestamp: 'Oct 15, 2024 · 08:30 AM', type: 'create',
  },
]

// ── Dashboard data ────────────────────────────────────────────────────────────

const DB_TODAY: ActivityEntry[] = [
  {
    id: 'db1', author: 'Laura Tan', initials: 'LT',
    action: 'updated the Reporting Period to:',
    value: 'Q2 2026',
    timestamp: 'Today · 09:45 AM', type: 'change',
  },
  {
    id: 'db2', author: 'Laura Tan', initials: 'LT',
    action: 'added a comment:',
    comment: 'KPI tile for cycle time is pulling from the wrong data source. @Felix Braun can you fix the mapping?',
    timestamp: 'Today · 09:40 AM', type: 'comment',
  },
]

const DB_YESTERDAY: ActivityEntry[] = [
  {
    id: 'db3', author: 'Felix Braun', initials: 'FB',
    action: 'updated the Status to:',
    value: 'Published',
    timestamp: 'Yesterday · 05:00 PM', type: 'change',
  },
]

const DB_EARLIER: ActivityEntry[] = [
  {
    id: 'db4', author: 'Laura Tan', initials: 'LT',
    action: 'published revision 1.',
    timestamp: 'May 5, 2026 · 02:00 PM', type: 'publish',
  },
  {
    id: 'db5', author: 'Laura Tan', initials: 'LT',
    action: 'created this dashboard.',
    timestamp: 'Jan 20, 2025 · 11:00 AM', type: 'create',
  },
]

// ── Generic file data ─────────────────────────────────────────────────────────

const FILE_TODAY: ActivityEntry[] = [
  {
    id: 'f1', author: 'Chris Jordan', initials: 'CJ',
    action: 'updated the Description to:',
    value: 'Updated reference document for Q2 compliance review.',
    timestamp: 'Today · 10:15 AM', type: 'change',
  },
]

const FILE_YESTERDAY: ActivityEntry[] = [
  {
    id: 'f2', author: 'Chris Jordan', initials: 'CJ',
    action: 'added a comment:',
    comment: 'Version attached matches the signed-off copy from the audit committee meeting.',
    timestamp: 'Yesterday · 03:30 PM', type: 'comment',
  },
]

const FILE_EARLIER: ActivityEntry[] = [
  {
    id: 'f3', author: 'Chris Jordan', initials: 'CJ',
    action: 'uploaded this file.',
    timestamp: 'Apr 10, 2026 · 09:00 AM', type: 'create',
  },
]

// ── Dictionary Entry data (revision-grouped, newest first) ───────────────────

const DE_REVISION_GROUPS: RevisionGroup[] = [
  {
    revision: 3,
    description: 'Created automatically',
    createdAt: '4 Jan 2025 · 11:20 AM',
    entries: [
      { id: 'de1', author: 'John Miller', initials: 'JM', action: 'updated the dictionary entry', timestamp: '4 Jan 2025 - 11:50AM', type: 'change' },
      { id: 'de2', author: 'John Miller', initials: 'JM', action: 'restored the revision', timestamp: '4 Jan 2025 - 12:10 PM', type: 'change' },
    ],
  },
  {
    revision: 2,
    description: 'Created automatically',
    createdAt: '4 Jan 2025 · 11:20 AM',
    entries: [
      { id: 'de3', author: 'John Miller', initials: 'JM', action: 'updated the dictionary entry', timestamp: '4 Jan 2025 - 11:50AM', type: 'change' },
      { id: 'de4', author: 'John Miller', initials: 'JM', action: 'changed the title to:', value: 'Procurement Unit', timestamp: '4 Jan 2025 - 11:50AM', type: 'change' },
      { id: 'de5', author: 'John Miller', initials: 'JM', action: 'changed the description to:', value: 'A procurement org unit responsible for procuring goods and services.', timestamp: '4 Jan 2025 - 11:50AM', type: 'change' },
    ],
  },
  {
    revision: 1,
    description: 'Created automatically',
    createdAt: '4 Jan 2025 · 11:20 AM',
    entries: [
      { id: 'de6', author: 'John Miller', initials: 'JM', action: 'created the dictionary entry', timestamp: '4 Jan 2025 - 11:27 AM', type: 'create' },
    ],
  },
]

// ── Dictionary Category data (all entries, date-grouped) ─────────────────────

type DictCatRevisionCard = RevisionGroup & { entryName: string; chipStatus?: string }

const DC_TODAY_CARDS: DictCatRevisionCard[] = [
  { revision: 1, entryName: 'Procurement Unit', description: 'Created automatically', createdAt: '4 Jan 2025 - 11:20 AM', entries: [
    { id: 'dc1', author: 'John Miller', initials: 'JM', action: 'created the dictionary entry', timestamp: '4 Jan 2025 - 11:27 AM', type: 'create' },
  ]},
  { revision: 3, entryName: 'Purchase Order', description: 'Created automatically', createdAt: '4 Jan 2025 - 11:20 AM', chipStatus: 'Published', entries: [
    { id: 'dc2', author: 'John Miller', initials: 'JM', action: 'updated the dictionary entry', timestamp: '4 Jan 2025 - 11:50AM', type: 'change' },
    { id: 'dc3', author: 'John Miller', initials: 'JM', action: 'restored the revision', timestamp: '4 Jan 2025 - 12:10 PM', type: 'change' },
  ]},
]

const DC_YESTERDAY_CARDS: DictCatRevisionCard[] = [
  { revision: 1, entryName: 'Goods Receipt', description: 'Created automatically', createdAt: '4 Jan 2025 - 11:20 AM', entries: [
    { id: 'dc4', author: 'John Miller', initials: 'JM', action: 'created the dictionary entry', timestamp: '4 Jan 2025 - 11:27 AM', type: 'create' },
  ]},
  { revision: 2, entryName: 'Procurement Unit', description: 'Created automatically', createdAt: '4 Jan 2025 - 11:20 AM', entries: [
    { id: 'dc5', author: 'John Miller', initials: 'JM', action: 'updated the dictionary entry', timestamp: '4 Jan 2025 - 11:50AM', type: 'change' },
    { id: 'dc6', author: 'John Miller', initials: 'JM', action: 'changed the title to:', value: 'Procurement Unit', timestamp: '4 Jan 2025 - 11:50AM', type: 'change' },
    { id: 'dc7', author: 'John Miller', initials: 'JM', action: 'changed the description to:', value: 'A procurement org unit responsible for procuring goods and services.', timestamp: '4 Jan 2025 - 11:50AM', type: 'change' },
  ]},
]

const DC_EARLIER_CARDS: DictCatRevisionCard[] = [
  { revision: 2, entryName: 'Goods Receipt', description: 'Created automatically', createdAt: '4 Jan 2025 - 11:20 AM', entries: [
    { id: 'dc8', author: 'John Miller', initials: 'JM', action: 'updated the dictionary entry', timestamp: '4 Jan 2025 - 11:50AM', type: 'change' },
    { id: 'dc9', author: 'John Miller', initials: 'JM', action: 'changed the title to:', value: 'Goods Receipt', timestamp: '4 Jan 2025 - 11:50AM', type: 'change' },
    { id: 'dc10', author: 'John Miller', initials: 'JM', action: 'changed the description to:', value: 'Physical receipt of ordered goods into the warehouse management system.', timestamp: '4 Jan 2025 - 11:50AM', type: 'change' },
  ]},
  { revision: 1, entryName: 'Goods Receipt', description: 'Created automatically', createdAt: '4 Jan 2025 - 11:20 AM', entries: [
    { id: 'dc11', author: 'John Miller', initials: 'JM', action: 'created the dictionary entry', timestamp: '4 Jan 2025 - 11:27 AM', type: 'create' },
  ]},
]

// ── Folder data (combined feed for all folder contents) ───────────────────────

type FolderRevisionCard = RevisionGroup & { assetName: string; assetType: string; chipStatus?: string }

const FOLDER_TODAY_CARDS: FolderRevisionCard[] = [
  { revision: 4, assetName: 'Procure-to-Pay Process', assetType: 'Process Model', description: 'Created automatically', createdAt: 'Today · 10:42 AM', createdBy: 'Ludwig Grohe', chipStatus: 'Published', entries: [
    { id: 'f1', author: 'Ludwig Grohe', initials: 'LG', action: 'published revision 4.', timestamp: 'Today · 10:42 AM', type: 'publish' },
    { id: 'f2', author: 'Sarah Kim', initials: 'SK', action: 'updated the Process Owner to:', value: 'Lina Davis', timestamp: 'Today · 09:15 AM', type: 'change' },
  ]},
  { revision: 2, assetName: 'Supplier Onboarding', assetType: 'Process Model', description: 'Created automatically', createdAt: 'Today · 08:30 AM', createdBy: 'Paul Gray', entries: [
    { id: 'f3', author: 'Paul Gray', initials: 'PG', action: 'updated the description.', timestamp: 'Today · 08:30 AM', type: 'change' },
  ]},
]

const FOLDER_YESTERDAY_CARDS: FolderRevisionCard[] = [
  { revision: 3, assetName: 'Invoice Validation Flow', assetType: 'Process Model', description: 'Created automatically', createdAt: 'Yesterday · 04:12 PM', createdBy: 'Marie Carlsen', entries: [
    { id: 'f4', author: 'Marie Carlsen', initials: 'MC', action: 'changed the status to:', value: 'In Review', timestamp: 'Yesterday · 04:12 PM', type: 'change' },
    { id: 'f5', author: 'Marie Carlsen', initials: 'MC', action: 'updated the title to:', value: 'Invoice Validation Flow', timestamp: 'Yesterday · 03:50 PM', type: 'change' },
  ]},
  { revision: 1, assetName: 'Catalog-Based Buying', assetType: 'Process Model', description: 'Created automatically', createdAt: 'Yesterday · 02:00 PM', createdBy: 'Paul Gray', entries: [
    { id: 'f6', author: 'Paul Gray', initials: 'PG', action: 'created the process model.', timestamp: 'Yesterday · 02:00 PM', type: 'create' },
  ]},
]

const FOLDER_EARLIER_CARDS: FolderRevisionCard[] = [
  { revision: 2, assetName: 'Purchase Requisition Approval', assetType: 'Process Model', description: 'Created automatically', createdAt: 'May 20, 2026 · 11:30 AM', createdBy: 'Ludwig Grohe', chipStatus: 'Published', entries: [
    { id: 'f7', author: 'Ludwig Grohe', initials: 'LG', action: 'published revision 2.', timestamp: 'May 20, 2026 · 11:30 AM', type: 'publish' },
  ]},
]

// ── Data selector ─────────────────────────────────────────────────────────────

type AssetTypeKey = 'Process Model' | 'Customer Journey' | 'Navigation Map' | 'Value Chain' | 'Dashboard' | 'File' | string

function dataForType(assetType: AssetTypeKey) {
  switch (assetType) {
    case 'Customer Journey': return { today: CJ_TODAY, yesterday: CJ_YESTERDAY, earlier: CJ_EARLIER }
    case 'Navigation Map':  return { today: NM_TODAY,  yesterday: NM_YESTERDAY,  earlier: NM_EARLIER }
    case 'Value Chain':     return { today: VC_TODAY,  yesterday: VC_YESTERDAY,  earlier: VC_EARLIER }
    case 'Dashboard':       return { today: DB_TODAY,  yesterday: DB_YESTERDAY,  earlier: DB_EARLIER }
    default:                return { today: FILE_TODAY, yesterday: FILE_YESTERDAY, earlier: FILE_EARLIER }
  }
}

// ── Rendering ─────────────────────────────────────────────────────────────────

function iconForType(type: ActivityEntry['type']) {
  if (type === 'comment') return 'comment'
  if (type === 'publish') return 'world'
  if (type === 'create') return 'add'
  return 'edit'
}

function ActivityItem({ entry }: { entry: ActivityEntry }) {
  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', padding: '8px 0' }}>
      <div style={{ flexShrink: 0, paddingTop: '2px' }}>
        <Avatar
          colorScheme="Accent10"
          size="XS"
          initials={entry.initials}
          icon={iconForType(entry.type)}
          shape="Circle"
          style={{ '--_ui5_avatar_font_size': '10px' } as React.CSSProperties}
        />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 'var(--sapFontSize)',
          color: 'var(--sapList_TextColor)',
          lineHeight: '1.4',
          fontFamily: "var(--sapFontFamily,'72',sans-serif)",
        }}>
          <span style={{ fontWeight: '700' }}>{entry.author} </span>
          <span style={{ fontWeight: '400' }}>{entry.action}</span>
        </div>
        {entry.value && (
          <div style={{
            fontSize: 'var(--sapFontSize)',
            fontWeight: '700',
            color: 'var(--sapTextColor)',
            lineHeight: '1.5',
            marginTop: '2px',
            fontFamily: "var(--sapFontFamily,'72',sans-serif)",
          }}>{entry.value}</div>
        )}
        {entry.comment && (
          <div style={{
            marginTop: '4px',
            paddingLeft: '8px',
            borderLeft: '2px solid var(--sapNeutralBorderColor, #e8e8e8)',
            fontSize: 'var(--sapFontSize)',
            fontWeight: '400',
            color: 'var(--sapTextColor)',
            lineHeight: '1.5',
            fontFamily: "var(--sapFontFamily,'72',sans-serif)",
          }}>
            {entry.comment.split(/@([^\s,]+)/g).map((part, i) =>
              i % 2 === 1
                ? <span key={i} style={{ color: 'var(--sapLinkColor, #0064d9)', fontWeight: '700' }}>@{part}</span>
                : <span key={i}>{part}</span>
            )}
          </div>
        )}
        <div style={{
          fontSize: 'var(--sapFontSmallSize)',
          color: 'var(--sapContent_LabelColor)',
          marginTop: '4px',
          fontFamily: "var(--sapFontFamily,'72',sans-serif)",
        }}>{entry.timestamp}</div>
      </div>
    </div>
  )
}

function RevisionCard({ group, isPublished, showRestoreButton, restoreDisabled, assetName, assetType: assetTypeProp }: { group: RevisionGroup; isPublished?: boolean; showRestoreButton?: boolean; restoreDisabled?: boolean; assetName?: string; assetType?: string }) {
  const menuRef = useRef<MenuDomRef>(null)
  const btnId = `revision-menu-${group.revision}`

  return (
    <div style={{
      border: '1px solid var(--sapGroup_ContentBorderColor, #d9d9d9)',
      borderRadius: '16px',
      padding: '16px',
      background: 'var(--sapTile_Background, white)',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
    }}>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {assetName && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ fontSize: 'var(--sapFontSize)', fontWeight: '700', color: 'var(--sapList_TextColor)', fontFamily: "var(--sapFontFamily,'72',sans-serif)" }}>
              {assetName} · Revision {group.revision}
            </div>
            {isPublished && <SigChipV2 value="Published" design="indication5" condensed leadingIcon="SAP-icons-v4/published" />}
          </div>
        )}
        {!assetName && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            fontSize: 'var(--sapFontSize)',
            fontWeight: '700',
            color: 'var(--sapList_TextColor)',
            fontFamily: "var(--sapFontFamily,'72',sans-serif)",
          }}>
            Revision {group.revision}
          </div>
          {isPublished && <SigChipV2 value="Published" design="indication5" condensed leadingIcon="SAP-icons-v4/published" />}
        </div>
        )}
        <div style={{
          fontSize: 'var(--sapFontSize)',
          color: 'var(--sapList_TextColor)',
          fontFamily: "var(--sapFontFamily,'72',sans-serif)",
        }}>
          {group.createdBy ? `Created by ${group.createdBy}` : (assetTypeProp ?? group.description)}
        </div>
        {!assetTypeProp && !group.createdBy && null}
        <div style={{
          fontSize: 'var(--sapFontSize)',
          color: 'var(--sapContent_LabelColor)',
          fontFamily: "var(--sapFontFamily,'72',sans-serif)",
        }}>
          {group.createdAt}
        </div>
      </div>
      {showRestoreButton ? (
        <Button design="Transparent" icon="undo" disabled={restoreDisabled}>Restore</Button>
      ) : (
        <>
          <Button
            id={btnId}
            icon="overflow"
            design="Transparent"
            onClick={(e) => {
              if (menuRef.current) {
                menuRef.current.opener = e.currentTarget as HTMLElement
                menuRef.current.open = true
              }
            }}
          />
          <Menu ref={menuRef}>
            <MenuItem text="Open" icon="full-screen" />
            <MenuItem text="Edit in Editor" icon="write-new" />
            <MenuItem text="Compare" icon="compare" />
            <MenuItem text="Restore" icon="undo" />
            <MenuItem text="Publish" icon="world" />
          </Menu>
        </>
      )}
    </div>
  )
}

function RevisionFeedSection({ group, isPublished }: { group: RevisionGroup; isPublished?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {group.entries.map(e => <ActivityItem key={e.id} entry={e} />)}
      <div style={{ paddingBottom: '12px', paddingTop: '4px' }}>
        <RevisionCard group={group} isPublished={isPublished} />
      </div>
    </div>
  )
}

function GroupSection({ label, entries, defaultExpanded = true }: {
  label: string
  entries: ActivityEntry[]
  defaultExpanded?: boolean
}) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', paddingTop: '4px', paddingBottom: '2px' }}>
        <Button
          icon={expanded ? 'slim-arrow-down' : 'navigation-right-arrow'}
          design="Transparent"
          onClick={() => setExpanded(v => !v)}
        />
        <Text style={{
          fontWeight: '700',
          fontSize: 'var(--sapFontHeader6Size)',
          color: 'var(--sapPageHeader_TextColor)',
          fontFamily: "var(--sapFontFamily,'72',sans-serif)",
        }}>{label}</Text>
      </div>
      {expanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {entries.map(e => <ActivityItem key={e.id} entry={e} />)}
        </div>
      )}
    </div>
  )
}

type Props = { assetType?: string; isEmpty?: boolean }

export default function ActivityFeed({ assetType = 'File', isEmpty = false }: Props) {
  const [showMore, setShowMore] = useState(false)

  if (isEmpty) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '200px' }}>
        <IllustratedMessage name="NoActivities" titleText="No Activity" subtitleText="Activity will appear here once the entry is created." />
      </div>
    )
  }

  if (assetType === 'Process Model' || assetType === 'Value Chain' || assetType === 'Navigation Map') {
    const PM_SECTIONS = [
      { label: 'Today', groups: [PM_REVISION_GROUPS[0]] },
      { label: 'Yesterday', groups: [PM_REVISION_GROUPS[1]] },
      { label: 'Earlier', groups: PM_REVISION_GROUPS.slice(2) },
    ].filter(s => s.groups.length > 0)
    const visibleSections = showMore ? PM_SECTIONS : PM_SECTIONS.slice(0, 2)
    const latestPublishedRevision = Math.max(
      ...PM_REVISION_GROUPS.filter(g => g.entries.some(e => e.type === 'publish')).map(g => g.revision),
      -Infinity
    )
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '0', fontFamily: "var(--sapFontFamily,'72',sans-serif)", overflowY: 'auto', flex: 1 }}>
        {visibleSections.map(({ label, groups }) => (
          <div key={label}>
            <Text style={{ fontWeight: '700', fontSize: 'var(--sapFontHeader6Size)', color: 'var(--sapPageHeader_TextColor)', fontFamily: "var(--sapFontFamily,'72',sans-serif)", display: 'block', padding: '8px 0' }}>
              {label}
            </Text>
            {groups.map(group => (
              <RevisionFeedSection key={group.revision} group={group} isPublished={group.revision === latestPublishedRevision} />
            ))}
          </div>
        ))}
        {PM_SECTIONS.length > 2 && (
          <Button design="Default" onClick={() => setShowMore(v => !v)} style={{ alignSelf: 'flex-start', marginTop: '4px' }}>
            {showMore ? 'Show less' : 'Show more'}
          </Button>
        )}
      </div>
    )
  }

  // Folder: combined feed for all folder contents, date-grouped with asset-labelled revision cards
  if (assetType === 'Folder') {
    const FOLDER_SECTIONS = [
      { label: 'Today', cards: FOLDER_TODAY_CARDS },
      { label: 'Yesterday', cards: FOLDER_YESTERDAY_CARDS },
      { label: 'Earlier this week', cards: FOLDER_EARLIER_CARDS },
    ]
    const visibleSections = showMore ? FOLDER_SECTIONS : FOLDER_SECTIONS.slice(0, 2)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '0', fontFamily: "var(--sapFontFamily,'72',sans-serif)", overflowY: 'auto', flex: 1 }}>
        {visibleSections.map(({ label, cards }) => (
          <div key={label}>
            <Text style={{ fontWeight: '700', fontSize: 'var(--sapFontHeader6Size)', color: 'var(--sapPageHeader_TextColor)', fontFamily: "var(--sapFontFamily,'72',sans-serif)", display: 'block', padding: '8px 0' }}>
              {label}
            </Text>
            {cards.map(card => (
              <div key={`${card.assetName}-${card.revision}`}>
                <div style={{ paddingBottom: '12px', paddingTop: '4px' }}>
                  <RevisionCard
                    group={card}
                    isPublished={!!card.chipStatus && card.chipStatus === 'Published'}
                    assetName={card.assetName}
                    assetType={card.assetType}
                  />
                </div>
                {card.entries.map(e => <ActivityItem key={e.id} entry={e} />)}
              </div>
            ))}
          </div>
        ))}
        <Button design="Default" onClick={() => setShowMore(v => !v)} style={{ alignSelf: 'flex-start', marginTop: '4px' }}>
          {showMore ? 'Show less' : 'Show more'}
        </Button>
      </div>
    )
  }

  // Dictionary Category: combined feed for all entries, date-grouped with entry-labelled revision cards
  if (assetType === 'Dictionary Category') {
    const DC_SECTIONS = [
      { label: 'Today', cards: DC_TODAY_CARDS },
      { label: 'Yesterday', cards: DC_YESTERDAY_CARDS },
      { label: 'Earlier this week', cards: DC_EARLIER_CARDS },
    ]
    const visibleSections = showMore ? DC_SECTIONS : DC_SECTIONS.slice(0, 2)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '0', fontFamily: "var(--sapFontFamily,'72',sans-serif)", overflowY: 'auto', flex: 1 }}>
        {visibleSections.map(({ label, cards }) => (
          <div key={label}>
            <Text style={{ fontWeight: '700', fontSize: 'var(--sapFontHeader6Size)', color: 'var(--sapPageHeader_TextColor)', fontFamily: "var(--sapFontFamily,'72',sans-serif)", display: 'block', padding: '8px 0' }}>
              {label}
            </Text>
            {cards.map(card => (
              <div key={`${card.entryName}-${card.revision}`}>
                {/* Revision card with entry name prefix */}
                <div style={{ border: '1px solid var(--sapGroup_ContentBorderColor, #d9d9d9)', borderRadius: '16px', padding: '16px', background: 'var(--sapTile_Background, white)', display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '4px', marginTop: '4px' }}>
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: 'var(--sapFontSize)', fontWeight: '700', color: 'var(--sapList_TextColor)', fontFamily: "var(--sapFontFamily,'72',sans-serif)" }}>
                        {card.entryName} · Revision {card.revision}
                      </span>
                      {card.chipStatus && <SigChipV2 value={card.chipStatus} design={card.chipStatus === 'Published' ? 'indication5' : 'indication10'} condensed leadingIcon={card.chipStatus === 'Published' ? 'SAP-icons-v4/published' : undefined} />}
                    </div>
                    <div style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapList_TextColor)', fontFamily: "var(--sapFontFamily,'72',sans-serif)" }}>{card.description}</div>
                    <div style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)', fontFamily: "var(--sapFontFamily,'72',sans-serif)" }}>{card.createdAt}</div>
                  </div>
                  <Button design="Transparent" icon="undo">Restore</Button>
                </div>
                {card.entries.map(e => <ActivityItem key={e.id} entry={e} />)}
              </div>
            ))}
          </div>
        ))}
        <Button design="Default" onClick={() => setShowMore(v => !v)} style={{ alignSelf: 'flex-start', marginTop: '4px' }}>
          {showMore ? 'Show less' : 'Show more'}
        </Button>
      </div>
    )
  }

  // Dictionary Entry: revision-grouped with date section headers
  const isDictEntry = assetType === 'Dictionary Entry' || assetType.endsWith(' Entry')
  if (isDictEntry) {
    const DATE_SECTIONS = [
      { label: 'Today', group: DE_REVISION_GROUPS[0] },
      { label: 'Yesterday', group: DE_REVISION_GROUPS[1] },
      { label: 'Earlier this week', group: DE_REVISION_GROUPS[2] },
    ]
    const visibleSections = showMore ? DATE_SECTIONS : DATE_SECTIONS.slice(0, 2)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '0', fontFamily: "var(--sapFontFamily,'72',sans-serif)", overflowY: 'auto', flex: 1 }}>
        {visibleSections.map(({ label, group }, i) => (
          <div key={label}>
            <Text style={{ fontWeight: '700', fontSize: 'var(--sapFontHeader6Size)', color: 'var(--sapPageHeader_TextColor)', fontFamily: "var(--sapFontFamily,'72',sans-serif)", display: 'block', padding: '8px 0' }}>
              {label}
            </Text>
            <div style={{ paddingBottom: '8px', paddingTop: '4px' }}>
              <RevisionCard group={group} showRestoreButton isPublished={group.revision === 3} restoreDisabled={i === 0} />
            </div>
            {group.entries.map(e => <ActivityItem key={e.id} entry={e} />)}
          </div>
        ))}
        <Button design="Default" onClick={() => setShowMore(v => !v)} style={{ alignSelf: 'flex-start', marginTop: '4px' }}>
          {showMore ? 'Show less' : 'Show more'}
        </Button>
      </div>
    )
  }

  const { today, yesterday, earlier } = dataForType(assetType)

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: '12px',
      padding: '0',
      fontFamily: "var(--sapFontFamily,'72',sans-serif)",
      overflowY: 'auto',
      flex: 1,
    }}>
      <GroupSection label="Today" entries={today} defaultExpanded />
      <div style={{ borderTop: '1px solid var(--sapList_BorderColor)' }} />
      <GroupSection label="Yesterday" entries={yesterday} defaultExpanded={false} />
      <div style={{ borderTop: '1px solid var(--sapList_BorderColor)' }} />
      <GroupSection label="Earlier this week" entries={[]} defaultExpanded={false} />
      {showMore && (
        <>
          <div style={{ borderTop: '1px solid var(--sapList_BorderColor)' }} />
          <GroupSection label="Earlier this month" entries={earlier} defaultExpanded={false} />
        </>
      )}
      <Button
        design="Default"
        onClick={() => setShowMore(v => !v)}
        style={{ alignSelf: 'flex-start', marginTop: '4px' }}
      >
        {showMore ? 'Show less' : 'Show more'}
      </Button>
    </div>
  )
}
