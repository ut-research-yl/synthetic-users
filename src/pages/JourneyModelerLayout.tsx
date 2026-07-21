import { useState } from 'react'
import { FlexibleColumnLayout } from '@ui5/webcomponents-react'
import JourneyModelerApp from './JourneyModelerApp'
import { SuiteContextPanelContent, SuiteContextRail } from '../components/SuiteContextPanel'
import s from './ModelerLayout.module.css'

type PanelId = string | null

export default function JourneyModelerLayout() {
  const [activePanel, setActivePanel] = useState<PanelId>(null)

  const togglePanel = (id: PanelId) =>
    setActivePanel(prev => (prev === id ? null : id))

  const layout = activePanel ? 'TwoColumnsStartExpanded' : 'OneColumn'

  return (
    <div className={s.root}>
      <FlexibleColumnLayout
        className={`${s.splitter} modeler-fcl`}
        layout={layout}
        style={{ height: '100%', '--_ui5_fcl_separator_btn_display': 'none' } as React.CSSProperties}
        startColumn={
          <div style={{ height: '100%', overflow: 'hidden' }}>
            <JourneyModelerApp onTogglePanel={() => togglePanel('diagram-attributes')} />
          </div>
        }
        midColumn={
          activePanel ? (
            <div style={{ height: '100%', overflow: 'hidden' }}>
              <SuiteContextPanelContent
                activePanel={activePanel}
                onTogglePanel={togglePanel}
                assetId="new-journey"
              />
            </div>
          ) : <div />
        }
      />
      <SuiteContextRail activePanel={activePanel} onTogglePanel={togglePanel} />
    </div>
  )
}
