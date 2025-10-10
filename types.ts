import React from 'react';

export type Industry = 'Health' | 'Finance' | 'Legal' | 'Generic';
export type Page = 'Dashboard' | 'Organizations' | 'OrganizationDetails' | 'Contacts' | 'Deals' | 'Tickets' | 'Interactions' | 'SyncedEmail' | 'Campaigns' | 'Forms' | 'LandingPages' | 'Calendar' | 'Tasks' | 'Reports' | 'Inventory' | 'Team' | 'Workflows' | 'Settings' | 'ApiDocs' | 'KnowledgeBase' | 'CustomObjects' | 'AppMarketplace';

export interface User {
    id: string;
    organizationId: string;
    name: string;
    email: string;
    role: string;
    roleId: string;
    isClient: boolean;
    contactId?: string;
}

export interface Organization {
    id: string;
    name: string;
    industry: Industry;
    primaryContactEmail: string;
    createdAt: string;
}

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
    | 'settings:manage:api'
    | 'settings:manage:apps';

export interface CustomRole {
    id: string;
    organizationId: string;
    name: string;
    description: string;
    isSystemRole: boolean;
    permissions: Partial<Record<Permission, boolean>>;
}

export type ContactStatus = 'Lead' | 'Active' | 'Inactive' | 'Needs Attention' | 'Do Not Contact';
export type LeadSource = 'Web' | 'Referral' | 'Manual' | 'Advertisement';

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

export interface OrderLineItem {
    productId: string;
    description: string;
    quantity: number;
    unitPrice: number;
}

export interface Order {
    id: string;
    // FIX: Add contactId to associate orders with contacts
    contactId: string;
    orderDate: string;
    status: 'Pending' | 'Completed' | 'Cancelled';
    lineItems: OrderLineItem[];
    total: number;
}

export interface Transaction {
    id: string;
    date: string;
    type: 'Charge' | 'Payment' | 'Refund' | 'Credit';
    amount: number;
    method: 'Credit Card' | 'Bank Transfer' | 'Cash' | 'Insurance' | 'Other';
    orderId?: string;
    relatedChargeId?: string;
}

export interface AuditLogEntry {
    id: string;
    timestamp: string;
    userId: string;
    userName: string;
    change: string;
}

export interface StructuredRecord {
    id: string;
    type: string;
    title: string;
    recordDate: string;
    fields: Record<string, any>;
}

export interface Enrollment {
    id: string;
    programName: string;
    startDate: string;
    endDate?: string;
    status: 'Active' | 'Completed' | 'Withdrawn';
}

export interface Relationship {
    relatedContactId: string;
    relationshipType: string;
}

export interface CampaignEnrollment {
    campaignId: string;
    contactId: string;
    currentNodeId: string;
    waitUntil: string;
}

export interface AnyContact {
    id: string;
    organizationId: string;
    contactName: string;
    email: string;
    phone: string;
    status: ContactStatus;
    leadSource: LeadSource;
    createdAt: string;
    assignedToId?: string;
    customFields: Record<string, any>;
    avatar?: string;
    interactions?: Interaction[];
    leadScore?: number;
    orders?: Order[];
    transactions?: Transaction[];
    auditLogs?: AuditLogEntry[];
    structuredRecords?: StructuredRecord[];
    enrollments?: Enrollment[];
    relationships?: Relationship[];
    campaignEnrollments?: CampaignEnrollment[];
    churnPrediction?: ContactChurnPrediction;
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

export interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    userIds: string[];
    contactId?: string;
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

export interface DealStage {
    id: string;
    organizationId: string;
    name: string;
    order: number;
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
    forecast?: DealForecast;
}

export interface DealForecast {
    probability: number;
    factors: {
        positive: string[];
        negative: string[];
    };
    nextBestAction: string;
}

export interface ContactChurnPrediction {
    risk: 'High' | 'Medium' | 'Low';
    factors: {
        positive: string[];
        negative: string[];
    };
    nextBestAction: string;
}

export interface NextBestAction {
    type: 'CALL' | 'EMAIL' | 'TASK';
    action: string;
    reason: string;
    details?: {
        templateId?: string;
        taskTitle?: string;
    };
}

export interface EmailTemplate {
    id: string;
    organizationId: string;
    name: string;
    subject: string;
    body: string;
}

export type InteractionType = 'Appointment' | 'Call' | 'Email' | 'Note' | 'Site Visit' | 'Maintenance Request' | 'Meeting' | 'VoIP Call' | 'Form Submission';

export type WorkflowTriggerType = 'contactCreated' | 'contactStatusChanged' | 'dealCreated' | 'dealStageChanged' | 'ticketCreated' | 'ticketStatusChanged';
export type WorkflowActionType = 'createTask' | 'sendEmail' | 'updateContactField' | 'wait' | 'sendWebhook' | 'createAuditLogEntry';
export type NodeExecutionType = WorkflowActionType | WorkflowTriggerType | 'ifCondition';
export type WorkflowNodeType = 'trigger' | 'action' | 'condition';

export type JourneyNodeType = 'journeyTrigger' | 'journeyAction' | 'journeyCondition';
export type JourneyExecutionType = 'targetAudience' | 'sendEmail' | 'wait' | 'ifEmailOpened' | 'createTask';

export interface WorkflowTrigger {
    type: WorkflowTriggerType;
    toStatus?: ContactStatus | string;
    fromStatus?: ContactStatus | string;
    fromStageId?: string;
    toStageId?: string;
    priority?: Ticket['priority'];
}

export interface WorkflowAction {
    type: WorkflowActionType;
    taskTitle?: string;
    assigneeId?: string;
    emailTemplateId?: string;
    fieldId?: string;
    newValue?: any;
    days?: number;
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

export interface NodeData {
    label: string;
    nodeType: NodeExecutionType | JourneyExecutionType;
    [key: string]: any;
}
export interface Node {
    id: string;
    type: WorkflowNodeType | JourneyNodeType;
    position: { x: number; y: number };
    data: NodeData;
}
export interface Edge {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string | null;
}

export interface AdvancedWorkflow {
    id: string;
    organizationId: string;
    name: string;
    isActive: boolean;
    nodes: Node[];
    edges: Edge[];
}

export interface SLAPolicy {
    responseTime: { high: number; medium: number; low: number };
    resolutionTime: { high: number; medium: number; low: number };
}

export interface LeadScoringRule {
    id: string;
    event: 'interaction' | 'status_change';
    points: number;
    interactionType?: InteractionType;
    status?: ContactStatus;
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

export interface OrganizationSettings {
    organizationId: string;
    ticketSla: SLAPolicy;
    leadScoringRules: LeadScoringRule[];
    emailIntegration: {
        isConnected: boolean;
        connectedEmail?: string;
        lastSync?: string;
    };
    voip: {
        isConnected: boolean;
        provider?: string;
    };
    liveChat: LiveChatSettings;
}

export interface ApiKey {
    id: string;
    organizationId: string;
    name: string;
    keyPrefix: string;
    createdAt: string;
}

export interface TicketAttachment {
    name: string;
    type: string;
    dataUrl: string;
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

export interface PublicFormField {
    id: string;
    label: string;
    type: string;
    required: boolean;
    placeholder?: string;
    options?: string[];
}

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

export interface CampaignTargetAudience {
    status?: ContactStatus;
    leadScore?: { operator: 'gt' | 'lt' | 'eq'; value: number };
}

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

export interface Document {
    id: string;
    organizationId: string;
    contactId: string;
    fileName: string;
    fileType: string;
    uploadDate: string;
    dataUrl: string;
}

export interface LandingPageComponent {
    id: string;
    type: 'header' | 'text' | 'image' | 'form';
    content: any;
}
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

export interface CustomReport {
    id: string;
    organizationId: string;
    name: string;
    config: {
        dataSource: ReportDataSource;
        columns: string[];
        filters: FilterCondition[];
        visualization: ReportVisualization;
    }
}
export type ReportDataSource = 'contacts' | 'products' | 'deals' | 'tickets';
export interface ReportVisualization {
    type: 'table' | 'bar' | 'pie' | 'line';
    groupByKey?: string;
    metric: {
        type: 'count' | 'sum' | 'average';
        column?: string;
    }
}


export interface DashboardWidget {
    id: string;
    organizationId: string;
    reportId: string;
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

export interface AnonymousSession {
    id: string;
    organizationId: string;
    firstSeen: string;
    lastSeen: string;
    pageviews: { url: string, timestamp: string }[];
}


export interface CustomField {
    id: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox' | 'file';
    options?: string[];
}

export interface StructuredRecordType {
    id: string;
    name: string;
    fields: CustomField[];
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
    structuredRecordTypes: StructuredRecordType[];
    ordersTabName: string;
    enrollmentsTabName: string;
    dashboard: {
        kpis: { key: string; title: string; icon: string }[];
        charts: { dataKey: string; title: string; type: 'bar' | 'line' | 'pie' }[];
    }
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
    simulatedDate: Date;
    setSimulatedDate: (date: Date) => void;
    reportToEditId: string | null;
    setReportToEditId: (id: string | null) => void;
    isCallModalOpen: boolean;
    setIsCallModalOpen: (isOpen: boolean) => void;
    callContact: AnyContact | null;
    setCallContact: (contact: AnyContact | null) => void;
    initialKbArticleId: string | null;
    setInitialKbArticleId: (id: string | null) => void;
    currentCustomObjectDefId: string | null;
    setCurrentCustomObjectDefId: (id: string | null) => void;
}

export interface AuthContextType {
    authenticatedUser: User | null;
    login: (user: User) => void;
    logout: () => void;
    hasPermission: (permission: Permission) => boolean;
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
        textHeading: string;
        border: string;
    }
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
    type: 'mention' | 'task_assigned' | 'ticket_assigned' | 'ticket_reply' | 'deal_won';
    message: string;
    timestamp: string;
    isRead: boolean;
    linkTo?: string;
}

export interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
    markAsRead: (notificationId: string) => void;
    markAllAsRead: () => void;
}

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
    stockByCategory: { name: string, quantity: number }[];
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
    dealsByStage: { name: string; value: number }[];
}

export type AnyReportData = SalesReportData | InventoryReportData | FinancialReportData | ContactsReportData | TeamReportData | DealReportData;
export type ReportType = 'sales' | 'inventory' | 'financial' | 'contacts' | 'team' | 'deals';

export interface DashboardData {
    kpis: {
        totalContacts: number;
        newContacts: number;
        upcomingAppointments: number;
    };
    charts: {
        contactsByStatus: { name: string; value: number }[];
        appointmentsByMonth: { name: string; value: number }[];
    }
}

export interface CustomObjectDefinition {
    id: string;
    organizationId: string;
    nameSingular: string;
    namePlural: string;
    icon: string;
    fields: CustomField[];
}

export interface CustomObjectRecord {
    id: string;
    objectDefId: string;
    organizationId: string;
    fields: Record<string, any>;
}

export interface AppMarketplaceItem {
    id: string;
    name: string;
    description: string;
    longDescription: string;
    logo: string;
    category: string;
    developer: string;
    website: string;
}

export interface InstalledApp {
    id: string;
    organizationId: string;
    appId: string;
    installedAt: string;
}


export interface KBArticleType {
    id: string;
    title: string;
    category: string;
    content: React.ReactNode;
}