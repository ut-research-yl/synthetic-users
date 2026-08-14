import React, { useState } from 'react'
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

type Relation = { type: string; name: string; icon: string }

const TYPE_BG: Record<string, string> = {
  'Process Task': 'var(--sapAvatar_6_Background, #d1efff)',
  'Dashboard':    'var(--sapAvatar_5_Background, #fde8f5)',
  'KPI':          'var(--sapAvatar_4_Background, #f0eaff)',
  'Process':      'var(--sapAvatar_3_Background, #fff3d1)',
  'Data Source':  'var(--sapAvatar_2_Background, #e8f8e8)',
}
const TYPE_COLOR: Record<string, string> = {
  'Process Task': 'var(--sapAvatar_6_TextColor, #0064d9)',
  'Dashboard':    'var(--sapAvatar_5_TextColor, #bf2277)',
  'KPI':          'var(--sapAvatar_4_TextColor, #7a3eb8)',
  'Process':      'var(--sapAvatar_3_TextColor, #d18000)',
  'Data Source':  'var(--sapAvatar_2_TextColor, #0b6e31)',
}

function RelationGroup({ label, items }: { label: string; items: Relation[] }) {
  const [expanded, setExpanded] = useState(true)
  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', paddingTop: '12px', paddingBottom: '4px' }}>
        <Button icon={expanded ? 'slim-arrow-down' : 'navigation-right-arrow'} design="Transparent" onClick={() => setExpanded(v => !v)} />
        <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)', fontFamily: "var(--sapFontFamily,'72',sans-serif)" }}>
          {label}
        </Text>
      </div>
      {expanded && items.map((rel, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0' }}>
          <div style={{ width: 32, height: 32, borderRadius: 6, flexShrink: 0, background: TYPE_BG[rel.type] ?? 'var(--sapAvatar_6_Background)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={rel.icon} style={{ width: 16, height: 16, color: TYPE_COLOR[rel.type] ?? 'var(--sapAvatar_6_TextColor)' } as React.CSSProperties} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ display: 'block', fontWeight: '700', fontSize: 'var(--sapFontSize)', color: 'var(--sapList_TextColor, #1d2d3e)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "var(--sapFontFamily,'72',sans-serif)" }}>
              {rel.name}
            </Text>
            <Text style={{ display: 'block', fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor, #556b82)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "var(--sapFontFamily,'72',sans-serif)" }}>
              {rel.type}
            </Text>
          </div>
          <Button icon="SAP-icons-v4/link" design="Transparent" style={{ flexShrink: 0 }} tooltip="Open" />
        </div>
      ))}
    </div>
  )
}

const WIDGET_RELATIONS: Record<string, Relation[]> = {
  // ── Recruit to Hire ───────────────────────────────────────────────────────────
  'rec-val-001':     [{ type: 'Process Task', name: 'Post Job Opening',        icon: 'workflow-tasks' }, { type: 'Process Task', name: 'Source Candidates',     icon: 'workflow-tasks' }, { type: 'Dashboard', name: 'TA Dashboard',      icon: 'performance' }],
  'rec-val-002':     [{ type: 'Process Task', name: 'Interview Candidate',      icon: 'workflow-tasks' }, { type: 'Process Task', name: 'Screen Applicants',     icon: 'workflow-tasks' }, { type: 'Dashboard', name: 'TA Dashboard',      icon: 'performance' }],
  'rec-val-003':     [{ type: 'Process Task', name: 'Screen Applicants',        icon: 'workflow-tasks' }, { type: 'KPI',          name: 'Quality of Hire',        icon: 'kpi-managing-my-area' }, { type: 'Dashboard', name: 'TA KPIs', icon: 'performance' }],
  'rec-val-004':     [{ type: 'Process Task', name: 'Extend Offer',             icon: 'workflow-tasks' }, { type: 'Process Task', name: 'Close Requisition',     icon: 'workflow-tasks' }, { type: 'Dashboard', name: 'TA KPIs',          icon: 'performance' }],
  'rec-val-005':     [{ type: 'Process Task', name: 'Extend Offer',             icon: 'workflow-tasks' }, { type: 'KPI',          name: 'Offer Acceptance Rate',  icon: 'kpi-managing-my-area' }, { type: 'Dashboard', name: 'TA KPIs', icon: 'performance' }],
  'rec-bar-001':     [{ type: 'Process Task', name: 'Screen Applicants',        icon: 'workflow-tasks' }, { type: 'Process Task', name: 'Interview Candidate',   icon: 'workflow-tasks' }, { type: 'Dashboard', name: 'TA Dashboard',      icon: 'performance' }],
  'rec-bar-002':     [{ type: 'Process Task', name: 'Source Candidates',        icon: 'workflow-tasks' }, { type: 'Process Task', name: 'Post Job Opening',      icon: 'workflow-tasks' }, { type: 'Dashboard', name: 'TA Investigation',  icon: 'performance' }],
  'rec-bar-003':     [{ type: 'Process Task', name: 'Interview Candidate',      icon: 'workflow-tasks' }, { type: 'KPI',          name: 'Interviewer Capacity',   icon: 'kpi-managing-my-area' }, { type: 'Dashboard', name: 'TA Analysis', icon: 'performance' }],
  'rec-line-001':    [{ type: 'Process Task', name: 'Interview Candidate',      icon: 'workflow-tasks' }, { type: 'KPI',          name: 'Interview Completion',   icon: 'kpi-managing-my-area' }, { type: 'Dashboard', name: 'TA Analysis', icon: 'performance' }],
  'rec-pie-001':     [{ type: 'Process Task', name: 'Source Candidates',        icon: 'workflow-tasks' }, { type: 'Process',      name: 'Recruit to Hire',        icon: 'business-objects-experience' }, { type: 'Dashboard', name: 'TA Dashboard', icon: 'performance' }],
  'dup-bar-001':     [{ type: 'Process Task', name: 'Screen Applicants',        icon: 'workflow-tasks' }, { type: 'Dashboard',    name: 'TA Dashboard',           icon: 'performance' }],
  // ── Order to Cash ─────────────────────────────────────────────────────────────
  'value-I-001':     [{ type: 'Process Task', name: 'Invoice Customer',         icon: 'workflow-tasks' }, { type: 'KPI',          name: 'Active Case Rate',       icon: 'kpi-managing-my-area' }, { type: 'Dashboard', name: 'O2C Performance',    icon: 'performance' }],
  'bar-chart-I-001': [{ type: 'Process Task', name: 'Create Sales Order',       icon: 'workflow-tasks' }, { type: 'Dashboard',    name: 'O2C Analysis',           icon: 'performance' }],
  'line-I-001':      [{ type: 'Process Task', name: 'Pick & Ship',              icon: 'workflow-tasks' }, { type: 'KPI',          name: 'Throughput Rate',        icon: 'kpi-managing-my-area' }, { type: 'Dashboard', name: 'O2C Analysis',       icon: 'performance' }],
  'area-I-001':      [{ type: 'Process Task', name: 'Create Sales Order',       icon: 'workflow-tasks' }, { type: 'Dashboard',    name: 'O2C Analysis',           icon: 'performance' }],
  'dual-I-001':      [{ type: 'Process Task', name: 'Receive Payment',          icon: 'workflow-tasks' }, { type: 'Process Task', name: 'Invoice Customer',       icon: 'workflow-tasks' }, { type: 'Dashboard', name: 'O2C Analysis',       icon: 'performance' }],
  'treemap-I-001':   [{ type: 'Process',      name: 'Order to Cash',            icon: 'business-objects-experience' }, { type: 'Dashboard', name: 'O2C Analysis', icon: 'performance' }],
  'sankey-I-002':    [{ type: 'Process Task', name: 'Pick & Ship',              icon: 'workflow-tasks' }, { type: 'Process',      name: 'Order to Cash',          icon: 'business-objects-experience' }, { type: 'Dashboard', name: 'O2C Analysis', icon: 'performance' }],
  'value-D-005':     [{ type: 'Process Task', name: 'Invoice Customer',         icon: 'workflow-tasks' }, { type: 'KPI',          name: 'Avg Cycle Time',         icon: 'kpi-managing-my-area' }, { type: 'Dashboard', name: 'O2C Performance',    icon: 'performance' }],
  'bar-chart-D-005': [{ type: 'Process Task', name: 'Check Credit',             icon: 'workflow-tasks' }, { type: 'Dashboard',    name: 'O2C Executive Summary',  icon: 'performance' }],
  'hist-I-002':      [{ type: 'Process Task', name: 'Create Sales Order',       icon: 'workflow-tasks' }, { type: 'Dashboard',    name: 'O2C Analysis',           icon: 'performance' }],
  'dup-bar-003':     [{ type: 'Process Task', name: 'Create Sales Order',       icon: 'workflow-tasks' }, { type: 'Dashboard',    name: 'O2C Executive Summary',  icon: 'performance' }],
  'heat-D-004':      [{ type: 'Process Task', name: 'Pick & Ship',              icon: 'workflow-tasks' }, { type: 'Process Task', name: 'Invoice Customer',       icon: 'workflow-tasks' }, { type: 'Dashboard', name: 'O2C Analysis',       icon: 'performance' }],
  'cockpit-I-001':   [{ type: 'Process',      name: 'Order to Cash',            icon: 'business-objects-experience' }, { type: 'KPI', name: 'Process Efficiency', icon: 'kpi-managing-my-area' }, { type: 'Dashboard', name: 'O2C Performance', icon: 'performance' }],
  'sentiment-I-001': [{ type: 'Process Task', name: 'Receive Payment',          icon: 'workflow-tasks' }, { type: 'KPI',          name: 'CSAT Score',             icon: 'kpi-managing-my-area' }, { type: 'Dashboard', name: 'O2C Performance',    icon: 'performance' }],
  // ── Procure to Pay ────────────────────────────────────────────────────────────
  'value-D-001':     [{ type: 'Process Task', name: 'Create Purchase Order',    icon: 'workflow-tasks' }, { type: 'Dashboard',    name: 'Procurement Dashboard',  icon: 'performance' }],
  'heat-D-001':      [{ type: 'Process Task', name: 'Verify Invoice',           icon: 'workflow-tasks' }, { type: 'Process Task', name: 'Process Payment',        icon: 'workflow-tasks' }, { type: 'Dashboard', name: 'Supplier Dashboard',    icon: 'performance' }],
  'area-D-001':      [{ type: 'Process Task', name: 'Receive Goods',            icon: 'workflow-tasks' }, { type: 'Dashboard',    name: 'Procurement Dashboard',  icon: 'performance' }],
  'bar-chart-D-001': [{ type: 'Process Task', name: 'Select Vendor',            icon: 'workflow-tasks' }, { type: 'Dashboard',    name: 'Procurement Dashboard',  icon: 'performance' }],
  'pie-D-001':       [{ type: 'Process Task', name: 'Create Purchase Order',    icon: 'workflow-tasks' }, { type: 'Process',      name: 'Procure to Pay',         icon: 'business-objects-experience' }, { type: 'Dashboard', name: 'Procurement Dashboard', icon: 'performance' }],
  'hist-I-003':      [{ type: 'Process Task', name: 'Receive Goods',            icon: 'workflow-tasks' }, { type: 'Dashboard',    name: 'P2P Analysis',           icon: 'performance' }],
  'area-D-004':      [{ type: 'Process Task', name: 'Process Payment',          icon: 'workflow-tasks' }, { type: 'Dashboard',    name: 'Procurement Dashboard',  icon: 'performance' }],
  'cockpit-D-001':   [{ type: 'Process Task', name: 'Select Vendor',            icon: 'workflow-tasks' }, { type: 'KPI',          name: 'Vendor Rating',          icon: 'kpi-managing-my-area' }, { type: 'Dashboard', name: 'Procurement Dashboard', icon: 'performance' }],
  'sentiment-D-001': [{ type: 'Process Task', name: 'Select Vendor',            icon: 'workflow-tasks' }, { type: 'KPI',          name: 'Vendor Satisfaction Score', icon: 'kpi-managing-my-area' }, { type: 'Dashboard', name: 'Procurement Dashboard', icon: 'performance' }],
  // ── Incident Management ───────────────────────────────────────────────────────
  'value-D-002':     [{ type: 'Process Task', name: 'Receive Incident',         icon: 'workflow-tasks' }, { type: 'Dashboard',    name: 'Incident Dashboard',     icon: 'performance' }],
  'bar-chart-D-002': [{ type: 'Process Task', name: 'Assign & Investigate',     icon: 'workflow-tasks' }, { type: 'Dashboard',    name: 'Incident Dashboard',     icon: 'performance' }],
  'heat-D-002':      [{ type: 'Process Task', name: 'Resolve Incident',         icon: 'workflow-tasks' }, { type: 'KPI',          name: 'Resolution Time',        icon: 'kpi-managing-my-area' }, { type: 'Dashboard', name: 'Incident Dashboard',     icon: 'performance' }],
  'pie-D-002':       [{ type: 'Process Task', name: 'Classify Incident',        icon: 'workflow-tasks' }, { type: 'Dashboard',    name: 'Incident Dashboard',     icon: 'performance' }],
  'area-D-003':      [{ type: 'Process Task', name: 'Receive Incident',         icon: 'workflow-tasks' }, { type: 'Dashboard',    name: 'Incident Dashboard',     icon: 'performance' }],
  'pie-D-003':       [{ type: 'Process Task', name: 'Close Incident',           icon: 'workflow-tasks' }, { type: 'Dashboard',    name: 'Incident Dashboard',     icon: 'performance' }],
  'line-I-005':      [{ type: 'Process Task', name: 'Receive Incident',         icon: 'workflow-tasks' }, { type: 'KPI',          name: 'Incident Volume',        icon: 'kpi-managing-my-area' }, { type: 'Dashboard', name: 'Incident Dashboard',     icon: 'performance' }],
  'treemap-I-004':   [{ type: 'Process Task', name: 'Classify Incident',        icon: 'workflow-tasks' }, { type: 'Process',      name: 'Incident Management',    icon: 'business-objects-experience' }, { type: 'Dashboard', name: 'Incident Dashboard', icon: 'performance' }],
  'value-D-006':     [{ type: 'Process Task', name: 'Resolve Incident',         icon: 'workflow-tasks' }, { type: 'KPI',          name: 'SLA Compliance',         icon: 'kpi-managing-my-area' }, { type: 'Dashboard', name: 'Incident Dashboard',     icon: 'performance' }],
  // ── Finance Close (R2R) ───────────────────────────────────────────────────────
  'value-D-003':     [{ type: 'Process Task', name: 'Close Sub-Ledgers',        icon: 'workflow-tasks' }, { type: 'Dashboard',    name: 'R2R Dashboard',          icon: 'performance' }],
  'bar-chart-D-003': [{ type: 'Process Task', name: 'Post Accruals',            icon: 'workflow-tasks' }, { type: 'Dashboard',    name: 'R2R Dashboard',          icon: 'performance' }],
  'line-I-002':      [{ type: 'Process Task', name: 'Reconcile Accounts',       icon: 'workflow-tasks' }, { type: 'Dashboard',    name: 'R2R Period Analysis',    icon: 'performance' }],
  'dual-I-002':      [{ type: 'Process Task', name: 'Review & Approve',         icon: 'workflow-tasks' }, { type: 'Process Task', name: 'Reconcile Accounts',     icon: 'workflow-tasks' }, { type: 'Dashboard', name: 'R2R Period Analysis',    icon: 'performance' }],
  'sankey-I-001':    [{ type: 'Process Task', name: 'Post Accruals',            icon: 'workflow-tasks' }, { type: 'Process',      name: 'Finance Close',          icon: 'business-objects-experience' }, { type: 'Dashboard', name: 'R2R Investigation',   icon: 'performance' }],
  'heat-D-003':      [{ type: 'Process Task', name: 'Reconcile Accounts',       icon: 'workflow-tasks' }, { type: 'Dashboard',    name: 'R2R Dashboard',          icon: 'performance' }],
  'line-I-004':      [{ type: 'Process Task', name: 'Review & Approve',         icon: 'workflow-tasks' }, { type: 'KPI',          name: 'Period Close KPI',       icon: 'kpi-managing-my-area' }, { type: 'Dashboard', name: 'R2R Dashboard',          icon: 'performance' }],
  'treemap-I-003':   [{ type: 'Process Task', name: 'Close Sub-Ledgers',        icon: 'workflow-tasks' }, { type: 'Process',      name: 'Finance Close',          icon: 'business-objects-experience' }, { type: 'Dashboard', name: 'R2R Dashboard',          icon: 'performance' }],
  'bar-chart-D-006': [{ type: 'Process Task', name: 'Post Accruals',            icon: 'workflow-tasks' }, { type: 'Dashboard',    name: 'R2R Dashboard',          icon: 'performance' }],
  'dual-I-003':      [{ type: 'Process Task', name: 'Reconcile Accounts',       icon: 'workflow-tasks' }, { type: 'Process Task', name: 'Review & Approve',       icon: 'workflow-tasks' }, { type: 'Dashboard', name: 'R2R Period Analysis',    icon: 'performance' }],
  'hist-I-004':      [{ type: 'Process Task', name: 'Post Accruals',            icon: 'workflow-tasks' }, { type: 'Dashboard',    name: 'R2R Investigation',      icon: 'performance' }],
  // ── HR Onboarding ─────────────────────────────────────────────────────────────
  'value-I-002':     [{ type: 'Process Task', name: 'Training Completion',      icon: 'workflow-tasks' }, { type: 'KPI',          name: 'Avg Onboarding Days',    icon: 'kpi-managing-my-area' }, { type: 'Dashboard', name: 'Onboarding KPIs',       icon: 'performance' }],
  'bar-chart-I-002': [{ type: 'Process Task', name: 'Manager Check-in',         icon: 'workflow-tasks' }, { type: 'Dashboard',    name: 'Onboarding Analysis',    icon: 'performance' }],
  'hist-I-001':      [{ type: 'Process Task', name: 'Complete Onboarding',      icon: 'workflow-tasks' }, { type: 'Dashboard',    name: 'Onboarding Analysis',    icon: 'performance' }],
  'line-I-003':      [{ type: 'Process Task', name: 'Setup IT Access',          icon: 'workflow-tasks' }, { type: 'Dashboard',    name: 'Onboarding Analysis',    icon: 'performance' }],
  'dup-bar-002':     [{ type: 'Process Task', name: 'Training Completion',      icon: 'workflow-tasks' }, { type: 'Dashboard',    name: 'Onboarding Analysis',    icon: 'performance' }],
  'sankey-I-003':    [{ type: 'Process Task', name: 'Manager Check-in',         icon: 'workflow-tasks' }, { type: 'Process',      name: 'HR Onboarding',          icon: 'business-objects-experience' }, { type: 'Dashboard', name: 'HR Analysis',           icon: 'performance' }],
  'pie-D-004':       [{ type: 'Process Task', name: 'Initiate Onboarding',      icon: 'workflow-tasks' }, { type: 'Dashboard',    name: 'Recruitment KPIs',       icon: 'performance' }],
  'cockpit-I-002':   [{ type: 'Process',      name: 'HR Onboarding',            icon: 'business-objects-experience' }, { type: 'KPI', name: 'Onboarding Quality Index', icon: 'kpi-managing-my-area' }, { type: 'Dashboard', name: 'Onboarding KPIs', icon: 'performance' }],
  'sentiment-I-002': [{ type: 'Process Task', name: 'Complete Onboarding',      icon: 'workflow-tasks' }, { type: 'KPI',          name: 'eNPS Score',             icon: 'kpi-managing-my-area' }, { type: 'Dashboard', name: 'Onboarding KPIs',       icon: 'performance' }],
  // ── Production ────────────────────────────────────────────────────────────────
  'value-D-004':     [{ type: 'Process Task', name: 'Confirm Production',       icon: 'workflow-tasks' }, { type: 'KPI',          name: 'On-Time Delivery Rate',  icon: 'kpi-managing-my-area' }, { type: 'Dashboard', name: 'Production KPIs',       icon: 'performance' }],
  'treemap-I-002':   [{ type: 'Process Task', name: 'Plan Production',          icon: 'workflow-tasks' }, { type: 'Process',      name: 'Production',             icon: 'business-objects-experience' }, { type: 'Dashboard', name: 'Supply Chain Overview',  icon: 'performance' }],
  'bar-chart-D-004': [{ type: 'Process Task', name: 'Release Work Order',       icon: 'workflow-tasks' }, { type: 'Dashboard',    name: 'P2P Dashboard',          icon: 'performance' }],
  'area-D-002':      [{ type: 'Process Task', name: 'Execute Production',       icon: 'workflow-tasks' }, { type: 'Dashboard',    name: 'P2P Dashboard',          icon: 'performance' }],
  'dual-D-002':      [{ type: 'Process Task', name: 'Quality Inspection',       icon: 'workflow-tasks' }, { type: 'Process Task', name: 'Confirm Production',     icon: 'workflow-tasks' }, { type: 'Dashboard', name: 'Production KPIs',       icon: 'performance' }],
  'sankey-I-004':    [{ type: 'Process Task', name: 'Execute Production',       icon: 'workflow-tasks' }, { type: 'Process',      name: 'Production',             icon: 'business-objects-experience' }, { type: 'Dashboard', name: 'P2P Analysis',          icon: 'performance' }],
  // ── External Widgets ──────────────────────────────────────────────────────────
  'ext-001':         [{ type: 'Data Source', name: 'Tableau',                   icon: 'database' }, { type: 'Dashboard', name: 'Sales Overview',              icon: 'performance' }],
  'ext-002':         [{ type: 'Data Source', name: 'Looker Studio',             icon: 'database' }, { type: 'Dashboard', name: 'Marketing Performance',        icon: 'performance' }],
  'ext-003':         [{ type: 'Data Source', name: 'Power BI',                  icon: 'database' }, { type: 'KPI',       name: 'Revenue Target',               icon: 'kpi-managing-my-area' }],
  'ext-004':         [{ type: 'Data Source', name: 'Analytics Cloud',       icon: 'database' }, { type: 'Process',   name: 'Finance Close',                icon: 'business-objects-experience' }, { type: 'Dashboard', name: 'Cost Center Overview', icon: 'performance' }],
  'ext-005':         [{ type: 'Data Source', name: 'Grafana',                   icon: 'database' }, { type: 'Process',   name: 'HR Onboarding',                icon: 'business-objects-experience' }],
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
      <div style={{ paddingBottom: '16px' }}>
        {(() => {
          const relations = WIDGET_RELATIONS[widget.id] ?? []
          if (relations.length === 0) {
            return (
              <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)' }}>
                No relations defined.
              </Text>
            )
          }
          const ORDER = ['Process Task', 'Dashboard', 'KPI', 'Process', 'Data Source']
          const grouped = relations.reduce<Record<string, Relation[]>>((acc, r) => {
            ;(acc[r.type] ??= []).push(r)
            return acc
          }, {})
          const sortedKeys = Object.keys(grouped).sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b))
          return sortedKeys.map(type => (
            <RelationGroup key={type} label={`${type}s`} items={grouped[type]} />
          ))
        })()}
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
