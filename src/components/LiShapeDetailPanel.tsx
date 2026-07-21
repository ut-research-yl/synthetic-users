import React, { useState } from 'react'
import { Button, Icon, Input, Label, Select, Option, TabContainer, Tab, Text } from '@ui5/webcomponents-react'
import { SigChipV2, SigInlineEdit } from '@signavio/sap-signavio-uixtension'
import type { LiShape } from '../pages/ModelerApp'

type Props = {
  shape: LiShape
  onClose: () => void
  onUpdate?: (id: string, changes: Partial<LiShape>) => void
}

const SHAPE_OPTIONS = [
  { value: 'Indicator',     label: 'Indicator',     icon: 'SAP-icons-v4/data-indicator' },
  { value: 'Value',         label: 'Value',         icon: 'record' },
  { value: 'Progress Bar',  label: 'Progress Bar',  icon: 'SAP-icons-v4/progress-bar' },
  { value: 'Trend',         label: 'Trend',         icon: 'SAP-icons-v4/data-trend' },
  { value: 'Ring Chart',    label: 'Ring Chart',    icon: 'SAP-icons-v4/ring-chart' },
  { value: 'Traffic Light', label: 'Traffic Light', icon: 'SAP-icons-v4/traffic-light' },
  { value: 'Cockpit',       label: 'Cockpit',       icon: 'SAP-icons-v4/gauge-cockpit' },
  { value: 'Sentiment',     label: 'Sentiment',     icon: 'SAP-icons-v4/emotion-positive' },
]

const SHAPE_TYPE_ICON: Record<string, string> = {
  'Indicator':     'SAP-icons-v4/data-indicator',
  'Value':         'record',
  'Progress Bar':  'SAP-icons-v4/progress-bar',
  'Trend':         'SAP-icons-v4/data-trend',
  'Ring Chart':    'SAP-icons-v4/ring-chart',
  'Traffic Light': 'SAP-icons-v4/traffic-light',
  'Cockpit':       'SAP-icons-v4/gauge-cockpit',
  'Sentiment':     'SAP-icons-v4/emotion-positive',
}

const STATUS_OPTIONS = ['Green', 'Yellow', 'Red', 'No data']

const WIDGET_ID_TO_CHART_ICON: Record<string, string> = {
  'value':      'SAP-icons-v4/number',
  'bar':        'bar-chart',
  'line':       'line-chart',
  'area':       'area-chart',
  'dual':       'line-chart-dual-axis',
  'pie':        'pie-chart',
  'treemap':    'Chart-Tree-Map',
  'heat':       'heatmap-chart',
  'sankey':     'SAP-icons-v4/graph-sankey',
  'hist':       'SAP-icons-v4/graph-histogram',
  'ring':       'SAP-icons-v4/ring-chart',
  'cockpit':    'SAP-icons-v4/gauge-cockpit',
  'sentiment':  'SAP-icons-v4/emotion-positive',
  'ext':        'SAP-icons-v4/link',
}

export default function LiShapeDetailPanel({ shape, onClose, onUpdate }: Props) {
  const [activeTab, setActiveTab] = useState('Attributes')
  const [manualValue, setManualValue] = useState(shape.manualValue ?? 'No data')
  const [shapeType, setShapeType] = useState(shape.shapeType)
  const [additionalWidgets, setAdditionalWidgets] = useState<string[]>([])

  const currentShapeIcon = SHAPE_TYPE_ICON[shapeType] ?? 'SAP-icons-v4/data-indicator'
  const prefix = shape.widgetId.split('-')[0]
  const chartIcon = WIDGET_ID_TO_CHART_ICON[prefix] ?? 'SAP-icons-v4/data-indicator'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--sapGroup_ContentBackground, white)', overflow: 'hidden' }}>

      {/* ── Header ── */}
      <div style={{ flexShrink: 0, background: 'var(--sapBaseColor, white)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px 16px 8px' }}>
          <div style={{
            width: 26, height: 26, borderRadius: 8, flexShrink: 0,
            background: 'var(--sapAvatar_6_Background, #d1efff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name={currentShapeIcon} style={{ width: 14, height: 14, color: '#0064d9' } as React.CSSProperties} />
          </div>
          <Text style={{ fontSize: 'var(--sapFontSize)', fontWeight: '700', color: 'var(--sapPageHeader_TextColor)', whiteSpace: 'nowrap', flex: 1 }}>
            {shapeType}
          </Text>
          <Button design="Transparent" icon="decline" onClick={onClose} />
        </div>
        <div style={{ padding: '4px 16px 16px' }}>
          <SigInlineEdit text={shape.widgetName} size="H3" level="H3" />
        </div>
        <div className="element-detail-panel" style={{ boxShadow: '0 2px 4px rgba(34,53,72,0.08)', borderBottom: '1px solid var(--sapPageHeader_BorderColor, #d9d9d9)' }}>
          <TabContainer
            onTabSelect={(e: any) => setActiveTab(e.detail?.tab?.text ?? 'Attributes')}
            style={{ width: '100%' } as React.CSSProperties}
          >
            <Tab text="Attributes" selected={activeTab === 'Attributes'} />
            <Tab text="Relations"  selected={activeTab === 'Relations'}  />
            <Tab text="Comments"   selected={activeTab === 'Comments'}   />
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
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 0' }}>
              <Button
                design="Transparent"
                icon="slim-arrow-down"
                style={{ '--_ui5_button_base_min_width': '24px', '--_ui5_button_base_height': '24px', padding: 0 } as React.CSSProperties}
              />
              <Text style={{ fontWeight: 700, fontSize: 'var(--sapFontHeader6Size)', color: 'var(--sapPageHeader_TextColor)' } as React.CSSProperties}>
                Main Attributes (4)
              </Text>
            </div>

            {/* Documentation */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 0' }}>
              <Label showColon style={{ color: 'var(--sapContent_LabelColor)' }}>Documentation</Label>
              <Button design="Default" icon="edit" style={{ alignSelf: 'flex-start' } as React.CSSProperties} />
            </div>

            {/* Element Type */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 0' }}>
              <Label showColon style={{ color: 'var(--sapContent_LabelColor)' }}>Element Type</Label>
              <Select
                style={{ width: 'fit-content', minWidth: 140 } as React.CSSProperties}
                onChange={(e: any) => {
                  const val = e.detail?.selectedOption?.dataset?.value ?? shape.shapeType
                  setShapeType(val)
                  onUpdate?.(shape.id, { shapeType: val })
                }}
              >
                {SHAPE_OPTIONS.map(t => (
                  <Option key={t.value} data-value={t.value} icon={t.icon} selected={shapeType === t.value}>
                    {t.label}
                  </Option>
                ))}
              </Select>
            </div>

            {/* Manual value */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 0' }}>
              <Label showColon style={{ color: 'var(--sapContent_LabelColor)' }}>Manual value</Label>
              <Select
                style={{ width: 'fit-content', minWidth: 120 } as React.CSSProperties}
                onChange={(e: any) => setManualValue(e.detail?.selectedOption?.dataset?.value ?? 'No data')}
              >
                {STATUS_OPTIONS.map(s => (
                  <Option key={s} data-value={s} selected={manualValue === s}>{s}</Option>
                ))}
              </Select>
            </div>

            {/* Driving widget */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 0' }}>
              <Label showColon style={{ color: 'var(--sapContent_LabelColor)' }}>Driving widget</Label>
              {shape.widgetId ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    background: 'var(--sapAvatar_6_Background, #d1efff)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon name={chartIcon} style={{ width: 16, height: 16, color: '#0064d9' } as React.CSSProperties} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ fontWeight: 700, fontSize: 'var(--sapFontSize)', color: 'var(--sapList_TextColor, #1d2d3e)', display: 'block' } as React.CSSProperties}>
                      {shape.widgetName}
                    </Text>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    <Button design="Transparent" icon="SAP-icons-v4/link" />
                    <Button design="Transparent" icon="decline" />
                  </div>
                </div>
              ) : (
                <Button design="Default" icon="add" style={{ alignSelf: 'flex-start' } as React.CSSProperties} />
              )}
            </div>

            {/* Additional widgets */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 0' }}>
              <Label showColon style={{ color: 'var(--sapContent_LabelColor)' }}>Additional widgets</Label>
              {additionalWidgets.map((w, i) => (
                <SigChipV2 key={i} value={w} endActionIcon="decline"
                  onEndActionClick={() => setAdditionalWidgets(prev => prev.filter((_, vi) => vi !== i))}
                  style={{ width: 'fit-content' } as React.CSSProperties}
                />
              ))}
              <Button design="Default" icon="add" style={{ alignSelf: 'flex-start' } as React.CSSProperties} />
            </div>

          </div>
        </div>
      )}

      {activeTab === 'Relations' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          <Text style={{ color: 'var(--sapContent_LabelColor)' }}>No relations</Text>
        </div>
      )}

      {activeTab === 'Comments' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          <Text style={{ color: 'var(--sapContent_LabelColor)' }}>No comments</Text>
        </div>
      )}
    </div>
  )
}
