// services/apiClient.ts
import {
  MOCK_USERS, MOCK_ORGANIZATIONS, MOCK_CONTACTS, MOCK_PRODUCTS, MOCK_SUPPLIERS, MOCK_WAREHOUSES,
  MOCK_CALENDAR_EVENTS, MOCK_TASKS, MOCK_EMAIL_TEMPLATES, MOCK_WORKFLOWS, MOCK_ADVANCED_WORKFLOWS,
  MOCK_CAMPAIGNS, MOCK_TICKETS, MOCK_CUSTOM_REPORTS, MOCK_DASHBOARD_WIDGETS, MOCK_ORG_SETTINGS,
  MOCK_DEALS, MOCK_DEAL_STAGES, MOCK_NOTIFICATIONS
} from './mockData';
import {
  User, Organization, AnyContact, Product, Supplier, Warehouse, CalendarEvent, Task, EmailTemplate,
  Workflow, Campaign, Ticket, CustomReport, SLAPolicy, DashboardWidget, Deal, DealStage, Industry,
  IndustryConfig, AdvancedWorkflow, TicketReply, Interaction, ContactStatus, Order, Transaction
} from '../types';
import { industryConfigs } from '../config/industryConfig';
import { generateReportData, generateDashboardData } from './reportGenerator';
import { checkAndTriggerWorkflows } from './workflowService';
import { subDays } from 'date-fns';

const LATENCY = 500; // ms

const simulateNetwork = <T>(data: T): Promise<T> => {
  return new Promise(resolve => {
    setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), LATENCY);
  });
};

const apiClient = {
  // --- Auth ---
  login: (email: string): Promise<User | null> => simulateNetwork(MOCK_USERS.find(u => u.email === email) || null),

  // --- Config ---
  getIndustryConfig: (industry: Industry): Promise<IndustryConfig> => simulateNetwork(industryConfigs[industry]),
  updateCustomFields: (industry: Industry, fields: any[]): Promise<IndustryConfig> => {
      industryConfigs[industry].customFields = fields;
      return simulateNetwork(industryConfigs[industry]);
  },

  // --- Organizations ---
  getOrganizations: (): Promise<Organization[]> => simulateNetwork(MOCK_ORGANIZATIONS),
  createOrganization: (orgData: Omit<Organization, 'id' | 'createdAt'>): Promise<Organization> => {
    const newOrg: Organization = { ...orgData, id: `org_${Date.now()}`, createdAt: new Date().toISOString() };
    MOCK_ORGANIZATIONS.push(newOrg);
    return simulateNetwork(newOrg);
  },
  updateOrganization: (orgData: Organization): Promise<Organization> => {
    const index = MOCK_ORGANIZATIONS.findIndex(o => o.id === orgData.id);
    if (index > -1) MOCK_ORGANIZATIONS[index] = orgData;
    return simulateNetwork(orgData);
  },
  deleteOrganization: (orgId: string): Promise<void> => {
    const index = MOCK_ORGANIZATIONS.findIndex(o => o.id === orgId);
    if (index > -1) MOCK_ORGANIZATIONS.splice(index, 1);
    return simulateNetwork(undefined);
  },

  // --- Contacts ---
  getContacts: (organizationId: string): Promise<AnyContact[]> => simulateNetwork(MOCK_CONTACTS.filter(c => c.organizationId === organizationId)),
  getContactById: (contactId: string): Promise<AnyContact | null> => simulateNetwork(MOCK_CONTACTS.find(c => c.id === contactId) || null),
  createContact: (contactData: Omit<AnyContact, 'id'>): Promise<AnyContact> => {
    const newContact: AnyContact = { ...contactData, id: `contact_${Date.now()}`, createdAt: new Date().toISOString() };
    MOCK_CONTACTS.push(newContact);
    checkAndTriggerWorkflows('contactCreated', { contact: newContact });
    return simulateNetwork(newContact);
  },
  updateContact: (contactData: AnyContact): Promise<AnyContact> => {
    const index = MOCK_CONTACTS.findIndex(c => c.id === contactData.id);
    if (index > -1) {
        const oldContact = MOCK_CONTACTS[index];
        MOCK_CONTACTS[index] = contactData;
        if(oldContact.status !== contactData.status) {
            checkAndTriggerWorkflows('contactStatusChanged', { contact: contactData, oldContact });
        }
    }
    return simulateNetwork(contactData);
  },
  deleteContact: (contactId: string): Promise<void> => {
    const index = MOCK_CONTACTS.findIndex(c => c.id === contactId);
    if (index > -1) MOCK_CONTACTS.splice(index, 1);
    return simulateNetwork(undefined);
  },
   bulkDeleteContacts: (contactIds: string[]): Promise<void> => {
    contactIds.forEach(id => {
        const index = MOCK_CONTACTS.findIndex(c => c.id === id);
        if (index > -1) MOCK_CONTACTS.splice(index, 1);
    });
    return simulateNetwork(undefined);
  },
  bulkUpdateContactStatus: ({ ids, status }: { ids: string[]; status: ContactStatus }): Promise<void> => {
    ids.forEach(id => {
        const index = MOCK_CONTACTS.findIndex(c => c.id === id);
        if (index > -1) {
            MOCK_CONTACTS[index].status = status;
        }
    });
    return simulateNetwork(undefined);
  },

  // --- Interactions ---
  getAllInteractions: (organizationId: string): Promise<Interaction[]> => {
    const interactions = MOCK_CONTACTS.filter(c => c.organizationId === organizationId).flatMap(c => c.interactions || []);
    return simulateNetwork(interactions);
  },
  getInteractionsByContact: (contactId: string): Promise<Interaction[]> => {
    const contact = MOCK_CONTACTS.find(c => c.id === contactId);
    return simulateNetwork(contact?.interactions || []);
  },
  createInteraction: (interactionData: Omit<Interaction, 'id'>): Promise<Interaction> => {
    const newInteraction: Interaction = { ...interactionData, id: `int_${Date.now()}`};
    const contactIndex = MOCK_CONTACTS.findIndex(c => c.id === interactionData.contactId);
    if (contactIndex > -1) {
        if (!MOCK_CONTACTS[contactIndex].interactions) MOCK_CONTACTS[contactIndex].interactions = [];
        MOCK_CONTACTS[contactIndex].interactions!.push(newInteraction);
    }
    return simulateNetwork(newInteraction);
  },

  // --- Deals ---
  getDeals: (organizationId: string): Promise<Deal[]> => simulateNetwork(MOCK_DEALS.filter(d => d.organizationId === organizationId)),
  getDealStages: (organizationId: string): Promise<DealStage[]> => simulateNetwork(MOCK_DEAL_STAGES.filter(ds => ds.organizationId === organizationId)),
  createDeal: (dealData: Omit<Deal, 'id' | 'createdAt'>): Promise<Deal> => {
    const newDeal: Deal = { ...dealData, id: `deal_${Date.now()}`, createdAt: new Date().toISOString() };
    MOCK_DEALS.push(newDeal);
    const contact = MOCK_CONTACTS.find(c => c.id === newDeal.contactId);
    if (contact) {
        checkAndTriggerWorkflows('dealCreated', { contact, deal: newDeal });
    }
    return simulateNetwork(newDeal);
  },
  updateDeal: (dealData: Deal): Promise<Deal> => {
    const index = MOCK_DEALS.findIndex(d => d.id === dealData.id);
    if (index > -1) {
        const oldDeal = MOCK_DEALS[index];
        MOCK_DEALS[index] = dealData;
        if (oldDeal.stageId !== dealData.stageId) {
            const contact = MOCK_CONTACTS.find(c => c.id === dealData.contactId);
            if (contact) {
                checkAndTriggerWorkflows('dealStageChanged', { contact, deal: dealData, oldDeal });
            }
        }
    }
    return simulateNetwork(dealData);
  },
  deleteDeal: (dealId: string): Promise<void> => {
    const index = MOCK_DEALS.findIndex(d => d.id === dealId);
    if (index > -1) MOCK_DEALS.splice(index, 1);
    return simulateNetwork(undefined);
  },

  // --- Email Templates ---
  getEmailTemplates: (organizationId: string): Promise<EmailTemplate[]> => simulateNetwork(MOCK_EMAIL_TEMPLATES.filter(t => t.organizationId === organizationId)),
  createEmailTemplate: (templateData: Omit<EmailTemplate, 'id'>): Promise<EmailTemplate> => {
    const newTemplate: EmailTemplate = { ...templateData, id: `et_${Date.now()}` };
    MOCK_EMAIL_TEMPLATES.push(newTemplate);
    return simulateNetwork(newTemplate);
  },
  updateEmailTemplate: (templateData: EmailTemplate): Promise<EmailTemplate> => {
    const index = MOCK_EMAIL_TEMPLATES.findIndex(t => t.id === templateData.id);
    if (index > -1) MOCK_EMAIL_TEMPLATES[index] = templateData;
    return simulateNetwork(templateData);
  },
  deleteEmailTemplate: (templateId: string): Promise<void> => {
    const index = MOCK_EMAIL_TEMPLATES.findIndex(t => t.id === templateId);
    if (index > -1) MOCK_EMAIL_TEMPLATES.splice(index, 1);
    return simulateNetwork(undefined);
  },

  // --- Tasks ---
  getTasks: (organizationId: string): Promise<Task[]> => simulateNetwork(MOCK_TASKS.filter(t => t.organizationId === organizationId)),
  createTask: (taskData: Omit<Task, 'id' | 'isCompleted'>): Promise<Task> => {
    const newTask: Task = { ...taskData, id: `task_${Date.now()}`, isCompleted: false };
    MOCK_TASKS.push(newTask);
    return simulateNetwork(newTask);
  },
  updateTask: (taskData: Task): Promise<Task> => {
    const index = MOCK_TASKS.findIndex(t => t.id === taskData.id);
    if (index > -1) MOCK_TASKS[index] = taskData;
    return simulateNetwork(taskData);
  },
  deleteTask: (taskId: string): Promise<void> => {
    const index = MOCK_TASKS.findIndex(t => t.id === taskId);
    if (index > -1) MOCK_TASKS.splice(index, 1);
    return simulateNetwork(undefined);
  },
  
  // --- Team ---
  getTeamMembers: (organizationId: string): Promise<User[]> => simulateNetwork(MOCK_USERS.filter(u => u.organizationId === organizationId)),
  createTeamMember: (memberData: Omit<User, 'id'>): Promise<User> => {
      const newUser: User = { ...memberData, id: `user_${Date.now()}`};
      MOCK_USERS.push(newUser);
      return simulateNetwork(newUser);
  },
  updateTeamMember: (memberData: User): Promise<User> => {
      const index = MOCK_USERS.findIndex(u => u.id === memberData.id);
      if (index > -1) MOCK_USERS[index] = memberData;
      return simulateNetwork(memberData);
  },

  // --- Calendar ---
  getCalendarEvents: (organizationId: string): Promise<CalendarEvent[]> => simulateNetwork(MOCK_CALENDAR_EVENTS.filter(e => e.organizationId === organizationId)),
  createCalendarEvent: (eventData: Omit<CalendarEvent, 'id' | 'organizationId'>, orgId: string): Promise<CalendarEvent> => {
    const newEvent: CalendarEvent = { ...eventData, id: `event_${Date.now()}`, organizationId: orgId };
    MOCK_CALENDAR_EVENTS.push(newEvent);
    return simulateNetwork(newEvent);
  },
  updateCalendarEvent: (eventData: CalendarEvent): Promise<CalendarEvent> => {
      const index = MOCK_CALENDAR_EVENTS.findIndex(e => e.id === eventData.id);
      if (index > -1) MOCK_CALENDAR_EVENTS[index] = eventData;
      return simulateNetwork(eventData);
  },
  
  // --- Inventory ---
  getProducts: (organizationId: string): Promise<Product[]> => simulateNetwork(MOCK_PRODUCTS.filter(p => p.organizationId === organizationId)),
  createProduct: (productData: Omit<Product, 'id'>): Promise<Product> => {
      const newProduct: Product = { ...productData, id: `prod_${Date.now()}`};
      MOCK_PRODUCTS.push(newProduct);
      return simulateNetwork(newProduct);
  },
  updateProduct: (productData: Product): Promise<Product> => {
      const index = MOCK_PRODUCTS.findIndex(p => p.id === productData.id);
      if (index > -1) MOCK_PRODUCTS[index] = productData;
      return simulateNetwork(productData);
  },
  deleteProduct: (productId: string): Promise<void> => {
      const index = MOCK_PRODUCTS.findIndex(p => p.id === productId);
      if (index > -1) MOCK_PRODUCTS.splice(index, 1);
      return simulateNetwork(undefined);
  },
  getSuppliers: (organizationId: string): Promise<Supplier[]> => simulateNetwork(MOCK_SUPPLIERS.filter(s => s.organizationId === organizationId)),
  getWarehouses: (organizationId: string): Promise<Warehouse[]> => simulateNetwork(MOCK_WAREHOUSES.filter(w => w.organizationId === organizationId)),
  
  // --- Reports ---
  getDashboardData: (organizationId: string): Promise<any> => {
      const range = { start: subDays(new Date(), 30), end: new Date() };
      const contacts = MOCK_CONTACTS.filter(c => c.organizationId === organizationId);
      const interactions = contacts.flatMap(c => c.interactions || []);
      return simulateNetwork(generateDashboardData(range, contacts, interactions));
  },
  getReportData: (reportType: any, dateRange: any, organizationId: string): Promise<any> => {
    const data = {
        contacts: MOCK_CONTACTS.filter(c => c.organizationId === organizationId),
        products: MOCK_PRODUCTS.filter(p => p.organizationId === organizationId),
        team: MOCK_USERS.filter(u => u.organizationId === organizationId),
        tasks: MOCK_TASKS.filter(t => t.organizationId === organizationId),
        deals: MOCK_DEALS.filter(d => d.organizationId === organizationId),
        dealStages: MOCK_DEAL_STAGES.filter(ds => ds.organizationId === organizationId)
    };
    return simulateNetwork(generateReportData(reportType, dateRange, data));
  },
  getCustomReports: (organizationId: string): Promise<CustomReport[]> => simulateNetwork(MOCK_CUSTOM_REPORTS.filter(r => r.organizationId === organizationId)),
  createCustomReport: (reportData: Omit<CustomReport, 'id'>): Promise<CustomReport> => {
      const newReport: CustomReport = { ...reportData, id: `report_${Date.now()}` };
      MOCK_CUSTOM_REPORTS.push(newReport);
      return simulateNetwork(newReport);
  },
  deleteCustomReport: (reportId: string): Promise<void> => {
      const index = MOCK_CUSTOM_REPORTS.findIndex(r => r.id === reportId);
      if (index > -1) MOCK_CUSTOM_REPORTS.splice(index, 1);
      return simulateNetwork(undefined);
  },
  getDashboardWidgets: (organizationId: string): Promise<DashboardWidget[]> => simulateNetwork(MOCK_DASHBOARD_WIDGETS.filter(w => MOCK_CUSTOM_REPORTS.find(r => r.id === w.reportId && r.organizationId === organizationId))),
  addDashboardWidget: (reportId: string): Promise<DashboardWidget> => {
      const newWidget: DashboardWidget = { id: `widget_${Date.now()}`, reportId };
      MOCK_DASHBOARD_WIDGETS.push(newWidget);
      return simulateNetwork(newWidget);
  },
  removeDashboardWidget: (widgetId: string): Promise<void> => {
      const index = MOCK_DASHBOARD_WIDGETS.findIndex(w => w.id === widgetId);
      if (index > -1) MOCK_DASHBOARD_WIDGETS.splice(index, 1);
      return simulateNetwork(undefined);
  },
  generateCustomReport: (config: any, organizationId: string): Promise<any[]> => {
    let rawData: any[] = [];
    if (config.dataSource === 'contacts') {
        rawData = MOCK_CONTACTS.filter(c => c.organizationId === organizationId);
    } else {
        rawData = MOCK_PRODUCTS.filter(p => p.organizationId === organizationId);
    }
    // Simplified filtering
    const filtered = rawData.filter(item => {
        return (config.filters || []).every((filter: any) => {
            const val = String(item[filter.field] || '').toLowerCase();
            const filterVal = filter.value.toLowerCase();
            if (filter.operator === 'contains') return val.includes(filterVal);
            if (filter.operator === 'is') return val === filterVal;
            return true;
        });
    });
    // Select columns
    return simulateNetwork(filtered.map(item => {
        const row: any = {};
        config.columns.forEach((col: string) => {
            row[col] = item[col];
        });
        return row;
    }));
  },

  // --- Workflows ---
  getWorkflows: (organizationId: string): Promise<Workflow[]> => simulateNetwork(MOCK_WORKFLOWS.filter(w => w.organizationId === organizationId)),
  createWorkflow: (workflowData: Omit<Workflow, 'id'>): Promise<Workflow> => {
      const newWorkflow: Workflow = { ...workflowData, id: `wf_${Date.now()}` };
      MOCK_WORKFLOWS.push(newWorkflow);
      return simulateNetwork(newWorkflow);
  },
  updateWorkflow: (workflowData: Workflow): Promise<Workflow> => {
      const index = MOCK_WORKFLOWS.findIndex(w => w.id === workflowData.id);
      if (index > -1) MOCK_WORKFLOWS[index] = workflowData;
      return simulateNetwork(workflowData);
  },

  // --- Advanced Workflows ---
  getAdvancedWorkflows: (organizationId: string): Promise<AdvancedWorkflow[]> => simulateNetwork(MOCK_ADVANCED_WORKFLOWS.filter(w => w.organizationId === organizationId)),
  createAdvancedWorkflow: (workflowData: Omit<AdvancedWorkflow, 'id'>): Promise<AdvancedWorkflow> => {
      const newWorkflow: AdvancedWorkflow = { ...workflowData, id: `adv_wf_${Date.now()}` };
      MOCK_ADVANCED_WORKFLOWS.push(newWorkflow);
      return simulateNetwork(newWorkflow);
  },
  updateAdvancedWorkflow: (workflowData: AdvancedWorkflow): Promise<AdvancedWorkflow> => {
      const index = MOCK_ADVANCED_WORKFLOWS.findIndex(w => w.id === workflowData.id);
      if (index > -1) MOCK_ADVANCED_WORKFLOWS[index] = workflowData;
      return simulateNetwork(workflowData);
  },
  deleteAdvancedWorkflow: (workflowId: string): Promise<void> => {
      const index = MOCK_ADVANCED_WORKFLOWS.findIndex(w => w.id === workflowId);
      if (index > -1) MOCK_ADVANCED_WORKFLOWS.splice(index, 1);
      return simulateNetwork(undefined);
  },
  
  // --- Campaigns ---
  getCampaigns: (organizationId: string): Promise<Campaign[]> => simulateNetwork(MOCK_CAMPAIGNS.filter(c => c.organizationId === organizationId)),
  createCampaign: (campaignData: Omit<Campaign, 'id'>): Promise<Campaign> => {
      const newCampaign: Campaign = { ...campaignData, id: `camp_${Date.now()}` };
      MOCK_CAMPAIGNS.push(newCampaign);
      return simulateNetwork(newCampaign);
  },
  updateCampaign: (campaignData: Campaign): Promise<Campaign> => {
      const index = MOCK_CAMPAIGNS.findIndex(c => c.id === campaignData.id);
      if (index > -1) MOCK_CAMPAIGNS[index] = campaignData;
      return simulateNetwork(campaignData);
  },
  launchCampaign: (campaignId: string): Promise<Campaign> => {
      const index = MOCK_CAMPAIGNS.findIndex(c => c.id === campaignId);
      if (index > -1) {
          MOCK_CAMPAIGNS[index].status = 'Active';
          // Simulate sending
          const audience = MOCK_CONTACTS.filter(c => MOCK_CAMPAIGNS[index].targetAudience.status.includes(c.status));
          MOCK_CAMPAIGNS[index].stats.recipients = audience.length;
          MOCK_CAMPAIGNS[index].stats.sent = audience.length; // simplified
      }
      return simulateNetwork(MOCK_CAMPAIGNS[index]);
  },

  // --- Tickets ---
  getTickets: (organizationId: string): Promise<Ticket[]> => simulateNetwork(MOCK_TICKETS.filter(t => t.organizationId === organizationId)),
  createTicket: (ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'replies'>): Promise<Ticket> => {
      const now = new Date().toISOString();
      const newTicket: Ticket = { ...ticketData, id: `ticket_${Date.now()}`, createdAt: now, updatedAt: now, replies: [] };
      MOCK_TICKETS.push(newTicket);
      return simulateNetwork(newTicket);
  },
  updateTicket: (ticketData: Ticket): Promise<Ticket> => {
      const index = MOCK_TICKETS.findIndex(t => t.id === ticketData.id);
      if (index > -1) {
          MOCK_TICKETS[index] = { ...ticketData, updatedAt: new Date().toISOString() };
          return simulateNetwork(MOCK_TICKETS[index]);
      }
      return Promise.reject('Ticket not found');
  },
  addTicketReply: (ticketId: string, replyData: Omit<TicketReply, 'id' | 'timestamp'>): Promise<Ticket> => {
      const index = MOCK_TICKETS.findIndex(t => t.id === ticketId);
      if (index > -1) {
          const newReply: TicketReply = { ...replyData, id: `reply_${Date.now()}`, timestamp: new Date().toISOString() };
          MOCK_TICKETS[index].replies.push(newReply);
          MOCK_TICKETS[index].updatedAt = newReply.timestamp;
          if (replyData.userId.startsWith('user_')) { // Team member reply
              MOCK_TICKETS[index].status = 'Open';
          }
          return simulateNetwork(MOCK_TICKETS[index]);
      }
      return Promise.reject('Ticket not found');
  },
  getOrganizationSettings: (organizationId: string): Promise<{ ticketSla: SLAPolicy } | null> => {
      return simulateNetwork(MOCK_ORG_SETTINGS[organizationId] || null);
  },
  updateOrganizationSettings: (settings: { organizationId: string, ticketSla: SLAPolicy }): Promise<{ ticketSla: SLAPolicy }> => {
      MOCK_ORG_SETTINGS[settings.organizationId] = settings;
      return simulateNetwork(settings);
  },

  // --- Documents ---
  getDocuments: (contactId: string): Promise<any[]> => {
    const contact = MOCK_CONTACTS.find(c => c.id === contactId);
    return simulateNetwork(contact?.documents || []);
  },
  uploadDocument: (docData: any): Promise<any> => {
    const contactIdx = MOCK_CONTACTS.findIndex(c => c.id === docData.contactId);
    if(contactIdx === -1) return Promise.reject("Contact not found");
    
    const newDoc = {
      ...docData,
      id: `doc_${Date.now()}`,
      uploadDate: new Date().toISOString()
    };

    if(!MOCK_CONTACTS[contactIdx].documents) MOCK_CONTACTS[contactIdx].documents = [];
    MOCK_CONTACTS[contactIdx].documents!.push(newDoc);
    return simulateNetwork(newDoc);
  },
  deleteDocument: (docId: string): Promise<void> => {
      for(const contact of MOCK_CONTACTS) {
          if (contact.documents) {
              const docIdx = contact.documents.findIndex(d => d.id === docId);
              if (docIdx > -1) {
                  contact.documents.splice(docIdx, 1);
                  break;
              }
          }
      }
      return simulateNetwork(undefined);
  },

  // --- Orders & Transactions
  createOrder: (orderData: Omit<Order, 'id'>): Promise<Order> => {
      const newOrder: Order = { ...orderData, id: `order_${Date.now()}` };
      const contactIdx = MOCK_CONTACTS.findIndex(c => c.id === newOrder.contactId);
      if (contactIdx > -1) {
          if (!MOCK_CONTACTS[contactIdx].orders) MOCK_CONTACTS[contactIdx].orders = [];
          MOCK_CONTACTS[contactIdx].orders!.push(newOrder);
      }
      return simulateNetwork(newOrder);
  },
  updateOrder: (orderData: Order): Promise<Order> => {
      const contactIdx = MOCK_CONTACTS.findIndex(c => c.id === orderData.contactId);
      if (contactIdx > -1) {
          const orderIdx = MOCK_CONTACTS[contactIdx].orders?.findIndex(o => o.id === orderData.id) ?? -1;
          if (orderIdx > -1) {
              MOCK_CONTACTS[contactIdx].orders![orderIdx] = orderData;
          }
      }
      return simulateNetwork(orderData);
  },
  deleteOrder: ({contactId, orderId}: {contactId: string, orderId: string}): Promise<void> => {
      const contactIdx = MOCK_CONTACTS.findIndex(c => c.id === contactId);
      if (contactIdx > -1) {
          const orderIdx = MOCK_CONTACTS[contactIdx].orders?.findIndex(o => o.id === orderId) ?? -1;
          if (orderIdx > -1) {
              MOCK_CONTACTS[contactIdx].orders!.splice(orderIdx, 1);
          }
      }
      return simulateNetwork(undefined);
  },
  createTransaction: ({ contactId, data }: { contactId: string, data: Omit<Transaction, 'id'> }): Promise<Transaction> => {
      const newTransaction: Transaction = { ...data, id: `trans_${Date.now()}` };
      const contactIdx = MOCK_CONTACTS.findIndex(c => c.id === contactId);
      if (contactIdx > -1) {
          if (!MOCK_CONTACTS[contactIdx].transactions) MOCK_CONTACTS[contactIdx].transactions = [];
          MOCK_CONTACTS[contactIdx].transactions!.push(newTransaction);
      }
      return simulateNetwork(newTransaction);
  }
};

export default apiClient;