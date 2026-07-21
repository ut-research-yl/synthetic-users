import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Table, TableHeaderRow, TableHeaderCell, TableRow, TableCell,
  Button, CheckBox, Text, FlexBox, Menu, MenuItem, ToolbarItem,
  Link, MessageStrip,
  type ButtonDomRef,
} from '@ui5/webcomponents-react'
import { SigTableWrapper } from '@signavio/sap-signavio-uixtension'
import PageHeader from '../components/PageHeader'
import SettingsPageLayout from '../components/SettingsPageLayout'
import { useWorkspace } from '../contexts/WorkspaceContext'
import InfoPopover from '../components/InfoPopover'
import { DuplicateSettingsDialog } from '../components/DuplicateSettingsDialog'

const USER_GROUPS = [
  'Administrators', 'Content Administrators', 'ETL Analyst Test',
  'Finance Team', 'Hub only', 'modeler', 'NoPI', 'Super admin',
  'TESSSSTT', 'Test A', 'Test2', 'Testgroup', 'Testgroup 2',
  'VM admin', 'VM basic',
]

export default function Audience() {
  const { audiences: rows, setAudiences: setRows } = useWorkspace()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [rowMenuOpenId, setRowMenuOpenId] = useState<string | null>(null)
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false)
  const [duplicateSourceRow, setDuplicateSourceRow] = useState<string | null>(null)
  const addBtnRef = useRef<ButtonDomRef>(null)
  const [isDirty, setIsDirty] = useState(false)
  const savedRows = useRef(rows)

  const mutateRows = (updater: (prev: typeof rows) => typeof rows) => {
    setRows(updater)
    setIsDirty(true)
  }

  const handleSave = () => {
    savedRows.current = rows
    setIsDirty(false)
  }

  const handleReset = () => {
    setRows(savedRows.current)
    setIsDirty(false)
  }

  const toggle = (id: string) =>
    mutateRows(rs => rs.map(r => r.id === id ? { ...r, showGeneral: !r.showGeneral } : r))

  const handleAddGroup = (groupName: string) => {
    const id = String(Date.now())
    mutateRows(rs => [...rs, { id, name: groupName, showGeneral: false }])
    setMenuOpen(false)
  }

  const handleRowMenuAction = (rowId: string, action: string) => {
    if (action === 'Duplicate Audience Settings') {
      const source = rows.find(r => r.id === rowId)
      if (!source) return
      setDuplicateSourceRow(source.name)
      setDuplicateDialogOpen(true)
    } else if (action === 'Delete') {
      mutateRows(rs => rs.filter(r => r.id !== rowId))
    }
    setRowMenuOpenId(null)
  }

  return (
    <PageHeader title="Audiences" subtitle="Create and manage audiences to tailor the workspace experience per user group." isDirty={isDirty} onSave={handleSave} onReset={handleReset}>
      <SettingsPageLayout flush>
        <MessageStrip design="Information" hideCloseButton>
          You can create audiences based on the <Link onClick={() => navigate('/groups')}>user groups</Link> available in your workspace.
        </MessageStrip>
        <SigTableWrapper
          businessActionsSlot={
            <ToolbarItem>
              <Button
                id="add-audience-btn"
                ref={addBtnRef}
                design="Emphasized"
                endIcon="slim-arrow-down"
                onClick={() => setMenuOpen(true)}
              >
                Add Audience
              </Button>
              <Menu
                open={menuOpen}
                opener="add-audience-btn"
                onClose={() => setMenuOpen(false)}
                onItemClick={(e: CustomEvent) => handleAddGroup(e.detail.text)}
              >
                {USER_GROUPS.map(g => (
                  <MenuItem key={g} text={g} />
                ))}
              </Menu>
            </ToolbarItem>
          }
        >
          <Table
            headerRow={
              <TableHeaderRow>
                <TableHeaderCell>Audience name</TableHeaderCell>
                <TableHeaderCell>
                  <FlexBox alignItems="Center" style={{ gap: '0.25rem' }}>
                    Show General audience
                    <InfoPopover id="show-general-info-btn" header="Show General Audience">
                      <Text>Allow users with this audience to switch to General audience settings.</Text>
                    </InfoPopover>
                  </FlexBox>
                </TableHeaderCell>
                <TableHeaderCell style={{ width: '2.5rem', minWidth: '2.5rem' }} />
              </TableHeaderRow>
            }
          >
            {rows.map(row => (
              <TableRow key={row.id}>
                <TableCell><Text>{row.name}</Text></TableCell>
                <TableCell>
                  <CheckBox checked={row.id === '1' ? true : row.showGeneral} disabled={row.id === '1'} accessibleName={`Show General audience – ${row.name}`} onChange={() => row.id !== '1' && toggle(row.id)} />
                </TableCell>
                <TableCell>
                  <FlexBox justifyContent="End" style={{ width: '100%' }}>
                    <Button
                      id={`row-overflow-btn-${row.id}`}
                      icon="overflow"
                      design="Transparent"
                      tooltip="More options"
                      onClick={() => setRowMenuOpenId(row.id)}
                    />
                  </FlexBox>
                  <Menu
                    open={rowMenuOpenId === row.id}
                    opener={`row-overflow-btn-${row.id}`}
                    onClose={() => setRowMenuOpenId(null)}
                    onItemClick={(e: CustomEvent) => handleRowMenuAction(row.id, e.detail.text)}
                  >
                    <MenuItem text="Duplicate Audience Settings" icon="copy" />
                    <MenuItem text="Delete" icon="delete" disabled={row.id === '1'} />
                  </Menu>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        </SigTableWrapper>
      </SettingsPageLayout>
      <DuplicateSettingsDialog
        open={duplicateDialogOpen}
        sourceAudience={duplicateSourceRow ?? ''}
        onClose={() => setDuplicateDialogOpen(false)}
        onDuplicate={() => setDuplicateDialogOpen(false)}
      />
    </PageHeader>
  )
}
