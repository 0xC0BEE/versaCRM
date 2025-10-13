import { faker } from '@faker-js/faker';
import { 
    Organization, User, CustomRole, AnyContact, Interaction, Product, Deal, DealStage, Task, CalendarEvent, 
    EmailTemplate, Workflow, AdvancedWorkflow, OrganizationSettings, ApiKey, Ticket, PublicForm, Campaign, 
    LandingPage, Document, CustomReport, DashboardWidget, Supplier, Warehouse, CustomObjectDefinition, 
    CustomObjectRecord, AppMarketplaceItem, InstalledApp, Sandbox, DocumentTemplate,
    ProjectPhase, Project, ProjectTemplate
} from '../types';

export const MOCK_ORGANIZATIONS: Organization[] = [
    { id: 'org_1', name: 'Clay Health', industry: 'Health', primaryContactEmail: 'admin@crm.com', createdAt: '2023-01-01T10:00:00Z', isSetupComplete: false },
    { id: 'org_2', name: 'Innovate Financial', industry: 'Finance', primaryContactEmail: 'finance.admin@crm.com', createdAt: '2023-02-15T11:00:00Z', isSetupComplete: true },
];

export const MOCK_ROLES: CustomRole[] = [
    { id: 'role_super', organizationId: 'org_1', name: 'Super Admin', description: 'Has all permissions across all organizations.', isSystemRole: true, permissions: {} },
    { id: 'role_admin', organizationId: 'org_1', name: 'Organization Admin', description: 'Manages users, settings, and billing.', isSystemRole: true, permissions: { 'settings:access': true, 'settings:manage:team': true, 'settings:manage:roles': true, 'settings:manage:api': true, 'settings:manage:apps': true, 'contacts:read:all': true, 'deals:read': true, 'tickets:read': true, 'automations:manage': true, 'reports:read': true, 'reports:manage': true, 'inventory:read': true, 'inventory:manage': true, 'voip:use': true } },
    { id: 'role_team', organizationId: 'org_1', name: 'Team Member', description: 'Standard user with access to CRM features.', isSystemRole: true, permissions: { 'contacts:read:own': true, 'contacts:create': true, 'contacts:edit': true, 'deals:read': true, 'tickets:read': true, 'tickets:create': true, 'voip:use': true } },
];

export const MOCK_USERS: User[] = [
    { id: 'user_super_1', organizationId: 'org_1', name: 'Super Admin', email: 'super@crm.com', role: 'Super Admin', roleId: 'role_super', isClient: false },
    { id: 'user_admin_1', organizationId: 'org_1', name: 'Alice Admin', email: 'admin@crm.com', role: 'Organization Admin', roleId: 'role_admin', isClient: false },
    { id: 'user_team_1', organizationId: 'org_1', name: 'Charlie Team', email: 'team@crm.com', role: 'Team Member', roleId: 'role_team', isClient: false },
    { id: 'user_client_1', organizationId: 'org_1', name: 'John Patient', email: 'client@crm.com', role: 'Client', roleId: '', isClient: true, contactId: 'contact_1' },
];

export const MOCK_INTERACTIONS: Interaction[] = [
    { id: 'int_1', organizationId: 'org_1', contactId: 'contact_1', userId: 'user_admin_1', type: 'Appointment', date: '2023-05-10T14:00:00Z', notes: 'Initial consultation. Discussed treatment plan.' },
    { id: 'int_2', organizationId: 'org_1', contactId: 'contact_1', userId: 'user_team_1', type: 'Email', date: '2023-05-12T09:00:00Z', notes: 'Subject: Follow-up from your visit\n\nHi John, here are the documents we discussed...' },
    { id: 'int_3', organizationId: 'org_1', contactId: 'contact_2', userId: 'user_admin_1', type: 'Call', date: '2023-05-11T11:30:00Z', notes: 'Checked in on Jane. She is feeling better.' },
];

let MOCK_CONTACTS_MUTABLE: AnyContact[] = [
    { id: 'contact_1', organizationId: 'org_1', contactName: 'John Patient', email: 'john.patient@example.com', phone: '555-0101', status: 'Active', leadSource: 'Web', createdAt: '2023-05-01T10:00:00Z', assignedToId: 'user_team_1', customFields: { patientId: 'P001', insuranceProvider: 'Blue Cross' }, interactions: [MOCK_INTERACTIONS[0], MOCK_INTERACTIONS[1]], leadScore: 25 },
    { id: 'contact_2', organizationId: 'org_1', contactName: 'Jane Doe', email: 'jane.doe@example.com', phone: '555-0102', status: 'Lead', leadSource: 'Referral', createdAt: '2023-04-20T15:00:00Z', assignedToId: 'user_admin_1', customFields: { patientId: 'P002' }, interactions: [MOCK_INTERACTIONS[2]], leadScore: 10 },
    { id: 'contact_3', organizationId: 'org_1', contactName: 'Peter Jones', email: 'peter.jones@example.com', phone: '555-0103', status: 'Inactive', leadSource: 'Manual', createdAt: '2023-03-15T12:00:00Z', customFields: { patientId: 'P003' }, leadScore: 5 },
];

export const MOCK_DEAL_STAGES: DealStage[] = [
    { id: 'stage_1', organizationId: 'org_1', name: 'Qualification', order: 1 },
    { id: 'stage_2', organizationId: 'org_1', name: 'Proposal Sent', order: 2 },
    { id: 'stage_3', organizationId: 'org_1', name: 'Negotiation', order: 3 },
    { id: 'stage_4', organizationId: 'org_1', name: 'Won', order: 4 },
    { id: 'stage_5', organizationId: 'org_1', name: 'Lost', order: 5 },
];

export const MOCK_DEALS: Deal[] = [
    { id: 'deal_1', organizationId: 'org_1', name: 'Corporate Wellness Program', value: 25000, stageId: 'stage_2', contactId: 'contact_2', expectedCloseDate: '2023-06-30T10:00:00Z', createdAt: '2023-05-01T10:00:00Z', assignedToId: 'user_admin_1' },
    { id: 'deal_2', organizationId: 'org_1', name: 'New Clinic Equipment', value: 75000, stageId: 'stage_1', contactId: 'contact_3', expectedCloseDate: '2023-07-15T10:00:00Z', createdAt: '2023-05-10T10:00:00Z', assignedToId: 'user_team_1' },
];

export const MOCK_PRODUCTS: Product[] = [
    { id: 'prod_1', organizationId: 'org_1', name: 'Standard Consultation', sku: 'CONS-STD', category: 'Service', costPrice: 0, salePrice: 150, stockLevel: 9999 },
    { id: 'prod_2', organizationId: 'org_1', name: 'Advanced Screening', sku: 'SCRN-ADV', category: 'Service', costPrice: 50, salePrice: 450, stockLevel: 9999 },
    { id: 'prod_3', organizationId: 'org_1', name: 'Medical Supplies Kit', sku: 'KIT-MED-01', category: 'Goods', costPrice: 25, salePrice: 75, stockLevel: 500 },
];

export const MOCK_TASKS: Task[] = [
    { id: 'task_1', organizationId: 'org_1', title: 'Follow up with John Patient', dueDate: '2023-05-20T10:00:00Z', isCompleted: false, userId: 'user_team_1', contactId: 'contact_1' },
    { id: 'task_2', organizationId: 'org_1', title: 'Prepare proposal for Jane Doe', dueDate: '2023-05-18T10:00:00Z', isCompleted: false, userId: 'user_admin_1', contactId: 'contact_2' },
    { id: 'task_3', organizationId: 'org_1', title: 'Onboarding call for Wellness Program', dueDate: '2023-05-15T10:00:00Z', isCompleted: true, userId: 'user_admin_1', projectId: 'proj_1' },
];

export const MOCK_CALENDAR_EVENTS: CalendarEvent[] = [
    { id: 'event_1', title: 'Follow-up with John Patient', start: new Date(2023, 4, 20, 10, 0), end: new Date(2023, 4, 20, 10, 30), userIds: ['user_team_1'], contactId: 'contact_1' },
    { id: 'event_2', title: 'Team Meeting', start: new Date(2023, 4, 22, 9, 0), end: new Date(2023, 4, 22, 10, 0), userIds: ['user_admin_1', 'user_team_1'] },
];

export const MOCK_EMAIL_TEMPLATES: EmailTemplate[] = [
    { id: 'template_1', organizationId: 'org_1', name: 'Welcome Email', subject: 'Welcome to Clay Health!', body: 'Hi {{contactName}},\n\nWelcome! We\'re excited to have you.\n\nBest,\n{{userName}}' },
    { id: 'template_2', organizationId: 'org_1', name: 'Case Study Follow-up', subject: 'Following up on our conversation', body: 'Hi {{contactName}},\n\nAs promised, here is a case study relevant to our discussion. Let me know your thoughts!\n\nBest,\n{{userName}}' },
];

export const MOCK_FORMS: PublicForm[] = [
    { id: 'form_1', organizationId: 'org_1', name: 'Contact Us Form', fields: [ { id: 'contactName', label: 'Full Name', type: 'text', required: true }, { id: 'email', label: 'Email Address', type: 'text', required: true } ], style: { buttonText: 'Submit', buttonColor: '#3b82f6' }, actions: { successMessage: 'Thanks for reaching out! We\'ll be in touch soon.' }, submissions: 12 },
];

export const MOCK_CAMPAIGNS: Campaign[] = [
    { id: 'camp_1', organizationId: 'org_1', name: 'New Lead Nurturing', status: 'Draft', stats: { recipients: 0, sent: 0, opened: 0, clicked: 0 }, 
      targetAudience: { status: 'Lead' }, 
      nodes: [
        { 
            id: '1', 
            type: 'journeyTrigger', 
            position: { x: 250, y: 25 }, 
            data: { 
                label: 'Target: New Leads', 
                nodeType: 'targetAudience',
                targetAudience: { status: 'Lead' }
            } 
        }
      ], 
      edges: [] 
    },
];

export const MOCK_WORKFLOWS: Workflow[] = [
    { id: 'wf_1', organizationId: 'org_1', name: 'New Lead Follow-up', isActive: true, trigger: { type: 'contactCreated' }, actions: [ { type: 'createTask', taskTitle: 'Call new lead: {{contactName}}', assigneeId: 'user_admin_1' } ] }
];

export const MOCK_ADVANCED_WORKFLOWS: AdvancedWorkflow[] = [
    { id: 'adv_workflow_1', organizationId: 'org_1', name: 'Advanced Lead Nurturing', isActive: true, nodes: [ { id: '1', type: 'trigger', position: { x: 250, y: 5 }, data: { label: 'Contact is Created', nodeType: 'contactCreated' } }, { id: '2', type: 'action', position: { x: 250, y: 125 }, data: { label: 'Send Welcome Email', nodeType: 'sendEmail', emailTemplateId: 'template_1' } }, { id: '3', type: 'action', position: { x: 250, y: 250 }, data: { label: 'Wait 3 Days', nodeType: 'wait', days: 3 } }, { id: '4', type: 'action', position: { x: 250, y: 375 }, data: { label: 'Create Follow-up Task', nodeType: 'createTask', taskTitle: 'Follow up with {{contactName}}', assigneeId: 'user_admin_1' } }, ], edges: [ { id: 'e1-2', source: '1', target: '2' }, { id: 'e2-3', source: '2', target: '3' }, { id: 'e3-4', source: '3', target: '4' }, ], }
];

export let MOCK_ORGANIZATION_SETTINGS: OrganizationSettings = {
    organizationId: 'org_1',
    ticketSla: { responseTime: { high: 1, medium: 4, low: 24 }, resolutionTime: { high: 8, medium: 24, low: 72 } },
    leadScoringRules: [ { id: 'rule_1', event: 'interaction', points: 10, interactionType: 'Appointment' }, { id: 'rule_2', event: 'status_change', points: 20, status: 'Active' } ],
    emailIntegration: { isConnected: false },
    voip: { isConnected: false },
    liveChat: { isEnabled: true, color: '#3b82f6', welcomeMessage: 'Welcome! How can we help?', autoCreateContact: true, newContactStatus: 'Lead', autoCreateTicket: true, newTicketPriority: 'Medium' },
    featureFlags: {},
};

export const MOCK_TICKETS: Ticket[] = [
    { id: 'ticket_1', organizationId: 'org_1', contactId: 'contact_1', subject: 'Billing question', description: 'I have a question about my last invoice.', status: 'Open', priority: 'Medium', createdAt: '2023-05-15T10:00:00Z', updatedAt: '2023-05-16T11:00:00Z', assignedToId: 'user_team_1', replies: [] },
];

export const MOCK_LANDING_PAGES: LandingPage[] = [
    { id: 'lp_1', organizationId: 'org_1', name: 'Spring Promotion', slug: 'spring-promo', status: 'Published', content: [], style: { backgroundColor: '#ffffff', textColor: '#000000' } },
];

export const MOCK_DOCUMENT_TEMPLATES: DocumentTemplate[] = [
    { id: 'dt_1', organizationId: 'org_1', name: 'Standard Proposal', content: [] },
    { 
        id: 'dt_2', 
        organizationId: 'org_1', 
        name: 'Sales Quote', 
        content: [
            { id: 'block_1', type: 'header', content: { title: 'Sales Quote for {{contact.contactName}}', subtitle: 'Prepared for: {{deal.name}}' }},
            { id: 'block_2', type: 'lineItems', content: {
                items: [
                    { productId: 'prod_1', name: 'Standard Consultation', quantity: 2, unitPrice: 150 },
                    { productId: 'prod_2', name: 'Advanced Screening', quantity: 1, unitPrice: 450 }
                ],
                taxRate: 8.5
            }}
        ] 
    },
];

export const MOCK_PROJECT_PHASES: ProjectPhase[] = [
    { id: 'phase_1', organizationId: 'org_1', name: 'Not Started', order: 1 },
    { id: 'phase_2', organizationId: 'org_1', name: 'Onboarding', order: 2 },
    { id: 'phase_3', organizationId: 'org_1', name: 'In Progress', order: 3 },
    { id: 'phase_4', organizationId: 'org_1', name: 'Completed', order: 4 },
];

export const MOCK_PROJECT_TEMPLATES: ProjectTemplate[] = [
    { id: 'pt_1', organizationId: 'org_1', name: 'Standard Client Onboarding', defaultTasks: [
        { title: 'Kick-off call', daysAfterStart: 1 },
        { title: 'Send welcome packet', daysAfterStart: 2 },
        { title: 'First progress check-in', daysAfterStart: 7 },
    ]},
    { id: 'pt_2', organizationId: 'org_1', name: 'Equipment Installation', defaultTasks: [
        { title: 'Site survey', daysAfterStart: 2 },
        { title: 'Schedule installation', daysAfterStart: 3 },
        { title: 'Perform installation', daysAfterStart: 10 },
        { title: 'Post-installation training', daysAfterStart: 11 },
    ]},
];

export const MOCK_PROJECTS: Project[] = [
    { id: 'proj_1', organizationId: 'org_1', name: 'Onboarding for Wellness Program', phaseId: 'phase_3', contactId: 'contact_2', dealId: 'deal_1', createdAt: '2023-07-01T10:00:00Z', assignedToId: 'user_admin_1',
      comments: [
        { id: 'comment_1', userId: 'user_admin_1', message: 'Kick-off call scheduled for next week.', timestamp: '2023-07-02T11:00:00Z'},
        { id: 'comment_2', userId: 'user_team_1', message: 'I\'ve sent the welcome packet to the client.', timestamp: '2023-07-03T15:30:00Z'},
      ],
      notes: '### Project Brief\nThis project is to onboard the new client, Innovate Financial, for their Corporate Wellness Program.\n\n**Key Stakeholders:**\n- Jane Doe (Client)\n- Alice Admin (Project Lead)\n\n**Timeline:**\n- Kick-off: Week 1\n- Implementation: Weeks 2-3\n- Go-live: Week 4'
    },
];

export const MOCK_PROJECT_DOCUMENTS: Document[] = [
    {
        id: 'doc_proj_1',
        organizationId: 'org_1',
        projectId: 'proj_1',
        fileName: 'Statement_of_Work_Wellness.pdf',
        fileType: 'application/pdf',
        uploadDate: new Date().toISOString(),
        dataUrl: 'about:blank' // Placeholder
    }
];


export const MOCK_CUSTOM_REPORTS: CustomReport[] = [];
export const MOCK_DASHBOARD_WIDGETS: DashboardWidget[] = [];
export const MOCK_DOCUMENTS: Document[] = [...MOCK_PROJECT_DOCUMENTS];
export const MOCK_API_KEYS: ApiKey[] = [];
export const MOCK_SUPPLIERS: Supplier[] = [];
export const MOCK_WAREHOUSES: Warehouse[] = [];
export const MOCK_CUSTOM_OBJECT_DEFINITIONS: CustomObjectDefinition[] = [];
export const MOCK_CUSTOM_OBJECT_RECORDS: CustomObjectRecord[] = [];
export const MOCK_ANONYMOUS_SESSIONS: any[] = [];
export const MOCK_APP_MARKETPLACE_ITEMS: AppMarketplaceItem[] = [
    { id: 'app_slack', name: 'Slack', description: 'Get CRM notifications in your Slack channels.', longDescription: 'The Slack integration for VersaCRM allows you to receive real-time notifications about important CRM events directly in your chosen Slack channels. Get notified about new leads, closed deals, or urgent support tickets without ever leaving your workspace.', logo: 'https://a.slack-edge.com/80588/marketing/img/meta/slack_hash_256.png', category: 'Communication', developer: 'VersaCRM Inc.', website: 'https://slack.com' },
    { id: 'app_quickbooks', name: 'QuickBooks', description: 'Sync invoices and payments with your accounting.', longDescription: 'Keep your sales and accounting teams in perfect sync. The QuickBooks integration automatically creates invoices when deals are won in VersaCRM and syncs payment information back to the contact\'s billing record.', logo: 'https://cdn-assets.commonsware.com/images/logos/quickbooks_logo.png', category: 'Finance', developer: 'Intuit', website: 'https://quickbooks.intuit.com/' },
    { id: 'app_gcal', name: 'Google Calendar', description: 'Two-way sync for your CRM and Google Calendar events.', longDescription: 'Never miss a meeting. This integration provides a seamless two-way sync between your VersaCRM calendar and your Google Calendar. Events created in one system will instantly appear in the other, keeping your schedule perfectly aligned.', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg', category: 'Productivity', developer: 'Google', website: 'https://calendar.google.com/' }
];
export const MOCK_INSTALLED_APPS: InstalledApp[] = [];
export const MOCK_SANDBOXES: Sandbox[] = [];


// Export mutable arrays for services that modify data in place
export { MOCK_CONTACTS_MUTABLE };