import React from 'react'
import { Avatar, Button, Input, Label, Tab, TabContainer, Text } from '@ui5/webcomponents-react'
import { SigChipV2 } from '@signavio/sap-signavio-uixtension'

export type DictPanelItem = {
  id: string
  name: string
  category: string
  subCategory?: string
  elementType?: string
  description: string
  lastUpdated: string
  usedInDiagram?: boolean
  isFavorite?: boolean
}

const ITEM_META: Record<string, { latestRevision: string; latestStatus: string; publishedRevision?: string; created: string; changed: string; createdBy: string; changedBy: string }> = {
  'd27': { latestRevision: '2.3', latestStatus: 'published', publishedRevision: '2.3', created: '10.01.2025', changed: '10.03.2026', createdBy: 'Sarah Chen', changedBy: 'Sarah Chen' },
  'd28': { latestRevision: '1.6', latestStatus: 'published', publishedRevision: '1.5', created: '01.02.2025', changed: '15.03.2026', createdBy: 'HR Manager', changedBy: 'HR Manager' },
  'd41': { latestRevision: '3.0', latestStatus: 'published', publishedRevision: '3.0', created: '15.01.2025', changed: '15.03.2026', createdBy: 'IT Admin', changedBy: 'IT Admin' },
  'd61': { latestRevision: '2.2', latestStatus: 'draft', publishedRevision: '2.1', created: '11.03.2025', changed: '11.03.2026', createdBy: 'Lisa Wang', changedBy: 'Lisa Wang' },
}

const ITEM_ATTRS: Record<string, { label: string; values: string[] }[]> = {
  'd27': [{ label: 'Creator', values: ['Sarah Chen'] }, { label: 'Department', values: ['HR'] }, { label: 'Review Cycle', values: ['Annual'] }],
  'd28': [{ label: 'Creator', values: ['HR Manager'] }, { label: 'Department', values: ['HR'] }],
  'd41': [{ label: 'Owner', values: ['IT Admin'] }, { label: 'Version', values: ['3.0'] }, { label: 'Category', values: ['HR Technology'] }],
  'd61': [{ label: 'Creator', values: ['Lisa Wang'] }, { label: 'Document Type', values: ['Policy', 'Template'] }, { label: 'Language', values: ['English', 'German'] }, { label: 'Expiry Date', values: ['6 months after rejection'] }, { label: 'Review Cycle', values: ['Annual'] }],
}

type Props = {
  item: DictPanelItem
  onClose: () => void
}

function MetaRow({ label, value, chip, chipDesign, chipIcon }: { label: string; value: string; chip?: string; chipDesign?: any; chipIcon?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', height: '1.625rem', gap: '0.75rem' }}>
      <div style={{ width: '7.875rem', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
        <Label style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSize)' }}>{label}:</Label>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapShell_TextColor, var(--sapTextColor))', whiteSpace: 'nowrap' }}>
          {value}
        </Text>
        {chip && <SigChipV2 value={chip} design={chipDesign} leadingIcon={chipIcon} condensed />}
      </div>
    </div>
  )
}

export default function DictionaryDetailPanel({ item, onClose }: Props) {
  const meta = ITEM_META[item.id]
  const attrs = ITEM_ATTRS[item.id] ?? []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--sapBaseColor, #fff)', overflow: 'hidden' }}>

      {/* Row 1: Avatar + category (left) | Open / sep / Close (right) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1rem 0.75rem', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', overflow: 'hidden', flex: 1, minWidth: 0 }}>
          <Avatar
            icon="course-book"
            colorScheme="Accent5"
            shape="Square"
            size="XS"
            style={{ '--_ui5_avatar_border_radius': '0.5rem', width: '1.625rem', height: '1.625rem', '--_ui5_avatar_icon_size': '1rem', flexShrink: 0 } as React.CSSProperties}
          />
          <Text style={{ fontSize: 'var(--sapFontSize)', fontWeight: 700, color: 'var(--sapPageHeader_TextColor)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {item.category}{item.subCategory ? ` / ${item.subCategory}` : ''}
          </Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', height: '1.75rem', flexShrink: 0 }}>
          <Button design="Emphasized" icon="SAP-icons-v4/link" style={{ height: '1.625rem' } as React.CSSProperties}>Open</Button>
          <div style={{ width: 1, height: '1.75rem', background: 'var(--sapToolbar_SeparatorColor, #d9d9d9)', marginInline: '0.75rem', flexShrink: 0 }} />
          <Button design="Transparent" icon="decline" onClick={onClose} />
        </div>
      </div>

      {/* Row 2: Title H3/Black */}
      <div style={{ paddingInline: '1rem', paddingTop: '0.75rem', paddingBottom: '0.75rem', flexShrink: 0 }}>
        <Text style={{ fontSize: 'var(--sapFontHeader3Size, 1.5rem)', fontWeight: 900, color: 'var(--sapPageHeader_TextColor)' }}>
          {item.name}
        </Text>
      </div>

      {/* Row 3: Meta rows */}
      {meta && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', paddingInline: '1rem', paddingBottom: '0.75rem', flexShrink: 0 }}>
          <MetaRow
            label="Latest Revision"
            value={meta.latestRevision}
            chip={meta.latestStatus === 'published' ? 'Published' : 'Draft'}
            chipDesign={meta.latestStatus === 'published' ? ('indication5' as any) : ('indication10' as any)}
            chipIcon={meta.latestStatus === 'published' ? 'SAP-icons-v4/published' : 'write-new-document'}
          />
          {meta.publishedRevision && (
            <MetaRow
              label="Published Revision"
              value={meta.publishedRevision}
              chip="Published"
              chipDesign={'indication5' as any}
              chipIcon="SAP-icons-v4/published"
            />
          )}
          <MetaRow label="Created" value={`${meta.created} by ${meta.createdBy}`} />
          <MetaRow label="Changed" value={`${meta.changed} by ${meta.changedBy}`} />
        </div>
      )}

      {/* Row 4: Tabs */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', minHeight: 0 }}>
        <TabContainer
          style={{ flex: 1, minHeight: 0 } as React.CSSProperties}
        >
        <Tab text="Attributes">
          <div style={{ padding: '0.5rem 1rem 1rem' }}>
            {/* Search */}
            <div style={{ marginBottom: '1rem' }}>
              <Input placeholder="Search for attributes" icon="search" style={{ width: '100%' }} />
            </div>
            {attrs.length > 0 ? (
              <>
                {/* Group header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 0' }}>
                  <Button icon="slim-arrow-down" design="Transparent" style={{ width: '1.5rem', height: '1.5rem', minWidth: '1.5rem', padding: 0 } as React.CSSProperties} />
                  <Text style={{ fontWeight: 700, fontSize: 'var(--sapFontHeader6Size)', color: 'var(--sapPageHeader_TextColor)' }}>
                    Main Attributes ({attrs.length})
                  </Text>
                </div>
                {attrs.map(attr => (
                  <div key={attr.label} style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', padding: '0.5rem 0' }}>
                    <Label showColon style={{ color: 'var(--sapContent_LabelColor)' }}>{attr.label}</Label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                      {attr.values.map((v, i) => <SigChipV2 key={i} value={v} readonly />)}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <Text style={{ color: 'var(--sapContent_LabelColor)' }}>No attributes defined.</Text>
            )}
          </div>
        </Tab>
        <Tab text="Relations">
          <div style={{ padding: '0.5rem 1rem' }}>
            <Text style={{ color: 'var(--sapContent_LabelColor)' }}>No relations defined.</Text>
          </div>
        </Tab>
        <Tab text="Activity">
          <div style={{ padding: '0.5rem 1rem' }}>
            <Text style={{ color: 'var(--sapContent_LabelColor)' }}>No activity yet.</Text>
          </div>
        </Tab>
      </TabContainer>
      </div>
    </div>
  )
}
