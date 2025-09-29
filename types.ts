import React from 'react';
import { UseQueryResult, UseMutationResult } from '@tanstack/react-query';

// --- CORE ---
export type Industry = 'Health' | 'Finance' | 'Legal' | 'Generic';
// FIX: Added all pages to the Page type to allow for correct navigation and permissions.
export type Page = 'Dashboard' | 'Organizations' | 'Contacts' | 'Settings' | 'Interactions' | 'Calendar' | 'Inventory' | 'Reports' | 'Workflows' | 'Team' | 'My Tasks' | 'Profiles';
export type UserRole = 'Super Admin' | 'Organization Admin' | 'Team Member' | 'Client';
export type Theme = 'light' | 'dark' | 'system';

// --- DATA MODELS ---

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    organizationId?: string;
    // FIX: Added contactId for Client portal functionality.
    contactId?: string;
}

export interface Organization {
    id:string;
    name: string;
    industry: Industry;
    // FIX: Added missing properties to the Organization type.
    primaryContactEmail: string;
    createdAt: string;
}

// FIX: Added Interaction type.
export interface Interaction {
    id: string;
    contactId: string;
    userId: string;
    organizationId: string;
    type: 'Email' | 'Call' | 'Meeting' | 'Note' | 'Site Visit' | 'Maintenance Request' | 'Appointment';
    date: string;
    notes: string;
}

// FIX: Added Task type.
export interface Task {
    id: string;
    userId: string;
    contactId?: string;
    title: string;
    dueDate: string;
    isCompleted: boolean;
}

// FIX: Added CalendarEvent type.
export interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    contactId?: string;
    userIds: string[];
}

// FIX: Added Product type.
export interface Product {
    id: string;
    organizationId: string;
    supplierId?: string;
    warehouseId?: string;
    name: string;
    sku: string;
    category: string;
    description?: string;
    costPrice: number;
    salePrice: number;
    stockLevel: number;
}

// FIX: Added Supplier type.
export interface Supplier {
    id: string;
    organizationId: string;
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
}

// FIX: Added Warehouse type.
export interface Warehouse {
    id: string;
    organizationId: string;
    name: string;
    location: string;
}

// FIX: Added Workflow types.
export interface WorkflowTrigger {
    type: 'contactCreated';
    conditions?: any;
}

export interface WorkflowAction {
    type: 'createTask' | 'sendEmail';
    params: any;
}

export interface Workflow {
    id: string;
    organizationId: string;
    name: string;
    isActive: boolean;
    trigger: WorkflowTrigger;
    actions: WorkflowAction[];
}

// FIX: Added Order and LineItem types.
export interface LineItem {
    id: string;
    productId: string;
    description: string;
    quantity: number;
    unitPrice: number;
}
export interface Order {
    id: string;
    contactId: string;
    organizationId: string;
    orderDate: string;
    status: 'Pending' | 'Processing' | 'Completed' | 'Cancelled';
    paymentStatus: 'Paid' | 'Unpaid' | 'Partial';
    lineItems: LineItem[];
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
}

// FIX: Added Transaction type.
export interface Transaction {
    id: string;
    contactId: string;
    organizationId: string;
    orderId?: string;
    relatedChargeId?: string;
    type: 'Charge' | 'Payment' | 'Refund' | 'Credit';
    amount: number;
    date: string;
    method: 'Credit Card' | 'Bank Transfer' | 'Cash' | 'Insurance' | 'Other';
}

// FIX: Added Enrollment type.
export interface Enrollment {
    id: string;
    programName: string;
    startDate: string;
    endDate?: string;
    status: 'Active' | 'Completed' | 'Cancelled';
}

// FIX: Added Relationship type.
export interface Relationship {
    relatedContactId: string;
    relationshipType: string;
}

// FIX: Added StructuredRecord type.
export interface StructuredRecord {
    id: string;
    type: string;
    title: string;
    recordDate: string;
    fields: Record<string, any>;
}

// FIX: Added AuditLogEntry type.
export interface AuditLogEntry {
    id: string;
    timestamp: string;
    userId: string;
    userName: string;
    change: string;
}

// FIX: Added a base Contact type and a union type AnyContact.
export interface Contact {
    id: string;
    organizationId: string;
    contactName: string;
    email: string;
    phone: string;
    avatarUrl?: string;
    status: 'Lead' | 'Active' | 'Inactive' | 'Archived';
    leadSource: 'Web' | 'Referral' | 'Ad' | 'Direct';
    createdAt: string;
    customFields: Record<string, any>;
    interactions: Interaction[];
    orders: Order[];
    transactions: Transaction[];
    enrollments: Enrollment[];
    relationships: Relationship[];
    structuredRecords: StructuredRecord[];
    auditLogs: AuditLogEntry[];
}
export type AnyContact = Contact; // For simplicity, using a single flexible type.

// --- PERMISSIONS ---
// FIX: Added Permissions type.
export type PermissionSet = {
    view: boolean;
    create?: boolean;
    edit?: boolean;
    delete?: boolean;
};
export type Permissions = Record<Page, PermissionSet>;

// --- INDUSTRY CONFIG ---
// FIX: Added CustomField and IndustryConfig types.
export interface CustomField {
    id: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'textarea' | 'select';
    options?: string[];
}

export interface IndustryConfig {
    name: Industry;
    contactName: string;
    contactNamePlural: string;
    organizationName: string;
    organizationNamePlural: string;
    teamMemberName: string;
    teamMemberNamePlural: string;
    customFields: CustomField[];
    interactionTypes: string[];
    interactionCustomFields: CustomField[];
    structuredRecordTabName: string;
    structuredRecordTypes: {
        id: string;
        name: string;
        fields: CustomField[];
    }[];
    ordersTabName: string;
    enrollmentsTabName: string;
    dashboard: {
        kpis: {
            key: string;
            title: string;
            icon: React.ComponentType<any>;
        }[];
        charts: {
            dataKey: string;
            title: string;
            type: 'bar' | 'line' | 'pie';
        }[];
    };
}

// --- REPORTS ---
// FIX: Added Report types.
export type ReportType = 'sales' | 'inventory' | 'financial' | 'contacts' | 'team';
export interface SalesReportData {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    salesByProduct: { name: string; quantity: number; revenue: number }[];
}
export interface InventoryReportData {
    totalProducts: number;
    totalValue: number;
    lowStockItems: Product[];
    stockByCategory: { name: string; quantity: number }[];
}
export interface FinancialReportData {
    totalCharges: number;
    totalPayments: number;
    netBalance: number;
    paymentsByMethod: { name: Transaction['method']; amount: number }[];
}
export interface ContactsReportData {
    totalContacts: number;
    newContacts: number;
    contactsByStatus: { name: string; count: number }[];
    contactsByLeadSource: { name: string; count: number }[];
}
export interface TeamReportData {
    teamPerformance: {
        teamMemberId: string;
        teamMemberName: string;
        teamMemberRole: UserRole;
        appointments: number;
        tasks: number;
        totalRevenue: number;
    }[];
}
export type AnyReportData = SalesReportData | InventoryReportData | FinancialReportData | ContactsReportData | TeamReportData;


// --- CONTEXTS ---
// FIX: Added IndustryConfig to AppContextType.
export interface AppContextType {
    currentIndustry: Industry;
    setCurrentIndustry: (industry: Industry) => void;
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
    industryConfig: IndustryConfig;
}

// FIX: Added permissions to AuthContextType.
export interface AuthContextType {
    authenticatedUser: User | null;
    login: (user: User) => void;
    logout: () => void;
    permissions: Permissions | null;
}

export interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

// FIX: Added DataContextType.
export interface DataContextType {
    organizationsQuery: UseQueryResult<Organization[], Error>;
    contactsQuery: UseQueryResult<AnyContact[], Error>;
    interactionsQuery: UseQueryResult<Interaction[], Error>;
    tasksQuery: UseQueryResult<Task[], Error>;
    productsQuery: UseQueryResult<Product[], Error>;
    suppliersQuery: UseQueryResult<Supplier[], Error>;
    warehousesQuery: UseQueryResult<Warehouse[], Error>;
    calendarEventsQuery: UseQueryResult<CalendarEvent[], Error>;
    workflowsQuery: UseQueryResult<Workflow[], Error>;
    teamMembersQuery: UseQueryResult<User[], Error>;
    dashboardStatsQuery: UseQueryResult<any, Error>;
    dashboardChartsQuery: UseQueryResult<any, Error>;
    // Phase 1 Additions
    createTaskMutation: UseMutationResult<Task, Error, Omit<Task, 'id' | 'isCompleted' | 'userId'>, unknown>;
    updateTaskMutation: UseMutationResult<Task, Error, Task, unknown>;
    deleteTaskMutation: UseMutationResult<void, Error, string, unknown>;
    createInteractionMutation: UseMutationResult<Interaction, Error, Omit<Interaction, 'id'>, unknown>;
    createCalendarEventMutation: UseMutationResult<CalendarEvent, Error, Omit<CalendarEvent, 'id'>, unknown>;
    updateCalendarEventMutation: UseMutationResult<CalendarEvent, Error, CalendarEvent, unknown>;
}