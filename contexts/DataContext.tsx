import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import apiClient from '../services/apiClient';
import { useAuth } from './AuthContext';
import { AnyContact, ContactStatus, CustomField, EmailTemplate, Industry, Interaction, Order, Product, Task, Transaction, User, Workflow, CustomReport, Organization, CalendarEvent, Document } from '../types';
import toast from 'react-hot-toast';
import { useNotifications } from './NotificationContext';

interface DataContextType {
    // Queries
    organizationsQuery: any;
    contactsQuery: any;
    teamMembersQuery: any;
    interactionsQuery: any;
    documentsQuery: (contactId: string) => any;
    calendarEventsQuery: any;
    tasksQuery: any;
    productsQuery: any;
    suppliersQuery: any;
    warehousesQuery: any;
    emailTemplatesQuery: any;
    customReportsQuery: any;
    workflowsQuery: any;
    dashboardData: any;
    isLoading: boolean;

    // Mutations
    createOrganizationMutation: any;
    updateOrganizationMutation: any;
    deleteOrganizationMutation: any;
    
    createContactMutation: any;
    updateContactMutation: any;
    deleteContactMutation: any;
    bulkDeleteContactsMutation: any;
    bulkUpdateContactStatusMutation: any;
    
    createInteractionMutation: any;

    uploadDocumentMutation: any;
    deleteDocumentMutation: any;
    
    createCalendarEventMutation: any;
    updateCalendarEventMutation: any;
    
    createTaskMutation: any;
    updateTaskMutation: any;
    deleteTaskMutation: any;

    createTeamMemberMutation: any;
    updateTeamMemberMutation: any;
    
    createProductMutation: any;
    updateProductMutation: any;
    deleteProductMutation: any;
    
    createOrderMutation: any;
    updateOrderMutation: any;
    deleteOrderMutation: any;
    
    createTransactionMutation: any;
    
    createEmailTemplateMutation: any;
    updateEmailTemplateMutation: any;
    deleteEmailTemplateMutation: any;
    
    createCustomReportMutation: any;
    
    createWorkflowMutation: any;
    updateWorkflowMutation: any;

    updateCustomFieldsMutation: any;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const queryClient = useQueryClient();
    const { authenticatedUser } = useAuth();
    const { addNotification } = useNotifications();
    const orgId = authenticatedUser?.organizationId || '';
    const userId = authenticatedUser?.id || '';
    
    const isEnabled = !!authenticatedUser; // Only enable queries if user is logged in

    // --- QUERIES ---

    const organizationsQuery = useQuery({
        queryKey: ['organizations'],
        queryFn: apiClient.getOrganizations,
        enabled: isEnabled && authenticatedUser.role === 'Super Admin'
    });
    
    const contactsQuery = useQuery({
        queryKey: ['contacts', orgId],
        queryFn: () => apiClient.getContacts(orgId),
        enabled: isEnabled && !!orgId,
    });
    
    const teamMembersQuery = useQuery({
        queryKey: ['teamMembers', orgId],
        queryFn: () => apiClient.getTeamMembers(orgId),
        enabled: isEnabled && !!orgId,
    });
    
     const interactionsQuery = useQuery({
        queryKey: ['interactions', orgId],
        queryFn: () => apiClient.getInteractions(orgId),
        enabled: isEnabled && !!orgId,
    });

    const documentsQuery = (contactId: string) => useQuery({
        queryKey: ['documents', contactId],
        queryFn: () => apiClient.getDocumentsByContact(contactId),
        enabled: isEnabled && !!contactId,
    });
    
    const calendarEventsQuery = useQuery({
        queryKey: ['calendarEvents', orgId],
        queryFn: () => apiClient.getCalendarEvents(orgId),
        enabled: isEnabled && !!orgId,
    });
    
    const tasksQuery = useQuery({
        queryKey: ['tasks', userId],
        queryFn: () => apiClient.getTasks(userId),
        enabled: isEnabled && !!userId,
    });
    
    const productsQuery = useQuery({
        queryKey: ['products', orgId],
        queryFn: () => apiClient.getProducts(orgId),
        enabled: isEnabled && !!orgId,
    });
    
     const suppliersQuery = useQuery({
        queryKey: ['suppliers', orgId],
        queryFn: () => apiClient.getSuppliers(orgId),
        enabled: isEnabled && !!orgId,
    });
    
    const warehousesQuery = useQuery({
        queryKey: ['warehouses', orgId],
        queryFn: () => apiClient.getWarehouses(orgId),
        enabled: isEnabled && !!orgId,
    });
    
     const emailTemplatesQuery = useQuery({
        queryKey: ['emailTemplates', orgId],
        queryFn: () => apiClient.getEmailTemplates(orgId),
        enabled: isEnabled && !!orgId,
    });

    const customReportsQuery = useQuery({
        queryKey: ['customReports', orgId],
        queryFn: () => apiClient.getCustomReports(orgId),
        enabled: isEnabled && !!orgId,
    });
    
    const workflowsQuery = useQuery({
        queryKey: ['workflows', orgId],
        queryFn: () => apiClient.getWorkflows(orgId),
        enabled: isEnabled && !!orgId,
    });
    
    const {data: dashboardData, isLoading: isDashboardLoading} = useQuery({
        queryKey: ['dashboardData', orgId],
        queryFn: async () => {
            if (!orgId) return null;
            const dateRange = { start: new Date(new Date().setDate(new Date().getDate() - 30)), end: new Date() };
            const contacts = await apiClient.getContacts(orgId);
            const interactions = await apiClient.getInteractions(orgId);
            const kpis = {
                totalContacts: contacts.length,
                newContacts: contacts.filter(c => new Date(c.createdAt) >= dateRange.start).length,
                upcomingAppointments: interactions.filter(i => (i.type === 'Appointment' || i.type === 'Meeting') && new Date(i.date) > new Date()).length,
            };
            const charts = {
                contactsByStatus: Object.entries(contacts.reduce((acc, c) => {
                    acc[c.status] = (acc[c.status] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>)).map(([name, value]) => ({ name, value })),
                appointmentsByMonth: [...Array(12)].map((_, i) => ({
                    name: new Date(0, i).toLocaleString('default', { month: 'short' }),
                    value: interactions.filter(item => (item.type === 'Appointment' || item.type === 'Meeting') && new Date(item.date).getMonth() === i).length,
                })),
            };
            return { kpis, charts };
        },
        enabled: isEnabled && !!orgId,
    });


    // --- MUTATIONS ---
    
    // Generic helper for mutations that just invalidate a query on success.
    const useInvalidatingMutation = <TVariables, TData>(
        mutationFn: (variables: TVariables) => Promise<TData>,
        queryKeyToInvalidate: any[],
        successMsg: string,
        errorMsg: string
    ) => {
        return useMutation<TData, Error, TVariables>({
            mutationFn,
            onSuccess: () => {
                toast.success(successMsg);
                queryClient.invalidateQueries({ queryKey: queryKeyToInvalidate });
            },
            onError: (err: any) => {
                toast.error(`${errorMsg}: ${err.message || 'An error occurred'}`);
            },
        });
    };

    // Organizations
    const createOrganizationMutation = useInvalidatingMutation(apiClient.createOrganization, ['organizations'], 'Organization created!', 'Failed to create organization');
    const updateOrganizationMutation = useInvalidatingMutation(apiClient.updateOrganization, ['organizations'], 'Organization updated!', 'Failed to update organization');
    const deleteOrganizationMutation = useInvalidatingMutation(apiClient.deleteOrganization, ['organizations'], 'Organization deleted!', 'Failed to delete organization');
    
    // Contacts (These use optimistic updates, so they are not using the generic helper)
    const createContactMutation = useMutation({
        mutationFn: (contactData: Omit<AnyContact, 'id'>) => apiClient.createContact(contactData, orgId),
        onSuccess: (newContact) => {
            toast.success('Contact created!');
            queryClient.setQueryData(['contacts', orgId], (oldData: AnyContact[] = []) => [...oldData, newContact]);
        },
        onError: (err: any) => toast.error(`Failed to create contact: ${err.message}`),
    });
    const updateContactMutation = useMutation({
        mutationFn: (updatedContact: AnyContact) => apiClient.updateContact(updatedContact),
        onSuccess: (updatedContact) => {
            toast.success('Contact updated!');
            queryClient.setQueryData(['contacts', orgId], (oldData: AnyContact[] = []) => 
                oldData.map(c => c.id === updatedContact.id ? updatedContact : c)
            );
        },
        onError: (err: any) => toast.error(`Failed to update contact: ${err.message}`),
    });
    const deleteContactMutation = useMutation({
        mutationFn: (contactId: string) => apiClient.deleteContact(contactId),
        onSuccess: (_, contactId) => {
            toast.success('Contact deleted!');
            queryClient.setQueryData(['contacts', orgId], (oldData: AnyContact[] = []) =>
                oldData.filter(c => c.id !== contactId)
            );
        },
        onError: (err: any) => toast.error(`Failed to delete contact: ${err.message}`),
    });
     const bulkDeleteContactsMutation = useMutation({
        mutationFn: (contactIds: string[]) => apiClient.bulkDeleteContacts(contactIds),
        onSuccess: (_, contactIds) => {
            toast.success(`${contactIds.length} contacts deleted!`);
            queryClient.setQueryData(['contacts', orgId], (oldData: AnyContact[] = []) =>
                oldData.filter(c => !contactIds.includes(c.id))
            );
        },
        onError: (err: any) => toast.error(`Failed to delete contacts: ${err.message}`),
    });
    const bulkUpdateContactStatusMutation = useMutation({
        mutationFn: ({ ids, status }: { ids: string[]; status: ContactStatus }) => apiClient.bulkUpdateContactStatus(ids, status),
        onSuccess: (_, { ids, status }) => {
            toast.success(`${ids.length} contacts updated to "${status}"!`);
            queryClient.setQueryData(['contacts', orgId], (oldData: AnyContact[] = []) =>
                oldData.map(c => ids.includes(c.id) ? { ...c, status } : c)
            );
        },
        onError: (err: any) => toast.error(`Failed to update status: ${err.message}`),
    });
    
    // Interactions (Complex side-effects, not using generic helper)
    const createInteractionMutation = useMutation({
        mutationFn: (interactionData: Omit<Interaction, 'id'>) => apiClient.createInteraction(interactionData),
        onSuccess: (savedInteraction) => {
            toast.success("Interaction logged!");
            queryClient.invalidateQueries({ queryKey: ['interactions', orgId] });
            queryClient.invalidateQueries({ queryKey: ['contactInteractions', savedInteraction.contactId] });
            queryClient.invalidateQueries({ queryKey: ['contacts', orgId] });

            // Check for @mentions and create notifications
            if (savedInteraction.notes.includes('@')) {
                const teamMembers = queryClient.getQueryData<User[]>(['teamMembers', orgId]) || [];
                const contacts = queryClient.getQueryData<AnyContact[]>(['contacts', orgId]) || [];

                if (teamMembers.length > 0) {
                    const contact = contacts.find(c => c.id === savedInteraction.contactId);
                    const names = teamMembers.map(tm => tm.name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
                    const mentionRegex = new RegExp(`@(${names.join('|')})`, 'g');
                    const mentions = savedInteraction.notes.match(mentionRegex);

                    if (mentions) {
                        mentions.forEach(mention => {
                            const name = mention.substring(1);
                            const mentionedUser = teamMembers.find(tm => tm.name === name);
                            // Don't notify user for mentioning themselves
                            if (mentionedUser && contact && mentionedUser.id !== authenticatedUser?.id) {
                                addNotification({
                                    type: 'mention',
                                    userId: mentionedUser.id,
                                    message: `${authenticatedUser?.name} mentioned you in a note for ${contact.contactName}.`
                                });
                            }
                        });
                    }
                }
            }
        },
        onError: (err: any) => toast.error(`Failed to log interaction: ${err.message}`),
    });
    
    // Documents (Dynamic query key invalidation)
    const uploadDocumentMutation = useMutation({
        mutationFn: (docData: Omit<Document, 'id'>) => apiClient.uploadDocument(docData),
        onSuccess: (newDoc) => {
            toast.success("Document uploaded!");
            queryClient.invalidateQueries({ queryKey: ['documents', newDoc.contactId] });
        },
        onError: (err: any) => toast.error(`Failed to upload document: ${err.message}`),
    });
    const deleteDocumentMutation = useInvalidatingMutation(apiClient.deleteDocument, ['documents'], 'Document deleted!', 'Failed to delete document');

    // Calendar
    const createCalendarEventMutation = useInvalidatingMutation((eventData: any) => apiClient.createCalendarEvent(eventData, orgId), ['calendarEvents', orgId], 'Event created!', 'Failed to create event');
    const updateCalendarEventMutation = useInvalidatingMutation(apiClient.updateCalendarEvent, ['calendarEvents', orgId], 'Event updated!', 'Failed to update event');
    
    // Tasks
    const createTaskMutation = useMutation({
        mutationFn: (taskData: Omit<Task, 'id' | 'isCompleted'>) => apiClient.createTask(taskData, userId, orgId),
        onSuccess: (newTask) => {
            toast.success("Task added!");
            queryClient.setQueryData(['tasks', userId], (oldData: Task[] = []) => [...oldData, newTask]);
        },
        onError: (err: any) => toast.error(`Failed to add task: ${err.message}`),
    });
    const updateTaskMutation = useInvalidatingMutation(apiClient.updateTask, ['tasks', userId], 'Task updated!', 'Failed to update task');
    const deleteTaskMutation = useInvalidatingMutation(apiClient.deleteTask, ['tasks', userId], 'Task deleted!', 'Failed to delete task');
    
    // Team
    const createTeamMemberMutation = useInvalidatingMutation(apiClient.createTeamMember, ['teamMembers', orgId], 'Team member invited!', 'Failed to invite member');
    const updateTeamMemberMutation = useInvalidatingMutation(apiClient.updateTeamMember, ['teamMembers', orgId], 'Team member updated!', 'Failed to update member');
    
    // Products
    const createProductMutation = useInvalidatingMutation(apiClient.createProduct, ['products', orgId], 'Product created!', 'Failed to create product');
    const updateProductMutation = useInvalidatingMutation(apiClient.updateProduct, ['products', orgId], 'Product updated!', 'Failed to update product');
    const deleteProductMutation = useInvalidatingMutation(apiClient.deleteProduct, ['products', orgId], 'Product deleted!', 'Failed to delete product');
    
    // Orders, Transactions (mock, invalidate contacts to refetch nested data)
    const createOrderMutation = useInvalidatingMutation((data: any) => Promise.resolve(data), ['contacts', orgId], 'Order created!', 'Failed to create order');
    const updateOrderMutation = useInvalidatingMutation((data: any) => Promise.resolve(data), ['contacts', orgId], 'Order updated!', 'Failed to update order');
    const deleteOrderMutation = useInvalidatingMutation((data: any) => Promise.resolve(data), ['contacts', orgId], 'Order deleted!', 'Failed to delete order');
    const createTransactionMutation = useInvalidatingMutation((data: any) => Promise.resolve(data), ['contacts', orgId], 'Transaction logged!', 'Failed to log transaction');
    
    // Email Templates
    const createEmailTemplateMutation = useInvalidatingMutation(apiClient.createEmailTemplate, ['emailTemplates', orgId], 'Template created!', 'Failed to create template');
    const updateEmailTemplateMutation = useInvalidatingMutation(apiClient.updateEmailTemplate, ['emailTemplates', orgId], 'Template updated!', 'Failed to update template');
    const deleteEmailTemplateMutation = useInvalidatingMutation(apiClient.deleteEmailTemplate, ['emailTemplates', orgId], 'Template deleted!', 'Failed to delete template');
    
    // Custom Reports
    const createCustomReportMutation = useInvalidatingMutation(apiClient.createCustomReport, ['customReports', orgId], 'Report saved!', 'Failed to save report');
    
    // Workflows
    const createWorkflowMutation = useInvalidatingMutation(apiClient.createWorkflow, ['workflows', orgId], 'Workflow created!', 'Failed to create workflow');
    const updateWorkflowMutation = useInvalidatingMutation(apiClient.updateWorkflow, ['workflows', orgId], 'Workflow updated!', 'Failed to update workflow');

    // Industry Config (Dynamic query key invalidation)
    const updateCustomFieldsMutation = useMutation({
        mutationFn: ({ industry, fields }: { industry: Industry; fields: CustomField[] }) => apiClient.updateCustomFields(industry, fields),
        onSuccess: (updatedConfig) => {
            toast.success('Custom fields updated!');
            queryClient.invalidateQueries({ queryKey: ['industryConfig', updatedConfig.name] });
        },
        onError: (err: any) => {
            toast.error(`Failed to update fields: ${err.message}`);
        },
    });


    const value = {
        organizationsQuery,
        contactsQuery,
        teamMembersQuery,
        interactionsQuery,
        documentsQuery,
        calendarEventsQuery,
        tasksQuery,
        productsQuery,
        suppliersQuery,
        warehousesQuery,
        emailTemplatesQuery,
        customReportsQuery,
        workflowsQuery,
        dashboardData,
        isLoading: isDashboardLoading,

        createOrganizationMutation,
        updateOrganizationMutation,
        deleteOrganizationMutation,
        
        createContactMutation,
        updateContactMutation,
        deleteContactMutation,
        bulkDeleteContactsMutation,
        bulkUpdateContactStatusMutation,
        
        createInteractionMutation,

        uploadDocumentMutation,
        deleteDocumentMutation,
        
        createCalendarEventMutation,
        updateCalendarEventMutation,
        
        createTaskMutation,
        updateTaskMutation,
        deleteTaskMutation,

        createTeamMemberMutation,
        updateTeamMemberMutation,
        
        createProductMutation,
        updateProductMutation,
        deleteProductMutation,
        
        createOrderMutation,
        updateOrderMutation,
        deleteOrderMutation,

        createTransactionMutation,

        createEmailTemplateMutation,
        updateEmailTemplateMutation,
        deleteEmailTemplateMutation,
        
        createCustomReportMutation,
        
        createWorkflowMutation,
        updateWorkflowMutation,

        updateCustomFieldsMutation,
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