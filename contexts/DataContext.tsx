import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/apiClient';
import { useAuth } from './AuthContext';
import {
    AnyContact, Organization, User, Task, CalendarEvent, Product, Supplier, Warehouse, Deal, DealStage,
    Ticket, EmailTemplate, Campaign, Workflow, AdvancedWorkflow, Interaction, OrganizationSettings, Industry,
    CustomField, IndustryConfig, ContactStatus, Order, Transaction, DashboardWidget, CustomReport
} from '../types';
import toast from 'react-hot-toast';
import { generateDashboardData } from '../services/reportGenerator';
import { subDays } from 'date-fns';

interface DataContextType {
    // Queries
    organizationsQuery: any;
    contactsQuery: any;
    teamMembersQuery: any;
    tasksQuery: any;
    calendarEventsQuery: any;
    productsQuery: any;
    suppliersQuery: any;
    warehousesQuery: any;
    dealsQuery: any;
    dealStagesQuery: any;
    ticketsQuery: any;
    emailTemplatesQuery: any;
    campaignsQuery: any;
    workflowsQuery: any;
    advancedWorkflowsQuery: any;
    allInteractionsQuery: any;
    dashboardDataQuery: any;
    organizationSettingsQuery: any;
    customReportsQuery: any;
    dashboardWidgetsQuery: any;

    // Mutations
    createOrganizationMutation: any;
    updateOrganizationMutation: any;
    deleteOrganizationMutation: any;
    createContactMutation: any;
    updateContactMutation: any;
    deleteContactMutation: any;
    createUserMutation: any;
    updateUserMutation: any;
    deleteUserMutation: any;
    updateCustomFieldsMutation: any;
    createInteractionMutation: any;
    createTaskMutation: any;
    updateTaskMutation: any;
    deleteTaskMutation: any;
    createCalendarEventMutation: any;
    updateCalendarEventMutation: any;
    createProductMutation: any;
    updateProductMutation: any;
    deleteProductMutation: any;
    createDealMutation: any;
    updateDealMutation: any;
    deleteDealMutation: any;
    createTicketMutation: any;
    updateTicketMutation: any;
    addTicketReplyMutation: any;
    createEmailTemplateMutation: any;
    updateEmailTemplateMutation: any;
    deleteEmailTemplateMutation: any;
    createCampaignMutation: any;
    updateCampaignMutation: any;
    launchCampaignMutation: any;
    createWorkflowMutation: any;
    updateWorkflowMutation: any;
    createAdvancedWorkflowMutation: any;
    updateAdvancedWorkflowMutation: any;
    deleteAdvancedWorkflowMutation: any;
    updateOrganizationSettingsMutation: any;
    createOrderMutation: any;
    updateOrderMutation: any;
    deleteOrderMutation: any;
    createTransactionMutation: any;
    uploadDocumentMutation: any;
    deleteDocumentMutation: any;
    createCustomReportMutation: any;
    removeDashboardWidgetMutation: any;
    bulkDeleteContactsMutation: any;
    bulkUpdateContactStatusMutation: any;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { authenticatedUser } = useAuth();
    const queryClient = useQueryClient();

    const orgId = authenticatedUser?.organizationId;
    const userId = authenticatedUser?.id;

    // --- QUERIES ---

    const organizationsQuery = useQuery<Organization[], Error>({
        queryKey: ['organizations'],
        queryFn: apiClient.getOrganizations,
        enabled: authenticatedUser?.role === 'Super Admin',
    });
    
    const contactsQuery = useQuery<AnyContact[], Error>({
        queryKey: ['contacts', orgId, authenticatedUser?.role],
        queryFn: async () => {
            const orgContacts = await apiClient.getContactsByOrg(orgId!);
            if (authenticatedUser?.role === 'Team Member') {
                return orgContacts.filter(c => c.assignedToId === authenticatedUser.id);
            }
            return orgContacts;
        },
        enabled: !!orgId,
    });
    
    const teamMembersQuery = useQuery<User[], Error>({
        queryKey: ['teamMembers', orgId],
        queryFn: () => apiClient.getUsersByOrg(orgId!),
        enabled: !!orgId,
    });
    
    const tasksQuery = useQuery<Task[], Error>({
        queryKey: ['tasks', userId],
        queryFn: () => apiClient.getTasksByUser(userId!, orgId!),
        enabled: !!userId && !!orgId,
    });

    const calendarEventsQuery = useQuery<CalendarEvent[], Error>({
        queryKey: ['calendarEvents', orgId],
        queryFn: () => apiClient.getCalendarEvents(orgId!),
        enabled: !!orgId,
    });

    const productsQuery = useQuery<Product[], Error>({
        queryKey: ['products', orgId],
        queryFn: () => apiClient.getProducts(orgId!),
        enabled: !!orgId,
    });
    
    const suppliersQuery = useQuery<Supplier[], Error>({
        queryKey: ['suppliers', orgId],
        queryFn: () => apiClient.getSuppliers(orgId!),
        enabled: !!orgId,
    });
    
    const warehousesQuery = useQuery<Warehouse[], Error>({
        queryKey: ['warehouses', orgId],
        queryFn: () => apiClient.getWarehouses(orgId!),
        enabled: !!orgId,
    });
    
    const dealsQuery = useQuery<Deal[], Error>({
        queryKey: ['deals', orgId],
        queryFn: () => apiClient.getDeals(orgId!),
        enabled: !!orgId,
    });

    const dealStagesQuery = useQuery<DealStage[], Error>({
        queryKey: ['dealStages', orgId],
        queryFn: () => apiClient.getDealStages(orgId!),
        enabled: !!orgId,
    });

    const ticketsQuery = useQuery<Ticket[], Error>({
        queryKey: ['tickets', orgId],
        queryFn: () => apiClient.getTickets(orgId!),
        enabled: !!orgId,
    });
    
    const emailTemplatesQuery = useQuery<EmailTemplate[], Error>({
        queryKey: ['emailTemplates', orgId],
        queryFn: () => apiClient.getEmailTemplates(orgId!),
        enabled: !!orgId,
    });
    
    const campaignsQuery = useQuery<Campaign[], Error>({
        queryKey: ['campaigns', orgId],
        queryFn: () => apiClient.getCampaigns(orgId!),
        enabled: !!orgId,
    });
    
    const workflowsQuery = useQuery<Workflow[], Error>({
        queryKey: ['workflows', orgId],
        queryFn: () => apiClient.getWorkflows(orgId!),
        enabled: !!orgId,
    });
    
    const advancedWorkflowsQuery = useQuery<AdvancedWorkflow[], Error>({
        queryKey: ['advancedWorkflows', orgId],
        queryFn: () => apiClient.getAdvancedWorkflows(orgId!),
        enabled: !!orgId,
    });

    const allInteractionsQuery = useQuery<Interaction[], Error>({
        queryKey: ['allInteractions', orgId],
        queryFn: () => apiClient.getAllInteractionsByOrg(orgId!),
        enabled: !!orgId,
    });
    
    const organizationSettingsQuery = useQuery<OrganizationSettings, Error>({
        queryKey: ['organizationSettings', orgId],
        queryFn: () => apiClient.getOrganizationSettings(orgId!),
        enabled: !!orgId,
    });

    const customReportsQuery = useQuery<CustomReport[], Error>({
        queryKey: ['customReports', orgId],
        queryFn: () => apiClient.getCustomReports(orgId!),
        enabled: !!orgId
    });

    const dashboardWidgetsQuery = useQuery<DashboardWidget[], Error>({
        queryKey: ['dashboardWidgets', orgId],
        queryFn: () => apiClient.getDashboardWidgets(orgId!),
        enabled: !!orgId
    });

    // --- DERIVED QUERIES ---

    const dashboardDataQuery = useQuery({
        queryKey: ['dashboardData', orgId, contactsQuery.data, allInteractionsQuery.data],
        queryFn: () => {
            const dateRange = { start: subDays(new Date(), 30), end: new Date() };
            return generateDashboardData(dateRange, contactsQuery.data || [], allInteractionsQuery.data || []);
        },
        enabled: !!orgId && !!contactsQuery.data && !!allInteractionsQuery.data,
    });


    // --- MUTATIONS ---
    
    const useGenericMutation = (mutationFn: (...args: any[]) => Promise<any>, queryKeyToInvalidate: string, successMsg: string, errorMsg: string) => {
        return useMutation({
            mutationFn,
            onSuccess: () => {
                toast.success(successMsg);
                queryClient.invalidateQueries({ queryKey: [queryKeyToInvalidate, orgId] });
            },
            onError: (err: any) => {
                toast.error(errorMsg);
                console.error(err);
            },
        });
    };
    
    const createOrganizationMutation = useGenericMutation(apiClient.createOrganization, 'organizations', 'Organization created.', 'Failed to create organization.');
    const updateOrganizationMutation = useGenericMutation(apiClient.updateOrganization, 'organizations', 'Organization updated.', 'Failed to update organization.');
    const deleteOrganizationMutation = useGenericMutation(apiClient.deleteOrganization, 'organizations', 'Organization deleted.', 'Failed to delete organization.');

    const createContactMutation = useGenericMutation(apiClient.createContact, 'contacts', 'Contact created.', 'Failed to create contact.');
    const updateContactMutation = useMutation({
        mutationFn: apiClient.updateContact,
        onSuccess: (data) => {
            toast.success('Contact updated.');
            queryClient.invalidateQueries({ queryKey: ['contacts', orgId] });
            queryClient.invalidateQueries({ queryKey: ['contactProfile', data.id] });
        },
        onError: () => toast.error('Failed to update contact.')
    });
    const deleteContactMutation = useGenericMutation(apiClient.deleteContact, 'contacts', 'Contact deleted.', 'Failed to delete contact.');
    
    const bulkDeleteContactsMutation = useGenericMutation(apiClient.bulkDeleteContacts, 'contacts', 'Contacts deleted.', 'Failed to delete contacts.');
    const bulkUpdateContactStatusMutation = useGenericMutation(apiClient.bulkUpdateContactStatus, 'contacts', 'Contacts updated.', 'Failed to update contacts.');

    const createUserMutation = useGenericMutation(apiClient.createUser, 'teamMembers', 'Team member invited.', 'Failed to invite team member.');
    const updateUserMutation = useGenericMutation(apiClient.updateUser, 'teamMembers', 'Team member updated.', 'Failed to update team member.');
    const deleteUserMutation = useGenericMutation(apiClient.deleteUser, 'teamMembers', 'Team member removed.', 'Failed to remove team member.');
    
    const updateCustomFieldsMutation = useMutation({
        mutationFn: apiClient.updateCustomFields,
        onSuccess: () => {
            toast.success('Custom fields updated.');
            queryClient.invalidateQueries({ queryKey: ['industryConfig'] });
        },
        onError: () => toast.error('Failed to update custom fields.')
    });

    const createInteractionMutation = useMutation({
        mutationFn: apiClient.createInteraction,
        onSuccess: (data) => {
            toast.success('Interaction logged.');
            queryClient.invalidateQueries({ queryKey: ['allInteractions', orgId] });
            queryClient.invalidateQueries({ queryKey: ['contactInteractions', data.contactId] });
        },
        onError: () => toast.error('Failed to log interaction.')
    });

    const createTaskMutation = useGenericMutation(apiClient.createTask, 'tasks', 'Task created.', 'Failed to create task.');
    const updateTaskMutation = useGenericMutation(apiClient.updateTask, 'tasks', 'Task updated.', 'Failed to update task.');
    const deleteTaskMutation = useGenericMutation(apiClient.deleteTask, 'tasks', 'Task deleted.', 'Failed to delete task.');

    const createCalendarEventMutation = useGenericMutation(apiClient.createCalendarEvent, 'calendarEvents', 'Event created.', 'Failed to create event.');
    const updateCalendarEventMutation = useGenericMutation(apiClient.updateCalendarEvent, 'calendarEvents', 'Event updated.', 'Failed to update event.');

    const createProductMutation = useGenericMutation(apiClient.createProduct, 'products', 'Product created.', 'Failed to create product.');
    const updateProductMutation = useGenericMutation(apiClient.updateProduct, 'products', 'Product updated.', 'Failed to update product.');
    const deleteProductMutation = useGenericMutation(apiClient.deleteProduct, 'products', 'Product deleted.', 'Failed to delete product.');
    
    const createDealMutation = useGenericMutation(apiClient.createDeal, 'deals', 'Deal created.', 'Failed to create deal.');
    const updateDealMutation = useGenericMutation(apiClient.updateDeal, 'deals', 'Deal updated.', 'Failed to update deal.');
    const deleteDealMutation = useGenericMutation(apiClient.deleteDeal, 'deals', 'Deal deleted.', 'Failed to delete deal.');
    
    const createTicketMutation = useGenericMutation(apiClient.createTicket, 'tickets', 'Ticket created.', 'Failed to create ticket.');
    const updateTicketMutation = useGenericMutation(apiClient.updateTicket, 'tickets', 'Ticket updated.', 'Failed to update ticket.');
    const addTicketReplyMutation = useGenericMutation(apiClient.addTicketReply, 'tickets', 'Reply added.', 'Failed to add reply.');

    const createEmailTemplateMutation = useGenericMutation(apiClient.createEmailTemplate, 'emailTemplates', 'Template created.', 'Failed to create template.');
    const updateEmailTemplateMutation = useGenericMutation(apiClient.updateEmailTemplate, 'emailTemplates', 'Template updated.', 'Failed to update template.');
    const deleteEmailTemplateMutation = useGenericMutation(apiClient.deleteEmailTemplate, 'emailTemplates', 'Template deleted.', 'Failed to delete template.');

    const createCampaignMutation = useGenericMutation(apiClient.createCampaign, 'campaigns', 'Campaign saved.', 'Failed to save campaign.');
    const updateCampaignMutation = useGenericMutation(apiClient.updateCampaign, 'campaigns', 'Campaign updated.', 'Failed to update campaign.');
    const launchCampaignMutation = useGenericMutation(apiClient.launchCampaign, 'campaigns', 'Campaign launched!', 'Failed to launch campaign.');

    const createWorkflowMutation = useGenericMutation(apiClient.createWorkflow, 'workflows', 'Workflow created.', 'Failed to create workflow.');
    const updateWorkflowMutation = useGenericMutation(apiClient.updateWorkflow, 'workflows', 'Workflow updated.', 'Failed to update workflow.');
    
    const createAdvancedWorkflowMutation = useGenericMutation(apiClient.createAdvancedWorkflow, 'advancedWorkflows', 'Workflow created.', 'Failed to create workflow.');
    const updateAdvancedWorkflowMutation = useGenericMutation(apiClient.updateAdvancedWorkflow, 'advancedWorkflows', 'Workflow updated.', 'Failed to update workflow.');
    const deleteAdvancedWorkflowMutation = useGenericMutation(apiClient.deleteAdvancedWorkflow, 'advancedWorkflows', 'Workflow deleted.', 'Failed to delete workflow.');
    
    const updateOrganizationSettingsMutation = useGenericMutation(apiClient.updateOrganizationSettings, 'organizationSettings', 'Settings updated.', 'Failed to update settings.');

    const createOrderMutation = useGenericMutation(apiClient.createOrder, 'contacts', 'Order created.', 'Failed to create order.');
    const updateOrderMutation = useGenericMutation(apiClient.updateOrder, 'contacts', 'Order updated.', 'Failed to update order.');
    const deleteOrderMutation = useGenericMutation(apiClient.deleteOrder, 'contacts', 'Order deleted.', 'Failed to delete order.');
    
    const createTransactionMutation = useGenericMutation(apiClient.createTransaction, 'contacts', 'Transaction created.', 'Failed to create transaction.');

    const uploadDocumentMutation = useMutation({
        mutationFn: apiClient.uploadDocument,
        onSuccess: (data) => {
            toast.success("Document uploaded.");
            queryClient.invalidateQueries({ queryKey: ['documents', data.contactId] });
        },
        onError: () => toast.error('Failed to upload document.')
    });

    const deleteDocumentMutation = useMutation({
        mutationFn: apiClient.deleteDocument,
        onSuccess: (data, docId) => {
            toast.success("Document deleted.");
            queryClient.invalidateQueries({ queryKey: ['documents'] }); // Invalidate all document queries
        },
        onError: () => toast.error('Failed to delete document.')
    });

    const createCustomReportMutation = useGenericMutation(apiClient.createCustomReport, 'customReports', 'Custom report saved.', 'Failed to save report.');
    const removeDashboardWidgetMutation = useGenericMutation(apiClient.removeDashboardWidget, 'dashboardWidgets', 'Widget removed.', 'Failed to remove widget.');


    const value = useMemo(() => ({
        organizationsQuery, contactsQuery, teamMembersQuery, tasksQuery, calendarEventsQuery, productsQuery, suppliersQuery,
        warehousesQuery, dealsQuery, dealStagesQuery, ticketsQuery, emailTemplatesQuery, campaignsQuery, workflowsQuery,
        advancedWorkflowsQuery, allInteractionsQuery, dashboardDataQuery, organizationSettingsQuery, customReportsQuery, dashboardWidgetsQuery,
        createOrganizationMutation, updateOrganizationMutation, deleteOrganizationMutation, createContactMutation, updateContactMutation,
        deleteContactMutation, createUserMutation, updateUserMutation, deleteUserMutation, updateCustomFieldsMutation,
        createInteractionMutation, createTaskMutation, updateTaskMutation, deleteTaskMutation, createCalendarEventMutation,
        updateCalendarEventMutation, createProductMutation, updateProductMutation, deleteProductMutation, createDealMutation,
        updateDealMutation, deleteDealMutation, createTicketMutation, updateTicketMutation, addTicketReplyMutation,
        createEmailTemplateMutation, updateEmailTemplateMutation, deleteEmailTemplateMutation, createCampaignMutation,
        updateCampaignMutation, launchCampaignMutation, createWorkflowMutation, updateWorkflowMutation, createAdvancedWorkflowMutation,
        updateAdvancedWorkflowMutation, deleteAdvancedWorkflowMutation, updateOrganizationSettingsMutation, createOrderMutation,
        updateOrderMutation, deleteOrderMutation, createTransactionMutation, uploadDocumentMutation, deleteDocumentMutation,
        createCustomReportMutation, removeDashboardWidgetMutation, bulkDeleteContactsMutation, bulkUpdateContactStatusMutation
    }), [
        organizationsQuery, contactsQuery, teamMembersQuery, tasksQuery, calendarEventsQuery, productsQuery, suppliersQuery,
        warehousesQuery, dealsQuery, dealStagesQuery, ticketsQuery, emailTemplatesQuery, campaignsQuery, workflowsQuery,
        advancedWorkflowsQuery, allInteractionsQuery, dashboardDataQuery, organizationSettingsQuery, customReportsQuery, dashboardWidgetsQuery,
        createOrganizationMutation, updateOrganizationMutation, deleteOrganizationMutation, createContactMutation, updateContactMutation,
        deleteContactMutation, createUserMutation, updateUserMutation, deleteUserMutation, updateCustomFieldsMutation,
        createInteractionMutation, createTaskMutation, updateTaskMutation, deleteTaskMutation, createCalendarEventMutation,
        updateCalendarEventMutation, createProductMutation, updateProductMutation, deleteProductMutation, createDealMutation,
        updateDealMutation, deleteDealMutation, createTicketMutation, updateTicketMutation, addTicketReplyMutation,
        createEmailTemplateMutation, updateEmailTemplateMutation, deleteEmailTemplateMutation, createCampaignMutation,
        updateCampaignMutation, launchCampaignMutation, createWorkflowMutation, updateWorkflowMutation, createAdvancedWorkflowMutation,
        updateAdvancedWorkflowMutation, deleteAdvancedWorkflowMutation, updateOrganizationSettingsMutation, createOrderMutation,
        updateOrderMutation, deleteOrderMutation, createTransactionMutation, uploadDocumentMutation, deleteDocumentMutation,
        createCustomReportMutation, removeDashboardWidgetMutation, bulkDeleteContactsMutation, bulkUpdateContactStatusMutation
    ]);

    return (
        <DataContext.Provider value={value as DataContextType}>
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