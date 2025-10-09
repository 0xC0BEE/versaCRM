// This is a mock API client to simulate a backend.
// In a real application, this would make HTTP requests to a server.
import {
    MOCK_USERS, MOCK_ORGANIZATIONS, MOCK_CONTACTS_MUTABLE, MOCK_ROLES, MOCK_TASKS, MOCK_CALENDAR_EVENTS, MOCK_PRODUCTS, MOCK_DEALS, MOCK_DEAL_STAGES, MOCK_EMAIL_TEMPLATES, MOCK_INTERACTIONS, MOCK_WORKFLOWS, MOCK_ADVANCED_WORKFLOWS, MOCK_ORGANIZATION_SETTINGS, MOCK_API_KEYS, MOCK_TICKETS, MOCK_FORMS, MOCK_CAMPAIGNS, MOCK_DOCUMENTS, MOCK_LANDING_PAGES, MOCK_CUSTOM_REPORTS, MOCK_DASHBOARD_WIDGETS, MOCK_SUPPLIERS, MOCK_WAREHOUSES, MOCK_ANONYMOUS_SESSIONS
} from './mockData';
import {
    User, Organization, AnyContact, ContactStatus, CustomRole, Task, CalendarEvent, Product, Deal, DealStage, EmailTemplate, Interaction, Workflow, AdvancedWorkflow, OrganizationSettings, ApiKey, Ticket, PublicForm, Campaign, Document, LandingPage, CustomReport, ReportDataSource, FilterCondition, DashboardWidget, Industry, Supplier, Warehouse
} from '../types';
import { generateDashboardData } from './reportGenerator';
import { industryConfigs } from '../config/industryConfig';
import { checkAndTriggerWorkflows } from './workflowService';
import { recalculateAllScores, recalculateScoreForContact } from './leadScoringService';
import { campaignSchedulerService } from './campaignSchedulerService';
import { campaignService } from './campaignService';
import { addDays } from 'date-fns';

// --- Helper Functions ---
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const apiClient = {
    // --- AUTH ---
    login: async (email: string): Promise<User | null> => {
        await delay(500);
        const user = MOCK_USERS.find(u => u.email === email);
        return user ? { ...user } : null;
    },

    // --- ORGANIZATIONS ---
    getOrganizations: async (): Promise<Organization[]> => {
        await delay(300);
        return [...MOCK_ORGANIZATIONS];
    },
    createOrganization: async (orgData: Omit<Organization, 'id' | 'createdAt'>): Promise<Organization> => {
        await delay(400);
        const newOrg: Organization = {
            ...orgData,
            id: `org_${Date.now()}`,
            createdAt: new Date().toISOString(),
        };
        MOCK_ORGANIZATIONS.push(newOrg);
        return newOrg;
    },
    updateOrganization: async (orgData: Organization): Promise<Organization> => {
        await delay(400);
        const index = MOCK_ORGANIZATIONS.findIndex(o => o.id === orgData.id);
        if (index > -1) {
            MOCK_ORGANIZATIONS[index] = { ...MOCK_ORGANIZATIONS[index], ...orgData };
            return MOCK_ORGANIZATIONS[index];
        }
        throw new Error("Organization not found");
    },
    deleteOrganization: async (orgId: string): Promise<void> => {
        await delay(400);
        // FIX: Mutate array in place to avoid reassigning an import.
        const index = MOCK_ORGANIZATIONS.findIndex(o => o.id === orgId);
        if (index > -1) {
            MOCK_ORGANIZATIONS.splice(index, 1);
        }
        return;
    },

    // --- CONTACTS ---
    getContacts: async (orgId: string): Promise<AnyContact[]> => {
        await delay(500);
        return MOCK_CONTACTS_MUTABLE.filter(c => c.organizationId === orgId);
    },
    getContactById: async (contactId: string): Promise<AnyContact | null> => {
        await delay(200);
        const contact = MOCK_CONTACTS_MUTABLE.find(c => c.id === contactId);
        return contact ? { ...contact } : null;
    },
    createContact: async (contactData: Omit<AnyContact, 'id'>): Promise<AnyContact> => {
        await delay(400);
        const newContact: AnyContact = {
            ...contactData,
            id: `contact_${Date.now()}`,
            createdAt: new Date().toISOString(),
        };
        MOCK_CONTACTS_MUTABLE.unshift(newContact);
        checkAndTriggerWorkflows('contactCreated', { contact: newContact });
        campaignService.checkAndEnrollInCampaigns(newContact);
        return newContact;
    },
    updateContact: async (contactData: AnyContact): Promise<AnyContact> => {
        await delay(400);
        const index = MOCK_CONTACTS_MUTABLE.findIndex(c => c.id === contactData.id);
        if (index > -1) {
            const oldContact = { ...MOCK_CONTACTS_MUTABLE[index] };
            MOCK_CONTACTS_MUTABLE[index] = { ...MOCK_CONTACTS_MUTABLE[index], ...contactData };
            if (oldContact.status !== contactData.status) {
                checkAndTriggerWorkflows('contactStatusChanged', { contact: contactData, oldContact });
            }
            recalculateScoreForContact(contactData.id);
            return MOCK_CONTACTS_MUTABLE[index];
        }
        throw new Error("Contact not found");
    },
    deleteContact: async (contactId: string): Promise<void> => {
        await delay(400);
        // FIX: Mutate array in place to avoid reassigning an import.
        const index = MOCK_CONTACTS_MUTABLE.findIndex(c => c.id === contactId);
        if (index > -1) {
            MOCK_CONTACTS_MUTABLE.splice(index, 1);
        }
        return;
    },
    bulkDeleteContacts: async (ids: string[]): Promise<void> => {
        await delay(600);
        // FIX: Mutate array in place to avoid reassigning an import.
        let i = MOCK_CONTACTS_MUTABLE.length;
        while (i--) {
            if (ids.includes(MOCK_CONTACTS_MUTABLE[i].id)) {
                MOCK_CONTACTS_MUTABLE.splice(i, 1);
            }
        }
        return;
    },
    bulkUpdateContactStatus: async ({ ids, status }: { ids: string[]; status: ContactStatus }): Promise<void> => {
        await delay(600);
        MOCK_CONTACTS_MUTABLE.forEach((contact, index) => {
            if (ids.includes(contact.id)) {
                MOCK_CONTACTS_MUTABLE[index].status = status;
            }
        });
        return;
    },
    
    // --- TEAM & ROLES ---
    getTeamMembers: async (orgId: string): Promise<User[]> => {
        await delay(300);
        return MOCK_USERS.filter(u => u.organizationId === orgId && !u.isClient);
    },
    getRoles: async (orgId: string): Promise<CustomRole[]> => {
        await delay(200);
        return MOCK_ROLES.filter(r => r.organizationId === orgId || r.organizationId === '*');
    },
    createUser: async(userData: Omit<User, 'id'>): Promise<User> => {
        const newUser: User = { ...userData, id: `user_${Date.now()}`};
        MOCK_USERS.push(newUser);
        return newUser;
    },
    updateUser: async(userData: User): Promise<User> => {
        const index = MOCK_USERS.findIndex(u => u.id === userData.id);
        if (index > -1) {
            MOCK_USERS[index] = { ...MOCK_USERS[index], ...userData };
            return MOCK_USERS[index];
        }
        throw new Error("User not found");
    },
    deleteUser: async(userId: string): Promise<void> => {
        // FIX: Mutate array in place to avoid reassigning an import.
        const index = MOCK_USERS.findIndex(u => u.id === userId);
        if (index > -1) {
            MOCK_USERS.splice(index, 1);
        }
        return;
    },
    createRole: async(roleData: Omit<CustomRole, 'id'>): Promise<CustomRole> => {
        const newRole: CustomRole = { ...roleData, id: `role_${Date.now()}` };
        MOCK_ROLES.push(newRole);
        return newRole;
    },
    updateRole: async(roleData: CustomRole): Promise<CustomRole> => {
        const index = MOCK_ROLES.findIndex(r => r.id === roleData.id);
        if(index > -1) {
            MOCK_ROLES[index] = { ...MOCK_ROLES[index], ...roleData };
            return MOCK_ROLES[index];
        }
        throw new Error("Role not found");
    },
     deleteRole: async(roleId: string): Promise<void> => {
        // FIX: Mutate array in place to avoid reassigning an import.
        const index = MOCK_ROLES.findIndex(r => r.id === roleId);
        if (index > -1) {
            MOCK_ROLES.splice(index, 1);
        }
        return;
    },


    // --- INTERACTIONS ---
    getInteractions: async (orgId: string): Promise<Interaction[]> => {
        await delay(400);
        return MOCK_INTERACTIONS.filter(i => i.organizationId === orgId);
    },
    getInteractionsByContact: async (contactId: string): Promise<Interaction[]> => {
        await delay(300);
        const contact = MOCK_CONTACTS_MUTABLE.find(c => c.id === contactId);
        return contact?.interactions || [];
    },
    createInteraction: async (interactionData: Omit<Interaction, 'id'>): Promise<Interaction> => {
        await delay(300);
        const newInteraction: Interaction = { ...interactionData, id: `int_${Date.now()}` };
        const contactIndex = MOCK_CONTACTS_MUTABLE.findIndex(c => c.id === interactionData.contactId);
        if (contactIndex > -1) {
            const contact = MOCK_CONTACTS_MUTABLE[contactIndex];
            contact.interactions = [newInteraction, ...(contact.interactions || [])];
        }
        MOCK_INTERACTIONS.unshift(newInteraction);
        checkAndTriggerWorkflows('interactionCreated', { interaction: newInteraction, contact: MOCK_CONTACTS_MUTABLE[contactIndex]});
        recalculateScoreForContact(interactionData.contactId);
        return newInteraction;
    },
    updateInteraction: async(interactionData: Interaction): Promise<Interaction> => {
        // ... implementation ...
        return interactionData;
    },

    // --- DASHBOARD & REPORTS ---
    getDashboardData: async (orgId: string): Promise<any> => {
        await delay(600);
        const contacts = MOCK_CONTACTS_MUTABLE.filter(c => c.organizationId === orgId);
        const interactions = MOCK_INTERACTIONS.filter(i => i.organizationId === orgId);
        return generateDashboardData(contacts, interactions);
    },

    // --- OTHER ENTITIES (Simplified) ---
    getTasks: async (orgId: string, userId: string, canViewAll: boolean): Promise<Task[]> => {
        await delay(200);
        if(canViewAll) return MOCK_TASKS.filter(t => t.organizationId === orgId);
        return MOCK_TASKS.filter(t => t.organizationId === orgId && t.userId === userId);
    },
    createTask: async(taskData: Omit<Task, 'id' | 'isCompleted'>): Promise<Task> => {
        const newTask = { ...taskData, id: `task_${Date.now()}`, isCompleted: false };
        MOCK_TASKS.push(newTask);
        return newTask;
    },
    updateTask: async(taskData: Task): Promise<Task> => {
         const index = MOCK_TASKS.findIndex(t => t.id === taskData.id);
         if(index > -1) MOCK_TASKS[index] = taskData;
         return taskData;
    },
    deleteTask: async(taskId: string): Promise<void> => {
        // FIX: Mutate array in place to avoid reassigning an import.
        const index = MOCK_TASKS.findIndex(t => t.id === taskId);
        if (index > -1) {
            MOCK_TASKS.splice(index, 1);
        }
        return;
    },
    getCalendarEvents: async (orgId: string): Promise<CalendarEvent[]> => MOCK_CALENDAR_EVENTS.filter(e => e.userIds.some(uid => MOCK_USERS.find(u => u.id === uid)?.organizationId === orgId)),
    createCalendarEvent: async (eventData: Omit<CalendarEvent, 'id'>) => {
        const newEvent = { ...eventData, id: `event_${Date.now()}` };
        MOCK_CALENDAR_EVENTS.push(newEvent);
        return newEvent;
    },
    updateCalendarEvent: async (eventData: CalendarEvent) => {
        const index = MOCK_CALENDAR_EVENTS.findIndex(e => e.id === eventData.id);
        if(index > -1) MOCK_CALENDAR_EVENTS[index] = eventData;
        return eventData;
    },
    
    getProducts: async (orgId: string): Promise<Product[]> => MOCK_PRODUCTS.filter(p => p.organizationId === orgId),
    createProduct: async(productData: Omit<Product, 'id'>) => {
        const newProd = { ...productData, id: `prod_${Date.now()}` };
        MOCK_PRODUCTS.push(newProd);
        return newProd;
    },
    updateProduct: async(productData: Product) => {
        const index = MOCK_PRODUCTS.findIndex(p => p.id === productData.id);
        if(index > -1) MOCK_PRODUCTS[index] = productData;
        return productData;
    },
    deleteProduct: async(productId: string) => {
        // FIX: Mutate array in place to avoid reassigning an import.
        const index = MOCK_PRODUCTS.findIndex(p => p.id === productId);
        if (index > -1) {
            MOCK_PRODUCTS.splice(index, 1);
        }
    },
    getSuppliers: async (orgId: string): Promise<Supplier[]> => MOCK_SUPPLIERS.filter(p => p.organizationId === orgId),
    getWarehouses: async (orgId: string): Promise<Warehouse[]> => MOCK_WAREHOUSES.filter(p => p.organizationId === orgId),


    getDealStages: async (orgId: string): Promise<DealStage[]> => MOCK_DEAL_STAGES.filter(s => s.organizationId === orgId),
    getDeals: async (orgId: string): Promise<Deal[]> => MOCK_DEALS.filter(d => d.organizationId === orgId),
    createDeal: async(dealData: Omit<Deal, 'id' | 'createdAt'>): Promise<Deal> => {
        const newDeal = { ...dealData, id: `deal_${Date.now()}`, createdAt: new Date().toISOString() };
        MOCK_DEALS.push(newDeal);
        const contact = MOCK_CONTACTS_MUTABLE.find(c => c.id === newDeal.contactId);
        if (contact) {
            checkAndTriggerWorkflows('dealCreated', { deal: newDeal, contact });
        }
        return newDeal;
    },
    updateDeal: async(dealData: Deal): Promise<Deal> => {
        const index = MOCK_DEALS.findIndex(d => d.id === dealData.id);
        if(index > -1) {
            const oldDeal = { ...MOCK_DEALS[index] };
            MOCK_DEALS[index] = dealData;
            if (oldDeal.stageId !== dealData.stageId) {
                const contact = MOCK_CONTACTS_MUTABLE.find(c => c.id === dealData.contactId);
                if (contact) {
                     checkAndTriggerWorkflows('dealStageChanged', { deal: dealData, oldDeal, contact });
                }
            }
        }
        return dealData;
    },
    deleteDeal: async(dealId: string): Promise<void> => {
        // FIX: Mutate array in place to avoid reassigning an import.
        const index = MOCK_DEALS.findIndex(d => d.id === dealId);
        if (index > -1) {
            MOCK_DEALS.splice(index, 1);
        }
        return;
    },
    
    getEmailTemplates: async (orgId: string): Promise<EmailTemplate[]> => MOCK_EMAIL_TEMPLATES.filter(t => t.organizationId === orgId),
    createEmailTemplate: async (templateData: Omit<EmailTemplate, 'id'>) => {
        const newTemplate = { ...templateData, id: `et_${Date.now()}` };
        MOCK_EMAIL_TEMPLATES.push(newTemplate);
        return newTemplate;
    },
    updateEmailTemplate: async(templateData: EmailTemplate) => {
         const index = MOCK_EMAIL_TEMPLATES.findIndex(t => t.id === templateData.id);
        if(index > -1) MOCK_EMAIL_TEMPLATES[index] = templateData;
        return templateData;
    },
    deleteEmailTemplate: async(templateId: string) => {
        // FIX: Mutate array in place to avoid reassigning an import.
        const index = MOCK_EMAIL_TEMPLATES.findIndex(t => t.id === templateId);
        if (index > -1) {
            MOCK_EMAIL_TEMPLATES.splice(index, 1);
        }
    },

    // --- SETTINGS ---
    getIndustryConfig: async(industry: Industry) => industryConfigs[industry],
    updateCustomFields: async ({ industry, fields }: { industry: Industry, fields: any[] }) => {
        industryConfigs[industry].customFields = fields;
        return industryConfigs[industry];
    },
    getOrganizationSettings: async (orgId: string) => MOCK_ORGANIZATION_SETTINGS,
    updateOrganizationSettings: async (updates: Partial<OrganizationSettings>) => {
        // FIX: Mutate nested objects to avoid shallow merge overwriting data.
        if (updates.ticketSla) {
            Object.assign(MOCK_ORGANIZATION_SETTINGS.ticketSla, updates.ticketSla);
        }
        if (updates.leadScoringRules) {
            MOCK_ORGANIZATION_SETTINGS.leadScoringRules = updates.leadScoringRules;
        }
        if (updates.emailIntegration) {
            Object.assign(MOCK_ORGANIZATION_SETTINGS.emailIntegration, updates.emailIntegration);
        }
        if (updates.voip) {
            Object.assign(MOCK_ORGANIZATION_SETTINGS.voip, updates.voip);
        }
        if (updates.liveChat) {
            Object.assign(MOCK_ORGANIZATION_SETTINGS.liveChat, updates.liveChat);
        }
        return { ...MOCK_ORGANIZATION_SETTINGS };
    },
    recalculateAllScores: async (orgId: string) => recalculateAllScores(orgId),
    
    // --- WORKFLOWS ---
    getWorkflows: async(orgId: string) => MOCK_WORKFLOWS,
    createWorkflow: async(data: Omit<Workflow, 'id'>) => {
        const newWorkflow = { ...data, id: `wf_${Date.now()}` };
        MOCK_WORKFLOWS.push(newWorkflow);
        return newWorkflow;
    },
    updateWorkflow: async(data: Workflow) => {
        const index = MOCK_WORKFLOWS.findIndex(w => w.id === data.id);
        if(index > -1) MOCK_WORKFLOWS[index] = data;
        return data;
    },
    getAdvancedWorkflows: async(orgId: string) => MOCK_ADVANCED_WORKFLOWS,
     createAdvancedWorkflow: async(data: Omit<AdvancedWorkflow, 'id'>) => {
        const newWorkflow = { ...data, id: `awf_${Date.now()}` };
        MOCK_ADVANCED_WORKFLOWS.push(newWorkflow);
        return newWorkflow;
    },
    updateAdvancedWorkflow: async(data: AdvancedWorkflow) => {
        const index = MOCK_ADVANCED_WORKFLOWS.findIndex(w => w.id === data.id);
        if(index > -1) MOCK_ADVANCED_WORKFLOWS[index] = data;
        return data;
    },
    deleteAdvancedWorkflow: async(id: string) => {
        // FIX: Mutate array in place to avoid reassigning an import.
        const index = MOCK_ADVANCED_WORKFLOWS.findIndex(w => w.id === id);
        if (index > -1) {
            MOCK_ADVANCED_WORKFLOWS.splice(index, 1);
        }
    },
    
    // And so on for all other methods...
    getApiKeys: async (orgId: string) => MOCK_API_KEYS,
    createApiKey: async ({ orgId, name }: { orgId: string, name: string }) => {
        const newKey: ApiKey = { id: `key_${Date.now()}`, organizationId: orgId, name, keyPrefix: 'crm_live_', createdAt: new Date().toISOString() };
        const secret = `crm_live_${Math.random().toString(36).substr(2)}`;
        MOCK_API_KEYS.push(newKey);
        return { key: newKey, secret };
    },
    deleteApiKey: async (keyId: string) => { 
        // FIX: Mutate array in place to avoid reassigning an import.
        const index = MOCK_API_KEYS.findIndex(k => k.id === keyId);
        if (index > -1) {
            MOCK_API_KEYS.splice(index, 1);
        }
    },
    getTickets: async (orgId: string) => MOCK_TICKETS,
    createTicket: async (data: Omit<Ticket, 'id'|'createdAt'|'updatedAt'|'replies'>) => {
        const newTicket = { ...data, id: `tkt_${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), replies: [] };
        MOCK_TICKETS.push(newTicket);
        const contact = MOCK_CONTACTS_MUTABLE.find(c => c.id === newTicket.contactId);
        if (contact) {
            checkAndTriggerWorkflows('ticketCreated', { ticket: newTicket, contact });
        }
        return newTicket;
    },
    updateTicket: async(data: Ticket) => {
         const index = MOCK_TICKETS.findIndex(t => t.id === data.id);
        if(index > -1) {
            const oldTicket = { ...MOCK_TICKETS[index] };
            MOCK_TICKETS[index] = { ...data, updatedAt: new Date().toISOString() };
             if (oldTicket.status !== data.status) {
                const contact = MOCK_CONTACTS_MUTABLE.find(c => c.id === data.contactId);
                if (contact) {
                    checkAndTriggerWorkflows('ticketStatusChanged', { ticket: data, oldTicket, contact });
                }
            }
        }
        return MOCK_TICKETS[index];
    },
    // FIX: Refactored `addTicketReply` to accept a single object argument (`{ ticketId, reply }`) for consistency with other mutation functions in the API client, resolving a type mismatch with `useMutation`.
    addTicketReply: async ({ ticketId, reply }: { ticketId: string, reply: any }) => {
        const index = MOCK_TICKETS.findIndex(t => t.id === ticketId);
        if(index > -1) {
            const newReply = { ...reply, id: `rep_${Date.now()}`, timestamp: new Date().toISOString()};
            MOCK_TICKETS[index].replies.push(newReply);
            MOCK_TICKETS[index].updatedAt = new Date().toISOString();
        }
    },

    getForms: async (orgId: string) => MOCK_FORMS,
    createForm: async (data: any) => { const newForm = {...data, id: `form_${Date.now()}`}; MOCK_FORMS.push(newForm); return newForm; },
    updateForm: async (data: PublicForm) => { const i = MOCK_FORMS.findIndex(f=>f.id===data.id); if(i>-1) MOCK_FORMS[i]=data; return data;},
    deleteForm: async (id: string) => { 
        // FIX: Mutate array in place to avoid reassigning an import.
        const index = MOCK_FORMS.findIndex(f => f.id === id);
        if (index > -1) {
            MOCK_FORMS.splice(index, 1);
        }
    },
    submitPublicForm: async ({formId, submissionData, sessionId}: {formId: string, submissionData: any, sessionId?: string}) => {
        const newContact: AnyContact = {
            id: `contact_${Date.now()}`,
            organizationId: 'org_1',
            contactName: submissionData.contactName || submissionData['customFields.contactName'],
            email: submissionData.email,
            phone: submissionData.phone || '',
            status: 'Lead',
            leadSource: 'Public Form',
            createdAt: new Date().toISOString(),
            customFields: submissionData.customFields || {},
            interactions: [],
        };

        if (sessionId) {
            const sessionIndex = MOCK_ANONYMOUS_SESSIONS.findIndex(s => s.sessionId === sessionId);
            if (sessionIndex > -1) {
                const session = MOCK_ANONYMOUS_SESSIONS[sessionIndex];
                const pageViewInteractions: Interaction[] = session.pageviews.map(pv => ({
                    id: `int_pv_${Date.now()}_${Math.random()}`,
                    organizationId: newContact.organizationId,
                    contactId: newContact.id,
                    userId: 'system',
                    type: 'Site Visit',
                    date: pv.timestamp,
                    notes: `Viewed page: ${pv.url}`
                }));
                newContact.interactions = pageViewInteractions;
                MOCK_INTERACTIONS.unshift(...pageViewInteractions);
                MOCK_ANONYMOUS_SESSIONS.splice(sessionIndex, 1);
            }
        }

        MOCK_CONTACTS_MUTABLE.unshift(newContact);
        return newContact;
    },

    getCampaigns: async (orgId: string) => MOCK_CAMPAIGNS,
    createCampaign: async (data: any) => { const newCamp = {...data, id: `camp_${Date.now()}`}; MOCK_CAMPAIGNS.push(newCamp); return newCamp; },
    updateCampaign: async (data: Campaign) => { const i = MOCK_CAMPAIGNS.findIndex(c=>c.id===data.id); if(i>-1) MOCK_CAMPAIGNS[i]=data; return data;},
    launchCampaign: async(campaignId: string) => {
        campaignService.enrollContacts(campaignId);
    },
    advanceDay: async(currentDate: Date) => {
        const newDate = addDays(currentDate, 1);
        campaignSchedulerService.processScheduledCampaigns(newDate);
        return newDate;
    },
    
    getLandingPages: async(orgId: string) => MOCK_LANDING_PAGES,
    createLandingPage: async(data: any) => {const newPage = {...data, id: `lp_${Date.now()}`}; MOCK_LANDING_PAGES.push(newPage); return newPage;},
    updateLandingPage: async(data: LandingPage) => {const i = MOCK_LANDING_PAGES.findIndex(p=>p.id===data.id); if(i>-1) MOCK_LANDING_PAGES[i]=data; return data;},
    deleteLandingPage: async(id:string) => { 
        const index = MOCK_LANDING_PAGES.findIndex(p => p.id === id);
        if (index > -1) {
            MOCK_LANDING_PAGES.splice(index, 1);
        }
    },
    getLandingPageBySlug: async (slug: string) => MOCK_LANDING_PAGES.find(p => p.slug === slug && p.status === 'Published') || null,

    runEmailSync: async(orgId: string) => { 
        MOCK_ORGANIZATION_SETTINGS.emailIntegration.lastSync = new Date().toISOString(); 
        
        // Find a contact to simulate finding an email for
        const contactToSync = MOCK_CONTACTS_MUTABLE.find(c => c.organizationId === orgId);
        if (contactToSync) {
            const newEmailInteraction: Interaction = {
                id: `int_sync_${Date.now()}`,
                organizationId: orgId,
                contactId: contactToSync.id,
                userId: 'system', // Differentiates it as a synced email
                type: 'Email',
                date: new Date().toISOString(),
                notes: `Subject: Re: Project Update\n\nHi ${contactToSync.contactName},\n\nJust checking in on the latest updates for our project. Let me know if you have any questions.\n\nBest,\nAlice Admin`,
            };
            
            // Add to global interactions
            MOCK_INTERACTIONS.unshift(newEmailInteraction);

            // Add to contact's personal history
            if (!contactToSync.interactions) {
                contactToSync.interactions = [];
            }
            contactToSync.interactions.unshift(newEmailInteraction);
        }
    },
    handleNewChatMessage: async(data: any) => { /* Creates ticket */ },

    getCustomReports: async (orgId: string) => MOCK_CUSTOM_REPORTS,
    createCustomReport: async (data: any) => {const newReport = {...data, id: `cr_${Date.now()}`}; MOCK_CUSTOM_REPORTS.push(newReport); return newReport;},
    updateCustomReport: async (data: CustomReport) => {const i = MOCK_CUSTOM_REPORTS.findIndex(r=>r.id===data.id); if(i>-1) MOCK_CUSTOM_REPORTS[i]=data; return data;},
    deleteCustomReport: async(id: string) => {
        // FIX: Mutate arrays in place to avoid reassigning an import.
        const reportIndex = MOCK_CUSTOM_REPORTS.findIndex(r => r.id === id);
        if (reportIndex > -1) {
            MOCK_CUSTOM_REPORTS.splice(reportIndex, 1);
        }
        let i = MOCK_DASHBOARD_WIDGETS.length;
        while (i--) {
            if (MOCK_DASHBOARD_WIDGETS[i].reportId === id) {
                MOCK_DASHBOARD_WIDGETS.splice(i, 1);
            }
        }
    },

    getDashboardWidgets: async (orgId: string) => MOCK_DASHBOARD_WIDGETS,
    addDashboardWidget: async (reportId: string) => {
        const newWidget = { id: `wdgt_${Date.now()}`, organizationId: 'org_1', reportId};
        MOCK_DASHBOARD_WIDGETS.push(newWidget);
        return newWidget;
    },
    removeDashboardWidget: async (id: string) => { 
        // FIX: Mutate array in place to avoid reassigning an import.
        const index = MOCK_DASHBOARD_WIDGETS.findIndex(w => w.id === id);
        if (index > -1) {
            MOCK_DASHBOARD_WIDGETS.splice(index, 1);
        }
    },

    createOrder: async (data: any) => { /* ... */ return data; },
    updateOrder: async (data: any) => { /* ... */ return data; },
    deleteOrder: async (data: any) => { /* ... */ },
    createTransaction: async (data: any) => { /* ... */ return data; },

    getDocuments: async (contactId: string) => MOCK_DOCUMENTS.filter(d => d.contactId === contactId),
    uploadDocument: async(data: Omit<Document, 'id'|'uploadDate'>) => {
        const newDoc = {...data, id: `doc_${Date.now()}`, uploadDate: new Date().toISOString()};
        MOCK_DOCUMENTS.push(newDoc);
        return newDoc;
    },
    deleteDocument: async(id: string) => { 
        // FIX: Mutate array in place to avoid reassigning an import.
        const index = MOCK_DOCUMENTS.findIndex(d => d.id === id);
        if (index > -1) {
            MOCK_DOCUMENTS.splice(index, 1);
        }
    },

    generateCustomReport: async (config: { dataSource: ReportDataSource, columns: string[], filters: FilterCondition[] }, orgId: string) => {
        let rawData: any[] = [];
        if (config.dataSource === 'contacts') {
            rawData = MOCK_CONTACTS_MUTABLE.filter(c => c.organizationId === orgId);
        } else {
            rawData = MOCK_PRODUCTS.filter(p => p.organizationId === orgId);
        }
        // Apply filters
        // Select columns
        const filteredData = rawData.map(row => {
            const newRow: any = {};
            config.columns.forEach(col => newRow[col] = row[col]);
            return newRow;
        })
        return filteredData;
    },
    trackPageView: async ({ sessionId, orgId, url }: { sessionId: string, orgId: string, url: string }) => {
        let session = MOCK_ANONYMOUS_SESSIONS.find(s => s.sessionId === sessionId);
        if (!session) {
            session = { sessionId, organizationId: orgId, pageviews: [] };
            MOCK_ANONYMOUS_SESSIONS.push(session);
        }
        session.pageviews.push({ url, timestamp: new Date().toISOString() });
    },
};

export default apiClient;