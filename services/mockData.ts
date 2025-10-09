// This file contains all the mock data for the application.
// In a real application, this data would come from a database.
// FIX: Corrected date-fns imports to use the main entry point for consistency and to resolve module resolution errors.
import { addDays, subDays } from 'date-fns';
import {
    User, Organization, AnyContact, CustomRole, Task, CalendarEvent, Product, Deal, DealStage, EmailTemplate, Interaction, Workflow, AdvancedWorkflow, OrganizationSettings, ApiKey, Ticket, PublicForm, Campaign, Document, LandingPage, CustomReport, DashboardWidget, Supplier, Warehouse, AnonymousSession
} from '../types';

export let MOCK_ORGANIZATIONS: Organization[] = [
    { id: 'org_1', name: 'General Hospital', industry: 'Health', primaryContactEmail: 'admin@gh.com', createdAt: '2023-01-15T10:00:00Z' },
    { id: 'org_2', name: 'WealthSimple Inc.', industry: 'Finance', primaryContactEmail: 'admin@ws.com', createdAt: '2023-02-20T11:00:00Z' },
];

export let MOCK_ROLES: CustomRole[] = [
    { id: 'role_super', organizationId: '*', name: 'Super Admin', description: 'Has all permissions across all organizations.', isSystemRole: true, permissions: {} },
    { id: 'role_admin_1', organizationId: 'org_1', name: 'Organization Admin', description: 'Manages users and settings for their organization.', isSystemRole: true, permissions: { 'contacts:read:all': true, 'contacts:create': true, 'contacts:edit': true, 'contacts:delete': true, 'deals:read': true, 'deals:create': true, 'deals:edit': true, 'deals:delete': true, 'tickets:read': true, 'tickets:create': true, 'tickets:edit': true, 'automations:manage': true, 'reports:read': true, 'reports:manage': true, 'inventory:read': true, 'inventory:manage': true, 'voip:use': true, 'settings:access': true, 'settings:manage:team': true, 'settings:manage:roles': true, 'settings:manage:api': true } },
    { id: 'role_member_1', organizationId: 'org_1', name: 'Team Member', description: 'A standard user with access to assigned records.', isSystemRole: true, permissions: { 'contacts:read:own': true, 'contacts:create': true, 'contacts:edit': true, 'deals:read': true, 'deals:create': true, 'deals:edit': true, 'tickets:read': true, 'tickets:create': true, 'tickets:edit': true, 'voip:use': true } },
    { id: 'role_client_1', organizationId: 'org_1', name: 'Client', description: 'Client portal access.', isSystemRole: true, permissions: {} },
];

export let MOCK_USERS: User[] = [
    { id: 'user_super_1', organizationId: 'org_1', name: 'Super Admin', email: 'super@crm.com', role: 'Super Admin', roleId: 'role_super', isClient: false },
    { id: 'user_admin_1', organizationId: 'org_1', name: 'Alice Admin', email: 'admin@crm.com', role: 'Organization Admin', roleId: 'role_admin_1', isClient: false },
    { id: 'user_member_1', organizationId: 'org_1', name: 'Bob Team', email: 'team@crm.com', role: 'Team Member', roleId: 'role_member_1', isClient: false },
    { id: 'user_client_1', organizationId: 'org_1', name: 'Charles Client', email: 'client@crm.com', role: 'Client', roleId: 'role_client_1', isClient: true, contactId: 'contact_1' },
];

export let MOCK_INTERACTIONS: Interaction[] = [
    { id: 'int_1', organizationId: 'org_1', contactId: 'contact_1', userId: 'user_admin_1', type: 'Appointment', date: subDays(new Date(), 2).toISOString(), notes: 'Follow-up appointment scheduled.' },
    { id: 'int_2', organizationId: 'org_1', contactId: 'contact_1', userId: 'user_admin_1', type: 'Email', date: subDays(new Date(), 5).toISOString(), notes: 'Sent welcome email with new patient forms.' },
    { id: 'int_3', organizationId: 'org_1', contactId: 'contact_2', userId: 'user_member_1', type: 'Call', date: subDays(new Date(), 10).toISOString(), notes: 'Discussed portfolio performance. Client is happy.' },
];

export let MOCK_CONTACTS_MUTABLE: AnyContact[] = [
    { id: 'contact_1', organizationId: 'org_1', contactName: 'John Patient', email: 'john.patient@example.com', phone: '555-0101', status: 'Active', leadSource: 'Web', createdAt: subDays(new Date(), 30).toISOString(), assignedToId: 'user_member_1', customFields: { patientId: 'P001' }, avatar: 'https://i.pravatar.cc/150?u=john', interactions: MOCK_INTERACTIONS.filter(i => i.contactId === 'contact_1'), leadScore: 75, orders: [], transactions: [], auditLogs: [] },
    { id: 'contact_2', organizationId: 'org_1', contactName: 'Jane Doe', email: 'jane.doe@example.com', phone: '555-0102', status: 'Lead', leadSource: 'Referral', createdAt: subDays(new Date(), 5).toISOString(), assignedToId: 'user_admin_1', customFields: { patientId: 'P002' }, avatar: 'https://i.pravatar.cc/150?u=jane', interactions: MOCK_INTERACTIONS.filter(i => i.contactId === 'contact_2'), leadScore: 25, orders: [], transactions: [], auditLogs: [] },
    { id: 'contact_3', organizationId: 'org_1', contactName: 'Peter Jones', email: 'peter.jones@example.com', phone: '555-0103', status: 'Needs Attention', leadSource: 'Web', createdAt: subDays(new Date(), 60).toISOString(), customFields: {}, avatar: 'https://i.pravatar.cc/150?u=peter', leadScore: 10, orders: [], transactions: [], auditLogs: [] },
];

export let MOCK_TASKS: Task[] = [
    { id: 'task_1', organizationId: 'org_1', title: 'Follow up with John Patient', dueDate: addDays(new Date(), 2).toISOString(), isCompleted: false, userId: 'user_member_1', contactId: 'contact_1' },
    { id: 'task_2', organizationId: 'org_1', title: 'Prepare onboarding for Jane Doe', dueDate: addDays(new Date(), 5).toISOString(), isCompleted: false, userId: 'user_admin_1', contactId: 'contact_2' },
    { id: 'task_3', organizationId: 'org_1', title: 'Review Peter Jones\'s file', dueDate: subDays(new Date(), 1).toISOString(), isCompleted: true, userId: 'user_admin_1', contactId: 'contact_3' },
];

export let MOCK_CALENDAR_EVENTS: CalendarEvent[] = [
    { id: 'event_1', title: 'Follow-up with John Patient', start: addDays(new Date(), 3), end: addDays(new Date(), 3), userIds: ['user_member_1'], contactId: 'contact_1' },
    { id: 'event_2', title: 'Team Meeting', start: addDays(new Date(), 1), end: addDays(new Date(), 1), userIds: ['user_admin_1', 'user_member_1'] },
];

export let MOCK_PRODUCTS: Product[] = [
    { id: 'prod_1', organizationId: 'org_1', name: 'Standard Consultation', sku: 'CONSULT-01', category: 'Services', costPrice: 0, salePrice: 150, stockLevel: 9999 },
    { id: 'prod_2', organizationId: 'org_1', name: 'Advanced Screening', sku: 'SCREEN-ADV', category: 'Services', costPrice: 50, salePrice: 450, stockLevel: 9999 },
    { id: 'prod_3', organizationId: 'org_1', name: 'First Aid Kit', sku: 'FA-KIT-01', category: 'Goods', costPrice: 15, salePrice: 35, stockLevel: 85 },
];
export let MOCK_SUPPLIERS: Supplier[] = [{ id: 'sup_1', organizationId: 'org_1', name: 'MedSupply Co.', contactPerson: 'Sarah Chen', email: 'sarah@medsupply.com', phone: '555-SUP-PLY' }];
export let MOCK_WAREHOUSES: Warehouse[] = [{ id: 'wh_1', organizationId: 'org_1', name: 'Main Storage', location: 'Basement Room 2' }];

export let MOCK_DEAL_STAGES: DealStage[] = [
    { id: 'stage_1', organizationId: 'org_1', name: 'New', order: 1 },
    { id: 'stage_2', organizationId: 'org_1', name: 'Discovery', order: 2 },
    { id: 'stage_3', organizationId: 'org_1', name: 'Proposal', order: 3 },
    { id: 'stage_4', organizationId: 'org_1', name: 'Won', order: 4 },
    { id: 'stage_5', organizationId: 'org_1', name: 'Lost', order: 5 },
];

export let MOCK_DEALS: Deal[] = [
    { id: 'deal_1', organizationId: 'org_1', name: 'Corporate Wellness Program', value: 25000, stageId: 'stage_2', contactId: 'contact_2', expectedCloseDate: addDays(new Date(), 30).toISOString(), createdAt: subDays(new Date(), 5).toISOString(), assignedToId: 'user_admin_1' },
    { id: 'deal_2', organizationId: 'org_1', name: 'On-site Flu Shots', value: 5000, stageId: 'stage_1', contactId: 'contact_1', expectedCloseDate: addDays(new Date(), 15).toISOString(), createdAt: subDays(new Date(), 2).toISOString(), assignedToId: 'user_member_1' },
];

export let MOCK_EMAIL_TEMPLATES: EmailTemplate[] = [
    { id: 'et_1', organizationId: 'org_1', name: 'Welcome Email', subject: 'Welcome to {{organizationName}}!', body: 'Hi {{contactName}},\n\nWelcome! We\'re glad to have you.\n\nBest,\n{{userName}}' },
    { id: 'et_2', organizationId: 'org_1', name: 'Follow-up', subject: 'Following up', body: 'Hi {{contactName}},\n\nJust following up on our recent conversation.\n\nBest,\n{{userName}}' },
];

export let MOCK_WORKFLOWS: Workflow[] = [
    { id: 'wf_1', organizationId: 'org_1', name: 'New Lead Follow-up', isActive: true, trigger: { type: 'contactStatusChanged', toStatus: 'Lead' }, actions: [{ type: 'createTask', taskTitle: 'Initial follow-up with {{contactName}}', assigneeId: 'user_admin_1' }] }
];

export let MOCK_ADVANCED_WORKFLOWS: AdvancedWorkflow[] = [
    { id: 'awf_1', organizationId: 'org_1', name: 'Advanced Onboarding', isActive: true, nodes: [{id: '1', type: 'trigger', position: {x: 0, y: 0}, data: {label: 'Contact is Created', nodeType: 'contactCreated'}}], edges: [] }
];

export let MOCK_ORGANIZATION_SETTINGS: OrganizationSettings = {
    organizationId: 'org_1',
    ticketSla: { responseTime: { high: 1, medium: 4, low: 24 }, resolutionTime: { high: 8, medium: 24, low: 72 } },
    leadScoringRules: [
        { id: 'rule_1', event: 'interaction', interactionType: 'Email', points: 1 },
        { id: 'rule_2', event: 'interaction', interactionType: 'Appointment', points: 10 },
        { id: 'rule_3', event: 'status_change', status: 'Active', points: 20 },
    ],
    emailIntegration: { isConnected: false },
    voip: { isConnected: false },
    liveChat: { isEnabled: true, color: '#3b82f6', welcomeMessage: 'Welcome! How can we help?', autoCreateContact: true, newContactStatus: 'Lead', autoCreateTicket: true, newTicketPriority: 'Medium' }
};

export let MOCK_API_KEYS: ApiKey[] = [
    { id: 'key_1', organizationId: 'org_1', name: 'Legacy System', keyPrefix: 'crm_live_', createdAt: '2023-05-10T12:00:00Z' }
];

export let MOCK_TICKETS: Ticket[] = [
    { id: 'tkt_1', organizationId: 'org_1', contactId: 'contact_1', subject: 'Cannot log in', description: 'I forgot my password and the reset link is not working.', status: 'Open', priority: 'High', createdAt: subDays(new Date(), 1).toISOString(), updatedAt: new Date().toISOString(), assignedToId: 'user_member_1', replies: [
        { id: 'rep_1', userId: 'user_client_1', userName: 'Charles Client', message: 'I need help please!', timestamp: subDays(new Date(), 1).toISOString(), isInternal: false },
        { id: 'rep_2', userId: 'user_member_1', userName: 'Bob Team', message: 'Looking into this for you now.', timestamp: new Date().toISOString(), isInternal: false },
    ] },
     { id: 'tkt_2', organizationId: 'org_1', contactId: 'contact_2', subject: 'Billing Question', description: 'I have a question about my last invoice.', status: 'New', priority: 'Medium', createdAt: subDays(new Date(), 2).toISOString(), updatedAt: subDays(new Date(), 2).toISOString(), replies: [] },
];

export let MOCK_FORMS: PublicForm[] = [
    { id: 'form_1', organizationId: 'org_1', name: 'Contact Us Form', fields: [{id: 'contactName', label: 'Name', type: 'text', required: true}, {id: 'email', label: 'Email', type: 'text', required: true}], style: {buttonText: 'Send', buttonColor: '#3b82f6'}, actions: {successMessage: 'Thanks!'}, submissions: 5 },
];

export let MOCK_CAMPAIGNS: Campaign[] = [
    { 
        id: 'camp_1', 
        organizationId: 'org_1', 
        name: 'New Lead Nurturing', 
        status: 'Draft', 
        stats: { recipients: 0, sent: 0, opened: 0, clicked: 0 }, 
        targetAudience: { status: 'Lead' }, 
        nodes: [
            { 
                id: '1', 
                type: 'journeyTrigger', 
                position: { x: 250, y: 25 }, 
                data: { 
                    label: 'Target Audience', 
                    nodeType: 'targetAudience', 
                    targetAudience: { status: 'Lead' } 
                } 
            }
        ], 
        edges: [] 
    }
];

export let MOCK_DOCUMENTS: Document[] = [
    { id: 'doc_1', organizationId: 'org_1', contactId: 'contact_1', fileName: 'intake_form.pdf', fileType: 'application/pdf', uploadDate: new Date().toISOString(), dataUrl: '' }
];

export let MOCK_LANDING_PAGES: LandingPage[] = [
    { 
        id: 'lp_1', 
        organizationId: 'org_1', 
        name: 'Spring Promotion', 
        slug: 'spring-promo', 
        status: 'Published', 
        content: [
            {id: 'c1', type: 'header', content: {title: 'Spring Promo!', subtitle: 'Get 20% off.'}},
            {
                id: 'c2_image',
                type: 'image',
                content: {
                    src: 'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExYzhyanVpeHNwZmJldmViejIxYmQ0dmxmbTdyY3MyaGV6N2hlajhxZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/5Sl1sMiMJTgXXTZjrL/giphy.gif',
                    alt: 'Fun GIF'
                }
            },
            {
                id: 'c3_form',
                type: 'form',
                content: { formId: 'form_1' }
            }
        ], 
        style: {backgroundColor: '#ffffff', textColor: '#000000'} 
    }
];

export let MOCK_CUSTOM_REPORTS: CustomReport[] = [];
export let MOCK_DASHBOARD_WIDGETS: DashboardWidget[] = [];

export let MOCK_ANONYMOUS_SESSIONS: AnonymousSession[] = [];