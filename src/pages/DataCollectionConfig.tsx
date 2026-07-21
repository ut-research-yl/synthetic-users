import { useState, useRef } from 'react'
import {
  Text, Select, Option, Label, Button,
  Table, TableHeaderRow, TableHeaderCell, TableRow, TableCell,
  ObjectStatus, StepInput, Slider,
} from '@ui5/webcomponents-react'
import PageHeader from '../components/PageHeader'
import { SettingsSection } from '../components/SettingsPageLayout'
import s from '../components/SettingsPage.module.css'

const SYSTEMS = [
  { id: 'QE6:002', type: 'SAP ECC', syncStatus: 'Settings Synced', systemStatus: 'Registered', activationStatus: 'Activated' },
  { id: 'QE8:004', type: 'SAP ECC', syncStatus: 'Settings Synced', systemStatus: 'Registered', activationStatus: 'Activated' },
  { id: 'QIA:001', type: 'SAP ECC', syncStatus: 'Settings Synced', systemStatus: 'Registered', activationStatus: 'Activated' },
  { id: 'QND:005', type: 'SAP ECC', syncStatus: 'Sync Pending', systemStatus: 'Registered', activationStatus: 'Activated' },
]

const PERFORMANCE_INDICATORS = [
  { id: 'KFFI000202', name: 'Overdue and open Accounts Payable...', type: 'Process Data', objects: 6000, runs: 2, lastRun: 'Dec 3, 2025', status: 'Active' },
  { id: 'PETST03N01', name: 'Aggregated transaction and report...', type: 'Usage Data', objects: 8102, runs: 1, lastRun: 'Dec 3, 2025', status: 'Active' },
  { id: 'KWPM000260', name: 'Plant maintenance order creation...', type: 'Process Data', objects: 12, runs: 1, lastRun: 'Dec 3, 2025', status: 'Active' },
  { id: 'KPSD000462', name: 'Credit memo request item creatio...', type: 'Process Data', objects: 19, runs: 1, lastRun: 'Dec 3, 2025', status: 'Active' },
  { id: 'KPSD000460', name: 'Debit memo request item creation...', type: 'Process Data', objects: 13, runs: 1, lastRun: 'Dec 3, 2025', status: 'Active' },
]

export default function DataCollectionConfig() {
  const [maxRuns, setMaxRuns] = useState(999999)
  const [selectedSystem, setSelectedSystem] = useState(SYSTEMS[0].id)
  const [isDirty, setIsDirty] = useState(false)

  type SavedConfig = { maxRuns: number; selectedSystem: string }
  const savedRef = useRef<SavedConfig>({ maxRuns: 999999, selectedSystem: SYSTEMS[0].id })

  const handleSave = () => {
    savedRef.current = { maxRuns, selectedSystem }
    setIsDirty(false)
  }

  const handleReset = () => {
    setMaxRuns(savedRef.current.maxRuns)
    setSelectedSystem(savedRef.current.selectedSystem)
    setIsDirty(false)
  }

  const system = SYSTEMS.find(s => s.id === selectedSystem) ?? SYSTEMS[0]

  return (
    <PageHeader title="Data Collection Configuration" subtitle="Configure which usage data is collected to improve the workspace experience." isDirty={isDirty} onSave={handleSave} onReset={handleReset}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        <SettingsSection title="Data Storage">
          <div className={s.rowWide}>
            <Text className={s.fieldDesc}>
              Manage data growth by configuring how much data is stored by the solution.
            </Text>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <Label for="max-runs">Maximum Number of Collection Runs Stored</Label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Text>1</Text>
                <Slider
                  min={1}
                  max={999999}
                  value={maxRuns}
                  style={{ width: '14rem' }}
                  onChange={e => { setMaxRuns((e.target as unknown as { value: number }).value); setIsDirty(true) }}
                />
                <Text>Unlimited</Text>
                <StepInput
                  id="max-runs"
                  value={maxRuns}
                  min={1}
                  step={1}
                  style={{ width: '10rem' }}
                  onChange={e => { setMaxRuns((e.target as unknown as HTMLInputElement).valueAsNumber); setIsDirty(true) }}
                />
              </div>
            </div>
            <Text className={s.fieldDescSmall}>
              Records Consumed: <strong>134</strong>
            </Text>
          </div>
        </SettingsSection>

        <SettingsSection
          title="Data Collection by System"
          subtitle="Monitor and manage the data collected for performance indicators from individual source systems."
          action={
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button design="Transparent">Change Default Activation Status</Button>
              <Button design="Negative">Delete All Data</Button>
            </div>
          }
        >
          <div className={s.rowWide} style={{ gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <Label for="system-select">System:</Label>
                <Select
                  id="system-select"
                  style={{ minWidth: '10rem' }}
                  onChange={e => { setSelectedSystem((e.detail.selectedOption as HTMLElement).textContent ?? selectedSystem); setIsDirty(true) }}
                >
                  {SYSTEMS.map(s => <Option key={s.id} selected={s.id === selectedSystem}>{s.id}</Option>)}
                </Select>
              </div>
              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <div>
                  <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)', display: 'block' }}>System Type:</Text>
                  <Text>{system.type}</Text>
                </div>
                <div>
                  <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)', display: 'block' }}>Sync Status:</Text>
                  <ObjectStatus state={system.syncStatus === 'Settings Synced' ? 'Positive' : 'Critical'}>
                    {system.syncStatus}
                  </ObjectStatus>
                </div>
                <div>
                  <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)', display: 'block' }}>System Status:</Text>
                  <Text>{system.systemStatus}</Text>
                </div>
                <div>
                  <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)', display: 'block' }}>Default Activation Status:</Text>
                  <ObjectStatus state="Positive">{system.activationStatus}</ObjectStatus>
                </div>
              </div>
            </div>
            <Table
              headerRow={
                <TableHeaderRow>
                  <TableHeaderCell>Performance Indicator ID</TableHeaderCell>
                  <TableHeaderCell>Performance Indicator Name</TableHeaderCell>
                  <TableHeaderCell>Data Type</TableHeaderCell>
                  <TableHeaderCell>Object Count</TableHeaderCell>
                  <TableHeaderCell>Collection Runs</TableHeaderCell>
                  <TableHeaderCell>Last Run</TableHeaderCell>
                  <TableHeaderCell>Activation Status</TableHeaderCell>
                </TableHeaderRow>
              }
            >
              {PERFORMANCE_INDICATORS.map(pi => (
                <TableRow key={pi.id}>
                  <TableCell><Text>{pi.id}</Text></TableCell>
                  <TableCell><Text>{pi.name}</Text></TableCell>
                  <TableCell><Text>{pi.type}</Text></TableCell>
                  <TableCell><Text>{pi.objects.toLocaleString()}</Text></TableCell>
                  <TableCell><Text>{pi.runs}</Text></TableCell>
                  <TableCell><Text>{pi.lastRun}</Text></TableCell>
                  <TableCell>
                    <ObjectStatus state="Positive">{pi.status}</ObjectStatus>
                  </TableCell>
                </TableRow>
              ))}
            </Table>
          </div>
        </SettingsSection>

      </div>
    </PageHeader>
  )
}
