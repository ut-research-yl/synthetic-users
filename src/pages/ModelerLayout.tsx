import React, { useState, useCallback, useRef } from 'react'
import { Button } from '@ui5/webcomponents-react'
import { useParams } from 'react-router-dom'
import ModelerApp, { type LiShape, getAssetName } from './ModelerApp'
import { SuiteContextPanelContent, SuiteContextRail } from '../components/SuiteContextPanel'
import type { Widget, ExternalWidget } from '../components/DataPanel'
import type { DictPanelItem } from '../components/DictionaryDetailPanel'
import s from './ModelerLayout.module.css'

type ModelerPanelId = string | null

export default function ModelerLayout() {
  const { assetId } = useParams<{ assetId: string }>()
  const [activePanel, setActivePanel] = useState<ModelerPanelId>(null)
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [selectedLiShape, setSelectedLiShape] = useState<LiShape | null>(null)
  const selectElementByIdRef = React.useRef<((id: string) => void) | null>(null)
  const liShapeUpdateRef = React.useRef<((id: string, changes: Partial<LiShape>) => void) | null>(null)
  const addLiShapeRef = React.useRef<((shape: LiShape) => void) | null>(null)
  const selectLiShapeByIdRef = React.useRef<((id: string) => void) | null>(null)
  const linkDictToElementRef = React.useRef<((elementId: string, dictId: string, dictName: string) => void) | null>(null)
  const [liShapes, setLiShapes] = React.useState<LiShape[]>([])
  const [selectedWidget, setSelectedWidget] = React.useState<Widget | ExternalWidget | null>(null)
  const [selectedDictId, setSelectedDictId] = React.useState<string | null>(null)
  const [selectedDictItem, setSelectedDictItem] = React.useState<DictPanelItem | null>(null)
  const [panelWidth, setPanelWidth] = useState(420)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const [splitterHover, setSplitterHover] = useState(false)
  const [splitterActive, setSplitterActive] = useState(false)

  const togglePanel = (id: ModelerPanelId) =>
    setActivePanel((prev: ModelerPanelId) => (id === null || prev === id ? null : id))

  const handleElementSelect = (id: string | null, hasLinkedDict?: boolean, dictId?: string) => {
    setSelectedElementId(id)
    setSelectedLiShape(null)
    setSelectedDictId(dictId ?? null)
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
            if (shape && activePanel) {
              setActivePanel('element-detail')
            }
          }}
          onRegisterLiShapeUpdater={(fn) => { liShapeUpdateRef.current = fn }}
          onRegisterAddLiShape={(fn) => { addLiShapeRef.current = fn }}
          onRegisterSelectLiShapeById={(fn) => { selectLiShapeByIdRef.current = fn }}
          onRegisterLinkDictToElement={(fn) => { linkDictToElementRef.current = fn }}
          onLiShapeUpdate={(id, changes) => liShapeUpdateRef.current?.(id, changes)}
          onSelectElementById={(fn) => { selectElementByIdRef.current = fn }}
          onLiShapesChange={(shapes) => setLiShapes(shapes)}
          onWidgetSelect={(w) => { setSelectedWidget(w); setActivePanel('widget-detail') }}
          onOpenDictPanel={() => setActivePanel('dictionary-linked')}
          onDictItemSelect={(item) => {
            if (item?.__createNew) {
              setSelectedDictItem({ ...item, id: '__new', name: item.elementName ?? 'New Dictionary Entry', category: 'Activities', description: '', lastUpdated: '' })
              setActivePanel('create-dict-item')
            } else {
              setSelectedDictItem(item)
              setActivePanel('dict-detail')
            }
          }}
          onAddBrowseWidget={(widgetId, widgetName, widgetType) => {
            const WIDGET_TYPE_TO_LI_SHAPE: Record<string, string> = {
              'Value': 'Value', 'Bar Chart': 'Progress Bar', 'Line Chart': 'Trend',
              'Area Chart': 'Trend', 'Dual Axis Chart': 'Trend', 'Pie Chart': 'Ring Chart',
              'Treemap': 'Progress Bar', 'Heat Map': 'Traffic Light', 'Sankey Chart': 'Trend',
              'Histogram': 'Progress Bar', 'Ring Chart': 'Ring Chart',
            }
            const shapeType = WIDGET_TYPE_TO_LI_SHAPE[widgetType] ?? 'Indicator'
            const newShape: LiShape = {
              id: `li-${Date.now()}`,
              cx: 400, cy: 300,
              shapeType, widgetId, widgetName,
              manualValue: 'No data',
            }
            addLiShapeRef.current?.(newShape)
          }}
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
                assetName={getAssetName(assetId)}
                selectedElementId={selectedElementId}
                selectedLiShape={selectedLiShape}
                selectedWidget={selectedWidget}
                selectedDictId={selectedDictId}
                selectedDictItem={selectedDictItem}
                onLinkDictItem={(elementId, dictId, dictName) => {
                  linkDictToElementRef.current?.(elementId, dictId, dictName)
                }}
                onLiShapeUpdate={(id, changes) => {
                  liShapeUpdateRef.current?.(id, changes)
                  setSelectedLiShape(prev => prev && prev.id === id ? { ...prev, ...changes } : prev)
                }}
                onSelectElement={(id) => {
                  setSelectedLiShape(null)
                  setSelectedElementId(id)
                  setActivePanel('element-detail')
                  selectElementByIdRef.current?.(id)
                }}
                liShapes={liShapes}
                onSelectLiShape={(shape) => {
                  setSelectedLiShape(shape)
                  setSelectedElementId(null)
                  setActivePanel('element-detail')
                  selectLiShapeByIdRef.current?.(shape.id)
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
