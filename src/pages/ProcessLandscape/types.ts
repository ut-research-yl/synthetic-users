export type ProcessLevelName = 'Category' | 'Process Group' | 'Process' | 'Activity' | 'Task'

export interface ProcessElement {
  id: string
  hierarchyId: string
  name: string
  description: string
  level: 1 | 2 | 3 | 4 | 5
  parentId: string | null
  processType: 'Operating' | 'Management' | 'Support'
  status: 'Active' | 'In Review' | 'Draft' | 'Deprecated'
  ownerId: string
  assetCount: number
  childCount: number
}

export type ViewMode = 'explorer' | 'maps' | 'catalog'

export const LEVEL_NAMES: Record<number, ProcessLevelName> = {
  1: 'Category',
  2: 'Process Group',
  3: 'Process',
  4: 'Activity',
  5: 'Task',
}

export const LEVEL_COLORS: Record<number, string> = {
  1: 'var(--sapIndicationColor_6)',
  2: 'var(--sapIndicationColor_5)',
  3: 'var(--sapIndicationColor_3)',
  4: 'var(--sapIndicationColor_1)',
  5: 'var(--sapIndicationColor_2)',
}

export interface ProcessHierarchy {
  id: string
  name: string
  description: string
}
