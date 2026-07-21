import React, { useState, useRef } from 'react'
import { Select, Option, Label, Icon, Text, CheckBox, Button, RadioButton, MultiComboBox } from '@ui5/webcomponents-react'
import InfoPopover from '../components/InfoPopover'
import { StickyNote } from '../components/StickyNote'
import AudienceSectionBar from '../components/AudienceSectionBar'
import { useDragReorder } from '../utils/useDragReorder'
import PageHeader from '../components/PageHeader'
import SettingsPageLayout, { SettingsSection } from '../components/SettingsPageLayout'
import s from '../components/SettingsPage.module.css'

const NOTATION_SETS = [
  'Business Process Diagram (BPMN 2.0)',
  'Business Decision Diagram (DMN 1.2)',
  'Value Chain',
]

type PageSection = {
  id: string
  label: string
  showable: boolean
  shown?: boolean
  expandable?: boolean
}

const INITIAL_SECTIONS: PageSection[] = [
  { id: 'description', label: 'Description', showable: false },
  { id: 'diagram-view', label: 'Diagram view', showable: false },
  { id: 'activity-list', label: 'Activity list', showable: true, shown: true },
  { id: 'requirements', label: 'Requirements', showable: true, shown: true },
  { id: 'featured-attrs', label: 'Featured Attributes', showable: true, shown: false, expandable: true },
  { id: 'attributes', label: 'Attributes', showable: false },
  { id: 'variant-management', label: 'Variant Management', showable: true, shown: true },
]

type SavedState = {
  notationSet: string
  sections: PageSection[]
  headerAttrs: { level: boolean; revision: boolean; lastModified: boolean; lastAuthor: boolean }
  countLevel: '1' | '0'
  allowDownload: boolean
}

export default function DiagramPage() {
  const [notationSet, setNotationSet] = useState(NOTATION_SETS[0])
  const [sections, setSections] = useState(INITIAL_SECTIONS)
  const [headerAttrs, setHeaderAttrs] = useState({
    level: true, revision: true, lastModified: true, lastAuthor: true,
  })
  const [countLevel, setCountLevel] = useState<'1' | '0'>('1')
  const [audience, setAudience] = useState('General audience')
  const [allowDownload, setAllowDownload] = useState(true)
  const [isDirty, setIsDirty] = useState(false)
  const [featuredAttrsExpanded, setFeaturedAttrsExpanded] = useState(false)
  const savedState = useRef<SavedState>({
    notationSet: NOTATION_SETS[0],
    sections: INITIAL_SECTIONS,
    headerAttrs: { level: true, revision: true, lastModified: true, lastAuthor: true },
    countLevel: '1',
    allowDownload: true,
  })

  const handleSave = () => {
    savedState.current = { notationSet, sections, headerAttrs, countLevel, allowDownload }
    setIsDirty(false)
  }

  const handleReset = () => {
    const saved = savedState.current
    setNotationSet(saved.notationSet)
    setSections(saved.sections)
    setHeaderAttrs(saved.headerAttrs)
    setCountLevel(saved.countLevel)
    setAllowDownload(saved.allowDownload)
    setIsDirty(false)
  }

  const toggleHeader = (key: keyof typeof headerAttrs) => {
    setHeaderAttrs(prev => ({ ...prev, [key]: !prev[key] }))
    setIsDirty(true)
  }

  const HEADER_ROWS: Array<{ key: keyof typeof headerAttrs; label: string; extra?: React.ReactNode }> = [
    {
      key: 'level', label: 'Level',
      extra: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' }}>
          <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)' }}>Count levels from</Text>
          <RadioButton name="count-level" text="Level 1" checked={countLevel === '1'} onChange={() => { setCountLevel('1'); setIsDirty(true) }} />
          <RadioButton name="count-level" text="Level 0" checked={countLevel === '0'} onChange={() => { setCountLevel('0'); setIsDirty(true) }} />
        </div>
      ),
    },
    { key: 'revision', label: 'Revision' },
    { key: 'lastModified', label: 'Last modified/Last published' },
    { key: 'lastAuthor', label: 'Last author' },
  ]

  const toggleShown = (id: string) => {
    setSections(prev => prev.map(sec => sec.id === id ? { ...sec, shown: !sec.shown } : sec))
    setIsDirty(true)
  }

  const { dragging: draggedIndex, onDragStart, onDragOver, onDragEnd } = useDragReorder(sections, setSections, () => setIsDirty(true))

  return (
    <PageHeader title="Model Page" subtitle="Configure the layout and default content shown on the model detail page." isDirty={isDirty} onSave={handleSave} onReset={handleReset}>
      <StickyNote
        position="right"
        header="Hint on Featured Attributes"
        text='Page Sections > Featured Attributes formerly had this info description:<br><i>Create attribute groups to enable the usage of Featured Attributes.</i><br><b>Hint:</b> Attribute groups are now part of "Asset Types" so the info text was updated including a link to the new location.'
      />
      <AudienceSectionBar value={audience} onChange={setAudience} className={s.narrowContent} />
      <SettingsPageLayout gap="1.5rem">
        <SettingsSection title="Notation Set">
          <div className={s.rowWide}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <Label for="notation-select">Notation set</Label>
              <Select
                id="notation-select"
                style={{ minWidth: '18rem' }}
                onChange={e => { setNotationSet((e.detail.selectedOption as HTMLElement).textContent ?? notationSet); setIsDirty(true) }}
              >
                {NOTATION_SETS.map(n => <Option key={n} selected={n === notationSet}>{n}</Option>)}
              </Select>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection
          title="Header Attributes"
          subtitle="Define attributes that are shown at the top of the diagram page"
        >
          <div className={s.rowNoPad}>
            {HEADER_ROWS.map((row) => (
              <div key={row.key} className={s.dragRow}>
                <CheckBox checked={headerAttrs[row.key]} text={row.label} onChange={() => toggleHeader(row.key)} />
                {row.extra}
              </div>
            ))}
          </div>
        </SettingsSection>

        <SettingsSection
          title="Page Sections"
          subtitle="Configure which sections appear on the model page and in which order"
        >
          <div className={s.rowNoPad} style={{ gap: 0 }}>
            {sections.map((section, index) => (
              <div
                key={section.id}
                draggable
                onDragStart={onDragStart(index)}
                onDragOver={onDragOver(index)}
                onDragEnd={onDragEnd}
                style={{
                  background: draggedIndex === index ? 'var(--sapList_SelectionBackgroundColor)' : 'var(--sapGroup_ContentBackground)',
                  borderTop: index === 0 ? 'none' : '1px solid var(--sapList_BorderColor)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem' }}>
                  <Icon name="horizontal-grip" style={{ color: 'var(--sapContent_NonInteractiveIconColor)', cursor: 'grab', flexShrink: 0 }} />
                  <Text style={{ flex: 1 }}>{section.label}</Text>
                  {section.showable
                    ? <CheckBox checked={section.shown} text="Show on page" onChange={() => toggleShown(section.id)} />
                    : <div style={{ visibility: 'hidden' }}><CheckBox text="Show on page" /></div>
                  }
                  {section.expandable
                    ? <Button
                        icon={section.id === 'featured-attrs' && featuredAttrsExpanded ? 'slim-arrow-up' : 'slim-arrow-down'}
                        design="Transparent"
                        tooltip="Configure section"
                        style={{ flexShrink: 0 }}
                        onClick={() => section.id === 'featured-attrs' && setFeaturedAttrsExpanded(v => !v)}
                      />
                    : <div style={{ visibility: 'hidden' }}><Button icon="slim-arrow-down" design="Transparent" /></div>
                  }
                </div>
                {section.id === 'featured-attrs' && featuredAttrsExpanded && (
                  <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                      <Text style={{ color: 'var(--sapContent_LabelColor)', display: 'block', marginBottom: '0.5rem', fontSize: 'var(--sapFontSmallSize)' }}>
                        Select an attribute group to be shown separately from the rest of the attributes.
                      </Text>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MultiComboBox
                          placeholder="Attribute"
                          style={{ maxWidth: '28rem', width: '100%' }}
                        />
                        <InfoPopover id="featured-attrs-info" header="Featured Attributes">
                          <Text>Create <a href="#/asset-types">attribute groups</a> in Asset Types &gt; Modeling to enable the usage of Featured Attributes.</Text>
                        </InfoPopover>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </SettingsSection>

        <SettingsSection
          title="Download"
          subtitle="Configure whether users can download diagrams from the model page"
        >
          <div className={s.rowWide}>
            <CheckBox
              checked={allowDownload}
              text={`Allow ${audience} users to download diagrams`}
              onChange={() => { setAllowDownload(v => !v); setIsDirty(true) }}
              style={{ marginLeft: '-0.5rem' }}
            />
          </div>
        </SettingsSection>
      </SettingsPageLayout>
    </PageHeader>
  )
}
