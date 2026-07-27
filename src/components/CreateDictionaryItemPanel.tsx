import React, { useState } from 'react'
import { Avatar, Bar, Button, Icon, Input, Label, Option, Select, Switch, TabContainer, Tab, Text, Toast } from '@ui5/webcomponents-react'
import { SigChipV2, SigInlineEdit } from '@signavio/sap-signavio-uixtension'

const CATEGORIES = [
  { value: 'Activities', subCategories: ['HR Processes', 'Finance Processes', 'IT Operations', 'Procurement', 'Sales'] },
  { value: 'IT System', subCategories: ['ERP', 'CRM', 'ITSM', 'HCM', 'Collaboration'] },
  { value: 'Documents', subCategories: ['HR Information', 'Finance', 'Legal', 'Compliance'] },
  { value: 'Organizational Units', subCategories: ['Management', 'Human Resources', 'Finance', 'IT Management'] },
]

const LANGUAGES = ['English', 'German', 'French', 'Spanish', 'Japanese']

type Props = {
  elementName?: string
  onClose: () => void
  onCreateAndLink: (name: string, category: string, subCategory: string, description: string) => void
}

function AttrRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: '0.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      <Label required showColon style={{ color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSize)' }}>{label}</Label>
      {children}
    </div>
  )
}

export default function CreateDictionaryItemPanel({ elementName, onClose, onCreateAndLink }: Props) {
  const [name, setName] = useState(elementName ?? 'New Dictionary Entry')
  const [category, setCategory] = useState('Activities')
  const [subCategory, setSubCategory] = useState('HR Processes')
  const [description, setDescription] = useState('')
  const [checkboxVal, setCheckboxVal] = useState(true)

  const [language, setLanguage] = useState('English')
  const [toastOpen, setToastOpen] = useState(false)
  const subCategories = CATEGORIES.find(c => c.value === category)?.subCategories ?? []

  return (
    <div className="create-dict-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--sapBaseColor, #fff)', overflow: 'hidden', position: 'relative' }}>

      {/* Row 1: avatar + category text + arrow | separator | close */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem 0.5rem', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
          <Avatar icon="course-book" colorScheme="Accent5" shape="Square" size="XS"
            style={{ '--_ui5_avatar_border_radius': '0.5rem', width: '1.625rem', height: '1.625rem', flexShrink: 0 } as React.CSSProperties} />
          <Text style={{ fontSize: 'var(--sapFontHeader5Size, 1rem)', fontWeight: 700, color: 'var(--sapPageHeader_TextColor)', whiteSpace: 'nowrap' } as React.CSSProperties}>
            {category}
          </Text>
          <Button design="Transparent" icon="slim-arrow-down"
            style={{ '--_ui5_button_base_min_width': '1.5rem', width: '1.5rem', height: '1.5rem', padding: 0 } as React.CSSProperties} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, flexShrink: 0 }}>
          {/* Language selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.125rem' }}>
            <Text style={{ fontSize: 'var(--sapFontSize, 0.875rem)', fontWeight: 400, color: 'var(--sapButton_Hover_TextColor)' } as React.CSSProperties}>{language}</Text>
            <Button design="Transparent" icon="slim-arrow-down"
              style={{ '--_ui5_button_base_min_width': '1.5rem', width: '1.5rem', height: '1.5rem', padding: 0 } as React.CSSProperties} />
          </div>
          <div style={{ width: 1, height: '1.75rem', background: 'var(--sapToolbar_SeparatorColor, #d9d9d9)', marginInline: '0.5rem', flexShrink: 0 }} />
          <Button design="Transparent" icon="decline" onClick={onClose} />
        </div>
      </div>

      {/* Row 2: inline edit title */}
      <div style={{ padding: '0.5rem 1rem 0.75rem', flexShrink: 0 }}>
        <SigInlineEdit
          text={name}
          size="H3"
          onChange={(e: any) => setName(e.detail?.value ?? e.target?.value ?? name)}
        />
      </div>

      {/* Tabs */}
      <div className="dict-detail-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
        <TabContainer style={{ flex: 1, minHeight: 0 } as React.CSSProperties}>
          <Tab text="Attributes">
            <div style={{ padding: '1rem 1rem 5rem', overflowY: 'auto', height: '100%' }}>
              {/* Search */}
              <div style={{ marginBottom: '0.75rem', padding: '0 0' }}>
                <Input placeholder="Search for attributes" type={'Search' as any} style={{ width: '100%' }}>
                  <Icon slot="icon" name="search" />
                </Input>
              </div>

              <AttrRow label="Description">
                <Button design="Default" icon="edit" style={{ alignSelf: 'flex-start', height: '1.75rem' } as React.CSSProperties} />
              </AttrRow>

              <AttrRow label="Active">
                <Switch checked={checkboxVal} onChange={(e: any) => setCheckboxVal(e.target.checked)} />
              </AttrRow>

              <AttrRow label="Date">
                <Button design="Default" icon="add" style={{ alignSelf: 'flex-start', height: '1.75rem' } as React.CSSProperties} />
              </AttrRow>

              <AttrRow label="Number">
                <Button design="Default" icon="add" style={{ alignSelf: 'flex-start', height: '1.75rem' } as React.CSSProperties} />
              </AttrRow>

              <AttrRow label="Selection">
                <SigChipV2 value="[Item Name 1]" trailingIcon="slim-arrow-down" />
              </AttrRow>

              <AttrRow label="Multi-Select">
                <Button design="Default" icon="add" style={{ alignSelf: 'flex-start', height: '1.75rem' } as React.CSSProperties} />
              </AttrRow>

              <AttrRow label="Asset">
                <Button design="Default" icon="add" style={{ alignSelf: 'flex-start', height: '1.75rem' } as React.CSSProperties} />
              </AttrRow>
            </div>
          </Tab>
          <Tab text="Relations">
            <div style={{ padding: '0.5rem 1rem' }}>
              <Text style={{ color: 'var(--sapContent_LabelColor)' } as React.CSSProperties}>No relations defined.</Text>
            </div>
          </Tab>
          <Tab text="Activity">
            <div style={{ padding: '0.5rem 1rem' }}>
              <Text style={{ color: 'var(--sapContent_LabelColor)' } as React.CSSProperties}>No activity yet.</Text>
            </div>
          </Tab>
        </TabContainer>
      </div>

      {/* Floating footer */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1rem', zIndex: 10 }}>
        <Bar design={'FloatingFooter' as any} style={{ borderRadius: '0.5rem', boxShadow: 'var(--sapContent_Shadow1)' } as React.CSSProperties}>
          <Button slot="endContent" design="Emphasized" onClick={() => {
            onCreateAndLink(name, category, subCategory, description)
            setToastOpen(true)
          }}>Create &amp; Link</Button>
          <Button slot="endContent" design="Transparent" onClick={onClose}>Cancel</Button>
        </Bar>
      </div>

      <Toast open={toastOpen} placement="BottomCenter" onClose={() => setToastOpen(false)}>
        "{name}" linked to dictionary
      </Toast>
    </div>
  )
}
