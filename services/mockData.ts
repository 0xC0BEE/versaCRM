import {
  User, Organization, AnyContact, Interaction, Order, Enrollment, Relationship, StructuredRecord, AuditLogEntry,
  Transaction, CalendarEvent, Task, Product, Supplier, Warehouse, Document, DealStage, Deal, EmailTemplate, Ticket,
  Campaign, Workflow, AdvancedWorkflow, OrganizationSettings, SLAPolicy
} from '../types';
import { subDays, addDays } from 'date-fns';

// --- USERS & ORGANIZATIONS ---
export let MOCK_ORGANIZATIONS: Organization[] = [
  { id: 'org_1', name: 'General Health Clinic', industry: 'Health', primaryContactEmail: 'admin@ghc.com', createdAt: '2023-01-15T09:00:00Z' },
  { id: 'org_2', name: 'WealthSpring Financial', industry: 'Finance', primaryContactEmail: 'contact@wealthspring.com', createdAt: '2023-02-20T10:00:00Z' },
];

export let MOCK_USERS: User[] = [
  { id: 'user_super_1', organizationId: 'org_1', name: 'Sam Superadmin', email: 'super@crm.com', role: 'Super Admin' },
  { id: 'user_admin_1', organizationId: 'org_1', name: 'Alice Admin', email: 'admin@crm.com', role: 'Organization Admin' },
  { id: 'user_team_1', organizationId: 'org_1', name: 'Bob Practitioner', email: 'team@crm.com', role: 'Team Member' },
  { id: 'user_client_1', organizationId: 'org_1', name: 'John Patient', email: 'client@crm.com', role: 'Client', contactId: 'contact_1' },
];

// --- CONTACTS & RELATED DATA ---
export let MOCK_CONTACTS_MUTABLE: AnyContact[] = [
  {
    id: 'contact_1',
    organizationId: 'org_1',
    contactName: 'John Patient',
    email: 'john.patient@example.com',
    phone: '555-0101',
    status: 'Active',
    leadSource: 'Referral',
    createdAt: subDays(new Date(), 45).toISOString(),
    assignedToId: 'user_team_1',
    avatar: 'https://i.pravatar.cc/150?u=contact_1',
    customFields: { patientId: 'P001', insuranceProvider: 'Blue Cross', dateOfBirth: '1985-05-20' },
    interactions: [],
    orders: [],
    enrollments: [],
    relationships: [],
    structuredRecords: [],
    auditLogs: [],
    transactions: [],
    documents: []
  },
  {
    id: 'contact_2',
    organizationId: 'org_1',
    contactName: 'Jane Doe',
    email: 'jane.doe@example.com',
    phone: '555-0102',
    status: 'Lead',
    leadSource: 'Web',
    createdAt: subDays(new Date(), 10).toISOString(),
    assignedToId: 'user_admin_1',
    avatar: 'https://i.pravatar.cc/150?u=contact_2',
    customFields: { patientId: 'P002', insuranceProvider: 'Aetna', dateOfBirth: '1992-11-12' },
    interactions: [],
    orders: [],
    enrollments: [],
    relationships: [],
    structuredRecords: [],
    auditLogs: [],
    transactions: [],
    documents: []
  },
];

// Populate related data for contacts
MOCK_CONTACTS_MUTABLE[0].interactions = [
  { id: 'int_1', organizationId: 'org_1', contactId: 'contact_1', userId: 'user_team_1', type: 'Appointment', date: subDays(new Date(), 30).toISOString(), notes: 'Initial consultation. Discussed treatment plan.' },
  { id: 'int_2', organizationId: 'org_1', contactId: 'contact_1', userId: 'user_team_1', type: 'Call', date: subDays(new Date(), 15).toISOString(), notes: 'Follow-up call. Patient reported feeling better.' },
  { id: 'int_3', organizationId: 'org_1', contactId: 'contact_1', userId: 'user_admin_1', type: 'Email', date: subDays(new Date(), 5).toISOString(), notes: 'Sent appointment reminder for next week.' },
];
MOCK_CONTACTS_MUTABLE[0].orders = [
  { id: 'order_1', organizationId: 'org_1', contactId: 'contact_1', orderDate: subDays(new Date(), 28).toISOString(), status: 'Completed', lineItems: [{ productId: 'prod_1', description: 'Vitamin D Supplements', quantity: 1, unitPrice: 25.00 }], total: 25.00 },
];
MOCK_CONTACTS_MUTABLE[0].transactions = [
  { id: 'trans_1', date: subDays(new Date(), 28).toISOString(), type: 'Charge', amount: 25.00, method: 'Credit Card', orderId: 'order_1' },
  { id: 'trans_2', date: subDays(new Date(), 28).toISOString(), type: 'Payment', amount: 25.00, method: 'Credit Card', orderId: 'order_1' },
];
MOCK_CONTACTS_MUTABLE[0].documents = [
    { id: 'doc_1', organizationId: 'org_1', contactId: 'contact_1', fileName: 'intake_form.pdf', fileType: 'application/pdf', uploadDate: subDays(new Date(), 40).toISOString(), dataUrl: '...' },
];
MOCK_CONTACTS_MUTABLE[0].structuredRecords = [
    { id: 'sr_1', type: 'soap_note', title: 'Initial SOAP Note', recordDate: subDays(new Date(), 30).toISOString(), fields: { subjective: 'Patient reports mild back pain.', objective: '...', assessment: '...', plan: '...' } }
];
MOCK_CONTACTS_MUTABLE[0].auditLogs = [
    { id: 'log_1', timestamp: subDays(new Date(), 2).toISOString(), userId: 'user_admin_1', userName: 'Alice Admin', change: 'updated status to Active.' },
    { id: 'log_2', timestamp: subDays(new Date(), 15).toISOString(), userId: 'user_team_1', userName: 'Bob Practitioner', change: 'added a new interaction.' },
    { id: 'log_3', timestamp: subDays(new Date(), 45).toISOString(), userId: 'user_admin_1', userName: 'Alice Admin', change: 'created the contact.' },
];

// --- INVENTORY ---
export let MOCK_PRODUCTS: Product[] = [
  { id: 'prod_1', organizationId: 'org_1', name: 'Vitamin D Supplements', sku: 'VD-1000', category: 'Supplements', costPrice: 10.00, salePrice: 25.00, stockLevel: 500 },
  { id: 'prod_2', organizationId: 'org_1', name: 'Standard Blood Test', sku: 'LAB-BLD-01', category: 'Lab Services', costPrice: 50.00, salePrice: 150.00, stockLevel: 9999 },
  { id: 'prod_3', organizationId: 'org_1', name: 'Low Stock Item', sku: 'LOW-01', category: 'Supplements', costPrice: 5.00, salePrice: 15.00, stockLevel: 50 },
];

export let MOCK_SUPPLIERS: Supplier[] = [
    { id: 'sup_1', organizationId: 'org_1', name: 'Wellness Supplies Inc.', contactPerson: 'John Smith', email: 'sales@wellness.com', phone: '555-SUPPLY' }
];

export let MOCK_WAREHOUSES: Warehouse[] = [
    { id: 'wh_1', organizationId: 'org_1', name: 'Main Clinic Storage', location: '123 Health St.' }
];

// --- TASKS & CALENDAR ---
export let MOCK_TASKS: Task[] = [
  { id: 'task_1', organizationId: 'org_1', title: 'Follow up with Jane Doe', dueDate: addDays(new Date(), 2).toISOString(), isCompleted: false, userId: 'user_admin_1', contactId: 'contact_2' },
  { id: 'task_2', organizationId: 'org_1', title: 'Review John Patient\'s lab results', dueDate: subDays(new Date(), 1).toISOString(), isCompleted: false, userId: 'user_team_1', contactId: 'contact_1' },
  { id: 'task_3', organizationId: 'org_1', title: 'Order more Vitamin D', dueDate: subDays(new Date(), 5).toISOString(), isCompleted: true, userId: 'user_admin_1' },
];

export let MOCK_CALENDAR_EVENTS: CalendarEvent[] = [
  { id: 'event_1', title: 'Follow-up: John Patient', start: addDays(new Date(), 7), end: addDays(new Date(), 7), userIds: ['user_team_1'], contactId: 'contact_1' },
];

// --- DEALS ---
export let MOCK_DEAL_STAGES: DealStage[] = [
  { id: 'stage_1', organizationId: 'org_1', name: 'Lead', order: 1 },
  { id: 'stage_2', organizationId: 'org_1', name: 'Contact Made', order: 2 },
  { id: 'stage_3', organizationId: 'org_1', name: 'Needs Analysis', order: 3 },
  { id: 'stage_4', organizationId: 'org_1', name: 'Proposal Sent', order: 4 },
  { id: 'stage_5', organizationId: 'org_1', name: 'Closed Won', order: 5 },
  { id: 'stage_6', organizationId: 'org_1', name: 'Closed Lost', order: 6 },
];

export let MOCK_DEALS: Deal[] = [
  { id: 'deal_1', organizationId: 'org_1', name: 'Corporate Wellness Program', value: 10000, stageId: 'stage_3', contactId: 'contact_2', expectedCloseDate: addDays(new Date(), 30).toISOString(), createdAt: subDays(new Date(), 5).toISOString(), assignedToId: 'user_admin_1' },
  { id: 'deal_2', organizationId: 'org_1', name: 'Family Health Plan', value: 5000, stageId: 'stage_1', contactId: 'contact_1', expectedCloseDate: addDays(new Date(), 60).toISOString(), createdAt: subDays(new Date(), 1).toISOString(), assignedToId: 'user_team_1' },
];

// --- TICKETS ---
export let MOCK_TICKETS: Ticket[] = [
  { id: 'ticket_1', organizationId: 'org_1', contactId: 'contact_1', subject: 'Billing question', description: 'I have a question about my last invoice.', status: 'Open', priority: 'Medium', createdAt: subDays(new Date(), 2).toISOString(), updatedAt: subDays(new Date(), 1).toISOString(), assignedToId: 'user_admin_1', replies: [
      { id: 'reply_1', userId: 'user_admin_1', userName: 'Alice Admin', timestamp: subDays(new Date(), 1).toISOString(), message: 'Hi John, I\'m looking into this for you.', isInternal: false }
  ]},
  { id: 'ticket_2', organizationId: 'org_1', contactId: 'contact_2', subject: 'Cannot log in to portal', description: 'My password is not working.', status: 'New', priority: 'High', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), assignedToId: 'user_admin_1', replies: []},
];

// --- SETTINGS ---
export let MOCK_EMAIL_TEMPLATES: EmailTemplate[] = [
    { id: 'et_1', organizationId: 'org_1', name: 'Welcome Email', subject: 'Welcome to General Health Clinic!', body: 'Hi {{contactName}},\n\nWelcome! We\'re glad to have you with us.\n\nThanks,\n{{userName}}' },
    { id: 'et_2', organizationId: 'org_1', name: 'Deal Won - Welcome Onboard', subject: 'Welcome to the family, {{contactName}}!', body: 'Hi {{contactName}},\n\nWe are thrilled that your deal "{{dealName}}" has been successfully closed. Welcome aboard!\n\nWe look forward to a great partnership.\n\nBest,\n{{userName}}' },
];

export let MOCK_ORGANIZATION_SETTINGS: OrganizationSettings = {
    id: 'settings_1',
    organizationId: 'org_1',
    ticketSla: {
        responseTime: { high: 1, medium: 4, low: 24 },
        resolutionTime: { high: 8, medium: 24, low: 72 },
    }
};

// --- MARKETING & WORKFLOWS ---
export let MOCK_CAMPAIGNS: Campaign[] = [];
export let MOCK_WORKFLOWS: Workflow[] = [
    {
        id: 'wf_audit_log_1',
        organizationId: 'org_1',
        name: 'Generate Audit Log on Status Change',
        isActive: true,
        trigger: { type: 'contactStatusChanged' },
        actions: [{ type: 'createAuditLogEntry' }],
    },
    {
        id: 'wf_deal_task_1',
        organizationId: 'org_1',
        name: 'Create Task on Proposal Sent',
        isActive: true,
        trigger: {
            type: 'dealStageChanged',
            toStageId: 'stage_4' // Proposal Sent
        },
        actions: [{
            type: 'createTask',
            taskTitle: 'Follow up on proposal for {{dealName}}',
            // No assigneeId here, so it will default to the deal owner
        }],
    },
    {
        id: 'wf_deal_won_email_1',
        organizationId: 'org_1',
        name: 'Send Welcome Email on Deal Won',
        isActive: true,
        trigger: {
            type: 'dealStageChanged',
            toStageId: 'stage_5' // Closed Won
        },
        actions: [{
            type: 'sendEmail',
            emailTemplateId: 'et_2'
        }],
    },
    {
        id: 'wf_ticket_status_1',
        organizationId: 'org_1',
        name: 'Flag Contact for High Priority Ticket',
        isActive: true,
        trigger: {
            type: 'ticketCreated',
            priority: 'High'
        },
        actions: [{
            type: 'updateContactField',
            fieldId: 'status',
            newValue: 'Needs Attention'
        }],
    }
];
export let MOCK_ADVANCED_WORKFLOWS: AdvancedWorkflow[] = [
    {
        id: 'awf_1',
        organizationId: 'org_1',
        name: 'High-Value Deal Follow-up',
        isActive: true,
        nodes: [
            { id: '1', type: 'trigger', position: { x: 250, y: 5 }, data: { label: 'Deal Stage Changes', nodeType: 'dealStageChanged' } },
            { id: '2', type: 'condition', position: { x: 250, y: 125 }, data: { label: 'If/Then Condition', nodeType: 'ifCondition', condition: { field: 'deal.value', operator: 'greater_than', value: '7500' } } },
            { id: '3', type: 'action', position: { x: 400, y: 250 }, data: { label: 'Create a Task', nodeType: 'createTask', taskTitle: 'High-value deal: Schedule onboarding call for {{dealName}}' } },
            { id: '4', type: 'action', position: { x: 100, y: 250 }, data: { label: 'Create a Task', nodeType: 'createTask', taskTitle: 'Standard deal: Follow up with {{contactName}} re: {{dealName}}' } },
        ],
        edges: [
            { id: 'e1-2', source: '1', target: '2' },
            { id: 'e2-3', source: '2', target: '3', sourceHandle: 'true' },
            { id: 'e2-4', source: '2', target: '4', sourceHandle: 'false' },
        ],
    },
    {
        id: 'awf_2',
        organizationId: 'org_1',
        name: 'Nurture New Leads',
        isActive: true,
        nodes: [
            { id: '1', type: 'trigger', position: { x: 250, y: 5 }, data: { label: 'Contact is Created', nodeType: 'contactCreated' } },
            { id: '2', type: 'action', position: { x: 250, y: 125 }, data: { label: 'Send Email', nodeType: 'sendEmail', emailTemplateId: 'et_1' } },
        ],
        edges: [
            { id: 'e1-2', source: '1', target: '2' },
        ],
    }
];
export let MOCK_DASHBOARD_WIDGETS: any[] = [];
export let MOCK_CUSTOM_REPORTS: any[] = [];