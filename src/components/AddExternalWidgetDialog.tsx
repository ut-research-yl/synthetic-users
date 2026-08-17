import React, { useRef, useState } from 'react'
import { Button, Dialog, Bar, Title, Label, Input, Select, Option, TextArea, IllustratedMessage, BusyIndicator } from '@ui5/webcomponents-react'

type Props = { open: boolean; onClose: () => void; onSave?: (widget: { id: string; name: string; source: string; url: string; shapeType: string }) => void }

const SOURCES = ['Looker Studio', 'Tableau', 'Power BI', 'Analytics Cloud', 'Grafana', 'Custom URL']

const SHAPE_TYPES = [
  { value: 'Indicator',     label: 'Indicator',     icon: 'SAP-icons-v4/data-indicator' },
  { value: 'Value',         label: 'Value',         icon: 'record' },
  { value: 'Progress Bar',  label: 'Progress Bar',  icon: 'SAP-icons-v4/progress-bar' },
  { value: 'Trend',         label: 'Trend',         icon: 'SAP-icons-v4/data-trend' },
  { value: 'Ring Chart',    label: 'Ring Chart',    icon: 'SAP-icons-v4/ring-chart' },
  { value: 'Traffic Light', label: 'Traffic Light', icon: 'SAP-icons-v4/traffic-light' },
  { value: 'Cockpit',       label: 'Cockpit',       icon: 'SAP-icons-v4/gauge-cockpit' },
  { value: 'Sentiment',     label: 'Sentiment',     icon: 'SAP-icons-v4/emotion-positive' },
]

export default function AddExternalWidgetDialog({ open, onClose, onSave }: Props) {
  const dialogRef = useRef<any>(null)
  const [title, setTitle] = useState('')
  const [source, setSource] = useState(SOURCES[0])
  const [snippet, setSnippet] = useState('')
  const [shapeType, setShapeType] = useState('Indicator')
  const [loading, setLoading] = useState(false)

  const reset = () => { setTitle(''); setSource(SOURCES[0]); setSnippet(''); setShapeType('Indicator'); setLoading(false) }

  const doClose = () => {
    reset()
    dialogRef.current?.close()
    onClose()
  }

  const handleSave = () => {
    onSave?.({
      id: `ext-${Date.now()}`,
      name: title.trim(),
      source,
      url: snippet.trim(),
      shapeType,
    })
    doClose()
  }

  return (
    <Dialog
      ref={dialogRef}
      open={open}
      onClose={() => { reset(); onClose() }}
      style={{ '--_ui5_dialog_content_padding': '0' } as React.CSSProperties}
      header={
        <Bar design="Header">
          <Title slot="startContent" level="H3">Add external widget</Title>
        </Bar>
      }
      footer={
        <Bar design="Footer">
          <Button slot="endContent" design="Emphasized" disabled={!title.trim() || !snippet.trim()} onClick={handleSave}>Add</Button>
          <Button slot="endContent" design="Transparent" onClick={doClose}>Cancel</Button>
        </Bar>
      }
    >
      <div style={{ display: 'flex', width: 760 }}>

        {/* Left: form */}
        <div style={{ width: 320, flexShrink: 0, padding: '1.5rem 1.5rem 1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Label required showColon>Title</Label>
            <Input
              maxlength={50}
              value={title}
              placeholder="Enter widget title"
              onInput={(e: any) => setTitle(e.target.value)}
              style={{ width: '100%' } as React.CSSProperties}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Label required showColon>Source</Label>
            <Select
              style={{ width: '100%' } as React.CSSProperties}
              onChange={(e: any) => setSource(e.detail?.selectedOption?.dataset?.value ?? SOURCES[0])}
            >
              {SOURCES.map(s => <Option key={s} data-value={s} selected={source === s}>{s}</Option>)}
            </Select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Label required showColon>Link / Code Snippet</Label>
            <TextArea
              placeholder="Paste the link or code snippet here"
              rows={1}
              value={snippet}
              onInput={(e: any) => {
                const val = e.target.value
                setSnippet(val)
                if (val) { setLoading(true); setTimeout(() => setLoading(false), 1200) }
                else setLoading(false)
              }}
              style={{ width: '100%' } as React.CSSProperties}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Label showColon>Element Type</Label>
            <Select
              style={{ width: '100%' } as React.CSSProperties}
              onChange={(e: any) => setShapeType(e.detail?.selectedOption?.dataset?.value ?? 'Indicator')}
            >
              {SHAPE_TYPES.map(t => (
                <Option key={t.value} data-value={t.value} icon={t.icon} selected={shapeType === t.value}>
                  {t.label}
                </Option>
              ))}
            </Select>
          </div>
        </div>

        {/* Right: preview */}
        <div style={{ width: 440, flexShrink: 0, padding: '1.5rem 2rem 1.5rem 0' }}>
          <div style={{
            width: '100%', height: '100%', borderRadius: 8,
            background: 'var(--sapPageSection_Background, #f8f9fa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            minHeight: 320,
          }}>
            {loading ? (
              <BusyIndicator active size="L" />
            ) : snippet ? (
              <div style={{ padding: '1rem', color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)', wordBreak: 'break-all', textAlign: 'center' }}>
                {snippet.slice(0, 120)}{snippet.length > 120 ? '…' : ''}
              </div>
            ) : (
              <div style={{ overflow: 'hidden', width: '100%', paddingBottom: 0 }}>
                <IllustratedMessage
                  name="NoEntries"
                  titleText="No preview available"
                  subtitleText="Paste a link or code snippet to see a preview"
                  style={{ display: 'block', marginBottom: '-1rem' } as React.CSSProperties}
                />
              </div>
            )}
          </div>
        </div>

      </div>
    </Dialog>
  )
}
