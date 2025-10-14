import {
    User, Organization, AnyContact, ContactStatus, CustomRole, Task, CalendarEvent, Product, Deal, DealStage, EmailTemplate, Interaction, Workflow, AdvancedWorkflow, OrganizationSettings, ApiKey, Ticket, PublicForm, Campaign, Document, LandingPage, CustomReport, ReportDataSource, FilterCondition, DashboardWidget, Industry, Supplier, Warehouse, TicketReply, CustomObjectDefinition, CustomObjectRecord, AppMarketplaceItem, InstalledApp, DealForecast, ContactChurnPrediction, NextBestAction, Order, Transaction,
    DashboardData,
    Sandbox,
    DocumentTemplate,
    Project,
    ProjectPhase,
    ProjectComment,
    Conversation,
    Message,
    CannedResponse
} from '../types';

// Create a mutable reference to the fetch implementation that can be overridden by the mock server.
// We bind it to window to maintain the correct `this` context.
let fetchImpl = window.fetch.bind(window);

/**
 * Allows the mock server to replace the default fetch implementation.
 * @param newFetch The new fetch function to use for all API calls.
 */
export function setFetchImplementation(newFetch: typeof window.fetch): void {
  fetchImpl = newFetch;
}

const API_BASE = '/api/v1';

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    const text = await response.text();
    // For DELETE requests with no content, response.text() is empty
    return (text ? JSON.parse(text) : undefined) as T;
}

const apiClient = {
    // --- AUTH ---
    login: (email: string): Promise<User | null> => fetchImpl(`${API_BASE}/login`, { method: 'POST', body: JSON.stringify({ email }), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),

    // --- ORGANIZATIONS ---
    getOrganizations: (): Promise<Organization[]> => fetchImpl(`${API_BASE}/organizations`).then(handleResponse),
    createOrganization: (orgData: Omit<Organization, 'id' | 'createdAt'>): Promise<Organization> => fetchImpl(`${API_BASE}/organizations`, { method: 'POST', body: JSON.stringify(orgData), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    updateOrganization: (orgData: Organization): Promise<Organization> => fetchImpl(`${API_BASE}/organizations/${orgData.id}`, { method: 'PUT', body: JSON.stringify(orgData), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    deleteOrganization: (orgId: string): Promise<void> => fetchImpl(`${API_BASE}/organizations/${orgId}`, { method: 'DELETE' }).then(handleResponse),

    // --- CONTACTS ---
    getContacts: (orgId: string): Promise<AnyContact[]> => fetchImpl(`${API_BASE}/contacts?orgId=${orgId}`).then(handleResponse),
    getContactById: (contactId: string): Promise<AnyContact | null> => fetchImpl(`${API_BASE}/contacts/${contactId}`).then(handleResponse),
    createContact: (contactData: Omit<AnyContact, 'id'>): Promise<AnyContact> => fetchImpl(`${API_BASE}/contacts`, { method: 'POST', body: JSON.stringify(contactData), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    updateContact: (contactData: AnyContact): Promise<AnyContact> => fetchImpl(`${API_BASE}/contacts/${contactData.id}`, { method: 'PUT', body: JSON.stringify(contactData), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    deleteContact: (contactId: string): Promise<void> => fetchImpl(`${API_BASE}/contacts/${contactId}`, { method: 'DELETE' }).then(handleResponse),
    bulkDeleteContacts: (ids: string[]): Promise<void> => fetchImpl(`${API_BASE}/contacts/bulk-delete`, { method: 'POST', body: JSON.stringify({ ids }), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    bulkUpdateContactStatus: ({ ids, status }: { ids: string[]; status: ContactStatus }): Promise<void> => fetchImpl(`${API_BASE}/contacts/bulk-status-update`, { method: 'POST', body: JSON.stringify({ ids, status }), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    getContactChurnPrediction: (contactId: string): Promise<ContactChurnPrediction> => fetchImpl(`${API_BASE}/contacts/${contactId}/churn-prediction`).then(handleResponse),
    getContactNextBestAction: (contactId: string): Promise<NextBestAction> => fetchImpl(`${API_BASE}/contacts/${contactId}/next-best-action`).then(handleResponse),
    
    // --- TEAM & ROLES ---
    getTeamMembers: (orgId: string): Promise<User[]> => fetchImpl(`${API_BASE}/team?orgId=${orgId}`).then(handleResponse),
    getRoles: (orgId: string): Promise<CustomRole[]> => fetchImpl(`${API_BASE}/roles?orgId=${orgId}`).then(handleResponse),
    createUser: (userData: Omit<User, 'id'>): Promise<User> => fetchImpl(`${API_BASE}/users`, { method: 'POST', body: JSON.stringify(userData), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    updateUser: (userData: User): Promise<User> => fetchImpl(`${API_BASE}/users/${userData.id}`, { method: 'PUT', body: JSON.stringify(userData), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    deleteUser: (userId: string): Promise<void> => fetchImpl(`${API_BASE}/users/${userId}`, { method: 'DELETE' }).then(handleResponse),
    createRole: (roleData: Omit<CustomRole, 'id'>): Promise<CustomRole> => fetchImpl(`${API_BASE}/roles`, { method: 'POST', body: JSON.stringify(roleData), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    updateRole: (roleData: CustomRole): Promise<CustomRole> => fetchImpl(`${API_BASE}/roles/${roleData.id}`, { method: 'PUT', body: JSON.stringify(roleData), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    deleteRole: (roleId: string): Promise<void> => fetchImpl(`${API_BASE}/roles/${roleId}`, { method: 'DELETE' }).then(handleResponse),

    // --- INTERACTIONS ---
    getInteractions: (orgId: string): Promise<Interaction[]> => fetchImpl(`${API_BASE}/interactions?orgId=${orgId}`).then(handleResponse),
    getInteractionsByContact: (contactId: string): Promise<Interaction[]> => fetchImpl(`${API_BASE}/interactions?contactId=${contactId}`).then(handleResponse),
    createInteraction: (interactionData: Omit<Interaction, 'id'>): Promise<Interaction> => fetchImpl(`${API_BASE}/interactions`, { method: 'POST', body: JSON.stringify(interactionData), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    updateInteraction: (interactionData: Interaction): Promise<Interaction> => fetchImpl(`${API_BASE}/interactions/${interactionData.id}`, { method: 'PUT', body: JSON.stringify(interactionData), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),

    // --- INBOX ---
    getInboxConversations: (orgId: string): Promise<Conversation[]> => fetchImpl(`${API_BASE}/inbox?orgId=${orgId}`).then(handleResponse),
    sendEmailReply: (data: { contactId: string, userId: string, subject: string, body: string }): Promise<Interaction> => fetchImpl(`${API_BASE}/inbox/reply`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    sendNewEmail: (data: { contactId: string, userId: string, subject: string, body: string }): Promise<Interaction> => fetchImpl(`${API_BASE}/inbox/new`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),

    // --- CANNED RESPONSES ---
    getCannedResponses: (orgId: string): Promise<CannedResponse[]> => fetchImpl(`${API_BASE}/canned-responses?orgId=${orgId}`).then(handleResponse),
    createCannedResponse: (data: Omit<CannedResponse, 'id'>): Promise<CannedResponse> => fetchImpl(`${API_BASE}/canned-responses`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    updateCannedResponse: (data: CannedResponse): Promise<CannedResponse> => fetchImpl(`${API_BASE}/canned-responses/${data.id}`, { method: 'PUT', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    deleteCannedResponse: (id: string): Promise<void> => fetchImpl(`${API_BASE}/canned-responses/${id}`, { method: 'DELETE' }).then(handleResponse),

    // --- DASHBOARD & REPORTS ---
    getDashboardData: (orgId: string): Promise<DashboardData> => fetchImpl(`${API_BASE}/dashboard?orgId=${orgId}`).then(handleResponse),

    // --- OTHER ENTITIES (Simplified) ---
    getTasks: (orgId: string, userId: string, canViewAll: boolean): Promise<Task[]> => fetchImpl(`${API_BASE}/tasks?orgId=${orgId}&userId=${userId}&canViewAll=${canViewAll}`).then(handleResponse),
    createTask: (taskData: Omit<Task, 'id' | 'isCompleted'>): Promise<Task> => fetchImpl(`${API_BASE}/tasks`, { method: 'POST', body: JSON.stringify(taskData), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    updateTask: (taskData: Task): Promise<Task> => fetchImpl(`${API_BASE}/tasks/${taskData.id}`, { method: 'PUT', body: JSON.stringify(taskData), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    deleteTask: (taskId: string): Promise<void> => fetchImpl(`${API_BASE}/tasks/${taskId}`, { method: 'DELETE' }).then(handleResponse),
    
    getCalendarEvents: (orgId: string): Promise<CalendarEvent[]> => fetchImpl(`${API_BASE}/calendar-events?orgId=${orgId}`).then(handleResponse),
    createCalendarEvent: (eventData: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> => fetchImpl(`${API_BASE}/calendar-events`, { method: 'POST', body: JSON.stringify(eventData), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    updateCalendarEvent: (eventData: CalendarEvent): Promise<CalendarEvent> => fetchImpl(`${API_BASE}/calendar-events/${eventData.id}`, { method: 'PUT', body: JSON.stringify(eventData), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    
    getProducts: (orgId: string): Promise<Product[]> => fetchImpl(`${API_BASE}/products?orgId=${orgId}`).then(handleResponse),
    createProduct: (productData: Omit<Product, 'id'>): Promise<Product> => fetchImpl(`${API_BASE}/products`, { method: 'POST', body: JSON.stringify(productData), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    updateProduct: (productData: Product): Promise<Product> => fetchImpl(`${API_BASE}/products/${productData.id}`, { method: 'PUT', body: JSON.stringify(productData), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    deleteProduct: (productId: string): Promise<void> => fetchImpl(`${API_BASE}/products/${productId}`, { method: 'DELETE' }).then(handleResponse),
    
    getSuppliers: (orgId: string): Promise<Supplier[]> => fetchImpl(`${API_BASE}/suppliers?orgId=${orgId}`).then(handleResponse),
    createSupplier: (data: Omit<Supplier, 'id'>): Promise<Supplier> => fetchImpl(`${API_BASE}/suppliers`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    updateSupplier: (data: Supplier): Promise<Supplier> => fetchImpl(`${API_BASE}/suppliers/${data.id}`, { method: 'PUT', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    deleteSupplier: (id: string): Promise<void> => fetchImpl(`${API_BASE}/suppliers/${id}`, { method: 'DELETE' }).then(handleResponse),
    
    getWarehouses: (orgId: string): Promise<Warehouse[]> => fetchImpl(`${API_BASE}/warehouses?orgId=${orgId}`).then(handleResponse),
    createWarehouse: (data: Omit<Warehouse, 'id'>): Promise<Warehouse> => fetchImpl(`${API_BASE}/warehouses`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    updateWarehouse: (data: Warehouse): Promise<Warehouse> => fetchImpl(`${API_BASE}/warehouses/${data.id}`, { method: 'PUT', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    deleteWarehouse: (id: string): Promise<void> => fetchImpl(`${API_BASE}/warehouses/${id}`, { method: 'DELETE' }).then(handleResponse),

    getDealStages: (orgId: string): Promise<DealStage[]> => fetchImpl(`${API_BASE}/deal-stages?orgId=${orgId}`).then(handleResponse),
    updateDealStages: ({ orgId, stages }: { orgId: string, stages: string[] }): Promise<DealStage[]> => fetchImpl(`${API_BASE}/deal-stages`, { method: 'PUT', body: JSON.stringify({ organizationId: orgId, stages }), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    getDeals: (orgId: string): Promise<Deal[]> => fetchImpl(`${API_BASE}/deals?orgId=${orgId}`).then(handleResponse),
    createDeal: (dealData: Omit<Deal, 'id' | 'createdAt'>): Promise<Deal> => fetchImpl(`${API_BASE}/deals`, { method: 'POST', body: JSON.stringify(dealData), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    updateDeal: (dealData: Deal): Promise<Deal> => fetchImpl(`${API_BASE}/deals/${dealData.id}`, { method: 'PUT', body: JSON.stringify(dealData), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    deleteDeal: (dealId: string): Promise<void> => fetchImpl(`${API_BASE}/deals/${dealId}`, { method: 'DELETE' }).then(handleResponse),
    getDealForecast: (dealId: string): Promise<DealForecast> => fetchImpl(`${API_BASE}/deals/${dealId}/forecast`).then(handleResponse),
    
    getEmailTemplates: (orgId: string): Promise<EmailTemplate[]> => fetchImpl(`${API_BASE}/email-templates?orgId=${orgId}`).then(handleResponse),
    createEmailTemplate: (templateData: Omit<EmailTemplate, 'id'>): Promise<EmailTemplate> => fetchImpl(`${API_BASE}/email-templates`, { method: 'POST', body: JSON.stringify(templateData), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    updateEmailTemplate: (templateData: EmailTemplate): Promise<EmailTemplate> => fetchImpl(`${API_BASE}/email-templates/${templateData.id}`, { method: 'PUT', body: JSON.stringify(templateData), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    deleteEmailTemplate: (templateId: string): Promise<void> => fetchImpl(`${API_BASE}/email-templates/${templateId}`, { method: 'DELETE' }).then(handleResponse),

    // --- SETTINGS ---
    getIndustryConfig: (industry: Industry): Promise<any> => fetchImpl(`${API_BASE}/industry-config/${industry}`).then(handleResponse),
    updateCustomFields: ({ industry, fields }: { industry: Industry, fields: any[] }): Promise<any> => fetchImpl(`${API_BASE}/industry-config/${industry}/custom-fields`, { method: 'PUT', body: JSON.stringify({ fields }), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    getOrganizationSettings: (orgId: string): Promise<OrganizationSettings> => fetchImpl(`${API_BASE}/settings?orgId=${orgId}`).then(handleResponse),
    updateOrganizationSettings: (updates: Partial<OrganizationSettings>): Promise<OrganizationSettings> => fetchImpl(`${API_BASE}/settings`, { method: 'PUT', body: JSON.stringify(updates), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    recalculateAllScores: (orgId: string): Promise<void> => fetchImpl(`${API_BASE}/lead-scoring/recalculate-all`, { method: 'POST', body: JSON.stringify({ orgId }), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    // FIX: Added missing runEmailSync method
    runEmailSync: (orgId: string): Promise<void> => fetchImpl(`${API_BASE}/email/sync`, { method: 'POST', body: JSON.stringify({ orgId }), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    
    // --- WORKFLOWS ---
    getWorkflows: (orgId: string): Promise<Workflow[]> => fetchImpl(`${API_BASE}/workflows?orgId=${orgId}`).then(handleResponse),
    createWorkflow: (data: Omit<Workflow, 'id'>): Promise<Workflow> => fetchImpl(`${API_BASE}/workflows`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    updateWorkflow: (data: Workflow): Promise<Workflow> => fetchImpl(`${API_BASE}/workflows/${data.id}`, { method: 'PUT', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    getAdvancedWorkflows: (orgId: string): Promise<AdvancedWorkflow[]> => fetchImpl(`${API_BASE}/advanced-workflows?orgId=${orgId}`).then(handleResponse),
    createAdvancedWorkflow: (data: Omit<AdvancedWorkflow, 'id'>): Promise<AdvancedWorkflow> => fetchImpl(`${API_BASE}/advanced-workflows`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    updateAdvancedWorkflow: (data: AdvancedWorkflow): Promise<AdvancedWorkflow> => fetchImpl(`${API_BASE}/advanced-workflows/${data.id}`, { method: 'PUT', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    deleteAdvancedWorkflow: (id: string): Promise<void> => fetchImpl(`${API_BASE}/advanced-workflows/${id}`, { method: 'DELETE' }).then(handleResponse),
    
    // --- API KEYS ---
    getApiKeys: (orgId: string): Promise<ApiKey[]> => fetchImpl(`${API_BASE}/api-keys?orgId=${orgId}`).then(handleResponse),
    createApiKey: ({ orgId, name }: { orgId: string, name: string }): Promise<{key: ApiKey, secret: string}> => fetchImpl(`${API_BASE}/api-keys`, { method: 'POST', body: JSON.stringify({ orgId, name }), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    deleteApiKey: (keyId: string): Promise<void> => fetchImpl(`${API_BASE}/api-keys/${keyId}`, { method: 'DELETE' }).then(handleResponse),
    
    // --- TICKETS ---
    getTickets: (orgId: string): Promise<Ticket[]> => fetchImpl(`${API_BASE}/tickets?orgId=${orgId}`).then(handleResponse),
    createTicket: (data: Omit<Ticket, 'id'|'createdAt'|'updatedAt'|'replies'>): Promise<Ticket> => fetchImpl(`${API_BASE}/tickets`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    updateTicket: (data: Ticket): Promise<Ticket> => fetchImpl(`${API_BASE}/tickets/${data.id}`, { method: 'PUT', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    addTicketReply: (variables: { ticketId: string, reply: Omit<TicketReply, 'id' | 'timestamp'> }): Promise<Ticket> => fetchImpl(`${API_BASE}/tickets/${variables.ticketId}/replies`, { method: 'POST', body: JSON.stringify({ reply: variables.reply }), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    
    // --- FORMS ---
    getForms: (orgId: string): Promise<PublicForm[]> => fetchImpl(`${API_BASE}/forms?orgId=${orgId}`).then(handleResponse),
    createForm: (data: any): Promise<PublicForm> => fetchImpl(`${API_BASE}/forms`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    updateForm: (data: PublicForm): Promise<PublicForm> => fetchImpl(`${API_BASE}/forms/${data.id}`, { method: 'PUT', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    deleteForm: (id: string): Promise<void> => fetchImpl(`${API_BASE}/forms/${id}`, { method: 'DELETE' }).then(handleResponse),
    submitPublicForm: (data: any): Promise<AnyContact> => fetchImpl(`${API_BASE}/forms/submit`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),

    // --- CAMPAIGNS & LANDING PAGES ---
    getCampaigns: (orgId: string): Promise<Campaign[]> => fetchImpl(`${API_BASE}/campaigns?orgId=${orgId}`).then(handleResponse),
    createCampaign: (data: any): Promise<Campaign> => fetchImpl(`${API_BASE}/campaigns`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    updateCampaign: (data: Campaign): Promise<Campaign> => fetchImpl(`${API_BASE}/campaigns/${data.id}`, { method: 'PUT', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    launchCampaign: (campaignId: string): Promise<void> => fetchImpl(`${API_BASE}/campaigns/${campaignId}/launch`, { method: 'POST' }).then(handleResponse),
    advanceDay: (currentDate: Date): Promise<string> => fetchImpl(`${API_BASE}/scheduler/advance-day`, { method: 'POST', body: JSON.stringify({ currentDate }), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),

    getLandingPages: (orgId: string): Promise<LandingPage[]> => fetchImpl(`${API_BASE}/landing-pages?orgId=${orgId}`).then(handleResponse),
    createLandingPage: (data: any): Promise<LandingPage> => fetchImpl(`${API_BASE}/landing-pages`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    updateLandingPage: (data: LandingPage): Promise<LandingPage> => fetchImpl(`${API_BASE}/landing-pages/${data.id}`, { method: 'PUT', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    deleteLandingPage: (id: string): Promise<void> => fetchImpl(`${API_BASE}/landing-pages/${id}`, { method: 'DELETE' }).then(handleResponse),
    getLandingPageBySlug: (slug: string): Promise<LandingPage | null> => fetchImpl(`${API_BASE}/public/landing-pages/${slug}`).then(handleResponse),
    trackPageView: (data: { sessionId: string, orgId: string, url: string }): Promise<void> => fetchImpl(`${API_BASE}/tracking/page-view`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    
    getCustomReports: (orgId: string): Promise<CustomReport[]> => fetchImpl(`${API_BASE}/reports/custom?orgId=${orgId}`).then(handleResponse),
    createCustomReport: (data: any): Promise<CustomReport> => fetchImpl(`${API_BASE}/reports/custom`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    updateCustomReport: (data: CustomReport): Promise<CustomReport> => fetchImpl(`${API_BASE}/reports/custom/${data.id}`, { method: 'PUT', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    deleteCustomReport: (id: string): Promise<void> => fetchImpl(`${API_BASE}/reports/custom/${id}`, { method: 'DELETE' }).then(handleResponse),
    generateCustomReport: (config: any, orgId: string): Promise<any[]> => fetchImpl(`${API_BASE}/reports/custom/generate`, { method: 'POST', body: JSON.stringify({ config, orgId }), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),

    getDashboardWidgets: (orgId: string): Promise<DashboardWidget[]> => fetchImpl(`${API_BASE}/dashboard/widgets?orgId=${orgId}`).then(handleResponse),
    addDashboardWidget: (reportId: string): Promise<DashboardWidget> => fetchImpl(`${API_BASE}/dashboard/widgets`, { method: 'POST', body: JSON.stringify({ reportId }), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    removeDashboardWidget: (widgetId: string): Promise<void> => fetchImpl(`${API_BASE}/dashboard/widgets/${widgetId}`, { method: 'DELETE' }).then(handleResponse),

    createOrder: (data: Omit<Order, 'id'>): Promise<Order> => fetchImpl(`${API_BASE}/orders`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    updateOrder: (data: Order): Promise<Order> => fetchImpl(`${API_BASE}/orders/${data.id}`, { method: 'PUT', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    deleteOrder: (data: { contactId: string, orderId: string }): Promise<void> => fetchImpl(`${API_BASE}/orders/${data.orderId}`, { method: 'DELETE', body: JSON.stringify({ contactId: data.contactId }), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    createTransaction: (data: { contactId: string, data: Omit<Transaction, 'id'> }): Promise<Transaction> => fetchImpl(`${API_BASE}/transactions`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),

    getCustomObjectDefs: (orgId: string): Promise<CustomObjectDefinition[]> => fetchImpl(`${API_BASE}/custom-object-definitions?orgId=${orgId}`).then(handleResponse),
    createCustomObjectDef: (data: any): Promise<CustomObjectDefinition> => fetchImpl(`${API_BASE}/custom-object-definitions`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    updateCustomObjectDef: (data: CustomObjectDefinition): Promise<CustomObjectDefinition> => fetchImpl(`${API_BASE}/custom-object-definitions/${data.id}`, { method: 'PUT', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    deleteCustomObjectDef: (id: string): Promise<void> => fetchImpl(`${API_BASE}/custom-object-definitions/${id}`, { method: 'DELETE' }).then(handleResponse),

    getCustomObjectRecords: (defId: string | null): Promise<CustomObjectRecord[]> => fetchImpl(`${API_BASE}/custom-object-records?defId=${defId}`).then(handleResponse),
    createCustomObjectRecord: (data: any): Promise<CustomObjectRecord> => fetchImpl(`${API_BASE}/custom-object-records`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    updateCustomObjectRecord: (data: CustomObjectRecord): Promise<CustomObjectRecord> => fetchImpl(`${API_BASE}/custom-object-records/${data.id}`, { method: 'PUT', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    deleteCustomObjectRecord: (id: string): Promise<void> => fetchImpl(`${API_BASE}/custom-object-records/${id}`, { method: 'DELETE' }).then(handleResponse),

    getMarketplaceApps: (orgId: string): Promise<AppMarketplaceItem[]> => fetchImpl(`${API_BASE}/marketplace/apps?orgId=${orgId}`).then(handleResponse),
    getInstalledApps: (orgId: string): Promise<InstalledApp[]> => fetchImpl(`${API_BASE}/marketplace/installed?orgId=${orgId}`).then(handleResponse),
    installApp: (appId: string): Promise<InstalledApp> => fetchImpl(`${API_BASE}/marketplace/install`, { method: 'POST', body: JSON.stringify({ appId }), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    uninstallApp: (installedAppId: string): Promise<void> => fetchImpl(`${API_BASE}/marketplace/uninstall/${installedAppId}`, { method: 'DELETE' }).then(handleResponse),
    
    handleNewChatMessage: (data: any): Promise<void> => fetchImpl(`${API_BASE}/chat/message`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    
    getSandboxes: (orgId: string): Promise<Sandbox[]> => fetchImpl(`${API_BASE}/sandboxes?orgId=${orgId}`).then(handleResponse),
    createSandbox: (data: { orgId: string, name: string }): Promise<Sandbox> => fetchImpl(`${API_BASE}/sandboxes`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    refreshSandbox: (sandboxId: string): Promise<void> => fetchImpl(`${API_BASE}/sandboxes/${sandboxId}/refresh`, { method: 'POST' }).then(handleResponse),
    deleteSandbox: (id: string): Promise<void> => fetchImpl(`${API_BASE}/sandboxes/${id}`, { method: 'DELETE' }).then(handleResponse),
    
    getDocumentTemplates: (orgId: string): Promise<DocumentTemplate[]> => fetchImpl(`${API_BASE}/document-templates?orgId=${orgId}`).then(handleResponse),
    createDocumentTemplate: (data: Omit<DocumentTemplate, 'id'>): Promise<DocumentTemplate> => fetchImpl(`${API_BASE}/document-templates`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    updateDocumentTemplate: (data: DocumentTemplate): Promise<DocumentTemplate> => fetchImpl(`${API_BASE}/document-templates/${data.id}`, { method: 'PUT', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    deleteDocumentTemplate: (id: string): Promise<void> => fetchImpl(`${API_BASE}/document-templates/${id}`, { method: 'DELETE' }).then(handleResponse),
    
    getDocuments: (params: { contactId?: string, projectId?: string }): Promise<Document[]> => fetchImpl(`${API_BASE}/documents?contactId=${params.contactId || ''}&projectId=${params.projectId || ''}`).then(handleResponse),
    uploadDocument: (data: Omit<Document, 'id'|'uploadDate'>): Promise<Document> => fetchImpl(`${API_BASE}/documents`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    updateDocument: (data: Document): Promise<Document> => fetchImpl(`${API_BASE}/documents/${data.id}`, { method: 'PUT', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    deleteDocument: (id: string): Promise<void> => fetchImpl(`${API_BASE}/documents/${id}`, { method: 'DELETE' }).then(handleResponse),

    getProjects: (orgId: string): Promise<Project[]> => fetchImpl(`${API_BASE}/projects?orgId=${orgId}`).then(handleResponse),
    createProject: (data: Omit<Project, 'id'|'createdAt'>): Promise<Project> => fetchImpl(`${API_BASE}/projects`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    updateProject: (data: Project): Promise<Project> => fetchImpl(`${API_BASE}/projects/${data.id}`, { method: 'PUT', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    deleteProject: (id: string): Promise<void> => fetchImpl(`${API_BASE}/projects/${id}`, { method: 'DELETE' }).then(handleResponse),
    addProjectComment: (data: { projectId: string; comment: Omit<ProjectComment, 'id' | 'timestamp'> }): Promise<Project> => fetchImpl(`${API_BASE}/projects/${data.projectId}/comments`, { method: 'POST', body: JSON.stringify(data.comment), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    getProjectPhases: (orgId: string): Promise<ProjectPhase[]> => fetchImpl(`${API_BASE}/project-phases?orgId=${orgId}`).then(handleResponse),
};

export default apiClient;