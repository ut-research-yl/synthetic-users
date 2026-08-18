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
import JouleChatPanel from './SuiteContextPanel/JouleChatPanel'
import ElementDetailPanel from './ElementDetailPanel'
import LiShapeDetailPanel from './LiShapeDetailPanel'
import WidgetDetailPanel from './WidgetDetailPanel'
import DictionaryDetailPanel from './DictionaryDetailPanel'
import DictionaryLinkedPanel from './DictionaryLinkedPanel'
import CreateDictionaryItemPanel from './CreateDictionaryItemPanel'
import type { DictPanelItem } from './DictionaryDetailPanel'
import type { LiShape } from '../pages/ModelerApp'
import type { Widget, ExternalWidget, Metric } from './DataPanel'
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
  { id: 'diagram-attributes', label: 'Diagram Attributes',   icon: 'detail-view',          section: 1 },
  { id: 'comments',           label: 'Comments',             icon: 'comment',               section: 1 },
  // Section 2 — Platform Capabilities
  { id: 'joule-chat',         label: 'Modeling AI Assistant', icon: 'ai',                   section: 2 },
  { id: 'tasks',              label: 'Tasks',                icon: 'checklist',             section: 2 },
  { id: 'insights',           label: 'Insights',             icon: 'lightbulb',             section: 2 },
  { id: 'initiatives',        label: 'Initiatives',          icon: 'grid',                  section: 2 },
  { id: 'atoms',              label: 'Atoms',                icon: 'SAP-icons-v4/value-any', section: 2 },
]

const PANEL_TITLE: Record<string, string> = {
  'diagram-attributes': 'Diagram Attributes',
  'comments':           'Comments',
  'tasks':              'Tasks',
  'insights':           'Insights',
  'initiatives':        'Initiatives',
  'atoms':              'Atoms',
  'joule-chat':         'Modeling AI Assistant',
}

type SharedProps = {
  activePanel: ModelerPanelId
  onTogglePanel: (id: ModelerPanelId) => void
  pendingMessage?: string | null
  onPendingConsumed?: () => void
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

export function SuiteContextPanelContent({ activePanel, onTogglePanel, pendingMessage, onPendingConsumed, assetId, assetName, selectedElementId, selectedLiShape, onLiShapeUpdate, onSelectElement, liShapes, onSelectLiShape, selectedWidget, selectedDictId, selectedDictItem, onLinkDictItem }: SharedProps & { assetId?: string; assetName?: string; selectedLiShape?: LiShape | null; onLiShapeUpdate?: (id: string, changes: Partial<LiShape>) => void; onSelectElement?: (id: string) => void; liShapes?: LiShape[]; onSelectLiShape?: (shape: LiShape) => void; selectedWidget?: Widget | ExternalWidget | Metric | null; selectedDictId?: string | null; selectedDictItem?: DictPanelItem | null; onLinkDictItem?: (elementId: string, dictId: string, dictName: string) => void }) {
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
          hideThumbnail
          hideRevisionInfo
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
          hideThumbnail
          hideRevisionInfo
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

  // joule chat panel
  if (activePanel === 'joule-chat') {
    return (
      <div className={s.panelContent}>
        <JouleChatPanel
          onClose={() => onTogglePanel(null)}
          pendingMessage={pendingMessage}
          onPendingConsumed={onPendingConsumed}
        />
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
  const makeClick = (panelId: string) => () =>
    onTogglePanel(panelId === activePanel ? null : panelId as ModelerPanelId)

  const section1 = PANELS.filter(p => p.section === 1)
  const section2 = PANELS.filter(p => p.section === 2)

  const renderBtn = (p: PanelDef) => (
    <button
      key={p.id}
      className={`${s.railBtn} ${activePanel === p.id ? s.railBtnActive : ''}`}
      onClick={makeClick(p.id)}
      title={p.label}
    >
      <Icon name={p.icon} />
    </button>
  )

  return (
    <div className={s.rail}>
      {section1.map(renderBtn)}
      <div className={s.railSep} />
      {section2.map(renderBtn)}
    </div>
  )
}
