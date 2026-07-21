import React, { useState } from 'react'
import { Select, Option, Label, Icon, Text, CheckBox, Button, Input, Link, MessageStrip } from '@ui5/webcomponents-react'
import PageHeader from '../components/PageHeader'
import AudienceSectionBar from '../components/AudienceSectionBar'
import SettingsPageLayout, { SettingsSection } from '../components/SettingsPageLayout'
import s from '../components/SettingsPage.module.css'
import { useWorkspace } from '../contexts/WorkspaceContext'
import { useDragReorder } from '../utils/useDragReorder'

type Widget = {
  id: string
  label: string
  draggable: boolean
  showable: boolean
  expandable: boolean
  shown: boolean
  expanded: boolean
}

const INITIAL_HEADER: Widget = {
  id: 'header', label: 'Title and Welcome Message',
  draggable: false, showable: false, expandable: true, shown: false, expanded: false,
}

const INITIAL_WIDGETS: Widget[] = [
  { id: 'monitoring', label: 'Monitoring Widgets from SAP Signavio Process Intelligence', draggable: true, showable: true, expandable: true, shown: false, expanded: false },
  { id: 'recent', label: 'Recently Viewed', draggable: true, showable: true, expandable: false, shown: false, expanded: false },
  { id: 'favorites', label: 'Favorites', draggable: true, showable: true, expandable: false, shown: false, expanded: false },
  { id: 'entry', label: 'Entry Diagram', draggable: true, showable: true, expandable: true, shown: true, expanded: false },
]

const INITIAL_SHOW_CREATE = true
type Translation = { id: string; language: string; title: string; welcomeMessage: string }
const INITIAL_TRANSLATIONS: Translation[] = [
  { id: '1', language: 'English (United States)', title: '', welcomeMessage: 'Workspace Settings Prototype' },
]
const INITIAL_WIDGET_IDS: string[] = Array(6).fill('')

const LANGUAGES = [
  'English (Australia)', 'English (United States)', 'English (United Kingdom)',
  'German', 'French', 'Spanish', 'Italian', 'Portuguese (Brazil)', 'Japanese', 'Chinese (Simplified)',
]

function MonitoringContent({ widgetIds, onWidgetIdChange }: {
  widgetIds: string[]
  onWidgetIdChange: (index: number, value: string) => void
}) {
  return (
    <div style={{ padding: '0 1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <Text>Show SAP Signavio Process Intelligence widgets on Home.</Text>
        <br />
        <Text>
          Enter the widget ID from SAP Signavio Process Intelligence.{' '}
          <Link href="#">More about Widget IDs</Link>
        </Text>
      </div>
      <MessageStrip design="Information" hideCloseButton>
        Only users that have been added to processes will see the relevant widgets on their homepage.
      </MessageStrip>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(9rem, 1fr))', gap: '1rem', width: '100%' }}>
        {widgetIds.map((val, i) => (
          <Input
            key={i}
            accessibleName={`Widget ID ${i + 1}`}
            placeholder="Widget ID"
            value={val}
            style={{ width: '100%', minWidth: 0 }}
            onInput={e => onWidgetIdChange(i, (e.target as unknown as HTMLInputElement).value)}
          />
        ))}
      </div>
    </div>
  )
}

function HomePageHeaderContent({ showCreate, onShowCreateChange, translations, onTranslationsChange }: {
  showCreate: boolean
  onShowCreateChange: (v: boolean) => void
  translations: Translation[]
  onTranslationsChange: (t: Translation[]) => void
}) {
  const update = (id: string, field: keyof Translation, value: string) =>
    onTranslationsChange(translations.map(t => t.id === id ? { ...t, [field]: value } : t))

  const addTranslation = () =>
    onTranslationsChange([...translations, { id: Date.now().toString(), language: '', title: '', welcomeMessage: '' }])

  const removeTranslation = (id: string) =>
    onTranslationsChange(translations.filter(t => t.id !== id))

  return (
    <div style={{ padding: '0 1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Static preview */}
      <div style={{
        background: 'var(--sapObjectHeader_Background)',
        border: '1px solid var(--sapObjectHeader_BorderColor)',
        borderRadius: '0.25rem',
        padding: '0.75rem 2rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        gap: '1rem',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem', minWidth: 0, flex: 1, pointerEvents: 'none' }}>
          <h3 style={{
            margin: 0,
            fontSize: 'var(--sapFontHeader3Size)',
            fontFamily: 'var(--sapFontBlackFamily)',
            fontWeight: 700,
            color: 'var(--sapObjectHeader_Title_TextColor)',
          }}>
            {translations[0].title || 'Welcome to SAP Signavio'}
          </h3>
          {translations[0].welcomeMessage && (
            <span style={{ fontSize: 'var(--sapFontSize)', fontFamily: '"72", Arial, Helvetica, sans-serif', color: 'var(--sapContent_NonInteractiveIconColor)' }}>
              {translations[0].welcomeMessage}
            </span>
          )}
        </div>
        {showCreate && <Button design="Emphasized" endIcon="slim-arrow-down" style={{ flexShrink: 0, pointerEvents: 'none' }}>Create</Button>}
      </div>

      <CheckBox
        text="Allow users with editing permissions a quick access for creation of new items"
        checked={showCreate}
        onChange={e => onShowCreateChange((e.target as unknown as { checked: boolean }).checked)}
        style={{ marginLeft: '-0.5rem' }}
      />

      <Text style={{ color: 'var(--sapContent_LabelColor)' }}>
        Personalize the Title and Welcome Message per audience type.
      </Text>

      {translations.map((t, i) => (
        <div key={t.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {i > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.25rem', borderTop: '1px solid var(--sapList_BorderColor)' }}>
              <Text style={{ fontWeight: 600, fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>
                Translation {i + 1}
              </Text>
              <Button icon="decline" design="Transparent" tooltip="Remove translation" onClick={() => removeTranslation(t.id)} />
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '0.5rem 1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <Label for={`lang-${t.id}`}>Language</Label>
              <Select id={`lang-${t.id}`} style={{ width: '100%' }}
                onChange={e => update(t.id, 'language', (e.detail.selectedOption as HTMLElement).textContent ?? '')}>
                {LANGUAGES.map(l => <Option key={l} selected={t.language === l}>{l}</Option>)}
              </Select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <Label for={`title-${t.id}`}>Title</Label>
              <Input id={`title-${t.id}`} placeholder="Title" value={t.title}
                onInput={e => update(t.id, 'title', (e.target as unknown as HTMLInputElement).value)}
                style={{ width: '100%' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', gridColumn: '1 / -1' }}>
              <Label for={`welcome-${t.id}`}>Welcome Message</Label>
              <Input id={`welcome-${t.id}`} placeholder="Welcome Message" value={t.welcomeMessage}
                onInput={e => update(t.id, 'welcomeMessage', (e.target as unknown as HTMLInputElement).value)}
                style={{ width: '100%' }} />
            </div>
          </div>
        </div>
      ))}

      <Button icon="add" design="Transparent" style={{ alignSelf: 'flex-start' }} onClick={addTranslation}>
        Add translation
      </Button>
    </div>
  )
}

function EntryDiagramContent() {
  return (
    <div style={{ padding: '0 1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Text>Select a diagram to display on the SAP Signavio Process Collaboration Hub home page.</Text>
      <div style={{ position: 'relative', width: '200px', border: '1px solid var(--sapField_BorderColor)', borderRadius: '0.5rem', overflow: 'hidden' }}>
        <div style={{ background: 'linear-gradient(135deg, #f4c2d0 0%, #d9879e 100%)', height: '120px', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ width: '32px', height: '20px', background: 'rgba(255,255,255,0.65)', borderRadius: '3px', border: '1px solid rgba(160,60,80,0.35)' }} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: '18px' }}>
              {[1, 2].map(i => (
                <div key={i} style={{ width: '10px', height: '10px', background: 'rgba(255,255,255,0.5)', borderRadius: '2px' }} />
              ))}
            </div>
          </div>
          <div style={{ position: 'absolute', top: '4px', right: '4px' }}>
            <Button icon="delete" design="Transparent" tooltip="Remove entry diagram" />
          </div>
        </div>
        <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <div style={{ width: '14px', height: '14px', background: '#1565c0', borderRadius: '2px', flexShrink: 0 }} />
            <Text style={{ fontSize: '0.875rem', fontWeight: 500 }}>Welcome to OurOrg Proc...</Text>
          </div>
          <Text style={{ fontSize: '0.75rem', color: 'var(--sapContent_LabelColor)' }}>All Modeling Files &gt; Core...</Text>
        </div>
      </div>
      <Button style={{ width: 'fit-content' }}>Replace</Button>
    </div>
  )
}

const cardStyle = (highlighted: boolean, isFirst = false): React.CSSProperties => ({
  background: highlighted ? 'var(--sapList_SelectionBackgroundColor)' : 'var(--sapGroup_ContentBackground)',
  borderTop: isFirst ? 'none' : '1px solid var(--sapList_BorderColor)',
})

const rowStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem',
}

function isDirtyCheck(
  widgets: Widget[],
  showCreate: boolean,
  translations: Translation[],
  widgetIds: string[],
): boolean {
  if (JSON.stringify(widgets.map(w => ({ id: w.id, shown: w.shown }))) !==
      JSON.stringify(INITIAL_WIDGETS.map(w => ({ id: w.id, shown: w.shown })))) return true
  if (showCreate !== INITIAL_SHOW_CREATE) return true
  if (JSON.stringify(translations) !== JSON.stringify(INITIAL_TRANSLATIONS)) return true
  if (widgetIds.some(v => v !== '')) return true
  return false
}

export default function HomePage() {
  const [audience, setAudience] = useState('General audience')
  const [header, setHeader] = useState(INITIAL_HEADER)
  const [widgets, setWidgets] = useState(INITIAL_WIDGETS)
  const [showCreate, setShowCreate] = useState(INITIAL_SHOW_CREATE)
  const [translations, setTranslations] = useState<Translation[]>(INITIAL_TRANSLATIONS)
  const [widgetIds, setWidgetIds] = useState<string[]>(INITIAL_WIDGET_IDS)
  const { setHomeTitle, setHomeWelcomeMessage } = useWorkspace()

  const isDirty = isDirtyCheck(widgets, showCreate, translations, widgetIds)

  const handleSave = () => {
    setHomeTitle(translations[0].title)
    setHomeWelcomeMessage(translations[0].welcomeMessage)
  }

  const handleReset = () => {
    setWidgets(INITIAL_WIDGETS)
    setShowCreate(INITIAL_SHOW_CREATE)
    setTranslations(INITIAL_TRANSLATIONS)
    setWidgetIds(INITIAL_WIDGET_IDS)
  }

  const toggleShown = (id: string) =>
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, shown: !w.shown } : w))

  const toggleExpanded = (id: string) => {
    if (id === 'header') {
      setHeader(h => ({ ...h, expanded: !h.expanded }))
    } else {
      setWidgets(prev => prev.map(w => w.id === id ? { ...w, expanded: !w.expanded } : w))
    }
  }

  const drag = useDragReorder(widgets, setWidgets)

  const renderWidget = (widget: Widget, index?: number, isFirst = false) => {
    const isDraggable = widget.draggable && index !== undefined
    return (
      <div
        key={widget.id}
        draggable={isDraggable}
        onDragStart={isDraggable ? drag.onDragStart(index!) : undefined}
        onDragOver={isDraggable ? drag.onDragOver(index!) : undefined}
        onDragEnd={isDraggable ? drag.onDragEnd : undefined}
        style={cardStyle(drag.dragging === index, isFirst)}
      >
        <div style={rowStyle}>
          {widget.draggable
            ? <Icon name="horizontal-grip" style={{ color: 'var(--sapContent_NonInteractiveIconColor)', cursor: 'grab', flexShrink: 0 }} />
            : <div style={{ width: '1.25rem', flexShrink: 0 }} />
          }
          <Text style={{ flex: 1 }}>{widget.label}</Text>
          {widget.showable
            ? <CheckBox checked={widget.shown} text="Show on Home" onChange={() => toggleShown(widget.id)} />
            : <div style={{ visibility: 'hidden' }}><CheckBox text="Show on Home" /></div>
          }
          {widget.expandable
            ? <Button
                icon={widget.expanded ? 'slim-arrow-up' : 'slim-arrow-down'}
                design="Transparent"
                tooltip={widget.expanded ? 'Collapse' : 'Expand'}
                style={{ flexShrink: 0 }}
                onClick={() => toggleExpanded(widget.id)}
              />
            : <div style={{ visibility: 'hidden' }}><Button icon="slim-arrow-down" design="Transparent" /></div>
          }
        </div>
        {widget.expandable && widget.expanded && (
          widget.id === 'header'
            ? <HomePageHeaderContent
                showCreate={showCreate}
                onShowCreateChange={setShowCreate}
                translations={translations}
                onTranslationsChange={setTranslations}
              />
            : widget.id === 'monitoring'
              ? <MonitoringContent
                  widgetIds={widgetIds}
                  onWidgetIdChange={(i, v) => setWidgetIds(prev => prev.map((val, idx) => idx === i ? v : val))}
                />
              : widget.id === 'entry'
                ? <EntryDiagramContent />
                : null
        )}
      </div>
    )
  }

  return (
    <PageHeader title="Home Page" subtitle="Customize the home page layout, welcome message, and featured content." isDirty={isDirty} onSave={handleSave} onReset={handleReset} onDuplicate={() => {}} duplicateSourceAudience={audience}>
      <AudienceSectionBar value={audience} onChange={setAudience} className={s.narrowContent} />

      <SettingsPageLayout>
        <SettingsSection title="Home Page configuration" subtitle="Manage which content is displayed on the home page and how it is sorted.">
          <div className={s.rowNoPad} style={{ gap: 0 }}>
            {renderWidget(header, undefined, true)}
            {widgets.map((widget, index) => renderWidget(widget, index))}
          </div>
        </SettingsSection>
      </SettingsPageLayout>
    </PageHeader>
  )
}
