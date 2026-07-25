import React, { useState } from 'react'
import { Avatar, Button, Icon, Input, Label, List, ListItemCustom, ListItemStandard, Title, Text } from '@ui5/webcomponents-react'
import { createPortal } from 'react-dom'

const DICT_DATA: Record<string, { name: string; category: string; subCategory: string; description: string }> = {
  'd27': { name: 'Evaluate CV',         category: 'Activities',  subCategory: 'HR Processes',    description: 'Review and evaluate submitted curriculum vitae against job requirements' },
  'd28': { name: 'Interview candidate', category: 'Activities',  subCategory: 'HR Processes',    description: 'Conduct structured interview with candidate' },
  'd41': { name: 'ATS System',          category: 'IT System',   subCategory: 'HR Technology',   description: 'Applicant Tracking System for managing recruitment workflow' },
  'd30': { name: 'Make offer',          category: 'Activities',  subCategory: 'HR Processes',    description: 'Prepare and deliver formal job offer to selected candidate' },
  'd31': { name: 'Onboard candidate',   category: 'Activities',  subCategory: 'HR Processes',    description: 'Complete onboarding process for new hire' },
}

export function getDictName(dictId: string): string {
  return DICT_DATA[dictId]?.name ?? dictId
}

const SEARCH_ENTRIES = Object.entries(DICT_DATA).map(([id, v]) => ({ id, ...v }))

type LinkedProps = {
  dictId: string
  elementName: string
  anchorRect: DOMRect
  onClose: () => void
  onUnlink: () => void
  onLink: (dictId: string) => void
}

type UnlinkedProps = {
  elementName: string
  anchorRect: DOMRect
  onClose: () => void
  onLink: (dictId: string) => void
  headerTitle?: string
  subText?: string
}

function PopupContainer({ anchorRect, width, children }: { anchorRect: DOMRect; width: number; children: React.ReactNode }) {
  const left = Math.min(anchorRect.left, window.innerWidth - width - 8)
  const top = anchorRect.bottom + 1
  return createPortal(
    <div
      style={{
        position: 'fixed',
        left: Math.max(8, left),
        top,
        width,
        zIndex: 10001,
        background: 'var(--sapGroup_ContentBackground, #fff)',
        borderRadius: '0.75rem',
        boxShadow: '0 0 2px rgba(34,53,72,0.2), 0 2px 4px rgba(34,53,72,0.2)',
        overflow: 'hidden',
        fontFamily: 'var(--sapFontFamily)',
      }}
      onMouseDown={e => e.stopPropagation()}
    >
      {children}
    </div>,
    document.body
  )
}

export function LinkedDictPopup({ dictId, elementName, anchorRect, onClose, onUnlink, onLink }: LinkedProps) {
  const [replacing, setReplacing] = useState(false)
  const dict = DICT_DATA[dictId]
  const name = dict?.name ?? elementName
  const category = dict ? `${dict.category} / ${dict.subCategory}` : ''

  if (replacing) {
    return (
      <UnlinkedDictPopup
        elementName={elementName}
        anchorRect={anchorRect}
        onClose={onClose}
        onLink={(newDictId) => { onLink(newDictId); onClose() }}
        headerTitle="Replace Dictionary Link"
        subText={`Currently linked to "${elementName}". Select a new item below.`}
      />
    )
  }

  return (
    <PopupContainer anchorRect={anchorRect} width={320}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
        padding: '0.75rem 1rem', background: 'var(--sapPageHeader_Background, #fff)',
        borderBottom: '1px solid var(--sapPageHeader_BorderColor, #d9d9d9)',
      }}>
        <Avatar icon="SAP-icons-v4/dictionary-entry" colorScheme="Accent5" shape="Square" size="S" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
          <Label style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>
            Linked Dictionary Item
          </Label>
          <Title level="H5" style={{ margin: 0 }}>{name}</Title>
          <Label style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapTextColor)' }}>
            {category}
          </Label>
        </div>
        <Button design="Transparent" icon="decline" onClick={onClose}
          style={{ '--_ui5_button_base_min_width': '2rem', width: '2rem', height: '2rem', flexShrink: 0 } as React.CSSProperties} />
      </div>

      {/* Menu items */}
      <List separators="None">
        <ListItemStandard>
          Go to Dictionary <Icon name="SAP-icons-v4/link" style={{ width: '0.875rem', height: '0.875rem', color: 'var(--sapHighlightColor)', verticalAlign: 'middle', marginLeft: '0.25rem' } as React.CSSProperties} />
        </ListItemStandard>
        <ListItemStandard>View Details</ListItemStandard>
        <ListItemStandard onClick={() => setReplacing(true)}>Replace Dictionary Link</ListItemStandard>
      </List>

      {/* Unlink */}
      <div style={{ borderTop: '1px solid var(--sapPageFooter_BorderColor, #d9d9d9)' }}>
        <List separators="None">
          <ListItemStandard onClick={onUnlink}>
            <span style={{ color: 'var(--sapButton_Reject_TextColor, #aa0808)' }}>Unlink from Dictionary</span>
          </ListItemStandard>
        </List>
      </div>
    </PopupContainer>
  )
}

export function UnlinkedDictPopup({ elementName, anchorRect, onClose, onLink, headerTitle = 'Link to Dictionary', subText }: UnlinkedProps) {
  const [query, setQuery] = useState('')
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const filtered = SEARCH_ENTRIES.filter(e =>
    !query || e.name.toLowerCase().includes(query.toLowerCase()) || e.description.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <PopupContainer anchorRect={anchorRect} width={400}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.5rem 1rem',
      }}>
        <Title level="H5" style={{ margin: 0 }}>{headerTitle}</Title>
        <Button design="Transparent" icon="decline" onClick={onClose}
          style={{ '--_ui5_button_base_min_width': '2rem', width: '2rem', height: '2rem' } as React.CSSProperties} />
      </div>

      <div style={{ padding: '0 1rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <Text style={{ color: 'var(--sapContent_LabelColor)' }}>
          {subText ?? 'This element is not linked. Select an item below or create a new one.'}
        </Text>
        <Input
          placeholder="Search dictionary entry"
          type={'Search' as any}
          value={query}
          onInput={(e: any) => setQuery(e.target?.value ?? '')}
          style={{ width: '100%' } as React.CSSProperties}
        >
          <Icon slot="icon" name="search" />
        </Input>
      </div>

      {/* Results */}
      <div style={{ maxHeight: '16rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.25rem 1rem 0.5rem' }}>
        {filtered.map(entry => (
          <div
            key={entry.id}
            onClick={() => { setSelectedId(entry.id); onLink(entry.id); onClose() }}
            onMouseEnter={() => setHoveredId(entry.id)}
            onMouseLeave={() => setHoveredId(null)}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: '0.625rem',
              padding: '0.75rem', borderRadius: '0.75rem', cursor: 'pointer', userSelect: 'none',
              background: selectedId === entry.id
                ? 'var(--sapTile_Active_Background, #e8f3ff)'
                : hoveredId === entry.id
                ? 'var(--sapTile_Hover_Background, #f5f6f7)'
                : 'var(--sapTile_Background, #fff)',
              boxShadow: selectedId === entry.id
                ? `0 0 0 2px var(--sapSelectedColor, #0064d9), 0 1px 4px rgba(34,53,72,0.12)`
                : hoveredId === entry.id
                ? '0 0 2px rgba(34,53,72,0.2), 0 4px 8px rgba(34,53,72,0.2)'
                : '0 0 2px rgba(34,53,72,0.15), 0 1px 4px rgba(34,53,72,0.12)',
              transition: 'background 0.1s, box-shadow 0.1s',
            }}
          >
            <Avatar icon="document" colorScheme="Accent5" shape="Square" size="S" style={{ flexShrink: 0, marginTop: '0.125rem' } as React.CSSProperties} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--sapList_TextColor)' }}>
                  {entry.name}
                </Text>
                <Button design="Transparent" icon="overflow"
                  style={{ '--_ui5_button_base_min_width': '1.75rem', width: '1.75rem', height: '1.75rem', flexShrink: 0 } as React.CSSProperties}
                  onClick={e => e.stopPropagation()} />
              </div>
              <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)', display: 'block' }}>
                {entry.category} / {entry.subCategory}
              </Text>
              <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)', display: 'block', marginTop: '0.5rem' }}>
                {entry.description}
              </Text>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '0.5rem 1rem 1rem' }}>
        {/* Create button */}
        <Button design="Emphasized" icon="add" style={{ width: '100%' } as React.CSSProperties}>
          Create Dictionary Item
        </Button>
      </div>
    </PopupContainer>
  )
}
