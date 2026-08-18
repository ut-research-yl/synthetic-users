import React, { useState, useMemo, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  Dialog, Bar, Title, Button, Icon, Input,
  Select, Option, List, ListItemCustom,
  SegmentedButton, SegmentedButtonItem, MessageStrip, Text, RadioButton,
  Label, Breadcrumbs, BreadcrumbsItem, Wizard, WizardStep, IllustratedMessage,
  Table, TableRow, TableCell, TableHeaderRow, TableHeaderCell,
} from '@ui5/webcomponents-react'
import { EXTERNAL_WIDGETS, METRICS } from './DataPanel'

// ── Shared data ───────────────────────────────────────────────────────────────

const CWD_WIDGETS: Record<string, { name: string; type: string; path: string }> = {
  'value-I-001':     { name: 'Active Cases',              type: 'Value',          path: 'Order to Cash / O2C Analysis / Overview' },
  'value-I-002':     { name: 'Avg Onboarding Days',       type: 'Value',          path: 'O2C Onboarding / Onboarding Analysis / Main' },
  'value-D-001':     { name: 'Total Orders',              type: 'Value',          path: 'Order to Cash / O2C Dashboard / Overview' },
  'value-D-002':     { name: 'Active Cases',              type: 'Value',          path: 'O2C Onboarding / Onboarding Dashboard / Overview' },
  'value-D-003':     { name: 'Closed Items',              type: 'Value',          path: 'Record to Report / R2R Dashboard / Overview' },
  'value-D-004':     { name: 'On-Time Delivery Rate',     type: 'Value',          path: 'Plan to Produce / Production Dashboard / Overview' },
  'value-D-005':     { name: 'Open Orders',               type: 'Value',          path: 'Order to Cash / O2C Dashboard / Summary' },
  'bar-chart-I-001': { name: 'Case Volume by Region',     type: 'Bar Chart',      path: 'Order to Cash / O2C Analysis / Overview' },
  'bar-chart-I-002': { name: 'Onboarding Duration',       type: 'Bar Chart',      path: 'O2C Onboarding / Onboarding Analysis / Detail' },
  'bar-chart-D-001': { name: 'Customer Count by Country', type: 'Bar Chart',      path: 'Order to Cash / O2C Dashboard / Overview' },
  'bar-chart-D-002': { name: 'Throughput by Team',        type: 'Bar Chart',      path: 'Record to Report / R2R Analysis / Overview' },
  'bar-chart-D-003': { name: 'Posting Volume by Period',  type: 'Bar Chart',      path: 'Record to Report / R2R Analysis / Trends' },
  'bar-chart-D-004': { name: 'Production Volume',         type: 'Bar Chart',      path: 'Plan to Produce / Production Dashboard / Overview' },
  'line-I-001':      { name: 'Throughput Time Trend',     type: 'Line Chart',     path: 'Order to Cash / O2C Analysis / Trends' },
  'line-I-002':      { name: 'Period Comparison',         type: 'Line Chart',     path: 'Record to Report / R2R Analysis / Overview' },
  'line-I-003':      { name: 'Step Duration Trend',       type: 'Line Chart',     path: 'O2C Onboarding / Onboarding Analysis / Detail' },
  'line-D-001':      { name: 'Revenue Trend',             type: 'Line Chart',     path: 'Order to Cash / O2C Dashboard / Trends' },
  'line-D-002':      { name: 'Trend Overview',            type: 'Line Chart',     path: 'Record to Report / R2R Dashboard / Trends' },
  'area-I-001':      { name: 'Volume over Time',          type: 'Area Chart',     path: 'Order to Cash / O2C Analysis / Overview' },
  'area-D-001':      { name: 'Monthly Volume',            type: 'Area Chart',     path: 'Order to Cash / O2C Dashboard / Overview' },
  'area-D-002':      { name: 'Monthly Events',            type: 'Area Chart',     path: 'Record to Report / R2R Dashboard / Overview' },
  'area-D-003':      { name: 'Weekly Trends',             type: 'Area Chart',     path: 'O2C Onboarding / Onboarding Dashboard / Trends' },
  'dual-I-001':      { name: 'Cycle Time vs Volume',      type: 'Dual Axis Chart',path: 'Order to Cash / O2C Analysis / Comparisons' },
  'dual-I-002':      { name: 'Ledger Balance vs Entries', type: 'Dual Axis Chart',path: 'Record to Report / R2R Analysis / Comparisons' },
  'dual-D-001':      { name: 'Revenue vs Cost',           type: 'Dual Axis Chart',path: 'Order to Cash / O2C Dashboard / Comparisons' },
  'dual-D-002':      { name: 'Plan vs Actual',            type: 'Dual Axis Chart',path: 'Plan to Produce / Production Dashboard / Comparisons' },
  'pie-D-001':       { name: 'Order Distribution',        type: 'Pie Chart',      path: 'Order to Cash / O2C Dashboard / Overview' },
  'pie-D-002':       { name: 'Case Distribution',         type: 'Pie Chart',      path: 'O2C Onboarding / Onboarding Dashboard / Overview' },
  'pie-D-003':       { name: 'Status Breakdown',          type: 'Pie Chart',      path: 'Record to Report / R2R Dashboard / Overview' },
  'treemap-I-001':   { name: 'Process Variants',          type: 'Treemap',        path: 'Order to Cash / O2C Analysis / Variants' },
  'treemap-I-002':   { name: 'Production Category Mix',   type: 'Treemap',        path: 'Plan to Produce / Production Analysis / Overview' },
  'treemap-I-003':   { name: 'Account Category Mix',      type: 'Treemap',        path: 'Record to Report / R2R Investigation / Main' },
  'heat-D-001':      { name: 'Bottleneck Heatmap',        type: 'Heat Map',       path: 'Order to Cash / O2C Dashboard / Comparisons' },
  'heat-D-002':      { name: 'Delay Heatmap',             type: 'Heat Map',       path: 'O2C Onboarding / Onboarding Dashboard / Comparisons' },
  'heat-D-003':      { name: 'Period Heatmap',            type: 'Heat Map',       path: 'Record to Report / R2R Dashboard / Comparisons' },
  'ring-I-001':      { name: 'Completion Rate',           type: 'Ring Chart',     path: 'Order to Cash / O2C Analysis / Overview' },
  'ring-I-002':      { name: 'Compliance Rate',           type: 'Ring Chart',     path: 'Record to Report / R2R Analysis / Overview' },
  'ring-I-003':      { name: 'Automation Rate',           type: 'Ring Chart',     path: 'Order to Cash / O2C Analysis / Overview' },
  'ring-D-001':      { name: 'Fill Rate',                 type: 'Ring Chart',     path: 'Plan to Produce / Production Dashboard / Overview' },
  'sankey-I-001':    { name: 'Process Flow Sankey',       type: 'Sankey Chart',   path: 'Order to Cash / O2C Analysis / Flow' },
  'sankey-I-002':    { name: 'Variant Flow Analysis',     type: 'Sankey Chart',   path: 'Order to Cash / O2C Analysis / Variants' },
  'hist-I-001':      { name: 'Case Duration Distribution',type: 'Histogram',      path: 'O2C Onboarding / Onboarding Analysis / Funnel' },
  'hist-I-002':      { name: 'Case Duration Spread',      type: 'Histogram',      path: 'Order to Cash / O2C Analysis / Detail' },
  'rec-val-001':     { name: 'Open Positions',            type: 'Value',          path: 'Recruit to Hire / TA Dashboard / Overview' },
  'rec-val-002':     { name: 'Candidates in Pipeline',    type: 'Value',          path: 'Recruit to Hire / TA Dashboard / Overview' },
  'rec-val-003':     { name: 'Screening Pass Rate',       type: 'Value',          path: 'Recruit to Hire / TA KPIs / Summary' },
  'rec-val-004':     { name: 'Time to Hire',              type: 'Value',          path: 'Recruit to Hire / TA KPIs / Summary' },
  'rec-val-005':     { name: 'Offer Acceptance Rate',     type: 'Value',          path: 'Recruit to Hire / TA KPIs / Summary' },
  'rec-bar-001':     { name: 'Candidates by Stage',       type: 'Bar Chart',      path: 'Recruit to Hire / TA Dashboard / Pipeline' },
  'rec-bar-002':     { name: 'Applications by Source',   type: 'Bar Chart',      path: 'Recruit to Hire / TA Investigation / Analysis' },
  'rec-bar-003':     { name: 'Interviewer Workload',      type: 'Bar Chart',      path: 'Recruit to Hire / TA Analysis / Overview' },
  'rec-line-001':    { name: 'Interview Completion Rate', type: 'Line Chart',     path: 'Recruit to Hire / TA Analysis / Overview' },
  'rec-pie-001':     { name: 'Candidate Source Breakdown',type: 'Pie Chart',      path: 'Recruit to Hire / TA Dashboard / Overview' },
}

type PageMap = Record<string, string[]>
type SectionMap = Record<string, { pages: PageMap }>
type CwdProcess = { cases: string; events: string; lastEdited: string; Investigation?: SectionMap; Dashboard?: SectionMap }

const CWD_DATA: Record<string, CwdProcess> = {
  'Order to Cash':      { cases: '306k', events: '12m', lastEdited: '08/20/2025', Investigation: { 'O2C Analysis': { pages: { Overview: ['value-I-001','bar-chart-I-001'], Detail: ['treemap-I-001'], Variants: ['sankey-I-002'], Trends: ['line-I-001'], Comparisons: ['dual-I-001'], Flow: ['sankey-I-001'] } } }, Dashboard: { 'O2C Dashboard': { pages: { Overview: ['value-D-001','pie-D-001','area-D-001'], Comparisons: ['bar-chart-D-001','heat-D-001','dual-D-001'], Trends: ['line-D-001'], Summary: ['value-D-005'] } } } },
  'O2C Onboarding': { cases: '128k', events: '8m',  lastEdited: '08/20/2025', Investigation: { 'Onboarding Analysis': { pages: { Main: ['bar-chart-I-002','value-I-002'], Funnel: ['hist-I-001'], Detail: ['line-I-003'] } } }, Dashboard: { 'Onboarding Dashboard': { pages: { Overview: ['bar-chart-D-002','value-D-002','pie-D-002'], Comparisons: ['heat-D-002'], Trends: ['area-D-003'] } } } },
  'Record to Report':   { cases: '94k',  events: '5m',  lastEdited: '08/20/2025', Investigation: { 'R2R Analysis': { pages: { Overview: ['ring-I-002','line-I-002','bar-chart-D-002'], Comparisons: ['dual-I-002'], Trends: ['bar-chart-D-003'], Main: ['ring-I-002','line-I-002'] } } }, Dashboard: { 'R2R Dashboard': { pages: { Overview: ['value-D-003','area-D-002','pie-D-003'], Comparisons: ['heat-D-003'], Trends: ['line-D-002'] } } } },
  'Plan to Produce':    { cases: '215k', events: '10m', lastEdited: '08/20/2025', Investigation: { 'Production Analysis': { pages: { Overview: ['bar-chart-D-004','value-D-004','treemap-I-002'], Comparisons: ['dual-D-002'] } } }, Dashboard: { 'Production Dashboard': { pages: { Overview: ['value-D-004','ring-D-001','bar-chart-D-004'], Comparisons: ['dual-D-002'] } } } },
  'Procure to Pay':     { cases: '183k', events: '9m',  lastEdited: '07/15/2025', Investigation: { 'P2P Analysis': { pages: { Overview: ['bar-chart-I-001','value-I-001'], Detail: ['hist-I-002'] } } }, Dashboard: { 'Procurement Dashboard': { pages: { Overview: ['value-D-001','pie-D-001'], Trends: ['line-D-001'] } } } },
  'Hire to Retire':     { cases: '47k',  events: '3m',  lastEdited: '06/10/2025', Investigation: { 'HR Analysis': { pages: { Overview: ['ring-I-001','value-I-002'] } } }, Dashboard: { 'HR Dashboard': { pages: { Overview: ['value-D-002','bar-chart-D-002'] } }, 'Recruitment KPIs': { pages: { Summary: ['value-I-002'] } } } },
  'Recruit to Hire':    { cases: '62k',  events: '4m',  lastEdited: '08/05/2025', Investigation: { 'TA Investigation': { pages: { Overview: ['rec-val-002','rec-bar-001'], Analysis: ['rec-bar-002','rec-line-001'] } }, 'Screening Analysis': { pages: { Overview: ['rec-val-003'] } } }, Dashboard: { 'TA Dashboard': { pages: { Overview: ['rec-val-001','rec-val-002','rec-pie-001'], Pipeline: ['rec-bar-001'] } }, 'TA KPIs': { pages: { Summary: ['rec-val-004','rec-val-005'] } }, 'TA Analysis': { pages: { Overview: ['rec-bar-003','rec-line-001'] } } } },
}

const WIDGET_META: Record<string, { name: string; type: string }> = Object.fromEntries(
  Object.entries(CWD_WIDGETS).map(([id, w]) => [id, { name: w.name, type: w.type }])
)

const PREVIEW_CHARTS: Record<string, string> = {
  'Bar Chart':       '<svg width="100%" height="100%" viewBox="0 0 400 240" fill="none"><line x1="36" y1="20" x2="390" y2="20" stroke="#e8ecf0" stroke-width="1"/><line x1="36" y1="70" x2="390" y2="70" stroke="#e8ecf0" stroke-width="1"/><line x1="36" y1="120" x2="390" y2="120" stroke="#e8ecf0" stroke-width="1"/><line x1="36" y1="170" x2="390" y2="170" stroke="#e8ecf0" stroke-width="1"/><line x1="36" y1="20" x2="36" y2="210" stroke="#e8ecf0" stroke-width="1"/><rect x="50" y="60" width="40" height="150" rx="2" fill="#0064d9"/><rect x="110" y="90" width="40" height="120" rx="2" fill="#0064d9"/><rect x="170" y="30" width="40" height="180" rx="2" fill="#0064d9"/><rect x="230" y="75" width="40" height="135" rx="2" fill="#0064d9"/><rect x="290" y="110" width="40" height="100" rx="2" fill="#0064d9"/><rect x="350" y="130" width="40" height="80" rx="2" fill="#0064d9" opacity=".6"/><line x1="36" y1="210" x2="390" y2="210" stroke="#e8ecf0" stroke-width="1.5"/><text x="70" y="225" text-anchor="middle" font-size="10" fill="#8c9bab" font-family="72,Arial">Jan</text><text x="190" y="225" text-anchor="middle" font-size="10" fill="#8c9bab" font-family="72,Arial">Mar</text><text x="310" y="225" text-anchor="middle" font-size="10" fill="#8c9bab" font-family="72,Arial">May</text></svg>',
  'Line Chart':      '<svg width="100%" height="100%" viewBox="0 0 400 240" fill="none"><line x1="36" y1="20" x2="390" y2="20" stroke="#e8ecf0" stroke-width="1"/><line x1="36" y1="70" x2="390" y2="70" stroke="#e8ecf0" stroke-width="1"/><line x1="36" y1="120" x2="390" y2="120" stroke="#e8ecf0" stroke-width="1"/><line x1="36" y1="170" x2="390" y2="170" stroke="#e8ecf0" stroke-width="1"/><line x1="36" y1="20" x2="36" y2="210" stroke="#e8ecf0" stroke-width="1"/><line x1="36" y1="210" x2="390" y2="210" stroke="#e8ecf0" stroke-width="1.5"/><polyline points="70,160 130,110 190,55 250,90 310,70 370,120" stroke="#0064d9" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="70" cy="160" r="4" fill="#fff" stroke="#0064d9" stroke-width="2.5"/><circle cx="130" cy="110" r="4" fill="#fff" stroke="#0064d9" stroke-width="2.5"/><circle cx="190" cy="55" r="4" fill="#fff" stroke="#0064d9" stroke-width="2.5"/><circle cx="250" cy="90" r="4" fill="#fff" stroke="#0064d9" stroke-width="2.5"/><circle cx="310" cy="70" r="4" fill="#fff" stroke="#0064d9" stroke-width="2.5"/><circle cx="370" cy="120" r="4" fill="#fff" stroke="#0064d9" stroke-width="2.5"/></svg>',
  'Area Chart':      '<svg width="100%" height="100%" viewBox="0 0 400 240" fill="none"><defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0064d9" stop-opacity=".25"/><stop offset="100%" stop-color="#0064d9" stop-opacity=".02"/></linearGradient></defs><line x1="36" y1="20" x2="390" y2="20" stroke="#e8ecf0" stroke-width="1"/><line x1="36" y1="120" x2="390" y2="120" stroke="#e8ecf0" stroke-width="1"/><line x1="36" y1="20" x2="36" y2="210" stroke="#e8ecf0" stroke-width="1"/><line x1="36" y1="210" x2="390" y2="210" stroke="#e8ecf0" stroke-width="1.5"/><polygon points="70,160 130,110 190,55 250,90 310,70 370,120 370,210 70,210" fill="url(#ag)"/><polyline points="70,160 130,110 190,55 250,90 310,70 370,120" stroke="#0064d9" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  'Dual Axis Chart': '<svg width="100%" height="100%" viewBox="0 0 400 240" fill="none"><line x1="36" y1="20" x2="390" y2="20" stroke="#e8ecf0" stroke-width="1"/><line x1="36" y1="70" x2="390" y2="70" stroke="#e8ecf0" stroke-width="1"/><line x1="36" y1="120" x2="390" y2="120" stroke="#e8ecf0" stroke-width="1"/><line x1="36" y1="170" x2="390" y2="170" stroke="#e8ecf0" stroke-width="1"/><line x1="36" y1="20" x2="36" y2="210" stroke="#e8ecf0" stroke-width="1"/><line x1="36" y1="210" x2="390" y2="210" stroke="#e8ecf0" stroke-width="1.5"/><rect x="52" y="80" width="32" height="130" rx="2" fill="#0064d9" opacity=".85"/><rect x="110" y="60" width="32" height="150" rx="2" fill="#0064d9" opacity=".85"/><rect x="168" y="35" width="32" height="175" rx="2" fill="#0064d9" opacity=".85"/><rect x="226" y="75" width="32" height="135" rx="2" fill="#0064d9" opacity=".85"/><rect x="284" y="100" width="32" height="110" rx="2" fill="#0064d9" opacity=".85"/><polyline points="68,130 126,85 184,50 242,100 300,75" stroke="#e87722" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  'Pie Chart':       '<svg width="100%" height="100%" viewBox="0 0 400 240" fill="none"><circle cx="155" cy="118" r="90" fill="#e8ecf0"/><path d="M155 118 L155 28 A90 90 0 0 1 233 163 Z" fill="#0064d9"/><path d="M155 118 L233 163 A90 90 0 0 1 90 190 Z" fill="#5599d4"/><path d="M155 118 L90 190 A90 90 0 0 1 77 73 Z" fill="#91bfe9"/><path d="M155 118 L77 73 A90 90 0 0 1 155 28 Z" fill="#c5dff4"/><circle cx="155" cy="118" r="45" fill="#fff"/></svg>',
  'Ring Chart':      '<svg width="100%" height="100%" viewBox="0 0 400 240" fill="none"><circle cx="140" cy="118" r="72" stroke="#e8ecf0" stroke-width="32" fill="none"/><circle cx="140" cy="118" r="72" stroke="#0064d9" stroke-width="32" fill="none" stroke-dasharray="302 150" stroke-dashoffset="113"/><text x="140" y="110" text-anchor="middle" font-size="30" font-weight="700" fill="#131e29" font-family="72,Arial">73%</text><text x="140" y="132" text-anchor="middle" font-size="12" fill="#8c9bab" font-family="72,Arial">Automation</text></svg>',
  'Treemap':         '<svg width="100%" height="100%" viewBox="0 0 400 240" fill="none"><rect x="8" y="8" width="180" height="140" rx="3" fill="#0064d9"/><text x="98" y="82" text-anchor="middle" font-size="13" fill="#fff" font-family="72,Arial" font-weight="700">Category A 45%</text><rect x="196" y="8" width="100" height="68" rx="3" fill="#5599d4"/><text x="246" y="46" text-anchor="middle" font-size="11" fill="#fff" font-family="72,Arial" font-weight="600">B · 22%</text><rect x="304" y="8" width="88" height="68" rx="3" fill="#91bfe9"/><rect x="196" y="84" width="100" height="64" rx="3" fill="#b8d4f0"/><rect x="304" y="84" width="88" height="64" rx="3" fill="#d8eaf8"/></svg>',
  'Heat Map':        '<svg width="100%" height="100%" viewBox="0 0 400 240" fill="none"><rect x="28" y="42" width="48" height="36" rx="3" fill="#0064d9" opacity=".85"/><rect x="84" y="42" width="48" height="36" rx="3" fill="#0064d9" opacity=".3"/><rect x="140" y="42" width="48" height="36" rx="3" fill="#0064d9" opacity=".65"/><rect x="196" y="42" width="48" height="36" rx="3" fill="#0064d9" opacity=".15"/><rect x="252" y="42" width="48" height="36" rx="3" fill="#0064d9" opacity=".5"/><rect x="28" y="84" width="48" height="36" rx="3" fill="#0064d9" opacity=".4"/><rect x="84" y="84" width="48" height="36" rx="3" fill="#0064d9" opacity=".95"/><rect x="140" y="84" width="48" height="36" rx="3" fill="#0064d9" opacity=".75"/><rect x="196" y="84" width="48" height="36" rx="3" fill="#0064d9" opacity=".6"/><rect x="252" y="84" width="48" height="36" rx="3" fill="#0064d9" opacity=".35"/></svg>',
  'Sankey Chart':    '<svg width="100%" height="100%" viewBox="0 0 400 240" fill="none"><rect x="8" y="20" width="14" height="80" rx="2" fill="#0064d9"/><rect x="8" y="112" width="14" height="55" rx="2" fill="#5599d4"/><path d="M22 35 C140 35 140 65 200 65" stroke="#0064d9" stroke-width="50" fill="none" opacity=".2"/><path d="M22 130 C140 130 140 100 200 100" stroke="#5599d4" stroke-width="35" fill="none" opacity=".2"/><rect x="196" y="30" width="14" height="60" rx="2" fill="#0064d9"/><rect x="196" y="98" width="14" height="40" rx="2" fill="#5599d4"/><path d="M210 45 C310 45 310 80 378 80" stroke="#0064d9" stroke-width="40" fill="none" opacity=".2"/><rect x="378" y="55" width="14" height="55" rx="2" fill="#0064d9"/></svg>',
  'Histogram':       '<svg width="100%" height="100%" viewBox="0 0 400 240" fill="none"><line x1="36" y1="20" x2="36" y2="210" stroke="#e8ecf0" stroke-width="1"/><line x1="36" y1="210" x2="390" y2="210" stroke="#e8ecf0" stroke-width="1.5"/><rect x="40" y="190" width="54" height="20" fill="#0064d9" opacity=".5"/><rect x="94" y="165" width="54" height="45" fill="#0064d9" opacity=".65"/><rect x="148" y="120" width="54" height="90" fill="#0064d9" opacity=".8"/><rect x="202" y="60" width="54" height="150" fill="#0064d9"/><rect x="256" y="85" width="54" height="125" fill="#0064d9" opacity=".85"/><rect x="310" y="140" width="54" height="70" fill="#0064d9" opacity=".65"/></svg>',
  'Value':           '<svg width="100%" height="100%" viewBox="0 0 400 240" fill="none"><text x="200" y="90" text-anchor="middle" font-size="52" font-weight="700" fill="#0064d9" font-family="72,Arial">4,218</text><text x="200" y="120" text-anchor="middle" font-size="13" fill="#556b82" font-family="72,Arial">Total Cases</text><line x1="80" y1="145" x2="320" y2="145" stroke="#e8ecf0" stroke-width="1.5"/><rect x="155" y="160" width="12" height="12" rx="2" fill="#27a65a"/><text x="172" y="171" font-size="13" fill="#27a65a" font-family="72,Arial" font-weight="600">↑ 12.3%</text><text x="200" y="195" text-anchor="middle" font-size="11" fill="#8c9bab" font-family="72,Arial">vs. last period</text></svg>',
}

const TYPE_ICON: Record<string, string> = {
  'Value': 'SAP-icons-v4/number', 'Bar Chart': 'bar-chart', 'Line Chart': 'line-chart',
  'Area Chart': 'area-chart', 'Dual Axis Chart': 'line-chart-dual-axis', 'Pie Chart': 'pie-chart',
  'Treemap': 'SAP-icons-v4/graph-histogram', 'Heat Map': 'heatmap-chart',
  'Sankey Chart': 'SAP-icons-v4/graph-sankey', 'Histogram': 'SAP-icons-v4/graph-histogram',
  'Ring Chart': 'SAP-icons-v4/ring-chart',
  'External Widget': 'SAP-icons-v4/link', 'Metric': 'SAP-icons-v4/link',
}

const LI_SUGGESTED: Record<string, string[]> = {
  'Indicator': ['Value', 'Bar Chart', 'Histogram'], 'Traffic Light': ['Value', 'Bar Chart', 'Heat Map'],
  'Cockpit': ['Value', 'Line Chart', 'Dual Axis Chart', 'Area Chart'], 'Value': ['Value'],
  'Trend': ['Line Chart', 'Area Chart', 'Dual Axis Chart', 'Sankey Chart'],
  'Progress Bar': ['Bar Chart', 'Histogram', 'Treemap'], 'Ring Chart': ['Pie Chart', 'Treemap'],
  'Sentiment': ['Value', 'Pie Chart', 'Bar Chart'],
}

const TYPE_ORDER = ['Bar Chart','Line Chart','Area Chart','Dual Axis Chart','Pie Chart','Treemap','Heat Map','Sankey Chart','Histogram','Value','External Widget','Metric']

type UnifiedWidget = { id: string; name: string; type: string; subline: string; source?: string; url?: string; metricKind?: string }
const ALL_WIDGETS: UnifiedWidget[] = [
  ...Object.entries(CWD_WIDGETS).map(([id, w]) => ({ id, name: w.name, type: w.type, subline: w.path })),
  ...EXTERNAL_WIDGETS.map(w => ({ id: w.id, name: w.name, type: 'External Widget', subline: w.source, source: w.source, url: w.url })),
  ...METRICS.map(w => ({ id: w.id, name: w.name, type: 'Metric', subline: `${w.metricKind} · ${w.source}`, source: w.source, metricKind: w.metricKind })),
]

const METRIC_PREVIEW_DATA: Record<string, { value: string; change: string; up: boolean; color: string }> = {
  NPS:    { value: '45',    change: '+3 vs last month',   up: true,  color: '#B8CC00' },
  CSAT:   { value: '78%',   change: '-2% vs last month',  up: false, color: '#E9730C' },
  CES:    { value: '2.3',   change: '+0.1 vs last month', up: true,  color: '#B8CC00' },
  Custom: { value: '1,248', change: '+124 vs last month', up: true,  color: '#0064d9' },
}

type Props = {
  open: boolean
  shapeType: string
  currentWidgetId?: string
  onConnect: (widgetId: string, widgetName: string, widgetType: string) => void
  onClose: () => void
}

export default function ConnectWidgetSearchDialog({ open, shapeType, currentWidgetId, onConnect, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<'Search' | 'Browse'>('Search')

  // Search tab state
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [selectedSearchId, setSelectedSearchId] = useState<string | null>(currentWidgetId ?? null)
  const [stripVisible, setStripVisible] = useState(true)

  // Browse tab state
  const [browseStep, setBrowseStep] = useState(1)
  const [selectedProcess, setSelectedProcess] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<'Investigation' | 'Dashboard' | null>(null)
  const [selectedSource, setSelectedSource] = useState('')
  const [selectedPage, setSelectedPage] = useState('')
  const [selectedBrowseId, setSelectedBrowseId] = useState<string | null>(null)
  const [processSearch, setProcessSearch] = useState('')
  const wizardRef = useRef<any>(null)

  useEffect(() => {
    if (activeTab !== 'Browse') return
    setTimeout(() => {
      const wiz = wizardRef.current
      if (!wiz?.shadowRoot) return
      const root = wiz.shadowRoot.querySelector('.ui5-wiz-root') as HTMLElement
      if (root) { root.style.width = '100%'; root.style.minHeight = 'unset' }
      const nav = wiz.shadowRoot.querySelector('.ui5-wiz-nav') as HTMLElement
      if (nav) { nav.style.width = '100%'; nav.style.paddingInlineEnd = '0'; nav.style.paddingRight = '0' }
      const content = wiz.shadowRoot.querySelector('.ui5-wiz-content') as HTMLElement
      if (content) content.style.display = 'none'
    }, 50)
  }, [activeTab, browseStep])

  const isValueShape = shapeType === 'Value'
  const suggested = LI_SUGGESTED[shapeType] ?? []

  const filteredWidgets = useMemo(() => {
    const q = search.toLowerCase()
    return ALL_WIDGETS.filter(w => {
      if (isValueShape && w.type !== 'Value') return false
      if (typeFilter && w.type !== typeFilter) return false
      if (q && !w.name.toLowerCase().includes(q) && !w.id.toLowerCase().includes(q)) return false
      return true
    }).sort((a, b) => a.name.localeCompare(b.name))
  }, [search, typeFilter, isValueShape])

  const selectedSearchWidget = selectedSearchId ? ALL_WIDGETS.find(w => w.id === selectedSearchId) ?? null : null

  const procData = selectedProcess ? CWD_DATA[selectedProcess] : null
  const sources = selectedType && procData?.[selectedType] ? Object.keys(procData[selectedType]!) : []
  const pages = selectedSource && selectedType && procData?.[selectedType]?.[selectedSource]
    ? Object.keys(procData[selectedType]![selectedSource].pages) : []
  const widgetIds = selectedPage && selectedSource && selectedType && procData?.[selectedType]?.[selectedSource]?.pages[selectedPage]
    ? procData[selectedType]![selectedSource].pages[selectedPage] : []
  const filteredProcesses = processSearch
    ? Object.entries(CWD_DATA).filter(([n]) => n.toLowerCase().includes(processSearch.toLowerCase()))
    : Object.entries(CWD_DATA)

  const browseNextDisabled = browseStep === 1 ? !selectedProcess : browseStep === 2 ? !selectedType : !selectedBrowseId
  const activeId = activeTab === 'Search' ? selectedSearchId : selectedBrowseId
  const canConnect = !!activeId

  if (!open) return null

  const handleConnect = () => {
    const id = activeTab === 'Search' ? selectedSearchId : selectedBrowseId
    if (!id) return
    const item = ALL_WIDGETS.find(w => w.id === id)
    if (item) { onConnect(id, item.name, item.type); onClose() }
  }

  return createPortal(
    <Dialog
      open={open}
      onClose={onClose}
      className="connect-widget-dialog"
      style={{ '--_ui5_dialog_content_padding_block': '0', '--_ui5_dialog_content_padding_inline': '0', width: '68rem', height: '46rem' } as React.CSSProperties}
      header={<Bar style={{ '--_ui5_bar_base_padding_inline': '2rem' } as React.CSSProperties}><Title slot="startContent" level="H4">Connect Widget</Title></Bar>}
      footer={
        <Bar design="Footer">
          {activeTab === 'Browse' && browseStep > 1 && (
            <Button slot="startContent" design="Transparent" onClick={() => { setBrowseStep(s => s - 1); setSelectedBrowseId(null) }}>Back</Button>
          )}
          <div slot="endContent" style={{ display: 'flex', gap: '0.5rem' }}>
            {activeTab === 'Browse' && browseStep < 3
              ? <Button design="Emphasized" disabled={browseNextDisabled} onClick={() => setBrowseStep(s => s + 1)}>Next</Button>
              : <Button design="Emphasized" disabled={!canConnect} onClick={handleConnect}>Connect</Button>
            }
            <Button design="Transparent" onClick={onClose}>Cancel</Button>
          </div>
        </Bar>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', flex: 1 }}>

        {/* Tab bar */}
        <div style={{ flexShrink: 0, padding: '0.75rem 2rem 0' }}>
          <SegmentedButton onSelectionChange={(e: any) => {
            const label = e.detail?.selectedItems?.[0]?.textContent?.trim()
            if (label === 'Search' || label === 'Browse') setActiveTab(label)
          }}>
            <SegmentedButtonItem selected={activeTab === 'Search'}>Search</SegmentedButtonItem>
            <SegmentedButtonItem selected={activeTab === 'Browse'}>Browse</SegmentedButtonItem>
          </SegmentedButton>
        </div>

        {/* ── Search tab ── */}
        {activeTab === 'Search' && (
          <>
            {stripVisible && (
              <div style={{ margin: '0.75rem 2rem 0', flexShrink: 0 }}>
                <MessageStrip design="Information" hideCloseButton={false} onClose={() => setStripVisible(false)}>
                  {isValueShape
                    ? <span>The <strong>Value</strong> shape only supports <strong>Value</strong> widgets.</span>
                    : suggested.length > 0
                      ? <span>Recommended widget type for <strong>{shapeType}</strong>: {suggested.map((t, i) => (
                          <span key={t}>{i > 0 && ' · '}<span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setTypeFilter(t)}>{t}</span></span>
                        ))}</span>
                      : <span>Search Process Intelligence widgets by name or ID.</span>
                  }
                </MessageStrip>
              </div>
            )}
            <div style={{ flex: 1, minHeight: 0, display: 'flex', gap: '1rem', padding: '1rem 2rem 0', overflow: 'hidden' }}>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Input type={'Search' as any} placeholder="Search for widget name or ID" value={search}
                  onInput={(e: any) => setSearch(e.target.value)}
                  style={{ width: '100%', marginBottom: '0.5rem', flexShrink: 0 } as React.CSSProperties}>
                  <Icon slot="icon" name="search" />
                </Input>
                <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, marginBottom: '0.75rem' }}>
                  <Select style={{ minWidth: '10rem' } as React.CSSProperties} onChange={(e: any) => setTypeFilter(e.detail?.selectedOption?.value ?? '')}>
                    <Option value="">Widget type: Select</Option>
                    {TYPE_ORDER.map(t => <Option key={t} value={t} selected={typeFilter === t}>{t}</Option>)}
                  </Select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, marginBottom: '0.5rem' }}>
                  <Text style={{ fontSize: 'var(--sapFontSize)', fontWeight: 700 } as React.CSSProperties}>All ({filteredWidgets.length})</Text>
                  <Button design="Transparent" icon="sort" />
                </div>
                <div style={{ flex: 1, overflowY: 'auto', borderTop: '1px solid var(--sapList_BorderColor, #d9d9d9)' }}>
                    {filteredWidgets.map(w => {
                      const isDisabled = isValueShape && w.type !== 'Value'
                      const isSelected = selectedSearchId === w.id
                      return (
                        <div key={w.id}
                          onClick={() => !isDisabled && setSelectedSearchId(w.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            padding: '0.625rem 1rem',
                            borderBottom: '1px solid var(--sapList_BorderColor, #d9d9d9)',
                            background: isSelected ? 'var(--sapList_SelectionBackgroundColor, #e8f3ff)' : '#fff',
                            opacity: isDisabled ? 0.4 : 1,
                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                          }}
                          onMouseEnter={e => { if (!isDisabled && !isSelected) e.currentTarget.style.background = 'var(--sapList_Hover_Background, #f5f6f7)' }}
                          onMouseLeave={e => { e.currentTarget.style.background = isSelected ? 'var(--sapList_SelectionBackgroundColor, #e8f3ff)' : '#fff' }}
                        >
                          <RadioButton name="search-widget" checked={isSelected} onChange={() => setSelectedSearchId(w.id)} style={{ flexShrink: 0 } as React.CSSProperties} />
                          <div style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', background: 'var(--sapAvatar_6_Background, #d1efff)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Icon name={TYPE_ICON[w.type] ?? 'bar-chart'} style={{ color: '#0064d9', width: '1rem', height: '1rem' } as React.CSSProperties} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 'var(--sapFontSize)', fontWeight: 700, color: 'var(--sapTextColor)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.name}</div>
                            <div style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '0.125rem' }}>{w.subline}</div>
                          </div>
                          <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', flexShrink: 0 } as React.CSSProperties}>{w.type}</Text>
                        </div>
                      )
                    })}
                </div>
              </div>
              <div style={{ width: '32rem', flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--sapPageSection_Background, #f5f6f7)', borderRadius: '0.75rem', marginBottom: '1rem' }}>
                {!selectedSearchWidget ? (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <IllustratedMessage name="NoData" titleText="No widget selected" subtitleText="Select a widget from the list to preview it" />
                  </div>
                ) : (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1.5rem', overflow: 'hidden' }}>
                    <div style={{ flexShrink: 0, marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.25rem' }}>
                        <Text style={{ fontSize: 'var(--sapFontHeader5Size)', fontWeight: 700, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } as React.CSSProperties}>{selectedSearchWidget.name}</Text>
                        <Button design="Transparent" icon="SAP-icons-v4/link" />
                      </div>
                      <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)' } as React.CSSProperties}>{selectedSearchWidget.subline}</Text>
                    </div>
                    {PREVIEW_CHARTS[selectedSearchWidget.type] ? (
                      <div style={{ flex: 1, background: '#fff', borderRadius: '1rem', border: '1px solid var(--sapList_BorderColor)', boxShadow: '0 1px 4px rgba(34,53,72,0.07)', padding: '1rem', display: 'flex', minHeight: 0 }}
                        dangerouslySetInnerHTML={{ __html: PREVIEW_CHARTS[selectedSearchWidget.type] }}
                      />
                    ) : selectedSearchWidget.type === 'Metric' ? (() => {
                      const mock = METRIC_PREVIEW_DATA[selectedSearchWidget.metricKind ?? 'Custom'] ?? METRIC_PREVIEW_DATA['Custom']
                      return (
                        <div style={{ flex: 1, background: '#fff', borderRadius: '1rem', border: '1px solid var(--sapList_BorderColor)', boxShadow: '0 1px 4px rgba(34,53,72,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
                          <div style={{ border: '1px solid var(--sapPageHeader_BorderColor, #d9d9d9)', borderRadius: 12, padding: '1.5rem', width: 220, display: 'flex', flexDirection: 'column', gap: '0.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                              <Text style={{ fontSize: 'var(--sapFontSmallSize)', fontWeight: 700, color: 'var(--sapTextColor)', lineHeight: 1.3 } as React.CSSProperties}>{selectedSearchWidget.name}</Text>
                              <span style={{ fontSize: 10, background: 'var(--sapPageSection_Background, #f5f6f7)', color: 'var(--sapContent_LabelColor)', borderRadius: 4, padding: '2px 6px', whiteSpace: 'nowrap', flexShrink: 0 }}>{selectedSearchWidget.source}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                              <span style={{ fontSize: 40, fontWeight: 700, color: mock.color, lineHeight: 1 }}>{mock.value}</span>
                              <span style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>{selectedSearchWidget.metricKind}</span>
                            </div>
                            <div style={{ height: 1, background: 'var(--sapPageHeader_BorderColor, #d9d9d9)' }} />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <span style={{ color: mock.up ? '#5C8A00' : '#BB0000', fontSize: 12 }}>{mock.up ? '▲' : '▼'}</span>
                              <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' } as React.CSSProperties}>{mock.change}</Text>
                            </div>
                          </div>
                        </div>
                      )
                    })() : selectedSearchWidget.type === 'External Widget' ? (
                      <div style={{ flex: 1, background: '#fff', borderRadius: '1rem', border: '1px solid var(--sapList_BorderColor)', boxShadow: '0 1px 4px rgba(34,53,72,0.07)', display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
                        <div style={{ background: 'var(--sapPageSection_Background, #f5f6f7)', borderBottom: '1px solid var(--sapList_BorderColor)', padding: '0.375rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem', flexShrink: 0 }}>
                          <Icon name="locked" style={{ width: '0.75rem', height: '0.75rem', color: 'var(--sapContent_LabelColor)', flexShrink: 0 } as React.CSSProperties} />
                          <Text style={{ fontSize: 10, color: 'var(--sapContent_LabelColor)', fontFamily: 'monospace', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } as React.CSSProperties}>{selectedSearchWidget.url}</Text>
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, padding: '0.75rem 1rem', gap: '0.5rem' }}>
                          <div style={{ flexShrink: 0 }}>
                            <span style={{ background: '#e8f3ff', color: '#0064d9', fontSize: 11, fontWeight: 700, borderRadius: 4, padding: '2px 8px' }}>{selectedSearchWidget.source}</span>
                          </div>
                          <div style={{ flex: 1, minHeight: 0 }} dangerouslySetInnerHTML={{ __html: PREVIEW_CHARTS['Bar Chart'] }} />
                        </div>
                      </div>
                    ) : (
                      <div style={{ flex: 1, background: '#fff', borderRadius: '1rem', border: '1px solid var(--sapList_BorderColor)', boxShadow: '0 1px 4px rgba(34,53,72,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                          <Icon name="SAP-icons-v4/link" style={{ width: '2.5rem', height: '2.5rem', color: '#0064d9' } as React.CSSProperties} />
                          <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)' } as React.CSSProperties}>{selectedSearchWidget.type}</Text>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── Browse tab ── */}
        {activeTab === 'Browse' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ overflow: 'hidden', height: '3.875rem', flexShrink: 0, borderBottom: '1px solid var(--sapPageHeader_BorderColor, #d9d9d9)', boxShadow: '0 2px 4px rgba(34,53,72,0.06)' }}>
              <Wizard ref={wizardRef} contentLayout={'SingleStep' as any} style={{ width: '100%' } as React.CSSProperties}>
                <WizardStep titleText="Select Internal Analysis" selected={browseStep === 1} icon={browseStep > 1 ? 'accept' : undefined}>{' '}</WizardStep>
                <WizardStep titleText="Choose Type" selected={browseStep === 2} disabled={browseStep < 2} icon={browseStep > 2 ? 'accept' : undefined}>{' '}</WizardStep>
                <WizardStep titleText="Select Widget" selected={browseStep === 3} disabled={browseStep < 3}>{' '}</WizardStep>
              </Wizard>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 2rem' }}>
              {browseStep === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <Text style={{ fontWeight: 700, fontSize: 'var(--sapFontLargeSize)', display: 'block', marginBottom: '0.125rem' } as React.CSSProperties}>Select Internal Analysis</Text>
                    <Text style={{ color: 'var(--sapContent_LabelColor)' } as React.CSSProperties}>Select the internal analysis you want to add a widget from</Text>
                  </div>
                  <Input placeholder="Search by internal analysis name" type={'Search' as any} value={processSearch}
                    onInput={(e: any) => setProcessSearch(e.target.value)} style={{ width: '100%' } as React.CSSProperties}>
                    <Icon slot="icon" name="search" />
                  </Input>
                  <Table style={{ width: '100%' } as React.CSSProperties}
                    headerRow={<TableHeaderRow>
                      <TableHeaderCell style={{ width: '2rem' } as React.CSSProperties} />
                      <TableHeaderCell><b>Name</b></TableHeaderCell>
                      <TableHeaderCell><b>Cases</b></TableHeaderCell>
                      <TableHeaderCell><b>Events</b></TableHeaderCell>
                      <TableHeaderCell><b>Last Modified</b></TableHeaderCell>
                    </TableHeaderRow>}
                  >
                    {filteredProcesses.map(([name, data]) => (
                      <TableRow key={name} onClick={() => setSelectedProcess(name)} style={{ cursor: 'pointer', background: selectedProcess === name ? 'var(--sapList_SelectionBackgroundColor, #e8f3ff)' : undefined } as React.CSSProperties}
                        onMouseEnter={(e: any) => { if (selectedProcess !== name) e.currentTarget.style.background = 'var(--sapList_Hover_Background, #f5f6f7)' }}
                        onMouseLeave={(e: any) => { e.currentTarget.style.background = selectedProcess === name ? 'var(--sapList_SelectionBackgroundColor, #e8f3ff)' : '' }}
                      >
                        <TableCell><RadioButton checked={selectedProcess === name} onChange={() => setSelectedProcess(name)} /></TableCell>
                        <TableCell><span style={{ fontWeight: selectedProcess === name ? 700 : 400 }}>{name}</span></TableCell>
                        <TableCell>{data.cases}</TableCell>
                        <TableCell>{data.events}</TableCell>
                        <TableCell>{data.lastEdited}</TableCell>
                      </TableRow>
                    ))}
                  </Table>
                </div>
              )}
              {browseStep === 2 && selectedProcess && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <Breadcrumbs><BreadcrumbsItem>{selectedProcess}</BreadcrumbsItem><BreadcrumbsItem>Source</BreadcrumbsItem></Breadcrumbs>
                  <div>
                    <Text style={{ fontWeight: 700, fontSize: 'var(--sapFontLargeSize)', display: 'block', marginBottom: '0.125rem' } as React.CSSProperties}>Select Widget Source</Text>
                    <Text style={{ color: 'var(--sapContent_LabelColor)' } as React.CSSProperties}>Choose whether to add a widget from an Investigation or a Dashboard</Text>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                    {(['Investigation', 'Dashboard'] as const).map(type => {
                      if (!procData?.[type]) return null
                      const isSel = selectedType === type
                      return (
                        <div key={type} onClick={() => setSelectedType(type)} style={{ flex: 1, padding: '1.25rem', borderRadius: '0.5rem', cursor: 'pointer', border: `1px solid ${isSel ? 'var(--sapHighlightColor)' : 'var(--sapPageHeader_BorderColor, #d9d9d9)'}`, background: isSel ? 'var(--sapList_SelectionBackgroundColor, #e8f3ff)' : '#fff', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: isSel ? '0 0 0 1px var(--sapHighlightColor)' : undefined }}>
                          <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.5rem', flexShrink: 0, background: 'var(--sapAvatar_6_Background, #d1efff)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icon name={type === 'Investigation' ? 'SAP-icons-v5/business-objects-experience' : 'SAP-icons-v5/business-objects-mobile'} style={{ width: '1.25rem', height: '1.25rem', color: '#0057d2' } as React.CSSProperties} />
                          </div>
                          <Text style={{ fontWeight: 700, fontSize: 'var(--sapFontSize)', flex: 1 } as React.CSSProperties}>{type}s</Text>
                          <RadioButton checked={isSel} onChange={() => setSelectedType(type)} />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              {browseStep === 3 && selectedProcess && selectedType && (
                <div style={{ display: 'flex', gap: '1rem', height: '100%' }}>
                  <div style={{ flex: '0 0 26.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <Breadcrumbs><BreadcrumbsItem>{selectedProcess}</BreadcrumbsItem><BreadcrumbsItem>{selectedType}s</BreadcrumbsItem></Breadcrumbs>
                    <div>
                      <Label required style={{ color: 'var(--sapContent_LabelColor)', display: 'block', marginBottom: '0.25rem' } as React.CSSProperties}>1. Select {selectedType}:</Label>
                      <Select style={{ width: '100%' } as React.CSSProperties} onChange={(e: any) => { setSelectedSource(e.detail?.selectedOption?.value ?? ''); setSelectedPage(''); setSelectedBrowseId(null) }}>
                        <Option value="">Select</Option>
                        {sources.map(s => <Option key={s} value={s}>{s}</Option>)}
                      </Select>
                    </div>
                    <div>
                      <Label required style={{ color: 'var(--sapContent_LabelColor)', display: 'block', marginBottom: '0.25rem' } as React.CSSProperties}>2. Select Page:</Label>
                      <Select style={{ width: '100%' } as React.CSSProperties} disabled={!selectedSource} onChange={(e: any) => { setSelectedPage(e.detail?.selectedOption?.value ?? ''); setSelectedBrowseId(null) }}>
                        <Option value="">Select</Option>
                        {pages.map(p => <Option key={p} value={p}>{p}</Option>)}
                      </Select>
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                      <Label required style={{ color: 'var(--sapContent_LabelColor)', display: 'block', marginBottom: '0.25rem' } as React.CSSProperties}>3. Select Widget:</Label>
                      {!selectedPage ? (
                        <div style={{ padding: '1.5rem 0', color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSize)', textAlign: 'center' }}>Select a {selectedType.toLowerCase()} and page first</div>
                      ) : (
                        <List selectionMode="SingleStart" onSelectionChange={(e: any) => { const item = e.detail?.selectedItems?.[0]; if (item) setSelectedBrowseId(item.dataset.id) }}>
                          {widgetIds.map(id => {
                            const meta = WIDGET_META[id]
                            if (!meta) return null
                            return (
                              <ListItemCustom key={id} data-id={id} selected={selectedBrowseId === id}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0.25rem 0.5rem 0.25rem 0' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '1.75rem', height: '1.75rem', borderRadius: '0.375rem', background: '#d1efff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                      <Icon name={TYPE_ICON[meta.type] ?? 'bar-chart'} style={{ width: '0.875rem', height: '0.875rem', color: '#0064d9' } as React.CSSProperties} />
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
                  <div style={{ flex: 1, borderRadius: '0.5rem', background: 'var(--sapPageSection_Background, #f5f6f7)', display: 'flex', flexDirection: 'column', padding: '1.5rem', gap: '0.5rem' }}>
                    {!selectedBrowseId ? (
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IllustratedMessage name="NoEntries" titleText="No widget selected" subtitleText="Select a widget from the list to preview it" />
                      </div>
                    ) : (
                      <>
                        <Text style={{ fontWeight: 700, fontSize: 'var(--sapFontLargeSize)', display: 'block' } as React.CSSProperties}>{WIDGET_META[selectedBrowseId]?.name}</Text>
                        <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSize)', display: 'block', marginBottom: '0.5rem' } as React.CSSProperties}>
                          {selectedProcess} / {selectedSource} / {selectedPage}
                        </Text>
                        <div style={{ background: '#fff', borderRadius: '0.75rem', border: '1px solid var(--sapPageHeader_BorderColor, #e5e5e5)', padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ width: '100%', height: '100%' }} dangerouslySetInnerHTML={{ __html: PREVIEW_CHARTS[WIDGET_META[selectedBrowseId]?.type] ?? PREVIEW_CHARTS['Bar Chart'] }} />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Dialog>,
    document.body
  )
}
