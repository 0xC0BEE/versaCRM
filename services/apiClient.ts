// This is a mock API client to simulate network requests.
// In a real application, this would make HTTP requests to a backend server.

import {
    AnyContact, Organization, User, Task, CalendarEvent, Product, Supplier, Warehouse,
    Interaction, Industry, IndustryConfig, DashboardData, EmailTemplate, Document, Workflow,
    Deal, DealStage, CustomReport, ReportType, AnyReportData, ContactStatus, Order, Transaction,
    // FIX: Imported ReportDataSource type.
    ReportDataSource
} from '../types';
import * as mockData from './mockData';
import { industryConfigs } from '../config/industryConfig';
import { generateReportData, generateDashboardData } from './reportGenerator';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to get all data for a given organization
const getOrgData = (orgId: string) => {
    const contacts = mockData.contacts.filter(c => c.organizationId === orgId);
    const products = mockData.products.filter(p => p.organizationId === orgId);
    const team = mockData.users.filter(u => u.organizationId === orgId);
    const tasks = mockData.tasks.filter(t => t.organizationId === orgId);
    const deals = mockData.deals.filter(d => d.organizationId === orgId);
    const dealStages = mockData.dealStages.filter(s => s.organizationId === orgId);
    return { contacts, products, team, tasks, deals, dealStages };
}

const apiClient = {
    login: async (email: string): Promise<User | null> => {
        await delay(500);
        const user = mockData.users.find(u => u.email === email);
        return user || null;
    },

    getOrganizations: async (): Promise<Organization[]> => {
        await delay(500);
        return mockData.organizations;
    },
    
    createOrganization: async (orgData: Omit<Organization, 'id' | 'createdAt'>): Promise<Organization> => {
        await delay(500);
        const newOrg: Organization = {
            id: `org_${Date.now()}`,
            createdAt: new Date().toISOString(),
            ...orgData,
        };
        mockData.organizations.push(newOrg);
        return newOrg;
    },
    
    updateOrganization: async (orgData: Organization): Promise<Organization> => {
        await delay(500);
        const index = mockData.organizations.findIndex(o => o.id === orgData.id);
        if (index === -1) throw new Error("Organization not found");
        mockData.organizations[index] = orgData;
        return orgData;
    },
    
    deleteOrganization: async (orgId: string): Promise<void> => {
        await delay(500);
        const index = mockData.organizations.findIndex(o => o.id === orgId);
        if (index > -1) {
            mockData.organizations.splice(index, 1);
        }
    },

    getContacts: async (orgId: string): Promise<AnyContact[]> => {
        await delay(800);
        return mockData.contacts.filter(c => c.organizationId === orgId);
    },

    getContactById: async (contactId: string): Promise<AnyContact | null> => {
        await delay(300);
        return mockData.contacts.find(c => c.id === contactId) || null;
    },
    
    createContact: async (contactData: Omit<AnyContact, 'id'>): Promise<AnyContact> => {
        await delay(500);
        const newContact: AnyContact = {
            id: `contact_${Date.now()}`,
            createdAt: new Date().toISOString(),
            interactions: [],
            orders: [],
            enrollments: [],
            transactions: [],
            structuredRecords: [],
            relationships: [],
            auditLogs: [],
            ...contactData,
        };
        mockData.contacts.push(newContact);
        return newContact;
    },
    
    updateContact: async (contactData: AnyContact): Promise<AnyContact> => {
        await delay(500);
        const index = mockData.contacts.findIndex(c => c.id === contactData.id);
        if (index === -1) throw new Error("Contact not found");
        mockData.contacts[index] = contactData;
        return contactData;
    },
    
    deleteContact: async (contactId: string): Promise<void> => {
        await delay(500);
        const index = mockData.contacts.findIndex(c => c.id === contactId);
        if (index > -1) {
            mockData.contacts.splice(index, 1);
        }
    },

    bulkDeleteContacts: async (ids: string[], orgId: string): Promise<void> => {
        await delay(1000);
        ids.forEach(id => {
            const index = mockData.contacts.findIndex(c => c.id === id && c.organizationId === orgId);
            if (index > -1) mockData.contacts.splice(index, 1);
        });
    },

    bulkUpdateContactStatus: async ({ ids, status }: { ids: string[]; status: ContactStatus }): Promise<void> => {
        await delay(1000);
        ids.forEach(id => {
            const contact = mockData.contacts.find(c => c.id === id);
            if (contact) contact.status = status;
        });
    },

    getTeamMembers: async (orgId: string): Promise<User[]> => {
        await delay(500);
        return mockData.users.filter(u => u.organizationId === orgId);
    },
    
    createTeamMember: async (userData: Omit<User, 'id'>): Promise<User> => {
        await delay(500);
        const newUser: User = { id: `user_${Date.now()}`, ...userData };
        mockData.users.push(newUser);
        return newUser;
    },

    updateTeamMember: async (userData: User): Promise<User> => {
        await delay(500);
        const index = mockData.users.findIndex(u => u.id === userData.id);
        if (index === -1) throw new Error("User not found");
        mockData.users[index] = userData;
        return userData;
    },

    getTasks: async (userId: string): Promise<Task[]> => {
        await delay(600);
        return mockData.tasks.filter(t => t.userId === userId);
    },
    
    createTask: async (taskData: Omit<Task, 'id' | 'isCompleted'>): Promise<Task> => {
        await delay(300);
        const newTask: Task = { id: `task_${Date.now()}`, isCompleted: false, ...taskData };
        mockData.tasks.push(newTask);
        return newTask;
    },
    
    updateTask: async (taskData: Task): Promise<Task> => {
        await delay(200);
        const index = mockData.tasks.findIndex(t => t.id === taskData.id);
        if (index === -1) throw new Error("Task not found");
        mockData.tasks[index] = taskData;
        return taskData;
    },
    
    deleteTask: async (taskId: string): Promise<void> => {
        await delay(200);
        const index = mockData.tasks.findIndex(t => t.id === taskId);
        if (index > -1) mockData.tasks.splice(index, 1);
    },

    getCalendarEvents: async (orgId: string): Promise<CalendarEvent[]> => {
        await delay(700);
        const orgInteractions = mockData.interactions.filter(i => i.organizationId === orgId);
        const events: CalendarEvent[] = orgInteractions
            .filter(i => i.type === 'Appointment' || i.type === 'Meeting')
            .map(i => ({
                id: i.id,
                title: `${i.type} with ${mockData.contacts.find(c=>c.id === i.contactId)?.contactName || 'Unknown'}`,
                start: new Date(i.date),
                end: new Date(new Date(i.date).getTime() + 60 * 60 * 1000), // Assume 1 hour
                userIds: [i.userId],
                contactId: i.contactId,
            }));
        return events;
    },
    
    createCalendarEvent: async (eventData: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> => {
        await delay(400);
        // This is a mock; in a real app, this would likely create an Interaction
        const newEvent: CalendarEvent = { id: `event_${Date.now()}`, ...eventData };
        return newEvent;
    },

    updateCalendarEvent: async (eventData: CalendarEvent): Promise<CalendarEvent> => {
        await delay(400);
        return eventData;
    },
    
    getProducts: async (orgId: string): Promise<Product[]> => {
        await delay(500);
        return mockData.products.filter(p => p.organizationId === orgId);
    },
    
    createProduct: async (productData: Omit<Product, 'id'>): Promise<Product> => {
        await delay(500);
        const newProduct: Product = { id: `prod_${Date.now()}`, ...productData };
        mockData.products.push(newProduct);
        return newProduct;
    },
    
    updateProduct: async (productData: Product): Promise<Product> => {
        await delay(500);
        const index = mockData.products.findIndex(p => p.id === productData.id);
        if (index === -1) throw new Error("Product not found");
        mockData.products[index] = productData;
        return productData;
    },

    deleteProduct: async (productId: string): Promise<void> => {
        await delay(500);
        const index = mockData.products.findIndex(p => p.id === productId);
        if (index > -1) mockData.products.splice(index, 1);
    },
    
    getSuppliers: async (orgId: string): Promise<Supplier[]> => {
        await delay(500);
        return mockData.suppliers.filter(s => s.organizationId === orgId);
    },
    
    getWarehouses: async (orgId: string): Promise<Warehouse[]> => {
        await delay(500);
        return mockData.warehouses.filter(w => w.organizationId === orgId);
    },
    
    // FIX: Added a function to get all interactions for an organization.
    getInteractions: async (orgId: string): Promise<Interaction[]> => {
        await delay(400);
        return mockData.interactions.filter(i => i.organizationId === orgId);
    },

    getInteractionsByContact: async (contactId: string): Promise<Interaction[]> => {
        await delay(400);
        return mockData.interactions.filter(i => i.contactId === contactId);
    },
    
    createInteraction: async (interactionData: Omit<Interaction, 'id'>): Promise<Interaction> => {
        await delay(400);
        const newInteraction: Interaction = { id: `int_${Date.now()}`, ...interactionData };
        mockData.interactions.push(newInteraction);
        
        // Also add to contact's interactions array
        const contact = mockData.contacts.find(c => c.id === interactionData.contactId);
        if (contact) {
            contact.interactions.unshift(newInteraction);
        }
        
        return newInteraction;
    },

    getIndustryConfig: async (industry: Industry): Promise<IndustryConfig> => {
        await delay(200);
        return industryConfigs[industry];
    },
    
    getDashboardData: async (industry: Industry, orgId: string): Promise<DashboardData> => {
        await delay(1000);
        const dateRange = { start: new Date(new Date().setDate(new Date().getDate() - 30)), end: new Date() };
        const contacts = mockData.contacts.filter(c => c.organizationId === orgId);
        const interactions = mockData.interactions.filter(i => i.organizationId === orgId);
        return generateDashboardData(dateRange, contacts, interactions);
    },
    
    getReportData: async (reportType: ReportType, dateRange: {start: Date, end: Date}, orgId: string): Promise<AnyReportData> => {
        await delay(1500);
        const data = getOrgData(orgId);
        return generateReportData(reportType, dateRange, data);
    },

    getDocuments: async (contactId: string): Promise<Document[]> => {
        await delay(500);
        return mockData.documents.filter(d => d.contactId === contactId);
    },

    uploadDocument: async (docData: Omit<Document, 'id'>): Promise<Document> => {
        await delay(1000);
        const newDoc: Document = { id: `doc_${Date.now()}`, ...docData };
        mockData.documents.push(newDoc);
        return newDoc;
    },

    deleteDocument: async (docId: string): Promise<void> => {
        await delay(500);
        const index = mockData.documents.findIndex(d => d.id === docId);
        if (index > -1) mockData.documents.splice(index, 1);
    },
    
    getEmailTemplates: async (orgId: string): Promise<EmailTemplate[]> => {
        await delay(300);
        return mockData.emailTemplates.filter(t => t.organizationId === orgId);
    },
    
    createEmailTemplate: async (templateData: Omit<EmailTemplate, 'id'>): Promise<EmailTemplate> => {
        await delay(300);
        const newTemplate: EmailTemplate = { id: `et_${Date.now()}`, ...templateData };
        mockData.emailTemplates.push(newTemplate);
        return newTemplate;
    },
    
    updateEmailTemplate: async (templateData: EmailTemplate): Promise<EmailTemplate> => {
        await delay(300);
        const index = mockData.emailTemplates.findIndex(t => t.id === templateData.id);
        if (index === -1) throw new Error("Template not found");
        mockData.emailTemplates[index] = templateData;
        return templateData;
    },

    deleteEmailTemplate: async (templateId: string): Promise<void> => {
        await delay(300);
        const index = mockData.emailTemplates.findIndex(t => t.id === templateId);
        if (index > -1) mockData.emailTemplates.splice(index, 1);
    },
    
    getWorkflows: async (orgId: string): Promise<Workflow[]> => {
        await delay(400);
        return mockData.workflows.filter(w => w.organizationId === orgId);
    },

    createWorkflow: async (workflowData: Omit<Workflow, 'id'>): Promise<Workflow> => {
        await delay(500);
        const newWorkflow: Workflow = { id: `wf_${Date.now()}`, ...workflowData };
        mockData.workflows.push(newWorkflow);
        return newWorkflow;
    },
    
    updateWorkflow: async (workflowData: Workflow): Promise<Workflow> => {
        await delay(500);
        const index = mockData.workflows.findIndex(w => w.id === workflowData.id);
        if (index > -1) {
            mockData.workflows[index] = workflowData;
            return workflowData;
        }
        throw new Error("Workflow not found");
    },
    
    getDeals: async (orgId: string): Promise<Deal[]> => {
        await delay(800);
        return mockData.deals.filter(d => d.organizationId === orgId);
    },
    
    getDealStages: async (orgId: string): Promise<DealStage[]> => {
        await delay(300);
        return mockData.dealStages.filter(s => s.organizationId === orgId);
    },
    
    createDeal: async (dealData: Omit<Deal, 'id' | 'createdAt'>): Promise<Deal> => {
        await delay(500);
        const newDeal: Deal = { id: `deal_${Date.now()}`, createdAt: new Date().toISOString(), ...dealData };
        mockData.deals.push(newDeal);
        return newDeal;
    },

    updateDeal: async (dealData: Deal): Promise<Deal> => {
        await delay(200); // quick update for drag-drop
        const index = mockData.deals.findIndex(d => d.id === dealData.id);
        if (index > -1) {
            mockData.deals[index] = dealData;
            return dealData;
        }
        throw new Error("Deal not found");
    },
    
    deleteDeal: async (dealId: string): Promise<void> => {
        await delay(500);
        const index = mockData.deals.findIndex(d => d.id === dealId);
        if (index > -1) mockData.deals.splice(index, 1);
    },
    
    getCustomReports: async (orgId: string): Promise<CustomReport[]> => {
        await delay(400);
        return mockData.customReports.filter(r => r.organizationId === orgId);
    },
    
    createCustomReport: async (reportData: Omit<CustomReport, 'id'>): Promise<CustomReport> => {
        await delay(500);
        const newReport: CustomReport = { id: `cr_${Date.now()}`, ...reportData };
        mockData.customReports.push(newReport);
        return newReport;
    },
    
    generateCustomReport: async (config: { dataSource: ReportDataSource, columns: string[], filters: any[] }, orgId: string): Promise<any[]> => {
        await delay(1200);
        let sourceData: any[] = [];
        if (config.dataSource === 'contacts') {
            sourceData = mockData.contacts.filter(c => c.organizationId === orgId);
        } else if (config.dataSource === 'products') {
            sourceData = mockData.products.filter(p => p.organizationId === orgId);
        }
        // Apply filters (simple version)
        const filteredData = sourceData.filter(row => {
            return config.filters.every(filter => {
                const rowValue = String(row[filter.field] || '').toLowerCase();
                const filterValue = filter.value.toLowerCase();
                switch (filter.operator) {
                    case 'is': return rowValue === filterValue;
                    case 'is_not': return rowValue !== filterValue;
                    case 'contains': return rowValue.includes(filterValue);
                    case 'does_not_contain': return !rowValue.includes(filterValue);
                    default: return true;
                }
            });
        });
        // Select columns
        return filteredData.map(row => {
            const newRow: any = {};
            config.columns.forEach(col => {
                newRow[col] = row[col];
            });
            return newRow;
        });
    },

    updateCustomFields: async ({ industry, fields }: { industry: Industry, fields: any[] }): Promise<void> => {
        await delay(500);
        if (industryConfigs[industry]) {
            industryConfigs[industry].customFields = fields;
        }
    },
    
    createOrder: async(orderData: Omit<Order, 'id'>): Promise<Order> => {
        await delay(500);
        const newOrder: Order = { id: `ord_${Date.now()}`, ...orderData };
        const contact = mockData.contacts.find(c => c.id === orderData.contactId);
        if (contact) {
            contact.orders.push(newOrder);
        }
        return newOrder;
    },
    
    updateOrder: async(orderData: Order): Promise<Order> => {
        await delay(500);
        const contact = mockData.contacts.find(c => c.id === orderData.contactId);
        if (contact) {
            const index = contact.orders.findIndex(o => o.id === orderData.id);
            if (index > -1) contact.orders[index] = orderData;
        }
        return orderData;
    },
    
    deleteOrder: async({ contactId, orderId }: { contactId: string, orderId: string }): Promise<void> => {
        await delay(500);
        const contact = mockData.contacts.find(c => c.id === contactId);
        if (contact) {
            contact.orders = contact.orders.filter(o => o.id !== orderId);
        }
    },
    
    createTransaction: async({ contactId, data }: { contactId: string, data: Omit<Transaction, 'id'> }): Promise<Transaction> => {
        await delay(500);
        const newTransaction: Transaction = { id: `trn_${Date.now()}`, ...data };
        const contact = mockData.contacts.find(c => c.id === contactId);
        if (contact) {
            contact.transactions.push(newTransaction);
        }
        return newTransaction;
    }
};

export default apiClient;