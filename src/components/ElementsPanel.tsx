import React from 'react'
import { Button, Icon } from '@ui5/webcomponents-react'
import s from './ElementsPanel.module.css'

type QuickItem = {
  title: string
  type: string
  subtype?: string
  icon: string
}

const QUICK_ITEMS: QuickItem[] = [
  { title: 'Sequence Flow',          type: 'sequence-flow',        icon: 'SAP-icons-v4/sequence-flow' },
  { title: 'Task',                   type: 'task',                 subtype: 'task',                icon: 'SAP-icons-v4/task-activity' },
  { title: 'Association',            type: 'association',          icon: 'SAP-icons-v4/association-undirected' },
  { title: 'XOR Gateway',            type: 'xor-gateway',          subtype: 'Exclusive',           icon: 'SAP-icons-v4/exclusive-xor-gateway' },
  { title: 'IT System',              type: 'it-system',            subtype: 'ITSystem',            icon: 'SAP-icons-v4/computer' },
  { title: 'End Event',              type: 'end-event',            subtype: 'End',                 icon: 'SAP-icons-v4/end-event' },
  { title: 'Message Flow',           type: 'message-flow',         icon: 'SAP-icons-v4/association-unidirectional' },
  { title: 'Text Annotation',        type: 'text-annotation',      subtype: 'TextAnnotation',      icon: 'SAP-icons-v4/text-annotation' },
  { title: 'Data Object',            type: 'data-object',          subtype: 'DataObject',          icon: 'document' },
  { title: 'Start Event',            type: 'start-event',          subtype: 'Start',               icon: 'SAP-icons-v4/start-event' },
  { title: 'Pool',                   type: 'pool',                 icon: 'SAP-icons-v4/pool-lane' },
  { title: 'Expanded Subprocess',    type: 'expanded-subprocess',  subtype: 'ExpandedSubprocess',  icon: 'SAP-icons-v4/collapsed-subprocess' },
]

type Props = {
  onClose: () => void
  onMoreElements: () => void
}

export default function ElementsPanel({ onClose, onMoreElements }: Props) {
  const handleDragStart = (e: React.DragEvent, type: string, title: string, subtype?: string) => {
    e.dataTransfer.setData('application/bpmn-shape', JSON.stringify({ type, title, subtype }))
    e.dataTransfer.effectAllowed = 'copy'
  }

  return (
    <div className={s.panel}>
      <div className={s.header}>
        <span className={s.title}>Elements</span>
        <Button
          icon="customize"
          design="Transparent"
          tooltip="Customize"
          style={{ '--_ui5_button_base_min_width': '1.75rem', width: '1.75rem', height: '1.75rem', color: 'var(--sapTextColor)', '--_ui5_button_icon_color': 'var(--sapTextColor)' } as React.CSSProperties}
        />
      </div>
      <div className={s.grid}>
        {QUICK_ITEMS.map(item => (
          <button
            key={item.title}
            className={s.item}
            title={item.title}
            draggable
            onDragStart={e => handleDragStart(e, item.type, item.title, item.subtype)}
          >
            <Icon name={item.icon} style={{ width: '1.5rem', height: '1.5rem', color: 'var(--sapHighlightColor)' } as React.CSSProperties} />
          </button>
        ))}
      </div>
      <Button design="Default" style={{ width: '100%' }} onClick={onMoreElements}>
        More Elements
      </Button>
    </div>
  )
}
