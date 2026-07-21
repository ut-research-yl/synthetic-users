import React, { useState, useRef } from 'react'
import {
  Text, Label, Icon, Button, CheckBox, Select, Option, RadioButton,
  Menu, MenuItem, MenuSeparator,
  Table, TableHeaderRow, TableHeaderCell, TableRow, TableCell,
  FlexBox, ToolbarItem, Input, ToggleButton, MessageBox, Toast,
} from '@ui5/webcomponents-react'
import type { TableMoveEventDetail } from '@ui5/webcomponents/dist/Table.js'
import type { Ui5CustomEvent } from '@ui5/webcomponents-react-base'
import { SigTableWrapper, SigFilterBar, SigFilter, MultiSelect, SingleSelect } from '@signavio/sap-signavio-uixtension'
import { AttributeGroupDialog } from './AttributeGroupDialog'
import { SortPopover } from './SortPopover'
import { CreateAttributeDialog, type AttributeType } from './CreateAttributeDialog'

export const AUDIENCES = ['Everyone', 'Modeler', 'Viewer', 'Process Owner']
export type AttrVis = 'Visible' | 'Visible if set' | 'Invisible'
export type AttrClass = 'Standard' | 'Custom'

export type AttrRow = {
  id: string; name: string; type: string; description: string; attrClass: AttrClass
  required: boolean; enabled: boolean
  visibility: Record<string, AttrVis>
  lastEditedBy?: string; lastEditedAt?: string
}

export type AttrGroup = {
  id: string; name: string
  enabled: Record<string, boolean>
  expanded: boolean
  attrs: AttrRow[]
}

export function makeInitialGroups(): AttrGroup[] {
  const vis = Object.fromEntries(AUDIENCES.map(a => [a, 'Visible' as AttrVis]))
  const grpEnabled = Object.fromEntries(AUDIENCES.map(a => [a, true]))
  return [
    {
      id: 'main', name: 'Main Attributes', enabled: { ...grpEnabled }, expanded: true,
      attrs: [
        { id: 'name',   name: 'Name',        type: 'Single-Line Text', description: 'The display name of the asset.',       attrClass: 'Standard', required: true,  enabled: true, visibility: { ...vis }, lastEditedBy: 'Maria Chen', lastEditedAt: 'May 28, 2025, 10:14' },
        { id: 'desc',   name: 'Description', type: 'Multi-Line Text',  description: 'A free-text description of the asset.', attrClass: 'Standard', required: false, enabled: true, visibility: { ...vis }, lastEditedBy: 'Maria Chen', lastEditedAt: 'May 28, 2025, 10:14' },
      ],
    },
    {
      id: 'custom1', name: 'New Attribute Group', enabled: { ...grpEnabled }, expanded: true,
      attrs: [
        { id: 'status', name: 'Status',     type: 'Selection',        description: 'Current lifecycle status of the asset.',     attrClass: 'Custom', required: false, enabled: true,  visibility: { ...vis },                      lastEditedBy: 'Tom Becker',    lastEditedAt: 'Jun 1, 2025, 09:02'  },
        { id: 'owner',  name: 'Owner',      type: 'Single-Line Text', description: 'Responsible person or team for this asset.', attrClass: 'Custom', required: false, enabled: true,  visibility: { ...vis },                      lastEditedBy: 'Tom Becker',    lastEditedAt: 'Jun 1, 2025, 09:02'  },
        { id: 'start',  name: 'Start Date', type: 'Date',             description: 'Planned start date for the initiative.',     attrClass: 'Custom', required: false, enabled: true,  visibility: { ...vis },                      lastEditedBy: 'Sophie Müller', lastEditedAt: 'Apr 10, 2025, 14:30' },
        { id: 'due',    name: 'Due Date',   type: 'Date',             description: 'Deadline for completion.',                   attrClass: 'Custom', required: false, enabled: false, visibility: { ...vis, Viewer: 'Invisible' }, lastEditedBy: 'Sophie Müller', lastEditedAt: 'Apr 10, 2025, 14:31' },
      ],
    },
  ]
}

export function makeModelingGroups(): AttrGroup[] {
  const vis = Object.fromEntries(AUDIENCES.map(a => [a, 'Visible' as AttrVis]))
  const grpEnabled = Object.fromEntries(AUDIENCES.map(a => [a, true]))
  return [
    {
      id: 'main', name: 'Main Attributes', enabled: { ...grpEnabled }, expanded: true,
      attrs: [
        { id: 'name',   name: 'Name',        type: 'Single-Line Text', description: 'The display name of the asset.',       attrClass: 'Standard', required: true,  enabled: true, visibility: { ...vis }, lastEditedBy: 'Maria Chen', lastEditedAt: 'May 28, 2025, 10:14' },
        { id: 'desc',   name: 'Description', type: 'Multi-Line Text',  description: 'A free-text description of the asset.', attrClass: 'Standard', required: false, enabled: true, visibility: { ...vis }, lastEditedBy: 'Maria Chen', lastEditedAt: 'May 28, 2025, 10:14' },
        { id: 'status', name: 'Status',      type: 'Selection',        description: 'Current lifecycle status of the asset.', attrClass: 'Custom',  required: false, enabled: true, visibility: { ...vis }, lastEditedBy: 'Tom Becker', lastEditedAt: 'Jun 1, 2025, 09:02' },
        { id: 'owner',  name: 'Owner',       type: 'Single-Line Text', description: 'Responsible person or team.',            attrClass: 'Custom',  required: false, enabled: true, visibility: { ...vis }, lastEditedBy: 'Tom Becker', lastEditedAt: 'Jun 1, 2025, 09:02' },
      ],
    },
    {
      id: 'custom1', name: 'New Attribute Group', enabled: { ...grpEnabled }, expanded: true,
      attrs: [
        { id: 'start', name: 'Start Date', type: 'Date', description: 'Planned start date for the initiative.', attrClass: 'Custom', required: false, enabled: true,  visibility: { ...vis },                      lastEditedBy: 'Sophie Müller', lastEditedAt: 'Apr 10, 2025, 14:30' },
        { id: 'due',   name: 'Due Date',   type: 'Date', description: 'Deadline for completion.',               attrClass: 'Custom', required: false, enabled: false, visibility: { ...vis, Viewer: 'Invisible' }, lastEditedBy: 'Sophie Müller', lastEditedAt: 'Apr 10, 2025, 14:31' },
      ],
    },
  ]
}

export function makeDictCategoryGroups(): AttrGroup[] {
  const vis = Object.fromEntries(AUDIENCES.map(a => [a, 'Visible' as AttrVis]))
  const grpEnabled = Object.fromEntries(AUDIENCES.map(a => [a, true]))
  return [
    {
      id: 'main', name: 'Main Attributes', enabled: { ...grpEnabled }, expanded: true,
      attrs: [
        { id: 'name',     name: 'Name',              type: 'Single-Line Text', description: 'The display name of the category.',    attrClass: 'Standard', required: true,  enabled: true, visibility: { ...vis }, lastEditedBy: 'Maria Chen', lastEditedAt: 'May 28, 2025, 10:14' },
        { id: 'desc',     name: 'Description',       type: 'Multi-Line Text',  description: 'A free-text description.',              attrClass: 'Standard', required: false, enabled: true, visibility: { ...vis }, lastEditedBy: 'Maria Chen', lastEditedAt: 'May 28, 2025, 10:14' },
        { id: 'rel-doc',  name: 'Relevant Document', type: 'Document/URL',     description: 'Reference document for this category.', attrClass: 'Standard', required: false, enabled: true, visibility: { ...vis }, lastEditedBy: 'Maria Chen', lastEditedAt: 'May 28, 2025, 10:14' },
      ],
    },
    {
      id: 'custom1', name: 'Custom Attributes', enabled: { ...grpEnabled }, expanded: true,
      attrs: [
        { id: 'status',     name: 'Status',          type: 'Selection',        description: 'Current lifecycle status.',              attrClass: 'Custom', required: false, enabled: true,  visibility: { ...vis }, lastEditedBy: 'Tom Becker',    lastEditedAt: 'Jun 1, 2025, 09:02' },
        { id: 'owner',      name: 'Owner',           type: 'Single-Line Text', description: 'Responsible person or team.',            attrClass: 'Custom', required: false, enabled: true,  visibility: { ...vis }, lastEditedBy: 'Tom Becker',    lastEditedAt: 'Jun 1, 2025, 09:02' },
        { id: 'approved',   name: 'Approved',        type: 'Checkbox',         description: 'Whether this category is approved.',     attrClass: 'Custom', required: false, enabled: true,  visibility: { ...vis }, lastEditedBy: 'Tom Becker',    lastEditedAt: 'Jun 1, 2025, 09:02' },
        { id: 'valid-from', name: 'Valid From',      type: 'Date',             description: 'Date from which this category is valid.',attrClass: 'Custom', required: false, enabled: true,  visibility: { ...vis }, lastEditedBy: 'Sophie Müller', lastEditedAt: 'Apr 10, 2025, 14:30' },
        { id: 'priority',   name: 'Priority',        type: 'Selection',        description: 'Priority level of this category.',       attrClass: 'Custom', required: false, enabled: false, visibility: { ...vis }, lastEditedBy: 'Sophie Müller', lastEditedAt: 'Apr 10, 2025, 14:31' },
        { id: 'tags',       name: 'Tags',            type: 'Multi-Line Text',  description: 'Tags for classification.',               attrClass: 'Custom', required: false, enabled: true,  visibility: { ...vis }, lastEditedBy: 'Sophie Müller', lastEditedAt: 'Apr 10, 2025, 14:30' },
      ],
    },
  ]
}

type Props = {
  attrGroups: AttrGroup[]
  setAttrGroups: React.Dispatch<React.SetStateAction<AttrGroup[]>>
  markDirty: () => void
  hideAudience?: boolean
  hideRequiredColumn?: boolean
  hideCreateGroup?: boolean
  dictCategoryMode?: boolean
  title?: string
  hideAssignSection?: boolean
  defaultAssignedTo?: string[]
  assignableAssetTypes?: { id: string; name: string }[]
  dictMode?: boolean
  dictCategories?: { id: string; name: string; parentId?: string }[]
  modelingMode?: boolean
}

export default function AttributeEditorPanel({ attrGroups, setAttrGroups, markDirty, hideAudience = false, hideRequiredColumn = false, hideCreateGroup = false, dictCategoryMode = false, title: panelTitle, hideAssignSection, defaultAssignedTo, assignableAssetTypes, dictMode, dictCategories, modelingMode }: Props) {
  const [visAudience, setVisAudience] = useState(AUDIENCES[0])
  const [groupSearch, setGroupSearch] = useState<Record<string, string>>({})
  const [groupSortBy, setGroupSortBy] = useState<Record<string, string>>({})
  const [groupSortDir, setGroupSortDir] = useState<Record<string, 'asc' | 'desc'>>({})
  const [groupFilters, setGroupFilters] = useState<Record<string, Record<string, unknown>>>({})
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [groupDialogOpen, setGroupDialogOpen] = useState(false)
  const [createAttrDialogGroupId, setCreateAttrDialogGroupId] = useState<string | null>(null)
  const [deleteAttrPending, setDeleteAttrPending] = useState<{ groupId: string; attrId: string; attrName: string } | null>(null)
  const [editAttrPending, setEditAttrPending] = useState<{ groupId: string; attrId: string } | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const showToast = (msg: string) => setToast(msg)
  const [editAttrDialogOpen, setEditAttrDialogOpen] = useState(false)
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null)
  const groupDragRef = useRef<number | null>(null)
  const [groupDragOverIdx, setGroupDragOverIdx] = useState<number | null>(null)
  const hideRequiredEnabled = !!(modelingMode || dictMode || hideRequiredColumn)

  const toggleGroup = (groupId: string) =>
    setAttrGroups(prev => prev.map(g => g.id === groupId ? { ...g, expanded: !g.expanded } : g))

  const openAddGroupDialog = () => {
    setEditingGroupId(null)
    setGroupDialogOpen(true)
  }

  const openEditGroupDialog = (groupId: string) => {
    setEditingGroupId(groupId)
    setGroupDialogOpen(true)
  }

  const handleGroupDialogConfirm = (name: string) => {
    if (editingGroupId) {
      setAttrGroups(prev => prev.map(g => g.id === editingGroupId ? { ...g, name } : g))
      showToast('Attribute group updated')
    } else {
      const newId = `group-${Date.now()}`
      const grpEnabled = Object.fromEntries(AUDIENCES.map(a => [a, true]))
      setAttrGroups(prev => [...prev, { id: newId, name, enabled: grpEnabled, expanded: true, attrs: [] }])
      showToast('Attribute group added')
    }
    setGroupDialogOpen(false)
  }

  const toggleGroupEnabled = (groupId: string) => {
    setAttrGroups(prev => prev.map(g =>
      g.id === groupId ? { ...g, enabled: { ...g.enabled, [visAudience]: !g.enabled[visAudience] } } : g
    ))
    markDirty()
  }

  const deleteGroup = (groupId: string) => {
    setAttrGroups(prev => prev.filter(g => g.id !== groupId))
    showToast('Attribute group deleted')
  }

  const moveGroup = (groupId: string, dir: -1 | 1) => {
    setAttrGroups(prev => {
      const idx = prev.findIndex(g => g.id === groupId)
      if (idx === -1) return prev
      const target = idx + dir
      if (target < 0 || target >= prev.length) return prev
      const groups = [...prev];
      [groups[idx], groups[target]] = [groups[target], groups[idx]]
      return groups
    })
    markDirty()
  }

  const updateAttr = (groupId: string, attrId: string, patch: Partial<AttrRow>) => {
    setAttrGroups(prev => prev.map(g =>
      g.id === groupId ? { ...g, attrs: g.attrs.map(a => a.id === attrId ? { ...a, ...patch } : a) } : g
    ))
    markDirty()
  }

  const removeAttr = (groupId: string, attrId: string) => {
    setAttrGroups(prev => prev.map(g =>
      g.id === groupId ? { ...g, attrs: g.attrs.filter(a => a.id !== attrId) } : g
    ))
  }

  const moveAttr = (groupId: string, attrIdx: number, dir: -1 | 1) => {
    setAttrGroups(prev => prev.map(g => {
      if (g.id !== groupId) return g
      const attrs = [...g.attrs]
      const target = attrIdx + dir
      if (target < 0 || target >= attrs.length) return g;
      [attrs[attrIdx], attrs[target]] = [attrs[target], attrs[attrIdx]]
      return { ...g, attrs }
    }))
    setGroupSortBy(prev => ({ ...prev, [groupId]: 'Custom Order' }))
    markDirty()
  }

  const moveAttrToGroup = (fromGroupId: string, attrId: string, toGroupId: string) => {
    setAttrGroups(prev => {
      const fromGroup = prev.find(g => g.id === fromGroupId)
      const attr = fromGroup?.attrs.find(a => a.id === attrId)
      if (!attr) return prev
      return prev.map(g => {
        if (g.id === fromGroupId) return { ...g, attrs: g.attrs.filter(a => a.id !== attrId) }
        if (g.id === toGroupId) return { ...g, attrs: [...g.attrs, attr] }
        return g
      })
    })
    markDirty()
  }

  const sortGroup = (groupId: string, sortKey: string, dir: 'asc' | 'desc' = 'asc') => {
    setAttrGroups(prev => prev.map(g => {
      if (g.id !== groupId) return g
      const attrs = [...g.attrs]
      const mult = dir === 'asc' ? 1 : -1
      if (sortKey === 'Name') attrs.sort((a, b) => mult * a.name.localeCompare(b.name))
      else if (sortKey === 'Date Changed') attrs.sort((a, b) => mult * ((a.lastEditedAt ?? '').localeCompare(b.lastEditedAt ?? '')))
      return { ...g, attrs }
    }))
    markDirty()
  }

  const handleAttrMove = (groupId: string, e: Ui5CustomEvent<HTMLElement, TableMoveEventDetail>) => {
    const srcRow = e.detail.source.element as HTMLElement
    const destRow = e.detail.destination.element as HTMLElement
    const placement = e.detail.destination.placement

    setAttrGroups(prev => {
      const group = prev.find(g => g.id === groupId)
      if (!group) return prev

      const srcIdx = group.attrs.findIndex(a => a.id === srcRow.dataset.attrId)
      const destIdx = group.attrs.findIndex(a => a.id === destRow.dataset.attrId)
      if (srcIdx === -1 || destIdx === -1 || srcIdx === destIdx) return prev

      const attrs = [...group.attrs]
      const [moved] = attrs.splice(srcIdx, 1)
      const insertAt = placement === 'Before' ? destIdx : destIdx + 1
      attrs.splice(srcIdx < destIdx ? insertAt - 1 : insertAt, 0, moved)
      return prev.map(g => g.id === groupId ? { ...g, attrs } : g)
    })
    setGroupSortBy(prev => ({ ...prev, [groupId]: 'Custom Order' }))
    markDirty()
  }

  const handleAttrMoveOver = (e: Ui5CustomEvent<HTMLElement, TableMoveEventDetail>) => {
    e.preventDefault()
  }

  const handleGroupDrop = (targetIdx: number) => {
    const srcIdx = groupDragRef.current
    if (srcIdx === null || srcIdx === targetIdx) {
      groupDragRef.current = null
      setGroupDragOverIdx(null)
      return
    }
    setAttrGroups(prev => {
      const groups = [...prev]
      const [moved] = groups.splice(srcIdx, 1)
      groups.splice(targetIdx, 0, moved)
      return groups
    })
    groupDragRef.current = null
    setGroupDragOverIdx(null)
    markDirty()
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem 2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.25rem' }}>
        {!hideCreateGroup && <Button design="Emphasized" onClick={openAddGroupDialog}>Create Attribute Group</Button>}
      </div>
      {!hideAudience && (
      <div style={{
        display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1rem',
        padding: '0.75rem 1rem', marginBottom: '1.25rem',
        background: 'var(--sapInformationBackground)',
        border: '1px solid var(--sapMessage_InformationBorderColor)',
        borderRadius: 'var(--sapElement_BorderCornerRadius)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '12rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            <Text style={{ fontWeight: '700', fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)' }}>
              Visibility settings are audience-specific
            </Text>
            <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)' }}>
              {hideRequiredEnabled
              ? 'Attributes, attribute groups, and ordering apply to all audiences – only the Visible / Visible if set / Invisible columns change per audience.'
              : 'Attributes, attribute groups, ordering, required, and enabled status apply to all audiences — only the Visible / Visible if set / Invisible columns change per audience.'
            }
            </Text>
          </div>
        </div>
        <FlexBox alignItems="Center" style={{ gap: '0.5rem' }}>
          <Select
            id="vis-audience-select"
            style={{ minWidth: '160px' }}
            onChange={e => setVisAudience((e.detail as any).selectedOption?.textContent ?? AUDIENCES[0])}
          >
            {AUDIENCES.map(a => (
              <Option key={a} selected={a === visAudience}>{a}</Option>
            ))}
          </Select>
        </FlexBox>
      </div>
      )}

      {attrGroups.map((group, groupIdx) => {
        const searchQuery = (groupSearch[group.id] ?? '').toLowerCase().trim()
        const activeFilters = groupFilters[group.id] ?? {}
        const activeTypes = (activeFilters['type'] as string[] | undefined) ?? []
        const activeClasses = (activeFilters['attrClass'] as string[] | undefined) ?? []
        const activeRequired = activeFilters['required'] as string | undefined
        const activeEnabled = activeFilters['enabled'] as string | undefined
        const activeChangedBy = (activeFilters['changedBy'] as string[] | undefined) ?? []
        const activeVisibility = (activeFilters['visibility'] as string[] | undefined) ?? []
        const filteredAttrs = group.attrs.filter(a => {
          if (searchQuery && !a.name.toLowerCase().includes(searchQuery) && !a.description.toLowerCase().includes(searchQuery) && !a.id.toLowerCase().includes(searchQuery)) return false
          if (activeTypes.length > 0 && !activeTypes.includes(a.type)) return false
          if (activeClasses.length > 0 && !activeClasses.includes(a.attrClass)) return false
          if (activeRequired && String(a.required) !== activeRequired) return false
          if (activeEnabled && String(a.enabled) !== activeEnabled) return false
          if (activeChangedBy.length > 0 && !activeChangedBy.includes(a.lastEditedBy ?? '')) return false
          if (activeVisibility.length > 0 && !Object.values(a.visibility).some(v => activeVisibility.includes(v))) return false
          return true
        }).slice().sort((a, b) => {
          if ((dictCategoryMode || modelingMode) && group.id === 'main') return 0
          const sortKey = groupSortBy[group.id] ?? 'Name'
          const dir = groupSortDir[group.id] ?? 'asc'
          const mult = dir === 'asc' ? 1 : -1
          if (sortKey === 'Name') return mult * a.name.localeCompare(b.name)
          if (sortKey === 'Description') return mult * (a.description ?? '').localeCompare(b.description ?? '')
          if (sortKey === 'Technical ID') return mult * a.id.localeCompare(b.id)
          if (sortKey === 'Date Changed') return mult * ((a.lastEditedAt ?? '').localeCompare(b.lastEditedAt ?? ''))
          if (sortKey === 'Changed By') return mult * ((a.lastEditedBy ?? '').localeCompare(b.lastEditedBy ?? ''))
          return 0
        })
        const isGroupDragTarget = groupDragOverIdx === groupIdx

        return (
          <div
            key={group.id}
            style={{
              marginBottom: '1.25rem',
              outline: isGroupDragTarget ? '2px dashed var(--sapInformationBorderColor)' : '2px dashed transparent',
              outlineOffset: '2px',
              borderRadius: '4px',
              transition: 'outline 0.1s',
            }}
            onDragOver={e => { if (!dictCategoryMode && groupDragRef.current !== null && groupDragRef.current !== groupIdx) { e.preventDefault(); setGroupDragOverIdx(groupIdx) } }}
            onDrop={e => { e.preventDefault(); handleGroupDrop(groupIdx) }}
            onDragLeave={() => setGroupDragOverIdx(null)}
          >
            <SigTableWrapper
              titleSlot={
                <ToolbarItem>
                  <FlexBox alignItems="Center" style={{ gap: '0.5rem' }}>
                    {!dictCategoryMode && (
                    <div
                      draggable
                      onDragStart={() => { groupDragRef.current = groupIdx }}
                      onDragEnd={() => { groupDragRef.current = null; setGroupDragOverIdx(null) }}
                      style={{ display: 'flex', alignItems: 'center', cursor: 'grab', flexShrink: 0 }}
                    >
                      <Icon name="horizontal-grip" style={{ color: 'var(--sapContent_NonInteractiveIconColor)' }} />
                    </div>
                    )}
                    <Button
                      icon={group.expanded ? 'slim-arrow-down' : 'navigation-right-arrow'}
                      design="Transparent"
                      aria-expanded={group.expanded}
                      aria-label={`${group.expanded ? 'Collapse' : 'Expand'} ${group.name}`}
                      onClick={() => toggleGroup(group.id)}
                    />
                    <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontSize)' }}>
                      {group.name} ({group.attrs.length})
                    </Text>
                    {modelingMode && (
                    <FlexBox alignItems="Center" style={{ gap: '0.125rem' }}>
                      <CheckBox
                        checked={group.enabled[visAudience]}
                        accessibleName={`Show group ${group.name}`}
                        onChange={() => toggleGroupEnabled(group.id)}
                      />
                      <Label style={{ cursor: 'default', color: 'var(--sapTextColor)' }}>Visible</Label>
                    </FlexBox>
                    )}
                    {!(modelingMode || dictMode) && !hideAudience && (
                    <FlexBox alignItems="Center" style={{ gap: '0.125rem' }}>
                      <CheckBox
                        checked={group.enabled[visAudience]}
                        accessibleName={`Enable group ${group.name}`}
                        onChange={() => toggleGroupEnabled(group.id)}
                      />
                      <Label style={{ cursor: 'default', color: 'var(--sapTextColor)' }}>Enabled</Label>
                    </FlexBox>
                    )}                  </FlexBox>
                </ToolbarItem>
              }
              searchSlot={
                dictCategoryMode && group.id === 'main' ? undefined :
                <ToolbarItem>
                  <FlexBox alignItems="Center" style={{ gap: '0.5rem' }}>
                    <Input
                      placeholder="Search for attributes"
                      type={'Search' as any}
                      value={groupSearch[group.id] ?? ''}
                      onInput={(e: any) => setGroupSearch(prev => ({ ...prev, [group.id]: e.target?.value ?? '' }))}
                      style={{ width: '200px' }}
                    />
                  </FlexBox>
                </ToolbarItem>
              }
              sortSlot={
                dictCategoryMode && group.id === 'main' ? undefined :
                <ToolbarItem>
                  <SortPopover
                    anchorId={`sort-chip-${group.id}`}
                    sortBy={groupSortBy[group.id] ?? 'Name'}
                    sortDir={groupSortDir[group.id] ?? 'asc'}
                    options={[
                      { key: 'Custom Order', type: 'none' as const, label: 'Custom' },                      { key: 'Name', type: 'text' as const },
                      { key: 'Description', type: 'text' as const },
                      { key: 'Technical ID', type: 'text' as const },
                      { key: 'Date Changed', type: 'date' as const },
                      { key: 'Changed By', type: 'text' as const },
                    ]}
                    onSortByChange={key => { setGroupSortBy(prev => ({ ...prev, [group.id]: key })); sortGroup(group.id, key, groupSortDir[group.id] ?? 'asc') }}
                    onSortDirChange={dir => { setGroupSortDir(prev => ({ ...prev, [group.id]: dir })); sortGroup(group.id, groupSortBy[group.id] ?? 'Name', dir) }}
                  />
                </ToolbarItem>
              }
              filterBarToggleButton={
                dictCategoryMode && group.id === 'main' ? undefined :
                <ToolbarItem>
                  <ToggleButton icon="filter" design="Transparent">
                    {(() => {
                      const count = Object.values(groupFilters[group.id] ?? {}).filter(v => Array.isArray(v) ? v.length > 0 : Boolean(v)).length
                      return count > 0 ? String(count) : ''
                    })()}
                  </ToggleButton>
                </ToolbarItem>
              }
              filterBarSlot={
                dictCategoryMode && group.id === 'main' ? undefined : (
                <SigFilterBar
                  filters={groupFilters[group.id] ?? {}}
                  onFiltersChange={f => setGroupFilters(prev => ({ ...prev, [group.id]: f }))}
                  defaultFilters={{}}
                >
                  <SigFilter filterKey="type" label="Type">
                    <MultiSelect options={[
                      { value: 'Single-line Text', label: 'Single-line Text' },
                      { value: 'Multi-line Text', label: 'Multi-line Text' },
                      { value: 'Selection', label: 'Selection' },
                      { value: 'User', label: 'User' },
                      { value: 'Date', label: 'Date' },
                      { value: 'Number', label: 'Number' },
                      { value: 'Asset Link', label: 'Asset Link' },
                    ]} />
                  </SigFilter>
                  {!hideRequiredColumn && (
                  <SigFilter filterKey="attrClass" label="Class">
                    <MultiSelect options={[
                      { value: 'Standard', label: 'Standard' },
                      { value: 'Custom', label: 'Custom' },
                    ]} />
                  </SigFilter>
                  )}
                  {!dictCategoryMode && !modelingMode && !((hideRequiredColumn || hideRequiredEnabled) && group.id === 'main') && (
                  <SigFilter filterKey="required" label="Required">
                    <SingleSelect options={[
                      { value: 'true', label: 'Yes' },
                      { value: 'false', label: 'No' },
                    ]} />
                  </SigFilter>
                  )}
                  {!dictCategoryMode && !modelingMode && (
                  <SigFilter filterKey="enabled" label="Enabled">
                    <SingleSelect options={[
                      { value: 'true', label: 'Yes' },
                      { value: 'false', label: 'No' },
                    ]} />
                  </SigFilter>
                  )}
                  <SigFilter filterKey="changedBy" label="Changed By">
                    <MultiSelect options={
                      [...new Set(group.attrs.map(a => a.lastEditedBy).filter(Boolean) as string[])]
                        .map(v => ({ value: v, label: v }))
                    } />
                  </SigFilter>
                  {(dictCategoryMode || modelingMode) && !hideAudience && (
                  <SigFilter filterKey="visibility" label="Visibility">
                    <MultiSelect options={[
                      { value: 'Visible', label: 'Visible' },
                      { value: 'Visible if set', label: 'Visible If Set' },
                      { value: 'Invisible', label: 'Invisible' },
                    ]} />
                  </SigFilter>
                  )}
                </SigFilterBar>
                )
              }
              businessActionsSlot={
                dictCategoryMode && group.id === 'main' ? undefined : (
                <ToolbarItem>
                  <Button
                    design="Emphasized"
                    onClick={() => setCreateAttrDialogGroupId(group.id)}
                  >
                    Add
                  </Button>
                </ToolbarItem>
                )
              }
              exportActionsSlot={
                dictCategoryMode ? undefined : (
                <>
                  <ToolbarItem overflowPriority="AlwaysOverflow">
                    <Button icon="edit" design="Transparent" onClick={() => openEditGroupDialog(group.id)}>Edit Group</Button>
                  </ToolbarItem>
                  <ToolbarItem overflowPriority="AlwaysOverflow">
                    <Button icon="navigation-up-arrow" design="Transparent" disabled={groupIdx === 0} onClick={() => moveGroup(group.id, -1)}>Move Up</Button>
                  </ToolbarItem>
                  <ToolbarItem overflowPriority="AlwaysOverflow">
                    <Button icon="navigation-down-arrow" design="Transparent" disabled={groupIdx === attrGroups.length - 1} onClick={() => moveGroup(group.id, 1)}>Move Down</Button>
                  </ToolbarItem>
                  <ToolbarItem overflowPriority="AlwaysOverflow">
                    <Button icon="delete" design="Transparent" disabled={group.id === 'main' || group.attrs.length > 0} onClick={() => deleteGroup(group.id)}>Delete</Button>
                  </ToolbarItem>
                </>
                )
              }
            >
              {group.expanded && (
                <div className="attr-table-wrap" style={{ overflowX: 'auto' }}>
                  <Table
                    className="attr-table"
                    style={{ minWidth: '1100px' }}
                    onMoveOver={handleAttrMoveOver as any}
                    onMove={(e: any) => handleAttrMove(group.id, e)}
                    headerRow={
                      <TableHeaderRow>
                        <TableHeaderCell width="1fr">
                          <span style={{ paddingInlineStart: 'calc(1rem + 0.75rem)' }}>Attribute Name</span>
                        </TableHeaderCell>
                        <TableHeaderCell width="96px">Class</TableHeaderCell>
                        <TableHeaderCell width="160px">Technical ID</TableHeaderCell>
                        {!dictCategoryMode && !modelingMode && !((hideRequiredColumn || hideRequiredEnabled) && group.id === 'main') && <TableHeaderCell width="96px" style={{ textAlign: 'center' } as any}>Required</TableHeaderCell>}
                        {!dictCategoryMode && !modelingMode && (hideRequiredColumn || hideRequiredEnabled) && group.id === 'main' && <TableHeaderCell width="96px" />}
                        {!dictCategoryMode && !modelingMode && <TableHeaderCell width="96px" style={{ textAlign: 'center' } as any}>Enabled</TableHeaderCell>}
                        {!hideAudience && !(dictCategoryMode && group.id === 'main') && (<>
                        <TableHeaderCell width="96px" style={{ textAlign: 'center' } as any}>Visible</TableHeaderCell>
                        <TableHeaderCell width="96px" style={{ textAlign: 'center' } as any}>Visible If Set</TableHeaderCell>
                        <TableHeaderCell width="96px" style={{ textAlign: 'center' } as any}>Invisible</TableHeaderCell>
                        </>)}
                        {!hideAudience && dictCategoryMode && group.id === 'main' && (<>
                        <TableHeaderCell width="96px" />
                        <TableHeaderCell width="96px" />
                        <TableHeaderCell width="96px" />
                        </>)}
                        <TableHeaderCell width="3rem" />
                      </TableHeaderRow>
                    }
                  >
                    {group.attrs.length === 0 && (
                      <TableRow>
                        <TableCell {...{ colSpan: 9 - (hideAudience ? 3 : 0) - (modelingMode ? 2 : (dictCategoryMode ? 2 : ((hideRequiredColumn || hideRequiredEnabled) && group.id === 'main' ? 1 : 0))) } as any}>
                          <div style={{ padding: '1.25rem', textAlign: 'center' }}>
                            <Text style={{ color: 'var(--sapContent_LabelColor)' }}>No attributes. Click Add to create one.</Text>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    {filteredAttrs.map((attr) => {
                      const realIdx = group.attrs.findIndex(a => a.id === attr.id)
                      const otherGroups = attrGroups.filter(g => g.id !== group.id)
                      const isAttrDisabled = !modelingMode && !hideRequiredColumn && !attr.enabled
                      const isGroupDisabled = !hideRequiredColumn && !group.enabled[visAudience]
                      const isDisabled = isAttrDisabled || isGroupDisabled

                      return (
                        <TableRow
                          key={attr.id}
                          {...((dictCategoryMode && group.id === 'main' && attr.attrClass === 'Standard') ? {} : { movable: true })}
                          rowKey={attr.id}
                          data-attr-id={attr.id}
                        >
                          <TableCell>
                            <FlexBox alignItems="Start" style={{ gap: '0.75rem' }}>
                              {!(dictCategoryMode && group.id === 'main' && attr.attrClass === 'Standard') && (
                                <Icon name="horizontal-grip" style={{ color: 'var(--sapContent_NonInteractiveIconColor)', flexShrink: 0, paddingTop: '2px' }} />
                              )}
                              {(dictCategoryMode && group.id === 'main' && attr.attrClass === 'Standard') && (
                                <div style={{ width: '1rem', flexShrink: 0 }} />
                              )}
                              <FlexBox direction="Column" style={{ gap: '0.125rem', opacity: isDisabled ? 0.45 : 1 }}>
                                <FlexBox alignItems="Center" style={{ gap: '0.375rem' }}>
                                  <Text style={{ fontWeight: '600', whiteSpace: 'nowrap' }}>{attr.name}</Text>
                                  <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)' }}>·</Text>
                                  <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)' }}>{attr.type}</Text>
                                </FlexBox>
                                {attr.description && (
                                  <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)' }}>{attr.description}</Text>
                                )}
                                {attr.lastEditedBy && attr.attrClass !== 'Standard' && (
                                  <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)', whiteSpace: 'nowrap' }}>
                                    Last edited by {attr.lastEditedBy}{attr.lastEditedAt ? ` on ${attr.lastEditedAt}` : ''}
                                  </Text>
                                )}
                              </FlexBox>
                            </FlexBox>
                          </TableCell>
                          <TableCell>
                            <Text style={{ fontSize: 'var(--sapFontSize)', opacity: isDisabled ? 0.45 : 1 }}>{attr.attrClass}</Text>
                          </TableCell>
                          <TableCell>
                            <Text style={{ fontSize: 'var(--sapFontSize)', opacity: isDisabled ? 0.45 : 1 }}>{attr.id}</Text>
                          </TableCell>
                          {!dictCategoryMode && !modelingMode && !((hideRequiredColumn || hideRequiredEnabled) && group.id === 'main') && (
                          <TableCell>
                            <FlexBox justifyContent="Center">
                              <CheckBox
                                accessibleName={`Required: ${attr.name}`}
                                checked={attr.required}
                                onChange={e => updateAttr(group.id, attr.id, { required: (e.target as unknown as HTMLInputElement).checked })}
                              />
                            </FlexBox>
                          </TableCell>
                          )}
                          {!dictCategoryMode && !modelingMode && (hideRequiredColumn || hideRequiredEnabled) && group.id === 'main' && (
                          <TableCell />
                          )}
                          {!dictCategoryMode && !modelingMode && (
                          <TableCell>
                            <FlexBox justifyContent="Center">
                              <CheckBox
                                accessibleName={`Enabled: ${attr.name}`}
                                checked={attr.enabled}
                                onChange={e => updateAttr(group.id, attr.id, { enabled: (e.target as unknown as HTMLInputElement).checked })}
                              />
                            </FlexBox>
                          </TableCell>
                          )}
                          {!hideAudience && !(dictCategoryMode && group.id === 'main') && (<>
                          <TableCell>
                            <FlexBox justifyContent="Center">
                              <RadioButton
                                name={`vis-${attr.id}`}
                                checked={attr.visibility[visAudience] === 'Visible'}
                                disabled={modelingMode && !group.enabled[visAudience]}
                                onChange={() => updateAttr(group.id, attr.id, { visibility: { ...attr.visibility, [visAudience]: 'Visible' } })}
                              />
                            </FlexBox>
                          </TableCell>
                          <TableCell>
                            <FlexBox justifyContent="Center">
                              <RadioButton
                                name={`vis-${attr.id}`}
                                checked={attr.visibility[visAudience] === 'Visible if set'}
                                disabled={modelingMode && !group.enabled[visAudience]}
                                onChange={() => updateAttr(group.id, attr.id, { visibility: { ...attr.visibility, [visAudience]: 'Visible if set' } })}
                              />
                            </FlexBox>
                          </TableCell>
                          <TableCell>
                            <FlexBox justifyContent="Center">
                              <RadioButton
                                name={`vis-${attr.id}`}
                                checked={attr.visibility[visAudience] === 'Invisible'}
                                disabled={modelingMode && !group.enabled[visAudience]}
                                onChange={() => updateAttr(group.id, attr.id, { visibility: { ...attr.visibility, [visAudience]: 'Invisible' } })}
                              />
                            </FlexBox>
                          </TableCell>
                          </>)}
                          {!hideAudience && dictCategoryMode && group.id === 'main' && (<>
                          <TableCell /><TableCell /><TableCell />
                          </>)}
                          <TableCell style={{ position: 'sticky', right: 0, background: 'var(--sapList_Background)' } as any}>
                            {!(dictCategoryMode && group.id === 'main' && attr.attrClass === 'Standard') && (
                            <FlexBox justifyContent="End">
                              <Button
                                id={`overflow-btn-${attr.id}`}
                                icon="overflow"
                                design="Transparent"
                                tooltip={`More options for ${attr.name}`}
                                onClick={() => setOpenMenuId(openMenuId === attr.id ? null : attr.id)}
                              />
                              <Menu
                                opener={`overflow-btn-${attr.id}`}
                                open={openMenuId === attr.id}
                                onClose={() => setOpenMenuId(null)}
                                onItemClick={(e: any) => {
                                  const text = e.detail?.item?.text ?? e.detail?.item?.textContent
                                  if (text === 'Edit') { setEditAttrPending({ groupId: group.id, attrId: attr.id }); setEditAttrDialogOpen(true) }
                                  else if (text === 'Move Up') moveAttr(group.id, realIdx, -1)
                                  else if (text === 'Move Down') moveAttr(group.id, realIdx, 1)
                                  else if (text === 'Remove') setDeleteAttrPending({ groupId: group.id, attrId: attr.id, attrName: attr.name })
                                  else {
                                    const targetGroup = otherGroups.find(g => g.name === text)
                                    if (targetGroup) moveAttrToGroup(group.id, attr.id, targetGroup.id)
                                  }
                                  setOpenMenuId(null)
                                }}
                              >
                                {!(dictCategoryMode && group.id === 'main') && attr.attrClass !== 'Standard' && <MenuItem text="Edit" icon="edit" />}
                                {!(dictCategoryMode && group.id === 'main') && attr.attrClass !== 'Standard' && <MenuSeparator />}
                                <MenuItem text="Move Up" icon="navigation-up-arrow" {...{ disabled: realIdx === 0 } as any} />
                                <MenuItem text="Move Down" icon="navigation-down-arrow" {...{ disabled: realIdx === group.attrs.length - 1 } as any} />
                                {!(dictCategoryMode && group.id === 'main') && otherGroups.length > 0 && (
                                  <MenuItem text="Move to" icon="move">
                                    {otherGroups.map(targetGroup => (
                                      <MenuItem key={targetGroup.id} text={targetGroup.name} />
                                    ))}
                                  </MenuItem>
                                )}
                                {!(dictCategoryMode && group.id === 'main') && attr.attrClass !== 'Standard' && <MenuSeparator />}
                                {!(dictCategoryMode && group.id === 'main') && attr.attrClass !== 'Standard' && <MenuItem text="Remove" icon="delete" />}
                              </Menu>
                            </FlexBox>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </Table>
                </div>
              )}
            </SigTableWrapper>
          </div>
        )
      })}

      <AttributeGroupDialog
        open={groupDialogOpen}
        editName={editingGroupId ? (attrGroups.find(g => g.id === editingGroupId)?.name) : undefined}
        onClose={() => setGroupDialogOpen(false)}
        onConfirm={handleGroupDialogConfirm}
      />
      <CreateAttributeDialog
        open={createAttrDialogGroupId !== null}
        dialogTitle="Add Attribute"
        showReuseSection
        onClose={() => setCreateAttrDialogGroupId(null)}
        hideAssignSection={hideAssignSection}
        defaultAssignedTo={defaultAssignedTo}
        assignableAssetTypes={assignableAssetTypes}
        dictMode={dictMode}
        dictCategories={dictCategories}
        modelingMode={modelingMode}
        hideAudience={hideAudience}
        onCreate={(type: AttributeType, name: string) => {
          if (createAttrDialogGroupId) {
            const vis = Object.fromEntries(AUDIENCES.map(a => [a, 'Visible' as AttrVis]))
            const newAttr: AttrRow = {
              id: `attr-${Date.now()}-${Math.random().toString(36).slice(2)}`,
              name: name || 'New Attribute',
              type,
              description: '',
              attrClass: 'Custom',
              required: false,
              enabled: true,
              visibility: vis,
            }
            setAttrGroups(prev => prev.map(g => g.id === createAttrDialogGroupId ? { ...g, attrs: [...g.attrs, newAttr] } : g))
            showToast('Attribute added')
          }
          setCreateAttrDialogGroupId(null)
        }}
        onReuseAdd={() => {
        }}
      />
      {editAttrDialogOpen && editAttrPending && (() => {
        const grp = attrGroups.find(g => g.id === editAttrPending.groupId)
        const attr = grp?.attrs.find(a => a.id === editAttrPending.attrId)
        if (!attr) return null
        return (
          <CreateAttributeDialog
            open
            editMode
            initialType={attr.type as AttributeType}
            initialName={attr.name}
            initialDescription={attr.description}
            hideAssignSection={hideAssignSection}
            defaultAssignedTo={defaultAssignedTo}
            assignableAssetTypes={assignableAssetTypes}
            dictMode={dictMode}
            dictCategories={dictCategories}
            modelingMode={modelingMode}
            onClose={() => { setEditAttrDialogOpen(false); setEditAttrPending(null) }}
            onCreate={(type: AttributeType, name: string) => {
              setAttrGroups(prev => prev.map(g => g.id === editAttrPending.groupId
                ? { ...g, attrs: g.attrs.map(a => a.id === editAttrPending.attrId ? { ...a, name, type } : a) }
                : g
              ))
              setEditAttrDialogOpen(false)
              setEditAttrPending(null)
              showToast('Attribute updated')
            }}
          />
        )
      })()}
      <MessageBox
        open={deleteAttrPending !== null}
        type="Warning"
        titleText="Remove Attribute"
        actions={(dictCategoryMode || modelingMode) ? ['Remove', 'Delete Completely', 'Cancel'] : ['Remove', 'Cancel']}
        emphasizedAction="Remove"
        style={{ width: '500px' }}
        onClose={(action) => {
          if ((action === 'Remove' || action === 'Delete Completely') && deleteAttrPending) {
            removeAttr(deleteAttrPending.groupId, deleteAttrPending.attrId)
            showToast('Attribute deleted')
          }
          setDeleteAttrPending(null)
        }}
      >
        <div style={{ padding: '16px' }}>
          {(dictCategoryMode || modelingMode)
            ? `Do you want to remove this attribute only for ${panelTitle ?? 'this item'} or delete it completely?`
            : 'Removing this attribute will also delete all associated data from the asset. This action cannot be undone.'
          }
        </div>
      </MessageBox>
      <Toast open={!!toast} placement="BottomCenter" onClose={() => setToast(null)}>
        {toast}
      </Toast>
    </div>
  )
}
