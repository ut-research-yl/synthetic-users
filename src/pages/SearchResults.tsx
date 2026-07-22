import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DynamicPage, DynamicPageTitle, Title, Toolbar, ToolbarButton, Button, Bar, Dialog, Input, Label, TextArea, Toast } from '@ui5/webcomponents-react'
import SearchResultsPanel from '../components/SearchResultsPanel'
import { useWorkspace } from '../contexts/WorkspaceContext'


export default function SearchResults() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const { addSmartFolder } = useWorkspace()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [toastOpen, setToastOpen] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [saveDesc, setSaveDesc] = useState('')

  const handleSave = () => {
    if (!saveName.trim()) return
    addSmartFolder({ name: saveName.trim(), description: saveDesc.trim() || undefined, query })
    setDialogOpen(false)
    setSaveName('')
    setSaveDesc('')
    setToastOpen(true)
  }

  const openDialog = () => {
    setSaveName(query || '')
    setSaveDesc('')
    setDialogOpen(true)
  }

  return (
    <DynamicPage style={{ height: '100%' }} hidePinButton titleArea={
      <DynamicPageTitle>
        <Title slot="heading" level="H3">Search</Title>
        <Toolbar slot="actionsBar">
          <ToolbarButton design="Transparent" text="Save Search" onClick={openDialog} />
        </Toolbar>
      </DynamicPageTitle>
    }>

      <SearchResultsPanel query={query} />

      <Dialog
        open={dialogOpen}
        headerText="Save Search as View"
        onClose={() => setDialogOpen(false)}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '360px', padding: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <Label for="sf-name" required>Name</Label>
            <Input
              id="sf-name"
              value={saveName}
              style={{ width: '100%' }}
              onInput={e => setSaveName((e.target as unknown as HTMLInputElement).value)}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <Label for="sf-desc">Description</Label>
            <TextArea
              id="sf-desc"
              value={saveDesc}
              rows={6}
              style={{ width: '100%' }}
              onInput={e => setSaveDesc((e.target as unknown as HTMLInputElement).value)}
            />
          </div>
        </div>
        <Bar slot="footer" design="Footer">
          <Button slot="endContent" design="Emphasized" disabled={!saveName.trim()} onClick={handleSave}>Save</Button>
          <Button slot="endContent" design="Transparent" onClick={() => setDialogOpen(false)}>Cancel</Button>
        </Bar>
      </Dialog>

      <Toast open={toastOpen} placement="BottomCenter" onClose={() => setToastOpen(false)}>
        Search saved as view. Find it under Pinned Views in the Repository.
      </Toast>
    </DynamicPage>
  )
}
