import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  List, ListItemGroup, ListItemCustom,
  Input, ToolbarItem, Icon, Text,
} from '@ui5/webcomponents-react'
import { SigDomainObject, SigTableWrapper } from '@signavio/sap-signavio-uixtension'
import PageHeader from '../components/PageHeader'
import s from '../components/SettingsPage.module.css'

type DomainObjects = React.ComponentProps<typeof SigDomainObject>['object']

type AssetType = {
  id: string; name: string; description: string; domainObject: DomainObjects; notation: boolean
}

export const ASSET_TYPES: AssetType[] = [
  { id: 'bpmn',        name: 'BPMN 2.0',       description: 'Business Process Model and Notation', domainObject: 'Process Model',  notation: true  },
  { id: 'dmn',         name: 'DMN 1.2',         description: 'Decision Model and Notation',          domainObject: 'DMN',            notation: true  },
  { id: 'value-chain', name: 'Value Chain',     description: 'Value chain diagram type',              domainObject: 'Value Chain',    notation: true  },
  { id: 'nav-map',     name: 'Navigation Map',  description: 'Navigation map diagram type',           domainObject: 'Navigation Map', notation: true  },
  { id: 'objective',   name: 'Objective',       description: 'A main goal guiding direction',         domainObject: 'Business Goal',  notation: false },
  { id: 'initiative',  name: 'Initiative',      description: 'Strategic initiative',                  domainObject: 'Initiative',     notation: false },
  { id: 'insight',     name: 'Insight',         description: 'Insights and observations',             domainObject: 'Insights',       notation: false },
  { id: 'dashboard',   name: 'Dashboard',       description: 'Analytics and reporting dashboard',     domainObject: 'Dashboard',      notation: false },
  { id: 'process-semantic-view', name: 'Process Semantic View', description: 'Semantic view of process models', domainObject: 'Process Model', notation: false },
]

type Group = { label: string; ids: string[] }

const GROUPS: Group[] = [
  { label: 'Modeling',                  ids: ['bpmn', 'dmn', 'value-chain', 'nav-map'] },
  { label: 'Transformation Management', ids: ['objective', 'initiative', 'insight'] },
  { label: 'Analysis and Mining',       ids: ['dashboard', 'process-semantic-view'] },
]

export default function AssetTypes() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const query = search.trim().toLowerCase()

  const filteredGroups = GROUPS.map(g => ({
    ...g,
    items: g.ids
      .map(id => ASSET_TYPES.find(t => t.id === id)!)
      .filter(t => !query || t.name.toLowerCase().includes(query) || t.description.toLowerCase().includes(query)),
  })).filter(g => g.items.length > 0)

  return (
    <PageHeader title="Asset Types" subtitle="Configure attributes and settings for each asset type.">
      <div className={s.narrowContent}>
      <SigTableWrapper
        searchSlot={
          <ToolbarItem>
            <Input
              accessibleName="Search asset types"
              placeholder="Search asset types"
              value={search}
              onInput={e => setSearch((e.target as unknown as HTMLInputElement).value)}
              icon={<Icon slot="icon" name="search" />}
              style={{ width: '240px' }}
            />
          </ToolbarItem>
        }
      >
        <List separators="Inner">
          {filteredGroups.map(group => (
            <ListItemGroup key={group.label} headerText={group.label}>
              {group.items.map(t => (
                <ListItemCustom
                  key={t.id}
                  type="Active"
                  onClick={() => navigate(`/asset-types/${t.id}`)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0' }}>
                    {t.id === 'process-semantic-view' ? (
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--sapAvatar_6_Background)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon name="SAP-icons-v4/process-data-view" style={{ width: '16px', height: '16px', color: 'var(--sapAvatar_6_TextColor)', fontSize: '16px' }} />
                      </div>
                    ) : (
                      <SigDomainObject object={t.domainObject} size="XS" />
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontLargeSize)' }}>{t.name}</Text>
                      <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)' }}>{t.description}</Text>
                    </div>
                  </div>
                </ListItemCustom>
              ))}
            </ListItemGroup>
          ))}
          {filteredGroups.length === 0 && (
            <ListItemCustom key="empty" type="Inactive">
              No asset types match your search.
            </ListItemCustom>
          )}
        </List>
      </SigTableWrapper>
      </div>
    </PageHeader>
  )
}
