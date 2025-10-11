import { setFetchImplementation } from './apiClient';
import {
    MOCK_ORGANIZATIONS, MOCK_USERS, MOCK_ROLES, MOCK_CONTACTS_MUTABLE, MOCK_DEAL_STAGES, MOCK_DEALS, MOCK_PRODUCTS, MOCK_TASKS, MOCK_CALENDAR_EVENTS, MOCK_EMAIL_TEMPLATES, MOCK_FORMS, MOCK_CAMPAIGNS, MOCK_WORKFLOWS, MOCK_ADVANCED_WORKFLOWS, MOCK_ORGANIZATION_SETTINGS, MOCK_TICKETS, MOCK_LANDING_PAGES, MOCK_CUSTOM_REPORTS, MOCK_DASHBOARD_WIDGETS, MOCK_DOCUMENTS, MOCK_API_KEYS, MOCK_SUPPLIERS, MOCK_WAREHOUSES, MOCK_CUSTOM_OBJECT_DEFINITIONS, MOCK_CUSTOM_OBJECT_RECORDS, MOCK_ANONYMOUS_SESSIONS, MOCK_APP_MARKETPLACE_ITEMS, MOCK_INSTALLED_APPS, MOCK_INTERACTIONS
} from './mockData';
import { industryConfigs } from '../config/industryConfig';
import { generateDashboardData } from './reportGenerator';
import { AnyContact, Deal, DealForecast, Interaction, ContactChurnPrediction, NextBestAction, CampaignEnrollment, AnonymousSession, CustomReport, LandingPage, PublicForm, Campaign, DashboardWidget } from '../types';
import { campaignService } from './campaignService';
import { campaignSchedulerService } from './campaignSchedulerService';
import { recalculateScoreForContact, recalculateAllScores } from './leadScoringService';
import { checkAndTriggerWorkflows } from './workflowService';

const clone = (data: any) => JSON.parse(JSON.stringify(data));

// This is a simple in-memory router for our mock API
const router = async (url: URL, config: RequestInit): Promise<Response> => {
    const { pathname, searchParams } = url;
    const method = config.method || 'GET';
    const body = config.body ? JSON.parse(config.body as string) : {};

    console.log(`[Mock API] Intercepted: ${method} ${pathname}`);

    // --- AUTH ---
    if (pathname === '/api/v1/login' && method === 'POST') {
        const user = MOCK_USERS.find(u => u.email === body.email);
        return new Response(JSON.stringify(user || null), { status: 200 });
    }

    // --- ORGANIZATIONS ---
    if (pathname === '/api/v1/organizations') {
        if (method === 'GET') return new Response(JSON.stringify(MOCK_ORGANIZATIONS));
        if (method === 'POST') {
            const newOrg = { ...body, id: `org_${Date.now()}`, createdAt: new Date().toISOString() };
            MOCK_ORGANIZATIONS.push(newOrg);
            return new Response(JSON.stringify(newOrg), { status: 201 });
        }
    }
    const orgMatch = pathname.match(/^\/api\/v1\/organizations\/(\w+)$/);
    if (orgMatch) {
        const [, id] = orgMatch;
        const index = MOCK_ORGANIZATIONS.findIndex(o => o.id === id);
        if (index === -1) return new Response(JSON.stringify({ message: 'Organization not found' }), { status: 404 });

        if (method === 'PUT') {
            MOCK_ORGANIZATIONS[index] = { ...MOCK_ORGANIZATIONS[index], ...body };
            return new Response(JSON.stringify(MOCK_ORGANIZATIONS[index]));
        }
        if (method === 'DELETE') {
            MOCK_ORGANIZATIONS.splice(index, 1);
            return new Response(null, { status: 204 });
        }
    }

    // --- CONTACTS ---
    const contactListMatch = pathname.match(/^\/api\/v1\/contacts$/);
    if (contactListMatch && method === 'GET') {
        const orgId = searchParams.get('orgId');
        const contacts = MOCK_CONTACTS_MUTABLE.filter(c => c.organizationId === orgId);
        return new Response(JSON.stringify(clone(contacts)));
    }
    if (pathname === '/api/v1/contacts' && method === 'POST') {
        const newContact = { ...body, id: `contact_${Date.now()}`, createdAt: new Date().toISOString(), interactions: [], orders: [], transactions: [], auditLogs: [] };
        MOCK_CONTACTS_MUTABLE.push(newContact);
        recalculateScoreForContact(newContact.id);
        checkAndTriggerWorkflows('contactCreated', { contact: newContact });
        campaignService.checkAndEnrollInCampaigns(newContact as AnyContact);
        return new Response(JSON.stringify(newContact), { status: 201 });
    }
    const contactDetailMatch = pathname.match(/^\/api\/v1\/contacts\/([\w_]+)$/);
    if (contactDetailMatch) {
        const [, id] = contactDetailMatch;
        const index = MOCK_CONTACTS_MUTABLE.findIndex(c => c.id === id);
        if (index === -1) return new Response(JSON.stringify({ message: 'Contact not found' }), { status: 404 });

        if (method === 'GET') {
            return new Response(JSON.stringify(clone(MOCK_CONTACTS_MUTABLE[index])));
        }
        if (method === 'PUT') {
            const oldContact = clone(MOCK_CONTACTS_MUTABLE[index]);
            MOCK_CONTACTS_MUTABLE[index] = { ...MOCK_CONTACTS_MUTABLE[index], ...body };
            recalculateScoreForContact(id);
            if (oldContact.status !== body.status) {
                checkAndTriggerWorkflows('contactStatusChanged', { contact: MOCK_CONTACTS_MUTABLE[index], oldContact, user: MOCK_USERS[1] });
            }
            return new Response(JSON.stringify(MOCK_CONTACTS_MUTABLE[index]));
        }
        if (method === 'DELETE') {
            MOCK_CONTACTS_MUTABLE.splice(index, 1);
            return new Response(null, { status: 204 });
        }
    }
    if (pathname === '/api/v1/contacts/bulk-delete' && method === 'POST') {
        const { ids } = body;
        const newContacts = MOCK_CONTACTS_MUTABLE.filter(c => !ids.includes(c.id));
        MOCK_CONTACTS_MUTABLE.length = 0;
        Array.prototype.push.apply(MOCK_CONTACTS_MUTABLE, newContacts);
        return new Response(null, { status: 204 });
    }
    if (pathname === '/api/v1/contacts/bulk-status-update' && method === 'POST') {
        const { ids, status } = body;
        ids.forEach((id: string) => {
            const index = MOCK_CONTACTS_MUTABLE.findIndex(c => c.id === id);
            if (index > -1) MOCK_CONTACTS_MUTABLE[index].status = status;
        });
        return new Response(null, { status: 204 });
    }
     const churnPredictionMatch = pathname.match(/^\/api\/v1\/contacts\/([\w_]+)\/churn-prediction$/);
    if (churnPredictionMatch) {
        const risks: Array<ContactChurnPrediction['risk']> = ['High', 'Medium', 'Low'];
        const prediction: ContactChurnPrediction = {
            risk: risks[Math.floor(Math.random() * risks.length)],
            factors: {
                positive: ["Regularly opens marketing emails", "Has recent appointments"],
                negative: ["No interactions in the last 60 days", "Has an open high-priority ticket"],
            },
            nextBestAction: "Proactively reach out with a personalized check-in email to re-engage."
        };
        return new Response(JSON.stringify(prediction));
    }
    const nextBestActionMatch = pathname.match(/^\/api\/v1\/contacts\/([\w_]+)\/next-best-action$/);
    if (nextBestActionMatch) {
        const actions: NextBestAction[] = [
            { type: 'CALL', action: 'Call to discuss new product offering', reason: 'High lead score and recent website activity on product page.' },
            { type: 'EMAIL', action: 'Send follow-up email with case study', reason: 'Has not responded to initial outreach.', details: { templateId: 'template_2' } },
            { type: 'TASK', action: 'Schedule a 6-month review', reason: 'Long-term client with no recent strategic review.', details: { taskTitle: 'Schedule 6-month review' } },
        ];
        return new Response(JSON.stringify(actions[Math.floor(Math.random() * actions.length)]));
    }


    // --- TEAM & ROLES ---
    if (pathname === '/api/v1/team' && method === 'GET') {
        return new Response(JSON.stringify(MOCK_USERS.filter(u => u.organizationId === searchParams.get('orgId') && !u.isClient)));
    }
    if (pathname === '/api/v1/roles' && method === 'GET') {
        return new Response(JSON.stringify(MOCK_ROLES.filter(r => r.organizationId === searchParams.get('orgId'))));
    }
    if (pathname === '/api/v1/users' && method === 'POST') {
        const newUser = { ...body, id: `user_${Date.now()}` };
        MOCK_USERS.push(newUser);
        return new Response(JSON.stringify(newUser), { status: 201 });
    }
    if (pathname === '/api/v1/roles' && method === 'POST') {
        const newRole = { ...body, id: `role_${Date.now()}` };
        MOCK_ROLES.push(newRole);
        return new Response(JSON.stringify(newRole), { status: 201 });
    }

    // --- INTERACTIONS ---
    if (pathname === '/api/v1/interactions' && method === 'GET') {
        const contactId = searchParams.get('contactId');
        if(contactId){
             const contact = MOCK_CONTACTS_MUTABLE.find(c => c.id === contactId);
             return new Response(JSON.stringify(contact?.interactions || []));
        }
        const orgId = searchParams.get('orgId');
        const allInteractions = MOCK_CONTACTS_MUTABLE.filter(c => c.organizationId === orgId).flatMap(c => c.interactions || []);
        return new Response(JSON.stringify(allInteractions));
    }
    if (pathname === '/api/v1/interactions' && method === 'POST') {
        const newInteraction = { ...body, id: `int_${Date.now()}` };
        MOCK_INTERACTIONS.push(newInteraction);
        const contactIndex = MOCK_CONTACTS_MUTABLE.findIndex(c => c.id === body.contactId);
        if (contactIndex > -1) {
            if (!MOCK_CONTACTS_MUTABLE[contactIndex].interactions) MOCK_CONTACTS_MUTABLE[contactIndex].interactions = [];
            MOCK_CONTACTS_MUTABLE[contactIndex].interactions!.unshift(newInteraction);
            recalculateScoreForContact(body.contactId);
        }
        return new Response(JSON.stringify(newInteraction), { status: 201 });
    }

    // --- DASHBOARD ---
    if (pathname === '/api/v1/dashboard' && method === 'GET') {
        const data = generateDashboardData(MOCK_CONTACTS_MUTABLE, MOCK_INTERACTIONS);
        return new Response(JSON.stringify(data));
    }
    
    // --- TASKS ---
    if (pathname === '/api/v1/tasks' && method === 'GET') {
        const { orgId, userId, canViewAll } = Object.fromEntries(searchParams.entries());
        let tasks = MOCK_TASKS.filter(t => t.organizationId === orgId);
        if (canViewAll !== 'true') {
            tasks = tasks.filter(t => t.userId === userId);
        }
        return new Response(JSON.stringify(tasks));
    }
    if (pathname === '/api/v1/tasks' && method === 'POST') {
        const newTask = { ...body, id: `task_${Date.now()}`, isCompleted: false };
        MOCK_TASKS.push(newTask);
        return new Response(JSON.stringify(newTask), { status: 201 });
    }
    const taskMatch = pathname.match(/^\/api\/v1\/tasks\/(\w+)$/);
    if (taskMatch) {
         const [, id] = taskMatch;
         const index = MOCK_TASKS.findIndex(t => t.id === id);
         if (index === -1) return new Response(JSON.stringify({ message: 'Task not found' }), { status: 404 });
         if (method === 'PUT') {
             MOCK_TASKS[index] = { ...MOCK_TASKS[index], ...body };
             return new Response(JSON.stringify(MOCK_TASKS[index]));
         }
         if (method === 'DELETE') {
             MOCK_TASKS.splice(index, 1);
             return new Response(null, { status: 204 });
         }
    }


    // --- CALENDAR ---
    if (pathname === '/api/v1/calendar-events' && method === 'GET') {
        return new Response(JSON.stringify(MOCK_CALENDAR_EVENTS));
    }
    if (pathname === '/api/v1/calendar-events' && method === 'POST') {
        const newEvent = { ...body, id: `event_${Date.now()}` };
        MOCK_CALENDAR_EVENTS.push(newEvent);
        return new Response(JSON.stringify(newEvent), { status: 201 });
    }


    // --- PRODUCTS & INVENTORY ---
    if (pathname === '/api/v1/products' && method === 'GET') return new Response(JSON.stringify(MOCK_PRODUCTS));
    if (pathname === '/api/v1/products' && method === 'POST') {
        const newProduct = { ...body, id: `prod_${Date.now()}`};
        MOCK_PRODUCTS.push(newProduct);
        return new Response(JSON.stringify(newProduct), { status: 201 });
    }
    if (pathname === '/api/v1/suppliers' && method === 'GET') return new Response(JSON.stringify(MOCK_SUPPLIERS));
    if (pathname === '/api/v1/suppliers' && method === 'POST') {
        const newSupplier = { ...body, id: `sup_${Date.now()}`};
        MOCK_SUPPLIERS.push(newSupplier);
        return new Response(JSON.stringify(newSupplier), { status: 201 });
    }
    if (pathname === '/api/v1/warehouses' && method === 'GET') return new Response(JSON.stringify(MOCK_WAREHOUSES));
    if (pathname === '/api/v1/warehouses' && method === 'POST') {
        const newWarehouse = { ...body, id: `wh_${Date.now()}`};
        MOCK_WAREHOUSES.push(newWarehouse);
        return new Response(JSON.stringify(newWarehouse), { status: 201 });
    }
    
    // --- DEALS ---
    if (pathname === '/api/v1/deal-stages' && method === 'GET') return new Response(JSON.stringify(MOCK_DEAL_STAGES));
    if (pathname === '/api/v1/deals' && method === 'GET') return new Response(JSON.stringify(MOCK_DEALS));
    if (pathname === '/api/v1/deals' && method === 'POST') {
        const newDeal = { ...body, id: `deal_${Date.now()}`, createdAt: new Date().toISOString() };
        MOCK_DEALS.push(newDeal);
        checkAndTriggerWorkflows('dealCreated', { deal: newDeal, contact: MOCK_CONTACTS_MUTABLE.find(c => c.id === newDeal.contactId) });
        return new Response(JSON.stringify(newDeal), { status: 201 });
    }
    const dealMatch = pathname.match(/^\/api\/v1\/deals\/([\w_]+)$/);
    if (dealMatch) {
        const [, id] = dealMatch;
        const index = MOCK_DEALS.findIndex(d => d.id === id);
        if (index === -1) return new Response(JSON.stringify({ message: 'Deal not found' }), { status: 404 });
        if (method === 'PUT') {
            const oldDeal = clone(MOCK_DEALS[index]);
            MOCK_DEALS[index] = { ...MOCK_DEALS[index], ...body };
            if (oldDeal.stageId !== body.stageId) {
                checkAndTriggerWorkflows('dealStageChanged', { deal: MOCK_DEALS[index], oldDeal, contact: MOCK_CONTACTS_MUTABLE.find(c => c.id === MOCK_DEALS[index].contactId) });
            }
            return new Response(JSON.stringify(MOCK_DEALS[index]));
        }
        if (method === 'DELETE') {
            MOCK_DEALS.splice(index, 1);
            return new Response(null, { status: 204 });
        }
    }
    const dealForecastMatch = pathname.match(/^\/api\/v1\/deals\/([\w_]+)\/forecast$/);
    if (dealForecastMatch) {
        const probabilities = [25, 50, 75, 90];
        const forecast: DealForecast = {
            probability: probabilities[Math.floor(Math.random() * probabilities.length)],
            factors: {
                positive: ["Strong relationship with key decision-maker", "Deal value is within budget"],
                negative: ["Competitor also in evaluation", "Decision timeline is tight"],
            },
            nextBestAction: "Send a follow-up email with a relevant case study to reinforce value."
        };
        return new Response(JSON.stringify(forecast));
    }
    
    // --- TEMPLATES ---
    if (pathname === '/api/v1/email-templates' && method === 'GET') {
        return new Response(JSON.stringify(MOCK_EMAIL_TEMPLATES));
    }
     if (pathname === '/api/v1/email-templates' && method === 'POST') {
        const newTemplate = { ...body, id: `template_${Date.now()}` };
        MOCK_EMAIL_TEMPLATES.push(newTemplate);
        return new Response(JSON.stringify(newTemplate), { status: 201 });
    }

    // --- SETTINGS ---
    if (pathname.startsWith('/api/v1/industry-config/')) {
        const industry = pathname.split('/').pop() as keyof typeof industryConfigs;
        return new Response(JSON.stringify(industryConfigs[industry] || null));
    }
    if (pathname === '/api/v1/settings' && method === 'GET') {
        return new Response(JSON.stringify(MOCK_ORGANIZATION_SETTINGS));
    }
    if (pathname === '/api/v1/settings' && method === 'PUT') {
        Object.assign(MOCK_ORGANIZATION_SETTINGS, body);
        return new Response(JSON.stringify(MOCK_ORGANIZATION_SETTINGS));
    }
     if (pathname === '/api/v1/lead-scoring/recalculate-all' && method === 'POST') {
        recalculateAllScores(body.orgId);
        return new Response(JSON.stringify({ success: true }));
    }
    
    // --- WORKFLOWS ---
    if (pathname === '/api/v1/workflows' && method === 'GET') return new Response(JSON.stringify(MOCK_WORKFLOWS));
    if (pathname === '/api/v1/workflows' && method === 'POST') {
        const newWorkflow = { ...body, id: `wf_${Date.now()}` };
        MOCK_WORKFLOWS.push(newWorkflow);
        return new Response(JSON.stringify(newWorkflow), { status: 201 });
    }
    const workflowMatch = pathname.match(/^\/api\/v1\/workflows\/([\w_]+)$/);
    if (workflowMatch) {
        const [, id] = workflowMatch;
        const index = MOCK_WORKFLOWS.findIndex(w => w.id === id);
        if (index > -1 && method === 'PUT') {
            MOCK_WORKFLOWS[index] = { ...MOCK_WORKFLOWS[index], ...body };
            return new Response(JSON.stringify(MOCK_WORKFLOWS[index]));
        }
    }
    if (pathname === '/api/v1/advanced-workflows' && method === 'GET') return new Response(JSON.stringify(MOCK_ADVANCED_WORKFLOWS));
    if (pathname === '/api/v1/advanced-workflows' && method === 'POST') {
        const newWorkflow = { ...body, id: `adv_wf_${Date.now()}` };
        MOCK_ADVANCED_WORKFLOWS.push(newWorkflow);
        return new Response(JSON.stringify(newWorkflow), { status: 201 });
    }

    // --- API KEYS ---
    if (pathname === '/api/v1/api-keys' && method === 'GET') return new Response(JSON.stringify(MOCK_API_KEYS));
    if (pathname === '/api/v1/api-keys' && method === 'POST') {
        const newKey = { id: `key_${Date.now()}`, name: body.name, organizationId: body.orgId, keyPrefix: `vsk_live_${Math.random().toString(36).substring(2, 10)}`, createdAt: new Date().toISOString() };
        MOCK_API_KEYS.push(newKey);
        const secret = `vsk_live_${Math.random().toString(36).substring(2)}`;
        return new Response(JSON.stringify({ key: newKey, secret }));
    }
    
    // --- TICKETS ---
    if (pathname === '/api/v1/tickets' && method === 'GET') return new Response(JSON.stringify(MOCK_TICKETS));
    if (pathname === '/api/v1/tickets' && method === 'POST') {
        const newTicket = { ...body, id: `ticket_${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), replies: [] };
        MOCK_TICKETS.push(newTicket);
        return new Response(JSON.stringify(newTicket), { status: 201 });
    }
    const ticketRepliesMatch = pathname.match(/^\/api\/v1\/tickets\/([\w_]+)\/replies$/);
    if (ticketRepliesMatch && method === 'POST') {
        const [, ticketId] = ticketRepliesMatch;
        const ticketIndex = MOCK_TICKETS.findIndex(t => t.id === ticketId);
        if (ticketIndex > -1) {
            const newReply = { ...body.reply, id: `reply_${Date.now()}`, timestamp: new Date().toISOString() };
            MOCK_TICKETS[ticketIndex].replies.push(newReply);
            MOCK_TICKETS[ticketIndex].updatedAt = new Date().toISOString();
            return new Response(JSON.stringify(MOCK_TICKETS[ticketIndex]));
        }
         return new Response(JSON.stringify({ message: 'Ticket not found' }), { status: 404 });
    }

    // --- FORMS ---
    if (pathname === '/api/v1/forms' && method === 'GET') return new Response(JSON.stringify(MOCK_FORMS));
     if (pathname === '/api/v1/forms' && method === 'POST') {
        const newForm = { ...body, id: `form_${Date.now()}` };
        MOCK_FORMS.push(newForm);
        return new Response(JSON.stringify(newForm), { status: 201 });
    }
    const formMatch = pathname.match(/^\/api\/v1\/forms\/([\w_]+)$/);
    if(formMatch) {
        const [, id] = formMatch;
        const index = MOCK_FORMS.findIndex(f => f.id === id);
        if (index === -1) return new Response(JSON.stringify({ message: 'Form not found' }), { status: 404 });
        if (method === 'PUT') {
            MOCK_FORMS[index] = { ...MOCK_FORMS[index], ...body };
            return new Response(JSON.stringify(MOCK_FORMS[index]));
        }
        if(method === 'DELETE') {
             MOCK_FORMS.splice(index, 1);
             return new Response(null, { status: 204 });
        }
    }
    if (pathname === '/api/v1/forms/submit' && method === 'POST') {
        const { formId, submissionData, sessionId } = body;
        const form = MOCK_FORMS.find(f => f.id === formId);
        if (!form) return new Response(JSON.stringify({ message: 'Form not found' }), { status: 404 });

        const newContactData = {
            ...submissionData,
            contactName: submissionData.contactName || 'New Form Lead',
            email: submissionData.email || `form-lead-${Date.now()}@example.com`,
            organizationId: form.organizationId,
            status: 'Lead',
            leadSource: 'Web',
        } as Omit<AnyContact, 'id'>;

        const newContact = { ...newContactData, id: `contact_${Date.now()}`, createdAt: new Date().toISOString(), interactions: [], orders: [], transactions: [], auditLogs: [] } as AnyContact;
        
        const formInteraction: Interaction = {
            id: `int_form_${Date.now()}`,
            organizationId: form.organizationId,
            contactId: newContact.id,
            userId: 'system',
            type: 'Form Submission',
            date: new Date().toISOString(),
            notes: `Submitted form: "${form.name}"\nData: ${JSON.stringify(submissionData)}`,
        };
        newContact.interactions!.push(formInteraction);

        // If a session was tracked, associate it with the new contact.
        if (sessionId) {
            const sessionIndex = MOCK_ANONYMOUS_SESSIONS.findIndex(s => s.id === sessionId);
            if (sessionIndex > -1) {
                const session = MOCK_ANONYMOUS_SESSIONS[sessionIndex];
                session.pageviews.forEach((pv: any) => {
                    newContact.interactions!.push({
                        id: `int_pv_${Date.now()}_${Math.random()}`,
                        organizationId: form.organizationId,
                        contactId: newContact.id,
                        userId: 'system',
                        type: 'Site Visit',
                        date: pv.timestamp,
                        notes: `Viewed page: ${pv.url}`,
                    });
                });
                MOCK_ANONYMOUS_SESSIONS.splice(sessionIndex, 1);
            }
        }

        MOCK_CONTACTS_MUTABLE.push(newContact);
        form.submissions++;
        
        if (form.actions.enrollInCampaignId) {
            const enrollment: CampaignEnrollment = {
                campaignId: form.actions.enrollInCampaignId,
                contactId: newContact.id,
                currentNodeId: '1', // Start of journey
                waitUntil: new Date().toISOString(),
            };
            if(!newContact.campaignEnrollments) newContact.campaignEnrollments = [];
            newContact.campaignEnrollments.push(enrollment);
            const campaignToUpdate = MOCK_CAMPAIGNS.find(c => c.id === form.actions.enrollInCampaignId);
            if(campaignToUpdate) campaignToUpdate.stats.recipients++;
        }

        return new Response(JSON.stringify(newContact));
    }


    // --- CAMPAIGNS & LANDING PAGES ---
    if (pathname === '/api/v1/campaigns' && method === 'GET') return new Response(JSON.stringify(MOCK_CAMPAIGNS));
     if (pathname === '/api/v1/campaigns' && method === 'POST') {
        const newCampaign = { ...body, id: `camp_${Date.now()}` };
        MOCK_CAMPAIGNS.push(newCampaign);
        return new Response(JSON.stringify(newCampaign), { status: 201 });
    }
    const launchMatch = pathname.match(/^\/api\/v1\/campaigns\/([\w_]+)\/launch$/);
    if(launchMatch && method === 'POST') {
        const [, campaignId] = launchMatch;
        campaignService.enrollContacts(campaignId);
        return new Response(JSON.stringify({ success: true }));
    }
    if(pathname === '/api/v1/scheduler/advance-day' && method === 'POST') {
        const { currentDate } = body;
        const newDate = new Date(new Date(currentDate).getTime() + 24 * 60 * 60 * 1000); // Advance by one full day
        campaignSchedulerService.processScheduledCampaigns(newDate);
        return new Response(JSON.stringify(newDate.toISOString()));
    }
    if (pathname === '/api/v1/landing-pages' && method === 'GET') return new Response(JSON.stringify(MOCK_LANDING_PAGES));
    if (pathname === '/api/v1/landing-pages' && method === 'POST') {
        const newPage = { ...body, id: `lp_${Date.now()}` };
        MOCK_LANDING_PAGES.push(newPage);
        return new Response(JSON.stringify(newPage), { status: 201 });
    }
    const publicLPMatch = pathname.match(/^\/api\/v1\/public\/landing-pages\/([\w-]+)$/);
    if(publicLPMatch && method === 'GET') {
        const [, slug] = publicLPMatch;
        const page = MOCK_LANDING_PAGES.find(p => p.slug === slug && p.status === 'Published');
        return new Response(JSON.stringify(page || null));
    }
    const landingPageMatch = pathname.match(/^\/api\/v1\/landing-pages\/([\w_]+)$/);
    if (landingPageMatch) {
        const [, id] = landingPageMatch;
        const index = MOCK_LANDING_PAGES.findIndex(p => p.id === id);
        if (index === -1) return new Response(JSON.stringify({ message: 'Landing Page not found' }), { status: 404 });
        
        if (method === 'PUT') {
            MOCK_LANDING_PAGES[index] = { ...MOCK_LANDING_PAGES[index], ...body };
            return new Response(JSON.stringify(MOCK_LANDING_PAGES[index]));
        }
        if (method === 'DELETE') {
            MOCK_LANDING_PAGES.splice(index, 1);
            return new Response(null, { status: 204 });
        }
    }
    
    // --- CUSTOM REPORTS ---
    if(pathname === '/api/v1/reports/custom' && method === 'GET') return new Response(JSON.stringify(MOCK_CUSTOM_REPORTS));
    if (pathname === '/api/v1/reports/custom' && method === 'POST') {
        const newReport = { ...body, id: `report_${Date.now()}` };
        MOCK_CUSTOM_REPORTS.push(newReport);
        return new Response(JSON.stringify(newReport), { status: 201 });
    }
     const customReportMatch = pathname.match(/^\/api\/v1\/reports\/custom\/([\w_]+)$/);
    if (customReportMatch) {
        const [, id] = customReportMatch;
        if(method === 'DELETE') {
            const index = MOCK_CUSTOM_REPORTS.findIndex(r => r.id === id);
            if(index > -1) MOCK_CUSTOM_REPORTS.splice(index, 1);
             const widgetIndex = MOCK_DASHBOARD_WIDGETS.findIndex(w => w.reportId === id);
             if (widgetIndex > -1) MOCK_DASHBOARD_WIDGETS.splice(widgetIndex, 1);
            return new Response(null, { status: 204 });
        }
    }
    if(pathname === '/api/v1/reports/custom/generate' && method === 'POST') {
        const { config, orgId } = body;
        let data: AnyContact[] | any[] = [];
        if (config.dataSource === 'contacts') data = MOCK_CONTACTS_MUTABLE;
        if (config.dataSource === 'products') data = MOCK_PRODUCTS;

        const filteredData = data.filter(item => {
            return (config.filters || []).every((filter: any) => {
                const itemValue = String(item[filter.field] || '').toLowerCase();
                const filterValue = String(filter.value).toLowerCase();
                if (filter.operator === 'contains') return itemValue.includes(filterValue);
                if (filter.operator === 'is') return itemValue === filterValue;
                return true;
            });
        });

        const result = filteredData.map(item => {
            const row: Record<string, any> = {};
            (config.columns || []).forEach((col: string) => {
                row[col] = item[col];
            });
            return row;
        });

        return new Response(JSON.stringify(result));
    }

    // --- WIDGETS ---
    if (pathname === '/api/v1/dashboard/widgets' && method === 'GET') return new Response(JSON.stringify(MOCK_DASHBOARD_WIDGETS));
    if (pathname === '/api/v1/dashboard/widgets' && method === 'POST') {
        // FIX: Added missing widgetId to align with the DashboardWidget type.
        const newWidget: DashboardWidget = {
            id: `widget_${Date.now()}`,
            widgetId: `report-widget-${body.reportId}`,
            organizationId: body.organizationId || 'org_1',
            reportId: body.reportId
        };
        MOCK_DASHBOARD_WIDGETS.push(newWidget);
        return new Response(JSON.stringify(newWidget), { status: 201 });
    }

    // --- DOCUMENTS ---
    if (pathname === '/api/v1/documents' && method === 'GET') {
        const contactId = searchParams.get('contactId');
        return new Response(JSON.stringify(MOCK_DOCUMENTS.filter(d => d.contactId === contactId)));
    }
    if (pathname === '/api/v1/documents' && method === 'POST') {
        const newDoc = { ...body, id: `doc_${Date.now()}`, uploadDate: new Date().toISOString() };
        MOCK_DOCUMENTS.push(newDoc);
        return new Response(JSON.stringify(newDoc));
    }

    // --- TRACKING ---
    if (pathname === '/api/v1/tracking/pageview' && method === 'POST') {
        const { sessionId, orgId, url } = body;
        const sessionIndex = MOCK_ANONYMOUS_SESSIONS.findIndex(s => s.id === sessionId);
        if (sessionIndex > -1) {
            MOCK_ANONYMOUS_SESSIONS[sessionIndex].lastSeen = new Date().toISOString();
            MOCK_ANONYMOUS_SESSIONS[sessionIndex].pageviews.push({ url, timestamp: new Date().toISOString() });
        } else {
            const newSession: AnonymousSession = {
                id: sessionId,
                organizationId: orgId,
                firstSeen: new Date().toISOString(),
                lastSeen: new Date().toISOString(),
                pageviews: [{ url, timestamp: new Date().toISOString() }]
            };
            MOCK_ANONYMOUS_SESSIONS.push(newSession);
        }
        return new Response(JSON.stringify({ success: true }));
    }

    // --- CUSTOM OBJECTS ---
    if (pathname === '/api/v1/custom-object-definitions' && method === 'GET') return new Response(JSON.stringify(MOCK_CUSTOM_OBJECT_DEFINITIONS));
    if (pathname === '/api/v1/custom-object-definitions' && method === 'POST') {
        const newDef = { ...body, id: `def_${Date.now()}` };
        MOCK_CUSTOM_OBJECT_DEFINITIONS.push(newDef);
        return new Response(JSON.stringify(newDef), { status: 201 });
    }
     const customObjectDefMatch = pathname.match(/^\/api\/v1\/custom-object-definitions\/([\w_]+)$/);
    if(customObjectDefMatch) {
        const [, id] = customObjectDefMatch;
        const index = MOCK_CUSTOM_OBJECT_DEFINITIONS.findIndex(d => d.id === id);
        if(index === -1) return new Response(JSON.stringify({ message: 'Definition not found' }), { status: 404 });
        if(method === 'PUT') {
            MOCK_CUSTOM_OBJECT_DEFINITIONS[index] = { ...MOCK_CUSTOM_OBJECT_DEFINITIONS[index], ...body };
            return new Response(JSON.stringify(MOCK_CUSTOM_OBJECT_DEFINITIONS[index]));
        }
    }
    if (pathname === '/api/v1/custom-object-records' && method === 'GET') {
        const defId = searchParams.get('defId');
        return new Response(JSON.stringify(MOCK_CUSTOM_OBJECT_RECORDS.filter(r => r.objectDefId === defId)));
    }
    if (pathname === '/api/v1/custom-object-records' && method === 'POST') {
        const newRecord = { ...body, id: `rec_${Date.now()}` };
        MOCK_CUSTOM_OBJECT_RECORDS.push(newRecord);
        return new Response(JSON.stringify(newRecord), { status: 201 });
    }

    // --- MARKETPLACE ---
    if (pathname === '/api/v1/marketplace/apps') return new Response(JSON.stringify(MOCK_APP_MARKETPLACE_ITEMS));
    if (pathname === '/api/v1/marketplace/installed') return new Response(JSON.stringify(MOCK_INSTALLED_APPS));
    if (pathname === '/api/v1/marketplace/install' && method === 'POST') {
        const { appId } = body;
        const existing = MOCK_INSTALLED_APPS.find(a => a.appId === appId);
        if (existing) return new Response(JSON.stringify(existing));
        const newInstall = { id: `install_${Date.now()}`, organizationId: 'org_1', appId, installedAt: new Date().toISOString() };
        MOCK_INSTALLED_APPS.push(newInstall);
        return new Response(JSON.stringify(newInstall), { status: 201 });
    }
    
    // --- INTEGRATIONS ---
    if (pathname === '/api/v1/integrations/email/sync' && method === 'POST') {
        const syncInteraction = {
            id: `int_sync_${Date.now()}`,
            organizationId: 'org_1',
            contactId: 'contact_2',
            userId: 'user_admin_1',
            type: 'Email',
            date: new Date().toISOString(),
            notes: `(Synced via Email Integration)\nSubject: Re: Project Proposal\n\nHi Alice,\nThanks for sending that over. Let's connect next week.`
        } as Interaction;
        const contactIndex = MOCK_CONTACTS_MUTABLE.findIndex(c => c.id === syncInteraction.contactId);
        if (contactIndex > -1) {
            MOCK_CONTACTS_MUTABLE[contactIndex].interactions?.unshift(syncInteraction);
        }
        return new Response(JSON.stringify({ success: true }));
    }


    // Fallback for unhandled routes
    console.error(`[Mock API] Mock handler for ${method} ${pathname} not found.`);
    return new Response(JSON.stringify({ message: `Mock API endpoint not found: ${method} ${pathname}` }), { status: 404 });
};

export function startMockServer() {
  setFetchImplementation((url, config) => {
    const urlObject = new URL(url.toString(), window.location.origin);
    // Add a small delay to simulate network latency
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(router(urlObject, config || {}));
        }, 300);
    });
  });
}
