// FIX: Created the complete mock data file.
// FIX: Corrected the import path for types to be a valid relative path.
import { User, Organization, AnyContact, Interaction, CalendarEvent, Task, Product, Supplier, Warehouse, EmailTemplate, CustomReport, Industry, Workflow, Document } from '../types';
import { faker } from '@faker-js/faker';

/**
 * Creates a self-persisting array that automatically loads from and saves to localStorage.
 * Any method that mutates the array (push, splice, etc.) or direct index assignment
 * will trigger a save to localStorage.
 * @param key The key for localStorage.
 * @param factory A function that returns the initial array data if nothing is in storage.
 */
const createPersistedArray = <T>(key: string, factory: () => T[]): T[] => {
    let internalData: T[];
    try {
        const stored = localStorage.getItem(key);
        if (stored) {
            internalData = JSON.parse(stored);
        } else {
            internalData = factory();
            localStorage.setItem(key, JSON.stringify(internalData));
        }
    } catch (e) {
        console.error(`Failed to load or parse ${key} from localStorage. Resetting.`, e);
        internalData = factory();
        localStorage.setItem(key, JSON.stringify(internalData));
    }

    const persist = () => {
        try {
            localStorage.setItem(key, JSON.stringify(internalData));
        } catch (e) {
            console.error(`Failed to persist ${key} to localStorage.`, e);
        }
    };

    return new Proxy(internalData, {
        set(target, property, value) {
            const result = Reflect.set(target, property, value);
            persist();
            return result;
        },
        get(target, property) {
            const value = Reflect.get(target, property);
            if (typeof value === 'function') {
                const mutatingMethods = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'];
                if (mutatingMethods.includes(property as string)) {
                    return function(...args: any[]) {
                        const result = (target as any)[property](...args);
                        persist();
                        return result;
                    };
                }
            }
            return value;
        },
    });
};


// --- ORGANIZATIONS & USERS ---
export let mockOrganizations: Organization[] = createPersistedArray('mockOrganizations', () => [
    { id: 'org_1', name: 'St. Jude Children\'s Research Hospital', industry: 'Health', primaryContactEmail: 'contact@stjude.com', createdAt: faker.date.past().toISOString() },
    { id: 'org_2', name: 'Morgan Stanley', industry: 'Finance', primaryContactEmail: 'support@morganstanley.com', createdAt: faker.date.past().toISOString() },
    { id: 'org_3', name: 'Generic Solutions Inc.', industry: 'Generic', primaryContactEmail: 'hello@genericsolutions.com', createdAt: faker.date.past().toISOString() },
]);

export let mockUsers: User[] = createPersistedArray('mockUsers', () => [
    { id: 'user_super', name: 'Super Admin', email: 'super@crm.com', role: 'Super Admin' },
    { id: 'user_admin_1', name: 'Alice Admin', email: 'admin@crm.com', role: 'Organization Admin', organizationId: 'org_1' },
    { id: 'user_team_1', name: 'Ben Team', email: 'team@crm.com', role: 'Team Member', organizationId: 'org_1' },
    { id: 'user_client_1', name: 'John Patient', email: 'client@crm.com', role: 'Client', organizationId: 'org_1', contactId: 'contact_1' },
]);

// --- DOCUMENTS ---
export let mockDocuments: Document[] = createPersistedArray('mockDocuments', () => []);

// --- MAIN DATA ENTITIES ---
export let mockContacts: AnyContact[] = createPersistedArray('mockContacts', () => {
    const contacts = Array.from({ length: 50 }, (_, i) => {
        const org = mockOrganizations[i % mockOrganizations.length];
        return {
            id: `contact_${i + 1}`,
            organizationId: org.id,
            contactName: faker.person.fullName(),
            email: faker.internet.email(),
            phone: faker.phone.number(),
            status: faker.helpers.arrayElement(['Lead', 'Active', 'Inactive']),
            leadSource: faker.helpers.arrayElement(['Web', 'Referral', 'Event', 'Manual']),
            createdAt: faker.date.past().toISOString(),
            avatar: `https://i.pravatar.cc/150?u=contact_${i+1}`,
            customFields: {},
            interactions: [],
            orders: [],
            transactions: [],
            enrollments: [],
            structuredRecords: [],
            relationships: [],
            auditLogs: [{ id: `log_${i}`, timestamp: new Date().toISOString(), userId: 'user_admin_1', userName: 'Org Admin', change: 'created contact.' }],
            documents: [],
        };
    });
    // Ensure the client user's contact exists
    contacts[0].id = 'contact_1';
    contacts[0].contactName = 'John Patient';
    contacts[0].email = 'client@crm.com';
    contacts[0].organizationId = 'org_1';
    return contacts;
});


export let mockInteractions: Interaction[] = createPersistedArray('mockInteractions', () => Array.from({ length: 100 }, (_, i) => {
    const contact = mockContacts[i % mockContacts.length];
    const user = mockUsers.find(u => u.organizationId === contact.organizationId && u.role !== 'Client') || mockUsers[1];
    return {
        id: `interaction_${i + 1}`,
        contactId: contact.id,
        userId: user.id,
        organizationId: contact.organizationId,
        type: faker.helpers.arrayElement(['Email', 'Call', 'Meeting', 'Note', 'Appointment']),
        date: faker.date.recent({ days: 90 }).toISOString(),
        notes: faker.lorem.paragraph(),
    };
}));

export let mockCalendarEvents: CalendarEvent[] = createPersistedArray('mockCalendarEvents', () => mockInteractions
    .filter(i => i.type === 'Appointment' || i.type === 'Meeting')
    .map((i, idx) => ({
        id: `event_${idx + 1}`,
        title: `${i.type} with ${mockContacts.find(c => c.id === i.contactId)?.contactName}`,
        start: new Date(i.date),
        end: new Date(new Date(i.date).getTime() + 60 * 60 * 1000), // 1 hour later
        userIds: [i.userId],
        contactId: i.contactId,
        organizationId: i.organizationId,
    })));

export let mockTasks: Task[] = createPersistedArray('mockTasks', () => Array.from({ length: 20 }, (_, i) => {
    const user = mockUsers.find(u => u.role === 'Team Member') || mockUsers[2];
    return {
        id: `task_${i + 1}`,
        title: faker.lorem.sentence(5),
        dueDate: faker.date.future().toISOString(),
        isCompleted: faker.datatype.boolean(),
        userId: user.id,
        organizationId: user.organizationId!,
    };
}));

// --- INVENTORY ---
export let mockProducts: Product[] = createPersistedArray('mockProducts', () => Array.from({ length: 30 }, (_, i) => ({
    id: `prod_${i + 1}`,
    organizationId: mockOrganizations[i % mockOrganizations.length].id,
    name: faker.commerce.productName(),
    sku: `SKU-${faker.string.alphanumeric(8).toUpperCase()}`,
    category: faker.commerce.department(),
    description: faker.commerce.productDescription(),
    costPrice: parseFloat(faker.commerce.price({ min: 10, max: 100 })),
    salePrice: parseFloat(faker.commerce.price({ min: 100, max: 500 })),
    stockLevel: faker.number.int({ min: 0, max: 1000 }),
})));

export let mockSuppliers: Supplier[] = createPersistedArray('mockSuppliers', () => Array.from({ length: 10 }, (_, i) => ({
    id: `sup_${i + 1}`,
    organizationId: mockOrganizations[i % mockOrganizations.length].id,
    name: faker.company.name(),
    contactPerson: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
})));

export let mockWarehouses: Warehouse[] = createPersistedArray('mockWarehouses', () => Array.from({ length: 5 }, (_, i) => ({
    id: `wh_${i + 1}`,
    organizationId: mockOrganizations[i % mockOrganizations.length].id,
    name: `${faker.location.city()} Distribution Center`,
    location: faker.location.streetAddress(true),
})));

// --- CONFIGURATION ---
export let mockEmailTemplates: EmailTemplate[] = createPersistedArray('mockEmailTemplates', () => [
    { id: 'template_1', organizationId: 'org_1', name: 'Welcome Email', subject: 'Welcome to St. Jude!', body: 'Hello {{contactName}},\n\nWe are so glad to have you with us.\n\nBest,\n{{userName}}' },
    { id: 'template_2', organizationId: 'org_1', name: 'Follow-up', subject: 'Following up on our appointment', body: 'Hi {{contactName}},\n\nJust wanted to follow up on our recent appointment. Please let me know if you have any questions.\n\nThanks,\n{{userName}}' },
]);

export let mockCustomReports: CustomReport[] = createPersistedArray('mockCustomReports', () => [
    { id: 'report_1', organizationId: 'org_1', name: 'Active Health Contacts', config: { dataSource: 'contacts', columns: ['contactName', 'email', 'status'], filters: [{ field: 'status', operator: 'is', value: 'Active' }] } },
]);

export let mockWorkflows: Workflow[] = createPersistedArray('mockWorkflows', () => [
    {
        id: 'wf_1',
        organizationId: 'org_1',
        name: 'New Patient Onboarding',
        isActive: true,
        trigger: { type: 'contactCreated' },
        actions: [
            { type: 'createTask', taskTitle: 'Complete new patient intake form', assigneeId: 'user_team_1' }
        ]
    },
    {
        id: 'wf_2',
        organizationId: 'org_1',
        name: 'Send Welcome Email to Active Patients',
        isActive: true,
        trigger: { type: 'contactStatusChanged', fromStatus: 'Lead', toStatus: 'Active' },
        actions: [
            { type: 'sendEmail', emailTemplateId: 'template_1' }
        ]
    }
]);