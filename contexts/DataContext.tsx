import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/apiClient';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';
import {
    AnyContact, CalendarEvent, Campaign, ContactStatus, CustomReport, DashboardWidget, Deal, DealStage, EmailTemplate,
    Industry, Interaction, Order, Organization, Product, Supplier, Task, Ticket, TicketReply, User, Warehouse, Workflow, OrganizationSettings as OrgSettingsType, CustomField
} from '../types';
import { useNotifications } from './NotificationContext';

// Define the shape of the context
interface DataContextType {
    [key: string]: any;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const queryClient = useQueryClient();
    const { authenticatedUser } = useAuth();
    const { addNotification } = useNotifications();
    const organizationId = authenticatedUser?.organizationId || '';

    // --- GENERIC MUTATION HANDLERS ---
    // FIX: This function has been rewritten to accept the (data, variables, context) arguments from useMutation's onSuccess callback.
    // The previous implementation had a signature mismatch which caused a silent failure in the callback chain,
    // preventing both query invalidation and component-level onSuccess handlers (like closing a modal) from running.
    const genericOnSuccess = (baseQueryKey: string | string[], message: string) => (data: any, variables: any, context: any) => {
        toast.success(message);

        const invalidate = (key: string) => {
            const isGlobalQuery = key === 'organizations' || key === 'industryConfig';
            const queryKey = isGlobalQuery ? [key] : [key, organizationId];
            queryClient.invalidateQueries({ queryKey });
        };

        if (Array.isArray(baseQueryKey)) {
            baseQueryKey.forEach(key => invalidate(key));
        } else {
            invalidate(baseQueryKey);
        }
    };
    
    const genericOnError = (error: any) => {
        toast.error(error.message || 'An error occurred.');
    };


    // --- QUERIES (simplified for brevity) ---
    const teamMembersQuery = useQuery({ queryKey: ['teamMembers', organizationId], queryFn: () => apiClient.getTeamMembers(organizationId), enabled: !!organizationId });
    const contactsQuery = useQuery({ queryKey: ['contacts', organizationId], queryFn: () => apiClient.getContacts(organizationId), enabled: !!organizationId });
    const ticketsQuery = useQuery({ queryKey: ['tickets', organizationId], queryFn: () => apiClient.getTickets(organizationId), enabled: !!organizationId });
    const emailTemplatesQuery = useQuery({ queryKey: ['emailTemplates', organizationId], queryFn: () => apiClient.getEmailTemplates(organizationId), enabled: !!organizationId });
    const organizationsQuery = useQuery({ queryKey: ['organizations'], queryFn: apiClient.getOrganizations, enabled: authenticatedUser?.role === 'Super Admin' });
    const productsQuery = useQuery({ queryKey: ['products', organizationId], queryFn: () => apiClient.getProducts(organizationId), enabled: !!organizationId });
    const suppliersQuery = useQuery({ queryKey: ['suppliers', organizationId], queryFn: () => apiClient.getSuppliers(organizationId), enabled: !!organizationId });
    const warehousesQuery = useQuery({ queryKey: ['warehouses', organizationId], queryFn: () => apiClient.getWarehouses(organizationId), enabled: !!organizationId });
    const calendarEventsQuery = useQuery({ queryKey: ['calendarEvents', organizationId], queryFn: () => apiClient.getCalendarEvents(organizationId), enabled: !!organizationId });
    const tasksQuery = useQuery({ queryKey: ['tasks', organizationId], queryFn: () => apiClient.getTasks(organizationId), enabled: !!organizationId });
    const allInteractionsQuery = useQuery({ queryKey: ['allInteractions', organizationId], queryFn: () => apiClient.getAllInteractions(organizationId), enabled: !!organizationId });
    const dealStagesQuery = useQuery({ queryKey: ['dealStages', organizationId], queryFn: () => apiClient.getDealStages(organizationId), enabled: !!organizationId });
    const dealsQuery = useQuery({ queryKey: ['deals', organizationId], queryFn: () => apiClient.getDeals(organizationId), enabled: !!organizationId });
    const workflowsQuery = useQuery({ queryKey: ['workflows', organizationId], queryFn: () => apiClient.getWorkflows(organizationId), enabled: !!organizationId });
    const campaignsQuery = useQuery({ queryKey: ['campaigns', organizationId], queryFn: () => apiClient.getCampaigns(organizationId), enabled: !!organizationId });
    const customReportsQuery = useQuery({ queryKey: ['customReports', organizationId], queryFn: () => apiClient.getCustomReports(organizationId), enabled: !!organizationId });
    const dashboardWidgetsQuery = useQuery({ queryKey: ['dashboardWidgets', organizationId], queryFn: () => apiClient.getDashboardWidgets(organizationId), enabled: !!organizationId });
    const dashboardDataQuery = useQuery({ queryKey: ['dashboardData', organizationId], queryFn: () => apiClient.getDashboardData(organizationId), enabled: !!organizationId });
    const organizationSettingsQuery = useQuery({ queryKey: ['organizationSettings', organizationId], queryFn: () => apiClient.getOrganizationSettings(organizationId), enabled: !!organizationId });


    // --- MUTATIONS ---
    // FIX: All mutations now use the corrected genericOnSuccess and a new genericOnError handler.
    // This ensures that query invalidation, toasts, and subsequent component-level callbacks fire reliably.

    // Organizations
    const createOrganizationMutation = useMutation({ mutationFn: apiClient.createOrganization, onSuccess: genericOnSuccess('organizations', 'Organization created!'), onError: genericOnError });
    const updateOrganizationMutation = useMutation({ mutationFn: apiClient.updateOrganization, onSuccess: genericOnSuccess('organizations', 'Organization updated!'), onError: genericOnError });
    const deleteOrganizationMutation = useMutation({ mutationFn: apiClient.deleteOrganization, onSuccess: genericOnSuccess('organizations', 'Organization deleted!'), onError: genericOnError });

    // Contacts
    const createContactMutation = useMutation({ mutationFn: (data: Omit<AnyContact, 'id'>) => apiClient.createContact(data), onSuccess: genericOnSuccess('contacts', 'Contact created!'), onError: genericOnError });
    const updateContactMutation = useMutation({ mutationFn: (data: AnyContact) => apiClient.updateContact(data), onSuccess: genericOnSuccess(['contacts', 'allInteractions'], 'Contact updated!'), onError: genericOnError });
    const deleteContactMutation = useMutation({ mutationFn: apiClient.deleteContact, onSuccess: genericOnSuccess('contacts', 'Contact deleted!'), onError: genericOnError });
    const bulkDeleteContactsMutation = useMutation({ mutationFn: (ids: string[]) => apiClient.bulkDeleteContacts(ids, organizationId), onSuccess: genericOnSuccess('contacts', 'Contacts deleted!'), onError: genericOnError });
    const bulkUpdateContactStatusMutation = useMutation({ mutationFn: ({ ids, status }: { ids: string[]; status: ContactStatus; }) => apiClient.bulkUpdateContactStatus(ids, status, organizationId), onSuccess: genericOnSuccess('contacts', 'Contacts updated!'), onError: genericOnError });

    // Interactions
    const createInteractionMutation = useMutation({ mutationFn: apiClient.createInteraction, onSuccess: genericOnSuccess(['contactInteractions', 'allInteractions'], 'Interaction logged!'), onError: genericOnError });
    const createTransactionMutation = useMutation({ mutationFn: apiClient.createTransaction, onSuccess: genericOnSuccess(['contacts'], 'Transaction added!'), onError: genericOnError });

    // Orders
    const createOrderMutation = useMutation({ mutationFn: apiClient.createOrder, onSuccess: genericOnSuccess(['contacts'], 'Order created!'), onError: genericOnError });
    const updateOrderMutation = useMutation({ mutationFn: apiClient.updateOrder, onSuccess: genericOnSuccess(['contacts'], 'Order updated!'), onError: genericOnError });
    const deleteOrderMutation = useMutation({ mutationFn: apiClient.deleteOrder, onSuccess: genericOnSuccess(['contacts'], 'Order deleted!'), onError: genericOnError });
    
    // Inventory
    const createProductMutation = useMutation({ mutationFn: apiClient.createProduct, onSuccess: genericOnSuccess('products', 'Product created!'), onError: genericOnError });
    const updateProductMutation = useMutation({ mutationFn: apiClient.updateProduct, onSuccess: genericOnSuccess('products', 'Product updated!'), onError: genericOnError });
    const deleteProductMutation = useMutation({ mutationFn: apiClient.deleteProduct, onSuccess: genericOnSuccess('products', 'Product deleted!'), onError: genericOnError });

    // Calendar
    const createCalendarEventMutation = useMutation({ mutationFn: apiClient.createCalendarEvent, onSuccess: genericOnSuccess('calendarEvents', 'Event created!'), onError: genericOnError });
    const updateCalendarEventMutation = useMutation({ mutationFn: apiClient.updateCalendarEvent, onSuccess: genericOnSuccess('calendarEvents', 'Event updated!'), onError: genericOnError });

    // Tasks
    const createTaskMutation = useMutation({ mutationFn: apiClient.createTask, onSuccess: genericOnSuccess('tasks', 'Task created!'), onError: genericOnError });
    const updateTaskMutation = useMutation({ mutationFn: apiClient.updateTask, onSuccess: genericOnSuccess('tasks', 'Task updated!'), onError: genericOnError });
    const deleteTaskMutation = useMutation({ mutationFn: apiClient.deleteTask, onSuccess: genericOnSuccess('tasks', 'Task deleted!'), onError: genericOnError });

    // Team
    const createTeamMemberMutation = useMutation({ mutationFn: apiClient.createTeamMember, onSuccess: genericOnSuccess('teamMembers', 'Team member invited!'), onError: genericOnError });
    const updateTeamMemberMutation = useMutation({ mutationFn: apiClient.updateTeamMember, onSuccess: genericOnSuccess('teamMembers', 'Team member updated!'), onError: genericOnError });

    // Deals
    const createDealMutation = useMutation({ mutationFn: apiClient.createDeal, onSuccess: genericOnSuccess('deals', 'Deal created!'), onError: genericOnError });
    const updateDealMutation = useMutation({ mutationFn: (data: Deal) => apiClient.updateDeal(data), onSuccess: genericOnSuccess('deals', 'Deal updated!'), onError: genericOnError });
    const deleteDealMutation = useMutation({ mutationFn: apiClient.deleteDeal, onSuccess: genericOnSuccess('deals', 'Deal deleted!'), onError: genericOnError });

    // Marketing
    const createEmailTemplateMutation = useMutation({ mutationFn: apiClient.createEmailTemplate, onSuccess: genericOnSuccess('emailTemplates', 'Template created!'), onError: genericOnError });
    const updateEmailTemplateMutation = useMutation({ mutationFn: apiClient.updateEmailTemplate, onSuccess: genericOnSuccess('emailTemplates', 'Template updated!'), onError: genericOnError });
    const deleteEmailTemplateMutation = useMutation({ mutationFn: apiClient.deleteEmailTemplate, onSuccess: genericOnSuccess('emailTemplates', 'Template deleted!'), onError: genericOnError });
    const createWorkflowMutation = useMutation({ mutationFn: apiClient.createWorkflow, onSuccess: genericOnSuccess('workflows', 'Workflow created!'), onError: genericOnError });
    const updateWorkflowMutation = useMutation({ mutationFn: apiClient.updateWorkflow, onSuccess: genericOnSuccess('workflows', 'Workflow updated!'), onError: genericOnError });
    const createCampaignMutation = useMutation({ mutationFn: apiClient.createCampaign, onSuccess: genericOnSuccess('campaigns', 'Campaign created!'), onError: genericOnError });
    const updateCampaignMutation = useMutation({ mutationFn: apiClient.updateCampaign, onSuccess: genericOnSuccess('campaigns', 'Campaign updated!'), onError: genericOnError });

    // Reports & Widgets
    const createCustomReportMutation = useMutation({ mutationFn: apiClient.createCustomReport, onSuccess: genericOnSuccess('customReports', 'Custom report saved!'), onError: genericOnError });
    const deleteCustomReportMutation = useMutation({ mutationFn: apiClient.deleteCustomReport, onSuccess: genericOnSuccess(['customReports', 'dashboardWidgets'], 'Custom report deleted!'), onError: genericOnError });
    const addDashboardWidgetMutation = useMutation({ mutationFn: (reportId: string) => apiClient.addDashboardWidget(reportId, organizationId), onSuccess: genericOnSuccess('dashboardWidgets', 'Widget added to dashboard!'), onError: genericOnError });
    const removeDashboardWidgetMutation = useMutation({ mutationFn: (widgetId: string) => apiClient.removeDashboardWidget(widgetId, organizationId), onSuccess: genericOnSuccess('dashboardWidgets', 'Widget removed from dashboard!'), onError: genericOnError });

    // Settings
    const updateOrganizationSettingsMutation = useMutation({ mutationFn: (settings: Partial<OrgSettingsType>) => apiClient.updateOrganizationSettings({ ...settings, organizationId } as OrgSettingsType), onSuccess: genericOnSuccess('organizationSettings', 'Settings updated!'), onError: genericOnError });
    const updateCustomFieldsMutation = useMutation({ mutationFn: apiClient.updateCustomFields, onSuccess: genericOnSuccess('industryConfig', 'Custom fields updated!'), onError: genericOnError });

    // Tickets
    const createTicketMutation = useMutation({
        mutationFn: (data: Omit<Ticket, 'id'|'createdAt'|'updatedAt'|'replies'>) => apiClient.createTicket(data),
        onSuccess: (newTicket: Ticket) => {
            genericOnSuccess('tickets', 'Ticket created!')(newTicket, null, null);
            if (newTicket.assignedToId && newTicket.assignedToId !== authenticatedUser?.id) {
                addNotification({
                    userId: newTicket.assignedToId,
                    type: 'ticket_assigned',
                    message: `${authenticatedUser?.name} assigned you a new ticket: "${newTicket.subject.substring(0, 30)}..."`,
                });
            }
        },
        onError: genericOnError,
    });

    const updateTicketMutation = useMutation({
        onMutate: async (updatedTicket: Ticket) => {
            await queryClient.cancelQueries({ queryKey: ['tickets', organizationId] });
            const previousTickets = queryClient.getQueryData<Ticket[]>(['tickets', organizationId]);
            const oldTicket = previousTickets?.find(t => t.id === updatedTicket.id);
            return { oldTicket, updatedTicket };
        },
        mutationFn: (data: Ticket) => apiClient.updateTicket(data),
        onSuccess: (updatedTicket: Ticket, variables, context) => {
            toast.success('Ticket updated!');
            const oldAssignee = context?.oldTicket?.assignedToId;
            const newAssignee = updatedTicket.assignedToId;
            if (newAssignee && newAssignee !== oldAssignee) {
                 addNotification({
                    userId: newAssignee,
                    type: 'ticket_assigned',
                    message: `${authenticatedUser?.name} assigned you ticket #${updatedTicket.id.slice(-6)}.`,
                });
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets', organizationId] });
        },
        onError: genericOnError,
    });

    const addTicketReplyMutation = useMutation({
        mutationFn: ({ ticketId, reply }: { ticketId: string, reply: Omit<TicketReply, 'id' | 'timestamp'> }) => apiClient.addTicketReply(ticketId, reply),
        onSuccess: (updatedTicket: Ticket, variables) => {
            toast.success('Reply added!');

            // Immediately update the tickets list in the cache to trigger a UI refresh
            const previousTickets = queryClient.getQueryData<Ticket[]>(['tickets', organizationId]) || [];
            const originalTicket = previousTickets.find((t: Ticket) => t.id === updatedTicket.id);
            
            queryClient.setQueryData<Ticket[]>(['tickets', organizationId], 
                previousTickets.map(ticket => ticket.id === updatedTicket.id ? updatedTicket : ticket)
            );
            
            if (!originalTicket) return;

            // Notify assigned team member when a client replies
            if (authenticatedUser?.role === 'Client' && originalTicket.assignedToId) {
                addNotification({
                    userId: originalTicket.assignedToId,
                    type: 'ticket_reply',
                    message: `Client ${authenticatedUser.name} replied to ticket #${originalTicket.id.slice(-6)}.`,
                });
            }

            // Handle @mentions in internal notes
            if (variables.reply.isInternal && variables.reply.message.includes('@')) {
                const members = teamMembersQuery.data || [];
                members.forEach((member: User) => {
                    if (variables.reply.message.includes(`@${member.name}`) && member.id !== authenticatedUser?.id) {
                         addNotification({
                            userId: member.id,
                            type: 'mention',
                            message: `${authenticatedUser?.name} mentioned you in ticket #${originalTicket.id.slice(-6)}.`,
                        });
                    }
                });
            }
        },
        onError: genericOnError,
    });

    const value = {
        organizationsQuery, createOrganizationMutation, updateOrganizationMutation, deleteOrganizationMutation,
        contactsQuery, createContactMutation, updateContactMutation, deleteContactMutation, bulkDeleteContactsMutation, bulkUpdateContactStatusMutation,
        createInteractionMutation, createTransactionMutation,
        createOrderMutation, updateOrderMutation, deleteOrderMutation,
        productsQuery, createProductMutation, updateProductMutation, deleteProductMutation,
        suppliersQuery, warehousesQuery,
        calendarEventsQuery, createCalendarEventMutation, updateCalendarEventMutation,
        tasksQuery, createTaskMutation, updateTaskMutation, deleteTaskMutation,
        teamMembersQuery, createTeamMemberMutation, updateTeamMemberMutation,
        allInteractionsQuery,
        dealStagesQuery, dealsQuery, createDealMutation, updateDealMutation, deleteDealMutation,
        emailTemplatesQuery, createEmailTemplateMutation, updateEmailTemplateMutation, deleteEmailTemplateMutation,
        workflowsQuery, createWorkflowMutation, updateWorkflowMutation,
        campaignsQuery, createCampaignMutation, updateCampaignMutation,
        ticketsQuery, createTicketMutation, updateTicketMutation, addTicketReplyMutation,
        customReportsQuery, createCustomReportMutation, deleteCustomReportMutation,
        dashboardWidgetsQuery, addDashboardWidgetMutation, removeDashboardWidgetMutation,
        dashboardDataQuery,
        organizationSettingsQuery, updateOrganizationSettingsMutation,
        updateCustomFieldsMutation,
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};