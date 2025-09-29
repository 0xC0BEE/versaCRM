// FIX: Implemented all missing API methods and imported types.
import { User, AnyReportData, ReportType, Industry, Task, AnyContact, Organization, Interaction, CalendarEvent } from '../types';
import { mockUsers, mockOrganizations, mockContacts, mockInteractions, mockTasks, mockProducts, mockSuppliers, mockWarehouses, mockCalendarEvents, mockWorkflows } from './mockData';
import { generateReportData } from './reportGenerator';


const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const api = {
    async login(email: string): Promise<User | null> {
        await delay(300);
        const user = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
        return user || null;
    },

    // --- NEW METHODS ---

    async getOrganizations(): Promise<Organization[]> {
        await delay(500);
        return mockOrganizations;
    },

    async getOrganizationsForSuperAdmin(industry: Industry): Promise<Organization[]> {
        await delay(500);
        return mockOrganizations.filter(o => o.industry === industry);
    },

    async getOrganizationById(id: string): Promise<Organization | null> {
        await delay(200);
        return mockOrganizations.find(o => o.id === id) || null;
    },
    
    async getContacts(organizationId: string): Promise<AnyContact[]> {
        await delay(500);
        return mockContacts.filter(c => c.organizationId === organizationId);
    },
    
    async getContactsForSuperAdmin(industry: Industry): Promise<AnyContact[]> {
        await delay(500);
        const orgIds = mockOrganizations.filter(o => o.industry === industry).map(o => o.id);
        return mockContacts.filter(c => orgIds.includes(c.organizationId));
    },

    async getContactById(id: string): Promise<AnyContact | null> {
        await delay(300);
        return mockContacts.find(c => c.id === id) || null;
    },

    async getInteractions(organizationId: string): Promise<Interaction[]> {
        await delay(400);
        return mockInteractions.filter(i => i.organizationId === organizationId);
    },

    async getInteractionsForSuperAdmin(industry: Industry): Promise<Interaction[]> {
        await delay(400);
        const orgIds = mockOrganizations.filter(o => o.industry === industry).map(o => o.id);
        return mockInteractions.filter(i => orgIds.includes(i.organizationId));
    },
    
    async getInteractionsByContact(contactId: string): Promise<Interaction[]> {
        await delay(300);
        return mockInteractions.filter(i => i.contactId === contactId);
    },

    async getTasks(userId: string): Promise<Task[]> {
        await delay(300);
        return mockTasks.filter(t => t.userId === userId);
    },

    async createTask(taskData: Omit<Task, 'id' | 'isCompleted'>): Promise<Task> {
        await delay(300);
        const newTask: Task = {
            ...taskData,
            id: `task-${Date.now()}`,
            isCompleted: false,
        };
        mockTasks.push(newTask);
        return newTask;
    },
    
    async updateTask(updatedTask: Task): Promise<Task> {
        await delay(200);
        const index = mockTasks.findIndex(t => t.id === updatedTask.id);
        if (index > -1) {
            mockTasks[index] = updatedTask;
        }
        return updatedTask;
    },

    async deleteTask(taskId: string): Promise<void> {
        await delay(300);
        const index = mockTasks.findIndex(t => t.id === taskId);
        if (index > -1) {
            mockTasks.splice(index, 1);
        }
    },
    
    async createInteraction(interactionData: Omit<Interaction, 'id'>): Promise<Interaction> {
        await delay(300);
        const newInteraction: Interaction = {
            ...interactionData,
            id: `int-${Date.now()}`,
        };
        mockInteractions.push(newInteraction);
        const contact = mockContacts.find(c => c.id === newInteraction.contactId);
        if (contact) {
            contact.interactions.push(newInteraction);
        }
        return newInteraction;
    },

    async createCalendarEvent(eventData: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
        await delay(300);
        const newEvent: CalendarEvent = {
            ...eventData,
            id: `calevent-${Date.now()}`,
        };
        mockCalendarEvents.push(newEvent);
        return newEvent;
    },
    
    async updateCalendarEvent(updatedEvent: CalendarEvent): Promise<CalendarEvent> {
        await delay(200);
        const index = mockCalendarEvents.findIndex(e => e.id === updatedEvent.id);
        if (index > -1) {
            mockCalendarEvents[index] = updatedEvent;
        }
        return updatedEvent;
    },

    async getProducts(organizationId: string) {
        await delay(400);
        return mockProducts.filter(p => p.organizationId === organizationId);
    },

    async getProductsForSuperAdmin(industry: Industry) {
        await delay(400);
        const orgIds = mockOrganizations.filter(o => o.industry === industry).map(o => o.id);
        return mockProducts.filter(p => orgIds.includes(p.organizationId));
    },

    async getSuppliers(organizationId: string) {
        await delay(400);
        return mockSuppliers.filter(s => s.organizationId === organizationId);
    },
    
    async getSuppliersForSuperAdmin(industry: Industry) {
        await delay(400);
        const orgIds = mockOrganizations.filter(o => o.industry === industry).map(o => o.id);
        return mockSuppliers.filter(s => orgIds.includes(s.organizationId));
    },

    async getWarehouses(organizationId: string) {
        await delay(400);
        return mockWarehouses.filter(w => w.organizationId === organizationId);
    },

    async getWarehousesForSuperAdmin(industry: Industry) {
        await delay(400);
        const orgIds = mockOrganizations.filter(o => o.industry === industry).map(o => o.id);
        return mockWarehouses.filter(w => orgIds.includes(w.organizationId));
    },
    
    async getCalendarEvents(userIds: string[]) {
        await delay(400);
        return mockCalendarEvents.filter(e => e.userIds.some(uid => userIds.includes(uid)));
    },
    
    async getWorkflows(organizationId: string) {
        await delay(400);
        return mockWorkflows.filter(w => w.organizationId === organizationId);
    },

    async getWorkflowsForSuperAdmin(industry: Industry) {
        await delay(400);
        const orgIds = mockOrganizations.filter(o => o.industry === industry).map(o => o.id);
        return mockWorkflows.filter(w => orgIds.includes(w.organizationId));
    },

    async getUsers(organizationId: string) {
        await delay(400);
        return mockUsers.filter(u => u.organizationId === organizationId);
    },

    async getUsersForSuperAdmin(industry: Industry) {
        await delay(400);
        const orgIds = mockOrganizations.filter(o => o.industry === industry).map(o => o.id);
        return mockUsers.filter(u => u.organizationId && orgIds.includes(u.organizationId));
    },

    async getReportData(
        reportType: ReportType,
        dateRange: { start: Date; end: Date },
        industry: Industry,
        organizationId?: string
    ): Promise<AnyReportData> {
        await delay(1000);
        const store = { organizations: mockOrganizations, contacts: mockContacts, products: mockProducts, users: mockUsers, tasks: mockTasks, interactions: mockInteractions };
        return generateReportData(store, reportType, dateRange, industry, organizationId);
    }
};

export default api;