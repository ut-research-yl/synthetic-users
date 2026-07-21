import React, { useState, useCallback, useRef } from 'react'
import { Button } from '@ui5/webcomponents-react'
import { useParams } from 'react-router-dom'
import ModelerApp, { type LiShape } from './ModelerApp'
import { SuiteContextPanelContent, SuiteContextRail } from '../components/SuiteContextPanel'
import s from './ModelerLayout.module.css'

type ModelerPanelId = string | null

export default function ModelerLayout() {
  const { assetId } = useParams<{ assetId: string }>()
  const [activePanel, setActivePanel] = useState<ModelerPanelId>(null)
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [selectedLiShape, setSelectedLiShape] = useState<LiShape | null>(null)
  const liShapeUpdateRef = React.useRef<((id: string, changes: Partial<LiShape>) => void) | null>(null)
  const [panelWidth, setPanelWidth] = useState(420)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const [splitterHover, setSplitterHover] = useState(false)
  const [splitterActive, setSplitterActive] = useState(false)

  const togglePanel = (id: ModelerPanelId) =>
    setActivePanel((prev: ModelerPanelId) => (id === null || prev === id ? null : id))

  const handleElementSelect = (id: string | null) => {
    setSelectedElementId(id)
    setSelectedLiShape(null)
    if (id && activePanel) {
      setActivePanel('element-detail')
    } else if (!id && activePanel === 'element-detail') {
      setActivePanel('diagram-attributes')
    }
  }

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    dragging.current = true
    setSplitterActive(true)
    const onMove = (ev: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const newWidth = rect.right - ev.clientX
      setPanelWidth(Math.max(240, Math.min(newWidth, rect.width * 0.6)))
    }
    const onUp = () => {
      dragging.current = false
      setSplitterActive(false)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [])

  return (
    <div className={s.root}>
      <div ref={containerRef} style={{ flex: 1, position: 'relative', minWidth: 0, height: '100%', overflow: 'hidden' }}>
        <ModelerApp
          assetId={assetId}
          panelOffset={activePanel ? panelWidth + 16 : 0}
          onTogglePanel={() => setActivePanel(prev => {
            const target = (selectedElementId || selectedLiShape) ? 'element-detail' : 'diagram-attributes'
            return prev === target ? null : target
          })}
          onElementSelect={handleElementSelect}
          onLiShapeSelect={(shape) => {
            setSelectedLiShape(shape)
            setSelectedElementId(null)
            if (shape) setActivePanel('element-detail')
            else if (!shape && activePanel === 'element-detail') setActivePanel('diagram-attributes')
          }}
          onRegisterLiShapeUpdater={(fn) => { liShapeUpdateRef.current = fn }}
          onLiShapeUpdate={(id, changes) => liShapeUpdateRef.current?.(id, changes)}
        />
        {activePanel && (
          <>
            {/* UI5 SplitterLayout separator */}
            <div
              onMouseDown={onMouseDown}
              onMouseEnter={() => setSplitterHover(true)}
              onMouseLeave={() => setSplitterHover(false)}
              style={{
                position: 'absolute', top: 0, right: panelWidth, width: 16, height: '100%',
                zIndex: 11, cursor: 'col-resize',
                background: 'var(--sapShell_Background)',
                borderLeft: `1px solid ${splitterActive ? 'var(--sapHighlightColor)' : 'var(--sapPageHeader_BorderColor, #d9d9d9)'}`,
                borderRight: `1px solid ${splitterActive ? 'var(--sapHighlightColor)' : 'var(--sapPageHeader_BorderColor, #d9d9d9)'}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                boxSizing: 'border-box',
              }}
            >
              <div style={{
                backgroundImage: `linear-gradient(to top, ${(splitterHover || splitterActive) ? 'var(--sapHighlightColor)' : 'var(--_ui5wcr_Splitter_ContentBorderColor, var(--sapHighlightColor))'}, transparent)`,
                backgroundSize: '1px 100%', backgroundRepeat: 'no-repeat', backgroundPosition: '50%',
                width: 16, pointerEvents: 'none',
                flexGrow: (splitterHover || splitterActive) ? 1 : 0,
                height: (splitterHover || splitterActive) ? undefined : '4rem',
                transition: 'flex-grow 0.1s ease-in',
              }} />
              <Button
                design="Transparent"
                icon="vertical-grip"
                style={{ minWidth: '1.5rem', height: '1.625rem', cursor: 'col-resize', pointerEvents: 'none', flexShrink: 0 } as React.CSSProperties}
              />
              <div style={{
                backgroundImage: `linear-gradient(to bottom, ${(splitterHover || splitterActive) ? 'var(--sapHighlightColor)' : 'var(--_ui5wcr_Splitter_ContentBorderColor, var(--sapHighlightColor))'}, transparent)`,
                backgroundSize: '1px 100%', backgroundRepeat: 'no-repeat', backgroundPosition: '50%',
                width: 16, pointerEvents: 'none',
                flexGrow: (splitterHover || splitterActive) ? 1 : 0,
                height: (splitterHover || splitterActive) ? undefined : '4rem',
                transition: 'flex-grow 0.1s ease-in',
              }} />
            </div>

            <div style={{
              position: 'absolute', top: 0, right: 0, width: panelWidth, height: '100%',
              background: 'var(--sapBaseColor, #fff)',
              zIndex: 10, overflow: 'hidden',
            }}>
              <SuiteContextPanelContent
                activePanel={activePanel}
                onTogglePanel={togglePanel}
                assetId={assetId}
                selectedElementId={selectedElementId}
                selectedLiShape={selectedLiShape}
                onLiShapeUpdate={(id, changes) => {
                  liShapeUpdateRef.current?.(id, changes)
                  setSelectedLiShape(prev => prev && prev.id === id ? { ...prev, ...changes } : prev)
                }}
              />
            </div>
          </>
        )}
      </div>
      <SuiteContextRail
        activePanel={activePanel}
        onTogglePanel={(id) => {
          if (id === 'element-detail' && selectedElementId) {
            togglePanel('element-detail')
          } else if (id !== 'element-detail') {
            togglePanel(id)
          }
        }}
      />
    </div>
  )
}
