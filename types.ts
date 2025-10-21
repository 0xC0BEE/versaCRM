// This file defines all the core data structures and types used throughout the application.
// FIX: Import `ReactNode` to resolve missing React namespace error.
import type { ReactNode } from 'react';

// Basic types
export type Industry = 'Health' | 'Finance' | 'Legal' | 'Generic';
export type Theme = 'light' | 'dark' | 'system';
export type Page = 
    | 'Dashboard' | 'Organizations' | 'OrganizationDetails' | 'Contacts' | 'Deals'
    | 'Tickets' | 'Projects' | 'Interactions' | 'Inbox' | 'TeamChat' | 'SyncedEmail' | 'Campaigns'
    | 'Forms' | 'LandingPages' | 'Documents' | 'Calendar' | 'Tasks' | 'Reports' | 'Inventory'
    | 'Team' | 'Workflows' | 'Settings' | 'ApiDocs' | 'KnowledgeBase' | 'CustomObjects'
    | 'AppMarketplace' | 'Notifications' | 'AudienceProfiles';

// Auth & Permissions
export type Permission =
  | 'settings:access'
  | 'settings:manage:team'
  | 'settings:manage:roles'
  | 'settings:manage:api'
  | 'settings:manage:apps'
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
  | 'voip:use';


export interface CustomRole {
    id: string;
    organizationId: string;
    name: string;
    description: string;
    isSystemRole?: boolean;
    permissions: Partial<Record<Permission, boolean>>;
}

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

// Core CRM Objects
export interface Organization {
    id: string;
    name: string;
    industry: Industry;
    primaryContactEmail: string;
    createdAt: string;
    isSetupComplete: boolean;
}

export type ContactStatus = 'Lead' | 'Active' | 'Inactive' | 'Do Not Contact' | 'Needs Attention';

export type InteractionType = 'Appointment' | 'Call' | 'Email' | 'Note' | 'Site Visit' | 'Maintenance Request' | 'Meeting' | 'VoIP Call' | 'Form Submission' | 'LinkedIn Message' | 'X Message';

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
    orderDate: string;
    status: 'Pending' | 'Completed' | 'Cancelled';
    lineItems: OrderLineItem[];
    total: number;
}

export interface CampaignEnrollment {
    id: string;
    campaignId: string;
    contactId: string;
    currentNodeId: string;
    waitUntil: string;
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

export interface AuditLogEntry {
    id: string;
    timestamp: string;
    userId: string;
    userName: string;
    change: string;
}

export interface Relationship {
    relatedContactId: string;
    relationshipType: string;
}

export interface ContactSubscription {
    id: string;
    planId: string;
    status: 'active' | 'cancelled' | 'paused';
    startDate: string;
    nextBillingDate: string;
}

export type KYCStatus = 'Not Started' | 'Pending' | 'Verified' | 'Rejected';
export type AMLRisk = 'Low' | 'Medium' | 'High';

export interface FinancialComplianceData {
    kycStatus: KYCStatus;
    lastKycCheck?: string;
    amlRisk: AMLRisk;
    lastAmlCheck?: string;
    amlNotes?: string;
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
    assignedToId?: string;
    avatar?: string;
    leadScore?: number;
    customFields: Record<string, any>;
    interactions?: Interaction[];
    orders?: Order[];
    enrollments?: any[];
    transactions?: Transaction[];
    auditLogs?: AuditLogEntry[];
    structuredRecords?: StructuredRecord[];
    relationships?: Relationship[];
    campaignEnrollments?: CampaignEnrollment[];
    subscriptions?: ContactSubscription[];
    financialComplianceData?: FinancialComplianceData;
}

export interface Task {
    id: string;
    organizationId: string;
    title: string;
    dueDate: string;
    isCompleted: boolean;
    userId: string;
    contactId?: string;
    dealId?: string;
    projectId?: string;
    relatedObjectDefId?: string;
    relatedObjectRecordId?: string;
    isVisibleToClient?: boolean;
}

export type AppointmentStatus = 'Scheduled' | 'Confirmed' | 'Checked-in' | 'Completed' | 'Cancelled' | 'No-show';

export interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    contactId: string;
    practitionerIds: string[];
    appointmentType?: string;
    status?: AppointmentStatus;
}

// Sales & Products
export interface ProductOptionChoice {
    name: string;
    priceAdjustment: number;
}

export interface ProductOption {
    name: string;
    choices: ProductOptionChoice[];
}

export interface PricingRule {
    condition: { type: 'quantity_gt'; value: number };
    action: { type: 'percent_discount'; value: number };
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
    options?: ProductOption[];
    pricingRules?: PricingRule[];
    isBundle?: boolean;
    bundleItemIds?: string[];
}

// FIX: Add missing Supplier and Warehouse types
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

export interface DealStage {
    id: string;
    organizationId: string;
    name: string;
    order: number;
}

export type ApprovalStatus = 'Pending Approval' | 'Approved' | 'Rejected';

export interface RevenueRecognitionScheduleItem {
    month: number;
    date: string;
    amount: number;
    status: 'Pending' | 'Recognized';
}

export interface RevenueRecognitionSchedule {
    startDate: string;
    months: number;
    schedule: RevenueRecognitionScheduleItem[];
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
    relatedObjectDefId?: string;
    relatedObjectRecordId?: string;
    approvalStatus?: ApprovalStatus;
    currentApproverId?: string;
    revenueSchedule?: RevenueRecognitionSchedule;
}

// Service / Support
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
    relatedObjectDefId?: string;
    relatedObjectRecordId?: string;
}

// Marketing & Automation
export interface EmailTemplate {
    id: string;
    organizationId: string;
    name: string;
    subject: string;
    body: string;
}

export interface CannedResponse {
    id: string;
    organizationId: string;
    name: string;
    body: string;
}

export interface WorkflowTrigger {
    type: 'contactCreated' | 'contactStatusChanged' | 'dealCreated' | 'dealStageChanged' | 'ticketCreated' | 'ticketStatusChanged';
    fromStatus?: ContactStatus;
    toStatus?: ContactStatus;
    fromStageId?: string;
    toStageId?: string;
    priority?: Ticket['priority'];
}

export interface WorkflowAction {
    type: 'createTask' | 'sendEmail' | 'updateContactField' | 'wait' | 'sendWebhook' | 'sendSurvey';
    taskTitle?: string;
    assigneeId?: string;
    emailTemplateId?: string;
    fieldId?: string;
    newValue?: any;
    days?: number;
    webhookUrl?: string;
    payloadTemplate?: string;
    surveyId?: string;
}

export interface Workflow {
    id: string;
    organizationId: string;
    name: string;
    isActive: boolean;
    trigger: WorkflowTrigger;
    actions: WorkflowAction[];
}

export type JourneyNodeType = 'journeyTrigger' | 'journeyAction' | 'journeyCondition';
export type JourneyExecutionType = 'targetAudience' | 'sendEmail' | 'wait' | 'ifEmailOpened' | 'createTask';

export interface CampaignTargetAudience {
    status?: ContactStatus;
    leadScore?: { operator: 'gt' | 'lt' | 'eq', value: number };
}

// FIX: Add simplified Node and Edge types for services
export interface Node<T = any> {
    id: string;
    type?: string;
    data: T;
    position: { x: number; y: number };
    [key: string]: any;
}
export interface Edge<T = any> {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string | null;
    data?: T;
    [key: string]: any;
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
    nodes: Node[]; // React Flow nodes
    edges: Edge[]; // React Flow edges
}

export interface PublicFormField {
    id: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox' | 'file';
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

export interface Survey {
    id: string;
    organizationId: string;
    name: string;
    type: 'CSAT' | 'NPS';
    question: string;
    createdAt: string;
}

export interface SurveyResponse {
    id: string;
    surveyId: string;
    contactId: string;
    score: number;
    comment?: string;
    respondedAt: string;
}

// Documents & Projects
export interface Document {
    id: string;
    organizationId: string;
    contactId?: string;
    projectId?: string;
    fileName: string;
    fileType: string;
    uploadDate: string;
    dataUrl: string;
    isVisibleToClient?: boolean;
}

// FIX: Add missing DocumentAccessLevel type
export type DocumentAccessLevel = 'view' | 'edit';
export interface DocumentPermission {
    userId: string;
    accessLevel: DocumentAccessLevel;
}

export interface DocumentBlock {
    id: string;
    type: 'header' | 'text' | 'image' | 'lineItems';
    content: any;
}

export interface DocumentTemplate {
    id: string;
    organizationId: string;
    name: string;
    content: DocumentBlock[];
    permissions: DocumentPermission[];
}

export interface ProjectPhase {
    id: string;
    organizationId: string;
    name: string;
    order: number;
}

export interface ProjectComment {
    id: string;
    userId: string;
    message: string;
    timestamp: string;
}

export interface Project {
    id: string;
    organizationId: string;
    name: string;
    phaseId: string;
    contactId: string;
    dealId?: string;
    createdAt: string;
    assignedToId?: string;
    comments?: ProjectComment[];
    notes?: string;
    checklists?: ClientChecklist[];
}

export interface ProjectTemplate {
    id: string;
    organizationId: string;
    name: string;
    defaultTasks: { title: string, daysAfterStart: number }[];
}

export interface ClientChecklistItem {
    id: string;
    text: string;
    isCompleted: boolean;
}

export interface ClientChecklist {
    id: string;
    projectId: string;
    templateId: string;
    name: string;
    items: ClientChecklistItem[];
}

export interface ClientChecklistTemplate {
    id: string;
    organizationId: string;
    name: string;
    items: { text: string }[];
}

// Reports & Dashboards
export type ReportType = 'sales' | 'inventory' | 'financial' | 'contacts' | 'team' | 'deals';
export type ReportDataSource = 'contacts' | 'products' | 'deals' | 'tickets' | 'surveyResponses' | string;

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
    dealsByStage: { name: string; value: number }[];
}

export type AnyReportData = SalesReportData | InventoryReportData | FinancialReportData | ContactsReportData | TeamReportData | DealReportData;

export interface FilterCondition {
    field: string;
    operator: 'is' | 'is_not' | 'contains' | 'does_not_contain' | 'gt' | 'lt' | 'eq';
    value: string | number;
}

export interface ReportVisualization {
    type: 'table' | 'bar' | 'pie' | 'line';
    metric: {
        type: 'count' | 'sum' | 'average';
        column?: string;
    };
    groupByKey?: string;
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
        join?: {
            with: ReportDataSource;
            on: string;
            equals: string;
        }
    };
}

export interface Dashboard {
    id: string;
    organizationId: string;
    name: string;
    isDefault?: boolean;
}

export interface DashboardWidget {
    id: string;
    dashboardId: string;
    reportId: string;
    widgetId: string;
}

export interface DashboardLayout {
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
    static?: boolean;
}

export interface DashboardData {
    kpis: {
        totalContacts: number;
        newContacts: number;
        upcomingAppointments: number;
    };
    charts: {
        contactsByStatus: { name: string, value: number }[];
        appointmentsByMonth: { name: string, value: number }[];
    }
}

// Settings & Config
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
        charts: { dataKey: string, title: string, type: 'bar' | 'pie' | 'line' }[];
    };
    complianceFeatures?: {
        enabled: boolean;
        tabName: string;
    };
    relationshipMapping?: {
        enabled: boolean;
        tabName: string;
    };
    aiContextPrompt?: string;
}

export interface LeadScoringRule {
    id: string;
    event: 'interaction' | 'status_change';
    points: number;
    interactionType?: InteractionType;
    status?: ContactStatus;
}

export interface SLAPolicy {
    responseTime: { high: number, medium: number, low: number };
    resolutionTime: { high: number, medium: number, low: number };
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

export interface FeatureFlag {
    id: string;
    name: string;
    description: string;
    isEnabled: boolean;
}

export interface OrganizationSettings {
    organizationId: string;
    ticketSla: SLAPolicy;
    leadScoringRules: LeadScoringRule[];
    aiLeadScoringModel: {
        status: 'not_trained' | 'training' | 'trained';
        lastTrained?: string;
        positiveFactors: string[];
        negativeFactors: string[];
    };
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
    paymentGateway: {
        isConnected: boolean;
        provider?: 'stripe';
    };
    featureFlags: Record<string, boolean>;
    dataWarehouse: {
        isConnected: boolean;
        provider?: 'bigquery' | 'snowflake' | 'redshift';
        connectionString?: string;
        lastSync?: string;
    };
    accounting: {
        isConnected: boolean;
        provider?: 'quickbooks';
    };
    hipaaComplianceModeEnabled: boolean;
    emrEhrIntegration: {
        isConnected: boolean;
        provider?: 'epic';
    }
}

export interface ApiKey {
    id: string;
    organizationId: string;
    name: string;
    keyPrefix: string;
    createdAt: string;
}

// Custom Objects
export interface CustomObjectLayoutSection {
    id: string;
    title: string;
    fields: string[];
}
export interface CustomObjectDefinition {
    id: string;
    organizationId: string;
    nameSingular: string;
    namePlural: string;
    icon: string;
    fields: CustomField[];
    layout?: CustomObjectLayoutSection[];
}

export interface CustomObjectRecord {
    id: string;
    organizationId: string;
    objectDefId: string;
    fields: Record<string, any>;
    approvalStatus?: ApprovalStatus;
    currentApproverId?: string;
}

export interface StructuredRecord {
    id: string;
    type: string;
    title: string;
    recordDate: string;
    fields: Record<string, any>;
}

// Marketplace & Dev
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

export interface Sandbox {
    id: string;
    organizationId: string;
    name: string;
    createdAt: string;
}

// AI & Co-pilot types
export interface ContactChurnPrediction {
    contactId: string;
    risk: 'Low' | 'Medium' | 'High';
    factors: {
        positive: string[];
        negative: string[];
    };
    nextBestAction: string;
}

export interface DealForecast {
    dealId: string;
    probability: number;
    factors: {
        positive: string[];
        negative: string[];
    };
    nextBestAction: Omit<NextBestAction, 'contactId'>;
}

export interface NextBestAction {
    contactId: string;
    action: 'Email' | 'Call' | 'Create Task';
    reason: string;
    templateId?: string;
    taskDetails?: string;
}

// Advanced Workflows
export type WorkflowNodeType = 'trigger' | 'action' | 'condition' | 'approval';
export type NodeExecutionType =
  | 'contactCreated' | 'contactStatusChanged' | 'dealCreated' | 'dealStageChanged' | 'ticketCreated' | 'ticketStatusChanged'
  | 'sendEmail' | 'createTask' | 'wait' | 'updateContactField' | 'sendSurvey'
  | 'ifCondition' | 'approval';
  
export interface AdvancedWorkflow {
    id: string;
    organizationId: string;
    name: string;
    isActive: boolean;
    nodes: Node[]; // React Flow nodes
    edges: Edge[]; // React Flow edges
}

export interface ProcessInsight {
    observation: string;
    suggestion: string;
    workflow: Omit<Workflow, 'id' | 'organizationId' | 'isActive' | 'name'> | Omit<AdvancedWorkflow, 'id' | 'organizationId' | 'isActive' | 'name'>;
}

// Inbox & Chat
export interface Conversation {
    id: string;
    contactId: string;
    subject: string;
    channel: 'Email' | 'LinkedIn' | 'X';
    lastMessageTimestamp: string;
    lastMessageSnippet: string;
    messages: {
        id: string;
        senderId: string;
        body: string;
        timestamp: string;
    }[];
    participants: { id: string; name: string; email: string }[];
}

export interface TeamChannel {
    id: string;
    organizationId: string;
    name: string;
    description?: string;
    isPrivate: boolean;
    memberIds: string[];
    linkedRecordId?: string;
    linkedRecordType?: 'deal' | 'project' | 'ticket';
}

export interface TeamChatMessage {
    id: string;
    channelId: string;
    userId: string;
    message: string;
    timestamp: string;
    threadId?: string;
}

// Notifications
export interface Notification {
    id: string;
    userId: string;
    type: 'mention' | 'task_assigned' | 'deal_won' | 'ticket_assigned' | 'ticket_reply' | 'chat_mention';
    message: string;
    timestamp: string;
    isRead: boolean;
    linkTo?: { page: Page; recordId?: string; };
}

// Guided Tour
export interface TourStep {
  selector: string;
  title: string;
  content: string;
  page?: Page;
  openSection?: string;
}

// AI Tips Engine
export type UserAction = {
    type: string;
    payload: any;
    timestamp: string;
};

export type AiTip = {
    id: string;
    suggestion: string;
    action: {
        type: 'navigate';
        page: Page;
        payload?: any;
    };
};

// Context types
export interface AuthContextType {
    authenticatedUser: User | null;
    login: (user: User) => void;
    logout: () => void;
    hasPermission: (permission: Permission) => boolean;
}

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

// FIX: Add missing NotificationContextType
export interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
    markAsRead: (notificationId: string) => void;
    markAllAsRead: () => void;
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

export interface SubscriptionPlan {
    id: string;
    organizationId: string;
    name: string;
    price: number;
    billingCycle: 'monthly' | 'yearly';
}

export interface SystemAuditLogEntry {
    id: string;
    timestamp: string;
    userId: string;
    action: 'login' | 'logout' | 'create' | 'update' | 'delete' | 'view' | 'export';
    entityType: string;
    entityId: string;
    details: string;
}

export interface AudienceProfile {
    id: string;
    organizationId: string;
    name: string;
    description: string;
    filters: FilterCondition[];
}

export interface FormattingSuggestion {
    contactId: string;
    contactName: string;
    suggestion: string;
    field: 'contactName' | 'email' | 'phone';
    newValue: string;
}

export interface ProductFormattingSuggestion {
    productId: string;
    productName: string;
    suggestion: string;
    field: 'name' | 'category';
    newValue: string;
}

// FIX: Add missing DataHygieneSuggestion type
export interface DataHygieneSuggestion {
    duplicates: string[][];
    formatting: FormattingSuggestion[];
}

export interface DataHealthSummary {
    contactHygiene: {
        duplicates: string[][];
        formatting: FormattingSuggestion[];
    },
    productHygiene: {
        duplicates: string[][];
        formatting: ProductFormattingSuggestion[];
    }
}

export interface Snapshot {
    id: string;
    organizationId: string;
    name: string;
    dataSource: 'contacts' | 'deals';
    createdAt: string;
    data: string; // JSON string of the data
}


export interface KBArticleType {
    id: string;
    title: string;
    category: string;
    // FIX: Use `ReactNode` type directly instead of `React.ReactNode`.
    content: ReactNode;
}

export interface AttributedDeal {
    dealId: string;
    dealName: string;
    dealValue: number;
    contactName: string;
    closedAt: string;
}