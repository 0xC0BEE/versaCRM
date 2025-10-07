// services/apiClient.ts
// This file acts as a mock API, simulating a backend server.
// It interacts with the data defined in './mockData.ts'.

import {
  MOCK_ORGANIZATIONS,
  MOCK_USERS,
  MOCK_CONTACTS_MUTABLE,
  MOCK_TASKS,
  MOCK_CALENDAR_EVENTS,
  MOCK_PRODUCTS,
  MOCK_SUPPLIERS,
  MOCK_WAREHOUSES,
  MOCK_DEALS,
  MOCK_DEAL_STAGES,
  MOCK_TICKETS,
  MOCK_EMAIL_TEMPLATES,
  MOCK_CAMPAIGNS,
  MOCK_WORKFLOWS,
  MOCK_ADVANCED_WORKFLOWS,
  MOCK_ORGANIZATION_SETTINGS,
  MOCK_DOCUMENTS,
  MOCK_CUSTOM_REPORTS,
  MOCK_DASHBOARD_WIDGETS,
  MOCK_ROLES,
  MOCK_EXTERNAL_EMAILS,
} from './mockData';
import { industryConfigs } from '../config/industryConfig';
import {
  Organization,
  User,
  AnyContact,
  Task,
  CalendarEvent,
  Product,
  Supplier,
  Warehouse,
  Deal,
  DealStage,
  Ticket,
  EmailTemplate,
  Campaign,
  Workflow,
  AdvancedWorkflow,
  Industry,
  IndustryConfig,
  CustomField,
  Interaction,
  OrganizationSettings,
  Order,
  Transaction,
  Document,
  CustomReport,
  DashboardWidget,
  FilterCondition,
  CustomRole,
} from '../types';
import { checkAndTriggerWorkflows } from './workflowService';
import { campaignService } from './campaignService';
import { recalculateAllScores, recalculateScoreForContact } from './leadScoringService';
import { addDays } from 'date-fns';
import { campaignSchedulerService } from './campaignSchedulerService';

const API_DELAY = 300;
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Standalone helper to avoid `this` context issues in the apiClient object literal.
async function getContactById(contactId: string): Promise<AnyContact | null> {
  await delay(API_DELAY);
  return MOCK_CONTACTS_MUTABLE.find(c => c.id === contactId) || null;
}

const apiClient = {
  // --- Auth ---
  async login(email: string): Promise<User | null> {
    await delay(API_DELAY);
    const user = MOCK_USERS.find(u => u.email === email);
    return user ? { ...user } : null;
  },

  // --- Organizations ---
  async getOrganizations(): Promise<Organization[]> {
    await delay(API_DELAY);
    return [...MOCK_ORGANIZATIONS];
  },
  async createOrganization(orgData: Omit<Organization, 'id' | 'createdAt'>): Promise<Organization> {
    await delay(API_DELAY);
    const newOrg: Organization = {
      ...orgData,
      id: `org_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    MOCK_ORGANIZATIONS.push(newOrg);
    return newOrg;
  },
  async updateOrganization(orgData: Organization): Promise<Organization> {
    await delay(API_DELAY);
    const index = MOCK_ORGANIZATIONS.findIndex(o => o.id === orgData.id);
    if (index === -1) throw new Error('Organization not found');
    MOCK_ORGANIZATIONS[index] = { ...MOCK_ORGANIZATIONS[index], ...orgData };
    return MOCK_ORGANIZATIONS[index];
  },
  async deleteOrganization(orgId: string): Promise<{ id: string }> {
    await delay(API_DELAY);
    // In a real app, this would be a cascade delete. Here we just remove the org.
    const index = MOCK_ORGANIZATIONS.findIndex(o => o.id === orgId);
    if (index > -1) MOCK_ORGANIZATIONS.splice(index, 1);
    return { id: orgId };
  },

  // --- Config ---
  async getIndustryConfig(industry: Industry): Promise<IndustryConfig> {
    await delay(API_DELAY / 2);
    const config = industryConfigs[industry];
    if (!config) {
      console.warn(`[API] No industry config found for "${industry}". Falling back to Generic.`);
      return industryConfigs['Generic'];
    }
    return config;
  },
  async updateCustomFields({ industry, fields }: { industry: Industry, fields: CustomField[] }): Promise<IndustryConfig> {
    await delay(API_DELAY);
    // Find the config in the mutable object and update it.
    const configToUpdate = industryConfigs[industry];
    if (configToUpdate) {
        configToUpdate.customFields = fields;
    } else {
        throw new Error(`Industry config for "${industry}" not found.`);
    }
    return configToUpdate;
  },

  // --- Contacts ---
  async getContactsByOrg(orgId: string): Promise<AnyContact[]> {
    await delay(API_DELAY);
    return MOCK_CONTACTS_MUTABLE.filter(c => c.organizationId === orgId);
  },
  getContactById,
  async createContact(contactData: Omit<AnyContact, 'id'>): Promise<AnyContact> {
    await delay(API_DELAY);
    const newContact: AnyContact = {
      ...contactData,
      id: `contact_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    MOCK_CONTACTS_MUTABLE.push(newContact);
    await checkAndTriggerWorkflows('contactCreated', { contact: newContact });
    campaignService.checkAndEnrollInCampaigns(newContact);
    return newContact;
  },
  async updateContact(contactData: AnyContact): Promise<AnyContact> {
    await delay(API_DELAY);
    const index = MOCK_CONTACTS_MUTABLE.findIndex(c => c.id === contactData.id);
    if (index === -1) throw new Error('Contact not found');
    const oldContact = { ...MOCK_CONTACTS_MUTABLE[index] };
    MOCK_CONTACTS_MUTABLE[index] = { ...oldContact, ...contactData };
    
    if (oldContact.status !== contactData.status) {
      await checkAndTriggerWorkflows('contactStatusChanged', { contact: MOCK_CONTACTS_MUTABLE[index], oldContact, user: MOCK_USERS[1] });
      recalculateScoreForContact(contactData.id);
    }
    return MOCK_CONTACTS_MUTABLE[index];
  },
  async deleteContact(contactId: string): Promise<{ id: string }> {
    await delay(API_DELAY);
    const index = MOCK_CONTACTS_MUTABLE.findIndex(c => c.id === contactId);
    if (index > -1) MOCK_CONTACTS_MUTABLE.splice(index, 1);
    return { id: contactId };
  },
  async bulkDeleteContacts(contactIds: string[]): Promise<{ ids: string[] }> {
    await delay(API_DELAY);
    const idsSet = new Set(contactIds);
    let i = MOCK_CONTACTS_MUTABLE.length;
    while (i--) {
      if (idsSet.has(MOCK_CONTACTS_MUTABLE[i].id)) {
        MOCK_CONTACTS_MUTABLE.splice(i, 1);
      }
    }
    return { ids: contactIds };
  },
  async bulkUpdateContactStatus({ ids, status }: { ids: string[], status: any }): Promise<AnyContact[]> {
    await delay(API_DELAY);
    const updatedContacts: AnyContact[] = [];
    MOCK_CONTACTS_MUTABLE.forEach((contact, index) => {
      if (ids.includes(contact.id)) {
        MOCK_CONTACTS_MUTABLE[index].status = status;
        updatedContacts.push(MOCK_CONTACTS_MUTABLE[index]);
      }
    });
    return updatedContacts;
  },

  // --- Users/Team & Roles ---
  async getUsersByOrg(orgId: string): Promise<User[]> {
    await delay(API_DELAY);
    return MOCK_USERS.filter(u => u.organizationId === orgId);
  },
  async createUser(userData: Omit<User, 'id'>): Promise<User> {
    await delay(API_DELAY);
    const newUser: User = { ...userData, id: `user_${Date.now()}` };
    MOCK_USERS.push(newUser);
    return newUser;
  },
  async updateUser(userData: User): Promise<User> {
    await delay(API_DELAY);
    const index = MOCK_USERS.findIndex(u => u.id === userData.id);
    if (index === -1) throw new Error('User not found');
    MOCK_USERS[index] = { ...MOCK_USERS[index], ...userData };
    return MOCK_USERS[index];
  },
  async deleteUser(userId: string): Promise<{ id: string }> {
    await delay(API_DELAY);
    const userToDelete = MOCK_USERS.find(u => u.id === userId);
    if (!userToDelete) throw new Error('User not found');

    const assignedContacts = MOCK_CONTACTS_MUTABLE.filter(c => c.assignedToId === userId).length;
    if (assignedContacts > 0) {
      throw new Error(`Cannot delete user. They are assigned to ${assignedContacts} contact(s). Please reassign them first.`);
    }

    const index = MOCK_USERS.findIndex(u => u.id === userId);
    if (index > -1) MOCK_USERS.splice(index, 1);
    return { id: userId };
  },
  async getRoles(orgId: string): Promise<CustomRole[]> {
    await delay(API_DELAY);
    return MOCK_ROLES.filter(r => r.organizationId === orgId);
  },
  async createRole(roleData: Omit<CustomRole, 'id'>): Promise<CustomRole> {
    await delay(API_DELAY);
    const newRole: CustomRole = { ...roleData, id: `role_${Date.now()}` };
    MOCK_ROLES.push(newRole);
    return newRole;
  },
  async updateRole(roleData: CustomRole): Promise<CustomRole> {
    await delay(API_DELAY);
    const index = MOCK_ROLES.findIndex(r => r.id === roleData.id);
    if (index === -1) throw new Error('Role not found');
    MOCK_ROLES[index] = roleData;
    return roleData;
  },
  async deleteRole(roleId: string): Promise<{ id: string }> {
    await delay(API_DELAY);
    const roleToDelete = MOCK_ROLES.find(r => r.id === roleId);
    if (!roleToDelete) throw new Error('Role not found');
    if (roleToDelete.isSystemRole) throw new Error('System roles cannot be deleted.');
    
    const usersWithRole = MOCK_USERS.filter(u => u.roleId === roleId).length;
    if (usersWithRole > 0) {
      throw new Error(`Cannot delete role. It is assigned to ${usersWithRole} user(s).`);
    }

    const index = MOCK_ROLES.findIndex(r => r.id === roleId);
    if (index > -1) MOCK_ROLES.splice(index, 1);
    return { id: roleId };
  },
  
  // --- Interactions ---
  async getAllInteractionsByOrg(orgId: string): Promise<Interaction[]> {
      await delay(API_DELAY);
      return MOCK_CONTACTS_MUTABLE.filter(c => c.organizationId === orgId).flatMap(c => c.interactions || []);
  },
  async getInteractionsByContact(contactId: string): Promise<Interaction[]> {
      await delay(API_DELAY);
      const contact = MOCK_CONTACTS_MUTABLE.find(c => c.id === contactId);
      return contact?.interactions || [];
  },
  async createInteraction(interactionData: Omit<Interaction, 'id'>): Promise<Interaction> {
    await delay(API_DELAY);
    const newInteraction: Interaction = { ...interactionData, id: `int_${Date.now()}` };
    const contactIndex = MOCK_CONTACTS_MUTABLE.findIndex(c => c.id === interactionData.contactId);
    if (contactIndex > -1) {
        const contact = MOCK_CONTACTS_MUTABLE[contactIndex];
        const updatedContact = {
            ...contact,
            interactions: [newInteraction, ...(contact.interactions || [])]
        };
        MOCK_CONTACTS_MUTABLE[contactIndex] = updatedContact;
        recalculateScoreForContact(interactionData.contactId);
    }
    return newInteraction;
  },

  // --- Tasks ---
  async getAllTasksByOrg(orgId: string): Promise<Task[]> {
    await delay(API_DELAY);
    return MOCK_TASKS.filter(t => t.organizationId === orgId);
  },
  async getTasksByUser(userId: string, orgId: string): Promise<Task[]> {
    await delay(API_DELAY);
    return MOCK_TASKS.filter(t => t.userId === userId && t.organizationId === orgId);
  },
  async createTask(taskData: Omit<Task, 'id' | 'isCompleted'>): Promise<Task> {
    await delay(API_DELAY);
    const newTask: Task = { ...taskData, id: `task_${Date.now()}`, isCompleted: false };
    MOCK_TASKS.push(newTask);
    return newTask;
  },
  async updateTask(taskData: Task): Promise<Task> {
    await delay(API_DELAY);
    const index = MOCK_TASKS.findIndex(t => t.id === taskData.id);
    if (index === -1) throw new Error('Task not found');
    MOCK_TASKS[index] = { ...MOCK_TASKS[index], ...taskData };
    return MOCK_TASKS[index];
  },
  async deleteTask(taskId: string): Promise<{ id: string }> {
    await delay(API_DELAY);
    const index = MOCK_TASKS.findIndex(t => t.id === taskId);
    if (index > -1) MOCK_TASKS.splice(index, 1);
    return { id: taskId };
  },
  
  // --- Calendar ---
  async getCalendarEvents(orgId: string): Promise<CalendarEvent[]> {
    await delay(API_DELAY);
    return MOCK_CALENDAR_EVENTS.filter(e => e.organizationId === orgId);
  },
  async createCalendarEvent(eventData: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
    await delay(API_DELAY);
    const newEvent = { ...eventData, id: `event_${Date.now()}` };
    MOCK_CALENDAR_EVENTS.push(newEvent);
    return newEvent;
  },
   async updateCalendarEvent(eventData: CalendarEvent): Promise<CalendarEvent> {
    await delay(API_DELAY);
    const index = MOCK_CALENDAR_EVENTS.findIndex(e => e.id === eventData.id);
    if (index === -1) throw new Error('Event not found');
    MOCK_CALENDAR_EVENTS[index] = { ...MOCK_CALENDAR_EVENTS[index], ...eventData };
    return MOCK_CALENDAR_EVENTS[index];
  },
  
  // --- Inventory ---
  async getProducts(orgId: string): Promise<Product[]> { await delay(API_DELAY); return MOCK_PRODUCTS.filter(p => p.organizationId === orgId); },
  async createProduct(data: Omit<Product, 'id'>): Promise<Product> { await delay(API_DELAY); const newProd = { ...data, id: `prod_${Date.now()}` }; MOCK_PRODUCTS.push(newProd); return newProd; },
  async updateProduct(data: Product): Promise<Product> { await delay(API_DELAY); const i = MOCK_PRODUCTS.findIndex(p => p.id === data.id); if (i > -1) MOCK_PRODUCTS[i] = data; return data; },
  async deleteProduct(id: string): Promise<{id: string}> { 
    await delay(API_DELAY); 
    const index = MOCK_PRODUCTS.findIndex(p => p.id === id);
    if (index > -1) MOCK_PRODUCTS.splice(index, 1);
    return {id}; 
  },
  async getSuppliers(orgId: string): Promise<Supplier[]> { await delay(API_DELAY); return MOCK_SUPPLIERS.filter(s => s.organizationId === orgId); },
  async getWarehouses(orgId: string): Promise<Warehouse[]> { await delay(API_DELAY); return MOCK_WAREHOUSES.filter(w => w.organizationId === orgId); },

  // --- Deals ---
  async getDeals(orgId: string): Promise<Deal[]> { await delay(API_DELAY); return MOCK_DEALS.filter(d => d.organizationId === orgId); },
  async getDealStages(orgId: string): Promise<DealStage[]> { await delay(API_DELAY); return MOCK_DEAL_STAGES.filter(s => s.organizationId === orgId); },
  async createDeal(data: Omit<Deal, 'id' | 'createdAt'>): Promise<Deal> {
    await delay(API_DELAY);
    const newDeal = { ...data, id: `deal_${Date.now()}`, createdAt: new Date().toISOString() };
    MOCK_DEALS.push(newDeal);
    const contact = await getContactById(newDeal.contactId);
    await checkAndTriggerWorkflows('dealCreated', { deal: newDeal, contact });
    return newDeal;
  },
  async updateDeal(data: Deal): Promise<Deal> {
    await delay(API_DELAY);
    const index = MOCK_DEALS.findIndex(d => d.id === data.id);
    if (index === -1) throw new Error('Deal not found');
    const oldDeal = { ...MOCK_DEALS[index] };
    MOCK_DEALS[index] = data;
    if (oldDeal.stageId !== data.stageId) {
      const contact = await getContactById(data.contactId);
      await checkAndTriggerWorkflows('dealStageChanged', { deal: data, oldDeal, contact });
    }
    return data;
  },
  async deleteDeal(id: string): Promise<{id: string}> { 
    await delay(API_DELAY); 
    const index = MOCK_DEALS.findIndex(d => d.id === id);
    if (index > -1) MOCK_DEALS.splice(index, 1);
    return {id}; 
  },

  // --- Tickets ---
  async getTickets(orgId: string): Promise<Ticket[]> { await delay(API_DELAY); return MOCK_TICKETS.filter(t => t.organizationId === orgId); },
  async createTicket(data: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'replies'>): Promise<Ticket> {
    await delay(API_DELAY);
    const now = new Date().toISOString();
    const newTicket: Ticket = {
      ...data,
      id: `ticket_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
      replies: [{
        id: `reply_${Date.now()}`,
        userId: MOCK_USERS.find(u => u.contactId === data.contactId)?.id || 'user_client_1',
        userName: MOCK_CONTACTS_MUTABLE.find(c => c.id === data.contactId)?.contactName || 'Client',
        message: data.description || 'Ticket created.',
        timestamp: now,
        isInternal: false,
      }],
    };
    MOCK_TICKETS.push(newTicket);
    const contact = await getContactById(newTicket.contactId);
    await checkAndTriggerWorkflows('ticketCreated', { ticket: newTicket, contact });
    return newTicket;
  },
  async updateTicket(data: Ticket): Promise<Ticket> {
    await delay(API_DELAY);
    const index = MOCK_TICKETS.findIndex(t => t.id === data.id);
    if (index === -1) throw new Error('Ticket not found');
    const oldTicket = { ...MOCK_TICKETS[index] };
    MOCK_TICKETS[index] = { ...data, updatedAt: new Date().toISOString() };
    if (oldTicket.status !== data.status) {
       const contact = await getContactById(data.contactId);
       await checkAndTriggerWorkflows('ticketStatusChanged', { ticket: data, oldTicket, contact });
    }
    return MOCK_TICKETS[index];
  },
  async addTicketReply(ticketId: string, reply: Omit<Ticket['replies'][0], 'id' | 'timestamp'>): Promise<Ticket> {
    await delay(API_DELAY);
    const index = MOCK_TICKETS.findIndex(t => t.id === ticketId);
    if (index === -1) throw new Error('Ticket not found');
    const newReply = { ...reply, id: `reply_${Date.now()}`, timestamp: new Date().toISOString() };
    const ticket = MOCK_TICKETS[index];
    const updatedTicket = {
      ...ticket,
      replies: [...ticket.replies, newReply],
      updatedAt: new Date().toISOString(),
    };
    MOCK_TICKETS[index] = updatedTicket;
    return updatedTicket;
  },

  // --- Automations (Campaigns, Workflows) ---
  async getEmailTemplates(orgId: string): Promise<EmailTemplate[]> { await delay(API_DELAY); return MOCK_EMAIL_TEMPLATES.filter(t => t.organizationId === orgId); },
  async createEmailTemplate(data: Omit<EmailTemplate, 'id'>): Promise<EmailTemplate> { await delay(API_DELAY); const newT = { ...data, id: `et_${Date.now()}` }; MOCK_EMAIL_TEMPLATES.push(newT); return newT; },
  async updateEmailTemplate(data: EmailTemplate): Promise<EmailTemplate> { await delay(API_DELAY); const i = MOCK_EMAIL_TEMPLATES.findIndex(t => t.id === data.id); if(i > -1) MOCK_EMAIL_TEMPLATES[i] = data; return data; },
  async deleteEmailTemplate(id: string): Promise<{id: string}> { 
    await delay(API_DELAY); 
    const index = MOCK_EMAIL_TEMPLATES.findIndex(t => t.id === id);
    if (index > -1) MOCK_EMAIL_TEMPLATES.splice(index, 1);
    return {id}; 
  },
  
  async getCampaigns(orgId: string): Promise<Campaign[]> { await delay(API_DELAY); return MOCK_CAMPAIGNS.filter(c => c.organizationId === orgId); },
  async createCampaign(data: Omit<Campaign, 'id'>): Promise<Campaign> { await delay(API_DELAY); const newC = { ...data, id: `camp_${Date.now()}` }; MOCK_CAMPAIGNS.push(newC); return newC; },
  async updateCampaign(data: Campaign): Promise<Campaign> { await delay(API_DELAY); const i = MOCK_CAMPAIGNS.findIndex(c => c.id === data.id); if(i > -1) MOCK_CAMPAIGNS[i] = data; return data; },
  async launchCampaign(campaignId: string): Promise<Campaign> {
    await delay(API_DELAY * 2);
    campaignService.enrollContacts(campaignId);
    const campaign = MOCK_CAMPAIGNS.find(c => c.id === campaignId);
    if (!campaign) throw new Error("Campaign not found");
    campaignSchedulerService.processScheduledCampaigns(new Date()); // Run immediately on launch
    return campaign;
  },
  async advanceDay(currentDate: Date): Promise<Date> {
    await delay(API_DELAY * 2);
    const newDate = addDays(currentDate, 1);
    campaignSchedulerService.processScheduledCampaigns(newDate);
    return newDate;
  },

  async getWorkflows(orgId: string): Promise<Workflow[]> { await delay(API_DELAY); return MOCK_WORKFLOWS.filter(w => w.organizationId === orgId); },
  async createWorkflow(data: Omit<Workflow, 'id'>): Promise<Workflow> { await delay(API_DELAY); const newW = { ...data, id: `wf_${Date.now()}` }; MOCK_WORKFLOWS.push(newW); return newW; },
  async updateWorkflow(data: Workflow): Promise<Workflow> { await delay(API_DELAY); const i = MOCK_WORKFLOWS.findIndex(w => w.id === data.id); if(i > -1) MOCK_WORKFLOWS[i] = data; return data; },
  
  async getAdvancedWorkflows(orgId: string): Promise<AdvancedWorkflow[]> { await delay(API_DELAY); return MOCK_ADVANCED_WORKFLOWS.filter(w => w.organizationId === orgId); },
  async createAdvancedWorkflow(data: Omit<AdvancedWorkflow, 'id'>): Promise<AdvancedWorkflow> { await delay(API_DELAY); const newW = { ...data, id: `awf_${Date.now()}` }; MOCK_ADVANCED_WORKFLOWS.push(newW); return newW; },
  async updateAdvancedWorkflow(data: AdvancedWorkflow): Promise<AdvancedWorkflow> { await delay(API_DELAY); const i = MOCK_ADVANCED_WORKFLOWS.findIndex(w => w.id === data.id); if(i > -1) MOCK_ADVANCED_WORKFLOWS[i] = data; return data; },
  async deleteAdvancedWorkflow(id: string): Promise<{id: string}> { 
    await delay(API_DELAY); 
    const index = MOCK_ADVANCED_WORKFLOWS.findIndex(w => w.id === id);
    if (index > -1) MOCK_ADVANCED_WORKFLOWS.splice(index, 1);
    return {id}; 
  },
  
  // --- Settings & Integrations ---
  async getOrganizationSettings(orgId: string): Promise<OrganizationSettings> {
    await delay(API_DELAY);
    return MOCK_ORGANIZATION_SETTINGS; // Only one for now
  },
  async updateOrganizationSettings(data: Partial<OrganizationSettings>): Promise<OrganizationSettings> {
    await delay(API_DELAY);
    if (data.ticketSla) {
        MOCK_ORGANIZATION_SETTINGS.ticketSla = data.ticketSla;
    }
    if (data.leadScoringRules) {
        MOCK_ORGANIZATION_SETTINGS.leadScoringRules = data.leadScoringRules;
    }
    if (data.liveChat) {
        MOCK_ORGANIZATION_SETTINGS.liveChat = data.liveChat;
    }
    if (data.emailIntegration) {
        MOCK_ORGANIZATION_SETTINGS.emailIntegration = data.emailIntegration;
    }
    return MOCK_ORGANIZATION_SETTINGS;
  },
  async connectEmailAccount(email: string): Promise<OrganizationSettings> {
    await delay(API_DELAY * 2);
    MOCK_ORGANIZATION_SETTINGS.emailIntegration = {
      isConnected: true,
      connectedEmail: email,
      lastSync: new Date().toISOString(),
    };
    return MOCK_ORGANIZATION_SETTINGS;
  },
  async disconnectEmailAccount(): Promise<OrganizationSettings> {
    await delay(API_DELAY);
    MOCK_ORGANIZATION_SETTINGS.emailIntegration.isConnected = false;
    MOCK_ORGANIZATION_SETTINGS.emailIntegration.connectedEmail = null;
    return MOCK_ORGANIZATION_SETTINGS;
  },
  async runEmailSync(orgId: string): Promise<{ syncedCount: number }> {
    await delay(API_DELAY * 3);
    if (!MOCK_ORGANIZATION_SETTINGS.emailIntegration.isConnected) {
      throw new Error("No email account connected.");
    }

    const contactsByEmail = new Map(MOCK_CONTACTS_MUTABLE.map(c => [c.email.toLowerCase(), c]));
    const orgTeamEmails = new Set(MOCK_USERS.filter(u => u.organizationId === orgId).map(u => u.email.toLowerCase()));

    let syncedCount = 0;

    MOCK_EXTERNAL_EMAILS.forEach(email => {
      if (email.isSynced) return;

      const fromLower = email.from.toLowerCase();
      const toLower = email.to.map(t => t.toLowerCase());

      let contact: AnyContact | undefined;
      let userEmail: string | undefined;

      if (contactsByEmail.has(fromLower) && toLower.some(t => orgTeamEmails.has(t))) {
        contact = contactsByEmail.get(fromLower);
        userEmail = toLower.find(t => orgTeamEmails.has(t));
      } else if (orgTeamEmails.has(fromLower) && toLower.some(t => contactsByEmail.has(t))) {
        userEmail = fromLower;
        const contactEmail = toLower.find(t => contactsByEmail.has(t))!;
        contact = contactsByEmail.get(contactEmail);
      }
      
      if (contact && userEmail) {
        const user = MOCK_USERS.find(u => u.email.toLowerCase() === userEmail);
        const newInteraction: Interaction = {
          id: `int_sync_${email.id}`,
          organizationId: orgId,
          contactId: contact.id,
          userId: user?.id || 'system',
          type: 'Email',
          date: email.date,
          notes: `(Synced from ${MOCK_ORGANIZATION_SETTINGS.emailIntegration.connectedEmail})\nSubject: ${email.subject}\n\n${email.body}`,
        };
        
        const contactIndex = MOCK_CONTACTS_MUTABLE.findIndex(c => c.id === contact!.id);
        if (contactIndex > -1) {
            if (!MOCK_CONTACTS_MUTABLE[contactIndex].interactions) {
                MOCK_CONTACTS_MUTABLE[contactIndex].interactions = [];
            }
            MOCK_CONTACTS_MUTABLE[contactIndex].interactions!.unshift(newInteraction);
            email.isSynced = true;
            syncedCount++;
        }
      }
    });

    MOCK_ORGANIZATION_SETTINGS.emailIntegration.lastSync = new Date().toISOString();
    return { syncedCount };
  },
  async getSyncedEmails(orgId: string): Promise<Interaction[]> {
    await delay(API_DELAY);
    const emailInteractions = MOCK_CONTACTS_MUTABLE
      .filter(c => c.organizationId === orgId)
      .flatMap(c => c.interactions || [])
      .filter(i => i.type === 'Email');
    return emailInteractions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  // --- Orders & Transactions ---
  async createOrder(data: Omit<Order, 'id'>): Promise<Order> {
    await delay(API_DELAY);
    const newOrder = { ...data, id: `ord_${Date.now()}`};
    const contactIndex = MOCK_CONTACTS_MUTABLE.findIndex(c => c.id === data.contactId);
    if (contactIndex > -1) {
      if (!MOCK_CONTACTS_MUTABLE[contactIndex].orders) MOCK_CONTACTS_MUTABLE[contactIndex].orders = [];
      MOCK_CONTACTS_MUTABLE[contactIndex].orders!.push(newOrder);
    }
    return newOrder;
  },
  async updateOrder(data: Order): Promise<Order> {
    await delay(API_DELAY);
    const contactIndex = MOCK_CONTACTS_MUTABLE.findIndex(c => c.id === data.contactId);
    if (contactIndex > -1) {
      const orderIndex = MOCK_CONTACTS_MUTABLE[contactIndex].orders?.findIndex(o => o.id === data.id) ?? -1;
      if (orderIndex > -1) MOCK_CONTACTS_MUTABLE[contactIndex].orders![orderIndex] = data;
    }
    return data;
  },
  async deleteOrder({ contactId, orderId }: { contactId: string, orderId: string }): Promise<{id: string}> {
    await delay(API_DELAY);
    const contactIndex = MOCK_CONTACTS_MUTABLE.findIndex(c => c.id === contactId);
    if (contactIndex > -1) {
      MOCK_CONTACTS_MUTABLE[contactIndex].orders = (MOCK_CONTACTS_MUTABLE[contactIndex].orders || []).filter(o => o.id !== orderId);
    }
    return {id: orderId};
  },
  async createTransaction({ contactId, data }: { contactId: string, data: Omit<Transaction, 'id' | 'contactId' | 'organizationId'>}): Promise<Transaction> {
    await delay(API_DELAY);
    const contact = MOCK_CONTACTS_MUTABLE.find(c => c.id === contactId)!;
    const newTrans = { ...data, id: `trans_${Date.now()}`, contactId, organizationId: contact.organizationId };
    if (!contact.transactions) contact.transactions = [];
    contact.transactions.push(newTrans);
    return newTrans;
  },

  // --- Documents ---
  async getDocuments(contactId: string): Promise<Document[]> {
    await delay(API_DELAY);
    return MOCK_DOCUMENTS.filter(d => d.contactId === contactId);
  },
  async uploadDocument(docData: Omit<Document, 'id'|'uploadDate'>): Promise<Document> {
    await delay(API_DELAY);
    const newDoc = { ...docData, id: `doc_${Date.now()}`, uploadDate: new Date().toISOString() };
    MOCK_DOCUMENTS.push(newDoc);
    return newDoc;
  },
  async deleteDocument(docId: string): Promise<{id: string}> {
    await delay(API_DELAY);
    const index = MOCK_DOCUMENTS.findIndex(d => d.id === docId);
    if (index > -1) {
        MOCK_DOCUMENTS.splice(index, 1);
    }
    return { id: docId };
  },

  // --- Custom Reports & Widgets ---
  async getCustomReports(orgId: string): Promise<CustomReport[]> { await delay(API_DELAY); return MOCK_CUSTOM_REPORTS.filter(r => r.organizationId === orgId); },
  async createCustomReport(data: Omit<CustomReport, 'id'>): Promise<CustomReport> { await delay(API_DELAY); const newR = {...data, id: `report_${Date.now()}`}; MOCK_CUSTOM_REPORTS.push(newR); return newR; },
  async updateCustomReport(data: CustomReport): Promise<CustomReport> { await delay(API_DELAY); const i = MOCK_CUSTOM_REPORTS.findIndex(r => r.id === data.id); if (i > -1) MOCK_CUSTOM_REPORTS[i] = data; return data; },
  async deleteCustomReport(id: string): Promise<{id: string}> { 
    await delay(API_DELAY); 
    const reportIndex = MOCK_CUSTOM_REPORTS.findIndex(r => r.id === id); 
    if (reportIndex > -1) MOCK_CUSTOM_REPORTS.splice(reportIndex, 1);
    let i = MOCK_DASHBOARD_WIDGETS.length;
    while (i--) {
      if (MOCK_DASHBOARD_WIDGETS[i].reportId === id) {
        MOCK_DASHBOARD_WIDGETS.splice(i, 1);
      }
    }
    return {id}; 
  },
  async getDashboardWidgets(orgId: string): Promise<DashboardWidget[]> { await delay(API_DELAY); return MOCK_DASHBOARD_WIDGETS.filter(w => w.organizationId === orgId); },
  async addDashboardWidget(reportId: string, organizationId: string): Promise<DashboardWidget> { await delay(API_DELAY); const newW = { id: `widget_${Date.now()}`, organizationId, reportId }; MOCK_DASHBOARD_WIDGETS.push(newW); return newW; },
  async removeDashboardWidget(id: string): Promise<{id: string}> { 
    await delay(API_DELAY); 
    const index = MOCK_DASHBOARD_WIDGETS.findIndex(w => w.id === id);
    if (index > -1) {
        MOCK_DASHBOARD_WIDGETS.splice(index, 1);
    }
    return {id}; 
  },
  async generateCustomReport(config: CustomReport['config'], orgId: string): Promise<any[]> {
    await delay(API_DELAY * 2);
    let sourceData: (AnyContact | Product)[];
    if (config.dataSource === 'contacts') {
      sourceData = MOCK_CONTACTS_MUTABLE;
    } else {
      sourceData = MOCK_PRODUCTS;
    }
    sourceData = sourceData.filter((item: any) => item.organizationId === orgId);

    // Apply filters
    const filteredData = sourceData.filter(item => {
      return config.filters.every(filter => {
        const itemValue = String((item as any)[filter.field] || '').toLowerCase();
        const filterValue = String(filter.value).toLowerCase();
        switch (filter.operator) {
          case 'is': return itemValue === filterValue;
          case 'is_not': return itemValue !== filterValue;
          case 'contains': return itemValue.includes(filterValue);
          case 'does_not_contain': return !itemValue.includes(filterValue);
          default: return true;
        }
      });
    });

    if (config.visualization.type !== 'table') {
        return filteredData;
    }
    
    return filteredData.map(item => {
      const row: Record<string, any> = {};
      config.columns.forEach(col => {
        row[col] = (item as any)[col];
      });
      return row;
    });
  },

  // --- Lead Scoring ---
  recalculateAllScores: async (orgId: string) => {
    await delay(API_DELAY);
    recalculateAllScores(orgId);
    return { success: true };
  },

  // --- Chat ---
  handleNewChatMessage: async (data: { orgId: string, contactId?: string, contactName: string, contactEmail: string, message: string }) => {
    await delay(API_DELAY);
    const { orgId, contactId, contactName, contactEmail, message } = data;
    let finalContactId = contactId;

    if (!finalContactId) {
      const newContact = await apiClient.createContact({ organizationId: orgId, contactName, email: contactEmail, phone: '', status: MOCK_ORGANIZATION_SETTINGS.liveChat.newContactStatus, leadSource: 'Live Chat', customFields: {}, createdAt: new Date().toISOString() });
      finalContactId = newContact.id;
    }

    if (MOCK_ORGANIZATION_SETTINGS.liveChat.autoCreateTicket) {
      await apiClient.createTicket({ organizationId: orgId, contactId: finalContactId, subject: `New Chat from ${contactName}`, description: message, priority: MOCK_ORGANIZATION_SETTINGS.liveChat.newTicketPriority, status: 'New' });
    }
    
    return { success: true };
  }
};

export default apiClient;
