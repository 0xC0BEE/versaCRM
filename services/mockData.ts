import { Industry, Organization, User, CustomRole, AnyContact, Interaction, Order, Enrollment, StructuredRecord, Deal, DealStage, Task, CalendarEvent, EmailTemplate, Workflow, AdvancedWorkflow, Product, Supplier, Warehouse, OrganizationSettings, ApiKey, Ticket, PublicForm, Campaign, Document, LandingPage, CustomReport, DashboardWidget, AuditLogEntry } from '../types';
// FIX: Changed date-fns imports to use subpaths to resolve module export errors.
import subDays from 'date-fns/subDays';
import addDays from 'date-fns/addDays';
import subMonths from 'date-fns/subMonths';

// --- ORGANIZATIONS ---
export let MOCK_ORGANIZATIONS: Organization[] = [
    { id: 'org_1', name: 'General Health Clinic', industry: 'Health', primaryContactEmail: 'contact@health.com', createdAt: subDays(new Date(), 150).toISOString() },
    { id: 'org_2', name: 'WealthSpring Financial', industry: 'Finance', primaryContactEmail: 'info@wealthspring.com', createdAt: subDays(new Date(), 300).toISOString() },
];

// --- ROLES ---
export let MOCK_ROLES: CustomRole[] = [
    {
        id: 'role_super', organizationId: '*', name: 'Super Admin', description: 'Has access to all organizations and settings.', isSystemRole: true,
        permissions: { 'settings:access': true, 'settings:manage:api': true, 'settings:manage:roles': true, 'settings:manage:team': true, 'contacts:read:all': true, 'contacts:read:own': true, 'contacts:create': true, 'contacts:edit': true, 'contacts:delete': true, 'deals:read': true, 'deals:create': true, 'deals:edit': true, 'deals:delete': true, 'tickets:read': true, 'tickets:create': true, 'tickets:edit': true, 'automations:manage': true, 'reports:read': true, 'reports:manage': true, 'inventory:read': true, 'inventory:manage': true, 'voip:use': true }
    },
    {
        id: 'role_admin_1', organizationId: 'org_1', name: 'Organization Admin', description: 'Manages users, settings, and billing for their organization.', isSystemRole: true,
        permissions: { 'settings:access': true, 'settings:manage:team': true, 'settings:manage:roles': true, 'contacts:read:all': true, 'contacts:edit': true, 'contacts:create': true, 'contacts:delete': true, 'deals:read': true, 'deals:create': true, 'deals:edit': true, 'tickets:read': true, 'tickets:create': true, 'tickets:edit': true, 'voip:use': true, 'automations:manage': true, 'inventory:read': true, 'reports:read': true, 'reports:manage': true, 'settings:manage:api': true }
    },
    {
        id: 'role_member_1', organizationId: 'org_1', name: 'Team Member', description: 'Standard user with access to assigned contacts and deals.', isSystemRole: true,
        permissions: { 'contacts:read:own': true, 'contacts:edit': true, 'deals:read': true, 'tickets:read': true, 'reports:read': true, 'voip:use': true }
    },
    {
        id: 'role_client_1', organizationId: 'org_1', name: 'Client', description: 'Access to the client portal.', isSystemRole: true,
        permissions: {}
    },
];

// --- USERS ---
export let MOCK_USERS: User[] = [
    { id: 'user_super', organizationId: '*', name: 'Super Admin', email: 'super@crm.com', role: 'Super Admin', roleId: 'role_super', isClient: false },
    { id: 'user_admin_1', organizationId: 'org_1', name: 'Alice Admin', email: 'admin@crm.com', role: 'Organization Admin', roleId: 'role_admin_1', isClient: false },
    { id: 'user_member_1', organizationId: 'org_1', name: 'Bob Team', email: 'team@crm.com', role: 'Team Member', roleId: 'role_member_1', isClient: false },
    { id: 'user_client_1', organizationId: 'org_1', name: 'John Patient', email: 'client@crm.com', role: 'Client', roleId: 'role_client_1', isClient: true, contactId: 'contact_1' },
];

// --- INTERACTIONS ---
export let MOCK_INTERACTIONS: Interaction[] = [
    { id: 'int_1', organizationId: 'org_1', contactId: 'contact_1', userId: 'user_member_1', type: 'Appointment', date: subDays(new Date(), 10).toISOString(), notes: 'Initial consultation. Discussed treatment plan.' },
    { id: 'int_2', organizationId: 'org_1', contactId: 'contact_1', userId: 'user_admin_1', type: 'Email', date: subDays(new Date(), 5).toISOString(), notes: 'Subject: Welcome to our clinic!\n\nHi John, welcome! Your appointment is confirmed for...' },
    { id: 'int_3', organizationId: 'org_1', contactId: 'contact_2', userId: 'user_member_1', type: 'Call', date: subDays(new Date(), 2).toISOString(), notes: 'Follow-up call. Patient is responding well to treatment.' },
];

const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
    { id: 'log_1', timestamp: subDays(new Date(), 2).toISOString(), userId: 'user_admin_1', userName: 'Alice Admin', change: 'updated status to Active.'},
    { id: 'log_2', timestamp: subDays(new Date(), 15).toISOString(), userId: 'user_member_1', userName: 'Bob Practitioner', change: 'added a new interaction.'},
    { id: 'log_3', timestamp: subDays(new Date(), 45).toISOString(), userId: 'user_admin_1', userName: 'Alice Admin', change: 'created the contact.'},
];

// --- CONTACTS ---
export let MOCK_CONTACTS_MUTABLE: AnyContact[] = [
    {
        id: 'contact_1', organizationId: 'org_1', contactName: 'John Patient', email: 'john.patient@example.com', phone: '555-0101', status: 'Active', leadSource: 'Web Form', createdAt: subDays(new Date(), 45).toISOString(), assignedToId: 'user_member_1',
        customFields: { patientId: 'P12345', insuranceProvider: 'MediCare', dateOfBirth: '1985-05-20' },
        avatar: 'https://i.pravatar.cc/100?u=contact_1',
        interactions: [ MOCK_INTERACTIONS[0], MOCK_INTERACTIONS[1] ],
        auditLogs: MOCK_AUDIT_LOGS,
        leadScore: 25,
        campaignEnrollments: [],
    },
    {
        id: 'contact_2', organizationId: 'org_1', contactName: 'Jane Doe', email: 'jane.doe@example.com', phone: '555-0102', status: 'Lead', leadSource: 'Referral', createdAt: subDays(new Date(), 5).toISOString(), assignedToId: 'user_admin_1',
        customFields: { patientId: 'P12346', insuranceProvider: 'BlueCross', dateOfBirth: '1992-11-12' },
        avatar: 'https://i.pravatar.cc/100?u=contact_2',
        interactions: [ MOCK_INTERACTIONS[2] ],
        leadScore: 0,
        campaignEnrollments: [],
    },
    {
        id: 'contact_3', organizationId: 'org_1', contactName: 'Peter Jones', email: 'peter.jones@example.com', phone: '555-0103', status: 'Lead', leadSource: 'Manual', createdAt: subDays(new Date(), 90).toISOString(),
        customFields: { patientId: 'P12347' },
        avatar: 'https://i.pravatar.cc/100?u=contact_3',
        leadScore: 0,
        campaignEnrollments: [],
    }
];

// --- DEALS ---
export let MOCK_DEAL_STAGES: DealStage[] = [
    { id: 'stage_1', organizationId: 'org_1', name: 'Qualification', order: 1 },
    { id: 'stage_2', organizationId: 'org_1', name: 'Needs Analysis', order: 2 },
    { id: 'stage_3', organizationId: 'org_1', name: 'Proposal Sent', order: 3 },
    { id: 'stage_4', organizationId: 'org_1', name: 'Negotiation', order: 4 },
    { id: 'stage_5', organizationId: 'org_1', name: 'Closed Won', order: 5 },
    { id: 'stage_6', organizationId: 'org_1', name: 'Closed Lost', order: 6 },
];
export let MOCK_DEALS: Deal[] = [
    // FIX: Corrected calls to addDays to fix "not callable" error.
    { id: 'deal_1', organizationId: 'org_1', name: 'Ortho Treatment Plan', value: 5000, stageId: 'stage_3', contactId: 'contact_1', expectedCloseDate: addDays(new Date(), 15).toISOString(), createdAt: subDays(new Date(), 20).toISOString(), assignedToId: 'user_member_1' },
    { id: 'deal_2', organizationId: 'org_1', name: 'Wellness Package', value: 8000, stageId: 'stage_1', contactId: 'contact_2', expectedCloseDate: addDays(new Date(), 30).toISOString(), createdAt: subDays(new Date(), 2).toISOString(), assignedToId: 'user_admin_1' },
];

// --- TASKS ---
export let MOCK_TASKS: Task[] = [
    // FIX: Corrected calls to addDays to fix "not callable" error.
    { id: 'task_1', organizationId: 'org_1', title: 'Follow up with John Patient re: intake forms', dueDate: addDays(new Date(), 2).toISOString(), isCompleted: false, userId: 'user_member_1', contactId: 'contact_1' },
    { id: 'task_2', organizationId: 'org_1', title: 'Prepare proposal for Jane Doe', dueDate: addDays(new Date(), 5).toISOString(), isCompleted: false, userId: 'user_admin_1', contactId: 'contact_2' },
    { id: 'task_3', organizationId: 'org_1', title: 'Send welcome packet to John Patient', dueDate: subDays(new Date(), 3).toISOString(), isCompleted: true, userId: 'user_member_1', contactId: 'contact_1' },
];

// --- CALENDAR ---
export let MOCK_CALENDAR_EVENTS: CalendarEvent[] = [
    // FIX: Corrected calls to addDays to fix "not callable" error.
    { id: 'event_1', title: 'Follow-up with John Patient', start: addDays(new Date(), 3), end: addDays(new Date(), 3), userIds: ['user_member_1'], contactId: 'contact_1' },
];

// --- EMAIL TEMPLATES ---
export let MOCK_EMAIL_TEMPLATES: EmailTemplate[] = [
    { id: 'et_1', organizationId: 'org_1', name: 'Welcome Email', subject: 'Welcome to {{organizationName}}!', body: 'Hi {{contactName}},\n\nWe are so glad to have you with us.\n\nBest,\n{{userName}}' },
    { id: 'et_2', organizationId: 'org_1', name: 'Deal Won - Welcome Onboard', subject: 'Welcome Aboard, {{contactName}}!', body: 'Hi {{contactName}},\n\nWe are thrilled to begin working with you on the {{dealName}} project. \n\nBest,\n{{userName}}' },
    { id: 'et_3', organizationId: 'org_1', name: 'Lead Follow-up', subject: 'Following up', body: 'Hi {{contactName}},\n\nJust wanted to follow up and see if you had any questions.\n\nBest,\n{{userName}}' },
];

// --- WORKFLOWS ---
export let MOCK_WORKFLOWS: Workflow[] = [
    { id: 'wf_1', organizationId: 'org_1', name: 'Generate Audit Log on Status Change', isActive: true, trigger: { type: 'contactStatusChanged' }, actions: [{ type: 'createAuditLogEntry' }] },
    { id: 'wf_2', organizationId: 'org_1', name: 'Create Task on Proposal Sent', isActive: true, trigger: { type: 'dealStageChanged', toStageId: 'stage_3' }, actions: [{ type: 'createTask', taskTitle: 'Follow up on proposal for {{dealName}}'}] },
    { id: 'wf_3', organizationId: 'org_1', name: 'Flag Contact for High Priority Ticket', isActive: true, trigger: { type: 'ticketCreated', priority: 'High' }, actions: [{ type: 'updateContactField', fieldId: 'status', newValue: 'Needs Attention' }] },
    { id: 'wf_4', organizationId: 'org_1', name: 'Send Welcome Email on Deal Won', isActive: true, trigger: { type: 'dealStageChanged', toStageId: 'stage_5' }, actions: [{ type: 'sendEmail', emailTemplateId: 'et_2' }] },
];
export let MOCK_ADVANCED_WORKFLOWS: AdvancedWorkflow[] = [
    {
        id: 'adv_wf_1', organizationId: 'org_1', name: 'High-Value Deal Follow-up', isActive: true,
        nodes: [
            { id: '1', type: 'trigger', position: { x: 250, y: 25 }, data: { label: 'Deal Stage Changes', nodeType: 'dealStageChanged' } },
            { id: '2', type: 'condition', position: { x: 250, y: 125 }, data: { label: 'If Deal Value > $7,500', nodeType: 'ifCondition', condition: { field: 'deal.value', operator: 'gt', value: '7500' } } },
            { id: '3', type: 'action', position: { x: 450, y: 225 }, data: { label: 'Create High-Priority Task', nodeType: 'createTask', taskTitle: 'High-Value: Follow up on {{dealName}}' } },
            { id: '4', type: 'action', position: { x: 150, y: 225 }, data: { label: 'Create Standard Task', nodeType: 'createTask', taskTitle: 'Follow up on {{dealName}}' } }
        ],
        edges: [
            { id: 'e1-2', source: '1', target: '2' },
            { id: 'e2-3', source: '2', target: '3', sourceHandle: 'true' }, // True path
            { id: 'e2-4', source: '2', target: '4', sourceHandle: 'false' }, // False path
        ]
    },
    {
        id: 'adv_wf_2', organizationId: 'org_1', name: 'Nurture New Leads', isActive: true,
        nodes: [
            { id: '1', type: 'trigger', position: { x: 250, y: 25 }, data: { label: 'Contact is Created', nodeType: 'contactCreated' } },
            { id: '2', type: 'action', position: { x: 250, y: 125 }, data: { label: 'Send Welcome Email', nodeType: 'sendEmail', emailTemplateId: 'et_1' } }
        ],
        edges: [{ id: 'e1-2', source: '1', target: '2' }]
    }
];

// --- INVENTORY ---
export let MOCK_PRODUCTS: Product[] = [
    { id: 'prod_1', organizationId: 'org_1', name: 'Standard Consultation', sku: 'CONS-01', category: 'Services', costPrice: 0, salePrice: 150, stockLevel: 9999 },
    { id: 'prod_2', organizationId: 'org_1', name: 'Advanced Screening', sku: 'SCRN-01', category: 'Services', costPrice: 50, salePrice: 350, stockLevel: 9999 },
    { id: 'prod_3', organizationId: 'org_1', name: 'Pain Reliever (Bottle)', sku: 'MED-01', category: 'Medication', costPrice: 5, salePrice: 15, stockLevel: 250 },
    { id: 'prod_4', organizationId: 'org_1', name: 'First Aid Kit', sku: 'KIT-01', category: 'Equipment', costPrice: 20, salePrice: 45, stockLevel: 85 },
];
export let MOCK_SUPPLIERS: Supplier[] = [
    { id: 'sup_1', organizationId: 'org_1', name: 'MedSupply Co.', contactPerson: 'Sarah Johnson', email: 'sarah@medsupply.com', phone: '555- SUPPLY' }
];
export let MOCK_WAREHOUSES: Warehouse[] = [
    { id: 'wh_1', organizationId: 'org_1', name: 'Main Pharmacy Storage', location: 'Basement Level' }
];

// --- SETTINGS ---
export let MOCK_ORGANIZATION_SETTINGS: OrganizationSettings = {
    organizationId: 'org_1',
    ticketSla: {
        responseTime: { high: 1, medium: 4, low: 24 },
        resolutionTime: { high: 8, medium: 24, low: 72 }
    },
    leadScoringRules: [
        { id: 'rule_1', event: 'interaction', interactionType: 'Appointment', points: 10 },
        { id: 'rule_2', event: 'status_change', status: 'Active', points: 15 },
        { id: 'rule_3', event: 'status_change', status: 'Do Not Contact', points: -100 },
    ],
    emailIntegration: { isConnected: false },
    voip: { isConnected: false },
    liveChat: { isEnabled: true, color: '#3b82f6', welcomeMessage: 'Welcome to our clinic! How can we help?', autoCreateContact: true, newContactStatus: 'Lead', autoCreateTicket: true, newTicketPriority: 'Medium' }
};

// --- API KEYS ---
export let MOCK_API_KEYS: ApiKey[] = [];

// --- TICKETS ---
export let MOCK_TICKETS: Ticket[] = [
    { id: 'tkt_1', organizationId: 'org_1', contactId: 'contact_1', subject: 'Question about billing', description: 'I have a question about my recent invoice.', status: 'Open', priority: 'Medium', createdAt: subDays(new Date(), 3).toISOString(), updatedAt: subDays(new Date(), 1).toISOString(), assignedToId: 'user_admin_1', replies: []},
    { id: 'tkt_2', organizationId: 'org_1', contactId: 'contact_3', subject: 'Urgent: Cannot access my records', description: 'My login is not working, I need access to my test results immediately.', status: 'New', priority: 'High', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), replies: []},
];

// --- FORMS & CAMPAIGNS & LANDING PAGES ---
export let MOCK_FORMS: PublicForm[] = [
    { id: 'form_1', organizationId: 'org_1', name: 'Contact Us Form', submissions: 0, fields: [{ id: 'contactName', label: 'Full Name', type: 'text', required: true}, {id: 'email', label: 'Email', type: 'text', required: true}], style: { buttonText: 'Submit', buttonColor: '#3b82f6'}, actions: { successMessage: 'Thanks for reaching out!', enrollInCampaignId: 'camp_1' }}
];
export let MOCK_LANDING_PAGES: LandingPage[] = [
    { id: 'lp_1', organizationId: 'org_1', name: 'Request a Demo', slug: 'demo-request', status: 'Published', content: [{ id: 'comp_1', type: 'header', content: { title: 'See VersaCRM in Action', subtitle: 'Request a personalized demo today.'}}, { id: 'comp_2', type: 'form', content: { formId: 'form_1'}}], style: { backgroundColor: '#f1f5f9', textColor: '#1e293b'}}
];
export let MOCK_CAMPAIGNS: Campaign[] = [
    {
        id: 'camp_1', organizationId: 'org_1', name: 'Welcome New Leads', status: 'Draft',
        stats: { recipients: 0, sent: 0, opened: 0, clicked: 0 },
        targetAudience: { status: 'Lead', leadScore: { operator: 'eq', value: 0 } },
        nodes: [
            { id: '1', type: 'journeyTrigger', position: { x: 250, y: 25 }, data: { label: 'Target Audience' } },
            { id: '2', type: 'journeyAction', position: { x: 250, y: 125 }, data: { label: 'Send Welcome Email', nodeType: 'sendEmail', emailTemplateId: 'et_1' } },
            { id: '3', type: 'journeyAction', position: { x: 250, y: 225 }, data: { label: 'Wait 3 Days', nodeType: 'wait', days: 3 } },
            { id: '4', type: 'journeyCondition', position: { x: 250, y: 325 }, data: { label: 'If Opened Welcome Email?', nodeType: 'ifEmailOpened' } },
            { id: '5', type: 'journeyAction', position: { x: 450, y: 425 }, data: { label: 'Send Special Offer', nodeType: 'sendEmail', emailTemplateId: 'et_3' } },
            { id: '6', type: 'journeyAction', position: { x: 150, y: 425 }, data: { label: 'Send Follow-up', nodeType: 'sendEmail', emailTemplateId: 'et_3' } },
            { id: '7', type: 'journeyAction', position: { x: 450, y: 525 }, data: { label: 'Create Task for Sales', nodeType: 'createTask', taskTitle: 'Follow up with engaged lead: {{contactName}}' } },
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

// --- DOCUMENTS ---
export let MOCK_DOCUMENTS: Document[] = [];

// --- REPORTS & WIDGETS ---
export let MOCK_CUSTOM_REPORTS: CustomReport[] = [
    {
        id: 'cr_1', organizationId: 'org_1', name: 'Deals by Stage',
        config: {
            dataSource: 'deals',
            columns: ['name', 'value', 'stageId'],
            filters: [],
            visualization: { type: 'bar', groupByKey: 'stageId', metric: { type: 'count' } }
        }
    }
];
export let MOCK_DASHBOARD_WIDGETS: DashboardWidget[] = [];

// --- EXTERNAL SIMULATIONS ---
export const MOCK_EXTERNAL_EMAILS = [
    { from: 'john.patient@example.com', to: 'admin@crm.com', subject: 'Re: Welcome!', body: 'Thanks for the welcome email!', date: subDays(new Date(), 4).toISOString()},
];