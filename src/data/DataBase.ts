import type { ComponentProps } from 'react'
import { SigDomainObject } from '@signavio/sap-signavio-uixtension'
import { formatDate, addDays, lastWeekday } from '../utils/dates'

export type DomainObjects = ComponentProps<typeof SigDomainObject>['object']

export interface MockItem {
  object: DomainObjects
  title: string
  /** Readable type label, e.g. "BPMN", "Customer Journey Map" */
  type: string
  /** Display as-is if string ("2 hours ago"); or calculate a date based on number */
  lastAccessed: string | number
  isFavorite: boolean
  /** Filename stem of the preview asset, e.g. "SampleProcess1" (SVG files stay in src/models/) */
  preview?: string
}

export function formatAccessed(v: string | number): string {
  if (typeof v === 'string') return v
  return formatDate(lastWeekday(addDays(new Date(), -v)))
}

export const REPOSITORY_ITEMS: MockItem[] = [
  { object: 'Value Chain',      title: 'Company Overview',                              type: 'Value Chain',          lastAccessed: '1 hour ago',  isFavorite: true,  preview: 'EntryDiagram'     },
  { object: 'Process Model',    title: '[To-Be: Post Transformation] Credit Management', type: 'BPMN',                lastAccessed: '2 hours ago', isFavorite: false, preview: 'SampleProcess1'   },
  { object: 'Process Model',    title: 'Procurement of Work Equipment',                 type: 'BPMN',                 lastAccessed: '1 day ago',   isFavorite: true,  preview: 'SampleProcess2'   },
  { object: 'Folder',           title: 'Contract templates',                            type: 'Folder',               lastAccessed: '1 day ago',   isFavorite: false,  preview: undefined          },
  { object: 'Initiative',       title: 'Procure2Pay 2026',                              type: 'Initiative',           lastAccessed: 2,             isFavorite: true, preview: undefined          },
  { object: 'Process Model',    title: 'Hiring Process',                                type: 'BPMN',                 lastAccessed: 7,             isFavorite: false, preview: 'SampleProcess4'   },
  { object: 'Folder',           title: 'Shipping',                                      type: 'Folder',               lastAccessed: 7,             isFavorite: false, preview: undefined          },
  { object: 'Process Model',    title: 'Lead-to-Cash',                                  type: 'BPMN',                 lastAccessed: 16,            isFavorite: true,  preview: 'SampleProcess3'   },
  { object: 'PDF',              title: 'New Supplier Contract',                         type: 'PDF Document',         lastAccessed: 24,            isFavorite: true,  preview: undefined          },
]
