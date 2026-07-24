import React, { useEffect, useRef, useState } from 'react'

export type Collaborator = {
  id: string
  name: string
  color: string
  accentColor: string
}

const WAYPOINTS: Record<string, Array<[number, number]>> = {
  collab1: [[320, 260], [480, 340], [600, 220], [440, 400], [280, 310]],
  collab2: [[700, 400], [520, 280], [390, 450], [660, 350], [500, 480]],
  collab3: [[550, 180], [370, 300], [680, 420], [430, 250], [750, 310]],
  collab4: [[250, 400], [620, 500], [480, 200], [330, 460], [710, 250]],
}

const MOVE_INTERVAL = 2200
const IDLE_HIDE_DELAY = 4000

type Props = {
  collaborators: Collaborator[]
  canvasEl: SVGSVGElement | null
  active: boolean
  zoom: number
  panX: number
  panY: number
}

// Convert SVG canvas coordinates to screen pixels.
// The viewBox is: panX, panY, w*(100/zoom), h*(100/zoom)
// So screen x = (svgX - panX) / scale where scale = 100/zoom
function svgToScreen(svgX: number, svgY: number, zoom: number, panX: number, panY: number) {
  const scale = 100 / zoom
  return {
    x: (svgX - panX) / scale,
    y: (svgY - panY) / scale,
  }
}

export function CollaborativeCursors({ collaborators, canvasEl, active, zoom, panX, panY }: Props) {
  const [cursors, setCursors] = useState<Record<string, { x: number; y: number; labelVisible: boolean }>>({})
  const waypointIdxRef = useRef<Record<string, number>>({})
  const idleTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  useEffect(() => {
    if (!active || !canvasEl) return

    const init: Record<string, { x: number; y: number; labelVisible: boolean }> = {}
    for (const c of collaborators) {
      const pts = WAYPOINTS[c.id] ?? [[300, 300]]
      init[c.id] = { x: pts[0][0], y: pts[0][1], labelVisible: true }
      waypointIdxRef.current[c.id] = 0
    }
    setCursors(init)

    const intervals: ReturnType<typeof setInterval>[] = []
    collaborators.forEach((c, i) => {
      const pts = WAYPOINTS[c.id] ?? [[300, 300]]
      const interval = setInterval(() => {
        const nextIdx = ((waypointIdxRef.current[c.id] ?? 0) + 1) % pts.length
        waypointIdxRef.current[c.id] = nextIdx
        setCursors(prev => ({ ...prev, [c.id]: { x: pts[nextIdx][0], y: pts[nextIdx][1], labelVisible: true } }))

        clearTimeout(idleTimersRef.current[c.id])
        idleTimersRef.current[c.id] = setTimeout(() => {
          setCursors(prev => prev[c.id] ? { ...prev, [c.id]: { ...prev[c.id], labelVisible: false } } : prev)
        }, IDLE_HIDE_DELAY)
      }, MOVE_INTERVAL + i * 400)
      intervals.push(interval)
    })

    return () => {
      intervals.forEach(clearInterval)
      Object.values(idleTimersRef.current).forEach(clearTimeout)
    }
  }, [active, collaborators, canvasEl])

  if (!active) return null

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 9, overflow: 'hidden' }}>
      {collaborators.map(c => {
        const pos = cursors[c.id]
        if (!pos) return null
        const screen = svgToScreen(pos.x, pos.y, zoom, panX, panY)
        return (
          <div
            key={c.id}
            style={{
              position: 'absolute',
              left: screen.x,
              top: screen.y,
              transition: 'left 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94), top 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              pointerEvents: 'none',
            }}
          >
            {/* Cursor arrow */}
            <svg width="21" height="26" viewBox="0 0 16 20" style={{ display: 'block', overflow: 'visible' }}>
              <path
                d="M2 1L14 8.5L8.5 9.5L6 15L2 1Z"
                fill={c.color}
                stroke="white"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>

            {/* Name label */}
            <div
              style={{
                marginTop: '2px',
                marginLeft: '5px',
                display: 'inline-flex',
                alignItems: 'center',
                background: c.accentColor,
                borderRadius: '14px',
                padding: '3px 10px',
                whiteSpace: 'nowrap',
                fontSize: '14px',
                fontWeight: '600',
                fontFamily: "var(--sapFontFamily,'72',Arial,sans-serif)",
                color: c.color,
                opacity: pos.labelVisible ? 1 : 0,
                transition: 'opacity 0.4s ease',
              }}
            >
              {c.name}
            </div>
          </div>
        )
      })}
    </div>
  )
}
