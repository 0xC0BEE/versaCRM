import { setFetchImplementation } from './apiClient';
import { 
    MOCK_ORGANIZATIONS, MOCK_USERS, MOCK_ROLES, MOCK_CONTACTS_MUTABLE,
    MOCK_INTERACTIONS, MOCK_PRODUCTS, MOCK_DEALS, MOCK_DEAL_STAGES, MOCK_TASKS,
    MOCK_CALENDAR_EVENTS, MOCK_EMAIL_TEMPLATES, MOCK_WORKFLOWS, MOCK_ADVANCED_WORKFLOWS,
    MOCK_ORGANIZATION_SETTINGS, MOCK_API_KEYS, MOCK_TICKETS, MOCK_FORMS, MOCK_CAMPAIGNS,
    MOCK_LANDING_PAGES, MOCK_DOCUMENTS, MOCK_CUSTOM_REPORTS, MOCK_DASHBOARD_WIDGETS,
    MOCK_SUPPLIERS, MOCK_WAREHOUSES, MOCK_CUSTOM_OBJECT_DEFINITIONS, MOCK_CUSTOM_OBJECT_RECORDS,
    MOCK_ANONYMOUS_SESSIONS, MOCK_APP_MARKETPLACE_ITEMS, MOCK_INSTALLED_APPS, MOCK_SANDBOXES, MOCK_DOCUMENT_TEMPLATES,
    MOCK_PROJECTS, MOCK_PROJECT_PHASES, MOCK_PROJECT_TEMPLATES, MOCK_CANNED_RESPONSES,
    MOCK_SURVEYS, MOCK_SURVEY_RESPONSES, MOCK_DASHBOARDS, MOCK_SNAPSHOTS, MOCK_TEAM_CHANNELS, MOCK_TEAM_CHAT_MESSAGES, MOCK_CLIENT_CHECKLIST_TEMPLATES,
    MOCK_SUBSCRIPTION_PLANS,
    MOCK_SYSTEM_AUDIT_LOGS,
    MOCK_AUDIENCE_PROFILES,
    MOCK_DATA_HYGIENE_RESULTS,
} from './mockData';
import { industryConfigs } from '../config/industryConfig';
import { generateDashboardData, generateReportData } from './reportGenerator';
import { checkAndTriggerWorkflows } from './workflowService';
import { recalculateAllScores, recalculateScoreForContact } from './leadScoringService';
import { campaignService } from './campaignService';
import { campaignSchedulerService } from './campaignSchedulerService';
import { Sandbox, Conversation, CannedResponse, Interaction, Survey, SurveyResponse, Snapshot, TeamChannel, TeamChatMessage, AppNotification, ClientChecklist, SubscriptionPlan, Relationship, AudienceProfile, AnyContact, Deal, DealStage, Document, Product, CustomObjectRecord, CustomObjectDefinition, User, Project, AttributedDeal, Campaign, ProjectPhase, Task, Ticket } from '../types';
import { GoogleGenAI, Type } from '@google/genai';
// FIX: Imported 'addDays' from date-fns to resolve reference error.
import { addMonths, addDays } from 'date-fns';

// --- CSV Helper Functions (copied from utils/export.ts to avoid import issues in service) ---
function flattenObject(obj: any, parent: string = '', res: { [key: string]: any } = {}): { [key: string]: any } {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      const propName = parent ? parent + '.' + key : key;
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        flattenObject(obj[key], propName, res);
      } else {
        res[propName] = obj[key];
      }
    }
  }
  return res;
}

function convertToCSV(data: any[]): string {
    if (!data || data.length === 0) {
        return '';
    }

    const flattenedData = data.map(row => flattenObject(row));
    
    // Get all unique headers from all rows
    const allHeaders = new Set<string>();
    flattenedData.forEach(row => {
        Object.keys(row).forEach(key => allHeaders.add(key));
    });
    const headers = Array.from(allHeaders);

    const csvRows = [headers.join(',')];

    for (const row of flattenedData) {
        const values = headers.map(header => {
            const val = row[header] === null || row[header] === undefined ? '' : String(row[header]);
            const escaped = val.replace(/"/g, '""');
            if (escaped.includes(',') || escaped.includes('"') || escaped.includes('\n')) {
                 return `"${escaped}"`;
            }
            return escaped;
        });
        csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
}

// Function to get a fresh, deep-copied initial state of the database.
// This ensures that every session starts with the full set of mock data.
const getInitialDBState = () => {
    return JSON.parse(JSON.stringify({
        organizations: MOCK_ORGANIZATIONS,
        users: MOCK_USERS,
        roles: MOCK_ROLES,
        contacts: MOCK_CONTACTS_MUTABLE,
        interactions: MOCK_INTERACTIONS,
        products: MOCK_PRODUCTS,
        deals: MOCK_DEALS,
        dealStages: MOCK_DEAL_STAGES,
        tasks: MOCK_TASKS,
        calendarEvents: MOCK_CALENDAR_EVENTS,
        emailTemplates: MOCK_EMAIL_TEMPLATES,
        documentTemplates: MOCK_DOCUMENT_TEMPLATES,
        workflows: MOCK_WORKFLOWS,
        advancedWorkflows: MOCK_ADVANCED_WORKFLOWS,
        settings: MOCK_ORGANIZATION_SETTINGS,
        apiKeys: MOCK_API_KEYS,
        tickets: MOCK_TICKETS,
        forms: MOCK_FORMS,
        campaigns: MOCK_CAMPAIGNS,
        landingPages: MOCK_LANDING_PAGES,
        documents: MOCK_DOCUMENTS,
        customReports: MOCK_CUSTOM_REPORTS,
        dashboards: MOCK_DASHBOARDS,
        dashboardWidgets: MOCK_DASHBOARD_WIDGETS,
        suppliers: MOCK_SUPPLIERS,
        warehouses: MOCK_WAREHOUSES,
        customObjectDefs: MOCK_CUSTOM_OBJECT_DEFINITIONS,
        customObjectRecords: MOCK_CUSTOM_OBJECT_RECORDS,
        anonymousSessions: MOCK_ANONYMOUS_SESSIONS,
        marketplaceApps: MOCK_APP_MARKETPLACE_ITEMS,
        installedApps: MOCK_INSTALLED_APPS,
        projects: MOCK_PROJECTS,
        projectPhases: MOCK_PROJECT_PHASES,
        projectTemplates: MOCK_PROJECT_TEMPLATES,
        cannedResponses: MOCK_CANNED_RESPONSES,
        surveys: MOCK_SURVEYS,
        surveyResponses: MOCK_SURVEY_RESPONSES,
        snapshots: MOCK_SNAPSHOTS,
        clientChecklistTemplates: MOCK_CLIENT_CHECKLIST_TEMPLATES,
        subscriptionPlans: MOCK_SUBSCRIPTION_PLANS,
        systemAuditLogs: MOCK_SYSTEM_AUDIT_LOGS,
        audienceProfiles: MOCK_AUDIENCE_PROFILES,
        dataHygieneResults: MOCK_DATA_HYGIENE_RESULTS,
        teamChannels: MOCK_TEAM_CHANNELS,
        teamChatMessages: MOCK_TEAM_CHAT_MESSAGES,
    }));
};

// Main in-memory DB for the "production" environment. Initialized fresh on each page load.
let mainDB = getInitialDBState();

// Sandboxed environments are persisted in localStorage to survive reloads.
let sandboxedDBs: { [key: string]: typeof mainDB } = JSON.parse(localStorage.getItem('sandboxedDBs') || '{}');
let sandboxes: Sandbox[] = JSON.parse(localStorage.getItem('sandboxesList') || '[]');


const getActiveDb = () => {
    const env = JSON.parse(localStorage.getItem('currentEnvironment') || '"production"');
    if (env !== 'production' && sandboxedDBs[env]) {
        return sandboxedDBs[env];
    }
    return mainDB;
};

const respond = (data: any, status = 200) => {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
};

const parseCsv = (csv: string): Record<string, any>[] => {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    // This is a simplified parser and won't handle commas within quoted fields.
    const values = lines[i].split(',');
    const obj: Record<string, any> = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = values[j] ? values[j].trim() : '';
    }
    rows.push(obj);
  }
  return rows;
};


const mockFetch = async (url: RequestInfo | URL, config?: RequestInit): Promise<Response> => {
    const db = getActiveDb();
    const urlString = url.toString();
    const method = config?.method || 'GET';
    const body = config?.body ? JSON.parse(config.body as string) : {};
    
    console.log(`[Mock API] ${method} ${urlString}`, body);

    const path = new URL(urlString, window.location.origin).pathname;
    const searchParams = new URL(urlString, window.location.origin).searchParams;
    
    // --- AUTH ---
    if (path === '/api/v1/auth/login' && method === 'POST') {
        const { email } = body;
        const user = db.users.find((u: User) => u.email.toLowerCase() === email.toLowerCase());
        if (user) return respond(user);
        return respond({ message: 'Invalid credentials' }, 401);
    }

    // --- DATA MIGRATION ---
    if (path === '/api/v1/data-migration/export-all' && method === 'GET') {
        const contactMap = new Map(db.contacts.map((c: AnyContact) => [c.id, c.email]));
        
        const contactsTemplate = db.contacts.map((c: AnyContact) => ({ contactName: c.contactName, email: c.email, phone: c.phone, status: c.status, leadSource: c.leadSource }));
        const productsTemplate = db.products.map((p: Product) => ({ name: p.name, sku: p.sku, category: p.category, description: p.description || '', costPrice: p.costPrice, salePrice: p.salePrice, stockLevel: p.stockLevel }));
        const dealsTemplate = db.deals.map((d: Deal) => ({ name: d.name, value: d.value, stageId: d.stageId, contactEmail: contactMap.get(d.contactId) || '', expectedCloseDate: d.expectedCloseDate }));
        const projectsTemplate = db.projects.map((p: Project) => ({ name: p.name, phaseId: p.phaseId, contactEmail: contactMap.get(p.contactId) || '', assignedToId: p.assignedToId || '' }));
        const ticketsTemplate = db.tickets.map((t: Ticket) => ({ subject: t.subject, description: t.description, status: t.status, priority: t.priority, contactEmail: contactMap.get(t.contactId) || '', assignedToId: t.assignedToId || '' }));
        const tasksTemplate = db.tasks.map((t: Task) => ({ title: t.title, dueDate: t.dueDate, contactEmail: contactMap.get(t.contactId) || '', assignedToId: t.userId || '' }));

        return respond({
            'contacts_template.csv': convertToCSV(contactsTemplate),
            'products_template.csv': convertToCSV(productsTemplate),
            'deals_template.csv': convertToCSV(dealsTemplate),
            'projects_template.csv': convertToCSV(projectsTemplate),
            'tickets_template.csv': convertToCSV(ticketsTemplate),
            'tasks_template.csv': convertToCSV(tasksTemplate),
        });
    }

    if (path === '/api/v1/data-migration/import' && method === 'POST') {
        const { contactsCsv, dealsCsv, productsCsv, projectsCsv, ticketsCsv, tasksCsv } = body;
        const summary = { contactsCreated: 0, dealsCreated: 0, productsCreated: 0, projectsCreated: 0, ticketsCreated: 0, tasksCreated: 0, contactsSkipped: 0, dealsSkipped: 0 };
        const emailToNewIdMap = new Map<string, string>();

        if (productsCsv) {
            const newProducts = parseCsv(productsCsv);
            for (const productData of newProducts) {
                 const newProduct: Omit<Product, 'id'> = {
                    organizationId: 'org_1',
                    name: productData.name,
                    sku: productData.sku,
                    category: productData.category,
                    description: productData.description,
                    costPrice: parseFloat(productData.costPrice) || 0,
                    salePrice: parseFloat(productData.salePrice) || 0,
                    stockLevel: parseInt(productData.stockLevel, 10) || 0,
                };
                db.products.push({ ...newProduct, id: `prod_${Date.now()}_${Math.random()}`});
                summary.productsCreated++;
            }
        }
        
        if (contactsCsv) {
            const newContacts = parseCsv(contactsCsv);
            for (const contactData of newContacts) {
                if (!contactData.email || db.contacts.some((c: AnyContact) => c.email.toLowerCase() === contactData.email.toLowerCase())) {
                    summary.contactsSkipped++;
                    continue;
                }
                const newContact: AnyContact = {
                    id: `contact_${Date.now()}_${Math.random()}`,
                    organizationId: 'org_1',
                    contactName: contactData.contactName || 'N/A',
                    email: contactData.email,
                    phone: contactData.phone || '',
                    status: contactData.status || 'Lead',
                    leadSource: 'Import',
                    createdAt: new Date().toISOString(),
                    customFields: {},
                };
                db.contacts.push(newContact);
                emailToNewIdMap.set(newContact.email, newContact.id);
                summary.contactsCreated++;
            }
        }

        const findContactIdByEmail = (email: string) => {
            if (!email) return null;
            if (emailToNewIdMap.has(email)) return emailToNewIdMap.get(email);
            const existing = db.contacts.find((c: AnyContact) => c.email.toLowerCase() === email.toLowerCase());
            return existing ? existing.id : null;
        }

        if (dealsCsv) {
            const newDeals = parseCsv(dealsCsv);
            for (const dealData of newDeals) {
                const contactId = findContactIdByEmail(dealData.contactEmail);
                if (!contactId) { summary.dealsSkipped++; continue; }
                const newDeal: Omit<Deal, 'id'> = {
                    organizationId: 'org_1',
                    name: dealData.name, value: parseFloat(dealData.value) || 0, stageId: dealData.stageId,
                    contactId: contactId, expectedCloseDate: dealData.expectedCloseDate || new Date().toISOString(), createdAt: new Date().toISOString(),
                };
                db.deals.push({ ...newDeal, id: `deal_${Date.now()}_${Math.random()}`});
                summary.dealsCreated++;
            }
        }

        if (projectsCsv) {
            const newProjects = parseCsv(projectsCsv);
            for (const projectData of newProjects) {
                const contactId = findContactIdByEmail(projectData.contactEmail);
                if (!contactId) continue;
                const newProject: Omit<Project, 'id'> = {
                     organizationId: 'org_1', name: projectData.name, phaseId: projectData.phaseId, contactId: contactId,
                     createdAt: new Date().toISOString(), assignedToId: projectData.assignedToId || undefined
                };
                db.projects.push({...newProject, id: `project_${Date.now()}_${Math.random()}`});
                summary.projectsCreated++;
            }
        }

        if (ticketsCsv) {
            const newTickets = parseCsv(ticketsCsv);
            for (const ticketData of newTickets) {
                const contactId = findContactIdByEmail(ticketData.contactEmail);
                if (!contactId) continue;
                const newTicket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'replies'> = {
                    organizationId: 'org_1', subject: ticketData.subject, description: ticketData.description,
                    status: ticketData.status || 'New', priority: ticketData.priority || 'Medium', contactId: contactId, assignedToId: ticketData.assignedToId || undefined
                };
                db.tickets.push({...newTicket, id: `ticket_${Date.now()}_${Math.random()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), replies: []});
                summary.ticketsCreated++;
            }
        }

        if (tasksCsv) {
            const newTasks = parseCsv(tasksCsv);
            for (const taskData of newTasks) {
                const contactId = findContactIdByEmail(taskData.contactEmail);
                const newTask: Omit<Task, 'id' | 'isCompleted'> = {
                    organizationId: 'org_1', title: taskData.title, dueDate: taskData.dueDate || new Date().toISOString(),
                    userId: taskData.assignedToId || MOCK_USERS[1].id, contactId: contactId || undefined
                };
                db.tasks.push({...newTask, id: `task_${Date.now()}_${Math.random()}`, isCompleted: false});
                summary.tasksCreated++;
            }
        }

        return respond(summary);
    }
    
    // --- SANDBOXES (Managed outside the main DB object) ---
    if (path === '/api/v1/sandboxes' && method === 'GET') {
        return respond(sandboxes);
    }
     if (path === '/api/v1/sandboxes' && method === 'POST') {
        const newSandbox: Sandbox = {
            id: `sbx_${Date.now()}`,
            organizationId: body.orgId,
            name: body.name,
            createdAt: new Date().toISOString(),
        };
        // Create sandbox from a pristine copy of the initial data
        sandboxedDBs[newSandbox.id] = getInitialDBState();
        sandboxes.push(newSandbox);
        localStorage.setItem('sandboxedDBs', JSON.stringify(sandboxedDBs));
        localStorage.setItem('sandboxesList', JSON.stringify(sandboxes));
        return respond(newSandbox, 201);
    }
    const sandboxRefreshMatch = path.match(/^\/api\/v1\/sandboxes\/(.+)\/refresh$/);
    if (sandboxRefreshMatch && method === 'POST') {
        const sandboxId = sandboxRefreshMatch[1];
        if (sandboxedDBs[sandboxId]) {
            // Refresh sandbox from a pristine copy
            sandboxedDBs[sandboxId] = getInitialDBState();
            localStorage.setItem('sandboxedDBs', JSON.stringify(sandboxedDBs));
            return respond({ message: 'Sandbox refreshed' });
        }
    }
     const sandboxDeleteMatch = path.match(/^\/api\/v1\/sandboxes\/(.+)$/);
    if (sandboxDeleteMatch && method === 'DELETE') {
        const sandboxId = sandboxDeleteMatch[1];
        if (sandboxedDBs[sandboxId]) {
            delete sandboxedDBs[sandboxId];
            sandboxes = sandboxes.filter(s => s.id !== sandboxId);
            localStorage.setItem('sandboxedDBs', JSON.stringify(sandboxedDBs));
            localStorage.setItem('sandboxesList', JSON.stringify(sandboxes));
            return respond(null, 204);
        }
    }

    // --- CAMPAIGN ATTRIBUTION ---
    const campaignAttributionMatch = path.match(/^\/api\/v1\/campaigns\/(.+)\/attribution$/);
    if (campaignAttributionMatch && method === 'GET') {
        const campaignId = campaignAttributionMatch[1];
        const campaign = db.campaigns.find((c: Campaign) => c.id === campaignId);
        if (!campaign) {
            return respond({ message: 'Campaign not found' }, 404);
        }

        const enrolledContactIds = new Set<string>();
        db.contacts.forEach((contact: AnyContact) => {
            if (contact.campaignEnrollments?.some(e => e.campaignId === campaignId)) {
                enrolledContactIds.add(contact.id);
            }
        });
        
        const wonStageId = db.dealStages.find((s: DealStage) => s.name === 'Won')?.id;
        const attributedDealsData: AttributedDeal[] = db.deals
            .filter((deal: Deal) => 
                deal.stageId === wonStageId &&
                enrolledContactIds.has(deal.contactId)
            )
            .map((deal: Deal) => {
                const contact = db.contacts.find((c: AnyContact) => c.id === deal.contactId);
                return {
                    dealId: deal.id,
                    dealName: deal.name,
                    dealValue: deal.value,
                    contactName: contact?.contactName || 'Unknown Contact',
                    closedAt: deal.expectedCloseDate,
                };
            });

        return respond(attributedDealsData);
    }


    // --- ORGANIZATIONS ---
    if (path === '/api/v1/organizations' && method === 'GET') return respond(db.organizations);
    const orgMatch = path.match(/^\/api\/v1\/organizations\/([a-zA-Z0-9_]+)$/);
    if (orgMatch && method === 'PUT') {
        const orgId = orgMatch[1];
        const index = db.organizations.findIndex((o: any) => o.id === orgId);
        if (index > -1) {
            db.organizations[index] = { ...db.organizations[index], ...body };
            return respond(db.organizations[index]);
        }
        return respond({ message: 'Organization not found' }, 404);
    }

    // --- CUSTOM OBJECTS ---
    if (path === '/api/v1/custom-object-definitions' && method === 'POST') {
        const newDef = { ...body, id: `def_${Date.now()}` };
        db.customObjectDefs.push(newDef);
        return respond(newDef, 201);
    }
    const customObjectDefMatch = path.match(/^\/api\/v1\/custom-object-definitions\/(.+)$/);
    if (customObjectDefMatch && method === 'PUT') {
        const defId = customObjectDefMatch[1];
        const index = db.customObjectDefs.findIndex((d: any) => d.id === defId);
        if (index > -1) {
            db.customObjectDefs[index] = { ...db.customObjectDefs[index], ...body };
            return respond(db.customObjectDefs[index]);
        }
    }


    // --- DEAL STAGES ---
    if (path === '/api/v1/deal-stages' && method === 'PUT') {
        const { orgId, stages } = body;
        db.dealStages = db.dealStages.filter((s: DealStage) => s.organizationId !== orgId);
        const newStages = stages.map((name: string, index: number) => ({
            id: `stage_ai_${index}_${Date.now()}`,
            organizationId: orgId,
            name,
            order: index + 1,
        }));
        db.dealStages.push(...newStages);
        return respond(newStages);
    }

    // --- TEAM CHAT ---
    const messagesMatch = path.match(/^\/api\/v1\/team-channels\/(.+)\/messages$/);
    if (messagesMatch && method === 'POST') {
        const channelId = messagesMatch[1];
        const { userId, message, threadId } = body;

        const newMessage: TeamChatMessage = {
            id: `msg_${Date.now()}`,
            channelId,
            userId,
            message,
            timestamp: new Date().toISOString(),
            threadId,
        };
        db.teamChatMessages.push(newMessage);

        const channel = db.teamChannels.find((c: TeamChannel) => c.id === channelId);
        const sender = db.users.find((u: User) => u.id === userId);
        const notifications: AppNotification[] = [];

        if (channel && sender) {
            const mentionRegex = /@([A-Za-z\s]+)/g;
            let match;
            while ((match = mentionRegex.exec(message)) !== null) {
                const mentionedName = match[1].trim();
                const mentionedUser = db.users.find((u: User) => u.name === mentionedName);

                if (mentionedUser && mentionedUser.id !== sender.id) {
                    const newNotification: AppNotification = {
                        id: `notif_${Date.now()}`,
                        userId: mentionedUser.id,
                        type: 'chat_mention',
                        message: `${sender.name} mentioned you in #${channel.name}`,
                        timestamp: new Date().toISOString(),
                        isRead: false,
                        linkTo: { page: 'TeamChat', recordId: channel.id },
                    };
                    notifications.push(newNotification);
                }
            }
        }

        return respond({ message: newMessage, notifications });
    }

    // --- SETTINGS ---
    const settingsMatch = path.match(/^\/api\/v1\/organizations\/([a-zA-Z0-9_]+)\/settings$/);
    if (settingsMatch) {
        const orgId = settingsMatch[1];
        const org = db.organizations.find((o: any) => o.id === orgId);
        if (!org) {
            return respond({ message: 'Organization not found' }, 404);
        }
        if (method === 'GET') {
            return respond({ ...db.settings, organizationId: orgId });
        }
        if (method === 'PUT') {
            db.settings = { ...db.settings, ...body, organizationId: orgId };
            return respond(db.settings);
        }
    }

    // --- GET BY ORG ID ---
    const orgId = searchParams.get('orgId');
    if (orgId) {
        if (path === '/api/v1/dashboard') {
            const dashboardData = generateDashboardData(db.contacts, db.interactions);
            return respond(dashboardData);
        }
        if (path === '/api/v1/contacts') return respond(db.contacts.filter((c: any) => c.organizationId === orgId));
        if (path === '/api/v1/team') return respond(db.users.filter((u: any) => u.organizationId === orgId && !u.isClient));
        if (path === '/api/v1/roles') return respond(db.roles.filter((r: any) => r.organizationId === orgId));
        if (path === '/api/v1/tasks') {
            const userId = searchParams.get('userId');
            const canViewAll = searchParams.get('canViewAll') === 'true';
            const userTasks = db.tasks.filter((t: any) => t.organizationId === orgId && (canViewAll || t.userId === userId));
            return respond(userTasks);
        }
        if (path === '/api/v1/calendar/events') return respond(db.calendarEvents.filter((e: any) => (e as any).organizationId === orgId));
        if (path === '/api/v1/products') return respond(db.products.filter((p: any) => p.organizationId === orgId));
        if (path === '/api/v1/deals') return respond(db.deals.filter((d: any) => d.organizationId === orgId));
        if (path === '/api/v1/deal-stages') return respond(db.dealStages.filter((d: any) => d.organizationId === orgId));
        if (path === '/api/v1/projects') return respond(db.projects.filter((p: any) => p.organizationId === orgId));
        if (path === '/api/v1/project-phases') return respond(db.projectPhases.filter((p: any) => p.organizationId === orgId));
        if (path === '/api/v1/interactions') return respond(db.interactions.filter((i: any) => i.organizationId === orgId));
        if (path === '/api/v1/tickets') return respond(db.tickets.filter((t: any) => t.organizationId === orgId));
        if (path === '/api/v1/email-templates') return respond(db.emailTemplates.filter((t: any) => t.organizationId === orgId));
        if (path === '/api/v1/workflows') return respond(db.workflows.filter((w: any) => w.organizationId === orgId));
        if (path === '/api/v1/advanced-workflows') return respond(db.advancedWorkflows.filter((w: any) => w.organizationId === orgId));
        if (path === '/api/v1/api-keys') return respond(db.apiKeys.filter((k: any) => k.organizationId === orgId));
        if (path === '/api/v1/forms') return respond(db.forms.filter((f: any) => f.organizationId === orgId));
        if (path === '/api/v1/campaigns') return respond(db.campaigns.filter((c: any) => c.organizationId === orgId));
        if (path === '/api/v1/landing-pages') return respond(db.landingPages.filter((l: any) => l.organizationId === orgId));
        if (path === '/api/v1/custom-reports') return respond(db.customReports.filter((r: any) => r.organizationId === orgId));
        if (path === '/api/v1/dashboards') return respond(db.dashboards.filter((d: any) => d.organizationId === orgId));
        if (path === '/api/v1/custom-object-definitions') return respond(db.customObjectDefs.filter((d: any) => d.organizationId === orgId));
        if (path === '/api/v1/inbox') {
            const conversations: Conversation[] = [];
            const interactionGroups = db.interactions.reduce((acc: any, i: any) => {
                if (!i.notes.includes('Subject:')) return acc; // Only process emails
                const key = `${i.contactId}-${i.notes.match(/Subject: (.*)/)![1]}`;
                if (!acc[key]) acc[key] = [];
                acc[key].push(i);
                return acc;
            }, {} as Record<string, Interaction[]>);

            for (const key in interactionGroups) {
                const group = interactionGroups[key].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                const last = group[group.length - 1];
                const contact = db.contacts.find((c: any) => c.id === last.contactId);
                const teamMember = db.users.find((u: any) => u.id === last.userId);
                if (contact && teamMember) {
                     conversations.push({
                        id: `conv_${contact.id}_${group[0].id}`,
                        contactId: contact.id,
                        subject: last.notes.match(/Subject: (.*)/)![1],
                        channel: 'Email',
                        lastMessageTimestamp: last.date,
                        lastMessageSnippet: last.notes.split('\n\n')[1] || last.notes,
                        messages: group.map((i: any) => ({ id: i.id, senderId: i.userId, body: i.notes.split('\n\n')[1] || i.notes, timestamp: i.date })),
                        participants: [{id: contact.id, name: contact.contactName, email: contact.email}, {id: teamMember.id, name: teamMember.name, email: teamMember.email}],
                    });
                }
            }
            return respond(conversations.sort((a,b) => new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime()));
        }
        if (path === '/api/v1/team-channels') return respond(db.teamChannels.filter((c: any) => c.organizationId === orgId));
        // ... and so on for all other GET endpoints that are filtered by orgId
    }
    
    // --- OTHER DYNAMIC GETs ---
    const dashboardId = searchParams.get('dashboardId');
    if (dashboardId && path === '/api/v1/dashboard-widgets') {
        return respond(db.dashboardWidgets.filter((w: any) => w.dashboardId === dashboardId));
    }
    const defId = searchParams.get('defId');
    if (path === '/api/v1/custom-object-records') {
        const records = defId ? db.customObjectRecords.filter((r: any) => r.objectDefId === defId) : db.customObjectRecords;
        return respond(records);
    }
    
    // --- GENERIC CATCH-ALL FOR DEMO PURPOSES ---
    // This is a simplified pattern to handle all basic CRUD operations.
    // A real mock server would have more specific logic for each endpoint.
    const resourceMatch = path.match(/^\/api\/v1\/([a-z-]+)(?:\/([a-z0-9_-]+))?/);
    if (resourceMatch) {
        const resource = resourceMatch[1];
        const resourceId = resourceMatch[2];
        const dbKey = resource.replace(/-([a-z])/g, g => g[1].toUpperCase()) as keyof typeof db;

        if (dbKey in db && Array.isArray((db as any)[dbKey])) {
            const table = (db as any)[dbKey] as any[];

            if (method === 'POST') {
                const newItem = { ...body, id: `${resource.slice(0, 4)}_${Date.now()}` };
                if (newItem.createdAt === undefined) {
                    newItem.createdAt = new Date().toISOString();
                }
                if (dbKey === 'tickets') {
                    newItem.updatedAt = new Date().toISOString();
                }
                table.push(newItem);
                
                // Special handling after creation
                if (dbKey === 'projects' && newItem.templateId) {
                    const template = db.projectTemplates.find((t: any) => t.id === newItem.templateId);
                    if (template) { // FIX: Added check to prevent error when template is not found
                        template.defaultTasks.forEach((taskDef: any) => {
                            const newTask = {
                                id: `task_${Date.now()}`,
                                organizationId: newItem.organizationId,
                                title: taskDef.title,
                                dueDate: addDays(new Date(), taskDef.daysAfterStart).toISOString(),
                                isCompleted: false,
                                userId: newItem.assignedToId,
                                projectId: newItem.id,
                                contactId: newItem.contactId,
                            };
                            db.tasks.push(newTask);
                        });
                    }
                }

                return respond(newItem, 201);
            }
            if (resourceId) {
                const itemIndex = table.findIndex(item => item.id === resourceId);
                if (itemIndex > -1) {
                    if (method === 'GET') return respond(table[itemIndex]);
                    if (method === 'PUT') {
                        const updatedItem = { ...table[itemIndex], ...body };
                        if (dbKey === 'tickets') {
                            updatedItem.updatedAt = new Date().toISOString();
                        }
                        table[itemIndex] = updatedItem;
                        return respond(updatedItem);
                    }
                    if (method === 'DELETE') {
                        table.splice(itemIndex, 1);
                        return respond(null, 204);
                    }
                }
            }
        }
    }

    return respond({ message: `Mock API route not found: ${method} ${path}` }, 404);
};

export function startMockServer() {
    setFetchImplementation(mockFetch);
}