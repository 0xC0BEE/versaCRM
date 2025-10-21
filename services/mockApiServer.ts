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
import { Sandbox, Conversation, CannedResponse, Interaction, Survey, SurveyResponse, Snapshot, TeamChannel, TeamChatMessage, Notification, ClientChecklist, SubscriptionPlan, Relationship, AudienceProfile, AnyContact, Deal, DealStage, Document, Product, CustomObjectRecord, CustomObjectDefinition, User, Project } from '../types';
import { GoogleGenAI, Type } from '@google/genai';
import { addMonths } from 'date-fns';

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
        const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (user) return respond(user);
        return respond({ message: 'Invalid credentials' }, 401);
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


    // --- ORGANIZATIONS ---
    if (path === '/api/v1/organizations' && method === 'GET') return respond(db.organizations);
    const orgMatch = path.match(/^\/api\/v1\/organizations\/([a-zA-Z0-9_]+)$/);
    if (orgMatch && method === 'PUT') {
        const orgId = orgMatch[1];
        const index = db.organizations.findIndex(o => o.id === orgId);
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
        const index = db.customObjectDefs.findIndex(d => d.id === defId);
        if (index > -1) {
            db.customObjectDefs[index] = { ...db.customObjectDefs[index], ...body };
            return respond(db.customObjectDefs[index]);
        }
    }


    // --- DEAL STAGES ---
    if (path === '/api/v1/deal-stages' && method === 'PUT') {
        const { orgId, stages } = body;
        db.dealStages = db.dealStages.filter(s => s.organizationId !== orgId);
        const newStages = stages.map((name: string, index: number) => ({
            id: `stage_ai_${index}_${Date.now()}`,
            organizationId: orgId,
            name,
            order: index + 1,
        }));
        db.dealStages.push(...newStages);
        return respond(newStages);
    }

    // --- SETTINGS ---
    const settingsMatch = path.match(/^\/api\/v1\/organizations\/([a-zA-Z0-9_]+)\/settings$/);
    if (settingsMatch) {
        const orgId = settingsMatch[1];
        const org = db.organizations.find(o => o.id === orgId);
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
        if (path === '/api/v1/contacts') return respond(db.contacts.filter(c => c.organizationId === orgId));
        if (path === '/api/v1/team') return respond(db.users.filter(u => u.organizationId === orgId && !u.isClient));
        if (path === '/api/v1/roles') return respond(db.roles.filter(r => r.organizationId === orgId));
        if (path === '/api/v1/tasks') {
            const userId = searchParams.get('userId');
            const canViewAll = searchParams.get('canViewAll') === 'true';
            const userTasks = db.tasks.filter(t => t.organizationId === orgId && (canViewAll || t.userId === userId));
            return respond(userTasks);
        }
        if (path === '/api/v1/calendar/events') return respond(db.calendarEvents.filter(e => (e as any).organizationId === orgId));
        if (path === '/api/v1/products') return respond(db.products.filter(p => p.organizationId === orgId));
        if (path === '/api/v1/deals') return respond(db.deals.filter(d => d.organizationId === orgId));
        if (path === '/api/v1/deal-stages') return respond(db.dealStages.filter(d => d.organizationId === orgId));
        if (path === '/api/v1/interactions') return respond(db.interactions.filter(i => i.organizationId === orgId));
        if (path === '/api/v1/tickets') return respond(db.tickets.filter(t => t.organizationId === orgId));
        if (path === '/api/v1/email-templates') return respond(db.emailTemplates.filter(t => t.organizationId === orgId));
        if (path === '/api/v1/workflows') return respond(db.workflows.filter(w => w.organizationId === orgId));
        if (path === '/api/v1/advanced-workflows') return respond(db.advancedWorkflows.filter(w => w.organizationId === orgId));
        if (path === '/api/v1/api-keys') return respond(db.apiKeys.filter(k => k.organizationId === orgId));
        if (path === '/api/v1/forms') return respond(db.forms.filter(f => f.organizationId === orgId));
        if (path === '/api/v1/campaigns') return respond(db.campaigns.filter(c => c.organizationId === orgId));
        if (path === '/api/v1/landing-pages') return respond(db.landingPages.filter(l => l.organizationId === orgId));
        if (path === '/api/v1/custom-reports') return respond(db.customReports.filter(r => r.organizationId === orgId));
        if (path === '/api/v1/dashboards') return respond(db.dashboards.filter(d => d.organizationId === orgId));
        if (path === '/api/v1/custom-object-definitions') return respond(db.customObjectDefs.filter(d => d.organizationId === orgId));
        if (path === '/api/v1/inbox') {
            const conversations: Conversation[] = [];
            const interactionGroups = db.interactions.reduce((acc, i) => {
                if (!i.notes.includes('Subject:')) return acc; // Only process emails
                const key = `${i.contactId}-${i.notes.match(/Subject: (.*)/)![1]}`;
                if (!acc[key]) acc[key] = [];
                acc[key].push(i);
                return acc;
            }, {} as Record<string, Interaction[]>);

            for (const key in interactionGroups) {
                const group = interactionGroups[key].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                const last = group[group.length - 1];
                const contact = db.contacts.find(c => c.id === last.contactId);
                const teamMember = db.users.find(u => u.id === last.userId);
                if (contact && teamMember) {
                     conversations.push({
                        id: `conv_${contact.id}_${group[0].id}`,
                        contactId: contact.id,
                        subject: last.notes.match(/Subject: (.*)/)![1],
                        channel: 'Email',
                        lastMessageTimestamp: last.date,
                        lastMessageSnippet: last.notes.split('\n\n')[1] || last.notes,
                        messages: group.map(i => ({ id: i.id, senderId: i.userId, body: i.notes.split('\n\n')[1] || i.notes, timestamp: i.date })),
                        participants: [{id: contact.id, name: contact.contactName, email: contact.email}, {id: teamMember.id, name: teamMember.name, email: teamMember.email}],
                    });
                }
            }
            return respond(conversations.sort((a,b) => new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime()));
        }
        if (path === '/api/v1/team-channels') return respond(db.teamChannels.filter(c => c.organizationId === orgId));
        // ... and so on for all other GET endpoints that are filtered by orgId
    }
    
    // --- OTHER DYNAMIC GETs ---
    const dashboardId = searchParams.get('dashboardId');
    if (dashboardId && path === '/api/v1/dashboard-widgets') {
        return respond(db.dashboardWidgets.filter(w => w.dashboardId === dashboardId));
    }
    const defId = searchParams.get('defId');
    if (path === '/api/v1/custom-object-records') {
        const records = defId ? db.customObjectRecords.filter(r => r.objectDefId === defId) : db.customObjectRecords;
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
                if (resource === 'contacts') newItem.createdAt = new Date().toISOString();
                table.push(newItem);
                return respond(newItem, 201);
            }
            if (resourceId) {
                const itemIndex = table.findIndex(item => item.id === resourceId);
                if (itemIndex > -1) {
                    if (method === 'GET') return respond(table[itemIndex]);
                    if (method === 'PUT') {
                        table[itemIndex] = { ...table[itemIndex], ...body };
                        return respond(table[itemIndex]);
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
