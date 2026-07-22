import type { ReactNode } from 'react'
import { Title } from '@ui5/webcomponents-react'
import './SidePanelSection.css'

interface SidePanelSectionProps {
  title: string
  children: ReactNode
}

export function SidePanelSection({ title, children }: SidePanelSectionProps) {
  return (
    <div className="tpl-panel-section">
      <Title level="H6" wrappingType="None">{title}</Title>
      {children}
    </div>
  )
}

export function SidePanelCard({ children }: { children: ReactNode }) {
  return <div className="tpl-panel-card">{children}</div>
}

export function SidePanelList({ children }: { children: ReactNode }) {
  return <div className="tpl-panel-list">{children}</div>
}

export function SidePanelGrid({ children }: { children: ReactNode }) {
  return <div className="tpl-panel-grid">{children}</div>
}
