import { createContext, useContext, useState, type ReactNode, type Dispatch, type SetStateAction } from 'react'

export type ContentLanguage = { code: string; label: string; isDefault: boolean }

export type AdminUser = { id: string; name: string; email: string; initials: string; colorScheme: string; ownerSince?: string; userId: string; license: 'Process Modeler' | 'Collaboration Hub' }
export const ADMIN_USERS: AdminUser[] = [
  { id: '1',  name: 'Anna Smidth',  email: 'anna.smidth@company.com',   initials: 'AS', colorScheme: 'Accent1', ownerSince: '2021-03-15', userId: 'S2019847231', license: 'Process Modeler' },
  { id: '4',  name: 'James Park',   email: 'james.park@company.com',    initials: 'JP', colorScheme: 'Accent4', ownerSince: '2020-11-20', userId: 'S2021563847', license: 'Process Modeler' },
  { id: '7',  name: 'Elena Müller', email: 'elena.mueller@company.com', initials: 'EM', colorScheme: 'Accent7', ownerSince: '2019-06-01', userId: 'S2023193209', license: 'Process Modeler' },
  { id: '12', name: 'Carlos Vega',  email: 'carlos.vega@company.com',   initials: 'CV', colorScheme: 'Accent2', ownerSince: '2020-03-08', userId: 'S2020741582', license: 'Collaboration Hub' },
]

const DEFAULT_ADDITIONAL_INFO = `This workspace is managed by the Business Process Excellence team at Acme Inc.

For access requests, contact the workspace owner or visit the intranet at intranet.globalcorp.com/signavio.

Support hours: Mon–Fri, 8:00–17:00 CET`

export type HelpLink = { id: string; label: string; url: string }
export type SmartFolder = { id: string; name: string; description?: string; query: string }
export type Audience = { id: string; name: string; showGeneral: boolean }
export type DictCategoryType = 'Organization' | 'Document' | 'Activity' | 'Event' | 'IT System' | 'Goal' | 'Requirement' | 'Risk' | 'Control' | 'Others' | 'Processes'
export type DictCategory = { id: string; name: string; description?: string; color: string; parentId?: string; enabled: boolean; type: DictCategoryType; createdAt: string; changedAt: string; hasVariants?: boolean }

const INITIAL_DICT_CATEGORIES: DictCategory[] = [
  // BPA Process
  { id: 'c1',  name: 'BPA Process',             description: 'Top-level container for all business process architecture entries.',                                   color: '#046c7a', enabled: true,  type: 'Processes',    createdAt: 'Feb 12, 2024', changedAt: 'Mar 5, 2025', hasVariants: true },
  { id: 'c2',  name: 'Core Processes',           description: 'End-to-end business processes that directly deliver value to customers.',                             color: '#046c7a', parentId: 'c1',  enabled: true,  type: 'Processes',    createdAt: 'Feb 12, 2024', changedAt: 'Mar 5, 2025' },
  { id: 'c8',  name: 'Order-to-Cash',            description: 'Processes from customer order intake through delivery, invoicing, and revenue collection.',           color: '#046c7a', parentId: 'c1',  enabled: true,  type: 'Processes',    createdAt: 'Feb 12, 2024', changedAt: 'Mar 5, 2025' },
  { id: 'c9',  name: 'Procure-to-Pay',           description: 'Processes covering purchasing, goods receipt, vendor invoice verification, and payment.',             color: '#046c7a', parentId: 'c1',  enabled: true,  type: 'Processes',    createdAt: 'Feb 12, 2024', changedAt: 'Mar 5, 2025' },
  { id: 'c10', name: 'Hire-to-Retire',           description: 'Processes spanning the full employee lifecycle from recruitment to offboarding.',                     color: '#046c7a', parentId: 'c1',  enabled: true,  type: 'Processes',    createdAt: 'Feb 12, 2024', changedAt: 'Mar 5, 2025' },
  { id: 'c3',  name: 'Support Processes',        description: 'Internal processes that enable and sustain the core business operations.',                            color: '#046c7a', parentId: 'c1',  enabled: true,  type: 'Processes',    createdAt: 'Feb 12, 2024', changedAt: 'Apr 1, 2025' },
  { id: 'c11', name: 'IT Operations',            description: 'Processes for managing IT services, infrastructure, incidents, and changes.',                         color: '#046c7a', parentId: 'c1',  enabled: true,  type: 'Processes',    createdAt: 'Feb 12, 2024', changedAt: 'Apr 1, 2025' },
  { id: 'c12', name: 'Facilities Management',    description: 'Processes for maintaining physical workspaces, building services, and site operations.',              color: '#046c7a', parentId: 'c1',  enabled: true,  type: 'Processes',    createdAt: 'Feb 12, 2024', changedAt: 'Apr 1, 2025' },
  { id: 'c41', name: 'Finance Operations',       description: 'Financial support processes including month-end closing, reporting, and cost controlling.',           color: '#046c7a', parentId: 'c1',  enabled: false, type: 'Processes',    createdAt: 'Feb 12, 2024', changedAt: 'Apr 1, 2025' },
  // Risk & Control
  { id: 'c4',  name: 'Risk & Control',           description: 'Entries covering organizational risk identification, assessment, and internal control measures.',     color: '#aa0808', enabled: true,  type: 'Risk',         createdAt: 'Feb 12, 2024', changedAt: 'Jan 10, 2025' },
  { id: 'c13', name: 'Operational Risk',         description: 'Risks arising from people, processes, systems failures, or external disruptions.',                   color: '#aa0808', parentId: 'c4',  enabled: true,  type: 'Risk',         createdAt: 'Feb 12, 2024', changedAt: 'Jan 10, 2025' },
  { id: 'c14', name: 'Process Risk',             description: 'Risks caused by breakdowns, inefficiencies, or deviations in business process execution.',           color: '#aa0808', parentId: 'c4',  enabled: true,  type: 'Risk',         createdAt: 'Feb 12, 2024', changedAt: 'Jan 10, 2025' },
  { id: 'c15', name: 'Technology Risk',          description: 'Risks associated with IT system failures, data breaches, and digital infrastructure vulnerabilities.',color: '#aa0808', parentId: 'c4',  enabled: true,  type: 'Risk',         createdAt: 'Feb 12, 2024', changedAt: 'Jan 10, 2025' },
  { id: 'c16', name: 'Compliance Risk',          description: 'Risks of failing to meet legal, regulatory, or internal policy obligations.',                         color: '#ba066c', parentId: 'c4',  enabled: true,  type: 'Control',      createdAt: 'Feb 12, 2024', changedAt: 'Jan 10, 2025' },
  { id: 'c17', name: 'Regulatory Compliance',    description: 'Controls and obligations required to adhere to external laws and industry regulations.',              color: '#ba066c', parentId: 'c4',  enabled: true,  type: 'Control',      createdAt: 'Feb 12, 2024', changedAt: 'Jan 10, 2025' },
  { id: 'c18', name: 'Data Privacy',             description: 'Controls and obligations for lawful handling and protection of personal data (GDPR and similar).',   color: '#ba066c', parentId: 'c4',  enabled: true,  type: 'Control',      createdAt: 'Feb 12, 2024', changedAt: 'Jan 10, 2025' },
  { id: 'c19', name: 'Strategic Risk',           description: 'Risks affecting long-term organizational objectives, market position, and strategic direction.',      color: '#aa0808', parentId: 'c4',  enabled: false, type: 'Risk',         createdAt: 'Feb 12, 2024', changedAt: 'Jan 10, 2025' },
  // Organization
  { id: 'c5',  name: 'Organization',             description: 'Organizational units, roles, and responsibilities that make up the company structure.',               color: '#6c32a9', enabled: true,  type: 'Organization', createdAt: 'Feb 12, 2024', changedAt: 'Dec 3, 2024' },
  { id: 'c6',  name: 'Finance',                  description: 'Finance department units responsible for accounting, controlling, and financial reporting.',           color: '#6c32a9', parentId: 'c5',  enabled: true,  type: 'Organization', createdAt: 'Feb 12, 2024', changedAt: 'Dec 3, 2024' },
  { id: 'c20', name: 'Accounts Payable',         description: 'Team managing verification and settlement of incoming vendor invoices.',                              color: '#6c32a9', parentId: 'c5',  enabled: true,  type: 'Organization', createdAt: 'Feb 12, 2024', changedAt: 'Dec 3, 2024' },
  { id: 'c21', name: 'Accounts Receivable',      description: 'Team responsible for invoicing customers and collecting outstanding payments.',                       color: '#6c32a9', parentId: 'c5',  enabled: true,  type: 'Organization', createdAt: 'Feb 12, 2024', changedAt: 'Dec 3, 2024' },
  { id: 'c22', name: 'Controlling',              description: 'Unit overseeing cost management, profitability analysis, and financial performance monitoring.',      color: '#6c32a9', parentId: 'c5',  enabled: true,  type: 'Organization', createdAt: 'Feb 12, 2024', changedAt: 'Dec 3, 2024' },
  { id: 'c7',  name: 'Human Resources',          description: 'HR department units managing recruiting, development, payroll, and employee relations.',              color: '#6c32a9', parentId: 'c5',  enabled: true,  type: 'Organization', createdAt: 'Feb 12, 2024', changedAt: 'Dec 3, 2024' },
  { id: 'c23', name: 'Recruiting',               description: 'Unit responsible for sourcing, attracting, and hiring new employees.',                                color: '#6c32a9', parentId: 'c5',  enabled: true,  type: 'Organization', createdAt: 'Feb 12, 2024', changedAt: 'Dec 3, 2024' },
  { id: 'c24', name: 'Learning & Development',   description: 'Unit managing employee training programs, skill development, and knowledge management.',              color: '#6c32a9', parentId: 'c5',  enabled: true,  type: 'Organization', createdAt: 'Feb 12, 2024', changedAt: 'Dec 3, 2024' },
  { id: 'c25', name: 'Payroll',                  description: 'Unit processing employee compensation, statutory deductions, and pay disbursement.',                  color: '#6c32a9', parentId: 'c5',  enabled: false, type: 'Organization', createdAt: 'Feb 12, 2024', changedAt: 'Dec 3, 2024' },
  { id: 'c26', name: 'Information Technology',   description: 'IT department units managing systems, infrastructure, and digital services for the organization.',    color: '#552cff', parentId: 'c5',  enabled: true,  type: 'IT System',    createdAt: 'Feb 12, 2024', changedAt: 'Dec 3, 2024' },
  { id: 'c27', name: 'Enterprise Architecture',  description: 'Unit defining IT landscape structure, technology standards, and integration patterns.',               color: '#552cff', parentId: 'c5',  enabled: true,  type: 'IT System',    createdAt: 'Feb 12, 2024', changedAt: 'Dec 3, 2024' },
  { id: 'c28', name: 'IT Security',              color: '#552cff', description: 'Unit responsible for information security policies, access controls, and incident response.', parentId: 'c5',  enabled: true,  type: 'IT System',    createdAt: 'Feb 12, 2024', changedAt: 'Dec 3, 2024' },
  // Document Type
  { id: 'c29', name: 'Document Type',            description: 'Classification of formal documents used to govern and guide business operations.',                    color: '#256f3a', enabled: true,  type: 'Document',     createdAt: 'Feb 12, 2024', changedAt: 'Nov 14, 2024', hasVariants: true },
  { id: 'c30', name: 'Policy',                   description: 'Company-wide rules and guidelines governing conduct in a specific domain.',                           color: '#256f3a', parentId: 'c29', enabled: true,  type: 'Document',     createdAt: 'Feb 12, 2024', changedAt: 'Nov 14, 2024' },
  { id: 'c31', name: 'Process Guideline',        description: 'Instructions and best practices for executing specific business processes correctly.',                 color: '#256f3a', parentId: 'c29', enabled: true,  type: 'Document',     createdAt: 'Feb 12, 2024', changedAt: 'Nov 14, 2024' },
  { id: 'c32', name: 'Technical Specification',  description: 'Detailed technical requirements and design parameters for systems or components.',                    color: '#256f3a', parentId: 'c29', enabled: false, type: 'Document',     createdAt: 'Feb 12, 2024', changedAt: 'Nov 14, 2024' },
  // IT System
  { id: 'c33', name: 'IT System',                description: 'Software applications and platforms supporting business processes across the organization.',          color: '#552cff', enabled: true,  type: 'IT System',    createdAt: 'Feb 12, 2024', changedAt: 'Oct 22, 2024' },
  { id: 'c34', name: 'ERP',                      description: 'Enterprise resource planning systems for integrated financial and operational management.',            color: '#552cff', parentId: 'c33', enabled: true,  type: 'IT System',    createdAt: 'Feb 12, 2024', changedAt: 'Oct 22, 2024' },
  { id: 'c35', name: 'SAP S/4HANA',             description: "SAP's core ERP suite deployed for finance, procurement, manufacturing, and sales operations.",        color: '#552cff', parentId: 'c33', enabled: true,  type: 'IT System',    createdAt: 'Feb 12, 2024', changedAt: 'Oct 22, 2024' },
  { id: 'c36', name: 'Legacy ERP',               description: 'Older ERP systems being maintained in parallel or actively phased out.',                             color: '#552cff', parentId: 'c33', enabled: false, type: 'IT System',    createdAt: 'Feb 12, 2024', changedAt: 'Oct 22, 2024' },
  { id: 'c37', name: 'CRM',                      description: 'Customer relationship management platforms used for sales pipeline, service, and account management.',color: '#552cff', parentId: 'c33', enabled: true,  type: 'IT System',    createdAt: 'Feb 12, 2024', changedAt: 'Oct 22, 2024' },
  { id: 'c38', name: 'Middleware',               description: 'Integration platforms and message brokers connecting enterprise applications and services.',          color: '#552cff', parentId: 'c33', enabled: true,  type: 'IT System',    createdAt: 'Feb 12, 2024', changedAt: 'Oct 22, 2024' },
]

const INITIAL_AUDIENCES: Audience[] = [
  { id: '1', name: 'General audience', showGeneral: false },
  { id: '2', name: 'Administrators', showGeneral: true },
  { id: '3', name: 'Acme Italy', showGeneral: true },
  { id: '4', name: 'Acme France', showGeneral: true },
]

const INITIAL_SMART_FOLDERS: SmartFolder[] = [
  { id: 'sf-1', name: 'Recently Modified', query: 'modified:last-7-days', description: 'Files changed in the last 7 days' },
  { id: 'sf-2', name: 'My Diagrams', query: 'owner:me type:diagram', description: 'All diagrams owned by me' },
  { id: 'sf-3', name: 'Published Processes', query: 'status:published type:bpmn', description: 'All published BPMN processes' },
  { id: 'sf-4', name: 'Pending Review', query: 'status:review', description: 'Items waiting for approval' },
]

const INITIAL_HELP_LINKS: HelpLink[] = [
  { id: '1', label: 'Workspace Administrators', url: 'www.intranet.globalcorp.com/signavio/docs/ws-admins.htm' },
  { id: '2', label: 'Process Modeling Course', url: 'www.intranet.globalcorp.com/signavio/tutorials/modeler-course.htm' },
  { id: '3', label: 'Modeling Conventions (PDF)', url: 'www.intranet.globalcorp.com/signavio/docs/modeling_conventions.pdf' },
  { id: '4', label: 'Our Process Optimization Initiative', url: 'www.intranet.globalcorp.com/signavio/process-optimization.htm' },
]

type WorkspaceContextType = {
  workspaceName: string
  setWorkspaceName: (v: string) => void
  contentLanguages: ContentLanguage[]
  addContentLanguage: (lang: ContentLanguage) => void
  removeContentLanguage: (code: string) => void
  moveContentLanguage: (code: string, direction: 'up' | 'down') => void
  reorderContentLanguage: (draggedCode: string, targetCode: string, placement: 'Before' | 'After') => void
  setDefaultLanguage: (code: string) => void
  ownerId: string
  setOwnerId: (v: string) => void
  additionalInfo: string
  setAdditionalInfo: (v: string) => void
  helpLinks: HelpLink[]
  setHelpLinks: Dispatch<SetStateAction<HelpLink[]>>
  smartFolders: SmartFolder[]
  addSmartFolder: (sf: Omit<SmartFolder, 'id'>) => void
  updateSmartFolder: (id: string, patch: Partial<Omit<SmartFolder, 'id'>>) => void
  deleteSmartFolder: (id: string) => void
  privateFolder: boolean
  setPrivateFolder: (v: boolean) => void
  homeTitle: string
  setHomeTitle: (v: string) => void
  homeWelcomeMessage: string
  setHomeWelcomeMessage: (v: string) => void
  audiences: Audience[]
  setAudiences: Dispatch<SetStateAction<Audience[]>>
  dictCategories: DictCategory[]
  addDictCategory: (cat: Omit<DictCategory, 'id'>) => string
  updateDictCategory: (id: string, patch: Partial<Omit<DictCategory, 'id'>>) => void
  moveDictCategory: (id: string, direction: 'up' | 'down') => void
  reorderDictCategory: (draggedId: string, targetId: string | null, placement: 'Before' | 'After' | 'On') => void
  deleteDictCategory: (id: string) => void
  deleteDictCategoryMoveChildren: (id: string) => void
}

const WorkspaceContext = createContext<WorkspaceContextType>({
  workspaceName: 'Acme Process World',
  setWorkspaceName: () => {},
  contentLanguages: [],
  addContentLanguage: () => {},
  removeContentLanguage: () => {},
  moveContentLanguage: () => {},
  reorderContentLanguage: () => {},
  setDefaultLanguage: () => {},
  ownerId: '1',
  setOwnerId: () => {},
  additionalInfo: DEFAULT_ADDITIONAL_INFO,
  setAdditionalInfo: () => {},
  helpLinks: INITIAL_HELP_LINKS,
  setHelpLinks: () => {},
  smartFolders: [],
  addSmartFolder: () => {},
  updateSmartFolder: () => {},
  deleteSmartFolder: () => {},
  privateFolder: true,
  setPrivateFolder: () => {},
  homeTitle: '',
  setHomeTitle: () => {},
  homeWelcomeMessage: '',
  setHomeWelcomeMessage: () => {},
  audiences: INITIAL_AUDIENCES,
  setAudiences: () => {},
  dictCategories: INITIAL_DICT_CATEGORIES,
  addDictCategory: () => '',
  updateDictCategory: () => {},
  moveDictCategory: () => {},
  reorderDictCategory: () => {},
  deleteDictCategory: () => {},
  deleteDictCategoryMoveChildren: () => {},
})

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspaceName, setWorkspaceName] = useState('Acme Process World')
  const [contentLanguages, setContentLanguages] = useState<ContentLanguage[]>([
    { code: 'en-US', label: 'English (United States)', isDefault: true },
    { code: 'de-DE', label: 'German (Germany)', isDefault: false },
    { code: 'fr-FR', label: 'French (France)', isDefault: false },
  ])
  const [ownerId, setOwnerId] = useState('1')
  const [additionalInfo, setAdditionalInfo] = useState(DEFAULT_ADDITIONAL_INFO)
  const [helpLinks, setHelpLinks] = useState<HelpLink[]>(INITIAL_HELP_LINKS)
  const [smartFolders, setSmartFolders] = useState<SmartFolder[]>(INITIAL_SMART_FOLDERS)
  const [privateFolder, setPrivateFolder] = useState(true)
  const [homeTitle, setHomeTitle] = useState('')
  const [homeWelcomeMessage, setHomeWelcomeMessage] = useState('')
  const [audiences, setAudiences] = useState<Audience[]>(INITIAL_AUDIENCES)
  const [dictCategories, setDictCategories] = useState<DictCategory[]>(INITIAL_DICT_CATEGORIES)

  const addContentLanguage = (lang: ContentLanguage) =>
    setContentLanguages(prev => prev.some(l => l.code === lang.code) ? prev : [...prev, lang])

  const removeContentLanguage = (code: string) =>
    setContentLanguages(prev => {
      const remaining = prev.filter(l => l.code !== code)
      if (remaining.length > 0 && !remaining.some(l => l.isDefault)) {
        remaining[0] = { ...remaining[0], isDefault: true }
      }
      return remaining
    })

  const moveContentLanguage = (code: string, direction: 'up' | 'down') =>
    setContentLanguages(prev => {
      const idx = prev.findIndex(l => l.code === code)
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1
      if (swapIdx < 0 || swapIdx >= prev.length) return prev
      const next = [...prev]
      ;[next[idx], next[swapIdx]] = [next[swapIdx], next[idx]]
      return next.map((l, i) => ({ ...l, isDefault: i === 0 }))
    })

  const setDefaultLanguage = (code: string) =>
    setContentLanguages(prev => {
      const target = prev.find(l => l.code === code)
      if (!target) return prev
      const rest = prev.filter(l => l.code !== code)
      return [{ ...target, isDefault: true }, ...rest.map(l => ({ ...l, isDefault: false }))]
    })

  const reorderContentLanguage = (draggedCode: string, targetCode: string, placement: 'Before' | 'After') =>
    setContentLanguages(prev => {
      if (draggedCode === targetCode) return prev
      const dragged = prev.find(l => l.code === draggedCode)
      if (!dragged) return prev
      const without = prev.filter(l => l.code !== draggedCode)
      const targetIdx = without.findIndex(l => l.code === targetCode)
      const insertAt = placement === 'Before' ? targetIdx : targetIdx + 1
      const result = [...without]
      result.splice(insertAt, 0, dragged)
      // First item is always default
      return result.map((l, i) => ({ ...l, isDefault: i === 0 }))
    })

  const addSmartFolder = (sf: Omit<SmartFolder, 'id'>) =>
    setSmartFolders(prev => [...prev, { ...sf, id: String(Date.now()) }])

  const updateSmartFolder = (id: string, patch: Partial<Omit<SmartFolder, 'id'>>) =>
    setSmartFolders(prev => prev.map(sf => sf.id === id ? { ...sf, ...patch } : sf))

  const deleteSmartFolder = (id: string) =>
    setSmartFolders(prev => prev.filter(sf => sf.id !== id))

  const addDictCategory = (cat: Omit<DictCategory, 'id'>): string => {
    const now = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    const id = `c${Date.now()}`
    setDictCategories(prev => [...prev, {
      ...cat,
      type: cat.type ?? ('Others' as const),
      createdAt: cat.createdAt ?? now,
      changedAt: cat.changedAt ?? now,
      id,
    }])
    return id
  }

  const updateDictCategory = (id: string, patch: Partial<Omit<DictCategory, 'id'>>) =>
    setDictCategories(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c))

  const moveDictCategory = (id: string, direction: 'up' | 'down') =>
    setDictCategories(prev => {
      const cat = prev.find(c => c.id === id)
      if (!cat) return prev
      // Only swap within siblings (same parentId level)
      const siblings = prev.filter(c => c.parentId === cat.parentId)
      const sibIdx = siblings.findIndex(c => c.id === id)
      const swapSibIdx = direction === 'up' ? sibIdx - 1 : sibIdx + 1
      if (swapSibIdx < 0 || swapSibIdx >= siblings.length) return prev
      const swapId = siblings[swapSibIdx].id
      const flatIdx = prev.findIndex(c => c.id === id)
      const swapFlatIdx = prev.findIndex(c => c.id === swapId)
      const next = [...prev]
      ;[next[flatIdx], next[swapFlatIdx]] = [next[swapFlatIdx], next[flatIdx]]
      return next
    })

  const reorderDictCategory = (draggedId: string, targetId: string | null, placement: 'Before' | 'After' | 'On') =>
    setDictCategories(prev => {
      const dragged = prev.find(c => c.id === draggedId)
      if (!dragged) return prev
      const target = targetId ? prev.find(c => c.id === targetId) : null
      // Reparent when dropped onto a node
      const newParentId = placement === 'On' ? targetId ?? undefined : target?.parentId
      const withoutDragged = prev.filter(c => c.id !== draggedId)
      const updated = { ...dragged, parentId: newParentId }
      if (placement === 'On' || !target) {
        return [...withoutDragged, updated]
      }
      const targetFlatIdx = withoutDragged.findIndex(c => c.id === targetId)
      const insertAt = placement === 'Before' ? targetFlatIdx : targetFlatIdx + 1
      const result = [...withoutDragged]
      result.splice(insertAt, 0, updated)
      return result
    })

  const deleteDictCategory = (id: string) =>
    setDictCategories(prev => prev.filter(c => c.id !== id && c.parentId !== id))

  // Re-parents direct children to the deleted category's parent, then removes it
  const deleteDictCategoryMoveChildren = (id: string) =>
    setDictCategories(prev => {
      const cat = prev.find(c => c.id === id)
      if (!cat) return prev
      return prev
        .map(c => c.parentId === id ? { ...c, parentId: cat.parentId } : c)
        .filter(c => c.id !== id)
    })

  return (
    <WorkspaceContext.Provider value={{
      workspaceName, setWorkspaceName,
      contentLanguages, addContentLanguage, removeContentLanguage, moveContentLanguage, reorderContentLanguage, setDefaultLanguage,
      ownerId, setOwnerId,
      additionalInfo, setAdditionalInfo,
      helpLinks, setHelpLinks,
      smartFolders, addSmartFolder, updateSmartFolder, deleteSmartFolder,
      privateFolder, setPrivateFolder,
      homeTitle, setHomeTitle,
      homeWelcomeMessage, setHomeWelcomeMessage,
      audiences, setAudiences,
      dictCategories, addDictCategory, updateDictCategory, moveDictCategory, reorderDictCategory, deleteDictCategory, deleteDictCategoryMoveChildren,
    }}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  return useContext(WorkspaceContext)
}
