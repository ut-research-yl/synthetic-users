import { createContext, useContext, useReducer, type ReactNode } from 'react'
import { elementData as initialElementData, CONNECTIONS, type ElementData } from '../data/liveInsightsData'

type ActiveTool = 'dict' | 'elements' | 'di' | null

type State = {
  zoom: number
  panX: number
  panY: number
  selectedElementId: string | null
  elements: Record<string, ElementData>
  isDictOpen: boolean
  isAttrPanelOpen: boolean
  activeTool: ActiveTool
  cwdTargetElId: string | null
  activeFilter: string
  activeCategoryFilter: string | null
  activeAttributeFilters: string[]
  activeSortOrder: string
}

type Action =
  | { type: 'SELECT_ELEMENT'; id: string | null }
  | { type: 'SET_ZOOM'; zoom: number }
  | { type: 'SET_PAN'; x: number; y: number }
  | { type: 'TOGGLE_DICT'; open?: boolean }
  | { type: 'TOGGLE_ATTR_PANEL'; open?: boolean }
  | { type: 'SET_ACTIVE_TOOL'; tool: ActiveTool }
  | { type: 'SET_CWD_TARGET'; elId: string | null }
  | { type: 'SET_FILTER'; filter: string }
  | { type: 'SET_CATEGORY_FILTER'; filter: string | null }
  | { type: 'SET_SORT_ORDER'; order: string }
  | { type: 'UPDATE_ELEMENT'; id: string; data: Partial<ElementData> }

const initialState: State = {
  zoom: 80,
  panX: -311,
  panY: -111,
  selectedElementId: null,
  elements: { ...initialElementData },
  isDictOpen: false,
  isAttrPanelOpen: false,
  activeTool: null,
  cwdTargetElId: null,
  activeFilter: 'all',
  activeCategoryFilter: null,
  activeAttributeFilters: [],
  activeSortOrder: 'newest',
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SELECT_ELEMENT':
      return {
        ...state,
        selectedElementId: action.id,
        isAttrPanelOpen: action.id !== null,
      }
    case 'SET_ZOOM':
      return { ...state, zoom: Math.max(20, Math.min(200, action.zoom)) }
    case 'SET_PAN':
      return { ...state, panX: action.x, panY: action.y }
    case 'TOGGLE_DICT':
      return { ...state, isDictOpen: action.open ?? !state.isDictOpen }
    case 'TOGGLE_ATTR_PANEL':
      return { ...state, isAttrPanelOpen: action.open ?? !state.isAttrPanelOpen }
    case 'SET_ACTIVE_TOOL':
      return { ...state, activeTool: action.tool }
    case 'SET_CWD_TARGET':
      return { ...state, cwdTargetElId: action.elId }
    case 'SET_FILTER':
      return { ...state, activeFilter: action.filter }
    case 'SET_CATEGORY_FILTER':
      return { ...state, activeCategoryFilter: action.filter }
    case 'SET_SORT_ORDER':
      return { ...state, activeSortOrder: action.order }
    case 'UPDATE_ELEMENT':
      return {
        ...state,
        elements: {
          ...state.elements,
          [action.id]: { ...state.elements[action.id], ...action.data },
        },
      }
    default:
      return state
  }
}

type ContextValue = State & {
  dispatch: React.Dispatch<Action>
  connections: typeof CONNECTIONS
}

const LiveInsightsContext = createContext<ContextValue | null>(null)

export function LiveInsightsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  return (
    <LiveInsightsContext.Provider value={{ ...state, dispatch, connections: CONNECTIONS }}>
      {children}
    </LiveInsightsContext.Provider>
  )
}

export function useLiveInsights() {
  const ctx = useContext(LiveInsightsContext)
  if (!ctx) throw new Error('useLiveInsights must be used inside LiveInsightsProvider')
  return ctx
}
