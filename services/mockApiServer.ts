import { setFetchImplementation } from './apiClient';
import { 
    MOCK_ORGANIZATIONS, MOCK_USERS, MOCK_ROLES, MOCK_CONTACTS_MUTABLE,
    MOCK_INTERACTIONS, MOCK_PRODUCTS, MOCK_DEALS, MOCK_DEAL_STAGES, MOCK_TASKS,
    MOCK_CALENDAR_EVENTS, MOCK_EMAIL_TEMPLATES, MOCK_WORKFLOWS,
    MOCK_ORGANIZATION_SETTINGS, MOCK_API_KEYS, MOCK_TICKETS, MOCK_FORMS, MOCK_CAMPAIGNS,
    MOCK_LANDING_PAGES, MOCK_DOCUMENTS, MOCK_CUSTOM_REPORTS, MOCK_DASHBOARD_WIDGETS,
    MOCK_SUPPLIERS, MOCK_WAREHOUSES, MOCK_CUSTOM_OBJECT_DEFINITIONS, MOCK_CUSTOM_OBJECT_RECORDS,
    MOCK_ANONYMOUS_SESSIONS, MOCK_APP_MARKETPLACE_ITEMS, MOCK_INSTALLED_APPS, MOCK_SANDBOXES, MOCK_DOCUMENT_TEMPLATES,
    MOCK_PROJECTS, MOCK_PROJECT_PHASES, MOCK_PROJECT_TEMPLATES, MOCK_CANNED_RESPONSES,
    MOCK_SURVEYS, MOCK_SURVEY_RESPONSES, MOCK_DASHBOARDS, MOCK_SNAPSHOTS, MOCK_TEAM_CHANNELS, MOCK_TEAM_CHAT_MESSAGES, MOCK_CLIENT_CHECKLIST_TEMPLATES,
    MOCK_SUBSCRIPTION_PLANS,
    MOCK_SYSTEM_AUDIT_LOGS,
    MOCK_AUDIENCE_PROFILES
} from './mockData';
import { industryConfigs } from '../config/industryConfig';
import { generateDashboardData } from './reportGenerator';
import { checkAndTriggerWorkflows } from './workflowService';
import { recalculateScoreForContact } from './leadScoringService';
import { campaignService } from './campaignService';
import { campaignSchedulerService } from './campaignSchedulerService';
import { Sandbox, Conversation, CannedResponse, Interaction, Survey, SurveyResponse, Snapshot, TeamChannel, TeamChatMessage, Notification, ClientChecklist, SubscriptionPlan, Relationship, AudienceProfile, AnyContact, Deal, DealStage } from '../types';
import { GoogleGenAI, Type } from '@google/genai';

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
    documentTemplates: MOCK_DOCUMENT_TEMPLATES,
    workflows: MOCK_WORKFLOWS,
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
    sandboxes: MOCK_SANDBOXES,
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

    // Add a mock LinkedIn message for inbox demonstration
    const linkedInMessage: Interaction = {
       id: 'int_li_1',
       organizationId: 'org_1',
       contactId: 'contact_2',
       userId: 'user_team_1',
       type: 'LinkedIn Message',
       date: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
       notes: 'Hey Jane, saw your post on AI in finance. Great insights! I\'d love to chat more about how VersaCRM is using predictive analytics.',
    };
    if (!db.interactions.some(i => i.id === 'int_li_1')) {
        db.interactions.unshift(linkedInMessage);
    }
    
    // Add a mock X message for inbox demonstration
    const xMessage: Interaction = {
       id: 'int_x_1',
       organizationId: 'org_1',
       contactId: 'contact_1',
       userId: 'user_team_1',
       type: 'X Message',
       date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
       notes: 'Thanks for following up! Can you send the details to john.patient@example.com?',
    };
    if (!db.interactions.some(i => i.id === 'int_x_1')) {
        db.interactions.unshift(xMessage);
    }

    // --- SETTINGS ---
    if (path.endsWith('/settings')) {
        if (method === 'GET') {
            return respond(db.settings);
        }
        if (method === 'PUT') {
            // Check for AI model training request
            if (body.aiLeadScoringModel?.status === 'training') {
                db.settings.aiLeadScoringModel = { ...db.settings.aiLeadScoringModel, status: 'training' };
                
                // Simulate async AI training
                setTimeout(async () => {
                    try {
                        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
                        const contacts = db.contacts;
                        const deals = db.deals;
                        const dealStages = db.dealStages;
                        
                        const wonStageId = dealStages.find(s => s.name.toLowerCase().includes('won'))?.id;
                        const lostStageId = dealStages.find(s => s.name.toLowerCase().includes('lost'))?.id;

                        const getContactDataForDeal = (deal: Deal) => {
                            const contact = contacts.find(c => c.id === deal.contactId);
                            if (!contact) return null;
                            return { leadSource: contact.leadSource };
                        };
                        
                        const wonDealsData = deals.filter(d => d.stageId === wonStageId).map(getContactDataForDeal).filter(Boolean);
                        const lostDealsData = deals.filter(d => d.stageId === lostStageId).map(getContactDataForDeal).filter(Boolean);

                        const prompt = `Analyze this CRM data of won vs. lost deals. Based on the contact properties, identify the top 2-3 single-word positive factors (attributes common in won deals) and top 2-3 single-word negative factors (attributes common in lost deals). These factors should correspond to values in the data (e.g., 'Referral', 'Web').

Won Deals' Contact Data: ${JSON.stringify(wonDealsData.slice(0, 10))}
Lost Deals' Contact Data: ${JSON.stringify(lostDealsData.slice(0, 10))}

Respond with a JSON object containing 'positiveFactors' and 'negativeFactors', each being an array of short, single-word strings.`;

                        const response = await ai.models.generateContent({
                            model: 'gemini-2.5-flash',
                            contents: prompt,
                            config: {
                                responseMimeType: "application/json",
                                responseSchema: {
                                    type: Type.OBJECT,
                                    properties: {
                                        positiveFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
                                        negativeFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    }
                                }
                            }
                        });

                        const newModel = {
                            status: 'trained' as const,
                            lastTrained: new Date().toISOString(),
                            ...JSON.parse(response.text)
                        };
                        db.settings.aiLeadScoringModel = newModel;
                        console.log('[Mock AI] Model training complete:', newModel);
                    } catch (e) {
                        console.error('[Mock AI] Model training failed:', e);
                        db.settings.aiLeadScoringModel = { ...db.settings.aiLeadScoringModel, status: 'not_trained' };
                    }
                }, 5000); // 5 second training simulation

                return respond(db.settings);
            }

            db.settings = { ...db.settings, ...body };
            return respond(db.settings);
        }
    }


    // --- SUBSCRIPTIONS ---
    if (path.startsWith('/api/v1/subscriptions/plans')) {
        const planId = path.split('/').pop();
        if (method === 'GET') {
            const orgId = searchParams.get('orgId');
            return respond(db.subscriptionPlans.filter(p => p.organizationId === orgId));
        }
        if (method === 'POST') {
            const newPlan: SubscriptionPlan = { ...body, id: `plan_${Date.now()}` };
            db.subscriptionPlans.push(newPlan);
            return respond(newPlan, 201);
        }
        if (method === 'PUT' && planId) {
            const index = db.subscriptionPlans.findIndex(p => p.id === planId);
            if (index > -1) {
                db.subscriptionPlans[index] = { ...db.subscriptionPlans[index], ...body };
                return respond(db.subscriptionPlans[index]);
            }
            return respond({ message: 'Not found' }, 404);
        }
        if (method === 'DELETE' && planId) {
            db.subscriptionPlans = db.subscriptionPlans.filter(p => p.id !== planId);
            return respond(null, 204);
        }
    }


    // --- CANNED RESPONSES ---
    if (path.startsWith('/api/v1/canned-responses')) {
        const responseId = path.split('/')[4];
        if (method === 'GET') {
            const orgId = searchParams.get('orgId');
            return respond(db.cannedResponses.filter(cr => cr.organizationId === orgId));
        }
        if (method === 'POST') {
            const newResponse: CannedResponse = { ...body, id: `cr_${Date.now()}` };
            db.cannedResponses.push(newResponse);
            return respond(newResponse, 201);
        }
        if (method === 'PUT' && responseId) {
            const index = db.cannedResponses.findIndex(cr => cr.id === responseId);
            if (index > -1) {
                db.cannedResponses[index] = { ...db.cannedResponses[index], ...body };
                return respond(db.cannedResponses[index]);
            }
            return respond({ message: 'Not found' }, 404);
        }
        if (method === 'DELETE' && responseId) {
            db.cannedResponses = db.cannedResponses.filter(cr => cr.id !== responseId);
            return respond(null, 204);
        }
    }
    
    // --- SURVEYS ---
     if (path.startsWith('/api/v1/survey-responses')) {
        if (method === 'GET') {
            const orgId = searchParams.get('orgId');
            const orgSurveys = db.surveys.filter(s => s.organizationId === orgId).map(s => s.id);
            const responses = db.surveyResponses.filter(r => orgSurveys.includes(r.surveyId));
            return respond(responses);
        }
    }

    if (path.startsWith('/api/v1/public/surveys/respond')) {
        if (method === 'POST') {
            const newResponse: SurveyResponse = {
                id: `resp_${Date.now()}`,
                contactId: 'contact_public', // Placeholder for public responses
                respondedAt: new Date().toISOString(),
                ...body
            };
            db.surveyResponses.push(newResponse);
            return respond(null, 204);
        }
    }

    if (path.startsWith('/api/v1/public/surveys/')) {
        const surveyId = path.split('/').pop();
        if (method === 'GET' && surveyId) {
            const survey = db.surveys.find(s => s.id === surveyId);
            return survey ? respond(survey) : respond({ message: 'Survey not found' }, 404);
        }
    }

    if (path.startsWith('/api/v1/surveys')) {
        const surveyId = path.split('/')[4];
        if (method === 'GET') {
            const orgId = searchParams.get('orgId');
            return respond(db.surveys.filter(s => s.organizationId === orgId));
        }
        if (method === 'POST') {
            const newSurvey: Survey = { ...body, id: `survey_${Date.now()}`, createdAt: new Date().toISOString() };
            db.surveys.push(newSurvey);
            return respond(newSurvey, 201);
        }
        if (method === 'PUT' && surveyId) {
            const index = db.surveys.findIndex(s => s.id === surveyId);
            if (index > -1) {
                db.surveys[index] = { ...db.surveys[index], ...body };
                return respond(db.surveys[index]);
            }
            return respond({ message: 'Not found' }, 404);
        }
        if (method === 'DELETE' && surveyId) {
            db.surveys = db.surveys.filter(s => s.id !== surveyId);
            return respond(null, 204);
        }
    }

    // --- SNAPSHOTS ---
    if (path.startsWith('/api/v1/snapshots')) {
        const snapshotId = path.split('/')[4];
        if (method === 'GET') {
            const orgId = searchParams.get('orgId');
            return respond(db.snapshots.filter(s => s.organizationId === orgId));
        }
        if (method === 'POST') {
            const { orgId, name, dataSource } = body;
            const dataToSnapshot = (db as any)[dataSource] || [];
            const newSnapshot: Snapshot = {
                id: `snap_${Date.now()}`,
                organizationId: orgId,
                name,
                dataSource,
                createdAt: new Date().toISOString(),
                data: JSON.stringify(dataToSnapshot),
            };
            db.snapshots.push(newSnapshot);
            return respond(newSnapshot, 201);
        }
        if (method === 'DELETE' && snapshotId) {
            db.snapshots = db.snapshots.filter(s => s.id !== snapshotId);
            return respond(null, 204);
        }
    }

    // --- AUDIENCE PROFILES ---
    if (path.startsWith('/api/v1/audience-profiles')) {
        const profileId = path.split('/')[4];
        if (method === 'GET') {
            const orgId = searchParams.get('orgId');
            return respond(db.audienceProfiles.filter(p => p.organizationId === orgId));
        }
        if (method === 'POST') {
            const newProfile: AudienceProfile = { ...body, id: `prof_${Date.now()}` };
            db.audienceProfiles.push(newProfile);
            return respond(newProfile, 201);
        }
        if (method === 'PUT' && profileId) {
            const index = db.audienceProfiles.findIndex(p => p.id === profileId);
            if (index > -1) {
                db.audienceProfiles[index] = { ...db.audienceProfiles[index], ...body };
                return respond(db.audienceProfiles[index]);
            }
            return respond({ message: 'Not found' }, 404);
        }
        if (method === 'DELETE' && profileId) {
            db.audienceProfiles = db.audienceProfiles.filter(p => p.id !== profileId);
            return respond(null, 204);
        }
    }

    // --- TEAM CHAT ---
    if (path.startsWith('/api/v1/team-channels')) {
        const parts = path.split('/');
        const channelId = parts[4];
        
        if (channelId && path.includes('/messages')) {
            if (method === 'GET') {
                return respond(MOCK_TEAM_CHAT_MESSAGES.filter(m => m.channelId === channelId));
            }
            if (method === 'POST') {
                const newMessage: TeamChatMessage = {
                    id: `msg_${Date.now()}`,
                    channelId: channelId,
                    userId: body.userId,
                    message: body.message,
                    threadId: body.threadId,
                    timestamp: new Date().toISOString(),
                };
                MOCK_TEAM_CHAT_MESSAGES.push(newMessage);
                
                // Generate notifications for @mentions
                const notifications: Notification[] = [];
                const mentionRegex = /@([A-Za-z\s]+)/g;
                let match;
                const sender = db.users.find(u => u.id === body.userId);
                const channel = MOCK_TEAM_CHANNELS.find(c => c.id === channelId);

                while ((match = mentionRegex.exec(body.message)) !== null) {
                    const mentionedName = match[1].trim();
                    const mentionedUser = db.users.find(u => u.name === mentionedName && u.id !== body.userId);

                    if (mentionedUser && sender && channel) {
                        const newNotification: Notification = {
                            id: `notif_${Date.now()}_${Math.random()}`,
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

                return respond({ message: newMessage, notifications }, 201);
            }
        }

        if (channelId && path.includes('/members')) {
            if (method === 'PUT') {
                const index = MOCK_TEAM_CHANNELS.findIndex(c => c.id === channelId);
                if (index > -1) {
                    MOCK_TEAM_CHANNELS[index].memberIds = body.memberIds;
                    return respond(MOCK_TEAM_CHANNELS[index]);
                }
                return respond({ message: 'Channel not found'}, 404);
            }
        }

        if (method === 'GET') {
            const orgId = searchParams.get('orgId');
            return respond(MOCK_TEAM_CHANNELS.filter(c => c.organizationId === orgId));
        }

        if (method === 'POST') {
            const newChannel: TeamChannel = {
                ...body,
                id: `chan_${Date.now()}`,
                memberIds: body.isPrivate ? [body.memberIds[0]] : MOCK_USERS.filter(u => u.organizationId === body.organizationId && !u.isClient).map(u => u.id), // Add creator or all members
            };
            MOCK_TEAM_CHANNELS.push(newChannel);
            return respond(newChannel, 201);
        }
    }


    // --- INBOX ---
    if (path.startsWith('/api/v1/inbox')) {
        if (path.endsWith('/new') && method === 'POST') {
            const { contactId, userId, subject, body: newBody } = body;
            const newInteraction = {
                id: `int_${Date.now()}`,
                organizationId: 'org_1', // Hardcoded for demo
                contactId,
                userId,
                type: 'Email' as const,
                date: new Date().toISOString(),
                notes: `Subject: ${subject}\n\n${newBody}`,
            };

            db.interactions.unshift(newInteraction);
            const contactIndex = db.contacts.findIndex(c => c.id === contactId);
            if (contactIndex > -1) {
                if (!db.contacts[contactIndex].interactions) {
                    db.contacts[contactIndex].interactions = [];
                }
                db.contacts[contactIndex].interactions!.unshift(newInteraction);
            }
            return respond(newInteraction, 201);
        }

        if (path.endsWith('/reply') && method === 'POST') {
            const { contactId, userId, subject, body: replyBody } = body;
            const newInteraction = {
                id: `int_${Date.now()}`,
                organizationId: 'org_1', // Hardcoded for demo
                contactId,
                userId,
                type: 'Email' as const,
                date: new Date().toISOString(),
                notes: `Subject: Re: ${subject}\n\n${replyBody}`,
            };

            db.interactions.unshift(newInteraction);
            const contactIndex = db.contacts.findIndex(c => c.id === contactId);
            if (contactIndex > -1) {
                if (!db.contacts[contactIndex].interactions) {
                    db.contacts[contactIndex].interactions = [];
                }
                db.contacts[contactIndex].interactions!.unshift(newInteraction);
            }
            return respond(newInteraction, 201);
        }

        if (method === 'GET') {
            const orgId = searchParams.get('orgId');
            const messages = db.interactions.filter(i => i.organizationId === orgId && (i.type === 'Email' || i.type === 'LinkedIn Message' || i.type === 'X Message'));
            
            const threads: Record<string, Conversation> = {};

            for (const msg of messages) {
                let subject = '';
                let threadId = '';
                let channel: 'Email' | 'LinkedIn' | 'X' = 'Email';

                if (msg.type === 'Email') {
                    const subjectMatch = msg.notes.match(/Subject: (.*)/);
                    subject = (subjectMatch ? subjectMatch[1] : 'No Subject').replace(/^(Re: |Fwd: )/i, '').trim();
                    threadId = `${msg.contactId}-${subject}`;
                    channel = 'Email';
                } else if (msg.type === 'LinkedIn Message') {
                    subject = `LinkedIn Conversation`;
                    threadId = `li-${msg.contactId}`;
                    channel = 'LinkedIn';
                } else if (msg.type === 'X Message') {
                    subject = `X (Twitter) Conversation`;
                    threadId = `x-${msg.contactId}`;
                    channel = 'X';
                }

                if (!threadId) continue;

                const contact = db.contacts.find(c => c.id === msg.contactId);
                const user = db.users.find(u => u.id === msg.userId);

                if (!threads[threadId]) {
                     if (!contact || !user) continue;
                     threads[threadId] = {
                        id: threadId,
                        contactId: contact.id,
                        subject: subject,
                        channel: channel,
                        lastMessageTimestamp: '1970-01-01T00:00:00.000Z',
                        lastMessageSnippet: '',
                        messages: [],
                        participants: [
                            { id: contact.id, name: contact.contactName, email: contact.email },
                            { id: user.id, name: user.name, email: user.email }
                        ]
                    };
                }

                const message = {
                    id: msg.id,
                    senderId: msg.userId,
                    body: msg.notes,
                    timestamp: msg.date
                };
                threads[threadId].messages.push(message);

                if (new Date(msg.date) > new Date(threads[threadId].lastMessageTimestamp)) {
                    threads[threadId].lastMessageTimestamp = msg.date;
                    threads[threadId].lastMessageSnippet = msg.notes.split('\n\n')[1] || msg.notes;
                }
            }
            
            const conversations = Object.values(threads).sort((a, b) => new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime());
            return respond(conversations);
        }
    }


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
        const contactId = path.split('/')[4];

        if (contactId && path.includes('/relationships')) {
            const relatedContactId = path.split('/')[6];

            if (method === 'POST') {
                const { relatedContactId: newRelId, relationshipType } = body;

                const contact1Index = db.contacts.findIndex(c => c.id === contactId);
                const contact2Index = db.contacts.findIndex(c => c.id === newRelId);

                if (contact1Index > -1 && contact2Index > -1) {
                    const contact1 = db.contacts[contact1Index];
                    const contact2 = db.contacts[contact2Index];

                    if (!contact1.relationships) contact1.relationships = [];
                    if (!contact2.relationships) contact2.relationships = [];

                    // Add to both contacts for reciprocity
                    if (!contact1.relationships.some(r => r.relatedContactId === newRelId)) {
                        contact1.relationships.push({ relatedContactId: newRelId, relationshipType });
                    }
                    if (!contact2.relationships.some(r => r.relatedContactId === contactId)) {
                        contact2.relationships.push({ relatedContactId: contactId, relationshipType });
                    }
                    return respond(contact1);
                }
                return respond({ message: 'One or both contacts not found' }, 404);
            }
            if (method === 'DELETE') {
                const contact1Index = db.contacts.findIndex(c => c.id === contactId);
                const contact2Index = db.contacts.findIndex(c => c.id === relatedContactId);

                if (contact1Index > -1) {
                    db.contacts[contact1Index].relationships = (db.contacts[contact1Index].relationships || []).filter(r => r.relatedContactId !== relatedContactId);
                }
                 if (contact2Index > -1) {
                    db.contacts[contact2Index].relationships = (db.contacts[contact2Index].relationships || []).filter(r => r.relatedContactId !== contactId);
                }
                return respond(db.contacts[contact1Index] || null);
            }
        }

        if (path.includes('/subscribe')) {
            const index = db.contacts.findIndex(c => c.id === contactId);
            if (index > -1) {
                const plan = db.subscriptionPlans.find(p => p.id === body.planId);
                if (plan) {
                    const newSub = {
                        id: `sub_${Date.now()}`,
                        planId: body.planId,
                        status: 'active' as const,
                        startDate: new Date().toISOString(),
                        nextBillingDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
                    };
                    if (!db.contacts[index].subscriptions) {
                        db.contacts[index].subscriptions = [];
                    }
                    db.contacts[index].subscriptions!.push(newSub);
                    return respond(db.contacts[index]);
                }
            }
            return respond({ message: 'Contact not found' }, 404);
        }
        if (contactId && path.includes('/subscriptions')) {
            const subId = path.split('/')[6];
            const index = db.contacts.findIndex(c => c.id === contactId);
            if (index > -1) {
                const contact = db.contacts[index];
                if (contact.subscriptions) {
                    const subIndex = contact.subscriptions.findIndex(s => s.id === subId);
                    if (subIndex > -1) {
                        if (path.endsWith('/pay')) {
                            contact.subscriptions[subIndex].nextBillingDate = new Date(new Date(contact.subscriptions[subIndex].nextBillingDate).setMonth(new Date(contact.subscriptions[subIndex].nextBillingDate).getMonth() + 1)).toISOString();
                        } else { // Cancel
                            contact.subscriptions[subIndex].status = 'cancelled';
                        }
                        return respond(contact);
                    }
                }
            }
            return respond({ message: 'Subscription not found' }, 404);
        }

        if (path.includes('churn-prediction')) return respond({ contactId: 'contact_1', risk: 'Medium', factors: { positive: ['Frequent logins'], negative: ['No recent purchases'] }, nextBestAction: 'Send a follow-up email with a special offer.' });
        if (path.includes('next-best-action')) return respond({ contactId: 'contact_1', action: 'Email', reason: 'Contact has a high lead score but no recent interactions.', templateId: 'template_2'});

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
            if (defId) {
                return respond(db.customObjectRecords.filter(r => r.objectDefId === defId));
            }
            return respond(db.customObjectRecords);
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

    // --- DOCUMENT TEMPLATES ---
    if (path.startsWith('/api/v1/document-templates')) {
        const templateId = path.split('/')[4];

        if (templateId && path.includes('/permissions')) {
            if (method === 'PUT') {
                const index = db.documentTemplates.findIndex(t => t.id === templateId);
                if (index > -1) {
                    db.documentTemplates[index].permissions = body.permissions;
                    return respond(db.documentTemplates[index]);
                }
                return respond({ message: 'Not found' }, 404);
            }
        }

        if (templateId) {
            if (method === 'PUT') {
                const index = db.documentTemplates.findIndex(t => t.id === templateId);
                if (index > -1) {
                    db.documentTemplates[index] = { ...db.documentTemplates[index], ...body };
                    return respond(db.documentTemplates[index]);
                }
            }
            if (method === 'DELETE') {
                db.documentTemplates = db.documentTemplates.filter(t => t.id !== templateId);
                return respond(null, 204);
            }
        }
        
        if (method === 'GET') {
            const orgId = searchParams.get('orgId');
            return respond(db.documentTemplates.filter(t => t.organizationId === orgId));
        }
        if (method === 'POST') {
            const newTemplate = { ...body, id: `dt_${Date.now()}` };
            db.documentTemplates.push(newTemplate);
            return respond(newTemplate);
        }
    }

    // --- PROJECTS ---
    if (path.startsWith('/api/v1/projects')) {
        const projectId = path.split('/')[4];

        if (projectId && path.includes('/assign-checklist')) {
            const { templateId } = body;
            const projectIndex = db.projects.findIndex(p => p.id === projectId);
            const template = db.clientChecklistTemplates.find(t => t.id === templateId);
            if (projectIndex > -1 && template) {
                const newChecklist: ClientChecklist = {
                    id: `cl_${Date.now()}`,
                    projectId,
                    templateId,
                    name: template.name,
                    items: template.items.map(item => ({...item, id: `cli_${Date.now()}_${Math.random()}`, isCompleted: false }))
                };
                if (!db.projects[projectIndex].checklists) {
                    db.projects[projectIndex].checklists = [];
                }
                db.projects[projectIndex].checklists!.push(newChecklist);
                return respond(db.projects[projectIndex]);
            }
            return respond({ message: 'Project or template not found' }, 404);
        }

        if (projectId && path.includes('/update-checklist')) {
            const { checklist } = body;
            const projectIndex = db.projects.findIndex(p => p.id === projectId);
            if (projectIndex > -1) {
                const project = db.projects[projectIndex];
                if (project.checklists) {
                    const checklistIndex = project.checklists.findIndex(cl => cl.id === checklist.id);
                    if (checklistIndex > -1) {
                        project.checklists[checklistIndex] = checklist;
                        return respond(project);
                    }
                }
            }
            return respond({ message: 'Project or checklist not found' }, 404);
        }

        if (projectId && path.includes('/comments')) {
            const projectIndex = db.projects.findIndex(p => p.id === projectId);
            if (projectIndex > -1) {
                const newComment = {
                    ...body,
                    id: `comment_${Date.now()}`,
                    timestamp: new Date().toISOString()
                };
                if (!db.projects[projectIndex].comments) {
                    db.projects[projectIndex].comments = [];
                }
                db.projects[projectIndex].comments!.push(newComment);
                return respond(db.projects[projectIndex]);
            }
            return respond({ message: 'Project not found' }, 404);
        }

        if (projectId) {
            if (method === 'PUT') {
                const index = db.projects.findIndex(p => p.id === projectId);
                if (index > -1) {
                    db.projects[index] = body;
                    return respond(body);
                }
            }
            if (method === 'DELETE') {
                db.projects = db.projects.filter(p => p.id !== projectId);
                return respond(null, 204);
            }
        }
        if (method === 'GET') {
            const orgId = searchParams.get('orgId');
            return respond(db.projects.filter(p => p.organizationId === orgId));
        }
        if (method === 'POST') {
            const newProject = { ...body, id: `proj_${Date.now()}`, createdAt: new Date().toISOString() };
            db.projects.push(newProject);
            // If created from a template, create tasks
            const template = db.projectTemplates.find(t => t.id === body.templateId);
            if (template) {
                template.defaultTasks.forEach(taskTemplate => {
                    const newTask = {
                        id: `task_${Date.now()}_${Math.random()}`,
                        organizationId: newProject.organizationId,
                        title: taskTemplate.title,
                        dueDate: new Date(new Date().getTime() + taskTemplate.daysAfterStart * 24 * 60 * 60 * 1000).toISOString(),
                        isCompleted: false,
                        userId: newProject.assignedToId || db.users.find(u => u.organizationId === newProject.organizationId)?.id || '',
                        projectId: newProject.id,
                        contactId: newProject.contactId,
                    };
                    db.tasks.push(newTask);
                });
            }
            return respond(newProject);
        }
    }
    if (path.startsWith('/api/v1/project-phases')) {
        if (method === 'GET') {
            const orgId = searchParams.get('orgId');
            return respond(db.projectPhases.filter(p => p.organizationId === orgId));
        }
    }

    if (path.startsWith('/api/v1/client-checklist-templates')) {
        if (method === 'GET') {
            const orgId = searchParams.get('orgId');
            return respond(db.clientChecklistTemplates.filter(t => t.organizationId === orgId));
        }
    }


    // Add handler for email sync
    if (path.endsWith('/api/v1/email/sync')) {
        const orgId = body.orgId;
        // Simulate finding some emails
        const newInteraction = {
            id: `int_synced_${Date.now()}`,
            organizationId: orgId,
            contactId: 'contact_1',
            userId: 'user_admin_1',
            type: 'Email' as const,
            date: new Date().toISOString(),
            notes: '(Synced via integration)\nSubject: Re: Project Update\n\nHi John, just wanted to check in on the project status.',
        };
        db.interactions.unshift(newInteraction);
        const contactToUpdate = db.contacts.find(c => c.id === 'contact_1');
        if (contactToUpdate) {
            if (!contactToUpdate.interactions) {
                contactToUpdate.interactions = [];
            }
            contactToUpdate.interactions.unshift(newInteraction);
        }
        if (db.settings.emailIntegration) {
            db.settings.emailIntegration.lastSync = new Date().toISOString();
        }
        return respond(null, 204);
    }
    
    if (path.startsWith('/api/v1/system-audit-logs')) {
        if (method === 'GET') {
            return respond(db.systemAuditLogs);
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
    if (path.endsWith('/team')) return respond(db.users.filter(u => u.organizationId === searchParams.get('orgId')));
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
                id: `stage_${orgId}_${index + 1}`,
                organizationId: orgId,
                name,
                order: index + 1,
            }));
            db.dealStages.push(...newStages);
            return respond(newStages);
        }
    }
    
    // --- WORKFLOWS ---
    if (path.startsWith('/api/v1/workflows')) {
        const workflowId = path.split('/')[4];
        if (method === 'GET') {
            const orgId = searchParams.get('orgId');
            return respond(db.workflows.filter(w => w.organizationId === orgId));
        }
        if (method === 'POST') {
            const newWorkflow = { ...body, id: `wf_${Date.now()}` };
            db.workflows.push(newWorkflow);
            return respond(newWorkflow, 201);
        }
        if (method === 'PUT' && workflowId) {
            const index = db.workflows.findIndex(w => w.id === workflowId);
            if (index > -1) {
                db.workflows[index] = body;
                return respond(body);
            }
            return respond({ message: 'Not found' }, 404);
        }
        if (method === 'DELETE' && workflowId) {
            db.workflows = db.workflows.filter(w => w.id !== workflowId);
            return respond(null, 204);
        }
    }

    // Default catch-all for any unhandled routes
    return respond({ message: `Mock API endpoint not found: ${method} ${path}` }, 404);
};

export const startMockServer = () => {
    setFetchImplementation(mockFetch);
};