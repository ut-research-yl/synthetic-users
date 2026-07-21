import React from 'react'
import { Button, Icon } from '@ui5/webcomponents-react'
import s from './JourneyElementsPanel.module.css'

type StepType = {
  title: string
  laneId: string
  icon: string
  color: string
}

const STEP_TYPES: StepType[] = [
  { title: 'Customer Action', laneId: 'ln-actions',     icon: 'customer',   color: '#4a90d9' },
  { title: 'Touchpoint',      laneId: 'ln-touchpoints', icon: 'touch',      color: '#9b59b6' },
  { title: 'Emotion',         laneId: 'ln-emotions',    icon: 'smiley',     color: '#f39c12' },
  { title: 'Pain Point',      laneId: 'ln-painpoints',  icon: 'alert',      color: '#e74c3c' },
  { title: 'Opportunity',     laneId: 'ln-opportun',    icon: 'lightbulb',  color: '#27ae60' },
]

type Props = { onClose: () => void }

export default function JourneyElementsPanel({ onClose }: Props) {
  const handleDragStart = (e: React.DragEvent, stepType: StepType) => {
    e.dataTransfer.setData('application/journey-step', JSON.stringify(stepType))
    e.dataTransfer.effectAllowed = 'copy'
  }

  return (
    <div className={s.panel}>
      <div className={s.header}>
        <span className={s.title}>Elements</span>
        <Button
          icon="decline"
          design="Transparent"
          tooltip="Close"
          onClick={onClose}
          style={{ '--_ui5_button_base_min_width': '1.75rem', width: '1.75rem', height: '1.75rem' } as React.CSSProperties}
        />
      </div>
      <div className={s.list}>
        {STEP_TYPES.map(st => (
          <button
            key={st.laneId}
            className={s.item}
            title={`Drag to add ${st.title}`}
            draggable
            onDragStart={e => handleDragStart(e, st)}
          >
            <span className={s.colorBar} style={{ background: st.color }} />
            <Icon name={st.icon} style={{ width: '1.25rem', height: '1.25rem', color: st.color } as React.CSSProperties} />
            <span className={s.label}>{st.title}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
