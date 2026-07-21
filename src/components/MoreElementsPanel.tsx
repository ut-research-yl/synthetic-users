import React, { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button, Icon, Input, Title, Menu, MenuItem } from '@ui5/webcomponents-react'
import s from './MoreElementsPanel.module.css'

type ShapeItem = { title: string; type: string; subtype?: string; icon: string }
type Category = { label: string; items: ShapeItem[] }

const CATEGORIES: Category[] = [
  {
    label: 'Activities',
    items: [
      { title: 'Task',                       type: 'task',                        subtype: 'task',                      icon: 'SAP-icons-v4/task-activity' },
      { title: 'Collapsed Subprocess',       type: 'collapsed-subprocess',        subtype: 'CollapsedSubprocess',       icon: 'SAP-icons-v4/collapsed-subprocess' },
      { title: 'Expanded Subprocess',        type: 'expanded-subprocess',         subtype: 'ExpandedSubprocess',        icon: 'SAP-icons-v4/expanded-subprocess' },
      { title: 'Collapsed Event-Subprocess', type: 'collapsed-event-subprocess',  subtype: 'CollapsedEventSubprocess',  icon: 'SAP-icons-v4/collapsed-event-subprocess' },
      { title: 'Event Subprocess',           type: 'event-subprocess',            subtype: 'EventSubprocess',           icon: 'SAP-icons-v4/event-subprocess' },
    ],
  },
  {
    label: 'Gateways',
    items: [
      { title: 'Exclusive Gateway (XOR)',  type: 'xor-gateway',      subtype: 'Exclusive',   icon: 'SAP-icons-v4/exclusive-xor-gateway' },
      { title: 'Event-based Gateway',      type: 'event-gateway',    subtype: 'EventBased',  icon: 'SAP-icons-v4/event-based-gateway' },
      { title: 'Parallel Gateway',         type: 'parallel-gateway', subtype: 'Parallel',    icon: 'SAP-icons-v4/parallel-gateway' },
      { title: 'Inclusive Gateway',        type: 'inclusive-gateway',subtype: 'Inclusive',   icon: 'SAP-icons-v4/inclusive-gateway' },
      { title: 'Complex Gateway',          type: 'complex-gateway',  subtype: 'Complex',     icon: 'SAP-icons-v4/complex-gateway' },
    ],
  },
  {
    label: 'Swimlanes',
    items: [
      { title: 'Pool/Lane',            type: 'pool-lane',        icon: 'SAP-icons-v4/pool-lane' },
      { title: 'Collapsed Pool',       type: 'collapsed-pool',   icon: 'SAP-icons-v4/collapsed-pool' },
      { title: 'Participant',          type: 'participant',      subtype: 'Participant', icon: 'person-placeholder' },
    ],
  },
  {
    label: 'Artifacts',
    items: [
      { title: 'Group',           type: 'group',           subtype: 'Group',          icon: 'SAP-icons-v4/bpmn-group' },
      { title: 'Text Annotation', type: 'text-annotation', subtype: 'TextAnnotation', icon: 'SAP-icons-v4/text-annotation' },
      { title: 'IT System',       type: 'it-system',       subtype: 'ITSystem',       icon: 'SAP-icons-v4/computer' },
    ],
  },
  {
    label: 'Data Objects',
    items: [
      { title: 'Data Object', type: 'data-object', subtype: 'DataObject', icon: 'document' },
      { title: 'Data Store',  type: 'data-store',  subtype: 'DataStore',  icon: 'SAP-icons-v4/source-data' },
      { title: 'Message',     type: 'data-object', subtype: 'Message',    icon: 'email' },
    ],
  },
  {
    label: 'Start Events',
    items: [
      { title: 'Start Event',                   type: 'start-event', subtype: 'Start',                  icon: 'SAP-icons-v4/start-event' },
      { title: 'Start Message Event',            type: 'start-event', subtype: 'MessageStart',           icon: 'SAP-icons-v4/start-message-event' },
      { title: 'Start Timer Event',              type: 'start-event', subtype: 'TimerStart',             icon: 'SAP-icons-v4/start-timer-event' },
      { title: 'Start Escalation Event',         type: 'start-event', subtype: 'EscalationStart',        icon: 'SAP-icons-v4/start-escalation-event' },
      { title: 'Start Conditional Event',        type: 'start-event', subtype: 'ConditionalStart',       icon: 'SAP-icons-v4/start-conditional-event' },
      { title: 'Start Error Event',              type: 'start-event', subtype: 'ErrorStart',             icon: 'SAP-icons-v4/start-error-event' },
      { title: 'Start Compensation Event',       type: 'start-event', subtype: 'CompensationStart',      icon: 'SAP-icons-v4/start-compensation-event' },
      { title: 'Start Signal Event',             type: 'start-event', subtype: 'SignalStart',            icon: 'SAP-icons-v4/start-signal-event' },
      { title: 'Start Multiple Event',           type: 'start-event', subtype: 'MultipleStart',          icon: 'SAP-icons-v4/start-multiple-event' },
      { title: 'Start Parallel Multiple Event',  type: 'start-event', subtype: 'ParallelMultipleStart',  icon: 'SAP-icons-v4/start-parallel-multiple-event' },
    ],
  },
  {
    label: 'Catching Intermediate Events',
    items: [
      { title: 'Intermediate Message Event',           type: 'start-event', subtype: 'CatchingMessage',          icon: 'SAP-icons-v4/catching-intermediate-message-event' },
      { title: 'Intermediate Timer Event',             type: 'start-event', subtype: 'CatchingTimer',            icon: 'SAP-icons-v4/catching-intermediate-timer-event' },
      { title: 'Intermediate Escalation Event',        type: 'start-event', subtype: 'CatchingEscalation',       icon: 'SAP-icons-v4/catching-intermediate-escalation-event' },
      { title: 'Intermediate Conditional Event',       type: 'start-event', subtype: 'CatchingConditional',      icon: 'SAP-icons-v4/catching-intermediate-conditional-event' },
      { title: 'Intermediate Link Event',              type: 'start-event', subtype: 'CatchingLink',             icon: 'SAP-icons-v4/catching-intermediate-link-event' },
      { title: 'Intermediate Error Event',             type: 'start-event', subtype: 'CatchingError',            icon: 'SAP-icons-v4/catching-intermediate-error-event' },
      { title: 'Intermediate Cancel Event',            type: 'start-event', subtype: 'CatchingCancel',           icon: 'SAP-icons-v4/catching-intermediate-cancel-event' },
      { title: 'Intermediate Compensation Event',      type: 'start-event', subtype: 'CatchingCompensation',     icon: 'SAP-icons-v4/catching-intermediate-compensation-event' },
      { title: 'Intermediate Signal Event',            type: 'start-event', subtype: 'CatchingSignal',           icon: 'SAP-icons-v4/catching-intermediate-signal-event' },
      { title: 'Intermediate Multiple Event',          type: 'start-event', subtype: 'CatchingMultiple',         icon: 'SAP-icons-v4/catching-intermediate-multiple-event' },
      { title: 'Intermediate Parallel Multiple Event', type: 'start-event', subtype: 'CatchingParallelMultiple', icon: 'SAP-icons-v4/catching-intermediate-parallel-multiple-event' },
    ],
  },
  {
    label: 'Throwing Intermediate Events',
    items: [
      { title: 'Intermediate Event',              type: 'start-event', subtype: 'ThrowingIntermediate',  icon: 'SAP-icons-v4/intermediate-event' },
      { title: 'Intermediate Message Event',      type: 'start-event', subtype: 'ThrowingMessage',       icon: 'SAP-icons-v4/throwing-intermediate-message-event' },
      { title: 'Intermediate Escalation Event',   type: 'start-event', subtype: 'ThrowingEscalation',    icon: 'SAP-icons-v4/throwing-intermediate-escalation-event' },
      { title: 'Intermediate Link Event',         type: 'start-event', subtype: 'ThrowingLink',          icon: 'SAP-icons-v4/intermediate-link-event' },
      { title: 'Intermediate Compensation Event', type: 'start-event', subtype: 'ThrowingCompensation',  icon: 'SAP-icons-v4/throwing-intermediate-compensation-event' },
      { title: 'Intermediate Signal Event',       type: 'start-event', subtype: 'ThrowingSignal',        icon: 'SAP-icons-v4/throwing-intermediate-signal-event' },
      { title: 'Intermediate Multiple Event',     type: 'start-event', subtype: 'ThrowingMultiple',      icon: 'SAP-icons-v4/throwing-intermediate-multiple-event' },
    ],
  },
  {
    label: 'End Events',
    items: [
      { title: 'End Event',               type: 'end-event', subtype: 'End',             icon: 'SAP-icons-v4/end-event' },
      { title: 'End Message Event',       type: 'end-event', subtype: 'EndMessage',       icon: 'SAP-icons-v4/end-message-event' },
      { title: 'End Escalation Event',    type: 'end-event', subtype: 'EndEscalation',    icon: 'SAP-icons-v4/end-escalation-event' },
      { title: 'End Error Event',         type: 'end-event', subtype: 'EndError',         icon: 'SAP-icons-v4/end-error-event' },
      { title: 'Cancel End Event',        type: 'end-event', subtype: 'EndCancel',        icon: 'SAP-icons-v4/cancel-error-event' },
      { title: 'End Compensation Event',  type: 'end-event', subtype: 'EndCompensation',  icon: 'SAP-icons-v4/end-compensation-event' },
      { title: 'End Signal Event',        type: 'end-event', subtype: 'EndSignal',        icon: 'SAP-icons-v4/end-signal-event' },
      { title: 'End Multiple Event',      type: 'end-event', subtype: 'EndMultiple',      icon: 'SAP-icons-v4/end-multiple-event' },
      { title: 'Terminate End Event',     type: 'end-event', subtype: 'TerminateEnd',     icon: 'SAP-icons-v4/terminate-end-event' },
    ],
  },
  {
    label: 'Connecting Objects',
    items: [
      { title: 'Sequence Flow',                  type: 'sequence-flow',                   icon: 'SAP-icons-v4/sequence-flow' },
      { title: 'Association (undirected)',        type: 'association-undirected',          icon: 'SAP-icons-v4/association-undirected' },
      { title: 'Association (unidirectional)',    type: 'association-unidirectional',      icon: 'SAP-icons-v4/association-unidirectional' },
      { title: 'Association (bidirectional)',     type: 'association-bidirectional',       icon: 'SAP-icons-v4/association-bidirectional' },
      { title: 'Message Flow',                   type: 'message-flow',                    icon: 'SAP-icons-v4/message-flow' },
    ],
  },
]

const GENERIC_CATEGORIES: Category[] = [
  {
    label: 'Basic Shapes',
    items: [
      { title: 'Rectangle',   type: 'rectangle',   icon: 'SAP-icons-v4/task-activity' },
      { title: 'Diamond',     type: 'diamond',     icon: 'SAP-icons-v4/diamond' },
      { title: 'Circle',      type: 'circle',      icon: 'SAP-icons-v4/start-event' },
      { title: 'Annotation',  type: 'annotation',  icon: 'SAP-icons-v4/text-annotation' },
      { title: 'Dashed Line', type: 'dashed-line', icon: 'SAP-icons-v4/association-undirected' },
      { title: 'Dotted Line', type: 'dotted-line', icon: 'SAP-icons-v4/association-unidirectional' },
    ],
  },
]

export default function MoreElementsPanel({ onClose }: Props) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [query, setQuery] = useState('')
  const [notation, setNotation] = useState('BPMN 2.0')
  const menuRef = useRef<any>(null)
  const bodyRef = useRef<HTMLDivElement>(null)

  const toggle = (label: string) => setCollapsed(c => ({ ...c, [label]: !c[label] }))

  const handleNotationChange = (text: string) => {
    setNotation(text)
    setTimeout(() => { if (bodyRef.current) bodyRef.current.scrollTop = 0 }, 0)
  }

  const handleDragStart = (e: React.DragEvent, item: ShapeItem) => {
    e.dataTransfer.setData('application/bpmn-shape', JSON.stringify({ type: item.type, title: item.title, subtype: item.subtype }))
    e.dataTransfer.effectAllowed = 'copy'
  }

  const q = query.toLowerCase()
  const allCategories = notation === 'BPMN 2.0 + Generic Stencils'
    ? [...CATEGORIES, ...GENERIC_CATEGORIES]
    : CATEGORIES
  const filtered = allCategories.map(cat => ({
    ...cat,
    items: q ? cat.items.filter(i => i.title.toLowerCase().includes(q)) : cat.items,
  })).filter(cat => cat.items.length > 0)

  return (
    <div className={s.panel}>
      {/* Header */}
      <div className={s.header}>
        <Button
          id="mep-notation-btn"
          design="Transparent"
          endIcon="navigation-down-arrow"
          style={{ fontWeight: '700', fontSize: 'var(--sapFontHeader5Size)', color: 'var(--sapTextColor)', padding: 0, '--_ui5_button_base_padding': '0', background: 'transparent', border: 'none' } as React.CSSProperties}
          onClick={() => { if (menuRef.current) { menuRef.current.opener = 'mep-notation-btn'; menuRef.current.open = true } }}
        >
          {notation}
        </Button>
        <Button icon="decline" design="Transparent" tooltip="Close"
          style={{ '--_ui5_button_base_min_width': '1.75rem', width: '1.75rem', height: '1.75rem', color: 'var(--sapTextColor)', '--_ui5_button_icon_color': 'var(--sapTextColor)' } as React.CSSProperties}
          onClick={onClose}
        />
      </div>

      {createPortal(
        <Menu ref={menuRef} onItemClick={(e: any) => handleNotationChange(e.detail?.text ?? notation)}>
          <MenuItem text="BPMN 2.0" />
          <MenuItem text="BPMN 2.0 + Generic Stencils" />
        </Menu>,
        document.body
      )}

      {/* Search */}
      <div className={s.search}>
        <Input
          placeholder="Search elements"
          showClearIcon
          icon={<Icon slot="icon" name="search" />}
          value={query}
          onInput={(e: any) => setQuery(e.target?.value ?? '')}
          style={{ width: '100%', '--_ui5_input_height': '1.875rem' } as React.CSSProperties}
        />
      </div>

      {/* Categories */}
      <div className={s.body} ref={bodyRef}>
        {filtered.map(cat => (
          <div key={cat.label} className={s.category}>
            <button className={s.catHeader} onClick={() => toggle(cat.label)}>
              <span style={{ fontSize: 'var(--sapFontSmallSize)', fontWeight: '600', color: 'var(--sapTextColor)' }}>{cat.label}</span>
              <Icon
                name="navigation-down-arrow"
                style={{ width: '1rem', height: '1rem', flexShrink: 0, display: 'block', transform: collapsed[cat.label] ? 'rotate(-90deg)' : 'none', transition: 'transform 0.15s' } as React.CSSProperties}
              />
            </button>
            {!collapsed[cat.label] && (
              <div className={s.catGrid}>
                {cat.items.map(item => (
                  <button
                    key={item.type}
                    className={s.item}
                    title={item.title}
                    draggable
                    onDragStart={e => handleDragStart(e, item)}
                  >
                    <Icon
                      name={item.icon}
                      style={{ width: '1.5rem', height: '1.5rem', color: 'var(--sapHighlightColor)' } as React.CSSProperties}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
