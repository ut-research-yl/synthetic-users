import React, { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button, Icon, Input, MessageStrip, Text, Menu, MenuItem, Popover, List, ListItemStandard } from '@ui5/webcomponents-react'
import { SigChipV2 } from '@signavio/sap-signavio-uixtension'
import ConnectWidgetDialog from './ConnectWidgetDialog'
import AddExternalWidgetDialog from './AddExternalWidgetDialog'
import AddMetricDialog from './AddMetricDialog'
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
  'O2C Onboarding': {
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

export type MetricKind = 'NPS' | 'CSAT' | 'CES' | 'Custom'
export type Metric = { id: string; name: string; metricKind: MetricKind; source: string; shapeType?: string }

const WIDGETS: Widget[] = [
  { id: 'value-I-001',     name: 'Active Cases',              type: 'Value',           process: 'Order to Cash',    source: 'O2C Performance' },
  { id: 'bar-chart-I-001', name: 'Case Volume by Region',     type: 'Bar Chart',       process: 'Order to Cash',    source: 'O2C Analysis' },
  { id: 'value-D-001',     name: 'Total Orders',              type: 'Value',           process: 'Procure to Pay',   source: 'Procurement Dashboard' },
  { id: 'rec-val-001',     name: 'Open Positions',            type: 'Value',           process: 'Recruit to Hire',  source: 'TA Dashboard' },
  { id: 'line-I-001',      name: 'Throughput Time Trend',     type: 'Line Chart',      process: 'Order to Cash',    source: 'O2C Analysis' },
  { id: 'bar-chart-D-002', name: 'Throughput by Team',        type: 'Bar Chart',       process: 'Incident Mgmt',    source: 'Incident Dashboard' },
  { id: 'area-I-001',      name: 'Volume over Time',          type: 'Area Chart',      process: 'Order to Cash',    source: 'O2C Analysis' },
  { id: 'value-I-002',     name: 'Avg Onboarding Days',       type: 'Value',           process: 'HR Onboarding',    source: 'Onboarding KPIs' },
  { id: 'rec-bar-001',     name: 'Candidates by Stage',       type: 'Bar Chart',       process: 'Recruit to Hire',  source: 'TA Dashboard' },
  { id: 'bar-chart-D-003', name: 'Posting Volume by Period',  type: 'Bar Chart',       process: 'Finance Close',    source: 'R2R Dashboard' },
  { id: 'dual-I-001',      name: 'Cycle Time vs Volume',      type: 'Dual Axis Chart', process: 'Order to Cash',    source: 'O2C Analysis' },
  { id: 'value-D-003',     name: 'Closed Items',              type: 'Value',           process: 'Finance Close',    source: 'R2R Dashboard' },
  { id: 'heat-D-001',      name: 'Bottleneck Heatmap',        type: 'Heat Map',        process: 'Procure to Pay',   source: 'Supplier Dashboard' },
  { id: 'dup-bar-001',     name: 'Bar Chart',                 type: 'Bar Chart',       process: 'Recruit to Hire',  source: 'TA Dashboard' },
  { id: 'rec-val-002',     name: 'Candidates in Pipeline',    type: 'Value',           process: 'Recruit to Hire',  source: 'TA Dashboard' },
  { id: 'line-I-002',      name: 'Period Comparison',         type: 'Line Chart',      process: 'Finance Close',    source: 'R2R Period Analysis' },
  { id: 'bar-chart-I-002', name: 'Onboarding Duration',       type: 'Bar Chart',       process: 'HR Onboarding',    source: 'Onboarding Analysis' },
  { id: 'pie-D-001',       name: 'Order Distribution',        type: 'Pie Chart',       process: 'Procure to Pay',   source: 'Procurement Dashboard' },
  { id: 'treemap-I-001',   name: 'Process Variants',          type: 'Treemap',         process: 'Order to Cash',    source: 'O2C Analysis' },
  { id: 'rec-val-003',     name: 'Screening Pass Rate',       type: 'Value',           process: 'Recruit to Hire',  source: 'TA KPIs' },
  { id: 'value-D-002',     name: 'Active Cases',              type: 'Value',           process: 'Incident Mgmt',    source: 'Incident Dashboard' },
  { id: 'sankey-I-001',    name: 'Process Flow Sankey',       type: 'Sankey Chart',    process: 'Finance Close',    source: 'R2R Investigation' },
  { id: 'area-D-001',      name: 'Monthly Volume',            type: 'Area Chart',      process: 'Procure to Pay',   source: 'Procurement Dashboard' },
  { id: 'bar-chart-D-001', name: 'Customer Count by Country', type: 'Bar Chart',       process: 'Procure to Pay',   source: 'Procurement Dashboard' },
  { id: 'rec-bar-002',     name: 'Applications by Source',    type: 'Bar Chart',       process: 'Recruit to Hire',  source: 'TA Investigation' },
  { id: 'hist-I-001',      name: 'Case Duration Distribution',type: 'Histogram',       process: 'HR Onboarding',    source: 'Onboarding Analysis' },
  { id: 'line-I-003',      name: 'Step Duration Trend',       type: 'Line Chart',      process: 'HR Onboarding',    source: 'Onboarding Analysis' },
  { id: 'value-D-004',     name: 'On-Time Delivery Rate',     type: 'Value',           process: 'Production',       source: 'Production KPIs' },
  { id: 'treemap-I-002',   name: 'Production Category Mix',   type: 'Treemap',         process: 'Production',       source: 'Supply Chain Overview' },
  { id: 'rec-val-004',     name: 'Time to Hire',              type: 'Value',           process: 'Recruit to Hire',  source: 'TA KPIs' },
  { id: 'heat-D-002',      name: 'Delay Heatmap',             type: 'Heat Map',        process: 'Incident Mgmt',    source: 'Incident Dashboard' },
  { id: 'dual-I-002',      name: 'Ledger Balance vs Entries', type: 'Dual Axis Chart', process: 'Finance Close',    source: 'R2R Period Analysis' },
  { id: 'bar-chart-D-004', name: 'Production Volume',         type: 'Bar Chart',       process: 'Production',       source: 'P2P Dashboard' },
  { id: 'pie-D-002',       name: 'Case Distribution',         type: 'Pie Chart',       process: 'Incident Mgmt',    source: 'Incident Dashboard' },
  { id: 'rec-line-001',    name: 'Interview Completion Rate', type: 'Line Chart',      process: 'Recruit to Hire',  source: 'TA Analysis' },
  { id: 'area-D-002',      name: 'Monthly Events',            type: 'Area Chart',      process: 'Production',       source: 'P2P Dashboard' },
  { id: 'sankey-I-002',    name: 'Variant Flow Analysis',     type: 'Sankey Chart',    process: 'Order to Cash',    source: 'O2C Analysis' },
  { id: 'value-D-005',     name: 'Avg Cycle Time',            type: 'Value',           process: 'Order to Cash',    source: 'O2C Performance' },
  { id: 'bar-chart-D-005', name: 'Rejection Rate by Step',    type: 'Bar Chart',       process: 'Order to Cash',    source: 'O2C Executive Summary' },
  { id: 'rec-val-005',     name: 'Offer Acceptance Rate',     type: 'Value',           process: 'Recruit to Hire',  source: 'TA KPIs' },
  { id: 'heat-D-003',      name: 'Period Heatmap',            type: 'Heat Map',        process: 'Finance Close',    source: 'R2R Dashboard' },
  { id: 'line-I-004',      name: 'Monthly KPI Trend',         type: 'Line Chart',      process: 'Finance Close',    source: 'R2R Dashboard' },
  { id: 'treemap-I-003',   name: 'Account Category Mix',      type: 'Treemap',         process: 'Finance Close',    source: 'R2R Dashboard' },
  { id: 'hist-I-002',      name: 'Case Duration Spread',      type: 'Histogram',       process: 'Order to Cash',    source: 'O2C Analysis' },
  { id: 'dup-bar-002',     name: 'Bar Chart',                 type: 'Bar Chart',       process: 'HR Onboarding',    source: 'Onboarding Analysis' },
  { id: 'rec-pie-001',     name: 'Candidate Source Breakdown',type: 'Pie Chart',       process: 'Recruit to Hire',  source: 'TA Dashboard' },
  { id: 'dual-D-002',      name: 'Plan vs Actual',            type: 'Dual Axis Chart', process: 'Production',       source: 'Production KPIs' },
  { id: 'area-D-003',      name: 'Weekly Trends',             type: 'Area Chart',      process: 'Incident Mgmt',    source: 'Incident Dashboard' },
  { id: 'bar-chart-D-006', name: 'Automation Rate by Step',   type: 'Bar Chart',       process: 'Finance Close',    source: 'R2R Dashboard' },
  { id: 'pie-D-003',       name: 'Status Breakdown',          type: 'Pie Chart',       process: 'Incident Mgmt',    source: 'Incident Dashboard' },
  { id: 'rec-bar-003',     name: 'Interviewer Workload',      type: 'Bar Chart',       process: 'Recruit to Hire',  source: 'TA Analysis' },
  { id: 'sankey-I-003',    name: 'Handover Analysis',         type: 'Sankey Chart',    process: 'HR Onboarding',    source: 'HR Analysis' },
  { id: 'hist-I-003',      name: 'Lead Time Distribution',    type: 'Histogram',       process: 'Procure to Pay',   source: 'P2P Analysis' },
  { id: 'line-I-005',      name: 'Case Volume Trend',         type: 'Line Chart',      process: 'Incident Mgmt',    source: 'Incident Dashboard' },
  { id: 'area-D-004',      name: 'Cost over Time',            type: 'Area Chart',      process: 'Procure to Pay',   source: 'Procurement Dashboard' },
  { id: 'dual-I-003',      name: 'Cost vs Throughput',        type: 'Dual Axis Chart', process: 'Finance Close',    source: 'R2R Period Analysis' },
  { id: 'pie-D-004',       name: 'Resource Distribution',     type: 'Pie Chart',       process: 'HR Onboarding',    source: 'Recruitment KPIs' },
  { id: 'treemap-I-004',   name: 'Variant Category Mix',      type: 'Treemap',         process: 'Incident Mgmt',    source: 'Incident Dashboard' },
  { id: 'dup-bar-003',     name: 'Bar Chart',                 type: 'Bar Chart',       process: 'Order to Cash',    source: 'O2C Executive Summary' },
  { id: 'heat-D-004',      name: 'Step Duration Heatmap',     type: 'Heat Map',        process: 'Order to Cash',    source: 'O2C Analysis' },
  { id: 'sankey-I-004',    name: 'Resource Flow Analysis',    type: 'Sankey Chart',    process: 'Production',       source: 'P2P Analysis' },
  { id: 'hist-I-004',      name: 'Rework Duration Spread',    type: 'Histogram',       process: 'Finance Close',    source: 'R2R Investigation' },
  { id: 'value-D-006',     name: 'SLA Compliance Rate',       type: 'Value',           process: 'Incident Mgmt',    source: 'Incident Dashboard' },
  { id: 'cockpit-I-001',   name: 'Process Health Score',      type: 'Value',           process: 'Order to Cash',    source: 'O2C Performance' },
  { id: 'cockpit-I-002',   name: 'Onboarding Quality Index',  type: 'Value',           process: 'HR Onboarding',    source: 'Onboarding KPIs' },
  { id: 'cockpit-D-001',   name: 'Supplier Performance',      type: 'Value',           process: 'Procure to Pay',   source: 'Procurement Dashboard' },
  { id: 'sentiment-I-001', name: 'Customer Satisfaction',     type: 'Histogram',       process: 'Order to Cash',    source: 'O2C Performance' },
  { id: 'sentiment-I-002', name: 'Employee Satisfaction',     type: 'Histogram',       process: 'HR Onboarding',    source: 'Onboarding KPIs' },
  { id: 'sentiment-D-001', name: 'Vendor Satisfaction',       type: 'Histogram',       process: 'Procure to Pay',   source: 'Procurement Dashboard' },
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
  { id: 'ext-004', name: 'Cost Center Overview',        source: 'Analytics Cloud', url: 'https://sac.example.com/overview' },
  { id: 'ext-005', name: 'Headcount Report',            source: 'Grafana',         url: 'https://grafana.example.com/d/headcount' },
  { id: 'ext-013', name: 'Account Revenue Breakdown',   source: 'Tableau',         url: 'https://tableau.example.com/views/account-revenue' },
  { id: 'ext-014', name: 'Actuals vs Budget',           source: 'Power BI',        url: 'https://app.powerbi.com/view?r=avb001' },
  { id: 'ext-015', name: 'Asset Utilization Report',    source: 'Analytics Cloud', url: 'https://sac.example.com/asset-util' },
  { id: 'ext-006', name: 'Supply Chain Metrics',        source: 'Tableau',         url: 'https://tableau.example.com/views/supply-chain' },
  { id: 'ext-007', name: 'Customer Satisfaction Score', source: 'Looker Studio',   url: 'https://lookerstudio.google.com/u/0/reporting/def' },
  { id: 'ext-008', name: 'Procurement Spend Analysis',  source: 'Power BI',        url: 'https://app.powerbi.com/view?r=def456' },
  { id: 'ext-009', name: 'Operations Overview',         source: 'Analytics Cloud', url: 'https://sac.example.com/operations' },
  { id: 'ext-010', name: 'IT Infrastructure Health',    source: 'Grafana',         url: 'https://grafana.example.com/d/infra' },
  { id: 'ext-011', name: 'Finance Consolidation',       source: 'Power BI',        url: 'https://app.powerbi.com/view?r=ghi789' },
  { id: 'ext-012', name: 'HR Attrition Trends',         source: 'Looker Studio',   url: 'https://lookerstudio.google.com/u/0/reporting/ghi' },
]

const METRICS: Metric[] = [
  { id: 'metric-001', name: 'Onboarding NPS',         metricKind: 'NPS',  source: 'Qualtrics',   shapeType: 'Sentiment' },
  { id: 'metric-002', name: 'Purchase Experience NPS', metricKind: 'NPS',  source: 'Qualtrics',   shapeType: 'Sentiment' },
  { id: 'metric-003', name: 'Support CSAT',            metricKind: 'CSAT', source: 'Medallia',    shapeType: 'Sentiment' },
  { id: 'metric-004', name: 'Checkout CSAT',           metricKind: 'CSAT', source: 'SAP Surveys', shapeType: 'Sentiment' },
  { id: 'metric-005', name: 'Return Process CES',      metricKind: 'CES',  source: 'Qualtrics',   shapeType: 'Value' },
]

// ── Drag ghost ────────────────────────────────────────────────────────────────

const TYPE_SVG: Record<string, string> = {
  'Value':           `<svg width="16" height="16" viewBox="0 0 16 16" fill="#0070f2"><text x="1" y="13" font-size="10" font-weight="700" font-family="sans-serif">123</text></svg>`,
  'Bar Chart':       `<svg width="16" height="16" viewBox="0 0 16 16" fill="#0070f2"><rect x="1" y="7" width="3" height="7" rx="0.5"/><rect x="6" y="4" width="3" height="10" rx="0.5"/><rect x="11" y="1" width="3" height="13" rx="0.5"/></svg>`,
  'Line Chart':      `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#0070f2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1,12 5,6 9,9 13,3"/></svg>`,
  'Area Chart':      `<svg width="16" height="16" viewBox="0 0 16 16"><path d="M1,12 5,6 9,9 13,3 13,14 1,14Z" fill="#0070f2" opacity="0.35"/><polyline points="1,12 5,6 9,9 13,3" fill="none" stroke="#0070f2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  'Dual Axis Chart': `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><polyline points="1,12 5,6 9,9 13,3" stroke="#0070f2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><polyline points="1,9 5,13 9,7 13,10" stroke="#1db8c4" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  'Pie Chart':       `<svg width="16" height="16" viewBox="0 0 16 16"><path d="M8,8 L8,1.5 A6.5,6.5 0 1,1 1.5,8 Z" fill="#0070f2"/><path d="M8,8 L1.5,8 A6.5,6.5 0 0,1 8,1.5 Z" fill="#0070f2" opacity="0.35"/></svg>`,
  'Treemap':         `<svg width="16" height="16" viewBox="0 0 16 16" fill="#0070f2"><rect x="1" y="1" width="8" height="9" rx="0.5" opacity="0.9"/><rect x="10" y="1" width="5" height="9" rx="0.5" opacity="0.5"/><rect x="1" y="11" width="14" height="4" rx="0.5" opacity="0.3"/></svg>`,
  'Heat Map':        `<svg width="16" height="16" viewBox="0 0 16 16"><rect x="1" y="1" width="4" height="4" rx="0.5" fill="#0070f2" opacity="0.2"/><rect x="6" y="1" width="4" height="4" rx="0.5" fill="#0070f2" opacity="0.6"/><rect x="11" y="1" width="4" height="4" rx="0.5" fill="#0070f2" opacity="0.95"/><rect x="1" y="6" width="4" height="4" rx="0.5" fill="#0070f2" opacity="0.7"/><rect x="6" y="6" width="4" height="4" rx="0.5" fill="#0070f2" opacity="0.35"/><rect x="11" y="6" width="4" height="4" rx="0.5" fill="#0070f2" opacity="0.5"/><rect x="1" y="11" width="4" height="4" rx="0.5" fill="#0070f2" opacity="0.45"/><rect x="6" y="11" width="4" height="4" rx="0.5" fill="#0070f2" opacity="0.8"/><rect x="11" y="11" width="4" height="4" rx="0.5" fill="#0070f2" opacity="0.15"/></svg>`,
  'Sankey Chart':    `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1,4 Q8,4 15,7" stroke="#0070f2" stroke-width="2.5" stroke-linecap="round" opacity="0.85"/><path d="M1,9 Q8,9 15,11" stroke="#0070f2" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/></svg>`,
  'Histogram':       `<svg width="16" height="16" viewBox="0 0 16 16" fill="#0070f2"><rect x="1" y="8" width="2" height="6" rx="0.3"/><rect x="4" y="5" width="2" height="9" rx="0.3"/><rect x="7" y="3" width="2" height="11" rx="0.3"/><rect x="10" y="6" width="2" height="8" rx="0.3"/><rect x="13" y="10" width="2" height="4" rx="0.3"/></svg>`,
  'external':        `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#0070f2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6,2 L2,2 L2,14 L14,14 L14,10"/><path d="M9,2 L14,2 L14,7"/><line x1="14" y1="2" x2="8" y2="8"/></svg>`,
  'metric':          `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#0070f2" stroke-width="1.5"><circle cx="8" cy="8" r="6"/><path d="M5.5,9.5 Q8,12 10.5,9.5" stroke-linecap="round"/><circle cx="5.5" cy="6.5" r="0.75" fill="#0070f2" stroke="none"/><circle cx="10.5" cy="6.5" r="0.75" fill="#0070f2" stroke="none"/></svg>`,
}

function createDragGhost(label: string, subtitle: string | undefined, iconType: string): { el: HTMLElement; cleanup: () => void } {
  const ghost = document.createElement('div')
  ghost.style.cssText = [
    'position:fixed', 'top:-300px', 'left:-300px',
    'display:flex', 'align-items:center', 'gap:8px',
    'padding:8px 12px 8px 8px',
    'background:#ffffff',
    'border:1px solid rgba(0,0,0,0.12)',
    'border-radius:10px',
    'box-shadow:0 6px 20px rgba(0,0,0,0.18)',
    'font-family:72,\'72 Full\',sans-serif',
    'pointer-events:none',
    'max-width:260px',
    'z-index:99999',
  ].join(';')

  const iconBox = document.createElement('div')
  iconBox.style.cssText = [
    'width:32px', 'height:32px', 'flex-shrink:0',
    'border-radius:8px', 'background:#e8f3ff',
    'display:flex', 'align-items:center', 'justify-content:center',
  ].join(';')
  iconBox.innerHTML = TYPE_SVG[iconType] ?? TYPE_SVG['Bar Chart']

  const textArea = document.createElement('div')
  textArea.style.cssText = 'display:flex;flex-direction:column;gap:1px;min-width:0'

  const nameEl = document.createElement('div')
  const truncated = label.length > 24 ? label.slice(0, 24) + '…' : label
  nameEl.textContent = truncated
  nameEl.style.cssText = 'font-size:13px;font-weight:600;color:#1d2d3e;white-space:nowrap'

  textArea.appendChild(nameEl)

  if (subtitle) {
    const subEl = document.createElement('div')
    const truncSub = subtitle.length > 28 ? subtitle.slice(0, 28) + '…' : subtitle
    subEl.textContent = truncSub
    subEl.style.cssText = 'font-size:11px;color:#556b82;white-space:nowrap'
    textArea.appendChild(subEl)
  }

  ghost.appendChild(iconBox)
  ghost.appendChild(textArea)
  document.body.appendChild(ghost)

  const cleanup = () => { if (ghost.parentNode) ghost.parentNode.removeChild(ghost) }
  return { el: ghost, cleanup }
}

// ── Widget card ───────────────────────────────────────────────────────────────

function WidgetCard({ widget, onSelect, onAddToCanvas }: { widget: Widget; onSelect?: () => void; onAddToCanvas?: () => void }) {
  const menuRef = useRef<any>(null)
  const suppressSelectRef = useRef(false)
  const btnId = `overflow-${widget.id}`
  return (
    <div className={s.card} draggable onClick={() => { if (!suppressSelectRef.current) onSelect?.(); suppressSelectRef.current = false }} style={{ cursor: 'pointer' }} onDragStart={(e: React.DragEvent) => {
        e.dataTransfer.setData('text/plain', widget.id)
        e.dataTransfer.setData('application/di-widget', widget.id)
        e.dataTransfer.setData('application/di-widget-name', widget.name)
        const subtitle = [widget.process, widget.source].filter(Boolean).join(' / ')
        const { el, cleanup } = createDragGhost(widget.name, subtitle || undefined, widget.type)
        e.dataTransfer.setDragImage(el, 20, 24)
        setTimeout(cleanup, 0)
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
      <Button id={btnId} icon="overflow" design="Transparent" className={s.cardOverflow}
        style={{ '--_ui5_button_base_min_width': '1.625rem', width: '1.625rem', height: '1.625rem', flexShrink: 0 } as React.CSSProperties}
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation()
          if (menuRef.current) { menuRef.current.opener = btnId; menuRef.current.open = true }
        }} />
      {createPortal(
        <Menu ref={menuRef} onItemClick={(e: any) => {
          const action = e.detail?.item?.dataset?.action
          if (action === 'add') { suppressSelectRef.current = true; onAddToCanvas?.() }
          else if (action === 'details') onSelect?.()
        }}>
          <MenuItem text="Add to Canvas" icon="add" data-action="add" />
          <MenuItem text="See Details" icon="detail-view" data-action="details" />
        </Menu>,
        document.body
      )}
    </div>
  )
}

// ── External Widget card ──────────────────────────────────────────────────────

function ExternalWidgetCard({ widget, onSelect, onAddToCanvas, onDelete }: { widget: ExternalWidget; onSelect?: () => void; onAddToCanvas?: () => void; onDelete?: () => void }) {
  const menuRef = useRef<any>(null)
  const suppressSelectRef = useRef(false)
  const btnId = `overflow-ext-${widget.id}`
  return (
    <div className={s.card} draggable onClick={() => { if (!suppressSelectRef.current) onSelect?.(); suppressSelectRef.current = false }} style={{ cursor: 'pointer' }} onDragStart={(e: React.DragEvent) => {
        e.dataTransfer.setData('text/plain', widget.id)
        e.dataTransfer.setData('application/di-widget', widget.id)
        e.dataTransfer.setData('application/di-widget-name', widget.name)
        e.dataTransfer.setData('application/di-widget-shape', widget.shapeType ?? '')
        const { el, cleanup } = createDragGhost(widget.name, widget.source, 'external')
        e.dataTransfer.setDragImage(el, 20, 24)
        setTimeout(cleanup, 0)
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
      <Button id={btnId} icon="overflow" design="Transparent" className={s.cardOverflow}
        style={{ '--_ui5_button_base_min_width': '1.625rem', width: '1.625rem', height: '1.625rem', flexShrink: 0 } as React.CSSProperties}
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation()
          if (menuRef.current) { menuRef.current.opener = btnId; menuRef.current.open = true }
        }} />
      {createPortal(
        <Menu ref={menuRef} onItemClick={(e: any) => {
          const action = e.detail?.item?.dataset?.action
          if (action === 'add') { suppressSelectRef.current = true; onAddToCanvas?.() }
          else if (action === 'details') onSelect?.()
          else if (action === 'delete') { suppressSelectRef.current = true; onDelete?.() }
        }}>
          <MenuItem text="Add to Canvas" icon="add" data-action="add" />
          <MenuItem text="See Details" icon="detail-view" data-action="details" />
          <MenuItem text="Delete" icon="delete" data-action="delete" />
        </Menu>,
        document.body
      )}
    </div>
  )
}

// ── Metric card ───────────────────────────────────────────────────────────────

function MetricCard({ widget, onSelect, onAddToCanvas, onDelete }: { widget: Metric; onSelect?: () => void; onAddToCanvas?: () => void; onDelete?: () => void }) {
  const menuRef = useRef<any>(null)
  const suppressSelectRef = useRef(false)
  const btnId = `overflow-metric-${widget.id}`
  return (
    <div className={s.card} draggable onClick={() => { if (!suppressSelectRef.current) onSelect?.(); suppressSelectRef.current = false }} style={{ cursor: 'pointer' }} onDragStart={(e: React.DragEvent) => {
        e.dataTransfer.setData('text/plain', widget.id)
        e.dataTransfer.setData('application/di-widget', widget.id)
        e.dataTransfer.setData('application/di-widget-name', widget.name)
        e.dataTransfer.setData('application/di-widget-shape', widget.shapeType ?? '')
        const { el, cleanup } = createDragGhost(widget.name, `${widget.metricKind} · ${widget.source}`, 'metric')
        e.dataTransfer.setDragImage(el, 20, 24)
        setTimeout(cleanup, 0)
      }}>
      <div className={s.cardIcon} title="Metric">
        <Icon name="performance" style={{ width: '1rem', height: '1rem', color: 'var(--sapHighlightColor)' } as React.CSSProperties} />
      </div>
      <div className={s.cardInfo}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Text style={{ fontSize: 'var(--sapFontHeader5Size)', fontWeight: '700', color: 'var(--sapTextColor)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {widget.name}
          </Text>
        </div>
        <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {widget.metricKind} · {widget.source}
        </Text>
      </div>
      <Button id={btnId} icon="overflow" design="Transparent" className={s.cardOverflow}
        style={{ '--_ui5_button_base_min_width': '1.625rem', width: '1.625rem', height: '1.625rem', flexShrink: 0 } as React.CSSProperties}
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation()
          if (menuRef.current) { menuRef.current.opener = btnId; menuRef.current.open = true }
        }} />
      {createPortal(
        <Menu ref={menuRef} onItemClick={(e: any) => {
          const action = e.detail?.item?.dataset?.action
          if (action === 'add') { suppressSelectRef.current = true; onAddToCanvas?.() }
          else if (action === 'details') onSelect?.()
          else if (action === 'delete') { suppressSelectRef.current = true; onDelete?.() }
        }}>
          <MenuItem text="Add to Canvas" icon="add" data-action="add" />
          <MenuItem text="See Details" icon="detail-view" data-action="details" />
          <MenuItem text="Delete" icon="delete" data-action="delete" />
        </Menu>,
        document.body
      )}
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

type Props = { onClose: () => void; onWidgetSelect?: (widget: Widget | ExternalWidget | Metric) => void; onAddFromBrowse?: (widgetId: string, widgetName: string, widgetType: string) => void; onWidgetAdded?: (name: string) => void }

export default function DataPanel({ onClose, onWidgetSelect, onAddFromBrowse, onWidgetAdded }: Props) {
  const [query, setQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedSource, setSelectedSource] = useState<string | null>(null)
  const [location, setLocation] = useState<LocationState>({ process: null, type: null, section: null, page: null })
  const [infoVisible, setInfoVisible] = useState(true)
  const [locationOpen, setLocationOpen] = useState(false)
  const [connectOpen, setConnectOpen] = useState(false)
  const [addExternalOpen, setAddExternalOpen] = useState(false)
  const [addMetricOpen, setAddMetricOpen] = useState(false)
  const [sortOrder, setSortOrder] = useState<'name-asc' | 'name-desc' | 'last-edited' | 'recently-added'>('name-asc')
  const [externalWidgets, setExternalWidgets] = useState<ExternalWidget[]>(EXTERNAL_WIDGETS)
  const [metrics, setMetrics] = useState<Metric[]>(METRICS)
  const [addedName, setAddedName] = useState<string | null>(null)

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
    : location.process ?? 'Analysis Configuration'

  const filtered = WIDGETS.filter(w => {
    if (selectedSource === 'External Widget') return false
    if (selectedSource === 'Metric') return false
    if (selectedType && w.type !== selectedType) return false
    if (pageWidgetIds && !pageWidgetIds.includes(w.id)) return false
    if (!query) return true
    const q = query.toLowerCase()
    return w.name.toLowerCase().includes(q) || w.type.toLowerCase().includes(q) || (w.process?.toLowerCase().includes(q) ?? false)
  })

  const filteredExternal = externalWidgets.filter(w => {
    if (selectedSource === 'Analysis Configuration') return false
    if (selectedSource === 'Metric') return false
    if (selectedType) return false
    if (pageWidgetIds) return false
    if (!query) return true
    const q = query.toLowerCase()
    return w.name.toLowerCase().includes(q) || w.source.toLowerCase().includes(q)
  })

  const filteredMetrics = metrics.filter(w => {
    if (selectedSource === 'Analysis Configuration') return false
    if (selectedSource === 'External Widget') return false
    if (selectedType) return false
    if (pageWidgetIds) return false
    if (!query) return true
    const q = query.toLowerCase()
    return w.name.toLowerCase().includes(q) || w.metricKind.toLowerCase().includes(q) || w.source.toLowerCase().includes(q)
  })

  const totalCount = filtered.length + filteredExternal.length + filteredMetrics.length

  const combined = [
    ...filtered.map(w => ({ kind: 'internal' as const, widget: w })),
    ...filteredExternal.map(w => ({ kind: 'external' as const, widget: w })),
    ...filteredMetrics.map(w => ({ kind: 'metric' as const, widget: w })),
  ].sort((a, b) => {
    if (sortOrder === 'name-asc') return a.widget.name.localeCompare(b.widget.name)
    if (sortOrder === 'name-desc') return b.widget.name.localeCompare(a.widget.name)
    if (sortOrder === 'recently-added') {
      const kindOrder = { external: 0, metric: 1, internal: 2 }
      if (a.kind !== b.kind) return kindOrder[a.kind] - kindOrder[b.kind]
      if (a.kind === 'internal' && b.kind === 'internal') return WIDGETS.indexOf(b.widget) - WIDGETS.indexOf(a.widget)
      return 0
    }
    return 0
  })

  const hasFilters = !!selectedType || !!selectedSource || !!location.process

  const addMenuRef = useRef<any>(null)

  return (
    <div className={s.panel}>
      <div className={s.header} style={{ gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
          <Text style={{ fontWeight: '700', fontSize: 'var(--sapFontHeader5Size)', color: 'var(--sapTextColor)', whiteSpace: 'nowrap' }}>
            Data Integration
          </Text>
        </div>
        {/* + Add dropdown button */}
        <Button
          id="data-add-btn"
          design="Default"
          icon="add"
          style={{ flexShrink: 0 } as React.CSSProperties}
          onClick={() => {
            if (addMenuRef.current) {
              addMenuRef.current.opener = 'data-add-btn'
              addMenuRef.current.open = true
            }
          }}
        >Add</Button>
        <ConnectWidgetDialog open={connectOpen} onClose={() => setConnectOpen(false)} onAdd={onAddFromBrowse} />
        {addExternalOpen && (
          <AddExternalWidgetDialog
            open={true}
            onClose={() => setAddExternalOpen(false)}
            onSave={w => {
              setAddExternalOpen(false)
              setExternalWidgets(prev => [w, ...prev])
              setSortOrder('recently-added')
              setAddedName(w.name)
              setTimeout(() => setAddedName(null), 3000)
              onWidgetAdded?.(w.name)
            }}
          />
        )}
        {addMetricOpen && (
          <AddMetricDialog
            open={true}
            onClose={() => setAddMetricOpen(false)}
            onSave={m => {
              setAddMetricOpen(false)
              setMetrics(prev => [m as Metric, ...prev])
              setSortOrder('recently-added')
              setAddedName(m.name)
              setTimeout(() => setAddedName(null), 3000)
              onWidgetAdded?.(m.name)
            }}
          />
        )}
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
        {addedName && (
          <MessageStrip className={s.messageStrip} design="Positive" hideCloseButton onClose={() => setAddedName(null)}>
            "{addedName}" added to your widgets.
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Button id="data-browse-btn" icon="browse-folder" design="Transparent" tooltip="Browse"
              style={{ '--_ui5_button_base_min_width': '1.625rem', width: '1.625rem', height: '1.625rem' } as React.CSSProperties}
              onClick={() => setConnectOpen(true)}
            />
            <Button id="data-sort-btn" icon="sort" design="Transparent"
              style={{ '--_ui5_button_base_min_width': '1.625rem', width: '1.625rem', height: '1.625rem' } as React.CSSProperties}
              onClick={() => {
                if (sortMenuRef.current) {
                  sortMenuRef.current.opener = 'data-sort-btn'
                  sortMenuRef.current.open = !sortMenuRef.current.open
                }
              }} />
          </div>
        </div>

        {/* Widget list */}
        <div className={s.list}>
          {totalCount === 0
            ? <div className={s.empty}><Text style={{ color: 'var(--sapContent_LabelColor)' }}>No results found</Text></div>
            : <>
                {combined.map(item =>
                  item.kind === 'internal'
                    ? <WidgetCard key={item.widget.id} widget={item.widget} onSelect={() => onWidgetSelect?.(item.widget)} onAddToCanvas={() => onAddFromBrowse?.(item.widget.id, item.widget.name, (item.widget as Widget).type)} />
                    : item.kind === 'metric'
                    ? <MetricCard key={`metric-${item.widget.id}`} widget={item.widget as Metric} onSelect={() => onWidgetSelect?.(item.widget)} onAddToCanvas={() => onAddFromBrowse?.(item.widget.id, item.widget.name, (item.widget as Metric).shapeType ?? 'Indicator')} onDelete={() => setMetrics(prev => prev.filter(m => m.id !== item.widget.id))} />
                    : <ExternalWidgetCard key={`ext-${item.widget.id}`} widget={item.widget} onSelect={() => onWidgetSelect?.(item.widget)} onAddToCanvas={() => onAddFromBrowse?.(item.widget.id, item.widget.name, (item.widget as ExternalWidget).shapeType ?? 'Indicator')} onDelete={() => setExternalWidgets(prev => prev.filter(w => w.id !== item.widget.id))} />
                )}
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
          setSelectedSource(txt)
        }}>
          <MenuItem text="Analysis Configuration" />
          <MenuItem text="External Widget" />
          <MenuItem text="Metric" />
        </Menu>,
        document.body
      )}

      {/* + Add menu */}
      {createPortal(
        <Menu ref={addMenuRef} onItemClick={(e: any) => {
          const key = e.detail?.item?.dataset?.addType
          if (key === 'external') setAddExternalOpen(true)
          else if (key === 'metric') setAddMetricOpen(true)
        }}>
          <MenuItem text="External Widget" data-add-type="external" icon="attachment" />
          <MenuItem text="Metric" data-add-type="metric" icon="performance" />
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
