import { useState, useRef } from 'react'
import {
  Card, Text, Label, CheckBox, Select, Option,
  Button, Input, Icon, MessageStrip, Dialog, Bar, Popover,
  Table, TableHeaderRow, TableHeaderCell, TableRow, TableCell,
  Link, Title,
} from '@ui5/webcomponents-react'
import { SigChipV2 } from '@signavio/sap-signavio-uixtension'
import PageHeader from '../components/PageHeader'
import SettingsPageLayout from '../components/SettingsPageLayout'

const TIMESPAN_OPTIONS = ['Never', 'Fixed period', 'Defined via a custom attribute (type: number)']

type JMWorkflow = { id: string; name: string; participants: string }
const INITIAL_JM_WORKFLOWS: JMWorkflow[] = [
  { id: 'jm1', name: 'JM approval_Parte Deux', participants: 'Journey owner' },
  { id: 'jm2', name: 'JM Approval - Parte Troi', participants: 'Role_01, Role_02' },
  { id: 'jm3', name: 'Denise example process', participants: 'Journey Modeler, Journey Owner, John Doe' },
]

type Workflow = { id: string; name: string; processArea: string; owner: string; lastModified: string }
const WORKFLOWS: Workflow[] = [
  { id: 'wf1', name: 'Invoice approval V3.5', processArea: 'Finance', owner: 'Charlotte Hojby', lastModified: '2 days ago' },
  { id: 'wf2', name: 'Purchase Order Approval', processArea: 'Procurement', owner: 'Klaus Cole', lastModified: '10 days ago' },
  { id: 'wf3', name: 'HR Onboarding Sign-off', processArea: 'HR', owner: 'John Miller', lastModified: '2 weeks ago' },
  { id: 'wf4', name: 'Travel Expense Review', processArea: 'Finance', owner: 'Will Shi', lastModified: '2 months ago' },
  { id: 'wf5', name: 'Contract Approval Flow', processArea: 'Legal', owner: 'Steve Gallion', lastModified: '6 months ago' },
]

type DiagramState = {
  id: string
  name: string
  icon: string
  publishInHub: boolean
  resetExpiration: boolean
}

const DEFAULT_ICON = 'document'

const ICON_OPTIONS = [
  'accept', 'decline', 'flag', 'settings', 'world', 'document', 'task',
  'approvals', 'workflow-tasks', 'process', 'status-positive', 'status-negative',
  'status-in-process', 'status-error', 'pending', 'complete', 'locked', 'unlocked',
]

const INITIAL_STATES: DiagramState[] = [
  { id: '1', name: 'in progress', icon: 'settings', publishInHub: false, resetExpiration: false },
  { id: '2', name: 'approved', icon: 'accept', publishInHub: false, resetExpiration: true },
  { id: '3', name: 'reviewed by CoE', icon: 'flag', publishInHub: false, resetExpiration: false },
  { id: '4', name: 'rejected', icon: 'decline', publishInHub: false, resetExpiration: false },
  { id: '5', name: 'published', icon: 'world', publishInHub: true, resetExpiration: false },
]

type Participant = { id: string; role: string; attribute: string }

const INITIAL_PARTICIPANTS: Participant[] = [
  { id: '1', role: 'Process Owner', attribute: 'Process Owner TEST' },
  { id: '2', role: 'Process Participant 1', attribute: 'Process Name' },
  { id: '3', role: 'Process Participant 2', attribute: '-----' },
]

const ATTRIBUTE_OPTIONS = ['-----', 'Process Owner TEST', 'Process Name', 'Process Manager', 'Process Expert']
const WORKFLOW_OPTIONS = ['Select Workflow', 'Approval 1', 'Approval Parte Deux']
const CUSTOM_ATTRIBUTE_OPTIONS = ['Select attribute', 'Process Owner TEST', 'Process Name', 'Process Manager']

const DIVIDER = <div style={{ borderTop: '1px solid var(--sapList_BorderColor)' }} />

function CardHeader({ title, subline, noDivider }: { title: string; subline: string; noDivider?: boolean }) {
  return (
    <>
      <div style={{ padding: '1rem 1rem 0.75rem' }}>
        <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontLargeSize)', color: 'var(--sapTextColor)', display: 'block' }}>{title}</Text>
        <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSize)', marginTop: '0.25rem', display: 'block' }}>{subline}</Text>
      </div>
      {!noDivider && DIVIDER}
    </>
  )
}

export default function ApprovalWorkflows() {
  const [isDirty, setIsDirty] = useState(false)
  const [jmWorkflows] = useState<JMWorkflow[]>(INITIAL_JM_WORKFLOWS)

  const savedUseWorkflowPermissions = useRef(false)
  const savedDiagramStates = useRef<DiagramState[]>(INITIAL_STATES)
  const savedParticipants = useRef<Participant[]>(INITIAL_PARTICIPANTS)
  const savedTimespan = useRef('Never')
  const savedNumberOfMonths = useRef('12')
  const savedWorkflow = useRef('Select Workflow')
  const savedCustomAttribute = useRef('Select attribute')
  const savedFallbackMonths = useRef('12')

  const [useWorkflowPermissions, setUseWorkflowPermissions] = useState(false)
  const [diagramStates, setDiagramStates] = useState<DiagramState[]>(INITIAL_STATES)
  const [participants, setParticipants] = useState<Participant[]>(INITIAL_PARTICIPANTS)
  const [timespan, setTimespan] = useState('Never')
  const [numberOfMonths, setNumberOfMonths] = useState('12')
  const [workflow, setWorkflow] = useState('Select Workflow')
  const [customAttribute, setCustomAttribute] = useState('Select attribute')
  const [fallbackMonths, setFallbackMonths] = useState('12')

  // Delete confirmation
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const deleteTarget = diagramStates.find(s => s.id === deleteTargetId)

  // Icon picker
  const [iconPickerId, setIconPickerId] = useState<string | null>(null)

  const handleSave = () => {
    savedUseWorkflowPermissions.current = useWorkflowPermissions
    savedDiagramStates.current = diagramStates
    savedParticipants.current = participants
    savedTimespan.current = timespan
    savedNumberOfMonths.current = numberOfMonths
    savedWorkflow.current = workflow
    savedCustomAttribute.current = customAttribute
    savedFallbackMonths.current = fallbackMonths
    setIsDirty(false)
  }

  const handleReset = () => {
    setUseWorkflowPermissions(savedUseWorkflowPermissions.current)
    setDiagramStates(savedDiagramStates.current)
    setParticipants(savedParticipants.current)
    setTimespan(savedTimespan.current)
    setNumberOfMonths(savedNumberOfMonths.current)
    setWorkflow(savedWorkflow.current)
    setCustomAttribute(savedCustomAttribute.current)
    setFallbackMonths(savedFallbackMonths.current)
    setIsDirty(false)
  }

  const toggleStateField = (id: string, field: 'publishInHub' | 'resetExpiration') => {
    setDiagramStates(prev => prev.map(s => s.id === id ? { ...s, [field]: !s[field] } : s))
    setIsDirty(true)
  }

  const confirmDelete = () => {
    if (!deleteTargetId) return
    setDiagramStates(prev => prev.filter(s => s.id !== deleteTargetId))
    setDeleteTargetId(null)
    setIsDirty(true)
  }

  const addState = () => {
    const newId = String(Date.now())
    setDiagramStates(prev => [...prev, {
      id: newId,
      name: 'New state',
      icon: DEFAULT_ICON,
      publishInHub: false,
      resetExpiration: false,
    }])
    setIsDirty(true)
  }

  const updateStateName = (id: string, name: string) => {
    setDiagramStates(prev => prev.map(s => s.id === id ? { ...s, name } : s))
    setIsDirty(true)
  }

  const updateStateIcon = (id: string, icon: string) => {
    setDiagramStates(prev => prev.map(s => s.id === id ? { ...s, icon } : s))
    setIconPickerId(null)
    setIsDirty(true)
  }

  const updateParticipantAttribute = (id: string, attribute: string) => {
    setParticipants(prev => prev.map(p => p.id === id ? { ...p, attribute } : p))
    setIsDirty(true)
  }

  return (
    <PageHeader title="Approval Workflows" subtitle="Define and manage approval steps for publishing process models." isDirty={isDirty} onSave={handleSave} onReset={handleReset}>
      <SettingsPageLayout gap="2rem">

        <Title level="H4" size="H4">Process Model Approvals</Title>

        {/* ── Configured Approval Workflows ── */}
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <CardHeader
              title="Approval Workflows"
              subline={`${WORKFLOWS.length} approval workflows are configured in this workspace.`}
              noDivider
            />
            <Table
              overflowMode="Popin"
              headerRow={
                <TableHeaderRow>
                  <TableHeaderCell width="1fr">Workflow Name</TableHeaderCell>
                  <TableHeaderCell width="160px" importance={2} popinText="Process Area">Process Area</TableHeaderCell>
                  <TableHeaderCell width="180px" importance={1} popinText="Owner">Owner</TableHeaderCell>
                  <TableHeaderCell width="140px" importance={0} popinText="Last Modified">Last Modified</TableHeaderCell>
                </TableHeaderRow>
              }
            >
              {WORKFLOWS.map(wf => (
                <TableRow key={wf.id}>
                  <TableCell><Link href="#">{wf.name}</Link></TableCell>
                  <TableCell><SigChipV2 value={wf.processArea} design="information" condensed /></TableCell>
                  <TableCell><Text>{wf.owner}</Text></TableCell>
                  <TableCell><Text>{wf.lastModified}</Text></TableCell>
                </TableRow>
              ))}
            </Table>
          </div>
        </Card>

        {/* ── Diagram States ── */}
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <CardHeader
              title="Diagram States"
              subline='Assign icons and states to diagram revisions. "Publish" auto-publishes diagrams when this state is reached; "Reset expiration" recalculates the expiry date.'
              noDivider
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Table
                headerRow={
                  <TableHeaderRow>
                    <TableHeaderCell width="1fr">Name</TableHeaderCell>
                    <TableHeaderCell width="110px">Icon</TableHeaderCell>
                    <TableHeaderCell width="80px">Publish</TableHeaderCell>
                    <TableHeaderCell width="100px">Reset expiration</TableHeaderCell>
                    <TableHeaderCell width="48px" />
                  </TableHeaderRow>
                }
              >
                {diagramStates.map(state => (
                  <TableRow key={state.id}>
                    <TableCell>
                      <Input
                        value={state.name}
                        style={{ width: '100%' }}
                        accessibleName="State name"
                        onInput={e => updateStateName(state.id, (e.target as unknown as HTMLInputElement).value)}
                      />
                    </TableCell>
                    <TableCell>
                      <div style={{ cursor: 'pointer', display: 'inline-flex' }}>
                        <SigChipV2
                          id={`icon-chip-${state.id}`}
                          value=""
                          leadingIcon={state.icon}
                          trailingIcon="slim-arrow-down"
                          onClick={() => setIconPickerId(iconPickerId === state.id ? null : state.id)}
                        />
                      </div>
                      <Popover
                        opener={`icon-chip-${state.id}`}
                        open={iconPickerId === state.id}
                        onClose={() => setIconPickerId(null)}
                        className="no-padding-popover"
                        placement="Bottom"
                      >
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 2rem)', gap: '0.25rem', padding: '0.5rem' }}>
                          {ICON_OPTIONS.map(icon => (
                            <Button
                              key={icon}
                              icon={icon}
                              design={state.icon === icon ? 'Emphasized' : 'Transparent'}
                              accessibleName={`Select ${icon} icon`}
                              tooltip={icon}
                              onClick={() => updateStateIcon(state.id, icon)}
                              style={{ width: '2rem', height: '2rem', padding: 0 }}
                            />
                          ))}
                        </div>
                      </Popover>
                    </TableCell>
                    <TableCell>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <CheckBox
                          checked={state.publishInHub}
                          accessibleName={`Publish for ${state.name}`}
                          onChange={() => toggleStateField(state.id, 'publishInHub')}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <CheckBox
                          checked={state.resetExpiration}
                          accessibleName={`Reset expiration for ${state.name}`}
                          onChange={() => toggleStateField(state.id, 'resetExpiration')}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        icon="delete"
                        design="Transparent"
                        accessibleName={`Delete ${state.name}`}
                        tooltip={`Delete ${state.name}`}
                        onClick={() => setDeleteTargetId(state.id)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </Table>
              <div style={{ padding: '0 1rem' }}>
                <Button icon="add" design="Default" onClick={addState}>Add State</Button>
              </div>
              <div style={{ padding: '0 1rem 1rem' }}>
              <MessageStrip design="Information" hideCloseButton>
                <strong>Note:</strong> Changes here do not retroactively affect existing expirations or diagrams that already reached an affected state.
              </MessageStrip>
              </div>
            </div>
          </div>
        </Card>

        {/* ── Participants ── */}
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <CardHeader
              title="Participants"
              subline="Map each role to a diagram attribute whose value provides the participant's email address."
            />
            {participants.map((p, i) => (
              <div
                key={p.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  padding: '0.625rem 1rem',
                  gap: '0.5rem 1rem',
                  alignItems: 'center',
                  borderBottom: i < participants.length - 1 ? '1px solid var(--sapList_BorderColor)' : 'none',
                }}
              >
                <Label>{p.role}</Label>
                <Select
                  style={{ width: '100%' }}
                  accessibleName={`Diagram attribute for ${p.role}`}
                  onChange={e => updateParticipantAttribute(p.id, (e.detail.selectedOption as HTMLElement).textContent ?? p.attribute)}
                >
                  {ATTRIBUTE_OPTIONS.map(opt => (
                    <Option key={opt} selected={opt === p.attribute}>{opt}</Option>
                  ))}
                </Select>
              </div>
            ))}
          </div>
        </Card>

        {/* ── Approval Expiration ── */}
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <CardHeader
              title="Approval Expiration"
              subline="Configure approvals to expire after a set period. When expired, a re-approval workflow is triggered in SAP Signavio Process Governance."
            />
            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                <div>
                  <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)', display: 'block' }}>Timespan Calculation</Text>
                  <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSize)' }}>
                    Determines how the approval expiry period is calculated. A diagram's approval expires when the time since the last approval exceeds the specified period. After activating an expiry, also specify which states represent an approved diagram under "Diagram States".
                  </Text>
                </div>
                <Select
                  id="timespan-select"
                  style={{ width: '220px', flexShrink: 0 }}
                  onChange={e => { setTimespan((e.detail.selectedOption as HTMLElement).textContent ?? timespan); setIsDirty(true) }}
                >
                  {TIMESPAN_OPTIONS.map(opt => (
                    <Option key={opt} selected={opt === timespan}>{opt}</Option>
                  ))}
                </Select>
              </div>

              {timespan === 'Defined via a custom attribute (type: number)' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                    <div>
                      <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)', display: 'block' }}>Custom Attribute</Text>
                      <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSize)' }}>
                        Select an attribute on diagram level which represents the number of months until expiration.
                      </Text>
                    </div>
                    <Select
                      id="custom-attribute-select"
                      style={{ width: '220px', flexShrink: 0 }}
                      onChange={e => { setCustomAttribute((e.detail.selectedOption as HTMLElement).textContent ?? customAttribute); setIsDirty(true) }}
                    >
                      {CUSTOM_ATTRIBUTE_OPTIONS.map(opt => (
                        <Option key={opt} selected={opt === customAttribute}>{opt}</Option>
                      ))}
                    </Select>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                    <Label for="fallback-months-input">Fallback value if attribute not set</Label>
                    <Input
                      id="fallback-months-input"
                      value={fallbackMonths}
                      style={{ width: '220px', flexShrink: 0 }}
                      onInput={e => { setFallbackMonths((e.target as unknown as HTMLInputElement).value); setIsDirty(true) }}
                    />
                  </div>
                </div>
              )}

              {timespan === 'Fixed period' && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginTop: '0.25rem' }}>
                  <Label for="number-of-months-input">Number of months</Label>
                  <Input
                    id="number-of-months-input"
                    value={numberOfMonths}
                    style={{ width: '220px', flexShrink: 0 }}
                    onInput={e => { setNumberOfMonths((e.target as unknown as HTMLInputElement).value); setIsDirty(true) }}
                  />
                </div>
              )}

              {timespan !== 'Never' && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginTop: '0.25rem' }}>
                  <Label for="workflow-select">Workflow to run when diagram expires</Label>
                  <Select
                    id="workflow-select"
                    style={{ width: '320px', flexShrink: 0 }}
                    onChange={e => { setWorkflow((e.detail.selectedOption as HTMLElement).textContent ?? workflow); setIsDirty(true) }}
                  >
                    {WORKFLOW_OPTIONS.map(opt => (
                      <Option key={opt} selected={opt === workflow}>{opt}</Option>
                    ))}
                  </Select>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* ── Access and Configuration (bottom) ── */}
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <CardHeader
              title="Access and Configuration"
              subline="Manage user access, synchronize configuration, and control workflow permissions."
            />
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', padding: '0.75rem 1rem', borderBottom: '1px solid var(--sapList_BorderColor)' }}>
              <div>
                <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)', display: 'block' }}>Synchronize users</Text>
                <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSize)' }}>Push existing workspace users to the approval workflow feature so they can participate in approval processes.</Text>
              </div>
              <Button design="Default" icon="synchronize" style={{ flexShrink: 0 }}>Synchronize</Button>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', padding: '0.75rem 1rem', borderBottom: '1px solid var(--sapList_BorderColor)' }}>
              <div>
                <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)', display: 'block' }}>Synchronize configuration</Text>
                <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSize)' }}>Push the workflow configuration defined in this workspace to SAP Signavio Process Governance.</Text>
              </div>
              <Button design="Default" icon="synchronize" style={{ flexShrink: 0 }}>Synchronize</Button>
            </div>
            <div style={{ padding: '0.75rem 1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: '-0.5rem' }}>
                <CheckBox
                  checked={useWorkflowPermissions}
                  text="Use workflow access permissions"
                  accessibleName="Use workflow access permissions"
                  onChange={() => { setUseWorkflowPermissions(v => !v); setIsDirty(true) }}
                />
                <Icon name="information" style={{ color: 'var(--sapContent_IconColor)', cursor: 'help' }} title="When enabled, access permissions defined for approval workflows in SAP Signavio Process Governance are evaluated." />
              </div>
              <div style={{ paddingLeft: '1.75rem' }}>
                <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSize)' }}>
                  Limits visibility and start permissions to workflows users are allowed to access. Requires a Process Governance account. Can be disabled at any time.
                </Text>
              </div>
            </div>
          </div>
        </Card>

        <Title level="H4" size="H4">Journey Model Approvals</Title>

        <Card>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <CardHeader
              title="Journey Model Approvals"
              subline={`${jmWorkflows.length} published approval workflows for journey models.`}
              noDivider
            />
            <Table
              overflowMode="Popin"
              headerRow={
                <TableHeaderRow>
                  <TableHeaderCell width="1fr">Name</TableHeaderCell>
                  <TableHeaderCell width="240px" importance={1} popinText="Participants">Participants</TableHeaderCell>
                </TableHeaderRow>
              }
            >
              {jmWorkflows.map(wf => (
                <TableRow key={wf.id}>
                  <TableCell><Link href="#">{wf.name}</Link></TableCell>
                  <TableCell><Text>{wf.participants}</Text></TableCell>
                </TableRow>
              ))}
            </Table>
            <div style={{ padding: '0.75rem 1rem' }}>
              <Button icon="add" design="Default" onClick={() => {}}>New approval workflow</Button>
            </div>
          </div>
        </Card>

      </SettingsPageLayout>

      {/* ── Delete confirmation dialog ── */}
      <Dialog
        open={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        headerText="Delete State"
        state="Critical"
      >
        <div style={{ padding: '1rem', minWidth: 360 }}>
          <Text>
            Are you sure you want to delete the state <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
          </Text>
        </div>
        <Bar slot="footer" design="Footer">
          <Button slot="endContent" design="Negative" onClick={confirmDelete}>Delete</Button>
          <Button slot="endContent" onClick={() => setDeleteTargetId(null)}>Cancel</Button>
        </Bar>
      </Dialog>

    </PageHeader>
  )
}
