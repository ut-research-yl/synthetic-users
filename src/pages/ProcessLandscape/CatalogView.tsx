import React, { useState, useMemo } from 'react'
import {
  Table, TableHeaderRow, TableHeaderCell, TableRow, TableCell,
  Button, Icon, Text, Avatar, Input,
} from '@ui5/webcomponents-react'
import { SigTableWrapper } from '@signavio/sap-signavio-uixtension'
import { PROCESS_ELEMENTS } from './data'
import { LEVEL_NAMES } from './types'
import type { ProcessElement } from './types'
import { USERS } from '../../data/users'

interface CatalogViewProps {
  selectedElementId: string | null
  onSelectElement: (id: string | null) => void
}

const STATUS_STATE: Record<string, string> = {
  Active: 'var(--sapPositiveColor)',
  'In Review': 'var(--sapCriticalColor)',
  Draft: 'var(--sapNeutralColor)',
  Deprecated: 'var(--sapNegativeColor)',
}

const PROCESS_TYPE_COLOR: Record<string, string> = {
  Operating: 'var(--sapIndicationColor_3)',
  Management: 'var(--sapIndicationColor_5)',
  Support: 'var(--sapIndicationColor_2)',
}

function LevelBadge({ level }: { level: number }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '0.0625rem 0.375rem',
      borderRadius: '0.625rem',
      fontSize: 'var(--sapFontSmallSize)',
      background: 'var(--sapNeutralBackground)',
      color: 'var(--sapTextColor)',
      whiteSpace: 'nowrap',
    }}>
      L{level} · {LEVEL_NAMES[level]}
    </span>
  )
}

function StatusDot({ status }: { status: ProcessElement['status'] }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
      <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: STATUS_STATE[status], flexShrink: 0 }} />
      <Text style={{ fontSize: 'var(--sapFontSmallSize)' }}>{status}</Text>
    </div>
  )
}

export default function CatalogView({ selectedElementId, onSelectElement }: CatalogViewProps) {
  const [search, setSearch] = useState('')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(PROCESS_ELEMENTS.filter(e => e.level === 1).map(e => e.id))
  )

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const visibleRows = useMemo(() => {
    const q = search.toLowerCase().trim()

    if (q) {
      return PROCESS_ELEMENTS.filter(e =>
        e.name.toLowerCase().includes(q) ||
        e.hierarchyId.includes(q) ||
        e.description.toLowerCase().includes(q)
      )
    }

    const result: ProcessElement[] = []
    function addVisible(parentId: string | null) {
      const children = PROCESS_ELEMENTS.filter(e => e.parentId === parentId)
      for (const child of children) {
        result.push(child)
        if (expandedIds.has(child.id)) {
          addVisible(child.id)
        }
      }
    }
    addVisible(null)
    return result
  }, [expandedIds, search])

  const hasChildren = (id: string) => PROCESS_ELEMENTS.some(e => e.parentId === id)

  return (
    <SigTableWrapper
      titleSlot={
        <Input
          placeholder="Search processes..."
          icon={<Icon name="search" />}
          showClearIcon
          value={search}
          onInput={(e) => setSearch((e.target as unknown as { value?: string }).value ?? '')}
          style={{ width: '16rem' }}
        />
      }
    >
      <Table
        headerRow={
          <TableHeaderRow>
            <TableHeaderCell minWidth="60" width="60"></TableHeaderCell>
            <TableHeaderCell minWidth="80">ID</TableHeaderCell>
            <TableHeaderCell minWidth="250">Name</TableHeaderCell>
            <TableHeaderCell minWidth="130">Level</TableHeaderCell>
            <TableHeaderCell minWidth="110">Process Type</TableHeaderCell>
            <TableHeaderCell minWidth="120">Owner</TableHeaderCell>
            <TableHeaderCell minWidth="100">Status</TableHeaderCell>
            <TableHeaderCell minWidth="80" width="80">Assets</TableHeaderCell>
          </TableHeaderRow>
        }
      >
        {visibleRows.map(element => {
          const indentLevel = element.level - 1
          const hasChild = hasChildren(element.id)
          const isExpanded = expandedIds.has(element.id)
          const owner = USERS.find(u => u.id === element.ownerId)
          const isSelected = element.id === selectedElementId

          return (
            <TableRow
              key={element.id}
              onClick={() => onSelectElement(isSelected ? null : element.id)}
              style={{
                cursor: 'pointer',
                background: isSelected ? 'var(--sapList_SelectionBackgroundColor)' : undefined,
              }}
            >
              <TableCell>
                <div style={{ paddingLeft: `${indentLevel * 1.25}rem`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {hasChild ? (
                    <Button
                      design="Transparent"
                      icon={isExpanded ? 'slim-arrow-down' : 'slim-arrow-right'}
                      onClick={(e) => toggleExpand(element.id, e as unknown as React.MouseEvent)}
                      style={{ width: '2rem', height: '2rem', minWidth: 'unset', padding: 0 }}
                    />
                  ) : null}
                </div>
              </TableCell>
              <TableCell>
                <Text style={{ fontFamily: 'var(--sapFontMonospaceFamily)', fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>
                  {element.hierarchyId}
                </Text>
              </TableCell>
              <TableCell>
                <div style={{ paddingLeft: `${indentLevel * 1.25}rem` }}>
                  <Text style={{ fontWeight: element.level === 1 ? '600' : undefined }}>
                    {element.name}
                  </Text>
                </div>
              </TableCell>
              <TableCell>
                <LevelBadge level={element.level} />
              </TableCell>
              <TableCell>
                <span style={{
                  display: 'inline-flex', alignItems: 'center',
                  padding: '0.0625rem 0.375rem',
                  borderRadius: '0.625rem',
                  fontSize: 'var(--sapFontSmallSize)',
                  background: PROCESS_TYPE_COLOR[element.processType] ?? 'var(--sapNeutralBackground)',
                  color: 'var(--sapTextColor)',
                }}>
                  {element.processType}
                </span>
              </TableCell>
              <TableCell>
                {owner ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Avatar
                      initials={owner.initials}
                      colorScheme={owner.colorScheme as 'Accent1'}
                      size="XS"
                    />
                    <Text style={{ fontSize: 'var(--sapFontSmallSize)' }}>{owner.name}</Text>
                  </div>
                ) : <Text>—</Text>}
              </TableCell>
              <TableCell>
                <StatusDot status={element.status} />
              </TableCell>
              <TableCell>
                <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>
                  {element.assetCount}
                </Text>
              </TableCell>
            </TableRow>
          )
        })}
      </Table>
    </SigTableWrapper>
  )
}
