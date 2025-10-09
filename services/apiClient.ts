// This is the new API client. It uses `fetch` to make requests to a simulated backend.
// This structure makes it easy to switch to a real API in the future.

import {
    User, Organization, AnyContact, ContactStatus, CustomRole, Task, CalendarEvent, Product, Deal, DealStage, EmailTemplate, Interaction, Workflow, AdvancedWorkflow, OrganizationSettings, ApiKey, Ticket, PublicForm, Campaign, Document, LandingPage, CustomReport, ReportDataSource, FilterCondition, DashboardWidget, Industry, Supplier, Warehouse, TicketReply
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

// FIX: Updated handleResponse to correctly handle JSON parsing, empty responses for void types, and casting.
async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    const text = await response.text();
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

    // --- DASHBOARD & REPORTS ---
    getDashboardData: (orgId: string): Promise<any> => fetchImpl(`${API_BASE}/dashboard?orgId=${orgId}`).then(handleResponse),

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
    getWarehouses: (orgId: string): Promise<Warehouse[]> => fetchImpl(`${API_BASE}/warehouses?orgId=${orgId}`).then(handleResponse),
    
    getDealStages: (orgId: string): Promise<DealStage[]> => fetchImpl(`${API_BASE}/deal-stages?orgId=${orgId}`).then(handleResponse),
    getDeals: (orgId: string): Promise<Deal[]> => fetchImpl(`${API_BASE}/deals?orgId=${orgId}`).then(handleResponse),
    createDeal: (dealData: Omit<Deal, 'id' | 'createdAt'>): Promise<Deal> => fetchImpl(`${API_BASE}/deals`, { method: 'POST', body: JSON.stringify(dealData), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    updateDeal: (dealData: Deal): Promise<Deal> => fetchImpl(`${API_BASE}/deals/${dealData.id}`, { method: 'PUT', body: JSON.stringify(dealData), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    deleteDeal: (dealId: string): Promise<void> => fetchImpl(`${API_BASE}/deals/${dealId}`, { method: 'DELETE' }).then(handleResponse),
    
    getEmailTemplates: (orgId: string): Promise<EmailTemplate[]> => fetchImpl(`${API_BASE}/email-templates?orgId=${orgId}`).then(handleResponse),
    createEmailTemplate: (templateData: Omit<EmailTemplate, 'id'>): Promise<EmailTemplate> => fetchImpl(`${API_BASE}/email-templates`, { method: 'POST', body: JSON.stringify(templateData), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    updateEmailTemplate: (templateData: EmailTemplate): Promise<EmailTemplate> => fetchImpl(`${API_BASE}/email-templates/${templateData.id}`, { method: 'PUT', body: JSON.stringify(templateData), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    deleteEmailTemplate: (templateId: string): Promise<void> => fetchImpl(`${API_BASE}/email-templates/${templateId}`, { method: 'DELETE' }).then(handleResponse),

    // --- SETTINGS ---
    getIndustryConfig: (industry: Industry): Promise<any> => fetchImpl(`${API_BASE}/industry-config/${industry}`).then(handleResponse),
    updateCustomFields: ({ industry, fields }: { industry: Industry, fields: any[] }): Promise<any> => fetchImpl(`${API_BASE}/industry-config/${industry}/custom-fields`, { method: 'PUT', body: JSON.stringify({ fields }), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    getOrganizationSettings: (orgId: string): Promise<any> => fetchImpl(`${API_BASE}/settings?orgId=${orgId}`).then(handleResponse),
    updateOrganizationSettings: (updates: Partial<OrganizationSettings>): Promise<any> => fetchImpl(`${API_BASE}/settings`, { method: 'PUT', body: JSON.stringify(updates), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    recalculateAllScores: (orgId: string): Promise<any> => fetchImpl(`${API_BASE}/lead-scoring/recalculate-all`, { method: 'POST', body: JSON.stringify({ orgId }), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    
    // --- WORKFLOWS ---
    getWorkflows: (orgId: string): Promise<any> => fetchImpl(`${API_BASE}/workflows?orgId=${orgId}`).then(handleResponse),
    createWorkflow: (data: Omit<Workflow, 'id'>): Promise<any> => fetchImpl(`${API_BASE}/workflows`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    updateWorkflow: (data: Workflow): Promise<any> => fetchImpl(`${API_BASE}/workflows/${data.id}`, { method: 'PUT', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    getAdvancedWorkflows: (orgId: string): Promise<any> => fetchImpl(`${API_BASE}/advanced-workflows?orgId=${orgId}`).then(handleResponse),
    createAdvancedWorkflow: (data: Omit<AdvancedWorkflow, 'id'>): Promise<any> => fetchImpl(`${API_BASE}/advanced-workflows`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    updateAdvancedWorkflow: (data: AdvancedWorkflow): Promise<any> => fetchImpl(`${API_BASE}/advanced-workflows/${data.id}`, { method: 'PUT', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    deleteAdvancedWorkflow: (id: string): Promise<any> => fetchImpl(`${API_BASE}/advanced-workflows/${id}`, { method: 'DELETE' }).then(handleResponse),
    
    // --- API KEYS ---
    getApiKeys: (orgId: string): Promise<any> => fetchImpl(`${API_BASE}/api-keys?orgId=${orgId}`).then(handleResponse),
    createApiKey: ({ orgId, name }: { orgId: string, name: string }): Promise<any> => fetchImpl(`${API_BASE}/api-keys`, { method: 'POST', body: JSON.stringify({ orgId, name }), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    deleteApiKey: (keyId: string): Promise<any> => fetchImpl(`${API_BASE}/api-keys/${keyId}`, { method: 'DELETE' }).then(handleResponse),
    
    // --- TICKETS ---
    getTickets: (orgId: string): Promise<any> => fetchImpl(`${API_BASE}/tickets?orgId=${orgId}`).then(handleResponse),
    createTicket: (data: Omit<Ticket, 'id'|'createdAt'|'updatedAt'|'replies'>): Promise<any> => fetchImpl(`${API_BASE}/tickets`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    updateTicket: (data: Ticket): Promise<any> => fetchImpl(`${API_BASE}/tickets/${data.id}`, { method: 'PUT', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    addTicketReply: ({ ticketId, reply }: { ticketId: string, reply: Omit<TicketReply, 'id' | 'timestamp'> }): Promise<any> => fetchImpl(`${API_BASE}/tickets/${ticketId}/replies`, { method: 'POST', body: JSON.stringify({ reply }), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    
    // --- FORMS ---
    getForms: (orgId: string): Promise<any> => fetchImpl(`${API_BASE}/forms?orgId=${orgId}`).then(handleResponse),
    createForm: (data: any): Promise<any> => fetchImpl(`${API_BASE}/forms`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    updateForm: (data: PublicForm): Promise<any> => fetchImpl(`${API_BASE}/forms/${data.id}`, { method: 'PUT', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    deleteForm: (id: string): Promise<any> => fetchImpl(`${API_BASE}/forms/${id}`, { method: 'DELETE' }).then(handleResponse),
    submitPublicForm: (data: any): Promise<any> => fetchImpl(`${API_BASE}/forms/submit`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),

    // --- CAMPAIGNS & LANDING PAGES ---
    getCampaigns: (orgId: string): Promise<any> => fetchImpl(`${API_BASE}/campaigns?orgId=${orgId}`).then(handleResponse),
    createCampaign: (data: any): Promise<any> => fetchImpl(`${API_BASE}/campaigns`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    updateCampaign: (data: Campaign): Promise<any> => fetchImpl(`${API_BASE}/campaigns/${data.id}`, { method: 'PUT', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    launchCampaign: (campaignId: string): Promise<any> => fetchImpl(`${API_BASE}/campaigns/${campaignId}/launch`, { method: 'POST' }).then(handleResponse),
    advanceDay: (currentDate: Date): Promise<any> => fetchImpl(`${API_BASE}/scheduler/advance-day`, { method: 'POST', body: JSON.stringify({ currentDate }), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    
    getLandingPages: (orgId: string): Promise<any> => fetchImpl(`${API_BASE}/landing-pages?orgId=${orgId}`).then(handleResponse),
    createLandingPage: (data: any): Promise<any> => fetchImpl(`${API_BASE}/landing-pages`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    updateLandingPage: (data: LandingPage): Promise<any> => fetchImpl(`${API_BASE}/landing-pages/${data.id}`, { method: 'PUT', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    deleteLandingPage: (id:string): Promise<any> => fetchImpl(`${API_BASE}/landing-pages/${id}`, { method: 'DELETE' }).then(handleResponse),
    getLandingPageBySlug: (slug: string): Promise<any> => fetchImpl(`${API_BASE}/public/landing-pages/${slug}`).then(handleResponse),
    
    // --- OTHER ---
    runEmailSync: (orgId: string): Promise<any> => fetchImpl(`${API_BASE}/integrations/email/sync`, { method: 'POST' }).then(handleResponse),
    handleNewChatMessage: (data: any): Promise<any> => fetchImpl(`${API_BASE}/integrations/chat`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    
    getCustomReports: (orgId: string): Promise<any> => fetchImpl(`${API_BASE}/reports/custom?orgId=${orgId}`).then(handleResponse),
    createCustomReport: (data: any): Promise<any> => fetchImpl(`${API_BASE}/reports/custom`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    updateCustomReport: (data: CustomReport): Promise<any> => fetchImpl(`${API_BASE}/reports/custom/${data.id}`, { method: 'PUT', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    deleteCustomReport: (id: string): Promise<any> => fetchImpl(`${API_BASE}/reports/custom/${id}`, { method: 'DELETE' }).then(handleResponse),
    
    getDashboardWidgets: (orgId: string): Promise<any> => fetchImpl(`${API_BASE}/dashboard/widgets?orgId=${orgId}`).then(handleResponse),
    addDashboardWidget: (reportId: string): Promise<any> => fetchImpl(`${API_BASE}/dashboard/widgets`, { method: 'POST', body: JSON.stringify({ reportId }), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    removeDashboardWidget: (id: string): Promise<any> => fetchImpl(`${API_BASE}/dashboard/widgets/${id}`, { method: 'DELETE' }).then(handleResponse),
    
    getDocuments: (contactId: string): Promise<any> => fetchImpl(`${API_BASE}/documents?contactId=${contactId}`).then(handleResponse),
    uploadDocument: (data: Omit<Document, 'id'|'uploadDate'>): Promise<any> => fetchImpl(`${API_BASE}/documents`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    deleteDocument: (id: string): Promise<any> => fetchImpl(`${API_BASE}/documents/${id}`, { method: 'DELETE' }).then(handleResponse),
    
    generateCustomReport: (config: { dataSource: ReportDataSource, columns: string[], filters: FilterCondition[] }, orgId: string): Promise<any> => fetchImpl(`${API_BASE}/reports/custom/generate`, { method: 'POST', body: JSON.stringify({ config, orgId }), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),
    trackPageView: ({ sessionId, orgId, url }: { sessionId: string, orgId: string, url: string }): Promise<any> => fetchImpl(`${API_BASE}/tracking/pageview`, { method: 'POST', body: JSON.stringify({ sessionId, orgId, url }), headers: { 'Content-Type': 'application/json' } }).then(handleResponse),

    // Stubs for methods that were not fully implemented but might be called
    createOrder: async (data: any): Promise<any> => data,
    updateOrder: async (data: any): Promise<any> => data,
    deleteOrder: async (data: any): Promise<any> => {},
    createTransaction: async (data: any): Promise<any> => data,
};

export default apiClient;