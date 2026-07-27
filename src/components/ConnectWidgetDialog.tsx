import React, { useState, useRef, useEffect } from 'react'
import { Button, Dialog, Bar, Title, RadioButton, Input, Icon, Label, Select, Option, Text, Wizard, WizardStep, IllustratedMessage, List, ListItemCustom, Breadcrumbs, BreadcrumbsItem } from '@ui5/webcomponents-react'
import { SigChipV2 } from '@signavio/sap-signavio-uixtension'

type PageMap = Record<string, string[]>
type SectionMap = Record<string, { pages: PageMap }>
type CwdProcess = {
  cases: string; events: string; investigations: number; dashboards: number; lastEdited: string
  Investigation?: SectionMap; Dashboard?: SectionMap
}

const CWD_DATA: Record<string, CwdProcess> = {
  'Order to Cash':      { cases: '306k', events: '12m', investigations: 17, dashboards: 14, lastEdited: '08/20/2025', Investigation: { 'O2C Analysis': { pages: { Overview: ['value-I-001','bar-chart-I-001'], Detail: ['treemap-I-001'], Variants: ['sankey-I-002'] } }, 'O2C Performance': { pages: { KPIs: ['value-I-001'], Trends: ['line-I-001'] } } }, Dashboard: { 'O2C Dashboard': { pages: { Overview: ['value-D-001','pie-D-001'], Comparisons: ['bar-chart-D-001'], Trends: ['line-D-001'] } }, 'O2C Executive Summary': { pages: { Overview: ['value-D-001'] } } } },
  'SAP O2C Onboarding': { cases: '128k', events: '8m', investigations: 7, dashboards: 7, lastEdited: '08/20/2025', Investigation: { 'Onboarding Analysis': { pages: { Main: ['bar-chart-I-002','value-I-002'], Funnel: ['hist-I-001'] } } }, Dashboard: { 'Onboarding Dashboard': { pages: { Overview: ['bar-chart-D-002','value-D-002'] } }, 'Onboarding KPIs': { pages: { Summary: ['value-I-002'] } } } },
  'Record to Report':   { cases: '94k', events: '5m', investigations: 7, dashboards: 10, lastEdited: '08/20/2025', Investigation: { 'R2R Investigation': { pages: { Main: ['ring-I-002','line-I-002'], Flow: ['sankey-I-001'] } } }, Dashboard: { 'R2R Dashboard': { pages: { Summary: ['value-D-003','bar-chart-D-003'] } }, 'R2R Period Analysis': { pages: { Overview: ['line-I-002'], Details: ['treemap-I-003'] } } } },
  'Plan to Produce':    { cases: '215k', events: '10m', investigations: 6, dashboards: 20, lastEdited: '08/20/2025', Investigation: { 'P2P Analysis': { pages: { Overview: ['bar-chart-D-004','value-D-004'], Performance: ['dual-D-002'] } } }, Dashboard: { 'P2P Dashboard': { pages: { Overview: ['pie-D-002','heat-D-002','value-D-004'], Trends: ['area-D-002'], Performance: ['treemap-I-002'] } }, 'Production KPIs': { pages: { Summary: ['value-D-004'], Trends: ['dual-D-002'] } }, 'Supply Chain Overview': { pages: { Overview: ['pie-D-002'] } } } },
  'Procure to Pay':     { cases: '183k', events: '9m', investigations: 9, dashboards: 9, lastEdited: '07/15/2025', Investigation: { 'P2P Analysis': { pages: { Overview: ['bar-chart-I-001','value-I-001'], Detail: ['hist-I-002'] } }, 'Supplier Analysis': { pages: { Overview: ['treemap-I-001'] } } }, Dashboard: { 'Procurement Dashboard': { pages: { Overview: ['value-D-001','pie-D-001'], Trends: ['line-D-001'] } }, 'Supplier Dashboard': { pages: { Overview: ['heat-D-001'] } } } },
  'Hire to Retire':     { cases: '47k', events: '3m', investigations: 9, dashboards: 10, lastEdited: '06/10/2025', Investigation: { 'HR Analysis': { pages: { Overview: ['ring-I-001','value-I-002'], Flow: ['sankey-I-001'] } }, 'Headcount Analysis': { pages: { Overview: ['treemap-I-003'] } } }, Dashboard: { 'HR Dashboard': { pages: { Overview: ['value-D-002','bar-chart-D-002'], Trends: ['line-I-002'] } }, 'Recruitment KPIs': { pages: { Summary: ['value-I-002'] } } } },
}

export const WIDGET_META: Record<string, { name: string; type: string }> = {
  'value-I-001': { name: 'Active Cases', type: 'Value' },
  'value-I-002': { name: 'Avg Onboarding Days', type: 'Value' },
  'value-D-001': { name: 'Total Orders', type: 'Value' },
  'value-D-002': { name: 'Active Cases', type: 'Value' },
  'value-D-003': { name: 'Closed Items', type: 'Value' },
  'value-D-004': { name: 'On-Time Delivery Rate', type: 'Value' },
  'bar-chart-I-001': { name: 'Case Volume by Region', type: 'Bar Chart' },
  'bar-chart-I-002': { name: 'Onboarding Duration', type: 'Bar Chart' },
  'bar-chart-D-001': { name: 'Customer Count by Country', type: 'Bar Chart' },
  'bar-chart-D-002': { name: 'Throughput by Team', type: 'Bar Chart' },
  'bar-chart-D-003': { name: 'Posting Volume by Period', type: 'Bar Chart' },
  'bar-chart-D-004': { name: 'Production Volume', type: 'Bar Chart' },
  'line-I-001': { name: 'Throughput Time Trend', type: 'Line Chart' },
  'line-I-002': { name: 'Period Comparison', type: 'Line Chart' },
  'line-D-001': { name: 'Monthly KPI Trend', type: 'Line Chart' },
  'area-D-002': { name: 'Monthly Events', type: 'Area Chart' },
  'dual-D-002': { name: 'Plan vs Actual', type: 'Dual Axis Chart' },
  'pie-D-001': { name: 'Order Distribution', type: 'Pie Chart' },
  'pie-D-002': { name: 'Case Distribution', type: 'Pie Chart' },
  'treemap-I-001': { name: 'Process Variants', type: 'Treemap' },
  'treemap-I-002': { name: 'Production Category Mix', type: 'Treemap' },
  'treemap-I-003': { name: 'Account Category Mix', type: 'Treemap' },
  'heat-D-001': { name: 'Bottleneck Heatmap', type: 'Heat Map' },
  'heat-D-002': { name: 'Delay Heatmap', type: 'Heat Map' },
  'sankey-I-001': { name: 'Process Flow Sankey', type: 'Sankey Chart' },
  'sankey-I-002': { name: 'Variant Flow Analysis', type: 'Sankey Chart' },
  'hist-I-001': { name: 'Case Duration Distribution', type: 'Histogram' },
  'hist-I-002': { name: 'Lead Time Distribution', type: 'Histogram' },
  'ring-I-001': { name: 'SLA Compliance', type: 'Ring Chart' },
  'ring-I-002': { name: 'Completion Rate', type: 'Ring Chart' },
}

type Props = { open: boolean; onClose: () => void; onAdd?: (widgetId: string, widgetName: string, widgetType: string) => void }

const LINE_DATA = [120, 260, 400, 320, 370, 240]
const BAR_DATA  = [60, 90, 45, 120, 80, 100, 70]
const MONTHS    = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']

function PreviewChart({ type }: { type: string }) {
  const W = 340, H = 200, pad = { t: 20, r: 16, b: 32, l: 44 }
  const iW = W - pad.l - pad.r
  const iH = H - pad.t - pad.b

  if (type === 'Value' || type === 'Ring Chart') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <div style={{ fontSize: 48, fontWeight: 700, color: '#0064d9', fontFamily: "'72',Arial,sans-serif" }}>4,218</div>
        <div style={{ color: 'var(--sapContent_LabelColor)', fontSize: 14 }}>Total Cases</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
          <span style={{ color: '#107e3e', fontWeight: 700, fontSize: 14 }}>↑ 12.3%</span>
          <span style={{ color: 'var(--sapContent_LabelColor)', fontSize: 12 }}>vs. last period</span>
        </div>
      </div>
    )
  }

  if (type === 'Pie Chart') {
    const slices = [
      { pct: 0.38, color: '#0064d9' }, { pct: 0.27, color: '#6ea6d7' },
      { pct: 0.20, color: '#a8c8ef' }, { pct: 0.15, color: '#d1e4f7' },
    ]
    let angle = -Math.PI / 2
    const r = 70, cx = 90, cy = 90
    const paths = slices.map(s => {
      const start = angle
      const end = angle + s.pct * 2 * Math.PI
      const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start)
      const x2 = cx + r * Math.cos(end),   y2 = cy + r * Math.sin(end)
      const large = s.pct > 0.5 ? 1 : 0
      angle = end
      return <path key={s.color} d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`} fill={s.color} />
    })
    return <svg width={180} height={180} viewBox="0 0 180 180">{paths}</svg>
  }

  const maxVal = Math.max(...LINE_DATA)
  const toY = (v: number) => pad.t + iH - (v / maxVal) * iH
  const toX = (i: number) => pad.l + (i / (LINE_DATA.length - 1)) * iW

  if (type === 'Line Chart' || type === 'Area Chart' || type === 'Dual Axis Chart') {
    const pts = LINE_DATA.map((v, i) => `${toX(i)},${toY(v)}`).join(' ')
    const areaPath = `M${toX(0)},${toY(LINE_DATA[0])} ${LINE_DATA.map((v, i) => `L${toX(i)},${toY(v)}`).join(' ')} L${toX(LINE_DATA.length-1)},${pad.t+iH} L${toX(0)},${pad.t+iH} Z`
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ fontFamily: "'72',Arial,sans-serif" }}>
        {[0, 0.5, 1].map(f => {
          const y = pad.t + iH * (1 - f)
          return <g key={f}>
            <line x1={pad.l} y1={y} x2={pad.l+iW} y2={y} stroke="#e5e5e5" strokeWidth={1} />
            <text x={pad.l-6} y={y+4} textAnchor="end" fontSize={10} fill="#8c8c8c">{Math.round(maxVal*f)}</text>
          </g>
        })}
        {MONTHS.map((m, i) => (
          <text key={m} x={toX(i)} y={H-8} textAnchor="middle" fontSize={10} fill="#8c8c8c">{m}</text>
        ))}
        <path d={areaPath} fill="#0064d9" fillOpacity={0.12} />
        <polyline points={pts} fill="none" stroke="#0064d9" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {LINE_DATA.map((v, i) => (
          <circle key={i} cx={toX(i)} cy={toY(v)} r={4} fill="#fff" stroke="#0064d9" strokeWidth={2.5} />
        ))}
      </svg>
    )
  }

  // Bar / Treemap / Heat Map / Sankey / Histogram → bar chart
  const maxBar = Math.max(...BAR_DATA)
  const bW = iW / BAR_DATA.length - 6
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ fontFamily: "'72',Arial,sans-serif" }}>
      {[0, 0.5, 1].map(f => {
        const y = pad.t + iH * (1 - f)
        return <g key={f}>
          <line x1={pad.l} y1={y} x2={pad.l+iW} y2={y} stroke="#e5e5e5" strokeWidth={1} />
          <text x={pad.l-6} y={y+4} textAnchor="end" fontSize={10} fill="#8c8c8c">{Math.round(maxBar*f)}</text>
        </g>
      })}
      {BAR_DATA.map((v, i) => {
        const bH = (v / maxBar) * iH
        const x = pad.l + i * (iW / BAR_DATA.length) + 3
        const y = pad.t + iH - bH
        return <rect key={i} x={x} y={y} width={bW} height={bH} rx={3} fill="#0064d9" fillOpacity={0.75 + i*0.025} />
      })}
    </svg>
  )
}

function Breadcrumb({ parts }: { parts: string[] }) {
  return (
    <Breadcrumbs style={{ marginBottom: '1rem' } as React.CSSProperties}>
      {parts.map((p, i) => (
        <BreadcrumbsItem key={i}>{p}</BreadcrumbsItem>
      ))}
    </Breadcrumbs>
  )
}

export default function ConnectWidgetDialog({ open, onClose, onAdd }: Props) {
  const [step, setStep] = useState(1)
  const [selectedProcess, setSelectedProcess] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<'Investigation' | 'Dashboard' | null>(null)
  const [selectedSource, setSelectedSource] = useState<string>('')
  const [selectedPage, setSelectedPage] = useState<string>('')
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const wizardRef = useRef<any>(null)
  const dialogRef = useRef<any>(null)

  useEffect(() => {
    if (!open) return
    setTimeout(() => {
      const wiz = wizardRef.current
      if (!wiz?.shadowRoot) return
      const root = wiz.shadowRoot.querySelector('.ui5-wiz-root') as HTMLElement
      if (root) { root.style.width = '100%'; root.style.minHeight = 'unset' }
      const nav = wiz.shadowRoot.querySelector('.ui5-wiz-nav') as HTMLElement
      if (nav) { nav.style.width = '100%'; nav.style.paddingInlineEnd = '0'; nav.style.paddingRight = '0' }
      const content = wiz.shadowRoot.querySelector('.ui5-wiz-content') as HTMLElement
      if (content) content.style.display = 'none'
      wiz.shadowRoot.querySelectorAll('.ui5-wiz-step-root').forEach((el: Element) => {
        (el as HTMLElement).style.paddingInlineEnd = '0';
        (el as HTMLElement).style.paddingRight = '0';
        (el as HTMLElement).style.flex = '1';
        (el as HTMLElement).style.minWidth = '0';
      })
    }, 50)
  }, [open, step])

  const reset = () => {
    setStep(1); setSelectedProcess(null); setSelectedType(null)
    setSelectedSource(''); setSelectedPage(''); setSelectedWidget(null); setSearch('')
  }
  const handleClose = () => { reset(); onClose() }

  const processes = Object.entries(CWD_DATA)
  const filtered = search ? processes.filter(([name]) => name.toLowerCase().includes(search.toLowerCase())) : processes

  const procData = selectedProcess ? CWD_DATA[selectedProcess] : null
  const sources = selectedType && procData?.[selectedType] ? Object.keys(procData[selectedType]!) : []
  const pages = selectedSource && selectedType && procData?.[selectedType]?.[selectedSource]
    ? Object.keys(procData[selectedType]![selectedSource].pages)
    : []
  const widgetIds = selectedPage && selectedSource && selectedType && procData?.[selectedType]?.[selectedSource]?.pages[selectedPage]
    ? procData[selectedType]![selectedSource].pages[selectedPage]
    : []

  const nextDisabled = step === 1 ? !selectedProcess : step === 2 ? !selectedType : !selectedWidget

  // tree expand state
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({})
  const toggleSection = (key: string) => setExpandedSections(p => ({ ...p, [key]: !p[key] }))

  return (
    <Dialog
      ref={dialogRef}
      open={open}
      onClose={handleClose}
      style={{ width: '900px', height: '560px', maxHeight: '560px', '--_ui5_dialog_width': '900px', '--_ui5_dialog_max_height': '560px', '--_ui5_dialog_min_height': '560px', '--_ui5_dialog_content_padding': '0' } as React.CSSProperties}
      header={<Bar design="Header"><Title slot="startContent" level="H4">Browse Widgets</Title></Bar>}
      footer={
        <Bar design="Footer">
          {step > 1 && <Button slot="startContent" design="Transparent" onClick={() => { setStep(s => s - 1); if (step === 3) { setSelectedWidget(null) } if (step === 2) { setSelectedType(null); setSelectedSource(''); setSelectedPage(''); setSelectedWidget(null) } }}>Back</Button>}
          <div slot="endContent" style={{ display: 'flex', gap: 8 }}>
            <Button design="Emphasized" disabled={nextDisabled} onClick={() => {
              if (step < 3) { setStep(s => s + 1); return }
              if (selectedWidget) {
                const meta = WIDGET_META[selectedWidget]
                const widgetId = selectedWidget
                const widgetName = meta?.name ?? selectedWidget
                const widgetType = meta?.type ?? 'Value'
                onAdd?.(widgetId, widgetName, widgetType)
                reset()
                onClose()
              }
            }}>
              {step === 3 ? 'Add to Canvas' : 'Next'}
            </Button>
            <Button design="Transparent" onClick={handleClose}>Cancel</Button>
          </div>
        </Bar>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
        <div style={{ overflow: 'hidden', height: '3.875rem', flexShrink: 0, borderBottom: '1px solid var(--sapPageHeader_BorderColor, #d9d9d9)', boxShadow: '0 2px 4px rgba(34,53,72,0.06)', width: '100%' }}>
          <Wizard
            ref={wizardRef}
            contentLayout={'SingleStep' as any}
            style={{ width: '100%', minWidth: '100%' } as React.CSSProperties}
            onStepChange={(e: any) => {
              const idx = e.detail?.step?.dataset?.stepIndex
              if (idx) setStep(Number(idx))
            }}
          >
            <WizardStep data-step-index="1" titleText="Select Analysis Configuration" selected={step === 1} disabled={false} icon={step > 1 ? 'accept' : undefined}>{' '}</WizardStep>
            <WizardStep data-step-index="2" titleText="Choose Type" selected={step === 2} disabled={step < 2} icon={step > 2 ? 'accept' : undefined}>{' '}</WizardStep>
            <WizardStep data-step-index="3" titleText="Select Widget" selected={step === 3} disabled={step < 3}>{' '}</WizardStep>
          </Wizard>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 2rem' }}>

          {/* ── Step 1: Select Process ── */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <Text style={{ fontWeight: 700, fontSize: 'var(--sapFontLargeSize)', display: 'block', marginBottom: '0.125rem' } as React.CSSProperties}>Select Analysis Configuration</Text>
                <Text style={{ color: 'var(--sapContent_LabelColor)' } as React.CSSProperties}>Select the analysis configuration you want to add a widget from</Text>
              </div>
              <Input placeholder="Search by analysis configuration name" type={'Search' as any} value={search}
                onInput={(e: any) => setSearch(e.target.value)} style={{ width: '100%' } as React.CSSProperties}>
                <Icon slot="icon" name="search" />
              </Input>
              <div style={{ width: '100%', borderTop: '1px solid var(--sapList_BorderColor)', borderBottom: '1px solid var(--sapList_BorderColor)' }}>
                {/* Header */}
                <div style={{ display: 'flex', background: 'var(--sapList_HeaderBackground)', borderBottom: '1px solid var(--sapList_BorderColor)', padding: '0.5rem 0' }}>
                  <div style={{ width: '2.5rem', flexShrink: 0 }} />
                  <div style={{ flex: '0 0 40%', minWidth: 0, fontSize: 'var(--sapFontSize)', fontWeight: 700, color: 'var(--sapList_HeaderTextColor)' }}>Name</div>
                  <div style={{ flex: 1, fontSize: 'var(--sapFontSize)', fontWeight: 700, color: 'var(--sapList_HeaderTextColor)' }}>Cases</div>
                  <div style={{ flex: 1, fontSize: 'var(--sapFontSize)', fontWeight: 700, color: 'var(--sapList_HeaderTextColor)' }}>Events</div>
                  <div style={{ width: '9rem', flexShrink: 0, fontSize: 'var(--sapFontSize)', fontWeight: 700, color: 'var(--sapList_HeaderTextColor)', textAlign: 'right', paddingRight: '1rem' }}>Last Updated</div>
                </div>
                {filtered.map(([name, data]) => (
                  <div
                    key={name}
                    onClick={() => setSelectedProcess(name)}
                    style={{
                      display: 'flex', alignItems: 'center', minHeight: '2.75rem',
                      borderBottom: '1px solid var(--sapList_BorderColor)',
                      cursor: 'pointer',
                      background: selectedProcess === name ? 'var(--sapList_SelectionBackgroundColor)' : 'var(--sapList_Background)',
                    }}
                    onMouseEnter={e => { if (selectedProcess !== name) (e.currentTarget as HTMLElement).style.background = 'var(--sapList_Hover_Background)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = selectedProcess === name ? 'var(--sapList_SelectionBackgroundColor)' : 'var(--sapList_Background)' }}
                  >
                    <div style={{ width: '2.5rem', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <RadioButton checked={selectedProcess === name} onChange={() => setSelectedProcess(name)} />
                    </div>
                    <div style={{ flex: '0 0 40%', minWidth: 0, fontSize: 'var(--sapFontSize)', fontWeight: selectedProcess === name ? 700 : 400, color: 'var(--sapList_TextColor)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
                    <div style={{ flex: 1, fontSize: 'var(--sapFontSize)', color: 'var(--sapList_TextColor)' }}>{data.cases}</div>
                    <div style={{ flex: 1, fontSize: 'var(--sapFontSize)', color: 'var(--sapList_TextColor)' }}>{data.events}</div>
                    <div style={{ width: '9rem', flexShrink: 0, fontSize: 'var(--sapFontSize)', color: 'var(--sapList_TextColor)', textAlign: 'right', paddingRight: '1rem' }}>{data.lastEdited}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 2: Choose Type ── */}
          {step === 2 && selectedProcess && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ marginBottom: '-0.75rem' }}>
                <Breadcrumb parts={['Analysis Configuration', selectedProcess]} style={{ marginBottom: 0 } as React.CSSProperties} />
              </div>
              <div>
                <Text style={{ fontWeight: 700, fontSize: 'var(--sapFontLargeSize)', display: 'block', marginBottom: '0.125rem' } as React.CSSProperties}>Select Widget Source</Text>
                <Text style={{ color: 'var(--sapContent_LabelColor)' } as React.CSSProperties}>Choose whether to add a widget from an Investigation or a Dashboard</Text>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                {(['Investigation', 'Dashboard'] as const).map(type => {
                  const sections = procData?.[type]
                  if (!sections) return null
                  const isSelected = selectedType === type
                  return (
                    <div key={type} onClick={() => setSelectedType(type)} style={{
                      flex: 1, padding: '1.25rem', borderRadius: '0.5rem', cursor: 'pointer',
                      border: `1px solid ${isSelected ? 'var(--sapHighlightColor)' : 'var(--sapPageHeader_BorderColor, #d9d9d9)'}`,
                      background: isSelected ? 'var(--sapList_SelectionBackgroundColor, #e8f3ff)' : '#fff',
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      boxShadow: isSelected ? '0 0 0 1px var(--sapHighlightColor)' : undefined,
                    }}>
                      <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.5rem', flexShrink: 0, background: 'var(--sapAvatar_6_Background, #d1efff)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name={type === 'Investigation' ? 'SAP-icons-v5/business-objects-experience' : 'SAP-icons-v5/business-objects-mobile'} style={{ width: '1.25rem', height: '1.25rem', color: '#0057d2' } as React.CSSProperties} />
                      </div>
                      <Text style={{ fontWeight: 700, fontSize: 'var(--sapFontSize)', flex: 1 } as React.CSSProperties}>{type}s</Text>
                      <RadioButton checked={isSelected} onChange={() => setSelectedType(type)} />
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── Step 3: Select Widget ── */}
          {step === 3 && selectedProcess && selectedType && (
            <div style={{ display: 'flex', gap: '1rem', height: '100%' }}>
              {/* Left: selectors + widget list */}
              <div style={{ flex: '0 0 45%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ marginBottom: '-0.75rem' }}>
                  <Breadcrumb parts={['Analysis Configuration', selectedProcess, selectedType + 's']} style={{ marginBottom: 0 } as React.CSSProperties} />
                </div>

                <div>
                  <Label required style={{ color: 'var(--sapContent_LabelColor)', display: 'block', marginBottom: '0.25rem' } as React.CSSProperties}>
                    1. Select {selectedType}:
                  </Label>
                  <Select style={{ width: '100%' } as React.CSSProperties}
                    onChange={(e: any) => { setSelectedSource(e.detail?.selectedOption?.value ?? ''); setSelectedPage(''); setSelectedWidget(null) }}>
                    <Option value="">Select</Option>
                    {selectedType && procData?.[selectedType] && Object.keys(procData[selectedType]!).map(s => (
                      <Option key={s} value={s} selected={selectedSource === s}>{s}</Option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label required style={{ color: 'var(--sapContent_LabelColor)', display: 'block', marginBottom: '0.25rem' } as React.CSSProperties}>
                    2. Select Page:
                  </Label>
                  <Select style={{ width: '100%' } as React.CSSProperties} disabled={!selectedSource}
                    onChange={(e: any) => { setSelectedPage(e.detail?.selectedOption?.value ?? ''); setSelectedWidget(null) }}>
                    <Option value="">Select</Option>
                    {selectedType && selectedSource && procData?.[selectedType]?.[selectedSource] && Object.keys(procData[selectedType]![selectedSource].pages).map(p => (
                      <Option key={p} value={p} selected={selectedPage === p}>{p}</Option>
                    ))}
                  </Select>
                </div>

                {/* Widget list */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.375rem', overflowY: 'auto' }}>
                  <Label required style={{ color: 'var(--sapContent_LabelColor)', display: 'block', marginBottom: '0.25rem' } as React.CSSProperties}>
                    3. Select Widget:
                  </Label>
                  {!selectedPage ? (
                    <div style={{ padding: '1.5rem 0', color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSize)', textAlign: 'center' }}>
                      Select a {selectedType?.toLowerCase() ?? 'type'} and page first
                    </div>
                  ) : (
                    <List separators="Inner" className="widget-list">
                      {((selectedType && selectedSource && selectedPage && procData?.[selectedType]?.[selectedSource]?.pages[selectedPage]) ?? []).map(id => {
                        const meta = WIDGET_META[id]
                        if (!meta) return null
                        const iconName =
                          meta.type === 'Value' ? 'SAP-icons-v4/number'
                          : meta.type === 'Bar Chart' ? 'bar-chart'
                          : meta.type === 'Line Chart' ? 'line-chart'
                          : meta.type === 'Area Chart' ? 'area-chart'
                          : meta.type === 'Dual Axis Chart' ? 'line-chart-dual-axis'
                          : meta.type === 'Pie Chart' ? 'pie-chart'
                          : meta.type === 'Treemap' ? 'Chart-Tree-Map'
                          : meta.type === 'Heat Map' ? 'heatmap-chart'
                          : meta.type === 'Sankey Chart' ? 'SAP-icons-v4/graph-sankey'
                          : meta.type === 'Histogram' ? 'SAP-icons-v4/graph-histogram'
                          : meta.type === 'Ring Chart' ? 'donut-chart'
                          : 'overview-chart'
                        const isSelected = selectedWidget === id
                        return (
                          <ListItemCustom key={id} type="Active" style={{ background: isSelected ? 'var(--sapList_SelectionBackgroundColor)' : undefined, padding: 0 }} onClick={() => setSelectedWidget(id)}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0.25rem 0.5rem 0.25rem 0' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <RadioButton checked={isSelected} onChange={() => setSelectedWidget(id)} style={{ pointerEvents: 'none' } as React.CSSProperties} />
                                <div style={{ width: '1.75rem', height: '1.75rem', borderRadius: '0.375rem', background: '#d1efff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                  <Icon name={iconName} style={{ width: '0.875rem', height: '0.875rem', color: '#0064d9' } as React.CSSProperties} />
                                </div>
                                <Text style={{ fontSize: 'var(--sapFontSize)' } as React.CSSProperties}>{meta.name}</Text>
                              </div>
                              <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', flexShrink: 0 } as React.CSSProperties}>{meta.type}</Text>
                            </div>
                          </ListItemCustom>
                        )
                      })}
                    </List>
                  )}
                </div>
              </div>

              {/* Right: preview */}
              <div style={{ flex: 1, borderRadius: '0.5rem', background: 'var(--sapPageSection_Background, #f5f6f7)', display: 'flex', flexDirection: 'column', padding: '1.5rem', gap: '0.5rem' }}>
                {!selectedWidget ? (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IllustratedMessage name="NoEntries" titleText="No widget selected" subtitleText="Select a widget from the list to preview it" />
                  </div>
                ) : (
                  <>
                    <Text style={{ fontWeight: 700, fontSize: 'var(--sapFontLargeSize)', display: 'block' } as React.CSSProperties}>{WIDGET_META[selectedWidget]?.name}</Text>
                    <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSize)', display: 'block', marginBottom: '0.5rem' } as React.CSSProperties}>
                      {selectedProcess} / {selectedSource} / {selectedPage}
                    </Text>
                    <div style={{ background: '#fff', borderRadius: '0.75rem', border: '1px solid var(--sapPageHeader_BorderColor, #e5e5e5)', padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <PreviewChart type={WIDGET_META[selectedWidget]?.type ?? 'Bar Chart'} />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Dialog>
  )
}
