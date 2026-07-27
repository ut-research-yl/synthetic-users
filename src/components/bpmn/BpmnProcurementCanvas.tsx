import React, { useCallback, useImperativeHandle, forwardRef } from 'react'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  ReactFlowProvider,
  type Connection,
  type Edge,
  type Node,
  type ReactFlowInstance,
  MarkerType,
} from '@xyflow/react'

export type BpmnCanvasHandle = {
  zoomIn: () => void
  zoomOut: () => void
  fitView: () => void
  getZoom: () => number
}
import '@xyflow/react/dist/style.css'
import { bpmnNodeTypes } from './BpmnNodes'

// ── Design tokens ────────────────────────────────────────────────────────────
const BORDER = '#556b81'
const INK = '#131e29'
const FONT = "'72', Arial, Helvetica, sans-serif"
const SEQ_MARKER: Edge['markerEnd'] = { type: MarkerType.ArrowClosed, color: INK, width: 14, height: 14 }
const ASSOC_MARKER: Edge['markerEnd'] = { type: MarkerType.Arrow, color: BORDER, width: 12, height: 12 }

// ── Pool geometry ─────────────────────────────────────────────────────────────
const OUTER_LBL_W = 42
const INNER_LBL_W = 32
const POOL_LEFT = 40
const HR_Y = 80
const HR_H = 280
const IT_Y = HR_Y + HR_H
const IT_H = 200
const POOL_W = 1020

// ── Initial nodes ─────────────────────────────────────────────────────────────
const initialNodes: Node[] = [
  // Pool outer label
  {
    id: 'pool-outer',
    type: 'poolLabel',
    position: { x: POOL_LEFT, y: HR_Y },
    data: { label: 'Human Resource Department', isOuter: true },
    style: { width: OUTER_LBL_W, height: HR_H + IT_H },
    draggable: false,
    selectable: false,
  },
  // HR inner label
  {
    id: 'lane-hr-lbl',
    type: 'poolLabel',
    position: { x: POOL_LEFT + OUTER_LBL_W, y: HR_Y },
    data: { label: 'HR' },
    style: { width: INNER_LBL_W, height: HR_H },
    draggable: false,
    selectable: false,
  },
  // IT inner label
  {
    id: 'lane-it-lbl',
    type: 'poolLabel',
    position: { x: POOL_LEFT + OUTER_LBL_W, y: IT_Y },
    data: { label: 'IT System Manager' },
    style: { width: INNER_LBL_W, height: IT_H },
    draggable: false,
    selectable: false,
  },
  // Start event
  {
    id: 'start',
    type: 'startEvent',
    position: { x: 160, y: HR_Y + HR_H / 2 - 18 },
    data: { label: 'Employee\nHired' },
    style: { width: 36, height: 36 },
  },
  // Tasks - HR lane
  {
    id: 't1',
    type: 'task',
    position: { x: 240, y: HR_Y + 60 },
    data: { label: 'Collect employee\ninformation' },
    style: { width: 140, height: 80 },
  },
  {
    id: 't2',
    type: 'task',
    position: { x: 420, y: HR_Y + 60 },
    data: { label: 'Verify employee\ndocuments' },
    style: { width: 140, height: 80 },
  },
  {
    id: 't3',
    type: 'task',
    position: { x: 600, y: HR_Y + 60 },
    data: { label: 'Register employee\npayroll', userTask: true },
    style: { width: 150, height: 80 },
  },
  {
    id: 't4',
    type: 'task',
    position: { x: 810, y: HR_Y + 50 },
    data: { label: 'Schedule\norientation\nmeeting' },
    style: { width: 150, height: 95 },
  },
  // Data object
  {
    id: 'data-obj',
    type: 'dataObject',
    position: { x: 660, y: HR_Y - 80 },
    data: { label: 'Employee Payroll\nData' },
    style: { width: 40, height: 52 },
  },
  // Approval system (service)
  {
    id: 'approval',
    type: 'service',
    position: { x: 650, y: HR_Y + 195 },
    data: { label: 'Approval System' },
    style: { width: 60, height: 60 },
  },
  // IT lane task
  {
    id: 't5',
    type: 'task',
    position: { x: 600, y: IT_Y + 50 },
    data: { label: 'Issue access\ncredentials', userTask: true },
    style: { width: 150, height: 80 },
  },
]

// ── Initial edges ──────────────────────────────────────────────────────────────
const initialEdges: Edge[] = [
  // Sequence flows
  {
    id: 'e-start-t1', source: 'start', target: 't1',
    type: 'smoothstep',
    style: { stroke: INK, strokeWidth: 1.5 },
    markerEnd: SEQ_MARKER,
  },
  {
    id: 'e-t1-t2', source: 't1', target: 't2',
    type: 'smoothstep',
    style: { stroke: INK, strokeWidth: 1.5 },
    markerEnd: SEQ_MARKER,
  },
  {
    id: 'e-t2-t3', source: 't2', target: 't3',
    type: 'smoothstep',
    style: { stroke: INK, strokeWidth: 1.5 },
    markerEnd: SEQ_MARKER,
  },
  {
    id: 'e-t3-t4', source: 't3', target: 't4',
    type: 'smoothstep',
    style: { stroke: INK, strokeWidth: 1.5 },
    markerEnd: SEQ_MARKER,
  },
  // Cross-lane: T3 → T5
  {
    id: 'e-t3-t5',
    source: 't3', sourceHandle: undefined,
    target: 't5', targetHandle: undefined,
    type: 'smoothstep',
    style: { stroke: INK, strokeWidth: 1.5 },
    markerEnd: SEQ_MARKER,
  },
  // Associations (dashed)
  {
    id: 'e-data-t3', source: 'data-obj', target: 't3',
    type: 'straight',
    style: { stroke: BORDER, strokeWidth: 1.2, strokeDasharray: '5 4' },
    markerEnd: ASSOC_MARKER,
  },
  {
    id: 'e-t3-approval', source: 't3', target: 'approval',
    type: 'straight',
    style: { stroke: BORDER, strokeWidth: 1.2, strokeDasharray: '5 4' },
    markerEnd: ASSOC_MARKER,
  },
]

// ── Pool background (rendered as SVG overlay) ─────────────────────────────────
function PoolBackground() {
  const rx = 12
  const x = POOL_LEFT
  const y = HR_Y
  const w = POOL_W
  const h = HR_H + IT_H

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0, left: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      {/* Pool outline — rounded left corners only */}
      <path
        d={`M${x + rx},${y} L${x + w},${y} L${x + w},${y + h} L${x + rx},${y + h}
            Q${x},${y + h} ${x},${y + h - rx} L${x},${y + rx} Q${x},${y} ${x + rx},${y} Z`}
        fill="none"
        stroke={BORDER}
        strokeWidth={1}
      />
      {/* Horizontal lane divider */}
      <line x1={x + OUTER_LBL_W} y1={IT_Y} x2={x + w} y2={IT_Y} stroke={BORDER} strokeWidth={1} />
      {/* Outer label col divider */}
      <line x1={x + OUTER_LBL_W} y1={y} x2={x + OUTER_LBL_W} y2={y + h} stroke={BORDER} strokeWidth={1} />
      {/* Inner lane col divider */}
      <line x1={x + OUTER_LBL_W + INNER_LBL_W} y1={y} x2={x + OUTER_LBL_W + INNER_LBL_W} y2={y + h} stroke={BORDER} strokeWidth={1} />
    </svg>
  )
}

// ── Inner canvas — must be inside ReactFlowProvider ───────────────────────────
const BpmnCanvasInner = forwardRef<BpmnCanvasHandle>((_, ref) => {
  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const rfInstance = useReactFlow()

  // Expose zoom controls to parent via ref
  useImperativeHandle(ref, () => ({
    zoomIn: () => rfInstance.zoomIn({ duration: 150 }),
    zoomOut: () => rfInstance.zoomOut({ duration: 150 }),
    fitView: () => rfInstance.fitView({
      padding: 0.1,
      nodes: initialNodes.filter(n => n.type !== 'poolLabel'),
      duration: 200,
    }),
    getZoom: () => Math.round(rfInstance.getZoom() * 100),
  }))

  const onConnect = useCallback(
    (params: Connection) => setEdges(eds => addEdge({
      ...params,
      type: 'smoothstep',
      style: { stroke: INK, strokeWidth: 1.5 },
      markerEnd: SEQ_MARKER,
    }, eds)),
    [setEdges]
  )

  const onInit = useCallback((instance: ReactFlowInstance) => {
    // Only fit to interactive nodes (tasks, events, etc.) — not pool labels
    setTimeout(() => {
      instance.fitView({
        padding: 0.1,
        nodes: initialNodes.filter(n => n.type !== 'poolLabel'),
      })
    }, 150)
  }, [])

  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={bpmnNodeTypes}
        onInit={onInit}
        fitView={false}
        minZoom={0.2}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        style={{ fontFamily: FONT }}
      >
        <PoolBackground />
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1.2}
          color="#d9d9d9"
        />
      </ReactFlow>
    </div>
  )
})
BpmnCanvasInner.displayName = 'BpmnCanvasInner'

// ── Public export — wraps with ReactFlowProvider ──────────────────────────────
export const BpmnProcurementCanvas = forwardRef<BpmnCanvasHandle>((_, ref) => (
  <ReactFlowProvider>
    <BpmnCanvasInner ref={ref} />
  </ReactFlowProvider>
))
