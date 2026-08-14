import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Button, Icon, Text, Menu, MenuItem, MenuSeparator, SplitButton, Dialog, Bar, Input, ToggleButton, Toast } from '@ui5/webcomponents-react'
import { createPortal } from 'react-dom'
import { SigChipV2, SigDomainObject, SigInlineEdit } from '@signavio/sap-signavio-uixtension'
import { useNavigate } from 'react-router-dom'
import '@ui5/webcomponents-icons/dist/chain-link.js'
import bpmnModelImg from '../assets/bpmn-model.svg'
import { CollaborativeCursors, type Collaborator } from '../components/CollaborativeCursors'
import { PresenceAvatarGroup, type PresenceUser } from '../components/PresenceAvatarGroup'
import DictionaryPanel from '../components/DictionaryPanel'
import DictionarySuggestionPopup from '../components/DictionarySuggestionPopup'
import DataPanel from '../components/DataPanel'
import type { Widget, ExternalWidget } from '../components/DataPanel'
import { LinkedDictPopup, UnlinkedDictPopup, getDictName, DICT_DATA } from '../components/DictionaryLinkPopup'
import NewDiagramOverlay from '../components/NewDiagramOverlay'
import ElementsPanel from '../components/ElementsPanel'
import MoreElementsPanel from '../components/MoreElementsPanel'
import {
  ELEMENT_GEOMETRY,
  CONNECTIONS,
  elementData as INITIAL_ELEMENT_DATA,
  dictionaryItems,
  type ElementData,
  type ElementGeometry,
  type Connection,
} from '../data/liveInsightsData'
import { RESULTS } from '../components/SearchResultsPanel'
import s from './ModelerApp.module.css'

// ── Types ─────────────────────────────────────────────────────────────────────

type Props = { assetId?: string; onTogglePanel?: () => void; onElementSelect?: (id: string | null, hasLinkedDict?: boolean, dictId?: string) => void; onLiShapeSelect?: (shape: LiShape | null) => void; onLiShapeUpdate?: (id: string, changes: Partial<LiShape>) => void; onRegisterLiShapeUpdater?: (fn: (id: string, changes: Partial<LiShape>) => void) => void; onRegisterAddLiShape?: (fn: (shape: LiShape) => void) => void; onSelectElementById?: (fn: (id: string) => void) => void; onRegisterSelectLiShapeById?: (fn: (id: string) => void) => void; onRegisterLinkDictToElement?: (fn: (elementId: string, dictId: string, dictName: string) => void) => void; onLiShapesChange?: (shapes: LiShape[]) => void; onWidgetSelect?: (widget: Widget | ExternalWidget) => void; onOpenDictPanel?: () => void; onDictItemSelect?: (item: any) => void; onAddBrowseWidget?: (widgetId: string, widgetName: string, widgetType: string) => void; panelOffset?: number }

type SaveState = 'draft' | 'saved' | 'saving' | 'offline' | 'error'

type CanvasElement = ElementData & ElementGeometry & {
  id: string
  drivingWidget?: string
  drivingWidgetName?: string
  linkedDictId?: string
  linkedDictName?: string
}

export function getAssetName(assetId?: string): string {
  if (!assetId || assetId === 'new') return 'Untitled'
  if (assetId === '1') return 'HR Hiring Process'
  const found = RESULTS.find(r => r.id === assetId)
  if (found) return found.name
  return assetId === 'a1' ? 'HR Hiring Process GER'
    : assetId === 'a2' ? 'Incident Management'
    : assetId === 'a3' ? 'Order-to-Cash Value Chain'
    : 'Untitled'
}

export type LiShape = {
  id: string
  cx: number
  cy: number
  shapeType: string
  widgetId: string
  widgetName: string
  label?: string
  linkedBpmnId?: string
  linkedBpmnName?: string
  linkedBpmnElements?: { id: string; name: string }[]
  manualValue?: string
}

const SAVE_CHIP: Record<SaveState, { label: string; icon: string; design: string }> = {
  draft:   { label: 'Draft',                  icon: 'write-new-document', design: 'none'     },
  saved:   { label: 'Saved',                  icon: 'cloud-check',        design: 'positive' },
  saving:  { label: 'Saving...',              icon: 'upload-to-cloud',    design: 'none'     },
  offline: { label: 'Offline - Reconnecting', icon: 'warning2',           design: 'critical' },
  error:   { label: 'Unable to Save',         icon: 'message-error',      design: 'negative' },
}

// LI shape type mapping from widget type
const WIDGET_TYPE_TO_LI_SHAPE: Record<string, string> = {
  'Value':           'Value',
  'Ring Chart':      'Ring Chart',
  'Pie Chart':       'Ring Chart',
  'Bar Chart':       'Progress Bar',
  'Histogram':       'Progress Bar',
  'Treemap':         'Progress Bar',
  'Line Chart':      'Trend',
  'Area Chart':      'Trend',
  'Dual Axis Chart': 'Trend',
  'Sankey Chart':    'Trend',
  'Heat Map':        'Traffic Light',
  'Cockpit':         'Cockpit',
  'Sentiment':       'Sentiment',
}

// Initial elements from ELEMENT_GEOMETRY + elementData merged
function buildInitialElements(): CanvasElement[] {
  return Object.keys(ELEMENT_GEOMETRY).map(id => ({
    id,
    ...ELEMENT_GEOMETRY[id],
    ...INITIAL_ELEMENT_DATA[id],
  }))
}

// ── SVG coordinate conversion ──────────────────────────────────────────────────

function clientToSvg(
  clientX: number, clientY: number,
  svgEl: SVGSVGElement,
) {
  const pt = svgEl.createSVGPoint()
  pt.x = clientX
  pt.y = clientY
  const ctm = svgEl.getScreenCTM()
  if (!ctm) return { x: 0, y: 0 }
  const svgPt = pt.matrixTransform(ctm.inverse())
  return { x: svgPt.x, y: svgPt.y }
}

// ── Connection geometry ────────────────────────────────────────────────────────

function getConnectionPoints(
  conn: Connection,
  geomMap: Record<string, ElementGeometry>
) {
  const sg = geomMap[conn.from]
  const tg = geomMap[conn.to]
  if (!sg || !tg) return null

  const scx = sg.cx, scy = sg.cy
  const tcx = tg.cx, tcy = tg.cy
  const dx = tcx - scx, dy = tcy - scy

  // Dynamic: pick the closest pair of edges based on relative position
  if (Math.abs(dx) >= Math.abs(dy)) {
    // horizontal dominant
    if (dx >= 0) return { x1: scx + sg.hw, y1: scy, x2: tcx - tg.hw, y2: tcy, dir: 'h' as const }
    else         return { x1: scx - sg.hw, y1: scy, x2: tcx + tg.hw, y2: tcy, dir: 'h' as const }
  } else {
    // vertical dominant
    if (dy >= 0) return { x1: scx, y1: scy + sg.hh, x2: tcx, y2: tcy - tg.hh, dir: 'v' as const }
    else         return { x1: scx, y1: scy - sg.hh, x2: tcx, y2: tcy + tg.hh, dir: 'vu' as const }
  }
}

// ── Hit test ──────────────────────────────────────────────────────────────────

function hitTestElement(x: number, y: number, elements: CanvasElement[]): CanvasElement | null {
  for (let i = elements.length - 1; i >= 0; i--) {
    const el = elements[i]
    if (x >= el.cx - el.hw - 4 && x <= el.cx + el.hw + 4 &&
        y >= el.cy - el.hh - 4 && y <= el.cy + el.hh + 4) {
      return el
    }
  }
  return null
}

// ── LI Shape auto-placement ───────────────────────────────────────────────────

function findLiShapePosition(
  bpmnEl: CanvasElement,
  existingElements: CanvasElement[],
  liShapes: LiShape[],
  shapeType?: string
): { cx: number; cy: number } {
  const liR = shapeType === 'Value' ? 14 : 30
  const gap = 100
  const steps = [1, 1.5, 2, 2.5]
  const offsets: { dx: number; dy: number }[] = []
  for (const s of steps) {
    const dx = (bpmnEl.hw + liR + gap) * s
    const dy = (bpmnEl.hh + liR + gap) * s
    offsets.push(
      { dx: 0, dy: -dy },
      { dx: 0, dy: dy },
      { dx: -dx, dy: 0 },
      { dx: dx, dy: 0 },
      { dx: -dx, dy: -dy },
      { dx: dx, dy: -dy },
      { dx: -dx, dy: dy },
      { dx: dx, dy: dy },
    )
  }
  // check ALL elements for collision (not just solid ones)
  for (const off of offsets) {
    const cx = bpmnEl.cx + off.dx
    const cy = bpmnEl.cy + off.dy
    const collision = existingElements.some(e =>
      Math.abs(e.cx - cx) < Math.max(e.hw, 24) + liR + 20 && Math.abs(e.cy - cy) < Math.max(e.hh, 24) + liR + 20
    ) || liShapes.some(ls =>
      Math.abs(ls.cx - cx) < liR * 2 + 20 && Math.abs(ls.cy - cy) < liR * 2 + 20
    )
    if (!collision) return { cx, cy }
  }
  return { cx: bpmnEl.cx - (bpmnEl.hw + liR + gap), cy: bpmnEl.cy + bpmnEl.hh + liR + gap * 2 }
}

function findEmptySpotNearViewportCenter(
  vcx: number, vcy: number,
  elements: CanvasElement[],
  liShapes: LiShape[],
  shapeType: string
): { cx: number; cy: number } {
  const r = shapeType === 'Value' ? 14 : 30
  const step = 100
  for (let ring = 0; ring <= 12; ring++) {
    const angles = ring === 0 ? [0] : Array.from({ length: 8 }, (_, i) => i * 45)
    for (const deg of angles) {
      const rad = deg * Math.PI / 180
      const cx = vcx + Math.cos(rad) * ring * step
      const cy = vcy + Math.sin(rad) * ring * step
      const hit = elements.some(e =>
        Math.abs(e.cx - cx) < Math.max(e.hw, 24) + r + 20 && Math.abs(e.cy - cy) < Math.max(e.hh, 24) + r + 20
      ) || liShapes.some(ls =>
        Math.abs(ls.cx - cx) < r * 2 + 20 && Math.abs(ls.cy - cy) < r * 2 + 20
      )
      if (!hit) return { cx, cy }
    }
  }
  return { cx: vcx, cy: vcy + 300 }
}

// ── SVG shape renderers ───────────────────────────────────────────────────────

function TaskShape({ el, selected, hovered, ringW, editing }: { el: CanvasElement; selected: boolean; hovered: boolean; ringW: number; editing?: boolean }) {
  const x = el.cx - el.hw, y = el.cy - el.hh
  const w = el.hw * 2, h = el.hh * 2
  const lines = el.name.split(' ')
  const mid = Math.ceil(lines.length / 2)
  const line1 = lines.slice(0, mid).join(' ')
  const line2 = lines.slice(mid).join(' ')
  return (
    <g>
      {hovered && !selected && <rect x={x - ringW / 2 - 0.5} y={y - ringW / 2 - 0.5} width={w + ringW + 1} height={h + ringW + 1} rx={0} fill="none" stroke="var(--sapHighlightColor)" strokeWidth={ringW} style={{ pointerEvents: 'none' }} />}
      <rect
        x={x} y={y} width={w} height={h} rx={12}
        fill="#fff"
        stroke={selected ? 'var(--sapIndicationColor_9_BorderColor)' : 'var(--sapTextColor)'}
        strokeWidth={1}
        strokeDasharray={el.subtype === 'EventSubprocess' || el.subtype === 'CollapsedEventSubprocess' ? '4 3' : undefined}
      />
      {!editing && (line2
        ? <>
            <text x={el.cx} y={el.cy - 7} fontSize={12} fill="var(--sapTextColor)" textAnchor="middle" dominantBaseline="middle" fontFamily="'72',Arial,sans-serif" fontWeight="500">{line1}</text>
            <text x={el.cx} y={el.cy + 7} fontSize={12} fill="var(--sapTextColor)" textAnchor="middle" dominantBaseline="middle" fontFamily="'72',Arial,sans-serif" fontWeight="500">{line2}</text>
          </>
        : <text x={el.cx} y={el.cy} fontSize={12} fill="var(--sapTextColor)" textAnchor="middle" dominantBaseline="middle" fontFamily="'72',Arial,sans-serif" fontWeight="500">{line1}</text>
      )}
      {(el.subtype === 'CollapsedSubprocess' || el.subtype === 'ExpandedSubprocess' || el.subtype === 'CollapsedEventSubprocess') && (() => {
        const plusSize = 14, px = el.cx, py = y + h - plusSize / 2
        return (
          <g>
            {/* white bg to cover border line behind + box */}
            <rect x={px - plusSize/2 - 1} y={py - 1} width={plusSize + 2} height={plusSize/2 + 2} fill="white" />
            {/* + box: top corners rounded r3, bottom corners square */}
            <path d={`M${px - plusSize/2 + 3} ${py - plusSize/2} L${px + plusSize/2 - 3} ${py - plusSize/2} Q${px + plusSize/2} ${py - plusSize/2} ${px + plusSize/2} ${py - plusSize/2 + 3} L${px + plusSize/2} ${py + plusSize/2} L${px - plusSize/2} ${py + plusSize/2} L${px - plusSize/2} ${py - plusSize/2 + 3} Q${px - plusSize/2} ${py - plusSize/2} ${px - plusSize/2 + 3} ${py - plusSize/2} Z`} fill="white" stroke="var(--sapTextColor)" strokeWidth={1} />
            <line x1={px} y1={py - 4} x2={px} y2={py + 4} stroke="var(--sapTextColor)" strokeWidth={1} strokeLinecap="round" />
            <line x1={px - 4} y1={py} x2={px + 4} y2={py} stroke="var(--sapTextColor)" strokeWidth={1} strokeLinecap="round" />
          </g>
        )
      })()}
      {selected && <rect x={x - ringW / 2 - 0.5} y={y - ringW / 2 - 0.5} width={w + ringW + 1} height={h + ringW + 1} rx={0} fill="none" stroke="var(--sapHighlightColor)" strokeWidth={ringW} />}
    </g>
  )
}

function GatewayShape({ el, selected, hovered, ringW }: { el: CanvasElement; selected: boolean; hovered: boolean; ringW: number }) {
  const { cx, cy, hw } = el
  const tc = 'var(--sapTextColor)'
  const r6 = 6 * (hw / 20)
  const k = r6 * 0.707  // offset along 45° edges
  const diamond = `
    M${cx - k} ${cy - hw + k}
    Q${cx} ${cy - hw} ${cx + k} ${cy - hw + k}
    L${cx + hw - k} ${cy - k}
    Q${cx + hw} ${cy} ${cx + hw - k} ${cy + k}
    L${cx + k} ${cy + hw - k}
    Q${cx} ${cy + hw} ${cx - k} ${cy + hw - k}
    L${cx - hw + k} ${cy + k}
    Q${cx - hw} ${cy} ${cx - hw + k} ${cy - k}
    Z`
  const selectionEl = <rect x={cx - hw + 2 - ringW / 2} y={cy - hw + 2 - ringW / 2} width={(hw - 2 + ringW / 2) * 2} height={(hw - 2 + ringW / 2) * 2} rx={0} fill="none" stroke="var(--sapHighlightColor)" strokeWidth={ringW} />
  const hoverEl = <rect x={cx - hw + 2 - ringW / 2} y={cy - hw + 2 - ringW / 2} width={(hw - 2 + ringW / 2) * 2} height={(hw - 2 + ringW / 2) * 2} rx={0} fill="none" stroke="var(--sapHighlightColor)" strokeWidth={ringW} style={{ pointerEvents: 'none' as const }} />
  // Figma icons are in 41x41 viewBox (center 20.5,20.5), scale to hw
  const s = hw / 20.5

  const icon = () => {
    const sub = el.subtype ?? 'Exclusive'
    if (sub === 'Exclusive' || sub === 'xor-gateway') return (
      // X
      <g transform={`translate(${cx}, ${cy}) scale(${s}) translate(-20.5, -20.5)`}>
        <path d="M14.1367 14.136L26.8646 26.8639" stroke={tc} strokeWidth={2.5} strokeLinecap="round" />
        <path d="M26.8633 14.136L14.1354 26.8639" stroke={tc} strokeWidth={2.5} strokeLinecap="round" />
      </g>
    )
    if (sub === 'Parallel') return (
      // +
      <g transform={`translate(${cx}, ${cy}) scale(${s}) translate(-20.5, -20.5)`}>
        <path d="M11.25 20.5H30.25M20.5 11.25V30.25" stroke={tc} strokeWidth={2.5} strokeLinecap="round" />
      </g>
    )
    if (sub === 'Inclusive') return (
      // O
      <g transform={`translate(${cx}, ${cy}) scale(${s}) translate(-20.5, -20.5)`}>
        <path d="M20.5 30.25C25.8848 30.25 30.25 25.8848 30.25 20.5C30.25 15.1152 25.8848 10.75 20.5 10.75C15.1152 10.75 10.75 15.1152 10.75 20.5C10.75 25.8848 15.1152 30.25 20.5 30.25Z" fill="none" stroke={tc} strokeWidth={2.5} strokeLinecap="round" />
      </g>
    )
    if (sub === 'EventBased') return (
      // * (star)
      <g transform={`translate(${cx}, ${cy}) scale(${s}) translate(-20.5, -20.5)`}>
        <path d="M10.75 20.5H30.25M20.5 10.75V30.25M13.35 13.35L27.65 27.65M13.35 27.65L27.65 13.35" stroke={tc} strokeWidth={2.5} strokeLinecap="round" />
      </g>
    )
    if (sub === 'Complex') return (
      // pentagon with double circle
      <g transform={`translate(${cx}, ${cy}) scale(${s}) translate(-20.5, -20.5)`}>
        <path d="M20.5 31.5C26.5751 31.5 31.5 26.5751 31.5 20.5C31.5 14.4249 26.5751 9.5 20.5 9.5C14.4249 9.5 9.5 14.4249 9.5 20.5C9.5 26.5751 14.4249 31.5 20.5 31.5Z" fill="none" stroke={tc} strokeLinecap="round" />
        <path d="M24.8268 26.845L15.7586 26.8442L12.957 18.2195L20.2939 12.89L27.6298 18.2208L24.8268 26.845Z" fill="none" stroke={tc} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="bevel" />
      </g>
    )
    // default: plain diamond
    return null
  }

  return (
    <g>
      <path d={diamond} fill="white" stroke={tc} strokeWidth={1} />
      {icon()}
      {hovered && !selected && hoverEl}
      {(hovered || selected) && selectionEl}
    </g>
  )
}

function EventShape({ el, selected, hovered, ringW, aiPreview }: { el: CanvasElement; selected: boolean; hovered: boolean; ringW: number; aiPreview?: boolean }) {
  const isStart = el.subtype?.includes('Start')
  const isSuccess = el.id === 'el-end4'
  const r = el.hw
  const { cx, cy } = el

  if (isStart) {
    const subtype = el.subtype ?? 'Start'
    const s = r / 16
    const bg = aiPreview ? '#e8f3ff' : 'var(--sapAvatar_8_Background)'
    const ic = aiPreview ? 'var(--sapHighlightColor)' : 'var(--sapAccentColor8)'
    const selectionEl = <rect x={cx - r - 1.5} y={cy - r - 1.5} width={(r + 1.5) * 2} height={(r + 1.5) * 2} rx={0} fill="none" stroke="var(--sapHighlightColor)" strokeWidth={ringW} />

    const outerCircle = (dashed = false) => dashed
      ? <circle cx={cx} cy={cy} r={11.5 * s} fill="none" stroke={ic} strokeWidth={1} strokeDasharray={`${5 * s} ${3 * s}`} />
      : <circle cx={cx} cy={cy} r={11.5 * s} fill="none" stroke={ic} strokeWidth={1} />

    if (subtype === 'MessageStart') {
      return (
        <g>
          <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} rx={r} fill={bg} />
          <rect x={cx - 5.25 * s} y={cy - 3.75 * s} width={10.5 * s} height={7.5 * s} fill="none" stroke={ic} strokeWidth={1.4 * s} strokeLinejoin="round" />
          <path d={`M${cx - 4.75 * s} ${cy - 1.625 * s} L${cx} ${cy + 0.226 * s} L${cx + 4.75 * s} ${cy - 1.625 * s}`} fill="none" stroke={ic} strokeWidth={1.4 * s} />
          {outerCircle(false)}
          {(hovered || selected) && selectionEl}
        </g>
      )
    }

    if (subtype === 'TimerStart') {
      return (
        <g>
          <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} rx={r} fill={bg} />
          <path d={`M${cx + 4 * s} ${cy + s} L${cx} ${cy + s} L${cx} ${cy - 5 * s}`} fill="none" stroke={ic} strokeWidth={1.4 * s} strokeLinecap="round" strokeLinejoin="round" />
          {outerCircle()}
          {(hovered || selected) && selectionEl}
        </g>
      )
    }

    if (subtype === 'EscalationStart') {
      return (
        <g>
          <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} rx={r} fill={bg} />
          <g transform={`translate(${cx - 16 * s}, ${cy - 16 * s}) scale(${s})`}>
            <path d="M15.0586 11.5068C15.4773 10.8007 16.5227 10.8007 16.9414 11.5068L17.0215 11.6689L20.0938 19.3496C20.512 20.3954 19.2747 21.319 18.3906 20.6211L16.5576 19.1738C16.2307 18.9159 15.7693 18.9159 15.4424 19.1738L13.6094 20.6211C12.7253 21.319 11.488 20.3954 11.9062 19.3496L14.9785 11.6689L15.0586 11.5068Z" fill="none" stroke={ic} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          {outerCircle()}
          {(hovered || selected) && selectionEl}
        </g>
      )
    }

    if (subtype === 'ConditionalStart') {
      return (
        <g>
          <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} rx={r} fill={bg} />
          <rect x={cx - 5.7 * s} y={cy - 6.7 * s} width={11.4 * s} height={13.4 * s} rx={1.4 * s} fill="none" stroke={ic} strokeWidth={1.4 * s} />
          <line x1={cx - 3 * s} y1={cy - 4 * s} x2={cx + 3 * s} y2={cy - 4 * s} stroke={ic} strokeWidth={1.4 * s} strokeLinecap="round" />
          <line x1={cx - 3 * s} y1={cy} x2={cx + 3 * s} y2={cy} stroke={ic} strokeWidth={1.4 * s} strokeLinecap="round" />
          <line x1={cx - 3 * s} y1={cy + 4 * s} x2={cx + 3 * s} y2={cy + 4 * s} stroke={ic} strokeWidth={1.4 * s} strokeLinecap="round" />
          {outerCircle()}
          {(hovered || selected) && selectionEl}
        </g>
      )
    }

    if (subtype === 'ErrorStart') {
      return (
        <g>
          <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} rx={r} fill={bg} />
          <path d={`M${cx + 2.9355 * s} ${cy - 6.3913 * s} C${cx + 3.5011 * s} ${cy - 7.3108 * s} ${cx + 4.9836 * s} ${cy - 6.7658 * s} ${cx + 4.7591 * s} ${cy - 5.6552 * s} L${cx + 2.9097 * s} ${cy + 3.497 * s} C${cx + 2.737 * s} ${cy + 4.3509 * s} ${cx + 1.6304 * s} ${cy + 4.5912 * s} ${cx + 1.1192 * s} ${cy + 3.8858 * s} L${cx - 0.5457 * s} ${cy + 1.5871 * s} L${cx - 2.8832 * s} ${cy + 6.2976 * s} C${cx - 3.4032 * s} ${cy + 7.3452 * s} ${cx - 4.9907 * s} ${cy + 6.8017 * s} ${cx - 4.759 * s} ${cy + 5.6553 * s} L${cx - 2.9086 * s} ${cy - 3.4973 * s} C${cx - 2.7467 * s} ${cy - 4.2981 * s} ${cx - 1.7635 * s} ${cy - 4.5592 * s} ${cx - 1.2203 * s} ${cy - 4.0068 * s} L${cx - 1.1181 * s} ${cy - 3.8861 * s} L${cx + 0.5455 * s} ${cy - 1.588 * s} Z`}
            fill="none" stroke={ic} strokeWidth={1.4 * s} strokeLinecap="round" strokeLinejoin="round" />
          {outerCircle()}
          {(hovered || selected) && selectionEl}
        </g>
      )
    }

    if (subtype === 'CompensationStart') {
      return (
        <g>
          <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} rx={r} fill={bg} />
          <g transform={`translate(${cx - 16 * s}, ${cy - 16 * s}) scale(${s})`}>
            <path d="M13.9629 12.6709C14.4353 12.199 15.2428 12.5334 15.2432 13.2011V18.788C15.2429 19.456 14.4353 19.7897 13.9629 19.3173L11.1699 16.5244C10.8772 16.2315 10.8771 15.7567 11.1699 15.4638L13.9629 12.6709Z" fill="none" stroke={ic} strokeWidth="1.4" strokeLinejoin="round" />
            <path d="M19.7178 12.6718C20.1902 12.1994 20.998 12.5339 20.998 13.2021V18.788C20.9979 19.4561 20.1902 19.7898 19.7178 19.3173L16.9248 16.5254C16.6319 16.2325 16.6319 15.7567 16.9248 15.4638L19.7178 12.6718Z" fill="none" stroke={ic} strokeWidth="1.4" strokeLinejoin="round" />
          </g>
          {outerCircle()}
          {(hovered || selected) && selectionEl}
        </g>
      )
    }

    if (subtype === 'SignalStart') {
      return (
        <g>
          <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} rx={r} fill={bg} />
          <path d={`M${cx - 4.1 * s} ${cy + 3 * s} L${cx} ${cy - 4.32 * s} L${cx + 4.1 * s} ${cy + 3 * s} Z`} fill="none" stroke={ic} strokeWidth={1.4 * s} strokeLinecap="round" strokeLinejoin="round" />
          {outerCircle()}
          {(hovered || selected) && selectionEl}
        </g>
      )
    }

    if (subtype === 'MultipleStart') {
      return (
        <g>
          <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} rx={r} fill={bg} />
          <path d={`M${cx} ${cy - 6 * s} L${cx + 5.7063 * s} ${cy - 1.8541 * s} L${cx + 3.5267 * s} ${cy + 4.8541 * s} L${cx - 3.5267 * s} ${cy + 4.8541 * s} L${cx - 5.7063 * s} ${cy - 1.8541 * s} Z`}
            fill="none" stroke={ic} strokeWidth={1.4 * s} strokeLinecap="round" strokeLinejoin="round" />
          {outerCircle()}
          {(hovered || selected) && selectionEl}
        </g>
      )
    }

    if (subtype === 'ParallelMultipleStart') {
      return (
        <g>
          <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} rx={r} fill={bg} />
          <g transform={`translate(${cx - 16 * s}, ${cy - 16 * s}) scale(${s})`}>
            <path d="M16.541 10.2998C17.2038 10.2998 17.7412 10.8373 17.7412 11.5V14.2588H20.5C21.1626 14.2588 21.7 14.7954 21.7002 15.458V16.542C21.7 17.2046 21.1626 17.7412 20.5 17.7412H17.7412V20.5C17.7412 21.1627 17.2038 21.7002 16.541 21.7002H15.458C14.7953 21.7001 14.2578 21.1627 14.2578 20.5V17.7412H11.5C10.8374 17.7412 10.3 17.2046 10.2998 16.542V15.458C10.3 14.7954 10.8374 14.2588 11.5 14.2588H14.2578V11.5C14.2578 10.8373 14.7953 10.2999 15.458 10.2998H16.541Z" fill="none" stroke={ic} strokeWidth="1.4" strokeLinejoin="round" />
          </g>
          {outerCircle()}
          {(hovered || selected) && selectionEl}
        </g>
      )
    }

    // Plain Start Event (default)
    return (
      <g>
        <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} rx={r} fill={bg} />
        {outerCircle()}
        {(hovered || selected) && selectionEl}
      </g>
    )
  }

  // Catching Intermediate Events — white bg, double circle, black icon
  const catchingSubtypes = ['CatchingMessage','CatchingTimer','CatchingEscalation','CatchingConditional','CatchingLink','CatchingError','CatchingCancel','CatchingCompensation','CatchingSignal','CatchingMultiple','CatchingParallelMultiple']
  if (catchingSubtypes.includes(el.subtype ?? '')) {
    const sub = el.subtype!
    const s = r / 16
    const ic = 'var(--sapTextColor)'
    const selectionEl = <rect x={cx - r - 1.5} y={cy - r - 1.5} width={(r + 1.5) * 2} height={(r + 1.5) * 2} rx={0} fill="none" stroke="var(--sapHighlightColor)" strokeWidth={ringW} />
    const innerR = 11.5 * s
    const outerR = 14 * s

    const iconPath = () => {
      if (sub === 'CatchingMessage') return (
        <>
          <path d="M11 13.25C11 12.5596 11.5596 12 12.25 12H20.25C20.9404 12 21.5 12.5596 21.5 13.25V18.75C21.5 19.4404 20.9404 20 20.25 20H12.25C11.5596 20 11 19.4404 11 18.75V13.25Z" fill="none" stroke={ic} strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M11.2495 14.375L15.8781 16.2264C16.1165 16.3218 16.3825 16.3218 16.6209 16.2264L21.2495 14.375" fill="none" stroke={ic} strokeWidth="1.4" />
        </>
      )
      if (sub === 'CatchingTimer') return <path d="M20 17H16V11" fill="none" stroke={ic} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      if (sub === 'CatchingEscalation') return <path d="M15.0586 11.5068C15.4773 10.8007 16.5227 10.8007 16.9414 11.5068L17.0215 11.6689L20.0938 19.3496C20.512 20.3954 19.2747 21.319 18.3906 20.6211L16.5576 19.1738C16.2307 18.9159 15.7693 18.9159 15.4424 19.1738L13.6094 20.6211C12.7253 21.319 11.488 20.3954 11.9062 19.3496L14.9785 11.6689L15.0586 11.5068Z" fill="none" stroke={ic} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      if (sub === 'CatchingConditional') return (
        <>
          <path d="M20 9.2998C20.9389 9.2998 21.7002 10.0611 21.7002 11V21C21.7002 21.9389 20.9389 22.7002 20 22.7002H12C11.0611 22.7002 10.2998 21.9389 10.2998 21V11C10.2998 10.0611 11.0611 9.2998 12 9.2998H20Z" fill="none" stroke={ic} strokeWidth="1.4" />
          <path d="M13 12H19" stroke={ic} strokeWidth="1.4" strokeLinecap="round" />
          <path d="M13 16H19" stroke={ic} strokeWidth="1.4" strokeLinecap="round" />
          <path d="M13 20H19" stroke={ic} strokeWidth="1.4" strokeLinecap="round" />
        </>
      )
      if (sub === 'CatchingLink') return <path d="M18.5116 11.1663L22.6019 15.5713C22.8264 15.813 22.8264 16.187 22.6019 16.4287L18.5116 20.8337C18.125 21.25 17.4286 20.9765 17.4286 20.4084V18H11C10.4477 18 10 17.5523 10 17V15C10 14.4477 10.4477 14 11 14H17.4286V11.5916C17.4286 11.0235 18.125 10.75 18.5116 11.1663Z" fill="none" stroke={ic} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      if (sub === 'CatchingError') return <path d="M18.9355 9.60864C19.5011 8.68917 20.9836 9.23416 20.7591 10.3447L18.9097 19.497C18.737 20.3509 17.6304 20.5912 17.1192 19.8857L15.4543 17.5871L13.1168 22.2976C12.5968 23.3452 11.0093 22.8017 11.241 21.6553L13.0914 12.5027C13.2533 11.7019 14.2365 11.4407 14.7797 11.9931L14.8819 12.1139L16.5455 14.412L18.8834 9.70243Z" fill="none" stroke={ic} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      if (sub === 'CatchingCancel') return <path d="M12.3517 11.5868C12.8203 11.1182 13.5804 11.1182 14.049 11.5868L15.9998 13.5376L17.9505 11.5868C18.4191 11.1182 19.1785 11.1177 19.6472 11.5861L20.4137 12.3526C20.8821 12.8212 20.8815 13.5807 20.413 14.0492L18.4622 16L20.413 17.9508C20.8816 18.4194 20.8816 19.1795 20.413 19.6481L19.6472 20.4139C19.1785 20.8824 18.4184 20.8825 17.9498 20.4139L15.9991 18.4631L14.049 20.4132C13.5805 20.8818 12.821 20.8823 12.3524 20.4139L11.5859 19.6474C11.1175 19.1788 11.118 18.4193 11.5866 17.9508L13.5366 16.0007L11.5859 14.0499C11.1173 13.5813 11.1173 12.8212 11.5859 12.3526Z" fill="none" stroke={ic} strokeWidth="1.4" strokeLinejoin="round" />
      if (sub === 'CatchingCompensation') return (
        <>
          <path d="M13.8125 12.221C14.285 11.7486 15.0928 12.0831 15.0928 12.7513V18.3372C15.0927 19.0054 14.285 19.339 13.8125 18.8665L11.0205 16.0745C10.7276 15.7817 10.7277 15.3069 11.0205 15.014L13.8125 12.221Z" fill="none" stroke={ic} strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M19.5684 12.221C20.0408 11.7486 20.8486 12.0831 20.8486 12.7513V18.3372C20.8486 19.0054 20.0408 19.339 19.5684 18.8665L16.7754 16.0745C16.4827 15.7818 16.4829 15.3069 16.7754 15.014L19.5684 12.221Z" fill="none" stroke={ic} strokeWidth="1.4" strokeLinejoin="round" />
        </>
      )
      if (sub === 'CatchingSignal') return <path d="M15.576 11.6784C15.7718 11.3651 16.2282 11.3651 16.424 11.6784L20.5219 18.235C20.73 18.568 20.4906 19 20.0979 19H11.9021C11.5094 19 11.27 18.568 11.4781 18.235L15.576 11.6784Z" fill="none" stroke={ic} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      if (sub === 'CatchingMultiple') return <path d="M16 10L21.7063 14.1459L19.5267 20.8541H12.4733L10.2937 14.1459L16 10Z" fill="none" stroke={ic} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      if (sub === 'CatchingParallelMultiple') return <path d="M16.541 10.2998C17.2038 10.2998 17.7412 10.8373 17.7412 11.5V14.2588H20.5C21.1626 14.2588 21.7 14.7954 21.7002 15.458V16.542C21.7 17.2046 21.1626 17.7412 20.5 17.7412H17.7412V20.5C17.7412 21.1627 17.2038 21.7002 16.541 21.7002H15.458C14.7953 21.7001 14.2578 21.1627 14.2578 20.5V17.7412H11.5C10.8374 17.7412 10.3 17.2046 10.2998 16.542V15.458C10.3 14.7954 10.8374 14.2588 11.5 14.2588H14.2578V11.5C14.2578 10.8373 14.7953 10.2999 15.458 10.2998H16.541Z" fill="none" stroke={ic} strokeWidth="1.4" strokeLinejoin="round" />
      return null
    }

    return (
      <g>
        <circle cx={cx} cy={cy} r={r} fill="white" />
        <circle cx={cx} cy={cy} r={outerR} fill="none" stroke={ic} strokeWidth={1} />
        <circle cx={cx} cy={cy} r={innerR} fill="none" stroke={ic} strokeWidth={1} />
        <g transform={`translate(${cx - 16 * s}, ${cy - 16 * s}) scale(${s})`}>
          {iconPath()}
        </g>
        {(hovered || selected) && selectionEl}
      </g>
    )
  }

  // Throwing Intermediate Events — white bg, double circle, filled black icon
  const throwingSubtypes = ['ThrowingIntermediate','ThrowingMessage','ThrowingEscalation','ThrowingLink','ThrowingCompensation','ThrowingSignal','ThrowingMultiple']
  if (throwingSubtypes.includes(el.subtype ?? '')) {
    const sub = el.subtype!
    const s = r / 16
    const ic = 'var(--sapTextColor)'
    const selectionEl = <rect x={cx - r - 1.5} y={cy - r - 1.5} width={(r + 1.5) * 2} height={(r + 1.5) * 2} rx={0} fill="none" stroke="var(--sapHighlightColor)" strokeWidth={ringW} />
    const innerR = 11.5 * s
    const outerR = 14 * s

    const iconPath = () => {
      if (sub === 'ThrowingMessage') return (
        <>
          <path d="M10 12.8V12.2C10 11.6477 10.4477 11.2 11 11.2H20.9997C21.552 11.2 21.9997 11.6477 21.9997 12.2V12.8L16.4705 15.749C16.1763 15.9059 15.8234 15.9059 15.5293 15.749L10 12.8Z" fill={ic} />
          <path d="M10 15.0888V19.8C10 20.3522 10.4477 20.8 11 20.8H20.9999C21.5523 20.8 22 20.3522 21.9999 19.7999L21.9997 15.1999L16.4786 18.1446C16.18 18.3039 15.8211 18.3013 15.5248 18.1378L10 15.0888Z" fill={ic} />
        </>
      )
      if (sub === 'ThrowingEscalation') return <path d="M11.544 20.5857L15.6267 9.97068C15.7582 9.6288 16.2418 9.6288 16.3733 9.97068L20.456 20.5857C20.6035 20.9691 20.1464 21.2991 19.8289 21.0384L17.0153 18.7284C16.4252 18.2438 15.5748 18.2438 14.9847 18.7284L12.1711 21.0384C11.8536 21.2991 11.3965 20.9691 11.544 20.5857Z" fill={ic} />
      if (sub === 'ThrowingLink') return <path d="M18.3655 12.1452L21.6766 15.657C21.8582 15.8496 21.8582 16.1504 21.6766 16.343L18.3655 19.8548C17.9774 20.2664 17.2857 19.9918 17.2857 19.4261V17.6667H12C11.4477 17.6667 11 17.219 11 16.6667V15.3333C11 14.781 11.4477 14.3333 12 14.3333H17.2857V12.5739C17.2857 12.0082 17.9774 11.7336 18.3655 12.1452Z" fill={ic} />
      if (sub === 'ThrowingCompensation') return (
        <>
          <path d="M14.3716 12.2205C14.844 11.7487 15.6515 12.0831 15.6519 12.7507V19.2556C15.6516 19.9234 14.844 20.2577 14.3716 19.7859L11.1196 16.5339C10.8267 16.241 10.8267 15.7653 11.1196 15.4724L14.3716 12.2205Z" fill={ic} />
          <path d="M19.7007 12.2214C20.1732 11.749 20.981 12.0835 20.981 12.7517V19.2556C20.9808 19.9235 20.1732 20.2577 19.7007 19.7859L16.4487 16.5339C16.1558 16.241 16.1558 15.7663 16.4487 15.4734L19.7007 12.2214Z" fill={ic} />
        </>
      )
      if (sub === 'ThrowingSignal') return <path d="M15.576 11.6784C15.7718 11.3651 16.2282 11.3651 16.424 11.6784L20.5219 18.235C20.73 18.568 20.4906 19 20.0979 19H11.9021C11.5094 19 11.27 18.568 11.4781 18.235L15.576 11.6784Z" fill={ic} />
      if (sub === 'ThrowingMultiple') return <path d="M16 10L21.7063 14.1459L19.5267 20.8541H12.4733L10.2937 14.1459L16 10Z" fill={ic} />
      return null // ThrowingIntermediate — plain double circle, no icon
    }

    return (
      <g>
        <circle cx={cx} cy={cy} r={r} fill="white" />
        <circle cx={cx} cy={cy} r={outerR} fill="none" stroke={ic} strokeWidth={1} />
        <circle cx={cx} cy={cy} r={innerR} fill="none" stroke={ic} strokeWidth={1} />
        <g transform={`translate(${cx - 16 * s}, ${cy - 16 * s}) scale(${s})`}>
          {iconPath()}
        </g>
        {(hovered || selected) && selectionEl}
      </g>
    )
  }

  // End events
  // End events — sapAccentColor3b bg, sapAccentColor2 icon, thick outer circle
  const sub = el.subtype ?? 'End'
  const s = r / 16
  const bg = aiPreview ? '#e8f3ff' : 'var(--sapAccentBackgroundColor3)'
  const ic = aiPreview ? 'var(--sapHighlightColor)' : 'var(--sapAccentColor2)'
  const selectionEl = <rect x={cx - r - 1.5} y={cy - r - 1.5} width={(r + 1.5) * 2} height={(r + 1.5) * 2} rx={0} fill="none" stroke="var(--sapHighlightColor)" strokeWidth={ringW} />

  const endIcon = () => {
    if (sub === 'EndMessage') return (
      <>
        <path d="M10 12.8V12.2C10 11.6477 10.4477 11.2 11 11.2H20.9997C21.552 11.2 21.9997 11.6477 21.9997 12.2V12.8L16.4705 15.7491C16.1763 15.9059 15.8234 15.9059 15.5293 15.7491L10 12.8Z" fill={ic} />
        <path d="M10 15.0888V19.8C10 20.3523 10.4477 20.8 11 20.8H20.9999C21.5523 20.8 22 20.3523 21.9999 19.8L21.9997 15.1999L16.4786 18.1446C16.18 18.3039 15.8211 18.3013 15.5248 18.1378L10 15.0888Z" fill={ic} />
      </>
    )
    if (sub === 'EndEscalation') return <path d="M11.544 20.5857L15.6267 9.97068C15.7582 9.6288 16.2418 9.6288 16.3733 9.97068L20.456 20.5857C20.6035 20.9691 20.1464 21.2991 19.8289 21.0384L17.0153 18.7284C16.4252 18.2438 15.5748 18.2438 14.9847 18.7284L12.1711 21.0384C11.8536 21.2991 11.3965 20.9691 11.544 20.5857Z" fill={ic} />
    if (sub === 'EndError') return <path d="M11.3108 23.0614L13.4465 11.9797C13.4963 11.7211 13.8316 11.6477 13.985 11.8618L16.4583 15.3155C16.5908 15.5006 16.8732 15.4763 16.9723 15.2714L20.1248 8.75138C20.2776 8.43529 20.7559 8.59396 20.6895 8.93872L18.5548 20.0197C18.5049 20.2784 18.1697 20.3518 18.0163 20.1376L15.543 16.684C15.4104 16.4989 15.1281 16.5231 15.029 16.7281L11.8754 23.2488C11.7226 23.5648 11.2444 23.4061 11.3108 23.0614Z" fill={ic} />
    if (sub === 'EndCancel') return (
      <>
        <path d="M20 12L12 20" stroke={ic} strokeWidth={2.5} strokeLinecap="round" />
        <path d="M20 20L12 12" stroke={ic} strokeWidth={2.5} strokeLinecap="round" />
      </>
    )
    if (sub === 'EndCompensation') return (
      <>
        <path d="M14.3716 12.2205C14.844 11.7487 15.6515 12.0831 15.6519 12.7507V19.2556C15.6516 19.9234 14.844 20.2577 14.3716 19.7859L11.1196 16.5339C10.8267 16.241 10.8267 15.7653 11.1196 15.4724L14.3716 12.2205Z" fill={ic} />
        <path d="M19.7007 12.2214C20.1732 11.749 20.981 12.0835 20.981 12.7517V19.2556C20.9808 19.9235 20.1732 20.2577 19.7007 19.7859L16.4487 16.5339C16.1558 16.241 16.1558 15.7663 16.4487 15.4734L19.7007 12.2214Z" fill={ic} />
      </>
    )
    if (sub === 'EndSignal') return <path d="M15.576 11.6784C15.7718 11.3651 16.2282 11.3651 16.424 11.6784L20.5219 18.235C20.73 18.568 20.4906 19 20.0979 19H11.9021C11.5094 19 11.27 18.568 11.4781 18.235L15.576 11.6784Z" fill={ic} />
    if (sub === 'EndMultiple') return <path d="M16 10L21.7063 14.1459L19.5267 20.8541H12.4733L10.2937 14.1459L16 10Z" fill={ic} />
    if (sub === 'TerminateEnd') return <circle cx={cx} cy={cy} r={8 * s} fill={ic} />
    return null // plain End Event
  }

  return (
    <g>
      <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} rx={r} fill={bg} />
      <circle cx={cx} cy={cy} r={12 * s} fill="none" stroke={ic} strokeWidth={2 * s} />
      <g transform={`translate(${cx - 16 * s}, ${cy - 16 * s}) scale(${s})`}>
        {endIcon()}
      </g>
      {(hovered || selected) && selectionEl}
    </g>
  )
}

function SystemShape({ el, selected, hovered, ringW, editing }: { el: CanvasElement; selected: boolean; hovered: boolean; ringW: number; editing?: boolean }) {
  const x = el.cx - el.hw, y = el.cy - el.hh
  const w = el.hw * 2, h = el.hh * 2
  return (
    <g>
      {hovered && !selected && <rect x={x - ringW / 2 - 0.5} y={y - ringW / 2 - 0.5} width={w + ringW + 1} height={h + ringW + 1} rx={0} fill="none" stroke="var(--sapHighlightColor)" strokeWidth={ringW} style={{ pointerEvents: 'none' }} />}
      <rect x={x} y={y} width={w} height={h} rx={8} fill="#d1efff" stroke={selected ? 'var(--sapHighlightColor)' : 'none'} strokeWidth={selected ? 2 : 0} />
      {!editing && (() => {
        const words = el.name.split(' ')
        const mid = Math.ceil(words.length / 2)
        const line1 = words.slice(0, mid).join(' ')
        const line2 = words.length > 2 ? words.slice(mid).join(' ') : null
        const pillW = Math.max(line1.length, line2?.length ?? 0) * 6.2 + 16
        const pillH = line2 ? 32 : 20
        const pillY = el.cy + el.hh + 18
        return (
          <g>
            <rect x={el.cx - pillW / 2} y={pillY} width={pillW} height={pillH} rx={8} fill="#f5f6f7" />
            {line2 ? <>
              <text x={el.cx} y={pillY + 12} fontSize={11} fill="var(--sapTextColor)" textAnchor="middle" fontFamily="'72',Arial,sans-serif">{line1}</text>
              <text x={el.cx} y={pillY + 25} fontSize={11} fill="var(--sapTextColor)" textAnchor="middle" fontFamily="'72',Arial,sans-serif">{line2}</text>
            </> : <text x={el.cx} y={pillY + 14} fontSize={11} fill="var(--sapTextColor)" textAnchor="middle" fontFamily="'72',Arial,sans-serif">{el.name}</text>}
          </g>
        )
      })()}
      {selected && <rect x={x - ringW / 2 - 0.5} y={y - ringW / 2 - 0.5} width={w + ringW + 1} height={h + ringW + 1} rx={0} fill="none" stroke="var(--sapHighlightColor)" strokeWidth={ringW} />}
    </g>
  )
}

// Data Object / Data Store / IT System shapes — circular bg with icon inside
function DataObjectShape({ el, selected, hovered, ringW, aiPreview }: { el: CanvasElement; selected: boolean; hovered: boolean; ringW: number; aiPreview?: boolean }) {
  const { cx, cy } = el
  const r = el.hw
  const bg = aiPreview ? '#e8f3ff' : 'var(--sapAvatar_6_Background)'
  const ic = aiPreview ? 'var(--sapHighlightColor)' : 'var(--sapAvatar_6_TextColor)'
  const selectionEl = <rect x={cx - r - 1.5} y={cy - r - 1.5} width={(r + 1.5) * 2} height={(r + 1.5) * 2} rx={0} fill="none" stroke="var(--sapHighlightColor)" strokeWidth={ringW} />

  if (el.subtype === 'DataStore') {
    // hw=30.5 (61px circle), icon 32x36 → Figma 29x34 → scale=1.06
    const scale = 1.06
    return (
      <g>
        <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} rx={r} fill={bg} />
        <g transform={`translate(${cx}, ${cy}) scale(${scale}) translate(-28.7, -28)`}>
          <path d="M28.7611 11C38.2914 11 43.5536 15.888 43.5536 17.5808C43.5536 19.2729 43.5254 36.6501 43.5254 38.6392C43.5254 40.6284 38.4714 45.22 28.7611 45.22C19.0507 45.22 14 40.6897 14 38.5773C14 36.4656 14 19.048 14 17.5808C14 16.1135 19.2312 11 28.7611 11Z" fill="none" stroke={ic} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          <path d="M43.5497 26.5545C43.5497 28.1079 41.8018 33.5539 28.6361 33.5539C15.4709 33.5539 14.0244 28.0132 14.0244 26.6304M14.1369 17.1238C14.1369 17.7394 19.4845 22.6658 28.7727 22.6658C39.6561 22.6658 43.4957 17.7147 43.4683 17.1239" fill="none" stroke={ic} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </g>
        {(hovered || selected) && selectionEl}
      </g>
    )
  }

  if (el.subtype === 'ITSystem') {
    // hw=28.5, Figma center x≈28.5, y≈28.8
    const scale = (r * 1.1) / 18
    return (
      <g>
        <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} rx={r} fill={bg} />
        <g transform={`translate(${cx}, ${cy}) scale(${scale}) translate(-28.5, -28.8)`}>
          <path d="M42.3896 11.2412C44.8748 11.2414 46.8896 13.256 46.8896 15.7412V35.4912C46.8895 37.9763 44.8747 39.991 42.3896 39.9912H33.4521V43.96H38.8486C39.539 43.96 40.0986 44.5196 40.0986 45.21C40.0985 45.9002 39.5389 46.46 38.8486 46.46H19.0566C18.3665 46.4598 17.8068 45.9001 17.8066 45.21C17.8066 44.5197 18.3664 43.9601 19.0566 43.96H24.4521V39.9912H14.7227C12.2375 39.9912 10.2228 37.9764 10.2227 35.4912V15.7412C10.2227 13.2559 12.2374 11.2412 14.7227 11.2412H42.3896ZM26.9521 43.8242H30.9521V40.8242H26.9521V43.8242ZM14.5186 13.752C13.5099 13.8542 12.7227 14.7056 12.7227 15.7412V35.4912C12.7228 36.5268 13.51 37.3782 14.5186 37.4805L14.7227 37.4912H42.3896L42.5938 37.4805C43.5351 37.3849 44.2834 36.6367 44.3789 35.6953L44.3896 35.4912V15.7412C44.3896 14.7057 43.6023 13.8544 42.5938 13.752L42.3896 13.7412H14.7227L14.5186 13.752Z" fill={ic} />
        </g>
        {(hovered || selected) && selectionEl}
      </g>
    )
  }

  // Data Object — hw=40 (80px circle), icon 38x50px → scale=1.0
  const scale = 1.0

  if (el.subtype === 'Message') {
    const tc = 'var(--sapTextColor)'
    return (
      <g>
        <g transform={`translate(${cx - 14.41}, ${cy - 11.25})`}>
          <rect x={1.25} y={1.25} width={26.32} height={20.5} rx={3} fill="white" stroke={tc} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          <path d="M1.25005 7.17918L13.9957 11.9798C14.4575 12.1538 14.9674 12.1508 15.4272 11.9715L27.25 7.36111" fill="none" stroke={tc} strokeWidth={2.5} />
        </g>
        {(hovered || selected) && selectionEl}
      </g>
    )
  }

  return (
    <g>
      <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} rx={r} fill={bg} />
      <g transform={`translate(${cx}, ${cy}) scale(${scale}) translate(-44, -39)`}>
        <path d="M56.2951 63.9998H27.5717C26.1514 63.9998 25 62.8484 25 61.4281V16.5717C25 15.1514 26.1514 14 27.5717 14L48.3853 14" fill="none" stroke={ic} strokeWidth={2.14} />
        <path d="M55.6895 64.0001H60.4257C61.846 64.0001 62.9974 62.8487 62.9974 61.4284V28.3178C62.9974 28.0811 62.8055 27.8892 62.5688 27.8892H56.7334" fill="none" stroke={ic} strokeWidth={2.14} />
        <path d="M63.0006 27.8888L48.3848 14V25.3171C48.3848 26.7374 49.5362 27.8888 50.9565 27.8888H63.0006Z" fill="none" stroke={ic} strokeWidth={2.14} strokeLinejoin="round" />
      </g>
      {(hovered || selected) && selectionEl}
    </g>
  )
}

function LiShapeComp({ shape, editing = false }: { shape: LiShape; editing?: boolean }) {
  const { cx, cy, shapeType } = shape
  const color = '#0064d9'

  // Indicator
  if (shapeType === 'Indicator') {
    const sx = cx - 16, sy = cy - 16
    const status = shape.manualValue ?? 'No data'
    const BG: Record<string, string> = {
      'No data': '#CCCCCC',
      'Green':   '#B8CC00',
      'Yellow':  '#E9730C',
      'Red':     '#C12028',
    }
    const bg = BG[status] ?? '#CCCCCC'
    return <g>
      <svg x={sx} y={sy} width={32} height={32} viewBox="0 0 34 34" fill="none">
        <rect fill="#FFF" stroke="#555555" strokeWidth={2} x={1} y={1} width={32} height={32} rx={6}/>
        <rect fill={bg} x={7} y={7} width={20} height={20} rx={2}/>
        {status === 'Green' && (
          <path d="M11 17L15 21L23 13" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        )}
        {status === 'Yellow' && (
          <text x={17} y={22} fontSize={14} fontWeight="bold" fill="white" textAnchor="middle" fontFamily="'72',Arial,sans-serif">!</text>
        )}
        {status === 'Red' && (
          <path d="M13 13L21 21M21 13L13 21" stroke="white" strokeWidth={2.5} strokeLinecap="round"/>
        )}
      </svg>
      {!editing && <>
  <rect x={cx - 40} y={sy + 46 - 10} width={80} height={20} rx={8} fill="var(--sapPageSection_Background, #f5f6f7)" style={{ pointerEvents: 'none' }} />
  <text x={cx} y={sy + 50} fontSize={11} fill="var(--sapTextColor)" textAnchor="middle" fontFamily="'72',Arial,sans-serif">{shape.label ?? shape.widgetName ?? ''}</text>
</>}
    </g>
  }

  // Traffic Light
  if (shapeType === 'Traffic Light') {
    const sx = cx - 14, sy = cy - 34
    const status = shape.manualValue ?? 'No data'
    const GRAY = '#CCCCCC'
    const FILLS: Record<string, [string, string, string]> = {
      'No data': [GRAY,       GRAY,       GRAY      ],
      'Green':   [GRAY,       GRAY,       '#B8CC00' ],
      'Yellow':  [GRAY,       '#E9730C',  GRAY      ],
      'Red':     ['#C12028',  GRAY,       GRAY      ],
    }
    const [top, mid, bot] = FILLS[status] ?? FILLS['No data']
    return <g>
      <svg x={sx} y={sy} width={28} height={68} viewBox="0 0 28 68" fill="none">
        <rect fill="#FFF" x={1} y={1} width={26} height={66} rx={7}/>
        <rect fill="none" stroke="#555555" strokeWidth={2} x={1} y={1} width={26} height={66} rx={6}/>
        <rect fill={top} x={6} y={6}  width={16} height={16} rx={2}/>
        <rect fill={mid} x={6} y={26} width={16} height={16} rx={2}/>
        <rect fill={bot} x={6} y={46} width={16} height={16} rx={2}/>
      </svg>
      {!editing && <>
  <rect x={cx - 40} y={sy + 82 - 10} width={80} height={20} rx={8} fill="var(--sapPageSection_Background, #f5f6f7)" style={{ pointerEvents: 'none' }} />
  <text x={cx} y={sy + 86} fontSize={11} fill="var(--sapTextColor)" textAnchor="middle" fontFamily="'72',Arial,sans-serif">{shape.label ?? shape.widgetName ?? ''}</text>
</>}
    </g>
  }

  // Cockpit
  if (shapeType === 'Cockpit') {
    const sx = cx - 18, sy = cy - 18
    const status = shape.manualValue ?? 'No data'
    const COCKPIT_COLORS: Record<string, string> = {
      'Green':   '#B8CC00',
      'Yellow':  '#E9730C',
      'Red':     '#C12028',
      'No data': '#AAAAAA',
    }
    const c = COCKPIT_COLORS[status] ?? '#AAAAAA'
    // needle tip coords: arc goes from ~210° (left) to ~330° (right), center=20,20, length=11
    // Green=~210°: x=20+11*cos(210°)=20-9.5=10.5, y=20+11*sin(210°)=20-5.5=14.5
    // Yellow=~270°: x=20, y=20-11=9
    // Red=~330°: x=20+11*cos(330°)=29.5, y=20+11*sin(330°)=14.5
    const NEEDLE: Record<string, [number, number] | null> = {
      'Green':   [10.5, 14.5],
      'Yellow':  [20,   9   ],
      'Red':     [29.5, 14.5],
      'No data': null,
    }
    const needle = NEEDLE[status] ?? null
    return <g>
      <svg x={sx} y={sy} width={37} height={37} viewBox="0 0 40 40" fill="none">
        <ellipse fill="#FFF" cx={20} cy={20} rx={20} ry={20}/>
        <ellipse stroke="#555555" strokeWidth={3} fill="none" cx={20} cy={20} rx={18.5} ry={18.5}/>
        <path d="M7 20 A13 13 0 0 1 33 20" stroke={c} strokeWidth={4.5} strokeLinecap="round" fill="none"/>
        {needle && <line x1={20} y1={20} x2={needle[0]} y2={needle[1]} stroke={c} strokeWidth={2} strokeLinecap="round"/>}
        <circle cx={20} cy={20} r={3} fill={c}/>
      </svg>
      {!editing && <>
  <rect x={cx - 40} y={sy + 51 - 10} width={80} height={20} rx={8} fill="var(--sapPageSection_Background, #f5f6f7)" style={{ pointerEvents: 'none' }} />
  <text x={cx} y={sy + 54} fontSize={11} fill="var(--sapTextColor)" textAnchor="middle" fontFamily="'72',Arial,sans-serif">{shape.label ?? shape.widgetName ?? ''}</text>
</>}
    </g>
  }

  // Value
  if (shapeType === 'Value') {
    const MOCK: Record<string, string> = {
      'value-D-001': '4,218', 'value-D-002': '1,042', 'value-D-003': '892',
      'value-D-004': '94.2%', 'value-D-005': '3,156', 'value-D-006': '87.5%',
      'value-I-001': '2,847', 'value-I-002': '28.5d',
      'ext-001': '92.4%', 'ext-002': '€1.2M', 'ext-003': '74.1%',
      'ext-004': '1,540',  'ext-005': '8,310',
      'rec-val-001': '24', 'rec-val-002': '138', 'rec-val-003': '62.4%',
      'rec-val-004': '34.2d', 'rec-val-005': '78.9%',
    }
    const numLabel = MOCK[shape.widgetId] ?? '—'
    const STATUS_COLOR: Record<string, string> = {
      'Green': '#5C8A00', 'Yellow': '#E9730C', 'Red': '#BB0000', 'No data': '#949494',
    }
    const dotColor = STATUS_COLOR[shape.manualValue ?? 'Green'] ?? '#5C8A00'
    return <g>
      <svg x={cx - 50} y={cy - 9} width={100} height={18} viewBox="0 0 100 18" fill="none">
        <g transform="translate(23,0)">
          <circle cx={9} cy={9} r={9} fill="#949494"/>
          <circle cx={9} cy={9} r={7} fill={dotColor} stroke="white" strokeWidth={1.5}/>
          <text fill="#333333" x={22} y={13} fontSize={12} textAnchor="start" fontFamily="'72',Arial,sans-serif">{numLabel}</text>
        </g>
      </svg>
    </g>
  }

  // Trend
  if (shapeType === 'Trend') {
    const sx = cx - 17, sy = cy - 17
    const status = shape.manualValue ?? 'No data'
    const TREND_COLORS: Record<string, string> = {
      'Green':   '#B8CC00',
      'Yellow':  '#F0AD26',
      'Red':     '#C12028',
      'No data': '#c2c2c2',
    }
    const trendColor = TREND_COLORS[status] ?? '#c2c2c2'
    return <g>
      <svg x={sx} y={sy} width={35} height={35} viewBox="0 0 38 38" fill="none">
        <path fill="white" stroke="#555555" strokeWidth={2} d="M29.5882 1.2222L8.4117 1.2222C4.5133 1.2222 1.3529 4.207 1.3529 7.8889L1.3529 30.1111C1.3529 33.793 4.5133 36.7778 8.4117 36.7778L29.5882 36.7778C33.4867 36.7778 36.647 33.793 36.647 30.1111L36.647 7.8889C36.647 4.207 33.4867 1.2222 29.5882 1.2222Z"/>
        {(status === 'Green' || status === 'No data') && (
          <path fill={trendColor} d="M31.9548 10.1166C32.0026 9.4818 31.5078 8.9522 30.9147 9.0034L21.9747 9.7759C21.1542 9.8468 20.7876 10.9137 21.3697 11.5366L23.2901 13.5921C23.2812 13.6007 23.2725 13.6096 23.2639 13.6187L19.5117 17.6349C19.4865 17.6022 19.4597 17.5707 19.4313 17.5403L19.3669 17.4714L17.3069 15.2665L17.2425 15.1975C16.6559 14.5696 15.6045 14.6769 14.8942 15.4371L4.6058 26.449C3.8956 27.2092 3.7954 28.3345 4.382 28.9624L4.4464 29.0314L6.5064 31.2363L6.5708 31.3052C7.1575 31.9331 8.2088 31.8259 8.9191 31.0656L16.9286 22.4929L19.1578 24.8788C19.7979 25.564 20.6656 25.7462 21.0958 25.2857L27.3272 18.6161C27.4445 18.4905 27.5172 18.3301 27.5478 18.1493L29.588 20.3329C30.17 20.9559 31.1668 20.5635 31.233 19.6853L31.9548 10.1166Z"/>
        )}
        {status === 'Yellow' && (
          <path fill={trendColor} d="M 6 16 L 25 16 L 25 13 L 32 19 L 25 25 L 25 22 L 6 22 Z"/>
        )}
        {status === 'Red' && (
          <path fill={trendColor} transform="rotate(45, 19, 19)" d="M 6 16 L 25 16 L 25 13 L 32 19 L 25 25 L 25 22 L 6 22 Z"/>
        )}
      </svg>
      {!editing && <>
  <rect x={cx - 40} y={sy + 48 - 10} width={80} height={20} rx={8} fill="var(--sapPageSection_Background, #f5f6f7)" style={{ pointerEvents: 'none' }} />
  <text x={cx} y={sy + 52} fontSize={11} fill="var(--sapTextColor)" textAnchor="middle" fontFamily="'72',Arial,sans-serif">{shape.label ?? shape.widgetName ?? ''}</text>
</>}
    </g>
  }

  // Progress Bar
  if (shapeType === 'Progress Bar') {
    const sx = cx - 17, sy = cy - 17
    const status = shape.manualValue ?? 'Green'
    const BAR_COLORS: Record<string, [string, string, string]> = {
      'Green':   ['#B8CC00', '#B8CC00', '#B8CC00'],
      'Yellow':  ['#F0AB00', '#F0AB00', '#c2c2c2'],
      'Red':     ['#BB0000', '#c2c2c2', '#c2c2c2'],
      'No data': ['#c2c2c2', '#c2c2c2', '#c2c2c2'],
    }
    const [c1, c2, c3] = BAR_COLORS[status] ?? BAR_COLORS['Green']
    return <g>
      <svg x={sx} y={sy} width={35} height={35} viewBox="0 0 38 38" fill="none">
        <path fill="white" stroke="#555555" strokeWidth={2} d="M29.5882 1.2222L8.4117 1.2222C4.5133 1.2222 1.3529 4.207 1.3529 7.8889L1.3529 30.1111C1.3529 33.793 4.5133 36.7778 8.4117 36.7778L29.5882 36.7778C33.4867 36.7778 36.647 33.793 36.647 30.1111L36.647 7.8889C36.647 4.207 33.4867 1.2222 29.5882 1.2222Z"/>
        <path fill={c1} d="M13.1177 7.8889L13.1177 30.1111L8.4118 30.1111C7.1123 30.1111 6.0588 29.1162 6.0588 27.8889L6.0588 10.1111C6.0588 8.8838 7.1123 7.8889 8.4118 7.8889L13.1177 7.8889Z"/>
        <path fill={c2} d="M22.5294 30.1111L22.5294 7.8889L15.4706 7.8889L15.4706 30.1111L22.5294 30.1111Z"/>
        <path fill={c3} d="M31.9412 10.1111L31.9412 27.8889C31.9412 29.1162 30.8877 30.1111 29.5882 30.1111L24.8823 30.1111L24.8823 7.8889L29.5882 7.8889C30.8877 7.8889 31.9412 8.8838 31.9412 10.1111Z"/>
      </svg>
      {!editing && <>
  <rect x={cx - 40} y={sy + 48 - 10} width={80} height={20} rx={8} fill="var(--sapPageSection_Background, #f5f6f7)" style={{ pointerEvents: 'none' }} />
  <text x={cx} y={sy + 52} fontSize={11} fill="var(--sapTextColor)" textAnchor="middle" fontFamily="'72',Arial,sans-serif">{shape.label ?? shape.widgetName ?? ''}</text>
</>}
    </g>
  }

  // Ring Chart
  if (shapeType === 'Ring Chart') {
    const sx = cx - 17, sy = cy - 17
    const status = shape.manualValue ?? 'No data'
    const ARC_COLORS: Record<string, string> = {
      'Green':  '#5C8A00',
      'Yellow': '#E9730C',
      'Red':    '#C12028',
    }
    // Arc paths: center(19,19), outer r=13, inner r=6.5, clockwise from top
    // Green=270°, Yellow=180°, Red=90°
    const ARC_PATHS: Record<string, string> = {
      'Green':  'M19 6 A13 13 0 1 1 6 19 L12.5 19 A6.5 6.5 0 1 0 19 12.5 Z',
      'Yellow': 'M19 6 A13 13 0 0 1 19 32 L19 25.5 A6.5 6.5 0 0 0 19 12.5 Z',
      'Red':    'M19 6 A13 13 0 0 1 32 19 L25.5 19 A6.5 6.5 0 0 0 19 12.5 Z',
    }
    const arcColor = ARC_COLORS[status]
    const arcPath = ARC_PATHS[status]
    return <g>
      <svg x={sx} y={sy} width={35} height={35} viewBox="0 0 38 38" fill="none">
        <path fill="white" stroke="#555555" strokeWidth={2} d="M29.5882 1.2222L8.4117 1.2222C4.5133 1.2222 1.3529 4.207 1.3529 7.8889L1.3529 30.1111C1.3529 33.793 4.5133 36.7778 8.4117 36.7778L29.5882 36.7778C33.4867 36.7778 36.647 33.793 36.647 30.1111L36.647 7.8889C36.647 4.207 33.4867 1.2222 29.5882 1.2222Z"/>
        <path fill="#DEE0E3" d="M32 19C32 26.1797 26.1797 32 19 32C11.8203 32 6 26.1797 6 19C6 11.8203 11.8203 6 19 6C26.1797 6 32 11.8203 32 19ZM12.5 19C12.5 22.5899 15.4101 25.5 19 25.5C22.5899 25.5 25.5 22.5899 25.5 19C25.5 15.4101 22.5899 12.5 19 12.5C15.4101 12.5 12.5 15.4101 12.5 19Z"/>
        {arcColor && arcPath && <path fill={arcColor} d={arcPath}/>}
      </svg>
      {!editing && <>
  <rect x={cx - 40} y={sy + 48 - 10} width={80} height={20} rx={8} fill="var(--sapPageSection_Background, #f5f6f7)" style={{ pointerEvents: 'none' }} />
  <text x={cx} y={sy + 52} fontSize={11} fill="var(--sapTextColor)" textAnchor="middle" fontFamily="'72',Arial,sans-serif">{shape.label ?? shape.widgetName ?? ''}</text>
</>}
    </g>
  }

  // Sentiment
  if (shapeType === 'Sentiment') {
    const sx = cx - 20, sy = cy - 20
    const status = shape.manualValue ?? 'No data'
    const FEAT_COLORS: Record<string, string> = {
      'No data': '#AAAAAA',
      'Green':   '#B8CC00',
      'Yellow':  '#E9730C',
      'Red':     '#C12028',
    }
    const RING_COLORS: Record<string, string> = {
      'No data': '#555555',
      'Green':   '#B8CC00',
      'Yellow':  '#E9730C',
      'Red':     '#C12028',
    }
    const fc = FEAT_COLORS[status] ?? '#AAAAAA'
    const rc = RING_COLORS[status] ?? '#555555'
    const MOUTH: Record<string, string> = {
      'No data': 'M11.25 25 C13.275 27.65 16.25 29.375 20 29.375 C23.75 29.375 26.725 27.65 28.75 25',
      'Green':   'M11.25 25 C13.275 27.65 16.25 29.375 20 29.375 C23.75 29.375 26.725 27.65 28.75 25',
      'Yellow':  'M11.25 26 L28.75 26',
      'Red':     'M11.25 27.5 C13.275 24.85 16.25 23.125 20 23.125 C23.75 23.125 26.725 24.85 28.75 27.5',
    }
    const mouth = MOUTH[status] ?? MOUTH['No data']
    return <g>
      <svg x={sx} y={sy} width={40} height={40} viewBox="0 0 40 40" fill="none">
        <circle cx={20} cy={20} r={20} fill="white"/>
        <circle cx={20} cy={20} r={19} fill="none" stroke={rc} strokeWidth={2}/>
        <circle cx={13.75} cy={14.375} r={1.25} fill="none" stroke={fc} strokeWidth={1.5}/>
        <circle cx={26.25} cy={14.375} r={1.25} fill="none" stroke={fc} strokeWidth={1.5}/>
        <path d={mouth} stroke={fc} strokeWidth={1.5} fill="none" strokeLinecap="round"/>
      </svg>
      {!editing && <>
  <rect x={cx - 40} y={sy + 54 - 10} width={80} height={20} rx={8} fill="var(--sapPageSection_Background, #f5f6f7)" style={{ pointerEvents: 'none' }} />
  <text x={cx} y={sy + 58} fontSize={11} fill="var(--sapTextColor)" textAnchor="middle" fontFamily="'72',Arial,sans-serif">{shape.label ?? shape.widgetName ?? ''}</text>
</>}
    </g>
  }

  // Default / Indicator fallback
  const sx = cx - 17, sy = cy - 17
  return <g>
    <rect x={sx} y={sy} width={34} height={34} rx={6} fill="#fff" stroke="#555" strokeWidth={1.5}/>
    <rect x={sx+6} y={sy+6} width={22} height={22} rx={2} fill={color} fillOpacity={0.3}/>
    <text x={cx} y={cy + 4} fontSize={9} fill={color} textAnchor="middle" fontFamily="'72',Arial,sans-serif" fontWeight={600}>{shapeType}</text>
  </g>
}

// ── LI connector line ─────────────────────────────────────────────────────────

function ArtifactShape({ el, selected, hovered, ringW, editing, aiPreview }: { el: CanvasElement; selected: boolean; hovered: boolean; ringW: number; editing?: boolean; aiPreview?: boolean }) {
  const { cx, cy } = el
  const w = el.hw * 2, h = el.hh * 2
  const x = cx - el.hw, y = cy - el.hh
  const tc = aiPreview ? 'var(--sapHighlightColor)' : 'var(--sapTextColor)'
  const selectionEl = <rect x={x - ringW / 2 - 0.5} y={y - ringW / 2 - 0.5} width={w + ringW + 1} height={h + ringW + 1} rx={0} fill="none" stroke="var(--sapHighlightColor)" strokeWidth={ringW} />

  if (el.subtype === 'Group') {
    return (
      <g>
        <rect x={x} y={y} width={w} height={h} rx={10} fill="white" fillOpacity={0.6} stroke={tc} strokeWidth={1} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 4 10 4" />
        {(hovered || selected) && selectionEl}
      </g>
    )
  }

  if (el.subtype === 'TextAnnotation') {
    // Left bracket: rounded top-left/bottom-left corners, open right
    // Figma: x 0.5~19.5, y 0.5~49.5, rounded corners r=10.5
    const s = h / 50
    return (
      <g>
        <g transform={`translate(${x}, ${y}) scale(${s})`}>
          <path d={`M19.5 0.5H11C5.477 0.5 0.5 4.978 0.5 10.5V39C0.5 45.023 4.977 49.5 10.5 49.5H11H19.5`} fill="none" stroke={tc} strokeWidth={1} />
        </g>
        {(hovered || selected) && selectionEl}
      </g>
    )
  }

  if (el.subtype === 'ITSystem') {
    const bg = aiPreview ? '#e8f3ff' : 'var(--sapAvatar_6_Background)'
    const ic = aiPreview ? 'var(--sapHighlightColor)' : 'var(--sapAvatar_6_TextColor)'
    const r = el.hw  // 28.5
    const scale = 0.98
    const pillW = Math.max(el.name.length * 6.2 + 16, 60)
    const pillY = cy + r + 4
    return (
      <g>
        <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} rx={r} fill={bg} />
        <g transform={`translate(${cx}, ${cy}) scale(${scale}) translate(-28.55, -28.85)`}>
          <path d="M42.3896 11.2412C44.8748 11.2414 46.8896 13.256 46.8896 15.7412V35.4912C46.8895 37.9763 44.8747 39.991 42.3896 39.9912H33.4521V43.96H38.8486C39.539 43.96 40.0986 44.5196 40.0986 45.21C40.0985 45.9002 39.5389 46.46 38.8486 46.46H19.0566C18.3665 46.4598 17.8068 45.9001 17.8066 45.21C17.8066 44.5197 18.3664 43.9601 19.0566 43.96H24.4521V39.9912H14.7227C12.2375 39.9912 10.2228 37.9764 10.2227 35.4912V15.7412C10.2227 13.2559 12.2374 11.2412 14.7227 11.2412H42.3896ZM26.9521 43.8242H30.9521V40.8242H26.9521V43.8242ZM14.5186 13.752C13.5099 13.8542 12.7227 14.7056 12.7227 15.7412V35.4912C12.7228 36.5268 13.51 37.3782 14.5186 37.4805L14.7227 37.4912H42.3896L42.5938 37.4805C43.5351 37.3849 44.2834 36.6367 44.3789 35.6953L44.3896 35.4912V15.7412C44.3896 14.7057 43.6023 13.8544 42.5938 13.752L42.3896 13.7412H14.7227L14.5186 13.752Z" fill={ic} />
        </g>
        {!editing && (
          <g>
            <rect x={cx - pillW / 2} y={pillY} width={pillW} height={20} rx={8} fill="#f5f6f7" />
            <text x={cx} y={pillY + 14} fontSize={11} fill="var(--sapTextColor)" textAnchor="middle" fontFamily="'72',Arial,sans-serif">{el.name}</text>
          </g>
        )}
        {(hovered || selected) && selectionEl}
      </g>
    )
  }

  if (el.subtype === 'Participant') {
    const tc = 'var(--sapTextColor)'
    const r = el.hw  // 25.5
    const scale = 25 / 25  // icon width=25, target=25
    return (
      <g>
        <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} rx={r} fill="white" />
        <g transform={`translate(${cx}, ${cy}) scale(${scale}) translate(-26.5, -25)`}>
          <path d="M39 37.5806V40H14V37.5806C14 30.9031 19.3846 25.4837 26.0192 25.4837H26.9808C33.6154 25.4837 39 30.9031 39 37.5806ZM34.0721 16.3384C33.5433 13.2174 30.9952 10.6771 27.8942 10.1206C23.0144 9.27381 18.8077 12.9997 18.8077 17.7417C18.8077 22.024 22.2452 25.4837 26.5 25.4837C31.2115 25.4837 34.9135 21.2498 34.0721 16.3384Z" fill="none" stroke={tc} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </g>
        {(hovered || selected) && selectionEl}
      </g>
    )
  }

  return null
}

function LiConnector({ liShape, geomMap }: { liShape: LiShape; geomMap: Record<string, ElementGeometry> }) {
  if (!liShape.linkedBpmnId) return null
  const tg = geomMap[liShape.linkedBpmnId]
  if (!tg) return null
  const dx = liShape.cx - tg.cx
  const dy = liShape.cy - tg.cy
  const dist = Math.sqrt(dx * dx + dy * dy)
  if (dist < 1) return null
  const nx = dx / dist, ny = dy / dist
  const x1 = tg.cx + nx * (tg.hw + 4), y1 = tg.cy + ny * (tg.hh + 4)
  const x2 = liShape.cx - nx * 42, y2 = liShape.cy - ny * 42
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--sapHighlightColor, #0064d9)" strokeWidth={1.5} strokeDasharray="3 3" strokeLinecap="round" />
}

// ── BpmnCanvas ─────────────────────────────────────────────────────────────────

function BpmnCanvas({
  assetName,
  assetObjectType = 'Process Model',
  assetId,
  onClose,
  dictOpen,
  onToggleDict,
  dictInitialQuery,
  onTogglePanel,
  onToggleData,
  shapesOpen,
  onToggleShapes,
  onElementSelect,
  onLiShapeSelect,
  onLiShapeUpdate,
  onRegisterLiShapeUpdater,
  onRegisterAddLiShape,
  onRegisterSelectLiShapeById,
  onRegisterLinkDictToElement,
  onSelectElementById,
  onLiShapesChange,
  onWidgetSelect,
  onOpenDictPanel,
  onDictItemSelect,
  onExploreDict,
  onAddBrowseWidget,
  panelOffset = 0,
}: {
  assetName: string
  assetObjectType?: string
  assetId?: string
  onClose: () => void
  dictOpen: boolean
  onToggleDict: () => void
  dictInitialQuery?: string
  onTogglePanel?: () => void
  onToggleData?: () => void
  shapesOpen?: boolean
  onToggleShapes?: () => void
  onElementSelect?: (id: string | null, hasLinkedDict?: boolean, dictId?: string) => void
  onLiShapeSelect?: (shape: LiShape | null) => void
  onLiShapeUpdate?: (id: string, changes: Partial<LiShape>) => void
  onRegisterLiShapeUpdater?: (fn: (id: string, changes: Partial<LiShape>) => void) => void
  onRegisterAddLiShape?: (fn: (shape: LiShape) => void) => void
  onRegisterSelectLiShapeById?: (fn: (id: string) => void) => void
  onRegisterLinkDictToElement?: (fn: (elementId: string, dictId: string, dictName: string) => void) => void
  onSelectElementById?: (fn: (id: string) => void) => void
  onLiShapesChange?: (shapes: LiShape[]) => void
  onWidgetSelect?: (widget: Widget | ExternalWidget) => void
  onOpenDictPanel?: () => void
  onDictItemSelect?: (item: any) => void
  onExploreDict?: (query: string) => void
  onAddBrowseWidget?: (widgetId: string, widgetName: string, widgetType: string) => void
  panelOffset?: number
}) {
  const [lang, setLang] = useState('ENG')
  const [editableTitle, setEditableTitle] = useState(assetName)
  const [saveState, setSaveState] = useState<SaveState>('saved')
  const [shareOpen, setShareOpen] = useState(false)
  const [toastOpen, setToastOpen] = useState(false)
  const [collaboratorsActive, setCollaboratorsActive] = useState(false)

  const isCollabCanvas = assetId === '5'

  // Collaborator definitions — shown only on asset 5
  const COLLABORATORS: PresenceUser[] = [
    { id: 'collab1', name: 'Johan Miller', initials: 'JM', color: '#046c7a', accentColor: '#c2fcee', colorIndex: 7,  isActive: true  },
    { id: 'collab2', name: 'Sam Driver',   initials: 'SD', color: '#a45d00', accentColor: '#fff3b8', colorIndex: 1,  isActive: false },
    { id: 'collab3', name: 'Julia Kim',    initials: 'JK', color: '#552cff', accentColor: '#ded3ff', colorIndex: 5,  isActive: true  },
    { id: 'collab4', name: 'Alex Johnson', initials: 'AJ', color: '#a100c2', accentColor: '#ffdcf3', colorIndex: 4,  isActive: true  },
  ]

  // After 3s, collaborators "join" the canvas
  useEffect(() => {
    if (!isCollabCanvas) return
    const t = setTimeout(() => setCollaboratorsActive(true), 3000)
    return () => clearTimeout(t)
  }, [isCollabCanvas])
  const [mode, setMode] = useState('Edit')
  const [zoom, setZoom] = useState(70)
  const [panX, setPanX] = useState(-80)
  const [panY, setPanY] = useState(80)

  // Canvas element state
  const [elements, setElements] = useState<CanvasElement[]>(() => {
    if (assetId === '5') {
      return [{
        id: 'se-1', type: 'event', subtype: 'Start',
        cx: 330, cy: 290, hw: 16, hh: 16,
        name: '',
      } as CanvasElement]
    }
    if (assetId === 'new') return []
    return buildInitialElements()
  })
  const [liShapes, setLiShapes] = useState<LiShape[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const selectedId = [...selectedIds][0] ?? null  // compat: first selected
  const setSelectedId = (id: string | null) => setSelectedIds(id ? new Set([id]) : new Set())
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingLiId, setEditingLiId] = useState<string | null>(null)
  const [editingLiLabel, setEditingLiLabel] = useState('')
  const [suggestionQuery, setSuggestionQuery] = useState('')
  const [suggestionPos, setSuggestionPos] = useState<{ x: number; y: number } | null>(null)
  const suppressSuggestionClose = useRef(false)
  const suggestionMenuOpen = useRef(false)
  const [isDragging, setIsDragging] = useState(false)
  const [connHover, setConnHover] = useState<{ id: string; x: number; y: number } | null>(null)
  const [fontSizeMenuOpen, setFontSizeMenuOpen] = useState(false)
  const [selectedFontSize, setSelectedFontSize] = useState(48)
  const [dictPopup, setDictPopup] = useState<{ elId: string; rect: DOMRect } | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [overlayDismissed, setOverlayDismissed] = useState(false)
  const [isAiPreview, setIsAiPreview] = useState(false)
  const [dictHoveredId, setDictHoveredId] = useState<string | null>(null)
  const [rubberBand, setRubberBand] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null)
  const [dropTargetId, setDropTargetId] = useState<string | null>(null)
  const [dropInvalidId, setDropInvalidId] = useState<string | null>(null)
  const [liDragOverBpmnId, setLiDragOverBpmnId] = useState<string | null>(null)

  // Undo/Redo history
  const [history, setHistory] = useState<{ elements: CanvasElement[]; liShapes: LiShape[] }[]>([])
  const [future, setFuture] = useState<{ elements: CanvasElement[]; liShapes: LiShape[] }[]>([])
  const elementsRef = useRef(elements)
  const liShapesRef = useRef(liShapes)
  useEffect(() => { elementsRef.current = elements }, [elements])
  useEffect(() => { liShapesRef.current = liShapes }, [liShapes])

  const handleLiShapeUpdate = useCallback((id: string, changes: Partial<LiShape>) => {
    setLiShapes(ls => ls.map(s => s.id === id ? { ...s, ...changes } : s))
  }, [])

  useEffect(() => {
    onRegisterLiShapeUpdater?.(handleLiShapeUpdate)
  }, [handleLiShapeUpdate, onRegisterLiShapeUpdater])

  useEffect(() => {
    onRegisterAddLiShape?.((shape: LiShape) => {
      const s = 100 / zoomRef.current
      const vbW = canvasSizeRef.current.w * s
      const vbH = canvasSizeRef.current.h * s
      const vcx = panXRef.current + vbW / 2
      const vcy = panYRef.current + vbH / 2
      const bpmnMaxY = elementsRef.current.length > 0
        ? Math.max(...elementsRef.current.map(e => e.cy + e.hh)) + 150
        : vcy
      const startY = Math.max(vcy, bpmnMaxY)
      const pos = findEmptySpotNearViewportCenter(vcx, startY, elementsRef.current, liShapesRef.current, shape.shapeType)
      const placed = { ...shape, cx: pos.cx, cy: pos.cy }
      setLiShapes(ls => [...ls, placed])
      setToastMsg(`"${shape.widgetName}" added to canvas`)
      setPanX(pos.cx - vbW / 2)
      setPanY(pos.cy - vbH / 2)
    })
  }, [onRegisterAddLiShape])

  useEffect(() => {
    onRegisterSelectLiShapeById?.((id: string) => {
      const shape = liShapesRef.current.find(s => s.id === id)
      if (shape) {
        setSelectedIds(new Set([id]))
        onLiShapeSelect?.(shape)
      }
    })
  }, [onRegisterSelectLiShapeById])

  useEffect(() => {
    onRegisterLinkDictToElement?.((elementId: string, dictId: string, dictName: string) => {
      setElements(els => els.map(el => el.id === elementId ? { ...el, linkedDictId: dictId, linkedDictName: dictName } : el))
      setToastMsg(`"${dictName}" linked`)
    })
  }, [onRegisterLinkDictToElement])

  useEffect(() => {
    onLiShapesChange?.(liShapes)
  }, [liShapes, onLiShapesChange])

  useEffect(() => {
    onSelectElementById?.((id: string) => {
      setSelectedIds(new Set([id]))
      onElementSelect?.(id)
    })
  }, [onSelectElementById, onElementSelect])

  const pushHistory = (els: CanvasElement[], ls: LiShape[]) => {
    setHistory(h => [...h.slice(-49), { elements: els, liShapes: ls }])
    setFuture([])
  }
  const handleUndo = () => {
    setHistory(h => {
      if (h.length === 0) return h
      const prev = h[h.length - 1]
      setFuture(f => [{ elements: elementsRef.current, liShapes: liShapesRef.current }, ...f])
      setElements(prev.elements)
      setLiShapes(prev.liShapes)
      return h.slice(0, -1)
    })
  }
  const handleRedo = () => {
    setFuture(f => {
      if (f.length === 0) return f
      const next = f[0]
      setHistory(h => [...h, { elements: elementsRef.current, liShapes: liShapesRef.current }])
      setElements(next.elements)
      setLiShapes(next.liShapes)
      return f.slice(1)
    })
  }

  // Drag-to-move state
  const svgRef = useRef<SVGSVGElement>(null)
  const dragState = useRef<{ id: string; startX: number; startY: number; origCx: number; origCy: number } | null>(null)
  const panState = useRef<{ startX: number; startY: number; origPanX: number; origPanY: number } | null>(null)
  const panXRef = useRef(panX)
  const panYRef = useRef(panY)
  const zoomRef = useRef(zoom)
  useEffect(() => { panXRef.current = panX }, [panX])
  useEffect(() => { panYRef.current = panY }, [panY])
  useEffect(() => { zoomRef.current = zoom }, [zoom])
  useEffect(() => { if (dictPopup) setDictPopup(null) }, [panX, panY])

  const overflowMenuRef = useRef<any>(null)
  const modeMenuRef = useRef<any>(null)
  const zoomMenuRef = useRef<any>(null)
  const openMenu = (ref: React.MutableRefObject<any>, opener: string) => {
    if (ref.current) { ref.current.opener = opener; ref.current.open = true }
  }

  // Zoom keeping a specific SVG point fixed (e.g. mouse position or center)
  const zoomAroundPoint = (newZoom: number, fixedSvgX: number, fixedSvgY: number) => {
    const clamped = Math.min(Math.max(Math.round(newZoom), 25), 400)
    const oldScale = 100 / zoom
    const newScale = 100 / clamped
    const cw = canvasSize.w, ch = canvasSize.h
    // Keep fixedSvgPoint at same screen position
    const screenFracX = (fixedSvgX - panX) / (cw * oldScale)
    const screenFracY = (fixedSvgY - panY) / (ch * oldScale)
    setPanX(fixedSvgX - screenFracX * cw * newScale)
    setPanY(fixedSvgY - screenFracY * ch * newScale)
    setZoom(clamped)
  }

  const zoomAtCenter = (newZoom: number) => {
    if (canvasSize.w === 0) return
    const cw = canvasSize.w, ch = canvasSize.h
    const oldScale = 100 / zoom
    const centerSvgX = panX + cw * oldScale / 2
    const centerSvgY = panY + ch * oldScale / 2
    zoomAroundPoint(newZoom, centerSvgX, centerSvgY)
  }

  const zoomIn  = () => zoomAtCenter(Math.min(zoom + 10, 400))
  const zoomOut = () => zoomAtCenter(Math.max(zoom - 10, 25))

  const fitToCanvas = () => {
    if (!svgRef.current) return
    const container = svgRef.current.parentElement
    if (!container) return
    const cw = container.clientWidth
    const ch = container.clientHeight
    const allEls = elementsRef.current
    const allLi = liShapesRef.current
    if (allEls.length === 0 && allLi.length === 0) return
    const PAD = 60
    const xs: number[] = []
    const ys: number[] = []
    allEls.forEach(e => { xs.push(e.cx - e.hw, e.cx + e.hw); ys.push(e.cy - e.hh, e.cy + e.hh) })
    allLi.forEach(ls => { xs.push(ls.cx - 20, ls.cx + 20); ys.push(ls.cy - 40, ls.cy + 40) })
    const minX = Math.min(...xs) - PAD
    const maxX = Math.max(...xs) + PAD
    const minY = Math.min(...ys) - PAD
    const maxY = Math.max(...ys) + PAD
    const diagramW = maxX - minX
    const diagramH = maxY - minY
    const scaleX = cw / diagramW
    const scaleY = ch / diagramH
    const fitScale = Math.min(scaleX, scaleY, 0.90)
    const z = Math.max(Math.round(fitScale * 100 / 5) * 5, 10)
    const s = 100 / z
    const vbW = cw * s
    const vbH = ch * s
    const cx = (minX + maxX) / 2
    const cy = (minY + maxY) / 2
    const toolbarOffsetSvg = 90 * s
    setZoom(z)
    setPanX(cx - vbW / 2 - toolbarOffsetSvg / 2)
    setPanY(cy - vbH / 2)
  }

  const zoomFit = fitToCanvas


  // Geometry map for connection calculations (live, updated as elements move)
  const geomMap = React.useMemo<Record<string, ElementGeometry>>(() => {
    const m: Record<string, ElementGeometry> = {}
    elements.forEach(el => { m[el.id] = { cx: el.cx, cy: el.cy, hw: el.hw, hh: el.hh } })
    return m
  }, [elements])

  // ESC to deselect, Delete to remove element, Cmd+/-/0 to zoom
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setSelectedIds(new Set()); setEditingId(null) }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.size > 0) {
        const active = document.activeElement as HTMLElement
        const isInput = active?.tagName === 'INPUT' || active?.tagName === 'TEXTAREA'
          || active?.isContentEditable
          || active?.closest('ui5-input, ui5-textarea, ui5-search, ui5-select')
        if (!isInput) {
          pushHistory(elements, liShapes)
          setElements(els => els.filter(el => !selectedIds.has(el.id)))
          setLiShapes(ls => ls.filter(s => !selectedIds.has(s.id) && !selectedIds.has(s.linkedBpmnId ?? '')))
          setSelectedIds(new Set())
        }
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === '+' || e.key === '=')) {
        e.preventDefault()
        zoomAtCenter(Math.min(zoom + 10, 400))
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '-') {
        e.preventDefault()
        zoomAtCenter(Math.max(zoom - 10, 25))
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '0') {
        e.preventDefault()
        fitToCanvas()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [selectedIds, elements, liShapes])

  const [canvasSize, setCanvasSize] = useState({ w: 1200, h: 800 })
  const canvasSizeRef = useRef(canvasSize)
  useEffect(() => { canvasSizeRef.current = canvasSize }, [canvasSize])

  useLayoutEffect(() => {
    const measure = () => {
      if (!svgRef.current?.parentElement) return
      const { clientWidth: w, clientHeight: h } = svgRef.current.parentElement
      if (w === 0 || h === 0) return
      setCanvasSize({ w, h })
      const els = buildInitialElements()
      const PAD = 60
      const PAD_RIGHT = 140
      const minX = Math.min(...els.map(e => e.cx - e.hw)) - PAD - PAD_RIGHT
      const maxX = Math.max(...els.map(e => e.cx + e.hw)) + PAD + PAD_RIGHT
      const minY = Math.min(...els.map(e => e.cy - e.hh)) - PAD
      const maxY = Math.max(...els.map(e => e.cy + e.hh)) + PAD
      const diagramW = maxX - minX
      const diagramH = maxY - minY
      const scaleX = w / diagramW
      const scaleY = h / diagramH
      const fitScale = Math.min(scaleX, scaleY, 0.90)
      const z = Math.max(Math.round(fitScale * 100 / 5) * 5, 10)
      const s = 100 / z
      const vbW = w * s
      const vbH = h * s
      const cx = (minX + maxX) / 2
      const cy = (minY + maxY) / 2
      const toolbarOffsetSvg = 90 * s
      setZoom(z)
      setPanX(cx - vbW / 2 - toolbarOffsetSvg / 2)
      setPanY(cy - vbH / 2)
    }
    const parent = svgRef.current?.parentElement
    // Watch for the parent getting non-zero dimensions (UI5 NavigationLayout initializes async)
    let ro: ResizeObserver | null = new ResizeObserver(() => {
      const p = svgRef.current?.parentElement
      if (p && p.clientWidth > 0 && p.clientHeight > 0) {
        measure()
        ro?.disconnect()
        ro = null
      }
    })
    if (parent) ro.observe(parent)
    window.addEventListener('resize', measure)
    return () => { ro?.disconnect(); ro = null; window.removeEventListener('resize', measure) }
  }, [])

  // ── Mouse handlers for element dragging ──────────────────────────────────────

  const handleSvgMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isAiPreview) return  // read-only in preview mode
    setFontSizeMenuOpen(false)
    setDictPopup(null)
    if (!svgRef.current) return
    const svgPt = clientToSvg(e.clientX, e.clientY, svgRef.current)
    const hit = hitTestElement(svgPt.x, svgPt.y, elementsRef.current)
    if (hit && (hit.type === 'task' || hit.type === 'system' || hit.type === 'li-shape' || hit.type === 'data' || hit.type === 'artifact' || hit.type === 'event' || hit.type === 'gateway')) {
      if (e.shiftKey) {
        // Shift+click: toggle element in/out of selection
        setSelectedIds(prev => {
          const next = new Set(prev)
          if (next.has(hit.id)) next.delete(hit.id)
          else next.add(hit.id)
          return next
        })
      } else {
        if (!selectedIds.has(hit.id)) {
          setSelectedIds(new Set([hit.id]))
        }
        onElementSelect?.(hit.id, !!hit.linkedDictId, hit.linkedDictId)
      }
    } else if (!hit) {
      setSelectedIds(new Set())
      onElementSelect?.(null)
      onLiShapeSelect?.(null)
      setEditingId(null)
      // start rubber-band or pan
      panState.current = { startX: e.clientX, startY: e.clientY, origPanX: panX, origPanY: panY }
      setRubberBand({ x1: svgPt.x, y1: svgPt.y, x2: svgPt.x, y2: svgPt.y })
    } else {
      if (e.shiftKey) {
        setSelectedIds(prev => {
          const next = new Set(prev)
          if (next.has(hit.id)) next.delete(hit.id)
          else next.add(hit.id)
          return next
        })
      } else {
        setSelectedIds(new Set([hit.id]))
        onElementSelect?.(hit.id, !!hit.linkedDictId, hit.linkedDictId)
      }
    }
  }

  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return
    if (panState.current) {
      const moved = Math.abs(e.clientX - panState.current.startX) + Math.abs(e.clientY - panState.current.startY)
      if (moved > 3) setDictPopup(null)
      if (moved < 3) return
      const pt = clientToSvg(e.clientX, e.clientY, svgRef.current)
      const ptStart = clientToSvg(panState.current.startX, panState.current.startY, svgRef.current)
      // if rubber-band is active, update it instead of panning
      if (rubberBand) {
        setRubberBand(rb => rb ? { ...rb, x2: pt.x, y2: pt.y } : null)
        // select all elements within rubber-band
        const rb = { x1: Math.min(pt.x, clientToSvg(panState.current!.startX, panState.current!.startY, svgRef.current!).x), y1: Math.min(pt.y, clientToSvg(panState.current!.startX, panState.current!.startY, svgRef.current!).y), x2: Math.max(pt.x, clientToSvg(panState.current!.startX, panState.current!.startY, svgRef.current!).x), y2: Math.max(pt.y, clientToSvg(panState.current!.startX, panState.current!.startY, svgRef.current!).y) }
        const ids = new Set<string>()
        elementsRef.current.forEach(el => {
          if (el.cx + el.hw >= rb.x1 && el.cx - el.hw <= rb.x2 && el.cy + el.hh >= rb.y1 && el.cy - el.hh <= rb.y2) ids.add(el.id)
        })
        liShapesRef.current.forEach(ls => {
          if (ls.cx + 17 >= rb.x1 && ls.cx - 17 <= rb.x2 && ls.cy + 17 >= rb.y1 && ls.cy - 17 <= rb.y2) ids.add(ls.id)
        })
        if (ids.size > 0) setSelectedIds(ids)
        return
      }
      setPanX(panState.current.origPanX - (pt.x - ptStart.x))
      setPanY(panState.current.origPanY - (pt.y - ptStart.y))
      return
    }
    if (!dragState.current) return
    const { id, startX, startY, origCx, origCy } = dragState.current
    if (Math.abs(e.clientX - startX) + Math.abs(e.clientY - startY) < 5) return
    setIsDragging(true)
    const pt = clientToSvg(e.clientX, e.clientY, svgRef.current)
    const ptStart = clientToSvg(startX, startY, svgRef.current)
    const dx = pt.x - ptStart.x, dy = pt.y - ptStart.y
    setElements(els => els.map(el => selectedIds.has(el.id)
      ? { ...el, cx: (el.id === id ? origCx : el.cx) + dx, cy: (el.id === id ? origCy : el.cy) + dy }
      : el
    ))
    setLiShapes(ls => ls.map(s => selectedIds.has(s.id)
      ? { ...s, cx: (s.id === id ? origCx : s.cx) + dx, cy: (s.id === id ? origCy : s.cy) + dy }
      : s
    ))
    // highlight BPMN shape when a single LI shape is dragged over it
    const draggedLi = liShapesRef.current.find(s => s.id === id)
    if (draggedLi && selectedIds.size === 1) {
      const liCx = origCx + dx, liCy = origCy + dy
      const overBpmn = elementsRef.current.find(el =>
        (el.type === 'task' || el.type === 'system' || el.type === 'gateway' || el.type === 'event' || el.type === 'data') &&
        liCx >= el.cx - el.hw && liCx <= el.cx + el.hw &&
        liCy >= el.cy - el.hh && liCy <= el.cy + el.hh
      )
      setLiDragOverBpmnId(overBpmn?.id ?? null)
    } else {
      setLiDragOverBpmnId(null)
    }
  }

  const handleSvgMouseUp = (e: React.MouseEvent<SVGSVGElement>) => {
    const ds = dragState.current
    dragState.current = null
    panState.current = null
    setIsDragging(false)
    setRubberBand(null)
    setLiDragOverBpmnId(null)

    // auto-link LI shape when dropped onto a BPMN shape
    if (ds && svgRef.current) {
      const draggedLi = liShapesRef.current.find(s => s.id === ds.id)
      if (draggedLi && selectedIds.size === 1) {
        const overBpmn = elementsRef.current.find(el =>
          (el.type === 'task' || el.type === 'system' || el.type === 'gateway' || el.type === 'event' || el.type === 'data') &&
          draggedLi.cx >= el.cx - el.hw && draggedLi.cx <= el.cx + el.hw &&
          draggedLi.cy >= el.cy - el.hh && draggedLi.cy <= el.cy + el.hh
        )
        if (overBpmn && overBpmn.id !== draggedLi.linkedBpmnId) {
          pushHistory(elementsRef.current, liShapesRef.current)
          const pos = findLiShapePosition(overBpmn, elementsRef.current, liShapesRef.current.filter(s => s.id !== draggedLi.id), draggedLi.shapeType)
          setLiShapes(ls => ls.map(s =>
            s.id === draggedLi.id
              ? { ...s, linkedBpmnId: overBpmn.id, linkedBpmnName: overBpmn.name, cx: pos.cx, cy: pos.cy }
              : s
          ))
          setToastMsg(`Connected to "${overBpmn.name}"`)
        }
      }
    }
  }

  // Non-passive wheel handler to prevent browser zoom
  useEffect(() => {
    const svgEl = svgRef.current
    if (!svgEl) return
    const handler = (e: WheelEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (e.ctrlKey || e.metaKey) {
        const svgPt = clientToSvg(e.clientX, e.clientY, svgEl)
        const factor = e.deltaY > 0 ? 0.95 : 1.05
        setZoom(prevZoom => {
          const newZoom = Math.min(Math.max(prevZoom * factor, 25), 400)
          const clamped = Math.round(newZoom)
          const oldScale = 100 / prevZoom
          const newScale = 100 / clamped
          const cw = svgEl.parentElement?.clientWidth ?? 1200
          const ch = svgEl.parentElement?.clientHeight ?? 800
          const screenFracX = (svgPt.x - panXRef.current) / (cw * oldScale)
          const screenFracY = (svgPt.y - panYRef.current) / (ch * oldScale)
          setPanX(svgPt.x - screenFracX * cw * newScale)
          setPanY(svgPt.y - screenFracY * ch * newScale)
          return clamped
        })
      } else {
        const s = 100 / zoom
        setPanX(px => px + e.deltaX * s * 1.2)
        setPanY(py => py + e.deltaY * s * 1.2)
      }
    }
    svgEl.addEventListener('wheel', handler, { passive: false })
    return () => svgEl.removeEventListener('wheel', handler)
  }, [zoom])

  // ── Drop handlers ─────────────────────────────────────────────────────────────

  const handleDragOver = (e: React.DragEvent<SVGSVGElement>) => {
    e.preventDefault()
    if (!svgRef.current) return
    const svgPt = clientToSvg(e.clientX, e.clientY, svgRef.current)
    const hit = hitTestElement(svgPt.x, svgPt.y, elements)
    if (!hit) { setDropTargetId(null); setDropInvalidId(null); return }

    const et = (window as any).__dictDragElementType as string | null
    if (et && e.dataTransfer.types.includes('application/dict-item')) {
      const compatible = (et === 'task' && hit.type === 'task')
        || (et === 'artifact' && (hit.type === 'artifact' || hit.type === 'system'))
        || (et === 'data' && hit.type === 'data')
        || (et === 'event' && hit.type === 'event')
        || (et === 'gateway' && hit.type === 'gateway')
      if (compatible) { setDropTargetId(hit.id); setDropInvalidId(null) }
      else             { setDropTargetId(null); setDropInvalidId(hit.id) }
    } else {
      setDropTargetId(hit.id)
      setDropInvalidId(null)
    }
  }

  const handleDragLeave = () => { setDropTargetId(null); setDropInvalidId(null) }

  const handleDrop = (e: React.DragEvent<SVGSVGElement>) => {
    e.preventDefault()
    setDropTargetId(null)
    setDropInvalidId(null)
    if (!svgRef.current) return
    const svgPt = clientToSvg(e.clientX, e.clientY, svgRef.current)

    // ── DI widget drop ────────────────────────────────────────────────────────
    const diWidgetId = e.dataTransfer.getData('application/di-widget')
    if (diWidgetId) {
      const diWidgetName = e.dataTransfer.getData('application/di-widget-name') || diWidgetId
      const diWidgetShape = e.dataTransfer.getData('application/di-widget-shape')
      pushHistory(elements, liShapes)
      const hit = hitTestElement(svgPt.x, svgPt.y, elements)
      if (hit && (hit.type === 'task' || hit.type === 'system' || hit.type === 'gateway' || hit.type === 'event' || hit.type === 'data')) {
        // Create LI shape next to the element, linked via dashed connector
        const ID_TO_TYPE2: Record<string, string> = {
          'value': 'Value', 'bar': 'Bar Chart', 'line': 'Line Chart', 'area': 'Area Chart',
          'dual': 'Dual Axis Chart', 'pie': 'Pie Chart', 'treemap': 'Treemap', 'heat': 'Heat Map',
          'sankey': 'Sankey Chart', 'hist': 'Histogram', 'ring': 'Ring Chart', 'cockpit': 'Cockpit',
          'sentiment': 'Sentiment', 'ext': 'Indicator',
        }
        const WIDGET_TYPE_TO_LI_SHAPE2: Record<string, string> = {
          'Value': 'Value', 'Bar Chart': 'Indicator', 'Line Chart': 'Trend', 'Area Chart': 'Trend',
          'Dual Axis Chart': 'Trend', 'Pie Chart': 'Ring Chart', 'Treemap': 'Progress Bar',
          'Heat Map': 'Traffic Light', 'Sankey Chart': 'Trend', 'Histogram': 'Progress Bar',
          'Ring Chart': 'Ring Chart', 'Cockpit': 'Cockpit', 'Sentiment': 'Sentiment', 'Indicator': 'Indicator',
        }
        const EXT_SHAPE_OVERRIDE2: Record<string, string> = {
          'ext-001': 'Indicator', 'ext-002': 'Value', 'ext-003': 'Ring Chart',
          'ext-004': 'Traffic Light', 'ext-005': 'Indicator',
        }
        const WIDGET_STATUS2: Record<string, string> = {
          'value-I-001': 'Green',  'value-I-002': 'Yellow',
          'value-D-001': 'Green',  'value-D-002': 'Red',    'value-D-003': 'Green',
          'value-D-004': 'Yellow', 'value-D-005': 'Green',  'value-D-006': 'Yellow',
          'bar-chart-I-001': 'Green',  'bar-chart-I-002': 'Yellow',
          'bar-chart-D-001': 'Green',  'bar-chart-D-002': 'Red',
          'bar-chart-D-003': 'Yellow', 'bar-chart-D-004': 'Green',
          'line-I-001': 'Green',  'line-I-002': 'Yellow',
          'line-I-003': 'Green',  'line-D-001': 'Green',  'line-D-002': 'Yellow',
          'area-I-001': 'Green',  'area-D-001': 'Yellow',
          'area-D-002': 'Green',  'area-D-003': 'Red',
          'dual-I-001': 'Yellow', 'dual-I-002': 'Green',  'dual-D-001': 'Green', 'dual-D-002': 'Red',
          'pie-D-001': 'Green',  'pie-D-002': 'Yellow', 'pie-D-003': 'Red',
          'treemap-I-001': 'Green',  'treemap-I-002': 'Yellow', 'treemap-I-003': 'Green',
          'ring-I-001': 'Green',  'ring-I-002': 'Yellow', 'ring-I-003': 'Green', 'ring-D-001': 'Red',
          'heat-D-001': 'Red',    'heat-D-002': 'Yellow', 'heat-D-003': 'Green',
          'sankey-I-001': 'Green',  'sankey-I-002': 'Yellow',
          'hist-I-001': 'Yellow', 'hist-I-002': 'Green',
          'cockpit-I-001': 'Green',  'cockpit-I-002': 'Yellow', 'cockpit-D-001': 'Red',
          'sentiment-I-001': 'Green', 'sentiment-I-002': 'Yellow', 'sentiment-D-001': 'Red',
          'ext-001': 'Green',  'ext-002': 'Yellow', 'ext-003': 'Yellow',
          'ext-004': 'Red',    'ext-005': 'Green',
          'rec-val-001': 'Green',  'rec-val-002': 'Yellow', 'rec-val-003': 'Green',
          'rec-val-004': 'Red',    'rec-val-005': 'Green',
          'rec-bar-001': 'Green',  'rec-bar-002': 'Yellow', 'rec-bar-003': 'Green',
          'rec-line-001': 'Yellow', 'rec-pie-001': 'Green',
          'dup-bar-001': 'Green',  'dup-bar-002': 'Yellow', 'dup-bar-003': 'Red',
        }
        const prefix2 = (['rec', 'dup'].includes(diWidgetId.split('-')[0]) ? diWidgetId.split('-')[1] : diWidgetId.split('-')[0])
        const widgetType2 = ID_TO_TYPE2[prefix2] ?? 'Value'
        const shapeType2 = diWidgetShape || (EXT_SHAPE_OVERRIDE2[diWidgetId] ?? WIDGET_TYPE_TO_LI_SHAPE2[widgetType2] ?? 'Indicator')
        const pos = findLiShapePosition(hit, elements, liShapesRef.current, shapeType2)
        const newShape: LiShape = {
          id: `li-${Date.now()}`,
          cx: pos.cx,
          cy: pos.cy,
          shapeType: shapeType2,
          widgetId: diWidgetId,
          widgetName: diWidgetName,
          manualValue: WIDGET_STATUS2[diWidgetId] ?? 'No data',
          linkedBpmnId: hit.id,
          linkedBpmnName: hit.name,
        }
        setLiShapes(ls => [...ls, newShape])
      } else {
        // Create LI shape on empty canvas
        const ID_TO_TYPE: Record<string, string> = {
          'value':      'Value',
          'bar':        'Bar Chart',
          'line':       'Line Chart',
          'area':       'Area Chart',
          'dual':       'Dual Axis Chart',
          'pie':        'Pie Chart',
          'treemap':    'Treemap',
          'heat':       'Heat Map',
          'sankey':     'Sankey Chart',
          'hist':       'Histogram',
          'ring':       'Ring Chart',
          'cockpit':    'Cockpit',
          'sentiment':  'Sentiment',
          'ext':        'Value',
        }
        const EXT_SHAPE_OVERRIDE: Record<string, string> = {
          'ext-001': 'Progress Bar',
          'ext-002': 'Trend',
          'ext-003': 'Ring Chart',
          'ext-004': 'Traffic Light',
          'ext-005': 'Indicator',
        }
        const widgetType = ID_TO_TYPE[diWidgetId.split('-')[0]] ?? 'Value'
        const shapeType = diWidgetShape || (EXT_SHAPE_OVERRIDE[diWidgetId] ?? WIDGET_TYPE_TO_LI_SHAPE[widgetType] ?? 'Indicator')
        const WIDGET_STATUS: Record<string, string> = {
          'value-I-001': 'Green',  'value-I-002': 'Yellow',
          'value-D-001': 'Green',  'value-D-002': 'Red',    'value-D-003': 'Green',
          'value-D-004': 'Yellow', 'value-D-005': 'Green',  'value-D-006': 'Yellow',
          'bar-chart-I-001': 'Green',  'bar-chart-I-002': 'Yellow',
          'bar-chart-D-001': 'Green',  'bar-chart-D-002': 'Red',
          'bar-chart-D-003': 'Yellow', 'bar-chart-D-004': 'Green',
          'bar-chart-D-005': 'Red',    'bar-chart-D-006': 'Yellow',
          'line-I-001': 'Green',  'line-I-002': 'Yellow',
          'line-I-003': 'Green',  'line-I-004': 'Red',    'line-I-005': 'Yellow',
          'area-I-001': 'Green',  'area-D-001': 'Yellow',
          'area-D-002': 'Green',  'area-D-003': 'Red',    'area-D-004': 'Yellow',
          'dual-I-001': 'Yellow', 'dual-I-002': 'Green',  'dual-I-003': 'Red',
          'dual-D-002': 'Red',
          'pie-D-001': 'Green',  'pie-D-002': 'Yellow', 'pie-D-003': 'Red',  'pie-D-004': 'Green',
          'treemap-I-001': 'Green',  'treemap-I-002': 'Yellow',
          'treemap-I-003': 'Green',  'treemap-I-004': 'Red',
          'ring-I-001': 'Green',  'ring-I-002': 'Yellow', 'ring-D-001': 'Red',
          'heat-D-001': 'Red',    'heat-D-002': 'Yellow',
          'heat-D-003': 'Green',  'heat-D-004': 'Red',
          'sankey-I-001': 'Green',  'sankey-I-002': 'Yellow',
          'sankey-I-003': 'Green',  'sankey-I-004': 'Red',
          'hist-I-001': 'Yellow', 'hist-I-002': 'Green',
          'hist-I-003': 'Yellow', 'hist-I-004': 'Red',
          'hist-D-001': 'Green',
          'cockpit-I-001': 'Green',  'cockpit-I-002': 'Yellow', 'cockpit-D-001': 'Red',
          'sentiment-I-001': 'Green', 'sentiment-I-002': 'Yellow', 'sentiment-D-001': 'Red',
          'ext-001': 'Green',  'ext-002': 'Yellow', 'ext-003': 'Yellow',
          'ext-004': 'Red',    'ext-005': 'Green',
          'rec-val-001': 'Green',  'rec-val-002': 'Yellow', 'rec-val-003': 'Green',
          'rec-val-004': 'Red',    'rec-val-005': 'Green',
          'rec-bar-001': 'Green',  'rec-bar-002': 'Yellow', 'rec-bar-003': 'Green',
          'rec-line-001': 'Yellow', 'rec-pie-001': 'Green',
          'dup-bar-001': 'Green',  'dup-bar-002': 'Yellow', 'dup-bar-003': 'Red',
        }
        const prefix = (['rec', 'dup'].includes(diWidgetId.split('-')[0]) ? diWidgetId.split('-')[1] : diWidgetId.split('-')[0])
        const newShape: LiShape = {
          id: `li-${Date.now()}`,
          cx: svgPt.x,
          cy: svgPt.y,
          shapeType,
          widgetId: diWidgetId,
          widgetName: diWidgetName,
          manualValue: WIDGET_STATUS[diWidgetId] ?? 'No data',
        }
        setLiShapes(ls => [...ls, newShape])
      }
      return
    }

    // ── Dictionary item drop ──────────────────────────────────────────────────
    const dictRaw = e.dataTransfer.getData('application/dict-item')
    if (dictRaw) {
      pushHistory(elements, liShapes)
      try {
        const dictItem = JSON.parse(dictRaw)
        const hit = hitTestElement(svgPt.x, svgPt.y, elements)
        if (hit && (hit.type === 'task' || hit.type === 'system' || hit.type === 'gateway' || hit.type === 'event' || hit.type === 'data' || hit.type === 'artifact')) {
          // only allow linking when elementType matches shape type
          const et = dictItem.elementType
          const typeMatch = !et
            || (et === 'task' && (hit.type === 'task'))
            || (et === 'artifact' && (hit.type === 'artifact' || hit.type === 'system'))
            || (et === 'data' && hit.type === 'data')
            || (et === 'event' && hit.type === 'event')
            || (et === 'gateway' && hit.type === 'gateway')
          if (typeMatch) {
            setElements(els => els.map(el => el.id === hit.id
              ? { ...el, linkedDictId: dictItem.id, linkedDictName: dictItem.name }
              : el
            ))
            setToastMsg(`"${dictItem.name}" linked to "${hit.name}"`)
          } else {
            setToastMsg(`Cannot link ${dictItem.type ?? 'this item'} to this element`)
          }
        } else {
          // elementType 우선 사용, 없으면 category로 fallback
          const sub = (dictItem.subCategory ?? '').toLowerCase()
          const cat = dictItem.type ?? ''
          const et = dictItem.elementType ?? ''
          let shapeType = et || 'task'
          let subtype = 'User Task'
          let hw = 50, hh = 40

          if (et === 'artifact' || (!et && (cat === 'IT System' || cat === 'IT Systems'))) {
            shapeType = 'artifact'; subtype = 'ITSystem'; hw = 28.5; hh = 28.5
          } else if (et === 'data' || (!et && cat === 'Documents')) {
            shapeType = 'data'; subtype = 'DataObject'; hw = 40; hh = 40
          } else if (et === 'event' || (!et && cat === 'Events')) {
            shapeType = 'event'; hw = 16; hh = 16
            subtype = sub.includes('start') ? 'Start' : 'End'
          } else if (et === 'gateway' || (!et && cat === 'Gateway')) {
            shapeType = 'gateway'; subtype = 'Exclusive'; hw = 20; hh = 20
          }
          const newId = `el-drop-${Date.now()}`
          setElements(els => [...els, {
            id: newId,
            type: shapeType,
            subtype,
            name: dictItem.name,
            description: '',
            cx: svgPt.x, cy: svgPt.y,
            hw, hh,
            linkedDictId: dictItem.id,
            linkedDictName: dictItem.name,
          }])
          setSelectedId(newId)
        }
      } catch {}
      return
    }

    // ── BPMN shape from MEP ───────────────────────────────────────────────────
    const bpmnRaw = e.dataTransfer.getData('application/bpmn-shape')
    if (bpmnRaw) {
      try {
        const shape = JSON.parse(bpmnRaw)
        const connectorTypeMap: Record<string, string> = {
          'sequence-flow': 'sequence',
          'association-undirected': 'association',
          'association-unidirectional': 'association-uni',
          'association-bidirectional': 'association-bi',
          'message-flow': 'message',
        }
        const connType = connectorTypeMap[shape.type]
        if (connType) {
          pushHistory(elements, liShapes)
          const newId = `el-drop-${Date.now()}`
          setElements(els => [...els, {
            id: newId, type: 'connector' as any, subtype: connType,
            name: shape.title ?? shape.type,
            description: '',
            cx: svgPt.x, cy: svgPt.y,
            hw: 100, hh: 1,
          }])
          setSelectedId(newId)
          return
        }
        const newId = `el-drop-${Date.now()}`
        const type = shape.type === 'start-event' || shape.type === 'end-event' ? 'event'
          : shape.type === 'data-object' || shape.type === 'data-store' || shape.type === 'message' ? 'data'
          : shape.type === 'group' || shape.type === 'text-annotation' || shape.type === 'it-system' || shape.type === 'participant' ? 'artifact'
          : shape.type.endsWith('-gateway') || shape.type === 'xor-gateway' ? 'gateway'
          : shape.type === 'collapsed-subprocess' || shape.type === 'expanded-subprocess' || shape.type === 'collapsed-event-subprocess' || shape.type === 'event-subprocess' ? 'task'
          : shape.type === 'pool-lane' || shape.type === 'collapsed-pool' ? 'pool'
          : shape.type
        const subtype = shape.subtype ?? (shape.type === 'start-event' ? 'Start' : shape.type === 'end-event' ? 'End'
          : shape.type === 'group' ? 'Group' : shape.type === 'text-annotation' ? 'TextAnnotation' : shape.type === 'it-system' ? 'ITSystem' : shape.type === 'participant' ? 'Participant'
          : shape.type === 'pool-lane' ? 'PoolLane' : shape.type === 'collapsed-pool' ? 'CollapsedPool'
          : shape.type)
        const isLarge = subtype === 'ExpandedSubprocess' || subtype === 'EventSubprocess'
        const hw = type === 'task' ? (isLarge ? 100 : 50) : type === 'gateway' ? 20
          : subtype === 'DataObject' ? 40 : subtype === 'DataStore' ? 30.5 : subtype === 'Message' ? 30
          : subtype === 'Group' ? 60 : subtype === 'TextAnnotation' ? 50 : subtype === 'ITSystem' ? 28.5 : subtype === 'Participant' ? 25.5
          : subtype === 'PoolLane' ? 280 : subtype === 'CollapsedPool' ? 235
          : 16
        const hh = type === 'task' ? (isLarge ? 80 : 40) : type === 'gateway' ? 20
          : subtype === 'DataObject' ? 40 : subtype === 'DataStore' ? 30.5 : subtype === 'Message' ? 30
          : subtype === 'Group' ? 45 : subtype === 'TextAnnotation' ? 25 : subtype === 'ITSystem' ? 28.5 : subtype === 'Participant' ? 25.5
          : subtype === 'PoolLane' ? 115 : subtype === 'CollapsedPool' ? 25
          : 16
        const newEl: CanvasElement = {
          id: newId,
          type,
          subtype,
          name: '',
          description: '',
          cx: svgPt.x,
          cy: svgPt.y,
          hw,
          hh,
        }
        setElements(els => [...els, newEl])
        setSelectedId(newId)
        setEditingId(newId)
      } catch {}
    }
  }

  // ── SVG viewBox — based on actual container size ──────────────────────────────

  const scale = 100 / zoom
  const vbW = canvasSize.w * scale
  const vbH = canvasSize.h * scale
  const viewBox = `${panX} ${panY} ${vbW} ${vbH}`

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className={s.canvasPlaceholder}>
      <div className={s.canvasGrid} />

      {/* ── Top-left title bar ──────────────────────────────────────────────── */}
      <div className={s.floatingTopLeft}>
        <Button design="Transparent" icon="slim-arrow-left" tooltip="Back to list" className={s.backBtn} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <SigDomainObject object={assetObjectType as any} size="XS" />
          <SigInlineEdit
            text={editableTitle}
            placeholder="Untitled"
            size="H4"
            readonly
          />
          <Button id="modeler-overflow" icon="slim-arrow-down" design="Transparent" tooltip="More options" className={s.overflowBtn} />
        </div>
        <div className={s.vDivider} />
        <SigChipV2 value="Draft" leadingIcon="write-new-document" design={'indication10' as any} condensed />
        <SigChipV2
          value={SAVE_CHIP[saveState].label}
          leadingIcon={SAVE_CHIP[saveState].icon}
          design={SAVE_CHIP[saveState].design as any}
          condensed
        />
      </div>

      {/* ── Top-right toolbar ───────────────────────────────────────────────── */}
      <div className={s.floatingTopRight} style={{ right: `calc(0.75rem + ${panelOffset}px)` }}>
        <PresenceAvatarGroup users={COLLABORATORS} visible={isCollabCanvas && collaboratorsActive} />

        <button className={s.tbBtn} title="Toggle Side Panel" onClick={onTogglePanel}>
          <svg width="36" height="36" viewBox="0 0 36 36" fill="currentColor"><path d="M12.8125 11C12.0208 11 11.3542 11.2708 10.8125 11.8125C10.2708 12.3542 10 13.0208 10 13.8125V22.1875C10 22.9792 10.2708 23.6458 10.8125 24.1875C11.3542 24.7292 12.0208 25 12.8125 25H23.1875C23.9792 25 24.6458 24.7292 25.1875 24.1875C25.7292 23.6458 26 22.9792 26 22.1875V13.8125C26 13.0208 25.7292 12.3542 25.1875 11.8125C24.6458 11.2708 23.9792 11 23.1875 11H12.8125ZM24.4062 22.1875C24.4062 22.5417 24.2917 22.8333 24.0625 23.0625C23.8333 23.2917 23.5417 23.4062 23.1875 23.4062H22V12.5938H23.1875C23.5417 12.5938 23.8333 12.7083 24.0625 12.9375C24.2917 13.1667 24.4062 13.4583 24.4062 13.8125V22.1875ZM11.5938 13.8125C11.5938 13.4583 11.7083 13.1667 11.9375 12.9375C12.1667 12.7083 12.4583 12.5938 12.8125 12.5938H20.4062V23.4062H12.8125C12.4583 23.4062 12.1667 23.2917 11.9375 23.0625C11.7083 22.8333 11.5938 22.5417 11.5938 22.1875V13.8125Z"/></svg>
        </button>
        <div className={s.vDivider} />
        <SplitButton icon="translate" design="Transparent" className={s.langSplitBtn}>{lang}</SplitButton>
      </div>

      {/* ── Interactive SVG Canvas ──────────────────────────────────────────── */}
      <svg
        ref={svgRef}
        className={`${s.bpmnSvg}${isAiPreview ? ' ai-preview' : ''}`}
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        onMouseDown={handleSvgMouseDown}
        onMouseMove={handleSvgMouseMove}
        onMouseUp={handleSvgMouseUp}
        onMouseLeave={handleSvgMouseUp}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDragEnd={() => { setDropTargetId(null); setDropInvalidId(null) }}
        onDrop={handleDrop}
        style={{ cursor: panState.current ? 'grabbing' : isDragging ? 'grabbing' : 'default' }}
      >
        <defs>
          <marker id="arr-suggest" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0 0L8 4L0 8" fill="none" stroke="#0064d9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
          {/* Sequence flow: filled triangle arrowhead 10x11, 4px rounded */}
          <marker id="arr" markerWidth="10" markerHeight="11" refX="10" refY="5.5" orient="auto">
            <path d="M0 2 Q0 0 2 0.9 L8 4.5 Q10 5.5 8 6.5 L2 10.1 Q0 11 0 9 Z" fill="var(--sapTextColor)" />
          </marker>
          <marker id="arr-blue" markerWidth="10" markerHeight="11" refX="10" refY="5.5" orient="auto">
            <path d="M0 2 Q0 0 2 0.9 L8 4.5 Q10 5.5 8 6.5 L2 10.1 Q0 11 0 9 Z" fill="var(--sapHighlightColor)" />
          </marker>
          {/* Association: open arrowhead */}
          <marker id="arr-open" markerWidth="9" markerHeight="10" refX="9" refY="5" orient="auto">
            <path d="M1 1.5L9 5L1 8.5" fill="none" stroke="var(--sapTextColor)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
          {/* Message flow: open arrowhead */}
          <marker id="arr-msg" markerWidth="9" markerHeight="10" refX="9" refY="5" orient="auto">
            <path d="M1 1.5L9 5L1 8.5" fill="none" stroke="var(--sapTextColor)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
          {/* Sequence flow: filled triangle — blue */}
          {/* Association: open arrowhead — blue */}
          <marker id="arr-open-blue" markerWidth="9" markerHeight="10" refX="9" refY="5" orient="auto">
            <path d="M1 1.5L9 5L1 8.5" fill="none" stroke="var(--sapHighlightColor)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
          {/* Association bidirectional: start arrowhead */}
          <marker id="arr-open-start" markerWidth="9" markerHeight="10" refX="1" refY="5" orient="auto">
            <path d="M9 1.5L1 5L9 8.5" fill="none" stroke="var(--sapTextColor)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
          {/* Association bidirectional: start arrowhead — blue */}
          <marker id="arr-open-start-blue" markerWidth="9" markerHeight="10" refX="1" refY="5" orient="auto">
            <path d="M9 1.5L1 5L9 8.5" fill="none" stroke="var(--sapHighlightColor)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
          <pattern id="dot-grid" x="0" y="0" width="25" height="25" patternUnits="userSpaceOnUse">
            <circle cx="12.5" cy="12.5" r="1.2" fill="#d9d9d9" />
          </pattern>
        </defs>

        {/* Dot grid background */}
        <rect x={panX} y={panY} width={vbW} height={vbH} fill="url(#dot-grid)" />

        {/* BPMN model diagram */}
        {assetId === '5' && (
          <image
            href={bpmnModelImg}
            x={150} y={80}
            width={1123} height={713}
            style={{ pointerEvents: 'none' }}
          />
        )}





        {/* Connections */}
        {CONNECTIONS.map(conn => {
          const pts = getConnectionPoints(conn, geomMap)
          if (!pts) return null
          const t = conn.type ?? 'sequence'
          const stroke = t === 'message' ? '#758ca4' : 'var(--sapTextColor)'
          const dashed = t.startsWith('association') ? '3 4' : t === 'message' ? '8 5' : null
          const AW = t === 'sequence' ? 11 : 10
          const hasEnd = t === 'sequence' || t === 'association-uni' || t === 'association-bi' || t === 'message'
          const hasStart = t === 'association-bi'
          const arrowPath = 'M0 2 Q0 0 2 0.9 L8 4.5 Q10 5.5 8 6.5 L2 10.1 Q0 11 0 9 Z'

          const renderArrowEnd = (x: number, y: number, dir: 'h' | 'v' | 'vu' = 'h') => {
            if (!hasEnd) return null
            if (dir === 'v') {
              if (t === 'sequence') return <path d={arrowPath} transform={`translate(${x + 5.5}, ${y - 10}) rotate(90)`} fill={stroke} />
              return <polyline points={`${x-5},${y-9} ${x},${y} ${x+5},${y-9}`} fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            }
            if (t === 'sequence') return <path d={arrowPath} transform={`translate(${x}, ${y - 5.5})`} fill={stroke} />
            if (t === 'message') return <path d="M0 2 Q0 0 2 0.9 L8 4.5 Q10 5.5 8 6.5 L2 10.1 Q0 11 0 9 Z" fill="white" stroke={stroke} strokeWidth="1.5" transform={`translate(${x}, ${y - 5.5})`} />
            return <polyline points="0,0 7,5.5 0,11" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" transform={`translate(${x}, ${y - 5.5})`} />
          }
          const renderArrowStart = (x: number, y: number) => {
            if (!hasStart) return null
            return <polyline points="7,0 0,5.5 7,11" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" transform={`translate(${x}, ${y - 5.5})`} />
          }

          const r = 8
          const labels: Record<string, string> = {
            'flabel-gateway1-plan': 'Yes', 'flabel-gateway2-offer': 'Yes', 'flabel-gateway3-onboard': 'Yes',
            'flabel-gateway1-reject1': 'No', 'flabel-gateway2-reject2': 'No', 'flabel-gateway3-end3': 'No',
          }

          if (pts.dir === 'h') {
            const lbl = conn.flowLabel ? labels[conn.flowLabel] : undefined
            const mx = (pts.x1 + pts.x2) / 2, my = (pts.y1 + pts.y2) / 2
            // compute angle of the line for arrowhead rotation
            const adx = pts.x2 - pts.x1, ady = pts.y2 - pts.y1
            const angle = Math.atan2(ady, adx) * 180 / Math.PI
            const lineLen = Math.sqrt(adx * adx + ady * ady)
            const x1 = hasStart ? pts.x1 + (adx / lineLen) * AW : pts.x1
            const y1a = hasStart ? pts.y1 + (ady / lineLen) * AW : pts.y1
            const x2 = hasEnd ? pts.x2 - (adx / lineLen) * AW : pts.x2
            const y2a = hasEnd ? pts.y2 - (ady / lineLen) * AW : pts.y2
            return (
              <g key={conn.id}>
                {t === 'message' && <circle cx={pts.x1} cy={pts.y1} r={5} fill="white" stroke={stroke} strokeWidth={1.5} />}
                <line x1={x1} y1={y1a} x2={x2} y2={y2a}
                  stroke={stroke} strokeWidth={1.5} strokeLinecap={dashed ? 'round' : 'butt'}
                  {...(dashed ? { strokeDasharray: dashed } : {})}
                />
                {hasEnd && t === 'sequence' && <path d={arrowPath} transform={`translate(${pts.x2},${pts.y2}) rotate(${angle}) translate(-11,-5.5)`} fill={stroke} />}
                {hasEnd && t !== 'sequence' && t !== 'message' && <polyline points="0,0 7,5.5 0,11" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" transform={`translate(${pts.x2},${pts.y2}) rotate(${angle}) translate(-7,-5.5)`} />}
                {hasEnd && t === 'message' && <path d={arrowPath} fill="white" stroke={stroke} strokeWidth="1.5" transform={`translate(${pts.x2},${pts.y2}) rotate(${angle}) translate(-11,-5.5)`} />}
                {hasStart && <polyline points="7,0 0,5.5 7,11" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" transform={`translate(${pts.x1},${pts.y1}) rotate(${angle + 180}) translate(-7,-5.5)`} />}
              </g>
            )
          } else if (pts.dir === 'v') {
            const lbl = conn.flowLabel ? labels[conn.flowLabel] : undefined
            const mx = pts.x1, my = (pts.y1 + pts.y2) / 2
            // vertical with optional label — may be straight or elbow
            // check if x1 !== x2 (elbow path)
            if (pts.x1 !== pts.x2) {
              const dx = pts.x2 - pts.x1
              const dy = pts.y2 - pts.y1
              const midY = pts.y1 + dy / 2
              const sign = Math.sign(dx)
              const y2adj = hasEnd ? pts.y2 - AW : pts.y2
              const path = `M${pts.x1} ${pts.y1} L${pts.x1} ${midY - r} Q${pts.x1} ${midY} ${pts.x1 + sign * r} ${midY} L${pts.x2 - sign * r} ${midY} Q${pts.x2} ${midY} ${pts.x2} ${midY + r} L${pts.x2} ${y2adj}`
              return (
                <g key={conn.id}>
                  <path d={path} fill="none" stroke={stroke} strokeWidth={1.5} strokeLinecap="butt"
                    {...(dashed ? { strokeDasharray: dashed } : {})}
                  />
                  {hasEnd && t === 'sequence' && <path d={arrowPath} transform={`translate(${pts.x2 + 5.5}, ${pts.y2 - 10}) rotate(90)`} fill={stroke} />}
                  {hasEnd && t !== 'sequence' && <polyline points={`${pts.x2-5},${pts.y2-9} ${pts.x2},${pts.y2} ${pts.x2+5},${pts.y2-9}`} fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />}
                </g>
              )
            }
            const y2adj = hasEnd ? pts.y2 - 10 : pts.y2
            return (
              <g key={conn.id}>
                <line x1={pts.x1} y1={pts.y1} x2={pts.x2} y2={y2adj}
                  stroke={stroke} strokeWidth={1.5} strokeLinecap={dashed ? 'round' : 'butt'}
                  {...(dashed ? { strokeDasharray: dashed } : {})}
                />
                {hasEnd && t === 'sequence' && <path d={arrowPath} transform={`translate(${pts.x2 + 5.5}, ${pts.y2 - 10}) rotate(90)`} fill={stroke} />}
                {hasEnd && t !== 'sequence' && <polyline points={`${pts.x2-5},${pts.y2-9} ${pts.x2},${pts.y2} ${pts.x2+5},${pts.y2-9}`} fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />}
              </g>
            )
          } else {
            // vu: vertical upward — use same angle-based approach
            const adx = pts.x2 - pts.x1, ady = pts.y2 - pts.y1
            const angle = Math.atan2(ady, adx) * 180 / Math.PI
            const lineLen = Math.sqrt(adx * adx + ady * ady)
            const x2 = hasEnd ? pts.x2 - (adx / lineLen) * AW : pts.x2
            const y2a = hasEnd ? pts.y2 - (ady / lineLen) * AW : pts.y2
            return (
              <g key={conn.id}>
                <line x1={pts.x1} y1={pts.y1} x2={x2} y2={y2a}
                  stroke={stroke} strokeWidth={1.5} strokeLinecap={dashed ? 'round' : 'butt'}
                  {...(dashed ? { strokeDasharray: dashed ?? '4 3' } : { strokeDasharray: '4 3' })}
                />
                {hasEnd && t === 'sequence' && <path d={arrowPath} transform={`translate(${pts.x2},${pts.y2}) rotate(${angle}) translate(-11,-5.5)`} fill={stroke} />}
              </g>
            )
          }
        })}

        {/* LI connector lines */}
        {liShapes.map(ls => <LiConnector key={`conn-${ls.id}`} liShape={ls} geomMap={geomMap} />)}

        {/* BPMN elements */}
        {elements.map(el => {
          const selected = selectedIds.has(el.id) && selectedIds.size === 1
          const hovered = el.id === hoveredId && !selected
          const isDropTarget = el.id === dropTargetId || el.id === liDragOverBpmnId
          const isDropInvalid = el.id === dropInvalidId
          const hw = el.hw, hh = el.hh
          const ringW = 2 / (zoom / 100)
          const DOT_R_PX = 4.5
          const DOT_GAP_PX = 16  // fixed screen px gap between element edge and dot center
          const dotR = DOT_R_PX / (zoom / 100)
          const dotOff = DOT_GAP_PX / (zoom / 100)
          // connection points (4 edges) — sit outside the ring
          const connPts = [
            { x: el.cx,                y: el.cy - hh - dotOff },
            { x: el.cx + hw + dotOff,  y: el.cy },
            { x: el.cx,                y: el.cy + hh + dotOff },
            { x: el.cx - hw - dotOff,  y: el.cy },
          ]
          // resize handles (4 corners) — sit exactly on the ring corners
          const rOff = ringW / 2 + 0.5
          const resizeHandles = [
            { x: el.cx - hw - rOff, y: el.cy - hh - rOff },
            { x: el.cx + hw + rOff, y: el.cy - hh - rOff },
            { x: el.cx + hw + rOff, y: el.cy + hh + rOff },
            { x: el.cx - hw - rOff, y: el.cy + hh + rOff },
          ]
          return (
            <g
              key={el.id}
              style={{ cursor: el.type === 'task' || el.type === 'system' || el.type === 'data' || el.type === 'artifact' ? 'grab' : 'pointer' }}
              onMouseEnter={() => setHoveredId(el.id)}
              onMouseLeave={() => setHoveredId(null)}
              onDoubleClick={(e) => {
                e.stopPropagation()
                setEditingId(el.id)
                setSelectedId(el.id)
              }}
            >
              {(isDropTarget || isDropInvalid) && (() => {
                const stroke = isDropInvalid ? 'var(--sapNegativeColor, #bb0000)' : 'var(--sapHighlightColor)'
                const pad = 6
                if (el.type === 'gateway') {
                  const r = el.hw + pad
                  return <polygon points={`${el.cx},${el.cy - r} ${el.cx + r},${el.cy} ${el.cx},${el.cy + r} ${el.cx - r},${el.cy}`} fill="none" stroke={stroke} strokeWidth={2} strokeDasharray="5 4" opacity={0.8} />
                }
                if (el.type === 'event') {
                  return <circle cx={el.cx} cy={el.cy} r={el.hw + pad} fill="none" stroke={stroke} strokeWidth={2} strokeDasharray="5 4" opacity={0.8} />
                }
                if (el.type === 'system' || el.type === 'artifact') {
                  return <circle cx={el.cx} cy={el.cy} r={el.hw + pad} fill="none" stroke={stroke} strokeWidth={2} strokeDasharray="5 4" opacity={0.8} />
                }
                return <rect x={el.cx - el.hw - pad} y={el.cy - el.hh - pad} width={(el.hw + pad) * 2} height={(el.hh + pad) * 2} rx={14} fill="none" stroke={stroke} strokeWidth={2} strokeDasharray="5 4" opacity={0.8} />
              })()}
              {el.type === 'task'    && <TaskShape    el={el} selected={selected} hovered={hovered} ringW={ringW} editing={editingId === el.id} />}
              {el.type === 'gateway' && <GatewayShape el={el} selected={selected} hovered={hovered} ringW={ringW} />}
              {el.type === 'event'   && <EventShape   el={el} selected={selected} hovered={hovered} ringW={ringW} aiPreview={isAiPreview} />}
              {el.type === 'system'  && <SystemShape  el={el} selected={selected} hovered={hovered} ringW={ringW} editing={editingId === el.id} />}
              {el.type === 'data'     && <DataObjectShape el={el} selected={selected} hovered={hovered} ringW={ringW} aiPreview={isAiPreview} />}
              {el.type === 'artifact' && <ArtifactShape   el={el} selected={selected} hovered={hovered} ringW={ringW} editing={editingId === el.id} aiPreview={isAiPreview} />}
              {(el.type as string) === 'pool' && (() => {
                const x = el.cx - el.hw, y = el.cy - el.hh
                const w = el.hw * 2, h = el.hh * 2
                const bc = selected ? 'var(--sapHighlightColor)' : hovered ? 'var(--sapHighlightColor)' : 'var(--sapField_BorderColor, #556b81)'
                const bw = selected || hovered ? ringW : 1
                if (el.subtype === 'CollapsedPool') {
                  return (
                    <g>
                      {hovered && !selected && <rect x={x - ringW/2 - 0.5} y={y - ringW/2 - 0.5} width={w + ringW + 1} height={h + ringW + 1} rx={0} fill="none" stroke="var(--sapHighlightColor)" strokeWidth={ringW} style={{ pointerEvents: 'none' }} />}
                      <rect x={x} y={y} width={w} height={h} rx={12} fill="white" stroke={bc} strokeWidth={bw} />
                      {selected && <rect x={x - 1.5} y={y - 1.5} width={w + 3} height={h + 3} rx={0} fill="none" stroke="var(--sapHighlightColor)" strokeWidth={ringW} />}
                    </g>
                  )
                }
                // PoolLane: outer border rx=12, left caption column ~40px wide
                const capW = 40
                return (
                  <g>
                    {hovered && !selected && <rect x={x - ringW/2 - 0.5} y={y - ringW/2 - 0.5} width={w + ringW + 1} height={h + ringW + 1} rx={0} fill="none" stroke="var(--sapHighlightColor)" strokeWidth={ringW} style={{ pointerEvents: 'none' }} />}
                    <rect x={x} y={y} width={w} height={h} rx={12} fill="white" stroke={bc} strokeWidth={bw} />
                    <line x1={x + capW} y1={y} x2={x + capW} y2={y + h} stroke={bc} strokeWidth={bw} />
                    {selected && <rect x={x - 1.5} y={y - 1.5} width={w + 3} height={h + 3} rx={0} fill="none" stroke="var(--sapHighlightColor)" strokeWidth={ringW} />}
                  </g>
                )
              })()}
              {(el.type as string) === 'connector' && (() => {
                const t = el.subtype ?? 'sequence'
                const active = hovered && !selected
                const stroke = active ? 'var(--sapHighlightColor)' : 'var(--sapTextColor)'
                const x1 = el.cx - el.hw
                const x2 = el.cx + el.hw
                const y = el.cy
                const dashed = t.startsWith('association') ? '3 4' : t === 'message' ? '10 6' : null
                const hasEndArrow = t === 'sequence' || t === 'association-uni' || t === 'association-bi' || t === 'message'
                const hasStartArrow = t === 'association-bi'
                // arrowhead: 9x10, draw separately so line never pokes through
                const arrowPath = 'M0 2 Q0 0 2 0.9 L8 4.5 Q10 5.5 8 6.5 L2 10.1 Q0 11 0 9 Z'
                const AW = 11  // arrowhead width + 1px for round cap overhang
                const lineX2 = hasEndArrow ? x2 - AW : x2
                const lineX1 = hasStartArrow ? x1 + AW : x1
                return (
                  <g>
                    <line x1={lineX1} y1={y} x2={lineX2} y2={y} stroke={stroke} strokeWidth={1.5} strokeLinecap="round"
                      {...(dashed ? { strokeDasharray: dashed } : {})}
                    />
                    {t === 'message' && <circle cx={x1} cy={y} r={5} fill="white" stroke={stroke} strokeWidth={1.5} />}
                    {hasEndArrow && t === 'sequence' && (
                      <path d={arrowPath} transform={`translate(${lineX2}, ${y - 5.5})`} fill={stroke} />
                    )}
                    {hasEndArrow && (t === 'association-uni' || t === 'association-bi') && (
                      <polyline points={`0,0 7,5.5 0,11`} fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                        transform={`translate(${lineX2}, ${y - 5.5})`} />
                    )}
                    {hasEndArrow && t === 'message' && (
                      <path d="M0 2 Q0 0 2 0.9 L8 4.5 Q10 5.5 8 6.5 L2 10.1 Q0 11 0 9 Z" fill="white" stroke={stroke} strokeWidth="1.5"
                        transform={`translate(${lineX2}, ${y - 5.5})`} />
                    )}
                    {hasStartArrow && (
                      <polyline points={`7,0 0,5.5 7,11`} fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                        transform={`translate(${x1}, ${y - 5.5})`} />
                    )}
                    {selected && <>
                      <circle cx={x1 - dotR} cy={y} r={dotR} fill="white" stroke="var(--sapHighlightColor)" strokeWidth={ringW} style={{ pointerEvents: 'none' }} />
                      <circle cx={x2 - dotR / 2} cy={y} r={dotR} fill="white" stroke="var(--sapHighlightColor)" strokeWidth={ringW} style={{ pointerEvents: 'none' }} />
                    </>}
                  </g>
                )
              })()}
              {/* Resize handles on selected — corners: white+blue border (task/system/data/artifact only) */}
              {/* Element name label pill — now rendered separately at the end */}

              {selected && el.type !== 'gateway' && el.type !== 'event' && (el.type as string) !== 'connector' && resizeHandles.map((pt, i) => (
                <circle key={i} cx={pt.x} cy={pt.y} r={dotR}
                  fill="white" stroke="var(--sapHighlightColor)" strokeWidth={ringW}
                  style={{ pointerEvents: 'none' }}
                />
              ))}
              {selected && (el.type as string) !== 'connector' && connPts.map((pt, i) => (
                <circle key={`mid-${i}`} cx={pt.x} cy={pt.y} r={dotR}
                  fill="var(--sapHighlightColor)" stroke="white" strokeWidth={0.5}
                  style={{ pointerEvents: 'none' }}
                />
              ))}
            </g>
          )
        })}

        {/* LI shapes */}

        {liShapes.map(ls => (
          <g key={ls.id}
            style={{ cursor: 'grab' }}
            onMouseDown={e => {
              e.stopPropagation()
              if (!svgRef.current) return
              setSelectedIds(new Set([ls.id]))
              onLiShapeSelect?.(ls)
              dragState.current = { id: ls.id, startX: e.clientX, startY: e.clientY, origCx: ls.cx, origCy: ls.cy }
            }}
            onDoubleClick={e => {
              e.stopPropagation()
              setEditingLiId(ls.id)
              setEditingLiLabel(ls.label ?? ls.widgetName)
            }}
          >
            {selectedIds.has(ls.id) && selectedIds.size === 1 && (() => {
              const sw = 2 / (zoom / 100)
              if (ls.shapeType === 'Value') {
                const MOCK: Record<string, string> = {
                  'value-D-001': '4,218', 'value-D-002': '1,042', 'value-D-003': '892',
                  'value-D-004': '94.2%', 'value-D-005': '3,156', 'value-I-001': '2,847',
                  'value-I-002': '28.5d',
                }
                const label = MOCK[ls.widgetId] ?? '—'
                const w = 22 + label.length * 8
                return <rect x={ls.cx - 28 - 2} y={ls.cy - 10 - 2} width={w + 4} height={24} rx={0} fill="none" stroke="var(--sapHighlightColor)" strokeWidth={sw} style={{ pointerEvents: 'none' }} />
              }
              // icon-based shapes: selection box exactly matches the SVG element bounds
              const SIZE_MAP: Record<string, { hw: number; hh: number }> = {
                'Traffic Light': { hw: 14, hh: 34 },
                'Cockpit':       { hw: 18, hh: 18 },
                'Sentiment':     { hw: 20, hh: 20 },
                'Trend':         { hw: 17, hh: 17 },
                'Ring Chart':    { hw: 17, hh: 17 },
                'Progress Bar':  { hw: 17, hh: 17 },
                'Indicator':     { hw: 16, hh: 16 },
              }
              const dim = SIZE_MAP[ls.shapeType] ?? { hw: 17, hh: 17 }
              return <rect
                x={ls.cx - dim.hw} y={ls.cy - dim.hh}
                width={dim.hw * 2} height={dim.hh * 2}
                rx={0} fill="none"
                stroke="var(--sapHighlightColor)"
                strokeWidth={sw}
                style={{ pointerEvents: 'none' }}
              />
            })()}
            <LiShapeComp shape={ls} editing={editingLiId === ls.id} />
          </g>
        ))}

        {/* Gateway/Event labels — rendered after LI shapes */}
        {/* Flow labels (Yes/No) — also rendered last */}
        {CONNECTIONS.map(conn => {
          const pts = getConnectionPoints(conn, geomMap)
          if (!pts || !conn.flowLabel) return null
          const labels: Record<string, string> = {
            'flabel-gateway1-plan': 'Yes', 'flabel-gateway2-offer': 'Yes', 'flabel-gateway3-onboard': 'Yes',
            'flabel-gateway1-reject1': 'No', 'flabel-gateway2-reject2': 'No', 'flabel-gateway3-end3': 'No',
          }
          const lbl = labels[conn.flowLabel]
          if (!lbl) return null
          const mx = (pts.x1 + pts.x2) / 2, my = (pts.y1 + pts.y2) / 2
          return (
            <g key={`flabel-${conn.id}`} style={{ pointerEvents: 'none' }}>
              <rect x={mx - 14} y={my - 10} width={lbl.length > 2 ? 30 : 27} height={20} rx={7} fill={isAiPreview ? '#e8f3ff' : '#f5f6f7'} stroke={isAiPreview ? 'var(--sapHighlightColor)' : '#758ca4'} strokeWidth={1} />
              <text x={mx} y={my + 4} fontSize={11} fill={isAiPreview ? 'var(--sapHighlightColor)' : '#556b82'} textAnchor="middle" fontFamily="'72',Arial,sans-serif">{lbl}</text>
            </g>
          )
        })}
        {elements.filter(el => (el.type === 'event' || el.type === 'gateway') && el.name).map(el => {
          const words = el.name.split(' ')
          const multiLine = words.length > 2
          const mid = Math.ceil(words.length / 2)
          const line1 = multiLine ? words.slice(0, mid).join(' ') : el.name
          const line2 = multiLine ? words.slice(mid).join(' ') : null
          const charW = 6.2
          const pad = 16
          const w = Math.max(line1.length, line2?.length ?? 0) * charW + pad
          const h = multiLine ? 32 : 20
          const pillY = el.cy + el.hh + 8
          return (
            <g key={`label-${el.id}`} style={{ pointerEvents: 'none' }}>
              <rect x={el.cx - w / 2} y={pillY} width={w} height={h} rx={8} fill={isAiPreview ? '#e8f3ff' : '#f5f6f7'} />
              {multiLine ? <>
                <text x={el.cx} y={pillY + 13} fill="var(--sapTextColor)" fontSize={11} textAnchor="middle" fontFamily="'72',Arial,sans-serif">{line1}</text>
                <text x={el.cx} y={pillY + 26} fill="var(--sapTextColor)" fontSize={11} textAnchor="middle" fontFamily="'72',Arial,sans-serif">{line2}</text>
              </> : <text x={el.cx} y={pillY + 14} fill="var(--sapTextColor)" fontSize={11} textAnchor="middle" fontFamily="'72',Arial,sans-serif">{el.name}</text>}
            </g>
          )
        })}

        {/* Guidance lines while dragging */}
        {isDragging && dragState.current && (() => {
          const dragged = elements.find(e => e.id === dragState.current!.id)
          if (!dragged) return null
          const others = elements.filter(e => e.id !== dragged.id)
          const lines: React.ReactNode[] = []
          const SNAP = 4
          others.forEach(o => {
            if (Math.abs(o.cx - dragged.cx) < SNAP) {
              lines.push(<line key={`vx-${o.id}`} x1={dragged.cx} y1={Math.min(o.cy, dragged.cy) - 40} x2={dragged.cx} y2={Math.max(o.cy, dragged.cy) + 40} stroke="#0064d9" strokeWidth={0.8} strokeDasharray="4 3" opacity={0.7} style={{ pointerEvents: 'none' }} />)
            }
            if (Math.abs(o.cy - dragged.cy) < SNAP) {
              lines.push(<line key={`hy-${o.id}`} x1={Math.min(o.cx, dragged.cx) - 40} y1={dragged.cy} x2={Math.max(o.cx, dragged.cx) + 40} y2={dragged.cy} stroke="#0064d9" strokeWidth={0.8} strokeDasharray="4 3" opacity={0.7} style={{ pointerEvents: 'none' }} />)
            }
          })
          return lines
        })()}

        {/* Group selection bounding box */}
        {selectedIds.size > 1 && (() => {
          const pad = 1 / (zoom / 100)
          let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
          elementsRef.current.forEach(el => {
            if (!selectedIds.has(el.id)) return
            minX = Math.min(minX, el.cx - el.hw)
            maxX = Math.max(maxX, el.cx + el.hw)
            minY = Math.min(minY, el.cy - el.hh)
            maxY = Math.max(maxY, el.cy + el.hh)
          })
          liShapesRef.current.forEach(ls => {
            if (!selectedIds.has(ls.id)) return
            const r = 17
            minX = Math.min(minX, ls.cx - r); maxX = Math.max(maxX, ls.cx + r)
            minY = Math.min(minY, ls.cy - r); maxY = Math.max(maxY, ls.cy + r)
          })
          if (!isFinite(minX)) return null
          const x = minX - pad, y = minY - pad
          const w = (maxX - minX) + pad * 2, h = (maxY - minY) + pad * 2
          const dr = 4 / (zoom / 100)
          const fontSize = 12 / (zoom / 100)
          const corners: [number, number][] = [[x, y], [x + w, y], [x, y + h], [x + w, y + h]]
          return (
            <g style={{ pointerEvents: 'none' }}>
              <rect x={x} y={y} width={w} height={h} fill="var(--sapHighlightColor)" fillOpacity={0.05} stroke="var(--sapHighlightColor)" strokeWidth={2 / (zoom / 100)} />
              {corners.map(([cx, cy], i) => (
                <circle key={i} cx={cx} cy={cy} r={dr} fill="white" stroke="var(--sapHighlightColor)" strokeWidth={2 / (zoom / 100)} />
              ))}
            </g>
          )
        })()}

        {/* Rubber-band selection rect */}
        {rubberBand && (() => {
          const x = Math.min(rubberBand.x1, rubberBand.x2)
          const y = Math.min(rubberBand.y1, rubberBand.y2)
          const w = Math.abs(rubberBand.x2 - rubberBand.x1)
          const h = Math.abs(rubberBand.y2 - rubberBand.y1)
          return <rect x={x} y={y} width={w} height={h} fill="var(--sapHighlightColor)" fillOpacity={0.08} stroke="var(--sapHighlightColor)" strokeWidth={1 / (zoom / 100)} strokeDasharray={`${4 / (zoom / 100)} ${3 / (zoom / 100)}`} style={{ pointerEvents: 'none' }} />
        })()}

        {/* Click on background to deselect */}
      </svg>

      {/* ── Collaborative cursors — HTML overlay, zoom-independent ───────── */}
      <CollaborativeCursors
        collaborators={COLLABORATORS}
        canvasEl={svgRef.current}
        active={isCollabCanvas && collaboratorsActive}
        zoom={zoom}
        panX={panX}
        panY={panY}
      />

      {/* Inline text editor — absolute positioned over canvas */}
      {editingId && (() => {
        const el = elements.find(e => e.id === editingId)
        if (!el) return null
        const isBelow = el.type === 'gateway' || el.type === 'event' || el.type === 'system' || el.type === 'data' || el.type === 'artifact'
        const charW = 6.2, pad = 24
        const dynW = Math.max(el.name.length * charW + pad, 80)
        const inputH = isBelow ? 20 : el.hh * 2
        const svgX = isBelow ? el.cx - dynW / 2 : el.cx - el.hw
        const svgY = isBelow ? el.cy + el.hh + 6 : el.cy - el.hh
        const svgW = isBelow ? dynW : el.hw * 2
        const svgH = inputH
        const s2p = (v: number, base: number) => (v - base) * (zoom / 100)
        const px = s2p(svgX, panX)
        const py = s2p(svgY, panY)
        const pw = svgW * (zoom / 100)
        const ph = svgH * (zoom / 100)
        return (
          <div style={{
            position: 'absolute', left: px, top: py, width: pw, height: ph,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'all', zIndex: 20,
          }}>
            <input
              autoFocus
              defaultValue={el.name}
              onChange={e => {
                setSuggestionQuery(e.target.value)
                setSuggestionPos({ x: px, y: py + ph })
              }}
              onBlur={e => {
                if (suppressSuggestionClose.current || suggestionMenuOpen.current) {
                  suppressSuggestionClose.current = false
                  ;(e.target as HTMLInputElement).focus()
                  return
                }
                setElements(els => els.map(el2 => el2.id === el.id ? { ...el2, name: e.target.value } : el2))
                setEditingId(null)
                setSuggestionQuery('')
                setSuggestionPos(null)
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === 'Escape') {
                  if (e.key === 'Enter') setElements(els => els.map(el2 => el2.id === el.id ? { ...el2, name: (e.target as HTMLInputElement).value } : el2))
                  setEditingId(null)
                  setSuggestionQuery('')
                  setSuggestionPos(null)
                  e.stopPropagation()
                }
              }}
              style={{
                width: '100%', height: '100%', padding: `0 ${6 * (zoom / 100)}px`,
                border: '2px solid var(--sapField_Focus_BorderColor)',
                borderRadius: '0.25rem',
                outline: 'none',
                background: 'var(--sapField_Hover_Background)',
                boxSizing: 'border-box',
                textAlign: 'center', fontSize: `${12 * (zoom / 100)}px`,
                fontFamily: "'72',Arial,sans-serif", color: 'var(--sapTextColor)', fontWeight: 400,
              }}
            />
          </div>
        )
      })()}

      {suggestionPos && suggestionQuery.length > 0 && (() => {
        const POPUP_W = 340
        const containerW = (svgRef.current?.closest('[style*="position"]') as HTMLElement)?.offsetWidth ?? window.innerWidth
        const rightEdge = containerW - (panelOffset ?? 0) - 8
        const clampedX = Math.min(suggestionPos.x, rightEdge - POPUP_W)
        return (
          <DictionarySuggestionPopup
            query={suggestionQuery}
            x={clampedX}
            y={suggestionPos.y}
            elementType={editingId ? elements.find(e => e.id === editingId)?.type : undefined}
            onViewDetails={(dictId) => {
              const dictItem = dictionaryItems.find(d => d.id === dictId)
              if (dictItem) {
                onDictItemSelect?.({
                  id: dictItem.id,
                  name: dictItem.name,
                  category: dictItem.type,
                  subCategory: dictItem.subCategory,
                  description: dictItem.description,
                  lastUpdated: dictItem.lastUpdated,
                })
              }
            }}
            onMenuOpenChange={(open) => { suggestionMenuOpen.current = open }}
          onSelect={(dictId) => {
            const dictItem = dictionaryItems.find(d => d.id === dictId)
            if (dictItem && editingId) {
              setElements(els => els.map(el2 => el2.id === editingId
                ? { ...el2, name: dictItem.name, linkedDictId: dictId, linkedDictName: dictItem.name }
                : el2
              ))
              setToastMsg(`"${dictItem.name}" linked`)
            }
            setEditingId(null)
            setSuggestionQuery('')
            setSuggestionPos(null)
          }}
          onCreateNew={() => {
            setSuggestionQuery('')
            setSuggestionPos(null)
          }}
          onExploreMore={(q) => {
            setSuggestionQuery('')
            setSuggestionPos(null)
            setEditingId(null)
            onExploreDict?.(q)
          }}
          onClose={() => {
            setSuggestionQuery('')
            setSuggestionPos(null)
          }}
        />
        )
      })()}

      {editingLiId && (() => {
        const ls = liShapes.find(s => s.id === editingLiId)
        if (!ls) return null
        const LABEL_OFFSET: Record<string, number> = {
          'Indicator':    34,
          'Traffic Light':52,
          'Cockpit':      36,
          'Value':        20,
          'Trend':        35,
          'Progress Bar': 35,
          'Ring Chart':   35,
          'Sentiment':    41,
        }
        const labelOffsetY = LABEL_OFFSET[ls.shapeType] ?? 23
        const charW = 6.2, pad = 24
        const dynW = Math.max(editingLiLabel.length * charW + pad, 80)
        const inputH = 20
        const svgX = ls.cx - dynW / 2
        const svgY = ls.cy + labelOffsetY - inputH / 2
        const s2p = (v: number, base: number) => (v - base) * (zoom / 100)
        const px = s2p(svgX, panX)
        const py = s2p(svgY, panY)
        const pw = dynW * (zoom / 100)
        const ph = inputH * (zoom / 100)
        return (
          <div style={{ position: 'absolute', left: px, top: py, width: pw, height: ph, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'all', zIndex: 20 }}>
            <input
              autoFocus
              value={editingLiLabel}
              onChange={e => setEditingLiLabel(e.target.value)}
              onBlur={() => {
                setLiShapes(ls2 => ls2.map(s => s.id === editingLiId ? { ...s, label: editingLiLabel } : s))
                setEditingLiId(null)
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  setLiShapes(ls2 => ls2.map(s => s.id === editingLiId ? { ...s, label: editingLiLabel } : s))
                  setEditingLiId(null)
                } else if (e.key === 'Escape') {
                  setEditingLiId(null)
                }
              }}
              style={{
                width: '100%', height: '100%', padding: `0 ${6 * (zoom / 100)}px`,
                border: '2px solid var(--sapField_Focus_BorderColor)',
                borderRadius: '0.25rem', outline: 'none',
                background: 'var(--sapField_Hover_Background)',
                boxSizing: 'border-box', textAlign: 'center',
                fontSize: `${11 * (zoom / 100)}px`,
                fontFamily: "'72',Arial,sans-serif", color: 'var(--sapTextColor)', fontWeight: 400,
              }}
            />
          </div>
        )
      })()}

      {/* ── Left action panel ────────────────────────────────────────────────── */}
      <div className={s.leftToolbar}>
        <Button design="Transparent" icon="ai" tooltip="AI Assistant" style={{ width: '2.25rem', height: '2.25rem', padding: 0 }} />
        <Button design="Transparent" icon="SAP-icons-v4/graph-unspecified" tooltip="Elements"
          style={{ width: '2.25rem', height: '2.25rem', padding: 0 }}
        />
        <Button design="Transparent" icon="course-book" tooltip="Dictionary"
          style={{ width: '2.25rem', height: '2.25rem', padding: 0 }}
        />
        <Button design="Transparent" icon="SAP-icons-v4/source-data" tooltip="Data"
          style={{ width: '2.25rem', height: '2.25rem', padding: 0 }}
          onClick={() => onToggleData?.()}
        />
        <div className={s.hDivider} />
        <Button design="Transparent" icon="undo" tooltip="Undo" disabled={history.length === 0} style={{ width: '2.25rem', height: '2.25rem', padding: 0 }} onClick={handleUndo} />
        <Button design="Transparent" icon="redo" tooltip="Redo" disabled={future.length === 0} style={{ width: '2.25rem', height: '2.25rem', padding: 0 }} onClick={handleRedo} />
      </div>

      {/* ── Zoom controls ────────────────────────────────────────────────────── */}
      <div className={s.zoomControls} style={{ right: `calc(1rem + ${panelOffset}px)` }}>
        <Button icon="full-screen" design="Transparent" tooltip="Full screen" className={s.zoomBtn}
          onClick={() => {
            const el = svgRef.current?.parentElement?.parentElement as HTMLElement
            if (el) { if (!document.fullscreenElement) el.requestFullscreen?.() ; else document.exitFullscreen?.() }
          }}
        />
        <Button icon="SAP-icons-v4/zoom-fit" design="Transparent" tooltip="Fit to screen" className={s.zoomBtn} onClick={zoomFit} />
        <Button icon="less" design="Transparent" tooltip="Zoom out" className={s.zoomBtn} onClick={zoomOut} />
        <Button
          id="zoom-percent-btn"
          design="Transparent"
          className={s.zoomPercent}
          onClick={() => {
            if (zoomMenuRef.current) {
              if (zoomMenuRef.current.open) {
                zoomMenuRef.current.open = false
              } else {
                zoomMenuRef.current.opener = 'zoom-percent-btn'
                zoomMenuRef.current.open = true
              }
            }
          }}
        >{zoom}%</Button>
        <Button icon="add" design="Transparent" tooltip="Zoom in" className={s.zoomBtn} onClick={zoomIn} />
      </div>

      {dictOpen && <DictionaryPanel onClose={onToggleDict} onItemSelect={(item) => onDictItemSelect?.(item)} initialQuery={dictInitialQuery} />}

      {/* ── AI preview floating bar ── */}
      {isAiPreview && (
        <div style={{
          position: 'absolute', bottom: '5.5rem', left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
          background: 'var(--sapPageFooter_Background, #fff)',
          borderRadius: '0.5rem',
          boxShadow: '0 0 0 1px rgba(34,53,72,0.48), 0 2px 8px rgba(34,53,72,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.25rem 0.75rem 0.25rem 1rem',
          gap: '1.5rem',
          whiteSpace: 'nowrap',
          maxWidth: 'calc(100vw - 4rem)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icon name="ai" style={{ width: '1.25rem', height: '1.25rem', color: 'var(--sapHighlightColor)', flexShrink: 0 } as React.CSSProperties} />
            <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)' }}>
              This process was created by AI from your text input.
            </Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            <Button design="Emphasized" onClick={() => setIsAiPreview(false)}>Accept</Button>
            <Button design="Default" onClick={() => { setElements([]); setIsAiPreview(false); setOverlayDismissed(false) }}>Decline</Button>
          </div>
        </div>
      )}

      {/* ── New diagram empty state overlay ── */}
      {assetId === 'new' && elements.length === 0 && !overlayDismissed && (
        <NewDiagramOverlay
          onGenerate={() => {
            pushHistory(elements, liShapes)
            const newEls = buildInitialElements()
            elementsRef.current = newEls
            setElements(newEls)
            setIsAiPreview(true)
            setTimeout(() => zoomFit(), 50)
          }}
          onDismiss={() => setOverlayDismissed(true)}
        />
      )}
      {toastMsg && (
        <Toast open placement="BottomCenter" onClose={() => setToastMsg(null)}>
          {toastMsg}
        </Toast>
      )}

      {/* ── Dictionary link popups ── */}
      {dictPopup && (() => {
        const el = elements.find(e => e.id === dictPopup.elId)
        if (!el) return null
        if (el.linkedDictId) {
          return (
            <LinkedDictPopup
              dictId={el.linkedDictId}
              elementName={el.name}
              anchorRect={dictPopup.rect}
              onClose={() => setDictPopup(null)}
              onLink={(dictId) => {
                pushHistory(elements, liShapes)
                setElements(els => els.map(e => e.id === el.id ? { ...e, linkedDictId: dictId } : e))
                setToastMsg(`Replaced with "${getDictName(dictId)}"`)
              }}
              onUnlink={() => {
                pushHistory(elements, liShapes)
                setElements(els => els.map(e => e.id === el.id ? { ...e, linkedDictId: undefined, linkedDictName: undefined } : e))
                setDictPopup(null)
                setToastMsg(`Unlinked "${el.name}" from Dictionary`)
              }}
              onViewDetails={() => {
                setDictPopup(null)
                onOpenDictPanel?.()
              }}
            />
          )
        } else {
          return (
            <UnlinkedDictPopup
              elementName={el.name}
              anchorRect={dictPopup.rect}
              onClose={() => setDictPopup(null)}
              onLink={(dictId) => {
                pushHistory(elements, liShapes)
                setElements(els => els.map(e => e.id === el.id ? { ...e, linkedDictId: dictId } : e))
                setToastMsg(`Linked to "${getDictName(dictId)}"`)
              }}
              onCreateDictItem={() => {
                setDictPopup(null)
                onDictItemSelect?.({ __createNew: true, elementName: el.name, elementId: el.id } as any)
              }}
              onViewDetails={(dictId) => {
                const d = DICT_DATA[dictId]
                onDictItemSelect?.({
                  id: dictId,
                  name: d?.name ?? getDictName(dictId),
                  category: d?.category ?? 'Activities',
                  subCategory: d?.subCategory,
                  description: d?.description ?? '',
                  lastUpdated: '',
                })
              }}
            />
          )
        }
      })()}

      {/* ── Shape context menu ───────────────────────────────────────────────── */}
      {(() => {
        if (selectedIds.size !== 1 || isDragging) return null
        const id = [...selectedIds][0]
        const el = elements.find(e => e.id === id)
        if (!el || (el.type !== 'task' && el.type !== 'system' && el.type !== 'gateway' && el.type !== 'event' && el.type !== 'data' && el.type !== 'artifact')) return null
        const svgRect = svgRef.current?.getBoundingClientRect()
        if (!svgRect) return null
        const DOT_GAP_PX = 16
        const elTopPx = svgRect.top + (el.cy - el.hh - panY) / scale
        const menuBottomPx = elTopPx - 2 * DOT_GAP_PX
        const centerPx = svgRect.left + (el.cx - panX) / scale
        const btnStyle: React.CSSProperties = { width: '2.25rem', height: '2.25rem', color: 'var(--sapTextColor)', '--_ui5_button_base_min_width': '2.25rem' } as React.CSSProperties
        const sep = <div style={{ width: 1, height: '1.125rem', background: 'var(--sapNeutralBorderColor)', flexShrink: 0, margin: '0 0.125rem' }} />
        return createPortal(
          <div
            style={{
              position: 'fixed',
              left: centerPx,
              top: menuBottomPx,
              transform: 'translateX(-50%) translateY(-100%)',
              zIndex: 8,
              background: 'var(--sapBaseColor, #fff)',
              border: '1px solid var(--sapNeutralBorderColor, #d9d9d9)',
              borderRadius: '0.75rem',
              boxShadow: '0 2px 8px rgba(34,53,72,0.15)',
              padding: '0.25rem 0.375rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.125rem',
              pointerEvents: 'auto',
            }}
            onMouseDown={e => e.stopPropagation()}
          >
            <Button design="Transparent" icon="SAP-icons-v4/task-activity" tooltip="Shape type" style={btnStyle} />
            {sep}
            <div style={{ position: 'relative' }}>
              <button
                ref={(btn) => {
                  if (btn && fontSizeMenuOpen) {
                    const r = btn.getBoundingClientRect()
                    ;(btn as any)._rect = r
                  }
                }}
                id="font-size-btn"
                onClick={(e) => {
                  setFontSizeMenuOpen(v => !v)
                  ;(e.currentTarget as any)._rect = e.currentTarget.getBoundingClientRect()
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.25rem',
                  padding: '0 0.5rem', height: '2.25rem', cursor: 'pointer',
                  background: fontSizeMenuOpen ? 'var(--sapButton_Selected_Background, #dbeafe)' : 'none',
                  border: fontSizeMenuOpen ? '1px solid var(--sapHighlightColor)' : '1px solid transparent',
                  borderRadius: '0.375rem',
                  fontFamily: 'var(--sapFontFamily)',
                }}
                onMouseEnter={e => { if (!fontSizeMenuOpen) e.currentTarget.style.background = 'var(--sapButton_Lite_Hover_Background, #e8f3ff)' }}
                onMouseLeave={e => { if (!fontSizeMenuOpen) e.currentTarget.style.background = 'none' }}
              >
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--sapTextColor)', lineHeight: 1, minWidth: '1.5rem', textAlign: 'center' }}>{selectedFontSize}</span>
                <Icon name="expand" style={{ width: '0.875rem', height: '0.875rem', color: 'var(--sapTextColor)' } as React.CSSProperties} />
              </button>
              {fontSizeMenuOpen && (() => {
                const SIZES = [8, 10, 12, 14, 16, 18, 24, 32, 36, 48, 64, 72]
                const ITEM_H = 32
                const btn = document.getElementById('font-size-btn')
                const r = btn?.getBoundingClientRect()
                if (!r) return null
                const selectedIdx = SIZES.indexOf(selectedFontSize)
                return createPortal(
                  <div
                    ref={(el) => { if (el) el.scrollTop = Math.max(0, selectedIdx * ITEM_H - ITEM_H * 3) }}
                    style={{
                      position: 'fixed',
                      left: r.left + r.width / 2,
                      top: r.bottom,
                      transform: 'translateX(-50%)',
                      zIndex: 10000,
                      background: 'var(--sapBaseColor, #fff)',
                      border: '1px solid var(--sapNeutralBorderColor)',
                      borderRadius: '0.5rem',
                      boxShadow: '0 4px 12px rgba(34,53,72,0.18)',
                      overflow: 'auto',
                      minWidth: '4rem',
                      maxHeight: `${ITEM_H * 7}px`,
                    }}
                    onMouseDown={e => e.stopPropagation()}
                  >
                    {SIZES.map(size => (
                      <div
                        key={size}
                        onClick={() => { setSelectedFontSize(size); setFontSizeMenuOpen(false) }}
                        style={{
                          padding: '0 1rem',
                          height: ITEM_H,
                          lineHeight: `${ITEM_H}px`,
                          fontSize: '0.875rem',
                          fontWeight: size === selectedFontSize ? 700 : 400,
                          color: size === selectedFontSize ? 'var(--sapHighlightColor)' : 'var(--sapTextColor)',
                          background: size === selectedFontSize ? 'var(--sapList_SelectionBackgroundColor, #dbeafe)' : 'none',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          fontFamily: 'var(--sapFontFamily)',
                        }}
                        onMouseEnter={e => { if (size !== selectedFontSize) (e.currentTarget as HTMLElement).style.background = 'var(--sapList_Hover_Background)' }}
                        onMouseLeave={e => { if (size !== selectedFontSize) (e.currentTarget as HTMLElement).style.background = 'none' }}
                      >
                        {size}
                      </div>
                    ))}
                  </div>,
                  document.body
                )
              })()}
            </div>
            <Button design="Transparent" icon="text-formatting" tooltip="Text formatting" style={btnStyle} />
            <Button design="Transparent" icon="text-align-center" tooltip="Text alignment" style={btnStyle} />
            {sep}
            <Button design="Transparent" icon="text-color" tooltip="Text color" style={btnStyle} />
            <Button design="Transparent" icon="border" tooltip="Shape border" style={btnStyle} />
            <Button design="Transparent" icon="color-fill" tooltip="Color fill" style={btnStyle} />
            {sep}
            <Button design="Transparent" icon="SAP-icons-v4/align-left" tooltip="Align" style={btnStyle} />
            {sep}
            <Button design="Transparent" icon="overflow" tooltip="More" style={btnStyle} />
          </div>,
          document.body
        )
      })()}

      {createPortal(
        <Menu ref={overflowMenuRef}>
          <MenuItem text="Save Revision" />
          <MenuSeparator />
          <MenuItem text="Export as" />
          <MenuSeparator />
          <MenuItem text="Rename" /><MenuItem text="Move" /><MenuItem text="Delete" />
        </Menu>,
        document.body
      )}
      {createPortal(
        <Menu ref={zoomMenuRef} opener="zoom-percent-btn" horizontalAlign="Center" onItemClick={(e: any) => {
          const txt = e.detail?.text ?? ''
          const match = txt.match(/(\d+)%/)
          if (match) zoomAtCenter(parseInt(match[1]))
        }}>
          <MenuItem text="Zoom to 25%" />
          <MenuItem text="Zoom to 50%" />
          <MenuItem text="Zoom to 100%" />
          <MenuItem text="Zoom to 150%" />
          <MenuItem text="Zoom to 200%" />
          <MenuItem text="Zoom to 400%" />
        </Menu>,
        document.body
      )}
      {createPortal(
        <Menu ref={modeMenuRef} onItemClick={(e: any) => setMode(e.detail?.text ?? mode)}>
          <MenuItem text="Edit" /><MenuItem text="View" />
        </Menu>,
        document.body
      )}
      <Dialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        headerText="Share with others to collaborate"
        style={{ width: '480px' }}
        footer={
          <Bar endContent={
            <Button design="Transparent" onClick={() => setShareOpen(false)}>Cancel</Button>
          } />
        }
      >
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontSize)' }}>Copy &amp; share this model link</Text>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Input
              value="https://processmanager.com/model/xyz..."
              readonly
              style={{ flex: 1 }}
            />
            <Button
              design="Emphasized"
              icon="chain-link"
              onClick={() => {
                navigator.clipboard?.writeText('https://processmanager.com/model/xyz...')
                setShareOpen(false)
                setToastOpen(true)
              }}
            >Copy Link</Button>
          </div>
          <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>
            Users with Modelling License can Edit. Everyone else can view only
          </Text>
        </div>
      </Dialog>
      <Toast open={toastOpen} placement="BottomCenter" onClose={() => setToastOpen(false)}>Link copied</Toast>
    </div>
  )
}

// ── ModelerApp ─────────────────────────────────────────────────────────────────

export default function ModelerApp({ assetId, onTogglePanel, onElementSelect, onLiShapeSelect, onLiShapeUpdate, onRegisterLiShapeUpdater, onRegisterAddLiShape, onSelectElementById, onRegisterSelectLiShapeById, onRegisterLinkDictToElement, onLiShapesChange, onWidgetSelect, onOpenDictPanel, onDictItemSelect, onAddBrowseWidget, panelOffset = 0 }: Props) {
  const navigate = useNavigate()
  const [dictOpen, setDictOpen] = useState(false)
  const [dictInitialQuery, setDictInitialQuery] = useState('')
  const [dataOpen, setDataOpen] = useState(false)
  const [shapesOpen, setShapesOpen] = useState(false)
  const [moreElementsOpen, setMoreElementsOpen] = useState(false)

  const toggleDict = () => { setDictOpen(v => !v); setDataOpen(false); setShapesOpen(false); setMoreElementsOpen(false) }
  const toggleData = () => { setDataOpen(v => !v); setDictOpen(false); setShapesOpen(false); setMoreElementsOpen(false) }
  const toggleShapes = () => { setShapesOpen(v => !v); setMoreElementsOpen(false); setDictOpen(false); setDataOpen(false) }

  const assetName = getAssetName(assetId)

  const assetObjectType = 'Process Model'

  return (
    <div className={s.root}>
      <BpmnCanvas
        assetName={assetName}
        assetObjectType={assetObjectType}
        assetId={assetId}
        onClose={() => navigate('/modeler')}
        dictOpen={dictOpen}
        onToggleDict={toggleDict}
        dictInitialQuery={dictInitialQuery}
        onTogglePanel={onTogglePanel}
        onToggleData={toggleData}
        shapesOpen={shapesOpen}
        onToggleShapes={toggleShapes}
        onElementSelect={onElementSelect}
        onLiShapeSelect={onLiShapeSelect}
        onLiShapeUpdate={onLiShapeUpdate}
        onRegisterLiShapeUpdater={onRegisterLiShapeUpdater}
        onRegisterAddLiShape={onRegisterAddLiShape}
        onRegisterSelectLiShapeById={onRegisterSelectLiShapeById}
        onRegisterLinkDictToElement={onRegisterLinkDictToElement}
        onSelectElementById={onSelectElementById}
        onLiShapesChange={onLiShapesChange}
        onOpenDictPanel={onOpenDictPanel}
        onExploreDict={(q) => { setDictInitialQuery(q); setDictOpen(true) }}
        onDictItemSelect={onDictItemSelect}
        onAddBrowseWidget={onAddBrowseWidget}
        panelOffset={panelOffset}
      />
      {dataOpen && <DataPanel onClose={() => setDataOpen(false)} onWidgetSelect={onWidgetSelect} onAddFromBrowse={onAddBrowseWidget} />}
    </div>
  )
}
