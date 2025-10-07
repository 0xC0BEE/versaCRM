import {
    User, Organization, AnyContact, Interaction, Order, Enrollment, Relationship, StructuredRecord, AuditLogEntry,
    Transaction, CalendarEvent, Task, Product, Supplier, Warehouse, Document, DealStage, Deal, EmailTemplate, Ticket,
    Campaign, Workflow, AdvancedWorkflow, OrganizationSettings, SLAPolicy, IndustryConfig, Industry, ContactStatus, CustomField, DashboardWidget, CustomReport
  } from '../types';
import {
    MOCK_USERS, MOCK_ORGANIZATIONS, MOCK_CONTACTS_MUTABLE, MOCK_PRODUCTS, MOCK_SUPPLIERS, MOCK_WAREHOUSES,
    MOCK_TASKS, MOCK_CALENDAR_EVENTS, MOCK_DEAL_STAGES, MOCK_DEALS, MOCK_TICKETS, MOCK_EMAIL_TEMPLATES, MOCK_ORGANIZATION_SETTINGS,
    MOCK_CAMPAIGNS, MOCK_WORKFLOWS, MOCK_ADVANCED_WORKFLOWS, MOCK_DASHBOARD_WIDGETS, MOCK_CUSTOM_REPORTS
} from './mockData';
import { industryConfigs } from '../config/industryConfig';
import { generateDashboardData } from './reportGenerator';
import { checkAndTriggerWorkflows } from './workflowService';

// Simulate API delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const apiClient = {
    // Auth
    login: async (email: string): Promise<User | null> => {
        await delay(300);
        const user = MOCK_USERS.find(u => u.email === email);
        return user || null;
    },

    // Config
    getIndustryConfig: async (industry: Industry): Promise<IndustryConfig> => {
        await delay(100);
        return industryConfigs[industry];
    },

    // Organizations
    getOrganizations: async (): Promise<Organization[]> => {
        await delay(200);
        return MOCK_ORGANIZATIONS;
    },
    createOrganization: async (orgData: Omit<Organization, 'id' | 'createdAt'>): Promise<Organization> => {
        await delay(300);
        const newOrg: Organization = {
            ...orgData,
            id: `org_${Date.now()}`,
            createdAt: new Date().toISOString(),
        };
        MOCK_ORGANIZATIONS.push(newOrg);
        return newOrg;
    },
    updateOrganization: async (orgData: Organization): Promise<Organization> => {
        await delay(300);
        const index = MOCK_ORGANIZATIONS.findIndex(o => o.id === orgData.id);
        if (index !== -1) {
            MOCK_ORGANIZATIONS[index] = orgData;
        }
        return orgData;
    },
    deleteOrganization: async (orgId: string): Promise<void> => {
        await delay(300);
        const index = MOCK_ORGANIZATIONS.findIndex(o => o.id === orgId);
        if (index !== -1) {
            MOCK_ORGANIZATIONS.splice(index, 1);
        }
    },
    
    // Users (Team Members)
    getUsersByOrg: async (orgId: string): Promise<User[]> => {
        await delay(200);
        return MOCK_USERS.filter(u => u.organizationId === orgId);
    },
    createUser: async (userData: Omit<User, 'id'>): Promise<User> => {
        await delay(300);
        const newUser: User = { ...userData, id: `user_${Date.now()}` };
        MOCK_USERS.push(newUser);
        return newUser;
    },
    updateUser: async (userData: User): Promise<User> => {
        await delay(300);
        const index = MOCK_USERS.findIndex(u => u.id === userData.id);
        if (index > -1) MOCK_USERS[index] = userData;
        return userData;
    },
    deleteUser: async (userId: string): Promise<void> => {
        await delay(300);
        const index = MOCK_USERS.findIndex(u => u.id === userId);
        if (index > -1) MOCK_USERS.splice(index, 1);
    },

    // Contacts
    getContactsByOrg: async (orgId: string): Promise<AnyContact[]> => {
        await delay(500);
        return MOCK_CONTACTS_MUTABLE.filter(c => c.organizationId === orgId);
    },
    getContactById: async (contactId: string): Promise<AnyContact | null> => {
        await delay(200);
        return MOCK_CONTACTS_MUTABLE.find(c => c.id === contactId) || null;
    },
    createContact: async (contactData: Omit<AnyContact, 'id'>): Promise<AnyContact> => {
        await delay(300);
        const newContact: AnyContact = {
            ...contactData,
            id: `contact_${Date.now()}`,
            createdAt: new Date().toISOString(),
            interactions: [], orders: [], enrollments: [], relationships: [],
            structuredRecords: [], auditLogs: [], transactions: [], documents: [],
        };
        MOCK_CONTACTS_MUTABLE.push(newContact);
        await checkAndTriggerWorkflows('contactCreated', { contact: newContact });
        return newContact;
    },
    updateContact: async (contactData: AnyContact): Promise<AnyContact> => {
        await delay(300);
        const index = MOCK_CONTACTS_MUTABLE.findIndex(c => c.id === contactData.id);
        if (index !== -1) {
            const oldContact = { ...MOCK_CONTACTS_MUTABLE[index] };
            MOCK_CONTACTS_MUTABLE[index] = { ...MOCK_CONTACTS_MUTABLE[index], ...contactData };
            const updatedContact = MOCK_CONTACTS_MUTABLE[index];

            if (oldContact.status !== updatedContact.status) {
                await checkAndTriggerWorkflows('contactStatusChanged', { 
                    contact: updatedContact, 
                    oldContact: oldContact 
                });
            }
        }
        return MOCK_CONTACTS_MUTABLE[index];
    },
    deleteContact: async (contactId: string): Promise<void> => {
        await delay(300);
        const index = MOCK_CONTACTS_MUTABLE.findIndex(c => c.id === contactId);
        if (index !== -1) MOCK_CONTACTS_MUTABLE.splice(index, 1);
    },
    
    // Interactions
    getAllInteractionsByOrg: async (orgId: string): Promise<Interaction[]> => {
        await delay(400);
        return MOCK_CONTACTS_MUTABLE.filter(c => c.organizationId === orgId).flatMap(c => c.interactions || []);
    },
    getInteractionsByContact: async (contactId: string): Promise<Interaction[]> => {
        await delay(200);
        const contact = MOCK_CONTACTS_MUTABLE.find(c => c.id === contactId);
        return contact?.interactions || [];
    },
    createInteraction: async (interactionData: Omit<Interaction, 'id'>): Promise<Interaction> => {
        await delay(300);
        const newInteraction: Interaction = { ...interactionData, id: `int_${Date.now()}` };
        const contactIndex = MOCK_CONTACTS_MUTABLE.findIndex(c => c.id === interactionData.contactId);
        if (contactIndex > -1) {
            const oldContact = MOCK_CONTACTS_MUTABLE[contactIndex];
            const updatedContact = {
                ...oldContact,
                interactions: [newInteraction, ...(oldContact.interactions || [])],
            };
            MOCK_CONTACTS_MUTABLE[contactIndex] = updatedContact;
        }
        return newInteraction;
    },

    // Tasks
    getAllTasksByOrg: async (orgId: string): Promise<Task[]> => {
        await delay(300);
        return MOCK_TASKS.filter(t => t.organizationId === orgId);
    },
    getTasksByUser: async (userId: string, orgId: string): Promise<Task[]> => {
        await delay(300);
        return MOCK_TASKS.filter(t => t.userId === userId && t.organizationId === orgId);
    },
    createTask: async (taskData: Omit<Task, 'id' | 'isCompleted'>): Promise<Task> => {
        await delay(300);
        const newTask: Task = { ...taskData, id: `task_${Date.now()}`, isCompleted: false };
        MOCK_TASKS.push(newTask);
        return newTask;
    },
    updateTask: async (taskData: Task): Promise<Task> => {
        await delay(100);
        const index = MOCK_TASKS.findIndex(t => t.id === taskData.id);
        if (index > -1) MOCK_TASKS[index] = taskData;
        return taskData;
    },
    deleteTask: async (taskId: string): Promise<void> => {
        await delay(100);
        const index = MOCK_TASKS.findIndex(t => t.id === taskId);
        if (index > -1) MOCK_TASKS.splice(index, 1);
    },

    // Calendar
    getCalendarEvents: async (orgId: string): Promise<CalendarEvent[]> => {
        await delay(400);
        return MOCK_CALENDAR_EVENTS.map(e => ({...e, start: new Date(e.start), end: new Date(e.end)})); // Date objects for calendar
    },
    createCalendarEvent: async (eventData: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> => {
        await delay(300);
        const newEvent: CalendarEvent = { ...eventData, id: `event_${Date.now()}` };
        MOCK_CALENDAR_EVENTS.push(newEvent);
        return newEvent;
    },
    updateCalendarEvent: async (eventData: CalendarEvent): Promise<CalendarEvent> => {
        await delay(300);
        const index = MOCK_CALENDAR_EVENTS.findIndex(e => e.id === eventData.id);
        if (index > -1) MOCK_CALENDAR_EVENTS[index] = eventData;
        return eventData;
    },
    
    // Inventory (Products, Suppliers, Warehouses)
    getProducts: async (orgId: string): Promise<Product[]> => {
        await delay(400);
        return MOCK_PRODUCTS.filter(p => p.organizationId === orgId);
    },
    createProduct: async(productData: Omit<Product, 'id'>): Promise<Product> => {
        await delay(300);
        const newProduct: Product = { ...productData, id: `prod_${Date.now()}` };
        MOCK_PRODUCTS.push(newProduct);
        return newProduct;
    },
    updateProduct: async(productData: Product): Promise<Product> => {
        await delay(300);
        const index = MOCK_PRODUCTS.findIndex(p => p.id === productData.id);
        if (index > -1) MOCK_PRODUCTS[index] = productData;
        return productData;
    },
    deleteProduct: async(productId: string): Promise<void> => {
        await delay(300);
        const index = MOCK_PRODUCTS.findIndex(p => p.id === productId);
        if (index > -1) MOCK_PRODUCTS.splice(index, 1);
    },

    getSuppliers: async (orgId: string): Promise<Supplier[]> => {
        await delay(400);
        return MOCK_SUPPLIERS.filter(s => s.organizationId === orgId);
    },
    getWarehouses: async (orgId: string): Promise<Warehouse[]> => {
        await delay(400);
        return MOCK_WAREHOUSES.filter(w => w.organizationId === orgId);
    },
    
    // Deals
    getDeals: async (orgId: string): Promise<Deal[]> => {
        await delay(400);
        return MOCK_DEALS.filter(d => d.organizationId === orgId);
    },
    getDealStages: async (orgId: string): Promise<DealStage[]> => {
        await delay(100);
        return MOCK_DEAL_STAGES.filter(ds => ds.organizationId === orgId);
    },
    createDeal: async (dealData: Omit<Deal, 'id' | 'createdAt'>): Promise<Deal> => {
        await delay(300);
        const newDeal: Deal = { ...dealData, id: `deal_${Date.now()}`, createdAt: new Date().toISOString() };
        MOCK_DEALS.push(newDeal);
        return newDeal;
    },
    updateDeal: async (dealData: Deal): Promise<Deal> => {
        await delay(100);
        const index = MOCK_DEALS.findIndex(d => d.id === dealData.id);
        if (index > -1) {
            const oldDeal = { ...MOCK_DEALS[index] };
            MOCK_DEALS[index] = dealData;
            
            if (oldDeal.stageId !== dealData.stageId) {
                const contact = MOCK_CONTACTS_MUTABLE.find(c => c.id === dealData.contactId);
                if (contact) {
                    await checkAndTriggerWorkflows('dealStageChanged', {
                        contact,
                        deal: dealData,
                        oldDeal: oldDeal
                    });
                }
            }
        }
        return dealData;
    },
    deleteDeal: async (dealId: string): Promise<void> => {
        await delay(300);
        const index = MOCK_DEALS.findIndex(d => d.id === dealId);
        if (index > -1) MOCK_DEALS.splice(index, 1);
    },

    // Tickets
    getTickets: async (orgId: string): Promise<Ticket[]> => {
        await delay(400);
        return MOCK_TICKETS.filter(t => t.organizationId === orgId);
    },
    createTicket: async (ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'replies'>): Promise<Ticket> => {
        await delay(300);
        const now = new Date().toISOString();
        const newTicket: Ticket = {
            ...ticketData,
            id: `ticket_${Date.now()}`,
            createdAt: now,
            updatedAt: now,
            replies: [],
        };
        MOCK_TICKETS.push(newTicket);

        const contact = MOCK_CONTACTS_MUTABLE.find(c => c.id === newTicket.contactId);
        if (contact) {
            await checkAndTriggerWorkflows('ticketCreated', {
                contact,
                ticket: newTicket,
            });
        }

        return newTicket;
    },
    updateTicket: async (ticketData: Ticket): Promise<Ticket> => {
        await delay(300);
        const index = MOCK_TICKETS.findIndex(t => t.id === ticketData.id);
        if (index > -1) {
            const oldTicket = { ...MOCK_TICKETS[index] };
            MOCK_TICKETS[index] = { ...ticketData, updatedAt: new Date().toISOString() };
            const updatedTicket = MOCK_TICKETS[index];

            if (oldTicket.status !== updatedTicket.status) {
                const contact = MOCK_CONTACTS_MUTABLE.find(c => c.id === updatedTicket.contactId);
                if (contact) {
                    await checkAndTriggerWorkflows('ticketStatusChanged', {
                        contact,
                        ticket: updatedTicket,
                        oldTicket,
                    });
                }
            }
        }
        return MOCK_TICKETS[index];
    },
    addTicketReply: async (ticketId: string, replyData: Omit<Ticket['replies'][0], 'id' | 'timestamp'>): Promise<Ticket> => {
        await delay(300);
        const index = MOCK_TICKETS.findIndex(t => t.id === ticketId);
        if (index > -1) {
            const ticketToUpdate = MOCK_TICKETS[index];
            const newReply = { ...replyData, id: `reply_${Date.now()}`, timestamp: new Date().toISOString() };
            
            const updatedTicket = {
                ...ticketToUpdate,
                replies: [...ticketToUpdate.replies, newReply],
                updatedAt: new Date().toISOString(),
            };

            if (replyData.userId.startsWith('user_') && updatedTicket.status === 'New') {
                updatedTicket.status = 'Open';
            }
            MOCK_TICKETS[index] = updatedTicket;
            return updatedTicket;
        }
        throw new Error(`Ticket with ID ${ticketId} not found.`);
    },
    
    // Settings
    getOrganizationSettings: async (orgId: string): Promise<OrganizationSettings> => {
        await delay(100);
        return MOCK_ORGANIZATION_SETTINGS;
    },
    updateOrganizationSettings: async (settings: Partial<Omit<OrganizationSettings, 'id' | 'organizationId'>>): Promise<OrganizationSettings> => {
        await delay(300);
        Object.assign(MOCK_ORGANIZATION_SETTINGS, settings);
        return MOCK_ORGANIZATION_SETTINGS;
    },
    getEmailTemplates: async (orgId: string): Promise<EmailTemplate[]> => {
        await delay(200);
        return MOCK_EMAIL_TEMPLATES.filter(t => t.organizationId === orgId);
    },
    createEmailTemplate: async (templateData: Omit<EmailTemplate, 'id'>): Promise<EmailTemplate> => {
        await delay(300);
        const newTemplate: EmailTemplate = { ...templateData, id: `et_${Date.now()}` };
        MOCK_EMAIL_TEMPLATES.push(newTemplate);
        return newTemplate;
    },
    updateEmailTemplate: async (templateData: EmailTemplate): Promise<EmailTemplate> => {
        await delay(300);
        const index = MOCK_EMAIL_TEMPLATES.findIndex(t => t.id === templateData.id);
        if (index > -1) MOCK_EMAIL_TEMPLATES[index] = templateData;
        return templateData;
    },
    deleteEmailTemplate: async (templateId: string): Promise<void> => {
        await delay(300);
        const index = MOCK_EMAIL_TEMPLATES.findIndex(t => t.id === templateId);
        if (index > -1) MOCK_EMAIL_TEMPLATES.splice(index, 1);
    },
    
    // Campaigns
    getCampaigns: async (orgId: string): Promise<Campaign[]> => {
        await delay(400);
        return MOCK_CAMPAIGNS.filter(c => c.organizationId === orgId);
    },
    createCampaign: async(campaignData: Omit<Campaign, 'id'>): Promise<Campaign> => {
        await delay(300);
        const newCampaign: Campaign = { ...campaignData, id: `camp_${Date.now()}` };
        MOCK_CAMPAIGNS.push(newCampaign);
        return newCampaign;
    },
    updateCampaign: async(campaignData: Campaign): Promise<Campaign> => {
        await delay(300);
        const index = MOCK_CAMPAIGNS.findIndex(c => c.id === campaignData.id);
        if (index > -1) MOCK_CAMPAIGNS[index] = campaignData;
        return campaignData;
    },
    
    // Workflows
    getWorkflows: async (orgId: string): Promise<Workflow[]> => {
        await delay(200);
        return MOCK_WORKFLOWS.filter(w => w.organizationId === orgId);
    },
    getAdvancedWorkflows: async (orgId: string): Promise<AdvancedWorkflow[]> => {
        await delay(200);
        return MOCK_ADVANCED_WORKFLOWS.filter(w => w.organizationId === orgId);
    },
    
    // Documents
    getDocuments: async (contactId: string): Promise<Document[]> => {
        await delay(200);
        const contact = MOCK_CONTACTS_MUTABLE.find(c => c.id === contactId);
        return contact?.documents || [];
    },
    uploadDocument: async (docData: Omit<Document, 'id' | 'uploadDate'>): Promise<Document> => {
        await delay(500);
        const newDoc: Document = { ...docData, id: `doc_${Date.now()}`, uploadDate: new Date().toISOString() };
        const contactIndex = MOCK_CONTACTS_MUTABLE.findIndex(c => c.id === docData.contactId);
        if (contactIndex > -1) {
            MOCK_CONTACTS_MUTABLE[contactIndex].documents?.push(newDoc);
        }
        return newDoc;
    },
    deleteDocument: async (docId: string): Promise<void> => {
        await delay(300);
        for (const contact of MOCK_CONTACTS_MUTABLE) {
            const docIndex = contact.documents?.findIndex(d => d.id === docId) ?? -1;
            if (docIndex > -1) {
                contact.documents?.splice(docIndex, 1);
                break;
            }
        }
    },

    // Custom Reports
    getCustomReports: async (orgId: string): Promise<CustomReport[]> => {
        await delay(200);
        return MOCK_CUSTOM_REPORTS;
    },
    createCustomReport: async (reportData: Omit<CustomReport, 'id'>): Promise<CustomReport> => {
        await delay(300);
        const newReport = { ...reportData, id: `cr_${Date.now()}` };
        MOCK_CUSTOM_REPORTS.push(newReport);
        return newReport;
    },
    generateCustomReport: async (config: CustomReport['config'], orgId: string): Promise<any[]> => {
        await delay(500);
        let sourceData: any[] = [];
        if (config.dataSource === 'contacts') {
            sourceData = MOCK_CONTACTS_MUTABLE.filter(c => c.organizationId === orgId);
        } else if (config.dataSource === 'products') {
            sourceData = MOCK_PRODUCTS.filter(p => p.organizationId === orgId);
        }
        // Apply filters
        const filteredData = sourceData.filter(item => 
            config.filters.every(filter => {
                const itemValue = String(item[filter.field] || '').toLowerCase();
                const filterValue = filter.value.toLowerCase();
                switch (filter.operator) {
                    case 'is': return itemValue === filterValue;
                    case 'is_not': return itemValue !== filterValue;
                    case 'contains': return itemValue.includes(filterValue);
                    case 'does_not_contain': return !itemValue.includes(filterValue);
                    default: return true;
                }
            })
        );
        // Select columns
        return filteredData.map(item => {
            const selectedColumns: Record<string, any> = {};
            config.columns.forEach(col => {
                selectedColumns[col] = item[col];
            });
            return selectedColumns;
        });
    },

    updateCustomFields: async ({ industry, fields }: { industry: Industry, fields: CustomField[] }): Promise<IndustryConfig> => {
        await delay(300);
        industryConfigs[industry].customFields = fields;
        return industryConfigs[industry];
    },
    createOrder: async (orderData: Omit<Order, 'id'>): Promise<Order> => {
        await delay(300);
        const newOrder: Order = { ...orderData, id: `order_${Date.now()}` };
        const contactIndex = MOCK_CONTACTS_MUTABLE.findIndex(c => c.id === orderData.contactId);
        if (contactIndex > -1) {
            MOCK_CONTACTS_MUTABLE[contactIndex].orders?.push(newOrder);
        }
        return newOrder;
    },
    updateOrder: async (orderData: Order): Promise<Order> => {
        await delay(300);
        const contactIndex = MOCK_CONTACTS_MUTABLE.findIndex(c => c.id === orderData.contactId);
        if (contactIndex > -1) {
            const orderIndex = MOCK_CONTACTS_MUTABLE[contactIndex].orders?.findIndex(o => o.id === orderData.id) ?? -1;
            if (orderIndex > -1) {
                MOCK_CONTACTS_MUTABLE[contactIndex].orders![orderIndex] = orderData;
            }
        }
        return orderData;
    },
    deleteOrder: async ({ contactId, orderId }: { contactId: string, orderId: string }): Promise<void> => {
        await delay(300);
        const contactIndex = MOCK_CONTACTS_MUTABLE.findIndex(c => c.id === contactId);
        if (contactIndex > -1) {
            const orderIndex = MOCK_CONTACTS_MUTABLE[contactIndex].orders?.findIndex(o => o.id === orderId) ?? -1;
            if (orderIndex > -1) {
                MOCK_CONTACTS_MUTABLE[contactIndex].orders?.splice(orderIndex, 1);
            }
        }
    },
    createTransaction: async ({ contactId, data }: { contactId: string, data: Omit<Transaction, 'id'> }): Promise<Transaction> => {
        await delay(300);
        const newTransaction: Transaction = { ...data, id: `trans_${Date.now()}` };
        const contactIndex = MOCK_CONTACTS_MUTABLE.findIndex(c => c.id === contactId);
        if (contactIndex > -1) {
            MOCK_CONTACTS_MUTABLE[contactIndex].transactions?.push(newTransaction);
        }
        return newTransaction;
    },
    createWorkflow: async (workflowData: Omit<Workflow, 'id'>): Promise<Workflow> => {
        await delay(300);
        const newWorkflow: Workflow = { ...workflowData, id: `wf_${Date.now()}` };
        MOCK_WORKFLOWS.push(newWorkflow);
        return newWorkflow;
    },
    updateWorkflow: async (workflowData: Workflow): Promise<Workflow> => {
        await delay(300);
        const index = MOCK_WORKFLOWS.findIndex(w => w.id === workflowData.id);
        if (index > -1) MOCK_WORKFLOWS[index] = workflowData;
        return workflowData;
    },
    createAdvancedWorkflow: async (workflowData: Omit<AdvancedWorkflow, 'id'>): Promise<AdvancedWorkflow> => {
        await delay(300);
        const newWorkflow: AdvancedWorkflow = { ...workflowData, id: `awf_${Date.now()}` };
        MOCK_ADVANCED_WORKFLOWS.push(newWorkflow);
        return newWorkflow;
    },
    updateAdvancedWorkflow: async (workflowData: AdvancedWorkflow): Promise<AdvancedWorkflow> => {
        await delay(300);
        const index = MOCK_ADVANCED_WORKFLOWS.findIndex(w => w.id === workflowData.id);
        if (index > -1) MOCK_ADVANCED_WORKFLOWS[index] = workflowData;
        return workflowData;
    },
    deleteAdvancedWorkflow: async (workflowId: string): Promise<void> => {
        await delay(300);
        const index = MOCK_ADVANCED_WORKFLOWS.findIndex(w => w.id === workflowId);
        if (index > -1) MOCK_ADVANCED_WORKFLOWS.splice(index, 1);
    },
    launchCampaign: async (campaignId: string): Promise<Campaign> => {
        await delay(300);
        const index = MOCK_CAMPAIGNS.findIndex(c => c.id === campaignId);
        if (index > -1) {
            MOCK_CAMPAIGNS[index].status = 'Active';
            // Simulate sending
            MOCK_CAMPAIGNS[index].stats.sent = MOCK_CAMPAIGNS[index].stats.recipients;
        }
        return MOCK_CAMPAIGNS[index];
    },
    getDashboardWidgets: async (orgId: string): Promise<DashboardWidget[]> => {
        await delay(100);
        return MOCK_DASHBOARD_WIDGETS;
    },
    removeDashboardWidget: async (widgetId: string): Promise<void> => {
        await delay(300);
        const index = MOCK_DASHBOARD_WIDGETS.findIndex(w => w.id === widgetId);
        if (index > -1) MOCK_DASHBOARD_WIDGETS.splice(index, 1);
    },
    bulkDeleteContacts: async(ids: string[]): Promise<void> => {
        await delay(500);
        // FIX: Cannot reassign an imported variable. Mutate the array in place.
        for (let i = MOCK_CONTACTS_MUTABLE.length - 1; i >= 0; i--) {
            if (ids.includes(MOCK_CONTACTS_MUTABLE[i].id)) {
                MOCK_CONTACTS_MUTABLE.splice(i, 1);
            }
        }
    },
    bulkUpdateContactStatus: async({ids, status}: {ids: string[], status: ContactStatus}): Promise<void> => {
        await delay(500);
        // FIX: Cannot reassign an imported variable. Mutate the array in place.
        MOCK_CONTACTS_MUTABLE.forEach((c, index) => {
            if (ids.includes(c.id)) {
                MOCK_CONTACTS_MUTABLE[index] = { ...c, status };
            }
        });
    }
};


export default apiClient;