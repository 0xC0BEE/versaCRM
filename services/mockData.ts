// services/mockData.ts
import {
  Organization, User, AnyContact, Task, CalendarEvent, Product, Supplier, Warehouse, Deal, DealStage,
  Ticket, EmailTemplate, Campaign, Workflow, AdvancedWorkflow, IndustryConfig, Interaction, OrganizationSettings,
  Order, Transaction, Document, CustomReport, DashboardWidget, CustomRole
} from '../types';
import { subDays, addDays, subMonths } from 'date-fns';

// --- ORGANIZATIONS ---
export const MOCK_ORGANIZATIONS: Organization[] = [
  { id: 'org_1', name: 'Innovate Health Clinic', industry: 'Health', primaryContactEmail: 'admin@innovatehealth.com', createdAt: subDays(new Date(), 90).toISOString() },
  { id: 'org_2', name: 'Summit Financial Advisors', industry: 'Finance', primaryContactEmail: 'contact@summitfa.com', createdAt: subDays(new Date(), 120).toISOString() },
];

// --- ROLES & USERS ---
export let MOCK_ROLES: CustomRole[] = [
  { id: 'role_super', organizationId: 'org_1', name: 'Super Admin', description: 'Has all permissions across all organizations.', isSystemRole: true, permissions: {} },
  { id: 'role_admin', organizationId: 'org_1', name: 'Organization Admin', description: 'Manages settings and users for their organization.', isSystemRole: true, permissions: { 'settings:access': true, 'settings:manage:team': true, 'settings:manage:roles': true, 'contacts:read:all': true, 'reports:read': true, 'automations:manage': true, 'inventory:manage': true, 'deals:read': true, 'tickets:read': true, 'voip:use': true } },
  { id: 'role_team', organizationId: 'org_1', name: 'Team Member', description: 'Standard user with access to assigned records.', isSystemRole: true, permissions: { 'contacts:read:own': true, 'deals:read': true, 'tickets:read': true } },
  { id: 'role_client', organizationId: 'org_1', name: 'Client', description: 'Accesses the client portal.', isSystemRole: true, permissions: {} },
];

export let MOCK_USERS: User[] = [
  { id: 'user_super_1', organizationId: 'org_1', name: 'Super User', email: 'super@crm.com', role: 'Super Admin', roleId: 'role_super', isClient: false },
  { id: 'user_admin_1', organizationId: 'org_1', name: 'Alice Admin', email: 'admin@crm.com', role: 'Organization Admin', roleId: 'role_admin', isClient: false },
  { id: 'user_team_1', organizationId: 'org_1', name: 'Bob Practitioner', email: 'team@crm.com', role: 'Team Member', roleId: 'role_team', isClient: false },
  { id: 'user_client_1', organizationId: 'org_1', name: 'John Patient', email: 'client@crm.com', role: 'Client', roleId: 'role_client', isClient: true, contactId: 'contact_1' },
];

// --- INTERACTIONS ---
const mockInteractions: Interaction[] = [
  { id: 'int_1', organizationId: 'org_1', contactId: 'contact_1', userId: 'user_admin_1', type: 'Appointment', date: subDays(new Date(), 2).toISOString(), notes: 'Follow-up appointment. Discussed treatment plan progress. Patient is responding well.' },
  { id: 'int_2', organizationId: 'org_1', contactId: 'contact_1', userId: 'user_team_1', type: 'Note', date: subDays(new Date(), 5).toISOString(), notes: 'Patient called to confirm next appointment. @Alice Admin please review the latest lab results.' },
  { id: 'int_3', organizationId: 'org_1', contactId: 'contact_2', userId: 'user_team_1', type: 'Email', date: subDays(new Date(), 10).toISOString(), notes: 'Sent an email regarding insurance pre-authorization.' },
];

// --- ORDERS, TRANSACTIONS, DOCUMENTS ---
const mockOrders: Order[] = [
  { id: 'ord_1', organizationId: 'org_1', contactId: 'contact_1', orderDate: subDays(new Date(), 20).toISOString(), status: 'Completed', lineItems: [{ productId: 'prod_1', description: 'Standard Consultation', quantity: 1, unitPrice: 150 }], total: 150 },
];
const mockTransactions: Transaction[] = [
    { id: 'trans_1', organizationId: 'org_1', contactId: 'contact_1', date: subDays(new Date(), 20).toISOString(), type: 'Charge', amount: 150, method: 'Insurance', orderId: 'ord_1' },
    { id: 'trans_2', organizationId: 'org_1', contactId: 'contact_1', date: subDays(new Date(), 19).toISOString(), type: 'Payment', amount: 120, method: 'Insurance' },
    { id: 'trans_3', organizationId: 'org_1', contactId: 'contact_1', date: subDays(new Date(), 18).toISOString(), type: 'Payment', amount: 30, method: 'Credit Card', relatedChargeId: 'trans_1' },
];
export let MOCK_DOCUMENTS: Document[] = [
    { id: 'doc_1', organizationId: 'org_1', contactId: 'contact_1', fileName: 'intake-form.pdf', fileType: 'application/pdf', uploadDate: subDays(new Date(), 45).toISOString(), dataUrl: '' },
    { id: 'doc_2', organizationId: 'org_1', contactId: 'contact_2', fileName: 'referral-letter.pdf', fileType: 'application/pdf', uploadDate: subDays(new Date(), 3).toISOString(), dataUrl: '' },
];


// --- CONTACTS (MUTABLE) ---
export let MOCK_CONTACTS_MUTABLE: AnyContact[] = [
  { id: 'contact_1', organizationId: 'org_1', contactName: 'John Patient', email: 'john.patient@example.com', phone: '555-0101', status: 'Active', leadSource: 'Referral', createdAt: subDays(new Date(), 45).toISOString(), assignedToId: 'user_team_1', leadScore: 85, customFields: { patientId: 'P001', insuranceProvider: 'United Health' }, interactions: mockInteractions.filter(i => i.contactId === 'contact_1'), orders: mockOrders, transactions: mockTransactions, structuredRecords: [{ id: 'sr_1', type: 'soap_note', title: 'Initial Consultation', recordDate: subDays(new Date(), 45).toISOString(), fields: { subjective: 'Patient reports mild back pain.', objective: 'Limited range of motion.', assessment: 'Suspected muscle strain.', plan: 'Recommend physical therapy.' } }] },
  { id: 'contact_2', organizationId: 'org_1', contactName: 'Jane Doe', email: 'jane.doe@example.com', phone: '555-0102', status: 'Lead', leadSource: 'Web', createdAt: subDays(new Date(), 15).toISOString(), assignedToId: 'user_admin_1', leadScore: 40, customFields: { patientId: 'P002' }, interactions: mockInteractions.filter(i => i.contactId === 'contact_2') },
  { id: 'contact_3', organizationId: 'org_1', contactName: 'Peter Jones', email: 'peter.jones@example.com', phone: '555-0103', status: 'Needs Attention', leadSource: 'Web', createdAt: subDays(new Date(), 60).toISOString(), assignedToId: 'user_team_1', leadScore: 60, customFields: {} },
];

// --- TASKS ---
export let MOCK_TASKS: Task[] = [
  { id: 'task_1', organizationId: 'org_1', userId: 'user_team_1', contactId: 'contact_1', title: 'Follow up on lab results for John Patient', dueDate: addDays(new Date(), 2).toISOString(), isCompleted: false },
  { id: 'task_2', organizationId: 'org_1', userId: 'user_admin_1', contactId: 'contact_2', title: 'Call Jane Doe for initial consultation', dueDate: addDays(new Date(), 1).toISOString(), isCompleted: false },
  { id: 'task_3', organizationId: 'org_1', userId: 'user_team_1', title: 'Review weekly patient charts', dueDate: subDays(new Date(), 1).toISOString(), isCompleted: true },
];

// --- CALENDAR ---
export let MOCK_CALENDAR_EVENTS: CalendarEvent[] = [
  { id: 'event_1', organizationId: 'org_1', userIds: ['user_team_1'], title: 'Appointment: John Patient', start: addDays(new Date(), 3), end: addDays(new Date(), 3.05), contactId: 'contact_1' },
];

// --- INVENTORY ---
export let MOCK_PRODUCTS: Product[] = [
  { id: 'prod_1', organizationId: 'org_1', name: 'Standard Consultation', sku: 'CONS-STD', category: 'Service', costPrice: 0, salePrice: 150, stockLevel: 9999 },
  { id: 'prod_2', organizationId: 'org_1', name: 'Back Brace', sku: 'BRACE-L', category: 'Durable Medical Equipment', costPrice: 45, salePrice: 80, stockLevel: 80 },
];
export const MOCK_SUPPLIERS: Supplier[] = [{ id: 'sup_1', organizationId: 'org_1', name: 'MedSupply Co.', contactPerson: 'Sarah Chen', email: 'sarah@medsupply.com', phone: '555-SUPPLY' }];
export const MOCK_WAREHOUSES: Warehouse[] = [{ id: 'wh_1', organizationId: 'org_1', name: 'Main Clinic Storage', location: '123 Health St.' }];

// --- DEALS ---
export let MOCK_DEAL_STAGES: DealStage[] = [
  { id: 'stage_1', organizationId: 'org_1', name: 'Qualification', order: 1 },
  { id: 'stage_2', organizationId: 'org_1', name: 'Needs Analysis', order: 2 },
  { id: 'stage_3', organizationId: 'org_1', name: 'Proposal', order: 3 },
  { id: 'stage_4', organizationId: 'org_1', name: 'Closed Won', order: 4 },
  { id: 'stage_5', organizationId: 'org_1', name: 'Closed Lost', order: 5 },
];
export let MOCK_DEALS: Deal[] = [
  { id: 'deal_1', organizationId: 'org_1', name: 'Corporate Wellness Program - Innovate Inc.', value: 5000, stageId: 'stage_2', contactId: 'contact_2', assignedToId: 'user_admin_1', expectedCloseDate: addDays(new Date(), 20).toISOString(), createdAt: subDays(new Date(), 10).toISOString() },
  { id: 'deal_2', organizationId: 'org_1', name: 'On-site Clinic Services - Acme Corp', value: 12000, stageId: 'stage_3', contactId: 'contact_3', assignedToId: 'user_team_1', expectedCloseDate: addDays(new Date(), 15).toISOString(), createdAt: subDays(new Date(), 25).toISOString() },
];

// --- TICKETS ---
export let MOCK_TICKETS: Ticket[] = [
  { id: 'ticket_1', organizationId: 'org_1', contactId: 'contact_1', assignedToId: 'user_team_1', subject: 'Billing question', description: 'I have a question about my last statement.', priority: 'Medium', status: 'Open', createdAt: subDays(new Date(), 1).toISOString(), updatedAt: subDays(new Date(), 1).toISOString(), replies: [] },
];

// --- AUTOMATION ---
export let MOCK_EMAIL_TEMPLATES: EmailTemplate[] = [
  { id: 'et_1', organizationId: 'org_1', name: 'Welcome Email', subject: 'Welcome, {{contactName}}!', body: 'Hi {{contactName}},\n\nWelcome to our clinic! We are excited to have you.\n\nBest,\n{{userName}}' },
  { id: 'et_2', organizationId: 'org_1', name: 'Lead Follow-up', subject: 'Following up', body: 'Hi {{contactName}},\n\nJust following up on our recent conversation. Let me know if you have any questions.\n\nBest,\n{{userName}}' },
  { id: 'et_3', organizationId: 'org_1', name: 'Deal Won - Welcome Onboard', subject: 'Welcome to the family, {{contactName}}!', body: 'Hi {{contactName}},\n\nWe are thrilled to officially welcome you! Looking forward to working together on the {{dealName}} deal.\n\nBest,\n{{userName}}' },
];
export let MOCK_CAMPAIGNS: Campaign[] = [
    {
    id: 'camp_1', organizationId: 'org_1', name: 'Welcome New Leads', status: 'Draft',
    targetAudience: { status: 'Lead', leadScore: { operator: 'eq', value: 0 } },
    stats: { recipients: 0, sent: 0, opened: 0, clicked: 0 },
    nodes: [
        { id: '1', type: 'journeyTrigger', position: { x: 250, y: 25 }, data: { label: 'Target Audience', nodeType: 'targetAudience' } },
        { id: '2', type: 'journeyAction', position: { x: 250, y: 125 }, data: { label: 'Send Welcome Email', nodeType: 'sendEmail', emailTemplateId: 'et_1' } },
        { id: '3', type: 'journeyAction', position: { x: 250, y: 225 }, data: { label: 'Wait 3 Days', nodeType: 'wait', days: 3 } },
        { id: '4', type: 'journeyCondition', position: { x: 250, y: 325 }, data: { label: 'Opened Email?', nodeType: 'ifEmailOpened' } },
        { id: '5', type: 'journeyAction', position: { x: 100, y: 425 }, data: { label: 'Send Special Offer', nodeType: 'sendEmail', emailTemplateId: 'et_2' } },
        { id: '6', type: 'journeyAction', position: { x: 400, y: 425 }, data: { label: 'Send Reminder', nodeType: 'sendEmail', emailTemplateId: 'et_2' } },
        { id: '7', type: 'journeyAction', position: { x: 100, y: 525 }, data: { label: 'Create Follow-up Task', nodeType: 'createTask', taskTitle: 'Follow up on offer with {{contactName}}' } },
    ],
    edges: [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e2-3', source: '2', target: '3' },
        { id: 'e3-4', source: '3', target: '4' },
        { id: 'e4-5', source: '4', target: '5', sourceHandle: 'true' },
        { id: 'e4-6', source: '4', target: '6', sourceHandle: 'false' },
        { id: 'e5-7', source: '5', target: '7' },
    ]
  }
];
export let MOCK_WORKFLOWS: Workflow[] = [
    { id: 'wf_1', organizationId: 'org_1', name: 'Generate Audit Log on Status Change', isActive: true, trigger: { type: 'contactStatusChanged' }, actions: [{ type: 'createAuditLogEntry' }] },
    { id: 'wf_2', organizationId: 'org_1', name: 'Create Task on Proposal Sent', isActive: true, trigger: { type: 'dealStageChanged', toStageId: 'stage_3' }, actions: [{ type: 'createTask', taskTitle: 'Follow up on proposal for {{dealName}}'}] },
    { id: 'wf_3', organizationId: 'org_1', name: 'Send Welcome Email on Deal Won', isActive: true, trigger: { type: 'dealStageChanged', toStageId: 'stage_4' }, actions: [{ type: 'sendEmail', emailTemplateId: 'et_3' }] },
    { id: 'wf_4', organizationId: 'org_1', name: 'Flag Contact for High Priority Ticket', isActive: true, trigger: { type: 'ticketCreated', priority: 'High' }, actions: [{ type: 'updateContactField', fieldId: 'status', newValue: 'Needs Attention' }] },
];
export let MOCK_ADVANCED_WORKFLOWS: AdvancedWorkflow[] = [
    {
    id: 'awf_1', organizationId: 'org_1', name: 'High-Value Deal Follow-up', isActive: true,
    nodes: [
      { id: '1', type: 'trigger', position: { x: 250, y: 5 }, data: { label: 'Deal Stage Changes', nodeType: 'dealStageChanged' } },
      { id: '2', type: 'condition', position: { x: 250, y: 100 }, data: { label: 'If/Then', nodeType: 'ifCondition', condition: { field: 'deal.value', operator: 'gt', value: '7500' } } },
      { id: '3', type: 'action', position: { x: 100, y: 200 }, data: { label: 'Create High-Prio Task', nodeType: 'createTask', taskTitle: 'High-value deal: Follow up with {{contactName}}' } },
      { id: '4', type: 'action', position: { x: 400, y: 200 }, data: { label: 'Create Standard Task', nodeType: 'createTask', taskTitle: 'Standard deal: Follow up with {{contactName}}' } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3', sourceHandle: 'true' },
      { id: 'e2-4', source: '2', target: '4', sourceHandle: 'false' },
    ],
  },
];

// --- REPORTS ---
export let MOCK_CUSTOM_REPORTS: CustomReport[] = [];
export let MOCK_DASHBOARD_WIDGETS: DashboardWidget[] = [];

// --- SETTINGS ---
export let MOCK_ORGANIZATION_SETTINGS: OrganizationSettings = {
  organizationId: 'org_1',
  ticketSla: {
    responseTime: { high: 1, medium: 4, low: 24 },
    resolutionTime: { high: 8, medium: 24, low: 72 },
  },
  leadScoringRules: [
    { id: 'rule_1', event: 'interaction', interactionType: 'Appointment', points: 20 },
    { id: 'rule_2', event: 'interaction', interactionType: 'Email', points: 5 },
    { id: 'rule_3', event: 'status_change', status: 'Active', points: 30 },
  ],
  liveChat: {
    isEnabled: true,
    color: '#3b82f6',
    welcomeMessage: 'Welcome to Innovate Health! How can we help?',
    autoCreateContact: true,
    newContactStatus: 'Lead',
    autoCreateTicket: true,
    newTicketPriority: 'Medium',
  },
  emailIntegration: {
      isConnected: false,
      connectedEmail: null,
      lastSync: null,
  },
  voip: {
      isConnected: false,
      provider: null,
  },
};

// --- EXTERNAL DATA FOR SYNCING ---
export const MOCK_EXTERNAL_EMAILS = [
    { id: 1, from: 'john.patient@example.com', to: ['team@crm.com'], subject: 'Re: Follow-up', body: 'Thanks for the information!', date: subDays(new Date(), 1).toISOString(), isSynced: false },
];