import React, { useRef, useState } from 'react'
import { Avatar, Button, Menu, MenuItem, Title } from '@ui5/webcomponents-react'
import { dictionaryItems } from '../data/liveInsightsData'

type Props = {
  query: string
  x: number
  y: number
  elementType?: string
  onSelect: (dictId: string) => void
  onViewDetails: (dictId: string) => void
  onCreateNew: () => void
  onExploreMore: (query: string) => void
  onClose: () => void
  onSuppressBlur?: () => void
  onMenuOpenChange?: (open: boolean) => void
}

const ELEMENT_TYPE_TO_CATEGORY: Record<string, string> = {
  'task':     'Activities',
  'system':   'IT System',
  'data':     'Documents',
  'artifact': 'Documents',
  'event':    'Events',
  'gateway':  'Gateway',
}

const CAT_COLOR: Record<string, string> = {
  'Activities':           'Accent6',
  'IT System':            'Accent10',
  'Documents':            'Accent4',
  'Organizational Units': 'Accent1',
  'Gateway':              'Accent3',
  'Events':               'Accent3',
}

const CAT_ICON: Record<string, string> = {
  'Activities':           'SAP-icons-v4/task-activity',
  'IT System':            'SAP-icons-v4/computer',
  'Documents':            'document',
  'Organizational Units': 'SAP-icons-v4/pool-lane',
  'Gateway':              'SAP-icons-v4/exclusive-xor-gateway',
  'Events':               'SAP-icons-v4/start-event',
}

function truncate(s: string, max: number) {
  return s.length > max ? s.slice(0, max) + '...' : s
}

export default function DictionarySuggestionPopup({ query, x, y, elementType, onSelect, onViewDetails, onCreateNew, onExploreMore, onClose, onSuppressBlur, onMenuOpenChange }: Props) {
  const q = query.toLowerCase().trim()
  const category = elementType ? ELEMENT_TYPE_TO_CATEGORY[elementType] : undefined
  const suggestions = q.length < 3 ? [] : dictionaryItems
    .filter(d => (!category || d.type === category) && (d.name.toLowerCase().includes(q) || d.description.toLowerCase().includes(q)))
    .slice(0, 10)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const menuRef = useRef<any>(null)

  if (q.length < 3) return null

  return (
    <>
      {/* backdrop */}
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 99 }}
        onMouseDown={e => {
          if (menuOpenId) return
          e.stopPropagation()
          onClose()
        }}
      />
      <div
        onMouseDown={e => { e.preventDefault(); e.stopPropagation(); onSuppressBlur?.() }}
        style={{
          position: 'absolute',
          left: x,
          top: y + 4,
          width: 340,
          background: 'var(--sapBaseColor, #fff)',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          zIndex: 100,
          overflow: 'hidden',
          border: '1px solid var(--sapPageHeader_BorderColor, #d9d9d9)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '0.5rem 0.75rem',
          background: 'var(--sapList_SelectionBackgroundColor, #e8f1ff)',
          borderBottom: '1px solid var(--sapPageHeader_BorderColor, #d9d9d9)',
        }}>
          <Title level="H6" style={{ color: 'var(--sapHighlightColor)', fontSize: 'var(--sapFontSize)' }}>
            Dictionary Suggestions
          </Title>
        </div>

        {/* Cards */}
        <div style={{ padding: '0.375rem', display: 'flex', flexDirection: 'column', gap: '0.375rem', height: '15.75rem', overflowY: 'auto' }}>
          {suggestions.length === 0 ? (
            <div style={{ padding: '0.375rem', fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)' }}>
              No matches found
            </div>
          ) : (
            <>
              {suggestions.map(item => (
              <div
                key={item.id}
                onClick={() => onSelect(item.id)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                  padding: '0.5rem 2rem 0.5rem 0.5rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--sapPageHeader_BorderColor, #d9d9d9)',
                  cursor: 'pointer',
                  background: 'var(--sapBaseColor, #fff)',
                  boxSizing: 'border-box',
                  position: 'relative',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--sapList_Hover_Background, #f5f6f7)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--sapBaseColor, #fff)')}
              >
                <Avatar
                  icon="course-book"
                  colorScheme="Accent9"
                  shape="Square"
                  size="XS"
                  style={{ '--_ui5_avatar_border_radius': '0.375rem', width: '1.75rem', height: '1.75rem', flexShrink: 0 } as React.CSSProperties}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 'var(--sapFontSize)', fontWeight: 700, color: 'var(--sapTextColor)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: 'var(--sapFontSmallSize, 0.75rem)', color: 'var(--sapContent_LabelColor)', marginBottom: '0.125rem' }}>
                    {item.type}{item.subCategory ? ` / ${item.subCategory}` : ''}
                  </div>
                  <div style={{ fontSize: 'var(--sapFontSmallSize, 0.75rem)', color: 'var(--sapTextColor)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.description}
                  </div>
                </div>

                {/* overflow button — absolute top-right */}
                <div style={{ position: 'absolute', top: '0.125rem', right: '0.5rem' }}>
                  <Button
                    id={`dict-suggestion-overflow-${item.id}`}
                    design="Transparent"
                    icon="overflow"
                    style={{ width: '1.5rem', height: '1.5rem', minWidth: '1.5rem' } as React.CSSProperties}
                    onClick={e => {
                      e.stopPropagation()
                      setMenuOpenId(item.id)
                      onMenuOpenChange?.(true)
                      if (menuRef.current) {
                        menuRef.current.opener = `dict-suggestion-overflow-${item.id}`
                        menuRef.current.open = true
                      }
                    }}
                  />
                </div>
              </div>
            ))
              }
              {/* Explore More — inside scroll area */}
              <div style={{ display: 'flex', justifyContent: 'center', padding: '0.25rem 0' }}>
                <Button
                  design="Transparent"
                  icon="search"
                  style={{ color: 'var(--sapHighlightColor)', fontSize: 'var(--sapFontSize)' } as React.CSSProperties}
                  onClick={() => onExploreMore(query)}
                >
                  Explore More
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '0.375rem 0.375rem 0.375rem' }}>
          <Button
            design="Emphasized"
            style={{ width: '100%' } as React.CSSProperties}
            onClick={onCreateNew}
          >
            Create Dictionary Item
          </Button>
        </div>
      </div>

      {/* Single shared Menu instance */}
      <Menu
        ref={menuRef}
        onClose={() => { setMenuOpenId(null); onMenuOpenChange?.(false) }}
        onItemClick={(e: any) => {
          const text = e.detail?.item?.text ?? e.detail?.text ?? ''
          if (text === 'View Details' && menuOpenId) {
            onViewDetails(menuOpenId)
          }
          setMenuOpenId(null)
          onMenuOpenChange?.(false)
        }}
      >
        <MenuItem text="View Details" />
        <MenuItem text="Open Dictionary" />
      </Menu>
    </>
  )
}
