import React from 'react'
import { Icon, Title, Text, SegmentedButton, SegmentedButtonItem, Select, Option } from '@ui5/webcomponents-react'
import type { ProcessHierarchy } from './types'

interface ExplorerViewProps {
  hierarchies: ProcessHierarchy[]
  selectedHierarchyId: string
  onHierarchyChange: (id: string) => void
}

export default function ExplorerView({ hierarchies, selectedHierarchyId, onHierarchyChange }: ExplorerViewProps) {
  const [layout, setLayout] = React.useState<'radial' | 'icicle'>('radial')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'auto' }}>
      <div style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--sapList_BorderColor)', display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
        <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>Hierarchy:</Text>
        <Select
          style={{ minWidth: '20rem' }}
          onChange={(e) => onHierarchyChange((e.target as unknown as { value?: string }).value ?? selectedHierarchyId)}
        >
          {hierarchies.map(h => (
            <Option key={h.id} value={h.id} selected={h.id === selectedHierarchyId}>{h.name}</Option>
          ))}
        </Select>
        <SegmentedButton
          onSelectionChange={(e) => {
            const item = (e.detail as unknown as { selectedItem: { text: string } }).selectedItem
            setLayout(item.text === 'Radial' ? 'radial' : 'icicle')
          }}
        >
          <SegmentedButtonItem selected={layout === 'radial'}>Radial</SegmentedButtonItem>
          <SegmentedButtonItem selected={layout === 'icicle'}>Icicle</SegmentedButtonItem>
        </SegmentedButton>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', maxWidth: '28rem', textAlign: 'center', padding: '2rem' }}>
          <div style={{
            width: '6rem', height: '6rem', borderRadius: '50%',
            background: 'var(--sapButton_Lite_Hover_Background)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="SAP-icons-v4/process-manager" style={{ fontSize: '2.5rem', color: 'var(--sapContent_IconColor)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Title level="H4">Visual Explorer</Title>
            <Text style={{ color: 'var(--sapContent_LabelColor)', lineHeight: '1.5' }}>
              The {layout === 'radial' ? 'radial sunburst' : 'icicle chart'} explorer provides an interactive visualization of your full process hierarchy. Navigate between levels by clicking on segments.
            </Text>
          </div>
          <div style={{
            padding: '0.75rem 1.25rem',
            background: 'var(--sapInformationBackground)',
            border: '1px solid var(--sapInformationBorderColor)',
            borderRadius: '0.25rem',
            display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
          }}>
            <Icon name="hint" style={{ color: 'var(--sapInformativeColor)', flexShrink: 0, marginTop: '0.1rem' }} />
            <Text style={{ color: 'var(--sapTextColor)', fontSize: 'var(--sapFontSmallSize)', lineHeight: '1.5', textAlign: 'left' }}>
              Switch to <strong>Catalog</strong> view to browse and manage the process hierarchy interactively. The visual explorer is available in the Process Landscape standalone application.
            </Text>
          </div>
        </div>
      </div>
    </div>
  )
}
