// FIX: Import the mutable `mockDataStore` to allow modification of mock data arrays, resolving read-only assignment errors.
import { mockDataStore as mock } from './mockData';
import { industryConfigs } from '../config/industryConfig';
import {
  User, Organization, AnyContact, Product, Supplier, Warehouse, CalendarEvent, Task, Interaction, Deal, DealStage,
  EmailTemplate, Workflow, Campaign, Ticket, CustomReport, DashboardWidget, Document, OrganizationSettings,
  Industry, ReportType, AnyReportData, ContactStatus, CustomField, TicketReply, Order, Transaction, IndustryConfig
} from '../types';
import { generateReportData, generateDashboardData } from './reportGenerator';
// FIX: Switched to subDays as sub is not an exported member.
import { subDays } from 'date-fns';
import { checkAndTriggerWorkflows } from './workflowService';
import { replacePlaceholders } from '../utils/textUtils';

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
    const index = mock.organizations.findIndex(o => o.id === orgData.id);
    if (index !== -1) {
      mock.organizations[index] = orgData;
    }
    return orgData;
  },
  async deleteOrganization(orgId: string): Promise<string> {
    await delay(500);
    const index = mock.organizations.findIndex(o => o.id === orgId);
    if (index !== -1) {
      mock.organizations.splice(index, 1);
    }
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
            createTask: this.createTask.bind(this),
            createInteraction: this.createInteraction.bind(this),
            updateContact: this.updateContact.bind(this),
        }
    });

    return newContact;
  },
  async updateContact(contactData: AnyContact): Promise<AnyContact> {
    await delay(500);
    const index = mock.contacts.findIndex(c => c.id === contactData.id);
    const oldContact = index !== -1 ? { ...mock.contacts[index] } : null;
    
    if (index !== -1) {
      mock.contacts[index] = contactData;
    }

    if (oldContact && oldContact.status !== contactData.status) {
        checkAndTriggerWorkflows({
            event: 'contactStatusChanged',
            contact: contactData,
            from: oldContact.status,
            to: contactData.status,
            dependencies: {
                workflows: mock.workflows,
                emailTemplates: mock.emailTemplates,
                createTask: this.createTask.bind(this),
                createInteraction: this.createInteraction.bind(this),
                updateContact: this.updateContact.bind(this),
            }
        });
    }

    return contactData;
  },
  async deleteContact(contactId: string): Promise<string> {
    await delay(500);
    const index = mock.contacts.findIndex(c => c.id === contactId);
    if (index !== -1) {
      mock.contacts.splice(index, 1);
    }
    return contactId;
  },
  async bulkDeleteContacts(ids: string[], organizationId: string): Promise<string[]> {
      await delay(1000);
      const idsToDelete = new Set(ids);
      for (let i = mock.contacts.length - 1; i >= 0; i--) {
        const contact = mock.contacts[i];
        if (idsToDelete.has(contact.id) && contact.organizationId === organizationId) {
            mock.contacts.splice(i, 1);
        }
      }
      return ids;
  },
  async bulkUpdateContactStatus(ids: string[], status: ContactStatus, organizationId: string): Promise<AnyContact[]> {
      await delay(1000);
      const updatedContacts: AnyContact[] = [];
      ids.forEach(id => {
          const index = mock.contacts.findIndex(c => c.id === id && c.organizationId === organizationId);
          if (index !== -1) {
              const updated = { ...mock.contacts[index], status };
              mock.contacts[index] = updated;
              updatedContacts.push(updated);
          }
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
    const contactIndex = mock.contacts.findIndex(c => c.id === newInteraction.contactId);
    if (contactIndex !== -1) {
      const contact = mock.contacts[contactIndex];
      contact.interactions = [...(contact.interactions || []), newInteraction];
    }
    return newInteraction;
  },

  // TRANSACTIONS (part of Contact)
  async createTransaction({ contactId, data }: { contactId: string, data: Omit<Transaction, 'id'> }): Promise<AnyContact> {
    await delay(400);
    const newTransaction: Transaction = {
      ...data,
      id: `trans_${Date.now()}`,
    };
    const contactIndex = mock.contacts.findIndex(c => c.id === contactId);
    if (contactIndex === -1) throw new Error("Contact not found");

    const updatedContact = mock.contacts[contactIndex];
    updatedContact.transactions = [...(updatedContact.transactions || []), newTransaction];
    
    return updatedContact;
  },

  // ORDERS (part of Contact)
  async createOrder(orderData: Omit<Order, 'id'>): Promise<AnyContact> {
    await delay(500);
    const newOrder: Order = {
      ...orderData,
      id: `order_${Date.now()}`,
    };
    const contactIndex = mock.contacts.findIndex(c => c.id === orderData.contactId);
    if (contactIndex === -1) throw new Error("Contact not found");

    const updatedContact = mock.contacts[contactIndex];
    updatedContact.orders = [...(updatedContact.orders || []), newOrder];
    
    return updatedContact;
  },
  async updateOrder(orderData: Order): Promise<AnyContact> {
    await delay(500);
    const contactIndex = mock.contacts.findIndex(c => c.id === orderData.contactId);
    if (contactIndex === -1) throw new Error("Contact not found");
    
    const updatedContact = mock.contacts[contactIndex];
    const orderIndex = (updatedContact.orders || []).findIndex(o => o.id === orderData.id);
    if (orderIndex !== -1) {
        updatedContact.orders![orderIndex] = orderData;
    }
    
    return updatedContact;
  },
  async deleteOrder({ contactId, orderId }: { contactId: string, orderId: string }): Promise<AnyContact> {
    await delay(500);
    const contactIndex = mock.contacts.findIndex(c => c.id === contactId);
    if (contactIndex === -1) throw new Error("Contact not found");
    
    const updatedContact = mock.contacts[contactIndex];
    if (updatedContact.orders) {
        updatedContact.orders = updatedContact.orders.filter(o => o.id !== orderId);
    }

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
    const index = mock.products.findIndex(p => p.id === productData.id);
    if (index !== -1) {
      mock.products[index] = productData;
    }
    return productData;
  },
  async deleteProduct(productId: string): Promise<string> {
    await delay(500);
    const index = mock.products.findIndex(p => p.id === productId);
    if (index !== -1) {
      mock.products.splice(index, 1);
    }
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
    const index = mock.calendarEvents.findIndex(e => e.id === eventData.id);
    if (index !== -1) {
      mock.calendarEvents[index] = eventData;
    }
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
    const index = mock.tasks.findIndex(t => t.id === taskData.id);
    if (index !== -1) {
      mock.tasks[index] = taskData;
    }
    return taskData;
  },
  async deleteTask(taskId: string): Promise<string> {
    await delay(200);
    const index = mock.tasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
      mock.tasks.splice(index, 1);
    }
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
    const index = mock.users.findIndex(u => u.id === memberData.id);
    if (index !== -1) {
      mock.users[index] = memberData;
    }
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
      const index = mock.deals.findIndex(d => d.id === dealData.id);
      const oldDeal = index !== -1 ? { ...mock.deals[index] } : null;
      
      if (index !== -1) {
          mock.deals[index] = dealData;
      }

      if (oldDeal && oldDeal.stageId !== dealData.stageId) {
          const contact = mock.contacts.find(c => c.id === dealData.contactId);
          if (contact) {
              checkAndTriggerWorkflows({
                  event: 'dealStageChanged',
                  contact,
                  deal: dealData,
                  from: oldDeal.stageId,
                  to: dealData.stageId,
                  dependencies: {
                      workflows: mock.workflows,
                      emailTemplates: mock.emailTemplates,
                      createTask: this.createTask.bind(this),
                      createInteraction: this.createInteraction.bind(this),
                      updateContact: this.updateContact.bind(this),
                  }
              });
          }
      }

      return dealData;
  },
  async deleteDeal(dealId: string): Promise<string> {
      await delay(500);
      const index = mock.deals.findIndex(d => d.id === dealId);
      if (index !== -1) {
        mock.deals.splice(index, 1);
      }
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
      const index = mock.emailTemplates.findIndex(t => t.id === templateData.id);
      if (index !== -1) {
        mock.emailTemplates[index] = templateData;
      }
      return templateData;
  },
  async deleteEmailTemplate(templateId: string): Promise<string> {
      await delay(400);
      const index = mock.emailTemplates.findIndex(t => t.id === templateId);
      if (index !== -1) {
        mock.emailTemplates.splice(index, 1);
      }
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
      const index = mock.workflows.findIndex(wf => wf.id === workflowData.id);
      if (index !== -1) {
        mock.workflows[index] = workflowData;
      }
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
      const index = mock.campaigns.findIndex(c => c.id === campaignData.id);
      if (index !== -1) {
        mock.campaigns[index] = campaignData;
      }
      return campaignData;
  },
  async launchCampaign(campaignId: string): Promise<Campaign> {
    await delay(1500);
    const campaignIndex = mock.campaigns.findIndex(c => c.id === campaignId);
    if (campaignIndex === -1) throw new Error("Campaign not found");

    const campaign = mock.campaigns[campaignIndex];
    if (campaign.status !== 'Draft') throw new Error("Only draft campaigns can be launched.");

    const targetContacts = mock.contacts.filter(c =>
        c.organizationId === campaign.organizationId &&
        campaign.targetAudience.status.includes(c.status)
    );

    campaign.status = 'Active';
    campaign.stats.recipients = targetContacts.length;

    const emailSteps = campaign.steps.filter(step => step.type === 'sendEmail');
    for (const step of emailSteps) {
        const template = mock.emailTemplates.find(t => t.id === step.emailTemplateId);
        if (template) {
            for (const contact of targetContacts) {
                const body = replacePlaceholders(template.body, contact).replace('{{userName}}', 'Campaign Automator');
                await this.createInteraction({
                    contactId: contact.id,
                    organizationId: contact.organizationId,
                    userId: 'system-campaign',
                    type: 'Email',
                    date: new Date().toISOString(),
                    notes: `(Automated Campaign: ${campaign.name})\nSubject: ${replacePlaceholders(template.subject, contact)}\n\n${body}`,
                });
            }
        }
    }
    
    campaign.stats.sent = targetContacts.length * emailSteps.length;
    campaign.stats.opened = Math.floor(campaign.stats.sent * (Math.random() * 0.3 + 0.2)); // 20-50%
    campaign.stats.clicked = Math.floor(campaign.stats.opened * (Math.random() * 0.2 + 0.05)); // 5-25% of opens

    campaign.status = 'Completed';
    
    return campaign;
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

      const contact = mock.contacts.find(c => c.id === newTicket.contactId);
      if (contact) {
          checkAndTriggerWorkflows({
              event: 'ticketCreated',
              contact,
              ticket: newTicket,
              dependencies: {
                  workflows: mock.workflows,
                  emailTemplates: mock.emailTemplates,
                  createTask: this.createTask.bind(this),
                  createInteraction: this.createInteraction.bind(this),
                  updateContact: this.updateContact.bind(this),
              }
          });
      }

      return newTicket;
  },
  async updateTicket(ticketData: Ticket): Promise<Ticket> {
      await delay(300);
      const index = mock.tickets.findIndex(t => t.id === ticketData.id);
      const oldTicket = index !== -1 ? { ...mock.tickets[index] } : null;
      const updatedTicket = { ...ticketData, updatedAt: new Date().toISOString() };
      
      if (index !== -1) {
        mock.tickets[index] = updatedTicket;
      }

      if (oldTicket && oldTicket.status !== updatedTicket.status) {
        const contact = mock.contacts.find(c => c.id === updatedTicket.contactId);
        if (contact) {
            checkAndTriggerWorkflows({
                event: 'ticketStatusChanged',
                contact,
                ticket: updatedTicket,
                from: oldTicket.status,
                to: updatedTicket.status,
                dependencies: {
                    workflows: mock.workflows,
                    emailTemplates: mock.emailTemplates,
                    createTask: this.createTask.bind(this),
                    createInteraction: this.createInteraction.bind(this),
                    updateContact: this.updateContact.bind(this),
                }
            });
        }
    }

      return updatedTicket;
  },
  async addTicketReply(ticketId: string, reply: Omit<TicketReply, 'id' | 'timestamp'>): Promise<Ticket> {
      await delay(300);
      const newReply: TicketReply = {
          ...reply,
          id: `reply_${Date.now()}`,
          timestamp: new Date().toISOString(),
      };
      const ticketIndex = mock.tickets.findIndex(t => t.id === ticketId);
      if (ticketIndex === -1) throw new Error("Ticket not found");

      const updatedTicket = mock.tickets[ticketIndex];
      updatedTicket.replies.push(newReply);
      updatedTicket.updatedAt = new Date().toISOString();
      
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
// FIX: Use subDays for date calculations.
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
      const reportIndex = mock.customReports.findIndex(cr => cr.id === reportId);
      if (reportIndex !== -1) {
        mock.customReports.splice(reportIndex, 1);
      }
      // Also remove any widgets associated with it
      for (let i = mock.dashboardWidgets.length - 1; i >= 0; i--) {
          if (mock.dashboardWidgets[i].reportId === reportId) {
              mock.dashboardWidgets.splice(i, 1);
          }
      }
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
      const index = mock.dashboardWidgets.findIndex(w => w.id === widgetId);
      if (index !== -1) {
        mock.dashboardWidgets.splice(index, 1);
      }
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
      const index = mock.documents.findIndex(d => d.id === docId);
      if (index !== -1) {
        mock.documents.splice(index, 1);
      }
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