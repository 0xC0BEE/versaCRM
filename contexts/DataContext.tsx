import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/apiClient';
import { useAuth } from './AuthContext';
import {
    AnyContact, ContactStatus, Organization, User, CustomRole, Task, CalendarEvent, Product, Deal, DealStage, EmailTemplate, Interaction, Workflow, AdvancedWorkflow, OrganizationSettings, ApiKey, Ticket, PublicForm, Campaign, Document, LandingPage, CustomReport, ReportDataSource, FilterCondition, DashboardWidget, Industry, Supplier, Warehouse, TicketReply, CustomObjectDefinition, CustomObjectRecord, AppMarketplaceItem, InstalledApp,
    Order, Transaction, DashboardData, Dashboard,
    Sandbox,
    DocumentTemplate,
    DocumentPermission,
    Project, ProjectPhase, ProjectComment, Conversation, CannedResponse, Survey, SurveyResponse,
    AttributedDeal,
    Snapshot,
    TeamChannel,
    TeamChatMessage,
    Notification,
    ClientChecklist
} from '../types';
import toast from 'react-hot-toast';
import { useNotifications } from './NotificationContext';

// Define the shape of the context
interface DataContextType {
    // Queries
    organizationsQuery: any;
    contactsQuery: any;
    teamMembersQuery: any;
    rolesQuery: any;
    tasksQuery: any;
    calendarEventsQuery: any;
    productsQuery: any;
    suppliersQuery: any;
    warehousesQuery: any;
    dealStagesQuery: any;
    dealsQuery: any;
    emailTemplatesQuery: any;
    allInteractionsQuery: any;
    syncedEmailsQuery: any;
    workflowsQuery: any;
    advancedWorkflowsQuery: any;
    organizationSettingsQuery: any;
    apiKeysQuery: any;
    ticketsQuery: any;
    formsQuery: any;
    campaignsQuery: any;
    campaignAttributionQuery: (campaignId: string) => any;
    landingPagesQuery: any;
    customReportsQuery: any;
    dashboardsQuery: any;
    dashboardWidgetsQuery: (dashboardId: string) => any;
    customObjectDefsQuery: any;
    customObjectRecordsQuery: (defId: string | null) => any;
    marketplaceAppsQuery: any;
    installedAppsQuery: any;
    dashboardDataQuery: any;
    sandboxesQuery: any;
    documentTemplatesQuery: any;
    projectsQuery: any;
    projectPhasesQuery: any;
    inboxQuery: any;
    teamChannelsQuery: any;
    teamChannelMessagesQuery: (channelId: string | null) => any;
    cannedResponsesQuery: any;
    surveysQuery: any;
    surveyResponsesQuery: any;
    snapshotsQuery: any;
    clientChecklistTemplatesQuery: any;

    // Mutations
    createOrganizationMutation: any;
    updateOrganizationMutation: any;
    deleteOrganizationMutation: any;
    createContactMutation: any;
    updateContactMutation: any;
    deleteContactMutation: any;
    bulkDeleteContactsMutation: any;
    bulkUpdateContactStatusMutation: any;
    createUserMutation: any;
    updateUserMutation: any;
    deleteUserMutation: any;
    createRoleMutation: any;
    updateRoleMutation: any;
    deleteRoleMutation: any;
    createInteractionMutation: any;
    updateInteractionMutation: any;
    createTaskMutation: any;
    updateTaskMutation: any;
    deleteTaskMutation: any;
    createCalendarEventMutation: any;
    updateCalendarEventMutation: any;
    createProductMutation: any;
    updateProductMutation: any;
    deleteProductMutation: any;
    createSupplierMutation: any;
    updateSupplierMutation: any;
    deleteSupplierMutation: any;
    createWarehouseMutation: any;
    updateWarehouseMutation: any;
    deleteWarehouseMutation: any;
    createDealMutation: any;
    updateDealMutation: any;
    deleteDealMutation: any;
    updateDealStagesMutation: any;
    createEmailTemplateMutation: any;
    updateEmailTemplateMutation: any;
    deleteEmailTemplateMutation: any;
    updateCustomFieldsMutation: any;
    updateOrganizationSettingsMutation: any;
    recalculateAllScoresMutation: any;
    connectEmailMutation: any;
    disconnectEmailMutation: any;
    connectVoipMutation: any;
    disconnectVoipMutation: any;
    runEmailSyncMutation: any;
    createWorkflowMutation: any;
    updateWorkflowMutation: any;
    createAdvancedWorkflowMutation: any;
    updateAdvancedWorkflowMutation: any;
    deleteAdvancedWorkflowMutation: any;
    createApiKeyMutation: any;
    deleteApiKeyMutation: any;
    createTicketMutation: any;
    updateTicketMutation: any;
    addTicketReplyMutation: any;
    createFormMutation: any;
    updateFormMutation: any;
    deleteFormMutation: any;
    submitPublicFormMutation: any;
    createCampaignMutation: any;
    updateCampaignMutation: any;
    launchCampaignMutation: any;
    advanceDayMutation: any;
    createLandingPageMutation: any;
    updateLandingPageMutation: any;
    deleteLandingPageMutation: any;
    trackPageViewMutation: any;
    createCustomReportMutation: any;
    updateCustomReportMutation: any;
    deleteCustomReportMutation: any;
    createDashboardMutation: any;
    updateDashboardMutation: any;
    deleteDashboardMutation: any;
    addDashboardWidgetMutation: any;
    removeDashboardWidgetMutation: any;
    createOrderMutation: any;
    updateOrderMutation: any;
    deleteOrderMutation: any;
    createTransactionMutation: any;
    createCustomObjectDefMutation: any;
    updateCustomObjectDefMutation: any;
    deleteCustomObjectDefMutation: any;
    createCustomObjectRecordMutation: any;
    updateCustomObjectRecordMutation: any;
    deleteCustomObjectRecordMutation: any;
    installAppMutation: any;
    uninstallAppMutation: any;
    handleNewChatMessageMutation: any;
    createSandboxMutation: any;
    refreshSandboxMutation: any;
    deleteSandboxMutation: any;
    createDocumentTemplateMutation: any;
    updateDocumentTemplateMutation: any;
    deleteDocumentTemplateMutation: any;
    updateDocumentTemplatePermissionsMutation: any;
    updateDocumentMutation: any;
    createProjectMutation: any;
    updateProjectMutation: any;
    deleteProjectMutation: any;
    sendEmailReplyMutation: any;
    sendNewEmailMutation: any;
    addProjectCommentMutation: any;
    postTeamChatMessageMutation: any;
    createTeamChannelMutation: any;
    updateTeamChannelMembersMutation: any;
    createCannedResponseMutation: any;
    updateCannedResponseMutation: any;
    deleteCannedResponseMutation: any;
    createSurveyMutation: any;
    updateSurveyMutation: any;
    deleteSurveyMutation: any;
    createSnapshotMutation: any;
    deleteSnapshotMutation: any;
    assignChecklistToProjectMutation: any;
    updateClientChecklistMutation: any;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
    children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
    const queryClient = useQueryClient();
    const { authenticatedUser, hasPermission } = useAuth();
    const { addNotification } = useNotifications();
    const orgId = authenticatedUser?.organizationId;

    // --- GENERIC MUTATION HANDLERS ---
    const onMutationSuccess = (queryKey: string | string[]) => () => {
        const keysToInvalidate = Array.isArray(queryKey) ? queryKey : [queryKey];
        // We must invalidate each key individually for partial matching to work correctly
        // (e.g., invalidating 'contacts' should trigger a refetch for ['contacts', orgId])
        keysToInvalidate.forEach(key => {
            queryClient.invalidateQueries({ queryKey: [key] });
        });
    };
    const onMutationError = (error: Error) => {
        toast.error(error.message || 'An unexpected error occurred.');
    };

    // --- QUERIES ---
    const organizationsQuery = useQuery({ queryKey: ['organizations'], queryFn: apiClient.getOrganizations });
    const contactsQuery = useQuery<AnyContact[], Error>({ queryKey: ['contacts', orgId], queryFn: () => apiClient.getContacts(orgId!), enabled: !!orgId });
    const teamMembersQuery = useQuery<User[], Error>({ queryKey: ['teamMembers', orgId], queryFn: () => apiClient.getTeamMembers(orgId!), enabled: !!orgId });
    const rolesQuery = useQuery<CustomRole[], Error>({ queryKey: ['roles', orgId], queryFn: () => apiClient.getRoles(orgId!), enabled: !!orgId });
    const tasksQuery = useQuery<Task[], Error>({ queryKey: ['tasks', orgId, authenticatedUser?.id], queryFn: () => apiClient.getTasks(orgId!, authenticatedUser!.id, hasPermission('contacts:read:all')), enabled: !!orgId && !!authenticatedUser });
    const calendarEventsQuery = useQuery<CalendarEvent[], Error>({ queryKey: ['calendarEvents', orgId], queryFn: () => apiClient.getCalendarEvents(orgId!), enabled: !!orgId });
    const productsQuery = useQuery<Product[], Error>({ queryKey: ['products', orgId], queryFn: () => apiClient.getProducts(orgId!), enabled: !!orgId });
    const suppliersQuery = useQuery<Supplier[], Error>({ queryKey: ['suppliers', orgId], queryFn: () => apiClient.getSuppliers(orgId!), enabled: !!orgId });
    const warehousesQuery = useQuery<Warehouse[], Error>({ queryKey: ['warehouses', orgId], queryFn: () => apiClient.getWarehouses(orgId!), enabled: !!orgId });
    const dealStagesQuery = useQuery<DealStage[], Error>({ queryKey: ['dealStages', orgId], queryFn: () => apiClient.getDealStages(orgId!), enabled: !!orgId });
    const dealsQuery = useQuery<Deal[], Error>({ queryKey: ['deals', orgId], queryFn: () => apiClient.getDeals(orgId!), enabled: !!orgId });
    const emailTemplatesQuery = useQuery<EmailTemplate[], Error>({ queryKey: ['emailTemplates', orgId], queryFn: () => apiClient.getEmailTemplates(orgId!), enabled: !!orgId });
    const allInteractionsQuery = useQuery<Interaction[], Error>({ queryKey: ['allInteractions', orgId], queryFn: () => apiClient.getInteractions(orgId!), enabled: !!orgId && hasPermission('contacts:read:all') });
    const syncedEmailsQuery = useQuery<Interaction[], Error>({ queryKey: ['syncedEmails', orgId], queryFn: async () => { const all = await apiClient.getInteractions(orgId!); return all.filter(i => i.type === 'Email' && i.notes.includes('(Synced via')); }, enabled: !!orgId && hasPermission('contacts:read:all') });
    const inboxQuery = useQuery<Conversation[], Error>({ queryKey: ['inbox', orgId], queryFn: () => apiClient.getInboxConversations(orgId!), enabled: !!orgId });
    const cannedResponsesQuery = useQuery<CannedResponse[], Error>({ queryKey: ['cannedResponses', orgId], queryFn: () => apiClient.getCannedResponses(orgId!), enabled: !!orgId });
    const surveysQuery = useQuery<Survey[], Error>({ queryKey: ['surveys', orgId], queryFn: () => apiClient.getSurveys(orgId!), enabled: !!orgId });
    const surveyResponsesQuery = useQuery<SurveyResponse[], Error>({ queryKey: ['surveyResponses', orgId], queryFn: () => apiClient.getSurveyResponses(orgId!), enabled: !!orgId });
    const workflowsQuery = useQuery<Workflow[], Error>({ queryKey: ['workflows', orgId], queryFn: () => apiClient.getWorkflows(orgId!), enabled: !!orgId });
    const advancedWorkflowsQuery = useQuery<AdvancedWorkflow[], Error>({ queryKey: ['advancedWorkflows', orgId], queryFn: () => apiClient.getAdvancedWorkflows(orgId!), enabled: !!orgId });
    const organizationSettingsQuery = useQuery<OrganizationSettings, Error>({ queryKey: ['organizationSettings', orgId], queryFn: () => apiClient.getOrganizationSettings(orgId!), enabled: !!orgId });
    const apiKeysQuery = useQuery<ApiKey[], Error>({ queryKey: ['apiKeys', orgId], queryFn: () => apiClient.getApiKeys(orgId!), enabled: !!orgId });
    const ticketsQuery = useQuery<Ticket[], Error>({ queryKey: ['tickets', orgId], queryFn: () => apiClient.getTickets(orgId!), enabled: !!orgId });
    const formsQuery = useQuery<PublicForm[], Error>({ queryKey: ['forms', orgId], queryFn: () => apiClient.getForms(orgId!), enabled: !!orgId });
    const campaignsQuery = useQuery<Campaign[], Error>({ queryKey: ['campaigns', orgId], queryFn: () => apiClient.getCampaigns(orgId!), enabled: !!orgId });
    const campaignAttributionQuery = (campaignId: string) => useQuery<AttributedDeal[], Error>({
        queryKey: ['campaignAttribution', campaignId],
        queryFn: () => apiClient.getCampaignAttribution(campaignId),
        enabled: !!campaignId,
    });
    const landingPagesQuery = useQuery<LandingPage[], Error>({ queryKey: ['landingPages', orgId], queryFn: () => apiClient.getLandingPages(orgId!), enabled: !!orgId });
    const customReportsQuery = useQuery<CustomReport[], Error>({ queryKey: ['customReports', orgId], queryFn: () => apiClient.getCustomReports(orgId!), enabled: !!orgId });
    const dashboardsQuery = useQuery<Dashboard[], Error>({ queryKey: ['dashboards', orgId], queryFn: () => apiClient.getDashboards(orgId!), enabled: !!orgId });
    const dashboardWidgetsQuery = (dashboardId: string) => useQuery<DashboardWidget[], Error>({ queryKey: ['dashboardWidgets', dashboardId], queryFn: () => apiClient.getDashboardWidgets(dashboardId), enabled: !!dashboardId });
    const dashboardDataQuery = useQuery<DashboardData, Error>({ queryKey: ['dashboardData', orgId], queryFn: () => apiClient.getDashboardData(orgId!), enabled: !!orgId });
    const customObjectDefsQuery = useQuery<CustomObjectDefinition[], Error>({ queryKey: ['customObjectDefs', orgId], queryFn: () => apiClient.getCustomObjectDefs(orgId!), enabled: !!orgId });
    const customObjectRecordsQuery = (defId: string | null) => useQuery<CustomObjectRecord[], Error>({ queryKey: ['customObjectRecords', defId], queryFn: () => apiClient.getCustomObjectRecords(defId), enabled: defId !== undefined });
    const marketplaceAppsQuery = useQuery<AppMarketplaceItem[], Error>({ queryKey: ['marketplaceApps'], queryFn: () => apiClient.getMarketplaceApps(orgId!), enabled: !!orgId });
    const installedAppsQuery = useQuery<InstalledApp[], Error>({ queryKey: ['installedApps', orgId], queryFn: () => apiClient.getInstalledApps(orgId!), enabled: !!orgId });
    const sandboxesQuery = useQuery<Sandbox[], Error>({ queryKey: ['sandboxes', orgId], queryFn: () => apiClient.getSandboxes(orgId!), enabled: !!orgId });
    const documentTemplatesQuery = useQuery<DocumentTemplate[], Error>({ queryKey: ['documentTemplates', orgId], queryFn: () => apiClient.getDocumentTemplates(orgId!), enabled: !!orgId });
    const projectsQuery = useQuery<Project[], Error>({ queryKey: ['projects', orgId], queryFn: () => apiClient.getProjects(orgId!), enabled: !!orgId });
    const projectPhasesQuery = useQuery<ProjectPhase[], Error>({ queryKey: ['projectPhases', orgId], queryFn: () => apiClient.getProjectPhases(orgId!), enabled: !!orgId });
    const teamChannelsQuery = useQuery<TeamChannel[], Error>({ queryKey: ['teamChannels', orgId], queryFn: () => apiClient.getTeamChannels(orgId!), enabled: !!orgId });
    const teamChannelMessagesQuery = (channelId: string | null) => useQuery<TeamChatMessage[], Error>({ queryKey: ['teamChannelMessages', channelId], queryFn: () => apiClient.getTeamChannelMessages(channelId!), enabled: !!channelId });
    const snapshotsQuery = useQuery<Snapshot[], Error>({ queryKey: ['snapshots', orgId], queryFn: () => apiClient.getSnapshots(orgId!), enabled: !!orgId });
    const clientChecklistTemplatesQuery = useQuery({ queryKey: ['clientChecklistTemplates', orgId], queryFn: () => apiClient.getClientChecklistTemplates(orgId!), enabled: !!orgId });
    const interactionsQuery = allInteractionsQuery;

    // --- MUTATIONS ---
    const useGenericMutation = <TVariables, TData>(mutationFn: (variables: TVariables) => Promise<TData>, successKey: string | string[]) => useMutation<TData, Error, TVariables>({ mutationFn, onSuccess: onMutationSuccess(successKey), onError: onMutationError });
    
    // Mutations wrapped in arrow functions to ensure correct argument passing
    const createOrganizationMutation = useGenericMutation((vars: Omit<Organization, 'id' | 'createdAt'>) => apiClient.createOrganization(vars), 'organizations');
    const updateOrganizationMutation = useGenericMutation((vars: Organization) => apiClient.updateOrganization(vars), 'organizations');
    const deleteOrganizationMutation = useGenericMutation((id: string) => apiClient.deleteOrganization(id), 'organizations');
    
    const createContactMutation = useGenericMutation((vars: Omit<AnyContact, 'id'>) => apiClient.createContact(vars), 'contacts');
    const updateContactMutation = useGenericMutation((vars: AnyContact) => apiClient.updateContact(vars), 'contacts');
    const deleteContactMutation = useGenericMutation((id: string) => apiClient.deleteContact(id), 'contacts');
    const bulkDeleteContactsMutation = useGenericMutation((ids: string[]) => apiClient.bulkDeleteContacts(ids), 'contacts');
    const bulkUpdateContactStatusMutation = useGenericMutation((vars: {ids: string[], status: ContactStatus}) => apiClient.bulkUpdateContactStatus(vars), 'contacts');
    
    const createUserMutation = useGenericMutation((vars: Omit<User, 'id'>) => apiClient.createUser(vars), 'teamMembers');
    const updateUserMutation = useGenericMutation((vars: User) => apiClient.updateUser(vars), 'teamMembers');
    const deleteUserMutation = useGenericMutation((id: string) => apiClient.deleteUser(id), 'teamMembers');
    
    const createRoleMutation = useGenericMutation((vars: Omit<CustomRole, 'id'>) => apiClient.createRole(vars), 'roles');
    const updateRoleMutation = useGenericMutation((vars: CustomRole) => apiClient.updateRole(vars), 'roles');
    const deleteRoleMutation = useGenericMutation((id: string) => apiClient.deleteRole(id), 'roles');
    
    const createInteractionMutation = useGenericMutation((vars: Omit<Interaction, 'id'>) => apiClient.createInteraction(vars), ['allInteractions', 'contacts']);
    const updateInteractionMutation = useGenericMutation((vars: Interaction) => apiClient.updateInteraction(vars), ['allInteractions', 'contacts']);
    
    const createTaskMutation = useMutation({ mutationFn: (vars: Omit<Task, 'id' | 'isCompleted'>) => apiClient.createTask(vars), onSuccess: () => { toast.success("Task created!"); onMutationSuccess('tasks')(); }, onError: onMutationError });
    const updateTaskMutation = useGenericMutation((vars: Task) => apiClient.updateTask(vars), 'tasks');
    const deleteTaskMutation = useMutation({ mutationFn: (id: string) => apiClient.deleteTask(id), onSuccess: () => { toast.success("Task deleted!"); onMutationSuccess('tasks')(); }, onError: onMutationError });
    
    const createCalendarEventMutation = useGenericMutation((vars: Omit<CalendarEvent, 'id'>) => apiClient.createCalendarEvent(vars), 'calendarEvents');
    const updateCalendarEventMutation = useGenericMutation((vars: CalendarEvent) => apiClient.updateCalendarEvent(vars), 'calendarEvents');
    
    const createProductMutation = useGenericMutation((vars: Omit<Product, 'id'>) => apiClient.createProduct(vars), 'products');
    const updateProductMutation = useGenericMutation((vars: Product) => apiClient.updateProduct(vars), 'products');
    const deleteProductMutation = useGenericMutation((id: string) => apiClient.deleteProduct(id), 'products');

    const createSupplierMutation = useGenericMutation((vars: Omit<Supplier, 'id'>) => apiClient.createSupplier(vars), 'suppliers');
    const updateSupplierMutation = useGenericMutation((vars: Supplier) => apiClient.updateSupplier(vars), 'suppliers');
    const deleteSupplierMutation = useGenericMutation((id: string) => apiClient.deleteSupplier(id), 'suppliers');

    const createWarehouseMutation = useGenericMutation((vars: Omit<Warehouse, 'id'>) => apiClient.createWarehouse(vars), 'warehouses');
    const updateWarehouseMutation = useGenericMutation((vars: Warehouse) => apiClient.updateWarehouse(vars), 'warehouses');
    const deleteWarehouseMutation = useGenericMutation((id: string) => apiClient.deleteWarehouse(id), 'warehouses');
    
    const createDealMutation = useGenericMutation((vars: Omit<Deal, 'id' | 'createdAt'>) => apiClient.createDeal(vars), 'deals');
    const updateDealMutation = useGenericMutation((vars: Deal) => apiClient.updateDeal(vars), 'deals');
    const deleteDealMutation = useGenericMutation((id: string) => apiClient.deleteDeal(id), 'deals');
    const updateDealStagesMutation = useGenericMutation((vars: { orgId: string, stages: string[] }) => apiClient.updateDealStages(vars), 'dealStages');
    
    const createEmailTemplateMutation = useGenericMutation((vars: Omit<EmailTemplate, 'id'>) => apiClient.createEmailTemplate(vars), 'emailTemplates');
    const updateEmailTemplateMutation = useGenericMutation((vars: EmailTemplate) => apiClient.updateEmailTemplate(vars), 'emailTemplates');
    const deleteEmailTemplateMutation = useGenericMutation((id: string) => apiClient.deleteEmailTemplate(id), 'emailTemplates');
    
    const updateCustomFieldsMutation = useGenericMutation((vars: { industry: Industry, fields: any[] }) => apiClient.updateCustomFields(vars), 'industryConfig');
    const updateOrganizationSettingsMutation = useGenericMutation((vars: Partial<OrganizationSettings>) => apiClient.updateOrganizationSettings(vars), 'organizationSettings');
    const recalculateAllScoresMutation = useGenericMutation((id: string) => apiClient.recalculateAllScores(id), 'contacts');
    
    const connectEmailMutation = useGenericMutation((email: string) => apiClient.updateOrganizationSettings({ emailIntegration: { isConnected: true, connectedEmail: email, lastSync: new Date().toISOString() } }), 'organizationSettings');
    const disconnectEmailMutation = useGenericMutation(() => apiClient.updateOrganizationSettings({ emailIntegration: { isConnected: false, connectedEmail: undefined, lastSync: undefined } }), 'organizationSettings');
    const connectVoipMutation = useGenericMutation((provider: string) => apiClient.updateOrganizationSettings({ voip: { isConnected: true, provider } }), 'organizationSettings');
    const disconnectVoipMutation = useGenericMutation(() => apiClient.updateOrganizationSettings({ voip: { isConnected: false, provider: undefined } }), 'organizationSettings');
    const runEmailSyncMutation = useGenericMutation((id: string) => apiClient.runEmailSync(id), 'syncedEmails');
    
    const createWorkflowMutation = useGenericMutation((vars: Omit<Workflow, 'id'>) => apiClient.createWorkflow(vars), 'workflows');
    const updateWorkflowMutation = useGenericMutation((vars: Workflow) => apiClient.updateWorkflow(vars), 'workflows');
    const createAdvancedWorkflowMutation = useGenericMutation((vars: Omit<AdvancedWorkflow, 'id'>) => apiClient.createAdvancedWorkflow(vars), 'advancedWorkflows');
    const updateAdvancedWorkflowMutation = useGenericMutation((vars: AdvancedWorkflow) => apiClient.updateAdvancedWorkflow(vars), 'advancedWorkflows');
    const deleteAdvancedWorkflowMutation = useGenericMutation((id: string) => apiClient.deleteAdvancedWorkflow(id), 'advancedWorkflows');
    
    const createApiKeyMutation = useGenericMutation((vars: { orgId: string, name: string }) => apiClient.createApiKey(vars), 'apiKeys');
    const deleteApiKeyMutation = useGenericMutation((id: string) => apiClient.deleteApiKey(id), 'apiKeys');
    
    const createTicketMutation = useGenericMutation((vars: Omit<Ticket, 'id'|'createdAt'|'updatedAt'|'replies'>) => apiClient.createTicket(vars), 'tickets');
    const updateTicketMutation = useGenericMutation((vars: Ticket) => apiClient.updateTicket(vars), 'tickets');
    const addTicketReplyMutation = useGenericMutation((vars: { ticketId: string, reply: Omit<TicketReply, 'id' | 'timestamp'> }) => apiClient.addTicketReply(vars), 'tickets');
    
    const createFormMutation = useGenericMutation((vars: any) => apiClient.createForm(vars), 'forms');
    const updateFormMutation = useGenericMutation((vars: PublicForm) => apiClient.updateForm(vars), 'forms');
    const deleteFormMutation = useGenericMutation((id: string) => apiClient.deleteForm(id), 'forms');
    const submitPublicFormMutation = useGenericMutation((vars: any) => apiClient.submitPublicForm(vars), 'contacts');
    
    const createCampaignMutation = useGenericMutation((vars: any) => apiClient.createCampaign(vars), 'campaigns');
    const updateCampaignMutation = useGenericMutation((vars: Campaign) => apiClient.updateCampaign(vars), 'campaigns');
    const launchCampaignMutation = useGenericMutation((id: string) => apiClient.launchCampaign(id), 'campaigns');
    const advanceDayMutation = useGenericMutation((date: Date) => apiClient.advanceDay(date), ['campaigns', 'contacts']);
    
    const createLandingPageMutation = useGenericMutation((vars: any) => apiClient.createLandingPage(vars), 'landingPages');
    const updateLandingPageMutation = useGenericMutation((vars: LandingPage) => apiClient.updateLandingPage(vars), 'landingPages');
    const deleteLandingPageMutation = useGenericMutation((id: string) => apiClient.deleteLandingPage(id), 'landingPages');
    
    const trackPageViewMutation = useMutation({ mutationFn: (vars: { sessionId: string, orgId: string, url: string }) => apiClient.trackPageView(vars), onError: onMutationError });
    
    const createCustomReportMutation = useGenericMutation((vars: any) => apiClient.createCustomReport(vars), 'customReports');
    const updateCustomReportMutation = useGenericMutation((vars: CustomReport) => apiClient.updateCustomReport(vars), 'customReports');
    const deleteCustomReportMutation = useGenericMutation((id: string) => apiClient.deleteCustomReport(id), ['customReports', 'dashboardWidgets']);
    
    const createDashboardMutation = useGenericMutation((data: { orgId: string, name: string }) => apiClient.createDashboard(data), 'dashboards');
    const updateDashboardMutation = useGenericMutation((data: { id: string, name: string }) => apiClient.updateDashboard(data), 'dashboards');
    const deleteDashboardMutation = useGenericMutation((id: string) => apiClient.deleteDashboard(id), ['dashboards', 'dashboardWidgets']);
    const addDashboardWidgetMutation = useGenericMutation((vars: { reportId: string, dashboardId: string }) => apiClient.addDashboardWidget(vars), 'dashboardWidgets');
    const removeDashboardWidgetMutation = useGenericMutation((id: string) => apiClient.removeDashboardWidget(id), 'dashboardWidgets');
    
    const createOrderMutation = useGenericMutation((vars: Omit<Order, 'id'>) => apiClient.createOrder(vars), 'contacts');
    const updateOrderMutation = useGenericMutation((vars: Order) => apiClient.updateOrder(vars), 'contacts');
    const deleteOrderMutation = useGenericMutation((vars: { contactId: string, orderId: string }) => apiClient.deleteOrder(vars), 'contacts');
    const createTransactionMutation = useGenericMutation((vars: { contactId: string, data: Omit<Transaction, 'id'> }) => apiClient.createTransaction(vars), 'contacts');

    const createCustomObjectDefMutation = useGenericMutation((vars: Omit<CustomObjectDefinition, 'id'>) => apiClient.createCustomObjectDef(vars), 'customObjectDefs');
    const updateCustomObjectDefMutation = useGenericMutation((vars: CustomObjectDefinition) => apiClient.updateCustomObjectDef(vars), 'customObjectDefs');
    const deleteCustomObjectDefMutation = useGenericMutation((id: string) => apiClient.deleteCustomObjectDef(id), 'customObjectDefs');

    const createCustomObjectRecordMutation = useGenericMutation((vars: Omit<CustomObjectRecord, 'id'>) => apiClient.createCustomObjectRecord(vars), 'customObjectRecords');
    const updateCustomObjectRecordMutation = useGenericMutation((vars: CustomObjectRecord) => apiClient.updateCustomObjectRecord(vars), 'customObjectRecords');
    const deleteCustomObjectRecordMutation = useMutation({ mutationFn: (id: string) => apiClient.deleteCustomObjectRecord(id), onSuccess: (data, id) => { queryClient.invalidateQueries({ queryKey: ['customObjectRecords'] }); }, onError: onMutationError });

    const installAppMutation = useGenericMutation((id: string) => apiClient.installApp(id), 'installedApps');
    const uninstallAppMutation = useGenericMutation((id: string) => apiClient.uninstallApp(id), 'installedApps');

    const handleNewChatMessageMutation = useGenericMutation((vars: any) => apiClient.handleNewChatMessage(vars), ['tickets', 'contacts']);
    
    const createSandboxMutation = useMutation({
        mutationFn: (vars: { orgId: string, name: string }) => apiClient.createSandbox(vars),
        onSuccess: () => {
            toast.success("Sandbox created successfully!");
            queryClient.invalidateQueries({ queryKey: ['sandboxes'] });
        },
        onError: onMutationError,
    });

    const refreshSandboxMutation = useMutation({
        mutationFn: (sandboxId: string) => apiClient.refreshSandbox(sandboxId),
        onSuccess: () => {
            toast.success("Sandbox refreshed successfully.");
            queryClient.invalidateQueries({ queryKey: ['sandboxes'] });
        },
        onError: onMutationError,
    });

    const deleteSandboxMutation = useMutation({
        mutationFn: (id: string) => apiClient.deleteSandbox(id),
        onSuccess: () => {
            toast.success("Sandbox deleted successfully.");
            queryClient.invalidateQueries({ queryKey: ['sandboxes'] });
        },
        onError: onMutationError,
    });
    
    const createDocumentTemplateMutation = useGenericMutation((vars: Omit<DocumentTemplate, 'id'>) => apiClient.createDocumentTemplate(vars), 'documentTemplates');
    const updateDocumentTemplateMutation = useGenericMutation((vars: DocumentTemplate) => apiClient.updateDocumentTemplate(vars), 'documentTemplates');
    const deleteDocumentTemplateMutation = useGenericMutation((id: string) => apiClient.deleteDocumentTemplate(id), 'documentTemplates');
    const updateDocumentTemplatePermissionsMutation = useGenericMutation((vars: { id: string, permissions: DocumentPermission[] }) => apiClient.updateDocumentTemplatePermissions(vars.id, vars.permissions), 'documentTemplates');
    const updateDocumentMutation = useGenericMutation((vars: Document) => apiClient.updateDocument(vars), 'documents');

    const createProjectMutation = useGenericMutation((vars: Omit<Project, 'id' | 'createdAt'>) => apiClient.createProject(vars), ['projects', 'tasks']);
    const updateProjectMutation = useGenericMutation((vars: Project) => apiClient.updateProject(vars), 'projects');
    const deleteProjectMutation = useGenericMutation((id: string) => apiClient.deleteProject(id), 'projects');
    const sendEmailReplyMutation = useGenericMutation((vars: { contactId: string, userId: string, subject: string, body: string }) => apiClient.sendEmailReply(vars), ['inbox', 'contacts', 'allInteractions']);
    const sendNewEmailMutation = useGenericMutation((vars: { contactId: string, userId: string, subject: string, body: string }) => apiClient.sendNewEmail(vars), ['inbox', 'contacts', 'allInteractions']);
    const addProjectCommentMutation = useGenericMutation((vars: { projectId: string; comment: { userId: string, message: string } }) => apiClient.addProjectComment(vars), 'projects');
    const postTeamChatMessageMutation = useMutation({
        mutationFn: (vars: { channelId: string; userId: string; message: string; threadId?: string }) => apiClient.postTeamChatMessage(vars),
        onSuccess: (data: { message: TeamChatMessage, notifications: Notification[] }) => {
            queryClient.invalidateQueries({ queryKey: ['teamChannelMessages', data.message.channelId] });
            if (data.message.threadId) {
                queryClient.invalidateQueries({ queryKey: ['teamChannelMessages', data.message.threadId] });
            }
            if (data.notifications && data.notifications.length > 0) {
                data.notifications.forEach(notif => {
                    if (notif.userId !== authenticatedUser?.id) { // Don't notify yourself
                        const { id, timestamp, isRead, ...notificationData } = notif;
                        addNotification(notificationData);
                    }
                });
            }
        },
        onError: onMutationError,
    });
    const createTeamChannelMutation = useGenericMutation((vars: Omit<TeamChannel, 'id'>) => apiClient.createTeamChannel(vars), 'teamChannels');
    const updateTeamChannelMembersMutation = useGenericMutation((vars: { channelId: string, memberIds: string[] }) => apiClient.updateTeamChannelMembers(vars), 'teamChannels');
    const createCannedResponseMutation = useGenericMutation((vars: Omit<CannedResponse, 'id'>) => apiClient.createCannedResponse(vars), 'cannedResponses');
    const updateCannedResponseMutation = useGenericMutation((vars: CannedResponse) => apiClient.updateCannedResponse(vars), 'cannedResponses');
    const deleteCannedResponseMutation = useGenericMutation((id: string) => apiClient.deleteCannedResponse(id), 'cannedResponses');
    const createSurveyMutation = useGenericMutation((vars: Omit<Survey, 'id' | 'createdAt'>) => apiClient.createSurvey(vars), 'surveys');
    const updateSurveyMutation = useGenericMutation((vars: Survey) => apiClient.updateSurvey(vars), 'surveys');
    const deleteSurveyMutation = useGenericMutation((id: string) => apiClient.deleteSurvey(id), 'surveys');
    const createSnapshotMutation = useGenericMutation((vars: any) => apiClient.createSnapshot(vars), 'snapshots');
    const deleteSnapshotMutation = useGenericMutation((id: string) => apiClient.deleteSnapshot(id), 'snapshots');
    const assignChecklistToProjectMutation = useGenericMutation((vars: { projectId: string, templateId: string }) => apiClient.assignChecklistToProject(vars), 'projects');
    const updateClientChecklistMutation = useGenericMutation((vars: { projectId: string, checklist: ClientChecklist }) => apiClient.updateClientChecklist(vars), 'projects');


    const value = useMemo(() => ({
        organizationsQuery, contactsQuery, teamMembersQuery, rolesQuery, tasksQuery, calendarEventsQuery, productsQuery, suppliersQuery, warehousesQuery, dealStagesQuery, dealsQuery, emailTemplatesQuery, allInteractionsQuery, syncedEmailsQuery, workflowsQuery, advancedWorkflowsQuery, organizationSettingsQuery, apiKeysQuery, ticketsQuery, formsQuery, campaignsQuery, campaignAttributionQuery, landingPagesQuery, customReportsQuery, dashboardsQuery, dashboardWidgetsQuery, customObjectDefsQuery, customObjectRecordsQuery, marketplaceAppsQuery, installedAppsQuery, dashboardDataQuery, sandboxesQuery, documentTemplatesQuery, projectsQuery, projectPhasesQuery, inboxQuery, teamChannelsQuery, teamChannelMessagesQuery, cannedResponsesQuery, surveysQuery, surveyResponsesQuery, snapshotsQuery, clientChecklistTemplatesQuery,
        createOrganizationMutation, updateOrganizationMutation, deleteOrganizationMutation, createContactMutation, updateContactMutation, deleteContactMutation, bulkDeleteContactsMutation, bulkUpdateContactStatusMutation, createUserMutation, updateUserMutation, deleteUserMutation, createRoleMutation, updateRoleMutation, deleteRoleMutation, createInteractionMutation, updateInteractionMutation, createTaskMutation, updateTaskMutation, deleteTaskMutation, createCalendarEventMutation, updateCalendarEventMutation, createProductMutation, updateProductMutation, deleteProductMutation, createSupplierMutation, updateSupplierMutation, deleteSupplierMutation, createWarehouseMutation, updateWarehouseMutation, deleteWarehouseMutation, createDealMutation, updateDealMutation, deleteDealMutation, updateDealStagesMutation, createEmailTemplateMutation, updateEmailTemplateMutation, deleteEmailTemplateMutation, updateCustomFieldsMutation, updateOrganizationSettingsMutation, recalculateAllScoresMutation, connectEmailMutation, disconnectEmailMutation, connectVoipMutation, disconnectVoipMutation, runEmailSyncMutation, createWorkflowMutation, updateWorkflowMutation, createAdvancedWorkflowMutation, updateAdvancedWorkflowMutation, deleteAdvancedWorkflowMutation, createApiKeyMutation, deleteApiKeyMutation, createTicketMutation, updateTicketMutation, addTicketReplyMutation, createFormMutation, updateFormMutation, deleteFormMutation, submitPublicFormMutation, createCampaignMutation, updateCampaignMutation, launchCampaignMutation, advanceDayMutation, createLandingPageMutation, updateLandingPageMutation, deleteLandingPageMutation, trackPageViewMutation, createCustomReportMutation, updateCustomReportMutation, deleteCustomReportMutation, createDashboardMutation, updateDashboardMutation, deleteDashboardMutation, addDashboardWidgetMutation, removeDashboardWidgetMutation, createOrderMutation, updateOrderMutation, deleteOrderMutation, createTransactionMutation, createCustomObjectDefMutation, updateCustomObjectDefMutation, deleteCustomObjectDefMutation, createCustomObjectRecordMutation, updateCustomObjectRecordMutation, deleteCustomObjectRecordMutation, installAppMutation, uninstallAppMutation, handleNewChatMessageMutation, createSandboxMutation, refreshSandboxMutation, deleteSandboxMutation, createDocumentTemplateMutation, updateDocumentTemplateMutation, deleteDocumentTemplateMutation, updateDocumentTemplatePermissionsMutation, updateDocumentMutation, createProjectMutation, updateProjectMutation, deleteProjectMutation, sendEmailReplyMutation, sendNewEmailMutation, addProjectCommentMutation, postTeamChatMessageMutation, createTeamChannelMutation, updateTeamChannelMembersMutation, createCannedResponseMutation, updateCannedResponseMutation, deleteCannedResponseMutation, createSurveyMutation, updateSurveyMutation, deleteSurveyMutation, createSnapshotMutation, deleteSnapshotMutation, assignChecklistToProjectMutation, updateClientChecklistMutation
    }), [
        organizationsQuery, contactsQuery, teamMembersQuery, rolesQuery, tasksQuery, calendarEventsQuery, productsQuery, suppliersQuery, warehousesQuery, dealStagesQuery, dealsQuery, emailTemplatesQuery, allInteractionsQuery, syncedEmailsQuery, workflowsQuery, advancedWorkflowsQuery, organizationSettingsQuery, apiKeysQuery, ticketsQuery, formsQuery, campaignsQuery, campaignAttributionQuery, landingPagesQuery, customReportsQuery, dashboardsQuery, dashboardWidgetsQuery, customObjectDefsQuery, customObjectRecordsQuery, marketplaceAppsQuery, installedAppsQuery, dashboardDataQuery, sandboxesQuery, documentTemplatesQuery, projectsQuery, projectPhasesQuery, inboxQuery, teamChannelsQuery, teamChannelMessagesQuery, cannedResponsesQuery, surveysQuery, surveyResponsesQuery, snapshotsQuery, clientChecklistTemplatesQuery,
        createOrganizationMutation, updateOrganizationMutation, deleteOrganizationMutation, createContactMutation, updateContactMutation, deleteContactMutation, bulkDeleteContactsMutation, bulkUpdateContactStatusMutation, createUserMutation, updateUserMutation, deleteUserMutation, createRoleMutation, updateRoleMutation, deleteRoleMutation, createInteractionMutation, updateInteractionMutation, createTaskMutation, updateTaskMutation, deleteTaskMutation, createCalendarEventMutation, updateCalendarEventMutation, createProductMutation, updateProductMutation, deleteProductMutation, createSupplierMutation, updateSupplierMutation, deleteSupplierMutation, createWarehouseMutation, updateWarehouseMutation, deleteWarehouseMutation, createDealMutation, updateDealMutation, deleteDealMutation, updateDealStagesMutation, createEmailTemplateMutation, updateEmailTemplateMutation, deleteEmailTemplateMutation, updateCustomFieldsMutation, updateOrganizationSettingsMutation, recalculateAllScoresMutation, connectEmailMutation, disconnectEmailMutation, connectVoipMutation, disconnectVoipMutation, runEmailSyncMutation, createWorkflowMutation, updateWorkflowMutation, createAdvancedWorkflowMutation, updateAdvancedWorkflowMutation, deleteAdvancedWorkflowMutation, createApiKeyMutation, deleteApiKeyMutation, createTicketMutation, updateTicketMutation, addTicketReplyMutation, createFormMutation, updateFormMutation, deleteFormMutation, submitPublicFormMutation, createCampaignMutation, updateCampaignMutation, launchCampaignMutation, advanceDayMutation, createLandingPageMutation, updateLandingPageMutation, deleteLandingPageMutation, trackPageViewMutation, createCustomReportMutation, updateCustomReportMutation, deleteCustomReportMutation, createDashboardMutation, updateDashboardMutation, deleteDashboardMutation, addDashboardWidgetMutation, removeDashboardWidgetMutation, createOrderMutation, updateOrderMutation, deleteOrderMutation, createTransactionMutation, createCustomObjectDefMutation, updateCustomObjectDefMutation, deleteCustomObjectDefMutation, createCustomObjectRecordMutation, updateCustomObjectRecordMutation, deleteCustomObjectRecordMutation, installAppMutation, uninstallAppMutation, handleNewChatMessageMutation, createSandboxMutation, refreshSandboxMutation, deleteSandboxMutation, createDocumentTemplateMutation, updateDocumentTemplateMutation, deleteDocumentTemplateMutation, updateDocumentTemplatePermissionsMutation, updateDocumentMutation, createProjectMutation, updateProjectMutation, deleteProjectMutation, sendEmailReplyMutation, sendNewEmailMutation, addProjectCommentMutation, postTeamChatMessageMutation, createTeamChannelMutation, updateTeamChannelMembersMutation, createCannedResponseMutation, updateCannedResponseMutation, deleteCannedResponseMutation, createSurveyMutation, updateSurveyMutation, deleteSurveyMutation, createSnapshotMutation, deleteSnapshotMutation, assignChecklistToProjectMutation, updateClientChecklistMutation
    ]);

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = (): DataContextType => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};