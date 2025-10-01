import { LucideIcon } from 'lucide-react';

// --- CORE ---
export type Industry = 'Health' | 'Finance' | 'Legal' | 'Generic';
export type UserRole = 'Super Admin' | 'Organization Admin' | 'Team Member' | 'Client';

export interface Organization {
    id: string;
    name: string;
    industry: Industry;
    primaryContactEmail: string;
    createdAt: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    organizationId?: string;
    contactId?: string; // For 'Client' role
}

// --- DOCUMENTS ---
export interface Document {
    id: string;
    contactId: string;
    organizationId: string;
    fileName: string;
    fileType: string; // e.g., 'application/pdf', 'image/jpeg'
    fileSize: number; // in bytes
    uploadDate: string; // ISO 8601
    uploadedByUserId: string;
    dataUrl: string; // Base64 encoded file for mock purposes
}


// --- CONTACTS & INTERACTIONS ---
export type ContactStatus = 'Lead' | 'Active' | 'Inactive' | 'Do Not Contact';
export type LeadSource = 'Web' | 'Referral' | 'Event' | 'Cold Call' | 'Manual';
export type CustomFieldValue = string | number | boolean | Date | string[] | null;
export interface CustomField {
    id: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox' | 'file';
    options?: string[];
}

export interface BaseContact {
    id:string;
    organizationId: string;
    contactName: string;
    email: string;
    phone: string;
    status: ContactStatus;
    leadSource: LeadSource;
    createdAt: string;
    avatar?: string;
    customFields: Record<string, CustomFieldValue>;
    interactions: Interaction[];
    orders: Order[];
    transactions: Transaction[];
    enrollments: Enrollment[];
    structuredRecords: StructuredRecord[];
    relationships: Relationship[];
    auditLogs: AuditLogEntry[];
    documents: Document[];
}
// This allows for different contact types per industry, but for now we use a generic one
export type AnyContact = BaseContact;

export type InteractionType = 'Email' | 'Call' | 'Meeting' | 'Note' | 'Appointment' | 'Site Visit' | 'Maintenance Request';

export interface Interaction {
    id: string;
    contactId: string;
    userId: string;
    organizationId: string;
    type: InteractionType;
    date: string; // ISO 8601
    notes: string;
    customFields?: Record<string, CustomFieldValue>;
}

export interface AuditLogEntry {
    id: string;
    timestamp: string; // ISO 8601
    userId: string;
    userName: string;
    change: string;
}

// --- CALENDAR & TASKS ---
export interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    userIds: string[];
    contactId?: string;
    organizationId: string;
}

export interface Task {
    id: string;
    title: string;
    dueDate: string; // ISO 8601
    isCompleted: boolean;
    userId: string;
    contactId?: string;
    organizationId: string;
}

// --- INVENTORY, ORDERS, BILLING ---
export interface Product {
    id: string;
    organizationId: string;
    name: string;
    sku: string;
    category: string;
    description: string;
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

export type OrderStatus = 'Pending' | 'Completed' | 'Cancelled';
export interface OrderLineItem {
    productId: string;
    description: string;
    quantity: number;
    unitPrice: number;
}
export interface Order {
    id: string;
    contactId: string;
    organizationId: string;
    orderDate: string; // ISO 8601
    status: OrderStatus;
    lineItems: OrderLineItem[];
    total: number;
}

export type TransactionType = 'Charge' | 'Payment' | 'Refund' | 'Credit';
export type TransactionMethod = 'Credit Card' | 'Bank Transfer' | 'Cash' | 'Insurance' | 'Other';
export interface Transaction {
    id: string;
    contactId: string;
    organizationId: string;
    date: string; // ISO 8601
    type: TransactionType;
    amount: number;
    method: TransactionMethod;
    orderId?: string;
    relatedChargeId?: string;
}

// --- INDUSTRY SPECIFIC ---
export interface Enrollment {
    id: string;
    programName: string;
    startDate: string; // ISO 8601
    endDate?: string; // ISO 8601
    status: 'Active' | 'Completed' | 'Withdrawn';
}
export interface StructuredRecord {
    id: string;
    type: string; // e.g., 'soap_note', 'portfolio_review'
    title: string;
    recordDate: string; // ISO 8601
    fields: Record<string, any>;
}
export interface Relationship {
    relatedContactId: string;
    relationshipType: string; // e.g., 'Spouse', 'Parent', 'Business Partner'
}

// --- CONFIGURATION ---
export interface EmailTemplate {
    id: string;
    organizationId: string;
    name: string;
    subject: string;
    body: string;
}
export type ReportDataSource = 'contacts' | 'products';
export interface FilterCondition {
    field: string;
    operator: 'is' | 'is_not' | 'contains' | 'does_not_contain';
    value: string;
}
export interface CustomReport {
    id: string;
    organizationId: string;
    name: string;
    config: {
        dataSource: ReportDataSource;
        columns: string[];
        filters: FilterCondition[];
    };
}
export interface WorkflowTrigger {
    type: 'contactCreated' | 'contactStatusChanged';
    fromStatus?: ContactStatus;
    toStatus?: ContactStatus;
}
export interface WorkflowAction {
    type: 'createTask' | 'sendEmail' | 'updateContactField' | 'sendWebhook';
    // for createTask
    taskTitle?: string;
    assigneeId?: string;
    // for sendEmail
    emailTemplateId?: string;
    // for updateContactField
    fieldId?: string;
    newValue?: string;
    // for sendWebhook
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

// --- REPORTING ---
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
    lowStockItems: { id: string; name: string; sku: string, stockLevel: number }[];
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

export type AnyReportData = SalesReportData | InventoryReportData | FinancialReportData | ContactsReportData | TeamReportData;

export interface DashboardData {
    kpis: Record<string, number | string>;
    charts: Record<string, { name: string, value: number }[]>;
}

// --- APP & UI ---
export type Page = 
    | 'Dashboard' 
    | 'Organizations' 
    | 'Contacts' 
    | 'Interactions'
    | 'Calendar' 
    | 'Inventory'
    | 'Reports'
    | 'Workflows'
    | 'Team' 
    | 'Settings' 
    | 'My Tasks';

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
    structuredRecordTypes: { id: string, name: string, fields: CustomField[] }[];
    ordersTabName: string;
    enrollmentsTabName: string;
    dashboard: {
        kpis: { key: string, title: string, icon: string }[];
        charts: { dataKey: string, title: string, type: 'bar' | 'line' | 'pie' }[];
    }
}

export type Theme = 'light' | 'dark' | 'system';
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


// --- CONTEXTS ---
export interface AppContextType {
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
    currentIndustry: Industry;
    setCurrentIndustry: (industry: Industry) => void;
    industryConfig: IndustryConfig;
    contactFilters: FilterCondition[];
    setContactFilters: (filters: FilterCondition[]) => void;
}

export interface AuthContextType {
    authenticatedUser: User | null;
    login: (user: User) => void;
    logout: () => void;
    permissions: Permissions | null;
}

export interface Permissions {
    [key: string]: {
        view?: boolean;
        create?: boolean;
        edit?: boolean;
        delete?: boolean;
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

export type NotificationType = 'mention' | 'task_assigned';

export interface Notification {
    id: string;
    type: NotificationType;
    message: string;
    timestamp: string; // ISO 8601
    isRead: boolean;
    userId: string; // The user who should receive the notification
    linkTo?: string; // Optional link to navigate to, e.g., a contact page
}

export interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
    markAsRead: (notificationId: string) => void;
    markAllAsRead: () => void;
}
