import React from 'react'
import {
  SideNavigation,
  SideNavigationItem,
  Icon,
} from '@ui5/webcomponents-react'
import { SigRightSidePanel } from '@signavio/sap-signavio-uixtension'
import { CommentsTab } from '../pages/Repository/CommentsTab'
import AssetInfoPanel from '../pages/Repository/AssetInfoPanel'
import AtomsPanel from './SuiteContextPanel/AtomsPanel'
import ElementDetailPanel from './ElementDetailPanel'
import LiShapeDetailPanel from './LiShapeDetailPanel'
import WidgetDetailPanel from './WidgetDetailPanel'
import DictionaryDetailPanel from './DictionaryDetailPanel'
import CreateDictionaryItemPanel from './CreateDictionaryItemPanel'
import type { DictPanelItem } from './DictionaryDetailPanel'
import type { LiShape } from '../pages/ModelerApp'
import type { Widget, ExternalWidget } from './DataPanel'
import { elementData } from '../data/liveInsightsData'
import type { SelectedAssetInfo } from '../pages/AllResources'
import s from './SuiteContextPanel.module.css'

type ModelerPanelId = string | null

// ── Panel registry ────────────────────────────────────────────────────────────

type PanelDef = {
  id: string
  label: string
  icon: string
  section: 1 | 2
}

const PANELS: PanelDef[] = [
  // Section 1 — Asset Context
  { id: 'diagram-attributes', label: 'Diagram Attributes', icon: 'detail-view',    section: 1 },
  { id: 'comments',           label: 'Comments',           icon: 'comment',         section: 1 },
  // Section 2 — Platform Capabilities
  { id: 'tasks',              label: 'Tasks',              icon: 'checklist',        section: 2 },
  { id: 'insights',           label: 'Insights',           icon: 'lightbulb',        section: 2 },
  { id: 'initiatives',        label: 'Initiatives',        icon: 'grid',             section: 2 },
  { id: 'atoms',              label: 'Atoms',              icon: 'SAP-icons-v4/value-any',      section: 2 },
]

const PANEL_TITLE: Record<string, string> = {
  'diagram-attributes': 'Diagram Attributes',
  'comments':           'Comments',
  'tasks':              'Tasks',
  'insights':           'Insights',
  'initiatives':        'Initiatives',
  'atoms':              'Atoms',
}

type SharedProps = {
  activePanel: ModelerPanelId
  onTogglePanel: (id: ModelerPanelId) => void
  selectedElementId?: string | null
}

// ── Mock asset data for the modeler context ──────────────────────────────────
// In the real app this would be driven by the loaded asset; here we match the
// Onboarding Process fixture that matches the canvas placeholder.
function makeMockAsset(assetId?: string, assetName?: string): SelectedAssetInfo {
  const name = assetName ?? (
    assetId === 'a1' ? 'Onboarding Process'
    : assetId === 'a2' ? 'Incident Management'
    : assetId === 'a3' ? 'Order-to-Cash Value Chain'
    : 'Untitled'
  )
  return {
    id: assetId ?? 'a1',
    name,
    objectType: 'Process Model',
    typeName: 'BPMN Model',
    folder: 'Human Resources',
    version: 'Draft',
    lastUpdateBy: 'Sebastian Kaim',
    lastUpdateDate: '2 hours ago',
    chips: [{ value: 'Draft', design: 'none' }],
    canEdit: true,
  }
}

// ── Panel content (goes inside the SplitterElement) ───────────────────────────

export function SuiteContextPanelContent({ activePanel, onTogglePanel, assetId, assetName, selectedElementId, selectedLiShape, onLiShapeUpdate, onSelectElement, liShapes, onSelectLiShape, selectedWidget, selectedDictId, selectedDictItem, onLinkDictItem }: SharedProps & { assetId?: string; assetName?: string; selectedLiShape?: LiShape | null; onLiShapeUpdate?: (id: string, changes: Partial<LiShape>) => void; onSelectElement?: (id: string) => void; liShapes?: LiShape[]; onSelectLiShape?: (shape: LiShape) => void; selectedWidget?: Widget | ExternalWidget | null; selectedDictId?: string | null; selectedDictItem?: DictPanelItem | null; onLinkDictItem?: (elementId: string, dictId: string, dictName: string) => void }) {
  if (!activePanel) return null

  if (activePanel === 'create-dict-item' && selectedDictItem) {
    return (
      <div className={s.panelContent}>
        <CreateDictionaryItemPanel
          elementName={selectedDictItem.name}
          onClose={() => onTogglePanel(null)}
          onCreateAndLink={(name, category, subCategory, description) => {
            const elementId = (selectedDictItem as any)?.elementId
            if (elementId) {
              const newDictId = `dict-new-${Date.now()}`
              onLinkDictItem?.(elementId, newDictId, name)
            }
            onTogglePanel(null)
          }}
        />
      </div>
    )
  }

  // dict detail panel
  if (activePanel === 'dict-detail' && selectedDictItem) {
    return (
      <div className={`${s.panelContent} dict-detail-panel`}>
        <DictionaryDetailPanel item={selectedDictItem} onClose={() => onTogglePanel(null)} />
      </div>
    )
  }

  // dictionary linked panel
  if (activePanel === 'dictionary-linked' && selectedElementId) {
    // use selectedDictId prop, or fall back to elementData lookup
    const dictId = selectedDictId || elementData[selectedElementId]?.linkedDictId
    if (dictId) {
      return (
        <div className={s.panelContent}>
          <DictionaryLinkedPanel
            elementId={selectedElementId}
            dictId={dictId}
            onClose={() => onTogglePanel(null)}
            onSwitchToElement={() => onTogglePanel('element-detail')}
          />
        </div>
      )
    }
  }

  // widget detail
  if (activePanel === 'widget-detail' && selectedWidget) {
    return (
      <div className={s.panelContent}>
        <WidgetDetailPanel widget={selectedWidget} onClose={() => onTogglePanel(null)} />
      </div>
    )
  }

  // li shape detail
  if (activePanel === 'element-detail' && selectedLiShape) {
    return (
      <div className={s.panelContent}>
        <LiShapeDetailPanel
          key={selectedLiShape.id}
          shape={selectedLiShape}
          onClose={() => onTogglePanel(null)}
          onUpdate={onLiShapeUpdate}
          onSelectLinkedElement={onSelectElement}
        />
      </div>
    )
  }

  // element-detail: shows selected canvas element attributes
  if (activePanel === 'element-detail' && selectedElementId) {
    const connectedShapes = (liShapes ?? []).filter(ls => ls.linkedBpmnId === selectedElementId)
    return (
      <div className={s.panelContent}>
        <ElementDetailPanel
          key={selectedElementId}
          elementId={selectedElementId}
          onClose={() => onTogglePanel(null)}
          dictId={selectedDictId ?? undefined}
          onViewDictEntry={() => onTogglePanel('dictionary-linked')}
          linkedShapes={connectedShapes.map(ls => ({ id: ls.id, widgetName: ls.widgetName, widgetId: ls.widgetId, label: ls.label, shapeType: ls.shapeType }))}
          onSelectLinkedShape={(id) => {
            const ls = (liShapes ?? []).find(s => s.id === id)
            if (ls) onSelectLiShape?.(ls)
          }}
        />
      </div>
    )
  }

  // element-detail with nothing selected — show diagram attributes as fallback
  if (activePanel === 'element-detail') {
    const asset = makeMockAsset(assetId, assetName)
    return (
      <div className={s.panelContent}>
        <AssetInfoPanel
          selectedAsset={null}
          selectedDictEntry={null}
          dictCategories={[]}
          externalSelectedAsset={asset}
          pageTitle={asset.name}
          selectionCount={0}
          zoomViewport={null}
          subscriptions={{}}
          onSubscriptionChange={() => {}}
          onThumbnailEnter={() => {}}
          onThumbnailLeave={() => {}}
          onThumbnailMove={() => {}}
          onClose={() => onTogglePanel(null)}
          onOpenModelDetail={() => {}}
          hideHeaderActions
          hideThumbnailAndRevision
        />
      </div>
    )
  }

  // diagram-attributes uses the existing AssetInfoPanel which owns its own SigRightSidePanel
  if (activePanel === 'diagram-attributes') {
    const asset = makeMockAsset(assetId, assetName)
    return (
      <div className={s.panelContent}>
        <AssetInfoPanel
          selectedAsset={null}
          selectedDictEntry={null}
          dictCategories={[]}
          externalSelectedAsset={asset}
          pageTitle={asset.name}
          selectionCount={0}
          zoomViewport={null}
          subscriptions={{}}
          onSubscriptionChange={() => {}}
          onThumbnailEnter={() => {}}
          onThumbnailLeave={() => {}}
          onThumbnailMove={() => {}}
          onClose={() => onTogglePanel(null)}
          onOpenModelDetail={() => {}}
          hideHeaderActions
          hideThumbnailAndRevision
        />
      </div>
    )
  }

  // atoms panel
  if (activePanel === 'atoms') {
    return (
      <div className={s.panelContent}>
        <AtomsPanel onClose={() => onTogglePanel(null)} />
      </div>
    )
  }

  // comments uses SigRightSidePanel with CommentsTab as direct content
  if (activePanel === 'comments') {
    return (
      <div className={s.panelContent}>
        <SigRightSidePanel
          headerTitle="Comments"
          isOpen
          toggleRightSidePanel={() => onTogglePanel(null)}
          contentActionsSlot={[]}
          style={{ width: '100%', height: '100%', maxWidth: 'none', background: 'var(--sapList_Background)' }}
        ><CommentsTab /></SigRightSidePanel>
      </div>
    )
  }

  // placeholder for not-yet-implemented panels
  const icon = PANELS.find(p => p.id === activePanel)?.icon ?? 'grid'
  return (
    <div className={s.panelContent}>
      <SigRightSidePanel
        headerTitle={PANEL_TITLE[activePanel] ?? ''}
        isOpen
        toggleRightSidePanel={() => onTogglePanel(null)}
        contentActionsSlot={[]}
        style={{ width: '100%', height: '100%', maxWidth: 'none', background: 'var(--sapList_Background)' }}
      >
        <div className={s.placeholderPanel}>
          <Icon name={icon} style={{ width: '2rem', height: '2rem', color: 'var(--sapContent_LabelColor)' }} />
        </div>
      </SigRightSidePanel>
    </div>
  )
}

// ── Navigation rail (always visible, sits outside the SplitterLayout) ─────────
// dir="rtl" so hover popups open leftward instead of off-screen.
// z-index + overflow:visible so tooltips paint over the panel content.

export function SuiteContextRail({ activePanel, onTogglePanel }: SharedProps) {
  const makeItemClick = (panelId: string) => () =>
    onTogglePanel(panelId === activePanel ? null : panelId as ModelerPanelId)

  const section1 = PANELS.filter(p => p.section === 1)
  const section2 = PANELS.filter(p => p.section === 2)

  return (
    <div className={`${s.rail} modeler-rail`} dir="rtl">
      <SideNavigation collapsed style={{ height: '100%' } as React.CSSProperties}>
        {section1.map(p => (
          <SideNavigationItem
            key={p.id}
            icon={p.icon}
            text={p.label}
            tooltip={p.label}
            selected={activePanel === p.id}
            onClick={makeItemClick(p.id)}
          />
        ))}
        <SideNavigationItem
          key="spacer"
          icon=""
          text=""
          unselectable
          style={{ height: '13px', pointerEvents: 'none', opacity: 0 } as React.CSSProperties}
        />
        {section2.map(p => (
          <SideNavigationItem
            key={p.id}
            icon={p.icon}
            text={p.label}
            tooltip={p.label}
            selected={activePanel === p.id}
            onClick={makeItemClick(p.id)}
          />
        ))}
      </SideNavigation>
      <div className={s.railSep} />
    </div>
  )
}
