import React from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'

// ── Design tokens from Figma ────────────────────────────────────────────────
const BORDER = '#556b81'      // sapField_BorderColor
const INK = '#131e29'         // sapTextColor
const FONT = "'72', Arial, Helvetica, sans-serif"
const TASK_RX = 12            // pool uses 12px radius on left corners

// ── Shared label renderer ───────────────────────────────────────────────────
function Label({ lines, top = false }: { lines: string[]; top?: boolean }) {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: top ? 'flex-start' : 'center',
      justifyContent: 'center',
      padding: top ? '6px 6px 0' : '0 8px',
      pointerEvents: 'none',
    }}>
      <span style={{
        fontFamily: FONT,
        fontSize: 12,
        fontWeight: 400,
        color: INK,
        textAlign: 'center',
        lineHeight: 1.35,
        wordBreak: 'break-word',
        whiteSpace: 'pre-wrap',
      }}>
        {lines.join('\n')}
      </span>
    </div>
  )
}

// ── BPMN Task ───────────────────────────────────────────────────────────────
export type TaskData = { label: string; userTask?: boolean }

export function TaskNode({ data, selected }: NodeProps) {
  const d = data as TaskData
  const lines = d.label.split('\n')
  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'white',
      border: `1.5px solid ${selected ? 'var(--sapHighlightColor, #0064d9)' : BORDER}`,
      borderRadius: TASK_RX,
      boxSizing: 'border-box',
      position: 'relative',
      boxShadow: selected ? `0 0 0 2px var(--sapHighlightColor, #0064d9)33` : undefined,
    }}>
      {d.userTask && (
        <div style={{ position: 'absolute', top: 6, left: 6, width: 16, height: 18 }}>
          {/* User task icon — person silhouette */}
          <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
            <circle cx="8" cy="5" r="4" stroke={BORDER} strokeWidth="1.4" fill="none" />
            <path d="M1 17Q1 11 8 11Q15 11 15 17" stroke={BORDER} strokeWidth="1.4" fill="none" />
          </svg>
        </div>
      )}
      <Label lines={lines} />
      <Handle type="target" position={Position.Left} style={{ background: BORDER, width: 8, height: 8 }} />
      <Handle type="source" position={Position.Right} style={{ background: BORDER, width: 8, height: 8 }} />
      <Handle type="target" position={Position.Top} style={{ background: BORDER, width: 8, height: 8 }} />
      <Handle type="source" position={Position.Bottom} style={{ background: BORDER, width: 8, height: 8 }} />
    </div>
  )
}

// ── BPMN Start Event ────────────────────────────────────────────────────────
export type StartEventData = { label: string }

export function StartEventNode({ data, selected }: NodeProps) {
  const d = data as StartEventData
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div style={{
        width: '100%', height: '100%',
        borderRadius: '50%',
        background: '#ebf5cb',
        border: `1.5px solid ${selected ? 'var(--sapHighlightColor, #0064d9)' : '#256f3a'}`,
        boxSizing: 'border-box',
        boxShadow: selected ? `0 0 0 2px var(--sapHighlightColor, #0064d9)33` : undefined,
      }} />
      <div style={{
        position: 'absolute',
        top: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        marginTop: 6,
        whiteSpace: 'nowrap',
        fontFamily: FONT,
        fontSize: 11,
        color: INK,
        textAlign: 'center',
        lineHeight: 1.3,
      }}>
        {d.label.split('\n').map((l, i) => <div key={i}>{l}</div>)}
      </div>
      <Handle type="source" position={Position.Right} style={{ background: '#256f3a', width: 8, height: 8 }} />
      <Handle type="source" position={Position.Bottom} style={{ background: '#256f3a', width: 8, height: 8 }} />
    </div>
  )
}

// ── BPMN Data Object ────────────────────────────────────────────────────────
export type DataObjectData = { label: string }

export function DataObjectNode({ data, selected }: NodeProps) {
  const d = data as DataObjectData
  const fold = 12
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <svg
        width="100%" height="100%"
        viewBox="0 0 40 52"
        style={{ overflow: 'visible', display: 'block' }}
      >
        <path
          d={`M0,0 L${40 - fold},0 L40,${fold} L40,52 L0,52 Z`}
          fill="white"
          stroke={selected ? 'var(--sapHighlightColor, #0064d9)' : BORDER}
          strokeWidth={1.5}
        />
        <path
          d={`M${40 - fold},0 L${40 - fold},${fold} L40,${fold}`}
          fill="none"
          stroke={selected ? 'var(--sapHighlightColor, #0064d9)' : BORDER}
          strokeWidth={1.5}
        />
      </svg>
      <div style={{
        position: 'absolute',
        top: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        marginTop: 6,
        whiteSpace: 'nowrap',
        fontFamily: FONT,
        fontSize: 10,
        color: INK,
        textAlign: 'center',
        lineHeight: 1.3,
      }}>
        {d.label.split('\n').map((l, i) => <div key={i}>{l}</div>)}
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: BORDER, width: 8, height: 8 }} />
      <Handle type="target" position={Position.Bottom} style={{ background: BORDER, width: 8, height: 8 }} />
    </div>
  )
}

// ── BPMN Service Node (IT system / computer icon) ───────────────────────────
export type ServiceNodeData = { label: string }

export function ServiceNode({ data, selected }: NodeProps) {
  const d = data as ServiceNodeData
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div style={{
        width: '100%', height: '100%',
        borderRadius: '50%',
        background: '#d9ebff',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: selected ? `2px solid var(--sapHighlightColor, #0064d9)` : 'none',
      }}>
        {/* Monitor icon */}
        <svg width="44%" height="44%" viewBox="0 0 44 36" fill="none">
          <rect x="2" y="2" width="40" height="26" rx="3" stroke="#0067d9" strokeWidth="3" />
          <line x1="22" y1="28" x2="22" y2="34" stroke="#0067d9" strokeWidth="3" strokeLinecap="round" />
          <line x1="14" y1="34" x2="30" y2="34" stroke="#0067d9" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
      <div style={{
        position: 'absolute',
        top: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        marginTop: 6,
        whiteSpace: 'nowrap',
        fontFamily: FONT,
        fontSize: 10,
        color: INK,
        textAlign: 'center',
      }}>
        {d.label}
      </div>
      <Handle type="target" position={Position.Top} style={{ background: '#0067d9', width: 8, height: 8 }} />
      <Handle type="source" position={Position.Bottom} style={{ background: '#0067d9', width: 8, height: 8 }} />
    </div>
  )
}

// ── BPMN Pool Label (swimlane header — non-interactive) ─────────────────────
export type PoolLabelData = { label: string; isOuter?: boolean }

export function PoolLabelNode({ data }: NodeProps) {
  const d = data as PoolLabelData
  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'white',
      border: `1px solid ${BORDER}`,
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: d.isOuter ? `${TASK_RX}px 0 0 ${TASK_RX}px` : 0,
    }}>
      <span style={{
        fontFamily: FONT,
        fontSize: d.isOuter ? 12 : 11,
        color: INK,
        writingMode: 'vertical-rl',
        transform: 'rotate(180deg)',
        textAlign: 'center',
        userSelect: 'none',
      }}>
        {d.label}
      </span>
    </div>
  )
}

export const bpmnNodeTypes = {
  task: TaskNode,
  startEvent: StartEventNode,
  dataObject: DataObjectNode,
  service: ServiceNode,
  poolLabel: PoolLabelNode,
}
