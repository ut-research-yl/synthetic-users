import React, { useState } from 'react'
import {
  DynamicPage,
  DynamicPageTitle,
  Title,
  Toolbar,
  ToolbarSpacer,
  ToolbarItem,
  ToolbarSeparator,
  SegmentedButton,
  SegmentedButtonItem,
  Button,
  Select,
  Option,
  SplitterLayout,
  SplitterElement,
} from '@ui5/webcomponents-react'
import ExplorerView from './ExplorerView'
import MapsView from './MapsView'
import CatalogView from './CatalogView'
import DetailPanel from './DetailPanel'
import { HIERARCHIES } from './data'
import type { ViewMode } from './types'

export default function ProcessLandscape() {
  const [viewMode, setViewMode] = useState<ViewMode>('catalog')
  const [selectedHierarchyId, setSelectedHierarchyId] = useState('apqc')
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)

  void (HIERARCHIES.find(h => h.id === selectedHierarchyId) ?? HIERARCHIES[0])

  return (
    <DynamicPage
      style={{ height: '100%' } as React.CSSProperties}
      hidePinButton
      titleArea={
        <DynamicPageTitle>
          <Title slot="heading" level="H3">Process Landscape</Title>
          <Toolbar slot="actionsBar" design="Transparent">
            <ToolbarItem>
              <Select
                style={{ minWidth: '18rem' }}
                onChange={(e) => setSelectedHierarchyId((e.target as unknown as { value?: string }).value ?? selectedHierarchyId)}
              >
                {HIERARCHIES.map(h => (
                  <Option key={h.id} value={h.id} selected={h.id === selectedHierarchyId}>{h.name}</Option>
                ))}
              </Select>
            </ToolbarItem>
            <ToolbarSeparator />
            <ToolbarItem>
              <SegmentedButton
                onSelectionChange={(e) => {
                  const item = (e.detail as unknown as { selectedItem: HTMLElement }).selectedItem
                  const mode = item?.dataset?.mode
                  if (mode) setViewMode(mode as ViewMode)
                }}
              >
                <SegmentedButtonItem
                  icon="SAP-icons-v4/process-manager"
                  data-mode="explorer"
                  selected={viewMode === 'explorer'}
                >
                  Explorer
                </SegmentedButtonItem>
                <SegmentedButtonItem
                  icon="map"
                  data-mode="maps"
                  selected={viewMode === 'maps'}
                >
                  Maps
                </SegmentedButtonItem>
                <SegmentedButtonItem
                  icon="table-row"
                  data-mode="catalog"
                  selected={viewMode === 'catalog'}
                >
                  Catalog
                </SegmentedButtonItem>
              </SegmentedButton>
            </ToolbarItem>
            <ToolbarSpacer />
            <ToolbarItem>
              <Button design="Emphasized" icon="add">Create</Button>
            </ToolbarItem>
          </Toolbar>
        </DynamicPageTitle>
      }
    >
      {viewMode === 'explorer' && (
        <ExplorerView
          hierarchies={HIERARCHIES}
          selectedHierarchyId={selectedHierarchyId}
          onHierarchyChange={setSelectedHierarchyId}
        />
      )}

      {viewMode === 'maps' && <MapsView />}

      {viewMode === 'catalog' && (
        selectedElementId ? (
          <SplitterLayout style={{ height: '100%' } as React.CSSProperties}>
            <SplitterElement style={{ overflow: 'hidden' } as React.CSSProperties}>
              <CatalogView
                selectedElementId={selectedElementId}
                onSelectElement={setSelectedElementId}
              />
            </SplitterElement>
            <SplitterElement size="380px" minSize={300} style={{ overflow: 'hidden', borderLeft: '1px solid var(--sapList_BorderColor)' } as React.CSSProperties}>
              <DetailPanel
                elementId={selectedElementId}
                onClose={() => setSelectedElementId(null)}
              />
            </SplitterElement>
          </SplitterLayout>
        ) : (
          <CatalogView
            selectedElementId={selectedElementId}
            onSelectElement={setSelectedElementId}
          />
        )
      )}
    </DynamicPage>
  )
}
