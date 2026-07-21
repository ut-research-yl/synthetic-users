export type Phase = {
  id: string
  label: string
  color: string
  width: number
  stage?: string
}

export type Lane = {
  id: string
  label: string
  type: 'default' | 'emotion' | 'metrics' | 'process' | 'stages' | 'content'
  order: number
}

export type StepStatus = 'none' | 'in-progress' | 'done' | 'blocked'

export type MetricValue = {
  label: string
  value: number
  unit: string
  trend: 'up' | 'down' | 'flat'
  isPositive: boolean
  sparkline: number[]
  chartType?: 'area' | 'bar' | 'value'
  target?: number
}

export type ProcessLink = { id: string; name: string; type: 'BPMN' | 'DMN' }

export type ContentItem = {
  icon: 'figma' | 'youtube' | 'image' | 'doc' | 'link'
  title: string
  subtitle: string
}

export type PainPointMeta = {
  description: string
  impact: number    // 1-5
  reach: number     // 1-5
  cost: number      // 1-5
  category: string
  assignee: string
  priority: 'up' | 'down' | 'neutral'
  tags: number
  comments: number
}

export type JourneyStep = {
  id: string
  phaseId: string
  laneId: string
  content: string
  description?: string
  emoji?: string
  sentiment?: number
  status?: StepStatus
  tags?: string[]
  metric?: MetricValue
  processLink?: ProcessLink
  stageLabel?: string
  stageColor?: string
  contentItem?: ContentItem
  painPointMeta?: PainPointMeta
}

export const PHASE_PALETTE = ['#1a7adf', '#7c3aed', '#ea580c', '#059669', '#0891b2', '#d97706']

export const INITIAL_PHASES: Phase[] = [
  { id: 'ph-1', label: 'Awareness',     color: '#1a7adf', width: 240, stage: 'Discover'    },
  { id: 'ph-2', label: 'Consideration', color: '#7c3aed', width: 240, stage: 'Evaluate'    },
  { id: 'ph-3', label: 'Purchase',      color: '#ea580c', width: 240, stage: 'Decide'      },
  { id: 'ph-4', label: 'Onboarding',    color: '#059669', width: 240, stage: 'Get Started' },
  { id: 'ph-5', label: 'Retention',     color: '#0891b2', width: 240, stage: 'Grow'        },
]

export const INITIAL_LANES: Lane[] = [
  { id: 'ln-actions',     label: 'Customer Actions', type: 'default', order: 0 },
  { id: 'ln-touchpoints', label: 'Touchpoints',      type: 'default', order: 1 },
  { id: 'ln-emotions',    label: 'Emotions',         type: 'emotion', order: 2 },
  { id: 'ln-metrics',     label: 'Metrics',          type: 'metrics', order: 3 },
  { id: 'ln-process',     label: 'Process Models',   type: 'process', order: 4 },
  { id: 'ln-content',     label: 'Content',          type: 'content', order: 5 },
  { id: 'ln-painpoints',  label: 'Pain Points',      type: 'default', order: 6 },
  { id: 'ln-opportun',    label: 'Opportunities',    type: 'default', order: 7 },
]

export const INITIAL_STEPS: JourneyStep[] = [
  // ── Content ────────────────────────────────────────────────────────────────
  { id: 'st-c1', phaseId: 'ph-1', laneId: 'ln-content', content: 'Brand overview deck',
    contentItem: { icon: 'figma', title: 'Brand Overview Deck', subtitle: 'Updated 12 Jul 2026' } },
  { id: 'st-c2', phaseId: 'ph-1', laneId: 'ln-content', content: 'Intro video',
    contentItem: { icon: 'youtube', title: 'What is SAP Signavio?', subtitle: 'Added 3 Jun 2026' } },
  { id: 'st-c3', phaseId: 'ph-2', laneId: 'ln-content', content: 'Product tour',
    contentItem: { icon: 'figma', title: 'Product Tour Prototype', subtitle: 'Updated 8 Jul 2026' } },
  { id: 'st-c4', phaseId: 'ph-2', laneId: 'ln-content', content: 'Demo recording',
    contentItem: { icon: 'youtube', title: 'Live Demo — Process Modeler', subtitle: 'Added 15 May 2026' } },
  { id: 'st-c5', phaseId: 'ph-3', laneId: 'ln-content', content: 'ROI calculator',
    contentItem: { icon: 'doc', title: 'ROI Business Case Template', subtitle: 'Updated 1 Jul 2026' } },
  { id: 'st-c6', phaseId: 'ph-4', laneId: 'ln-content', content: 'Onboarding guide',
    contentItem: { icon: 'doc', title: 'Admin Setup Guide', subtitle: 'Updated 10 Jul 2026' } },
  { id: 'st-c7', phaseId: 'ph-5', laneId: 'ln-content', content: 'Champion kit',
    contentItem: { icon: 'figma', title: 'Champion Program Kit', subtitle: 'Added 20 Jun 2026' } },

  // ── Customer Actions ───────────────────────────────────────────────────────
  { id: 'st-a1', phaseId: 'ph-1', laneId: 'ln-actions', content: 'Sees LinkedIn ad for SAP Signavio', status: 'done', tags: ['paid-media'] },
  { id: 'st-a2', phaseId: 'ph-1', laneId: 'ln-actions', content: 'Searches "BPM software" on Google', status: 'done', tags: ['organic'] },
  { id: 'st-a3', phaseId: 'ph-2', laneId: 'ln-actions', content: 'Browses product tour page', status: 'done', tags: ['self-serve'] },
  { id: 'st-a4', phaseId: 'ph-2', laneId: 'ln-actions', content: 'Downloads "State of Process Excellence" report', status: 'done', tags: ['content'] },
  { id: 'st-a5', phaseId: 'ph-2', laneId: 'ln-actions', content: 'Registers for live product demo webinar', status: 'in-progress', tags: ['event'] },
  { id: 'st-a6', phaseId: 'ph-3', laneId: 'ln-actions', content: 'Requests formal pricing proposal', status: 'in-progress', tags: ['sales'] },
  { id: 'st-a7', phaseId: 'ph-3', laneId: 'ln-actions', content: 'Runs internal ROI business case', status: 'in-progress', tags: ['sales'] },
  { id: 'st-a8', phaseId: 'ph-3', laneId: 'ln-actions', content: 'Signs MSA and order form', status: 'none', tags: ['legal'] },
  { id: 'st-a9', phaseId: 'ph-4', laneId: 'ln-actions', content: 'Attends kick-off call with CSM', status: 'none' },
  { id: 'st-a10', phaseId: 'ph-4', laneId: 'ln-actions', content: 'Completes admin & SSO setup', status: 'none', tags: ['IT'] },
  { id: 'st-a11', phaseId: 'ph-5', laneId: 'ln-actions', content: 'Publishes first process model', status: 'none' },
  { id: 'st-a12', phaseId: 'ph-5', laneId: 'ln-actions', content: 'Invites broader team to workspace', status: 'none', tags: ['expansion'] },

  // ── Touchpoints ────────────────────────────────────────────────────────────
  { id: 'st-t1', phaseId: 'ph-1', laneId: 'ln-touchpoints', content: 'LinkedIn Campaign Manager', tags: ['digital', 'paid'] },
  { id: 'st-t2', phaseId: 'ph-1', laneId: 'ln-touchpoints', content: 'SAP.com / Signavio landing page', tags: ['digital'] },
  { id: 'st-t3', phaseId: 'ph-2', laneId: 'ln-touchpoints', content: 'signavio.com product pages', tags: ['digital'] },
  { id: 'st-t4', phaseId: 'ph-2', laneId: 'ln-touchpoints', content: 'Gated content hub & resource center', tags: ['digital', 'content'] },
  { id: 'st-t5', phaseId: 'ph-2', laneId: 'ln-touchpoints', content: 'Live demo (Account Executive)', tags: ['human', 'video'] },
  { id: 'st-t6', phaseId: 'ph-3', laneId: 'ln-touchpoints', content: 'AE — solution call + scoping doc', tags: ['human'] },
  { id: 'st-t7', phaseId: 'ph-3', laneId: 'ln-touchpoints', content: 'CRM (Salesforce) — proposal PDF', tags: ['digital'] },
  { id: 'st-t8', phaseId: 'ph-4', laneId: 'ln-touchpoints', content: 'CSM kick-off deck + Zoom call', tags: ['human', 'video'] },
  { id: 'st-t9', phaseId: 'ph-4', laneId: 'ln-touchpoints', content: 'SAP Learning Hub — onboarding path', tags: ['digital', 'self-serve'] },
  { id: 'st-t10', phaseId: 'ph-5', laneId: 'ln-touchpoints', content: 'Monthly Business Review (MBR)', tags: ['human'] },
  { id: 'st-t11', phaseId: 'ph-5', laneId: 'ln-touchpoints', content: 'In-app NPS + feature announcements', tags: ['digital', 'in-app'] },

  // ── Emotions ───────────────────────────────────────────────────────────────
  { id: 'st-e1', phaseId: 'ph-1', laneId: 'ln-emotions', content: 'Intrigued',   emoji: '🤔', sentiment: 1 },
  { id: 'st-e2', phaseId: 'ph-2', laneId: 'ln-emotions', content: 'Excited',     emoji: '😊', sentiment: 2 },
  { id: 'st-e3', phaseId: 'ph-3', laneId: 'ln-emotions', content: 'Anxious',     emoji: '😟', sentiment: -1 },
  { id: 'st-e4', phaseId: 'ph-4', laneId: 'ln-emotions', content: 'Overwhelmed', emoji: '😩', sentiment: -2 },
  { id: 'st-e5', phaseId: 'ph-5', laneId: 'ln-emotions', content: 'Confident',   emoji: '😄', sentiment: 2 },

  // ── Process Model links ────────────────────────────────────────────────────
  { id: 'st-pr1', phaseId: 'ph-1', laneId: 'ln-process', content: 'Lead Generation Process',
    processLink: { id: 'proc-001', name: 'Lead Generation Process', type: 'BPMN' } },
  { id: 'st-pr2', phaseId: 'ph-2', laneId: 'ln-process', content: 'Demo & Evaluation Flow',
    processLink: { id: 'proc-002', name: 'Demo & Evaluation Flow', type: 'BPMN' } },
  { id: 'st-pr3', phaseId: 'ph-3', laneId: 'ln-process', content: 'Contract Approval Process',
    processLink: { id: 'proc-003', name: 'Contract Approval Process', type: 'BPMN' } },
  { id: 'st-pr4', phaseId: 'ph-3', laneId: 'ln-process', content: 'Pricing Decision Model',
    processLink: { id: 'proc-004', name: 'Pricing Decision Model', type: 'DMN' } },
  { id: 'st-pr5', phaseId: 'ph-4', laneId: 'ln-process', content: 'Customer Onboarding Process',
    processLink: { id: 'proc-005', name: 'Customer Onboarding Process', type: 'BPMN' } },
  { id: 'st-pr6', phaseId: 'ph-5', laneId: 'ln-process', content: 'Renewal & Upsell Flow',
    processLink: { id: 'proc-006', name: 'Renewal & Upsell Flow', type: 'BPMN' } },

  // ── Metrics (Live Insights data integration) ──────────────────────────────
  { id: 'st-m1', phaseId: 'ph-1', laneId: 'ln-metrics', content: 'Website traffic',
    metric: { label: 'Unique Visitors', value: 48200, unit: '/mo', trend: 'up', isPositive: true, chartType: 'area',
      sparkline: [28000, 31000, 34000, 38000, 41000, 45000, 48200] } },
  { id: 'st-m2', phaseId: 'ph-2', laneId: 'ln-metrics', content: 'Content engagement',
    metric: { label: 'Avg. Time on Page', value: 4.2, unit: 'min', trend: 'up', isPositive: true, chartType: 'bar',
      sparkline: [2.1, 2.8, 3.1, 3.5, 3.8, 4.0, 4.2], target: 5 } },
  { id: 'st-m3', phaseId: 'ph-3', laneId: 'ln-metrics', content: 'Deal conversion',
    metric: { label: 'Win Rate', value: 23, unit: '%', trend: 'down', isPositive: false, chartType: 'value',
      sparkline: [31, 29, 28, 27, 25, 24, 23], target: 30 } },
  { id: 'st-m4', phaseId: 'ph-4', laneId: 'ln-metrics', content: 'Time to value',
    metric: { label: 'Onboarding Days', value: 18, unit: 'days', trend: 'down', isPositive: true, chartType: 'area',
      sparkline: [32, 29, 27, 24, 22, 20, 18], target: 14 } },
  { id: 'st-m5', phaseId: 'ph-5', laneId: 'ln-metrics', content: 'Retention',
    metric: { label: 'NPS Score', value: 42, unit: 'pts', trend: 'up', isPositive: true, chartType: 'bar',
      sparkline: [22, 26, 29, 33, 37, 40, 42], target: 50 } },

  // ── Pain Points ────────────────────────────────────────────────────────────
  { id: 'st-p1', phaseId: 'ph-1', laneId: 'ln-painpoints', content: 'Hard to find info', status: 'blocked', tags: ['awareness'],
    painPointMeta: { description: 'Too many vendor options — hard to differentiate offerings', impact: 4, reach: 5, cost: 3, category: 'Research', assignee: 'AS', priority: 'up', tags: 2, comments: 5 } },
  { id: 'st-p2', phaseId: 'ph-2', laneId: 'ln-painpoints', content: 'No self-guided trial', status: 'blocked', tags: ['friction'],
    painPointMeta: { description: 'Product tour is not self-guided — must talk to sales first', impact: 5, reach: 5, cost: 4, category: 'Product', assignee: 'CW', priority: 'up', tags: 3, comments: 8 } },
  { id: 'st-p3', phaseId: 'ph-2', laneId: 'ln-painpoints', content: 'No transparent pricing', status: 'in-progress', tags: ['trust'],
    painPointMeta: { description: 'No pricing on website — creates friction and distrust early on', impact: 4, reach: 4, cost: 2, category: 'Marketing', assignee: 'JL', priority: 'neutral', tags: 1, comments: 4 } },
  { id: 'st-p4', phaseId: 'ph-3', laneId: 'ln-painpoints', content: 'Long procurement cycle', status: 'blocked', tags: ['procurement'],
    painPointMeta: { description: 'Procurement cycle takes 3–6 months — deals stall at legal', impact: 5, reach: 3, cost: 5, category: 'Sales', assignee: 'RK', priority: 'up', tags: 2, comments: 12 } },
  { id: 'st-p5', phaseId: 'ph-4', laneId: 'ln-painpoints', content: 'SSO setup delays go-live', status: 'blocked', tags: ['IT', 'friction'],
    painPointMeta: { description: 'SSO/SCIM setup requires IT team involvement and delays go-live by weeks', impact: 4, reach: 4, cost: 4, category: 'Engineering', assignee: 'MK', priority: 'up', tags: 2, comments: 6 } },
  { id: 'st-p6', phaseId: 'ph-5', laneId: 'ln-painpoints', content: 'Slow time-to-value', status: 'in-progress', tags: ['retention'],
    painPointMeta: { description: 'Value realized only after 3+ months — churn risk in early lifecycle', impact: 5, reach: 5, cost: 5, category: 'CS', assignee: 'TN', priority: 'up', tags: 3, comments: 9 } },

  // ── Opportunities ──────────────────────────────────────────────────────────
  { id: 'st-o1', phaseId: 'ph-1', laneId: 'ln-opportun', content: 'Add interactive ROI calculator to landing page' },
  { id: 'st-o2', phaseId: 'ph-2', laneId: 'ln-opportun', content: 'Launch freemium / self-guided sandbox trial' },
  { id: 'st-o3', phaseId: 'ph-2', laneId: 'ln-opportun', content: 'Publish list pricing for SMB tier' },
  { id: 'st-o4', phaseId: 'ph-3', laneId: 'ln-opportun', content: 'Provide pre-built business case template (Word/PPT)' },
  { id: 'st-o5', phaseId: 'ph-3', laneId: 'ln-opportun', content: 'Automate legal redline via DocuSign + Ironclad' },
  { id: 'st-o6', phaseId: 'ph-4', laneId: 'ln-opportun', content: 'Automated SSO provisioning wizard (< 30 min)' },
  { id: 'st-o7', phaseId: 'ph-4', laneId: 'ln-opportun', content: 'Role-based onboarding paths (Admin / Modeler / Viewer)' },
  { id: 'st-o8', phaseId: 'ph-5', laneId: 'ln-opportun', content: 'In-app 90-day quick-win checklist with progress tracking' },
  { id: 'st-o9', phaseId: 'ph-5', laneId: 'ln-opportun', content: 'Peer community & certified champion program' },
]
