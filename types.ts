import { ReactNode } from 'react';
// Import and export Node/Edge types from reactflow for use in workflow/campaign definitions.
import type { Node, Edge } from 'reactflow';

export type { Node, Edge };

// Basic Types
export type Industry = 'Health' | 'Finance' | 'Legal' | 'Generic';
export type Page = 'Dashboard' | 'Organizations' | 'OrganizationDetails' | 'Contacts' | 'Deals' | 'Tickets' | 'Interactions' | 'SyncedEmail' | 'Campaigns' | 'Forms' | 'LandingPages' | 'Documents' | 'Projects' | 'Calendar' | 'Tasks' | 'Reports' | 'Inventory' | 'Team' | 'Workflows' | 'Settings' | 'ApiDocs' | 'KnowledgeBase' | 'CustomObjects' | 'AppMarketplace' | 'Inbox';
export type Theme = 'light' | 'dark' | 'system';
export type ReportType = 'sales' | 'inventory' | 'financial' | 'contacts' | 'team' | 'deals';
export type ContactStatus = 'Lead' | 'Active' | 'Needs Attention' | 'Inactive' | 'Do Not Contact';
export type InteractionType = 'Appointment' | 'Call' | 'Email' | 'Note' | 'Site Visit' | 'Maintenance Request' | 'VoIP Call' | 'Form Submission' | 'Meeting' | 'LinkedIn Message' | 'X Message';

// Permissions
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


// Core Data Models
export interface Organization {
    id: string;
    name: string;
    industry: Industry;
    primaryContactEmail: string;
    createdAt: string;
    isSetupComplete: boolean;
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

export interface CustomRole {
    id: string;
    organizationId: string;
    name: string;
    description: string;
    isSystemRole: boolean;
    permissions: Partial<Record<Permission, boolean>>;
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
    customFields: Record<string, any>;
    interactions?: Interaction[];
    orders?: Order[];
    enrollments?: CampaignEnrollment[];
    transactions?: Transaction[];
    auditLogs?: AuditLogEntry[];
    relationships?: any[];
    leadScore?: number;
    avatar?: string;
    campaignEnrollments?: CampaignEnrollment[];
    structuredRecords?: StructuredRecord[];
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
    relatedObjectDefId?: string;
    relatedObjectRecordId?: string;
}

export interface Task {
    id: string;
    organizationId: string;
    title: string;
    dueDate: string;
    isCompleted: boolean;
    userId: string;
    contactId?: string;
    projectId?: string;
    relatedObjectDefId?: string;
    relatedObjectRecordId?: string;
    isVisibleToClient?: boolean;
}

export interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    userIds: string[];
    contactId?: string;
}

export interface EmailTemplate {
    id: string;
    organizationId: string;
    name: string;
    subject: string;
    body: string;
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

export interface Document {
    id: string;
    organizationId: string;
    contactId?: string;
    projectId?: string;
    fileName: string;
    fileType: string;
    uploadDate: string;
    dataUrl: string; // Base64 encoded
    isVisibleToClient?: boolean;
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
    lineItems: OrderLineItem[];
    total: number;
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

export interface ProjectPhase {
  id: string;
  organizationId: string;
  name: string;
  order: number;
}

export interface ProjectTemplateTask {
  title: string;
  daysAfterStart: number;
}

export interface ProjectTemplate {
  id: string;
  organizationId: string;
  name: string;
  defaultTasks: ProjectTemplateTask[];
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
}

// Unified Inbox Types
export interface Message {
    id: string;
    senderId: string;
    body: string;
    timestamp: string;
}

export interface Conversation {
    id: string;
    contactId: string;
    subject: string;
    channel: 'Email' | 'LinkedIn' | 'X';
    lastMessageTimestamp: string;
    lastMessageSnippet: string;
    messages: Message[];
    participants: { id: string, name: string, email: string }[];
}

export interface CannedResponse {
  id: string;
  organizationId: string;
  name: string;
  body: string;
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


// Config & Settings
export interface CustomField {
    id: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox' | 'file';
    options?: string[];
}

export interface DashboardKpi {
    key: string;
    title: string;
    icon: string;
}

export interface DashboardChart {
    dataKey: string;
    title: string;
    type: 'pie' | 'bar' | 'line';
}

export interface IndustryConfig {
    name: string;
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
        kpis: DashboardKpi[];
        charts: DashboardChart[];
    };
}

export interface FeatureFlag {
    id: string;
    name: string;
    description: string;
    isEnabled: boolean;
}

// Context Types
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
    currentEnvironment: string;
    setCurrentEnvironment: (env: string) => void;
    sandboxes: Sandbox[];
    isFeatureEnabled: (flagId: string) => boolean;
    isLiveCopilotOpen: boolean;
    setIsLiveCopilotOpen: (isOpen: boolean) => void;
}

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
    type: 'mention' | 'task_assigned' | 'deal_won' | 'ticket_assigned' | 'ticket_reply';
    message: string;
    timestamp: string;
    isRead: boolean;
    linkTo?: string;
}

export interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
}

// Automation
export interface WorkflowTrigger {
    type: 'contactCreated' | 'contactStatusChanged' | 'dealCreated' | 'dealStageChanged' | 'ticketCreated' | 'ticketStatusChanged';
    fromStatus?: ContactStatus | 'New' | 'Open' | 'Pending' | 'Closed';
    toStatus?: ContactStatus | 'New' | 'Open' | 'Pending' | 'Closed';
    fromStageId?: string;
    toStageId?: string;
    priority?: 'Low' | 'Medium' | 'High';
}
export type WorkflowAction = 
    | { type: 'createTask', taskTitle?: string; assigneeId?: string }
    | { type: 'sendEmail', emailTemplateId?: string }
    | { type: 'updateContactField', fieldId?: string; newValue?: string }
    | { type: 'wait', days: number }
    | { type: 'sendWebhook', webhookUrl?: string; payloadTemplate?: string }
    | { type: 'sendSurvey', surveyId?: string };

export interface Workflow {
    id: string;
    organizationId: string;
    name: string;
    isActive: boolean;
    trigger: WorkflowTrigger;
    actions: WorkflowAction[];
}

export interface AdvancedWorkflow {
    id: string;
    organizationId: string;
    name: string;
    isActive: boolean;
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
    nodes: Node[]; // ReactFlow nodes
    edges: Edge[]; // ReactFlow edges
}

export interface CampaignEnrollment {
    id: string;
    campaignId: string;
    contactId: string;
    currentNodeId: string;
    waitUntil: string;
}

// Marketing & Forms
export interface PublicFormField {
    id: string;
    label: string;
    type: 'text' | 'textarea' | 'select' | 'number' | 'date' | 'checkbox' | 'file';
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

// Reports & Dashboard
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
    operator: 'is' | 'is_not' | 'contains' | 'does_not_contain';
    value: string;
}
export type ReportDataSource = 'contacts' | 'products' | 'surveyResponses' | string; // string for custom object IDs
export interface ReportVisualization {
    type: 'table' | 'bar' | 'pie' | 'line';
    groupByKey?: string;
    metric: {
        type: 'count' | 'sum' | 'average';
        column?: string;
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
    };
}

export interface DashboardLayout {
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
    static?: boolean;
}
export interface DashboardWidget {
    id: string;
    widgetId: string;
    organizationId: string;
    reportId: string;
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

// Misc
export interface ApiKey {
    id: string;
    organizationId: string;
    name: string;
    keyPrefix: string;
    createdAt: string;
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
export interface SLAPolicy {
    responseTime: { high: number; medium: number; low: number };
    resolutionTime: { high: number; medium: number; low: number };
}
export interface LiveChatSettings {
    isEnabled: boolean;
    color: string;
    welcomeMessage: string;
    autoCreateContact: boolean;
    newContactStatus: ContactStatus;
    autoCreateTicket: boolean;
    newTicketPriority: Ticket['priority'];
    organizationId?: string;
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
    featureFlags: Record<string, boolean>;
}
export interface LeadScoringRule {
    id: string;
    event: 'interaction' | 'status_change';
    points: number;
    interactionType?: InteractionType;
    status?: ContactStatus;
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
    organizationId: string;
    objectDefId: string;
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

export interface DealForecast {
    dealId: string;
    probability: number;
    factors: {
        positive: string[];
        negative: string[];
    };
    nextBestAction: Omit<NextBestAction, 'contactId'>;
}

export interface ContactChurnPrediction {
    contactId: string;
    risk: 'Low' | 'Medium' | 'High';
    factors: {
        positive: string[];
        negative: string[];
    };
    nextBestAction: string;
}

export interface NextBestAction {
    contactId: string;
    action: 'Call' | 'Email' | 'Create Task';
    reason: string;
    templateId?: string; // If action is Email
}

export interface KBArticleType {
    id: string;
    title: string;
    category: string;
    content: ReactNode;
}

export interface StructuredRecord {
    id: string;
    type: string; // Corresponds to structuredRecordTypes.id in IndustryConfig
    title: string;
    recordDate: string;
    fields: Record<string, any>;
}

export type NodeExecutionType =
    | 'contactCreated' | 'contactStatusChanged' | 'dealCreated' | 'dealStageChanged'
    | 'ticketCreated' | 'ticketStatusChanged' | 'sendEmail' | 'createTask' | 'wait'
    | 'ifCondition' | 'updateContactField' | 'sendSurvey';
    
export type WorkflowNodeType = 'trigger' | 'action' | 'condition';

export type JourneyNodeType = 'journeyTrigger' | 'journeyAction' | 'journeyCondition';
export type JourneyExecutionType = 'targetAudience' | 'sendEmail' | 'wait' | 'ifEmailOpened' | 'createTask';

export interface Sandbox {
    id: string;
    name: string;
    createdAt: string;
    organizationId: string;
}

// DataContext Types
export interface DataContextType {
    // Queries
    organizationsQuery: any;
    contactsQuery: any;
    teamMembersQuery: any;
    rolesQuery: any;
    tasksQuery: any;
    calendarEventsQuery: any;
    productsQuery: any;
    suppliersQuery: any;
    warehousesQuery: any;
    dealStagesQuery: any;
    dealsQuery: any;
    emailTemplatesQuery: any;
    allInteractionsQuery: any;
    syncedEmailsQuery: any;
    workflowsQuery: any;
    advancedWorkflowsQuery: any;
    organizationSettingsQuery: any;
    apiKeysQuery: any;
    ticketsQuery: any;
    formsQuery: any;
    campaignsQuery: any;
    landingPagesQuery: any;
    customReportsQuery: any;
    dashboardWidgetsQuery: any;
    customObjectDefsQuery: any;
    customObjectRecordsQuery: (defId: string | null) => any;
    marketplaceAppsQuery: any;
    installedAppsQuery: any;
    dashboardDataQuery: any;
    sandboxesQuery: any;
    documentTemplatesQuery: any;
    projectsQuery: any;
    projectPhasesQuery: any;
    inboxQuery: any;
    cannedResponsesQuery: any;
    surveysQuery: any;
    surveyResponsesQuery: any;

    // Mutations
    createOrganizationMutation: any;
    updateOrganizationMutation: any;
    deleteOrganizationMutation: any;
    createContactMutation: any;
    updateContactMutation: any;
    deleteContactMutation: any;
    bulkDeleteContactsMutation: any;
    bulkUpdateContactStatusMutation: any;
    createUserMutation: any;
    updateUserMutation: any;
    deleteUserMutation: any;
    createRoleMutation: any;
    updateRoleMutation: any;
    deleteRoleMutation: any;
    createInteractionMutation: any;
    updateInteractionMutation: any;
    createTaskMutation: any;
    updateTaskMutation: any;
    deleteTaskMutation: any;
    createCalendarEventMutation: any;
    updateCalendarEventMutation: any;
    createProductMutation: any;
    updateProductMutation: any;
    deleteProductMutation: any;
    createSupplierMutation: any;
    updateSupplierMutation: any;
    deleteSupplierMutation: any;
    createWarehouseMutation: any;
    updateWarehouseMutation: any;
    deleteWarehouseMutation: any;
    createDealMutation: any;
    updateDealMutation: any;
    deleteDealMutation: any;
    updateDealStagesMutation: any;
    createEmailTemplateMutation: any;
    updateEmailTemplateMutation: any;
    deleteEmailTemplateMutation: any;
    updateCustomFieldsMutation: any;
    updateOrganizationSettingsMutation: any;
    recalculateAllScoresMutation: any;
    connectEmailMutation: any;
    disconnectEmailMutation: any;
    connectVoipMutation: any;
    disconnectVoipMutation: any;
    runEmailSyncMutation: any;
    createWorkflowMutation: any;
    updateWorkflowMutation: any;
    createAdvancedWorkflowMutation: any;
    updateAdvancedWorkflowMutation: any;
    deleteAdvancedWorkflowMutation: any;
    createApiKeyMutation: any;
    deleteApiKeyMutation: any;
    createTicketMutation: any;
    updateTicketMutation: any;
    addTicketReplyMutation: any;
    createFormMutation: any;
    updateFormMutation: any;
    deleteFormMutation: any;
    submitPublicFormMutation: any;
    createCampaignMutation: any;
    updateCampaignMutation: any;
    launchCampaignMutation: any;
    advanceDayMutation: any;
    createLandingPageMutation: any;
    updateLandingPageMutation: any;
    deleteLandingPageMutation: any;
    trackPageViewMutation: any;
    createCustomReportMutation: any;
    updateCustomReportMutation: any;
    deleteCustomReportMutation: any;
    addDashboardWidgetMutation: any;
    removeDashboardWidgetMutation: any;
    createOrderMutation: any;
    updateOrderMutation: any;
    deleteOrderMutation: any;
    createTransactionMutation: any;
    createCustomObjectDefMutation: any;
    updateCustomObjectDefMutation: any;
    deleteCustomObjectDefMutation: any;
    createCustomObjectRecordMutation: any;
    updateCustomObjectRecordMutation: any;
    deleteCustomObjectRecordMutation: any;
    installAppMutation: any;
    uninstallAppMutation: any;
    handleNewChatMessageMutation: any;
    createSandboxMutation: any;
    refreshSandboxMutation: any;
    deleteSandboxMutation: any;
    createDocumentTemplateMutation: any;
    updateDocumentTemplateMutation: any;
    deleteDocumentTemplateMutation: any;
    updateDocumentMutation: any;
    createProjectMutation: any;
    updateProjectMutation: any;
    deleteProjectMutation: any;
    sendEmailReplyMutation: any;
    sendNewEmailMutation: any;
    addProjectCommentMutation: any;
    createCannedResponseMutation: any;
    updateCannedResponseMutation: any;
    deleteCannedResponseMutation: any;
    createSurveyMutation: any;
    updateSurveyMutation: any;
    deleteSurveyMutation: any;
}