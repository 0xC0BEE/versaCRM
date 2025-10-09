import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// FIX: Corrected import path for apiClient from a file path to a relative module path.
import apiClient from '../services/apiClient';
import { useAuth } from './AuthContext';
import { AnyContact, Organization, User, CustomRole, Task, CalendarEvent, Product, Deal, DealStage, EmailTemplate, Workflow, AdvancedWorkflow, OrganizationSettings, ApiKey, Ticket, PublicForm, Campaign, Supplier, Warehouse, Interaction, CustomReport, DashboardWidget, LandingPage, TicketReply } from '../types';
import toast from 'react-hot-toast';

interface DataContextType {
    organizationsQuery: any;
    createOrganizationMutation: any;
    updateOrganizationMutation: any;
    deleteOrganizationMutation: any;
    
    contactsQuery: any;
    createContactMutation: any;
    updateContactMutation: any;
    deleteContactMutation: any;
    bulkDeleteContactsMutation: any;
    bulkUpdateContactStatusMutation: any;

    teamMembersQuery: any;
    createUserMutation: any;
    updateUserMutation: any;
    deleteUserMutation: any;

    rolesQuery: any;
    createRoleMutation: any;
    updateRoleMutation: any;
    deleteRoleMutation: any;

    tasksQuery: any;
    createTaskMutation: any;
    updateTaskMutation: any;
    deleteTaskMutation: any;
    
    calendarEventsQuery: any;
    createCalendarEventMutation: any;
    updateCalendarEventMutation: any;

    productsQuery: any;
    createProductMutation: any;
    updateProductMutation: any;
    deleteProductMutation: any;
    suppliersQuery: any;
    warehousesQuery: any;

    dealsQuery: any;
    dealStagesQuery: any;
    createDealMutation: any;
    updateDealMutation: any;
    deleteDealMutation: any;
    
    emailTemplatesQuery: any;
    createEmailTemplateMutation: any;
    updateEmailTemplateMutation: any;
    deleteEmailTemplateMutation: any;
    
    allInteractionsQuery: any;
    createInteractionMutation: any;
    updateInteractionMutation: any;

    dashboardDataQuery: any;
    
    updateCustomFieldsMutation: any;
    
    workflowsQuery: any;
    createWorkflowMutation: any;
    updateWorkflowMutation: any;
    advancedWorkflowsQuery: any;
    createAdvancedWorkflowMutation: any;
    updateAdvancedWorkflowMutation: any;
    deleteAdvancedWorkflowMutation: any;

    organizationSettingsQuery: any;
    updateOrganizationSettingsMutation: any;
    recalculateAllScoresMutation: any;
    connectEmailMutation: any;
    disconnectEmailMutation: any;
    connectVoipMutation: any;
    disconnectVoipMutation: any;
    
    apiKeysQuery: any;
    createApiKeyMutation: any;
    deleteApiKeyMutation: any;

    ticketsQuery: any;
    createTicketMutation: any;
    updateTicketMutation: any;
    addTicketReplyMutation: any;

    formsQuery: any;
    createFormMutation: any;
    updateFormMutation: any;
    deleteFormMutation: any;
    submitPublicFormMutation: any;

    campaignsQuery: any;
    createCampaignMutation: any;
    updateCampaignMutation: any;
    deleteCampaignMutation: any;
    launchCampaignMutation: any;
    advanceDayMutation: any;
    
    landingPagesQuery: any;
    createLandingPageMutation: any;
    updateLandingPageMutation: any;
    deleteLandingPageMutation: any;

    syncedEmailsQuery: any;
    runEmailSyncMutation: any;
    
    handleNewChatMessageMutation: any;

    customReportsQuery: any;
    createCustomReportMutation: any;
    updateCustomReportMutation: any;
    deleteCustomReportMutation: any;
    dashboardWidgetsQuery: any;
    addDashboardWidgetMutation: any;
    removeDashboardWidgetMutation: any;

    createOrderMutation: any;
    updateOrderMutation: any;
    deleteOrderMutation: any;
    createTransactionMutation: any;
    trackPageViewMutation: any;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
    children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
    const queryClient = useQueryClient();
    const { authenticatedUser, hasPermission } = useAuth();
    const orgId = authenticatedUser?.organizationId;

    const onMutationSuccess = (queryKey: string | (string | undefined)[]) => () => {
        queryClient.invalidateQueries({ queryKey: Array.isArray(queryKey) ? queryKey.filter(Boolean) as string[] : [queryKey] });
    };
    const onMutationError = (error: Error) => {
        toast.error(error.message || 'An error occurred');
    };

    // --- ORGANIZATIONS ---
    const organizationsQuery = useQuery({ queryKey: ['organizations'], queryFn: apiClient.getOrganizations, enabled: !!authenticatedUser });
    const createOrganizationMutation = useMutation({ mutationFn: apiClient.createOrganization, onSuccess: onMutationSuccess('organizations'), onError: onMutationError });
    const updateOrganizationMutation = useMutation({ mutationFn: apiClient.updateOrganization, onSuccess: onMutationSuccess('organizations'), onError: onMutationError });
    const deleteOrganizationMutation = useMutation({ mutationFn: apiClient.deleteOrganization, onSuccess: onMutationSuccess('organizations'), onError: onMutationError });

    // --- CONTACTS ---
    const contactsQuery = useQuery<AnyContact[], Error>({ queryKey: ['contacts', orgId], queryFn: () => apiClient.getContacts(orgId!), enabled: !!orgId });
    const createContactMutation = useMutation({ mutationFn: apiClient.createContact, onSuccess: onMutationSuccess(['contacts', orgId]), onError: onMutationError });
    const updateContactMutation = useMutation({ mutationFn: apiClient.updateContact, onSuccess: onMutationSuccess(['contacts', orgId]), onError: onMutationError });
    const deleteContactMutation = useMutation({ mutationFn: apiClient.deleteContact, onSuccess: onMutationSuccess(['contacts', orgId]), onError: onMutationError });
    const bulkDeleteContactsMutation = useMutation({ mutationFn: apiClient.bulkDeleteContacts, onSuccess: onMutationSuccess(['contacts', orgId]), onError: onMutationError });
    const bulkUpdateContactStatusMutation = useMutation({ mutationFn: apiClient.bulkUpdateContactStatus, onSuccess: onMutationSuccess(['contacts', orgId]), onError: onMutationError });

    // --- TEAM & ROLES ---
    const teamMembersQuery = useQuery<User[], Error>({ queryKey: ['teamMembers', orgId], queryFn: () => apiClient.getTeamMembers(orgId!), enabled: !!orgId });
    const createUserMutation = useMutation({ mutationFn: apiClient.createUser, onSuccess: onMutationSuccess(['teamMembers', orgId]), onError: onMutationError });
    const updateUserMutation = useMutation({ mutationFn: apiClient.updateUser, onSuccess: onMutationSuccess(['teamMembers', orgId]), onError: onMutationError });
    const deleteUserMutation = useMutation({ mutationFn: apiClient.deleteUser, onSuccess: onMutationSuccess(['teamMembers', orgId]), onError: onMutationError });

    const rolesQuery = useQuery<CustomRole[], Error>({ queryKey: ['roles', orgId], queryFn: () => apiClient.getRoles(orgId!), enabled: !!orgId });
    const createRoleMutation = useMutation({ mutationFn: apiClient.createRole, onSuccess: onMutationSuccess(['roles', orgId]), onError: onMutationError });
    const updateRoleMutation = useMutation({ mutationFn: apiClient.updateRole, onSuccess: onMutationSuccess(['roles', orgId]), onError: onMutationError });
    const deleteRoleMutation = useMutation({ mutationFn: apiClient.deleteRole, onSuccess: onMutationSuccess(['roles', orgId]), onError: onMutationError });

    // --- TASKS ---
    const tasksQuery = useQuery<Task[], Error>({ queryKey: ['tasks', orgId, authenticatedUser?.id], queryFn: () => apiClient.getTasks(orgId!, authenticatedUser!.id, hasPermission('contacts:read:all')), enabled: !!orgId && !!authenticatedUser });
    const createTaskMutation = useMutation({ mutationFn: apiClient.createTask, onSuccess: onMutationSuccess(['tasks', orgId, authenticatedUser?.id]), onError: onMutationError });
    const updateTaskMutation = useMutation({ mutationFn: apiClient.updateTask, onSuccess: onMutationSuccess(['tasks', orgId, authenticatedUser?.id]), onError: onMutationError });
    const deleteTaskMutation = useMutation({ mutationFn: apiClient.deleteTask, onSuccess: onMutationSuccess(['tasks', orgId, authenticatedUser?.id]), onError: onMutationError });

    // --- CALENDAR ---
    const calendarEventsQuery = useQuery<CalendarEvent[], Error>({ queryKey: ['calendarEvents', orgId, authenticatedUser?.id], queryFn: () => apiClient.getCalendarEvents(orgId!, authenticatedUser!.id), enabled: !!orgId && !!authenticatedUser });
    const createCalendarEventMutation = useMutation({ mutationFn: apiClient.createCalendarEvent, onSuccess: onMutationSuccess(['calendarEvents', orgId, authenticatedUser?.id]), onError: onMutationError });
    const updateCalendarEventMutation = useMutation({ mutationFn: apiClient.updateCalendarEvent, onSuccess: onMutationSuccess(['calendarEvents', orgId, authenticatedUser?.id]), onError: onMutationError });

    // --- INVENTORY ---
    const productsQuery = useQuery<Product[], Error>({ queryKey: ['products', orgId], queryFn: () => apiClient.getProducts(orgId!), enabled: !!orgId });
    const createProductMutation = useMutation({ mutationFn: apiClient.createProduct, onSuccess: onMutationSuccess(['products', orgId]), onError: onMutationError });
    const updateProductMutation = useMutation({ mutationFn: apiClient.updateProduct, onSuccess: onMutationSuccess(['products', orgId]), onError: onMutationError });
    const deleteProductMutation = useMutation({ mutationFn: apiClient.deleteProduct, onSuccess: onMutationSuccess(['products', orgId]), onError: onMutationError });
    const suppliersQuery = useQuery<Supplier[], Error>({ queryKey: ['suppliers', orgId], queryFn: () => apiClient.getSuppliers(orgId!), enabled: !!orgId });
    const warehousesQuery = useQuery<Warehouse[], Error>({ queryKey: ['warehouses', orgId], queryFn: () => apiClient.getWarehouses(orgId!), enabled: !!orgId });
    
    // --- DEALS ---
    const dealStagesQuery = useQuery<DealStage[], Error>({ queryKey: ['dealStages', orgId], queryFn: () => apiClient.getDealStages(orgId!), enabled: !!orgId });
    const dealsQuery = useQuery<Deal[], Error>({ queryKey: ['deals', orgId], queryFn: () => apiClient.getDeals(orgId!), enabled: !!orgId });
    const createDealMutation = useMutation({ mutationFn: apiClient.createDeal, onSuccess: onMutationSuccess(['deals', orgId]), onError: onMutationError });
    const updateDealMutation = useMutation({ mutationFn: apiClient.updateDeal, onSuccess: onMutationSuccess(['deals', orgId]), onError: onMutationError });
    const deleteDealMutation = useMutation({ mutationFn: apiClient.deleteDeal, onSuccess: onMutationSuccess(['deals', orgId]), onError: onMutationError });
    
    // --- TEMPLATES ---
    const emailTemplatesQuery = useQuery<EmailTemplate[], Error>({ queryKey: ['emailTemplates', orgId], queryFn: () => apiClient.getEmailTemplates(orgId!), enabled: !!orgId });
    const createEmailTemplateMutation = useMutation({ mutationFn: apiClient.createEmailTemplate, onSuccess: onMutationSuccess(['emailTemplates', orgId]), onError: onMutationError });
    const updateEmailTemplateMutation = useMutation({ mutationFn: apiClient.updateEmailTemplate, onSuccess: onMutationSuccess(['emailTemplates', orgId]), onError: onMutationError });
    const deleteEmailTemplateMutation = useMutation({ mutationFn: apiClient.deleteEmailTemplate, onSuccess: onMutationSuccess(['emailTemplates', orgId]), onError: onMutationError });

    // --- INTERACTIONS ---
    const allInteractionsQuery = useQuery({ queryKey: ['allInteractions', orgId], queryFn: () => apiClient.getInteractions(orgId!), enabled: !!orgId });
    const createInteractionMutation = useMutation({ mutationFn: apiClient.createInteraction, onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['contacts', orgId] });
        queryClient.invalidateQueries({ queryKey: ['allInteractions', orgId] });
        queryClient.invalidateQueries({ queryKey: ['contactInteractions'] });
    }, onError: onMutationError });
    const updateInteractionMutation = useMutation({ mutationFn: apiClient.updateInteraction, onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['contacts', orgId] });
        queryClient.invalidateQueries({ queryKey: ['allInteractions', orgId] });
        queryClient.invalidateQueries({ queryKey: ['contactInteractions'] });
    }, onError: onMutationError });

    // --- DASHBOARD ---
    const dashboardDataQuery = useQuery({ queryKey: ['dashboardData', orgId], queryFn: () => apiClient.getDashboardData(orgId!), enabled: !!orgId });
    
    // --- SETTINGS ---
    const updateCustomFieldsMutation = useMutation({ mutationFn: apiClient.updateCustomFields, onSuccess: onMutationSuccess(['industryConfig']), onError: onMutationError });
    const organizationSettingsQuery = useQuery<OrganizationSettings, Error>({ queryKey: ['organizationSettings', orgId], queryFn: () => apiClient.getOrganizationSettings(orgId!), enabled: !!orgId });
    const updateOrganizationSettingsMutation = useMutation({ mutationFn: apiClient.updateOrganizationSettings, onSuccess: onMutationSuccess(['organizationSettings', orgId]), onError: onMutationError });
    const recalculateAllScoresMutation = useMutation({
        // FIX: The mutationFn wrapper was redundant. Passing the apiClient method directly is cleaner and avoids potential issues.
        mutationFn: apiClient.recalculateAllScores,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contacts', orgId] });
        },
        onError: onMutationError
    });
    // FIX: Wrapped apiClient calls in arrow functions to correctly handle arguments from mutate calls.
    const connectEmailMutation = useMutation({
        mutationFn: (email: string) => apiClient.updateOrganizationSettings({ emailIntegration: { isConnected: true, connectedEmail: email } }),
        onSuccess: onMutationSuccess(['organizationSettings', orgId]),
        onError: onMutationError
    });
    const disconnectEmailMutation = useMutation({
        mutationFn: () => apiClient.updateOrganizationSettings({ emailIntegration: { isConnected: false, connectedEmail: undefined, lastSync: undefined } }),
        onSuccess: onMutationSuccess(['organizationSettings', orgId]),
        onError: onMutationError
    });
    const connectVoipMutation = useMutation({
        mutationFn: (provider: string) => apiClient.updateOrganizationSettings({ voip: { isConnected: true, provider } }),
        onSuccess: onMutationSuccess(['organizationSettings', orgId]),
        onError: onMutationError
    });
    const disconnectVoipMutation = useMutation({
        mutationFn: () => apiClient.updateOrganizationSettings({ voip: { isConnected: false, provider: undefined } }),
        onSuccess: onMutationSuccess(['organizationSettings', orgId]),
        onError: onMutationError
    });
    
    // --- WORKFLOWS ---
    const workflowsQuery = useQuery<Workflow[], Error>({ queryKey: ['workflows', orgId], queryFn: () => apiClient.getWorkflows(orgId!), enabled: !!orgId });
    const createWorkflowMutation = useMutation({ mutationFn: apiClient.createWorkflow, onSuccess: onMutationSuccess(['workflows', orgId]), onError: onMutationError });
    const updateWorkflowMutation = useMutation({ mutationFn: apiClient.updateWorkflow, onSuccess: onMutationSuccess(['workflows', orgId]), onError: onMutationError });
    const advancedWorkflowsQuery = useQuery<AdvancedWorkflow[], Error>({ queryKey: ['advancedWorkflows', orgId], queryFn: () => apiClient.getAdvancedWorkflows(orgId!), enabled: !!orgId });
    const createAdvancedWorkflowMutation = useMutation({ mutationFn: apiClient.createAdvancedWorkflow, onSuccess: onMutationSuccess(['advancedWorkflows', orgId]), onError: onMutationError });
    const updateAdvancedWorkflowMutation = useMutation({ mutationFn: apiClient.updateAdvancedWorkflow, onSuccess: onMutationSuccess(['advancedWorkflows', orgId]), onError: onMutationError });
    const deleteAdvancedWorkflowMutation = useMutation({ mutationFn: apiClient.deleteAdvancedWorkflow, onSuccess: onMutationSuccess(['advancedWorkflows', orgId]), onError: onMutationError });

    // --- API KEYS ---
    const apiKeysQuery = useQuery<ApiKey[], Error>({ queryKey: ['apiKeys', orgId], queryFn: () => apiClient.getApiKeys(orgId!), enabled: !!orgId });
    const createApiKeyMutation = useMutation({ mutationFn: apiClient.createApiKey, onSuccess: onMutationSuccess(['apiKeys', orgId]), onError: onMutationError });
    const deleteApiKeyMutation = useMutation({ mutationFn: apiClient.deleteApiKey, onSuccess: onMutationSuccess(['apiKeys', orgId]), onError: onMutationError });
    
    // --- TICKETS ---
    const ticketsQuery = useQuery<Ticket[], Error>({ queryKey: ['tickets', orgId], queryFn: () => apiClient.getTickets(orgId!), enabled: !!orgId });
    const createTicketMutation = useMutation({ mutationFn: apiClient.createTicket, onSuccess: onMutationSuccess(['tickets', orgId]), onError: onMutationError });
    const updateTicketMutation = useMutation({ mutationFn: apiClient.updateTicket, onSuccess: onMutationSuccess(['tickets', orgId]), onError: onMutationError });
    const addTicketReplyMutation = useMutation({
        // FIX: The mutation function expects a single object argument. Passing the API client method directly ensures the correct signature.
        // FIX: Wrapped apiClient.addTicketReply in an arrow function to explicitly pass the single 'variables' object from the mutation, resolving a potential type inference issue.
        mutationFn: (vars: { ticketId: string, reply: Omit<TicketReply, 'id' | 'timestamp'> }) => apiClient.addTicketReply(vars),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets', orgId] });
        },
        onError: onMutationError
    });

    // --- FORMS ---
    const formsQuery = useQuery<PublicForm[], Error>({ queryKey: ['forms', orgId], queryFn: () => apiClient.getForms(orgId!), enabled: !!orgId });
    const createFormMutation = useMutation({ mutationFn: apiClient.createForm, onSuccess: onMutationSuccess(['forms', orgId]), onError: onMutationError });
    const updateFormMutation = useMutation({ mutationFn: apiClient.updateForm, onSuccess: onMutationSuccess(['forms', orgId]), onError: onMutationError });
    const deleteFormMutation = useMutation({ mutationFn: apiClient.deleteForm, onSuccess: onMutationSuccess(['forms', orgId]), onError: onMutationError });
    const submitPublicFormMutation = useMutation({ mutationFn: apiClient.submitPublicForm, onSuccess: onMutationSuccess(['contacts', orgId]), onError: onMutationError });

    // --- LANDING PAGES ---
    const landingPagesQuery = useQuery<LandingPage[], Error>({ queryKey: ['landingPages', orgId], queryFn: () => apiClient.getLandingPages(orgId!), enabled: !!orgId });
    const createLandingPageMutation = useMutation({ mutationFn: apiClient.createLandingPage, onSuccess: onMutationSuccess(['landingPages', orgId]), onError: onMutationError });
    const updateLandingPageMutation = useMutation({ mutationFn: apiClient.updateLandingPage, onSuccess: onMutationSuccess(['landingPages', orgId]), onError: onMutationError });
    const deleteLandingPageMutation = useMutation({ mutationFn: apiClient.deleteLandingPage, onSuccess: onMutationSuccess(['landingPages', orgId]), onError: onMutationError });
    
    // --- CAMPAIGNS ---
    const campaignsQuery = useQuery<Campaign[], Error>({ queryKey: ['campaigns', orgId], queryFn: () => apiClient.getCampaigns(orgId!), enabled: !!orgId });
    const createCampaignMutation = useMutation({ mutationFn: apiClient.createCampaign, onSuccess: onMutationSuccess(['campaigns', orgId]), onError: onMutationError });
    const updateCampaignMutation = useMutation({ mutationFn: apiClient.updateCampaign, onSuccess: onMutationSuccess(['campaigns', orgId]), onError: onMutationError });
    const deleteCampaignMutation = useMutation({ mutationFn: (id: string) => Promise.resolve(), onSuccess: onMutationSuccess(['campaigns', orgId]), onError: onMutationError });
    const launchCampaignMutation = useMutation({ mutationFn: apiClient.launchCampaign, onSuccess: onMutationSuccess(['campaigns', orgId, 'contacts']), onError: onMutationError });
    const advanceDayMutation = useMutation({ mutationFn: apiClient.advanceDay, onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['campaigns', orgId] });
        queryClient.invalidateQueries({ queryKey: ['contacts', orgId] });
    }, onError: onMutationError });
    
    // --- LIVE CHAT ---
    const handleNewChatMessageMutation = useMutation({ mutationFn: apiClient.handleNewChatMessage, onSuccess: onMutationSuccess(['tickets', orgId]), onError: onMutationError });

    // --- EMAIL SYNC ---
    const syncedEmailsQuery = useQuery<Interaction[], Error>({ queryKey: ['syncedEmails', orgId], queryFn: () => apiClient.getInteractions(orgId!).then(ints => ints.filter(i => i.userId === 'system')), enabled: !!orgId });
    const runEmailSyncMutation = useMutation({ mutationFn: (orgId: string) => apiClient.runEmailSync(orgId), onSuccess: () => {
        onMutationSuccess(['syncedEmails', orgId])();
        onMutationSuccess(['organizationSettings', orgId])();
    }, onError: onMutationError });

    // --- CUSTOM REPORTS & WIDGETS ---
    const customReportsQuery = useQuery<CustomReport[], Error>({ queryKey: ['customReports', orgId], queryFn: () => apiClient.getCustomReports(orgId!), enabled: !!orgId });
    const createCustomReportMutation = useMutation({ mutationFn: apiClient.createCustomReport, onSuccess: onMutationSuccess(['customReports', orgId]), onError: onMutationError });
    const updateCustomReportMutation = useMutation({ mutationFn: apiClient.updateCustomReport, onSuccess: onMutationSuccess(['customReports', orgId]), onError: onMutationError });
    const deleteCustomReportMutation = useMutation({ mutationFn: apiClient.deleteCustomReport, onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['customReports', orgId] });
        queryClient.invalidateQueries({ queryKey: ['dashboardWidgets', orgId] });
    }, onError: onMutationError });

    const dashboardWidgetsQuery = useQuery<DashboardWidget[], Error>({ queryKey: ['dashboardWidgets', orgId], queryFn: () => apiClient.getDashboardWidgets(orgId!), enabled: !!orgId });
    const addDashboardWidgetMutation = useMutation({ mutationFn: apiClient.addDashboardWidget, onSuccess: onMutationSuccess(['dashboardWidgets', orgId]), onError: onMutationError });
    const removeDashboardWidgetMutation = useMutation({ mutationFn: apiClient.removeDashboardWidget, onSuccess: onMutationSuccess(['dashboardWidgets', orgId]), onError: onMutationError });

    // --- ORDERS & TRANSACTIONS ---
    const createOrderMutation = useMutation({ mutationFn: apiClient.createOrder, onSuccess: onMutationSuccess(['contacts', orgId]), onError: onMutationError });
    const updateOrderMutation = useMutation({ mutationFn: apiClient.updateOrder, onSuccess: onMutationSuccess(['contacts', orgId]), onError: onMutationError });
    const deleteOrderMutation = useMutation({ mutationFn: apiClient.deleteOrder, onSuccess: onMutationSuccess(['contacts', orgId]), onError: onMutationError });
    const createTransactionMutation = useMutation({ mutationFn: apiClient.createTransaction, onSuccess: onMutationSuccess(['contacts', orgId]), onError: onMutationError });
    
    // --- ANALYTICS ---
    const trackPageViewMutation = useMutation({ mutationFn: apiClient.trackPageView });


    const value = {
        organizationsQuery, createOrganizationMutation, updateOrganizationMutation, deleteOrganizationMutation,
        contactsQuery, createContactMutation, updateContactMutation, deleteContactMutation, bulkDeleteContactsMutation, bulkUpdateContactStatusMutation,
        teamMembersQuery, createUserMutation, updateUserMutation, deleteUserMutation,
        rolesQuery, createRoleMutation, updateRoleMutation, deleteRoleMutation,
        tasksQuery, createTaskMutation, updateTaskMutation, deleteTaskMutation,
        calendarEventsQuery, createCalendarEventMutation, updateCalendarEventMutation,
        productsQuery, createProductMutation, updateProductMutation, deleteProductMutation, suppliersQuery, warehousesQuery,
        dealsQuery, dealStagesQuery, createDealMutation, updateDealMutation, deleteDealMutation,
        emailTemplatesQuery, createEmailTemplateMutation, updateEmailTemplateMutation, deleteEmailTemplateMutation,
        allInteractionsQuery, createInteractionMutation, updateInteractionMutation,
        dashboardDataQuery,
        updateCustomFieldsMutation,
        workflowsQuery, createWorkflowMutation, updateWorkflowMutation,
        advancedWorkflowsQuery, createAdvancedWorkflowMutation, updateAdvancedWorkflowMutation, deleteAdvancedWorkflowMutation,
        organizationSettingsQuery, updateOrganizationSettingsMutation, recalculateAllScoresMutation,
        connectEmailMutation, disconnectEmailMutation, connectVoipMutation, disconnectVoipMutation,
        apiKeysQuery, createApiKeyMutation, deleteApiKeyMutation,
        ticketsQuery, createTicketMutation, updateTicketMutation, addTicketReplyMutation,
        formsQuery, createFormMutation, updateFormMutation, deleteFormMutation, submitPublicFormMutation,
        campaignsQuery, createCampaignMutation, updateCampaignMutation, deleteCampaignMutation, launchCampaignMutation, advanceDayMutation,
        landingPagesQuery, createLandingPageMutation, updateLandingPageMutation, deleteLandingPageMutation,
        syncedEmailsQuery, runEmailSyncMutation,
        handleNewChatMessageMutation,
        customReportsQuery, createCustomReportMutation, updateCustomReportMutation, deleteCustomReportMutation,
        dashboardWidgetsQuery, addDashboardWidgetMutation, removeDashboardWidgetMutation,
        createOrderMutation, updateOrderMutation, deleteOrderMutation, createTransactionMutation,
        trackPageViewMutation,
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};