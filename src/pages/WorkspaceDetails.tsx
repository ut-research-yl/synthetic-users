import React, { useState, useRef } from 'react'
import { CheckBox, Label, Text, TextArea, Input, Select, Option, Button, Menu, MenuItem, MenuSeparator, List, ListItemCustom, ListItemStandard, Popover, Icon, Avatar } from '@ui5/webcomponents-react'
import { SigChipV2 } from '@signavio/sap-signavio-uixtension'
import { useWorkspace } from '../contexts/WorkspaceContext'
import { ADMIN_USERS, type ContentLanguage } from '../contexts/WorkspaceContext'
import PageHeader from '../components/PageHeader'
import SettingsPageLayout, { SettingsSection } from '../components/SettingsPageLayout'
import { TransferOwnershipDialog } from '../components/TransferOwnershipDialog'
import s from '../components/SettingsPage.module.css'

const ALL_LANGUAGES = [
  { code: 'af',    label: 'Afrikaans' },
  { code: 'sq',    label: 'Albanian' },
  { code: 'ar',    label: 'Arabic' },
  { code: 'hy',    label: 'Armenian' },
  { code: 'az',    label: 'Azerbaijani' },
  { code: 'eu',    label: 'Basque' },
  { code: 'be',    label: 'Belarusian' },
  { code: 'bn',    label: 'Bengali' },
  { code: 'bs',    label: 'Bosnian' },
  { code: 'bg',    label: 'Bulgarian' },
  { code: 'ca',    label: 'Catalan' },
  { code: 'hr',    label: 'Croatian' },
  { code: 'cs',    label: 'Czech' },
  { code: 'da',    label: 'Danish' },
  { code: 'nl',    label: 'Dutch' },
  { code: 'en',    label: 'English' },
  { code: 'en-US', label: 'English (United States)' },
  { code: 'en-GB', label: 'English (United Kingdom)' },
  { code: 'en-AU', label: 'English (Australia)' },
  { code: 'et',    label: 'Estonian' },
  { code: 'fi',    label: 'Finnish' },
  { code: 'fr',    label: 'French' },
  { code: 'fr-FR', label: 'French (France)' },
  { code: 'fr-CA', label: 'French (Canada)' },
  { code: 'fr-BE', label: 'French (Belgium)' },
  { code: 'gl',    label: 'Galician' },
  { code: 'ka',    label: 'Georgian' },
  { code: 'de',    label: 'German' },
  { code: 'de-DE', label: 'German (Germany)' },
  { code: 'de-AT', label: 'German (Austria)' },
  { code: 'de-CH', label: 'German (Switzerland)' },
  { code: 'el',    label: 'Greek' },
  { code: 'gu',    label: 'Gujarati' },
  { code: 'he',    label: 'Hebrew' },
  { code: 'hi',    label: 'Hindi' },
  { code: 'hu',    label: 'Hungarian' },
  { code: 'is',    label: 'Icelandic' },
  { code: 'id',    label: 'Indonesian' },
  { code: 'ga',    label: 'Irish' },
  { code: 'it',    label: 'Italian' },
  { code: 'ja',    label: 'Japanese' },
  { code: 'kn',    label: 'Kannada' },
  { code: 'kk',    label: 'Kazakh' },
  { code: 'ko',    label: 'Korean' },
  { code: 'lv',    label: 'Latvian' },
  { code: 'lt',    label: 'Lithuanian' },
  { code: 'mk',    label: 'Macedonian' },
  { code: 'ms',    label: 'Malay' },
  { code: 'ml',    label: 'Malayalam' },
  { code: 'mt',    label: 'Maltese' },
  { code: 'mr',    label: 'Marathi' },
  { code: 'mn',    label: 'Mongolian' },
  { code: 'ne',    label: 'Nepali' },
  { code: 'nb',    label: 'Norwegian Bokmål' },
  { code: 'nn',    label: 'Norwegian Nynorsk' },
  { code: 'fa',    label: 'Persian' },
  { code: 'pl',    label: 'Polish' },
  { code: 'pt',    label: 'Portuguese' },
  { code: 'pt-BR', label: 'Portuguese (Brazil)' },
  { code: 'pt-PT', label: 'Portuguese (Portugal)' },
  { code: 'pa',    label: 'Punjabi' },
  { code: 'ro',    label: 'Romanian' },
  { code: 'ru',    label: 'Russian' },
  { code: 'sr',    label: 'Serbian' },
  { code: 'sk',    label: 'Slovak' },
  { code: 'sl',    label: 'Slovenian' },
  { code: 'es',    label: 'Spanish' },
  { code: 'es-ES', label: 'Spanish (Spain)' },
  { code: 'es-MX', label: 'Spanish (Mexico)' },
  { code: 'es-AR', label: 'Spanish (Argentina)' },
  { code: 'sw',    label: 'Swahili' },
  { code: 'sv',    label: 'Swedish' },
  { code: 'tl',    label: 'Tagalog' },
  { code: 'ta',    label: 'Tamil' },
  { code: 'te',    label: 'Telugu' },
  { code: 'th',    label: 'Thai' },
  { code: 'tr',    label: 'Turkish' },
  { code: 'uk',    label: 'Ukrainian' },
  { code: 'ur',    label: 'Urdu' },
  { code: 'uz',    label: 'Uzbek' },
  { code: 'vi',    label: 'Vietnamese' },
  { code: 'cy',    label: 'Welsh' },
  { code: 'yi',    label: 'Yiddish' },
  { code: 'zh',    label: 'Chinese' },
  { code: 'zh-CN', label: 'Chinese (Simplified)' },
  { code: 'zh-TW', label: 'Chinese (Traditional)' },
]

const CURRENCIES = ['EUR', 'USD', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'CNY']
const AUTO_SUBSCRIPTION_OPTIONS = [
  'After invitation to comment',
  'After submitted comment',
  'No automatic subscriptions',
]

export default function WorkspaceDetails() {
  const [organization, setOrganization] = useState('Acme Inc.')
  const [currency, setCurrency] = useState('EUR')
  const [autoSubscription, setAutoSubscription] = useState('After invitation to comment')
  const [uploadEnabled, setUploadEnabled] = useState(true)
  const [subscriptionsEnabled, setSubscriptionsEnabled] = useState(true)
  const [isDirty, setIsDirty] = useState(false)
  const [openMenuCode, setOpenMenuCode] = useState<string | null>(null)
  const [addLangOpen, setAddLangOpen] = useState(false)
  const [addLangSearch, setAddLangSearch] = useState('')
  const [transferOpen, setTransferOpen] = useState(false)
  const addLangBtnId = useRef('add-lang-btn').current

  const {
    workspaceName, setWorkspaceName,
    additionalInfo, setAdditionalInfo,
    privateFolder, setPrivateFolder,
    contentLanguages, setContentLanguages, addContentLanguage, removeContentLanguage,
    moveContentLanguage, reorderContentLanguage, setDefaultLanguage,
    ownerId, setOwnerId,
  } = useWorkspace()

  const [draftWorkspaceName, setDraftWorkspaceName] = useState(workspaceName)

  const savedWorkspaceName = useRef(workspaceName)
  const savedOrganization = useRef(organization)
  const savedCurrency = useRef(currency)
  const savedAutoSubscription = useRef(autoSubscription)
  const savedUploadEnabled = useRef(uploadEnabled)
  const savedSubscriptionsEnabled = useRef(subscriptionsEnabled)
  const savedAdditionalInfo = useRef(additionalInfo)
  const savedPrivateFolder = useRef(privateFolder)
  const savedContentLanguages = useRef<ContentLanguage[]>(contentLanguages)

  const handleSave = () => {
    setWorkspaceName(draftWorkspaceName)
    savedWorkspaceName.current = draftWorkspaceName
    savedOrganization.current = organization
    savedCurrency.current = currency
    savedAutoSubscription.current = autoSubscription
    savedUploadEnabled.current = uploadEnabled
    savedSubscriptionsEnabled.current = subscriptionsEnabled
    savedAdditionalInfo.current = additionalInfo
    savedPrivateFolder.current = privateFolder
    savedContentLanguages.current = [...contentLanguages]
    setIsDirty(false)
  }

  const handleReset = () => {
    setDraftWorkspaceName(savedWorkspaceName.current)
    setOrganization(savedOrganization.current)
    setCurrency(savedCurrency.current)
    setAutoSubscription(savedAutoSubscription.current)
    setUploadEnabled(savedUploadEnabled.current)
    setSubscriptionsEnabled(savedSubscriptionsEnabled.current)
    setAdditionalInfo(savedAdditionalInfo.current)
    setPrivateFolder(savedPrivateFolder.current)
    setContentLanguages([...savedContentLanguages.current])
    setIsDirty(false)
  }

  const activeCodes = new Set(contentLanguages.map(l => l.code))
  const query = addLangSearch.trim().toLowerCase()
  const availableLangs = ALL_LANGUAGES.filter(
    l => !activeCodes.has(l.code) && (!query || l.label.toLowerCase().includes(query))
  )

  const owner = ADMIN_USERS.find(u => u.id === ownerId)!

  return (
    <PageHeader title="Workspace Details" subtitle="Define general workspace information and configurations." isDirty={isDirty} onSave={handleSave} onReset={handleReset}>
      <SettingsPageLayout gap="2rem">

          <SettingsSection title="About this Workspace">
            <div className={s.rowWide}>
              <Label for="workspace-name" showColon className={s.fieldLabel}>Workspace Name</Label>
              <Text className={s.fieldDesc}>
                This name will show up in the workspace selection page, to help users from multiple workspaces to select their desired one.
              </Text>
              <Input
                id="workspace-name"
                value={draftWorkspaceName}
                className={s.fieldFull}
                onInput={e => { setDraftWorkspaceName((e.target as unknown as HTMLInputElement).value); setIsDirty(true) }}
              />
            </div>
            <div className={s.rowWide}>
              <Label for="organization" showColon className={s.fieldLabel}>Organization</Label>
              <Text className={s.fieldDesc}>
                This is mainly used to name the pool in the QuickModel.
              </Text>
              <Input
                id="organization"
                value={organization}
                className={s.fieldFull}
                onInput={e => { setOrganization((e.target as unknown as HTMLInputElement).value); setIsDirty(true) }}
              />
            </div>
            <div className={s.row}>
              <Label className={s.fieldLabel}>Workspace Owner</Label>
              <Text className={s.fieldDesc}>
                The workspace owner has full administrative control over this workspace.
              </Text>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                <div className={s.userRow}>
                  <Avatar initials={owner.initials} colorScheme={owner.colorScheme as any} size="S" />
                  <div className={s.userMeta}>
                    <span className={s.userNameText}>{owner.name}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>
                      <Icon name="email" style={{ fontSize: '0.5rem', color: 'var(--sapContent_LabelColor)', width: '0.625rem', height: '0.625rem' }} />
                      {owner.email}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>
                      <Icon name="employee" style={{ fontSize: '0.5rem', color: 'var(--sapContent_LabelColor)', width: '0.625rem', height: '0.625rem' }} />
                      {owner.userId}
                    </span>
                    {owner.ownerSince && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>
                        <Icon name="history" style={{ fontSize: '0.5rem', color: 'var(--sapContent_LabelColor)', width: '0.625rem', height: '0.625rem' }} />
                        Owner since {new Date(owner.ownerSince).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
                <Button onClick={() => setTransferOpen(true)}>Transfer Ownership</Button>
              </div>
            </div>
            <div className={s.rowWide}>
              <Label className={s.fieldLabel}>Customer Portal SAP for Me</Label>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <Text className={s.fieldDesc} style={{ flex: 1 }}>
                  Access usage statistics, audit logs, license consumption, and other workspace insights in SAP for Me.
                </Text>
                <Button icon="action" style={{ flexShrink: 0 }} onClick={() => window.open('https://me.sap.com', '_blank')}>Open SAP for Me</Button>
              </div>
            </div>
            <div className={s.rowWide}>
              <Label className={s.fieldLabel}>Workspace Information</Label>
              <Text className={s.fieldDesc}>
                Technical details about this workspace, useful for support and troubleshooting.
              </Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginTop: '0.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Text style={{ minWidth: '7rem', color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSize)' }}>Workspace ID</Text>
                  <Text style={{ fontFamily: 'monospace', flex: 1, wordBreak: 'break-all', fontSize: 'var(--sapFontSmallSize)' }}>
                    a2f2b6be2c084ff99680a2afa8f7e2a8
                  </Text>
                  <Button icon="copy" design="Transparent" tooltip="Copy workspace ID" onClick={() => navigator.clipboard.writeText('a2f2b6be2c084ff99680a2afa8f7e2a8')} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Text style={{ minWidth: '7rem', color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSize)' }}>Version</Text>
                  <Text style={{ flex: 1 }}>v4.14.17</Text>
                  <Button icon="copy" design="Transparent" tooltip="Copy version" onClick={() => navigator.clipboard.writeText('v4.14.17')} />
                </div>
              </div>
            </div>
            <div className={s.rowWide}>
              <Label for="additional-info" showColon className={s.fieldLabel}>Additional Information</Label>
              <Text className={s.fieldDesc}>
                Any information you enter here is shown to all users in the About section, accessible from the user profile menu.
              </Text>
              <TextArea
                id="additional-info"
                value={additionalInfo}
                growing
                growingMaxRows={10}
                className={s.fieldFull}
                placeholder="Enter additional workspace information…"
                onInput={e => { setAdditionalInfo((e.target as unknown as HTMLTextAreaElement).value); setIsDirty(true) }}
              />
            </div>
          </SettingsSection>

          <SettingsSection title="Localization">
            <div className={s.rowWide}>
              <Label for="currency" className={s.fieldLabel}>Currency</Label>
              <Text className={s.fieldDesc}>
                Please define the currency which should be used by default.
              </Text>
              <Select
                id="currency"
                className={s.fieldFull}
                onChange={e => { setCurrency((e.detail.selectedOption as HTMLElement).textContent ?? currency); setIsDirty(true) }}
              >
                {CURRENCIES.map(c => <Option key={c} selected={c === currency}>{c}</Option>)}
              </Select>
            </div>
            <div className={s.rowFlush}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem' }}>
                <Label className={s.fieldLabel}>Content Languages</Label>
                <Button id={addLangBtnId} icon="add" design="Transparent" onClick={() => { setAddLangSearch(''); setAddLangOpen(true) }}>
                  Add language
                </Button>
                <Popover
                  opener={addLangBtnId}
                  open={addLangOpen}
                  onClose={() => setAddLangOpen(false)}
                  placement="Bottom"
                  horizontalAlign="End"
                  className="no-padding-popover"
                  style={{ width: '22rem' } as React.CSSProperties}
                >
                  <div style={{ padding: '0.5rem 0.75rem 0.25rem' }}>
                    <Input
                      placeholder="Search languages…"
                      accessibleName="Search languages"
                      value={addLangSearch}
                      onInput={e => setAddLangSearch((e.target as unknown as HTMLInputElement).value)}
                      className={s.fieldFull}
                    />
                  </div>
                  <List style={{ maxHeight: '280px', overflowY: 'auto' }}>
                    {availableLangs.length === 0 && (
                      <ListItemStandard>
                        {query ? 'No languages match your search.' : 'All languages are already active.'}
                      </ListItemStandard>
                    )}
                    {availableLangs.map(lang => (
                      <ListItemStandard
                        key={lang.code}
                        onClick={() => {
                          addContentLanguage({ code: lang.code, label: lang.label, isDefault: false })
                          setAddLangOpen(false)
                          setAddLangSearch('')
                          setIsDirty(true)
                        }}
                      >
                        {lang.label}
                      </ListItemStandard>
                    ))}
                  </List>
                </Popover>
              </div>
              <Text className={s.fieldDesc} style={{ padding: '0 1rem' }}>
                Define the languages in which content can be created. The first language is the workspace default.
              </Text>
              <List
                onMoveOver={e => e.preventDefault()}
                onMove={e => {
                  const sourceCode = (e.detail.source.element as HTMLElement).dataset.code ?? ''
                  const destCode = (e.detail.destination.element as HTMLElement).dataset.code ?? ''
                  const placement = e.detail.destination.placement as 'Before' | 'After' | 'On'
                  if (sourceCode && destCode && placement !== 'On') {
                    reorderContentLanguage(sourceCode, destCode, placement)
                    setIsDirty(true)
                  }
                }}
              >
                {contentLanguages.map((lang, idx) => (
                  <ListItemCustom
                    key={lang.code}
                    movable
                    data-code={lang.code}
                    type="Inactive"
                    style={{ padding: 0 }}
                  >
                    {/*
                      pointer-events: none on the outer div lets drag events reach the
                      shadow <li> (which is draggable when movable is set). Without this,
                      e.target in ListItem._ondragstart is our div, not the shadow <li>,
                      so the drag guard `e.target === this._listItem` fails and DnD breaks.
                      Interactive zones override to pointer-events: auto.
                    */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        height: '2.75rem',
                        paddingLeft: '0.5rem',
                        paddingRight: '0.5rem',
                        gap: '0.5rem',
                        boxSizing: 'border-box',
                        pointerEvents: 'none',
                      }}
                    >
                      <Icon
                        name="horizontal-grip"
                        style={{ color: 'var(--sapContent_NonInteractiveIconColor)', cursor: 'grab', flexShrink: 0 }}
                      />
                      <span style={{ flex: 1 }}>{lang.label}</span>
                      {lang.isDefault && <SigChipV2 value="Default" design="positive" condensed />}
                      <Button
                        id={`lang-overflow-${lang.code}`}
                        design="Transparent"
                        icon="overflow"
                        accessibleName={`Options for ${lang.label}`}
                        style={{ pointerEvents: 'auto' }}
                        onClick={e => { e.stopPropagation(); setOpenMenuCode(openMenuCode === lang.code ? null : lang.code) }}
                      />
                    </div>
                    <Menu
                      opener={`lang-overflow-${lang.code}`}
                      open={openMenuCode === lang.code}
                      onClose={() => setOpenMenuCode(null)}
                      onItemClick={e => {
                        const text = (e.detail.item as HTMLElement).getAttribute('text') ?? ''
                        if (text === 'Move Up') moveContentLanguage(lang.code, 'up')
                        else if (text === 'Move Down') moveContentLanguage(lang.code, 'down')
                        else if (text === 'Set as Default') setDefaultLanguage(lang.code)
                        else if (text === 'Remove') removeContentLanguage(lang.code)
                        setIsDirty(true)
                        setOpenMenuCode(null)
                      }}
                    >
                      <MenuItem text="Move Up" icon="slim-arrow-up" disabled={idx === 0} />
                      <MenuItem text="Move Down" icon="slim-arrow-down" disabled={idx === contentLanguages.length - 1} />
                      {!lang.isDefault && <MenuItem text="Set as Default" icon="favorite" />}
                      {!lang.isDefault && <MenuSeparator />}
                      <MenuItem text="Remove" icon="decline" disabled={contentLanguages.length === 1} />
                    </Menu>
                  </ListItemCustom>
                ))}
              </List>
            </div>
          </SettingsSection>

          <SettingsSection title="Content & Storage">
            <div className={s.rowWide}>
              <Label className={s.fieldLabel}>Private Folder</Label>
              <CheckBox
                checked={privateFolder}
                text="Enable private folder 'My documents' for every user"
                onChange={() => { setPrivateFolder(!privateFolder); setIsDirty(true) }}
                style={{ marginLeft: '-8px' }}
              />
              <Text className={s.fieldDesc}>
                If enabled, diagrams in this folder (and its subfolders) are private. Other users can't view or edit them.
              </Text>
            </div>
            <div className={s.rowWide}>
              <Label className={s.fieldLabel}>Document & Picture Upload</Label>
              <CheckBox
                checked={uploadEnabled}
                text="Enable uploading of documents/pictures"
                onChange={() => { setUploadEnabled(v => !v); setIsDirty(true) }}
                style={{ marginLeft: '-8px' }}
              />
              <Text className={s.fieldDesc}>
                If enabled, users can upload documents and pictures into your SAP Signavio file storage. Your file storage can contain up to 10240 MB.
              </Text>
            </div>
          </SettingsSection>

          <SettingsSection title="Notifications & Subscriptions">
            <div className={s.rowWide}>
              <Label className={s.fieldLabel}>Content Subscriptions</Label>
              <CheckBox
                checked={subscriptionsEnabled}
                text="Enable content subscriptions"
                onChange={() => { setSubscriptionsEnabled(v => !v); setIsDirty(true) }}
                style={{ marginLeft: '-8px' }}
              />
              <Text className={s.fieldDesc}>
                If disabled, users are no longer able to subscribe to content changes inside the application. Users also won't receive notification emails for existing subscriptions. If enabled again, all previous subscriptions will be restored.
              </Text>
            </div>
            <div className={s.rowWide}>
              <Label for="auto-subscription" showColon className={s.fieldLabel}>Automatic Subscriptions</Label>
              <Text className={s.fieldDesc}>
                Subscriptions can be created automatically in the moment a user is invited to comment or when a user has submitted a comment on a model.
              </Text>
              <Select
                id="auto-subscription"
                className={s.fieldFull}
                onChange={e => { setAutoSubscription((e.detail.selectedOption as HTMLElement).textContent ?? autoSubscription); setIsDirty(true) }}
              >
                {AUTO_SUBSCRIPTION_OPTIONS.map(o => <Option key={o} selected={o === autoSubscription}>{o}</Option>)}
              </Select>
            </div>
          </SettingsSection>

      </SettingsPageLayout>
      <TransferOwnershipDialog
        open={transferOpen}
        currentOwnerId={ownerId}
        onClose={() => setTransferOpen(false)}
        onTransfer={newId => { setOwnerId(newId); setTransferOpen(false); setIsDirty(true) }}
      />
    </PageHeader>
  )
}
