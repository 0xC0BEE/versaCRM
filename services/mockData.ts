// services/mockData.ts
import {
  User, Organization, AnyContact, Product, Supplier, Warehouse, CalendarEvent, Task, EmailTemplate, Workflow,
  Campaign, Ticket, CustomReport, SLAPolicy, DashboardWidget, Deal, DealStage, AdvancedWorkflow, Notification
} from '../types';
import { subDays, addDays, formatISO } from 'date-fns';

// --- USERS ---
export let MOCK_USERS: User[] = [
  { id: 'user_super_1', name: 'Sam Superadmin', email: 'super@crm.com', role: 'Super Admin' },
  { id: 'user_admin_1', name: 'Alice Admin', email: 'admin@crm.com', role: 'Organization Admin', organizationId: 'org_1' },
  { id: 'user_team_1', name: 'Bob Team', email: 'team@crm.com', role: 'Team Member', organizationId: 'org_1' },
  { id: 'user_client_1', name: 'Charlie Client', email: 'client@crm.com', role: 'Client', organizationId: 'org_1', contactId: 'contact_1' },
  { id: 'user_team_2', name: 'Diana Desk', email: 'diana@crm.com', role: 'Team Member', organizationId: 'org_1' },
];

// --- ORGANIZATIONS ---
export let MOCK_ORGANIZATIONS: Organization[] = [
  { id: 'org_1', name: 'Wellness Clinic', industry: 'Health', primaryContactEmail: 'contact@wellness.com', createdAt: subDays(new Date(), 90).toISOString() },
  { id: 'org_2', name: 'Capital Investments', industry: 'Finance', primaryContactEmail: 'info@capital.com', createdAt: subDays(new Date(), 180).toISOString() },
];

// --- CONTACTS ---
export let MOCK_CONTACTS: AnyContact[] = [
  {
    id: 'contact_1', organizationId: 'org_1', contactName: 'John Patient', email: 'john.p@example.com', phone: '555-0101',
    status: 'Active', leadSource: 'Web', createdAt: subDays(new Date(), 45).toISOString(), avatar: 'https://i.pravatar.cc/150?u=contact_1',
    customFields: { patientId: 'P12345', dateOfBirth: '1985-05-20' },
    interactions: [
      { id: 'int_1', contactId: 'contact_1', organizationId: 'org_1', userId: 'user_admin_1', type: 'Appointment', date: subDays(new Date(), 32).toISOString(), notes: 'Annual check-up scheduled.' },
      { id: 'int_2', contactId: 'contact_1', organizationId: 'org_1', userId: 'user_team_1', type: 'Call', date: subDays(new Date(), 10).toISOString(), notes: 'Follow-up call regarding test results.' },
    ],
    orders: [
      { id: 'ord_1', contactId: 'contact_1', organizationId: 'org_1', orderDate: subDays(new Date(), 10).toISOString(), status: 'Completed', total: 75.50, lineItems: [{ productId: 'prod_1', description: 'Aspirin 500mg', quantity: 1, unitPrice: 75.50 }] },
    ],
    transactions: [
        { id: 'trans_1', type: 'Charge', amount: 75.50, date: subDays(new Date(), 10).toISOString(), method: 'Credit Card', orderId: 'ord_1'},
        { id: 'trans_2', type: 'Payment', amount: 75.50, date: subDays(new Date(), 9).toISOString(), method: 'Credit Card', orderId: 'ord_1'}
    ],
    documents: [
      { id: 'doc_1', organizationId: 'org_1', contactId: 'contact_1', fileName: 'intake_form.pdf', fileType: 'application/pdf', uploadDate: subDays(new Date(), 45).toISOString(), dataUrl: '#' }
    ],
    auditLogs: [
      { id: 'log_1', timestamp: subDays(new Date(), 45).toISOString(), userId: 'user_admin_1', userName: 'Alice Admin', change: 'created the contact.'},
      { id: 'log_2', timestamp: subDays(new Date(), 10).toISOString(), userId: 'user_team_1', userName: 'Bob Team', change: 'added a call interaction.'},
    ],
  },
  {
    id: 'contact_2', organizationId: 'org_1', contactName: 'Jane Doe', email: 'jane.d@example.com', phone: '555-0102',
    status: 'Lead', leadSource: 'Referral', createdAt: subDays(new Date(), 5).toISOString(), avatar: 'https://i.pravatar.cc/150?u=contact_2',
    customFields: { patientId: 'P67890' },
    documents: [
        { id: 'doc_2', organizationId: 'org_1', contactId: 'contact_2', fileName: 'referral_letter.pdf', fileType: 'application/pdf', uploadDate: subDays(new Date(), 5).toISOString(), dataUrl: '#' },
        { id: 'doc_3', organizationId: 'org_1', contactId: 'contact_2', fileName: 'insurance_card.jpg', fileType: 'image/jpeg', uploadDate: subDays(new Date(), 4).toISOString(), dataUrl: 'https://i.pravatar.cc/400?u=doc_3' }
    ]
  },
  {
    id: 'contact_3', organizationId: 'org_2', contactName: 'Mike Investor', email: 'mike.i@example.com', phone: '555-0201',
    status: 'Active', leadSource: 'Event', createdAt: subDays(new Date(), 120).toISOString(), avatar: 'https://i.pravatar.cc/150?u=contact_3',
    customFields: { riskProfile: 'Moderate' }
  },
];

// --- INVENTORY ---
export let MOCK_PRODUCTS: Product[] = [
  { id: 'prod_1', organizationId: 'org_1', name: 'Aspirin 500mg', sku: 'ASP500', category: 'Pain Relief', costPrice: 50.00, salePrice: 75.50, stockLevel: 500 },
  { id: 'prod_2', organizationId: 'org_1', name: 'Band-Aids (100ct)', sku: 'BND100', category: 'First Aid', costPrice: 5.00, salePrice: 12.00, stockLevel: 250 },
  { id: 'prod_3', organizationId: 'org_2', name: 'Growth Fund', sku: 'GF001', category: 'Mutual Funds', costPrice: 100, salePrice: 100, stockLevel: 10000 },
];

export let MOCK_SUPPLIERS: Supplier[] = [{ id: 'sup_1', organizationId: 'org_1', name: 'Pharma Co.', contactPerson: 'Sarah Supplier', email: 'sales@pharmaco.com', phone: '555-SUPPLY' }];
export let MOCK_WAREHOUSES: Warehouse[] = [{ id: 'wh_1', organizationId: 'org_1', name: 'Main Storage', location: '123 Warehouse Rd.' }];

// --- SCHEDULING & TASKS ---
export let MOCK_CALENDAR_EVENTS: CalendarEvent[] = [
  { id: 'event_1', organizationId: 'org_1', title: 'Team Meeting', start: addDays(new Date(), 2), end: addDays(new Date(), 2), userIds: ['user_admin_1', 'user_team_1'] },
  { id: 'event_2', organizationId: 'org_1', title: 'Checkup - John Patient', start: addDays(new Date(), 5), end: addDays(new Date(), 5), userIds: ['user_team_1'], contactId: 'contact_1' },
];
export let MOCK_TASKS: Task[] = [
  { id: 'task_1', organizationId: 'org_1', title: 'Follow up with Jane Doe', dueDate: addDays(new Date(), 1).toISOString(), isCompleted: false, userId: 'user_team_1', contactId: 'contact_2' },
  { id: 'task_2', organizationId: 'org_1', title: 'Prepare quarterly report', dueDate: addDays(new Date(), 7).toISOString(), isCompleted: false, userId: 'user_admin_1' },
  { id: 'task_3', organizationId: 'org_1', title: 'Order new supplies', dueDate: subDays(new Date(), 3).toISOString(), isCompleted: true, userId: 'user_admin_1' },
];

// --- DEALS ---
export let MOCK_DEAL_STAGES: DealStage[] = [
  { id: 'stage_1', organizationId: 'org_1', name: 'Lead In', order: 1 },
  { id: 'stage_2', organizationId: 'org_1', name: 'Contact Made', order: 2 },
  { id: 'stage_3', organizationId: 'org_1', name: 'Needs Defined', order: 3 },
  { id: 'stage_4', organizationId: 'org_1', name: 'Proposal Made', order: 4 },
  { id: 'stage_5', organizationId: 'org_1', name: 'Closed Won', order: 5 },
  { id: 'stage_6', organizationId: 'org_1', name: 'Closed Lost', order: 6 },
];
export let MOCK_DEALS: Deal[] = [
  { id: 'deal_1', organizationId: 'org_1', name: 'Corporate Wellness Program', value: 5000, stageId: 'stage_2', contactId: 'contact_2', expectedCloseDate: addDays(new Date(), 30).toISOString(), createdAt: new Date().toISOString() },
  { id: 'deal_2', organizationId: 'org_1', name: 'New Equipment Sale', value: 15000, stageId: 'stage_4', contactId: 'contact_1', expectedCloseDate: addDays(new Date(), 15).toISOString(), createdAt: subDays(new Date(), 15).toISOString() },
];

// --- MARKETING & AUTOMATION ---
export let MOCK_EMAIL_TEMPLATES: EmailTemplate[] = [
  { id: 'et_1', organizationId: 'org_1', name: 'Welcome Email', subject: 'Welcome to Wellness Clinic!', body: 'Hi {{contactName}},\n\nWelcome! We are excited to have you.\n\nBest,\n{{userName}}' },
];
export let MOCK_WORKFLOWS: Workflow[] = [
  {
    id: 'wf_1', organizationId: 'org_1', name: 'New Lead Follow-up', isActive: true,
    trigger: { type: 'contactStatusChanged', toStatus: 'Lead' },
    actions: [{ type: 'createTask', taskTitle: 'Follow up with new lead: {{contactName}}', assigneeId: 'user_team_1' }]
  }
];

export let MOCK_ADVANCED_WORKFLOWS: AdvancedWorkflow[] = [
    {
        id: 'adv_wf_1',
        organizationId: 'org_1',
        name: 'Advanced Lead Nurturing',
        isActive: true,
        nodes: [
            { id: '1', type: 'trigger', position: { x: 250, y: 5 }, data: { label: 'Contact is Created', nodeType: 'contactCreated' } },
            { id: '2', type: 'action', position: { x: 250, y: 125 }, data: { label: 'Send an Email', nodeType: 'sendEmail', emailTemplateId: 'et_1' } },
        ],
        edges: [
            { id: 'e1-2', source: '1', target: '2' },
        ],
    }
];

export let MOCK_CAMPAIGNS: Campaign[] = [
    { id: 'camp_1', organizationId: 'org_1', name: 'Q1 Newsletter', status: 'Draft', targetAudience: { status: ['Active', 'Lead'] }, steps: [{type: 'sendEmail', emailTemplateId: 'et_1'}], stats: { recipients: 0, sent: 0, opened: 0, clicked: 0 } }
];

// --- SUPPORT ---
export let MOCK_TICKETS: Ticket[] = [
  {
    id: 'ticket_1', organizationId: 'org_1', contactId: 'contact_1', subject: 'Billing question', description: 'I have a question about my last invoice.',
    status: 'Open', priority: 'Medium', assignedToId: 'user_team_1', createdAt: subDays(new Date(), 2).toISOString(), updatedAt: subDays(new Date(), 1).toISOString(),
    replies: [{ id: 'rep_1', userId: 'user_team_1', userName: 'Bob Team', message: 'Looking into this for you.', timestamp: subDays(new Date(), 1).toISOString(), isInternal: false }]
  },
  {
    id: 'ticket_2', organizationId: 'org_1', contactId: 'contact_2', subject: 'Cannot log in', description: 'My password is not working.',
    status: 'New', priority: 'High', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    replies: []
  },
];

// --- SETTINGS & MISC ---
export let MOCK_CUSTOM_REPORTS: CustomReport[] = [];
export let MOCK_DASHBOARD_WIDGETS: DashboardWidget[] = [];
export let MOCK_ORG_SETTINGS: Record<string, { organizationId: string, ticketSla: SLAPolicy }> = {
    'org_1': {
        organizationId: 'org_1',
        ticketSla: {
            responseTime: { high: 1, medium: 4, low: 24 },
            resolutionTime: { high: 8, medium: 24, low: 72 },
        }
    }
};

export let MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif_1',
    userId: 'user_team_1',
    type: 'mention',
    message: 'Alice Admin mentioned you in a note for John Patient.',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    isRead: false,
    linkTo: '/contacts/contact_1',
  },
  {
    id: 'notif_2',
    userId: 'user_admin_1',
    type: 'task_assigned',
    message: 'You have a new task: "Prepare quarterly report".',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    isRead: false,
    linkTo: '/tasks',
  },
];