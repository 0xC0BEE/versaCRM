// ===================================================================================
//
//  MOCK API SERVICE IMPLEMENTATION
//
//  This file simulates a backend API by interacting with mock data stored in
//  localStorage. It should NOT be imported directly by components or contexts.
//
//  Instead, the application should use the `apiClient.ts` which provides
//  the public interface for all data operations. This allows us to easily
//  swap this mock implementation with a real backend API service in the future
//  without refactoring the rest of the application.
//
// ===================================================================================

// This is a mock API service. It simulates network latency and works with the mock data.
import {
    mockOrganizations,
    mockUsers,
    mockContacts,
    mockInteractions,
    mockCalendarEvents,
    mockTasks,
    mockProducts,
    mockSuppliers,
    mockWarehouses,
    mockEmailTemplates,
    mockCustomReports,
    mockWorkflows,
    mockDocuments,
} from './mockData';
import {
    User,
    Organization,
    AnyContact,
    Interaction,
    CalendarEvent,
    Task,
    Product,
    Supplier,
    Warehouse,
    EmailTemplate,
    CustomReport,
    Workflow,
    ReportType,
    AnyReportData,
    ContactStatus,
    IndustryConfig,
    Industry,
    CustomField,
    Document,
} from '../types';
import { generateReportData } from './reportGenerator';
import { checkAndTriggerWorkflows } from './workflowService';
import { industryConfigs as mutableIndustryConfigs } from '../config/industryConfig';


const LATENCY = 500; // ms

const mockApi = {
    login: (email: string): Promise<User | undefined> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
                resolve(user);
            }, LATENCY);
        });
    },

    // --- Organizations ---
    getOrganizations: (): Promise<Organization[]> => {
        return new Promise(resolve => {
            setTimeout(() => resolve([...mockOrganizations]), LATENCY);
        });
    },
    createOrganization: (orgData: Omit<Organization, 'id' | 'createdAt'>): Promise<Organization> => {
        return new Promise(resolve => {
            const newOrg: Organization = {
                ...orgData,
                id: `org_${Date.now()}`,
                createdAt: new Date().toISOString(),
            };
            mockOrganizations.push(newOrg);
            setTimeout(() => resolve(newOrg), LATENCY);
        });
    },
    updateOrganization: (updatedOrg: Organization): Promise<Organization> => {
        return new Promise(resolve => {
            // FIX: Mutate array instead of re-assigning import.
            const index = mockOrganizations.findIndex(o => o.id === updatedOrg.id);
            if (index !== -1) {
                mockOrganizations[index] = updatedOrg;
            }
            setTimeout(() => resolve(updatedOrg), LATENCY);
        });
    },
    deleteOrganization: (orgId: string): Promise<void> => {
        return new Promise(resolve => {
            // FIX: Mutate array instead of re-assigning import.
            const index = mockOrganizations.findIndex(o => o.id === orgId);
            if (index !== -1) {
                mockOrganizations.splice(index, 1);
            }
            setTimeout(() => resolve(), LATENCY);
        });
    },

    // --- Contacts ---
    getContacts: (organizationId: string): Promise<AnyContact[]> => {
        return new Promise(resolve => {
            const contacts = mockContacts.filter(c => c.organizationId === organizationId);
            setTimeout(() => resolve(contacts), LATENCY);
        });
    },
    getContactById: (contactId: string): Promise<AnyContact | null> => {
         return new Promise(resolve => {
            const contact = mockContacts.find(c => c.id === contactId) || null;
            setTimeout(() => resolve(contact), LATENCY);
        });
    },
    createContact: (contactData: Omit<AnyContact, 'id'>, orgId: string): Promise<AnyContact> => {
        return new Promise(resolve => {
            const newContact: AnyContact = {
                ...contactData,
                id: `contact_${Date.now()}`,
                organizationId: orgId,
                createdAt: new Date().toISOString(),
                interactions: [],
                orders: [],
                transactions: [],
                enrollments: [],
                structuredRecords: [],
                relationships: [],
                documents: [],
                auditLogs: [{ id: `log_${Date.now()}`, timestamp: new Date().toISOString(), userId: 'user_admin_1', userName: 'Org Admin', change: 'created contact.' }],
            };
            mockContacts.push(newContact);
            
            // Trigger workflow check
            checkAndTriggerWorkflows({
                event: 'contactCreated',
                contact: newContact,
                dependencies: { workflows: mockWorkflows, emailTemplates: mockEmailTemplates, createTask: (task) => mockApi.createTask(task, task.userId, task.organizationId), createInteraction: mockApi.createInteraction, updateContact: mockApi.updateContact }
            });

            setTimeout(() => resolve(newContact), LATENCY);
        });
    },
    updateContact: (updatedContact: AnyContact): Promise<AnyContact> => {
        return new Promise(resolve => {
             const oldContact = mockContacts.find(c => c.id === updatedContact.id);
            if (oldContact && oldContact.status !== updatedContact.status) {
                // Trigger workflow check for status change
                checkAndTriggerWorkflows({
                    event: 'contactStatusChanged',
                    contact: updatedContact,
                    fromStatus: oldContact.status,
                    toStatus: updatedContact.status,
                    dependencies: { workflows: mockWorkflows, emailTemplates: mockEmailTemplates, createTask: (task) => mockApi.createTask(task, task.userId, task.organizationId), createInteraction: mockApi.createInteraction, updateContact: mockApi.updateContact }
                });
            }
            // FIX: Mutate array instead of re-assigning import.
            const index = mockContacts.findIndex(c => c.id === updatedContact.id);
            if (index !== -1) {
                mockContacts[index] = updatedContact;
            }
            setTimeout(() => resolve(updatedContact), LATENCY);
        });
    },
    deleteContact: (contactId: string): Promise<void> => {
        return new Promise(resolve => {
            // FIX: Mutate array instead of re-assigning import.
            const index = mockContacts.findIndex(c => c.id === contactId);
            if (index !== -1) {
                mockContacts.splice(index, 1);
            }
            setTimeout(() => resolve(), LATENCY);
        });
    },
    bulkDeleteContacts: (contactIds: string[]): Promise<void> => {
        return new Promise(resolve => {
            // FIX: Mutate array instead of re-assigning import.
            for (let i = mockContacts.length - 1; i >= 0; i--) {
                if (contactIds.includes(mockContacts[i].id)) {
                    mockContacts.splice(i, 1);
                }
            }
            setTimeout(() => resolve(), LATENCY);
        });
    },
    bulkUpdateContactStatus: (contactIds: string[], status: ContactStatus): Promise<void> => {
        return new Promise(resolve => {
            // FIX: Mutate array instead of re-assigning import.
            mockContacts.forEach((contact, index) => {
                if (contactIds.includes(contact.id)) {
                    mockContacts[index] = { ...contact, status };
                }
            });
            setTimeout(() => resolve(), LATENCY);
        });
    },

    // --- Interactions ---
    getInteractions: (organizationId: string): Promise<Interaction[]> => {
        return new Promise(resolve => {
            setTimeout(() => resolve(mockInteractions.filter(i => i.organizationId === organizationId)), LATENCY);
        });
    },
     getInteractionsByContact: (contactId: string): Promise<Interaction[]> => {
        return new Promise(resolve => {
            const contact = mockContacts.find(c => c.id === contactId);
            setTimeout(() => resolve(contact ? [...mockInteractions.filter(i => i.contactId === contactId), ...contact.interactions] : []), LATENCY);
        });
    },
    createInteraction: (interactionData: Omit<Interaction, 'id'>): Promise<Interaction> => {
        return new Promise(resolve => {
            const newInteraction: Interaction = {
                ...interactionData,
                id: `interaction_${Date.now()}`,
            };
            mockInteractions.push(newInteraction);
            const contact = mockContacts.find(c => c.id === interactionData.contactId);
            if (contact) {
                contact.interactions.push(newInteraction);
            }
            setTimeout(() => resolve(newInteraction), LATENCY);
        });
    },

    // --- Documents ---
    getDocumentsByContact: (contactId: string): Promise<Document[]> => {
        return new Promise(resolve => {
            const docs = mockDocuments.filter(d => d.contactId === contactId);
            setTimeout(() => resolve(docs), LATENCY);
        });
    },
    uploadDocument: (docData: Omit<Document, 'id'>): Promise<Document> => {
        return new Promise(resolve => {
            const newDoc: Document = {
                ...docData,
                id: `doc_${Date.now()}`,
            };
            mockDocuments.push(newDoc);
            // Also add to contact object for consistency if needed, though queries will refetch
            const contact = mockContacts.find(c => c.id === docData.contactId);
            if (contact) {
                contact.documents.push(newDoc);
            }
            setTimeout(() => resolve(newDoc), LATENCY);
        });
    },
    deleteDocument: (documentId: string): Promise<void> => {
        return new Promise(resolve => {
            const index = mockDocuments.findIndex(d => d.id === documentId);
            if (index !== -1) {
                mockDocuments.splice(index, 1);
            }
            setTimeout(() => resolve(), LATENCY);
        });
    },

    // --- Calendar Events ---
    getCalendarEvents: (organizationId: string): Promise<CalendarEvent[]> => {
        return new Promise(resolve => {
            setTimeout(() => resolve(mockCalendarEvents.filter(e => e.organizationId === organizationId)), LATENCY);
        });
    },
    createCalendarEvent: (eventData: Omit<CalendarEvent, 'id' | 'organizationId'>, orgId: string): Promise<CalendarEvent> => {
        return new Promise(resolve => {
            const newEvent: CalendarEvent = {
                ...eventData,
                id: `event_${Date.now()}`,
                organizationId: orgId,
            };
            mockCalendarEvents.push(newEvent);
            setTimeout(() => resolve(newEvent), LATENCY);
        });
    },
    updateCalendarEvent: (updatedEvent: CalendarEvent): Promise<CalendarEvent> => {
        return new Promise(resolve => {
            // FIX: Mutate array instead of re-assigning import.
            const index = mockCalendarEvents.findIndex(e => e.id === updatedEvent.id);
            if (index !== -1) {
                mockCalendarEvents[index] = updatedEvent;
            }
            setTimeout(() => resolve(updatedEvent), LATENCY);
        });
    },

    // --- Tasks ---
    getTasks: (userId: string): Promise<Task[]> => {
         return new Promise(resolve => {
            setTimeout(() => resolve(mockTasks.filter(t => t.userId === userId)), LATENCY);
        });
    },
    createTask: (taskData: Omit<Task, 'id' | 'isCompleted' | 'userId' | 'organizationId'>, userId: string, orgId: string): Promise<Task> => {
         return new Promise(resolve => {
            const newTask: Task = {
                ...taskData,
                id: `task_${Date.now()}`,
                isCompleted: false,
                userId: userId,
                organizationId: orgId,
            };
            mockTasks.push(newTask);
            setTimeout(() => resolve(newTask), LATENCY);
        });
    },
    updateTask: (updatedTask: Task): Promise<Task> => {
        return new Promise(resolve => {
            // FIX: Mutate array instead of re-assigning import.
            const index = mockTasks.findIndex(t => t.id === updatedTask.id);
            if (index !== -1) {
                mockTasks[index] = updatedTask;
            }
            setTimeout(() => resolve(updatedTask), LATENCY);
        });
    },
    deleteTask: (taskId: string): Promise<void> => {
        return new Promise(resolve => {
            // FIX: Mutate array instead of re-assigning import.
            const index = mockTasks.findIndex(t => t.id === taskId);
            if (index !== -1) {
                mockTasks.splice(index, 1);
            }
            setTimeout(() => resolve(), LATENCY);
        });
    },
    
    // --- Team Members ---
    getTeamMembers: (organizationId: string): Promise<User[]> => {
        return new Promise(resolve => {
            setTimeout(() => resolve(mockUsers.filter(u => u.organizationId === organizationId && u.role !== 'Client')), LATENCY);
        });
    },
    createTeamMember: (memberData: Omit<User, 'id'>): Promise<User> => {
         return new Promise(resolve => {
            const newMember: User = {
                ...memberData,
                id: `user_${Date.now()}`,
            };
            mockUsers.push(newMember);
            setTimeout(() => resolve(newMember), LATENCY);
        });
    },
    updateTeamMember: (updatedMember: User): Promise<User> => {
        return new Promise(resolve => {
            // FIX: Mutate array instead of re-assigning import.
            const index = mockUsers.findIndex(u => u.id === updatedMember.id);
            if (index !== -1) {
                mockUsers[index] = updatedMember;
            }
            setTimeout(() => resolve(updatedMember), LATENCY);
        });
    },
    
    // --- Inventory ---
    getProducts: (organizationId: string): Promise<Product[]> => {
         return new Promise(resolve => {
            setTimeout(() => resolve(mockProducts.filter(p => p.organizationId === organizationId)), LATENCY);
        });
    },
     createProduct: (productData: Omit<Product, 'id'>): Promise<Product> => {
        return new Promise(resolve => {
            const newProduct: Product = { ...productData, id: `prod_${Date.now()}`};
            mockProducts.push(newProduct);
            setTimeout(() => resolve(newProduct), LATENCY);
        });
    },
    updateProduct: (updatedProduct: Product): Promise<Product> => {
        return new Promise(resolve => {
            // FIX: Mutate array instead of re-assigning import.
            const index = mockProducts.findIndex(p => p.id === updatedProduct.id);
            if (index !== -1) {
                mockProducts[index] = updatedProduct;
            }
            setTimeout(() => resolve(updatedProduct), LATENCY);
        });
    },
    deleteProduct: (productId: string): Promise<void> => {
        return new Promise(resolve => {
            // FIX: Mutate array instead of re-assigning import.
            const index = mockProducts.findIndex(p => p.id === productId);
            if (index !== -1) {
                mockProducts.splice(index, 1);
            }
            setTimeout(() => resolve(), LATENCY);
        });
    },
    getSuppliers: (organizationId: string): Promise<Supplier[]> => {
         return new Promise(resolve => {
            setTimeout(() => resolve(mockSuppliers.filter(s => s.organizationId === organizationId)), LATENCY);
        });
    },
    getWarehouses: (organizationId: string): Promise<Warehouse[]> => {
         return new Promise(resolve => {
            setTimeout(() => resolve(mockWarehouses.filter(w => w.organizationId === organizationId)), LATENCY);
        });
    },
    
    // --- Configuration ---
    getIndustryConfig: (industry: Industry): Promise<IndustryConfig> => {
        return new Promise(resolve => {
            // Return a deep copy to prevent direct mutation of the config object elsewhere
            setTimeout(() => resolve(JSON.parse(JSON.stringify(mutableIndustryConfigs[industry]))), LATENCY / 2);
        });
    },
    updateCustomFields: (industry: Industry, fields: CustomField[]): Promise<IndustryConfig> => {
        return new Promise(resolve => {
            mutableIndustryConfigs[industry].customFields = fields;
            // Return a deep copy
            setTimeout(() => resolve(JSON.parse(JSON.stringify(mutableIndustryConfigs[industry]))), LATENCY);
        });
    },
    getEmailTemplates: (organizationId: string): Promise<EmailTemplate[]> => {
         return new Promise(resolve => {
            setTimeout(() => resolve(mockEmailTemplates.filter(t => t.organizationId === organizationId)), LATENCY);
        });
    },
    createEmailTemplate: (templateData: Omit<EmailTemplate, 'id'>): Promise<EmailTemplate> => {
        return new Promise(resolve => {
            const newTemplate: EmailTemplate = { ...templateData, id: `template_${Date.now()}`};
            mockEmailTemplates.push(newTemplate);
            setTimeout(() => resolve(newTemplate), LATENCY);
        });
    },
    updateEmailTemplate: (updatedTemplate: EmailTemplate): Promise<EmailTemplate> => {
        return new Promise(resolve => {
            // FIX: Mutate array instead of re-assigning import.
            const index = mockEmailTemplates.findIndex(t => t.id === updatedTemplate.id);
            if (index !== -1) {
                mockEmailTemplates[index] = updatedTemplate;
            }
            setTimeout(() => resolve(updatedTemplate), LATENCY);
        });
    },
     deleteEmailTemplate: (templateId: string): Promise<void> => {
        return new Promise(resolve => {
            // FIX: Mutate array instead of re-assigning import.
            const index = mockEmailTemplates.findIndex(t => t.id === templateId);
            if (index !== -1) {
                mockEmailTemplates.splice(index, 1);
            }
            setTimeout(() => resolve(), LATENCY);
        });
    },
    getCustomReports: (organizationId: string): Promise<CustomReport[]> => {
        return new Promise(resolve => {
            setTimeout(() => resolve(mockCustomReports.filter(r => r.organizationId === organizationId)), LATENCY);
        });
    },
     createCustomReport: (reportData: Omit<CustomReport, 'id'>): Promise<CustomReport> => {
        return new Promise(resolve => {
            const newReport: CustomReport = { ...reportData, id: `report_${Date.now()}`};
            mockCustomReports.push(newReport);
            setTimeout(() => resolve(newReport), LATENCY);
        });
    },
    getWorkflows: (organizationId: string): Promise<Workflow[]> => {
         return new Promise(resolve => {
            setTimeout(() => resolve(mockWorkflows.filter(w => w.organizationId === organizationId)), LATENCY);
        });
    },
     createWorkflow: (workflowData: Omit<Workflow, 'id'>): Promise<Workflow> => {
        return new Promise(resolve => {
            const newWorkflow: Workflow = { ...workflowData, id: `wf_${Date.now()}`};
            mockWorkflows.push(newWorkflow);
            setTimeout(() => resolve(newWorkflow), LATENCY);
        });
    },
    updateWorkflow: (updatedWorkflow: Workflow): Promise<Workflow> => {
        return new Promise(resolve => {
            // FIX: Mutate array instead of re-assigning import.
            const index = mockWorkflows.findIndex(w => w.id === updatedWorkflow.id);
            if (index !== -1) {
                mockWorkflows[index] = updatedWorkflow;
            }
            setTimeout(() => resolve(updatedWorkflow), LATENCY);
        });
    },

    // --- Reporting ---
    getReportData: (reportType: ReportType, dateRange: { start: Date; end: Date }, orgId: string): Promise<AnyReportData> => {
        return new Promise(resolve => {
            const contacts = mockContacts.filter(c => c.organizationId === orgId);
            const products = mockProducts.filter(p => p.organizationId === orgId);
            const team = mockUsers.filter(u => u.organizationId === orgId);
            const tasks = mockTasks.filter(t => t.organizationId === orgId);
            const data = generateReportData(reportType, dateRange, contacts, products, team, tasks);
            setTimeout(() => resolve(data), LATENCY * 2); // Reports take longer
        });
    },
    
    generateCustomReport: (config: CustomReport['config'], orgId: string): Promise<any[]> => {
        return new Promise(resolve => {
            let sourceData: any[] = [];
            if (config.dataSource === 'contacts') {
                sourceData = mockContacts.filter(c => c.organizationId === orgId);
            } else if (config.dataSource === 'products') {
                sourceData = mockProducts.filter(p => p.organizationId === orgId);
            }

            // Apply filters
            const filteredData = sourceData.filter(row => {
                return config.filters.every(filter => {
                    const rowValue = String(row[filter.field] || '').toLowerCase();
                    const filterValue = filter.value.toLowerCase();
                    switch (filter.operator) {
                        case 'is': return rowValue === filterValue;
                        case 'is_not': return rowValue !== filterValue;
                        case 'contains': return rowValue.includes(filterValue);
                        case 'does_not_contain': return !rowValue.includes(filterValue);
                        default: return true;
                    }
                });
            });

            // Select columns
            const result = filteredData.map(row => {
                return config.columns.reduce((obj, col) => {
                    obj[col] = row[col];
                    return obj;
                }, {} as any);
            });
            
            setTimeout(() => resolve(result), LATENCY * 2);
        });
    }

};

export default mockApi;