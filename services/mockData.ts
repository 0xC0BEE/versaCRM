// FIX: Corrected import path for types.
import { User, Organization, AnyContact, Product, Supplier, Warehouse, CalendarEvent, Task, Interaction, Deal, DealStage, EmailTemplate, Workflow, Campaign, Ticket, CustomReport, DashboardWidget, Document, SLAPolicy, OrganizationSettings } from '../types';
// FIX: Reverted from subDays to sub as subDays is not an exported member in the project's date-fns version.
import { addDays, sub } from 'date-fns';

// To prevent subtle module-caching issues where updates don't appear,
// we now define all data arrays directly inside the exported object.
// This makes mockDataStore the single, authoritative source of truth.
export const mockDataStore = {
    users: [
        { id: 'user_super_1', name: 'Super Admin', email: 'super@crm.com', role: 'Super Admin' },
        { id: 'user_admin_1', name: 'Alice Admin', email: 'admin@crm.com', role: 'Organization Admin', organizationId: 'org_1' },
        { id: 'user_team_1', name: 'Bob Team', email: 'team@crm.com', role: 'Team Member', organizationId: 'org_1' },
        { id: 'user_client_1', name: 'Charlie Client', email: 'client@crm.com', role: 'Client', organizationId: 'org_1', contactId: 'contact_1' },
    ] as User[],

    organizations: [
// FIX: Reverted to sub() from subDays() to resolve module export error.
        { id: 'org_1', name: 'VersaHealth Clinic', industry: 'Health', primaryContactEmail: 'contact@versahealth.com', createdAt: sub(new Date(), { days: 90 }).toISOString() },
// FIX: Reverted to sub() from subDays() to resolve module export error.
        { id: 'org_2', name: 'Finance Solutions Inc.', industry: 'Finance', primaryContactEmail: 'contact@financesolutions.com', createdAt: sub(new Date(), { days: 180 }).toISOString() },
    ] as Organization[],
    
    products: [
        { id: 'prod_1', organizationId: 'org_1', name: 'Stethoscope', sku: 'ST-001', category: 'Medical Equipment', costPrice: 50, salePrice: 120, stockLevel: 150 },
        { id: 'prod_2', organizationId: 'org_1', name: 'Band-Aids (Box of 100)', sku: 'BA-100', category: 'Consumables', costPrice: 5, salePrice: 15, stockLevel: 80 },
        { id: 'prod_3', organizationId: 'org_1', name: 'Aspirin (100mg)', sku: 'ASP-100', category: 'Pharmaceuticals', costPrice: 2, salePrice: 8, stockLevel: 2000 },
    ] as Product[],
    
    contacts: [
        { 
// FIX: Reverted to sub() from subDays() to resolve module export error.
            id: 'contact_1', organizationId: 'org_1', contactName: 'John Patient', email: 'john.patient@example.com', phone: '555-0101', status: 'Active', leadSource: 'Referral', createdAt: sub(new Date(), { days: 45 }).toISOString(), customFields: { patientId: 'P12345', insuranceProvider: 'MediCare', dateOfBirth: '1980-05-20' },
            orders: [
// FIX: Reverted to sub() from subDays() to resolve module export error.
                { id: 'order_1', contactId: 'contact_1', organizationId: 'org_1', orderDate: sub(new Date(), { days: 10 }).toISOString(), status: 'Completed', total: 135, lineItems: [{productId: 'prod_1', description: 'Stethoscope', quantity: 1, unitPrice: 120}, {productId: 'prod_2', description: 'Band-Aids (Box of 100)', quantity: 1, unitPrice: 15}] }
            ],
            transactions: [
// FIX: Reverted to sub() from subDays() to resolve module export error.
                 { id: 'trans_1', type: 'Charge', amount: 135, date: sub(new Date(), { days: 10 }).toISOString(), method: 'Insurance', orderId: 'order_1' }
            ],
            auditLogs: [{ id: 'log_1', timestamp: new Date().toISOString(), userId: 'user_admin_1', userName: 'Alice Admin', change: 'updated status to Active.' }]
        },
// FIX: Reverted to sub() from subDays() to resolve module export error.
        { id: 'contact_2', organizationId: 'org_1', contactName: 'Jane Doe', email: 'jane.doe@example.com', phone: '555-0102', status: 'Lead', leadSource: 'Web', createdAt: sub(new Date(), { days: 5 }).toISOString(), customFields: {} },
    ] as AnyContact[],

    suppliers: [
        { id: 'sup_1', organizationId: 'org_1', name: 'MedSupply Co.', contactPerson: 'Sarah Chen', email: 'sarah@medsupply.com', phone: '555-0201' },
    ] as Supplier[],

    warehouses: [
        { id: 'wh_1', organizationId: 'org_1', name: 'Main Warehouse', location: '123 Storage Rd, Cityville' },
    ] as Warehouse[],

    calendarEvents: [
        { id: 'cal_1', organizationId: 'org_1', title: 'Follow-up with John Patient', start: addDays(new Date(), 2), end: addDays(new Date(), 2), userIds: ['user_team_1'], contactId: 'contact_1' },
    ] as CalendarEvent[],

    tasks: [
        { id: 'task_1', organizationId: 'org_1', title: 'Prepare quarterly report', dueDate: addDays(new Date(), 5).toISOString(), isCompleted: false, userId: 'user_admin_1' },
// FIX: Reverted to sub() from subDays() to resolve module export error.
        { id: 'task_2', organizationId: 'org_1', title: 'Call Jane Doe', dueDate: sub(new Date(), { days: 1 }).toISOString(), isCompleted: false, userId: 'user_team_1', contactId: 'contact_2' },
    ] as Task[],

    interactions: [
// FIX: Reverted to sub() from subDays() to resolve module export error.
        { id: 'int_1', contactId: 'contact_1', organizationId: 'org_1', userId: 'user_team_1', type: 'Appointment', date: sub(new Date(), { days: 15 }).toISOString(), notes: 'Discussed treatment plan.' },
    ] as Interaction[],

    dealStages: [
        { id: 'stage_1', organizationId: 'org_1', name: 'Qualification', order: 1 },
        { id: 'stage_2', organizationId: 'org_1', name: 'Needs Analysis', order: 2 },
        { id: 'stage_3', organizationId: 'org_1', name: 'Proposal Sent', order: 3 },
        { id: 'stage_4', organizationId: 'org_1', name: 'Negotiation', order: 4 },
        { id: 'stage_5', organizationId: 'org_1', name: 'Closed Won', order: 5 },
        { id: 'stage_6', organizationId: 'org_1', name: 'Closed Lost', order: 6 },
    ] as DealStage[],
    
    deals: [
        { id: 'deal_1', organizationId: 'org_1', name: 'Service Contract for Jane Doe', value: 5000, stageId: 'stage_2', contactId: 'contact_2', expectedCloseDate: addDays(new Date(), 30).toISOString(), createdAt: new Date().toISOString() },
    ] as Deal[],

    emailTemplates: [
        { id: 'et_1', organizationId: 'org_1', name: 'Welcome Email', subject: 'Welcome to VersaHealth!', body: 'Hi {{contactName}},\n\nWelcome! We are excited to have you.\n\nBest,\n{{userName}}' },
    ] as EmailTemplate[],
    
    workflows: [] as Workflow[],
    campaigns: [] as Campaign[],

    tickets: [
// FIX: Reverted to sub() from subDays() to resolve module export error.
        { id: 'ticket_1', organizationId: 'org_1', contactId: 'contact_1', subject: 'Billing question', description: 'I have a question about my last invoice.', status: 'Open', priority: 'Medium', assignedToId: 'user_team_1', createdAt: sub(new Date(), { days: 2 }).toISOString(), updatedAt: new Date().toISOString(), replies: [] },
    ] as Ticket[],

    customReports: [] as CustomReport[],
    dashboardWidgets: [] as DashboardWidget[],
    documents: [] as Document[],

    organizationSettings: [
        { organizationId: 'org_1', ticketSla: { responseTime: { high: 2, medium: 4, low: 8 }, resolutionTime: { high: 24, medium: 48, low: 72 } } }
    ] as OrganizationSettings[],
};

// Post-process contacts to add interactions after the main object is defined
mockDataStore.contacts.forEach(c => {
    c.interactions = mockDataStore.interactions.filter(i => i.contactId === c.id);
});