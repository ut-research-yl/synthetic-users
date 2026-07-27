import React from 'react'

const FONT = "'72', Arial, Helvetica, sans-serif"
const INK = '#131e29'
const BORDER = '#556b81'       // sapField_BorderColor — new design spec
const SEQ_ARR = 'bpmn-p-seq'
const ASSOC_ARR = 'bpmn-p-assoc'

// Pool geometry
const W = 1947, H = 1234
const LANE_Y = 617             // horizontal divider between HR and IT lanes
const LBL_X = 95               // outer label col right edge
const LANE_X = 137             // inner lane col right edge
const POOL_RX = 12             // border-radius on left corners (per Figma spec)

// HR lane vertical center
const HR_CY = LANE_Y / 2    // 308.5 → use 270 for task midpoints (tasks offset up)
const TASK_Y = 220           // top of task row in HR lane
const TASK_H = 100
const TASK_W = 150
const TASK_RX = 8

// IT lane
const IT_TASK_Y = 745
const IT_TASK_H = 100

// Element positions — derived from SVG + Figma proportions
// Approval System icon cx=1019,cy=478 is the anchor → T3 aligns at cx=1019
const SE_CX = 335, SE_CY = 270   // Start event
const T1 = { x: 452, label: ['Collect employee', 'information'] }
const T2 = { x: 660, label: ['Verify employee', 'documents'] }
const T3 = { x: 944, label: ['Register employee', 'payroll'], userTask: true }
const T4 = { x: 1270, label: ['Schedule', 'orientation', 'meeting'] }
const T5 = { x: 944, label: ['Issue access', 'credentials'], userTask: true }  // IT lane

// Data object above T3
const DO_CX = T3.x + TASK_W / 2   // = 1019
const DO_CY = 92

// Approval System icon (exact from SVG)
const AS_CX = 1019, AS_CY = 478
const AS_BOX_X1 = 946, AS_BOX_X2 = 1094
const AS_BOX_Y1 = 532, AS_BOX_Y2 = 573

function cx(t: { x: number }) { return t.x + TASK_W / 2 }
function cy() { return TASK_Y + TASK_H / 2 }

function TaskShape({ x, y = TASK_Y, w = TASK_W, h = TASK_H, label, userTask = false }:
  { x: number; y?: number; w?: number; h?: number; label: string[]; userTask?: boolean }) {
  const midX = x + w / 2
  const midY = y + h / 2
  const lh = 16
  const top = midY - ((label.length - 1) * lh) / 2
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={TASK_RX}
        fill="white" stroke={BORDER} strokeWidth={1.5} />
      {userTask && (
        <g transform={`translate(${x + 7}, ${y + 6})`}>
          <circle cx={8} cy={6} r={5} fill="none" stroke={INK} strokeWidth={1.5} />
          <path d="M0 20Q0 13 8 13Q16 13 16 20" fill="none" stroke={INK} strokeWidth={1.5} />
        </g>
      )}
      {label.map((l, i) => (
        <text key={i} x={midX} y={top + i * lh} textAnchor="middle"
          fontSize={13} fontFamily={FONT} fill={INK}>{l}</text>
      ))}
    </g>
  )
}

function DataObject({ cx: cx_, cy: cy_ }: { cx: number; cy: number }) {
  const w = 32, h = 42, fold = 10
  const x = cx_ - w / 2, y = cy_ - h / 2
  return (
    <g>
      <path
        d={`M${x},${y} L${x + w - fold},${y} L${x + w},${y + fold} L${x + w},${y + h} L${x},${y + h} Z`}
        fill="white" stroke={BORDER} strokeWidth={1.5}
      />
      <path d={`M${x + w - fold},${y} L${x + w - fold},${y + fold} L${x + w},${y + fold}`}
        fill="none" stroke={BORDER} strokeWidth={1.5} />
      {['Employee Payroll', 'Data'].map((l, i) => (
        <text key={i} x={cx_} y={cy_ + h / 2 + 14 + i * 13}
          textAnchor="middle" fontSize={11} fontFamily={FONT} fill={INK}>{l}</text>
      ))}
    </g>
  )
}

function ApprovalSystemIcon() {
  // Exact monitor icon matching SVG (cx=1019, cy=478)
  return (
    <g>
      <circle cx={AS_CX} cy={AS_CY} r={37.2} fill="#d9ebff" />
      {/* Monitor screen */}
      <rect x={AS_CX - 19.9} y={AS_CY - 15.4} width={39.8} height={30.7} rx={4.7}
        fill="none" stroke="#0067d9" strokeWidth={3.5} />
      {/* Stand */}
      <line x1={AS_CX} y1={AS_CY + 15.3} x2={AS_CX} y2={AS_CY + 23}
        stroke="#0067d9" strokeWidth={3.5} strokeLinecap="round" />
      <line x1={AS_CX - 11.5} y1={AS_CY + 23} x2={AS_CX + 11.5} y2={AS_CY + 23}
        stroke="#0067d9" strokeWidth={3.5} strokeLinecap="round" />
      {/* Label box (exact from SVG) */}
      <rect x={AS_BOX_X1} y={AS_BOX_Y1}
        width={AS_BOX_X2 - AS_BOX_X1} height={AS_BOX_Y2 - AS_BOX_Y1}
        rx={6} fill="white" stroke="none" />
      <text x={(AS_BOX_X1 + AS_BOX_X2) / 2} y={(AS_BOX_Y1 + AS_BOX_Y2) / 2 + 4.5}
        textAnchor="middle" fontSize={13} fontFamily={FONT} fill={INK}>Approval System</text>
    </g>
  )
}

function Seq({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2}
    stroke={INK} strokeWidth={1.8} markerEnd={`url(#${SEQ_ARR})`} />
}

function Assoc({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2}
    stroke={BORDER} strokeWidth={1.4} strokeDasharray="5 4"
    markerEnd={`url(#${ASSOC_ARR})`} />
}

export function BpmnProcurementModel() {
  const T3_CX = cx(T3), T3_TOP = TASK_Y, T3_BOT = TASK_Y + TASK_H
  const T5_CX = cx(T5), T5_MID_Y = IT_TASK_Y + IT_TASK_H / 2
  const ELBOW_X = T3_CX + TASK_W / 2 + 40   // elbow bend point right of T3

  return (
    <g>
      <defs>
        <marker id={SEQ_ARR} markerWidth="9" markerHeight="8" refX="8.5" refY="4" orient="auto">
          <path d="M0 0.5L8.5 4L0 7.5Z" fill={INK} />
        </marker>
        <marker id={ASSOC_ARR} markerWidth="9" markerHeight="8" refX="8.5" refY="4" orient="auto">
          <path d="M0 1L8.5 4L0 7" fill="none" stroke={BORDER} strokeWidth="1.8" />
        </marker>
      </defs>

      {/* ── Pool outer boundary — rounded left corners only (Figma spec) ── */}
      <path
        d={`M${POOL_RX},0 L${W},0 L${W},${H} L${POOL_RX},${H}
            Q0,${H} 0,${H - POOL_RX} L0,${POOL_RX} Q0,0 ${POOL_RX},0 Z`}
        fill="white" stroke={BORDER} strokeWidth={1}
      />

      {/* ── Lane dividers ─────────────────────────────────────────────────── */}
      {/* Horizontal lane divider (HR / IT) */}
      <line x1={LBL_X} y1={LANE_Y} x2={W} y2={LANE_Y}
        stroke={BORDER} strokeWidth={1} />
      {/* Outer label col divider */}
      <line x1={LBL_X} y1={0} x2={LBL_X} y2={H}
        stroke={BORDER} strokeWidth={1} />
      {/* Inner lane col divider */}
      <line x1={LANE_X} y1={0} x2={LANE_X} y2={H}
        stroke={BORDER} strokeWidth={1} />

      {/* ── Pool labels ──────────────────────────────────────────────────── */}
      {/* "Human Resource Department" — rotated, outer col */}
      <text
        x={-(H / 2)} y={LBL_X / 2 + 5}
        transform="rotate(-90)"
        textAnchor="middle"
        fontSize={14} fontFamily={FONT} fill={INK}
      >Human Resource Department</text>

      {/* "HR" — inner lane label, HR lane */}
      <text
        x={-(LANE_Y / 2)} y={LANE_X - 4}
        transform="rotate(-90)"
        textAnchor="middle"
        fontSize={13} fontFamily={FONT} fill={INK}
      >HR</text>

      {/* "IT System Manager" — inner lane label, IT lane */}
      <text
        x={-(LANE_Y + (H - LANE_Y) / 2)} y={LANE_X - 4}
        transform="rotate(-90)"
        textAnchor="middle"
        fontSize={12} fontFamily={FONT} fill={INK}
      >IT System Manager</text>

      {/* ── HR Lane elements ─────────────────────────────────────────────── */}

      {/* Start event: "Employee Hired" */}
      <circle cx={SE_CX} cy={SE_CY} r={16}
        fill="#ebf5cb" stroke="#256f3a" strokeWidth={1.5} />
      {['Employee', 'Hired'].map((l, i) => (
        <text key={i} x={SE_CX} y={SE_CY + 24 + i * 13}
          textAnchor="middle" fontSize={11} fontFamily={FONT} fill={INK}>{l}</text>
      ))}

      {/* Tasks */}
      <TaskShape x={T1.x} label={T1.label} />
      <TaskShape x={T2.x} label={T2.label} />
      <TaskShape x={T3.x} label={T3.label} userTask />
      <TaskShape x={T4.x} y={TASK_Y} w={160} label={T4.label} />

      {/* Data object above T3 */}
      <DataObject cx={DO_CX} cy={DO_CY} />

      {/* Approval System icon (exact SVG coords) */}
      <ApprovalSystemIcon />

      {/* ── IT Lane elements ─────────────────────────────────────────────── */}
      <TaskShape x={T5.x} y={IT_TASK_Y} label={T5.label} userTask />

      {/* ── Sequence flows ───────────────────────────────────────────────── */}
      {/* Start → T1 */}
      <Seq x1={SE_CX + 16} y1={SE_CY} x2={T1.x} y2={cy()} />
      {/* T1 → T2 */}
      <Seq x1={T1.x + TASK_W} y1={cy()} x2={T2.x} y2={cy()} />
      {/* T2 → T3 */}
      <Seq x1={T2.x + TASK_W} y1={cy()} x2={T3.x} y2={cy()} />
      {/* T3 → T4 */}
      <Seq x1={T3.x + TASK_W} y1={cy()} x2={T4.x} y2={cy()} />

      {/* T3 → T5: elbow down through lane divider */}
      <path
        d={`M${T3_CX},${T3_BOT} L${T3_CX},${LANE_Y - 2} L${T5_CX},${LANE_Y + 2} L${T5_CX},${IT_TASK_Y}`}
        fill="none" stroke={INK} strokeWidth={1.8}
        markerEnd={`url(#${SEQ_ARR})`}
      />

      {/* ── Associations (dashed) ────────────────────────────────────────── */}
      {/* Data object ↔ T3 top */}
      <Assoc x1={DO_CX} y1={DO_CY + 21} x2={T3_CX} y2={T3_TOP} />
      {/* T3 bottom ↔ Approval System */}
      <Assoc x1={T3_CX} y1={T3_BOT} x2={AS_CX} y2={AS_CY - 37.2} />
    </g>
  )
}
