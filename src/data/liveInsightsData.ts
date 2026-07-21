export type DictionaryItemStatus = 'published' | 'draft' | 'outdated'

export type DictionaryItem = {
  id: string
  name: string
  type: string
  subCategory?: string
  elementType: string
  usageCount: number
  isFavorite?: boolean
  description: string
  version: string
  lastUpdated: string
  status: DictionaryItemStatus
  updatedBy: string
  usedIn: string[]
  links?: { name: string; url: string }[]
}

export type ElementType = 'event' | 'task' | 'gateway' | 'system' | 'li-shape' | 'data' | 'artifact'

export type ElementData = {
  name: string
  type: ElementType
  subtype: string
  description: string
  linkedDictId?: string
  manualValue?: string
  drivingWidget?: string
  additionalWidgets?: string[]
}

export type Connection = {
  id: string
  from: string
  to: string
  dir: 'h' | 'v' | 'vu'
  flowLabel?: string
  type?: 'sequence' | 'association' | 'association-uni' | 'association-bi' | 'message'
}

export type ElementGeometry = {
  cx: number
  cy: number
  hw: number
  hh: number
}

// ── Dictionary Items ──────────────────────────────────────────────────────────

export const dictionaryItems: DictionaryItem[] = [
  // Organizational Units
  { id:'d1',  name:'Sales Manager',          type:'Organizational Units', subCategory:'Management',        elementType:'lane',   usageCount:8,  description:'Responsible for sales team and strategy',                          version:'2.1', lastUpdated:'04.03.2026', status:'published', updatedBy:'Sarah Chen',     usedIn:['Sales Process Overview','Customer Onboarding','Lead Management','Quote to Cash','Sales Forecasting','Territory Planning','Deal Approval','Revenue Recognition'] },
  { id:'d2',  name:'Finance Officer',         type:'Organizational Units', subCategory:'Finance',           elementType:'lane',   usageCount:5,  description:'Handles financial operations',                                     version:'1.0', lastUpdated:'06.01.2026', status:'outdated',  updatedBy:'John Smith',     usedIn:['Invoice Processing','Budget Approval','Expense Management','Financial Close','Accounts Payable'] },
  { id:'d3',  name:'Product Owner',           type:'Organizational Units', subCategory:'Product Management',elementType:'lane',   usageCount:12, isFavorite:true, description:'Manages product backlog and priorities',             version:'3.0', lastUpdated:'06.03.2026', status:'draft',     updatedBy:'Emma Rodriguez', usedIn:['Sprint Planning','Product Roadmap','Feature Prioritization','Backlog Grooming','Release Planning','Stakeholder Review','Product Discovery','MVP Definition','User Story Mapping','A/B Test Design','Product Launch','Feedback Analysis'] },
  { id:'d11', name:'HR Manager',              type:'Organizational Units', subCategory:'Human Resources',   elementType:'lane',   usageCount:7,  description:'Oversees human resources',                                         version:'1.3', lastUpdated:'27.02.2026', status:'published', updatedBy:'Lisa Wang',      usedIn:['Recruitment Process','Onboarding','Performance Review','Leave Management','Training Administration','Offboarding','Compensation Review'] },
  { id:'d12', name:'IT Admin',                type:'Organizational Units', subCategory:'IT Management',     elementType:'lane',   usageCount:9,  description:'Manages IT infrastructure',                                        version:'2.5', lastUpdated:'06.03.2026', status:'draft',     updatedBy:'Alex Turner',    usedIn:['User Provisioning','Access Management','Incident Management','Change Management','Backup & Recovery','System Monitoring','Patch Management','Security Audit','Asset Lifecycle'] },
  { id:'d42', name:'Recruitment Specialist',  type:'Organizational Units', subCategory:'Human Resources',   elementType:'lane',   usageCount:10, description:'Handles end-to-end recruitment activities',                        version:'2.0', lastUpdated:'15.03.2026', status:'published', updatedBy:'Lisa Wang',      usedIn:['Recruitment Process','Hiring Pipeline','Talent Acquisition','Campus Recruiting'] },
  { id:'d43', name:'Compliance Officer',      type:'Organizational Units', subCategory:'Legal',             elementType:'lane',   usageCount:6,  description:'Ensures regulatory compliance across processes',                   version:'1.2', lastUpdated:'20.02.2026', status:'published', updatedBy:'John Smith',     usedIn:['Audit Process','Regulatory Reporting','Policy Management','Risk Assessment'] },
  { id:'d44', name:'Operations Manager',      type:'Organizational Units', subCategory:'Operations',        elementType:'lane',   usageCount:8,  description:'Manages daily operations and process efficiency',                  version:'1.5', lastUpdated:'10.03.2026', status:'published', updatedBy:'Sarah Chen',     usedIn:['Order Fulfillment','Supply Chain','Quality Management','Capacity Planning'] },
  { id:'d45', name:'Data Analyst',            type:'Organizational Units', subCategory:'Analytics',         elementType:'lane',   usageCount:7,  description:'Analyzes business data and generates insights',                    version:'1.1', lastUpdated:'05.03.2026', status:'published', updatedBy:'Michael Park',   usedIn:['Reporting Process','Data Migration','Dashboard Management','KPI Tracking'] },
  { id:'d46', name:'Customer Service Rep',    type:'Organizational Units', subCategory:'Customer Support',  elementType:'lane',   usageCount:9,  description:'Handles customer inquiries and support requests',                  version:'2.3', lastUpdated:'12.03.2026', status:'published', updatedBy:'Emma Rodriguez', usedIn:['Case Management','Complaint Handling','Service Desk','Escalation Process'] },
  { id:'d47', name:'Project Manager',         type:'Organizational Units', subCategory:'Management',        elementType:'lane',   usageCount:11, isFavorite:true, description:'Leads project planning and execution',              version:'3.1', lastUpdated:'14.03.2026', status:'published', updatedBy:'Alex Turner',    usedIn:['Project Kickoff','Sprint Planning','Release Management','Risk Assessment','Stakeholder Review'] },
  { id:'d48', name:'Legal Counsel',           type:'Organizational Units', subCategory:'Legal',             elementType:'lane',   usageCount:4,  description:'Provides legal advice and contract review',                        version:'1.0', lastUpdated:'18.02.2026', status:'published', updatedBy:'John Smith',     usedIn:['Contract Review','NDA Management','IP Protection','Dispute Resolution'] },
  { id:'d49', name:'Quality Assurance Lead',  type:'Organizational Units', subCategory:'Quality',           elementType:'lane',   usageCount:6,  description:'Oversees quality standards and testing',                           version:'1.4', lastUpdated:'08.03.2026', status:'published', updatedBy:'Lisa Wang',      usedIn:['QA Process','Test Management','Defect Tracking','Release Validation'] },
  { id:'d50', name:'Procurement Specialist',  type:'Organizational Units', subCategory:'Procurement',       elementType:'lane',   usageCount:5,  description:'Manages vendor selection and purchasing',                          version:'1.1', lastUpdated:'25.02.2026', status:'published', updatedBy:'Sarah Chen',     usedIn:['Procurement Process','Vendor Management','RFP Process','Purchase Approval'] },
  { id:'d51', name:'Security Analyst',        type:'Organizational Units', subCategory:'Security',          elementType:'lane',   usageCount:7,  description:'Monitors and responds to security incidents',                      version:'2.0', lastUpdated:'11.03.2026', status:'published', updatedBy:'Michael Park',   usedIn:['Incident Response','Access Review','Vulnerability Management','Security Audit'] },
  // IT Systems
  { id:'d4',  name:'SAP S/4HANA',             type:'IT System', subCategory:'ERP',                 elementType:'system', usageCount:15, isFavorite:true, description:'Enterprise resource planning system',    version:'1.5', lastUpdated:'27.02.2026', status:'published', updatedBy:'Michael Park',   usedIn:['Order to Cash','Procure to Pay','Record to Report','Hire to Retire','Plan to Produce','Inventory Management','Asset Management','Treasury Management','Financial Planning','Supply Chain','Quality Management','Sales Operations','Production Planning','Warehouse Management','Master Data Management'] },
  { id:'d5',  name:'Salesforce CRM',          type:'IT System', subCategory:'CRM',                 elementType:'system', usageCount:9,  description:'Customer relationship management',                                  version:'2.3', lastUpdated:'01.03.2026', status:'published', updatedBy:'Lisa Wang',      usedIn:['Lead Management','Opportunity Management','Contact Management','Campaign Management','Sales Forecasting','Customer Service','Case Management','Quote Generation','Pipeline Management'] },
  { id:'d6',  name:'JIRA',                    type:'IT System', subCategory:'Project Management',  elementType:'system', usageCount:6,  isFavorite:true, description:'Project tracking and issue management',  version:'1.2', lastUpdated:'13.02.2026', status:'outdated',  updatedBy:'Alex Turner',    usedIn:['Sprint Planning','Bug Tracking','Feature Development','Release Management','Backlog Management','Incident Response'] },
  { id:'d41', name:'ATS System',              type:'IT System', subCategory:'HR Technology',       elementType:'system', usageCount:10, description:'Applicant Tracking System for managing recruitment workflow',         version:'3.0', lastUpdated:'15.03.2026', status:'published', updatedBy:'IT Admin',       usedIn:['Recruitment Process','Hiring Pipeline','Talent Management','Onboarding'] },
  { id:'d53', name:'ServiceNow',              type:'IT System', subCategory:'ITSM',                elementType:'system', usageCount:10, description:'IT service management and workflow automation',                     version:'2.4', lastUpdated:'12.03.2026', status:'published', updatedBy:'Alex Turner',    usedIn:['Incident Management','Change Management','Problem Management','Service Catalog','Asset Management'] },
  { id:'d56', name:'Workday',                 type:'IT System', subCategory:'HCM',                 elementType:'system', usageCount:12, isFavorite:true, description:'Human capital management cloud platform',version:'4.0', lastUpdated:'14.03.2026', status:'published', updatedBy:'Sarah Chen',     usedIn:['Payroll','Benefits','Talent Management','Learning','Compensation','Recruiting','Time Tracking'] },
  // Documents
  { id:'d7',  name:'Customer Data',           type:'Documents', subCategory:'Customer Information',elementType:'data',   usageCount:11, description:'Customer information and records',                                  version:'4.0', lastUpdated:'05.03.2026', status:'published', updatedBy:'Sarah Chen',     usedIn:['Customer Onboarding','KYC Process','Data Migration','Customer Segmentation','Profile Update','GDPR Compliance','Marketing Campaigns','Churn Analysis','Customer Service','Account Management','Credit Check'] },
  { id:'d8',  name:'Invoice',                 type:'Documents', subCategory:'Billing',             elementType:'data',   usageCount:7,  isFavorite:true, description:'Billing and payment documents',          version:'1.8', lastUpdated:'06.03.2026', status:'draft',     updatedBy:'Michael Park',   usedIn:['Billing Process','Accounts Receivable','Payment Processing','Revenue Recognition','Dispute Resolution','Credit Management','Collections'] },
  { id:'d61', name:'Application Form',        type:'Documents', subCategory:'HR Information',      elementType:'data',   usageCount:8,  description:'Candidate application form with personal and professional details', version:'2.1', lastUpdated:'11.03.2026', status:'published', updatedBy:'Lisa Wang',      usedIn:['Recruitment Process','Candidate Screening','Application Review'] },
  { id:'d67', name:'Candidate Resume',        type:'Documents', subCategory:'HR Information',      elementType:'data',   usageCount:9,  description:'Curriculum vitae and supporting application documents',             version:'1.0', lastUpdated:'12.03.2026', status:'published', updatedBy:'Lisa Wang',      usedIn:['Recruitment Process','Candidate Screening','Resume Parsing'] },
  // Processes
  { id:'d10', name:'Approval Workflow',       type:'Process', subCategory:'Approval',              elementType:'subprocess', usageCount:10, description:'Multi-step approval process',                               version:'1.1', lastUpdated:'23.01.2026', status:'outdated',  updatedBy:'John Smith',     usedIn:['Expense Approval','Purchase Approval','Contract Approval','Budget Approval','Document Approval','Change Request','Access Request','Leave Request','Capital Expenditure','Vendor Onboarding'] },
  { id:'d68', name:'Onboarding Process',      type:'Process', subCategory:'HR',                    elementType:'subprocess', usageCount:9,  description:'End-to-end new employee onboarding workflow',               version:'2.0', lastUpdated:'14.03.2026', status:'published', updatedBy:'Lisa Wang',      usedIn:['Hiring Pipeline','Employee Lifecycle','IT Provisioning','Benefits Enrollment'] },
  { id:'d70', name:'Incident Management',     type:'Process', subCategory:'ITSM',                  elementType:'subprocess', usageCount:11, description:'IT incident detection, triage, and resolution',             version:'3.0', lastUpdated:'12.03.2026', status:'published', updatedBy:'Alex Turner',    usedIn:['Service Desk','Escalation','Root Cause Analysis','Post-Mortem'] },
  // Activities
  { id:'d23', name:'Screen Application',      type:'Activities', elementType:'task', usageCount:9,  description:'Review and screen incoming job applications',                               version:'2.0', lastUpdated:'03.03.2026', status:'published', updatedBy:'Lisa Wang',      usedIn:['Recruitment Process','Hiring Pipeline','Application Review','Talent Acquisition','Candidate Screening','Resume Review','Shortlisting','Pre-screening','Background Check'] },
  { id:'d24', name:'Conduct Interview',       type:'Activities', elementType:'task', usageCount:7,  isFavorite:true, description:'Conduct candidate interview and evaluation',                version:'1.4', lastUpdated:'01.03.2026', status:'published', updatedBy:'Sarah Chen',     usedIn:['Recruitment Process','Hiring Pipeline','Interview Scheduling','Panel Interview','Technical Assessment','Culture Fit','Final Interview'] },
  { id:'d25', name:'Send Notification',       type:'Activities', elementType:'task', usageCount:14, description:'Automated email or system notification',                                   version:'3.0', lastUpdated:'05.03.2026', status:'published', updatedBy:'Alex Turner',    usedIn:['Onboarding','Order Confirmation','Password Reset','Approval Notification','Escalation Alert','Welcome Email','Status Update','Reminder'] },
  { id:'d27', name:'Evaluate CV',             type:'Activities', elementType:'task', usageCount:11, description:'Review and evaluate submitted curriculum vitae against job requirements', version:'2.3', lastUpdated:'10.03.2026', status:'published', updatedBy:'Sarah Chen',     usedIn:['Recruitment Process','Hiring Pipeline','Application Review','Talent Acquisition','Candidate Screening'] },
  { id:'d28', name:'Interview candidate',     type:'Activities', elementType:'task', usageCount:8,  description:'Conduct structured interview with candidate',                              version:'1.6', lastUpdated:'15.03.2026', status:'published', updatedBy:'HR Manager',     usedIn:['Recruitment Process','Hiring Pipeline','Interview Scheduling','Panel Interview'], links:[{name:'Interview Guide',url:'https://confluence.example.com/interview-guide'},{name:'Evaluation Form',url:'https://sharepoint.example.com/eval-form'}] },
  { id:'d30', name:'Make offer',              type:'Activities', elementType:'task', usageCount:5,  description:'Prepare and send job offer letter to selected candidate',                  version:'1.2', lastUpdated:'12.03.2026', status:'published', updatedBy:'Sarah Chen',     usedIn:['Recruitment Process','Hiring Pipeline','Offer Management'] },
  { id:'d31', name:'Onboard candidate',       type:'Activities', elementType:'task', usageCount:7,  description:'Complete onboarding process for newly hired employee',                    version:'2.0', lastUpdated:'14.03.2026', status:'published', updatedBy:'HR Manager',     usedIn:['Recruitment Process','Onboarding','Employee Lifecycle'] },
  // Gateways
  { id:'d17', name:'Approval Decision',       type:'Gateway', subCategory:'Exclusive', elementType:'gateway', usageCount:14, isFavorite:true, description:'Exclusive gateway for approval/rejection decisions', version:'2.0', lastUpdated:'05.03.2026', status:'published', updatedBy:'Sarah Chen', usedIn:['Expense Approval','Purchase Approval','Contract Approval','Budget Approval','Leave Request','Change Request','Access Request','Document Approval','Capital Expenditure','Vendor Onboarding','Invoice Approval','Travel Request','Hiring Decision','Credit Check'] },
  { id:'d36', name:'Proceed with interview?', type:'Gateway', subCategory:'Exclusive', elementType:'gateway', usageCount:7,  description:'Decision point to determine if candidate proceeds to interview stage', version:'1.2', lastUpdated:'10.03.2026', status:'published', updatedBy:'HR Manager',   usedIn:['Recruitment Process','Hiring Pipeline','Candidate Screening'] },
  { id:'d37', name:'Hire candidate?',         type:'Gateway', subCategory:'Exclusive', elementType:'gateway', usageCount:6,  description:'Decision point after interview to determine hiring outcome',             version:'1.0', lastUpdated:'11.03.2026', status:'published', updatedBy:'Sarah Chen',   usedIn:['Recruitment Process','Hiring Pipeline','Interview Assessment'] },
  { id:'d38', name:'Offer accepted?',         type:'Gateway', subCategory:'Exclusive', elementType:'gateway', usageCount:5,  description:'Decision point checking whether candidate accepted the job offer',     version:'1.0', lastUpdated:'12.03.2026', status:'published', updatedBy:'Lisa Wang',     usedIn:['Recruitment Process','Hiring Pipeline','Offer Management'] },
  // Events
  { id:'d20', name:'Order Received',          type:'Events', subCategory:'Start Event',       elementType:'event', usageCount:10, description:'Start event triggered when an order is received',                    version:'1.5', lastUpdated:'04.03.2026', status:'published', updatedBy:'Michael Park',   usedIn:['Order to Cash','Sales Order Processing','Order Fulfillment','E-Commerce Flow','Drop Shipping'] },
  { id:'d21', name:'Process Complete',        type:'Events', subCategory:'End Event',         elementType:'event', usageCount:12, isFavorite:true, description:'End event marking successful process completion', version:'2.1', lastUpdated:'06.03.2026', status:'published', updatedBy:'Emma Rodriguez', usedIn:['Order to Cash','Procure to Pay','Hire to Retire','Invoice Processing','Onboarding','Offboarding'] },
  { id:'d33', name:'Application received',    type:'Events', subCategory:'Start Event',       elementType:'event', usageCount:9,  description:'Start event triggered when a new application is submitted',          version:'1.4', lastUpdated:'11.03.2026', status:'published', updatedBy:'Alex Turner',    usedIn:['Recruitment Process','Hiring Pipeline','Application Review','Talent Acquisition'] },
  { id:'d34', name:'Application rejected',    type:'Events', subCategory:'End Event',         elementType:'event', usageCount:6,  description:'End event when a candidate application is formally rejected',        version:'1.0', lastUpdated:'09.03.2026', status:'published', updatedBy:'Lisa Wang',      usedIn:['Recruitment Process','Hiring Pipeline','Candidate Communication'] },
  { id:'d35', name:'Candidate hired',         type:'Events', subCategory:'End Event',         elementType:'event', usageCount:5,  description:'End event when candidate successfully completes hiring process',     version:'1.1', lastUpdated:'13.03.2026', status:'published', updatedBy:'Sarah Chen',     usedIn:['Recruitment Process','Hiring Pipeline','Onboarding'] },
]

// ── Element Data Model ────────────────────────────────────────────────────────

export const elementData: Record<string, ElementData> = {
  'el-start':     { name: 'Application received',    type: 'event',   subtype: 'Start',  description: 'Start of the hiring process when an application is received.' },
  'el-evaluate':  { name: 'Evaluate CV',             type: 'task',    subtype: 'User Task',    description: "Review and evaluate the candidate's CV and cover letter." },
  'el-gateway1':  { name: 'Proceed with interview?', type: 'gateway', subtype: 'Exclusive',    description: 'Decision whether to proceed with interviewing the candidate.' },
  'el-reject1':   { name: 'Send rejection',          type: 'task',    subtype: 'User Task',    description: 'Send rejection notification to the candidate after CV evaluation.' },
  'el-end1':      { name: 'Application rejected',    type: 'event',   subtype: 'End',    description: '' },
  'el-plan':      { name: 'Plan interview',          type: 'task',    subtype: 'User Task',    description: 'Schedule and plan the candidate interview with relevant stakeholders.' },
  'el-interview': { name: 'Interview candidate',     type: 'task',    subtype: 'User Task',    description: 'Conduct the candidate interview and complete the scorecard.' },
  'el-system':    { name: 'ATS System',              type: 'artifact', subtype: 'ITSystem',   description: 'Applicant Tracking System used to manage candidates during the interview process.' },
  'el-gateway2':  { name: 'Hire candidate?',         type: 'gateway', subtype: 'Exclusive',    description: 'Decision whether to hire the candidate based on interview results.' },
  'el-reject2':   { name: 'Send rejection',          type: 'task',    subtype: 'User Task',    description: 'Send rejection notification to candidate after interview.' },
  'el-end2':      { name: 'Application rejected',    type: 'event',   subtype: 'End',    description: '' },
  'el-offer':     { name: 'Make offer',              type: 'task',    subtype: 'User Task',    description: 'Prepare and send a formal job offer to the selected candidate.' },
  'el-gateway3':  { name: 'Offer accepted?',         type: 'gateway', subtype: 'Exclusive',    description: 'Decision whether the candidate accepted the job offer.' },
  'el-end3':      { name: 'Candidate is rejected',   type: 'event',   subtype: 'End',    description: '' },
  'el-onboard':   { name: 'Onboard candidate',       type: 'task',    subtype: 'User Task',    description: 'Complete the onboarding process for the new hire.' },
  'el-end4':      { name: 'Candidate hired',         type: 'event',   subtype: 'End',    description: 'Hiring process completed successfully.' },
}

// ── Element Geometry ──────────────────────────────────────────────────────────

export const ELEMENT_GEOMETRY: Record<string, ElementGeometry> = {
  'el-start':     { cx: 105,  cy: 175, hw: 16, hh: 16 },
  'el-evaluate':  { cx: 260,  cy: 175, hw: 64, hh: 44 },
  'el-gateway1':  { cx: 410,  cy: 175, hw: 24, hh: 24 },
  'el-reject1':   { cx: 410,  cy: 390, hw: 64, hh: 44 },
  'el-end1':      { cx: 560,  cy: 390, hw: 16, hh: 16 },
  'el-plan':      { cx: 580,  cy: 175, hw: 64, hh: 44 },
  'el-interview': { cx: 770,  cy: 175, hw: 64, hh: 44 },
  'el-system':    { cx: 770,  cy: 286, hw: 28.5, hh: 28.5 },
  'el-gateway2':  { cx: 920,  cy: 175, hw: 24, hh: 24 },
  'el-reject2':   { cx: 920,  cy: 390, hw: 64, hh: 44 },
  'el-end2':      { cx: 1070, cy: 390, hw: 16, hh: 16 },
  'el-offer':     { cx: 1090, cy: 175, hw: 64, hh: 44 },
  'el-gateway3':  { cx: 1240, cy: 175, hw: 24, hh: 24 },
  'el-end3':      { cx: 1240, cy: 375, hw: 16, hh: 16 },
  'el-onboard':   { cx: 1410, cy: 175, hw: 64, hh: 44 },
  'el-end4':      { cx: 1560, cy: 175, hw: 16, hh: 16 },
}

// ── Connections ───────────────────────────────────────────────────────────────

export const CONNECTIONS: Connection[] = [
  { id: 'flow-start-evaluate',     from: 'el-start',    to: 'el-evaluate',  dir: 'h', type: 'sequence' },
  { id: 'flow-evaluate-gateway1',  from: 'el-evaluate',  to: 'el-gateway1',  dir: 'h', type: 'sequence' },
  { id: 'flow-gateway1-plan',      from: 'el-gateway1',  to: 'el-plan',      dir: 'h', type: 'sequence', flowLabel: 'flabel-gateway1-plan' },
  { id: 'flow-gateway1-reject1',   from: 'el-gateway1',  to: 'el-reject1',   dir: 'v', type: 'sequence', flowLabel: 'flabel-gateway1-reject1' },
  { id: 'flow-reject1-end1',       from: 'el-reject1',   to: 'el-end1',      dir: 'h', type: 'sequence' },
  { id: 'flow-plan-interview',     from: 'el-plan',      to: 'el-interview', dir: 'h', type: 'sequence' },
  { id: 'flow-system-interview',   from: 'el-system',    to: 'el-interview', dir: 'vu', type: 'association' },
  { id: 'flow-interview-gateway2', from: 'el-interview', to: 'el-gateway2',  dir: 'h', type: 'sequence' },
  { id: 'flow-gateway2-offer',     from: 'el-gateway2',  to: 'el-offer',     dir: 'h', type: 'sequence', flowLabel: 'flabel-gateway2-offer' },
  { id: 'flow-gateway2-reject2',   from: 'el-gateway2',  to: 'el-reject2',   dir: 'v', type: 'sequence', flowLabel: 'flabel-gateway2-reject2' },
  { id: 'flow-reject2-end2',       from: 'el-reject2',   to: 'el-end2',      dir: 'h', type: 'sequence' },
  { id: 'flow-offer-gateway3',     from: 'el-offer',     to: 'el-gateway3',  dir: 'h', type: 'sequence' },
  { id: 'flow-gateway3-onboard',   from: 'el-gateway3',  to: 'el-onboard',   dir: 'h', type: 'sequence', flowLabel: 'flabel-gateway3-onboard' },
  { id: 'flow-gateway3-end3',      from: 'el-gateway3',  to: 'el-end3',      dir: 'v', type: 'sequence', flowLabel: 'flabel-gateway3-end3' },
  { id: 'flow-onboard-end4',       from: 'el-onboard',   to: 'el-end4',      dir: 'h', type: 'sequence' },
]

export const ELEMENT_LABELS: Record<string, string> = {
  'el-start':    'label-el-start',
  'el-gateway1': 'label-el-gateway1',
  'el-end1':     'label-el-end1',
  'el-system':   'label-el-system',
  'el-gateway2': 'label-el-gateway2',
  'el-end2':     'label-el-end2',
  'el-gateway3': 'label-el-gateway3',
  'el-end3':     'label-el-end3',
  'el-end4':     'label-el-end4',
}
