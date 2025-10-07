import {
  AnyContact,
  Organization,
  Industry,
  User,
  CalendarEvent,
  Task,
  Deal,
  DealStage,
  Interaction,
  Product,
  Supplier,
  Warehouse,
  EmailTemplate,
  CustomRole,
  Permission,
  Workflow,
  AdvancedWorkflow,
  OrganizationSettings,
  ApiKey,
  Ticket,
  PublicForm,
  Campaign,
  LandingPage,
} from '../types';
// FIX: Changed date-fns imports for 'subDays' and 'addDays' to separate imports from subpaths to resolve module export errors.
import subDays from 'date-fns/subDays';
import addDays from 'date-fns/addDays';

// --- ROLES & PERMISSIONS ---
export let MOCK_ROLES: CustomRole[] = [
  {
    id: 'role_super',
    organizationId: 'org_1',
    name: 'Super Admin',
    description: 'Has all permissions across all organizations.',
    isSystemRole: true,
    permissions: {}, // Implicitly has all
  },
  {
    id: 'role_admin',
    organizationId: 'org_1',
    name: 'Organization Admin',
    description: 'Manages users, settings, and billing for their organization.',
    isSystemRole: true,
    permissions: {
      'contacts:read:all': true,
      'contacts:create': true,
      'contacts:edit': true,
      'contacts:delete': true,
      'deals:read': true,
      'deals:create': true,
      'deals:edit': true,
      'deals:delete': true,
      'tickets:read': true,
      'tickets:create': true,
      'tickets:edit': true,
      'automations:manage': true,
      'reports:read': true,
      'reports:manage': true,
      'inventory:read': true,
      'inventory:manage': true,
      'settings:access': true,
      'settings:manage:team': true,
      'settings:manage:roles': true,
      'settings:manage:api': true,
      'voip:use': true,
    },
  },
  {
    id: 'role_team',
    organizationId: 'org_1',
    name: 'Team Member',
    description: 'Standard user with access to assigned contacts and deals.',
    isSystemRole: true,
    permissions: {
      'contacts:read:own': true,
      'contacts:create': true,
      'contacts:edit': true,
      'deals:read': true,
      'deals:create': true,
      'tickets:read': true,
      'tickets:create': true,
      'tickets:edit': true,
      'voip:use': true,
    },
  },
  {
    id: 'role_client',
    organizationId: 'org_1',
    name: 'Client',
    description: 'Accesses the client portal.',
    isSystemRole: true,
    permissions: {},
  },
];

// --- USERS ---
export let MOCK_USERS: User[] = [
  { id: 'user_super_1', organizationId: 'org_1', name: 'Super Supervisor', email: 'super@crm.com', role: 'Super Admin', roleId: 'role_super', isClient: false },
  { id: 'user_admin_1', organizationId: 'org_1', name: 'Alice Admin', email: 'admin@crm.com', role: 'Organization Admin', roleId: 'role_admin', isClient: false },
  { id: 'user_team_1', organizationId: 'org_1', name: 'Bob Builder', email: 'team@crm.com', role: 'Team Member', roleId: 'role_team', isClient: false },
  { id: 'user_client_1', organizationId: 'org_1', name: 'Charlie Client', email: 'client@crm.com', role: 'Client', roleId: 'role_client', isClient: true, contactId: 'contact_1' },
];

// --- ORGANIZATIONS ---
export let MOCK_ORGANIZATIONS: Organization[] = [
  { id: 'org_1', name: 'VersaHealth Clinic', industry: 'Health', primaryContactEmail: 'admin@crm.com', createdAt: subDays(new Date(), 90).toISOString() },
  { id: 'org_2', name: 'Momentum Financial', industry: 'Finance', primaryContactEmail: 'contact@momentum.com', createdAt: subDays(new Date(), 120).toISOString() },
  { id: 'org_3', name: 'Apex Legal Group', industry: 'Legal', primaryContactEmail: 'info@apexlegal.com', createdAt: subDays(new Date(), 200).toISOString() },
];

// --- INTERACTIONS (will be nested in contacts) ---
const mockInteractions: Interaction[] = [
    { id: 'int_1', organizationId: 'org_1', contactId: 'contact_1', userId: 'user_admin_1', type: 'Appointment', date: subDays(new Date(), 10).toISOString(), notes: 'Discussed treatment plan. Patient is responding well.' },
    { id: 'int_2', organizationId: 'org_1', contactId: 'contact_1', userId: 'user_team_1', type: 'Email', date: subDays(new Date(), 5).toISOString(), notes: 'Subject: Follow-up on your appointment\n\nHi John, it was great seeing you...' },
    { id: 'int_3', organizationId: 'org_1', contactId: 'contact_2', userId: 'user_admin_1', type: 'Call', date: subDays(new Date(), 2).toISOString(), notes: 'Called to confirm upcoming appointment on the 15th.' },
    { id: 'int_4', organizationId: 'org_1', contactId: 'contact_1', userId: 'user_admin_1', type: 'Appointment', date: addDays(new Date(), 7).toISOString(), notes: 'Follow-up consultation.' },
    { id: 'int_5', organizationId: 'org_1', contactId: 'contact_3', userId: 'user_team_1', type: 'Note', date: subDays(new Date(), 1).toISOString(), notes: '@Alice Admin Client called, needs a callback regarding portfolio performance.' },
];

// --- CONTACTS ---
export let MOCK_CONTACTS_MUTABLE: AnyContact[] = [
    { id: 'contact_1', organizationId: 'org_1', contactName: 'John Patient', email: 'john.patient@example.com', phone: '555-0101', status: 'Active', leadSource: 'Referral', createdAt: subDays(new Date(), 45).toISOString(), assignedToId: 'user_team_1', interactions: [mockInteractions[0], mockInteractions[1], mockInteractions[3]], customFields: { patientId: 'P12345', insuranceProvider: 'BlueCross', dateOfBirth: '1985-05-20' }, leadScore: 85, avatar: 'https://i.pravatar.cc/150?u=contact_1', campaignEnrollments: [] },
    { id: 'contact_2', organizationId: 'org_1', contactName: 'Jane Doe', email: 'jane.doe@example.com', phone: '555-0102', status: 'Lead', leadSource: 'Web', createdAt: subDays(new Date(), 5).toISOString(), assignedToId: 'user_admin_1', interactions: [mockInteractions[2]], customFields: { patientId: 'P67890' }, leadScore: 0, avatar: 'https://i.pravatar.cc/150?u=contact_2', campaignEnrollments: [] },
    { id: 'contact_3', organizationId: 'org_1', contactName: 'Peter Jones', email: 'peter.jones@example.com', phone: '555-0103', status: 'Needs Attention', leadSource: 'Web', createdAt: subDays(new Date(), 90).toISOString(), assignedToId: 'user_team_1', interactions: [mockInteractions[4]], customFields: {}, leadScore: 60, transactions: [{id: 'txn_1', date: subDays(new Date(), 30).toISOString(), type: 'Charge', amount: 150, method: 'Credit Card'}], campaignEnrollments: [] },
    { id: 'contact_4', organizationId: 'org_1', contactName: 'Mary Smith', email: 'mary.smith@example.com', phone: '555-0104', status: 'Inactive', leadSource: 'Referral', createdAt: subDays(new Date(), 150).toISOString(), customFields: {}, leadScore: 10, campaignEnrollments: [] },
    { id: 'contact_5', organizationId: 'org_1', contactName: 'New Lead Larry', email: 'larry@example.com', phone: '555-0105', status: 'Lead', leadSource: 'Manual', createdAt: subDays(new Date(), 1).toISOString(), assignedToId: 'user_team_1', customFields: {}, leadScore: 0, campaignEnrollments: [] },
];
MOCK_CONTACTS_MUTABLE[0].orders = [
    { id: 'order_1', orderDate: subDays(new Date(), 20).toISOString(), status: 'Completed', total: 150.00, lineItems: [{ productId: 'prod_1', description: 'Consultation Fee', quantity: 1, unitPrice: 150.00 }] },
    { id: 'order_2', orderDate: subDays(new Date(), 5).toISOString(), status: 'Pending', total: 45.50, lineItems: [{ productId: 'prod_2', description: 'Prescription Refill', quantity: 1, unitPrice: 45.50 }] },
];
MOCK_CONTACTS_MUTABLE[0].transactions = [
    { id: 'txn_2', date: subDays(new Date(), 20).toISOString(), type: 'Charge', amount: 150, method: 'Insurance', orderId: 'order_1' },
    { id: 'txn_3', date: subDays(new Date(), 19).toISOString(), type: 'Payment', amount: 150, method: 'Insurance', orderId: 'order_1' },
];
MOCK_CONTACTS_MUTABLE[0].auditLogs = [
    { id: 'log_1', timestamp: subDays(new Date(), 2).toISOString(), userId: 'user_admin_1', userName: 'Alice Admin', change: 'updated status to Active.' },
    { id: 'log_2', timestamp: subDays(new Date(), 15).toISOString(), userId: 'user_team_1', userName: 'Bob Practitioner', change: 'added a new interaction.' },
    { id: 'log_3', timestamp: subDays(new Date(), 45).toISOString(), userId: 'user_admin_1', userName: 'Alice Admin', change: 'created the contact.' },
];

// --- CALENDAR EVENTS ---
export let MOCK_CALENDAR_EVENTS: CalendarEvent[] = [
    { id: 'event_1', title: 'Follow-up with John P.', start: addDays(new Date(), 2), end: addDays(new Date(), 2), userIds: ['user_team_1'], contactId: 'contact_1' },
    { id: 'event_2', title: 'Team Meeting', start: addDays(new Date(), 1), end: addDays(new Date(), 1), userIds: ['user_admin_1', 'user_team_1'] },
    { id: 'event_3', title: 'Consultation: Jane Doe', start: subDays(new Date(), 3), end: subDays(new Date(), 3), userIds: ['user_admin_1'], contactId: 'contact_2' },
];

// --- TASKS ---
export let MOCK_TASKS: Task[] = [
    { id: 'task_1', organizationId: 'org_1', title: 'Prepare report for John Patient', dueDate: addDays(new Date(), 3).toISOString(), isCompleted: false, userId: 'user_team_1', contactId: 'contact_1' },
    { id: 'task_2', organizationId: 'org_1', title: 'Call back Peter Jones', dueDate: addDays(new Date(), 1).toISOString(), isCompleted: false, userId: 'user_team_1', contactId: 'contact_3' },
    { id: 'task_3', organizationId: 'org_1', title: 'Onboard new team member', dueDate: subDays(new Date(), 2).toISOString(), isCompleted: true, userId: 'user_admin_1' },
];

// --- DEALS ---
export let MOCK_DEAL_STAGES: DealStage[] = [
    { id: 'stage_1', organizationId: 'org_1', name: 'Prospecting', order: 1 },
    { id: 'stage_2', organizationId: 'org_1', name: 'Proposal Sent', order: 2 },
    { id: 'stage_3', organizationId: 'org_1', name: 'Negotiation', order: 3 },
    { id: 'stage_4', organizationId: 'org_1', name: 'Closed Won', order: 4 },
    { id: 'stage_5', organizationId: 'org_1', name: 'Closed Lost', order: 5 },
];

export let MOCK_DEALS: Deal[] = [
    { id: 'deal_1', organizationId: 'org_1', name: 'Corporate Wellness Program', value: 25000, stageId: 'stage_2', contactId: 'contact_2', expectedCloseDate: addDays(new Date(), 30).toISOString(), createdAt: subDays(new Date(), 15).toISOString(), assignedToId: 'user_admin_1' },
    { id: 'deal_2', organizationId: 'org_1', name: 'Family Health Plan', value: 5000, stageId: 'stage_4', contactId: 'contact_1', expectedCloseDate: subDays(new Date(), 10).toISOString(), createdAt: subDays(new Date(), 40).toISOString(), assignedToId: 'user_team_1' },
    { id: 'deal_3', organizationId: 'org_1', name: 'Small Business Package', value: 12000, stageId: 'stage_1', contactId: 'contact_3', expectedCloseDate: addDays(new Date(), 60).toISOString(), createdAt: subDays(new Date(), 2).toISOString(), assignedToId: 'user_team_1' },
];

// --- INVENTORY ---
export let MOCK_PRODUCTS: Product[] = [
    { id: 'prod_1', organizationId: 'org_1', name: 'Standard Consultation', sku: 'CONS-STD', category: 'Services', costPrice: 0, salePrice: 150, stockLevel: 9999 },
    { id: 'prod_2', organizationId: 'org_1', name: 'Aspirin (100mg)', sku: 'MED-ASP-100', category: 'Medication', costPrice: 5.50, salePrice: 12.99, stockLevel: 80 },
    { id: 'prod_3', organizationId: 'org_1', name: 'Band-Aids (Box of 50)', sku: 'SUP-BND-50', category: 'Supplies', costPrice: 2.10, salePrice: 5.99, stockLevel: 250 },
];
export let MOCK_SUPPLIERS: Supplier[] = [{ id: 'sup_1', organizationId: 'org_1', name: 'MedSupply Co.', contactPerson: 'Sarah Johnson', email: 'sarah@medsupply.com', phone: '555-SUP-PLY' }];
export let MOCK_WAREHOUSES: Warehouse[] = [{ id: 'wh_1', organizationId: 'org_1', name: 'Main Storage', location: '123 Warehouse Rd.' }];

// --- EMAIL TEMPLATES ---
export let MOCK_EMAIL_TEMPLATES: EmailTemplate[] = [
    { id: 'tmpl_welcome', organizationId: 'org_1', name: 'Welcome Email', subject: 'Welcome to VersaHealth!', body: 'Hi {{contactName}},\n\nWelcome! We are excited to have you.\n\nBest,\n{{userName}}' },
    { id: 'tmpl_reminder', organizationId: 'org_1', name: 'Appointment Reminder', subject: 'Reminder: Your appointment at {{organizationName}}', body: 'Hi {{contactName}},\n\nThis is a reminder for your upcoming appointment.\n\nThanks,\n{{organizationName}} Team' },
    { id: 'tmpl_deal_won', organizationId: 'org_1', name: 'Deal Won - Welcome Onboard', subject: 'Welcome Aboard, {{contactName}}!', body: 'Hi {{contactName}},\n\nWe are thrilled to officially welcome you as a client! We look forward to working with you on the {{dealName}} project.\n\nBest,\n{{userName}}' },
    { id: 'tmpl_followup', organizationId: 'org_1', name: 'Lead Follow-up', subject: 'Following up from VersaHealth', body: 'Hi {{contactName}},\n\nJust wanted to follow up and see if you had any questions. Let me know how I can help!\n\nBest,\n{{userName}}' },
];

// --- WORKFLOWS ---
export let MOCK_WORKFLOWS: Workflow[] = [
    {
        id: 'wf_audit', organizationId: 'org_1', name: 'Generate Audit Log on Status Change', isActive: true,
        trigger: { type: 'contactStatusChanged' },
        actions: [{ type: 'createAuditLogEntry' }]
    },
    {
        id: 'wf_task', organizationId: 'org_1', name: 'Create Task on Proposal Sent', isActive: true,
        trigger: { type: 'dealStageChanged', toStageId: 'stage_2' },
        actions: [{ type: 'createTask', taskTitle: 'Follow up on proposal for {{dealName}}' }]
    },
    {
        id: 'wf_email_won', organizationId: 'org_1', name: 'Send Welcome Email on Deal Won', isActive: true,
        trigger: { type: 'dealStageChanged', toStageId: 'stage_4' },
        actions: [{ type: 'sendEmail', emailTemplateId: 'tmpl_deal_won' }]
    },
    {
        id: 'wf_ticket_high', organizationId: 'org_1', name: 'Flag Contact for High Priority Ticket', isActive: true,
        trigger: { type: 'ticketCreated', priority: 'High' },
        actions: [{ type: 'updateContactField', fieldId: 'status', newValue: 'Needs Attention' }]
    }
];
export let MOCK_ADVANCED_WORKFLOWS: AdvancedWorkflow[] = [
    {
        id: 'awf_1', organizationId: 'org_1', name: 'High-Value Deal Follow-up', isActive: true,
        nodes: [
            { id: '1', type: 'trigger', position: { x: 250, y: 5 }, data: { label: 'Deal Stage Changes', nodeType: 'dealStageChanged' } },
            { id: '2', type: 'condition', position: { x: 250, y: 100 }, data: { label: 'If/Then', nodeType: 'ifCondition', condition: { field: 'deal.value', operator: 'gt', value: '7500' } } },
            { id: '3', type: 'action', position: { x: 450, y: 200 }, data: { label: 'Create High-Priority Task', nodeType: 'createTask', taskTitle: 'High-value deal: follow up with {{contactName}}' } },
            { id: '4', type: 'action', position: { x: 50, y: 200 }, data: { label: 'Create Standard Task', nodeType: 'createTask', taskTitle: 'Standard follow up for {{dealName}}' } },
        ],
        edges: [
            { id: 'e1-2', source: '1', target: '2' },
            { id: 'e2-3', source: '2', target: '3', sourceHandle: 'true' },
            { id: 'e2-4', source: '2', target: '4', sourceHandle: 'false' },
        ]
    }
];

// --- TICKETS ---
export let MOCK_TICKETS: Ticket[] = [
    { id: 'tkt_1', organizationId: 'org_1', contactId: 'contact_1', subject: 'Billing question', description: "I have a question about my last invoice.", status: 'Open', priority: 'Medium', createdAt: subDays(new Date(), 2).toISOString(), updatedAt: subDays(new Date(), 1).toISOString(), assignedToId: 'user_admin_1', replies: [
        { id: 'rep_1', userId: 'user_admin_1', userName: 'Alice Admin', message: 'Looking into this for you.', timestamp: subDays(new Date(), 1).toISOString(), isInternal: false }
    ]},
    { id: 'tkt_2', organizationId: 'org_1', contactId: 'contact_3', subject: 'Cannot log in to portal', description: "My password isn't working.", status: 'Closed', priority: 'High', createdAt: subDays(new Date(), 10).toISOString(), updatedAt: subDays(new Date(), 9).toISOString(), assignedToId: 'user_team_1', replies: [
         { id: 'rep_2', userId: 'user_team_1', userName: 'Bob Builder', message: 'Password has been reset and sent to your email.', timestamp: subDays(new Date(), 9).toISOString(), isInternal: false }
    ]},
];

// --- FORMS ---
export let MOCK_FORMS: PublicForm[] = [
    { id: 'form_1', organizationId: 'org_1', name: 'Contact Us Form', submissions: 12, fields: [
        { id: 'contactName', label: 'Full Name', type: 'text', required: true },
        { id: 'email', label: 'Email Address', type: 'text', required: true },
        { id: 'customFields.inquiry', label: 'Your Message', type: 'textarea', required: false },
    ], style: { buttonText: 'Send Message', buttonColor: '#3b82f6' }, actions: { successMessage: 'Thanks for reaching out!', enrollInCampaignId: 'camp_1' } }
];

// --- LANDING PAGES ---
export let MOCK_LANDING_PAGES: LandingPage[] = [
    {
        id: 'lp_1',
        organizationId: 'org_1',
        name: 'Request a Demo',
        slug: 'request-demo',
        status: 'Published',
        style: { backgroundColor: '#ffffff', textColor: '#1a202c' },
        content: [
            { id: 'c1', type: 'header', content: { title: 'See VersaCRM in Action', subtitle: 'Request a personalized demo from our team.' } },
            { id: 'c2', type: 'text', content: { text: 'Fill out the form below and one of our product specialists will get in touch to schedule a demo tailored to your business needs.' } },
            { id: 'c3', type: 'form', content: { formId: 'form_1' } },
        ]
    }
];

// --- CAMPAIGNS ---
export let MOCK_CAMPAIGNS: Campaign[] = [
    {
        id: 'camp_1', organizationId: 'org_1', name: 'Welcome New Leads', status: 'Draft',
        stats: { recipients: 0, sent: 0, opened: 0, clicked: 0 },
        targetAudience: { status: 'Lead', leadScore: { operator: 'eq', value: 0 } },
        nodes: [
            { id: '1', type: 'journeyTrigger', position: { x: 250, y: 25 }, data: { label: 'Target: New Leads' } },
            { id: '2', type: 'journeyAction', position: { x: 250, y: 125 }, data: { label: 'Send Welcome Email', nodeType: 'sendEmail', emailTemplateId: 'tmpl_welcome' } },
            { id: '3', type: 'journeyAction', position: { x: 250, y: 225 }, data: { label: 'Wait 3 Days', nodeType: 'wait', days: 3 } },
            { id: '4', type: 'journeyCondition', position: { x: 250, y: 325 }, data: { label: 'Email Opened?', nodeType: 'ifEmailOpened' } },
            { id: '5', type: 'journeyAction', position: { x: 450, y: 425 }, data: { label: 'Send Special Offer', nodeType: 'sendEmail', emailTemplateId: 'tmpl_deal_won' } },
            { id: '6', type: 'journeyAction', position: { x: 50, y: 425 }, data: { label: 'Send Follow-up', nodeType: 'sendEmail', emailTemplateId: 'tmpl_followup' } },
            { id: '7', type: 'journeyAction', position: { x: 450, y: 525 }, data: { label: 'Create Task', nodeType: 'createTask', taskTitle: 'Follow up on special offer for {{contactName}}' } },
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

// --- API KEYS ---
export let MOCK_API_KEYS: ApiKey[] = [];

// --- SETTINGS ---
export let MOCK_ORGANIZATION_SETTINGS: OrganizationSettings = {
    organizationId: 'org_1',
    ticketSla: {
        responseTime: { high: 1, medium: 4, low: 24 },
        resolutionTime: { high: 8, medium: 24, low: 72 },
    },
    leadScoringRules: [
        { id: 'rule_1', event: 'interaction', interactionType: 'Email', points: 5 },
        { id: 'rule_2', event: 'interaction', interactionType: 'Appointment', points: 20 },
        { id: 'rule_3', event: 'status_change', status: 'Active', points: 50 },
        { id: 'rule_4', event: 'status_change', status: 'Inactive', points: -30 },
    ],
    emailIntegration: { isConnected: false },
    voip: { isConnected: false },
    liveChat: {
        isEnabled: true,
        color: '#3b82f6',
        welcomeMessage: 'Welcome to VersaHealth! How can we help you today?',
        autoCreateContact: true,
        newContactStatus: 'Lead',
        autoCreateTicket: true,
        newTicketPriority: 'Medium',
    }
};