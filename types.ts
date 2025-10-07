import { Node, Edge } from 'reactflow';

// Base types
export type Industry = 'Health' | 'Finance' | 'Legal' | 'Generic';
export type UserRole = 'Super Admin' | 'Organization Admin' | 'Team Member' | 'Client';
export type Page =
  | 'Dashboard'
  | 'Contacts'
  | 'Deals'
  | 'Tickets'
  | 'Interactions'
  | 'Organizations'
  | 'Calendar'
  | 'Tasks'
  | 'Inventory'
  | 'Campaigns'
  | 'Workflows'
  | 'Reports'
  | 'Settings'
  // FIX: Added 'Team' to the Page type to allow its use in the Sidebar navigation.
  | 'Team';
export type Theme = 'light' | 'dark' | 'system';
export type ContactStatus = 'Lead' | 'Active' | 'Inactive' | 'Do Not Contact';
// FIX: Add 'Meeting' to InteractionType to allow its use in industry configurations.
export type InteractionType = 'Appointment' | 'Call' | 'Email' | 'Note' | 'Site Visit' | 'Maintenance Request' | 'Meeting';

// Data models
export interface User {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  role: UserRole;
  contactId?: string; // For client users
}

export interface Organization {
  id: string;
  name: string;
  industry: Industry;
  primaryContactEmail: string;
  createdAt: string;
}

export interface CustomField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox' | 'file';
  options?: string[];
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
  interactions?: Interaction[];
  orders?: Order[];
  enrollments?: Enrollment[];
  relationships?: Relationship[];
  structuredRecords?: StructuredRecord[];
  auditLogs?: AuditLogEntry[];
  transactions?: Transaction[];
  assignedToId?: string; // Added for data scoping
  // FIX: Add optional 'documents' property to support document attachments.
  documents?: Document[];
}

export interface Interaction {
  id: string;
  organizationId: string;
  contactId: string;
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
  lineItems: OrderLineItem[];
  total: number;
}

export interface Enrollment {
    id: string;
    programName: string;
    startDate: string;
    endDate?: string;
    status: 'Active' | 'Completed' | 'Cancelled';
}

export interface Relationship {
    relatedContactId: string;
    relationshipType: string;
}

export interface StructuredRecord {
    id: string;
    type: string;
    title: string;
    recordDate: string;
    fields: Record<string, any>;
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
    relatedChargeId?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
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

export interface Document {
    id: string;
    organizationId: string;
    contactId: string;
    fileName: string;
    fileType: string;
    uploadDate: string;
    dataUrl: string; // Base64 encoded file
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
    assignedToId?: string; // Added for data scoping
}

export interface EmailTemplate {
    id: string;
    organizationId: string;
    name: string;
    subject: string;
    body: string;
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
    timestamp: string;
    message: string;
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

export interface CampaignStep {
    type: 'sendEmail' | 'wait';
    emailTemplateId?: string;
    days?: number;
}

export interface Campaign {
    id: string;
    organizationId: string;
    name: string;
    status: 'Draft' | 'Active' | 'Completed';
    targetAudience: {
        status: ContactStatus[];
    };
    steps: CampaignStep[];
    stats: {
        recipients: number;
        sent: number;
        opened: number;
        clicked: number;
    };
}


// Configs
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
      kpis: { key: string; title: string; icon: string }[];
      charts: { dataKey: string; title: string; type: 'bar' | 'line' | 'pie' }[];
  }
}

export interface Permissions {
  canViewOrganizations: boolean;
  canEditOrganizations: boolean;
  canViewAllContacts: boolean;
  canViewAllReports: boolean;
  canAccessSettings: boolean;
}

// Contexts
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

// Reports
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
    lowStockItems: { id: string, name: string; sku: string; stockLevel: number }[];
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
        [key: string]: any;
    };
}

export interface FilterCondition {
    field: string;
    operator: 'is' | 'is_not' | 'contains' | 'does_not_contain';
    value: string;
}

// Workflows
export type WorkflowTriggerType = 'contactCreated' | 'contactStatusChanged' | 'dealCreated' | 'dealStageChanged' | 'ticketCreated' | 'ticketStatusChanged';

export interface WorkflowTrigger {
    type: WorkflowTriggerType;
    fromStatus?: string;
    toStatus?: string;
    fromStageId?: string;
    toStageId?: string;
}

export interface WorkflowAction {
    type: 'createTask' | 'sendEmail' | 'updateContactField' | 'wait' | 'sendWebhook' | 'createAuditLogEntry';
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

// Advanced Workflows (React Flow)
export type WorkflowNodeType = 'trigger' | 'action' | 'condition';
export type NodeExecutionType = WorkflowTriggerType | 'sendEmail' | 'createTask' | 'wait' | 'ifCondition';

export interface AdvancedWorkflow {
    id: string;
    organizationId: string;
    name: string;
    isActive: boolean;
    nodes: Node[];
    edges: Edge[];
}

// A bit of a hack to make the types work with react-flow's generic data
export type ReactFlowNode = Node;
export type ReactFlowEdge = Edge;

// Custom Reports
export type ReportDataSource = 'contacts' | 'products';

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

export interface DashboardWidget {
    id: string;
    reportId: string;
}

export interface SLAPolicy {
    responseTime: {
        high: number;
        medium: number;
        low: number;
    };
    resolutionTime: {
        high: number;
        medium: number;
        low: number;
    };
}

export interface OrganizationSettings {
    id: string;
    organizationId: string;
    ticketSla: SLAPolicy;
}