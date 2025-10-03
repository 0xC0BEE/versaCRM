// FIX: Import the mutable `mockDataStore` to allow modification of mock data arrays, resolving read-only assignment errors.
import { mockDataStore as mock } from './mockData';
import { industryConfigs } from '../config/industryConfig';
import {
  User, Organization, AnyContact, Product, Supplier, Warehouse, CalendarEvent, Task, Interaction, Deal, DealStage,
  EmailTemplate, Workflow, Campaign, Ticket, CustomReport, DashboardWidget, Document, OrganizationSettings,
  Industry, ReportType, AnyReportData, ContactStatus, CustomField, TicketReply, Order, Transaction, IndustryConfig
} from '../types';
import { generateReportData, generateDashboardData } from './reportGenerator';
import { subDays } from 'date-fns';
import { checkAndTriggerWorkflows } from './workflowService';

// Simulate network delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const apiClient = {
  // AUTH
  async login(email: string): Promise<User | null> {
    await delay(500);
    const user = mock.users.find(u => u.email === email);
    return user || null;
  },

  // CONFIG
  async getIndustryConfig(industry: Industry): Promise<IndustryConfig> {
    await delay(200);
    return industryConfigs[industry];
  },

  // ORGANIZATIONS
  async getOrganizations(): Promise<Organization[]> {
    await delay(500);
    return mock.organizations;
  },
  async createOrganization(orgData: Omit<Organization, 'id' | 'createdAt'>): Promise<Organization> {
    await delay(500);
    const newOrg: Organization = {
      ...orgData,
      id: `org_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    mock.organizations.push(newOrg);
    return newOrg;
  },
  async updateOrganization(orgData: Organization): Promise<Organization> {
    await delay(500);
    mock.organizations = mock.organizations.map(o => o.id === orgData.id ? orgData : o);
    return orgData;
  },
  async deleteOrganization(orgId: string): Promise<string> {
    await delay(500);
    mock.organizations = mock.organizations.filter(o => o.id !== orgId);
    return orgId;
  },

  // CONTACTS
  async getContacts(organizationId: string): Promise<AnyContact[]> {
    await delay(800);
    return mock.contacts.filter(c => c.organizationId === organizationId);
  },
  async getContactById(contactId: string): Promise<AnyContact | null> {
    await delay(300);
    return mock.contacts.find(c => c.id === contactId) || null;
  },
  async createContact(contactData: Omit<AnyContact, 'id'>): Promise<AnyContact> {
    await delay(500);
    const newContact: AnyContact = {
      ...contactData,
      id: `contact_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    mock.contacts.push(newContact);
    
    // Trigger workflow
    checkAndTriggerWorkflows({
        event: 'contactCreated',
        contact: newContact,
        dependencies: {
            workflows: mock.workflows,
            emailTemplates: mock.emailTemplates,
            createTask: this.createTask,
            createInteraction: this.createInteraction,
            updateContact: this.updateContact,
        }
    });

    return newContact;
  },
  async updateContact(contactData: AnyContact): Promise<AnyContact> {
    await delay(500);
    const oldContact = mock.contacts.find(c => c.id === contactData.id);
    mock.contacts = mock.contacts.map(c => c.id === contactData.id ? contactData : c);

    if (oldContact && oldContact.status !== contactData.status) {
        checkAndTriggerWorkflows({
            event: 'contactStatusChanged',
            contact: contactData,
            fromStatus: oldContact.status,
            toStatus: contactData.status,
            dependencies: {
                workflows: mock.workflows,
                emailTemplates: mock.emailTemplates,
                createTask: this.createTask,
                createInteraction: this.createInteraction,
                updateContact: this.updateContact,
            }
        });
    }

    return contactData;
  },
  async deleteContact(contactId: string): Promise<string> {
    await delay(500);
    mock.contacts = mock.contacts.filter(c => c.id !== contactId);
    return contactId;
  },
  async bulkDeleteContacts(ids: string[], organizationId: string): Promise<string[]> {
      await delay(1000);
      mock.contacts = mock.contacts.filter(c => !ids.includes(c.id));
      return ids;
  },
  async bulkUpdateContactStatus(ids: string[], status: ContactStatus, organizationId: string): Promise<AnyContact[]> {
      await delay(1000);
      const updatedContacts: AnyContact[] = [];
      mock.contacts = mock.contacts.map(c => {
          if (ids.includes(c.id)) {
              const updated = { ...c, status };
              updatedContacts.push(updated);
              return updated;
          }
          return c;
      });
      return updatedContacts;
  },

  // INTERACTIONS
  async getInteractionsByContact(contactId: string): Promise<Interaction[]> {
    await delay(400);
    return mock.interactions.filter(i => i.contactId === contactId);
  },
  async getAllInteractions(organizationId: string): Promise<Interaction[]> {
    await delay(600);
    return mock.interactions.filter(i => i.organizationId === organizationId);
  },
  async createInteraction(interactionData: Omit<Interaction, 'id'>): Promise<Interaction> {
    await delay(300);
    const newInteraction: Interaction = {
      ...interactionData,
      id: `int_${Date.now()}`,
    };
    mock.interactions.push(newInteraction);
    // Also add to contact object
    mock.contacts = mock.contacts.map(c => {
      if (c.id === newInteraction.contactId) {
        return {
          ...c,
          interactions: [...(c.interactions || []), newInteraction]
        };
      }
      return c;
    });
    return newInteraction;
  },

  // TRANSACTIONS (part of Contact)
  async createTransaction({ contactId, data }: { contactId: string, data: Omit<Transaction, 'id'> }): Promise<AnyContact> {
    await delay(400);
    const newTransaction: Transaction = {
      ...data,
      id: `trans_${Date.now()}`,
    };
    let updatedContact: AnyContact | undefined;
    mock.contacts = mock.contacts.map(c => {
      if (c.id === contactId) {
        updatedContact = {
          ...c,
          transactions: [...(c.transactions || []), newTransaction],
        };
        return updatedContact;
      }
      return c;
    });
    if (!updatedContact) throw new Error("Contact not found");
    return updatedContact;
  },

  // ORDERS (part of Contact)
  async createOrder(orderData: Omit<Order, 'id'>): Promise<AnyContact> {
    await delay(500);
    const newOrder: Order = {
      ...orderData,
      id: `order_${Date.now()}`,
    };
    let updatedContact: AnyContact | undefined;
    mock.contacts = mock.contacts.map(c => {
      if (c.id === orderData.contactId) {
        updatedContact = {
          ...c,
          orders: [...(c.orders || []), newOrder],
        };
        return updatedContact;
      }
      return c;
    });
    if (!updatedContact) throw new Error("Contact not found");
    return updatedContact;
  },
  async updateOrder(orderData: Order): Promise<AnyContact> {
    await delay(500);
    let updatedContact: AnyContact | undefined;
    mock.contacts = mock.contacts.map(c => {
      if (c.id === orderData.contactId) {
        updatedContact = {
          ...c,
          orders: (c.orders || []).map(o => o.id === orderData.id ? orderData : o),
        };
        return updatedContact;
      }
      return c;
    });
    if (!updatedContact) throw new Error("Contact not found");
    return updatedContact;
  },
  async deleteOrder({ contactId, orderId }: { contactId: string, orderId: string }): Promise<AnyContact> {
    await delay(500);
     let updatedContact: AnyContact | undefined;
    mock.contacts = mock.contacts.map(c => {
      if (c.id === contactId) {
        updatedContact = {
          ...c,
          orders: (c.orders || []).filter(o => o.id !== orderId),
        };
        return updatedContact;
      }
      return c;
    });
    if (!updatedContact) throw new Error("Contact not found");
    return updatedContact;
  },

  // INVENTORY
  async getProducts(organizationId: string): Promise<Product[]> {
    await delay(600);
    return mock.products.filter(p => p.organizationId === organizationId);
  },
  async createProduct(productData: Omit<Product, 'id'>): Promise<Product> {
    await delay(500);
    const newProduct: Product = {
      ...productData,
      id: `prod_${Date.now()}`,
    };
    mock.products.push(newProduct);
    return newProduct;
  },
  async updateProduct(productData: Product): Promise<Product> {
    await delay(500);
    mock.products = mock.products.map(p => p.id === productData.id ? productData : p);
    return productData;
  },
  async deleteProduct(productId: string): Promise<string> {
    await delay(500);
    mock.products = mock.products.filter(p => p.id !== productId);
    return productId;
  },
  async getSuppliers(organizationId: string): Promise<Supplier[]> {
    await delay(400);
    return mock.suppliers.filter(s => s.organizationId === organizationId);
  },
  async getWarehouses(organizationId: string): Promise<Warehouse[]> {
    await delay(400);
    return mock.warehouses.filter(w => w.organizationId === organizationId);
  },

  // CALENDAR
  async getCalendarEvents(organizationId: string): Promise<CalendarEvent[]> {
    await delay(700);
    return mock.calendarEvents.filter(e => e.organizationId === organizationId);
  },
  async createCalendarEvent(eventData: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
    await delay(400);
    const newEvent: CalendarEvent = {
      ...eventData,
      id: `cal_${Date.now()}`,
    };
    mock.calendarEvents.push(newEvent);
    return newEvent;
  },
  async updateCalendarEvent(eventData: CalendarEvent): Promise<CalendarEvent> {
    await delay(400);
    mock.calendarEvents = mock.calendarEvents.map(e => e.id === eventData.id ? eventData : e);
    return eventData;
  },

  // TASKS
  async getTasks(organizationId: string): Promise<Task[]> {
    await delay(500);
    return mock.tasks.filter(t => t.organizationId === organizationId);
  },
  async createTask(taskData: Omit<Task, 'id' | 'isCompleted'>): Promise<Task> {
    await delay(300);
    const newTask: Task = {
      ...taskData,
      id: `task_${Date.now()}`,
      isCompleted: false,
    };
    mock.tasks.push(newTask);
    return newTask;
  },
  async updateTask(taskData: Task): Promise<Task> {
    await delay(200);
    mock.tasks = mock.tasks.map(t => t.id === taskData.id ? taskData : t);
    return taskData;
  },
  async deleteTask(taskId: string): Promise<string> {
    await delay(200);
    mock.tasks = mock.tasks.filter(t => t.id !== taskId);
    return taskId;
  },

  // TEAM
  async getTeamMembers(organizationId: string): Promise<User[]> {
    await delay(400);
    return mock.users.filter(u => u.organizationId === organizationId && (u.role === 'Organization Admin' || u.role === 'Team Member'));
  },
  async createTeamMember(memberData: Omit<User, 'id'>): Promise<User> {
    await delay(500);
    const newUser: User = {
      ...memberData,
      id: `user_${Date.now()}`,
    };
    mock.users.push(newUser);
    return newUser;
  },
  async updateTeamMember(memberData: User): Promise<User> {
    await delay(500);
    mock.users = mock.users.map(u => u.id === memberData.id ? memberData : u);
    return memberData;
  },

  // DEALS
  async getDealStages(organizationId: string): Promise<DealStage[]> {
      await delay(300);
      return mock.dealStages.filter(ds => ds.organizationId === organizationId);
  },
  async getDeals(organizationId: string): Promise<Deal[]> {
      await delay(600);
      return mock.deals.filter(d => d.organizationId === organizationId);
  },
  async createDeal(dealData: Omit<Deal, 'id' | 'createdAt'>): Promise<Deal> {
      await delay(500);
      const newDeal: Deal = {
          ...dealData,
          id: `deal_${Date.now()}`,
          createdAt: new Date().toISOString(),
      };
      mock.deals.push(newDeal);
      return newDeal;
  },
  async updateDeal(dealData: Deal): Promise<Deal> {
      await delay(200);
      mock.deals = mock.deals.map(d => d.id === dealData.id ? dealData : d);
      return dealData;
  },
  async deleteDeal(dealId: string): Promise<string> {
      await delay(500);
      mock.deals = mock.deals.filter(d => d.id !== dealId);
      return dealId;
  },

  // EMAIL TEMPLATES & WORKFLOWS
  async getEmailTemplates(organizationId: string): Promise<EmailTemplate[]> {
      await delay(300);
      return mock.emailTemplates.filter(et => et.organizationId === organizationId);
  },
  async createEmailTemplate(templateData: Omit<EmailTemplate, 'id'>): Promise<EmailTemplate> {
      await delay(400);
      const newTemplate: EmailTemplate = { ...templateData, id: `et_${Date.now()}` };
      mock.emailTemplates.push(newTemplate);
      return newTemplate;
  },
  async updateEmailTemplate(templateData: EmailTemplate): Promise<EmailTemplate> {
      await delay(400);
      mock.emailTemplates = mock.emailTemplates.map(t => t.id === templateData.id ? templateData : t);
      return templateData;
  },
  async deleteEmailTemplate(templateId: string): Promise<string> {
      await delay(400);
      mock.emailTemplates = mock.emailTemplates.filter(t => t.id !== templateId);
      return templateId;
  },
  async getWorkflows(organizationId: string): Promise<Workflow[]> {
      await delay(300);
      return mock.workflows.filter(wf => wf.organizationId === organizationId);
  },
  async createWorkflow(workflowData: Omit<Workflow, 'id'>): Promise<Workflow> {
      await delay(500);
      const newWorkflow: Workflow = { ...workflowData, id: `wf_${Date.now()}` };
      mock.workflows.push(newWorkflow);
      return newWorkflow;
  },
  async updateWorkflow(workflowData: Workflow): Promise<Workflow> {
      await delay(500);
      mock.workflows = mock.workflows.map(wf => wf.id === workflowData.id ? workflowData : wf);
      return workflowData;
  },

  // CAMPAIGNS
  async getCampaigns(organizationId: string): Promise<Campaign[]> {
      await delay(400);
      return mock.campaigns.filter(c => c.organizationId === organizationId);
  },
  async createCampaign(campaignData: Omit<Campaign, 'id'>): Promise<Campaign> {
      await delay(500);
      const newCampaign: Campaign = { ...campaignData, id: `camp_${Date.now()}` };
      mock.campaigns.push(newCampaign);
      return newCampaign;
  },
  async updateCampaign(campaignData: Campaign): Promise<Campaign> {
      await delay(500);
      mock.campaigns = mock.campaigns.map(c => c.id === campaignData.id ? campaignData : c);
      return campaignData;
  },

  // TICKETS
  async getTickets(organizationId: string): Promise<Ticket[]> {
      await delay(700);
      return mock.tickets.filter(t => t.organizationId === organizationId);
  },
  async createTicket(ticketData: Omit<Ticket, 'id'|'createdAt'|'updatedAt'|'replies'>): Promise<Ticket> {
      await delay(500);
      const newTicket: Ticket = {
          ...ticketData,
          id: `ticket_${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          replies: [],
      };
      mock.tickets.push(newTicket);
      return newTicket;
  },
  async updateTicket(ticketData: Ticket): Promise<Ticket> {
      await delay(300);
      const updatedTicket = { ...ticketData, updatedAt: new Date().toISOString() };
      mock.tickets = mock.tickets.map(t => t.id === ticketData.id ? updatedTicket : t);
      return updatedTicket;
  },
  async addTicketReply(ticketId: string, reply: Omit<TicketReply, 'id' | 'timestamp'>): Promise<Ticket> {
      await delay(300);
      const newReply: TicketReply = {
          ...reply,
          id: `reply_${Date.now()}`,
          timestamp: new Date().toISOString(),
      };
      let updatedTicket: Ticket | undefined;
      mock.tickets = mock.tickets.map(t => {
          if (t.id === ticketId) {
              updatedTicket = { ...t, replies: [...t.replies, newReply], updatedAt: new Date().toISOString() };
              return updatedTicket;
          }
          return t;
      });
      if (!updatedTicket) throw new Error("Ticket not found");
      return updatedTicket;
  },

  // REPORTS & DASHBOARD
  async getReportData(reportType: ReportType, dateRange: { start: Date; end: Date }, organizationId: string): Promise<AnyReportData> {
      await delay(1200);
      const dataSources = {
          contacts: mock.contacts.filter(c => c.organizationId === organizationId),
          products: mock.products.filter(p => p.organizationId === organizationId),
          team: mock.users.filter(u => u.organizationId === organizationId),
          tasks: mock.tasks.filter(t => t.organizationId === organizationId),
          deals: mock.deals.filter(d => d.organizationId === organizationId),
          dealStages: mock.dealStages.filter(ds => ds.organizationId === organizationId),
      };
      return generateReportData(reportType, dateRange, dataSources);
  },
  async getDashboardData(organizationId: string) {
      await delay(1000);
      const dateRange = { start: subDays(new Date(), 30), end: new Date() };
      const contacts = mock.contacts.filter(c => c.organizationId === organizationId);
      const interactions = mock.interactions.filter(i => i.organizationId === organizationId);
      return generateDashboardData(dateRange, contacts, interactions);
  },
  async getCustomReports(organizationId: string): Promise<CustomReport[]> {
      await delay(400);
      return mock.customReports.filter(cr => cr.organizationId === organizationId);
  },
  async createCustomReport(reportData: Omit<CustomReport, 'id'>): Promise<CustomReport> {
      await delay(500);
      const newReport: CustomReport = { ...reportData, id: `cr_${Date.now()}` };
      mock.customReports.push(newReport);
      return newReport;
  },
  async deleteCustomReport(reportId: string): Promise<string> {
      await delay(500);
      mock.customReports = mock.customReports.filter(cr => cr.id !== reportId);
      // Also remove any widgets associated with it
      mock.dashboardWidgets = mock.dashboardWidgets.filter(w => w.reportId !== reportId);
      return reportId;
  },
  async generateCustomReport(config: CustomReport['config'], organizationId: string): Promise<any[]> {
    await delay(1000);
    let rawData: any[] = [];
    if (config.dataSource === 'contacts') {
        rawData = mock.contacts.filter(c => c.organizationId === organizationId);
    } else if (config.dataSource === 'products') {
        rawData = mock.products.filter(p => p.organizationId === organizationId);
    }

    const filteredData = rawData.filter(item => {
        return config.filters.every(filter => {
            const itemValue = String(item[filter.field] || '').toLowerCase();
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

    return filteredData.map(item => {
        const selectedColumns: any = {};
        config.columns.forEach(col => {
            selectedColumns[col] = item[col];
        });
        return selectedColumns;
    });
  },

  // WIDGETS
  async getDashboardWidgets(organizationId: string): Promise<DashboardWidget[]> {
      await delay(300);
      return mock.dashboardWidgets.filter(w => mock.customReports.find(cr => cr.id === w.reportId)?.organizationId === organizationId);
  },
  async addDashboardWidget(reportId: string, organizationId: string): Promise<DashboardWidget> {
      await delay(400);
      const newWidget: DashboardWidget = { id: `widget_${Date.now()}`, reportId };
      mock.dashboardWidgets.push(newWidget);
      return newWidget;
  },
  async removeDashboardWidget(widgetId: string, organizationId: string): Promise<string> {
      await delay(400);
      mock.dashboardWidgets = mock.dashboardWidgets.filter(w => w.id !== widgetId);
      return widgetId;
  },

  // DOCUMENTS
  async getDocuments(contactId: string): Promise<Document[]> {
      await delay(500);
      return mock.documents.filter(d => d.contactId === contactId);
  },
  async uploadDocument(docData: Omit<Document, 'id'|'uploadDate'>): Promise<Document> {
      await delay(800);
      const newDoc: Document = {
          ...docData,
          id: `doc_${Date.now()}`,
          uploadDate: new Date().toISOString(),
      };
      mock.documents.push(newDoc);
      return newDoc;
  },
  async deleteDocument(docId: string): Promise<string> {
      await delay(500);
      mock.documents = mock.documents.filter(d => d.id !== docId);
      return docId;
  },
  
  // SETTINGS
  async getOrganizationSettings(organizationId: string): Promise<OrganizationSettings | null> {
      await delay(300);
      return mock.organizationSettings.find(s => s.organizationId === organizationId) || null;
  },
  async updateOrganizationSettings(settingsData: OrganizationSettings): Promise<OrganizationSettings> {
      await delay(500);
      const index = mock.organizationSettings.findIndex(s => s.organizationId === settingsData.organizationId);
      if (index > -1) {
          mock.organizationSettings[index] = settingsData;
      } else {
          mock.organizationSettings.push(settingsData);
      }
      return settingsData;
  },
  async updateCustomFields({ industry, fields }: { industry: Industry, fields: CustomField[] }): Promise<IndustryConfig> {
      await delay(500);
      industryConfigs[industry].customFields = fields;
      return industryConfigs[industry];
  },

};

export default apiClient;