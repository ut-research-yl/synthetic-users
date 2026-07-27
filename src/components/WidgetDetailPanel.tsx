import React from 'react'
import { Button, Icon, Label, Tab, Text } from '@ui5/webcomponents-react'
import { SigRightSidePanel } from '@signavio/sap-signavio-uixtension'
import type { Widget, ExternalWidget } from './DataPanel'

const CHART_SVG: Record<string, string> = {
  'Value':           `<svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg"><text x="200" y="80" text-anchor="middle" font-size="52" font-weight="700" fill="#0064d9" font-family="72,Arial">2,847</text><text x="200" y="108" text-anchor="middle" font-size="13" fill="#556b82" font-family="72,Arial">Current Value</text><line x1="80" y1="132" x2="320" y2="132" stroke="#e8ecf0" stroke-width="1.5"/><rect x="148" y="148" width="12" height="12" rx="2" fill="#27a65a"/><text x="166" y="159" font-size="13" fill="#27a65a" font-family="72,Arial" font-weight="600">↑ 12.3%</text><text x="200" y="185" text-anchor="middle" font-size="11" fill="#8c9bab" font-family="72,Arial">vs. last period</text></svg>`,
  'Bar Chart':       `<svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="55" y1="20" x2="55" y2="160" stroke="#e8ecf0" stroke-width="1"/><line x1="55" y1="160" x2="380" y2="160" stroke="#e8ecf0" stroke-width="1"/><line x1="55" y1="120" x2="380" y2="120" stroke="#e8ecf0" stroke-width="1" stroke-dasharray="4,3"/><line x1="55" y1="80" x2="380" y2="80" stroke="#e8ecf0" stroke-width="1" stroke-dasharray="4,3"/><line x1="55" y1="40" x2="380" y2="40" stroke="#e8ecf0" stroke-width="1" stroke-dasharray="4,3"/><rect x="70" y="65" width="40" height="95" fill="#0064d9" rx="2"/><rect x="130" y="95" width="40" height="65" fill="#0064d9" rx="2" opacity="0.75"/><rect x="190" y="45" width="40" height="115" fill="#0064d9" rx="2"/><rect x="250" y="110" width="40" height="50" fill="#0064d9" rx="2" opacity="0.75"/><rect x="310" y="75" width="40" height="85" fill="#0064d9" rx="2"/></svg>`,
  'Line Chart':      `<svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="50" y1="20" x2="50" y2="160" stroke="#e8ecf0" stroke-width="1"/><line x1="50" y1="160" x2="380" y2="160" stroke="#e8ecf0" stroke-width="1"/><line x1="50" y1="120" x2="380" y2="120" stroke="#e8ecf0" stroke-width="1" stroke-dasharray="4,3"/><line x1="50" y1="80" x2="380" y2="80" stroke="#e8ecf0" stroke-width="1" stroke-dasharray="4,3"/><line x1="50" y1="40" x2="380" y2="40" stroke="#e8ecf0" stroke-width="1" stroke-dasharray="4,3"/><polyline points="70,130 130,100 190,60 250,90 310,50 370,80" stroke="#0064d9" stroke-width="2.5" fill="none" stroke-linejoin="round"/><circle cx="70" cy="130" r="4" fill="#0064d9"/><circle cx="130" cy="100" r="4" fill="#0064d9"/><circle cx="190" cy="60" r="4" fill="#0064d9"/><circle cx="250" cy="90" r="4" fill="#0064d9"/><circle cx="310" cy="50" r="4" fill="#0064d9"/><circle cx="370" cy="80" r="4" fill="#0064d9"/></svg>`,
  'Area Chart':      `<svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="50" y1="20" x2="50" y2="160" stroke="#e8ecf0" stroke-width="1"/><line x1="50" y1="160" x2="380" y2="160" stroke="#e8ecf0" stroke-width="1"/><line x1="50" y1="120" x2="380" y2="120" stroke="#e8ecf0" stroke-width="1" stroke-dasharray="4,3"/><line x1="50" y1="80" x2="380" y2="80" stroke="#e8ecf0" stroke-width="1" stroke-dasharray="4,3"/><path d="M70 130 L130 105 L190 65 L250 90 L310 55 L370 80 L370 160 L70 160 Z" fill="#0064d9" opacity="0.15"/><polyline points="70,130 130,105 190,65 250,90 310,55 370,80" stroke="#0064d9" stroke-width="2.5" fill="none" stroke-linejoin="round"/></svg>`,
  'Dual Axis Chart': `<svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="55" y1="20" x2="55" y2="160" stroke="#e8ecf0" stroke-width="1"/><line x1="55" y1="160" x2="380" y2="160" stroke="#e8ecf0" stroke-width="1"/><rect x="72" y="80" width="36" height="80" fill="#a8d4f5" rx="2"/><rect x="140" y="100" width="36" height="60" fill="#a8d4f5" rx="2"/><rect x="208" y="60" width="36" height="100" fill="#a8d4f5" rx="2"/><rect x="276" y="110" width="36" height="50" fill="#a8d4f5" rx="2"/><rect x="344" y="75" width="36" height="85" fill="#a8d4f5" rx="2"/><polyline points="90,95 158,72 226,52 294,82 362,62" stroke="#0064d9" stroke-width="2.5" fill="none" stroke-linejoin="round"/><circle cx="90" cy="95" r="4" fill="#0064d9"/><circle cx="158" cy="72" r="4" fill="#0064d9"/><circle cx="226" cy="52" r="4" fill="#0064d9"/><circle cx="294" cy="82" r="4" fill="#0064d9"/><circle cx="362" cy="62" r="4" fill="#0064d9"/></svg>`,
  'Pie Chart':       `<svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M200 100 L200 40 A60 60 0 0 1 248.5 135.3 Z" fill="#0064d9"/><path d="M200 100 L248.5 135.3 A60 60 0 0 1 164.7 148.5 Z" fill="#5baae7"/><path d="M200 100 L164.7 148.5 A60 60 0 0 1 151.5 64.7 Z" fill="#a8d4f5"/><path d="M200 100 L151.5 64.7 A60 60 0 0 1 200 40 Z" fill="#d4ebfa"/></svg>`,
  'Treemap':         `<svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="30" y="20" width="175" height="140" fill="#0064d9" rx="2"/><rect x="210" y="20" width="160" height="78" fill="#5baae7" rx="2"/><rect x="210" y="103" width="78" height="57" fill="#a8d4f5" rx="2"/><rect x="293" y="103" width="77" height="57" fill="#d4ebfa" rx="2"/></svg>`,
  'Heat Map':        `<svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="40" y="22" width="60" height="32" fill="#d4ebfa" rx="1"/><rect x="105" y="22" width="60" height="32" fill="#5baae7" rx="1"/><rect x="170" y="22" width="60" height="32" fill="#0064d9" rx="1"/><rect x="235" y="22" width="60" height="32" fill="#5baae7" rx="1"/><rect x="300" y="22" width="60" height="32" fill="#a8d4f5" rx="1"/><rect x="40" y="59" width="60" height="32" fill="#5baae7" rx="1"/><rect x="105" y="59" width="60" height="32" fill="#0064d9" rx="1"/><rect x="170" y="59" width="60" height="32" fill="#0064d9" rx="1"/><rect x="235" y="59" width="60" height="32" fill="#a8d4f5" rx="1"/><rect x="300" y="59" width="60" height="32" fill="#d4ebfa" rx="1"/><rect x="40" y="96" width="60" height="32" fill="#a8d4f5" rx="1"/><rect x="105" y="96" width="60" height="32" fill="#5baae7" rx="1"/><rect x="170" y="96" width="60" height="32" fill="#a8d4f5" rx="1"/><rect x="235" y="96" width="60" height="32" fill="#0064d9" rx="1"/><rect x="300" y="96" width="60" height="32" fill="#5baae7" rx="1"/></svg>`,
  'Sankey Chart':    `<svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="40" y="20" width="22" height="65" fill="#0064d9" rx="2"/><rect x="40" y="95" width="22" height="45" fill="#5baae7" rx="2"/><rect x="40" y="150" width="22" height="30" fill="#a8d4f5" rx="2"/><path d="M62 20 C160 20 240 25 338 25 L338 65 C240 65 160 60 62 85 Z" fill="#0064d9" opacity="0.3"/><path d="M62 95 C160 95 240 90 338 90 L338 120 C240 120 160 130 62 140 Z" fill="#5baae7" opacity="0.3"/><path d="M62 150 C160 150 240 130 338 130 L338 170 C240 170 160 170 62 180 Z" fill="#a8d4f5" opacity="0.3"/><rect x="338" y="25" width="22" height="65" fill="#0064d9" rx="2"/><rect x="338" y="90" width="22" height="40" fill="#5baae7" rx="2"/><rect x="338" y="130" width="22" height="40" fill="#a8d4f5" rx="2"/></svg>`,
  'Histogram':       `<svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="50" y1="160" x2="380" y2="160" stroke="#e8ecf0" stroke-width="1"/><rect x="55" y="130" width="36" height="30" fill="#0064d9" rx="1" opacity="0.5"/><rect x="95" y="100" width="36" height="60" fill="#0064d9" rx="1" opacity="0.7"/><rect x="135" y="60" width="36" height="100" fill="#0064d9" rx="1"/><rect x="175" y="40" width="36" height="120" fill="#0064d9" rx="1"/><rect x="215" y="55" width="36" height="105" fill="#0064d9" rx="1" opacity="0.9"/><rect x="255" y="90" width="36" height="70" fill="#0064d9" rx="1" opacity="0.7"/><rect x="295" y="120" width="36" height="40" fill="#0064d9" rx="1" opacity="0.5"/><rect x="335" y="145" width="36" height="15" fill="#0064d9" rx="1" opacity="0.3"/></svg>`,
  'External Widget': `<svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="60" y="40" width="280" height="120" rx="8" fill="#f5f6f7" stroke="#e8ecf0" stroke-width="1.5"/><rect x="80" y="60" width="100" height="8" rx="4" fill="#d4e8fa"/><rect x="80" y="76" width="140" height="8" rx="4" fill="#e8ecf0"/><rect x="80" y="100" width="60" height="40" rx="4" fill="#0064d9" opacity="0.15"/><rect x="150" y="100" width="60" height="40" rx="4" fill="#0064d9" opacity="0.25"/><rect x="220" y="100" width="60" height="40" rx="4" fill="#0064d9" opacity="0.4"/></svg>`,
}

const TYPE_ICON: Record<string, string> = {
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
  'External Widget': 'SAP-icons-v4/link',
}

type Props = {
  widget: Widget | ExternalWidget
  onClose: () => void
}

function isExternal(w: Widget | ExternalWidget): w is ExternalWidget {
  return 'url' in w
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '8px 0' }}>
      <Label showColon style={{ color: 'var(--sapContent_LabelColor)' }}>{label}</Label>
      <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)' }}>{value}</Text>
    </div>
  )
}

export default function WidgetDetailPanel({ widget, onClose }: Props) {
  const ext = isExternal(widget)
  const widgetType = ext ? 'External Widget' : (widget as Widget).type
  const process = ext ? undefined : (widget as Widget).process
  const source = ext ? (widget as ExternalWidget).source : (widget as Widget).source
  const chartSvg = CHART_SVG[widgetType] ?? CHART_SVG['Bar Chart']
  const iconName = TYPE_ICON[widgetType] ?? 'chart-table-view'

  const tabs = [
    <Tab text="Details" key="details">
      <div style={{ paddingBottom: '12px' }}>
        <div style={{
          background: 'var(--sapList_Background, #f5f6f7)',
          borderRadius: '0.5rem',
          border: '1px solid var(--sapNeutralBorderColor)',
          padding: '0.75rem',
          aspectRatio: '16/9',
          marginBottom: '0.5rem',
        }}>
          <div style={{ width: '100%', height: '100%' }} dangerouslySetInnerHTML={{ __html: chartSvg }} />
        </div>
        {process && <DetailRow label="Process" value={process} />}
        {source && <DetailRow label={ext ? 'Source' : 'Dashboard'} value={source} />}
        {ext && (widget as ExternalWidget).url && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '8px 0' }}>
            <Label showColon style={{ color: 'var(--sapContent_LabelColor)' }}>URL</Label>
            <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapHighlightColor)', wordBreak: 'break-all' }}>
              {(widget as ExternalWidget).url}
            </Text>
          </div>
        )}
        <DetailRow label="Widget Type" value={widgetType} />
      </div>
    </Tab>,
    <Tab text="Relations" key="relations">
      <div style={{ paddingBottom: '8px' }}>
        <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)' }}>
          No relations defined.
        </Text>
      </div>
    </Tab>,
  ]

  return (
    <SigRightSidePanel
      headerTitle={widget.name}
      isOpen
      toggleRightSidePanel={onClose}
      navigationSlot={[() => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 24, height: 24, borderRadius: 6, flexShrink: 0,
            background: 'var(--sapAvatar_6_Background, #d1efff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name={iconName} style={{ width: 12, height: 12, color: '#0064d9' } as React.CSSProperties} />
          </div>
          <Text style={{ fontSize: 'var(--sapFontSize)', fontWeight: '700', color: 'var(--sapPageHeader_TextColor)', whiteSpace: 'nowrap' }}>
            {widgetType}
          </Text>
        </div>
      )]}
      contentActionsSlot={[
        () => <Button design="Emphasized" icon="SAP-icons-v4/link">Open</Button>,
      ]}
      tabSlot={tabs}
      style={{ width: '100%', maxWidth: 'none', height: '100%', overflow: 'hidden', background: 'var(--sapList_Background)', position: 'relative' }}
    >
      {''}
    </SigRightSidePanel>
  )
}
