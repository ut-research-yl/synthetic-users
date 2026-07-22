import {
  TabContainer, Tab, Title, Text, Avatar, Label, Input, Select, Option,
  List, ListItemStandard,
  Table, TableHeaderRow, TableHeaderCell, TableRow, TableCell,
  Button,
} from '@ui5/webcomponents-react'
import { getElementById, PROCESS_ELEMENTS } from './data'
import { LEVEL_NAMES } from './types'
import { USERS } from '../../data/users'

interface DetailPanelProps {
  elementId: string
  onClose: () => void
}

const RACI_DATA = [
  { role: 'Process Owner', r: true,  a: false, c: false, i: false },
  { role: 'Process Manager', r: false, a: true,  c: false, i: false },
  { role: 'Business Analyst', r: false, a: false, c: true,  i: false },
  { role: 'IT Team', r: false, a: false, c: true,  i: false },
  { role: 'Leadership', r: false, a: false, c: false, i: true  },
]

const ASSET_TYPES = [
  { name: 'Order-to-Cash BPMN', type: 'BPMN 2.0', icon: 'SAP-icons-v4/bpmn-type-service' },
  { name: 'Customer Segment DMN', type: 'DMN', icon: 'decision' },
  { name: 'Process KPI Dashboard', type: 'Process Intelligence', icon: 'SAP-icons-v4/process-intelligence' },
]

const STATUS_COLORS: Record<string, string> = {
  Active: 'var(--sapPositiveColor)',
  'In Review': 'var(--sapCriticalColor)',
  Draft: 'var(--sapNeutralColor)',
  Deprecated: 'var(--sapNegativeColor)',
}

export default function DetailPanel({ elementId, onClose }: DetailPanelProps) {
  const element = getElementById(elementId)
  if (!element) return null

  const owner = USERS.find(u => u.id === element.ownerId)
  const children = PROCESS_ELEMENTS.filter(e => e.parentId === elementId).slice(0, 5)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{
        padding: '0.75rem 1rem',
        borderBottom: '1px solid var(--sapList_BorderColor)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem',
        flexShrink: 0,
        background: 'var(--sapGroup_TitleBackground)',
      }}>
        <div style={{ minWidth: 0 }}>
          <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', display: 'block' }}>
            {element.hierarchyId} · {LEVEL_NAMES[element.level]}
          </Text>
          <Title level="H5" style={{ marginTop: '0.125rem' }}>{element.name}</Title>
        </div>
        <Button design="Transparent" icon="decline" onClick={onClose} />
      </div>

      <TabContainer style={{ flex: 1, overflow: 'hidden' }}>
        <Tab text="Overview">
          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', overflow: 'auto', height: '100%' }}>
            <Text style={{ color: 'var(--sapContent_LabelColor)', lineHeight: '1.5', fontSize: 'var(--sapFontSmallSize)' }}>
              {element.description}
            </Text>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{ flex: 1, padding: '0.75rem', border: '1px solid var(--sapList_BorderColor)', borderRadius: '0.25rem', textAlign: 'center' }}>
                <Title level="H4" style={{ color: 'var(--sapTextColor)' }}>{element.assetCount}</Title>
                <Text style={{ display: 'block', fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', marginTop: '0.25rem' }}>Assets</Text>
              </div>
              <div style={{ flex: 1, padding: '0.75rem', border: '1px solid var(--sapList_BorderColor)', borderRadius: '0.25rem', textAlign: 'center' }}>
                <Title level="H4" style={{ color: 'var(--sapTextColor)' }}>{element.childCount}</Title>
                <Text style={{ display: 'block', fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', marginTop: '0.25rem' }}>Sub-Processes</Text>
              </div>
              <div style={{ flex: 1, padding: '0.75rem', border: '1px solid var(--sapList_BorderColor)', borderRadius: '0.25rem', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                  <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: STATUS_COLORS[element.status] }} />
                  <Text style={{ fontSize: 'var(--sapFontSmallSize)', fontWeight: '600' }}>{element.status}</Text>
                </div>
                <Text style={{ display: 'block', fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', marginTop: '0.25rem' }}>Status</Text>
              </div>
            </div>

            {children.length > 0 && (
              <div>
                <Label style={{ display: 'block', marginBottom: '0.5rem' }}>Child Processes</Label>
                <List separators="None">
                  {children.map(child => (
                    <ListItemStandard
                      key={child.id}
                      icon="SAP-icons-v4/process-level"
                      description={`${child.hierarchyId} · ${LEVEL_NAMES[child.level]}`}
                    >
                      {child.name}
                    </ListItemStandard>
                  ))}
                </List>
              </div>
            )}
          </div>
        </Tab>

        <Tab text="People">
          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', overflow: 'auto', height: '100%' }}>
            <div>
              <Label style={{ display: 'block', marginBottom: '0.5rem' }}>Process Owner</Label>
              {owner ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', border: '1px solid var(--sapList_BorderColor)', borderRadius: '0.25rem' }}>
                  <Avatar initials={owner.initials} colorScheme={owner.colorScheme as 'Accent1'} size="S" />
                  <div>
                    <Text style={{ display: 'block', fontWeight: '600' }}>{owner.name}</Text>
                    <Text style={{ display: 'block', fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>{owner.email}</Text>
                  </div>
                </div>
              ) : <Text style={{ color: 'var(--sapContent_LabelColor)' }}>No owner assigned</Text>}
            </div>

            <div>
              <Label style={{ display: 'block', marginBottom: '0.5rem' }}>RACI Matrix</Label>
              <Table
                headerRow={
                  <TableHeaderRow>
                    <TableHeaderCell>Role</TableHeaderCell>
                    <TableHeaderCell width="50">R</TableHeaderCell>
                    <TableHeaderCell width="50">A</TableHeaderCell>
                    <TableHeaderCell width="50">C</TableHeaderCell>
                    <TableHeaderCell width="50">I</TableHeaderCell>
                  </TableHeaderRow>
                }
              >
                {RACI_DATA.map(row => (
                  <TableRow key={row.role}>
                    <TableCell><Text style={{ fontSize: 'var(--sapFontSmallSize)' }}>{row.role}</Text></TableCell>
                    <TableCell><Text style={{ textAlign: 'center' }}>{row.r ? '●' : ''}</Text></TableCell>
                    <TableCell><Text style={{ textAlign: 'center' }}>{row.a ? '●' : ''}</Text></TableCell>
                    <TableCell><Text style={{ textAlign: 'center' }}>{row.c ? '●' : ''}</Text></TableCell>
                    <TableCell><Text style={{ textAlign: 'center' }}>{row.i ? '●' : ''}</Text></TableCell>
                  </TableRow>
                ))}
              </Table>
            </div>
          </div>
        </Tab>

        <Tab text="Assets">
          <div style={{ padding: '1rem', overflow: 'auto', height: '100%' }}>
            <List separators="Inner">
              {ASSET_TYPES.map((asset, i) => (
                <ListItemStandard
                  key={i}
                  icon={asset.icon}
                  description={asset.type}
                >
                  {asset.name}
                </ListItemStandard>
              ))}
            </List>
            <Text style={{ display: 'block', marginTop: '0.5rem', fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', paddingLeft: '0.5rem' }}>
              {element.assetCount} asset{element.assetCount !== 1 ? 's' : ''} linked to this process
            </Text>
          </div>
        </Tab>

        <Tab text="Configuration">
          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'auto', height: '100%' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
              <div>
                <Label required style={{ display: 'block', marginBottom: '0.25rem' }}>Name</Label>
                <Input value={element.name} readonly style={{ width: '100%' }} />
              </div>
              <div>
                <Label style={{ display: 'block', marginBottom: '0.25rem' }}>Hierarchy ID</Label>
                <Input value={element.hierarchyId} readonly style={{ width: '100%' }} />
              </div>
              <div>
                <Label style={{ display: 'block', marginBottom: '0.25rem' }}>Process Type</Label>
                <Select style={{ width: '100%' }}>
                  <Option selected={element.processType === 'Operating'}>Operating</Option>
                  <Option selected={element.processType === 'Management'}>Management</Option>
                  <Option selected={element.processType === 'Support'}>Support</Option>
                </Select>
              </div>
              <div>
                <Label style={{ display: 'block', marginBottom: '0.25rem' }}>Status</Label>
                <Select style={{ width: '100%' }}>
                  <Option selected={element.status === 'Active'}>Active</Option>
                  <Option selected={element.status === 'In Review'}>In Review</Option>
                  <Option selected={element.status === 'Draft'}>Draft</Option>
                  <Option selected={element.status === 'Deprecated'}>Deprecated</Option>
                </Select>
              </div>
              <div>
                <Label style={{ display: 'block', marginBottom: '0.25rem' }}>Description</Label>
                <Input value={element.description} readonly style={{ width: '100%' }} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', paddingTop: '0.5rem' }}>
              <Button>Save</Button>
            </div>
          </div>
        </Tab>
      </TabContainer>
    </div>
  )
}
