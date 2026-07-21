import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ObjectPage, ObjectPageTitle, ObjectPageSection, ObjectPageMode, Toolbar, Button, IllustratedMessage, Toast, MessageBox, Menu, MenuItem, Label } from '@ui5/webcomponents-react'
import '@ui5/webcomponents-fiori/dist/illustrations/NoData.js'
import { CardGridFlexWidth } from '../components/CardGridFlexWidth'
import { FavoritesWidget } from '../widgets/FavoritesWidget'
import { RecentlyViewedWidget } from '../widgets/RecentlyViewedWidget'
import { MyTasksWidget } from '../widgets/MyTasksWidget'
import { QuickLinksWidget } from '../widgets/QuickLinksWidget'
import { PreviewCard } from '../components/PreviewCard'
import { EntryDiagramCard } from '../components/EntryDiagramCard'
import type { WidgetListItemData } from '../widgets/WidgetListItem'
import SampleProcess1 from '../models/SampleProcess1.svg'
import SampleProcess2 from '../models/SampleProcess2.svg'
import SampleProcess3 from '../models/SampleProcess3.svg'
import SampleProcess4 from '../models/SampleProcess4.svg'
import EntryDiagram from '../models/EntryDiagram.svg'
import { REPOSITORY_ITEMS, formatAccessed } from '../data/DataBase'
import type { MockItem } from '../data/DataBase'
import type { QuickLinkItem } from '../widgets/QuickLinksWidget'
import { WidgetCatalogDialog, WIDGET_LABELS } from '../components/WidgetCatalogDialog'
import ImportFileDialog from '../components/ImportFileDialog'
import { QuickLinksEditDialog } from '../components/QuickLinksEditDialog'
import { SaveStateIndicator } from '../components/SaveStateIndicator'
import { SectionHeader } from '../components/SectionHeader'
import { useMockSave } from '../hooks/useMockSave'
import { getCookie, setCookie } from '../utils/cookies'
import { useWorkspace } from '../contexts/WorkspaceContext'

const MODEL_SRCS: Record<string, string> = {
  SampleProcess1,
  SampleProcess2,
  SampleProcess3,
  SampleProcess4,
  EntryDiagram,
}

const TABS = ['Home', 'My Page', 'My Process Overview']

export type WidgetType = 'favorites' | 'recentlyViewed' | 'tasks' | 'quickLinks'

export interface WidgetConfig {
  /** Unique instance key (used as React key and for removal). */
  id: string
  type: WidgetType
  /** For quickLinks: distinguishes multiple instances in the UI. */
  instanceLabel?: number
  /** For quickLinks: the configured link items. */
  items?: QuickLinkItem[]
  /** For quickLinks: user-defined custom title. */
  customTitle?: string
}

const INITIAL_WIDGETS: WidgetConfig[] = [
  { id: 'recentlyViewed', type: 'recentlyViewed' },
  { id: 'favorites',      type: 'favorites' },
]

const COOKIE_NAME = 'MyPagePrototypeConfig'
const COOKIE_DAYS = 90

function loadWidgets(): WidgetConfig[] {
  try {
    const stored = getCookie(COOKIE_NAME)
    if (stored) return JSON.parse(stored) as WidgetConfig[]
  } catch {}
  return INITIAL_WIDGETS
}

function saveWidgets(widgets: WidgetConfig[]): void {
  setCookie(COOKIE_NAME, JSON.stringify(widgets), COOKIE_DAYS)
}

const TAB_SLUGS = ['home', 'my-page', 'my-process-overview']

export default function HomeDashboard() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // ?tab= drives the selected tab (slugs: home, my-page, my-process-overview)
  const tabParam = searchParams.get('tab')
  const selectedTab = Math.max(0, TAB_SLUGS.indexOf(tabParam ?? 'home'))

  const setSelectedTab = (i: number) => {
    setSearchParams(prev => {
      if (i === 0) prev.delete('tab')
      else prev.set('tab', TAB_SLUGS[i])
      return prev
    }, { replace: true })
  }

  // ?overlay= drives catalog/ql-edit dialogs
  const overlayParam = searchParams.get('overlay')
  const catalogOpen = overlayParam === 'widget-catalog'
  const setCatalogOpen = (v: boolean) => setSearchParams(prev => {
    if (v) prev.set('overlay', 'widget-catalog')
    else prev.delete('overlay')
    return prev
  }, { replace: false })

  const qlEditOpen = overlayParam === 'quick-links-edit'
  const setQlEditOpen = (v: boolean) => setSearchParams(prev => {
    if (v) prev.set('overlay', 'quick-links-edit')
    else prev.delete('overlay')
    return prev
  }, { replace: false })

  const [widgets, setWidgets] = useState<WidgetConfig[]>(loadWidgets)
  const [createMenuOpen, setCreateMenuOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [importToast, setImportToast] = useState('')
  const [qlEditTarget, setQlEditTarget] = useState<string | null>(null)
  const [qlRemoveConfirmId, setQlRemoveConfirmId] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState('')
  const [toastKey, setToastKey] = useState(0)
  const { saveState, triggerSave } = useMockSave()
  const { homeTitle, homeWelcomeMessage } = useWorkspace()

  const getModelSrc = (item: MockItem) => item.preview ? MODEL_SRCS[item.preview] : undefined

  const toCard = (item: MockItem, showLastAccessed = true) => (
    <PreviewCard
      key={item.title}
      title={item.title}
      object={item.object}
      modelSrc={getModelSrc(item)}
      type={item.type}
      lastAccessed={showLastAccessed ? formatAccessed(item.lastAccessed) : undefined}
      isFavorite={item.isFavorite}
      onClick={() => navigate('/repository')}
    />
  )

  const toListItem = (item: MockItem, showDate = true): WidgetListItemData => ({
    object: item.object,
    title: item.title,
    isFavorite: item.isFavorite,
    type: item.type,
    date: showDate ? formatAccessed(item.lastAccessed) : undefined,
    onClick: () => navigate('/repository'),
  })

  function showToast(message: string) {
    setToastMessage(message)
    setToastKey(k => k + 1)
  }

  /** Types currently present on the page — used by the catalog to show "Added" state. */
  const activeWidgetTypes = new Set(widgets.map(w => w.type))

  const removeWidget = (id: string) =>
    setWidgets(prev => {
      const removed = prev.find(w => w.id === id)
      const next = prev.filter(w => w.id !== id)
      saveWidgets(next)
      triggerSave()
      if (removed) showToast(`${WIDGET_LABELS[removed.type]} widget removed`)
      return next
    })

  const onOrderChange = (draggedIndex: number, dropIndex: number) =>
    setWidgets(prev => {
      const next = [...prev]
      const [moved] = next.splice(draggedIndex, 1)
      next.splice(dropIndex, 0, moved)
      saveWidgets(next)
      triggerSave()
      return next
    })

  const handleAddWidget = (type: WidgetType, items?: QuickLinkItem[]) => {
    if (type === 'quickLinks') {
      const count = widgets.filter(w => w.type === 'quickLinks').length
      setWidgets(prev => {
        const next = [...prev, { id: `quickLinks-${Date.now()}`, type: 'quickLinks' as WidgetType, instanceLabel: count + 1, items: items ?? [] }]
        saveWidgets(next)
        return next
      })
    } else if (!activeWidgetTypes.has(type)) {
      setWidgets(prev => {
        const next = [...prev, { id: type, type }]
        saveWidgets(next)
        return next
      })
    }
    triggerSave()
    showToast(`${WIDGET_LABELS[type]} widget added`)
  }

  const handleSaveQlItems = (id: string, items: QuickLinkItem[]) => {
    setWidgets(prev => {
      const next = prev.map(w => w.id === id ? { ...w, items } : w)
      saveWidgets(next)
      return next
    })
    triggerSave()
  }

  const handleRenameQl = (id: string, title: string) => {
    setWidgets(prev => {
      const next = prev.map(w => w.id === id ? { ...w, customTitle: title } : w)
      saveWidgets(next)
      return next
    })
    triggerSave()
  }

  return (
    <>
      <ObjectPage
        className="home-dashboard"
        style={{ height: '100%' } as React.CSSProperties}
        mode={ObjectPageMode.IconTabBar}
        hidePinButton
        selectedSectionId={TAB_SLUGS[selectedTab]}
        onSelectedSectionChange={(e) => setSelectedTab(e.detail.selectedSectionIndex ?? 0)}
        titleArea={
          <ObjectPageTitle
            subHeader={<Label>Workspace Settings Prototype</Label>}
            header={
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <h3 style={{
                    margin: 0,
                    fontSize: 'var(--sapFontHeader3Size)',
                    fontFamily: 'var(--sapFontBlackFamily)',
                    fontWeight: 700,
                    color: 'var(--sapObjectHeader_Title_TextColor)',
                  }}>
                    {homeTitle || 'Welcome to SAP Signavio'}
                  </h3>
                  {selectedTab === 1 && <SaveStateIndicator state={saveState} />}
                </div>
                {homeWelcomeMessage && (
                  <span style={{ fontSize: 'var(--sapFontSize)', fontFamily: '"72", Arial, Helvetica, sans-serif', color: 'var(--sapContent_NonInteractiveIconColor)' }}>
                    {homeWelcomeMessage}
                  </span>
                )}
              </div>
            }
            actionsBar={
              <Toolbar>
                <Button id="create-btn" design="Emphasized" endIcon="slim-arrow-down" onClick={() => setCreateMenuOpen(true)}>
                  Create
                </Button>
                <Menu
                  opener="create-btn"
                  open={createMenuOpen}
                  horizontalAlign="End"
                  onClose={() => setCreateMenuOpen(false)}
                  onItemClick={(e) => {
                    setCreateMenuOpen(false)
                    if ((e.detail as { text?: string })?.text === 'Import file') setImportDialogOpen(true)
                  }}
                >
                  <MenuItem icon="SAP-icons-v4/upload" text="Import file" />
                  <MenuItem icon="SAP-icons-v4/process-manager" text="BPMN" />
                  <MenuItem icon="SAP-icons-v4/quickmodel" text="QuickModel" />
                  <MenuItem icon="SAP-icons-v4/customer-journey" text="Customer-Journey-Map" />
                  <MenuItem icon="SAP-icons-v4/graph-unspecified" text="BPMN-Choreographie" />
                  <MenuItem icon="SAP-icons-v4/graph-unspecified" text="BPMN-Konversation" />
                  <MenuItem icon="SAP-icons-v4/process-manager" text="BPMN 1.2" />
                </Menu>
              </Toolbar>
            }
          />
        }
      >
        <ObjectPageSection id={TAB_SLUGS[0]} titleText={TABS[0]} hideTitleText>
          <div className="page-content">
            <div className="page-content__grid">
              <SectionHeader title="Modeling Files" onSeeAll={() => navigate('/repository')} />
              <EntryDiagramCard
                title={REPOSITORY_ITEMS[0].title}
                modelSrc={getModelSrc(REPOSITORY_ITEMS[0])}
                onDiagramClick={() => navigate('/repository')}
              />
              <SectionHeader title="Favorites" onSeeAll={() => navigate('/favorites')} />
              <CardGridFlexWidth stretch minCardWidth="240px">
                {REPOSITORY_ITEMS.filter(item => item.isFavorite).slice(0, 6).map(item => toCard(item, false))}
              </CardGridFlexWidth>
              <SectionHeader title="Recently Viewed" onSeeAll={() => navigate('/repository')} />
              <CardGridFlexWidth stretch minCardWidth="240px">
                {REPOSITORY_ITEMS.slice(0, 6).map(item => toCard(item))}
              </CardGridFlexWidth>
            </div>
          </div>
        </ObjectPageSection>

        <ObjectPageSection id={TAB_SLUGS[1]} titleText={TABS[1]} hideTitleText>
          <div className="page-content">
            <div className="page-configure">
              <Button design="Default" onClick={() => setCatalogOpen(true)}>Add Widgets</Button>
            </div>
            <div className="page-content__grid">
              {widgets.length === 0 ? (
                <div className="page-empty-state">
                  <IllustratedMessage
                    name="NoData"
                    titleText="Your page looks quite empty"
                    subtitleText="Customize what items appear on this page."
                  >
                    <Button design="Emphasized" onClick={() => setCatalogOpen(true)}>
                      Add Widgets
                    </Button>
                  </IllustratedMessage>
                </div>
              ) : (
                <CardGridFlexWidth stretch draggable onOrderChange={onOrderChange}>
                  {widgets.map((widget) => {
                    if (widget.type === 'favorites') {
                      return (
                        <FavoritesWidget
                          key={widget.id}
                          items={REPOSITORY_ITEMS.filter(i => i.isFavorite).slice(0, 6).map(i => toListItem(i, false))}
                          gridSpan={4}
                          onViewAll={() => navigate('/favorites')}
                          onRemove={() => removeWidget(widget.id)}
                        />
                      )
                    }
                    if (widget.type === 'recentlyViewed') {
                      return (
                        <RecentlyViewedWidget
                          key={widget.id}
                          items={REPOSITORY_ITEMS.slice(0, 6).map(i => toListItem(i))}
                          gridSpan={4}
                          onViewAll={() => navigate('/repository')}
                          onRemove={() => removeWidget(widget.id)}
                        />
                      )
                    }
                    if (widget.type === 'tasks') {
                      return (
                        <MyTasksWidget
                          key={widget.id}
                          gridSpan={4}
                          onItemClick={() => navigate('/repository')}
                          onViewAll={() => navigate('/repository')}
                          onRemove={() => removeWidget(widget.id)}
                        />
                      )
                    }
                    if (widget.type === 'quickLinks') {
                      return (
                        <QuickLinksWidget
                          key={widget.id}
                          gridSpan={4}
                          instanceLabel={widget.instanceLabel!}
                          title={widget.customTitle ?? (widget.instanceLabel === 1 ? 'Quick Links' : `Quick Links ${widget.instanceLabel}`)}
                          items={widget.items ?? []}
                          onRemove={() => setQlRemoveConfirmId(widget.id)}
                          onEdit={() => { setQlEditTarget(widget.id); setQlEditOpen(true) }}
                          onRename={(t) => handleRenameQl(widget.id, t)}
                        />
                      )
                    }
                  })}
                </CardGridFlexWidth>
              )}
            </div>
          </div>
        </ObjectPageSection>

        <ObjectPageSection id={TAB_SLUGS[2]} titleText={TABS[2]} hideTitleText>
          <div className="under-construction">
            <span className="under-construction__text">Under construction: {TABS[2]}</span>
          </div>
        </ObjectPageSection>
      </ObjectPage>

      <WidgetCatalogDialog
        open={catalogOpen}
        activeWidgetTypes={activeWidgetTypes}
        onAdd={handleAddWidget}
        onConfigure={() => { setCatalogOpen(false); setQlEditTarget(null); setQlEditOpen(true) }}
        onClose={() => setCatalogOpen(false)}
      />

      <QuickLinksEditDialog
        open={qlEditOpen}
        mode={qlEditTarget ? 'edit' : 'add'}
        initialItems={qlEditTarget ? (widgets.find(w => w.id === qlEditTarget)?.items ?? []) : undefined}
        initialTitle={qlEditTarget
          ? (() => { const w = widgets.find(w => w.id === qlEditTarget); return w?.customTitle ?? `Quick Links ${w?.instanceLabel}` })()
          : (() => { const n = widgets.filter(w => w.type === 'quickLinks').length + 1; return n === 1 ? 'Quick Links' : `Quick Links ${n}` })()}
        onAdd={(items) => { setQlEditOpen(false); handleAddWidget('quickLinks', items) }}
        onSave={(items) => { if (qlEditTarget) handleSaveQlItems(qlEditTarget, items); setQlEditOpen(false) }}
        onBack={() => { setQlEditOpen(false); setCatalogOpen(true) }}
        onCancel={() => setQlEditOpen(false)}
      />

      {qlRemoveConfirmId && (
        <MessageBox
          open
          type="Warning"
          titleText="Delete"
          onClose={(action) => {
            const id = qlRemoveConfirmId
            setQlRemoveConfirmId(null)
            if (action === 'Delete') removeWidget(id)
          }}
          actions={['Delete', 'Cancel']}
          emphasizedAction="Delete"
        >
          Delete the Quick Links widget from the page?<br />This cannot be undone.
        </MessageBox>
      )}

      <ImportFileDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onSuccess={() => {
            setImportToast('Import successfully completed')
            setTimeout(() => setImportToast(''), 3500)
          }}
      />

      {importToast && (
        <div style={{
          position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
          background: 'white', color: '#1a2633',
          borderRadius: '12px', padding: '0.75rem 1.5rem',
          fontSize: '0.875rem', fontWeight: 400, textAlign: 'center',
          boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
          zIndex: 99999, pointerEvents: 'none',
          fontFamily: '"72", Arial, sans-serif',
        }}>
          {importToast}
        </div>
      )}

      <Toast
        key={toastKey}
        open={toastKey > 0}
        placement="BottomCenter"
        style={{
          zIndex: 9999,
          background: '#253040',
          color: 'white',
          borderRadius: '12px',
          fontSize: '1rem',
          fontWeight: 600,
          padding: '0.75rem 1.5rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
        } as React.CSSProperties}
      >
        {toastMessage}
      </Toast>
    </>
  )
}
