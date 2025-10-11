import { setFetchImplementation } from './apiClient';
import { 
    MOCK_ORGANIZATIONS, MOCK_USERS, MOCK_ROLES, MOCK_CONTACTS_MUTABLE,
    MOCK_INTERACTIONS, MOCK_PRODUCTS, MOCK_DEALS, MOCK_DEAL_STAGES, MOCK_TASKS,
    MOCK_CALENDAR_EVENTS, MOCK_EMAIL_TEMPLATES, MOCK_WORKFLOWS, MOCK_ADVANCED_WORKFLOWS,
    MOCK_ORGANIZATION_SETTINGS, MOCK_API_KEYS, MOCK_TICKETS, MOCK_FORMS, MOCK_CAMPAIGNS,
    MOCK_LANDING_PAGES, MOCK_DOCUMENTS, MOCK_CUSTOM_REPORTS, MOCK_DASHBOARD_WIDGETS,
    MOCK_SUPPLIERS, MOCK_WAREHOUSES, MOCK_CUSTOM_OBJECT_DEFINITIONS, MOCK_CUSTOM_OBJECT_RECORDS,
    MOCK_ANONYMOUS_SESSIONS, MOCK_APP_MARKETPLACE_ITEMS, MOCK_INSTALLED_APPS, MOCK_SANDBOXES
} from './mockData';
import { industryConfigs } from '../config/industryConfig';
import { generateDashboardData } from './reportGenerator';
import { checkAndTriggerWorkflows } from './workflowService';
import { recalculateScoreForContact } from './leadScoringService';
import { campaignService } from './campaignService';
import { campaignSchedulerService } from './campaignSchedulerService';
import { Sandbox } from '../types';

// Hydrate the in-memory sandbox list from localStorage to persist it across reloads.
const storedSandboxes = JSON.parse(localStorage.getItem('sandboxesList') || '[]');
MOCK_SANDBOXES.splice(0, MOCK_SANDBOXES.length, ...storedSandboxes);

// A simple in-memory representation of the backend
const mainDB = {
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
    dashboardWidgets: MOCK_DASHBOARD_WIDGETS,
    suppliers: MOCK_SUPPLIERS,
    warehouses: MOCK_WAREHOUSES,
    customObjectDefs: MOCK_CUSTOM_OBJECT_DEFINITIONS,
    customObjectRecords: MOCK_CUSTOM_OBJECT_RECORDS,
    anonymousSessions: MOCK_ANONYMOUS_SESSIONS,
    marketplaceApps: MOCK_APP_MARKETPLACE_ITEMS,
    installedApps: MOCK_INSTALLED_APPS,
    sandboxes: MOCK_SANDBOXES,
};

let sandboxedDBs: { [key: string]: typeof mainDB } = JSON.parse(localStorage.getItem('sandboxedDBs') || '{}');

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

const mockFetch = async (url: RequestInfo | URL, config?: RequestInit): Promise<Response> => {
    const db = getActiveDb();
    const urlString = url.toString();
    const method = config?.method || 'GET';
    const body = config?.body ? JSON.parse(config.body as string) : {};
    
    console.log(`[Mock API] ${method} ${urlString}`, body);

    const path = new URL(urlString, window.location.origin).pathname;
    const searchParams = new URL(urlString, window.location.origin).searchParams;

    // --- SANDBOXES ---
    if (path.startsWith('/api/v1/sandboxes')) {
        const sandboxId = path.split('/')[4];

        if (path.includes('/refresh')) {
            if (sandboxedDBs[sandboxId]) {
                console.log(`[Mock API] Refreshing sandbox ${sandboxId}`);
                sandboxedDBs[sandboxId] = JSON.parse(JSON.stringify(mainDB));
                sandboxedDBs[sandboxId].sandboxes = mainDB.sandboxes;
                localStorage.setItem('sandboxedDBs', JSON.stringify(sandboxedDBs));
                return respond(null, 204);
            }
            return respond({ message: 'Sandbox not found' }, 404);
        }

        if (method === 'DELETE' && sandboxId) {
            const index = mainDB.sandboxes.findIndex(s => s.id === sandboxId);
            if (index > -1) {
                mainDB.sandboxes.splice(index, 1);
                delete sandboxedDBs[sandboxId];
                localStorage.setItem('sandboxedDBs', JSON.stringify(sandboxedDBs));
                localStorage.setItem('sandboxesList', JSON.stringify(mainDB.sandboxes));
                return respond(null, 204);
            }
            return respond({ message: 'Sandbox not found' }, 404);
        }

        if (method === 'GET') {
            return respond(mainDB.sandboxes.filter(s => s.organizationId === searchParams.get('orgId')));
        }
        if (method === 'POST') {
            const newSandbox: Sandbox = {
                id: `sbx_${Date.now()}`,
                createdAt: new Date().toISOString(),
                name: body.name,
                organizationId: body.orgId,
            };
            mainDB.sandboxes.push(newSandbox);
            localStorage.setItem('sandboxesList', JSON.stringify(mainDB.sandboxes));
            sandboxedDBs[newSandbox.id] = JSON.parse(JSON.stringify(mainDB));
            sandboxedDBs[newSandbox.id].sandboxes = mainDB.sandboxes;
            localStorage.setItem('sandboxedDBs', JSON.stringify(sandboxedDBs));
            return respond(newSandbox);
        }
    }


    // --- AUTH ---
    if (path.endsWith('/login')) {
        const user = db.users.find(u => u.email === body.email);
        return respond(user || null);
    }
    
    // --- ORGANIZATIONS ---
    if (path.startsWith('/api/v1/organizations')) {
        const orgId = path.split('/')[4];
        if (orgId) {
            if (method === 'PUT') {
                 const index = db.organizations.findIndex(o => o.id === orgId);
                if (index > -1) {
                    db.organizations[index] = { ...db.organizations[index], ...body };
                    return respond(db.organizations[index]);
                }
                return respond({ message: 'Organization not found' }, 404);
            }
        }
        if (method === 'GET') return respond(db.organizations);
        if (method === 'POST') {
            const newOrg = { ...body, id: `org_${Date.now()}`, createdAt: new Date().toISOString(), isSetupComplete: false };
            db.organizations.push(newOrg);
            return respond(newOrg);
        }
    }
    
    // --- CONTACTS ---
    if (path.startsWith('/api/v1/contacts')) {
        if (path.includes('churn-prediction')) return respond({ contactId: 'contact_1', risk: 'Medium', factors: { positive: ['Frequent logins'], negative: ['No recent purchases'] }, nextBestAction: 'Send a follow-up email with a special offer.' });
        if (path.includes('next-best-action')) return respond({ contactId: 'contact_1', action: 'Email', reason: 'Contact has a high lead score but no recent interactions.', templateId: 'template_2'});

        const contactId = path.split('/')[4];
        if (contactId && !path.includes('bulk')) {
            if(method === 'GET') return respond(db.contacts.find(c => c.id === contactId));
            if(method === 'PUT') {
                const index = db.contacts.findIndex(c => c.id === contactId);
                const oldContact = {...db.contacts[index]};
                db.contacts[index] = body;
                checkAndTriggerWorkflows('contactStatusChanged', { contact: body, oldContact });
                return respond(body);
            }
            if(method === 'DELETE') {
                db.contacts = db.contacts.filter(c => c.id !== contactId);
                return respond(null, 204);
            }
        }
        if (path.endsWith('/bulk-delete')) {
            db.contacts = db.contacts.filter(c => !body.ids.includes(c.id));
            return respond(null, 204);
        }
        if (path.endsWith('/bulk-status-update')) {
            db.contacts = db.contacts.map(c => body.ids.includes(c.id) ? { ...c, status: body.status } : c);
            return respond(null, 204);
        }
        if (method === 'GET') {
            const orgId = searchParams.get('orgId');
            return respond(db.contacts.filter(c => c.organizationId === orgId));
        }
        if (method === 'POST') {
            const newContact = { ...body, id: `contact_${Date.now()}`, createdAt: new Date().toISOString() };
            db.contacts.push(newContact);
            checkAndTriggerWorkflows('contactCreated', { contact: newContact });
            campaignService.checkAndEnrollInCampaigns(newContact);
            recalculateScoreForContact(newContact.id);
            return respond(newContact);
        }
    }
    
    // --- INTERACTIONS ---
    if (path.startsWith('/api/v1/interactions')) {
        if(method === 'GET') {
            const contactId = searchParams.get('contactId');
            if (contactId) {
                return respond(db.interactions.filter(i => i.contactId === contactId));
            }
            const orgId = searchParams.get('orgId');
            return respond(db.interactions.filter(i => i.organizationId === orgId));
        }
        if (method === 'POST') {
            const newInteraction = { ...body, id: `int_${Date.now()}`};
            db.interactions.unshift(newInteraction);
            // also add to contact
            const contact = db.contacts.find(c => c.id === body.contactId);
            if (contact) {
                if(!contact.interactions) contact.interactions = [];
                contact.interactions.unshift(newInteraction);
            }
            recalculateScoreForContact(body.contactId);
            return respond(newInteraction);
        }
    }

    // --- CUSTOM OBJECT DEFS ---
    if (path.startsWith('/api/v1/custom-object-definitions')) {
        const defId = path.split('/')[4];
        if (method === 'GET') {
            return respond(db.customObjectDefs.filter(d => d.organizationId === searchParams.get('orgId')));
        }
        if (method === 'POST') {
            const newDef = { ...body, id: `def_${Date.now()}` };
            db.customObjectDefs.push(newDef);
            return respond(newDef);
        }
        if (method === 'PUT' && defId) {
            const index = db.customObjectDefs.findIndex(d => d.id === defId);
            if (index > -1) {
                db.customObjectDefs[index] = body;
                return respond(body);
            }
        }
        if (method === 'DELETE' && defId) {
            db.customObjectDefs = db.customObjectDefs.filter(d => d.id !== defId);
            return respond(null, 204);
        }
    }

    // --- CUSTOM OBJECT RECORDS ---
    if (path.startsWith('/api/v1/custom-object-records')) {
        const recordId = path.split('/')[4];

        if (method === 'GET') {
            const defId = searchParams.get('defId');
            return respond(db.customObjectRecords.filter(r => r.objectDefId === defId));
        }
        if (method === 'POST') {
            const newRecord = { ...body, id: `rec_${Date.now()}` };
            db.customObjectRecords.push(newRecord);
            return respond(newRecord);
        }
        if (method === 'PUT' && recordId) {
            const index = db.customObjectRecords.findIndex(r => r.id === recordId);
            if (index > -1) {
                db.customObjectRecords[index] = body;
                return respond(body);
            }
        }
        if (method === 'DELETE' && recordId) {
            db.customObjectRecords = db.customObjectRecords.filter(r => r.id !== recordId);
            return respond(null, 204);
        }
    }


    // --- DASHBOARD ---
    if (path.endsWith('/dashboard')) {
        const orgId = searchParams.get('orgId');
        const orgContacts = db.contacts.filter(c => c.organizationId === orgId);
        const orgInteractions = db.interactions.filter(i => i.organizationId === orgId);
        return respond(generateDashboardData(orgContacts, orgInteractions));
    }
    
    // --- TEAM & ROLES ---
    if (path.endsWith('/team')) return respond(db.users.filter(u => u.organizationId === searchParams.get('orgId') && !u.isClient));
    if (path.endsWith('/roles')) return respond(db.roles.filter(r => r.organizationId === searchParams.get('orgId')));
    
    // --- TASKS ---
    if (path.endsWith('/tasks')) {
        const userId = searchParams.get('userId');
        const canViewAll = searchParams.get('canViewAll') === 'true';
        let userTasks = canViewAll ? db.tasks : db.tasks.filter(t => t.userId === userId);
        return respond(userTasks);
    }
    if (path.startsWith('/api/v1/tasks')) {
        const taskId = path.split('/')[4];
        if (method === 'PUT') {
            const index = db.tasks.findIndex(t => t.id === taskId);
            db.tasks[index] = body;
            return respond(body);
        }
    }
    
    // --- DEALS ---
    if (path.startsWith('/api/v1/deal-stages')) {
        if (method === 'GET') {
            const orgId = searchParams.get('orgId');
            return respond(db.dealStages.filter(ds => ds.organizationId === orgId));
        }
        if (method === 'PUT') {
            const orgId = body.organizationId;
            // Remove old stages for this org
            db.dealStages = db.dealStages.filter(ds => ds.organizationId !== orgId);
            // Add new stages
            const newStages = body.stages.map((name: string, index: number) => ({
                id: `stage_${orgId}_${index}`,
                organizationId: orgId,
                name: name,
                order: index + 1,
            }));
            db.dealStages.push(...newStages);
            return respond(newStages);
        }
    }
    if (path.startsWith('/api/v1/deals')) {
        const dealId = path.split('/')[4];
        if (path.includes('forecast')) {
            const prob = Math.floor(Math.random() * 80) + 10;
            return respond({ 
                dealId: 'deal_1', 
                probability: prob, 
                factors: { positive: ['Strong contact engagement'], negative: ['Competitor mentioned'] }, 
                nextBestAction: {
                    action: 'Email',
                    reason: 'Address competitor concerns with a targeted case study.',
                    templateId: 'template_2'
                }
            });
        }
        if (dealId) {
            if (method === 'PUT') {
                const index = db.deals.findIndex(d => d.id === dealId);
                const oldDeal = {...db.deals[index]};
                db.deals[index] = body;
                checkAndTriggerWorkflows('dealStageChanged', { deal: body, oldDeal, contact: db.contacts.find(c => c.id === body.contactId) });
                return respond(body);
            }
             if (method === 'DELETE') {
                db.deals = db.deals.filter(d => d.id !== dealId);
                return respond(null, 204);
            }
        }
        if (method === 'GET') return respond(db.deals.filter(d => d.organizationId === searchParams.get('orgId')));
        if (method === 'POST') {
            const newDeal = { ...body, id: `deal_${Date.now()}`, createdAt: new Date().toISOString() };
            db.deals.push(newDeal);
            checkAndTriggerWorkflows('dealCreated', { deal: newDeal, contact: db.contacts.find(c => c.id === newDeal.contactId) });
            return respond(newDeal);
        }
    }

    // --- TICKETS ---
    if (path.startsWith('/api/v1/tickets')) {
        const ticketId = path.split('/')[4];
        if (ticketId) {
            const ticketIndex = db.tickets.findIndex(t => t.id === ticketId);
            if (ticketIndex === -1) return respond({ message: "Ticket not found"}, 404);

            if (path.includes('/replies')) {
                const newReply = { ...body.reply, id: `reply_${Date.now()}`, timestamp: new Date().toISOString() };
                db.tickets[ticketIndex].replies.push(newReply);
                db.tickets[ticketIndex].updatedAt = new Date().toISOString();
                return respond(db.tickets[ticketIndex]);
            }

            if (method === 'PUT') {
                const oldTicket = { ...db.tickets[ticketIndex] };
                db.tickets[ticketIndex] = body;
                if (oldTicket.status !== body.status) {
                    checkAndTriggerWorkflows('ticketStatusChanged', { ticket: body, oldTicket });
                }
                return respond(body);
            }
        }
        if (method === 'GET') {
            return respond(db.tickets.filter(t => t.organizationId === searchParams.get('orgId')));
        }
        if (method === 'POST') {
            const newTicket = { 
                ...body, 
                id: `ticket_${Date.now()}`, 
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                replies: [],
            };
            db.tickets.push(newTicket);
            checkAndTriggerWorkflows('ticketCreated', { ticket: newTicket, contact: db.contacts.find(c => c.id === newTicket.contactId) });
            return respond(newTicket);
        }
    }
    
    // --- SETTINGS ---
    if (path.startsWith('/api/v1/industry-config/')) {
        const industry = path.split('/')[4];
        return respond((industryConfigs as any)[industry]);
    }
    if (path.endsWith('/settings')) {
         if (method === 'GET') return respond(db.settings);
         if (method === 'PUT') {
             db.settings = { ...db.settings, ...body };
             return respond(db.settings);
         }
    }
    
    // --- OTHER GETS ---
    if (path.endsWith('/calendar-events')) return respond(db.calendarEvents);
    if (path.endsWith('/products')) return respond(db.products);
    if (path.endsWith('/email-templates')) return respond(db.emailTemplates);
    if (path.endsWith('/workflows')) return respond(db.workflows);
    if (path.endsWith('/advanced-workflows')) return respond(db.advancedWorkflows);
    if (path.endsWith('/api-keys')) return respond(db.apiKeys);
    if (path.endsWith('/forms')) return respond(db.forms);
    if (path.endsWith('/campaigns')) return respond(db.campaigns);
    if (path.endsWith('/landing-pages')) return respond(db.landingPages);
    if (path.endsWith('/public/landing-pages/' + path.split('/').pop())) {
        return respond(db.landingPages.find(p => p.slug === path.split('/').pop()));
    }
    if (path.endsWith('/reports/custom')) return respond(db.customReports);
    if (path.endsWith('/dashboard/widgets')) return respond(db.dashboardWidgets);
    if (path.endsWith('/documents')) return respond(db.documents.filter(d => d.contactId === searchParams.get('contactId')));

    // --- OTHER POSTS ---
    if (path.endsWith('/reports/custom/generate')) return respond(db.contacts.slice(0, 10)); // Simplified
    if (path.endsWith('/campaigns/bulk-enroll')) {
        campaignService.enrollContacts(body.campaignId);
        return respond({ success: true });
    }
    if (path.includes('/launch')) {
        const campId = path.split('/')[4];
        campaignService.enrollContacts(campId);
        return respond({ success: true });
    }
    if (path.endsWith('/scheduler/advance-day')) {
        const newDate = new Date(body.currentDate);
        newDate.setDate(newDate.getDate() + 1);
        campaignSchedulerService.processScheduledCampaigns(newDate);
        return respond(newDate.toISOString());
    }

    return respond({ message: `Mock route for ${method} ${path} not found.` }, 404);
};

export function startMockServer() {
    console.log('--- MOCK API SERVER STARTED ---');
    setFetchImplementation(mockFetch);
}