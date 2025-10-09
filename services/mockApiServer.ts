// This file simulates a backend server by intercepting fetch requests.
// It contains all the logic for creating, reading, updating, and deleting data.
import {
    MOCK_USERS, MOCK_ORGANIZATIONS, MOCK_CONTACTS_MUTABLE, MOCK_ROLES, MOCK_TASKS, MOCK_CALENDAR_EVENTS, MOCK_PRODUCTS, MOCK_DEALS, MOCK_DEAL_STAGES, MOCK_EMAIL_TEMPLATES, MOCK_INTERACTIONS, MOCK_WORKFLOWS, MOCK_ADVANCED_WORKFLOWS, MOCK_ORGANIZATION_SETTINGS, MOCK_API_KEYS, MOCK_TICKETS, MOCK_FORMS, MOCK_CAMPAIGNS, MOCK_DOCUMENTS, MOCK_LANDING_PAGES, MOCK_CUSTOM_REPORTS, MOCK_DASHBOARD_WIDGETS, MOCK_SUPPLIERS, MOCK_WAREHOUSES, MOCK_ANONYMOUS_SESSIONS
} from './mockData';
import {
    User, Organization, AnyContact, CustomRole, Task, CalendarEvent, Product, Deal, DealStage, EmailTemplate, Interaction, Workflow, AdvancedWorkflow, OrganizationSettings, ApiKey, Ticket, PublicForm, Campaign, Document, LandingPage, CustomReport, ReportDataSource, FilterCondition, DashboardWidget
} from '../types';
import { generateDashboardData } from './reportGenerator';
import { industryConfigs } from '../config/industryConfig';
import { checkAndTriggerWorkflows } from './workflowService';
import { recalculateAllScores, recalculateScoreForContact } from './leadScoringService';
import { campaignSchedulerService } from './campaignSchedulerService';
import { campaignService } from './campaignService';
import { addDays } from 'date-fns';
import { setFetchImplementation } from './apiClient';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// The main function that starts the mock server
export function startMockServer() {
    setFetchImplementation(async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
        const { pathname, searchParams } = new URL(String(input), window.location.origin);
        const method = init?.method || 'GET';
        const body = init?.body ? JSON.parse(String(init.body)) : {};

        console.log(`[Mock API] Intercepted: ${method} ${pathname}`);

        // Simulate network delay
        await delay(Math.random() * 400 + 100);

        // --- API ROUTER ---
        try {
            // AUTH
            if (method === 'POST' && pathname === '/api/v1/login') {
                const user = MOCK_USERS.find(u => u.email === body.email);
                return jsonResponse(user || null);
            }

            // ORGANIZATIONS
            if (pathname.startsWith('/api/v1/organizations')) {
                if (method === 'GET') return jsonResponse(MOCK_ORGANIZATIONS);
                if (method === 'POST') {
                    const newOrg = { ...body, id: `org_${Date.now()}`, createdAt: new Date().toISOString() };
                    MOCK_ORGANIZATIONS.push(newOrg);
                    return jsonResponse(newOrg, 201);
                }
                const id = pathname.split('/')[4];
                if (method === 'PUT') {
                    const index = MOCK_ORGANIZATIONS.findIndex(o => o.id === id);
                    if (index > -1) {
                        MOCK_ORGANIZATIONS[index] = { ...MOCK_ORGANIZATIONS[index], ...body };
                        return jsonResponse(MOCK_ORGANIZATIONS[index]);
                    }
                }
                if (method === 'DELETE') {
                    const index = MOCK_ORGANIZATIONS.findIndex(o => o.id === id);
                    if (index > -1) MOCK_ORGANIZATIONS.splice(index, 1);
                    return jsonResponse({});
                }
            }

            // CONTACTS
            if (pathname.startsWith('/api/v1/contacts')) {
                if (method === 'GET') {
                    const orgId = searchParams.get('orgId');
                    if (orgId) return jsonResponse(MOCK_CONTACTS_MUTABLE.filter(c => c.organizationId === orgId));
                    const id = pathname.split('/')[4];
                    if (id) return jsonResponse(MOCK_CONTACTS_MUTABLE.find(c => c.id === id) || null);
                }
                if (method === 'POST' && pathname === '/api/v1/contacts') {
                    const newContact = { ...body, id: `contact_${Date.now()}`, createdAt: new Date().toISOString() };
                    MOCK_CONTACTS_MUTABLE.unshift(newContact);
                    checkAndTriggerWorkflows('contactCreated', { contact: newContact });
                    campaignService.checkAndEnrollInCampaigns(newContact);
                    return jsonResponse(newContact, 201);
                }
                if (method === 'POST' && pathname.endsWith('/bulk-delete')) {
                    let i = MOCK_CONTACTS_MUTABLE.length;
                    while (i--) { if (body.ids.includes(MOCK_CONTACTS_MUTABLE[i].id)) MOCK_CONTACTS_MUTABLE.splice(i, 1); }
                    return jsonResponse({});
                }
                if (method === 'POST' && pathname.endsWith('/bulk-status-update')) {
                    MOCK_CONTACTS_MUTABLE.forEach((contact, index) => { if (body.ids.includes(contact.id)) MOCK_CONTACTS_MUTABLE[index].status = body.status; });
                    return jsonResponse({});
                }
                const id = pathname.split('/')[4];
                if (method === 'PUT') {
                    const index = MOCK_CONTACTS_MUTABLE.findIndex(c => c.id === id);
                    if (index > -1) {
                        const oldContact = { ...MOCK_CONTACTS_MUTABLE[index] };
                        MOCK_CONTACTS_MUTABLE[index] = { ...MOCK_CONTACTS_MUTABLE[index], ...body };
                        if (oldContact.status !== body.status) {
                            checkAndTriggerWorkflows('contactStatusChanged', { contact: body, oldContact });
                        }
                        recalculateScoreForContact(id);
                        return jsonResponse(MOCK_CONTACTS_MUTABLE[index]);
                    }
                }
                if (method === 'DELETE') {
                    const index = MOCK_CONTACTS_MUTABLE.findIndex(c => c.id === id);
                    if (index > -1) MOCK_CONTACTS_MUTABLE.splice(index, 1);
                    return jsonResponse({});
                }
            }
            
            // TEAM & ROLES
            if (pathname === '/api/v1/team') return jsonResponse(MOCK_USERS.filter(u => u.organizationId === searchParams.get('orgId') && !u.isClient));
            if (pathname === '/api/v1/roles') return jsonResponse(MOCK_ROLES.filter(r => r.organizationId === searchParams.get('orgId') || r.organizationId === '*'));

            // ... other handlers ...
            if (pathname.startsWith('/api/v1/industry-config')) {
                const industry = pathname.split('/')[4] as keyof typeof industryConfigs;
                if (method === 'GET') return jsonResponse(industryConfigs[industry]);
                if (method === 'PUT' && pathname.endsWith('custom-fields')) {
                    industryConfigs[industry].customFields = body.fields;
                    return jsonResponse(industryConfigs[industry]);
                }
            }

            if(pathname === '/api/v1/dashboard') return jsonResponse(generateDashboardData(MOCK_CONTACTS_MUTABLE, MOCK_INTERACTIONS));
            
            if(pathname === '/api/v1/settings') {
                if(method === 'GET') return jsonResponse(MOCK_ORGANIZATION_SETTINGS);
                if(method === 'PUT') {
                     if (body.ticketSla) Object.assign(MOCK_ORGANIZATION_SETTINGS.ticketSla, body.ticketSla);
                     if (body.leadScoringRules) MOCK_ORGANIZATION_SETTINGS.leadScoringRules = body.leadScoringRules;
                     if (body.emailIntegration) Object.assign(MOCK_ORGANIZATION_SETTINGS.emailIntegration, body.emailIntegration);
                     if (body.voip) Object.assign(MOCK_ORGANIZATION_SETTINGS.voip, body.voip);
                     if (body.liveChat) Object.assign(MOCK_ORGANIZATION_SETTINGS.liveChat, body.liveChat);
                     return jsonResponse(MOCK_ORGANIZATION_SETTINGS);
                }
            }

            if(pathname === '/api/v1/forms/submit') {
                const newContact = { id: `contact_${Date.now()}`, organizationId: 'org_1', contactName: body.submissionData.contactName || body.submissionData['customFields.contactName'], email: body.submissionData.email, phone: body.submissionData.phone || '', status: 'Lead' as const, leadSource: 'Public Form', createdAt: new Date().toISOString(), customFields: body.submissionData.customFields || {}, interactions: [] };
                if (body.sessionId) {
                    const sessionIndex = MOCK_ANONYMOUS_SESSIONS.findIndex(s => s.sessionId === body.sessionId);
                    if(sessionIndex > -1){
                        newContact.interactions = MOCK_ANONYMOUS_SESSIONS[sessionIndex].pageviews.map(pv => ({ id: `int_pv_${Date.now()}`, organizationId: 'org_1', contactId: newContact.id, userId: 'system', type: 'Site Visit' as const, date: pv.timestamp, notes: `Viewed page: ${pv.url}`}));
                        MOCK_INTERACTIONS.unshift(...newContact.interactions);
                        MOCK_ANONYMOUS_SESSIONS.splice(sessionIndex, 1);
                    }
                }
                MOCK_CONTACTS_MUTABLE.unshift(newContact);
                return jsonResponse(newContact);
            }

             if(pathname.startsWith('/api/v1/public/landing-pages')) {
                const slug = pathname.split('/').pop();
                const page = MOCK_LANDING_PAGES.find(p => p.slug === slug && p.status === 'Published');
                return jsonResponse(page || null);
             }

            // This is a catch-all for simple GET requests by orgId
            const simpleGetEndpoints = ['tasks', 'products', 'suppliers', 'warehouses', 'deal-stages', 'deals', 'email-templates', 'workflows', 'advanced-workflows', 'api-keys', 'tickets', 'forms', 'campaigns', 'landing-pages', 'reports/custom', 'dashboard/widgets'];
            for(const endpoint of simpleGetEndpoints) {
                if(pathname === `/api/v1/${endpoint}`) {
                    const mockDataMap: Record<string, any[]> = {
                        'tasks': MOCK_TASKS,
                        'products': MOCK_PRODUCTS,
                        'suppliers': MOCK_SUPPLIERS,
                        'warehouses': MOCK_WAREHOUSES,
                        'deal-stages': MOCK_DEAL_STAGES,
                        'deals': MOCK_DEALS,
                        'email-templates': MOCK_EMAIL_TEMPLATES,
                        'workflows': MOCK_WORKFLOWS,
                        'advanced-workflows': MOCK_ADVANCED_WORKFLOWS,
                        'api-keys': MOCK_API_KEYS,
                        'tickets': MOCK_TICKETS,
                        'forms': MOCK_FORMS,
                        'campaigns': MOCK_CAMPAIGNS,
                        'landing-pages': MOCK_LANDING_PAGES,
                        'reports/custom': MOCK_CUSTOM_REPORTS,
                        'dashboard/widgets': MOCK_DASHBOARD_WIDGETS,
                    }
                    const data = mockDataMap[endpoint];
                    const orgId = searchParams.get('orgId');
                    if(data && data.length > 0 && 'organizationId' in data[0]) {
                        return jsonResponse(data.filter(item => item.organizationId === orgId));
                    }
                    return jsonResponse(data || []);
                }
            }
             if(pathname === '/api/v1/tracking/pageview' && method === 'POST') {
                const { sessionId, orgId, url } = body;
                let session = MOCK_ANONYMOUS_SESSIONS.find(s => s.sessionId === sessionId);
                if (!session) {
                    session = { sessionId, organizationId: orgId, pageviews: [] };
                    MOCK_ANONYMOUS_SESSIONS.push(session);
                }
                session.pageviews.push({ url, timestamp: new Date().toISOString() });
                return jsonResponse({ success: true });
            }

            // Fallback for unhandled routes
            return jsonResponse({ message: `Mock API endpoint not found: ${method} ${pathname}` }, 404);
        } catch (error) {
            console.error('[Mock API] Error:', error);
            return jsonResponse({ message: (error as Error).message }, 500);
        }
    });
}

// Helper to create a Response object
function jsonResponse(data: any, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}