import React, { useState, useRef, useEffect } from 'react'
import { Button, Icon, Input, Label, Select, Option, TabContainer, Tab, Text } from '@ui5/webcomponents-react'
import { SigChipV2, SigInlineEdit } from '@signavio/sap-signavio-uixtension'
import type { LiShape } from '../pages/ModelerApp'
import ConnectWidgetDialog from './ConnectWidgetDialog'
import ConnectWidgetSearchDialog from './ConnectWidgetSearchDialog'

const WIDGET_MOCK: Record<string, { value: string; label: string; trend: string; trendColor: string; chartSvg: string }> = {
  'value-D-001': { value: '4,218', label: 'Total Cases',      trend: '↑ 12.3%', trendColor: '#27a65a', chartSvg: '<svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg"><text x="200" y="75" text-anchor="middle" font-size="52" font-weight="700" fill="#0064d9" font-family="72,Arial">4,218</text><text x="200" y="105" text-anchor="middle" font-size="13" fill="#556b82" font-family="72,Arial">Total Cases</text><line x1="80" y1="130" x2="320" y2="130" stroke="#e8ecf0" stroke-width="1.5"/><rect x="148" y="148" width="12" height="12" rx="2" fill="#27a65a"/><text x="166" y="159" font-size="13" fill="#27a65a" font-family="72,Arial" font-weight="600">↑ 12.3%</text><text x="200" y="185" text-anchor="middle" font-size="11" fill="#8c9bab" font-family="72,Arial">vs. last period</text></svg>' },
  'value-D-002': { value: '1,042', label: 'Open Cases',       trend: '↓ 3.1%',  trendColor: '#BB0000', chartSvg: '<svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg"><text x="200" y="75" text-anchor="middle" font-size="52" font-weight="700" fill="#0064d9" font-family="72,Arial">1,042</text><text x="200" y="105" text-anchor="middle" font-size="13" fill="#556b82" font-family="72,Arial">Open Cases</text><line x1="80" y1="130" x2="320" y2="130" stroke="#e8ecf0" stroke-width="1.5"/><rect x="148" y="148" width="12" height="12" rx="2" fill="#BB0000"/><text x="166" y="159" font-size="13" fill="#BB0000" font-family="72,Arial" font-weight="600">↓ 3.1%</text><text x="200" y="185" text-anchor="middle" font-size="11" fill="#8c9bab" font-family="72,Arial">vs. last period</text></svg>' },
  'value-D-003': { value: '892',   label: 'Resolved Cases',   trend: '↑ 8.7%',  trendColor: '#27a65a', chartSvg: '<svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg"><text x="200" y="75" text-anchor="middle" font-size="52" font-weight="700" fill="#0064d9" font-family="72,Arial">892</text><text x="200" y="105" text-anchor="middle" font-size="13" fill="#556b82" font-family="72,Arial">Resolved Cases</text><line x1="80" y1="130" x2="320" y2="130" stroke="#e8ecf0" stroke-width="1.5"/><rect x="148" y="148" width="12" height="12" rx="2" fill="#27a65a"/><text x="166" y="159" font-size="13" fill="#27a65a" font-family="72,Arial" font-weight="600">↑ 8.7%</text><text x="200" y="185" text-anchor="middle" font-size="11" fill="#8c9bab" font-family="72,Arial">vs. last period</text></svg>' },
  'value-D-004': { value: '94.2%', label: 'SLA Compliance',   trend: '↓ 1.2%',  trendColor: '#E9730C', chartSvg: '<svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg"><text x="200" y="75" text-anchor="middle" font-size="52" font-weight="700" fill="#0064d9" font-family="72,Arial">94.2%</text><text x="200" y="105" text-anchor="middle" font-size="13" fill="#556b82" font-family="72,Arial">SLA Compliance</text><line x1="80" y1="130" x2="320" y2="130" stroke="#e8ecf0" stroke-width="1.5"/><rect x="148" y="148" width="12" height="12" rx="2" fill="#E9730C"/><text x="166" y="159" font-size="13" fill="#E9730C" font-family="72,Arial" font-weight="600">↓ 1.2%</text><text x="200" y="185" text-anchor="middle" font-size="11" fill="#8c9bab" font-family="72,Arial">vs. last period</text></svg>' },
  'value-D-005': { value: '3,156', label: 'Processed Items',  trend: '↑ 5.4%',  trendColor: '#27a65a', chartSvg: '<svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg"><text x="200" y="75" text-anchor="middle" font-size="52" font-weight="700" fill="#0064d9" font-family="72,Arial">3,156</text><text x="200" y="105" text-anchor="middle" font-size="13" fill="#556b82" font-family="72,Arial">Processed Items</text><line x1="80" y1="130" x2="320" y2="130" stroke="#e8ecf0" stroke-width="1.5"/><rect x="148" y="148" width="12" height="12" rx="2" fill="#27a65a"/><text x="166" y="159" font-size="13" fill="#27a65a" font-family="72,Arial" font-weight="600">↑ 5.4%</text><text x="200" y="185" text-anchor="middle" font-size="11" fill="#8c9bab" font-family="72,Arial">vs. last period</text></svg>' },
  'value-D-006': { value: '87.5%', label: 'Success Rate',     trend: '↓ 2.8%',  trendColor: '#E9730C', chartSvg: '<svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg"><text x="200" y="75" text-anchor="middle" font-size="52" font-weight="700" fill="#0064d9" font-family="72,Arial">87.5%</text><text x="200" y="105" text-anchor="middle" font-size="13" fill="#556b82" font-family="72,Arial">Success Rate</text><line x1="80" y1="130" x2="320" y2="130" stroke="#e8ecf0" stroke-width="1.5"/><rect x="148" y="148" width="12" height="12" rx="2" fill="#E9730C"/><text x="166" y="159" font-size="13" fill="#E9730C" font-family="72,Arial" font-weight="600">↓ 2.8%</text><text x="200" y="185" text-anchor="middle" font-size="11" fill="#8c9bab" font-family="72,Arial">vs. last period</text></svg>' },
  'value-I-001': { value: '2,847', label: 'Active Cases',     trend: '↑ 12.3%', trendColor: '#27a65a', chartSvg: '<svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg"><text x="200" y="75" text-anchor="middle" font-size="52" font-weight="700" fill="#0064d9" font-family="72,Arial">2,847</text><text x="200" y="105" text-anchor="middle" font-size="13" fill="#556b82" font-family="72,Arial">Active Cases</text><line x1="80" y1="130" x2="320" y2="130" stroke="#e8ecf0" stroke-width="1.5"/><rect x="148" y="148" width="12" height="12" rx="2" fill="#27a65a"/><text x="166" y="159" font-size="13" fill="#27a65a" font-family="72,Arial" font-weight="600">↑ 12.3%</text><text x="200" y="185" text-anchor="middle" font-size="11" fill="#8c9bab" font-family="72,Arial">vs. last period</text></svg>' },
  'value-I-002': { value: '28.5d', label: 'Avg. Duration',    trend: '↓ 4.2%',  trendColor: '#BB0000', chartSvg: '<svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg"><text x="200" y="75" text-anchor="middle" font-size="52" font-weight="700" fill="#0064d9" font-family="72,Arial">28.5d</text><text x="200" y="105" text-anchor="middle" font-size="13" fill="#556b82" font-family="72,Arial">Avg. Duration</text><line x1="80" y1="130" x2="320" y2="130" stroke="#e8ecf0" stroke-width="1.5"/><rect x="148" y="148" width="12" height="12" rx="2" fill="#BB0000"/><text x="166" y="159" font-size="13" fill="#BB0000" font-family="72,Arial" font-weight="600">↓ 4.2%</text><text x="200" y="185" text-anchor="middle" font-size="11" fill="#8c9bab" font-family="72,Arial">vs. last period</text></svg>' },
  'ext-001':     { value: '92.4%', label: 'Efficiency Score', trend: '↑ 1.8%',  trendColor: '#27a65a', chartSvg: '<svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg"><text x="200" y="75" text-anchor="middle" font-size="52" font-weight="700" fill="#0064d9" font-family="72,Arial">92.4%</text><text x="200" y="105" text-anchor="middle" font-size="13" fill="#556b82" font-family="72,Arial">Efficiency Score</text><line x1="80" y1="130" x2="320" y2="130" stroke="#e8ecf0" stroke-width="1.5"/><rect x="148" y="148" width="12" height="12" rx="2" fill="#27a65a"/><text x="166" y="159" font-size="13" fill="#27a65a" font-family="72,Arial" font-weight="600">↑ 1.8%</text><text x="200" y="185" text-anchor="middle" font-size="11" fill="#8c9bab" font-family="72,Arial">vs. last period</text></svg>' },
  'ext-002':     { value: '€1.2M', label: 'Total Value',      trend: '↓ 0.5%',  trendColor: '#E9730C', chartSvg: '<svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg"><text x="200" y="75" text-anchor="middle" font-size="52" font-weight="700" fill="#0064d9" font-family="72,Arial">€1.2M</text><text x="200" y="105" text-anchor="middle" font-size="13" fill="#556b82" font-family="72,Arial">Total Value</text><line x1="80" y1="130" x2="320" y2="130" stroke="#e8ecf0" stroke-width="1.5"/><rect x="148" y="148" width="12" height="12" rx="2" fill="#E9730C"/><text x="166" y="159" font-size="13" fill="#E9730C" font-family="72,Arial" font-weight="600">↓ 0.5%</text><text x="200" y="185" text-anchor="middle" font-size="11" fill="#8c9bab" font-family="72,Arial">vs. last period</text></svg>' },
  'ext-003':     { value: '74.1%', label: 'Completion Rate',  trend: '↓ 3.3%',  trendColor: '#E9730C', chartSvg: '<svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg"><text x="200" y="75" text-anchor="middle" font-size="52" font-weight="700" fill="#0064d9" font-family="72,Arial">74.1%</text><text x="200" y="105" text-anchor="middle" font-size="13" fill="#556b82" font-family="72,Arial">Completion Rate</text><line x1="80" y1="130" x2="320" y2="130" stroke="#e8ecf0" stroke-width="1.5"/><rect x="148" y="148" width="12" height="12" rx="2" fill="#E9730C"/><text x="166" y="159" font-size="13" fill="#E9730C" font-family="72,Arial" font-weight="600">↓ 3.3%</text><text x="200" y="185" text-anchor="middle" font-size="11" fill="#8c9bab" font-family="72,Arial">vs. last period</text></svg>' },
  'ext-004':     { value: '1,540', label: 'Volume',           trend: '↑ 9.1%',  trendColor: '#BB0000', chartSvg: '<svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg"><text x="200" y="75" text-anchor="middle" font-size="52" font-weight="700" fill="#0064d9" font-family="72,Arial">1,540</text><text x="200" y="105" text-anchor="middle" font-size="13" fill="#556b82" font-family="72,Arial">Volume</text><line x1="80" y1="130" x2="320" y2="130" stroke="#e8ecf0" stroke-width="1.5"/><rect x="148" y="148" width="12" height="12" rx="2" fill="#BB0000"/><text x="166" y="159" font-size="13" fill="#BB0000" font-family="72,Arial" font-weight="600">↑ 9.1%</text><text x="200" y="185" text-anchor="middle" font-size="11" fill="#8c9bab" font-family="72,Arial">vs. last period</text></svg>' },
  'ext-005':     { value: '8,310', label: 'Total Count',      trend: '↑ 6.7%',  trendColor: '#27a65a', chartSvg: '<svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg"><text x="200" y="75" text-anchor="middle" font-size="52" font-weight="700" fill="#0064d9" font-family="72,Arial">8,310</text><text x="200" y="105" text-anchor="middle" font-size="13" fill="#556b82" font-family="72,Arial">Total Count</text><line x1="80" y1="130" x2="320" y2="130" stroke="#e8ecf0" stroke-width="1.5"/><rect x="148" y="148" width="12" height="12" rx="2" fill="#27a65a"/><text x="166" y="159" font-size="13" fill="#27a65a" font-family="72,Arial" font-weight="600">↑ 6.7%</text><text x="200" y="185" text-anchor="middle" font-size="11" fill="#8c9bab" font-family="72,Arial">vs. last period</text></svg>' },
}

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
  const [widgetId, setWidgetId] = useState(shape.widgetId)
  const [additionalWidgets, setAdditionalWidgets] = useState<string[]>([])
  const [previewOpen, setPreviewOpen] = useState(false)
  const previewAnchorRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const [previewTop, setPreviewTop] = useState(0)
  const [connectDialogOpen, setConnectDialogOpen] = useState(false)
  const [searchDialogOpen, setSearchDialogOpen] = useState(false)

  useEffect(() => {
    if (!previewOpen) return
    function handleClick(e: MouseEvent) {
      if (
        previewRef.current && !previewRef.current.contains(e.target as Node) &&
        previewAnchorRef.current && !previewAnchorRef.current.contains(e.target as Node)
      ) {
        setPreviewOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [previewOpen])

  const currentShapeIcon = SHAPE_TYPE_ICON[shapeType] ?? 'SAP-icons-v4/data-indicator'
  const prefix = widgetId.split('-')[0]
  const chartIcon = WIDGET_ID_TO_CHART_ICON[prefix] ?? 'SAP-icons-v4/data-indicator'

  return (
    <div ref={panelRef} style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--sapGroup_ContentBackground, white)', overflow: 'hidden', position: 'relative' }}>

      {/* ── Header ── */}
      <div style={{ flexShrink: 0, background: 'var(--sapBaseColor, white)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 1rem 0.5rem' }}>
          <div style={{
            width: '1.625rem', height: '1.625rem', borderRadius: '0.5rem', flexShrink: 0,
            background: 'var(--sapAvatar_6_Background, #d1efff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name={currentShapeIcon} style={{ width: '0.875rem', height: '0.875rem', color: '#0064d9' } as React.CSSProperties} />
          </div>
          <Text style={{ fontSize: 'var(--sapFontSize)', fontWeight: '700', color: 'var(--sapPageHeader_TextColor)', whiteSpace: 'nowrap', flex: 1 }}>
            {shapeType}
          </Text>
          <Button design="Transparent" icon="decline" onClick={onClose} />
        </div>
        <div style={{ padding: '0.25rem 1rem 1rem' }}>
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
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 1rem 1rem' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 0' }}>
              <Button
                design="Transparent"
                icon="slim-arrow-down"
                style={{ '--_ui5_button_base_min_width': '1.5rem', '--_ui5_button_base_height': '1.5rem', padding: 0 } as React.CSSProperties}
              />
              <Text style={{ fontWeight: 700, fontSize: 'var(--sapFontHeader6Size)', color: 'var(--sapPageHeader_TextColor)' } as React.CSSProperties}>
                Main Attributes (4)
              </Text>
            </div>

            {/* Documentation */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', padding: '0.5rem 0' }}>
              <Label showColon style={{ color: 'var(--sapContent_LabelColor)' }}>Documentation</Label>
              <Button design="Default" icon="edit" style={{ alignSelf: 'flex-start' } as React.CSSProperties} />
            </div>

            {/* Element Type */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', padding: '0.5rem 0' }}>
              <Label showColon style={{ color: 'var(--sapContent_LabelColor)' }}>Element Type</Label>
              <Select
                style={{ width: 'fit-content', minWidth: '8.75rem' } as React.CSSProperties}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', padding: '0.5rem 0' }}>
              <Label showColon style={{ color: 'var(--sapContent_LabelColor)' }}>Manual value</Label>
              <Select
                style={{ width: 'fit-content', minWidth: '7.5rem' } as React.CSSProperties}
                onChange={(e: any) => {
                  const val = e.detail?.selectedOption?.dataset?.value ?? 'No data'
                  setManualValue(val)
                  onUpdate?.(shape.id, { manualValue: val })
                }}
              >
                {STATUS_OPTIONS.map(s => (
                  <Option key={s} data-value={s} selected={manualValue === s}>{s}</Option>
                ))}
              </Select>
            </div>

            {/* Driving widget */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', padding: '0.5rem 0' }}>
              <Label showColon style={{ color: 'var(--sapContent_LabelColor)' }}>Driving widget</Label>
              {widgetId ? (
                <>
                  <div style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0' }}>
                      <div style={{
                        width: '2rem', height: '2rem', borderRadius: '0.5rem', flexShrink: 0,
                        background: 'var(--sapAvatar_6_Background, #d1efff)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Icon name={chartIcon} style={{ width: '1rem', height: '1rem', color: '#0064d9' } as React.CSSProperties} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Text style={{ fontWeight: 700, fontSize: 'var(--sapFontSize)', color: 'var(--sapList_TextColor, #1d2d3e)', display: 'block' } as React.CSSProperties}>
                          {shape.widgetName}
                        </Text>
                      </div>
                      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                        <Button design="Transparent" icon="hint" ref={previewAnchorRef} onClick={() => {
                          if (!previewOpen && previewAnchorRef.current && panelRef.current) {
                            const anchorRect = previewAnchorRef.current.getBoundingClientRect()
                            const panelRect = panelRef.current.getBoundingClientRect()
                            setPreviewTop(anchorRect.bottom - panelRect.top)
                          }
                          setPreviewOpen(v => !v)
                        }} />
                        <Button design="Transparent" icon="SAP-icons-v4/link" />
                        <Button design="Transparent" icon="decline" onClick={() => {
                          setWidgetId('')
                          setManualValue('No data')
                          setPreviewOpen(false)
                          onUpdate?.(shape.id, { widgetId: '', manualValue: 'No data' })
                        }} />
                      </div>
                    </div>

                    {/* preview rendered at panel root level */}
                    <Button design="Default" icon="edit" style={{ alignSelf: 'flex-start' } as React.CSSProperties} onClick={() => setSearchDialogOpen(true)} />
                  </div>
                </>
              ) : (
                <Button design="Default" icon="add" style={{ alignSelf: 'flex-start' } as React.CSSProperties} onClick={() => setConnectDialogOpen(true)} />
              )}
            </div>

            {/* Additional widgets */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', padding: '0.5rem 0' }}>
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
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          <Text style={{ color: 'var(--sapContent_LabelColor)' }}>No relations</Text>
        </div>
      )}

      {activeTab === 'Comments' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          <Text style={{ color: 'var(--sapContent_LabelColor)' }}>No comments</Text>
        </div>
      )}

      {/* Widget preview overlay */}
      {previewOpen && widgetId && (() => {
        const mock = WIDGET_MOCK[widgetId]
        return (
          <div ref={previewRef} style={{
            position: 'absolute', top: previewTop + 4, right: 40, left: 'auto', width: 350,
            zIndex: 200,
            background: '#fff',
            border: '1px solid rgba(34,53,72,0.3)',
            borderRadius: 8,
            overflow: 'hidden',
            boxShadow: '0 4px 16px rgba(34,53,72,0.2)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.25rem', borderBottom: '1px solid var(--sapList_BorderColor, #d9d9d9)' }}>
              <div style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', background: 'var(--sapAvatar_6_Background, #d1efff)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name={chartIcon} style={{ width: '1rem', height: '1rem', color: '#0064d9' } as React.CSSProperties} />
              </div>
              <Text style={{ fontWeight: 700, fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor, #1d2d3e)', flex: 1 } as React.CSSProperties}>
                {shape.widgetName}
              </Text>
            </div>
            <div dangerouslySetInnerHTML={{ __html: mock?.chartSvg ?? '' }} />
            <div style={{ display: 'flex', height: '2.5rem', padding: '0.25rem', justifyContent: 'flex-end', alignItems: 'center', borderTop: '1px solid var(--sapList_BorderColor, #d9d9d9)' }}>
              <Button design="Emphasized" icon="SAP-icons-v4/link">Open</Button>
            </div>
          </div>
        )
      })()}

      {connectDialogOpen && (
        <ConnectWidgetDialog
          open={connectDialogOpen}
          onClose={() => setConnectDialogOpen(false)}
        />
      )}
      {searchDialogOpen && (
        <ConnectWidgetSearchDialog
          open={searchDialogOpen}
          shapeType={shapeType}
          currentWidgetId={widgetId || undefined}
          onConnect={(id, name) => {
            setWidgetId(id)
            setPreviewOpen(false)
            onUpdate?.(shape.id, { widgetId: id, widgetName: name })
          }}
          onClose={() => setSearchDialogOpen(false)}
        />
      )}
    </div>
  )
}
