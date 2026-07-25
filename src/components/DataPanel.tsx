import React, { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button, Icon, Input, MessageStrip, Text, Menu, MenuItem, Popover, List, ListItemStandard } from '@ui5/webcomponents-react'
import { SigChipV2 } from '@signavio/sap-signavio-uixtension'
import ConnectWidgetDialog from './ConnectWidgetDialog'
import AddExternalWidgetDialog from './AddExternalWidgetDialog'
import s from './DataPanel.module.css'

// ── Data hierarchy ────────────────────────────────────────────────────────────

type PageMap = Record<string, string[]>
type SectionMap = Record<string, { pages: PageMap }>
type ProcessData = { Investigation?: SectionMap; Dashboard?: SectionMap }

const CWD_DATA: Record<string, ProcessData> = {
  'Order to Cash': {
    Investigation: {
      'O2C Analysis':   { pages: { 'Overview': ['bar-chart-I-001','line-I-001','dual-I-001','value-I-001','ring-I-003'], 'Detail': ['treemap-I-001','hist-I-002','area-I-001'], 'Variants': ['sankey-I-002','treemap-I-001','dual-I-001'] } },
      'O2C Performance':{ pages: { 'KPIs': ['value-I-001','ring-I-003','value-D-005'], 'Trends': ['line-I-001','area-I-001','dual-I-001'] } },
    },
    Dashboard: {
      'Order to Cash Dashboard': { pages: { 'Overview': ['value-D-001','pie-D-001','value-D-005'], 'Comparisons': ['bar-chart-D-001','area-D-001','heat-D-001','dual-D-001'], 'Trends': ['line-D-001','area-D-001','dual-D-001'] } },
      'O2C Executive Summary':   { pages: { 'Overview': ['value-D-001','value-D-005','ring-D-001','pie-D-001'] } },
    },
  },
  'SAP O2C Onboarding': {
    Investigation: { 'Onboarding Analysis': { pages: { 'Main': ['bar-chart-I-002','ring-I-001','line-I-003','value-I-002'], 'Funnel': ['hist-I-001','bar-chart-I-002','area-I-001'] } } },
    Dashboard: {
      'Onboarding Dashboard': { pages: { 'Overview': ['bar-chart-D-002','value-D-002','pie-D-003','area-D-003'] } },
      'Onboarding KPIs':      { pages: { 'Summary': ['value-I-002','ring-I-001','bar-chart-D-002'] } },
    },
  },
  'Record to Report': {
    Investigation: { 'R2R Investigation': { pages: { 'Main': ['ring-I-002','line-I-002','dual-I-002','treemap-I-003'], 'Flow': ['sankey-I-001','bar-chart-I-001','area-I-001'] } } },
    Dashboard: {
      'R2R Dashboard':      { pages: { 'Summary': ['value-D-003','bar-chart-D-003','heat-D-003','pie-D-001'] } },
      'R2R Period Analysis':{ pages: { 'Overview': ['line-I-002','dual-I-002','area-I-001'], 'Details': ['treemap-I-003','ring-I-002','value-D-003'] } },
    },
  },
  'Plan to Produce': {
    Investigation: { 'P2P Analysis': { pages: { 'Overview': ['bar-chart-D-004','ring-D-001','value-D-004'], 'Performance': ['dual-D-002','treemap-I-002','area-D-002'] } } },
    Dashboard: {
      'P2P Dashboard':          { pages: { 'Overview': ['pie-D-002','heat-D-002','value-D-004','ring-D-001'], 'Trends': ['area-D-002','line-D-002','dual-D-002'], 'Performance': ['treemap-I-002','value-D-004','bar-chart-D-004'] } },
      'Production KPIs':        { pages: { 'Summary': ['value-D-004','ring-D-001','bar-chart-D-004'], 'Trends': ['dual-D-002','line-D-002','area-D-002'] } },
      'Supply Chain Overview':  { pages: { 'Overview': ['pie-D-002','heat-D-002','treemap-I-002','ring-D-001'] } },
    },
  },
  'Procure to Pay': {
    Investigation: {
      'P2P Analysis':    { pages: { 'Overview': ['bar-chart-I-001','line-I-001','value-I-001'], 'Detail': ['hist-I-002','dual-I-001','area-I-001'] } },
      'Supplier Analysis':{ pages: { 'Overview': ['treemap-I-001','ring-I-003','bar-chart-I-001'] } },
    },
    Dashboard: {
      'Procurement Dashboard': { pages: { 'Overview': ['value-D-001','pie-D-001','bar-chart-D-001'], 'Trends': ['line-D-001','area-D-001','dual-D-001'] } },
      'Supplier Dashboard':    { pages: { 'Overview': ['heat-D-001','bar-chart-D-003','ring-D-001'] } },
    },
  },
  'Hire to Retire': {
    Investigation: {
      'HR Analysis':        { pages: { 'Overview': ['ring-I-001','bar-chart-I-002','value-I-002'], 'Flow': ['sankey-I-001','hist-I-001','dual-I-002'] } },
      'Headcount Analysis': { pages: { 'Overview': ['treemap-I-003','line-I-003','area-I-001'] } },
    },
    Dashboard: {
      'HR Dashboard':      { pages: { 'Overview': ['value-D-002','bar-chart-D-002','ring-I-001'], 'Trends': ['line-I-002','area-D-003','dual-I-001'] } },
      'Recruitment KPIs':  { pages: { 'Summary': ['value-I-002','ring-I-001','bar-chart-I-002','pie-D-003'] } },
    },
  },
}

// ── Widget types ──────────────────────────────────────────────────────────────

export type WidgetType = 'Value' | 'Bar Chart' | 'Line Chart' | 'Area Chart' | 'Dual Axis Chart' | 'Pie Chart' | 'Treemap' | 'Heat Map' | 'Sankey Chart' | 'Histogram'

export type Widget = { id: string; name: string; type: WidgetType; process?: string; source?: string }

export type ExternalWidget = { id: string; name: string; source: string; url: string; shapeType?: string }

const WIDGETS: Widget[] = [
  { id: 'value-I-001',     name: 'Active Cases',              type: 'Value',           process: 'Order to Cash',  source: 'O2C Performance' },
  { id: 'value-I-002',     name: 'Avg Onboarding Days',       type: 'Value',           process: 'HR Onboarding',  source: 'Onboarding KPIs' },
  { id: 'value-D-001',     name: 'Total Orders',              type: 'Value',           process: 'Procure to Pay', source: 'Procurement Dashboard' },
  { id: 'value-D-002',     name: 'Active Cases',              type: 'Value',           process: 'Incident Mgmt',  source: 'Incident Dashboard' },
  { id: 'value-D-003',     name: 'Closed Items',              type: 'Value',           process: 'Finance Close',  source: 'R2R Dashboard' },
  { id: 'value-D-004',     name: 'On-Time Delivery Rate',     type: 'Value',           process: 'Production',     source: 'Production KPIs' },
  { id: 'bar-chart-I-001', name: 'Case Volume by Region',     type: 'Bar Chart',       process: 'Order to Cash',  source: 'O2C Analysis' },
  { id: 'bar-chart-I-002', name: 'Onboarding Duration',       type: 'Bar Chart',       process: 'HR Onboarding',  source: 'Onboarding Analysis' },
  { id: 'bar-chart-D-001', name: 'Customer Count by Country', type: 'Bar Chart',       process: 'Procure to Pay', source: 'Procurement Dashboard' },
  { id: 'bar-chart-D-002', name: 'Throughput by Team',        type: 'Bar Chart',       process: 'Incident Mgmt',  source: 'Incident Dashboard' },
  { id: 'bar-chart-D-003', name: 'Posting Volume by Period',  type: 'Bar Chart',       process: 'Finance Close',  source: 'R2R Dashboard' },
  { id: 'bar-chart-D-004', name: 'Production Volume',         type: 'Bar Chart',       process: 'Production',     source: 'P2P Dashboard' },
  { id: 'bar-chart-D-005', name: 'Rejection Rate by Step',    type: 'Bar Chart',       process: 'Order to Cash',  source: 'O2C Executive Summary' },
  { id: 'line-I-001',      name: 'Throughput Time Trend',     type: 'Line Chart',      process: 'Order to Cash',  source: 'O2C Analysis' },
  { id: 'line-I-002',      name: 'Period Comparison',         type: 'Line Chart',      process: 'Finance Close',  source: 'R2R Period Analysis' },
  { id: 'line-I-003',      name: 'Step Duration Trend',       type: 'Line Chart',      process: 'HR Onboarding',  source: 'Onboarding Analysis' },
  { id: 'line-I-004',      name: 'Monthly KPI Trend',         type: 'Line Chart',      process: 'Finance Close',  source: 'R2R Dashboard' },
  { id: 'area-I-001',      name: 'Volume over Time',          type: 'Area Chart',      process: 'Order to Cash',  source: 'O2C Analysis' },
  { id: 'area-D-001',      name: 'Monthly Volume',            type: 'Area Chart',      process: 'Procure to Pay', source: 'Procurement Dashboard' },
  { id: 'area-D-002',      name: 'Monthly Events',            type: 'Area Chart',      process: 'Production',     source: 'P2P Dashboard' },
  { id: 'area-D-003',      name: 'Weekly Trends',             type: 'Area Chart',      process: 'Incident Mgmt',  source: 'Incident Dashboard' },
  { id: 'dual-I-001',      name: 'Cycle Time vs Volume',      type: 'Dual Axis Chart', process: 'Order to Cash',  source: 'O2C Analysis' },
  { id: 'dual-I-002',      name: 'Ledger Balance vs Entries', type: 'Dual Axis Chart', process: 'Finance Close',  source: 'R2R Period Analysis' },
  { id: 'dual-D-002',      name: 'Plan vs Actual',            type: 'Dual Axis Chart', process: 'Production',     source: 'Production KPIs' },
  { id: 'pie-D-001',       name: 'Order Distribution',        type: 'Pie Chart',       process: 'Procure to Pay', source: 'Procurement Dashboard' },
  { id: 'pie-D-002',       name: 'Case Distribution',         type: 'Pie Chart',       process: 'Incident Mgmt',  source: 'Incident Dashboard' },
  { id: 'pie-D-003',       name: 'Status Breakdown',          type: 'Pie Chart',       process: 'Incident Mgmt',  source: 'Incident Dashboard' },
  { id: 'treemap-I-001',   name: 'Process Variants',          type: 'Treemap',         process: 'Order to Cash',  source: 'O2C Analysis' },
  { id: 'treemap-I-002',   name: 'Production Category Mix',   type: 'Treemap',         process: 'Production',     source: 'Supply Chain Overview' },
  { id: 'treemap-I-003',   name: 'Account Category Mix',      type: 'Treemap',         process: 'Finance Close',  source: 'R2R Dashboard' },
  { id: 'heat-D-001',      name: 'Bottleneck Heatmap',        type: 'Heat Map',        process: 'Procure to Pay', source: 'Supplier Dashboard' },
  { id: 'heat-D-002',      name: 'Delay Heatmap',             type: 'Heat Map',        process: 'Incident Mgmt',  source: 'Incident Dashboard' },
  { id: 'heat-D-003',      name: 'Period Heatmap',            type: 'Heat Map',        process: 'Finance Close',  source: 'R2R Dashboard' },
  { id: 'sankey-I-001',    name: 'Process Flow Sankey',       type: 'Sankey Chart',    process: 'Finance Close',  source: 'R2R Investigation' },
  { id: 'sankey-I-002',    name: 'Variant Flow Analysis',     type: 'Sankey Chart',    process: 'Order to Cash',  source: 'O2C Analysis' },
  { id: 'sankey-I-003',    name: 'Handover Analysis',         type: 'Sankey Chart',    process: 'HR Onboarding',  source: 'HR Analysis' },
  { id: 'hist-I-001',      name: 'Case Duration Distribution',type: 'Histogram',       process: 'HR Onboarding',  source: 'Onboarding Analysis' },
  { id: 'hist-I-002',      name: 'Case Duration Spread',      type: 'Histogram',       process: 'Order to Cash',  source: 'O2C Analysis' },
  { id: 'hist-I-003',      name: 'Lead Time Distribution',    type: 'Histogram',       process: 'Procure to Pay', source: 'P2P Analysis' },
  { id: 'value-D-005',     name: 'Avg Cycle Time',            type: 'Value',           process: 'Order to Cash',  source: 'O2C Performance' },
  { id: 'bar-chart-D-006', name: 'Automation Rate by Step',   type: 'Bar Chart',       process: 'Finance Close',  source: 'R2R Dashboard' },
  { id: 'line-I-005',      name: 'Case Volume Trend',         type: 'Line Chart',      process: 'Incident Mgmt',  source: 'Incident Dashboard' },
  { id: 'area-D-004',      name: 'Cost over Time',            type: 'Area Chart',      process: 'Procure to Pay', source: 'Procurement Dashboard' },
  { id: 'dual-I-003',      name: 'Cost vs Throughput',        type: 'Dual Axis Chart', process: 'Finance Close',  source: 'R2R Period Analysis' },
  { id: 'pie-D-004',       name: 'Resource Distribution',     type: 'Pie Chart',       process: 'HR Onboarding',  source: 'Recruitment KPIs' },
  { id: 'treemap-I-004',   name: 'Variant Category Mix',      type: 'Treemap',         process: 'Incident Mgmt',  source: 'Incident Dashboard' },
  { id: 'heat-D-004',      name: 'Step Duration Heatmap',     type: 'Heat Map',        process: 'Order to Cash',  source: 'O2C Analysis' },
  { id: 'sankey-I-004',    name: 'Resource Flow Analysis',    type: 'Sankey Chart',    process: 'Production',     source: 'P2P Analysis' },
  { id: 'hist-I-004',      name: 'Rework Duration Spread',    type: 'Histogram',       process: 'Finance Close',  source: 'R2R Investigation' },
  { id: 'value-D-006',     name: 'SLA Compliance Rate',       type: 'Value',           process: 'Incident Mgmt',  source: 'Incident Dashboard' },
  { id: 'cockpit-I-001',  name: 'Process Health Score',      type: 'Value',           process: 'Order to Cash',  source: 'O2C Performance' },
  { id: 'cockpit-I-002',  name: 'Onboarding Quality Index',  type: 'Value',           process: 'HR Onboarding',  source: 'Onboarding KPIs' },
  { id: 'cockpit-D-001',  name: 'Supplier Performance',      type: 'Value',           process: 'Procure to Pay', source: 'Procurement Dashboard' },
  { id: 'sentiment-I-001',name: 'Customer Satisfaction',     type: 'Histogram',       process: 'Order to Cash',  source: 'O2C Performance' },
  { id: 'sentiment-I-002',name: 'Employee Satisfaction',     type: 'Histogram',       process: 'HR Onboarding',  source: 'Onboarding KPIs' },
  { id: 'sentiment-D-001',name: 'Vendor Satisfaction',       type: 'Histogram',       process: 'Procure to Pay', source: 'Procurement Dashboard' },
]

const TYPE_ICON: Record<WidgetType, string> = {
  'Value':           'SAP-icons-v4/number',
  'Bar Chart':       'bar-chart',
  'Line Chart':      'line-chart',
  'Area Chart':      'area-chart',
  'Dual Axis Chart': 'line-chart-dual-axis',
  'Pie Chart':       'pie-chart',
  'Treemap':         'Chart-Tree-Map',
  'Heat Map':        'heatmap-chart',
  'Sankey Chart':    'SAP-icons-v4/graph-sankey',
  'Histogram':       'SAP-icons-v4/graph-histogram',
}

const EXTERNAL_WIDGETS: ExternalWidget[] = [
  { id: 'ext-001', name: 'Sales Performance Dashboard', source: 'Tableau',         url: 'https://tableau.example.com/views/sales' },
  { id: 'ext-002', name: 'Marketing KPIs',              source: 'Looker Studio',   url: 'https://lookerstudio.google.com/u/0/reporting/abc' },
  { id: 'ext-003', name: 'Revenue Forecast',            source: 'Power BI',        url: 'https://app.powerbi.com/view?r=abc123' },
  { id: 'ext-004', name: 'Cost Center Overview',        source: 'SAP Analytics Cloud', url: 'https://sac.example.com/overview' },
  { id: 'ext-005', name: 'Headcount Report',            source: 'Grafana',         url: 'https://grafana.example.com/d/headcount' },
]

// ── Widget card ───────────────────────────────────────────────────────────────

function WidgetCard({ widget, onSelect }: { widget: Widget; onSelect?: () => void }) {
  return (
    <div className={s.card} draggable onClick={onSelect} style={{ cursor: 'pointer' }} onDragStart={(e: React.DragEvent) => {
        e.dataTransfer.setData('text/plain', widget.id)
        e.dataTransfer.setData('application/di-widget', widget.id)
        e.dataTransfer.setData('application/di-widget-name', widget.name)
      }}>
      <div className={s.cardIcon} title={widget.type}>
        <Icon name={TYPE_ICON[widget.type]} style={{ width: '1rem', height: '1rem', color: 'var(--sapHighlightColor)' } as React.CSSProperties} />
      </div>
      <div className={s.cardInfo}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Text style={{ fontSize: 'var(--sapFontHeader5Size)', fontWeight: '700', color: 'var(--sapTextColor)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {widget.name}
          </Text>
          <Button icon="SAP-icons-v4/link" design="Transparent" tooltip="Open in Analysis Configuration"
            style={{ '--_ui5_button_base_min_width': '1.625rem', width: '1.625rem', height: '1.625rem', color: 'var(--sapHighlightColor)' } as React.CSSProperties}
            onClick={(e: React.MouseEvent) => e.stopPropagation()} />
        </div>
        {(widget.process || widget.source) && (
          <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {[widget.process, widget.source].filter(Boolean).join(' / ')}
          </Text>
        )}
      </div>
    </div>
  )
}

// ── External Widget card ──────────────────────────────────────────────────────

function ExternalWidgetCard({ widget, onSelect }: { widget: ExternalWidget; onSelect?: () => void }) {
  return (
    <div className={s.card} draggable onClick={onSelect} style={{ cursor: 'pointer' }} onDragStart={(e: React.DragEvent) => {
        e.dataTransfer.setData('text/plain', widget.id)
        e.dataTransfer.setData('application/di-widget', widget.id)
        e.dataTransfer.setData('application/di-widget-name', widget.name)
        e.dataTransfer.setData('application/di-widget-shape', widget.shapeType ?? '')
      }}>
      <div className={s.cardIcon} title="External Widget">
        <Icon name="SAP-icons-v4/link" style={{ width: '1rem', height: '1rem', color: 'var(--sapHighlightColor)' } as React.CSSProperties} />
      </div>
      <div className={s.cardInfo}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Text style={{ fontSize: 'var(--sapFontHeader5Size)', fontWeight: '700', color: 'var(--sapTextColor)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {widget.name}
          </Text>
          <Button icon="SAP-icons-v4/link" design="Transparent" tooltip="Open external widget"
            style={{ '--_ui5_button_base_min_width': '1.625rem', width: '1.625rem', height: '1.625rem', color: 'var(--sapHighlightColor)' } as React.CSSProperties}
            onClick={(e: React.MouseEvent) => e.stopPropagation()} />
        </div>
        <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {widget.source}
        </Text>
      </div>
    </div>
  )
}

// ── Location selection state ──────────────────────────────────────────────────

type LocationState = {
  process: string | null
  type: 'Investigation' | 'Dashboard' | null
  section: string | null
  page: string | null
}

// ── Main component ────────────────────────────────────────────────────────────

type Props = { onClose: () => void; onWidgetSelect?: (widget: Widget | ExternalWidget) => void }

export default function DataPanel({ onClose, onWidgetSelect }: Props) {
  const [query, setQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedSource, setSelectedSource] = useState<string | null>(null)
  const [location, setLocation] = useState<LocationState>({ process: null, type: null, section: null, page: null })
  const [infoVisible, setInfoVisible] = useState(true)
  const [locationOpen, setLocationOpen] = useState(false)
  const [connectOpen, setConnectOpen] = useState(false)
  const [addExternalOpen, setAddExternalOpen] = useState(false)
  const [sortOrder, setSortOrder] = useState<'name-asc' | 'name-desc' | 'last-edited' | 'recently-added'>('name-asc')
  const [externalWidgets, setExternalWidgets] = useState<ExternalWidget[]>(EXTERNAL_WIDGETS)

  const typeMenuRef = useRef<any>(null)
  const sourceMenuRef = useRef<any>(null)
  const locationBtnRef = useRef<any>(null)
  const sortMenuRef = useRef<any>(null)

  // derive available sections and pages from location state
  const processData = location.process ? CWD_DATA[location.process] : null
  const sections = processData && location.type ? Object.keys(processData[location.type] ?? {}) : []
  const pages = processData && location.type && location.section
    ? Object.keys(processData[location.type]?.[location.section]?.pages ?? {})
    : []
  const pageWidgetIds = processData && location.type && location.section && location.page
    ? processData[location.type]?.[location.section]?.pages[location.page] ?? []
    : null

  const locationLabel = location.page
    ? `${location.process} › ${location.section} › ${location.page}`
    : location.section
    ? `${location.process} › ${location.section}`
    : location.type
    ? `${location.process} › ${location.type}`
    : location.process ?? 'Process'

  const filtered = WIDGETS.filter(w => {
    if (selectedSource === 'External Widget') return false
    if (selectedType && w.type !== selectedType) return false
    if (pageWidgetIds && !pageWidgetIds.includes(w.id)) return false
    if (!query) return true
    const q = query.toLowerCase()
    return w.name.toLowerCase().includes(q) || w.type.toLowerCase().includes(q) || (w.process?.toLowerCase().includes(q) ?? false)
  })

  const filteredExternal = externalWidgets.filter(w => {
    if (selectedSource === 'Analysis Configuration') return false
    if (selectedType) return false
    if (pageWidgetIds) return false
    if (!query) return true
    const q = query.toLowerCase()
    return w.name.toLowerCase().includes(q) || w.source.toLowerCase().includes(q)
  })

  const totalCount = filtered.length + filteredExternal.length

  const sortedFiltered = [...filtered].sort((a, b) => {
    if (sortOrder === 'name-asc') return a.name.localeCompare(b.name)
    if (sortOrder === 'name-desc') return b.name.localeCompare(a.name)
    if (sortOrder === 'recently-added') return WIDGETS.indexOf(b) - WIDGETS.indexOf(a)
    return 0 // last-edited: keep original order
  })

  const hasFilters = !!selectedType || !!selectedSource || !!location.process

  const addMenuRef = useRef<any>(null)

  return (
    <div className={s.panel}>
      <div className={s.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
          <Text style={{ fontWeight: '700', fontSize: 'var(--sapFontHeader5Size)', color: 'var(--sapTextColor)', whiteSpace: 'nowrap' }}>
            Data Integration
          </Text>
          <Button
            id="data-add-btn"
            design="Default"
            endIcon="slim-arrow-down"
            onClick={() => {
              if (addMenuRef.current) {
                addMenuRef.current.opener = 'data-add-btn'
                addMenuRef.current.open = true
              }
            }}
          >Add</Button>
          {createPortal(
            <Menu ref={addMenuRef} onItemClick={(e: any) => {
              if (e.detail?.text === 'Add Manually') setConnectOpen(true)
              if (e.detail?.text === 'Add External Widget') setAddExternalOpen(true)
            }}>
              <MenuItem text="Add External Widget" icon="add" />
              <MenuItem text="Add Manually" icon="edit" />
            </Menu>,
            document.body
          )}
          <ConnectWidgetDialog open={connectOpen} onClose={() => setConnectOpen(false)} />
          <AddExternalWidgetDialog
            open={addExternalOpen}
            onClose={() => setAddExternalOpen(false)}
            onSave={w => setExternalWidgets(prev => [...prev, w])}
          />
        </div>
        <Button icon="decline" design="Transparent" className={s.closeBtn} tooltip="Close"
          style={{ '--_ui5_button_base_min_width': '1.625rem', width: '1.625rem', height: '1.625rem', flexShrink: 0 } as React.CSSProperties}
          onClick={onClose} />
      </div>

      <div className={s.body}>
        {infoVisible && (
          <MessageStrip className={s.messageStrip} design="Information" hideCloseButton={false} onClose={() => setInfoVisible(false)}>
            Drag widgets onto the canvas to add them directly, or drop them onto an existing element to connect it to live data.
          </MessageStrip>
        )}

        <Input
          placeholder="Search widgets..."
          type={'Search' as any}
          value={query}
          showClearIcon
          icon={<Icon slot="icon" name="search" />}
          onInput={(e: any) => setQuery(e.target?.value ?? '')}
          style={{ width: '100%', '--_ui5_input_height': '1.875rem' } as React.CSSProperties}
        />

        {/* Filter chips */}
        <div className={s.chips}>
          <SigChipV2
            value={selectedSource ?? 'Source'}
            trailingIcon="slim-arrow-down"
            selected={!!selectedSource}
            onClick={() => {
              if (sourceMenuRef.current) {
                sourceMenuRef.current.opener = 'data-source-btn'
                sourceMenuRef.current.open = true
              }
            }}
            id="data-source-btn"
          />
          <SigChipV2
            value={locationLabel}
            trailingIcon="slim-arrow-down"
            selected={!!location.process}
            onClick={() => setLocationOpen(true)}
            id="data-location-btn"
            ref={locationBtnRef}
          />
          <SigChipV2
            value={selectedType ?? 'Widget Type'}
            trailingIcon="slim-arrow-down"
            selected={!!selectedType}
            onClick={() => {
              if (typeMenuRef.current) {
                typeMenuRef.current.opener = 'data-type-btn'
                typeMenuRef.current.open = true
              }
            }}
            id="data-type-btn"
          />
          {hasFilters && (
            <SigChipV2 value="Clear" onClick={() => {
              setSelectedType(null)
              setSelectedSource(null)
              setLocation({ process: null, type: null, section: null, page: null })
            }} />
          )}
        </div>

        {/* Result bar */}
        <div className={s.resultBar}>
          <Text style={{ fontWeight: '700', fontSize: 'var(--sapFontHeader6Size)', color: 'var(--sapTextColor)' }}>
            {hasFilters || query ? 'Result' : 'All'} ({totalCount})
          </Text>
          <Button id="data-sort-btn" icon="sort" design="Transparent"
            style={{ '--_ui5_button_base_min_width': '1.625rem', width: '1.625rem', height: '1.625rem' } as React.CSSProperties}
            onClick={() => {
              if (sortMenuRef.current) {
                sortMenuRef.current.opener = 'data-sort-btn'
                sortMenuRef.current.open = !sortMenuRef.current.open
              }
            }} />
        </div>

        {/* Widget list */}
        <div className={s.list}>
          {totalCount === 0
            ? <div className={s.empty}><Text style={{ color: 'var(--sapContent_LabelColor)' }}>No results found</Text></div>
            : <>
                {sortedFiltered.map(w => <WidgetCard key={w.id} widget={w} onSelect={() => onWidgetSelect?.(w)} />)}
                {filteredExternal.map(w => <ExternalWidgetCard key={w.id} widget={w} onSelect={() => onWidgetSelect?.(w)} />)}
              </>
          }
        </div>
      </div>

      {/* Location Menu — nested submenus */}
      {createPortal(
        <Menu
          opener="data-location-btn"
          open={locationOpen}
          onClose={() => setLocationOpen(false)}
          onItemClick={(e: any) => {
            const item = e.detail?.item
            if (!item) return
            const proc = item.dataset?.process
            const sType = item.dataset?.sectionType
            const sec = item.dataset?.section
            const pg = item.dataset?.page
            if (pg) {
              setLocation({ process: proc, type: sType, section: sec, page: pg })
              setLocationOpen(false)
            }
          }}
        >
          {Object.entries(CWD_DATA).map(([proc, procData]) => (
            <MenuItem key={proc} text={proc} data-process={proc}>
              {(['Investigation', 'Dashboard'] as const).filter(t => procData[t]).map(sType => (
                <MenuItem key={sType} text={sType} data-process={proc} data-section-type={sType}>
                  {Object.keys(procData[sType]!).map(sec => (
                    <MenuItem key={sec} text={sec} data-process={proc} data-section-type={sType} data-section={sec}>
                      {Object.keys(procData[sType]![sec].pages).map(pg => (
                        <MenuItem key={pg} text={pg} data-process={proc} data-section-type={sType} data-section={sec} data-page={pg} />
                      ))}
                    </MenuItem>
                  ))}
                </MenuItem>
              ))}
            </MenuItem>
          ))}
        </Menu>,
        document.body
      )}

      {/* Type menu */}
      {createPortal(
        <Menu ref={typeMenuRef} onItemClick={(e: any) => {
          const txt = e.detail?.text
          setSelectedType(txt === 'All' ? null : txt)
        }}>
          <MenuItem text="All" />
          <MenuItem text="Value" />
          <MenuItem text="Bar Chart" />
          <MenuItem text="Line Chart" />
          <MenuItem text="Area Chart" />
          <MenuItem text="Dual Axis Chart" />
          <MenuItem text="Pie Chart" />
          <MenuItem text="Treemap" />
          <MenuItem text="Heat Map" />
          <MenuItem text="Sankey Chart" />
          <MenuItem text="Histogram" />
        </Menu>,
        document.body
      )}

      {/* Source menu */}
      {createPortal(
        <Menu ref={sourceMenuRef} onItemClick={(e: any) => {
          const txt = e.detail?.text
          setSelectedSource(txt === 'All' ? null : txt)
        }}>
          <MenuItem text="All" />
          <MenuItem text="Analysis Configuration" />
          <MenuItem text="External Widget" />
        </Menu>,
        document.body
      )}

      {createPortal(
        <Popover ref={sortMenuRef} placement="Bottom" horizontalAlign="End" className="no-padding-popover"
          onClose={() => {}}>
          <List onItemClick={(e: any) => {
            const key = e.detail?.item?.dataset?.sort
            if (key) { setSortOrder(key); sortMenuRef.current.open = false }
          }}>
            {(['name-asc', 'name-desc', 'last-edited', 'recently-added'] as const).map((key, _, arr) => {
              const labels: Record<string, string> = { 'name-asc': 'Name (A–Z)', 'name-desc': 'Name (Z–A)', 'last-edited': 'Last edited', 'recently-added': 'Recently added' }
              return (
                <ListItemStandard key={key} data-sort={key}
                  selected={sortOrder === key}
                  style={{ fontWeight: sortOrder === key ? '700' : undefined }}>
                  {labels[key]}
                </ListItemStandard>
              )
            })}
          </List>
        </Popover>,
        document.body
      )}

    </div>
  )
}
