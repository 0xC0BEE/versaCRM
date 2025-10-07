import {
  MOCK_ORGANIZATIONS,
  MOCK_USERS,
  MOCK_CONTACTS_MUTABLE,
  MOCK_CALENDAR_EVENTS,
  MOCK_TASKS,
  MOCK_DEALS,
  MOCK_DEAL_STAGES,
  MOCK_PRODUCTS,
  MOCK_SUPPLIERS,
  MOCK_WAREHOUSES,
  MOCK_EMAIL_TEMPLATES,
  MOCK_ROLES,
  MOCK_WORKFLOWS,
  MOCK_ADVANCED_WORKFLOWS,
  MOCK_ORGANIZATION_SETTINGS,
  MOCK_API_KEYS,
  MOCK_TICKETS,
  MOCK_FORMS,
  MOCK_CAMPAIGNS,
  MOCK_LANDING_PAGES,
} from './mockData';
import { industryConfigs } from '../config/industryConfig';
import {
  AnyContact,
  Organization,
  User,
  CalendarEvent,
  Task,
  Deal,
  DealStage,
  Product,
  Supplier,
  Warehouse,
  EmailTemplate,
  Industry,
  IndustryConfig,
  CustomRole,
  Permission,
  Workflow,
  AdvancedWorkflow,
  OrganizationSettings,
  ApiKey,
  Ticket,
  TicketReply,
  PublicForm,
  Campaign,
  Interaction,
  Document as AppDocument,
  Order,
  Transaction,
  CustomReport,
  LandingPage,
} from '../types';
import { checkAndTriggerWorkflows } from './workflowService';
import { recalculateScoreForContact } from './leadScoringService';
import { campaignService } from './campaignService';
import { campaignSchedulerService } from './campaignSchedulerService';
import { addDays } from 'date-fns';

// Simulate network delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const getContactByIdHelper = (contactId: string): AnyContact | null => {
    const contact = MOCK_CONTACTS_MUTABLE.find(c => c.id === contactId);
    return contact ? { ...contact } : null;
}

const apiClient = {
  // Auth
  login: async (email: string): Promise<User | null> => {
    await delay(500);
    const user = MOCK_USERS.find(u => u.email === email);
    return user ? { ...user } : null;
  },

  // Industry Config
  getIndustryConfig: async (industry: Industry): Promise<IndustryConfig | null> => {
    await delay(100);
    const config = industryConfigs[industry];
    if (config) return config;

    // This logic is for when the user edits the config.
    // In a real app, this would all be one API call.
    const orgSettings = MOCK_ORGANIZATIONS.find(o => o.industry === industry);
    return orgSettings ? industryConfigs[orgSettings.industry] : null;
  },

  updateCustomFields: async (payload: { industry: Industry, fields: any[] }): Promise<IndustryConfig> => {
    await delay(300);
    console.log("Updating custom fields for " + payload.industry + ":", payload.fields)
    const configToUpdate = industryConfigs[payload.industry];
    if (configToUpdate) {
        configToUpdate.customFields = payload.fields;
    }
    return industryConfigs[payload.industry];
  },

  // Organizations
  getOrganizations: async (): Promise<Organization[]> => {
    await delay(200);
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
      MOCK_ORGANIZATIONS[index] = orgData;
      return orgData;
    }
    throw new Error("Organization not found");
  },
  deleteOrganization: async (orgId: string): Promise<void> => {
    await delay(400);
    const index = MOCK_ORGANIZATIONS.findIndex(o => o.id === orgId);
    if (index > -1) {
      MOCK_ORGANIZATIONS.splice(index, 1);
      return;
    }
    throw new Error("Organization not found");
  },

  // Contacts
  getContacts: async (organizationId: string): Promise<AnyContact[]> => {
    await delay(500);
    return MOCK_CONTACTS_MUTABLE.filter(c => c.organizationId === organizationId);
  },
  getContactById: async (contactId: string): Promise<AnyContact | null> => {
    await delay(200);
    return getContactByIdHelper(contactId);
  },
  createContact: async (contactData: Omit<AnyContact, 'id'>): Promise<AnyContact> => {
    await delay(400);
    const newContact: AnyContact = {
      ...contactData,
      id: `contact_${Date.now()}`,
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
      const oldContact = MOCK_CONTACTS_MUTABLE[index];
      MOCK_CONTACTS_MUTABLE[index] = contactData;
      if (oldContact.status !== contactData.status) {
        checkAndTriggerWorkflows('contactStatusChanged', { contact: contactData, oldContact });
      }
      recalculateScoreForContact(contactData.id);
      return contactData;
    }
    throw new Error("Contact not found");
  },
  deleteContact: async (contactId: string): Promise<void> => {
    await delay(400);
    const index = MOCK_CONTACTS_MUTABLE.findIndex(c => c.id === contactId);
    if (index > -1) {
      MOCK_CONTACTS_MUTABLE.splice(index, 1);
      return;
    }
    throw new Error("Contact not found");
  },
  bulkDeleteContacts: async (contactIds: string[]): Promise<void> => {
    await delay(600);
    const newContacts = MOCK_CONTACTS_MUTABLE.filter(c => !contactIds.includes(c.id));
    MOCK_CONTACTS_MUTABLE.length = 0;
    Array.prototype.push.apply(MOCK_CONTACTS_MUTABLE, newContacts);
  },
  bulkUpdateContactStatus: async (payload: { ids: string[], status: any }): Promise<void> => {
    await delay(600);
    payload.ids.forEach(id => {
        const index = MOCK_CONTACTS_MUTABLE.findIndex(c => c.id === id);
        if (index > -1) {
            const oldContact = { ...MOCK_CONTACTS_MUTABLE[index] };
            if (oldContact.status !== payload.status) {
                MOCK_CONTACTS_MUTABLE[index].status = payload.status;
                checkAndTriggerWorkflows('contactStatusChanged', { contact: MOCK_CONTACTS_MUTABLE[index], oldContact });
                recalculateScoreForContact(id);
            }
        }
    });
  },


  // Interactions
  getInteractions: async (organizationId: string): Promise<Interaction[]> => {
    await delay(300);
    return MOCK_CONTACTS_MUTABLE.flatMap(c => c.interactions || []).filter(i => i.organizationId === organizationId);
  },
  getInteractionsByContact: async (contactId: string): Promise<Interaction[]> => {
    await delay(200);
    const contact = MOCK_CONTACTS_MUTABLE.find(c => c.id === contactId);
    return contact?.interactions || [];
  },
  createInteraction: async (data: Omit<Interaction, 'id'>): Promise<Interaction> => {
    await delay(300);
    const newInteraction: Interaction = { ...data, id: `int_${Date.now()}` };
    const contactIndex = MOCK_CONTACTS_MUTABLE.findIndex(c => c.id === data.contactId);
    if (contactIndex > -1) {
      const contact = MOCK_CONTACTS_MUTABLE[contactIndex];
      const newInteractions = [newInteraction, ...(contact.interactions || [])];
      MOCK_CONTACTS_MUTABLE[contactIndex] = { ...contact, interactions: newInteractions };
      recalculateScoreForContact(data.contactId);
    }
    return newInteraction;
  },
  updateInteraction: async (interaction: Interaction): Promise<Interaction> => {
      await delay(300);
      const contactIndex = MOCK_CONTACTS_MUTABLE.findIndex(c => c.id === interaction.contactId);
      if (contactIndex > -1) {
          const interactionIndex = MOCK_CONTACTS_MUTABLE[contactIndex].interactions?.findIndex(i => i.id === interaction.id);
          if (interactionIndex !== undefined && interactionIndex > -1) {
              MOCK_CONTACTS_MUTABLE[contactIndex].interactions![interactionIndex] = interaction;
              return interaction;
          }
      }
      throw new Error("Interaction not found");
  },

  // Team
  getTeamMembers: async (organizationId: string): Promise<User[]> => {
    await delay(200);
    return MOCK_USERS.filter(u => u.organizationId === organizationId && !u.isClient);
  },
  createUser: async (userData: Omit<User, 'id'>): Promise<User> => {
      await delay(400);
      const newUser: User = { ...userData, id: `user_${Date.now()}` };
      MOCK_USERS.push(newUser);
      return newUser;
  },
  updateUser: async (userData: User): Promise<User> => {
      await delay(400);
      const index = MOCK_USERS.findIndex(u => u.id === userData.id);
      if (index > -1) {
          MOCK_USERS[index] = userData;
          return userData;
      }
      throw new Error("User not found");
  },
  deleteUser: async (userId: string): Promise<void> => {
      await delay(400);
      const index = MOCK_USERS.findIndex(u => u.id === userId);
      if (index > -1) {
          MOCK_USERS.splice(index, 1);
          return;
      }
      throw new Error("User not found");
  },

  // Roles
  getRoles: async (organizationId: string): Promise<CustomRole[]> => {
      await delay(200);
      return MOCK_ROLES.filter(r => r.organizationId === organizationId);
  },
  createRole: async (roleData: Omit<CustomRole, 'id'>): Promise<CustomRole> => {
      await delay(400);
      const newRole: CustomRole = { ...roleData, id: `role_${Date.now()}` };
      MOCK_ROLES.push(newRole);
      return newRole;
  },
  updateRole: async (roleData: CustomRole): Promise<CustomRole> => {
      await delay(400);
      const index = MOCK_ROLES.findIndex(r => r.id === roleData.id);
      if (index > -1) {
          MOCK_ROLES[index] = roleData;
          return roleData;
      }
      throw new Error("Role not found");
  },
  deleteRole: async (roleId: string): Promise<void> => {
      await delay(400);
      const index = MOCK_ROLES.findIndex(r => r.id === roleId);
      if (index > -1) {
          MOCK_ROLES.splice(index, 1);
          return;
      }
      throw new Error("Role not found");
  },


  // Calendar
  getCalendarEvents: async (organizationId: string, userId: string): Promise<CalendarEvent[]> => {
    await delay(300);
    return MOCK_CALENDAR_EVENTS.filter(e => e.userIds.includes(userId));
  },
  createCalendarEvent: async (eventData: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> => {
      await delay(400);
      const newEvent: CalendarEvent = { ...eventData, id: `event_${Date.now()}` };
      MOCK_CALENDAR_EVENTS.push(newEvent);
      return newEvent;
  },
  updateCalendarEvent: async (eventData: CalendarEvent): Promise<CalendarEvent> => {
      await delay(400);
      const index = MOCK_CALENDAR_EVENTS.findIndex(e => e.id === eventData.id);
      if (index > -1) {
          MOCK_CALENDAR_EVENTS[index] = eventData;
          return eventData;
      }
      throw new Error("Event not found");
  },


  // Tasks
  getTasks: async (organizationId: string, userId: string, canViewAll: boolean): Promise<Task[]> => {
    await delay(300);
    if (canViewAll) {
        return MOCK_TASKS.filter(t => t.organizationId === organizationId);
    }
    return MOCK_TASKS.filter(t => t.userId === userId);
  },
  createTask: async (taskData: Omit<Task, 'id' | 'isCompleted'>): Promise<Task> => {
    await delay(300);
    const newTask: Task = { ...taskData, id: `task_${Date.now()}`, isCompleted: false };
    MOCK_TASKS.push(newTask);
    return newTask;
  },
  updateTask: async (taskData: Task): Promise<Task> => {
    await delay(200);
    const index = MOCK_TASKS.findIndex(t => t.id === taskData.id);
    if (index > -1) {
      MOCK_TASKS[index] = taskData;
      return taskData;
    }
    throw new Error("Task not found");
  },
  deleteTask: async (taskId: string): Promise<void> => {
    await delay(200);
    const index = MOCK_TASKS.findIndex(t => t.id === taskId);
    if (index > -1) {
      MOCK_TASKS.splice(index, 1);
      return;
    }
    throw new Error("Task not found");
  },
  
  // Deals
  getDealStages: async (organizationId: string): Promise<DealStage[]> => {
      await delay(150);
      return MOCK_DEAL_STAGES.filter(s => s.organizationId === organizationId);
  },
  getDeals: async (organizationId: string): Promise<Deal[]> => {
      await delay(400);
      return MOCK_DEALS.filter(d => d.organizationId === organizationId);
  },
   createDeal: async (dealData: Omit<Deal, 'id' | 'createdAt'>): Promise<Deal> => {
    await delay(400);
    const newDeal: Deal = { ...dealData, id: `deal_${Date.now()}`, createdAt: new Date().toISOString() };
    MOCK_DEALS.push(newDeal);
    const contact = getContactByIdHelper(newDeal.contactId);
    if (contact) {
        checkAndTriggerWorkflows('dealCreated', { deal: newDeal, contact });
    }
    return newDeal;
  },
  updateDeal: async (dealData: Deal): Promise<Deal> => {
    await delay(300);
    const index = MOCK_DEALS.findIndex(d => d.id === dealData.id);
    if (index > -1) {
      const oldDeal = MOCK_DEALS[index];
      MOCK_DEALS[index] = dealData;
      if (oldDeal.stageId !== dealData.stageId) {
          const contact = getContactByIdHelper(dealData.contactId);
          if (contact) {
            checkAndTriggerWorkflows('dealStageChanged', { deal: dealData, oldDeal, contact });
          }
      }
      return dealData;
    }
    throw new Error("Deal not found");
  },
  deleteDeal: async (dealId: string): Promise<void> => {
      await delay(300);
      const index = MOCK_DEALS.findIndex(d => d.id === dealId);
      if (index > -1) {
          MOCK_DEALS.splice(index, 1);
          return;
      }
      throw new Error("Deal not found");
  },

  // Inventory
  getProducts: async (organizationId: string): Promise<Product[]> => {
    await delay(300);
    return MOCK_PRODUCTS.filter(p => p.organizationId === organizationId);
  },
  createProduct: async (productData: Omit<Product, 'id'>): Promise<Product> => {
    await delay(400);
    const newProduct: Product = { ...productData, id: `prod_${Date.now()}`};
    MOCK_PRODUCTS.push(newProduct);
    return newProduct;
  },
  updateProduct: async (productData: Product): Promise<Product> => {
      await delay(400);
      const index = MOCK_PRODUCTS.findIndex(p => p.id === productData.id);
      if (index > -1) {
          MOCK_PRODUCTS[index] = productData;
          return productData;
      }
      throw new Error("Product not found");
  },
  deleteProduct: async (productId: string): Promise<void> => {
      await delay(400);
      const index = MOCK_PRODUCTS.findIndex(p => p.id === productId);
      if (index > -1) {
          MOCK_PRODUCTS.splice(index, 1);
          return;
      }
      throw new Error("Product not found");
  },
  getSuppliers: async (organizationId: string): Promise<Supplier[]> => {
    await delay(300);
    return MOCK_SUPPLIERS.filter(s => s.organizationId === organizationId);
  },
  getWarehouses: async (organizationId: string): Promise<Warehouse[]> => {
    await delay(300);
    return MOCK_WAREHOUSES.filter(w => w.organizationId === organizationId);
  },

  // Orders & Transactions (part of Contact)
  createOrder: async (orderData: Omit<Order, 'id'> & { contactId: string }): Promise<Order> => {
      await delay(400);
      const { contactId, ...rest } = orderData;
      const newOrder: Order = { ...rest, id: `order_${Date.now()}` };
      const contactIndex = MOCK_CONTACTS_MUTABLE.findIndex(c => c.id === contactId);
      if (contactIndex > -1) {
          if (!MOCK_CONTACTS_MUTABLE[contactIndex].orders) MOCK_CONTACTS_MUTABLE[contactIndex].orders = [];
          MOCK_CONTACTS_MUTABLE[contactIndex].orders!.push(newOrder);
          // Also create a charge transaction
          const newTransaction: Transaction = {
              id: `txn_${Date.now()}`,
              date: newOrder.orderDate,
              type: 'Charge',
              amount: newOrder.total,
              method: 'Other',
              orderId: newOrder.id
          };
          if (!MOCK_CONTACTS_MUTABLE[contactIndex].transactions) MOCK_CONTACTS_MUTABLE[contactIndex].transactions = [];
          MOCK_CONTACTS_MUTABLE[contactIndex].transactions!.push(newTransaction);

      }
      return newOrder;
  },
  updateOrder: async (orderData: Order & { contactId: string }): Promise<Order> => {
      await delay(400);
      const { contactId, ...rest } = orderData;
      const contactIndex = MOCK_CONTACTS_MUTABLE.findIndex(c => c.id === contactId);
      if (contactIndex > -1) {
          const orderIndex = MOCK_CONTACTS_MUTABLE[contactIndex].orders?.findIndex(o => o.id === rest.id);
          if (orderIndex !== undefined && orderIndex > -1) {
              MOCK_CONTACTS_MUTABLE[contactIndex].orders![orderIndex] = rest;
              return rest;
          }
      }
      throw new Error("Order not found");
  },
  deleteOrder: async (payload: { contactId: string, orderId: string }): Promise<void> => {
      await delay(400);
      const { contactId, orderId } = payload;
      const contactIndex = MOCK_CONTACTS_MUTABLE.findIndex(c => c.id === contactId);
      if (contactIndex > -1) {
          const orders = MOCK_CONTACTS_MUTABLE[contactIndex].orders || [];
          MOCK_CONTACTS_MUTABLE[contactIndex].orders = orders.filter(o => o.id !== orderId);
          return;
      }
      throw new Error("Order not found");
  },
  createTransaction: async (payload: { contactId: string, data: Omit<Transaction, 'id'> }): Promise<Transaction> => {
      await delay(300);
      const { contactId, data } = payload;
      const newTransaction: Transaction = { ...data, id: `txn_${Date.now()}` };
      const contactIndex = MOCK_CONTACTS_MUTABLE.findIndex(c => c.id === contactId);
      if (contactIndex > -1) {
          if (!MOCK_CONTACTS_MUTABLE[contactIndex].transactions) MOCK_CONTACTS_MUTABLE[contactIndex].transactions = [];
          MOCK_CONTACTS_MUTABLE[contactIndex].transactions!.push(newTransaction);
      }
      return newTransaction;
  },

  // Documents
  getDocuments: async (contactId: string): Promise<AppDocument[]> => {
      await delay(200);
      return []; // Not stored on contact for simplicity, needs its own mock array
  },
  uploadDocument: async (docData: Omit<AppDocument, 'id' | 'uploadDate'>): Promise<AppDocument> => {
      await delay(500);
      const newDoc = { ...docData, id: `doc_${Date.now()}`, uploadDate: new Date().toISOString() };
      // This is a placeholder; a real app would store this.
      return newDoc;
  },
  deleteDocument: async(docId: string): Promise<void> => {
    await delay(300);
    // Placeholder
    return;
  },

  // Email Templates
  getEmailTemplates: async (organizationId: string): Promise<EmailTemplate[]> => {
    await delay(200);
    return MOCK_EMAIL_TEMPLATES.filter(t => t.organizationId === organizationId);
  },
  createEmailTemplate: async (templateData: Omit<EmailTemplate, 'id'>): Promise<EmailTemplate> => {
    await delay(300);
    const newTemplate = { ...templateData, id: `tmpl_${Date.now()}`};
    MOCK_EMAIL_TEMPLATES.push(newTemplate);
    return newTemplate;
  },
  updateEmailTemplate: async (templateData: EmailTemplate): Promise<EmailTemplate> => {
      await delay(300);
      const index = MOCK_EMAIL_TEMPLATES.findIndex(t => t.id === templateData.id);
      if (index > -1) {
          MOCK_EMAIL_TEMPLATES[index] = templateData;
          return templateData;
      }
      throw new Error("Template not found");
  },
  deleteEmailTemplate: async (templateId: string): Promise<void> => {
      await delay(300);
      const index = MOCK_EMAIL_TEMPLATES.findIndex(t => t.id === templateId);
      if (index > -1) MOCK_EMAIL_TEMPLATES.splice(index, 1);
  },
  
  // Workflows
  getWorkflows: async (organizationId: string): Promise<Workflow[]> => {
      await delay(200);
      return MOCK_WORKFLOWS.filter(w => w.organizationId === organizationId);
  },
  createWorkflow: async (data: Omit<Workflow, 'id'>): Promise<Workflow> => {
      await delay(400);
      const newWorkflow = { ...data, id: `wf_${Date.now()}` };
      MOCK_WORKFLOWS.push(newWorkflow);
      return newWorkflow;
  },
  updateWorkflow: async (data: Workflow): Promise<Workflow> => {
      await delay(400);
      const index = MOCK_WORKFLOWS.findIndex(w => w.id === data.id);
      if (index > -1) MOCK_WORKFLOWS[index] = data;
      return data;
  },
  getAdvancedWorkflows: async (organizationId: string): Promise<AdvancedWorkflow[]> => {
      await delay(200);
      return MOCK_ADVANCED_WORKFLOWS.filter(w => w.organizationId === organizationId);
  },
  createAdvancedWorkflow: async (data: Omit<AdvancedWorkflow, 'id'>): Promise<AdvancedWorkflow> => {
      await delay(400);
      const newWorkflow = { ...data, id: `awf_${Date.now()}` };
      MOCK_ADVANCED_WORKFLOWS.push(newWorkflow);
      return newWorkflow;
  },
  updateAdvancedWorkflow: async (data: AdvancedWorkflow): Promise<AdvancedWorkflow> => {
      await delay(400);
      const index = MOCK_ADVANCED_WORKFLOWS.findIndex(w => w.id === data.id);
      if (index > -1) MOCK_ADVANCED_WORKFLOWS[index] = data;
      return data;
  },
  deleteAdvancedWorkflow: async (id: string): Promise<void> => {
      await delay(300);
      const index = MOCK_ADVANCED_WORKFLOWS.findIndex(w => w.id === id);
      if (index > -1) MOCK_ADVANCED_WORKFLOWS.splice(index, 1);
  },

  // Campaigns
    getCampaigns: async (organizationId: string): Promise<Campaign[]> => {
        await delay(300);
        return MOCK_CAMPAIGNS.filter(c => c.organizationId === organizationId);
    },
    createCampaign: async (data: Omit<Campaign, 'id'>): Promise<Campaign> => {
        await delay(400);
        const newCampaign = { ...data, id: `camp_${Date.now()}` };
        MOCK_CAMPAIGNS.push(newCampaign);
        return newCampaign;
    },
    updateCampaign: async (data: Campaign): Promise<Campaign> => {
        await delay(400);
        const index = MOCK_CAMPAIGNS.findIndex(c => c.id === data.id);
        if (index > -1) MOCK_CAMPAIGNS[index] = data;
        return data;
    },
    launchCampaign: async (campaignId: string): Promise<Campaign> => {
        await delay(500);
        campaignService.enrollContacts(campaignId);
        const campaign = MOCK_CAMPAIGNS.find(c => c.id === campaignId);
        if(!campaign) throw new Error('Campaign not found');
        campaignSchedulerService.processScheduledCampaigns(new Date()); // Run scheduler immediately on launch
        return campaign;
    },
    advanceDay: async (currentDate: Date): Promise<Date> => {
        await delay(500);
        const newDate = addDays(currentDate, 1);
        campaignSchedulerService.processScheduledCampaigns(newDate);
        return newDate;
    },

  // Custom Reports
  getCustomReports: async (organizationId: string): Promise<CustomReport[]> => {
      await delay(200);
      return [];
  },
  createCustomReport: async (data: Omit<CustomReport, 'id'>): Promise<CustomReport> => {
      await delay(400);
      const newReport = { ...data, id: `report_${Date.now()}` };
      return newReport;
  },
  updateCustomReport: async (data: CustomReport): Promise<CustomReport> => {
      await delay(400);
      return data;
  },
  deleteCustomReport: async (id: string): Promise<void> => {
      await delay(300);
      return;
  },
  generateCustomReport: async (config: CustomReport['config'], orgId: string): Promise<any[]> => {
    await delay(500);
    const rawData = config.dataSource === 'contacts' 
        ? MOCK_CONTACTS_MUTABLE.filter(c => c.organizationId === orgId)
        : MOCK_PRODUCTS.filter(p => p.organizationId === orgId);

    const filteredData = rawData.filter(item => {
        return config.filters.every(filter => {
            const itemValue = String((item as any)[filter.field] || '').toLowerCase();
            const filterValue = filter.value.toLowerCase();
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
        const selectedColumns: any = {};
        config.columns.forEach(col => {
            selectedColumns[col] = (item as any)[col];
        });
        return selectedColumns;
    });
  },

  // Widgets
  getDashboardWidgets: async (organizationId: string): Promise<any[]> => {
      await delay(200);
      return [];
  },
  addDashboardWidget: async (reportId: string): Promise<any> => {
      await delay(300);
      const newWidget = { id: `widget_${Date.now()}`, organizationId: 'org_1', reportId };
      return newWidget;
  },
  removeDashboardWidget: async (widgetId: string): Promise<void> => {
      await delay(300);
      return;
  },

  // Settings
  getOrganizationSettings: async (organizationId: string): Promise<OrganizationSettings> => {
      await delay(150);
      return MOCK_ORGANIZATION_SETTINGS;
  },
  updateOrganizationSettings: async(data: Partial<OrganizationSettings>): Promise<OrganizationSettings> => {
      await delay(400);
      Object.assign(MOCK_ORGANIZATION_SETTINGS, data);
      return MOCK_ORGANIZATION_SETTINGS;
  },
  recalculateAllScores: async (organizationId: string): Promise<void> => {
      await delay(1000);
      MOCK_CONTACTS_MUTABLE.forEach(c => recalculateScoreForContact(c.id));
  },
  // API Keys
  getApiKeys: async (organizationId: string): Promise<ApiKey[]> => {
      await delay(200);
      return MOCK_API_KEYS.filter(k => k.organizationId === organizationId);
  },
  createApiKey: async(payload: { orgId: string, name: string }): Promise<{ key: ApiKey, secret: string}> => {
      await delay(500);
      const secret = `vscrm_secret_${[...Array(32)].map(() => Math.random().toString(36)[2]).join('')}`;
      const newKey: ApiKey = {
          id: `key_${Date.now()}`,
          organizationId: payload.orgId,
          name: payload.name,
          keyPrefix: 'vscrm_live_',
          createdAt: new Date().toISOString(),
      };
      MOCK_API_KEYS.push(newKey);
      return { key: newKey, secret };
  },
  deleteApiKey: async (keyId: string): Promise<void> => {
      await delay(300);
      const index = MOCK_API_KEYS.findIndex(k => k.id === keyId);
      if (index > -1) MOCK_API_KEYS.splice(index, 1);
  },

  // Tickets
  getTickets: async (organizationId: string): Promise<Ticket[]> => {
      await delay(400);
      return MOCK_TICKETS.filter(t => t.organizationId === organizationId);
  },
  createTicket: async(data: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'replies'>): Promise<Ticket> => {
    await delay(400);
    const now = new Date().toISOString();
    const newTicket: Ticket = {
        ...data,
        id: `tkt_${Date.now()}`,
        createdAt: now,
        updatedAt: now,
        replies: []
    };
    MOCK_TICKETS.push(newTicket);
    const contact = getContactByIdHelper(data.contactId);
    checkAndTriggerWorkflows('ticketCreated', { ticket: newTicket, contact });
    return newTicket;
  },
  updateTicket: async(data: Ticket): Promise<Ticket> => {
      await delay(300);
      const index = MOCK_TICKETS.findIndex(t => t.id === data.id);
      if (index > -1) {
          const oldTicket = MOCK_TICKETS[index];
          const updatedTicket = { ...data, updatedAt: new Date().toISOString() };
          MOCK_TICKETS[index] = updatedTicket;
          if(oldTicket.status !== data.status) {
              checkAndTriggerWorkflows('ticketStatusChanged', { ticket: updatedTicket, oldTicket });
          }
          return updatedTicket;
      }
      throw new Error("Ticket not found");
  },
  addTicketReply: async(ticketId: string, reply: Omit<TicketReply, 'id' | 'timestamp'>): Promise<Ticket> => {
      await delay(300);
      const index = MOCK_TICKETS.findIndex(t => t.id === ticketId);
      if (index > -1) {
          const newReply = { ...reply, id: `rep_${Date.now()}`, timestamp: new Date().toISOString() };
          const ticket = MOCK_TICKETS[index];
          const newReplies = [...ticket.replies, newReply];
          const updatedTicket = { ...ticket, replies: newReplies, updatedAt: new Date().toISOString() };
          MOCK_TICKETS[index] = updatedTicket;
          return updatedTicket;
      }
      throw new Error("Ticket not found");
  },
  // Public Forms
  getForms: async(organizationId: string): Promise<PublicForm[]> => {
      await delay(200);
      return MOCK_FORMS.filter(f => f.organizationId === organizationId);
  },
  createForm: async(data: Omit<PublicForm, 'id'>): Promise<PublicForm> => {
      await delay(400);
      const newForm = { ...data, id: `form_${Date.now()}` };
      MOCK_FORMS.push(newForm);
      return newForm;
  },
  updateForm: async(data: PublicForm): Promise<PublicForm> => {
      await delay(400);
      const index = MOCK_FORMS.findIndex(f => f.id === data.id);
      if(index > -1) MOCK_FORMS[index] = data;
      return data;
  },
  deleteForm: async(id: string): Promise<void> => {
      await delay(300);
      const index = MOCK_FORMS.findIndex(f => f.id === id);
      if (index > -1) MOCK_FORMS.splice(index, 1);
  },
    submitPublicForm: async (payload: { formId: string, submissionData: any }): Promise<void> => {
    await delay(500);
    const form = MOCK_FORMS.find(f => f.id === payload.formId);
    if (!form) throw new Error("Form not found");

    const customFieldsData: Record<string, any> = {};
    Object.keys(payload.submissionData).forEach(key => {
        if (key.startsWith('customFields.')) {
            customFieldsData[key.replace('customFields.', '')] = payload.submissionData[key];
        }
    });
    
    // Inlined 'createContact' logic to avoid self-reference issue during object initialization
    const newContactData: Omit<AnyContact, 'id'> = {
        organizationId: form.organizationId,
        contactName: payload.submissionData.contactName || 'New Form Lead',
        email: payload.submissionData.email || '',
        phone: payload.submissionData.phone || '',
        status: 'Lead',
        leadSource: `Form: ${form.name}`,
        customFields: customFieldsData,
        createdAt: new Date().toISOString(),
    };
    const newContact: AnyContact = { ...newContactData, id: `contact_${Date.now()}`};
    MOCK_CONTACTS_MUTABLE.unshift(newContact);
    checkAndTriggerWorkflows('contactCreated', { contact: newContact });
    
    // Inlined 'createInteraction' logic
    const newInteraction: Interaction = { 
        id: `int_${Date.now()}`,
        organizationId: form.organizationId,
        contactId: newContact.id,
        userId: 'system',
        type: 'Form Submission',
        date: new Date().toISOString(),
        notes: `Submitted form: "${form.name}"`
    };
    const contactIndex = MOCK_CONTACTS_MUTABLE.findIndex(c => c.id === newContact.id);
    if (contactIndex > -1) {
        if (!MOCK_CONTACTS_MUTABLE[contactIndex].interactions) MOCK_CONTACTS_MUTABLE[contactIndex].interactions = [];
        MOCK_CONTACTS_MUTABLE[contactIndex].interactions!.unshift(newInteraction);
        recalculateScoreForContact(newContact.id);
    }

    if (form.actions.enrollInCampaignId) {
        campaignService.checkAndEnrollInCampaigns(newContact);
    }
  },

  // Landing Pages
    getLandingPages: async(organizationId: string): Promise<LandingPage[]> => {
        await delay(300);
        return MOCK_LANDING_PAGES.filter(p => p.organizationId === organizationId);
    },
    createLandingPage: async(data: Omit<LandingPage, 'id'>): Promise<LandingPage> => {
        await delay(400);
        const newPage = { ...data, id: `lp_${Date.now()}` };
        MOCK_LANDING_PAGES.push(newPage);
        return newPage;
    },
    updateLandingPage: async(data: LandingPage): Promise<LandingPage> => {
        await delay(400);
        const index = MOCK_LANDING_PAGES.findIndex(p => p.id === data.id);
        if(index > -1) MOCK_LANDING_PAGES[index] = data;
        return data;
    },
    deleteLandingPage: async(id: string): Promise<void> => {
        await delay(300);
        const index = MOCK_LANDING_PAGES.findIndex(p => p.id === id);
        if (index > -1) MOCK_LANDING_PAGES.splice(index, 1);
    },
    getLandingPageBySlug: async(slug: string): Promise<LandingPage | null> => {
        await delay(300);
        const page = MOCK_LANDING_PAGES.find(p => p.slug === slug && p.status === 'Published');
        return page || null;
    },

  // Live Chat
  handleNewChatMessage: async(payload: { orgId: string, contactId?: string, contactName: string, contactEmail: string, message: string }): Promise<void> => {
      await delay(500);
      let contactId = payload.contactId;
      if (!contactId) {
          const newContact = await apiClient.createContact({ organizationId: payload.orgId, contactName: payload.contactName, email: payload.contactEmail, phone: '', status: 'Lead', leadSource: 'Live Chat', customFields: {}, createdAt: new Date().toISOString() });
          contactId = newContact.id;
      }

      await apiClient.createTicket({
          organizationId: payload.orgId,
          contactId: contactId,
          subject: `Live Chat with ${payload.contactName}`,
          description: payload.message,
          priority: 'Medium',
          status: 'New'
      });
  },

  // Email Sync
  runEmailSync: async(organizationId: string): Promise<void> => {
      await delay(2000);
      const contact = MOCK_CONTACTS_MUTABLE.find(c => c.organizationId === organizationId);
      if (contact) {
          const newInteraction: Interaction = {
              id: `int_sync_${Date.now()}`,
              organizationId,
              contactId: contact.id,
              userId: 'system',
              type: 'Email',
              date: new Date().toISOString(),
              notes: 'Subject: Re: Project Proposal\n\nThis is a simulated synced email.'
          };
          if (!(contact.interactions || []).some(i => i.notes.includes('simulated synced email'))) {
              if (!contact.interactions) contact.interactions = [];
              contact.interactions.unshift(newInteraction);
          }
      }
       const settings = MOCK_ORGANIZATION_SETTINGS;
       if (settings) {
         settings.emailIntegration.lastSync = new Date().toISOString();
       }
  },
  
  // VoIP
  connectVoipProvider: async(provider: string): Promise<void> => {
      await delay(500);
      const settings = MOCK_ORGANIZATION_SETTINGS;
      if(settings) {
          settings.voip = { isConnected: true, provider };
      }
  },
  disconnectVoipProvider: async(): Promise<void> => {
      await delay(500);
       const settings = MOCK_ORGANIZATION_SETTINGS;
       if(settings) {
          settings.voip = { isConnected: false };
       }
  },
  // Get dashboard data
  getDashboardData: async(orgId: string): Promise<any> => {
      await delay(600);
      const contacts = MOCK_CONTACTS_MUTABLE.filter(c => c.organizationId === orgId);
      const interactions = MOCK_CONTACTS_MUTABLE.flatMap(c => c.interactions || []).filter(i => i.organizationId === orgId);
      const { generateDashboardData } = await import('./reportGenerator');
      return generateDashboardData(contacts, interactions);
  }
};

export default apiClient;
