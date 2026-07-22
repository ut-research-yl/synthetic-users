import React, { useState } from 'react'
import { Button, Icon, Input, Label, Switch, TabContainer, Tab, Text } from '@ui5/webcomponents-react'
import { SigChipV2, SigDomainObject, SigInlineEdit } from '@signavio/sap-signavio-uixtension'
import { elementData } from '../data/liveInsightsData'

type Props = {
  elementId: string
  onClose: () => void
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

export default function ElementDetailPanel({ elementId, onClose }: Props) {
  const [activeTab, setActiveTab] = useState('Attributes')
  const el = elementData[elementId]

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--sapGroup_ContentBackground, white)', overflow: 'hidden' }}>

      {/* ── Header ── */}
      <div style={{ flexShrink: 0, background: 'var(--sapBaseColor, white)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px 16px 8px' }}>
          <div style={{
            width: 26, height: 26, borderRadius: 8, flexShrink: 0,
            background: typeColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name={typeIcon} style={{ width: 14, height: 14, color: iconColor } as React.CSSProperties} />
          </div>
          <Text style={{ fontSize: 'var(--sapFontSize)', fontWeight: '700', color: 'var(--sapPageHeader_TextColor)', whiteSpace: 'nowrap', flex: 1 }}>{typeLabel}</Text>
          <Button design="Transparent" icon="decline" onClick={onClose} />
        </div>
        <div style={{ padding: '4px 16px 16px' }}>
          <SigInlineEdit text={el.name} size="H3" level="H3" />
        </div>
        <div className="element-detail-panel" style={{
          boxShadow: '0 2px 4px rgba(34,53,72,0.08)',
          borderBottom: '1px solid var(--sapPageHeader_BorderColor, #d9d9d9)',
        }}>
          <TabContainer
            onTabSelect={(e: any) => setActiveTab(e.detail?.tab?.text ?? 'Attributes')}
            style={{ width: '100%' } as React.CSSProperties}
          >
            <Tab text="Attributes" selected={activeTab === 'Attributes'} />
            <Tab text="Relations"  selected={activeTab === 'Relations'}  />
          </TabContainer>
        </div>
      </div>

      {/* ── Attributes tab ── */}
      {activeTab === 'Attributes' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 16px' }}>
          <div style={{ marginBottom: 4 }}>
            <Input
              placeholder="Search for attributes"
              type={'Search' as any}
              style={{ width: '100%' } as React.CSSProperties}
            >
              <Icon slot="icon" name="search" />
            </Input>
          </div>

          {/* ── Main Attributes ── */}
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

          {/* ── Custom Attributes ── */}
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
      )}

      {activeTab === 'Relations' && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
          <Text>No relations</Text>
        </div>
      )}
    </div>
  )
}
