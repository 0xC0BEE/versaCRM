import React from 'react';

// --- Core App & Context Types ---

// FIX: Added 'Tickets', 'LandingPages', and 'CampaignReport' to the Page union type.
export type Page = 'Dashboard' | 'Organizations' | 'OrganizationDetails' | 'Contacts' | 'Profiles' | 'Deals' | 'Interactions' | 'Calendar' | 'Tasks' | 'Reports' | 'Settings' | 'Inventory' | 'Team' | 'Workflows' | 'Campaigns' | 'SyncedEmail' | 'ApiDocs' | 'Forms' | 'Tickets' | 'LandingPages' | 'CampaignReport' | 'KnowledgeBase';

export type Theme = 'light' | 'dark' | 'system';

export interface AppContextType {
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
    currentIndustry: Industry;
    setCurrentIndustry: (industry: Industry) => void;
    industryConfig: IndustryConfig;
    contactFilters: FilterCondition[];
    setContactFilters: (filters: FilterCondition[]) => void;
    simulatedDate: Date;
    setSimulatedDate: (date: Date) => void;
    reportToEditId: string | null;
    setReportToEditId: (id: string | null) => void;
    isCallModalOpen: boolean;
    setIsCallModalOpen: (isOpen: boolean) => void;
    callContact: AnyContact | null;
    setCallContact: (contact: AnyContact | null) => void;
}

export interface AuthContextType {
    authenticatedUser: User | null;
    login: (user: User) => void;
    logout: () => void;
    hasPermission: (permission: Permission) => boolean;
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

export interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
    markAsRead: (notificationId: string) => void;
    markAllAsRead: () => void;
}

export interface Notification {
    id: string;
    userId: string;
    type: 'mention' | 'task_assigned' | 'deal_won' | 'ticket_assigned' | 'ticket_reply';
    message: string;
    timestamp: string;
    isRead: boolean;
    linkTo?: string;
}

// --- Industry Configuration ---

export type Industry = 'Health' | 'Finance' | 'Legal' | 'Generic';

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
        kpis: { key: string; title: string; icon: string }[];
        charts: { dataKey: string; title: string; type: 'bar' | 'line' | 'pie' }[];
    };
}

// --- Data Models ---

export interface Organization {
    id: string;
    name: string;
    industry: Industry;
    primaryContactEmail: string;
    createdAt: string;
}

export interface User {
    id: string;
    organizationId: string;
    name: string;
    email: string;
    role: string; // Deprecated, use roleId
    roleId: string;
    isClient: boolean;
    contactId?: string; // For client users
}

export type UserRole = 'Super Admin' | 'Organization Admin' | 'Team Member' | 'Client';

export type ContactStatus = 'Lead' | 'Active' | 'Inactive' | 'Do Not Contact' | 'Needs Attention';

export interface AnyContact {
    id: string;
    organizationId: string;
    contactName: string;
    email: string;
    phone: string;
    status: ContactStatus;
    leadSource: string;
    createdAt: string;
    assignedToId?: string;
    customFields: Record<string, any>;
    avatar?: string;
    interactions?: Interaction[];
    orders?: Order[];
    enrollments?: Enrollment[];
    structuredRecords?: StructuredRecord[];
    relationships?: Relationship[];
    auditLogs?: AuditLogEntry[];
    transactions?: Transaction[];
    leadScore?: number;
    campaignEnrollments?: CampaignEnrollment[];
}

export interface Interaction {
    id: string;
    organizationId: string;
    contactId: string;
    userId: string;
    type: InteractionType;
    date: string;
    notes: string;
    openedAt?: string;
    clickedAt?: string;
}

export type InteractionType = 'Appointment' | 'Call' | 'Email' | 'Note' | 'Site Visit' | 'Maintenance Request' | 'Meeting' | 'VoIP Call' | 'Form Submission';

export interface Order {
    id: string;
    orderDate: string;
    status: 'Pending' | 'Completed' | 'Cancelled';
    lineItems: OrderLineItem[];
    total: number;
}

export interface OrderLineItem {
    productId: string;
    description: string;
    quantity: number;
    unitPrice: number;
}

export interface Enrollment {
    id: string;
    programName: string;
    startDate: string;
    endDate?: string;
    status: 'Active' | 'Completed' | 'Cancelled';
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

export interface Transaction {
    id: string;
    date: string;
    type: 'Charge' | 'Payment' | 'Refund' | 'Credit';
    amount: number;
    method: 'Credit Card' | 'Bank Transfer' | 'Cash' | 'Insurance' | 'Other';
    orderId?: string;
    relatedChargeId?: string; // For payments not tied to an order
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
    organizationId: string;
    title: string;
    dueDate: string;
    isCompleted: boolean;
    userId: string;
    contactId?: string;
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
    assignedToId?: string;
}

export interface DealStage {
    id: string;
    organizationId: string;
    name: string;
    order: number;
}

export interface EmailTemplate {
    id: string;
    organizationId: string;
    name: string;
    subject: string;
    body: string;
}

export interface Document {
    id: string;
    organizationId: string;
    contactId: string;
    fileName: string;
    fileType: string;
    uploadDate: string;
    dataUrl: string; // Base64 encoded file
}

export interface Ticket {
    id: string;
    organizationId: string;
    contactId: string;
    subject: string;
    description: string;
    status: 'New' | 'Open' | 'Pending' | 'Closed';
    priority: 'Low' | 'Medium' | 'High';
    createdAt: string;
    updatedAt: string;
    assignedToId?: string;
    replies: TicketReply[];
}

export interface TicketReply {
    id: string;
    userId: string;
    userName: string;
    message: string;
    timestamp: string;
    isInternal: boolean;
    attachment?: TicketAttachment;
}

export interface TicketAttachment {
    name: string;
    type: string;
    dataUrl: string;
}


// --- Reports & Dashboard ---

export type ReportType = 'sales' | 'inventory' | 'financial' | 'contacts' | 'team' | 'deals';
export type AnyReportData = SalesReportData | InventoryReportData | FinancialReportData | ContactsReportData | TeamReportData | DealReportData;

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
        teamMemberRole: string;
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
    dealsByStage: { name: string, value: number }[];
}

export interface DashboardData {
    kpis: {
        totalContacts: number;
        newContacts: number;
        upcomingAppointments: number;
    },
    charts: {
        contactsByStatus: { name: string; value: number }[];
        appointmentsByMonth: { name: string; value: number }[];
    }
}

export interface DashboardWidget {
    id: string;
    organizationId: string;
    reportId: string;
}

export interface CustomReport {
    id: string;
    organizationId: string;
    name: string;
    config: {
        dataSource: ReportDataSource;
        columns: string[];
        filters: FilterCondition[];
        visualization: ReportVisualization;
    };
}

// FIX: Added 'deals' to ReportDataSource to allow for deal-based custom reports.
export type ReportDataSource = 'contacts' | 'products' | 'deals';

export interface ReportVisualization {
    type: 'table' | 'bar' | 'pie' | 'line';
    groupByKey?: string;
    metric: {
        type: 'count' | 'sum' | 'average';
        column?: string;
    };
}


// --- Filtering & Searching ---

export interface FilterCondition {
    field: string;
    operator: 'is' | 'is_not' | 'contains' | 'does_not_contain';
    value: string;
}

// --- Permissions & Roles ---

export type Permission =
    | 'contacts:read:all'
    | 'contacts:read:own'
    | 'contacts:create'
    | 'contacts:edit'
    | 'contacts:delete'
    | 'deals:read'
    | 'deals:create'
    | 'deals:edit'
    | 'deals:delete'
    | 'tickets:read'
    | 'tickets:create'
    | 'tickets:edit'
    | 'automations:manage'
    | 'reports:read'
    | 'reports:manage'
    | 'inventory:read'
    | 'inventory:manage'
    | 'voip:use'
    | 'settings:access'
    | 'settings:manage:team'
    | 'settings:manage:roles'
    | 'settings:manage:api';

export interface CustomRole {
    id: string;
    organizationId: string;
    name: string;
    description: string;
    isSystemRole: boolean;
    permissions: Partial<Record<Permission, boolean>>;
}

// --- Settings ---

export interface OrganizationSettings {
    organizationId: string;
    ticketSla: SLAPolicy;
    leadScoringRules: LeadScoringRule[];
    emailIntegration: EmailIntegrationSettings;
    voip: VoipSettings;
    liveChat: LiveChatSettings;
}

export interface SLAPolicy {
    responseTime: { high: number, medium: number, low: number }; // hours
    resolutionTime: { high: number, medium: number, low: number }; // hours
}

export interface LeadScoringRule {
    id: string;
    event: 'interaction' | 'status_change';
    points: number;
    interactionType?: InteractionType;
    status?: ContactStatus;
}

export interface EmailIntegrationSettings {
    isConnected: boolean;
    connectedEmail?: string;
    lastSync?: string;
}

export interface VoipSettings {
    isConnected: boolean;
    provider?: string;
}

export interface LiveChatSettings {
    isEnabled: boolean;
    color: string;
    welcomeMessage: string;
    autoCreateContact: boolean;
    newContactStatus: ContactStatus;
    autoCreateTicket: boolean;
    newTicketPriority: Ticket['priority'];
}

export interface ApiKey {
    id: string;
    organizationId: string;
    name: string;
    keyPrefix: string;
    createdAt: string;
}


// --- Automations: Workflows & Campaigns ---

export interface Workflow {
    id: string;
    organizationId: string;
    name: string;
    isActive: boolean;
    trigger: WorkflowTrigger;
    actions: WorkflowAction[];
}

export interface WorkflowTrigger {
    type: 'contactCreated' | 'contactStatusChanged' | 'dealCreated' | 'dealStageChanged' | 'ticketCreated' | 'ticketStatusChanged';
    fromStatus?: string;
    toStatus?: string;
    fromStageId?: string;
    toStageId?: string;
    priority?: Ticket['priority'];
}

export type WorkflowAction =
    | { type: 'createTask', taskTitle?: string, assigneeId?: string }
    | { type: 'sendEmail', emailTemplateId?: string }
    | { type: 'updateContactField', fieldId?: string, newValue?: any }
    | { type: 'wait', days: number }
    | { type: 'sendWebhook', webhookUrl?: string, payloadTemplate?: string }
    | { type: 'createAuditLogEntry' };


export interface AdvancedWorkflow {
    id: string;
    organizationId: string;
    name: string;
    isActive: boolean;
    nodes: Node[];
    edges: Edge[];
}

export interface Node {
    id: string;
    type: string;
    position: { x: number; y: number };
    data: any;
}

export interface Edge {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string | null;
}

export type WorkflowNodeType = 'trigger' | 'action' | 'condition';
export type NodeExecutionType =
    | 'contactCreated' | 'contactStatusChanged' | 'dealCreated' | 'dealStageChanged' | 'ticketCreated' | 'ticketStatusChanged'
    | 'sendEmail' | 'createTask' | 'updateContactField' | 'wait'
    | 'ifCondition'
    | 'createAuditLogEntry';


// --- Marketing Campaigns ---
export interface Campaign {
    id: string;
    organizationId: string;
    name: string;
    status: 'Draft' | 'Active' | 'Completed';
    stats: {
        recipients: number;
        sent: number;
        opened: number;
        clicked: number;
    };
    targetAudience: CampaignTargetAudience;
    nodes: Node[];
    edges: Edge[];
}

export interface CampaignTargetAudience {
    status?: ContactStatus;
    leadScore?: {
        operator: 'gt' | 'lt' | 'eq';
        value: number;
    };
}

export interface CampaignEnrollment {
    campaignId: string;
    contactId: string;
    currentNodeId: string;
    waitUntil: string; // ISO date string
}

export type JourneyNodeType = 'journeyTrigger' | 'journeyAction' | 'journeyCondition';
export type JourneyExecutionType = 'targetAudience' | 'sendEmail' | 'wait' | 'ifEmailOpened' | 'createTask';


// --- Public Forms ---
export interface PublicForm {
    id: string;
    organizationId: string;
    name: string;
    fields: PublicFormField[];
    style: {
        buttonText: string;
        buttonColor: string;
    };
    actions: {
        successMessage: string;
        enrollInCampaignId?: string;
    };
    submissions: number;
}

export interface PublicFormField {
    id: string; // e.g., 'contactName', 'email', 'customFields.patientId'
    label: string;
    type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox' | 'file';
    required: boolean;
    options?: string[];
}

// --- Landing Pages ---
export interface LandingPage {
    id: string;
    organizationId: string;
    name: string;
    slug: string;
    status: 'Draft' | 'Published';
    content: LandingPageComponent[];
    style: {
        backgroundColor: string;
        textColor: string;
    };
}

export type LandingPageComponent = 
    | { id: string, type: 'header', content: { title: string, subtitle: string } }
    | { id: string, type: 'text', content: { text: string } }
    | { id: string, type: 'image', content: { src: string, alt: string } }
    | { id: string, type: 'form', content: { formId: string } };


// --- Themes ---
export interface CustomTheme {
    id: string;
    name: string;
    colors: {
        primary: string;
        background: string;
        card: string;
        text: string;
        textHeading: string;
        border: string;
    };
}

// --- Knowledge Base ---
export interface KBArticleType {
    id: string;
    title: string;
    category: string;
    content: React.ReactNode;
}
