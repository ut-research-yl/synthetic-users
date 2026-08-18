import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Button, Icon, Input, Label, Modals, Select, Option, Tab, Text, List, ListItemStandard } from '@ui5/webcomponents-react'
import { SigChipV2, SigRightSidePanel } from '@signavio/sap-signavio-uixtension'
import type { LiShape } from '../pages/ModelerApp'
import { CWD_DATA } from './ConnectWidgetDialog'
import ConnectWidgetSearchDialog from './ConnectWidgetSearchDialog'
import { RelationsTab } from '../pages/Repository/RelationsTab'

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

const WIDGET_PATH_FALLBACK: Record<string, string> = {
  'ext-001': 'Order to Cash / O2C Analysis / Overview',
  'ext-002': 'Order to Cash / O2C Dashboard / Overview',
  'ext-003': 'O2C Onboarding / Onboarding Dashboard / Overview',
  'ext-004': 'Plan to Produce / Production Dashboard / Overview',
  'ext-005': 'Order to Cash / O2C Analysis / Overview',
}

function getWidgetPath(widgetId: string): string | undefined {
  for (const [process, data] of Object.entries(CWD_DATA)) {
    for (const typeKey of ['Investigation', 'Dashboard'] as const) {
      const sections = data[typeKey]
      if (!sections) continue
      for (const [section, sectionData] of Object.entries(sections)) {
        for (const [page, ids] of Object.entries(sectionData.pages)) {
          if (ids.includes(widgetId)) return `${process} / ${section} / ${page}`
        }
      }
    }
  }
  return WIDGET_PATH_FALLBACK[widgetId]
}

type Props = {
  shape: LiShape
  onClose: () => void
  onUpdate?: (id: string, changes: Partial<LiShape>) => void
  onSelectLinkedElement?: (elementId: string) => void
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

const STATUS_OPTIONS = ['No data', 'Green', 'Yellow', 'Red']

const CHART_PREVIEW_SVG: Record<string, string> = {
  'bar': `<svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="55" y1="20" x2="55" y2="160" stroke="#e8ecf0" stroke-width="1"/><line x1="55" y1="160" x2="380" y2="160" stroke="#e8ecf0" stroke-width="1"/><line x1="55" y1="120" x2="380" y2="120" stroke="#e8ecf0" stroke-width="1" stroke-dasharray="4,3"/><line x1="55" y1="80" x2="380" y2="80" stroke="#e8ecf0" stroke-width="1" stroke-dasharray="4,3"/><line x1="55" y1="40" x2="380" y2="40" stroke="#e8ecf0" stroke-width="1" stroke-dasharray="4,3"/><rect x="70" y="65" width="40" height="95" fill="#0064d9" rx="2"/><rect x="130" y="95" width="40" height="65" fill="#0064d9" rx="2" opacity="0.75"/><rect x="190" y="45" width="40" height="115" fill="#0064d9" rx="2"/><rect x="250" y="110" width="40" height="50" fill="#0064d9" rx="2" opacity="0.75"/><rect x="310" y="75" width="40" height="85" fill="#0064d9" rx="2"/></svg>`,
  'line': `<svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="50" y1="20" x2="50" y2="160" stroke="#e8ecf0" stroke-width="1"/><line x1="50" y1="160" x2="380" y2="160" stroke="#e8ecf0" stroke-width="1"/><line x1="50" y1="120" x2="380" y2="120" stroke="#e8ecf0" stroke-width="1" stroke-dasharray="4,3"/><line x1="50" y1="80" x2="380" y2="80" stroke="#e8ecf0" stroke-width="1" stroke-dasharray="4,3"/><line x1="50" y1="40" x2="380" y2="40" stroke="#e8ecf0" stroke-width="1" stroke-dasharray="4,3"/><polyline points="70,130 130,100 190,60 250,90 310,50 370,80" stroke="#0064d9" stroke-width="2.5" fill="none" stroke-linejoin="round"/><circle cx="70" cy="130" r="4" fill="#0064d9"/><circle cx="130" cy="100" r="4" fill="#0064d9"/><circle cx="190" cy="60" r="4" fill="#0064d9"/><circle cx="250" cy="90" r="4" fill="#0064d9"/><circle cx="310" cy="50" r="4" fill="#0064d9"/><circle cx="370" cy="80" r="4" fill="#0064d9"/></svg>`,
  'area': `<svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="50" y1="20" x2="50" y2="160" stroke="#e8ecf0" stroke-width="1"/><line x1="50" y1="160" x2="380" y2="160" stroke="#e8ecf0" stroke-width="1"/><line x1="50" y1="120" x2="380" y2="120" stroke="#e8ecf0" stroke-width="1" stroke-dasharray="4,3"/><line x1="50" y1="80" x2="380" y2="80" stroke="#e8ecf0" stroke-width="1" stroke-dasharray="4,3"/><path d="M70 130 L130 105 L190 65 L250 90 L310 55 L370 80 L370 160 L70 160 Z" fill="#0064d9" opacity="0.15"/><polyline points="70,130 130,105 190,65 250,90 310,55 370,80" stroke="#0064d9" stroke-width="2.5" fill="none" stroke-linejoin="round"/></svg>`,
  'dual': `<svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="55" y1="20" x2="55" y2="160" stroke="#e8ecf0" stroke-width="1"/><line x1="55" y1="160" x2="380" y2="160" stroke="#e8ecf0" stroke-width="1"/><line x1="55" y1="120" x2="380" y2="120" stroke="#e8ecf0" stroke-width="1" stroke-dasharray="4,3"/><line x1="55" y1="80" x2="380" y2="80" stroke="#e8ecf0" stroke-width="1" stroke-dasharray="4,3"/><rect x="72" y="80" width="36" height="80" fill="#a8d4f5" rx="2"/><rect x="140" y="100" width="36" height="60" fill="#a8d4f5" rx="2"/><rect x="208" y="60" width="36" height="100" fill="#a8d4f5" rx="2"/><rect x="276" y="110" width="36" height="50" fill="#a8d4f5" rx="2"/><rect x="344" y="75" width="36" height="85" fill="#a8d4f5" rx="2"/><polyline points="90,95 158,72 226,52 294,82 362,62" stroke="#0064d9" stroke-width="2.5" fill="none" stroke-linejoin="round"/><circle cx="90" cy="95" r="4" fill="#0064d9"/><circle cx="158" cy="72" r="4" fill="#0064d9"/><circle cx="226" cy="52" r="4" fill="#0064d9"/><circle cx="294" cy="82" r="4" fill="#0064d9"/><circle cx="362" cy="62" r="4" fill="#0064d9"/></svg>`,
  'pie': `<svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M200 100 L200 40 A60 60 0 0 1 248.5 135.3 Z" fill="#0064d9"/><path d="M200 100 L248.5 135.3 A60 60 0 0 1 164.7 148.5 Z" fill="#5baae7"/><path d="M200 100 L164.7 148.5 A60 60 0 0 1 151.5 64.7 Z" fill="#a8d4f5"/><path d="M200 100 L151.5 64.7 A60 60 0 0 1 200 40 Z" fill="#d4ebfa"/><text x="219" y="83" font-size="10" fill="white" font-family="72,Arial" font-weight="600">35%</text><text x="217" y="140" font-size="10" fill="white" font-family="72,Arial" font-weight="600">25%</text><text x="148" y="110" font-size="10" fill="#556b82" font-family="72,Arial" font-weight="600">25%</text><text x="162" y="60" font-size="10" fill="#556b82" font-family="72,Arial" font-weight="600">15%</text></svg>`,
  'treemap': `<svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="30" y="20" width="175" height="140" fill="#0064d9" rx="2"/><rect x="210" y="20" width="160" height="78" fill="#5baae7" rx="2"/><rect x="210" y="103" width="78" height="57" fill="#a8d4f5" rx="2"/><rect x="293" y="103" width="77" height="57" fill="#d4ebfa" rx="2"/><text x="117" y="95" text-anchor="middle" font-size="12" fill="white" font-family="72,Arial" font-weight="600">35%</text><text x="290" y="64" text-anchor="middle" font-size="12" fill="white" font-family="72,Arial" font-weight="600">25%</text><text x="249" y="136" text-anchor="middle" font-size="10" fill="#556b82" font-family="72,Arial">20%</text><text x="331" y="136" text-anchor="middle" font-size="10" fill="#556b82" font-family="72,Arial">20%</text></svg>`,
  'heat': `<svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="40" y="22" width="60" height="32" fill="#d4ebfa" rx="1"/><rect x="105" y="22" width="60" height="32" fill="#5baae7" rx="1"/><rect x="170" y="22" width="60" height="32" fill="#0064d9" rx="1"/><rect x="235" y="22" width="60" height="32" fill="#5baae7" rx="1"/><rect x="300" y="22" width="60" height="32" fill="#a8d4f5" rx="1"/><rect x="40" y="59" width="60" height="32" fill="#5baae7" rx="1"/><rect x="105" y="59" width="60" height="32" fill="#0064d9" rx="1"/><rect x="170" y="59" width="60" height="32" fill="#0064d9" rx="1"/><rect x="235" y="59" width="60" height="32" fill="#a8d4f5" rx="1"/><rect x="300" y="59" width="60" height="32" fill="#d4ebfa" rx="1"/><rect x="40" y="96" width="60" height="32" fill="#a8d4f5" rx="1"/><rect x="105" y="96" width="60" height="32" fill="#5baae7" rx="1"/><rect x="170" y="96" width="60" height="32" fill="#a8d4f5" rx="1"/><rect x="235" y="96" width="60" height="32" fill="#0064d9" rx="1"/><rect x="300" y="96" width="60" height="32" fill="#5baae7" rx="1"/><rect x="40" y="133" width="60" height="32" fill="#d4ebfa" rx="1"/><rect x="105" y="133" width="60" height="32" fill="#a8d4f5" rx="1"/><rect x="170" y="133" width="60" height="32" fill="#5baae7" rx="1"/><rect x="235" y="133" width="60" height="32" fill="#a8d4f5" rx="1"/><rect x="300" y="133" width="60" height="32" fill="#d4ebfa" rx="1"/></svg>`,
  'sankey': `<svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="40" y="20" width="22" height="65" fill="#0064d9" rx="2"/><rect x="40" y="95" width="22" height="45" fill="#5baae7" rx="2"/><rect x="40" y="150" width="22" height="30" fill="#a8d4f5" rx="2"/><path d="M62 20 C160 20 240 25 338 25 L338 65 C240 65 160 60 62 85 Z" fill="#0064d9" opacity="0.3"/><path d="M62 20 C160 20 240 90 338 90 L338 120 C240 120 160 60 62 85 Z" fill="#0064d9" opacity="0.2"/><path d="M62 95 C160 95 240 90 338 90 L338 120 C240 120 160 130 62 140 Z" fill="#5baae7" opacity="0.3"/><path d="M62 150 C160 150 240 130 338 130 L338 170 C240 170 160 170 62 180 Z" fill="#a8d4f5" opacity="0.3"/><rect x="338" y="25" width="22" height="65" fill="#0064d9" rx="2"/><rect x="338" y="90" width="22" height="40" fill="#5baae7" rx="2"/><rect x="338" y="130" width="22" height="40" fill="#a8d4f5" rx="2"/></svg>`,
  'hist': `<svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="40" y1="160" x2="380" y2="160" stroke="#e8ecf0" stroke-width="1"/><line x1="40" y1="120" x2="380" y2="120" stroke="#e8ecf0" stroke-width="1" stroke-dasharray="4,3"/><line x1="40" y1="80" x2="380" y2="80" stroke="#e8ecf0" stroke-width="1" stroke-dasharray="4,3"/><line x1="40" y1="40" x2="380" y2="40" stroke="#e8ecf0" stroke-width="1" stroke-dasharray="4,3"/><rect x="45" y="130" width="38" height="30" fill="#0064d9" rx="1" opacity="0.65"/><rect x="88" y="105" width="38" height="55" fill="#0064d9" rx="1" opacity="0.75"/><rect x="131" y="72" width="38" height="88" fill="#0064d9" rx="1" opacity="0.85"/><rect x="174" y="42" width="38" height="118" fill="#0064d9" rx="1"/><rect x="217" y="55" width="38" height="105" fill="#0064d9" rx="1" opacity="0.9"/><rect x="260" y="88" width="38" height="72" fill="#0064d9" rx="1" opacity="0.75"/><rect x="303" y="118" width="38" height="42" fill="#0064d9" rx="1" opacity="0.65"/><rect x="346" y="142" width="38" height="18" fill="#0064d9" rx="1" opacity="0.55"/></svg>`,
  'ring': `<svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="200" cy="100" r="65" stroke="#e8ecf0" stroke-width="18" fill="none"/><path d="M200 35 A65 65 0 1 1 135 100" stroke="#0064d9" stroke-width="18" fill="none" stroke-linecap="round"/><text x="200" y="95" text-anchor="middle" font-size="28" font-weight="700" fill="#0064d9" font-family="72,Arial">75%</text><text x="200" y="118" text-anchor="middle" font-size="11" fill="#556b82" font-family="72,Arial">completion</text></svg>`,
  'cockpit': `<svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M80 150 A120 120 0 0 1 320 150" stroke="#e8ecf0" stroke-width="20" fill="none" stroke-linecap="round"/><path d="M80 150 A120 120 0 0 1 272 67" stroke="#0064d9" stroke-width="20" fill="none" stroke-linecap="round"/><line x1="200" y1="150" x2="248" y2="72" stroke="#1d2d3e" stroke-width="3" stroke-linecap="round"/><circle cx="200" cy="150" r="7" fill="#1d2d3e"/><text x="200" y="130" text-anchor="middle" font-size="26" font-weight="700" fill="#0064d9" font-family="72,Arial">82</text><text x="200" y="175" text-anchor="middle" font-size="11" fill="#556b82" font-family="72,Arial">Health Score</text></svg>`,
  'sentiment': `<svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="40" y1="160" x2="380" y2="160" stroke="#e8ecf0" stroke-width="1"/><rect x="45" y="120" width="45" height="40" fill="#BB0000" rx="1" opacity="0.8"/><rect x="100" y="100" width="45" height="60" fill="#E9730C" rx="1" opacity="0.8"/><rect x="155" y="75" width="45" height="85" fill="#ffd666" rx="1" opacity="0.85"/><rect x="210" y="45" width="45" height="115" fill="#27a65a" rx="1"/><rect x="265" y="80" width="45" height="80" fill="#27a65a" rx="1" opacity="0.75"/><rect x="320" y="115" width="45" height="45" fill="#27a65a" rx="1" opacity="0.5"/><text x="67" y="185" text-anchor="middle" font-size="9" fill="#8c9bab" font-family="72,Arial">1</text><text x="122" y="185" text-anchor="middle" font-size="9" fill="#8c9bab" font-family="72,Arial">2</text><text x="177" y="185" text-anchor="middle" font-size="9" fill="#8c9bab" font-family="72,Arial">3</text><text x="232" y="185" text-anchor="middle" font-size="9" fill="#8c9bab" font-family="72,Arial">4</text><text x="287" y="185" text-anchor="middle" font-size="9" fill="#8c9bab" font-family="72,Arial">5</text><text x="342" y="185" text-anchor="middle" font-size="9" fill="#8c9bab" font-family="72,Arial">6</text></svg>`,
}

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

export default function LiShapeDetailPanel({ shape, onClose, onUpdate, onSelectLinkedElement }: Props) {
  const [manualValue, setManualValue] = useState(shape.manualValue ?? 'No data')
  const [shapeType, setShapeType] = useState(shape.shapeType)
  const [widgetId, setWidgetId] = useState(shape.widgetId)
const [previewOpen, setPreviewOpen] = useState(false)
  const previewAnchorRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const [previewTop, setPreviewTop] = useState(0)
  const [shapeDropdownOpen, setShapeDropdownOpen] = useState(false)
  const [shapeDropdownPos, setShapeDropdownPos] = useState<{ top: number; left: number } | null>(null)
  const shapeDropdownRef = useRef<HTMLDivElement>(null)
  const [searchDialogOpen, setSearchDialogOpen] = useState(false)

  const shapeDropdownPortalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!shapeDropdownOpen) return
    function handleClick(e: MouseEvent) {
      const target = e.target as Node
      const inTrigger = shapeDropdownRef.current?.contains(target)
      const inPortal = shapeDropdownPortalRef.current?.contains(target)
      if (!inTrigger && !inPortal) setShapeDropdownOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [shapeDropdownOpen])

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

          {/* Manual value */}
          {shapeType !== 'Value' && (
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
          )}

          {/* Driving widget */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', padding: '0.5rem 0' }}>
            <Label showColon style={{ color: 'var(--sapContent_LabelColor)' }}>Driving widget</Label>
            {widgetId ? (
              <>
                <div style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0' }}>
                    <div style={{
                      width: '2rem', height: '2rem', borderRadius: '0.5rem', flexShrink: 0,
                      background: 'var(--sapAvatar_6_Background, #d1efff)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon name={chartIcon} style={{ width: '1rem', height: '1rem', color: '#0064d9' } as React.CSSProperties} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text style={{ fontWeight: 700, fontSize: 'var(--sapFontSize)', color: 'var(--sapList_TextColor, #1d2d3e)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "var(--sapFontFamily,'72',sans-serif)" } as React.CSSProperties}>
                        {shape.widgetName}
                      </Text>
                      {getWidgetPath(widgetId) && (
                        <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor, #556b82)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "var(--sapFontFamily,'72',sans-serif)" } as React.CSSProperties}>
                          {getWidgetPath(widgetId)}
                        </Text>
                      )}
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
                  <Button design="Default" icon="edit" style={{ alignSelf: 'flex-start' } as React.CSSProperties} onClick={() => setSearchDialogOpen(true)} />
                </div>
              </>
            ) : (
              <Button design="Default" icon="add" style={{ alignSelf: 'flex-start' } as React.CSSProperties} onClick={() => setSearchDialogOpen(true)} />
            )}
          </div>
        </div>
      </div>
    </Tab>,
    <Tab text="Relations" key="relations">
      <div style={{ paddingBottom: '12px' }}>
        <RelationsTab />
      </div>
    </Tab>,
  ]

  return (
    <div ref={panelRef} style={{ position: 'relative', height: '100%' }}>
      <SigRightSidePanel
        headerTitle={shape.widgetName}
        editable
        editableTitlePlaceholder={shape.widgetName}
        isOpen
        toggleRightSidePanel={onClose}
        navigationSlot={[() => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: 8, flexShrink: 0, background: 'var(--sapAvatar_6_Background, #d1efff)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={currentShapeIcon} style={{ width: 14, height: 14, color: '#0064d9' } as React.CSSProperties} />
            </div>
            <div ref={shapeDropdownRef} style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  if (!shapeDropdownOpen && shapeDropdownRef.current) {
                    const rect = shapeDropdownRef.current.getBoundingClientRect()
                    setShapeDropdownPos({ top: rect.bottom + 4, left: rect.left - 32 })
                  }
                  setShapeDropdownOpen(v => !v)
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'var(--sapFontFamily)', fontSize: 'var(--sapFontSize)', fontWeight: 700, color: 'var(--sapPageHeader_TextColor)' }}
              >
                <span>{shapeType}</span>
                <Icon name="slim-arrow-down" style={{ width: '0.75rem', height: '0.75rem', color: 'var(--sapContent_LabelColor)' } as React.CSSProperties} />
              </button>
              {shapeDropdownOpen && shapeDropdownPos && createPortal(
                <div ref={shapeDropdownPortalRef} style={{ position: 'fixed', top: shapeDropdownPos.top, left: shapeDropdownPos.left, zIndex: 9999, background: '#fff', borderRadius: '0.5rem', boxShadow: '0 0 0 1px rgba(34,53,72,0.2), 0 4px 12px rgba(34,53,72,0.15)', minWidth: '10rem', width: 'max-content', overflow: 'hidden' }}>
                  <List selectionMode="Single" onSelectionChange={(e: any) => {
                    const val = e.detail?.selectedItems?.[0]?.dataset?.value
                    if (val) { setShapeType(val); onUpdate?.(shape.id, { shapeType: val }) }
                    setShapeDropdownOpen(false)
                  }}>
                    {SHAPE_OPTIONS.map(t => (
                      <ListItemStandard key={t.value} data-value={t.value} icon={t.icon} selected={shapeType === t.value}>
                        {t.label}
                      </ListItemStandard>
                    ))}
                  </List>
                </div>,
                document.body
              )}
            </div>
          </div>
        )]}
        contentActionsSlot={[]}
        subHeaderSlot={shape.linkedBpmnId && shape.linkedBpmnName ? (
          <div onClick={() => onSelectLinkedElement?.(shape.linkedBpmnId!)}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', cursor: 'pointer', userSelect: 'none' }}
          >
            <div style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', flexShrink: 0, background: 'var(--sapAvatar_6_Background, #d1efff)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="SAP-icons-v4/task-activity" style={{ width: '1rem', height: '1rem', color: '#0064d9' } as React.CSSProperties} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontWeight: 700, fontSize: 'var(--sapFontSize)', color: 'var(--sapList_TextColor, #1d2d3e)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "var(--sapFontFamily,'72',sans-serif)" } as React.CSSProperties}>
                {shape.linkedBpmnName}
              </Text>
              <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor, #556b82)', display: 'block', fontFamily: "var(--sapFontFamily,'72',sans-serif)" } as React.CSSProperties}>Linked Elements</Text>
            </div>
            <Button icon="slim-arrow-right" design="Transparent" style={{ flexShrink: 0 }} />
          </div>
        ) : undefined}
        tabSlot={tabs}
        style={{ width: '100%', maxWidth: 'none', height: '100%', overflow: 'hidden', background: 'var(--sapList_Background)', position: 'relative' }}
      >
        {''}
      </SigRightSidePanel>

      {/* Widget preview overlay */}
      {previewOpen && widgetId && (() => {
        const mock = WIDGET_MOCK[widgetId] ?? {
          chartSvg: CHART_PREVIEW_SVG[widgetId.split('-')[0]] ?? `<svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="40" y="20" width="320" height="160" rx="6" fill="#f5f6f7"/><text x="200" y="105" text-anchor="middle" font-size="13" fill="#8c9bab" font-family="72,Arial">Preview not available</text></svg>`,
        }
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

      {searchDialogOpen && (
        <ConnectWidgetSearchDialog
          open={searchDialogOpen}
          shapeType={shapeType}
          currentWidgetId={widgetId || undefined}
          onConnect={(id, name, type) => {
            const WIDGET_TYPE_TO_SHAPE: Record<string, string> = {
              'Value': 'Value', 'Bar Chart': 'Progress Bar', 'Line Chart': 'Trend',
              'Area Chart': 'Trend', 'Dual Axis Chart': 'Trend', 'Pie Chart': 'Ring Chart',
              'Treemap': 'Progress Bar', 'Heat Map': 'Traffic Light', 'Sankey Chart': 'Trend',
              'Histogram': 'Progress Bar', 'Ring Chart': 'Ring Chart',
              'External Widget': 'Indicator', 'Metric': 'Indicator',
            }
            const newShapeType = WIDGET_TYPE_TO_SHAPE[type] ?? 'Indicator'
            setWidgetId(id)
            setShapeType(newShapeType)
            setPreviewOpen(false)
            onUpdate?.(shape.id, { widgetId: id, widgetName: name, shapeType: newShapeType })
            Modals.showToast({ children: `"${name}" connected to shape.` })
          }}
          onClose={() => setSearchDialogOpen(false)}
        />
      )}
    </div>
  )
}
