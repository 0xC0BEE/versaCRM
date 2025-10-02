import { ReactNode } from 'react';

// FIX: Added 'Workflows' to the Page type.
export type Page = 'Dashboard' | 'Contacts' | 'Organizations' | 'Deals' | 'Interactions' | 'Calendar' | 'Tasks' | 'Inventory' | 'Reports' | 'Settings' | 'Campaigns' | 'Workflows';
export type Industry = 'Health' | 'Finance' | 'Legal' | 'Generic';
export type Theme = 'light' | 'dark' | 'system';

export interface CustomField {
    id: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox' | 'file';
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
    interactionTypes: InteractionType[];
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
        kpis: { key: string, title: string, icon: string }[];
        charts: { dataKey: string, title: string, type: 'bar' | 'line' | 'pie' }[];
    };
}

export interface FilterCondition {
    field: string;
    operator: 'is' | 'is_not' | 'contains' | 'does_not_contain';
    value: string;
}

export interface AppContextType {
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
    currentIndustry: Industry;
    setCurrentIndustry: (industry: Industry) => void;
    industryConfig: IndustryConfig;
    contactFilters: FilterCondition[];
    setContactFilters: (filters: FilterCondition[]) => void;
}

export type UserRole = 'Super Admin' | 'Organization Admin' | 'Team Member' | 'Client';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    organizationId?: string;
    contactId?: string;
}

export interface Permissions {
    [key: string]: boolean;
}

export interface AuthContextType {
    authenticatedUser: User | null;
    login: (user: User) => void;
    logout: () => void;
    permissions: Permissions | null;
}

export type ReportType = 'sales' | 'inventory' | 'financial' | 'contacts' | 'team' | 'deals';

export interface SalesReportData {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    salesByProduct: { name: string; quantity: number; revenue: number }[];
}

export interface InventoryReportData {
    totalProducts: number;
    totalValue: number;
    lowStockItems: { id: string; name: string; sku: string; stockLevel: number }[];
    stockByCategory: { name: string; quantity: number }[];
}

export interface FinancialReportData {
    totalCharges: number;
    totalPayments: number;
    netBalance: number;
    paymentsByMethod: { name: string; amount: number }[];
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

export interface DealReportData {
    totalPipelineValue: number;
    winRate: number;
    averageDealSize: number;
    averageSalesCycle: number;
    dealsWon: number;
    dealsLost: number;
    dealsByStage: { name: string; value: number }[];
}

export type AnyReportData = SalesReportData | InventoryReportData | FinancialReportData | ContactsReportData | TeamReportData | DealReportData;

export interface CustomReport {
    id: string;
    name: string;
    organizationId: string;
    config: {
        dataSource: ReportDataSource;
        columns: string[];
        filters: FilterCondition[];
    };
}

export type ReportDataSource = 'contacts' | 'products';


export type ContactStatus = 'Lead' | 'Active' | 'Inactive' | 'Do Not Contact';
export type InteractionType = 'Appointment' | 'Call' | 'Email' | 'Note' | 'Site Visit' | 'Meeting' | 'Maintenance Request';

export interface Interaction {
    id: string;
    contactId: string;
    organizationId: string;
    userId: string;
    type: InteractionType;
    date: string;
    notes: string;
}

export interface OrderLineItem {
    productId: string;
    description: string;
    quantity: number;
    unitPrice: number;
}

export interface Order {
    id: string;
    organizationId: string;
    contactId: string;
    orderDate: string;
    status: 'Pending' | 'Completed' | 'Cancelled';
    total: number;
    lineItems: OrderLineItem[];
}

export interface Enrollment {
    id: string;
    programName: string;
    startDate: string;
    endDate?: string;
    status: 'Active' | 'Completed' | 'Dropped';
}

export interface Transaction {
    id: string;
    type: 'Charge' | 'Payment' | 'Refund' | 'Credit';
    amount: number;
    date: string;
    method: 'Credit Card' | 'Bank Transfer' | 'Cash' | 'Insurance' | 'Other';
    orderId?: string;
    relatedChargeId?: string;
}

export interface StructuredRecord {
    id: string;
    type: string;
    title: string;
    recordDate: string;
    fields: Record<string, any>;
}

export interface Relationship {
    relatedContactId: string;
    relationshipType: string;
}

export interface AuditLogEntry {
    id: string;
    timestamp: string;
    userId: string;
    userName: string;
    change: string;
}

export interface AnyContact {
    id: string;
    organizationId: string;
    contactName: string;
    email: string;
    phone: string;
    status: ContactStatus;
    leadSource: string;
    createdAt: string;
    avatar?: string;
    customFields: Record<string, any>;
    interactions: Interaction[];
    orders: Order[];
    enrollments: Enrollment[];
    transactions: Transaction[];
    structuredRecords: StructuredRecord[];
    relationships: Relationship[];
    auditLogs: AuditLogEntry[];
}

export interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    allDay?: boolean;
    userIds: string[];
    contactId?: string;
}

export interface Task {
    id: string;
    title: string;
    dueDate: string;
    isCompleted: boolean;
    userId: string;
    contactId?: string;
    organizationId: string;
}

export interface Organization {
    id: string;
    name: string;
    industry: Industry;
    primaryContactEmail: string;
    createdAt: string;
}

export interface Product {
    id: string;
    organizationId: string;
    name: string;
    sku: string;
    category: string;
    description?: string;
    costPrice: number;
    salePrice: number;
    stockLevel: number;
}

export interface Supplier {
    id: string;
    organizationId: string;
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
}

export interface Warehouse {
    id: string;
    organizationId: string;
    name: string;
    location: string;
}

export interface DashboardData {
    kpis: {
        totalContacts: number;
        newContacts: number;
        upcomingAppointments: number;
        [key: string]: any; 
    };
    charts: {
        contactsByStatus: { name: string; value: number }[];
        appointmentsByMonth: { name: string; value: number }[];
        [key: string]: any[];
    };
}

export interface CustomTheme {
    id: string;
    name: string;
    colors: {
        primary: string;
        background: string;
        card: string;
        text: string;
        border: string;
    };
}

export interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    customThemes: CustomTheme[];
    activeCustomThemeId: string | null;
    addCustomTheme: (theme: CustomTheme) => void;
    updateCustomTheme: (theme: CustomTheme) => void;
    deleteCustomTheme: (themeId: string) => void;
    applyCustomTheme: (themeId: string | null) => void;
}

export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    message: string;
    timestamp: string;
    isRead: boolean;
    linkTo?: string;
}

export type NotificationType = 'mention' | 'task_assigned';

export interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
    markAsRead: (notificationId: string) => void;
    markAllAsRead: () => void;
}

export interface Document {
    id: string;
    contactId: string;
    organizationId: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    uploadDate: string;
    uploadedByUserId: string;
    dataUrl: string; // Base64 encoded string
}

export interface EmailTemplate {
    id: string;
    organizationId: string;
    name: string;
    subject: string;
    body: string;
}

export interface WorkflowTrigger {
    type: 'contactCreated' | 'contactStatusChanged';
    fromStatus?: ContactStatus;
    toStatus?: ContactStatus;
}

export interface WorkflowAction {
    type: 'createTask' | 'sendEmail' | 'updateContactField' | 'sendWebhook';
    taskTitle?: string;
    assigneeId?: string;
    emailTemplateId?: string;
    fieldId?: string;
    newValue?: any;
    webhookUrl?: string;
    payloadTemplate?: string;
}

export interface Workflow {
    id: string;
    organizationId: string;
    name: string;
    isActive: boolean;
    trigger: WorkflowTrigger;
    actions: WorkflowAction[];
}

export interface DealStage {
    id: string;
    name: string;
    order: number;
    organizationId: string;
}

export interface Deal {
    id: string;
    organizationId: string;
    name: string;
    value: number;
    stageId: string;
    contactId: string;
    expectedCloseDate: string;
    createdAt: string;
}