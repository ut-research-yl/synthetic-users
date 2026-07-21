import React, { useCallback, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button, Icon, Input, TextArea, Text, Title, Tag, Avatar, Menu, MenuItem, MenuSeparator } from '@ui5/webcomponents-react'
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts'
import { useNavigate } from 'react-router-dom'
import { SigChipV2, SigDomainObject } from '@signavio/sap-signavio-uixtension'
import {
  INITIAL_PHASES, INITIAL_LANES, INITIAL_STEPS, PHASE_PALETTE,
  type Phase, type Lane, type JourneyStep, type StepStatus, type MetricValue, type ProcessLink, type ContentItem, type PainPointMeta,
} from '../data/journeyData'
import s from './JourneyModelerApp.module.css'

// ── Constants ─────────────────────────────────────────────────────────────────

const LANE_COLOR: Record<string, string> = {
  'ln-stages':      '#6366f1',
  'ln-actions':     '#1a7adf',
  'ln-touchpoints': '#7c3aed',
  'ln-emotions':    '#0891b2',
  'ln-metrics':     '#0891b2',
  'ln-process':     '#0d9488',
  'ln-content':     '#d97706',
  'ln-painpoints':  '#dc2626',
  'ln-opportun':    '#059669',
}

const STATUS_COLOR: Record<StepStatus, string> = {
  'none':        'transparent',
  'in-progress': '#f59e0b',
  'done':        '#10b981',
  'blocked':     '#ef4444',
}

const SENTIMENT_EMOJI: Record<number, string> = {
  [-2]: '😞', [-1]: '😟', [0]: '😐', [1]: '😊', [2]: '😄',
}

const LANE_TYPES = [
  { id: 'ln-actions',     label: 'Customer Actions', type: 'default' as const },
  { id: 'ln-touchpoints', label: 'Touchpoints',      type: 'default' as const },
  { id: 'ln-painpoints',  label: 'Pain Points',      type: 'default' as const },
  { id: 'ln-opportun',    label: 'Opportunities',    type: 'default' as const },
  { id: 'ln-metrics',     label: 'Metrics',          type: 'metrics' as const },
  { id: 'ln-emotions',    label: 'Emotions',         type: 'emotion' as const },
]

type SaveState = 'draft' | 'saved' | 'saving'
const SAVE_CHIP: Record<SaveState, { label: string; icon: string; design: string }> = {
  draft:  { label: 'Draft',   icon: 'write-new-document', design: 'none'     },
  saved:  { label: 'Saved',   icon: 'cloud-check',        design: 'positive' },
  saving: { label: 'Saving…', icon: 'upload-to-cloud',    design: 'none'     },
}

type Snapshot = { phases: Phase[]; lanes: Lane[]; steps: JourneyStep[] }

type Props = { assetId?: string; onTogglePanel?: () => void }

// ── Stage cell ────────────────────────────────────────────────────────────────

function StageCell({ step }: { step: JourneyStep | undefined }) {
  if (!step?.stageLabel) return <div style={{ padding: '0.75rem' }} />
  const color = step.stageColor ?? '#6366f1'
  return (
    <div style={{ padding: '0.625rem 0.75rem', display: 'flex', alignItems: 'center' }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
        padding: '0.375rem 0.875rem',
        borderRadius: '999px',
        background: `${color}15`,
        border: `1.5px solid ${color}40`,
        fontSize: 'var(--sapFontSmallSize)',
        fontWeight: 'var(--sapFontBoldWeight)',
        color: color,
        fontFamily: "'72', sans-serif",
        whiteSpace: 'nowrap',
      }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0, display: 'inline-block' }} />
        {step.stageLabel}
      </div>
    </div>
  )
}

// ── Content cell ──────────────────────────────────────────────────────────────

const CONTENT_ICON_MAP: Record<string, { icon: string; color: string }> = {
  figma:   { icon: 'palette',        color: '#7c3aed' },
  youtube: { icon: 'video',          color: '#dc2626' },
  doc:     { icon: 'document-text',  color: '#1a7adf' },
  image:   { icon: 'picture',        color: '#059669' },
  link:    { icon: 'chain-link',     color: '#64748b' },
}

function ContentCell({ steps, phaseId }: { steps: JourneyStep[]; phaseId: string }) {
  const items = steps.filter(st => st.phaseId === phaseId && st.laneId === 'ln-content' && st.contentItem)
  if (!items.length) return <div style={{ padding: '0.75rem' }} />
  return (
    <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      {items.map(st => {
        const ci = st.contentItem!
        return (
          <div key={st.id} className={s.itemCard}>
            <Avatar size="XS" colorScheme="Accent1" icon="document-text" shape="Square" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 'var(--sapFontSmallSize)', fontWeight: 'var(--sapFontBoldWeight)', color: 'var(--sapTextColor)', fontFamily: "'72',sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ci.title}</div>
              <div style={{ fontSize: 11, color: 'var(--sapContent_LabelColor)', fontFamily: "'72',sans-serif", marginTop: 1 }}>{ci.subtitle}</div>
            </div>
            <Icon name="arrow-right" style={{ width: '0.75rem', height: '0.75rem', color: 'var(--sapContent_LabelColor)', flexShrink: 0 } as React.CSSProperties} />
          </div>
        )
      })}
    </div>
  )
}

// ── Pain point card (rich) ────────────────────────────────────────────────────

function RichPainCard({
  step, selected, onSelect, onDelete,
}: {
  step: JourneyStep; selected: boolean; onSelect: () => void; onDelete: () => void
}) {
  const m = step.painPointMeta!
  const priorityColor = m.priority === 'up' ? 'var(--sapNegativeTextColor)' : m.priority === 'down' ? 'var(--sapPositiveTextColor)' : 'var(--sapNeutralTextColor)'
  const priorityIcon  = m.priority === 'up' ? '↑' : m.priority === 'down' ? '↓' : '→'

  return (
    <div
      onClick={e => { e.stopPropagation(); onSelect() }}
      className={s.card}
      style={selected ? { boxShadow: `0 0 0 2px var(--sapSelectedColor), var(--sapContent_Shadow1)` } : undefined}
    >
      <Text style={{ fontSize: 'var(--sapFontSmallSize)', fontWeight: 'var(--sapFontBoldWeight)', color: 'var(--sapTextColor)' } as React.CSSProperties}>
        {step.content}
      </Text>
      <Text style={{ fontSize: 11, color: 'var(--sapContent_LabelColor)' } as React.CSSProperties}>
        {m.description}
      </Text>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.125rem' }}>
        <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', flex: 1 } as React.CSSProperties}>{m.category}</Text>
        <span style={{ fontSize: 11, fontWeight: 700, color: priorityColor }}>{priorityIcon}</span>
        <Text style={{ fontSize: 11, color: 'var(--sapContent_LabelColor)' } as React.CSSProperties}>{m.comments} comments</Text>
      </div>
      <Button design="Transparent" icon="decline" className={s.deleteBtn}
        onClick={(e: any) => { e.stopPropagation(); onDelete() }} tooltip="Delete" />
    </div>
  )
}

// ── Process cell ──────────────────────────────────────────────────────────────

function ProcessCell({ steps, phaseId }: { steps: JourneyStep[]; phaseId: string }) {
  const links = steps.filter(s => s.phaseId === phaseId && s.laneId === 'ln-process' && s.processLink)
  if (!links.length) return <div style={{ padding: '0.75rem' }} />
  return (
    <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      {links.map(st => {
        const p = st.processLink!
        const isDmn = p.type === 'DMN'
        return (
          <div key={st.id} className={s.itemCard}>
            <SigDomainObject size="XS" object={"Process Model" as any} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 'var(--sapFontSmallSize)', fontWeight: 'var(--sapFontBoldWeight)', color: 'var(--sapTextColor)', fontFamily: "'72',sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
              <div style={{ fontSize: 11, color: 'var(--sapContent_LabelColor)', fontFamily: "'72',sans-serif", marginTop: 1 }}>{p.type}</div>
            </div>
            <Icon name="arrow-right" style={{ width: '0.75rem', height: '0.75rem', color: 'var(--sapContent_LabelColor)', flexShrink: 0 } as React.CSSProperties} />
          </div>
        )
      })}
    </div>
  )
}

// ── Metric cell ───────────────────────────────────────────────────────────────

function MetricCell({ metric }: { metric: MetricValue }) {
  const good     = (metric.trend === 'up') === metric.isPositive
  const colorHex = metric.trend === 'flat' ? '#64748b' : good ? '#16a34a' : '#dc2626'
  const trendIcon = metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '—'
  const chartData = metric.sparkline.map((v, i) => ({ i, v }))

  const fmtValue = metric.value >= 1000
    ? `${(metric.value / 1000).toFixed(1)}k`
    : metric.value % 1 === 0 ? String(metric.value) : metric.value.toFixed(1)

  return (
    <div style={{ margin: '0.5rem', borderRadius: 'var(--sapField_BorderCornerRadius)', overflow: 'hidden', boxShadow: 'var(--sapContent_Shadow0)', background: 'var(--sapBaseColor)' }}>
      <div style={{ padding: '0.625rem 0.75rem 0.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
          <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', fontWeight: 600 } as React.CSSProperties}>
            {metric.label}
          </Text>
          <span style={{
            fontSize: 'var(--sapFontSmallSize)', fontWeight: 700, color: colorHex,
            background: good ? 'var(--sapSuccessBackground)' : metric.trend === 'flat' ? 'var(--sapNeutralBackground)' : 'var(--sapErrorBackground)',
            padding: '1px 6px', borderRadius: '4px',
          }}>{trendIcon} {metric.unit}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem' }}>
          <span style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--sapTextColor)', fontFamily: "'72',sans-serif", lineHeight: 1 }}>
            {fmtValue}
          </span>
          <span style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', fontFamily: "'72',sans-serif" }}>
            {metric.unit}
          </span>
        </div>
      </div>
      <div style={{ height: 40 }}>
        <ResponsiveContainer width="100%" height={40}>
          <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`g-${metric.label.replace(/\s/g,'')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colorHex} stopOpacity={0.18} />
                <stop offset="100%" stopColor={colorHex} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke={colorHex} strokeWidth={1.5}
              fill={`url(#g-${metric.label.replace(/\s/g,'')})`}
              dot={false} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ── Sentiment face icon — returns SVG <g> elements for embedding ──────────────

function SentimentFaceG({ sentiment, cx, cy, size = 28 }: {
  sentiment: number; cx: number; cy: number; size?: number
}) {
  const r   = size / 2
  const sw  = 1.6

  const colors: Record<number, string> = {
    [-2]: '#ef4444', [-1]: '#f97316', [0]: '#94a3b8', [1]: '#22c55e', [2]: '#16a34a',
  }
  const bgs: Record<number, string> = {
    [-2]: '#fee2e2', [-1]: '#fef3e8', [0]: '#f1f5f9', [1]: '#f0fdf4', [2]: '#dcfce7',
  }
  const col = colors[sentiment] ?? colors[0]
  const bg  = bgs[sentiment]   ?? bgs[0]

  const ey  = cy - r * 0.15
  const ex  = r * 0.28
  const er  = r * 0.10

  const my  = cy + r * 0.25
  const mhw = r * 0.34
  const mc  = r * 0.12 * sentiment   // gentle curve — not too dramatic

  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={bg} />
      <circle cx={cx - ex} cy={ey} r={er} fill={col} />
      <circle cx={cx + ex} cy={ey} r={er} fill={col} />
      <path
        d={`M ${cx - mhw} ${my} Q ${cx} ${my + mc} ${cx + mhw} ${my}`}
        fill="none" stroke={col} strokeWidth={sw} strokeLinecap="round"
      />
    </g>
  )
}

// ── Emotion curve ─────────────────────────────────────────────────────────────

function EmotionCurve({
  phases, steps, onSentimentChange,
}: {
  phases: Phase[]
  steps: JourneyStep[]
  onSentimentChange: (stepId: string, delta: number) => void
}) {
  const HEIGHT = 130
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [containerW, setContainerW] = React.useState(0)

  React.useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver(entries => {
      setContainerW(entries[0].contentRect.width)
    })
    obs.observe(el)
    setContainerW(el.offsetWidth)
    return () => obs.disconnect()
  }, [])

  const emotionSteps = phases.map(ph =>
    steps.find(s => s.phaseId === ph.id && s.laneId === 'ln-emotions')
  )

  const totalW = containerW || phases.reduce((a, p) => a + p.width, 0)
  const colW   = totalW / phases.length   // equal column width based on container
  const midY   = HEIGHT / 2
  const amp    = HEIGHT * 0.34

  const points = phases.map((ph, i) => {
    const sentiment = emotionSteps[i]?.sentiment ?? 0
    const x = i * colW + colW / 2
    const y = midY - (sentiment / 2) * amp
    return { x, y, sentiment, step: emotionSteps[i] }
  })

  let path = ''
  if (points.length >= 2) {
    path = `M ${points[0].x} ${points[0].y}`
    for (let i = 1; i < points.length; i++) {
      const cp1x = (points[i - 1].x + points[i].x) / 2
      path += ` C ${cp1x} ${points[i - 1].y}, ${cp1x} ${points[i].y}, ${points[i].x} ${points[i].y}`
    }
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', minHeight: HEIGHT + 32 }}>
      <svg width={totalW} height={HEIGHT} style={{ display: 'block', overflow: 'visible' }}>
        {/* Guide lines */}
        {[-2, 0, 2].map(v => {
          const gy = midY - (v / 2) * amp
          return (
            <line key={v} x1={0} y1={gy} x2={totalW} y2={gy}
              stroke="#e8ecf2" strokeWidth={1} strokeDasharray="4 4" />
          )
        })}
        {/* Curve */}
        <path d={path} fill="none" stroke="#0891b2" strokeWidth={2.5}
          strokeLinecap="round" strokeLinejoin="round" />
        {/* Markers */}
        {points.map((pt, i) => (
          <g key={i}>
            <circle cx={pt.x} cy={pt.y} r={5} fill="#0891b2" stroke="#fff" strokeWidth={2}
              style={{ cursor: 'pointer' }} />
            <SentimentFaceG sentiment={pt.sentiment} cx={pt.x} cy={pt.y - 22} size={28} />
          </g>
        ))}
      </svg>
      {/* +/- controls per phase */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0,
        width: totalW, display: 'flex',
      }}>
        {phases.map((ph, i) => {
          const st = emotionSteps[i]
          if (!st) return <div key={ph.id} style={{ width: colW }} />
          return (
            <div key={ph.id} style={{ width: colW, display: 'flex', justifyContent: 'center', gap: 4 }}>
              <Button design="Transparent" className={s.sentimentBtn}
                onClick={() => onSentimentChange(st.id, -1)}
                disabled={(st.sentiment ?? 0) <= -2}>−</Button>
              <Button design="Transparent" className={s.sentimentBtn}
                onClick={() => onSentimentChange(st.id, 1)}
                disabled={(st.sentiment ?? 0) >= 2}>+</Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Step card ─────────────────────────────────────────────────────────────────

function StepCard({
  step, selected, editing, editContent,
  onSelect, onDoubleClick, onDelete, onEditChange, onEditCommit,
  onDragStart,
}: {
  step: JourneyStep; selected: boolean; editing: boolean; editContent: string
  onSelect: () => void; onDoubleClick: () => void; onDelete: () => void
  onEditChange: (v: string) => void; onEditCommit: () => void
  onDragStart: (e: React.DragEvent) => void
}) {
  if (editing) {
    return (
      <div className={s.cardEditing}>
        <TextArea autoFocus value={editContent}
          onInput={(e: any) => onEditChange(e.target.value)}
          onBlur={onEditCommit}
          onKeyDown={(e: any) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onEditCommit() } }}
          className={s.cardTextarea}
          rows={2}
          style={{ width: '100%', '--_ui5_textarea_margin': '0' } as React.CSSProperties}
        />
      </div>
    )
  }

  return (
    <div
      className={`${s.card} ${selected ? s.cardSelected : ''}`}
      draggable
      onDragStart={onDragStart}
      onClick={e => { e.stopPropagation(); onSelect() }}
      onDoubleClick={e => { e.stopPropagation(); onDoubleClick() }}
      style={undefined}
    >
      {step.status && step.status !== 'none' && null}
      <Text className={s.cardText}>{step.content}</Text>
      {step.tags && step.tags.length > 0 && (
        <div className={s.tagRow}>
          {step.tags.map(t => (
            <span key={t} className={s.tag}>{t}</span>
          ))}
        </div>
      )}
      <Button design="Transparent" icon="decline" className={s.deleteBtn}
        onClick={(e: any) => { e.stopPropagation(); onDelete() }}
        tooltip="Delete" />
    </div>
  )
}

// ── Lane menu (add lane) ───────────────────────────────────────────────────────

function AddLaneMenu({ onAdd }: { onAdd: (type: Lane) => void }) {
  const btnRef = useRef<any>(null)
  const menuRef = useRef<any>(null)
  return (
    <div className={s.addLaneWrap}>
      <Button ref={btnRef} design="Transparent" icon="add" id="add-lane-btn"
        className={s.addLaneBtn}
        onClick={() => {
          if (menuRef.current) {
            menuRef.current.opener = 'add-lane-btn'
            menuRef.current.open = !menuRef.current.open
          }
        }}>Add Lane</Button>
      {createPortal(
        <Menu ref={menuRef} onItemClick={(e: any) => {
          const found = LANE_TYPES.find(lt => lt.label === e.detail?.text)
          if (found) onAdd({ id: `${found.id}-${Date.now()}`, label: found.label, type: found.type, order: 999 })
        }}>
          {LANE_TYPES.map(lt => <MenuItem key={lt.id} text={lt.label} />)}
        </Menu>,
        document.body
      )}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function JourneyModelerApp({ onTogglePanel }: Props) {
  const navigate = useNavigate()

  const [phases, setPhases] = useState<Phase[]>(INITIAL_PHASES)
  const [lanes, setLanes] = useState<Lane[]>(INITIAL_LANES)
  const [steps, setSteps] = useState<JourneyStep[]>(INITIAL_STEPS)

  // Undo/Redo
  const [history, setHistory] = useState<Snapshot[]>([])
  const [future, setFuture] = useState<Snapshot[]>([])

  const snapshot = useCallback(() => {
    setHistory(h => [...h.slice(-30), { phases, lanes, steps }])
    setFuture([])
  }, [phases, lanes, steps])

  const undo = () => {
    if (!history.length) return
    const prev = history[history.length - 1]
    setFuture(f => [{ phases, lanes, steps }, ...f])
    setHistory(h => h.slice(0, -1))
    setPhases(prev.phases); setLanes(prev.lanes); setSteps(prev.steps)
  }

  const redo = () => {
    if (!future.length) return
    const next = future[0]
    setHistory(h => [...h, { phases, lanes, steps }])
    setFuture(f => f.slice(1))
    setPhases(next.phases); setLanes(next.lanes); setSteps(next.steps)
  }

  const [saveState] = useState<SaveState>('saved')
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null)
  const [editingStepId, setEditingStepId] = useState<string | null>(null)
  const [editingStepContent, setEditingStepContent] = useState('')
  const [editingPhaseId, setEditingPhaseId] = useState<string | null>(null)
  const [editingPhaseLabel, setEditingPhaseLabel] = useState('')

  // Drag state
  const dragStepId = useRef<string | null>(null)
  const [dragOver, setDragOver] = useState<{ phaseId: string; laneId: string } | null>(null)

  // Phase resize
  const resizeState = useRef<{ phaseId: string; startX: number; startW: number } | null>(null)

  const overflowMenuRef = useRef<any>(null)

  // ── Phase ops ──────────────────────────────────────────────────────────

  const addPhase = () => {
    snapshot()
    const id = `ph-${Date.now()}`
    const color = PHASE_PALETTE[phases.length % PHASE_PALETTE.length]
    setPhases(prev => [...prev, { id, label: 'New Phase', color, width: 220 }])
    setEditingPhaseId(id); setEditingPhaseLabel('New Phase')
  }

  const deletePhase = (phaseId: string) => {
    snapshot()
    setPhases(prev => prev.filter(p => p.id !== phaseId))
    setSteps(prev => prev.filter(s => s.phaseId !== phaseId))
  }

  const startPhaseEdit = (ph: Phase) => { setEditingPhaseId(ph.id); setEditingPhaseLabel(ph.label) }
  const commitPhaseEdit = () => {
    if (editingPhaseId) {
      snapshot()
      setPhases(prev => prev.map(p => p.id === editingPhaseId ? { ...p, label: editingPhaseLabel } : p))
    }
    setEditingPhaseId(null)
  }

  // Phase resize
  const startPhaseResize = (e: React.MouseEvent, phaseId: string, currentW: number) => {
    e.preventDefault(); e.stopPropagation()
    resizeState.current = { phaseId, startX: e.clientX, startW: currentW }
    const onMove = (ev: MouseEvent) => {
      if (!resizeState.current) return
      const delta = ev.clientX - resizeState.current.startX
      const newW = Math.max(140, resizeState.current.startW + delta)
      setPhases(prev => prev.map(p => p.id === resizeState.current!.phaseId ? { ...p, width: newW } : p))
    }
    const onUp = () => {
      resizeState.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  // ── Lane ops ───────────────────────────────────────────────────────────

  const addLane = (lane: Lane) => {
    snapshot()
    setLanes(prev => [...prev, { ...lane, order: prev.length }])
  }

  const deleteLane = (laneId: string) => {
    snapshot()
    setLanes(prev => prev.filter(l => l.id !== laneId))
    setSteps(prev => prev.filter(s => s.laneId !== laneId))
  }

  // Drag lane row to reorder
  const dragLaneId = useRef<string | null>(null)
  const [laneDropTarget, setLaneDropTarget] = useState<string | null>(null)

  // ── Step ops ───────────────────────────────────────────────────────────

  const addStep = (phaseId: string, laneId: string) => {
    snapshot()
    const newStep: JourneyStep = {
      id: `st-${Date.now()}`, phaseId, laneId,
      content: 'New item', status: 'none',
      emoji: laneId === 'ln-emotions' ? '😐' : undefined,
      sentiment: laneId === 'ln-emotions' ? 0 : undefined,
    }
    setSteps(prev => [...prev, newStep])
    setEditingStepId(newStep.id); setEditingStepContent('New item')
  }

  const deleteStep = (stepId: string) => {
    snapshot()
    setSteps(prev => prev.filter(s => s.id !== stepId))
  }

  const startStepEdit = (st: JourneyStep) => { setEditingStepId(st.id); setEditingStepContent(st.content) }
  const commitStepEdit = () => {
    if (editingStepId) {
      snapshot()
      setSteps(prev => prev.map(s => s.id === editingStepId ? { ...s, content: editingStepContent } : s))
    }
    setEditingStepId(null)
  }

  const changeSentiment = (stepId: string, delta: number) => {
    snapshot()
    setSteps(prev => prev.map(s => {
      if (s.id !== stepId) return s
      const cur = s.sentiment ?? 0
      const next = Math.min(2, Math.max(-2, cur + delta))
      return { ...s, sentiment: next, emoji: SENTIMENT_EMOJI[next] }
    }))
  }

  // ── Drag-and-drop card move ─────────────────────────────────────────────

  const handleCardDragStart = (e: React.DragEvent, stepId: string) => {
    dragStepId.current = stepId
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleCellDragOver = (e: React.DragEvent, phaseId: string, laneId: string) => {
    e.preventDefault()
    setDragOver({ phaseId, laneId })
  }

  const handleCellDrop = (e: React.DragEvent, phaseId: string, laneId: string) => {
    e.preventDefault()
    if (!dragStepId.current) return
    const sid = dragStepId.current
    snapshot()
    setSteps(prev => prev.map(s =>
      s.id === sid ? { ...s, phaseId, laneId } : s
    ))
    dragStepId.current = null
    setDragOver(null)
  }

  // ── Lane drag reorder ──────────────────────────────────────────────────

  const handleLaneDragStart = (laneId: string) => { dragLaneId.current = laneId }

  const handleLaneDrop = (targetLaneId: string) => {
    if (!dragLaneId.current || dragLaneId.current === targetLaneId) {
      dragLaneId.current = null; setLaneDropTarget(null); return
    }
    snapshot()
    setLanes(prev => {
      const sorted = [...prev].sort((a, b) => a.order - b.order)
      const from = sorted.findIndex(l => l.id === dragLaneId.current)
      const to   = sorted.findIndex(l => l.id === targetLaneId)
      const [moved] = sorted.splice(from, 1)
      sorted.splice(to, 0, moved)
      return sorted.map((l, i) => ({ ...l, order: i }))
    })
    dragLaneId.current = null; setLaneDropTarget(null)
  }

  // ── Render ─────────────────────────────────────────────────────────────

  const chip = SAVE_CHIP[saveState]
  const sortedLanes = [...lanes].sort((a, b) => a.order - b.order)

  return (
    <div className={s.root} onClick={() => setSelectedStepId(null)}>

      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className={s.toolbar}>
        <div className={s.toolbarLeft}>
          <Button icon="nav-back" design="Transparent" className={s.iconBtn}
            onClick={() => navigate('/modeler')} />
          <Title level="H5" style={{ margin: 0 }}>Lead-to-Order Customer Journey</Title>
          <SigChipV2 value="Draft" leadingIcon="write-new-document" design={'indication10' as any} condensed />
          <SigChipV2 value={chip.label} leadingIcon={chip.icon} design={chip.design as any} condensed />
        </div>
        <div className={s.toolbarRight}>
          <Button design="Transparent" icon="add" onClick={addPhase}
            style={{ '--_ui5_button_base_min_width': 'unset', fontWeight: 600, fontSize: '13px' } as React.CSSProperties}
          >Add Phase</Button>
          <div className={s.vDivider} />
          <Button design="Transparent" icon="undo" className={s.iconBtn}
            disabled={history.length === 0} onClick={undo} />
          <Button design="Transparent" icon="redo" className={s.iconBtn}
            disabled={future.length === 0} onClick={redo} />
          <div className={s.vDivider} />
          <Button design="Transparent" icon="share-2" className={s.iconBtn} />
          <Button design="Transparent" icon="overflow" className={s.iconBtn}
            id="jm-overflow-btn"
            onClick={() => {
              if (overflowMenuRef.current) {
                overflowMenuRef.current.opener = 'jm-overflow-btn'
                overflowMenuRef.current.open = !overflowMenuRef.current.open
              }
            }}
          />
          <Button design="Emphasized" style={{ height: '1.875rem', borderRadius: '8px' } as React.CSSProperties}
            onClick={() => onTogglePanel?.()}>Publish</Button>
        </div>
      </div>

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <div className={s.tableWrapper}>
        <div className={s.tableScroll}>
          <table className={s.table}>
            <colgroup>
              <col style={{ width: 156 }} />
              {phases.map(ph => <col key={ph.id} style={{ width: ph.width }} />)}
            </colgroup>

            {/* Phase header */}
            <thead>
              <tr>
                <th className={s.cornerCell} />
                {phases.map(ph => (
                  <th key={ph.id} className={s.phaseHeader}>
                    <div className={s.phaseHeaderInner}>
                      {editingPhaseId === ph.id ? (
                        <Input autoFocus value={editingPhaseLabel} className={s.phaseInput}
                          onInput={(e: any) => setEditingPhaseLabel(e.target.value)}
                          onBlur={commitPhaseEdit}
                          onKeyDown={(e: any) => { if (e.key === 'Enter') commitPhaseEdit() }}
                          onClick={(e: any) => e.stopPropagation()}
                          style={{ width: '100%', textAlign: 'center' } as React.CSSProperties}
                        />
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
                          <span className={s.phaseLabel} style={{ color: ph.color }}
                            onDoubleClick={e => { e.stopPropagation(); startPhaseEdit(ph) }}>
                            {ph.label}
                          </span>
                          {ph.stage && (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                              padding: '1px 8px', borderRadius: '999px',
                              background: `${ph.color}12`, border: `1px solid ${ph.color}25`,
                              fontSize: 10, fontWeight: 600, color: ph.color,
                              fontFamily: "'72', sans-serif", whiteSpace: 'nowrap',
                            }}>
                              <span style={{ width: 5, height: 5, borderRadius: '50%', background: ph.color, display: 'inline-block', flexShrink: 0 }} />
                              {ph.stage}
                            </span>
                          )}
                        </div>
                      )}
                      <Button design="Transparent" icon="decline" className={s.phaseDeleteBtn}
                        onClick={(e: any) => { e.stopPropagation(); deletePhase(ph.id) }}
                        tooltip="Delete phase" />
                    </div>
                    {/* Resize handle */}
                    <div className={s.resizeHandle}
                      onMouseDown={e => startPhaseResize(e, ph.id, ph.width)} />
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {sortedLanes.map(lane => {
                const color = LANE_COLOR[lane.id] ?? '#64748b'
                const isEmotion  = lane.type === 'emotion'
                const isMetrics  = lane.type === 'metrics'
                const isProcess  = lane.type === 'process'
                const isStages   = lane.type === 'stages'
                const isContent  = lane.type === 'content'
                const isDropTarget = laneDropTarget === lane.id

                return (
                  <tr key={lane.id}
                    draggable
                    onDragStart={() => handleLaneDragStart(lane.id)}
                    onDragOver={e => { e.preventDefault(); setLaneDropTarget(lane.id) }}
                    onDragLeave={() => setLaneDropTarget(null)}
                    onDrop={() => handleLaneDrop(lane.id)}
                    style={{ opacity: dragLaneId.current === lane.id ? 0.4 : 1 }}
                  >
                    {/* Lane label */}
                    <td className={`${s.laneCell} ${isDropTarget ? s.laneCellDrop : ''}`}>
                      <div className={s.laneCellInner}>
                        <Icon name="grid" className={s.laneDragHandle} />
                        <div className={s.laneLabelWrap} style={{ borderLeftColor: color }}>
                          <span className={s.laneLabel}>{lane.label}</span>
                        </div>
                        <Button design="Transparent" icon="decline" className={s.laneDeleteBtn}
                          onClick={() => deleteLane(lane.id)} tooltip="Remove lane" />
                      </div>
                    </td>

                    {/* Cells */}
                    {isEmotion ? (
                      <td colSpan={phases.length} className={s.emotionCell}>
                        <EmotionCurve phases={phases} steps={steps}
                          onSentimentChange={changeSentiment} />
                      </td>
                    ) : isMetrics ? (
                      phases.map(ph => {
                        const metricStep = steps.find(s => s.phaseId === ph.id && s.laneId === lane.id)
                        return (
                          <td key={ph.id} className={s.metricsCell}>
                            {metricStep?.metric ? <MetricCell metric={metricStep.metric} /> : <div style={{ padding: '0.75rem' }} />}
                          </td>
                        )
                      })
                    ) : isProcess ? (
                      phases.map(ph => (
                        <td key={ph.id} className={s.cell} style={{ padding: 0 }}>
                          <ProcessCell steps={steps} phaseId={ph.id} />
                        </td>
                      ))
                    ) : isContent ? (
                      phases.map(ph => (
                        <td key={ph.id} className={s.cell} style={{ padding: 0 }}>
                          <ContentCell steps={steps} phaseId={ph.id} />
                        </td>
                      ))
                    ) : (
                      phases.map(ph => {
                        const cellSteps = steps.filter(s => s.phaseId === ph.id && s.laneId === lane.id)
                        const isOver = dragOver?.phaseId === ph.id && dragOver?.laneId === lane.id
                        return (
                          <td key={ph.id}
                            className={`${s.cell} ${isOver ? s.cellDragOver : ''}`}
                            onDragOver={e => handleCellDragOver(e, ph.id, lane.id)}
                            onDragLeave={() => setDragOver(null)}
                            onDrop={e => handleCellDrop(e, ph.id, lane.id)}
                            onClick={e => e.stopPropagation()}
                          >
                            <div className={s.cellContent}>
                              {cellSteps.map(step =>
                                step.painPointMeta ? (
                                  <RichPainCard key={step.id} step={step}
                                    selected={selectedStepId === step.id}
                                    onSelect={() => { setSelectedStepId(step.id); onTogglePanel?.() }}
                                    onDelete={() => deleteStep(step.id)}
                                  />
                                ) : (
                                  <StepCard key={step.id} step={step}
                                    selected={selectedStepId === step.id}
                                    editing={editingStepId === step.id}
                                    editContent={editingStepContent}
                                    onSelect={() => { setSelectedStepId(step.id); onTogglePanel?.() }}
                                    onDoubleClick={() => startStepEdit(step)}
                                    onDelete={() => deleteStep(step.id)}
                                    onEditChange={setEditingStepContent}
                                    onEditCommit={commitStepEdit}
                                    onDragStart={e => handleCardDragStart(e, step.id)}
                                  />
                                )
                              )}
                              <Button design="Transparent" icon="add" className={s.addBtn}
                                onClick={() => addStep(ph.id, lane.id)}>Add</Button>
                            </div>
                          </td>
                        )
                      })
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* Add lane row */}
          <div className={s.addLaneRow}>
            <AddLaneMenu onAdd={addLane} />
          </div>
        </div>
      </div>

      {createPortal(
        <Menu ref={overflowMenuRef}>
          <MenuItem text="Rename" /><MenuItem text="Duplicate" />
          <MenuSeparator />
          <MenuItem text="Export as PNG" /><MenuItem text="Export as PDF" />
          <MenuSeparator />
          <MenuItem text="Delete" />
        </Menu>,
        document.body
      )}
    </div>
  )
}
