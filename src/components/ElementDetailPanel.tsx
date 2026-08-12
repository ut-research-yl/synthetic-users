import React, { useState } from 'react'
import { Avatar, Button, Icon, Input, Label, SegmentedButton, SegmentedButtonItem, Switch, Tab, TabContainer, Text } from '@ui5/webcomponents-react'
import { SigChipV2, SigDomainObject, SigInlineEdit, SigRightSidePanel } from '@signavio/sap-signavio-uixtension'
import { elementData } from '../data/liveInsightsData'

type Props = {
  elementId: string
  onClose: () => void
  dictId?: string
  onViewDictEntry?: () => void
  linkedShapes?: { id: string; widgetName: string; widgetId?: string; label?: string; shapeType: string }[]
  onSelectLinkedShape?: (shapeId: string) => void
}

const TYPE_LABEL: Record<string, string> = {
  task:     'Task',
  gateway:  'Gateway',
  event:    'Event',
  system:   'IT System',
  artifact: 'IT System',
  data:     'Data Object',
}

const TYPE_ICON: Record<string, string> = {
  task:     'SAP-icons-v4/task-activity',
  gateway:  'SAP-icons-v4/exclusive-xor-gateway',
  event:    'SAP-icons-v4/end-event',
  system:   'SAP-icons-v4/computer',
  artifact: 'SAP-icons-v4/computer',
  data:     'document',
}

const TYPE_COLOR: Record<string, string> = {
  task:     'var(--sapAvatar_6_Background, #d1efff)',
  gateway:  'var(--sapAvatar_6_Background, #d1efff)',
  event:    'var(--sapAvatar_6_Background, #d1efff)',
  system:   'var(--sapAvatar_6_Background, #d1efff)',
  artifact: 'var(--sapAvatar_6_Background, #d1efff)',
  data:     'var(--sapAvatar_6_Background, #d1efff)',
}

const TYPE_ICON_COLOR: Record<string, string> = {
  task:     '#0064d9',
  gateway:  '#0064d9',
  event:    '#0064d9',
  system:   '#0064d9',
  artifact: '#0064d9',
  data:     '#0064d9',
}

const ELEMENT_ATTRS: Record<string, { label: string; value: string; type?: 'chip' | 'boolean' | 'select' }[]> = {
  'el-evaluate':  [
    { label: 'Type',             value: 'User Task',       type: 'select' },
    { label: 'Assigned Role',    value: 'HR Manager'       },
    { label: 'Duration / SLA',   value: '2 Business Days'  },
    { label: 'Input Documents',  value: 'Candidate CV'     },
    { label: 'Output Documents', value: 'Evaluation Form'  },
    { label: 'Automated',        value: 'false', type: 'boolean' },
  ],
  'el-plan': [
    { label: 'Type',           value: 'User Task',              type: 'select' },
    { label: 'Assigned Role',  value: 'Recruitment Specialist'  },
    { label: 'Duration / SLA', value: '1 Business Day'          },
    { label: 'IT Systems',     value: 'Microsoft Teams'         },
  ],
  'el-interview': [
    { label: 'Type',             value: 'User Task',          type: 'select' },
    { label: 'Assigned Role',    value: 'HR Manager'          },
    { label: 'Duration / SLA',   value: '3 Business Days'     },
    { label: 'Input Documents',  value: 'Interview Scorecard' },
    { label: 'Input Documents',  value: 'CV / Resume'         },
    { label: 'Output Documents', value: 'Completed Scorecard' },
    { label: 'IT Systems',       value: 'Microsoft Teams'     },
    { label: 'IT Systems',       value: 'ATS System'          },
  ],
  'el-offer': [
    { label: 'Type',             value: 'User Task',      type: 'select' },
    { label: 'Assigned Role',    value: 'HR Manager'      },
    { label: 'Duration / SLA',   value: '2 Business Days' },
    { label: 'Output Documents', value: 'Offer Letter'    },
  ],
  'el-onboard': [
    { label: 'Type',           value: 'User Task',      type: 'select' },
    { label: 'Assigned Role',  value: 'HR Manager'      },
    { label: 'Duration / SLA', value: '5 Business Days' },
    { label: 'IT Systems',     value: 'Workday'          },
  ],
  'el-system': [
    { label: 'Category', value: 'HR Technology', type: 'select' },
    { label: 'Version',  value: '3.0'            },
    { label: 'Status',   value: 'Published',     type: 'select' },
    { label: 'Owner',    value: 'IT Admin'        },
  ],
  'el-reject1': [
    { label: 'Type',           value: 'User Task',     type: 'select' },
    { label: 'Assigned Role',  value: 'HR Manager'     },
    { label: 'Duration / SLA', value: '1 Business Day' },
  ],
  'el-reject2': [
    { label: 'Type',           value: 'User Task',     type: 'select' },
    { label: 'Assigned Role',  value: 'HR Manager'     },
    { label: 'Duration / SLA', value: '1 Business Day' },
  ],
}

// Custom attributes shown in the second section (editable chips with X)
const CUSTOM_ATTRS: Record<string, { label: string; type?: 'chip' | 'asset'; values: string[]; assets?: { name: string; subtype: string; object: string }[] }[]> = {
  'el-evaluate': [
    { label: 'Related Assets', type: 'asset', values: [], assets: [
      { name: 'Candidate Evaluation Guide', subtype: 'BPMN', object: 'Process Model' },
    ]},
    { label: 'IT Systems', values: ['SAP SuccessFactors'] },
  ],
  'el-plan': [
    { label: 'Related Assets', type: 'asset', values: [], assets: [
      { name: 'Interview Plan Template', subtype: 'BPMN', object: 'Process Model' },
    ]},
  ],
  'el-interview': [
    { label: 'Related Assets', type: 'asset', values: [], assets: [
      { name: 'Candidate Scorecard', subtype: 'BPMN', object: 'Process Model' },
      { name: 'Job Description', subtype: 'Initiative', object: 'Initiative' },
    ]},
    { label: 'IT Systems', values: ['Microsoft Teams', 'ATS System'] },
  ],
  'el-offer': [
    { label: 'Related Assets', type: 'asset', values: [], assets: [
      { name: 'Offer Letter Template', subtype: 'BPMN', object: 'Process Model' },
    ]},
    { label: 'IT Systems', values: ['SAP SuccessFactors'] },
  ],
  'el-onboard': [
    { label: 'Related Assets', type: 'asset', values: [], assets: [
      { name: 'Onboarding Checklist', subtype: 'BPMN', object: 'Process Model' },
    ]},
    { label: 'IT Systems', values: ['Workday', 'ServiceNow'] },
  ],
}

function AttrGroup({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 0' }}>
        <Button
          design="Transparent"
          icon={collapsed ? 'slim-arrow-right' : 'slim-arrow-down'}
          style={{ '--_ui5_button_base_min_width': '24px', '--_ui5_button_base_height': '24px', padding: 0 } as React.CSSProperties}
          onClick={() => setCollapsed(v => !v)}
        />
        <Text style={{ fontWeight: 700, fontSize: 'var(--sapFontHeader6Size)', color: 'var(--sapPageHeader_TextColor)' } as React.CSSProperties}>
          {title} ({count})
        </Text>
      </div>
      {!collapsed && children}
    </div>
  )
}

function AssetListItem({ name, subtype, object, onRemove }: {
  name: string; subtype: string; object: string; onRemove: () => void
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '8px 0', width: '100%',
    }}>
      <SigDomainObject object={object as never} size="XS" />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Text style={{ fontWeight: 700, fontSize: 'var(--sapFontSize)', color: 'var(--sapList_TextColor, #1d2d3e)', display: 'block' } as React.CSSProperties}>
          {name}
        </Text>
        <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor, #556b82)', display: 'block' } as React.CSSProperties}>
          {subtype}
        </Text>
      </div>
      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
        <Button design="Transparent" icon="link" />
        <Button design="Transparent" icon="decline" onClick={onRemove} />
      </div>
    </div>
  )
}

function EditableAttrRow({ label, values, assets, type, onRemove, onRemoveAsset }: {
  label: string
  values: string[]
  assets?: { name: string; subtype: string; object: string }[]
  type?: 'chip' | 'asset'
  onRemove: (idx: number) => void
  onRemoveAsset?: (idx: number) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 0' }}>
      <Label showColon style={{ color: 'var(--sapContent_LabelColor)' }}>{label}</Label>
      {type === 'asset' && assets ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {assets.map((a, i) => (
            <AssetListItem key={i} {...a} onRemove={() => onRemoveAsset?.(i)} />
          ))}
          <Button design="Default" icon="add" style={{ alignSelf: 'flex-start', marginTop: 4 } as React.CSSProperties} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {values.map((v, i) => (
            <SigChipV2 key={i} value={v} endActionIcon="decline" onEndActionClick={() => onRemove(i)} style={{ width: 'fit-content' } as React.CSSProperties} />
          ))}
          <Button design="Default" icon="add" style={{ alignSelf: 'flex-start', marginTop: 2 } as React.CSSProperties} />
        </div>
      )}
    </div>
  )
}

export default function ElementDetailPanel({ elementId, onClose, dictId, onViewDictEntry, linkedShapes, onSelectLinkedShape }: Props) {
  const el = elementData[elementId]
  const [activeTab, setActiveTab] = useState('Attributes')

  // editable custom attrs state
  const initCustom = (CUSTOM_ATTRS[elementId] ?? []).map(g => ({ ...g, values: [...g.values], assets: g.assets ? [...g.assets] : undefined }))
  const [customAttrs, setCustomAttrs] = useState(initCustom)

  if (!el) return null

  const typeLabel = TYPE_LABEL[el.type] ?? el.type
  const typeIcon  = TYPE_ICON[el.type]  ?? 'SAP-icons-v4/task-activity'
  const typeColor = TYPE_COLOR[el.type] ?? 'var(--sapAvatar_6_Background)'
  const iconColor = TYPE_ICON_COLOR[el.type] ?? '#0064d9'

  const attrs = ELEMENT_ATTRS[elementId] ?? []
  const totalAttrs = attrs.length + (el.description ? 1 : 0)

  // group main attrs by label
  const attrMap: Record<string, string[]> = {}
  attrs.forEach(a => {
    if (!attrMap[a.label]) attrMap[a.label] = []
    attrMap[a.label].push(a.value)
  })
  const attrEntries = Object.entries(attrMap)

  const removeCustomValue = (groupIdx: number, valIdx: number) => {
    setCustomAttrs(prev => prev.map((g, i) =>
      i === groupIdx ? { ...g, values: g.values.filter((_, vi) => vi !== valIdx) } : g
    ))
  }

  const removeCustomAsset = (groupIdx: number, assetIdx: number) => {
    setCustomAttrs(prev => prev.map((g, i) =>
      i === groupIdx ? { ...g, assets: g.assets?.filter((_, ai) => ai !== assetIdx) } : g
    ))
  }

  const tabs = [
    <Tab text="Attributes" key="attributes">
      <div style={{ paddingBottom: '12px' }}>
        <div style={{ marginBottom: 4 }}>
          <Input
            placeholder="Search for attributes"
            type={'Search' as any}
            style={{ width: '100%' } as React.CSSProperties}
          >
            <Icon slot="icon" name="search" />
          </Input>
        </div>

        {linkedShapes && linkedShapes.length > 0 && (
          <AttrGroup title="Live Insights Data" count={linkedShapes.length}>
            <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', display: 'block', paddingBottom: '0.5rem' } as React.CSSProperties}>
              Process data connected to this step
            </Text>
            {linkedShapes.map(ls => {
              const LI_ICON: Record<string, string> = {
                'Indicator': 'SAP-icons-v4/data-indicator', 'Value': 'record',
                'Progress Bar': 'SAP-icons-v4/progress-bar', 'Trend': 'SAP-icons-v4/data-trend',
                'Ring Chart': 'SAP-icons-v4/ring-chart', 'Traffic Light': 'SAP-icons-v4/traffic-light',
                'Cockpit': 'SAP-icons-v4/gauge-cockpit', 'Sentiment': 'SAP-icons-v4/emotion-positive',
              }
              const WIDGET_MOCK: Record<string, { value: string; label: string; trend: string; trendColor: string }> = {
                'value-D-001': { value: '4,218', label: 'Total Cases',     trend: '+12%', trendColor: '#256F3A' },
                'value-D-002': { value: '1,042', label: 'Open Cases',      trend: '-3%',  trendColor: '#BB0000' },
                'value-D-003': { value: '892',   label: 'Resolved Cases',  trend: '+8%',  trendColor: '#256F3A' },
                'value-D-004': { value: '94.2%', label: 'SLA Compliance',  trend: '-1%',  trendColor: '#E9730C' },
                'value-D-005': { value: '3,156', label: 'Processed Items', trend: '+5%',  trendColor: '#256F3A' },
                'value-I-001': { value: '2,847', label: 'Active Cases',    trend: '+12%', trendColor: '#256F3A' },
                'value-I-002': { value: '28.5d', label: 'Avg. Duration',   trend: '-4%',  trendColor: '#BB0000' },
              }
              const mock = ls.widgetId ? WIDGET_MOCK[ls.widgetId] : undefined
              const shapeIcon = LI_ICON[ls.shapeType] ?? 'SAP-icons-v4/data-indicator'
              return (
                <div key={ls.id} style={{ border: '1px solid var(--sapList_BorderColor, #d9d9d9)', borderRadius: '0.5rem', overflow: 'hidden', marginBottom: '0.5rem' }}>
                  <div onClick={() => onSelectLinkedShape?.(ls.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.75rem', background: 'var(--sapPageSection_Background, #f5f6f7)', cursor: 'pointer' }}
                  >
                    <div style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', flexShrink: 0, background: 'var(--sapAvatar_6_Background, #d1efff)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name={shapeIcon} style={{ width: '1rem', height: '1rem', color: '#0064d9' } as React.CSSProperties} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text style={{ fontWeight: 700, fontSize: 'var(--sapFontSize)', color: 'var(--sapList_TextColor, #1d2d3e)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } as React.CSSProperties}>
                        {ls.label ?? ls.widgetName}
                      </Text>
                      <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', display: 'block' } as React.CSSProperties}>
                        {ls.shapeType} · {ls.widgetName}
                      </Text>
                    </div>
                    <Icon name="slim-arrow-right" style={{ width: '1rem', height: '1rem', color: '#0064d9', flexShrink: 0 } as React.CSSProperties} />
                  </div>
                  {mock && (
                    <div style={{ display: 'flex', borderTop: '1px solid var(--sapList_BorderColor, #d9d9d9)' }}>
                      <div style={{ flex: 1, padding: '0.625rem 0.75rem', borderRight: '1px solid var(--sapList_BorderColor, #d9d9d9)' }}>
                        <Text style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--sapTextColor)', display: 'block' } as React.CSSProperties}>{mock.value}</Text>
                        <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', display: 'block' } as React.CSSProperties}>{mock.label}</Text>
                      </div>
                      <div style={{ flex: 1, padding: '0.625rem 0.75rem' }}>
                        <Text style={{ fontSize: '1.25rem', fontWeight: 700, color: mock.trendColor, display: 'block' } as React.CSSProperties}>{mock.trend}</Text>
                        <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', display: 'block' } as React.CSSProperties}>vs. last month</Text>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </AttrGroup>
        )}

        <AttrGroup title="Main Attributes" count={totalAttrs}>
          {el.description && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 0' }}>
              <Label showColon style={{ color: 'var(--sapContent_LabelColor)' }}>Description</Label>
              <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)', lineHeight: 1.4 } as React.CSSProperties}>
                {el.description}
              </Text>
              <Button design="Default" icon="edit" style={{ alignSelf: 'flex-start' } as React.CSSProperties} />
            </div>
          )}
          {attrEntries.map(([label, values]) => {
            const attrType = attrs.find(a => a.label === label)?.type
            return (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 0' }}>
                <Label showColon style={{ color: 'var(--sapContent_LabelColor)' }}>{label}</Label>
                {attrType === 'boolean'
                  ? <Switch checked={values[0] === 'true'} />
                  : <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {values.map((v, i) => (
                        attrType === 'select'
                          ? <SigChipV2 key={i} value={v} trailingIcon="slim-arrow-down" />
                          : <SigChipV2 key={i} value={v} endActionIcon="decline" onEndActionClick={() => {}} />
                      ))}
                    </div>
                }
              </div>
            )
          })}
        </AttrGroup>

        {customAttrs.length > 0 && (
          <AttrGroup title="Custom Attributes" count={customAttrs.reduce((s, g) => s + g.values.length + (g.assets?.length ?? 0), 0)}>
            {customAttrs.map((group, gi) => (
              <EditableAttrRow
                key={group.label}
                label={group.label}
                type={group.type}
                values={group.values}
                assets={group.assets}
                onRemove={(vi) => removeCustomValue(gi, vi)}
                onRemoveAsset={(ai) => removeCustomAsset(gi, ai)}
              />
            ))}
          </AttrGroup>
        )}
      </div>
    </Tab>,
    <Tab text="Relations" key="relations">
      <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
        <Text>No relations</Text>
      </div>
    </Tab>,
  ]

  const [dictView, setDictView] = useState<'element' | 'dict'>('element')
  const [dictActiveTab, setDictActiveTab] = useState('Attributes')

  // dict-linked: custom layout matching design
  if (dictId) {
    const dictData: Record<string, { name: string; category: string; subCategory: string; description: string; version?: string; status?: string; lastUpdated?: string; updatedBy?: string; usedIn?: string[] }> = {
      'd27': { name: 'Evaluate CV', category: 'Activities', subCategory: 'HR Processes', description: 'Review and evaluate submitted curriculum vitae against job requirements', version: '2.3', status: 'published', lastUpdated: '10.03.2026', updatedBy: 'Sarah Chen' },
      'd28': { name: 'Plan interview', category: 'Activities', subCategory: 'HR Processes', description: 'Schedule and plan the candidate interview', version: '1.5', status: 'published', lastUpdated: '14.03.2026', updatedBy: 'HR Manager' },
      'd41': { name: 'ATS System', category: 'IT System', subCategory: 'HR Technology', description: 'Applicant Tracking System for managing recruitment workflow', version: '3.0', status: 'published', lastUpdated: '15.03.2026', updatedBy: 'IT Admin' },
      'd30': { name: 'Make offer', category: 'Activities', subCategory: 'HR Processes', description: 'Prepare and deliver formal job offer to selected candidate', version: '1.2', status: 'published', lastUpdated: '12.03.2026', updatedBy: 'HR Manager' },
      'd31': { name: 'Onboard candidate', category: 'Activities', subCategory: 'HR Processes', description: 'Complete onboarding process for new hire', version: '1.0', status: 'draft', lastUpdated: '14.03.2026', updatedBy: 'HR Manager' },
    }
    const dict = dictData[dictId]

    const CAT_ICON: Record<string, string> = {
      'Activities': 'SAP-icons-v4/task-activity',
      'IT System': 'SAP-icons-v4/computer',
      'Documents': 'document',
    }
    const CAT_COLOR: Record<string, string> = {}  // unused, using Avatar
    const catIconColor = '#6a2ee0'
    const catIcon = dict ? (CAT_ICON[dict.category] ?? 'document') : 'document'
    const catColor = dict ? (CAT_COLOR[dict.category] ?? 'var(--sapAvatar_6_Background)') : 'var(--sapAvatar_6_Background)'

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--sapGroup_ContentBackground, white)', overflow: 'hidden' }}>
        {/* Row 1: SegmentedButton + Open + X */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem 0.375rem', flexShrink: 0 }}>
          <SegmentedButton className="element-dict-toggle">
            <SegmentedButtonItem pressed={dictView === 'element'} icon="SAP-icons-v4/graph-unspecified" onClick={() => setDictView('element')}>Element</SegmentedButtonItem>
            <SegmentedButtonItem pressed={dictView === 'dict'} icon="course-book" onClick={() => setDictView('dict')}>Dictionary Entry</SegmentedButtonItem>
          </SegmentedButton>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {dictView === 'dict' && (
              <Button design="Emphasized" icon="SAP-icons-v4/link">Open</Button>
            )}
            <Button design="Transparent" icon="decline" onClick={onClose}
              style={{ '--_ui5_button_base_min_width': '2rem', width: '2rem', height: '2rem' } as React.CSSProperties} />
          </div>
        </div>

        {dictView === 'element' ? (
          <>
            {/* Row 2: type badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.75rem 1rem 0.5rem', flexShrink: 0 }}>
              <div style={{ width: 26, height: 26, borderRadius: 8, flexShrink: 0, background: typeColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={typeIcon} style={{ width: 14, height: 14, color: iconColor } as React.CSSProperties} />
              </div>
              <Text style={{ fontSize: 'var(--sapFontSize)', fontWeight: '700', color: 'var(--sapPageHeader_TextColor)', whiteSpace: 'nowrap' }}>{typeLabel}</Text>
            </div>
            {/* Row 3: element name */}
            <div style={{ padding: '0 1rem 1rem', flexShrink: 0 }}>
              <SigInlineEdit text={el.name} size="H3" level="H3" />
            </div>
            {/* Tabs */}
            <div className="element-detail-panel" style={{ boxShadow: '0 2px 4px rgba(34,53,72,0.06)', borderBottom: '1px solid var(--sapPageHeader_BorderColor, #d9d9d9)', flexShrink: 0 }}>
              <TabContainer onTabSelect={(e: any) => setActiveTab(e.detail?.tab?.text ?? 'Attributes')} style={{ width: '100%' } as React.CSSProperties}>
                <Tab text="Attributes" selected={activeTab === 'Attributes'} />
                <Tab text="Relations" selected={activeTab === 'Relations'} />
              </TabContainer>
            </div>
            {activeTab === 'Attributes' && (
              <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 16px' }}>
                <div style={{ marginBottom: 4 }}>
                  <Input placeholder="Search for attributes" type={'Search' as any} style={{ width: '100%' } as React.CSSProperties}>
                    <Icon slot="icon" name="search" />
                  </Input>
                </div>
                <AttrGroup title="Main Attributes" count={attrs.length + (el.description ? 1 : 0)}>
                  {el.description && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 0' }}>
                      <Label showColon style={{ color: 'var(--sapContent_LabelColor)' }}>Description</Label>
                      <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)', lineHeight: 1.4 }}>{el.description}</Text>
                      <Button design="Default" icon="edit" style={{ alignSelf: 'flex-start' } as React.CSSProperties} />
                    </div>
                  )}
                  {attrEntries.map(([label, values]) => {
                    const attrType = attrs.find(a => a.label === label)?.type
                    return (
                      <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 0' }}>
                        <Label showColon style={{ color: 'var(--sapContent_LabelColor)' }}>{label}</Label>
                        {attrType === 'boolean' ? <Switch checked={values[0] === 'true'} />
                          : <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                              {values.map((v, i) => attrType === 'select'
                                ? <SigChipV2 key={i} value={v} trailingIcon="slim-arrow-down" />
                                : <SigChipV2 key={i} value={v} endActionIcon="decline" onEndActionClick={() => {}} />
                              )}
                            </div>
                        }
                      </div>
                    )
                  })}
                </AttrGroup>
              </div>
            )}
            {activeTab === 'Relations' && (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                <Text>No relations</Text>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Dict Entry view */}
            {/* Row 2: dict category badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.75rem 1rem 0.5rem', flexShrink: 0 }}>
              <Avatar icon="course-book" colorScheme="Accent5" shape="Square" size="XS" style={{ flexShrink: 0 } as React.CSSProperties} />
              <Text style={{ fontSize: 'var(--sapFontSize)', fontWeight: '700', color: 'var(--sapPageHeader_TextColor)', whiteSpace: 'nowrap' }}>
                {dict?.category}{dict?.subCategory ? ` / ${dict.subCategory}` : ''}
              </Text>
            </div>
            {/* Row 3: dict entry name */}
            <div style={{ padding: '0.25rem 1rem 0.75rem', flexShrink: 0 }}>
              <Text style={{ fontSize: 'var(--sapFontHeader3Size)', fontWeight: 900, color: 'var(--sapPageHeader_TextColor)', display: 'block' }}>
                {dict?.name}
              </Text>
            </div>
            {/* Meta info */}
            {dict && (
              <div style={{ padding: '0 1rem 1rem', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                {[
                  { label: 'Latest Revision', value: dict.version, chip: dict.status },
                  { label: 'Last Updated', value: dict.lastUpdated },
                  { label: 'Updated by', value: dict.updatedBy },
                ].map(row => row.value && (
                  <div key={row.label} style={{ display: 'grid', gridTemplateColumns: '8rem 1fr', alignItems: 'center', minHeight: '1.75rem' }}>
                    <Label style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSize)' }}>{row.label}:</Label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)' }}>{row.value}</Text>
                      {row.chip && (
                        <SigChipV2
                          value={row.chip.charAt(0).toUpperCase() + row.chip.slice(1)}
                          design={row.chip === 'published' ? ('indication5' as any) : ('indication10' as any)}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* Tabs */}
            <div className="element-detail-panel" style={{ boxShadow: '0 2px 4px rgba(34,53,72,0.06)', borderBottom: '1px solid var(--sapPageHeader_BorderColor, #d9d9d9)', flexShrink: 0 }}>
              <TabContainer onTabSelect={(e: any) => setDictActiveTab(e.detail?.tab?.text ?? 'Attributes')} style={{ width: '100%' } as React.CSSProperties}>
                <Tab text="Attributes" selected={dictActiveTab === 'Attributes'} />
                <Tab text="Relations" selected={dictActiveTab === 'Relations'} />
              </TabContainer>
            </div>
            {dictActiveTab === 'Attributes' && (
              <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 16px' }}>
                <Input placeholder="Search for attributes" type={'Search' as any} style={{ width: '100%', marginBottom: 8 } as React.CSSProperties}>
                  <Icon slot="icon" name="search" />
                </Input>
                {dict?.description && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 0' }}>
                    <Label showColon style={{ color: 'var(--sapContent_LabelColor)' }}>Description</Label>
                    <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)', lineHeight: 1.5 }}>{dict.description}</Text>
                  </div>
                )}
              </div>
            )}
            {dictActiveTab === 'Relations' && (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                <Text>No relations defined.</Text>
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  return (
    <SigRightSidePanel
      headerTitle={el.name}
      editable
      editableTitlePlaceholder={el.name}
      isOpen
      toggleRightSidePanel={onClose}
      navigationSlot={[() => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 8, flexShrink: 0, background: typeColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={typeIcon} style={{ width: 14, height: 14, color: iconColor } as React.CSSProperties} />
          </div>
          <Text style={{ fontSize: 'var(--sapFontSize)', fontWeight: '700', color: 'var(--sapPageHeader_TextColor)', whiteSpace: 'nowrap' }}>{typeLabel}</Text>
        </div>
      )]}
      contentActionsSlot={[]}
      subHeaderSlot={[]}
      tabSlot={tabs}
      style={{ width: '100%', maxWidth: 'none', height: '100%', overflow: 'hidden', background: 'var(--sapList_Background)', position: 'relative' }}
    >
      {''}
    </SigRightSidePanel>
  )
}
