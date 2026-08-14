import { Button, Text } from '@ui5/webcomponents-react'
import PageHeader from '../components/PageHeader'
import SettingsPageLayout, { SettingsSection } from '../components/SettingsPageLayout'
import s from '../components/SettingsPage.module.css'

export default function CloudALM() {
  return (
    <PageHeader title="ALM Platform Synchronization" subtitle="Set up synchronization between your workspace and ALM Platform." onSave={() => {}} onReset={() => {}}>
      <SettingsPageLayout>
        <SettingsSection title="ALM Platform Synchronization">
          <div className={s.rowWide}>
            <Text className={s.fieldDesc}>
              Configure the synchronizations with ALM Platform to keep process content aligned between both systems.
            </Text>
            <div style={{ padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
              <Text className={s.fieldLabel}>Settings unavailable</Text>
              <Text style={{ color: 'var(--sapContent_LabelColor)', textAlign: 'center', maxWidth: '28rem', display: 'block' }}>
                It looks like your Process Manager Workspace isn't connected to ALM Platform yet. Please navigate to the
                Workspace Admin Guide and learn how to connect it.
              </Text>
              <Button design="Emphasized">To the Workspace Admin Guide</Button>
            </div>
          </div>
        </SettingsSection>
      </SettingsPageLayout>
    </PageHeader>
  )
}
