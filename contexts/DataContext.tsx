import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import apiClient from '../services/apiClient';
import { useAuth } from './AuthContext';
import {
    AnyContact, ContactStatus, Organization, Industry, IndustryConfig, CustomField, User,
    CalendarEvent, Task, Product, Supplier, Warehouse, Deal, DealStage, EmailTemplate,
    Workflow, AdvancedWorkflow, Campaign, Ticket, TicketReply, CustomReport, DashboardWidget, SLAPolicy, Order, Transaction, Interaction
} from '../types';
import toast from 'react-hot-toast';

// Define the shape of the context.
interface DataContextType {
    // Queries
    organizationsQuery: UseQueryResult<Organization[], Error>;
    contactsQuery: UseQueryResult<AnyContact[], Error>;
    allInteractionsQuery: UseQueryResult<Interaction[], Error>;
    productsQuery: UseQueryResult<Product[], Error>;
    suppliersQuery: UseQueryResult<Supplier[], Error>;
    warehousesQuery: UseQueryResult<Warehouse[], Error>;
    teamMembersQuery: UseQueryResult<User[], Error>;
    calendarEventsQuery: UseQueryResult<CalendarEvent[], Error>;
    tasksQuery: UseQueryResult<Task[], Error>;
    dealsQuery: UseQueryResult<Deal[], Error>;
    dealStagesQuery: UseQueryResult<DealStage[], Error>;
    emailTemplatesQuery: UseQueryResult<EmailTemplate[], Error>;
    workflowsQuery: UseQueryResult<Workflow[], Error>;
    advancedWorkflowsQuery: UseQueryResult<AdvancedWorkflow[], Error>;
    campaignsQuery: UseQueryResult<Campaign[], Error>;
    ticketsQuery: UseQueryResult<Ticket[], Error>;
    customReportsQuery: UseQueryResult<CustomReport[], Error>;
    dashboardWidgetsQuery: UseQueryResult<DashboardWidget[], Error>;
    organizationSettingsQuery: UseQueryResult<any, Error>; 
    dashboardDataQuery: UseQueryResult<any, Error>;

    // Mutations
    createOrganizationMutation: UseMutationResult<Organization, Error, Omit<Organization, 'id' | 'createdAt'>>;
    updateOrganizationMutation: UseMutationResult<Organization, Error, Organization>;
    deleteOrganizationMutation: UseMutationResult<void, Error, string>;
    createContactMutation: UseMutationResult<AnyContact, Error, Omit<AnyContact, 'id'>>;
    updateContactMutation: UseMutationResult<AnyContact, Error, AnyContact>;
    deleteContactMutation: UseMutationResult<void, Error, string>;
    bulkDeleteContactsMutation: UseMutationResult<void, Error, string[]>;
    bulkUpdateContactStatusMutation: UseMutationResult<void, Error, { ids: string[]; status: ContactStatus }>;
    createInteractionMutation: UseMutationResult<Interaction, Error, Omit<Interaction, 'id'>>;
    updateCustomFieldsMutation: UseMutationResult<IndustryConfig, Error, { industry: Industry; fields: CustomField[] }>;
    createTaskMutation: UseMutationResult<Task, Error, Omit<Task, 'id' | 'isCompleted'>>;
    updateTaskMutation: UseMutationResult<Task, Error, Task>;
    deleteTaskMutation: UseMutationResult<void, Error, string>;
    createTeamMemberMutation: UseMutationResult<User, Error, Omit<User, 'id'>>;
    updateTeamMemberMutation: UseMutationResult<User, Error, User>;
    createCalendarEventMutation: UseMutationResult<CalendarEvent, Error, Omit<CalendarEvent, 'id'>>;
    updateCalendarEventMutation: UseMutationResult<CalendarEvent, Error, CalendarEvent>;
    createProductMutation: UseMutationResult<Product, Error, Omit<Product, 'id'>>;
    updateProductMutation: UseMutationResult<Product, Error, Product>;
    deleteProductMutation: UseMutationResult<void, Error, string>;
    createOrderMutation: UseMutationResult<Order, Error, Omit<Order, 'id'>>;
    updateOrderMutation: UseMutationResult<Order, Error, Order>;
    deleteOrderMutation: UseMutationResult<void, Error, { contactId: string, orderId: string }>;
    createTransactionMutation: UseMutationResult<Transaction, Error, { contactId: string, data: Omit<Transaction, 'id'> }>;
    createCustomReportMutation: UseMutationResult<CustomReport, Error, Omit<CustomReport, 'id'>>;
    deleteCustomReportMutation: UseMutationResult<void, Error, string>;
    addDashboardWidgetMutation: UseMutationResult<DashboardWidget, Error, string>;
    removeDashboardWidgetMutation: UseMutationResult<void, Error, string>;
    createEmailTemplateMutation: UseMutationResult<EmailTemplate, Error, Omit<EmailTemplate, 'id'>>;
    updateEmailTemplateMutation: UseMutationResult<EmailTemplate, Error, EmailTemplate>;
    deleteEmailTemplateMutation: UseMutationResult<void, Error, string>;
    createWorkflowMutation: UseMutationResult<Workflow, Error, Omit<Workflow, 'id'>>;
    updateWorkflowMutation: UseMutationResult<Workflow, Error, Workflow>;
    createAdvancedWorkflowMutation: UseMutationResult<AdvancedWorkflow, Error, Omit<AdvancedWorkflow, 'id'>>;
    updateAdvancedWorkflowMutation: UseMutationResult<AdvancedWorkflow, Error, AdvancedWorkflow>;
    deleteAdvancedWorkflowMutation: UseMutationResult<void, Error, string>;
    createDealMutation: UseMutationResult<Deal, Error, Omit<Deal, 'id' | 'createdAt'>>;
    updateDealMutation: UseMutationResult<Deal, Error, Deal>;
    deleteDealMutation: UseMutationResult<void, Error, string>;
    launchCampaignMutation: UseMutationResult<Campaign, Error, string>;
    createCampaignMutation: UseMutationResult<Campaign, Error, Omit<Campaign, 'id'>>;
    updateCampaignMutation: UseMutationResult<Campaign, Error, Campaign>;
    createTicketMutation: UseMutationResult<Ticket, Error, Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'replies'>>;
    updateTicketMutation: UseMutationResult<Ticket, Error, Ticket>;
    addTicketReplyMutation: UseMutationResult<Ticket, Error, { ticketId: string; reply: Omit<TicketReply, 'id' | 'timestamp'> }>;
    updateOrganizationSettingsMutation: UseMutationResult<any, Error, any>;
    uploadDocumentMutation: UseMutationResult<any, Error, { contactId: string, data: any }>;
    deleteDocumentMutation: UseMutationResult<void, Error, { contactId: string, docId: string }>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const queryClient = useQueryClient();
    const { authenticatedUser } = useAuth();
    const organizationId = authenticatedUser?.organizationId;

    // --- QUERIES ---
    const organizationsQuery = useQuery<Organization[], Error>({ queryKey: ['organizations'], queryFn: apiClient.getOrganizations });
    const contactsQuery = useQuery<AnyContact[], Error>({ queryKey: ['contacts', organizationId], queryFn: () => apiClient.getContacts(organizationId!), enabled: !!organizationId });
    const allInteractionsQuery = useQuery<Interaction[], Error>({ queryKey: ['allInteractions', organizationId], queryFn: () => apiClient.getAllInteractions(organizationId!), enabled: !!organizationId });
    const productsQuery = useQuery<Product[], Error>({ queryKey: ['products', organizationId], queryFn: () => apiClient.getProducts(organizationId!), enabled: !!organizationId });
    const suppliersQuery = useQuery<Supplier[], Error>({ queryKey: ['suppliers', organizationId], queryFn: () => apiClient.getSuppliers(organizationId!), enabled: !!organizationId });
    const warehousesQuery = useQuery<Warehouse[], Error>({ queryKey: ['warehouses', organizationId], queryFn: () => apiClient.getWarehouses(organizationId!), enabled: !!organizationId });
    const teamMembersQuery = useQuery<User[], Error>({ queryKey: ['teamMembers', organizationId], queryFn: () => apiClient.getTeamMembers(organizationId!), enabled: !!organizationId });
    const calendarEventsQuery = useQuery<CalendarEvent[], Error>({ queryKey: ['calendarEvents', organizationId], queryFn: () => apiClient.getCalendarEvents(organizationId!), enabled: !!organizationId });
    const tasksQuery = useQuery<Task[], Error>({ queryKey: ['tasks', organizationId], queryFn: () => apiClient.getTasks(organizationId!), enabled: !!organizationId });
    const dealsQuery = useQuery<Deal[], Error>({ queryKey: ['deals', organizationId], queryFn: () => apiClient.getDeals(organizationId!), enabled: !!organizationId });
    const dealStagesQuery = useQuery<DealStage[], Error>({ queryKey: ['dealStages', organizationId], queryFn: () => apiClient.getDealStages(organizationId!), enabled: !!organizationId });
    const emailTemplatesQuery = useQuery<EmailTemplate[], Error>({ queryKey: ['emailTemplates', organizationId], queryFn: () => apiClient.getEmailTemplates(organizationId!), enabled: !!organizationId });
    const workflowsQuery = useQuery<Workflow[], Error>({ queryKey: ['workflows', organizationId], queryFn: () => apiClient.getWorkflows(organizationId!), enabled: !!organizationId });
    const advancedWorkflowsQuery = useQuery<AdvancedWorkflow[], Error>({ queryKey: ['advancedWorkflows', organizationId], queryFn: () => apiClient.getAdvancedWorkflows(organizationId!), enabled: !!organizationId });
    const campaignsQuery = useQuery<Campaign[], Error>({ queryKey: ['campaigns', organizationId], queryFn: () => apiClient.getCampaigns(organizationId!), enabled: !!organizationId });
    const ticketsQuery = useQuery<Ticket[], Error>({ queryKey: ['tickets', organizationId], queryFn: () => apiClient.getTickets(organizationId!), enabled: !!organizationId });
    const customReportsQuery = useQuery<CustomReport[], Error>({ queryKey: ['customReports', organizationId], queryFn: () => apiClient.getCustomReports(organizationId!), enabled: !!organizationId });
    const dashboardWidgetsQuery = useQuery<DashboardWidget[], Error>({ queryKey: ['dashboardWidgets', organizationId], queryFn: () => apiClient.getDashboardWidgets(organizationId!), enabled: !!organizationId });
    const organizationSettingsQuery = useQuery({ queryKey: ['organizationSettings', organizationId], queryFn: () => apiClient.getOrganizationSettings(organizationId!), enabled: !!organizationId });
    const dashboardDataQuery = useQuery({ queryKey: ['dashboardData', organizationId], queryFn: () => apiClient.getDashboardData(organizationId!), enabled: !!organizationId });

    // --- MUTATIONS ---
    const useGenericMutation = (mutationFn: (...args: any[]) => Promise<any>, queryKeyToInvalidate: string | string[], successMsg: string, errorMsg: string) => {
        return useMutation({
            mutationFn,
            onSuccess: () => {
                toast.success(successMsg);
                const keys = Array.isArray(queryKeyToInvalidate) ? queryKeyToInvalidate : [queryKeyToInvalidate];
                keys.forEach(key => queryClient.invalidateQueries({ queryKey: [key, organizationId] }));
                if (keys.includes('contacts')) { // special case for interactions
                     queryClient.invalidateQueries({ queryKey: ['allInteractions', organizationId] });
                }
            },
            onError: () => toast.error(errorMsg),
        });
    };

    const createOrganizationMutation = useGenericMutation(apiClient.createOrganization, 'organizations', 'Organization created!', 'Failed to create organization.');
    const updateOrganizationMutation = useGenericMutation(apiClient.updateOrganization, 'organizations', 'Organization updated!', 'Failed to update organization.');
    const deleteOrganizationMutation = useGenericMutation(apiClient.deleteOrganization, 'organizations', 'Organization deleted!', 'Failed to delete organization.');
    
    const createContactMutation = useGenericMutation(apiClient.createContact, 'contacts', 'Contact created!', 'Failed to create contact.');
    const updateContactMutation = useGenericMutation(apiClient.updateContact, 'contacts', 'Contact updated!', 'Failed to update contact.');
    const deleteContactMutation = useGenericMutation(apiClient.deleteContact, 'contacts', 'Contact deleted!', 'Failed to delete contact.');
    const bulkDeleteContactsMutation = useGenericMutation(apiClient.bulkDeleteContacts, 'contacts', 'Contacts deleted!', 'Failed to delete contacts.');
    const bulkUpdateContactStatusMutation = useGenericMutation(apiClient.bulkUpdateContactStatus, 'contacts', 'Contact statuses updated!', 'Failed to update statuses.');
    
    const createInteractionMutation = useGenericMutation(apiClient.createInteraction, ['contacts', 'allInteractions'], 'Interaction logged!', 'Failed to log interaction.');
    
    // Custom logic for this one
    const updateCustomFieldsMutation = useMutation({
        mutationFn: (data: { industry: Industry; fields: CustomField[] }) => apiClient.updateCustomFields(data.industry, data.fields),
        onSuccess: (_, variables) => {
            toast.success('Custom fields updated!');
            queryClient.invalidateQueries({ queryKey: ['industryConfig', variables.industry]});
        },
        onError: () => toast.error('Failed to update custom fields.'),
    });

    const createTaskMutation = useGenericMutation(apiClient.createTask, 'tasks', 'Task created!', 'Failed to create task.');
    const updateTaskMutation = useGenericMutation(apiClient.updateTask, 'tasks', 'Task updated!', 'Failed to update task.');
    const deleteTaskMutation = useGenericMutation(apiClient.deleteTask, 'tasks', 'Task deleted!', 'Failed to delete task.');
    
    const createTeamMemberMutation = useGenericMutation(apiClient.createTeamMember, 'teamMembers', 'Team member invited!', 'Failed to invite team member.');
    const updateTeamMemberMutation = useGenericMutation(apiClient.updateTeamMember, 'teamMembers', 'Team member updated!', 'Failed to update team member.');
    
    const createCalendarEventMutation = useGenericMutation((data: Omit<CalendarEvent, 'id'>) => apiClient.createCalendarEvent(data, organizationId!), 'calendarEvents', 'Event created!', 'Failed to create event.');
    const updateCalendarEventMutation = useGenericMutation(apiClient.updateCalendarEvent, 'calendarEvents', 'Event updated!', 'Failed to update event.');
    
    const createProductMutation = useGenericMutation(apiClient.createProduct, 'products', 'Product created!', 'Failed to create product.');
    const updateProductMutation = useGenericMutation(apiClient.updateProduct, 'products', 'Product updated!', 'Failed to update product.');
    const deleteProductMutation = useGenericMutation(apiClient.deleteProduct, 'products', 'Product deleted!', 'Failed to delete product.');
    
    const createOrderMutation = useGenericMutation(apiClient.createOrder, 'contacts', 'Order created!', 'Failed to create order.');
    const updateOrderMutation = useGenericMutation(apiClient.updateOrder, 'contacts', 'Order updated!', 'Failed to update order.');
    const deleteOrderMutation = useGenericMutation(apiClient.deleteOrder, 'contacts', 'Order deleted!', 'Failed to delete order.');
    
    const createTransactionMutation = useGenericMutation(apiClient.createTransaction, 'contacts', 'Transaction created!', 'Failed to create transaction.');
    
    const createCustomReportMutation = useGenericMutation(apiClient.createCustomReport, 'customReports', 'Custom report created!', 'Failed to create custom report.');
    const deleteCustomReportMutation = useGenericMutation(apiClient.deleteCustomReport, 'customReports', 'Custom report deleted!', 'Failed to delete custom report.');
    
    const addDashboardWidgetMutation = useGenericMutation(apiClient.addDashboardWidget, 'dashboardWidgets', 'Widget added to dashboard!', 'Failed to add widget.');
    const removeDashboardWidgetMutation = useGenericMutation(apiClient.removeDashboardWidget, 'dashboardWidgets', 'Widget removed from dashboard!', 'Failed to remove widget.');
    
    const createEmailTemplateMutation = useGenericMutation(apiClient.createEmailTemplate, 'emailTemplates', 'Template created!', 'Failed to create template.');
    const updateEmailTemplateMutation = useGenericMutation(apiClient.updateEmailTemplate, 'emailTemplates', 'Template updated!', 'Failed to update template.');
    const deleteEmailTemplateMutation = useGenericMutation(apiClient.deleteEmailTemplate, 'emailTemplates', 'Template deleted!', 'Failed to delete template.');
    
    const createWorkflowMutation = useGenericMutation(apiClient.createWorkflow, 'workflows', 'Workflow created!', 'Failed to create workflow.');
    const updateWorkflowMutation = useGenericMutation(apiClient.updateWorkflow, 'workflows', 'Workflow updated!', 'Failed to update workflow.');
    
    const createAdvancedWorkflowMutation = useGenericMutation(apiClient.createAdvancedWorkflow, 'advancedWorkflows', 'Advanced workflow created!', 'Failed to create workflow.');
    const updateAdvancedWorkflowMutation = useGenericMutation(apiClient.updateAdvancedWorkflow, 'advancedWorkflows', 'Advanced workflow updated!', 'Failed to update workflow.');
    const deleteAdvancedWorkflowMutation = useGenericMutation(apiClient.deleteAdvancedWorkflow, 'advancedWorkflows', 'Advanced workflow deleted!', 'Failed to delete workflow.');
    
    const createDealMutation = useGenericMutation(apiClient.createDeal, 'deals', 'Deal created!', 'Failed to create deal.');
    const updateDealMutation = useGenericMutation(apiClient.updateDeal, 'deals', 'Deal updated!', 'Failed to update deal.');
    const deleteDealMutation = useGenericMutation(apiClient.deleteDeal, 'deals', 'Deal deleted!', 'Failed to delete deal.');
    
    const launchCampaignMutation = useGenericMutation(apiClient.launchCampaign, 'campaigns', 'Campaign launched!', 'Failed to launch campaign.');
    const createCampaignMutation = useGenericMutation(apiClient.createCampaign, 'campaigns', 'Campaign created!', 'Failed to create campaign.');
    const updateCampaignMutation = useGenericMutation(apiClient.updateCampaign, 'campaigns', 'Campaign updated!', 'Failed to update campaign.');

    const createTicketMutation = useGenericMutation(apiClient.createTicket, 'tickets', 'Ticket created!', 'Failed to create ticket.');
    const updateTicketMutation = useGenericMutation(apiClient.updateTicket, 'tickets', 'Ticket updated!', 'Failed to update ticket.');
    const addTicketReplyMutation = useGenericMutation(apiClient.addTicketReply, 'tickets', 'Reply added!', 'Failed to add reply.');
    
    const updateOrganizationSettingsMutation = useGenericMutation(apiClient.updateOrganizationSettings, 'organizationSettings', 'Settings updated!', 'Failed to update settings.');

    const uploadDocumentMutation = useMutation({
        mutationFn: (vars: { contactId: string, data: any }) => apiClient.uploadDocument(vars.data),
        onSuccess: (_, vars) => {
            toast.success('Document uploaded!');
            queryClient.invalidateQueries({ queryKey: ['documents', vars.contactId] });
            queryClient.invalidateQueries({ queryKey: ['contacts', organizationId] });
        },
        onError: () => toast.error('Failed to upload document.'),
    });

    const deleteDocumentMutation = useMutation({
        mutationFn: (vars: { contactId: string, docId: string }) => apiClient.deleteDocument(vars.docId),
        onSuccess: (_, vars) => {
            toast.success('Document deleted!');
            queryClient.invalidateQueries({ queryKey: ['documents', vars.contactId] });
            queryClient.invalidateQueries({ queryKey: ['contacts', organizationId] });
        },
        onError: () => toast.error('Failed to delete document.'),
    });


    const value = {
        organizationsQuery, contactsQuery, allInteractionsQuery, productsQuery, suppliersQuery,
        warehousesQuery, teamMembersQuery, calendarEventsQuery, tasksQuery, dealsQuery,
        dealStagesQuery, emailTemplatesQuery, workflowsQuery, advancedWorkflowsQuery,
        campaignsQuery, ticketsQuery, customReportsQuery, dashboardWidgetsQuery,
        organizationSettingsQuery, dashboardDataQuery,
        createOrganizationMutation, updateOrganizationMutation, deleteOrganizationMutation,
        createContactMutation, updateContactMutation, deleteContactMutation,
        bulkDeleteContactsMutation, bulkUpdateContactStatusMutation,
        createInteractionMutation, updateCustomFieldsMutation, createTaskMutation, updateTaskMutation,
        deleteTaskMutation, createTeamMemberMutation, updateTeamMemberMutation,
        createCalendarEventMutation, updateCalendarEventMutation, createProductMutation,
        updateProductMutation, deleteProductMutation, createOrderMutation, updateOrderMutation,
        deleteOrderMutation, createTransactionMutation, createCustomReportMutation,
        deleteCustomReportMutation, addDashboardWidgetMutation, removeDashboardWidgetMutation,
        createEmailTemplateMutation, updateEmailTemplateMutation, deleteEmailTemplateMutation,
        createWorkflowMutation, updateWorkflowMutation, createAdvancedWorkflowMutation,
        updateAdvancedWorkflowMutation, deleteAdvancedWorkflowMutation, createDealMutation,
        updateDealMutation, deleteDealMutation, launchCampaignMutation, createCampaignMutation,
        updateCampaignMutation, createTicketMutation, updateTicketMutation, addTicketReplyMutation,
        updateOrganizationSettingsMutation, uploadDocumentMutation, deleteDocumentMutation,
    };

    return <DataContext.Provider value={value as DataContextType}>{children}</DataContext.Provider>;
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
