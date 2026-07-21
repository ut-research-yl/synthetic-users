import { useState, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { List, ListItemStandard, CheckBox, Button, Text } from '@ui5/webcomponents-react'
import PageHeader from '../components/PageHeader'

const USER_GROUPS = [
  'Administrators',
  'Analysts',
  'Human Resources',
  'Modelers',
  'Process Owners',
  'Business Architects',
  'Compliance Officers',
  'External Reviewers',
  'Finance Controllers',
  'IT Operations',
  'Legal Team',
  'Process Viewers',
]

type Feature = { id: string; name: string; desc?: string; disabled?: boolean }

const ALL_FEATURES: Feature[] = [
  { id: 'bpmn', name: 'Modeling: Create and Edit BPMN Models', desc: 'When this option is disabled, other types of models can still be edited.' },
  { id: 'import_export', name: 'Modeling: Import/Export Models', desc: 'Import and export models in formats that can be transferred between workspaces and tools.' },
  { id: 'dict', name: 'Modeling: Import/Export Dictionary Entries', desc: 'Import and export dictionary entries from Microsoft Excel (XLSX) spreadsheets.' },
  { id: 'upload', name: 'Modeling: Upload Files', desc: 'Upload files to the workspace. Uses up workspace storage.' },
  { id: 'joule_desc', name: 'Modeling – Joule: Generate Process Description', desc: 'Get a description of a given process.' },
  { id: 'dmn', name: 'Modeling – Decision Manager: Create DMN Models', desc: 'Full DMN modeling: decision requirements, decision logic, simulation, test lab, and import/export.' },
  { id: 'dmn_req', name: 'Modeling – Decision Manager: Create DMN Requirements Models', desc: 'Decision requirements modeling only, without decision logic.' },
  { id: 'dmn_drools', name: 'Modeling – Decision Manager: Export Drools', desc: 'Export decision tables and models as drools rules.' },
  { id: 'my_overview', name: 'Browsing: Access My Process Overview', desc: 'Get a snapshot of your resources depending on your role.' },
  { id: 'joule_questions', name: 'Browsing – Joule: Ask Specific Questions About Processes', desc: 'Ask questions about any published BPMN model, including its attributes, description, and the process model itself.' },
  { id: 'joule_compare', name: 'Browsing – Joule: Compare Two Processes', desc: 'Compare two different process models, or compare the latest published revision with an earlier revision of the same process model.' },
  { id: 'ppi_recommender', name: 'Browsing: Access AI-Assisted Performance Indicators Recommender', desc: 'Provides recommendations on process performance indicators (PPIs). Manageable in AI Services.', disabled: true },
  { id: 'process_recommender', name: 'Browsing: Access AI-Assisted Process Recommender', desc: 'Recommends process models from your workspace or a pre-configured database. Manageable in AI Services.', disabled: true },
  { id: 'pi_access', name: 'Access SAP Signavio Process Intelligence' },
  { id: 'pi_create', name: 'SAP Signavio Process Intelligence: Create Process', desc: 'Create and use a process to evaluate, benchmark, and measure your business process performance using quantifiable measures.' },
  { id: 'pi_data_int', name: 'SAP Signavio Process Intelligence: Access Data Integration', desc: 'Access connections, source data, and on-premises extractors.' },
  { id: 'pi_data_mod', name: 'SAP Signavio Process Intelligence: Access Data Modeling', desc: 'Access process data pipelines to model and transform data for process analysis.' },
  { id: 'pi_odata', name: 'SAP Signavio Process Intelligence: Access SIGNAL OData API', desc: 'Access analytical results in SAP Signavio Process Intelligence via third-party systems.' },
  { id: 'pi_widget', name: 'SAP Signavio Process Intelligence: Export Widget Data', desc: 'Export widget data from SAP Signavio Process Intelligence.' },
  { id: 'governance', name: 'Access SAP Signavio Process Governance', desc: 'Use approval workflows and process governance capabilities.' },
  { id: 'collaboration', name: 'Collaboration: Comment on Diagrams', desc: 'Add and view comments on process diagrams.' },
  { id: 'publish', name: 'Publishing: Publish Diagrams to Hub', desc: 'Publish approved diagrams to the SAP Signavio Process Collaboration Hub.' },
]

const BUSINESS_ARCHITECTS_DEFAULTS = new Set(['bpmn', 'import_export', 'upload', 'dmn', 'dmn_req', 'dmn_drools', 'pi_access', 'pi_create', 'collaboration', 'publish'])

const initialGroupFeatures = (): Record<string, Record<string, boolean>> =>
  USER_GROUPS.reduce((acc, g) => ({
    ...acc,
    [g]: ALL_FEATURES.reduce((fa, f) => ({
      ...fa,
      [f.id]: g === 'Administrators'
        ? true
        : g === 'Business Architects'
          ? BUSINESS_ARCHITECTS_DEFAULTS.has(f.id)
          : false,
    }), {}),
  }), {})

export default function FeatureAccess() {
  const [searchParams] = useSearchParams()
  const initialGroup = searchParams.get('group') ?? 'Business Architects'
  const [selectedGroup, setSelectedGroup] = useState(USER_GROUPS.includes(initialGroup) ? initialGroup : 'Business Architects')
  const [groupFeatures, setGroupFeatures] = useState(initialGroupFeatures)
  const [isDirty, setIsDirty] = useState(false)
  const savedFeatures = useRef<Record<string, Record<string, boolean>>>(initialGroupFeatures())

  const mutateFeatures = (updater: (prev: Record<string, Record<string, boolean>>) => Record<string, Record<string, boolean>>) => {
    setGroupFeatures(updater)
    setIsDirty(true)
  }

  const handleSave = () => {
    savedFeatures.current = groupFeatures
    setIsDirty(false)
  }

  const handleReset = () => {
    setGroupFeatures(savedFeatures.current)
    setIsDirty(false)
  }

  const isAdmin = selectedGroup === 'Administrators'
  const features = groupFeatures[selectedGroup] ?? {}
  const activeFeatures = ALL_FEATURES.filter(f => !f.disabled)
  const checkedCount = activeFeatures.filter(f => features[f.id]).length

  const toggle = (id: string) => {
    if (isAdmin) return
    mutateFeatures(prev => ({
      ...prev,
      [selectedGroup]: { ...prev[selectedGroup], [id]: !prev[selectedGroup][id] },
    }))
  }

  const selectAll = () => {
    if (isAdmin) return
    mutateFeatures(prev => ({
      ...prev,
      [selectedGroup]: ALL_FEATURES.reduce((acc, f) => ({ ...acc, [f.id]: true }), {}),
    }))
  }

  const unselectAll = () => {
    if (isAdmin) return
    mutateFeatures(prev => ({
      ...prev,
      [selectedGroup]: ALL_FEATURES.reduce((acc, f) => ({ ...acc, [f.id]: false }), {}),
    }))
  }

  return (
    <PageHeader title="Feature Access" subtitle="Enable or disable product features per user group." isDirty={isDirty} onSave={handleSave} onReset={handleReset}>
      <div style={{
          display: 'flex',
          border: '1px solid var(--sapList_BorderColor)',
          borderRadius: 'var(--sapElement_BorderCornerRadius)',
          overflow: 'hidden',
          background: 'var(--sapList_Background)',
        }}>

          {/* Master: User Groups */}
          <div style={{
            flex: '0 0 17rem',
            borderRight: '1px solid var(--sapList_BorderColor)',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--sapList_BorderColor)' }}>
              <Text style={{ fontWeight: '700', fontSize: 'var(--sapFontLargeSize)', color: 'var(--sapTextColor)' }}>
                User Groups ({USER_GROUPS.length})
              </Text>
            </div>
            <List separators="Inner">
              {USER_GROUPS.map(g => (
                <ListItemStandard key={g} selected={selectedGroup === g} onClick={() => setSelectedGroup(g)}>
                  {g}
                </ListItemStandard>
              ))}
            </List>
          </div>

          {/* Detail: Feature Sets */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

            {/* Group header */}
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--sapList_BorderColor)' }}>
              <Text style={{ display: 'block', fontWeight: '700', fontSize: 'var(--sapFontHeader3Size)', marginBottom: '0.25rem', color: 'var(--sapTextColor)' }}>
                {selectedGroup}
              </Text>
              <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>
                Select the feature sets that the selected user group is allowed to access.
              </Text>
            </div>

            {/* Feature sets toolbar */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0.5rem 1.5rem',
              borderBottom: '1px solid var(--sapList_BorderColor)',
            }}>
              <Text style={{ fontWeight: '600' }}>
                Feature Sets ({checkedCount} / {ALL_FEATURES.length})
              </Text>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button design="Transparent" disabled={isAdmin} onClick={selectAll}>Select All</Button>
                <Button design="Transparent" disabled={isAdmin} onClick={unselectAll}>Unselect All</Button>
              </div>
            </div>

            {/* Feature rows */}
            <div>
              {ALL_FEATURES.map((f, i) => {
                const checked = isAdmin || (features[f.id] ?? false)
                const disabled = isAdmin || !!f.disabled
                return (
                  <div
                    key={f.id}
                    role="button"
                    tabIndex={disabled ? -1 : 0}
                    onClick={() => !disabled && toggle(f.id)}
                    onKeyDown={(e: React.KeyboardEvent) => { if (!disabled && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); toggle(f.id) } }}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.25rem',
                      padding: '0.5rem 1.5rem',
                      borderBottom: i < ALL_FEATURES.length - 1 ? '1px solid var(--sapList_BorderColor)' : 'none',
                      background: checked && !f.disabled ? 'var(--sapList_SelectionBackgroundColor)' : 'var(--sapList_Background)',
                      cursor: disabled ? 'default' : 'pointer',
                      opacity: f.disabled ? 0.5 : 1,
                    }}
                  >
                    <CheckBox checked={checked} disabled={disabled} accessibleName={f.name} onChange={() => toggle(f.id)} />
                    <div style={{ paddingTop: '0.125rem' }}>
                      <Text style={{ display: 'block', fontWeight: '600', fontSize: 'var(--sapFontSize)' }}>{f.name}</Text>
                      {f.desc && (
                        <Text style={{ display: 'block', color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>{f.desc}</Text>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
    </PageHeader>
  )
}
