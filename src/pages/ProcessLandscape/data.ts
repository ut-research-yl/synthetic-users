import type { ProcessElement, ProcessHierarchy } from './types'

export const HIERARCHIES: ProcessHierarchy[] = [
  { id: 'apqc', name: 'APQC Process Classification Framework', description: 'Industry-standard process reference framework covering all business processes.' },
  { id: 'e2e', name: 'End-to-End Process Lines', description: 'Cross-functional process flows from trigger to outcome.' },
]

export const PROCESS_ELEMENTS: ProcessElement[] = [
  // ── APQC: 1.0 Develop Vision and Strategy ────────────────────────────────
  {
    id: 'apqc-1.0', hierarchyId: '1.0', name: 'Develop Vision and Strategy', level: 1,
    description: 'Define organizational direction, mission, and long-term objectives.',
    parentId: null, processType: 'Management', status: 'Active', ownerId: '1', assetCount: 12, childCount: 3,
  },
  {
    id: 'apqc-1.1', hierarchyId: '1.1', name: 'Define Business Concept and Long-Term Vision', level: 2,
    description: 'Articulate the core business concept and develop a long-term strategic vision.',
    parentId: 'apqc-1.0', processType: 'Management', status: 'Active', ownerId: '4', assetCount: 5, childCount: 3,
  },
  {
    id: 'apqc-1.1.1', hierarchyId: '1.1.1', name: 'Assess the External Environment', level: 3,
    description: 'Analyze market conditions, competition, and regulatory environment.',
    parentId: 'apqc-1.1', processType: 'Management', status: 'Active', ownerId: '7', assetCount: 3, childCount: 0,
  },
  {
    id: 'apqc-1.1.2', hierarchyId: '1.1.2', name: 'Survey the Competitive Environment', level: 3,
    description: 'Evaluate competitive landscape and identify market opportunities and threats.',
    parentId: 'apqc-1.1', processType: 'Management', status: 'Active', ownerId: '7', assetCount: 2, childCount: 0,
  },
  {
    id: 'apqc-1.1.3', hierarchyId: '1.1.3', name: 'Identify Economic Trends', level: 3,
    description: 'Monitor macroeconomic trends affecting the business environment.',
    parentId: 'apqc-1.1', processType: 'Management', status: 'In Review', ownerId: '4', assetCount: 1, childCount: 0,
  },
  {
    id: 'apqc-1.2', hierarchyId: '1.2', name: 'Develop Business Strategy', level: 2,
    description: 'Translate vision into actionable strategic initiatives and goals.',
    parentId: 'apqc-1.0', processType: 'Management', status: 'Active', ownerId: '1', assetCount: 6, childCount: 3,
  },
  {
    id: 'apqc-1.2.1', hierarchyId: '1.2.1', name: 'Select Relevant Markets and Geographies', level: 3,
    description: 'Identify and prioritize target markets and geographies for growth.',
    parentId: 'apqc-1.2', processType: 'Management', status: 'Active', ownerId: '12', assetCount: 2, childCount: 0,
  },
  {
    id: 'apqc-1.2.2', hierarchyId: '1.2.2', name: 'Establish Long-Term Business Goals', level: 3,
    description: 'Set measurable long-term objectives aligned with organizational vision.',
    parentId: 'apqc-1.2', processType: 'Management', status: 'Active', ownerId: '1', assetCount: 3, childCount: 0,
  },
  {
    id: 'apqc-1.2.3', hierarchyId: '1.2.3', name: 'Formulate Business Unit Strategy', level: 3,
    description: 'Develop specific strategies for individual business units.',
    parentId: 'apqc-1.2', processType: 'Management', status: 'Draft', ownerId: '4', assetCount: 1, childCount: 0,
  },
  {
    id: 'apqc-1.3', hierarchyId: '1.3', name: 'Execute and Measure Strategy', level: 2,
    description: 'Implement strategic initiatives and track performance against goals.',
    parentId: 'apqc-1.0', processType: 'Management', status: 'Active', ownerId: '7', assetCount: 4, childCount: 2,
  },
  {
    id: 'apqc-1.3.1', hierarchyId: '1.3.1', name: 'Develop Balanced Scorecard', level: 3,
    description: 'Create a comprehensive performance measurement framework.',
    parentId: 'apqc-1.3', processType: 'Management', status: 'Active', ownerId: '4', assetCount: 2, childCount: 0,
  },
  {
    id: 'apqc-1.3.2', hierarchyId: '1.3.2', name: 'Monitor Strategy Execution', level: 3,
    description: 'Track and report on strategic initiative progress and outcomes.',
    parentId: 'apqc-1.3', processType: 'Management', status: 'In Review', ownerId: '7', assetCount: 2, childCount: 0,
  },

  // ── APQC: 2.0 Develop and Manage Products and Services ───────────────────
  {
    id: 'apqc-2.0', hierarchyId: '2.0', name: 'Develop and Manage Products and Services', level: 1,
    description: 'Design, develop, and manage the product and service portfolio.',
    parentId: null, processType: 'Operating', status: 'Active', ownerId: '2', assetCount: 28, childCount: 4,
  },
  {
    id: 'apqc-2.1', hierarchyId: '2.1', name: 'Manage Product and Service Portfolio', level: 2,
    description: 'Define and maintain the product/service portfolio strategy.',
    parentId: 'apqc-2.0', processType: 'Operating', status: 'Active', ownerId: '2', assetCount: 8, childCount: 3,
  },
  {
    id: 'apqc-2.1.1', hierarchyId: '2.1.1', name: 'Evaluate Product Performance', level: 3,
    description: 'Assess existing products against market performance and profitability targets.',
    parentId: 'apqc-2.1', processType: 'Operating', status: 'Active', ownerId: '6', assetCount: 4, childCount: 0,
  },
  {
    id: 'apqc-2.1.2', hierarchyId: '2.1.2', name: 'Define Product Roadmap', level: 3,
    description: 'Develop and maintain a product roadmap aligned with business strategy.',
    parentId: 'apqc-2.1', processType: 'Operating', status: 'Active', ownerId: '2', assetCount: 3, childCount: 0,
  },
  {
    id: 'apqc-2.1.3', hierarchyId: '2.1.3', name: 'Manage Product Lifecycle', level: 3,
    description: 'Oversee products through introduction, growth, maturity, and retirement phases.',
    parentId: 'apqc-2.1', processType: 'Operating', status: 'In Review', ownerId: '9', assetCount: 1, childCount: 0,
  },
  {
    id: 'apqc-2.2', hierarchyId: '2.2', name: 'Develop Products and Services', level: 2,
    description: 'Design and build new products and services to meet customer needs.',
    parentId: 'apqc-2.0', processType: 'Operating', status: 'Active', ownerId: '6', assetCount: 12, childCount: 4,
  },
  {
    id: 'apqc-2.2.1', hierarchyId: '2.2.1', name: 'Generate New Product Ideas', level: 3,
    description: 'Collect, evaluate, and select ideas for new product or service development.',
    parentId: 'apqc-2.2', processType: 'Operating', status: 'Active', ownerId: '3', assetCount: 3, childCount: 0,
  },
  {
    id: 'apqc-2.2.2', hierarchyId: '2.2.2', name: 'Design and Prototype', level: 3,
    description: 'Create design specifications and build prototypes for validation.',
    parentId: 'apqc-2.2', processType: 'Operating', status: 'Active', ownerId: '6', assetCount: 4, childCount: 0,
  },
  {
    id: 'apqc-2.2.3', hierarchyId: '2.2.3', name: 'Test and Validate Products', level: 3,
    description: 'Conduct testing to ensure products meet quality and compliance requirements.',
    parentId: 'apqc-2.2', processType: 'Operating', status: 'Active', ownerId: '8', assetCount: 3, childCount: 0,
  },
  {
    id: 'apqc-2.2.4', hierarchyId: '2.2.4', name: 'Launch Products to Market', level: 3,
    description: 'Execute go-to-market activities to launch new products or services.',
    parentId: 'apqc-2.2', processType: 'Operating', status: 'Draft', ownerId: '2', assetCount: 2, childCount: 0,
  },

  // ── APQC: 3.0 Market and Sell Products and Services ──────────────────────
  {
    id: 'apqc-3.0', hierarchyId: '3.0', name: 'Market and Sell Products and Services', level: 1,
    description: 'Attract, engage, and convert customers through marketing and sales activities.',
    parentId: null, processType: 'Operating', status: 'Active', ownerId: '3', assetCount: 35, childCount: 3,
  },
  {
    id: 'apqc-3.1', hierarchyId: '3.1', name: 'Understand Markets, Customers, and Capabilities', level: 2,
    description: 'Gain deep insight into customer needs, market trends, and organizational capabilities.',
    parentId: 'apqc-3.0', processType: 'Operating', status: 'Active', ownerId: '3', assetCount: 9, childCount: 3,
  },
  {
    id: 'apqc-3.1.1', hierarchyId: '3.1.1', name: 'Perform Customer and Market Research', level: 3,
    description: 'Conduct research to understand customer needs and market dynamics.',
    parentId: 'apqc-3.1', processType: 'Operating', status: 'Active', ownerId: '11', assetCount: 4, childCount: 0,
  },
  {
    id: 'apqc-3.1.2', hierarchyId: '3.1.2', name: 'Assess Customer Satisfaction', level: 3,
    description: 'Measure and analyze customer satisfaction and loyalty levels.',
    parentId: 'apqc-3.1', processType: 'Operating', status: 'Active', ownerId: '3', assetCount: 3, childCount: 0,
  },
  {
    id: 'apqc-3.1.3', hierarchyId: '3.1.3', name: 'Monitor Competitor Performance', level: 3,
    description: 'Track competitor activities and benchmark against market standards.',
    parentId: 'apqc-3.1', processType: 'Operating', status: 'In Review', ownerId: '12', assetCount: 2, childCount: 0,
  },
  {
    id: 'apqc-3.2', hierarchyId: '3.2', name: 'Develop Marketing Strategy', level: 2,
    description: 'Create comprehensive marketing strategies to reach target customers.',
    parentId: 'apqc-3.0', processType: 'Operating', status: 'Active', ownerId: '9', assetCount: 14, childCount: 3,
  },
  {
    id: 'apqc-3.2.1', hierarchyId: '3.2.1', name: 'Define Pricing Strategy', level: 3,
    description: 'Develop pricing models and strategies aligned with market position.',
    parentId: 'apqc-3.2', processType: 'Operating', status: 'Active', ownerId: '1', assetCount: 5, childCount: 0,
  },
  {
    id: 'apqc-3.2.2', hierarchyId: '3.2.2', name: 'Manage Brand and Product Communications', level: 3,
    description: 'Develop and execute brand messaging across all communication channels.',
    parentId: 'apqc-3.2', processType: 'Operating', status: 'Active', ownerId: '9', assetCount: 6, childCount: 0,
  },
  {
    id: 'apqc-3.2.3', hierarchyId: '3.2.3', name: 'Manage Digital Marketing', level: 3,
    description: 'Execute digital marketing campaigns across online channels.',
    parentId: 'apqc-3.2', processType: 'Operating', status: 'Active', ownerId: '3', assetCount: 3, childCount: 0,
  },
  {
    id: 'apqc-3.3', hierarchyId: '3.3', name: 'Develop and Manage Sales Plans', level: 2,
    description: 'Plan, execute, and monitor sales activities to achieve revenue targets.',
    parentId: 'apqc-3.0', processType: 'Operating', status: 'Active', ownerId: '12', assetCount: 12, childCount: 3,
  },
  {
    id: 'apqc-3.3.1', hierarchyId: '3.3.1', name: 'Develop Sales Plans and Forecasts', level: 3,
    description: 'Create sales plans and revenue forecasts based on market analysis.',
    parentId: 'apqc-3.3', processType: 'Operating', status: 'Active', ownerId: '4', assetCount: 4, childCount: 0,
  },
  {
    id: 'apqc-3.3.2', hierarchyId: '3.3.2', name: 'Manage Customer Relationships', level: 3,
    description: 'Build and maintain strong relationships with key customers and accounts.',
    parentId: 'apqc-3.3', processType: 'Operating', status: 'Active', ownerId: '12', assetCount: 5, childCount: 0,
  },
  {
    id: 'apqc-3.3.3', hierarchyId: '3.3.3', name: 'Process Orders and Manage Contracts', level: 3,
    description: 'Handle order processing, contracting, and post-sale administration.',
    parentId: 'apqc-3.3', processType: 'Operating', status: 'In Review', ownerId: '1', assetCount: 3, childCount: 0,
  },

  // ── APQC: 6.0 Develop and Manage Human Capital ───────────────────────────
  {
    id: 'apqc-6.0', hierarchyId: '6.0', name: 'Develop and Manage Human Capital', level: 1,
    description: 'Attract, develop, and retain the talent needed to execute the business strategy.',
    parentId: null, processType: 'Support', status: 'Active', ownerId: '5', assetCount: 22, childCount: 3,
  },
  {
    id: 'apqc-6.1', hierarchyId: '6.1', name: 'Develop and Implement Human Resources Strategy', level: 2,
    description: 'Create HR strategies aligned with organizational goals and workforce needs.',
    parentId: 'apqc-6.0', processType: 'Support', status: 'Active', ownerId: '5', assetCount: 6, childCount: 2,
  },
  {
    id: 'apqc-6.1.1', hierarchyId: '6.1.1', name: 'Develop Workforce Strategy', level: 3,
    description: 'Plan for future workforce needs including skills, headcount, and structure.',
    parentId: 'apqc-6.1', processType: 'Support', status: 'Active', ownerId: '5', assetCount: 3, childCount: 0,
  },
  {
    id: 'apqc-6.1.2', hierarchyId: '6.1.2', name: 'Develop Succession Planning', level: 3,
    description: 'Identify and develop internal talent for critical leadership positions.',
    parentId: 'apqc-6.1', processType: 'Support', status: 'Draft', ownerId: '14', assetCount: 2, childCount: 0,
  },
  {
    id: 'apqc-6.2', hierarchyId: '6.2', name: 'Recruit, Source, and Select Employees', level: 2,
    description: 'Attract and hire the right talent through effective recruitment processes.',
    parentId: 'apqc-6.0', processType: 'Support', status: 'Active', ownerId: '14', assetCount: 10, childCount: 3,
  },
  {
    id: 'apqc-6.2.1', hierarchyId: '6.2.1', name: 'Define and Publicize Open Positions', level: 3,
    description: 'Create job descriptions and publish open positions across relevant channels.',
    parentId: 'apqc-6.2', processType: 'Support', status: 'Active', ownerId: '14', assetCount: 3, childCount: 0,
  },
  {
    id: 'apqc-6.2.2', hierarchyId: '6.2.2', name: 'Screen and Interview Candidates', level: 3,
    description: 'Review applications, conduct interviews, and assess candidate qualifications.',
    parentId: 'apqc-6.2', processType: 'Support', status: 'Active', ownerId: '5', assetCount: 4, childCount: 0,
  },
  {
    id: 'apqc-6.2.3', hierarchyId: '6.2.3', name: 'Onboard New Employees', level: 3,
    description: 'Integrate new hires into the organization through structured onboarding.',
    parentId: 'apqc-6.2', processType: 'Support', status: 'Active', ownerId: '14', assetCount: 3, childCount: 0,
  },
  {
    id: 'apqc-6.3', hierarchyId: '6.3', name: 'Develop and Train Employees', level: 2,
    description: 'Enable employee skill development and career growth through learning programs.',
    parentId: 'apqc-6.0', processType: 'Support', status: 'Active', ownerId: '5', assetCount: 6, childCount: 2,
  },
  {
    id: 'apqc-6.3.1', hierarchyId: '6.3.1', name: 'Define Training Needs', level: 3,
    description: 'Identify skills gaps and define training requirements across the organization.',
    parentId: 'apqc-6.3', processType: 'Support', status: 'Active', ownerId: '7', assetCount: 2, childCount: 0,
  },
  {
    id: 'apqc-6.3.2', hierarchyId: '6.3.2', name: 'Deliver Training Programs', level: 3,
    description: 'Execute learning and development programs through various delivery methods.',
    parentId: 'apqc-6.3', processType: 'Support', status: 'In Review', ownerId: '5', assetCount: 4, childCount: 0,
  },
]

export function getChildren(parentId: string | null): ProcessElement[] {
  return PROCESS_ELEMENTS.filter(e => e.parentId === parentId)
}

export function getElementById(id: string): ProcessElement | undefined {
  return PROCESS_ELEMENTS.find(e => e.id === id)
}
