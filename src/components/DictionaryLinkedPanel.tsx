import React, { useState } from 'react'
import { Avatar, Button, Icon, Input, Label, SegmentedButton, SegmentedButtonItem, Switch, Tab, Text } from '@ui5/webcomponents-react'
import { SigChipV2, SigDomainObject, SigRightSidePanel } from '@signavio/sap-signavio-uixtension'
import { elementData, dictionaryItems } from '../data/liveInsightsData'

const DICT_DATA: Record<string, { name: string; category: string; subCategory: string; description: string }> = {
  'd27': { name: 'Evaluate CV',         category: 'Activities', subCategory: 'HR Processes',  description: 'Review and evaluate submitted curriculum vitae against job requirements' },
  'd28': { name: 'Plan interview',       category: 'Activities', subCategory: 'HR Processes',  description: 'Schedule and plan the candidate interview with relevant stakeholders' },
  'd41': { name: 'ATS System',          category: 'IT System',  subCategory: 'HR Technology', description: 'Applicant Tracking System for managing recruitment workflow' },
  'd30': { name: 'Make offer',          category: 'Activities', subCategory: 'HR Processes',  description: 'Prepare and deliver formal job offer to selected candidate' },
  'd31': { name: 'Onboard candidate',   category: 'Activities', subCategory: 'HR Processes',  description: 'Complete onboarding process for new hire' },
}

const TYPE_LABEL: Record<string, string> = {
  task: 'Task', gateway: 'Gateway', event: 'Event',
  system: 'IT System', artifact: 'IT System', data: 'Data Object',
}
const TYPE_ICON: Record<string, string> = {
  task: 'SAP-icons-v4/task-activity', gateway: 'SAP-icons-v4/exclusive-xor-gateway',
  event: 'SAP-icons-v4/end-event', system: 'SAP-icons-v4/computer',
  artifact: 'SAP-icons-v4/computer', data: 'document',
}
const ELEMENT_ATTRS: Record<string, { label: string; value: string; type?: 'chip' | 'boolean' | 'select' }[]> = {
  'el-evaluate':  [
    { label: 'Type', value: 'User Task', type: 'select' },
    { label: 'Assigned Role', value: 'HR Manager' },
    { label: 'Duration / SLA', value: '2 Business Days' },
  ],
  'el-interview': [
    { label: 'Type', value: 'User Task', type: 'select' },
    { label: 'Assigned Role', value: 'HR Manager' },
    { label: 'Duration / SLA', value: '3 Business Days' },
  ],
  'el-system': [
    { label: 'Category', value: 'HR Technology', type: 'select' },
    { label: 'Version', value: '3.0' },
    { label: 'Status', value: 'Published', type: 'select' },
  ],
}

type Props = {
  elementId: string
  dictId: string
  onClose: () => void
  onSwitchToElement: () => void
}

type View = 'element' | 'dict'

export default function DictionaryLinkedPanel({ elementId, dictId, onClose, onSwitchToElement }: Props) {
  const [view, setView] = useState<View>('element')
  const el = elementData[elementId]
  const dict = DICT_DATA[dictId]
  const dictItem = dictionaryItems.find(d => d.id === dictId)
  if (!el || !dict) return null

  const typeLabel = TYPE_LABEL[el.type] ?? el.type
  const typeIcon  = TYPE_ICON[el.type]  ?? 'SAP-icons-v4/task-activity'
  const attrs = ELEMENT_ATTRS[elementId] ?? []

  // ── Element tabs ──────────────────────────────────────────────────────────
  const elementTabs = [
    <Tab text="Attributes" key="attributes">
      <div style={{ paddingBottom: '12px' }}>
        <div style={{ marginBottom: 4 }}>
          <Input placeholder="Search for attributes" type={'Search' as any} style={{ width: '100%' } as React.CSSProperties}>
            <Icon slot="icon" name="search" />
          </Input>
        </div>

        {/* Main Attributes */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 0' }}>
          <Text style={{ fontWeight: 700, fontSize: 'var(--sapFontHeader6Size)', color: 'var(--sapPageHeader_TextColor)' }}>
            Main Attributes ({attrs.length + (el.description ? 1 : 0)})
          </Text>
        </div>

        {el.description && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 0' }}>
            <Label showColon style={{ color: 'var(--sapContent_LabelColor)' }}>Description</Label>
            <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)', lineHeight: 1.4 }}>{el.description}</Text>
            <Button design="Default" icon="edit" style={{ alignSelf: 'flex-start' } as React.CSSProperties} />
          </div>
        )}

        {attrs.map(attr => (
          <div key={attr.label} style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 0' }}>
            <Label showColon style={{ color: 'var(--sapContent_LabelColor)' }}>{attr.label}</Label>
            {attr.type === 'boolean'
              ? <Switch />
              : <SigChipV2
                  value={attr.value}
                  trailingIcon={attr.type === 'select' ? 'slim-arrow-down' : undefined}
                />
            }
          </div>
        ))}
      </div>
    </Tab>,
    <Tab text="Relations" key="relations">
      <div style={{ padding: '8px 0', opacity: 0.5 }}>
        <Text>No relations</Text>
      </div>
    </Tab>,
  ]

  // ── Dictionary Entry tabs ─────────────────────────────────────────────────
  const dictTabs = [
    <Tab text="Details" key="details">
      <div style={{ paddingBottom: '12px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <Label showColon style={{ color: 'var(--sapContent_LabelColor)' }}>Category</Label>
          <Text>{dict.category}{dict.subCategory ? ` / ${dict.subCategory}` : ''}</Text>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <Label showColon style={{ color: 'var(--sapContent_LabelColor)' }}>Description</Label>
          <Text style={{ lineHeight: 1.5 }}>{dictItem?.description ?? dict.description}</Text>
        </div>
        {dictItem?.status && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <Label showColon style={{ color: 'var(--sapContent_LabelColor)' }}>Status</Label>
            <SigChipV2
              value={dictItem.status.charAt(0).toUpperCase() + dictItem.status.slice(1)}
              design={dictItem.status === 'published' ? ('indication5' as any) : ('indication10' as any)}
            />
          </div>
        )}
        {dictItem?.version && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <Label showColon style={{ color: 'var(--sapContent_LabelColor)' }}>Version</Label>
            <Text>{dictItem.version}</Text>
          </div>
        )}
        {dictItem?.usedIn && dictItem.usedIn.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <Label showColon style={{ color: 'var(--sapContent_LabelColor)' }}>Used In</Label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
              {dictItem.usedIn.map(name => <SigChipV2 key={name} value={name} />)}
            </div>
          </div>
        )}
      </div>
    </Tab>,
    <Tab text="Relations" key="relations">
      <div style={{ padding: '8px 0' }}>
        <Text style={{ color: 'var(--sapContent_LabelColor)' }}>No relations defined.</Text>
      </div>
    </Tab>,
  ]

  return (
    <SigRightSidePanel
      headerTitle={el.name}
      editable
      editableTitlePlaceholder={el.name}
      isOpen
      toggleRightSidePanel={onClose}
      navigationSlot={[() => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 24, height: 24, borderRadius: 6, flexShrink: 0,
            background: 'var(--sapAvatar_6_Background, #d1efff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name={typeIcon} style={{ width: 12, height: 12, color: '#0064d9' } as React.CSSProperties} />
          </div>
          <Text style={{ fontSize: 'var(--sapFontSize)', fontWeight: 700, color: 'var(--sapPageHeader_TextColor)', whiteSpace: 'nowrap' }}>
            {typeLabel}
          </Text>
        </div>
      )]}
      contentActionsSlot={[]}
      subHeaderSlot={[() => (
        <div style={{ padding: '0 1rem 0.5rem' }}>
          <SegmentedButton>
            <SegmentedButtonItem pressed={view === 'element'} icon="SAP-icons-v4/graph-unspecified" onClick={() => setView('element')}>Element</SegmentedButtonItem>
            <SegmentedButtonItem pressed={view === 'dict'} icon="course-book" onClick={() => setView('dict')}>Dictionary Entry</SegmentedButtonItem>
          </SegmentedButton>
        </div>
      )]}
      tabSlot={view === 'element' ? elementTabs : dictTabs}
      style={{ width: '100%', maxWidth: 'none', height: '100%', overflow: 'hidden', background: 'var(--sapList_Background)', position: 'relative' }}
    >
      {''}
    </SigRightSidePanel>
  )
}
