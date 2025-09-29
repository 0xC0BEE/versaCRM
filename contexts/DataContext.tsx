import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { DataContextType, Organization, AnyContact, Interaction, Task, Product, Supplier, Warehouse, CalendarEvent, Workflow, User } from '../types';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useApp } from './AppContext';

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const queryClient = useQueryClient();
    const { authenticatedUser } = useAuth();
    const { currentIndustry } = useApp();
    const orgId = authenticatedUser?.organizationId;
    const userId = authenticatedUser?.id;
    const userRole = authenticatedUser?.role;

    const isSuperAdmin = userRole === 'Super Admin';

    // Organizations
    const organizationsQuery = useQuery({
        queryKey: ['organizations', isSuperAdmin ? currentIndustry : orgId],
        queryFn: () => isSuperAdmin ? api.getOrganizationsForSuperAdmin(currentIndustry) : api.getOrganizations(),
        enabled: !!authenticatedUser,
    });

    // Contacts
    const contactsQuery = useQuery({
        queryKey: ['contacts', isSuperAdmin ? currentIndustry : orgId],
        queryFn: () => isSuperAdmin ? api.getContactsForSuperAdmin(currentIndustry) : api.getContacts(orgId!),
        enabled: !!authenticatedUser && (isSuperAdmin || !!orgId),
    });

    // Interactions
    const interactionsQuery = useQuery({
        queryKey: ['interactions', isSuperAdmin ? currentIndustry : orgId],
        queryFn: () => isSuperAdmin ? api.getInteractionsForSuperAdmin(currentIndustry) : api.getInteractions(orgId!),
        enabled: !!authenticatedUser && (isSuperAdmin || !!orgId),
    });
    
    // Tasks (specific to logged-in user)
    const tasksQuery = useQuery({
        queryKey: ['tasks', userId],
        queryFn: () => api.getTasks(userId!),
        enabled: !!userId,
    });

    // Products
    const productsQuery = useQuery({
        queryKey: ['products', isSuperAdmin ? currentIndustry : orgId],
        queryFn: () => isSuperAdmin ? api.getProductsForSuperAdmin(currentIndustry) : api.getProducts(orgId!),
        enabled: !!authenticatedUser && (isSuperAdmin || !!orgId),
    });

    // Suppliers
    const suppliersQuery = useQuery({
        queryKey: ['suppliers', isSuperAdmin ? currentIndustry : orgId],
        queryFn: () => isSuperAdmin ? api.getSuppliersForSuperAdmin(currentIndustry) : api.getSuppliers(orgId!),
        enabled: !!authenticatedUser && (isSuperAdmin || !!orgId),
    });

    // Warehouses
    const warehousesQuery = useQuery({
        queryKey: ['warehouses', isSuperAdmin ? currentIndustry : orgId],
        queryFn: () => isSuperAdmin ? api.getWarehousesForSuperAdmin(currentIndustry) : api.getWarehouses(orgId!),
        enabled: !!authenticatedUser && (isSuperAdmin || !!orgId),
    });

    // Calendar Events
    const calendarEventsQuery = useQuery({
        queryKey: ['calendarEvents', userId],
        queryFn: () => api.getCalendarEvents([userId!]),
        enabled: !!userId,
    });

    // Workflows
    const workflowsQuery = useQuery({
        queryKey: ['workflows', isSuperAdmin ? currentIndustry : orgId],
        queryFn: () => isSuperAdmin ? api.getWorkflowsForSuperAdmin(currentIndustry) : api.getWorkflows(orgId!),
        enabled: !!authenticatedUser && (isSuperAdmin || !!orgId),
    });

    // Team Members
    const teamMembersQuery = useQuery({
        queryKey: ['teamMembers', isSuperAdmin ? currentIndustry : orgId],
        queryFn: () => isSuperAdmin ? api.getUsersForSuperAdmin(currentIndustry) : api.getUsers(orgId!),
        enabled: !!authenticatedUser && (isSuperAdmin || !!orgId),
    });

    // Dashboard Queries (placeholders for now)
    const dashboardStatsQuery = useQuery({ queryKey: ['dashboardStats'], queryFn: () => Promise.resolve({}), enabled: !!authenticatedUser });
    const dashboardChartsQuery = useQuery({ queryKey: ['dashboardCharts'], queryFn: () => Promise.resolve({}), enabled: !!authenticatedUser });
    
    // Mutations
    const createTaskMutation = useMutation<Task, Error, Omit<Task, 'id' | 'isCompleted' | 'userId'>>({
        mutationFn: (taskData) => api.createTask({ ...taskData, userId: userId! }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', userId] });
        },
    });

    const updateTaskMutation = useMutation<Task, Error, Task>({
        mutationFn: api.updateTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', userId] });
        },
    });

    const deleteTaskMutation = useMutation<void, Error, string>({
        mutationFn: api.deleteTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', userId] });
        },
    });

    const createInteractionMutation = useMutation<Interaction, Error, Omit<Interaction, 'id'>>({
        mutationFn: api.createInteraction,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['interactions'] });
            queryClient.invalidateQueries({ queryKey: ['contactInteractions', data.contactId]});
        },
    });

    const createCalendarEventMutation = useMutation<CalendarEvent, Error, Omit<CalendarEvent, 'id'>>({
        mutationFn: api.createCalendarEvent,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['calendarEvents', userId] });
        },
    });
    
    const updateCalendarEventMutation = useMutation<CalendarEvent, Error, CalendarEvent>({
        mutationFn: api.updateCalendarEvent,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['calendarEvents', userId] });
        },
    });


    const value: DataContextType = {
        organizationsQuery: organizationsQuery as UseQueryResult<Organization[], Error>,
        contactsQuery: contactsQuery as UseQueryResult<AnyContact[], Error>,
        interactionsQuery: interactionsQuery as UseQueryResult<Interaction[], Error>,
        tasksQuery: tasksQuery as UseQueryResult<Task[], Error>,
        productsQuery: productsQuery as UseQueryResult<Product[], Error>,
        suppliersQuery: suppliersQuery as UseQueryResult<Supplier[], Error>,
        warehousesQuery: warehousesQuery as UseQueryResult<Warehouse[], Error>,
        calendarEventsQuery: calendarEventsQuery as UseQueryResult<CalendarEvent[], Error>,
        workflowsQuery: workflowsQuery as UseQueryResult<Workflow[], Error>,
        teamMembersQuery: teamMembersQuery as UseQueryResult<User[], Error>,
        dashboardStatsQuery,
        dashboardChartsQuery,
        createTaskMutation: createTaskMutation as UseMutationResult<Task, Error, Omit<Task, 'id' | 'isCompleted' | 'userId'>, unknown>,
        updateTaskMutation: updateTaskMutation as UseMutationResult<Task, Error, Task, unknown>,
        deleteTaskMutation: deleteTaskMutation as UseMutationResult<void, Error, string, unknown>,
        createInteractionMutation: createInteractionMutation as UseMutationResult<Interaction, Error, Omit<Interaction, 'id'>, unknown>,
        createCalendarEventMutation: createCalendarEventMutation as UseMutationResult<CalendarEvent, Error, Omit<CalendarEvent, 'id'>, unknown>,
        updateCalendarEventMutation: updateCalendarEventMutation as UseMutationResult<CalendarEvent, Error, CalendarEvent, unknown>,
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
