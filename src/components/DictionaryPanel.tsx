import React, { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Button,
  Card,
  Icon,
  Input,
  MessageStrip,
  Menu,
  MenuItem,
  Text,
} from '@ui5/webcomponents-react'
import { SigChipV2 } from '@signavio/sap-signavio-uixtension'
import s from './DictionaryPanel.module.css'

// ── Mock dictionary data ──────────────────────────────────────────────────────

type DictCategory =
  | 'Activities'
  | 'IT System'
  | 'Documents'
  | 'Organizational Units'
  | 'Gateway'
  | 'Events'

type DictItem = {
  id: string
  name: string
  category: DictCategory
  subCategory?: string
  elementType?: 'task' | 'artifact' | 'data' | 'event' | 'gateway'
  description: string
  lastUpdated: string
  usedInDiagram?: boolean
  isFavorite?: boolean
}

const DICT_ITEMS: DictItem[] = [
  { id: 'd27', name: 'Evaluate CV',          category: 'Activities',          elementType: 'task',     description: 'Review and evaluate submitted curriculum vitae against job requirements', lastUpdated: '10.03.2026', usedInDiagram: true },
  { id: 'd41', name: 'ATS System',           category: 'IT System',           elementType: 'artifact', subCategory: 'HR Technology', description: 'Applicant Tracking System for managing recruitment workflow', lastUpdated: '15.03.2026', usedInDiagram: true },
  { id: 'd33', name: 'Application received', category: 'Events',              elementType: 'event',    subCategory: 'Start Event', description: 'Start event triggered when a new application is submitted', lastUpdated: '11.03.2026', usedInDiagram: true },
  { id: 'd40', name: 'Plan interview',       category: 'Activities',          elementType: 'task',     description: 'Schedule and organize interview logistics and panel members', lastUpdated: '14.03.2026', usedInDiagram: true },
  { id: 'd61', name: 'Application Form',     category: 'Documents',           elementType: 'data',     subCategory: 'HR Information', description: 'Candidate application form with personal and professional details', lastUpdated: '11.03.2026' },
  { id: 'd28', name: 'Interview candidate',  category: 'Activities',          elementType: 'task',     description: 'Conduct structured interview with candidate', lastUpdated: '15.03.2026', usedInDiagram: true },
  { id: 'd70', name: 'Proceed with interview?', category: 'Gateway',          elementType: 'gateway',  description: 'Decision gateway for interview process', lastUpdated: '10.03.2026' },
  { id: 'd56', name: 'Workday',              category: 'IT System',           elementType: 'artifact', subCategory: 'HCM', description: 'Human capital management cloud platform', lastUpdated: '14.03.2026', isFavorite: true },
  { id: 'd30', name: 'Make offer',           category: 'Activities',          elementType: 'task',     description: 'Prepare and send job offer letter to selected candidate', lastUpdated: '12.03.2026', usedInDiagram: true },
  { id: 'd63', name: 'Interview Scorecard',  category: 'Documents',           elementType: 'data',     subCategory: 'HR Information', description: 'Structured evaluation form for candidate interviews', lastUpdated: '10.03.2026' },
  { id: 'd35', name: 'Candidate hired',      category: 'Events',              elementType: 'event',    subCategory: 'End Event', description: 'End event when candidate successfully completes hiring process', lastUpdated: '13.03.2026', usedInDiagram: true },
  { id: 'd42', name: 'Recruitment Specialist', category: 'Organizational Units', elementType: 'task',  subCategory: 'Human Resources', description: 'Handles end-to-end recruitment activities', lastUpdated: '15.03.2026' },
  { id: 'd31', name: 'Onboard candidate',    category: 'Activities',          elementType: 'task',     description: 'Complete onboarding process for newly hired employee', lastUpdated: '14.03.2026', usedInDiagram: true },
  { id: 'd71', name: 'Hire candidate?',      category: 'Gateway',             elementType: 'gateway',  description: 'Decision gateway for hiring decision', lastUpdated: '10.03.2026' },
  { id: 'd29', name: 'Send rejection',       category: 'Activities',          elementType: 'task',     description: 'Send rejection notification to unsuccessful candidates', lastUpdated: '08.03.2026', usedInDiagram: true },
]

// ── Category icon ─────────────────────────────────────────────────────────────

const CAT_ICON_NAME: Record<DictCategory, string> = {
  'Activities':           'SAP-icons-v4/task-activity',
  'IT System':            'SAP-icons-v4/computer',
  'Documents':            'document',
  'Organizational Units': 'SAP-icons-v4/pool-lane',
  'Gateway':              'SAP-icons-v4/exclusive-xor-gateway',
  'Events':               'SAP-icons-v4/start-event',
}

const TASK_ICONS = [
  'SAP-icons-v4/task-activity',
]

const CAT_ICON_COLOR: Record<DictCategory, string> = {
  'Activities':           'var(--sapIndicationColor_6)',
  'IT System':            'var(--sapHighlightColor)',
  'Documents':            'var(--sapPositiveColor)',
  'Organizational Units': 'var(--sapIndicationColor_8)',
  'Gateway':              'var(--sapNeutralColor)',
  'Events':               'var(--sapNeutralColor)',
}

// ── Single dictionary card ────────────────────────────────────────────────────

function DictCard({ item }: { item: DictItem }) {
  const sub = item.subCategory ? ` / ${item.subCategory}` : ''
  const iconName = item.category === 'Activities'
    ? TASK_ICONS[parseInt(item.id.replace(/\D/g, ''), 10) % TASK_ICONS.length]
    : CAT_ICON_NAME[item.category]
  return (
    <div className={s.card} draggable onDragStart={(e: React.DragEvent) => {
        e.dataTransfer.setData('text/plain', item.id)
        e.dataTransfer.setData('application/dict-item', JSON.stringify({ id: item.id, name: item.name, type: item.category, subCategory: item.subCategory, elementType: item.elementType }))
        ;(window as any).__dictDragElementType = item.elementType ?? null
      }}>
      <div className={s.cardIcon} style={{ color: CAT_ICON_COLOR[item.category] }}>
        <Icon name={iconName} style={{ width: '1.25rem', height: '1.25rem' } as React.CSSProperties} />
      </div>
      <div className={s.cardContent}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Text style={{ fontWeight: '700', fontSize: 'var(--sapFontHeader5Size)', color: 'var(--sapList_TextColor)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.name}
            </Text>
            <Button icon="SAP-icons-v4/link" design="Transparent" tooltip="Open in Dictionary"
              style={{ '--_ui5_button_base_min_width': '1.625rem', width: '1.625rem', height: '1.625rem', color: 'var(--sapHighlightColor)', '--_ui5_button_icon_color': 'var(--sapHighlightColor)' } as React.CSSProperties}
              onClick={(e: React.MouseEvent) => e.stopPropagation()} />
            {item.isFavorite && <Icon name="favorite" style={{ width: '1rem', height: '1rem', color: 'var(--sapHighlightColor)', flexShrink: 0 }} />}
          </div>
          <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>
            {item.category}{sub}
          </Text>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem', marginBottom: '0' }}>
          {item.description && (
            <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)' }}>
              {item.description.length > 90 ? item.description.slice(0, 90) + '…' : item.description}
            </Text>
          )}
          <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>
            Changed {item.lastUpdated}
          </Text>
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

type Props = {
  onClose: () => void
}

export default function DictionaryPanel({ onClose }: Props) {
  const [query, setQuery] = useState('')
  const [usedInOnly, setUsedInOnly] = useState(false)
  const [infoVisible, setInfoVisible] = useState(true)
  const categoryMenuRef = useRef<any>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filtered = DICT_ITEMS.filter(item => {
    if (usedInOnly && !item.usedInDiagram) return false
    if (selectedCategory && item.category !== selectedCategory) return false
    if (!query) return true
    const q = query.toLowerCase()
    return (
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      (item.subCategory?.toLowerCase().includes(q) ?? false)
    )
  })

  const hasFilters = usedInOnly || !!selectedCategory

  return (
    <div className={s.panel}>
      {/* Header */}
      <div className={s.header}>
        <div className={s.headerLeft}>
          <Text style={{ fontWeight: '700', fontSize: 'var(--sapFontHeader5Size)', color: 'var(--sapTextColor)' }}>
            Dictionary
          </Text>
          <button className={s.outlink} title="Open Dictionary">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.00001 3.20001C3.55818 3.20001 3.20001 3.55818 3.20001 4.00001V12C3.20001 12.4418 3.55818 12.8 4.00001 12.8H12C12.4418 12.8 12.8 12.4418 12.8 12V9.60001C12.8 9.15818 13.1582 8.80001 13.6 8.80001C14.0418 8.80001 14.4 9.15818 14.4 9.60001V12C14.4 13.3255 13.3255 14.4 12 14.4H4.00001C2.67452 14.4 1.60001 13.3255 1.60001 12V4.00001C1.60001 2.67452 2.67452 1.60001 4.00001 1.60001H6.40001C6.84183 1.60001 7.20001 1.95818 7.20001 2.40001C7.20001 2.84183 6.84183 3.20001 6.40001 3.20001H4.00001ZM10.4 3.20001C9.95818 3.20001 9.60001 2.84183 9.60001 2.40001C9.60001 1.95818 9.95818 1.60001 10.4 1.60001H13.6C14.0418 1.60001 14.4 1.95818 14.4 2.40001V5.60001C14.4 6.04183 14.0418 6.40001 13.6 6.40001C13.1582 6.40001 12.8 6.04183 12.8 5.60001V4.33138L8.56569 8.56569C8.25327 8.87811 7.74674 8.87811 7.43432 8.56569C7.1219 8.25327 7.1219 7.74674 7.43432 7.43432L11.6686 3.20001H10.4Z" fill="#131E29"/>
            </svg>
          </button>
        </div>
        <Button icon="decline" design="Transparent" tooltip="Close" className={s.closeBtn}
          style={{ '--_ui5_button_base_min_width': '1.625rem', width: '1.625rem', height: '1.625rem' } as React.CSSProperties}
          onClick={onClose} />
      </div>

      {/* Body */}
      <div className={s.body}>
        {/* Info strip */}
        {infoVisible && (
          <MessageStrip className={s.messageStrip} design="Information" hideCloseButton={false} onClose={() => setInfoVisible(false)}>
            Drag items onto the canvas to add them directly, or drop them onto an existing element to link it to the dictionary item.
          </MessageStrip>
        )}

        {/* Search */}
        <Input
          placeholder="Search dictionary name, description, etc..."
          type={'Search' as any}
          value={query}
          showClearIcon
          icon={<Icon slot="icon" name="search" />}
          onInput={(e: any) => setQuery(e.target?.value ?? '')}
          style={{ width: '100%', '--_ui5_input_height': '1.875rem' } as React.CSSProperties}
        />

        {/* Filter chips */}
        <div className={s.chips}>
          <Button design="Default">Manage Filters</Button>
          <SigChipV2
            value="Used in Diagram"
            selected={usedInOnly}
            onClick={() => setUsedInOnly(v => !v)}
          />
          <SigChipV2
            value={selectedCategory ?? 'Category'}
            trailingIcon="slim-arrow-down"
            selected={!!selectedCategory}
            onClick={() => {
              if (categoryMenuRef.current) {
                categoryMenuRef.current.opener = 'dict-category-btn'
                categoryMenuRef.current.open = true
              }
            }}
            id="dict-category-btn"
          />
          {hasFilters && (
            <Button design="Transparent"
              onClick={() => { setUsedInOnly(false); setSelectedCategory(null); setQuery('') }}>
              Clear Filters
            </Button>
          )}
        </div>

        {/* Result bar */}
        <div className={s.resultBar}>
          <Text style={{ fontWeight: '700', fontSize: 'var(--sapFontHeader6Size)', color: 'var(--sapTextColor)' }}>
            {hasFilters || query ? 'Result' : 'All'} ({filtered.length})
          </Text>
          <Button icon="sort" design="Transparent"
            style={{ '--_ui5_button_base_min_width': '1.625rem', width: '1.625rem', height: '1.625rem' } as React.CSSProperties} />
        </div>

        {/* Item list */}
        <div className={s.list}>
          {filtered.length === 0 ? (
            <div className={s.empty}>
              <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSize)' }}>
                No results found
              </Text>
            </div>
          ) : (
            filtered.map(item => <DictCard key={item.id} item={item} />)
          )}
        </div>
      </div>

      {/* Category dropdown */}
      {createPortal(
        <Menu ref={categoryMenuRef} onItemClick={(e: any) => {
          const txt = e.detail?.text
          setSelectedCategory(txt === 'All' ? null : txt)
        }}>
          <MenuItem text="All" />
          <MenuItem text="Activities" />
          <MenuItem text="IT System" />
          <MenuItem text="Documents" />
          <MenuItem text="Organizational Units" />
          <MenuItem text="Gateway" />
          <MenuItem text="Events" />
        </Menu>,
        document.body
      )}
    </div>
  )
}
