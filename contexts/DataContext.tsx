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
    // FIX: Changed Notification to AppNotification to match the exported type.
    AppNotification,
    ClientChecklist,
    SubscriptionPlan,
    SystemAuditLogEntry,
    Relationship,
    AudienceProfile,
    DataHealthSummary
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
    subscriptionPlansQuery: any;
    systemAuditLogsQuery: any;
    audienceProfilesQuery: any;
    dataHygieneQuery: any;
    // FIX: Corrected the type definition for `exportAllData` to reflect that it returns an object of file contents, not a single Blob. This resolves a TypeScript error in downstream components.
    exportAllData: () => Promise<{ [key: string]: string }>;

    // Mutations
    createOrganizationMutation: any;
    updateOrganizationMutation: any;
    deleteOrganizationMutation: any;
    createContactMutation: any;
    updateContactMutation: any;
    deleteContactMutation: any;
    bulkDeleteContactsMutation: any;
    bulkUpdateContactStatusMutation: any;
    addContactRelationshipMutation: any;
    deleteContactRelationshipMutation: any;
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
    deleteWorkflowMutation: any;
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
    createSubscriptionPlanMutation: any;
    updateSubscriptionPlanMutation: any;
    deleteSubscriptionPlanMutation: any;
    subscribeContactMutation: any;
    cancelSubscriptionMutation: any;
    paySubscriptionMutation: any;
    createAudienceProfileMutation: any;
    updateAudienceProfileMutation: any;
    deleteAudienceProfileMutation: any;
    importDataMutation: any;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
    children: ReactNode;
}

const FIVE_MINUTES = 1000 * 60 * 5;
const ONE_MINUTE = 1000 * 60 * 1;

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
    const queryClient = useQueryClient();
    const { authenticatedUser, hasPermission } = useAuth();
    const { addNotification } = useNotifications();
    const orgId = authenticatedUser?.organizationId;

    // --- GENERIC MUTATION HANDLERS ---
    const onMutationSuccess = (queryKeys: string | string[], successMessage?: string) => () => {
        if (successMessage) {
            toast.success(successMessage);
        }
        const keysToInvalidate = Array.isArray(queryKeys) ? queryKeys : [queryKeys];
        keysToInvalidate.forEach(key => {
            queryClient.invalidateQueries({ queryKey: [key] });
        });
    };
    const onMutationError = (error: Error) => {
        toast.error(error.message || 'An unexpected error occurred.');
    };

    // --- QUERIES ---
    const organizationsQuery = useQuery({ queryKey: ['organizations'], queryFn: apiClient.getOrganizations, staleTime: FIVE_MINUTES });
    const contactsQuery = useQuery<AnyContact[], Error>({ queryKey: ['contacts', orgId], queryFn: () => apiClient.getContacts(orgId!), enabled: !!orgId, staleTime: ONE_MINUTE });
    const teamMembersQuery = useQuery<User[], Error>({ queryKey: ['teamMembers', orgId], queryFn: () => apiClient.getTeamMembers(orgId!), enabled: !!orgId, staleTime: FIVE_MINUTES });
    const rolesQuery = useQuery<CustomRole[], Error>({ queryKey: ['roles', orgId], queryFn: () => apiClient.getRoles(orgId!), enabled: !!orgId, staleTime: FIVE_MINUTES });
    const tasksQuery = useQuery<Task[], Error>({ queryKey: ['tasks', orgId, authenticatedUser?.id], queryFn: () => apiClient.getTasks(orgId!, authenticatedUser!.id, hasPermission('contacts:read:all')), enabled: !!orgId && !!authenticatedUser, staleTime: ONE_MINUTE });
    const calendarEventsQuery = useQuery<CalendarEvent[], Error>({ queryKey: ['calendarEvents', orgId], queryFn: () => apiClient.getCalendarEvents(orgId!), enabled: !!orgId, staleTime: ONE_MINUTE });
    const productsQuery = useQuery<Product[], Error>({ queryKey: ['products', orgId], queryFn: () => apiClient.getProducts(orgId!), enabled: !!orgId, staleTime: FIVE_MINUTES });
    const suppliersQuery = useQuery<Supplier[], Error>({ queryKey: ['suppliers', orgId], queryFn: () => apiClient.getSuppliers(orgId!), enabled: !!orgId, staleTime: FIVE_MINUTES });
    const warehousesQuery = useQuery<Warehouse[], Error>({ queryKey: ['warehouses', orgId], queryFn: () => apiClient.getWarehouses(orgId!), enabled: !!orgId, staleTime: FIVE_MINUTES });
    const dealStagesQuery = useQuery<DealStage[], Error>({ queryKey: ['dealStages', orgId], queryFn: () => apiClient.getDealStages(orgId!), enabled: !!orgId, staleTime: FIVE_MINUTES });
    const dealsQuery = useQuery<Deal[], Error>({ queryKey: ['deals', orgId], queryFn: () => apiClient.getDeals(orgId!), enabled: !!orgId, staleTime: ONE_MINUTE });
    const emailTemplatesQuery = useQuery<EmailTemplate[], Error>({ queryKey: ['emailTemplates', orgId], queryFn: () => apiClient.getEmailTemplates(orgId!), enabled: !!orgId, staleTime: FIVE_MINUTES });
    const allInteractionsQuery = useQuery<Interaction[], Error>({ queryKey: ['allInteractions', orgId], queryFn: () => apiClient.getInteractions(orgId!), enabled: !!orgId && hasPermission('contacts:read:all'), staleTime: ONE_MINUTE });
    const syncedEmailsQuery = useQuery<Interaction[], Error>({ queryKey: ['syncedEmails', orgId], queryFn: async () => { const all = await apiClient.getInteractions(orgId!); return all.filter(i => i.type === 'Email' && i.notes.includes('(Synced via')); }, enabled: !!orgId && hasPermission('contacts:read:all') });
    const inboxQuery = useQuery<Conversation[], Error>({ queryKey: ['inbox', orgId], queryFn: () => apiClient.getInboxConversations(orgId!), enabled: !!orgId });
    const cannedResponsesQuery = useQuery<CannedResponse[], Error>({ queryKey: ['cannedResponses', orgId], queryFn: () => apiClient.getCannedResponses(orgId!), enabled: !!orgId, staleTime: FIVE_MINUTES });
    const surveysQuery = useQuery<Survey[], Error>({ queryKey: ['surveys', orgId], queryFn: () => apiClient.getSurveys(orgId!), enabled: !!orgId, staleTime: FIVE_MINUTES });
    const surveyResponsesQuery = useQuery<SurveyResponse[], Error>({ queryKey: ['surveyResponses', orgId], queryFn: () => apiClient.getSurveyResponses(orgId!), enabled: !!orgId, staleTime: ONE_MINUTE });
    const workflowsQuery = useQuery<Workflow[], Error>({ queryKey: ['workflows', orgId], queryFn: () => apiClient.getWorkflows(orgId!), enabled: !!orgId, staleTime: FIVE_MINUTES });
    const advancedWorkflowsQuery = useQuery<AdvancedWorkflow[], Error>({ queryKey: ['advancedWorkflows', orgId], queryFn: () => apiClient.getAdvancedWorkflows(orgId!), enabled: !!orgId, staleTime: FIVE_MINUTES });
    const organizationSettingsQuery = useQuery<OrganizationSettings, Error>({ queryKey: ['organizationSettings', orgId], queryFn: () => apiClient.getOrganizationSettings(orgId!), enabled: !!orgId });
    const apiKeysQuery = useQuery<ApiKey[], Error>({ queryKey: ['apiKeys', orgId], queryFn: () => apiClient.getApiKeys(orgId!), enabled: !!orgId });
    const systemAuditLogsQuery = useQuery<SystemAuditLogEntry[], Error>({ queryKey: ['systemAuditLogs', orgId], queryFn: () => apiClient.getSystemAuditLogs(orgId!), enabled: !!orgId, staleTime: ONE_MINUTE });
    const ticketsQuery = useQuery<Ticket[], Error>({ queryKey: ['tickets', orgId], queryFn: () => apiClient.getTickets(orgId!), enabled: !!orgId, staleTime: ONE_MINUTE });
    const formsQuery = useQuery<PublicForm[], Error>({ queryKey: ['forms', orgId], queryFn: () => apiClient.getForms(orgId!), enabled: !!orgId, staleTime: FIVE_MINUTES });
    const campaignsQuery = useQuery<Campaign[], Error>({ queryKey: ['campaigns', orgId], queryFn: () => apiClient.getCampaigns(orgId!), enabled: !!orgId, staleTime: FIVE_MINUTES });
    const campaignAttributionQuery = (campaignId: string) => useQuery<AttributedDeal[], Error>({
        queryKey: ['campaignAttribution', campaignId],
        queryFn: () => apiClient.getCampaignAttribution(campaignId),
        enabled: !!campaignId,
    });
    const landingPagesQuery = useQuery<LandingPage[], Error>({ queryKey: ['landingPages', orgId], queryFn: () => apiClient.getLandingPages(orgId!), enabled: !!orgId, staleTime: FIVE_MINUTES });
    const customReportsQuery = useQuery<CustomReport[], Error>({ queryKey: ['customReports', orgId], queryFn: () => apiClient.getCustomReports(orgId!), enabled: !!orgId, staleTime: FIVE_MINUTES });
    const dashboardsQuery = useQuery<Dashboard[], Error>({ queryKey: ['dashboards', orgId], queryFn: () => apiClient.getDashboards(orgId!), enabled: !!orgId, staleTime: FIVE_MINUTES });
    const dashboardWidgetsQuery = (dashboardId: string) => useQuery<DashboardWidget[], Error>({ queryKey: ['dashboardWidgets', dashboardId], queryFn: () => apiClient.getDashboardWidgets(dashboardId), enabled: !!dashboardId });
    const dashboardDataQuery = useQuery<DashboardData, Error>({ queryKey: ['dashboardData', orgId], queryFn: () => apiClient.getDashboardData(orgId!), enabled: !!orgId });
    const customObjectDefsQuery = useQuery<CustomObjectDefinition[], Error>({ queryKey: ['customObjectDefs', orgId], queryFn: () => apiClient.getCustomObjectDefs(orgId!), enabled: !!orgId, staleTime: FIVE_MINUTES });
    const customObjectRecordsQuery = (defId: string | null) => useQuery<CustomObjectRecord[], Error>({ queryKey: ['customObjectRecords', defId], queryFn: () => apiClient.getCustomObjectRecords(defId), enabled: defId !== undefined, staleTime: ONE_MINUTE });
    const marketplaceAppsQuery = useQuery<AppMarketplaceItem[], Error>({ queryKey: ['marketplaceApps'], queryFn: () => apiClient.getMarketplaceApps(orgId!), enabled: !!orgId, staleTime: FIVE_MINUTES });
    const installedAppsQuery = useQuery<InstalledApp[], Error>({ queryKey: ['installedApps', orgId], queryFn: () => apiClient.getInstalledApps(orgId!), enabled: !!orgId });
    const sandboxesQuery = useQuery<Sandbox[], Error>({ queryKey: ['sandboxes', orgId], queryFn: () => apiClient.getSandboxes(orgId!), enabled: !!orgId });
    const documentTemplatesQuery = useQuery<DocumentTemplate[], Error>({ queryKey: ['documentTemplates', orgId], queryFn: () => apiClient.getDocumentTemplates(orgId!), enabled: !!orgId, staleTime: FIVE_MINUTES });
    const projectsQuery = useQuery<Project[], Error>({ queryKey: ['projects', orgId], queryFn: () => apiClient.getProjects(orgId!), enabled: !!orgId, staleTime: ONE_MINUTE });
    const projectPhasesQuery = useQuery<ProjectPhase[], Error>({ queryKey: ['projectPhases', orgId], queryFn: () => apiClient.getProjectPhases(orgId!), enabled: !!orgId, staleTime: FIVE_MINUTES });
    const teamChannelsQuery = useQuery<TeamChannel[], Error>({ queryKey: ['teamChannels', orgId], queryFn: () => apiClient.getTeamChannels(orgId!), enabled: !!orgId });
    const teamChannelMessagesQuery = (channelId: string | null) => useQuery<TeamChatMessage[], Error>({ queryKey: ['teamChannelMessages', channelId], queryFn: () => apiClient.getTeamChannelMessages(channelId!), enabled: !!channelId });
    const snapshotsQuery = useQuery<Snapshot[], Error>({ queryKey: ['snapshots', orgId], queryFn: () => apiClient.getSnapshots(orgId!), enabled: !!orgId });
    const clientChecklistTemplatesQuery = useQuery({ queryKey: ['clientChecklistTemplates', orgId], queryFn: () => apiClient.getClientChecklistTemplates(orgId!), enabled: !!orgId, staleTime: FIVE_MINUTES });
    const subscriptionPlansQuery = useQuery<SubscriptionPlan[], Error>({ queryKey: ['subscriptionPlans', orgId], queryFn: () => apiClient.getSubscriptionPlans(orgId!), enabled: !!orgId, staleTime: FIVE_MINUTES });
    const audienceProfilesQuery = useQuery<AudienceProfile[], Error>({ queryKey: ['audienceProfiles', orgId], queryFn: () => apiClient.getAudienceProfiles(orgId!), enabled: !!orgId, staleTime: FIVE_MINUTES });
    const dataHygieneQuery = useQuery<DataHealthSummary, Error>({ queryKey: ['dataHygiene', orgId], queryFn: () => apiClient.getDataHygieneSuggestions(orgId!), enabled: !!orgId, staleTime: ONE_MINUTE });
    const interactionsQuery = allInteractionsQuery;

    // --- MUTATIONS ---
    const useGenericMutation = <TVariables, TData>(mutationFn: (variables: TVariables) => Promise<TData>, successKeys: string | string[], successMessage?: string) => useMutation<TData, Error, TVariables>({ mutationFn, onSuccess: onMutationSuccess(successKeys, successMessage), onError: onMutationError });
    
    // Mutations wrapped in arrow functions to ensure correct argument passing
    const createOrganizationMutation = useGenericMutation((vars: Omit<Organization, 'id' | 'createdAt'>) => apiClient.createOrganization(vars), 'organizations', 'Organization created!');
    const updateOrganizationMutation = useGenericMutation((vars: Organization) => apiClient.updateOrganization(vars), 'organizations', 'Organization updated!');
    const deleteOrganizationMutation = useGenericMutation((id: string) => apiClient.deleteOrganization(id), 'organizations', 'Organization deleted!');
    
    const createContactMutation = useGenericMutation((vars: Omit<AnyContact, 'id'>) => apiClient.createContact(vars), ['contacts', 'dataHygiene'], 'Contact created!');
    const updateContactMutation = useGenericMutation((vars: AnyContact) => apiClient.updateContact(vars), ['contacts', 'allInteractions', 'dataHygiene'], 'Contact updated!');
    const deleteContactMutation = useGenericMutation((id: string) => apiClient.deleteContact(id), ['contacts', 'dataHygiene'], 'Contact deleted!');
    const bulkDeleteContactsMutation = useGenericMutation((ids: string[]) => apiClient.bulkDeleteContacts(ids), 'contacts', 'Contacts deleted.');
    const bulkUpdateContactStatusMutation = useGenericMutation((vars: {ids: string[], status: ContactStatus}) => apiClient.bulkUpdateContactStatus(vars), 'contacts', 'Contact statuses updated.');
    const addContactRelationshipMutation = useGenericMutation((vars: { contactId: string, relationship: Relationship }) => apiClient.addContactRelationship(vars), 'contacts', 'Relationship added.');
    const deleteContactRelationshipMutation = useGenericMutation((vars: { contactId: string, relatedContactId: string }) => apiClient.deleteContactRelationship(vars), 'contacts', 'Relationship removed.');
    
    const createUserMutation = useGenericMutation((vars: Omit<User, 'id'>) => apiClient.createUser(vars), 'teamMembers');
    const updateUserMutation = useGenericMutation((vars: User) => apiClient.updateUser(vars), 'teamMembers', 'Team member updated.');
    const deleteUserMutation = useGenericMutation((id: string) => apiClient.deleteUser(id), 'teamMembers', 'Team member removed.');
    
    const createRoleMutation = useGenericMutation((vars: Omit<CustomRole, 'id'>) => apiClient.createRole(vars), 'roles', 'Role created!');
    const updateRoleMutation = useGenericMutation((vars: CustomRole) => apiClient.updateRole(vars), 'roles', 'Role updated!');
    const deleteRoleMutation = useGenericMutation((id: string) => apiClient.deleteRole(id), 'roles', 'Role deleted!');
    
    const createInteractionMutation = useGenericMutation((vars: Omit<Interaction, 'id'>) => apiClient.createInteraction(vars), ['allInteractions', 'contacts'], 'Interaction logged!');
    const updateInteractionMutation = useGenericMutation((vars: Interaction) => apiClient.updateInteraction(vars), ['allInteractions', 'contacts'], 'Interaction updated!');
    
    const createTaskMutation = useGenericMutation((vars: Omit<Task, 'id' | 'isCompleted'>) => apiClient.createTask(vars), 'tasks', 'Task created!');
    const updateTaskMutation = useGenericMutation((vars: Task) => apiClient.updateTask(vars), 'tasks');
    const deleteTaskMutation = useGenericMutation((id: string) => apiClient.deleteTask(id), 'tasks', 'Task deleted!');
    
    const createCalendarEventMutation = useGenericMutation((vars: Omit<CalendarEvent, 'id'>) => apiClient.createCalendarEvent(vars), 'calendarEvents');
    const updateCalendarEventMutation = useGenericMutation((vars: CalendarEvent) => apiClient.updateCalendarEvent(vars), 'calendarEvents');
    
    const createProductMutation = useGenericMutation((vars: Omit<Product, 'id'>) => apiClient.createProduct(vars), ['products', 'dataHygiene'], 'Product created!');
    const updateProductMutation = useGenericMutation((vars: Product) => apiClient.updateProduct(vars), ['products', 'dataHygiene'], 'Product updated!');
    const deleteProductMutation = useGenericMutation((id: string) => apiClient.deleteProduct(id), ['products', 'dataHygiene'], 'Product deleted!');

    const createSupplierMutation = useGenericMutation((vars: Omit<Supplier, 'id'>) => apiClient.createSupplier(vars), 'suppliers', 'Supplier created!');
    const updateSupplierMutation = useGenericMutation((vars: Supplier) => apiClient.updateSupplier(vars), 'suppliers', 'Supplier updated!');
    const deleteSupplierMutation = useGenericMutation((id: string) => apiClient.deleteSupplier(id), 'suppliers', 'Supplier deleted!');

    const createWarehouseMutation = useGenericMutation((vars: Omit<Warehouse, 'id'>) => apiClient.createWarehouse(vars), 'warehouses', 'Warehouse created!');
    const updateWarehouseMutation = useGenericMutation((vars: Warehouse) => apiClient.updateWarehouse(vars), 'warehouses', 'Warehouse updated!');
    const deleteWarehouseMutation = useGenericMutation((id: string) => apiClient.deleteWarehouse(id), 'warehouses', 'Warehouse deleted!');
    
    const createDealMutation = useGenericMutation((vars: Omit<Deal, 'id' | 'createdAt'>) => apiClient.createDeal(vars), 'deals', 'Deal created!');
    const updateDealMutation = useGenericMutation((vars: Deal) => apiClient.updateDeal(vars), 'deals', 'Deal updated!');
    const deleteDealMutation = useGenericMutation((id: string) => apiClient.deleteDeal(id), 'deals', 'Deal deleted!');
    const updateDealStagesMutation = useGenericMutation((vars: { orgId: string, stages: string[] }) => apiClient.updateDealStages(vars), 'dealStages');
    const createEmailTemplateMutation = useGenericMutation((vars: Omit<EmailTemplate, 'id'>) => apiClient.createEmailTemplate(vars), 'emailTemplates', 'Template created!');
    const updateEmailTemplateMutation = useGenericMutation((vars: EmailTemplate) => apiClient.updateEmailTemplate(vars), 'emailTemplates', 'Template updated!');
    const deleteEmailTemplateMutation = useGenericMutation((id: string) => apiClient.deleteEmailTemplate(id), 'emailTemplates', 'Template deleted!');
    
    const updateCustomFieldsMutation = useGenericMutation((vars: { industry: Industry, fields: any[] }) => apiClient.updateCustomFields(vars), 'industryConfig', 'Custom fields updated!');
    
    const updateOrganizationSettingsMutation = useGenericMutation((vars: Partial<OrganizationSettings>) => apiClient.updateOrganizationSettings(vars), 'organizationSettings');
    const recalculateAllScoresMutation = useGenericMutation((orgId: string) => apiClient.recalculateAllScores(orgId), 'contacts', "Recalculation started!");
    const connectEmailMutation = useGenericMutation(() => Promise.resolve(), 'organizationSettings'); // Simplified
    const disconnectEmailMutation = useGenericMutation(() => Promise.resolve(), 'organizationSettings'); // Simplified
    const connectVoipMutation = useGenericMutation(() => Promise.resolve(), 'organizationSettings'); // Simplified
    const disconnectVoipMutation = useGenericMutation(() => Promise.resolve(), 'organizationSettings'); // Simplified
    const runEmailSyncMutation = useGenericMutation((orgId: string) => apiClient.runEmailSync(orgId), ['syncedEmails', 'organizationSettings', 'allInteractions'], 'Email sync started!');

    const createWorkflowMutation = useGenericMutation((vars: Omit<Workflow, 'id'>) => apiClient.createWorkflow(vars), 'workflows');
    const updateWorkflowMutation = useGenericMutation((vars: Workflow) => apiClient.updateWorkflow(vars), 'workflows');
    const deleteWorkflowMutation = useGenericMutation((id: string) => apiClient.deleteWorkflow(id), 'workflows');

    const createAdvancedWorkflowMutation = useGenericMutation((vars: Omit<AdvancedWorkflow, 'id'>) => apiClient.createAdvancedWorkflow(vars), ['advancedWorkflows', 'workflows']);
    const updateAdvancedWorkflowMutation = useGenericMutation((vars: AdvancedWorkflow) => apiClient.updateAdvancedWorkflow(vars), ['advancedWorkflows', 'workflows']);
    const deleteAdvancedWorkflowMutation = useGenericMutation((id: string) => apiClient.deleteAdvancedWorkflow(id), ['advancedWorkflows', 'workflows'], 'Workflow deleted.');
    
    const createApiKeyMutation = useGenericMutation((vars: { orgId: string, name: string }) => apiClient.createApiKey(vars), 'apiKeys');
    const deleteApiKeyMutation = useGenericMutation((id: string) => apiClient.deleteApiKey(id), 'apiKeys', 'API Key revoked.');

    const createTicketMutation = useGenericMutation((vars: Omit<Ticket, 'id'|'createdAt'|'updatedAt'|'replies'>) => apiClient.createTicket(vars), 'tickets', 'Ticket created!');
    const updateTicketMutation = useGenericMutation((vars: Ticket) => apiClient.updateTicket(vars), 'tickets');
    const addTicketReplyMutation = useGenericMutation((vars: { ticketId: string, reply: Omit<TicketReply, 'id' | 'timestamp'> }) => apiClient.addTicketReply(vars), 'tickets', 'Reply sent!');

    const createFormMutation = useGenericMutation((vars: any) => apiClient.createForm(vars), 'forms', 'Form created!');
    const updateFormMutation = useGenericMutation((vars: PublicForm) => apiClient.updateForm(vars), 'forms', 'Form updated!');
    const deleteFormMutation = useGenericMutation((id: string) => apiClient.deleteForm(id), 'forms', 'Form deleted!');
    const submitPublicFormMutation = useMutation({ mutationFn: (data: any) => apiClient.submitPublicForm(data), onSuccess: onMutationSuccess(['contacts', 'allInteractions']), onError: onMutationError });

    const createCampaignMutation = useGenericMutation((vars: any) => apiClient.createCampaign(vars), 'campaigns', 'Campaign created!');
    const updateCampaignMutation = useGenericMutation((vars: Campaign) => apiClient.updateCampaign(vars), 'campaigns', 'Campaign updated!');
    const launchCampaignMutation = useGenericMutation((id: string) => apiClient.launchCampaign(id), ['campaigns', 'contacts'], 'Campaign launched!');
    const advanceDayMutation = useGenericMutation((currentDate: Date) => apiClient.advanceDay(currentDate), ['campaigns', 'contacts', 'allInteractions'], 'Advanced to the next day!');

    const createLandingPageMutation = useGenericMutation((vars: any) => apiClient.createLandingPage(vars), 'landingPages', 'Landing page created!');
    const updateLandingPageMutation = useGenericMutation((vars: LandingPage) => apiClient.updateLandingPage(vars), 'landingPages', 'Landing page updated!');
    const deleteLandingPageMutation = useGenericMutation((id: string) => apiClient.deleteLandingPage(id), 'landingPages', 'Landing page deleted!');
    const trackPageViewMutation = useMutation({ mutationFn: (data: { sessionId: string, orgId: string, url: string }) => apiClient.trackPageView(data) });
    
    const createCustomReportMutation = useGenericMutation((vars: any) => apiClient.createCustomReport(vars), 'customReports', 'Report created!');
    const updateCustomReportMutation = useGenericMutation((vars: CustomReport) => apiClient.updateCustomReport(vars), 'customReports', 'Report updated!');
    const deleteCustomReportMutation = useGenericMutation((id: string) => apiClient.deleteCustomReport(id), 'customReports', 'Report deleted!');

    const createDashboardMutation = useGenericMutation((data: { orgId: string, name: string }) => apiClient.createDashboard(data), 'dashboards', 'Dashboard created!');
    const updateDashboardMutation = useGenericMutation((data: { id: string, name: string }) => apiClient.updateDashboard(data), 'dashboards', 'Dashboard renamed!');
    const deleteDashboardMutation = useGenericMutation((id: string) => apiClient.deleteDashboard(id), 'dashboards', 'Dashboard deleted!');
    
    const addDashboardWidgetMutation = useGenericMutation((vars: { reportId: string; dashboardId: string }) => apiClient.addDashboardWidget(vars), 'dashboardWidgets', 'Widget added!');
    const removeDashboardWidgetMutation = useGenericMutation((id: string) => apiClient.removeDashboardWidget(id), 'dashboardWidgets', 'Widget removed!');

    const createOrderMutation = useGenericMutation((vars: Omit<Order, 'id'>) => apiClient.createOrder(vars), ['contacts', 'allInteractions'], 'Order created!');
    const updateOrderMutation = useGenericMutation((vars: Order) => apiClient.updateOrder(vars), ['contacts', 'allInteractions'], 'Order updated!');
    const deleteOrderMutation = useGenericMutation((vars: { contactId: string, orderId: string }) => apiClient.deleteOrder(vars), ['contacts', 'allInteractions'], 'Order deleted!');
    const createTransactionMutation = useGenericMutation((vars: { contactId: string, data: Omit<Transaction, 'id'> }) => apiClient.createTransaction(vars), ['contacts', 'allInteractions'], 'Transaction created!');
    
    const createCustomObjectDefMutation = useGenericMutation((vars: any) => apiClient.createCustomObjectDef(vars), 'customObjectDefs', 'Object definition created!');
    const updateCustomObjectDefMutation = useGenericMutation((vars: CustomObjectDefinition) => apiClient.updateCustomObjectDef(vars), 'customObjectDefs', 'Object definition updated!');
    const deleteCustomObjectDefMutation = useGenericMutation((id: string) => apiClient.deleteCustomObjectDef(id), 'customObjectDefs', 'Object definition deleted!');

    const createCustomObjectRecordMutation = useGenericMutation((vars: any) => apiClient.createCustomObjectRecord(vars), 'customObjectRecords', 'Record created!');
    const updateCustomObjectRecordMutation = useGenericMutation((vars: CustomObjectRecord) => apiClient.updateCustomObjectRecord(vars), 'customObjectRecords', 'Record updated!');
    const deleteCustomObjectRecordMutation = useGenericMutation((id: string) => apiClient.deleteCustomObjectRecord(id), 'customObjectRecords', 'Record deleted!');

    const installAppMutation = useGenericMutation((appId: string) => apiClient.installApp(appId), 'installedApps', 'App installed!');
    const uninstallAppMutation = useGenericMutation((id: string) => apiClient.uninstallApp(id), 'installedApps', 'App uninstalled.');
    
    const handleNewChatMessageMutation = useMutation({ mutationFn: (data: any) => apiClient.handleNewChatMessage(data), onSuccess: onMutationSuccess(['tickets', 'contacts']) });

    const createSandboxMutation = useGenericMutation((data: { orgId: string, name: string }) => apiClient.createSandbox(data), 'sandboxes', 'Sandbox created!');
    const refreshSandboxMutation = useGenericMutation((sandboxId: string) => apiClient.refreshSandbox(sandboxId), 'sandboxes', 'Sandbox refreshed!');
    const deleteSandboxMutation = useGenericMutation((id: string) => apiClient.deleteSandbox(id), 'sandboxes', 'Sandbox deleted.');

    const createDocumentTemplateMutation = useGenericMutation((data: Omit<DocumentTemplate, 'id'>) => apiClient.createDocumentTemplate(data), 'documentTemplates', 'Template created!');
    const updateDocumentTemplateMutation = useGenericMutation((data: DocumentTemplate) => apiClient.updateDocumentTemplate(data), 'documentTemplates', 'Template updated!');
    const deleteDocumentTemplateMutation = useGenericMutation((id: string) => apiClient.deleteDocumentTemplate(id), 'documentTemplates', 'Template deleted!');
    const updateDocumentTemplatePermissionsMutation = useGenericMutation((vars: { id: string, permissions: DocumentPermission[] }) => apiClient.updateDocumentTemplatePermissions(vars.id, vars.permissions), 'documentTemplates');

    const updateDocumentMutation = useGenericMutation((data: Document) => apiClient.updateDocument(data), 'documents');

    const createProjectMutation = useGenericMutation((data: Omit<Project, 'id'|'createdAt'>) => apiClient.createProject(data), ['projects', 'tasks'], 'Project created!');
    const updateProjectMutation = useGenericMutation((data: Project) => apiClient.updateProject(data), 'projects', 'Project updated!');
    const deleteProjectMutation = useGenericMutation((id: string) => apiClient.deleteProject(id), 'projects', 'Project deleted!');
    
    const sendEmailReplyMutation = useMutation({ mutationFn: (data: { contactId: string, userId: string, subject: string, body: string }) => apiClient.sendEmailReply(data), onSuccess: onMutationSuccess(['inbox', 'allInteractions', 'contacts'], 'Reply sent!') });
    const sendNewEmailMutation = useMutation({ mutationFn: (data: { contactId: string, userId: string, subject: string, body: string }) => apiClient.sendNewEmail(data), onSuccess: onMutationSuccess(['inbox', 'allInteractions', 'contacts'], 'Email sent!') });

    const addProjectCommentMutation = useMutation({ mutationFn: (data: { projectId: string; comment: Omit<ProjectComment, 'id' | 'timestamp'> }) => apiClient.addProjectComment(data), onSuccess: (updatedProject, vars) => {
        onMutationSuccess('projects')();
        // Check for @mentions and send notifications
        const userMentionRegex = /@([A-Za-z\s]+)/;
        const match = vars.comment.message.match(userMentionRegex);
        if (match) {
            const mentionedName = match[1].trim();
            const mentionedUser = teamMembersQuery.data?.find(u => u.name === mentionedName);
            const sender = teamMembersQuery.data?.find(u => u.id === vars.comment.userId);
            const project = projectsQuery.data?.find(p => p.id === vars.projectId);
            if (mentionedUser && sender && project) {
                addNotification({
                    userId: mentionedUser.id,
                    type: 'mention',
                    message: `${sender.name} mentioned you in project: ${project.name}`,
                    linkTo: { page: 'Projects', recordId: project.id }
                });
            }
        }
    }});

    const postTeamChatMessageMutation = useMutation({
        mutationFn: (data: { channelId: string, userId: string, message: string, threadId?: string }) => apiClient.postTeamChatMessage(data),
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['teamChannelMessages', result.message.channelId] });
            result.notifications.forEach(addNotification);
        }
    });

    const createTeamChannelMutation = useGenericMutation((data: Omit<TeamChannel, 'id'>) => apiClient.createTeamChannel(data), 'teamChannels', 'Channel created!');
    const updateTeamChannelMembersMutation = useGenericMutation((data: { channelId: string, memberIds: string[] }) => apiClient.updateTeamChannelMembers(data), 'teamChannels', 'Members updated.');
    
    const createCannedResponseMutation = useGenericMutation((data: Omit<CannedResponse, 'id'>) => apiClient.createCannedResponse(data), 'cannedResponses', 'Response created!');
    const updateCannedResponseMutation = useGenericMutation((data: CannedResponse) => apiClient.updateCannedResponse(data), 'cannedResponses', 'Response updated!');
    const deleteCannedResponseMutation = useGenericMutation((id: string) => apiClient.deleteCannedResponse(id), 'cannedResponses', 'Response deleted!');
    
    const createSurveyMutation = useGenericMutation((data: Omit<Survey, 'id'|'createdAt'>) => apiClient.createSurvey(data), 'surveys', 'Survey created!');
    const updateSurveyMutation = useGenericMutation((data: Survey) => apiClient.updateSurvey(data), 'surveys', 'Survey updated!');
    const deleteSurveyMutation = useGenericMutation((id: string) => apiClient.deleteSurvey(id), 'surveys', 'Survey deleted!');

    const createSnapshotMutation = useGenericMutation((data: { orgId: string, name: string, dataSource: 'contacts' | 'deals' }) => apiClient.createSnapshot(data), 'snapshots', 'Snapshot created!');
    const deleteSnapshotMutation = useGenericMutation((id: string) => apiClient.deleteSnapshot(id), 'snapshots', 'Snapshot deleted!');

    const assignChecklistToProjectMutation = useGenericMutation((data: { projectId: string, templateId: string }) => apiClient.assignChecklistToProject(data), 'projects', 'Checklist assigned!');
    const updateClientChecklistMutation = useGenericMutation((data: { projectId: string, checklist: ClientChecklist }) => apiClient.updateClientChecklist(data), 'projects');
    
    const createSubscriptionPlanMutation = useGenericMutation((data: Omit<SubscriptionPlan, 'id'>) => apiClient.createSubscriptionPlan(data), 'subscriptionPlans', 'Plan created!');
    const updateSubscriptionPlanMutation = useGenericMutation((data: SubscriptionPlan) => apiClient.updateSubscriptionPlan(data), 'subscriptionPlans', 'Plan updated!');
    const deleteSubscriptionPlanMutation = useGenericMutation((id: string) => apiClient.deleteSubscriptionPlan(id), 'subscriptionPlans', 'Plan deleted!');

    const subscribeContactMutation = useGenericMutation((data: { contactId: string; planId: string }) => apiClient.subscribeContact(data), 'contacts', 'Subscription added!');
    const cancelSubscriptionMutation = useGenericMutation((data: { contactId: string; subscriptionId: string }) => apiClient.cancelSubscription(data), 'contacts', 'Subscription cancelled.');
    const paySubscriptionMutation = useGenericMutation((data: { contactId: string; subscriptionId: string }) => apiClient.paySubscription(data), 'contacts');
    
    const createAudienceProfileMutation = useGenericMutation((vars: Omit<AudienceProfile, 'id'>) => apiClient.createAudienceProfile(vars), 'audienceProfiles', 'Profile created!');
    const updateAudienceProfileMutation = useGenericMutation((vars: AudienceProfile) => apiClient.updateAudienceProfile(vars), 'audienceProfiles', 'Profile updated!');
    const deleteAudienceProfileMutation = useGenericMutation((id: string) => apiClient.deleteAudienceProfile(id), 'audienceProfiles', 'Profile deleted!');
    
    const importDataMutation = useMutation({
        mutationFn: (data: { [key: string]: string }) => apiClient.importData(data),
        onSuccess: () => {
            // Invalidate all queries that could be affected by new data
            queryClient.invalidateQueries({ queryKey: ['contacts'] });
            queryClient.invalidateQueries({ queryKey: ['deals'] });
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            
            // Invalidate aggregate/dashboard queries
            queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
            queryClient.invalidateQueries({ queryKey: ['dataHygiene'] });
        }
    });


    const value: DataContextType = useMemo(() => ({
        organizationsQuery, contactsQuery, teamMembersQuery, rolesQuery, tasksQuery, calendarEventsQuery, productsQuery, suppliersQuery, warehousesQuery, dealStagesQuery, dealsQuery, emailTemplatesQuery, allInteractionsQuery, syncedEmailsQuery, workflowsQuery, advancedWorkflowsQuery, organizationSettingsQuery, apiKeysQuery, ticketsQuery, formsQuery, campaignsQuery, campaignAttributionQuery, landingPagesQuery, customReportsQuery, dashboardsQuery, dashboardWidgetsQuery, customObjectDefsQuery, customObjectRecordsQuery, marketplaceAppsQuery, installedAppsQuery, dashboardDataQuery, sandboxesQuery, documentTemplatesQuery, projectsQuery, projectPhasesQuery, inboxQuery, teamChannelsQuery, teamChannelMessagesQuery, cannedResponsesQuery, surveysQuery, surveyResponsesQuery, snapshotsQuery, clientChecklistTemplatesQuery, subscriptionPlansQuery, systemAuditLogsQuery, audienceProfilesQuery, dataHygieneQuery, exportAllData: apiClient.exportAllData,
        createOrganizationMutation, updateOrganizationMutation, deleteOrganizationMutation, createContactMutation, updateContactMutation, deleteContactMutation, bulkDeleteContactsMutation, bulkUpdateContactStatusMutation, addContactRelationshipMutation, deleteContactRelationshipMutation, createUserMutation, updateUserMutation, deleteUserMutation, createRoleMutation, updateRoleMutation, deleteRoleMutation, createInteractionMutation, updateInteractionMutation, createTaskMutation, updateTaskMutation, deleteTaskMutation, createCalendarEventMutation, updateCalendarEventMutation, createProductMutation, updateProductMutation, deleteProductMutation, createSupplierMutation, updateSupplierMutation, deleteSupplierMutation, createWarehouseMutation, updateWarehouseMutation, deleteWarehouseMutation, createDealMutation, updateDealMutation, deleteDealMutation, updateDealStagesMutation, createEmailTemplateMutation, updateEmailTemplateMutation, deleteEmailTemplateMutation, updateCustomFieldsMutation, updateOrganizationSettingsMutation, recalculateAllScoresMutation, connectEmailMutation, disconnectEmailMutation, connectVoipMutation, disconnectVoipMutation, runEmailSyncMutation, createWorkflowMutation, updateWorkflowMutation, deleteWorkflowMutation, createAdvancedWorkflowMutation, updateAdvancedWorkflowMutation, deleteAdvancedWorkflowMutation, createApiKeyMutation, deleteApiKeyMutation, createTicketMutation, updateTicketMutation, addTicketReplyMutation, createFormMutation, updateFormMutation, deleteFormMutation, submitPublicFormMutation, createCampaignMutation, updateCampaignMutation, launchCampaignMutation, advanceDayMutation, createLandingPageMutation, updateLandingPageMutation, deleteLandingPageMutation, trackPageViewMutation, createCustomReportMutation, updateCustomReportMutation, deleteCustomReportMutation, createDashboardMutation, updateDashboardMutation, deleteDashboardMutation, addDashboardWidgetMutation, removeDashboardWidgetMutation, createOrderMutation, updateOrderMutation, deleteOrderMutation, createTransactionMutation, createCustomObjectDefMutation, updateCustomObjectDefMutation, deleteCustomObjectDefMutation, createCustomObjectRecordMutation, updateCustomObjectRecordMutation, deleteCustomObjectRecordMutation, installAppMutation, uninstallAppMutation, handleNewChatMessageMutation, createSandboxMutation, refreshSandboxMutation, deleteSandboxMutation, createDocumentTemplateMutation, updateDocumentTemplateMutation, deleteDocumentTemplateMutation, updateDocumentTemplatePermissionsMutation, updateDocumentMutation, createProjectMutation, updateProjectMutation, deleteProjectMutation, sendEmailReplyMutation, sendNewEmailMutation, addProjectCommentMutation, postTeamChatMessageMutation, createTeamChannelMutation, updateTeamChannelMembersMutation, createCannedResponseMutation, updateCannedResponseMutation, deleteCannedResponseMutation, createSurveyMutation, updateSurveyMutation, deleteSurveyMutation, createSnapshotMutation, deleteSnapshotMutation, assignChecklistToProjectMutation, updateClientChecklistMutation, createSubscriptionPlanMutation, updateSubscriptionPlanMutation, deleteSubscriptionPlanMutation, subscribeContactMutation, cancelSubscriptionMutation, paySubscriptionMutation, createAudienceProfileMutation, updateAudienceProfileMutation, deleteAudienceProfileMutation, importDataMutation,
    }), [
        organizationsQuery, contactsQuery, teamMembersQuery, rolesQuery, tasksQuery, calendarEventsQuery, productsQuery, suppliersQuery, warehousesQuery, dealStagesQuery, dealsQuery, emailTemplatesQuery, allInteractionsQuery, syncedEmailsQuery, workflowsQuery, advancedWorkflowsQuery, organizationSettingsQuery, apiKeysQuery, ticketsQuery, formsQuery, campaignsQuery, landingPagesQuery, customReportsQuery, dashboardsQuery, customObjectDefsQuery, marketplaceAppsQuery, installedAppsQuery, dashboardDataQuery, sandboxesQuery, documentTemplatesQuery, projectsQuery, projectPhasesQuery, inboxQuery, teamChannelsQuery, cannedResponsesQuery, surveysQuery, surveyResponsesQuery, snapshotsQuery, clientChecklistTemplatesQuery, subscriptionPlansQuery, systemAuditLogsQuery, audienceProfilesQuery, dataHygieneQuery,
        createOrganizationMutation, updateOrganizationMutation, deleteOrganizationMutation, createContactMutation, updateContactMutation, deleteContactMutation, bulkDeleteContactsMutation, bulkUpdateContactStatusMutation, addContactRelationshipMutation, deleteContactRelationshipMutation, createUserMutation, updateUserMutation, deleteUserMutation, createRoleMutation, updateRoleMutation, deleteRoleMutation, createInteractionMutation, updateInteractionMutation, createTaskMutation, updateTaskMutation, deleteTaskMutation, createCalendarEventMutation, updateCalendarEventMutation, createProductMutation, updateProductMutation, deleteProductMutation, createSupplierMutation, updateSupplierMutation, deleteSupplierMutation, createWarehouseMutation, updateWarehouseMutation, deleteWarehouseMutation, createDealMutation, updateDealMutation, deleteDealMutation, updateDealStagesMutation, createEmailTemplateMutation, updateEmailTemplateMutation, deleteEmailTemplateMutation, updateCustomFieldsMutation, updateOrganizationSettingsMutation, recalculateAllScoresMutation, connectEmailMutation, disconnectEmailMutation, connectVoipMutation, disconnectVoipMutation, runEmailSyncMutation, createWorkflowMutation, updateWorkflowMutation, deleteWorkflowMutation, createAdvancedWorkflowMutation, updateAdvancedWorkflowMutation, deleteAdvancedWorkflowMutation, createApiKeyMutation, deleteApiKeyMutation, createTicketMutation, updateTicketMutation, addTicketReplyMutation, createFormMutation, updateFormMutation, deleteFormMutation, submitPublicFormMutation, createCampaignMutation, updateCampaignMutation, launchCampaignMutation, advanceDayMutation, createLandingPageMutation, updateLandingPageMutation, deleteLandingPageMutation, trackPageViewMutation, createCustomReportMutation, updateCustomReportMutation, deleteCustomReportMutation, createDashboardMutation, updateDashboardMutation, deleteDashboardMutation, addDashboardWidgetMutation, removeDashboardWidgetMutation, createOrderMutation, updateOrderMutation, deleteOrderMutation, createTransactionMutation, createCustomObjectDefMutation, updateCustomObjectDefMutation, deleteCustomObjectDefMutation, createCustomObjectRecordMutation, updateCustomObjectRecordMutation, deleteCustomObjectRecordMutation, installAppMutation, uninstallAppMutation, handleNewChatMessageMutation, createSandboxMutation, refreshSandboxMutation, deleteSandboxMutation, createDocumentTemplateMutation, updateDocumentTemplateMutation, deleteDocumentTemplateMutation, updateDocumentTemplatePermissionsMutation, updateDocumentMutation, createProjectMutation, updateProjectMutation, deleteProjectMutation, sendEmailReplyMutation, sendNewEmailMutation, addProjectCommentMutation, postTeamChatMessageMutation, createTeamChannelMutation, updateTeamChannelMembersMutation, createCannedResponseMutation, updateCannedResponseMutation, deleteCannedResponseMutation, createSurveyMutation, updateSurveyMutation, deleteSurveyMutation, createSnapshotMutation, deleteSnapshotMutation, assignChecklistToProjectMutation, updateClientChecklistMutation, createSubscriptionPlanMutation, updateSubscriptionPlanMutation, deleteSubscriptionPlanMutation, subscribeContactMutation, cancelSubscriptionMutation, paySubscriptionMutation, createAudienceProfileMutation, updateAudienceProfileMutation, deleteAudienceProfileMutation, importDataMutation,
        campaignAttributionQuery, dashboardWidgetsQuery, customObjectRecordsQuery, teamChannelMessagesQuery
    ]);


    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};

// FIX: Add missing useData hook to export context values.
export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};