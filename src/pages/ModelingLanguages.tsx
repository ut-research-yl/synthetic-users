import { useState, useRef } from 'react'
import { Button, CheckBox, Switch, Text, Title, Menu, MenuItem, Icon, Dialog, Input, Label, Toast, MessageStrip, Panel, ObjectPage, ObjectPageTitle, ObjectPageSection, ObjectPageMode, Bar } from '@ui5/webcomponents-react'
import { SigChipV2 } from '@signavio/sap-signavio-uixtension'
import { clone, ITEM_ICONS, BASE_GROUPS, INITIAL_LANG_GROUPS, type Language, type LangGroup } from './modelingLanguagesData'
import EditAppearanceDialog from './EditAppearanceDialog'

type Tool = 'pm-legacy' | 'modeler'

// Per-item appearance state
type AppearanceState = 'default' | 'style-updated' | 'custom-graphics' | 'both'

const ItemIcon = ({ id, size = 20 }: { id: string; size?: number }) => {
  const iconName = ITEM_ICONS[id]
  if (!iconName) return null
  if (iconName.startsWith('<')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 16 16" fill="none"
        style={{ color: 'var(--sapContent_IconColor)' }}
        dangerouslySetInnerHTML={{ __html: iconName }} />
    )
  }
  return <Icon name={iconName} style={{ width: `${size}px`, height: `${size}px`, color: 'var(--sapContent_IconColor)' }} />
}

const StateChip = ({ state }: { state: AppearanceState }) => {
  if (state === 'default') return null
  const tooltip =
    state === 'both' ? 'Style updated · Custom graphics' :
    state === 'style-updated' ? 'Style updated' :
    'Custom graphics'
  return (
    <div style={{ position: 'absolute', top: '6px', left: '6px' }}>
      <SigChipV2 value="Modified" design="indication10" condensed tooltip={tooltip} />
    </div>
  )
}

const countEnabled = (lang: Language) => lang.groups.reduce((s, g) => s + g.items.filter(i => i.enabled).length, 0)
const countTotal = (lang: Language) => lang.groups.reduce((s, g) => s + g.items.length, 0)

export default function ModelingLanguages() {
  const [tool, setTool] = useState<Tool>('modeler')
  const [langGroups, setLangGroups] = useState<LangGroup[]>(INITIAL_LANG_GROUPS)
  const [selectedId, setSelectedId] = useState('bpmn-basic')
  const [rightView, setRightView] = useState<'elements' | 'appearance'>('elements')
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [addElementSetGroupId, setAddElementSetGroupId] = useState<string | null>(null)
  const [newElementSetName, setNewElementSetName] = useState('')
  const [elementSetToast, setElementSetToast] = useState(false)
  const [groupDisabledToast, setGroupDisabledToast] = useState<string | null>(null)
  const [duplicateLang, setDuplicateLang] = useState<Language | null>(null)
  const [duplicateName, setDuplicateName] = useState('')
  const [duplicateToast, setDuplicateToast] = useState(false)
  const [enabledToast, setEnabledToast] = useState<string | null>(null)
  const [deleteLang, setDeleteLang] = useState<Language | null>(null)
  const [deletedToast, setDeletedToast] = useState<string | null>(null)
  const [itemStates, setItemStates] = useState<Record<string, AppearanceState>>({
    'task': 'style-updated',
    'exclusive-xor-gateway': 'style-updated',
    'inclusive-gateway': 'custom-graphics',
    'parallel-gateway': 'style-updated',
    'collapsed-subprocess': 'both',
    'event-based-gateway': 'both',
  })

  const savedLangGroupsRef = useRef<LangGroup[]>(clone(INITIAL_LANG_GROUPS))
  const rightPanelRef = useRef<HTMLDivElement>(null)

  const selectLang = (id: string) => {
    setSelectedId(id)
    setRightView('elements')
    if (rightPanelRef.current) rightPanelRef.current.scrollTop = 0
  }

  const allLangs = langGroups.flatMap(g => g.languages)
  const selected = allLangs.find(l => l.id === selectedId)!
  const selectedGroup = langGroups.find(g => g.languages.some(l => l.id === selectedId))!

  const updateLang = (langId: string, fn: (l: Language) => Language) =>
    setLangGroups(prev => prev.map(g => ({ ...g, languages: g.languages.map(l => l.id === langId ? fn(l) : l) })))

  const toggleLangGroupExpand = (groupId: string) =>
    setLangGroups(prev => prev.map(g => g.id === groupId ? { ...g, expanded: !g.expanded } : g))

  const toggleLangActive = (langId: string) => {
    updateLang(langId, l => ({ ...l, active: !l.active }))
    setIsDirty(true)
  }

  const toggleGroupExpand = (langId: string, groupId: string) =>
    updateLang(langId, l => ({ ...l, groups: l.groups.map(g => g.id === groupId ? { ...g, expanded: !g.expanded } : g) }))

  const toggleGroupAll = (langId: string, groupId: string) => {
    const group = allLangs.find(l => l.id === langId)!.groups.find(g => g.id === groupId)!
    const allEnabled = group.items.every(i => i.enabled)
    updateLang(langId, l => ({
      ...l, groups: l.groups.map(g => g.id === groupId
        ? { ...g, items: g.items.map(i => ({ ...i, enabled: !allEnabled })) } : g)
    }))
    setIsDirty(true)
  }

  const toggleItem = (langId: string, groupId: string, itemId: string) => {
    updateLang(langId, l => ({
      ...l, groups: l.groups.map(g => g.id === groupId
        ? { ...g, items: g.items.map(i => i.id === itemId ? { ...i, enabled: !i.enabled } : i) } : g)
    }))
    setIsDirty(true)
  }

  const setItemState = (itemId: string, state: AppearanceState) =>
    setItemStates(prev => ({ ...prev, [itemId]: state }))

  const [editAppearanceItem, setEditAppearanceItem] = useState<{ id: string; label: string; initialTab?: string } | null>(null)
  const [itemAppearanceValues, setItemAppearanceValues] = useState<Record<string, { fontSize: number; bold: boolean; italic: boolean; fontColor: string; bgColor: string; borderColor: string }>>({
    'task': { fontSize: 12, bold: false, italic: false, fontColor: '#0070f2', bgColor: '#FFFFFF', borderColor: '#000000' },
    'exclusive-xor-gateway': { fontSize: 12, bold: false, italic: false, fontColor: '#000000', bgColor: '#fff5f5', borderColor: '#bb0000' },
    'parallel-gateway': { fontSize: 12, bold: false, italic: false, fontColor: '#000000', bgColor: '#f0fff0', borderColor: '#000000' },
    'collapsed-subprocess': { fontSize: 12, bold: false, italic: false, fontColor: '#000000', bgColor: '#f5f0ff', borderColor: '#6600cc' },
    'event-based-gateway': { fontSize: 12, bold: false, italic: false, fontColor: '#000000', bgColor: '#fff8f0', borderColor: '#000000' },
  })

  const handleSave = () => {
    savedLangGroupsRef.current = clone(langGroups)
    setIsDirty(false)
  }

  const handleReset = () => {
    setLangGroups(clone(savedLangGroupsRef.current))
    setIsDirty(false)
  }

  const BORDER = '1px solid var(--sapList_BorderColor)'

  const body = (
      <div style={{ paddingBottom: '1rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', border: BORDER, borderRadius: 'var(--sapElement_BorderCornerRadius)', overflow: 'hidden', flex: 1, minHeight: 0 }}>

        {/* Left panel */}
        <div style={{ width: '26rem', flexShrink: 0, borderRight: BORDER, background: 'var(--sapList_Background)', overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderBottom: BORDER }}>
            <Title level="H5">Modeling Languages</Title>
          </div>

          {langGroups.map(group => {
            const allDisabled = group.languages.every(l => !l.active)
            return (
            <div key={group.id}>
              <div
                role="button"
                tabIndex={0}
                className="lang-list-item"
                onClick={() => {
                  setRightView('appearance')
                  if (rightPanelRef.current) rightPanelRef.current.scrollTop = 0
                }}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setRightView('appearance'); if (rightPanelRef.current) rightPanelRef.current.scrollTop = 0 } }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.25rem 0.5rem 1rem', borderBottom: BORDER, opacity: allDisabled ? 0.4 : 1, cursor: 'pointer', userSelect: 'none', background: rightView === 'appearance' ? 'var(--sapList_SelectionBackgroundColor)' : 'var(--sapList_Background)' }}
              >
                <Icon
                  name={group.expanded ? 'navigation-down-arrow' : 'navigation-right-arrow'}
                  style={{ width: '1rem', height: '1rem', cursor: 'pointer', color: 'var(--sapContent_IconColor)', flexShrink: 0 }}
                  onClick={(e: any) => { e.stopPropagation(); toggleLangGroupExpand(group.id) }}
                />
                <Text style={{ flex: 1, fontWeight: '600' }}>{group.label} ({group.languages.length})</Text>
                <Button
                  id={`group-overflow-${group.id}`}
                  icon="overflow"
                  design="Transparent"
                  accessibleName={`Options for ${group.label}`}
                  onClick={(e: any) => { e.stopPropagation(); setOpenMenu(openMenu === group.id ? null : group.id) }}
                />
                <Menu
                  opener={`group-overflow-${group.id}`}
                  open={openMenu === group.id}
                  onClose={() => setOpenMenu(null)}
                  onItemClick={(e: any) => {
                    const text = e.detail?.item?.text
                    setOpenMenu(null)
                    if (text === 'Add Element Set') {
                      setAddElementSetGroupId(group.id)
                      setNewElementSetName('')
                    } else if (text === 'Disable') {
                      setLangGroups(prev => prev.map(g => g.id === group.id
                        ? { ...g, languages: g.languages.map(l => ({ ...l, active: false })) } : g))
                      setIsDirty(true)
                      setGroupDisabledToast(group.label)
                    } else if (text === 'Enable') {
                      setLangGroups(prev => prev.map(g => g.id === group.id
                        ? { ...g, languages: g.languages.map(l => ({ ...l, active: true })) } : g))
                      setIsDirty(true)
                    }
                  }}
                >
                  {allDisabled
                    ? <MenuItem text="Enable" />
                    : <><MenuItem text="Add Element Set" /><MenuItem text="Disable" /></>
                  }
                </Menu>
              </div>

              {group.expanded && group.languages.map((lang) => (
                <div
                  key={lang.id}
                  role="button"
                  tabIndex={0}
                  className="lang-list-item"
                  onClick={() => selectLang(lang.id)}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectLang(lang.id) } }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.5rem 0.25rem 0.5rem 3.5rem',
                    background: (rightView === 'elements' && lang.id === selectedId) ? 'var(--sapList_SelectionBackgroundColor)' : 'var(--sapList_Background)',
                    borderBottom: BORDER,
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px', opacity: lang.active ? 1 : 0.4 }}>
                    <Text style={{ display: 'block', fontWeight: (rightView === 'elements' && lang.id === selectedId) ? '600' : undefined, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {lang.label}
                    </Text>
                    <Text style={{ display: 'block', color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>
                      {lang.variant} · {countEnabled(lang)}/{countTotal(lang)} Elements
                    </Text>
                  </div>
                  <Button
                    id={`lang-overflow-${lang.id}`}
                    icon="overflow"
                    design="Transparent"
                    accessibleName={`Options for ${lang.label}`}
                    style={{ opacity: lang.active ? 1 : 0.4 }}
                    onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === lang.id ? null : lang.id) }}
                  />
                  <Menu
                    opener={`lang-overflow-${lang.id}`}
                    open={openMenu === lang.id}
                    onClose={() => setOpenMenu(null)}
                    onItemClick={(e: any) => {
                      const text = e.detail?.item?.text
                      setOpenMenu(null)
                      if (text === 'Enable') {
                        updateLang(lang.id, l => ({ ...l, active: true }))
                        setIsDirty(true)
                        setEnabledToast(lang.label)
                      } else if (text === 'Disable') {
                        updateLang(lang.id, l => ({ ...l, active: false }))
                        setIsDirty(true)
                        setGroupDisabledToast(lang.label)
                      } else if (text === 'Delete') {
                        setDeleteLang(lang)
                      } else if (text === 'Duplicate') {
                        setDuplicateLang(lang)
                        setDuplicateName(`${lang.label}_copy`)
                      }
                    }}
                  >
                    {lang.active ? (
                      lang.variant === 'Default' ? (
                        <>
                          <MenuItem text="Duplicate" />
                          <MenuItem text="Delete" />
                        </>
                      ) : (
                        <>
                          <MenuItem text="Rename" />
                          <MenuItem text="Duplicate" />
                          <MenuItem text="Disable" />
                          <MenuItem text="Delete" />
                        </>
                      )
                    ) : lang.variant === 'Default' ? (
                      <MenuItem text="Enable" />
                    ) : (
                      <>
                        <MenuItem text="Enable" />
                        <MenuItem text="Delete" />
                      </>
                    )}
                  </Menu>
                </div>
              ))}
            </div>
          )})}
        </div>

        {/* Right panel */}
        <div ref={rightPanelRef} style={{ flex: 1, background: 'var(--sapList_Background)', minWidth: 0, overflowY: 'auto' }}>

          {rightView === 'elements' ? (
            <>
              <div style={{ padding: '0.75rem 1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                  <Title level="H5" style={{ fontStyle: selected.label ? 'normal' : 'italic' } as React.CSSProperties}>{selected.label}</Title>
                  <Switch checked={selected.active} onChange={() => toggleLangActive(selected.id)} />
                </div>
                <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: '14px' }}>
                  {'Usage: '}
                  <Text style={{ fontSize: '14px' }}>{countEnabled(selected)} of {countTotal(selected)} elements enabled</Text>
                  {'  ·  Last Modified: '}
                  <Text style={{ fontSize: '14px' }}>{selected.lastModified}</Text>
                </Text>
              </div>

              <div style={{ borderTop: BORDER }}>
              {selected.groups.map((group, groupIdx) => {
                const enabledCount = group.items.filter(i => i.enabled).length
                const allEnabled = enabledCount === group.items.length
                const noneEnabled = enabledCount === 0
                const isLastGroup = groupIdx === selected.groups.length - 1

                return (
                  <div key={group.id}>
                    <div
                      className="element-row"
                      onClick={() => toggleGroupExpand(selected.id, group.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderBottom: (!group.expanded && isLastGroup) ? 'none' : BORDER, cursor: 'pointer', userSelect: 'none' }}
                    >
                      <Icon
                        name={group.expanded ? 'navigation-down-arrow' : 'navigation-right-arrow'}
                        style={{ width: '1rem', height: '1rem', color: 'var(--sapContent_IconColor)', flexShrink: 0, opacity: selected.active ? 1 : 0.4 }}
                      />
                      <CheckBox
                        checked={allEnabled || (!allEnabled && !noneEnabled)}
                        indeterminate={!allEnabled && !noneEnabled}
                        accessibleName={`Toggle all items in ${group.label}`}
                        onChange={() => toggleGroupAll(selected.id, group.id)}
                        onClick={(e: any) => e.stopPropagation()}
                        style={{ opacity: selected.active ? 1 : 0.4 }}
                      />
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', opacity: selected.active ? 1 : 0.4 }}>
                        <Text style={{ display: 'block', fontWeight: '600' }}>{group.label} ({group.items.length})</Text>
                        <Text style={{ display: 'block', color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>
                          {allEnabled ? `${enabledCount} enabled` : noneEnabled ? `${group.items.length} disabled` : `${enabledCount} enabled · ${group.items.length - enabledCount} disabled`}
                        </Text>
                      </div>
                    </div>

                    {group.expanded && group.items.map((item, itemIdx) => {
                      const isLastItem = itemIdx === group.items.length - 1
                      return (
                        <div
                          key={item.id}
                          className="element-row"
                          onClick={() => toggleItem(selected.id, group.id, item.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            padding: '0.5rem 1rem 0.5rem 5.5rem',
                            background: 'var(--sapList_Background)',
                            borderBottom: (!isLastItem || !isLastGroup) ? BORDER : 'none',
                            cursor: 'pointer',
                            userSelect: 'none',
                          }}
                        >
                          <CheckBox checked={item.enabled} accessibleName={item.label} onChange={() => toggleItem(selected.id, group.id, item.id)} onClick={(e: any) => e.stopPropagation()} style={{ opacity: selected.active ? 1 : 0.4 }} />
                          <div style={{
                            width: '48px', height: '48px', flexShrink: 0,
                            border: '1px solid var(--sapGroup_ContentBorderColor)',
                            borderRadius: '8px',
                            opacity: item.enabled ? (selected.active ? 1 : 0.4) : 0.4,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <ItemIcon id={item.id} />
                          </div>
                          <Text style={{ opacity: item.enabled ? (selected.active ? 1 : 0.4) : 0.4 }}>{item.label}</Text>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
              </div>
            </>
          ) : (
            /* Appearance view */
            <>
              <div style={{ padding: '0.75rem 1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                  <Title level="H5">{selectedGroup.label}</Title>
                  <Switch
                    checked={!selectedGroup.languages.every(l => !l.active)}
                    onChange={() => {
                      const allActive = selectedGroup.languages.every(l => l.active)
                      setLangGroups(prev => prev.map(g => g.id === selectedGroup.id
                        ? { ...g, languages: g.languages.map(l => ({ ...l, active: !allActive })) }
                        : g
                      ))
                      setIsDirty(true)
                    }}
                  />
                </div>
                <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: '14px' }}>
                  {'Last Modified: '}
                  <Text style={{ fontSize: '14px' }}>{selected.lastModified}</Text>
                </Text>
              </div>

              {/* Info strip */}
              <div style={{ padding: '0.75rem 1rem' }}>
                <MessageStrip design="Information" hideCloseButton>
                  Customize the appearance of all shapes in this modeling language, including custom graphics. Changes apply across the entire modeling language.
                </MessageStrip>
              </div>

              {/* Groups */}
              <div style={{ padding: '0 1rem' }}>
              {BASE_GROUPS.map(group => (
                <Panel key={group.id} headerText={group.label} style={{ borderLeft: 'none', borderRight: 'none', borderBottom: 'none' }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
                    gap: '0',
                  }}>
                      {group.items.map(item => {
                        const state = itemStates[item.id] ?? 'default'
                        const menuId = `shape-menu-${item.id}`
                        return (
                          <div
                            key={item.id}
                            className="shape-card"
                            style={{
                                position: 'relative',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              padding: '36px 8px 8px',
                              border: BORDER,
                              borderRadius: '8px',
                              background: 'var(--sapBaseColor)',
                              margin: '3px',
                              minHeight: '180px',
                            }}
                          >
                            {/* State chip — absolute top-left */}
                            {state !== 'default' && <StateChip state={state} />}

                            {/* Overflow menu top-right */}
                            <div style={{ position: 'absolute', top: '2px', right: '2px' }}>
                              <Button
                                id={menuId}
                                icon="overflow"
                                design="Transparent"
                                accessibleName={`Options for ${item.label}`}
                                onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === item.id ? null : item.id) }}
                              />
                              <Menu
                                opener={menuId}
                                open={openMenu === item.id}
                                onClose={() => setOpenMenu(null)}
                                onItemClick={(e: any) => {
                                  const text = e.detail?.item?.text
                                  setOpenMenu(null)
                                  if (text === 'Edit style') setEditAppearanceItem({ id: item.id, label: item.label })
                                  else if (text === 'Upload custom graphics') setEditAppearanceItem({ id: item.id, label: item.label, initialTab: 'custom-graphics' })
                                  else if (text === 'Restore to default') setItemState(item.id, 'default')
                                }}
                              >
                                <MenuItem text="Edit style" />
                                {['additional-participant', 'data-object', 'it-system'].includes(item.id) && <MenuItem text="Upload custom graphics" />}
                              </Menu>
                            </div>

                            {/* Icon */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <ItemIcon id={item.id} size={42} />
                            </div>

                            {/* Label */}
                            <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)', textAlign: 'center', lineHeight: '1.3', paddingBottom: '0.5rem' }}>
                              {item.label}
                            </Text>
                          </div>
                      )
                    })}
                  </div>
                </Panel>
              ))}
              </div>
            </>
          )}
        </div>
      </div>
      </div>
  )

  return (
    <>
    <ObjectPage
      style={{ height: '100%' } as React.CSSProperties}
      mode={ObjectPageMode.IconTabBar}
      hidePinButton
      selectedSectionId={tool}
      onSelectedSectionChange={(e: any) => {
        const idx = e.detail?.selectedSectionIndex ?? 0
        setTool(idx === 0 ? 'modeler' : 'pm-legacy')
      }}
      titleArea={
        <ObjectPageTitle
          header="Modeling Languages and Elements"
          subHeader="Configure which modeling languages and elements are available in your workspace."
        />
      }
      footerArea={isDirty ? (
        <Bar design="FloatingFooter">
          <Button slot="endContent" design="Emphasized" onClick={handleSave}>Save</Button>
          <Button slot="endContent" onClick={handleReset}>Discard Changes</Button>
        </Bar>
      ) : undefined}
    >
      <ObjectPageSection id="modeler" titleText="Modeler" hideTitleText>
        <div style={{ padding: '1rem 0 16px' }}>
          <MessageStrip design="Critical" hideCloseButton>
            This configuration applies to <strong>the New Process Modeler only.</strong> It has no effect on the Old Process Modeler.
          </MessageStrip>
        </div>
        {body}
      </ObjectPageSection>
      <ObjectPageSection id="pm-legacy" titleText="Process Manager (legacy)" hideTitleText>
        <div style={{ padding: '1rem 0 16px' }}>
          <MessageStrip design="Critical" hideCloseButton>
            This configuration applies to <strong>the Old Process Modeler only.</strong> It has no effect on the New Process Modeler.
          </MessageStrip>
        </div>
        {body}
      </ObjectPageSection>
    </ObjectPage>

      <Dialog open={addElementSetGroupId !== null} onClose={() => setAddElementSetGroupId(null)} headerText="Add Element Set">
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '28rem' }}>
          <Label for="element-set-name-input">Element Set Name:</Label>
          <Input id="element-set-name-input" placeholder="Enter a name for the new element set." value={newElementSetName} onInput={(e: any) => setNewElementSetName(e.target.value)} style={{ width: '100%' }} />
        </div>
        <div slot="footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', width: '100%', padding: '0.5rem 0' }}>
          <Button design="Emphasized" onClick={() => {
            if (!newElementSetName.trim() || !addElementSetGroupId) return
            const newLang: Language = {
              id: `custom-${Date.now()}`, label: newElementSetName.trim(), variant: 'Custom', active: true,
              lastModified: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
              groups: clone(BASE_GROUPS),
            }
            setLangGroups(prev => prev.map(g => g.id === addElementSetGroupId ? { ...g, languages: [...g.languages, newLang] } : g))
            setIsDirty(true); setAddElementSetGroupId(null); setElementSetToast(true)
          }}>Add</Button>
          <Button design="Transparent" onClick={() => setAddElementSetGroupId(null)}>Cancel</Button>
        </div>
      </Dialog>

      <Toast open={elementSetToast} placement="BottomCenter" onClose={() => setElementSetToast(false)}>Element set added</Toast>
      <Toast open={groupDisabledToast !== null} placement="BottomCenter" onClose={() => setGroupDisabledToast(null)}>"{groupDisabledToast}" disabled</Toast>
      <Toast open={duplicateToast} placement="BottomCenter" onClose={() => setDuplicateToast(false)}>Element set duplicated</Toast>
      <Toast open={enabledToast !== null} placement="BottomCenter" onClose={() => setEnabledToast(null)}>"{enabledToast}" enabled</Toast>
      <Toast open={deletedToast !== null} placement="BottomCenter" onClose={() => setDeletedToast(null)}>"{deletedToast}" deleted</Toast>

      <Dialog open={deleteLang !== null} onClose={() => setDeleteLang(null)} className="delete-message-box">
        <div slot="header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', width: '100%' }}>
          <Icon name="alert" style={{ color: 'var(--sapCriticalElementColor)', width: '1.25rem', height: '1.25rem' }} />
          <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontLargeSize)' }}>Delete</Text>
        </div>
        <div style={{ padding: '1rem', minWidth: '24rem' }}>
          <Text>This element set will be permanently deleted.</Text>
        </div>
        <div slot="footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', width: '100%', padding: '0.5rem 0' }}>
          <Button design="Negative" onClick={() => {
            if (!deleteLang) return
            setLangGroups(prev => prev.map(g => ({ ...g, languages: g.languages.filter(l => l.id !== deleteLang.id) })))
            setIsDirty(true); setDeletedToast(deleteLang.label)
            if (selectedId === deleteLang.id) {
              const remaining = langGroups.flatMap(g => g.languages).filter(l => l.id !== deleteLang.id)
              if (remaining.length > 0) selectLang(remaining[0].id)
            }
            setDeleteLang(null)
          }}>Delete</Button>
          <Button design="Transparent" onClick={() => setDeleteLang(null)}>Cancel</Button>
        </div>
      </Dialog>

      <Dialog open={duplicateLang !== null} onClose={() => setDuplicateLang(null)} headerText="Duplicate Element Set">
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '28rem' }}>
          <Label for="duplicate-name-input">New Element Set Name:</Label>
          <Input id="duplicate-name-input" value={duplicateName} onInput={(e: any) => setDuplicateName(e.target.value)} style={{ width: '100%' }} />
        </div>
        <div slot="footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', width: '100%', padding: '0.5rem 0' }}>
          <Button design="Emphasized" onClick={() => {
            if (!duplicateName.trim() || !duplicateLang) return
            const newLang: Language = {
              ...clone(duplicateLang), id: `custom-${Date.now()}`, label: duplicateName.trim(), variant: 'Custom',
              lastModified: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            }
            setLangGroups(prev => prev.map(g => ({
              ...g, languages: g.languages.find(l => l.id === duplicateLang.id) ? [...g.languages, newLang] : g.languages
            })))
            setIsDirty(true); setDuplicateLang(null); setDuplicateToast(true)
          }}>Duplicate</Button>
          <Button design="Transparent" onClick={() => setDuplicateLang(null)}>Cancel</Button>
        </div>
      </Dialog>

      <EditAppearanceDialog
        open={editAppearanceItem !== null}
        itemId={editAppearanceItem?.id ?? ''}
        itemLabel={editAppearanceItem?.label ?? ''}
        showCustomGraphics={['additional-participant', 'data-object', 'it-system'].includes(editAppearanceItem?.id ?? '')}
        initialTab={editAppearanceItem?.initialTab}
        onClose={() => setEditAppearanceItem(null)}
        initialValues={editAppearanceItem ? itemAppearanceValues[editAppearanceItem.id] : undefined}
        onApply={(v) => {
          const id = editAppearanceItem?.id ?? ''
          setItemState(id, 'style-updated')
          setItemAppearanceValues(prev => ({ ...prev, [id]: v }))
        }}
        onRestoreDefault={() => {
          const id = editAppearanceItem?.id ?? ''
          setItemState(id, 'default')
          setItemAppearanceValues(prev => { const n = { ...prev }; delete n[id]; return n })
        }}
      />
    </>
  )
}
