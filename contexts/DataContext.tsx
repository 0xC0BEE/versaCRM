import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import apiClient from '../services/apiClient';
import {
    AnyContact, Organization, User, Task, CalendarEvent, Product, Supplier, Warehouse,
    // FIX: Aliased the imported `Document` type to `AppDocument` to resolve name collision with the global DOM `Document` type.
    Interaction, DashboardData, EmailTemplate, Document as AppDocument, Workflow, Deal, DealStage, CustomReport, ReportDataSource
} from '../types';
import { useAuth } from './AuthContext';
import { useApp } from './AppContext';
import toast from 'react-hot-toast';
import { checkAndTriggerWorkflows } from '../services/workflowService';

interface DataContextType {
    organizationsQuery: UseQueryResult<Organization[], Error>;
    createOrganizationMutation: any;
    updateOrganizationMutation: any;
    deleteOrganizationMutation: any;
    contactsQuery: UseQueryResult<AnyContact[], Error>;
    createContactMutation: any;
    updateContactMutation: any;
    deleteContactMutation: any;
    bulkDeleteContactsMutation: any;
    bulkUpdateContactStatusMutation: any;
    teamMembersQuery: UseQueryResult<User[], Error>;
    createTeamMemberMutation: any;
    updateTeamMemberMutation: any;
    tasksQuery: UseQueryResult<Task[], Error>;
    createTaskMutation: any;
    updateTaskMutation: any;
    deleteTaskMutation: any;
    calendarEventsQuery: UseQueryResult<CalendarEvent[], Error>;
    createCalendarEventMutation: any;
    updateCalendarEventMutation: any;
    productsQuery: UseQueryResult<Product[], Error>;
    createProductMutation: any;
    updateProductMutation: any;
    deleteProductMutation: any;
    suppliersQuery: UseQueryResult<Supplier[], Error>;
    warehousesQuery: UseQueryResult<Warehouse[], Error>;
    createInteractionMutation: any;
    // FIX: Added a query to fetch all interactions for the organization.
    allInteractionsQuery: UseQueryResult<Interaction[], Error>;
    dashboardData: DashboardData | undefined;
    isLoading: boolean;
    // FIX: Used the aliased `AppDocument` type to avoid collision.
    documentsQuery: (contactId: string) => UseQueryResult<AppDocument[], Error>;
    uploadDocumentMutation: any;
    deleteDocumentMutation: any;
    emailTemplatesQuery: UseQueryResult<EmailTemplate[], Error>;
    createEmailTemplateMutation: any;
    updateEmailTemplateMutation: any;
    deleteEmailTemplateMutation: any;
    workflowsQuery: UseQueryResult<Workflow[], Error>;
    createWorkflowMutation: any;
    updateWorkflowMutation: any;
    dealsQuery: UseQueryResult<Deal[], Error>;
    dealStagesQuery: UseQueryResult<DealStage[], Error>;
    createDealMutation: any;
    updateDealMutation: any;
    deleteDealMutation: any;
    customReportsQuery: UseQueryResult<CustomReport[], Error>;
    createCustomReportMutation: any;
    updateCustomFieldsMutation: any;
    createOrderMutation: any;
    updateOrderMutation: any;
    deleteOrderMutation: any;
    createTransactionMutation: any;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const queryClient = useQueryClient();
    const { authenticatedUser } = useAuth();
    const { currentIndustry } = useApp();
    const orgId = authenticatedUser?.organizationId;
    const userId = authenticatedUser?.id;

    // WORKFLOW DEPENDENCIES
    const workflowsQuery = useQuery<Workflow[], Error>({
        queryKey: ['workflows', orgId],
        queryFn: () => apiClient.getWorkflows(orgId!),
        enabled: !!orgId,
    });
    const emailTemplatesQuery = useQuery<EmailTemplate[], Error>({
        queryKey: ['emailTemplates', orgId],
        queryFn: () => apiClient.getEmailTemplates(orgId!),
        enabled: !!orgId,
    });
    
    // ORGANIZATIONS
    const organizationsQuery = useQuery<Organization[], Error>({
        queryKey: ['organizations'],
        queryFn: apiClient.getOrganizations,
    });

    const createOrganizationMutation = useMutation({
        mutationFn: apiClient.createOrganization,
        onSuccess: () => {
            toast.success('Organization created!');
            queryClient.invalidateQueries({ queryKey: ['organizations'] });
        },
        onError: () => toast.error('Failed to create organization.'),
    });

    const updateOrganizationMutation = useMutation({
        mutationFn: apiClient.updateOrganization,
        onSuccess: () => {
            toast.success('Organization updated!');
            queryClient.invalidateQueries({ queryKey: ['organizations'] });
        },
        onError: () => toast.error('Failed to update organization.'),
    });
    
    const deleteOrganizationMutation = useMutation({
        mutationFn: apiClient.deleteOrganization,
        onSuccess: () => {
            toast.success('Organization deleted!');
            queryClient.invalidateQueries({ queryKey: ['organizations'] });
        },
        onError: () => toast.error('Failed to delete organization.'),
    });

    // CONTACTS
    const contactsQuery = useQuery<AnyContact[], Error>({
        queryKey: ['contacts', orgId],
        queryFn: () => apiClient.getContacts(orgId!),
        enabled: !!orgId,
    });
    
    // Mutations for workflows
    const updateContactForWorkflow = (contact: AnyContact) => {
        apiClient.updateContact(contact).then(() => {
            queryClient.invalidateQueries({ queryKey: ['contacts', orgId] });
        });
    }

    const createContactMutation = useMutation({
        mutationFn: (contactData: Omit<AnyContact, 'id'>) => apiClient.createContact({ ...contactData, organizationId: orgId! }),
        onSuccess: (newContact) => {
            toast.success('Contact created!');
            queryClient.invalidateQueries({ queryKey: ['contacts', orgId] });
            checkAndTriggerWorkflows({
                event: 'contactCreated',
                contact: newContact,
                dependencies: {
                    workflows: workflowsQuery.data || [],
                    emailTemplates: emailTemplatesQuery.data || [],
                    createTask: (task) => createTaskMutation.mutate(task),
                    createInteraction: (interaction) => createInteractionMutation.mutate(interaction),
                    updateContact: updateContactForWorkflow,
                }
            })
        },
        onError: () => toast.error('Failed to create contact.'),
    });

    const updateContactMutation = useMutation({
        mutationFn: apiClient.updateContact,
        onSuccess: (updatedContact, originalContact) => {
            toast.success('Contact updated!');
            const original = queryClient.getQueryData<AnyContact[]>(['contacts', orgId])?.find(c => c.id === originalContact.id);

            queryClient.invalidateQueries({ queryKey: ['contacts', orgId] });
            queryClient.invalidateQueries({ queryKey: ['contactProfile', updatedContact.id]});
            
            if (original && original.status !== updatedContact.status) {
                checkAndTriggerWorkflows({
                    event: 'contactStatusChanged',
                    contact: updatedContact,
                    fromStatus: original.status,
                    toStatus: updatedContact.status,
                    dependencies: {
                        workflows: workflowsQuery.data || [],
                        emailTemplates: emailTemplatesQuery.data || [],
                        createTask: (task) => createTaskMutation.mutate(task),
                        createInteraction: (interaction) => createInteractionMutation.mutate(interaction),
                        updateContact: updateContactForWorkflow,
                    }
                });
            }
        },
        onError: () => toast.error('Failed to update contact.'),
    });

    const deleteContactMutation = useMutation({
        mutationFn: apiClient.deleteContact,
        onSuccess: () => {
            toast.success('Contact deleted!');
            queryClient.invalidateQueries({ queryKey: ['contacts', orgId] });
        },
        onError: () => toast.error('Failed to delete contact.'),
    });
    
    const bulkDeleteContactsMutation = useMutation({
        mutationFn: (ids: string[]) => apiClient.bulkDeleteContacts(ids, orgId!),
        onSuccess: () => {
            toast.success('Contacts deleted!');
            queryClient.invalidateQueries({ queryKey: ['contacts', orgId] });
        },
        onError: () => toast.error('Failed to delete contacts.'),
    });

    const bulkUpdateContactStatusMutation = useMutation({
        mutationFn: apiClient.bulkUpdateContactStatus,
        onSuccess: () => {
            toast.success('Contact statuses updated!');
            queryClient.invalidateQueries({ queryKey: ['contacts', orgId] });
        },
        onError: () => toast.error('Failed to update statuses.'),
    });

    // TEAM
    const teamMembersQuery = useQuery<User[], Error>({
        queryKey: ['teamMembers', orgId],
        queryFn: () => apiClient.getTeamMembers(orgId!),
        enabled: !!orgId,
    });
    
    const createTeamMemberMutation = useMutation({
        mutationFn: apiClient.createTeamMember,
        onSuccess: () => {
            toast.success('Team member invited!');
            queryClient.invalidateQueries({ queryKey: ['teamMembers', orgId] });
        },
        onError: () => toast.error('Failed to invite team member.'),
    });

    const updateTeamMemberMutation = useMutation({
        mutationFn: apiClient.updateTeamMember,
        onSuccess: () => {
            toast.success('Team member updated!');
            queryClient.invalidateQueries({ queryKey: ['teamMembers', orgId] });
        },
        onError: () => toast.error('Failed to update team member.'),
    });

    // TASKS
    const tasksQuery = useQuery<Task[], Error>({
        queryKey: ['tasks', userId],
        queryFn: () => apiClient.getTasks(userId!),
        enabled: !!userId,
    });
    
    const createTaskMutation = useMutation({
        mutationFn: (taskData: Omit<Task, 'id' | 'isCompleted'>) => apiClient.createTask({...taskData, userId: userId!, organizationId: orgId!}),
        onSuccess: () => {
            toast.success('Task created!');
            queryClient.invalidateQueries({ queryKey: ['tasks', userId] });
        },
        onError: () => toast.error('Failed to create task.'),
    });
    
    const updateTaskMutation = useMutation({
        mutationFn: apiClient.updateTask,
        onSuccess: () => {
            toast.success('Task updated!');
            queryClient.invalidateQueries({ queryKey: ['tasks', userId] });
        },
        onError: () => toast.error('Failed to update task.'),
    });
    
    const deleteTaskMutation = useMutation({
        mutationFn: apiClient.deleteTask,
        onSuccess: () => {
            toast.success('Task deleted!');
            queryClient.invalidateQueries({ queryKey: ['tasks', userId] });
        },
        onError: () => toast.error('Failed to delete task.'),
    });

    // CALENDAR
    const calendarEventsQuery = useQuery<CalendarEvent[], Error>({
        queryKey: ['calendarEvents', orgId],
        queryFn: () => apiClient.getCalendarEvents(orgId!),
        enabled: !!orgId,
    });
    
    const createCalendarEventMutation = useMutation({
        mutationFn: apiClient.createCalendarEvent,
        onSuccess: () => {
            toast.success('Event created!');
            queryClient.invalidateQueries({ queryKey: ['calendarEvents', orgId] });
        },
        onError: () => toast.error('Failed to create event.'),
    });
    
    const updateCalendarEventMutation = useMutation({
        mutationFn: apiClient.updateCalendarEvent,
        onSuccess: () => {
            toast.success('Event updated!');
            queryClient.invalidateQueries({ queryKey: ['calendarEvents', orgId] });
        },
        onError: () => toast.error('Failed to update event.'),
    });
    
    // INVENTORY
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
     const createProductMutation = useMutation({
        mutationFn: apiClient.createProduct,
        onSuccess: () => { toast.success('Product created!'); queryClient.invalidateQueries({ queryKey: ['products', orgId] }); },
        onError: () => toast.error('Failed to create product.'),
    });
    const updateProductMutation = useMutation({
        mutationFn: apiClient.updateProduct,
        onSuccess: () => { toast.success('Product updated!'); queryClient.invalidateQueries({ queryKey: ['products', orgId] }); },
        onError: () => toast.error('Failed to update product.'),
    });
    const deleteProductMutation = useMutation({
        mutationFn: apiClient.deleteProduct,
        onSuccess: () => { toast.success('Product deleted!'); queryClient.invalidateQueries({ queryKey: ['products', orgId] }); },
        onError: () => toast.error('Failed to delete product.'),
    });

    // INTERACTIONS
    const createInteractionMutation = useMutation({
        mutationFn: apiClient.createInteraction,
        onSuccess: (_, variables) => {
            toast.success('Interaction logged!');
            queryClient.invalidateQueries({ queryKey: ['contactInteractions', variables.contactId] });
            queryClient.invalidateQueries({ queryKey: ['interactions', orgId] });
        },
        onError: () => toast.error('Failed to log interaction.'),
    });
    
    // FIX: Added a query for all interactions within an organization.
    const allInteractionsQuery = useQuery<Interaction[], Error>({
        queryKey: ['interactions', orgId],
        queryFn: () => apiClient.getInteractions(orgId!),
        enabled: !!orgId,
    });

    // DASHBOARD
    const { data: dashboardData, isLoading: dashboardLoading } = useQuery<DashboardData, Error>({
        queryKey: ['dashboardData', currentIndustry, orgId],
        queryFn: () => apiClient.getDashboardData(currentIndustry, orgId!),
        enabled: !!orgId,
    });

    // DOCUMENTS
    // FIX: Used the aliased `AppDocument` type to resolve name collision.
    const documentsQuery = (contactId: string) => useQuery<AppDocument[], Error>({
        queryKey: ['documents', contactId],
        queryFn: () => apiClient.getDocuments(contactId),
        enabled: !!contactId,
    });
    const uploadDocumentMutation = useMutation({
        mutationFn: apiClient.uploadDocument,
        onSuccess: (data, variables) => {
            toast.success('Document uploaded!');
            queryClient.invalidateQueries({ queryKey: ['documents', variables.contactId] });
        },
        onError: () => toast.error('Failed to upload document.'),
    });
    const deleteDocumentMutation = useMutation({
        mutationFn: apiClient.deleteDocument,
        onSuccess: () => {
            toast.success('Document deleted!');
            // Invalidation happens in the component for dynamic query key
        },
        onError: () => toast.error('Failed to delete document.'),
    });
    
    // EMAIL TEMPLATES
    const createEmailTemplateMutation = useMutation({
        mutationFn: (templateData: Omit<EmailTemplate, 'id'>) => apiClient.createEmailTemplate({...templateData, organizationId: orgId!}),
        onSuccess: () => {
            toast.success('Email template created!');
            queryClient.invalidateQueries({ queryKey: ['emailTemplates', orgId] });
        },
        onError: () => toast.error('Failed to create email template.'),
    });

    const updateEmailTemplateMutation = useMutation({
        mutationFn: apiClient.updateEmailTemplate,
        onSuccess: () => {
            toast.success('Email template updated!');
            queryClient.invalidateQueries({ queryKey: ['emailTemplates', orgId] });
        },
        onError: () => toast.error('Failed to update email template.'),
    });

    const deleteEmailTemplateMutation = useMutation({
        mutationFn: apiClient.deleteEmailTemplate,
        onSuccess: () => {
            toast.success('Email template deleted!');
            queryClient.invalidateQueries({ queryKey: ['emailTemplates', orgId] });
        },
        onError: () => toast.error('Failed to delete email template.'),
    });

    // WORKFLOWS
     const createWorkflowMutation = useMutation({
        mutationFn: apiClient.createWorkflow,
        onSuccess: () => { toast.success('Workflow created!'); queryClient.invalidateQueries({ queryKey: ['workflows', orgId] }); },
        onError: () => toast.error('Failed to create workflow.'),
    });
     const updateWorkflowMutation = useMutation({
        mutationFn: apiClient.updateWorkflow,
        onSuccess: () => { toast.success('Workflow updated!'); queryClient.invalidateQueries({ queryKey: ['workflows', orgId] }); },
        onError: () => toast.error('Failed to update workflow.'),
    });

    // DEALS
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
    const createDealMutation = useMutation({
        mutationFn: (deal: Omit<Deal, 'id'>) => apiClient.createDeal({...deal, organizationId: orgId!}),
        onSuccess: () => { toast.success('Deal created!'); queryClient.invalidateQueries({ queryKey: ['deals', orgId] }); },
        onError: () => toast.error('Failed to create deal.'),
    });
    const updateDealMutation = useMutation({
        mutationFn: apiClient.updateDeal,
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['deals', orgId] }); },
        onError: () => toast.error('Failed to update deal.'),
    });
     const deleteDealMutation = useMutation({
        mutationFn: apiClient.deleteDeal,
        onSuccess: () => { toast.success('Deal deleted!'); queryClient.invalidateQueries({ queryKey: ['deals', orgId] }); },
        onError: () => toast.error('Failed to delete deal.'),
    });
    
    // CUSTOM REPORTS
    const customReportsQuery = useQuery<CustomReport[], Error>({
        queryKey: ['customReports', orgId],
        queryFn: () => apiClient.getCustomReports(orgId!),
        enabled: !!orgId,
    });
    const createCustomReportMutation = useMutation({
        mutationFn: (report: Omit<CustomReport, 'id'>) => apiClient.createCustomReport({...report, organizationId: orgId!}),
        onSuccess: () => { toast.success('Report saved!'); queryClient.invalidateQueries({ queryKey: ['customReports', orgId] }); },
        onError: () => toast.error('Failed to save report.'),
    });
    
    // FORM BUILDER
    const updateCustomFieldsMutation = useMutation({
        mutationFn: apiClient.updateCustomFields,
        onSuccess: () => {
            toast.success('Custom fields updated!');
            queryClient.invalidateQueries({ queryKey: ['industryConfig', currentIndustry] });
        },
        onError: () => toast.error('Failed to update custom fields.'),
    });
    
    // ORDERS
    const createOrderMutation = useMutation({
        mutationFn: apiClient.createOrder,
        onSuccess: (data, variables) => { toast.success('Order created!'); queryClient.invalidateQueries({ queryKey: ['contacts', orgId]}); },
        onError: () => toast.error('Failed to create order.'),
    });
     const updateOrderMutation = useMutation({
        mutationFn: apiClient.updateOrder,
        onSuccess: () => { toast.success('Order updated!'); queryClient.invalidateQueries({ queryKey: ['contacts', orgId]}); },
        onError: () => toast.error('Failed to update order.'),
    });
     const deleteOrderMutation = useMutation({
        mutationFn: apiClient.deleteOrder,
        onSuccess: () => { toast.success('Order deleted!'); queryClient.invalidateQueries({ queryKey: ['contacts', orgId]}); },
        onError: () => toast.error('Failed to delete order.'),
    });
    
    // TRANSACTIONS
    const createTransactionMutation = useMutation({
        mutationFn: apiClient.createTransaction,
        onSuccess: () => { toast.success('Transaction added!'); queryClient.invalidateQueries({ queryKey: ['contacts', orgId]}); },
        onError: () => toast.error('Failed to add transaction.'),
    });

    const value: DataContextType = {
        organizationsQuery, createOrganizationMutation, updateOrganizationMutation, deleteOrganizationMutation,
        contactsQuery, createContactMutation, updateContactMutation, deleteContactMutation, bulkDeleteContactsMutation, bulkUpdateContactStatusMutation,
        teamMembersQuery, createTeamMemberMutation, updateTeamMemberMutation,
        tasksQuery, createTaskMutation, updateTaskMutation, deleteTaskMutation,
        calendarEventsQuery, createCalendarEventMutation, updateCalendarEventMutation,
        productsQuery, createProductMutation, updateProductMutation, deleteProductMutation,
        suppliersQuery,
        warehousesQuery,
        createInteractionMutation,
        allInteractionsQuery,
        dashboardData,
        isLoading: organizationsQuery.isLoading || contactsQuery.isLoading,
        documentsQuery, uploadDocumentMutation, deleteDocumentMutation,
        emailTemplatesQuery, createEmailTemplateMutation, updateEmailTemplateMutation, deleteEmailTemplateMutation,
        workflowsQuery, createWorkflowMutation, updateWorkflowMutation,
        dealsQuery, dealStagesQuery, createDealMutation, updateDealMutation, deleteDealMutation,
        customReportsQuery, createCustomReportMutation,
        updateCustomFieldsMutation,
        createOrderMutation, updateOrderMutation, deleteOrderMutation,
        createTransactionMutation,
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