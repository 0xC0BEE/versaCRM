import {
    AnyContact, Organization, User, Task, Product, Supplier, Warehouse,
    Interaction, EmailTemplate, Document, Workflow,
    Deal, DealStage, CustomReport
} from '../types';

export const organizations: Organization[] = [
    { id: 'org_1', name: 'HealWell Clinic', industry: 'Health', primaryContactEmail: 'contact@healwell.com', createdAt: '2023-01-15T09:00:00Z' },
    { id: 'org_2', name: 'Capital Investments', industry: 'Finance', primaryContactEmail: 'info@capitalinvest.com', createdAt: '2023-02-20T14:30:00Z' },
];

export let users: User[] = [
    { id: 'user_super_1', name: 'Sam Super', email: 'super@crm.com', role: 'Super Admin' },
    { id: 'user_admin_1', name: 'Alice Admin', email: 'admin@crm.com', role: 'Organization Admin', organizationId: 'org_1' },
    { id: 'user_team_1', name: 'Bob Builder', email: 'team@crm.com', role: 'Team Member', organizationId: 'org_1' },
    { id: 'user_client_1', name: 'Charlie Client', email: 'client@crm.com', role: 'Client', organizationId: 'org_1', contactId: 'contact_1' },
    { id: 'user_admin_2', name: 'Diana Director', email: 'diana@capital.com', role: 'Organization Admin', organizationId: 'org_2' },
    { id: 'user_team_2', name: 'Ethan Analyst', email: 'ethan@capital.com', role: 'Team Member', organizationId: 'org_2' },
];

export let interactions: Interaction[] = [
    { id: 'int_1', contactId: 'contact_1', organizationId: 'org_1', userId: 'user_admin_1', type: 'Appointment', date: '2023-10-10T10:00:00Z', notes: 'Initial consultation. Discussed treatment plan. @Bob Builder to follow up.' },
    { id: 'int_2', contactId: 'contact_1', organizationId: 'org_1', userId: 'user_team_1', type: 'Call', date: '2023-10-12T15:30:00Z', notes: 'Follow-up call. Patient confirmed next appointment.' },
    { id: 'int_3', contactId: 'contact_2', organizationId: 'org_1', userId: 'user_admin_1', type: 'Email', date: '2023-10-11T11:00:00Z', notes: 'Sent new patient forms.' },
    { id: 'int_4', contactId: 'contact_3', organizationId: 'org_2', userId: 'user_admin_2', type: 'Meeting', date: '2023-09-05T14:00:00Z', notes: 'Reviewed Q3 portfolio. Client is happy with the performance.' },
];

export let contacts: AnyContact[] = [
    {
        id: 'contact_1',
        organizationId: 'org_1',
        contactName: 'John Patient',
        email: 'john.patient@example.com',
        phone: '555-0101',
        status: 'Active',
        leadSource: 'Referral',
        createdAt: '2023-10-01T08:00:00Z',
        avatar: 'https://i.pravatar.cc/150?u=contact_1',
        customFields: { patientId: 'HW-1001', insuranceProvider: 'BlueCross', dateOfBirth: '1980-05-20' },
        interactions: [interactions[0], interactions[1]],
        orders: [],
        enrollments: [{ id: 'en_1', programName: 'Physical Therapy Plan', startDate: '2023-10-10', status: 'Active' }],
        transactions: [
            { id: 'trn_1', type: 'Charge', amount: 150, date: '2023-10-10', method: 'Insurance' },
            { id: 'trn_2', type: 'Payment', amount: 20, date: '2023-10-10', method: 'Credit Card', relatedChargeId: 'trn_1' }
        ],
        structuredRecords: [],
        relationships: [],
        auditLogs: [{ id: 'log_1', timestamp: '2023-10-01T08:00:00Z', userId: 'user_admin_1', userName: 'Alice Admin', change: 'created the contact.' }]
    },
    {
        id: 'contact_2',
        organizationId: 'org_1',
        contactName: 'Jane Doe',
        email: 'jane.doe@example.com',
        phone: '555-0102',
        status: 'Lead',
        leadSource: 'Web',
        createdAt: '2023-10-05T11:00:00Z',
        customFields: {},
        interactions: [interactions[2]],
        orders: [],
        enrollments: [],
        transactions: [],
        structuredRecords: [],
        relationships: [],
        auditLogs: []
    },
    {
        id: 'contact_3',
        organizationId: 'org_2',
        contactName: 'Peter Investor',
        email: 'peter.investor@example.com',
        phone: '555-0201',
        status: 'Active',
        leadSource: 'Event',
        createdAt: '2023-08-15T16:00:00Z',
        customFields: { clientId: 'CI-2001', riskProfile: 'Moderate' },
        interactions: [interactions[3]],
        orders: [],
        enrollments: [],
        transactions: [],
        structuredRecords: [],
        relationships: [],
        auditLogs: []
    }
];

export let tasks: Task[] = [
    { id: 'task_1', title: 'Follow up with John Patient', dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), isCompleted: false, userId: 'user_team_1', contactId: 'contact_1', organizationId: 'org_1' },
    { id: 'task_2', title: 'Prepare onboarding for Jane Doe', dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), isCompleted: false, userId: 'user_admin_1', contactId: 'contact_2', organizationId: 'org_1' },
    { id: 'task_3', title: 'Review Q3 report for Peter Investor', dueDate: '2023-09-30T09:00:00Z', isCompleted: true, userId: 'user_admin_2', contactId: 'contact_3', organizationId: 'org_2' },
];

export const products: Product[] = [
    { id: 'prod_1', organizationId: 'org_1', name: 'Standard Consultation', sku: 'CONS-STD', category: 'Services', costPrice: 0, salePrice: 150, stockLevel: 9999 },
    { id: 'prod_2', organizationId: 'org_1', name: 'Ortho Brace', sku: 'BR-ORTHO-M', category: 'Medical Supplies', costPrice: 45, salePrice: 120, stockLevel: 50 },
    { id: 'prod_3', organizationId: 'org_2', name: 'Wealth Management Fee', sku: 'FEE-WM', category: 'Fees', costPrice: 0, salePrice: 1000, stockLevel: 9999 },
];

export const suppliers: Supplier[] = [
    { id: 'sup_1', organizationId: 'org_1', name: 'MedSupply Co.', contactPerson: 'Sarah Jones', email: 'sarah@medsupply.com', phone: '555-1111' }
];

export const warehouses: Warehouse[] = [
    { id: 'wh_1', organizationId: 'org_1', name: 'Main Clinic Storage', location: '123 Health St.' }
];

export let documents: Document[] = [
    { id: 'doc_1', contactId: 'contact_1', organizationId: 'org_1', fileName: 'intake_form.pdf', fileType: 'application/pdf', fileSize: 102400, uploadDate: '2023-10-01T08:05:00Z', uploadedByUserId: 'user_admin_1', dataUrl: '' },
];

export let emailTemplates: EmailTemplate[] = [
    { id: 'et_1', organizationId: 'org_1', name: 'Welcome New Patient', subject: 'Welcome to HealWell Clinic, {{contactName}}!', body: 'Dear {{contactName}},\n\nWe are delighted to welcome you to our clinic. Your health is our top priority.\n\nSincerely,\nThe HealWell Team' },
    { id: 'et_2', organizationId: 'org_1', name: 'Appointment Reminder', subject: 'Your Upcoming Appointment', body: 'Hi {{contactName}},\n\nThis is a reminder for your upcoming appointment with us. We look forward to seeing you.\n\nBest,\n{{userName}}' },
];

export let workflows: Workflow[] = [
    {
        id: 'wf_1',
        organizationId: 'org_1',
        name: 'New Lead Follow-up',
        isActive: true,
        trigger: { type: 'contactCreated' },
        actions: [
            { type: 'createTask', taskTitle: 'Initial follow-up call with {{contactName}}', assigneeId: 'user_admin_1' },
            { type: 'sendEmail', emailTemplateId: 'et_1' }
        ]
    }
];

export let dealStages: DealStage[] = [
    { id: 'stage_1', name: 'Prospect', order: 1, organizationId: 'org_1' },
    { id: 'stage_2', name: 'Qualification', order: 2, organizationId: 'org_1' },
    { id: 'stage_3', name: 'Proposal', order: 3, organizationId: 'org_1' },
    { id: 'stage_4', name: 'Negotiation', order: 4, organizationId: 'org_1' },
    { id: 'stage_5', name: 'Closed Won', order: 5, organizationId: 'org_1' },
    { id: 'stage_6', name: 'Closed Lost', order: 6, organizationId: 'org_1' },
];

export let deals: Deal[] = [
    { id: 'deal_1', organizationId: 'org_1', name: 'Corporate Wellness Program', value: 15000, stageId: 'stage_3', contactId: 'contact_2', expectedCloseDate: '2024-07-30T00:00:00Z', createdAt: '2024-06-01T00:00:00Z' },
    { id: 'deal_2', organizationId: 'org_1', name: 'New Equipment Purchase', value: 5000, stageId: 'stage_1', contactId: 'contact_1', expectedCloseDate: '2024-08-15T00:00:00Z', createdAt: '2024-06-10T00:00:00Z' }
];

export let customReports: CustomReport[] = [
    { id: 'cr_1', name: 'Active Leads Report', organizationId: 'org_1', config: { dataSource: 'contacts', columns: ['contactName', 'email', 'leadSource'], filters: [{ field: 'status', operator: 'is', value: 'Lead' }] } }
];
