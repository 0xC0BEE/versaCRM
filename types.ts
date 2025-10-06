import { Edge, Node } from "reactflow";

// types.ts

// --- Core Entities ---

export type UserRole = 'Super Admin' | 'Organization Admin' | 'Team Member' | 'Client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId?: string;
  contactId?: string;
}

export type Industry = 'Health' | 'Finance' | 'Legal' | 'Generic';

export interface Organization {
  id: string;
  name: string;
  industry: Industry;
  primaryContactEmail: string;
  createdAt: string; // ISO date string
}

export type ContactStatus = 'Active' | 'Lead' | 'Inactive' | 'Do Not Contact';

export type InteractionType = 'Appointment' | 'Call' | 'Email' | 'Note' | 'Site Visit' | 'Meeting' | 'Maintenance Request';

export interface Interaction {
  id: string;
  contactId: string;
  organizationId: string;
  userId: string; // 'system' for automated
  type: InteractionType;
  date: string; // ISO date string
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
  contactId: string;
  organizationId: string;
  orderDate: string; // ISO date string
  status: 'Pending' | 'Completed' | 'Cancelled';
  total: number;
  lineItems: OrderLineItem[];
}

export interface Transaction {
  id: string;
  type: 'Charge' | 'Payment' | 'Refund' | 'Credit';
  amount: number;
  date: string; // ISO date string
  method: 'Credit Card' | 'Bank Transfer' | 'Cash' | 'Insurance' | 'Other';
  orderId?: string;
  relatedChargeId?: string; // For payments not linked to an order
}

export interface Document {
  id: string;
  organizationId: string;
  contactId: string;
  fileName: string;
  fileType: string;
  uploadDate: string; // ISO date string
  dataUrl: string; // base64 or other URL
}

export interface AuditLogEntry {
  id: string;
  timestamp: string; // ISO date string
  userId: string;
  userName: string;
  change: string;
}

export interface Relationship {
  relatedContactId: string;
  relationshipType: string;
}

export interface Enrollment {
    id: string;
    programName: string;
    startDate: string; // ISO date string
    endDate?: string; // ISO date string
    status: 'Active' | 'Completed' | 'Cancelled';
}

export interface StructuredRecord {
    id: string;
    type: string; // e.g., 'soap_note'
    title: string;
    recordDate: string; // ISO date string
    fields: Record<string, any>;
}

export interface AnyContact {
  id: string;
  organizationId: string;
  contactName: string;
  email: string;
  phone: string;
  status: ContactStatus;
  leadSource: 'Web' | 'Referral' | 'Event' | 'Cold Call' | 'Manual';
  createdAt: string; // ISO date string
  avatar?: string;
  customFields: Record<string, any>;
  interactions?: Interaction[];
  orders?: Order[];
  transactions?: Transaction[];
  documents?: Document[];
  auditLogs?: AuditLogEntry[];
  relationships?: Relationship[];
  enrollments?: Enrollment[];
  structuredRecords?: StructuredRecord[];
}


// --- Inventory ---

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

// --- Scheduling & Tasks ---

export interface CalendarEvent {
  id: string;
  organizationId: string;
  title: string;
  start: Date | string;
  end: Date | string;
  userIds: string[];
  contactId?: string;
}

export interface Task {
  id: string;
  organizationId: string;
  title: string;
  dueDate: string; // ISO date string
  isCompleted: boolean;
  userId: string;
  contactId?: string;
}

// --- Sales & Deals ---

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
  expectedCloseDate: string; // ISO date string
  createdAt: string; // ISO date string
}

// --- Marketing & Automation ---

export interface EmailTemplate {
  id: string;
  organizationId: string;
  name: string;
  subject: string;
  body: string;
}

export type WorkflowTrigger =
  | { type: 'contactCreated' }
  | { type: 'contactStatusChanged'; fromStatus?: ContactStatus; toStatus?: ContactStatus }
  | { type: 'dealCreated' }
  | { type: 'dealStageChanged'; fromStageId?: string; toStageId?: string }
  | { type: 'ticketCreated' }
  | { type: 'ticketStatusChanged'; fromStatus?: string; toStatus?: string };

export type WorkflowAction =
  | { type: 'createTask'; taskTitle?: string; assigneeId?: string }
  | { type: 'sendEmail'; emailTemplateId?: string }
  | { type: 'updateContactField'; fieldId?: string; newValue?: any }
  | { type: 'wait'; days: number }
  | { type: 'sendWebhook'; webhookUrl?: string; payloadTemplate?: string };

export interface Workflow {
  id: string;
  organizationId: string;
  name: string;
  isActive: boolean;
  trigger: WorkflowTrigger;
  actions: WorkflowAction[];
}

// --- Advanced Workflow Types (reactflow compatible) ---
export type NodeExecutionType = 'sendEmail' | 'createTask' | 'wait' | 'ifCondition' | 'contactCreated' | 'contactStatusChanged' | 'dealCreated' | 'dealStageChanged' | 'ticketCreated' | 'ticketStatusChanged';
export type WorkflowNodeType = 'trigger' | 'action' | 'condition';

// This is the custom data payload for each node
export interface WorkflowNodeData {
    label: string;
    nodeType: NodeExecutionType;
    [key: string]: any; // for other config like taskTitle, etc.
}

// This is a reactflow-compatible Node structure
export interface ReactFlowNode extends Node<WorkflowNodeData> {
    // We can extend the base Node type if needed in the future
}

// This is a reactflow-compatible Edge structure
export interface ReactFlowEdge extends Edge {
   // We can extend the base Edge type if needed in the future
}


export interface AdvancedWorkflow {
    id: string;
    organizationId: string;
    name: string;
    isActive: boolean;
    nodes: ReactFlowNode[];
    edges: ReactFlowEdge[];
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

// --- Support ---

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
    timestamp: string; // ISO date string
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
  assignedToId?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  replies: TicketReply[];
}

// --- App Structure & Config ---

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
    | 'Settings';


export interface CustomField {
    id: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox' | 'file';
    options?: string[];
}

export interface KPI {
    key: string;
    title: string;
    icon: string;
}

export interface ChartConfig {
    dataKey: string;
    title: string;
    type: 'bar' | 'line' | 'pie';
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
        kpis: KPI[];
        charts: ChartConfig[];
    };
}

export interface FilterCondition {
    field: string;
    operator: 'is' | 'is_not' | 'contains' | 'does_not_contain';
    value: string;
}

// --- Contexts ---

export interface AppContextType {
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
    currentIndustry: Industry;
    setCurrentIndustry: (industry: Industry) => void;
    industryConfig: IndustryConfig;
    contactFilters: FilterCondition[];
    setContactFilters: (filters: FilterCondition[]) => void;
}

export interface Permissions {
    canViewOrganizations: boolean;
    canEditOrganizations: boolean;
    canViewAllContacts: boolean;
    canViewAllReports: boolean;
    canAccessSettings: boolean;
}

export interface AuthContextType {
    authenticatedUser: User | null;
    login: (user: User) => void;
    logout: () => void;
    permissions: Permissions | null;
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
  timestamp: string; // ISO date string
  isRead: boolean;
  linkTo: string;
}

export interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
    markAsRead: (notificationId: string) => void;
    markAllAsRead: () => void;
}

// --- Reports ---
export type ReportDataSource = 'contacts' | 'products';
export type VisualizationType = 'table' | 'bar' | 'pie' | 'line';
export interface ReportVisualization {
    type: VisualizationType;
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

export interface SLAPolicy {
    responseTime: { high: number, medium: number, low: number };
    resolutionTime: { high: number, medium: number, low: number };
}

export interface DashboardWidget {
  id: string;
  reportId: string;
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
    };
}

export interface OrganizationSettings {
  organizationId: string;
  ticketSla: SLAPolicy;
}