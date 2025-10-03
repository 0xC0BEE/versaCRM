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
    const genericOnSuccessWithToast = (queryKey: string | string[], message: string) => () => {
        toast.success(message);
        queryClient.invalidateQueries({ queryKey: Array.isArray(queryKey) ? queryKey : [queryKey] });
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

    // Organizations
    const createOrganizationMutation = useMutation({ mutationFn: apiClient.createOrganization, onSuccess: genericOnSuccessWithToast('organizations', 'Organization created!') });
    const updateOrganizationMutation = useMutation({ mutationFn: apiClient.updateOrganization, onSuccess: genericOnSuccessWithToast('organizations', 'Organization updated!') });
    const deleteOrganizationMutation = useMutation({ mutationFn: apiClient.deleteOrganization, onSuccess: genericOnSuccessWithToast('organizations', 'Organization deleted!') });

    // Contacts
    const createContactMutation = useMutation({ mutationFn: apiClient.createContact, onSuccess: genericOnSuccessWithToast('contacts', 'Contact created!') });
    const updateContactMutation = useMutation({ mutationFn: apiClient.updateContact, onSuccess: genericOnSuccessWithToast(['contacts', 'allInteractions'], 'Contact updated!') });
    const deleteContactMutation = useMutation({ mutationFn: apiClient.deleteContact, onSuccess: genericOnSuccessWithToast('contacts', 'Contact deleted!') });
    const bulkDeleteContactsMutation = useMutation({ mutationFn: (ids: string[]) => apiClient.bulkDeleteContacts(ids, organizationId), onSuccess: genericOnSuccessWithToast('contacts', 'Contacts deleted!') });
    const bulkUpdateContactStatusMutation = useMutation({ mutationFn: ({ ids, status }: { ids: string[]; status: ContactStatus; }) => apiClient.bulkUpdateContactStatus(ids, status, organizationId), onSuccess: genericOnSuccessWithToast('contacts', 'Contacts updated!') });

    // Interactions
    const createInteractionMutation = useMutation({ mutationFn: apiClient.createInteraction, onSuccess: genericOnSuccessWithToast(['contactInteractions', 'allInteractions'], 'Interaction logged!') });
    const createTransactionMutation = useMutation({ mutationFn: apiClient.createTransaction, onSuccess: genericOnSuccessWithToast(['contacts'], 'Transaction added!') });

    // Orders
    const createOrderMutation = useMutation({ mutationFn: apiClient.createOrder, onSuccess: genericOnSuccessWithToast(['contacts'], 'Order created!') });
    const updateOrderMutation = useMutation({ mutationFn: apiClient.updateOrder, onSuccess: genericOnSuccessWithToast(['contacts'], 'Order updated!') });
    const deleteOrderMutation = useMutation({ mutationFn: apiClient.deleteOrder, onSuccess: genericOnSuccessWithToast(['contacts'], 'Order deleted!') });
    
    // Inventory
    const createProductMutation = useMutation({ mutationFn: apiClient.createProduct, onSuccess: genericOnSuccessWithToast('products', 'Product created!') });
    const updateProductMutation = useMutation({ mutationFn: apiClient.updateProduct, onSuccess: genericOnSuccessWithToast('products', 'Product updated!') });
    const deleteProductMutation = useMutation({ mutationFn: apiClient.deleteProduct, onSuccess: genericOnSuccessWithToast('products', 'Product deleted!') });

    // Calendar
    const createCalendarEventMutation = useMutation({ mutationFn: apiClient.createCalendarEvent, onSuccess: genericOnSuccessWithToast('calendarEvents', 'Event created!') });
    const updateCalendarEventMutation = useMutation({ mutationFn: apiClient.updateCalendarEvent, onSuccess: genericOnSuccessWithToast('calendarEvents', 'Event updated!') });

    // Tasks
    const createTaskMutation = useMutation({ mutationFn: apiClient.createTask, onSuccess: genericOnSuccessWithToast('tasks', 'Task created!') });
    const updateTaskMutation = useMutation({ mutationFn: apiClient.updateTask, onSuccess: genericOnSuccessWithToast('tasks', 'Task updated!') });
    const deleteTaskMutation = useMutation({ mutationFn: apiClient.deleteTask, onSuccess: genericOnSuccessWithToast('tasks', 'Task deleted!') });

    // Team
    const createTeamMemberMutation = useMutation({ mutationFn: apiClient.createTeamMember, onSuccess: genericOnSuccessWithToast('teamMembers', 'Team member invited!') });
    const updateTeamMemberMutation = useMutation({ mutationFn: apiClient.updateTeamMember, onSuccess: genericOnSuccessWithToast('teamMembers', 'Team member updated!') });

    // Deals
    const createDealMutation = useMutation({ mutationFn: apiClient.createDeal, onSuccess: genericOnSuccessWithToast('deals', 'Deal created!') });
    const updateDealMutation = useMutation({ mutationFn: apiClient.updateDeal, onSuccess: genericOnSuccessWithToast('deals', 'Deal updated!') });
    const deleteDealMutation = useMutation({ mutationFn: apiClient.deleteDeal, onSuccess: genericOnSuccessWithToast('deals', 'Deal deleted!') });

    // Marketing
    const createEmailTemplateMutation = useMutation({ mutationFn: apiClient.createEmailTemplate, onSuccess: genericOnSuccessWithToast('emailTemplates', 'Template created!') });
    const updateEmailTemplateMutation = useMutation({ mutationFn: apiClient.updateEmailTemplate, onSuccess: genericOnSuccessWithToast('emailTemplates', 'Template updated!') });
    const deleteEmailTemplateMutation = useMutation({ mutationFn: apiClient.deleteEmailTemplate, onSuccess: genericOnSuccessWithToast('emailTemplates', 'Template deleted!') });
    const createWorkflowMutation = useMutation({ mutationFn: apiClient.createWorkflow, onSuccess: genericOnSuccessWithToast('workflows', 'Workflow created!') });
    const updateWorkflowMutation = useMutation({ mutationFn: apiClient.updateWorkflow, onSuccess: genericOnSuccessWithToast('workflows', 'Workflow updated!') });
    const createCampaignMutation = useMutation({ mutationFn: apiClient.createCampaign, onSuccess: genericOnSuccessWithToast('campaigns', 'Campaign created!') });
    const updateCampaignMutation = useMutation({ mutationFn: apiClient.updateCampaign, onSuccess: genericOnSuccessWithToast('campaigns', 'Campaign updated!') });

    // Reports & Widgets
    const createCustomReportMutation = useMutation({ mutationFn: apiClient.createCustomReport, onSuccess: genericOnSuccessWithToast('customReports', 'Custom report saved!') });
    const deleteCustomReportMutation = useMutation({ mutationFn: apiClient.deleteCustomReport, onSuccess: genericOnSuccessWithToast(['customReports', 'dashboardWidgets'], 'Custom report deleted!') });
    const addDashboardWidgetMutation = useMutation({ mutationFn: (reportId: string) => apiClient.addDashboardWidget(reportId, organizationId), onSuccess: genericOnSuccessWithToast('dashboardWidgets', 'Widget added to dashboard!') });
    const removeDashboardWidgetMutation = useMutation({ mutationFn: (widgetId: string) => apiClient.removeDashboardWidget(widgetId, organizationId), onSuccess: genericOnSuccessWithToast('dashboardWidgets', 'Widget removed from dashboard!') });

    // Settings
    const updateOrganizationSettingsMutation = useMutation({ mutationFn: (settings: Partial<OrgSettingsType>) => apiClient.updateOrganizationSettings({ ...settings, organizationId } as OrgSettingsType), onSuccess: genericOnSuccessWithToast('organizationSettings', 'Settings updated!') });
    const updateCustomFieldsMutation = useMutation({ mutationFn: apiClient.updateCustomFields, onSuccess: genericOnSuccessWithToast('industryConfig', 'Custom fields updated!') });

    // Tickets
    const createTicketMutation = useMutation({
        mutationFn: apiClient.createTicket,
// FIX: Add explicit type `Ticket` to the `newTicket` parameter to resolve property access errors.
        onSuccess: (newTicket: Ticket) => {
            toast.success('Ticket created!');
            queryClient.invalidateQueries({ queryKey: ['tickets', organizationId] });
            if (newTicket.assignedToId && newTicket.assignedToId !== authenticatedUser?.id) {
                addNotification({
                    userId: newTicket.assignedToId,
                    type: 'ticket_assigned',
                    message: `${authenticatedUser?.name} assigned you a new ticket: "${newTicket.subject.substring(0, 30)}..."`,
                });
            }
        },
    });

    const updateTicketMutation = useMutation({
        onMutate: async (updatedTicket: Ticket) => {
            await queryClient.cancelQueries({ queryKey: ['tickets', organizationId] });
            const previousTickets = queryClient.getQueryData<Ticket[]>(['tickets', organizationId]);
            const oldTicket = previousTickets?.find(t => t.id === updatedTicket.id);
            return { oldTicket, updatedTicket };
        },
        mutationFn: apiClient.updateTicket,
// FIX: Add explicit type `Ticket` to the `updatedTicket` parameter to resolve property access errors.
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
        }
    });

    const addTicketReplyMutation = useMutation({
        mutationFn: ({ ticketId, reply }: { ticketId: string, reply: Omit<TicketReply, 'id' | 'timestamp'> }) => apiClient.addTicketReply(ticketId, reply),
// FIX: Add explicit type `Ticket` to the `updatedTicket` parameter to resolve property access errors.
        onSuccess: (updatedTicket: Ticket, variables) => {
            toast.success('Reply added!');
            queryClient.invalidateQueries({ queryKey: ['tickets', organizationId] });
            
            const originalTicket = ticketsQuery.data?.find((t: Ticket) => t.id === updatedTicket.id);
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
