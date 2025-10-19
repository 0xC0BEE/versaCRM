// This file acts as the client-side interface for making API requests.
// It's designed to be used with React Query.
// The actual "server" logic is simulated in mockApiServer.ts.

let fetchImplementation = window.fetch;

export const setFetchImplementation = (impl: typeof window.fetch) => {
    fetchImplementation = impl;
};

const apiClient = {
    // Auth
    login: (email: string) => post('/api/v1/auth/login', { email }),
    
    // Organizations
    getOrganizations: () => get('/api/v1/organizations'),
    createOrganization: (data: any) => post('/api/v1/organizations', data),
    updateOrganization: (data: any) => put(`/api/v1/organizations/${data.id}`, data),
    deleteOrganization: (id: string) => del(`/api/v1/organizations/${id}`),

    // Users & Roles
    getUsers: (orgId: string) => get(`/api/v1/users?orgId=${orgId}`),
    getTeamMembers: (orgId: string) => get(`/api/v1/team?orgId=${orgId}`),
    createUser: (data: any) => post('/api/v1/users', data),
    updateUser: (data: any) => put(`/api/v1/users/${data.id}`, data),
    deleteUser: (id: string) => del(`/api/v1/users/${id}`),
    getRoles: (orgId: string) => get(`/api/v1/roles?orgId=${orgId}`),
    createRole: (data: any) => post('/api/v1/roles', data),
    updateRole: (data: any) => put(`/api/v1/roles/${data.id}`, data),
    deleteRole: (id: string) => del(`/api/v1/roles/${id}`),
    
    // Contacts
    getContacts: (orgId: string) => get(`/api/v1/contacts?orgId=${orgId}`),
    getContactById: (id: string) => get(`/api/v1/contacts/${id}`),
    createContact: (data: any) => post('/api/v1/contacts', data),
    updateContact: (data: any) => put(`/api/v1/contacts/${data.id}`, data),
    deleteContact: (id: string) => del(`/api/v1/contacts/${id}`),
    bulkDeleteContacts: (ids: string[]) => post('/api/v1/contacts/bulk-delete', { ids }),
    bulkUpdateContactStatus: (data: any) => post('/api/v1/contacts/bulk-status-update', data),
    addContactRelationship: (data: any) => post(`/api/v1/contacts/${data.contactId}/relationships`, data.relationship),
    deleteContactRelationship: (data: any) => del(`/api/v1/contacts/${data.contactId}/relationships/${data.relatedContactId}`),

    // Interactions
    getInteractions: (orgId: string) => get(`/api/v1/interactions?orgId=${orgId}`),
    getInteractionsByContact: (contactId: string) => get(`/api/v1/interactions?contactId=${contactId}`),
    createInteraction: (data: any) => post('/api/v1/interactions', data),
    updateInteraction: (data: any) => put(`/api/v1/interactions/${data.id}`, data),

    // Tasks
    getTasks: (orgId: string, userId: string, canViewAll: boolean) => get(`/api/v1/tasks?orgId=${orgId}&userId=${userId}&canViewAll=${canViewAll}`),
    createTask: (data: any) => post('/api/v1/tasks', data),
    updateTask: (data: any) => put(`/api/v1/tasks/${data.id}`, data),
    deleteTask: (id: string) => del(`/api/v1/tasks/${id}`),

    // Calendar
    getCalendarEvents: (orgId: string) => get(`/api/v1/calendar/events?orgId=${orgId}`),
    createCalendarEvent: (data: any) => post('/api/v1/calendar/events', data),
    updateCalendarEvent: (data: any) => put(`/api/v1/calendar/events/${data.id}`, data),

    // Products & Inventory
    getProducts: (orgId: string) => get(`/api/v1/products?orgId=${orgId}`),
    createProduct: (data: any) => post('/api/v1/products', data),
    updateProduct: (data: any) => put(`/api/v1/products/${data.id}`, data),
    deleteProduct: (id: string) => del(`/api/v1/products/${id}`),
    getSuppliers: (orgId: string) => get(`/api/v1/suppliers?orgId=${orgId}`),
    createSupplier: (data: any) => post('/api/v1/suppliers', data),
    updateSupplier: (data: any) => put(`/api/v1/suppliers/${data.id}`, data),
    deleteSupplier: (id: string) => del(`/api/v1/suppliers/${id}`),
    getWarehouses: (orgId: string) => get(`/api/v1/warehouses?orgId=${orgId}`),
    createWarehouse: (data: any) => post('/api/v1/warehouses', data),
    updateWarehouse: (data: any) => put(`/api/v1/warehouses/${data.id}`, data),
    deleteWarehouse: (id: string) => del(`/api/v1/warehouses/${id}`),

    // Deals
    getDeals: (orgId: string) => get(`/api/v1/deals?orgId=${orgId}`),
    createDeal: (data: any) => post('/api/v1/deals', data),
    updateDeal: (data: any) => put(`/api/v1/deals/${data.id}`, data),
    deleteDeal: (id: string) => del(`/api/v1/deals/${id}`),
    getDealStages: (orgId: string) => get(`/api/v1/deal-stages?orgId=${orgId}`),
    updateDealStages: (data: any) => put('/api/v1/deal-stages', data),
    getDealForecast: (dealId: string) => get(`/api/v1/deals/${dealId}/forecast`),

    // Templates
    getEmailTemplates: (orgId: string) => get(`/api/v1/email-templates?orgId=${orgId}`),
    createEmailTemplate: (data: any) => post('/api/v1/email-templates', data),
    updateEmailTemplate: (data: any) => put(`/api/v1/email-templates/${data.id}`, data),
    deleteEmailTemplate: (id: string) => del(`/api/v1/email-templates/${id}`),
    
    // Settings
    getOrganizationSettings: (orgId: string) => get(`/api/v1/organizations/${orgId}/settings`),
    updateOrganizationSettings: (data: any) => put(`/api/v1/organizations/${data.organizationId || 'org_1'}/settings`, data),
    updateCustomFields: (data: any) => put(`/api/v1/config/custom-fields`, data),
    recalculateAllScores: (orgId: string) => post(`/api/v1/lead-scoring/recalculate`, { orgId }),
    runEmailSync: (orgId: string) => post('/api/v1/email/sync', { orgId }),

    // Workflows
    getWorkflows: (orgId: string) => get(`/api/v1/workflows?orgId=${orgId}`),
    createWorkflow: (data: any) => post('/api/v1/workflows', data),
    updateWorkflow: (data: any) => put(`/api/v1/workflows/${data.id}`, data),
    deleteWorkflow: (id: string) => del(`/api/v1/workflows/${id}`),
    getAdvancedWorkflows: (orgId: string) => get(`/api/v1/advanced-workflows?orgId=${orgId}`),
    createAdvancedWorkflow: (data: any) => post('/api/v1/advanced-workflows', data),
    updateAdvancedWorkflow: (data: any) => put(`/api/v1/advanced-workflows/${data.id}`, data),
    deleteAdvancedWorkflow: (id: string) => del(`/api/v1/advanced-workflows/${id}`),

    // API Keys
    getApiKeys: (orgId: string) => get(`/api/v1/api-keys?orgId=${orgId}`),
    createApiKey: (data: any) => post('/api/v1/api-keys', data),
    deleteApiKey: (id: string) => del(`/api/v1/api-keys/${id}`),
    
    // Tickets
    getTickets: (orgId: string) => get(`/api/v1/tickets?orgId=${orgId}`),
    createTicket: (data: any) => post('/api/v1/tickets', data),
    updateTicket: (data: any) => put(`/api/v1/tickets/${data.id}`, data),
    addTicketReply: (data: any) => post(`/api/v1/tickets/${data.ticketId}/replies`, data.reply),
    
    // Forms
    getForms: (orgId: string) => get(`/api/v1/forms?orgId=${orgId}`),
    createForm: (data: any) => post('/api/v1/forms', data),
    updateForm: (data: any) => put(`/api/v1/forms/${data.id}`, data),
    deleteForm: (id: string) => del(`/api/v1/forms/${id}`),
    submitPublicForm: (data: any) => post('/api/v1/public/forms/submit', data),

    // Campaigns & Landing Pages
    getCampaigns: (orgId: string) => get(`/api/v1/campaigns?orgId=${orgId}`),
    createCampaign: (data: any) => post('/api/v1/campaigns', data),
    updateCampaign: (data: any) => put(`/api/v1/campaigns/${data.id}`, data),
    launchCampaign: (id: string) => post(`/api/v1/campaigns/${id}/launch`, {}),
    advanceDay: (currentDate: Date) => post('/api/v1/scheduler/advance-day', { currentDate }),
    getCampaignAttribution: (campaignId: string) => get(`/api/v1/campaigns/${campaignId}/attribution`),
    getLandingPages: (orgId: string) => get(`/api/v1/landing-pages?orgId=${orgId}`),
    getLandingPageBySlug: (slug: string) => get(`/api/v1/public/landing-pages/${slug}`),
    createLandingPage: (data: any) => post('/api/v1/landing-pages', data),
    updateLandingPage: (data: any) => put(`/api/v1/landing-pages/${data.id}`, data),
    deleteLandingPage: (id: string) => del(`/api/v1/landing-pages/${id}`),
    trackPageView: (data: any) => post('/api/v1/tracking/pageview', data),

    // Reports & Dashboard
    getCustomReports: (orgId: string) => get(`/api/v1/reports?orgId=${orgId}`),
    createCustomReport: (data: any) => post('/api/v1/reports', data),
    updateCustomReport: (data: any) => put(`/api/v1/reports/${data.id}`, data),
    deleteCustomReport: (id: string) => del(`/api/v1/reports/${id}`),
    generateCustomReport: (config: any, orgId: string, dateRange?: any) => post('/api/v1/reports/generate', { config, orgId, dateRange }),
    getDashboards: (orgId: string) => get(`/api/v1/dashboards?orgId=${orgId}`),
    createDashboard: (data: any) => post('/api/v1/dashboards', data),
    updateDashboard: (data: any) => put(`/api/v1/dashboards/${data.id}`, data),
    deleteDashboard: (id: string) => del(`/api/v1/dashboards/${id}`),
    getDashboardWidgets: (dashboardId: string) => get(`/api/v1/dashboard-widgets?dashboardId=${dashboardId}`),
    addDashboardWidget: (data: any) => post('/api/v1/dashboard-widgets', data),
    removeDashboardWidget: (id: string) => del(`/api/v1/dashboard-widgets/${id}`),
    getDashboardData: (orgId: string) => get(`/api/v1/dashboard?orgId=${orgId}`),

    // AI Co-pilot / Predictions
    getContactChurnPrediction: (contactId: string) => get(`/api/v1/contacts/${contactId}/churn-prediction`),
    getContactNextBestAction: (contactId: string) => get(`/api/v1/contacts/${contactId}/next-best-action`),

    // Orders & Billing
    createOrder: (data: any) => post('/api/v1/orders', data),
    updateOrder: (data: any) => put(`/api/v1/orders/${data.id}`, data),
    deleteOrder: (data: any) => del(`/api/v1/contacts/${data.contactId}/orders/${data.orderId}`),
    createTransaction: (data: any) => post(`/api/v1/contacts/${data.contactId}/transactions`, data.data),

    // Custom Objects
    getCustomObjectDefs: (orgId: string) => get(`/api/v1/custom-object-definitions?orgId=${orgId}`),
    createCustomObjectDef: (data: any) => post('/api/v1/custom-object-definitions', data),
    updateCustomObjectDef: (data: any) => put(`/api/v1/custom-object-definitions/${data.id}`, data),
    deleteCustomObjectDef: (id: string) => del(`/api/v1/custom-object-definitions/${id}`),
    getCustomObjectRecords: (defId: string | null) => get(`/api/v1/custom-object-records?defId=${defId}`),
    createCustomObjectRecord: (data: any) => post('/api/v1/custom-object-records', data),
    updateCustomObjectRecord: (data: any) => put(`/api/v1/custom-object-records/${data.id}`, data),
    deleteCustomObjectRecord: (id: string) => del(`/api/v1/custom-object-records/${id}`),

    // Marketplace
    getMarketplaceApps: (orgId: string) => get(`/api/v1/marketplace/apps?orgId=${orgId}`),
    getInstalledApps: (orgId: string) => get(`/api/v1/installed-apps?orgId=${orgId}`),
    installApp: (appId: string) => post('/api/v1/installed-apps', { appId }),
    uninstallApp: (id: string) => del(`/api/v1/installed-apps/${id}`),

    // Sandbox
    getSandboxes: (orgId: string) => get(`/api/v1/sandboxes?orgId=${orgId}`),
    createSandbox: (data: any) => post('/api/v1/sandboxes', data),
    refreshSandbox: (id: string) => post(`/api/v1/sandboxes/${id}/refresh`, {}),
    deleteSandbox: (id: string) => del(`/api/v1/sandboxes/${id}`),
    
    // Documents
    getDocuments: (params: { contactId?: string, projectId?: string }) => {
        let query = '';
        if (params.contactId) query += `contactId=${params.contactId}`;
        if (params.projectId) query += `&projectId=${params.projectId}`;
        return get(`/api/v1/documents?${query}`);
    },
    uploadDocument: (data: any) => post('/api/v1/documents', data),
    updateDocument: (data: any) => put(`/api/v1/documents/${data.id}`, data),
    deleteDocument: (id: string) => del(`/api/v1/documents/${id}`),
    
    // Document Templates
    getDocumentTemplates: (orgId: string) => get(`/api/v1/document-templates?orgId=${orgId}`),
    createDocumentTemplate: (data: any) => post('/api/v1/document-templates', data),
    updateDocumentTemplate: (data: any) => put(`/api/v1/document-templates/${data.id}`, data),
    deleteDocumentTemplate: (id: string) => del(`/api/v1/document-templates/${id}`),
    updateDocumentTemplatePermissions: (id: string, permissions: any) => put(`/api/v1/document-templates/${id}/permissions`, { permissions }),

    // Projects
    getProjects: (orgId: string) => get(`/api/v1/projects?orgId=${orgId}`),
    createProject: (data: any) => post('/api/v1/projects', data),
    updateProject: (data: any) => put(`/api/v1/projects/${data.id}`, data),
    deleteProject: (id: string) => del(`/api/v1/projects/${id}`),
    getProjectPhases: (orgId: string) => get(`/api/v1/project-phases?orgId=${orgId}`),
    addProjectComment: (data: any) => post(`/api/v1/projects/${data.projectId}/comments`, data.comment),
    assignChecklistToProject: (data: any) => post(`/api/v1/projects/${data.projectId}/assign-checklist`, data),
    updateClientChecklist: (data: any) => put(`/api/v1/projects/${data.projectId}/update-checklist`, data),

    // Inbox
    getInboxConversations: (orgId: string) => get(`/api/v1/inbox?orgId=${orgId}`),
    sendEmailReply: (data: any) => post('/api/v1/inbox/reply', data),
    sendNewEmail: (data: any) => post('/api/v1/inbox/new', data),

    // Canned Responses
    getCannedResponses: (orgId: string) => get(`/api/v1/canned-responses?orgId=${orgId}`),
    createCannedResponse: (data: any) => post('/api/v1/canned-responses', data),
    updateCannedResponse: (data: any) => put(`/api/v1/canned-responses/${data.id}`, data),
    deleteCannedResponse: (id: string) => del(`/api/v1/canned-responses/${id}`),

    // Surveys
    getSurveys: (orgId: string) => get(`/api/v1/surveys?orgId=${orgId}`),
    createSurvey: (data: any) => post('/api/v1/surveys', data),
    updateSurvey: (data: any) => put(`/api/v1/surveys/${data.id}`, data),
    deleteSurvey: (id: string) => del(`/api/v1/surveys/${id}`),
    getSurveyResponses: (orgId: string) => get(`/api/v1/survey-responses?orgId=${orgId}`),
    getPublicSurvey: (id: string) => get(`/api/v1/public/surveys/${id}`),
    submitSurveyResponse: (data: any) => post('/api/v1/public/surveys/respond', data),

    // Chat
    handleNewChatMessage: (data: any) => post('/api/v1/chat/message', data),
    getTeamChannels: (orgId: string) => get(`/api/v1/team-channels?orgId=${orgId}`),
    createTeamChannel: (data: any) => post('/api/v1/team-channels', data),
    updateTeamChannelMembers: (data: any) => put(`/api/v1/team-channels/${data.channelId}/members`, data),
    getTeamChannelMessages: (channelId: string) => get(`/api/v1/team-channels/${channelId}/messages`),
    postTeamChatMessage: (data: any) => post(`/api/v1/team-channels/${data.channelId}/messages`, data),
    
    // Snapshots
    getSnapshots: (orgId: string) => get(`/api/v1/snapshots?orgId=${orgId}`),
    createSnapshot: (data: any) => post('/api/v1/snapshots', data),
    deleteSnapshot: (id: string) => del(`/api/v1/snapshots/${id}`),

    // Checklists
    getClientChecklistTemplates: (orgId: string) => get(`/api/v1/client-checklist-templates?orgId=${orgId}`),

    // Subscriptions
    getSubscriptionPlans: (orgId: string) => get(`/api/v1/subscriptions/plans?orgId=${orgId}`),
    createSubscriptionPlan: (data: any) => post('/api/v1/subscriptions/plans', data),
    updateSubscriptionPlan: (data: any) => put(`/api/v1/subscriptions/plans/${data.id}`, data),
    deleteSubscriptionPlan: (id: string) => del(`/api/v1/subscriptions/plans/${id}`),
    subscribeContact: (data: any) => post(`/api/v1/contacts/${data.contactId}/subscribe`, data),
    cancelSubscription: (data: any) => post(`/api/v1/contacts/${data.contactId}/subscriptions/${data.subscriptionId}/cancel`, {}),
    paySubscription: (data: any) => post(`/api/v1/contacts/${data.contactId}/subscriptions/${data.subscriptionId}/pay`, {}),

    // Audit Log
    getSystemAuditLogs: (orgId: string) => get(`/api/v1/system-audit-logs?orgId=${orgId}`),

    // Audience Profiles
    getAudienceProfiles: (orgId: string) => get(`/api/v1/audience-profiles?orgId=${orgId}`),
    createAudienceProfile: (data: any) => post('/api/v1/audience-profiles', data),
    updateAudienceProfile: (data: any) => put(`/api/v1/audience-profiles/${data.id}`, data),
    deleteAudienceProfile: (id: string) => del(`/api/v1/audience-profiles/${id}`),

    // Data Hygiene
    getDataHygieneSuggestions: (orgId: string) => get(`/api/v1/data-hygiene/suggestions?orgId=${orgId}`),
};

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || 'An API error occurred');
    }
    if (response.status === 204) {
        return null;
    }
    return response.json();
};

const get = (url: string) => fetchImplementation(url).then(handleResponse);
const post = (url: string, data: any) => fetchImplementation(url, { method: 'POST', body: JSON.stringify(data) }).then(handleResponse);
const put = (url: string, data: any) => fetchImplementation(url, { method: 'PUT', body: JSON.stringify(data) }).then(handleResponse);
const del = (url: string) => fetchImplementation(url, { method: 'DELETE' }).then(handleResponse);

export default apiClient;
