// FIX: Added comprehensive mock data for all data models.
import { User, Organization, AnyContact, Interaction, Task, Product, Supplier, Warehouse, CalendarEvent, Workflow } from '../types';
import { subDays, addDays } from 'date-fns';

export const mockUsers: User[] = [
    { id: 'user-super-1', name: 'Super Admin', email: 'super@crm.com', role: 'Super Admin' },
    { id: 'user-org-admin-1', name: 'Alice Admin', email: 'admin@crm.com', role: 'Organization Admin', organizationId: 'org-1' },
    { id: 'user-team-1', name: 'Ben Team', email: 'team@crm.com', role: 'Team Member', organizationId: 'org-1' },
    { id: 'user-client-1', name: 'Charlie Client', email: 'client@crm.com', role: 'Client', organizationId: 'org-1', contactId: 'contact-health-1' },
    { id: 'user-org-admin-2', name: 'David Finance', email: 'david@finance.com', role: 'Organization Admin', organizationId: 'org-2' },
    { id: 'user-team-2', name: 'Eva Advisor', email: 'eva@finance.com', role: 'Team Member', organizationId: 'org-2' },
];

export const mockOrganizations: Organization[] = [
    { id: 'org-1', name: 'General Health Clinic', industry: 'Health', primaryContactEmail: 'contact@health.com', createdAt: subDays(new Date(), 90).toISOString() },
    { id: 'org-2', name: 'Future Wealth Management', industry: 'Finance', primaryContactEmail: 'contact@wealth.com', createdAt: subDays(new Date(), 120).toISOString() },
    { id: 'org-3', name: 'Smith & Jones Law', industry: 'Legal', primaryContactEmail: 'info@smithjones.com', createdAt: subDays(new Date(), 150).toISOString() },
    { id: 'org-4', name: 'Generic Solutions Inc.', industry: 'Generic', primaryContactEmail: 'hello@generic.com', createdAt: subDays(new Date(), 180).toISOString() },
];

export const mockContacts: AnyContact[] = [
    {
        id: 'contact-health-1', organizationId: 'org-1', contactName: 'John Patient', email: 'john.p@email.com', phone: '555-0101', status: 'Active', leadSource: 'Referral', createdAt: subDays(new Date(), 45).toISOString(),
        customFields: { dob: '1985-05-20', insuranceProvider: 'MediCare', policyNumber: 'P123456' },
        interactions: [], orders: [], transactions: [], enrollments: [], relationships: [], structuredRecords: [], auditLogs: [{ id: 'log-1', timestamp: new Date().toISOString(), userId: 'user-org-admin-1', userName: 'Alice Admin', change: 'created the contact.' }]
    },
    {
        id: 'contact-finance-1', organizationId: 'org-2', contactName: 'Susan Investor', email: 'susan.i@email.com', phone: '555-0102', status: 'Active', leadSource: 'Web', createdAt: subDays(new Date(), 25).toISOString(),
        customFields: { netWorth: 1500000, riskProfile: 'Moderate' },
        interactions: [], orders: [], transactions: [], enrollments: [], relationships: [], structuredRecords: [], auditLogs: []
    },
];

export const mockInteractions: Interaction[] = [
    { id: 'int-1', contactId: 'contact-health-1', userId: 'user-team-1', organizationId: 'org-1', type: 'Appointment', date: subDays(new Date(), 10).toISOString(), notes: 'Annual checkup.' },
    { id: 'int-2', contactId: 'contact-finance-1', userId: 'user-team-2', organizationId: 'org-2', type: 'Meeting', date: subDays(new Date(), 5).toISOString(), notes: 'Portfolio review.' },
];

mockContacts.find(c => c.id === 'contact-health-1')!.interactions.push(mockInteractions[0]);
mockContacts.find(c => c.id === 'contact-finance-1')!.interactions.push(mockInteractions[1]);


export const mockTasks: Task[] = [
    { id: 'task-1', userId: 'user-team-1', contactId: 'contact-health-1', title: 'Follow up on lab results', dueDate: addDays(new Date(), 2).toISOString(), isCompleted: false },
    { id: 'task-2', userId: 'user-team-1', title: 'Prepare monthly report', dueDate: addDays(new Date(), 5).toISOString(), isCompleted: false },
    { id: 'task-3', userId: 'user-team-1', title: 'Call back Mr. Smith', dueDate: subDays(new Date(), 1).toISOString(), isCompleted: true },
];

export const mockProducts: Product[] = [
    { id: 'prod-1', organizationId: 'org-1', name: 'Standard Consultation', sku: 'CONS-01', category: 'Service', costPrice: 0, salePrice: 150, stockLevel: 9999 },
    { id: 'prod-2', organizationId: 'org-2', name: 'Wealth Management Fee', sku: 'WMF-01', category: 'Fee', costPrice: 0, salePrice: 5000, stockLevel: 9999 },
];
export const mockSuppliers: Supplier[] = [];
export const mockWarehouses: Warehouse[] = [];

export const mockCalendarEvents: CalendarEvent[] = [
    { id: 'calevent-1', title: 'Checkup: John Patient', start: addDays(new Date(), 3), end: addDays(new Date(), 3), contactId: 'contact-health-1', userIds: ['user-team-1'] },
    { id: 'calevent-2', title: 'Review: Susan Investor', start: addDays(new Date(), 4), end: addDays(new Date(), 4), contactId: 'contact-finance-1', userIds: ['user-team-2'] },
];

export const mockWorkflows: Workflow[] = [
    { id: 'wf-1', organizationId: 'org-1', name: 'New Patient Onboarding', isActive: true, trigger: { type: 'contactCreated' }, actions: [{ type: 'createTask', params: { title: 'Schedule initial consultation', dueInDays: 2 } }] },
];
