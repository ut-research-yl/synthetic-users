import { useState, useEffect } from 'react'
import {
  Dialog, Button, Bar, Label,
  TextArea,
  MultiComboBox, MultiComboBoxItem,
  CheckBox, Text, MessageStrip,
} from '@ui5/webcomponents-react'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export interface AddUserData {
  emails: string[]
  licenses: string[]
  groups: string[]
  skipInviteEmail: boolean
  skipPasswordEmail: boolean
}

interface Props {
  open: boolean
  availableLicenses: string[]
  availableGroups: string[]
  onClose: () => void
  onAdd: (data: AddUserData) => void
}

export function AddUserDialog({ open, availableLicenses, availableGroups, onClose, onAdd }: Props) {
  const [emailInput, setEmailInput] = useState('')
  const [emailInputInvalid, setEmailInputInvalid] = useState(false)
  const [emails, setEmails] = useState<string[]>([])
  const [licenses, setLicenses] = useState<string[]>([])
  const [licensesOpen, setLicensesOpen] = useState(false)
  const [groups, setGroups] = useState<string[]>([])
  const [groupsOpen, setGroupsOpen] = useState(false)
  const [skipInviteEmail, setSkipInviteEmail] = useState(false)
  const [skipPasswordEmail, setSkipPasswordEmail] = useState(false)

  useEffect(() => {
    if (!open) return
    setEmailInput('')
    setEmailInputInvalid(false)
    setEmails([])
    setLicenses([])
    setLicensesOpen(false)
    setGroups([])
    setGroupsOpen(false)
    setSkipInviteEmail(false)
    setSkipPasswordEmail(false)
  }, [open])

  const commitEmails = (raw: string) => {
    const parts = raw.split(/[,;\s]+/).map(s => s.trim()).filter(Boolean)
    const fresh = parts.filter(p => EMAIL_RE.test(p) && !emails.includes(p))
    const invalid = parts.some(p => !EMAIL_RE.test(p))
    if (fresh.length > 0) {
      setEmails(prev => [...prev, ...fresh])
      setEmailInput('')
      setEmailInputInvalid(false)
      return
    }
    setEmailInputInvalid(invalid && raw.trim().length > 0)
  }

  const handleEmailInput = (e: Event) => {
    const val = (e.target as HTMLTextAreaElement).value
    if (val.endsWith(',') || val.endsWith(';') || val.endsWith('\n')) {
      commitEmails(val.slice(0, -1))
    } else {
      setEmailInput(val)
      if (emailInputInvalid && EMAIL_RE.test(val.trim())) setEmailInputInvalid(false)
    }
  }

  const handleEmailChange = (e: Event) => {
    const val = (e.target as HTMLTextAreaElement).value.trim()
    if (val) commitEmails(val)
  }

  const handleLicenseChange = (e: CustomEvent) => {
    const items = (e.target as HTMLElement).querySelectorAll('ui5-mcb-item[selected]')
    setLicenses(Array.from(items).map(el => el.getAttribute('text') ?? '').filter(Boolean))
  }

  const handleGroupChange = (e: CustomEvent) => {
    const items = (e.target as HTMLElement).querySelectorAll('ui5-mcb-item[selected]')
    setGroups(Array.from(items).map(el => el.getAttribute('text') ?? '').filter(Boolean))
  }

  const canAdd = emails.length > 0 && licenses.length > 0

  const handleAdd = () => {
    if (!canAdd) return
    onAdd({ emails, licenses, groups, skipInviteEmail, skipPasswordEmail })
  }

  return (
    <Dialog
      open={open}
      headerText="Add Users"
      style={{ width: '30rem' }}
      onClose={onClose}
      footer={
        <Bar
          design="Footer"
          endContent={
            <>
              <Button design="Emphasized" disabled={!canAdd} onClick={handleAdd}>
                Add {emails.length > 1 ? `${emails.length} Users` : 'User'}
              </Button>
              <Button design="Transparent" onClick={onClose}>Cancel</Button>
            </>
          }
        />
      }
    >
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Email addresses */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <Label required for="add-user-emails">Email Addresses</Label>
          <TextArea
            id="add-user-emails"
            accessibleName="Email Addresses"
            placeholder="name@company.com — separate with commas, semicolons, or new lines"
            value={emailInput}
            valueState={emailInputInvalid ? 'Negative' : 'None'}
            rows={3}
            growing
            growingMaxRows={8}
            style={{ width: '100%' }}
            onInput={handleEmailInput}
            onChange={handleEmailChange}
          >
            {emailInputInvalid && (
              <span slot="valueStateMessage">Enter valid email addresses.</span>
            )}
          </TextArea>
          {emails.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.25rem' }}>
              {emails.map(em => (
                <span key={em} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                  padding: '0.125rem 0.375rem',
                  background: 'var(--sapButton_TokenBackground)',
                  border: '1px solid var(--sapButton_TokenBorderColor)',
                  borderRadius: '0.25rem',
                  fontSize: 'var(--sapFontSmallSize)',
                  color: 'var(--sapTextColor)',
                }}>
                  {em}
                  <button
                    onClick={() => setEmails(prev => prev.filter(e => e !== em))}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                      lineHeight: 1, color: 'var(--sapContent_LabelColor)', fontSize: '0.75rem',
                    }}
                    aria-label={`Remove ${em}`}
                  >✕</button>
                </span>
              ))}
            </div>
          )}
          <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>
            Add one or more addresses separated by commas, semicolons, or new lines.
          </Text>
        </div>

        {/* Licenses */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <Label required for="add-user-licenses">Licenses</Label>
          <MultiComboBox
            id="add-user-licenses"
            accessibleName="Licenses"
            placeholder="Select one or more licenses"
            style={{ width: '100%' }}
            open={licensesOpen}
            onFocus={() => setLicensesOpen(true)}
            onClose={() => setLicensesOpen(false)}
            onSelectionChange={handleLicenseChange}
          >
            {availableLicenses.map(l => (
              <MultiComboBoxItem key={l} text={l} selected={licenses.includes(l)} />
            ))}
          </MultiComboBox>
        </div>

        {/* Groups */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <Label for="add-user-groups">
            Groups
            <span style={{ color: 'var(--sapContent_LabelColor)', fontWeight: 'normal', marginLeft: '0.25rem' }}>(optional)</span>
          </Label>
          <MultiComboBox
            id="add-user-groups"
            accessibleName="Groups"
            placeholder="Select groups"
            style={{ width: '100%' }}
            open={groupsOpen}
            onFocus={() => setGroupsOpen(true)}
            onClose={() => setGroupsOpen(false)}
            onSelectionChange={handleGroupChange}
          >
            {availableGroups.map(g => (
              <MultiComboBoxItem key={g} text={g} selected={groups.includes(g)} />
            ))}
          </MultiComboBox>
        </div>

        {/* Notification settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Label>Notifications</Label>

          <div>
            <CheckBox
              text="Skip invitation email"
              checked={skipInviteEmail}
              onChange={e => setSkipInviteEmail((e.target as unknown as { checked: boolean }).checked)}
            />
            <div style={{ paddingLeft: '2rem' }}>
              <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>
                No invitation email is sent. A change-password email will still be delivered.
              </Text>
            </div>
          </div>

          <div>
            <CheckBox
              text="Skip change-password email"
              checked={skipPasswordEmail}
              onChange={e => setSkipPasswordEmail((e.target as unknown as { checked: boolean }).checked)}
            />
            <div style={{ paddingLeft: '2rem' }}>
              <Text style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>
                No email is sent at all. Without SSO, users must use "Forgot password" to sign in for the first time.
              </Text>
            </div>
          </div>
        </div>

        {skipInviteEmail && skipPasswordEmail && (
          <MessageStrip design="Critical" hideCloseButton>
            Users will receive no emails. Without SSO, they must use "Forgot password" on the login screen to access their account.
          </MessageStrip>
        )}

        <MessageStrip design="Information" hideCloseButton>
          Invitation links expire after 7 days.
        </MessageStrip>

      </div>
    </Dialog>
  )
}
