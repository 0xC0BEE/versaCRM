import {
    AnyContact, Workflow, AdvancedWorkflow, Task, User, ReactFlowNode, Deal, ContactStatus, ReactFlowEdge, AuditLogEntry, Interaction, EmailTemplate, Ticket
} from '../types';
import {
    MOCK_WORKFLOWS, MOCK_ADVANCED_WORKFLOWS, MOCK_TASKS, MOCK_USERS, MOCK_CONTACTS_MUTABLE, MOCK_EMAIL_TEMPLATES
} from './mockData';
import { replacePlaceholders } from '../utils/textUtils';
// FIX: Import Node and Edge to use for casting.
import { Node, Edge } from 'reactflow';

// FIX: Add ticket-related event types.
export type EventType = 'contactCreated' | 'contactStatusChanged' | 'dealCreated' | 'dealStageChanged' | 'ticketCreated' | 'ticketStatusChanged';

interface EventPayload {
    contact: AnyContact;
    oldContact?: AnyContact;
    deal?: Deal;
    oldDeal?: Deal;
    ticket?: Ticket;
    oldTicket?: Ticket;
}

// --- Main Trigger Function ---
export const checkAndTriggerWorkflows = async (eventType: EventType, payload: EventPayload): Promise<string[]> => {
    const logs: string[] = [];
    logs.push(`[SYSTEM] Firing event: ${eventType}`);
    
    const simpleLogs = triggerSimpleWorkflows(eventType, payload);
    const advancedLogs = triggerAdvancedWorkflows(eventType, payload);

    const allLogs = logs.concat(simpleLogs, advancedLogs);
    if (allLogs.length === 1) {
        allLogs.push("[SYSTEM] No active workflows found matching this trigger.");
    }
    
    console.log(allLogs.join('\n')); // Keep console logs for in-app background execution
    return allLogs;
};


// --- Simple Workflow Engine ---
const triggerSimpleWorkflows = (eventType: EventType, payload: EventPayload): string[] => {
    const logs: string[] = [];
    
    const relevantWorkflows = MOCK_WORKFLOWS.filter(wf => {
        if (!wf.isActive) return false;

        const trigger = wf.trigger;
        if (trigger.type !== eventType) return false;
        
        if (trigger.type === 'contactStatusChanged') {
            if (trigger.fromStatus && trigger.fromStatus !== payload.oldContact?.status) return false;
            if (trigger.toStatus && trigger.toStatus !== payload.contact.status) return false;
        }

        if (trigger.type === 'dealStageChanged') {
            if (trigger.fromStageId && trigger.fromStageId !== payload.oldDeal?.stageId) return false;
            if (trigger.toStageId && trigger.toStageId !== payload.deal?.stageId) return false;
        }
        
        if (trigger.type === 'ticketCreated') {
            if (trigger.priority && trigger.priority !== payload.ticket?.priority) return false;
        }

        if (trigger.type === 'ticketStatusChanged') {
            if (trigger.fromStatus && trigger.fromStatus !== payload.oldTicket?.status) return false;
            if (trigger.toStatus && trigger.toStatus !== payload.ticket?.status) return false;
        }

        return true;
    });

    if(relevantWorkflows.length > 0) {
        logs.push(`[INFO] Found ${relevantWorkflows.length} matching simple workflows.`);
    }

    relevantWorkflows.forEach(wf => {
        logs.push(`[EXEC] Running simple workflow: '${wf.name}'`);
        wf.actions.forEach(action => {
            switch (action.type) {
                case 'createTask': {
                    const title = replacePlaceholders(action.taskTitle || 'New Task', payload.contact, payload.deal);
                    
                    let assigneeId = action.assigneeId;
                    if (!assigneeId && payload.deal?.assignedToId) {
                        assigneeId = payload.deal.assignedToId;
                        logs.push(`  - Action [Create Task]: Assigning to deal owner (ID: ${assigneeId})`);
                    } else if (!assigneeId) {
                        assigneeId = MOCK_USERS.find(u => u.organizationId === wf.organizationId && u.role === 'Team Member')?.id || '';
                        logs.push(`  - Action [Create Task]: No assignee specified. Falling back to default user (ID: ${assigneeId})`);
                    }

                    const newTask: Task = {
                        id: `task_wf_${Date.now()}`,
                        organizationId: wf.organizationId,
                        title,
                        dueDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
                        isCompleted: false,
                        userId: assigneeId,
                        contactId: payload.contact.id,
                    };
                    MOCK_TASKS.push(newTask);
                    logs.push(`  - Action [Create Task]: Created task '${title}' for user ID ${assigneeId}`);
                    break;
                }
                case 'sendEmail': {
                    const template = MOCK_EMAIL_TEMPLATES.find(t => t.id === action.emailTemplateId);
                    if (!template) {
                        logs.push(`  - Action [Send Email]: FAILED - Template ID ${action.emailTemplateId} not found.`);
                        break;
                    }
        
                    const senderId = payload.deal?.assignedToId || MOCK_USERS.find(u => u.organizationId === wf.organizationId && u.role === 'Organization Admin')?.id || '';
                    const sender = MOCK_USERS.find(u => u.id === senderId);
        
                    const subject = replacePlaceholders(template.subject, payload.contact, payload.deal);
                    const body = replacePlaceholders(template.body.replace('{{userName}}', sender?.name || 'The Team'), payload.contact, payload.deal);
        
                    const emailInteraction: Interaction = {
                        id: `int_wf_${Date.now()}`,
                        organizationId: wf.organizationId,
                        contactId: payload.contact.id,
                        userId: senderId,
                        type: 'Email',
                        date: new Date().toISOString(),
                        notes: `Subject: ${subject}\n\n${body}`,
                    };
        
                    const contactIndex = MOCK_CONTACTS_MUTABLE.findIndex(c => c.id === payload.contact.id);
                    if (contactIndex > -1) {
                        if (!MOCK_CONTACTS_MUTABLE[contactIndex].interactions) {
                            MOCK_CONTACTS_MUTABLE[contactIndex].interactions = [];
                        }
                        MOCK_CONTACTS_MUTABLE[contactIndex].interactions!.unshift(emailInteraction);
                        logs.push(`  - Action [Send Email]: (Simulated) Sent '${template.name}' to ${payload.contact.contactName} and logged interaction.`);
                    } else {
                        logs.push(`  - Action [Send Email]: FAILED - Contact ${payload.contact.id} not found to log interaction.`);
                    }
                    break;
                }
                case 'updateContactField': {
                    if (!action.fieldId || action.newValue === undefined) {
                        logs.push(`  - Action [Update Contact Field]: FAILED - Missing fieldId or newValue.`);
                        break;
                    }
                    const contactIndex = MOCK_CONTACTS_MUTABLE.findIndex(c => c.id === payload.contact.id);
                    if (contactIndex > -1) {
                        const contactToUpdate = MOCK_CONTACTS_MUTABLE[contactIndex];
                        // Check if it's a top-level field or a custom field
                        if (Object.keys(contactToUpdate).includes(action.fieldId)) {
                             (contactToUpdate as any)[action.fieldId] = action.newValue;
                             logs.push(`  - Action [Update Contact Field]: Updated '${action.fieldId}' for contact ${payload.contact.contactName} to '${action.newValue}'.`);
                        } else {
                             contactToUpdate.customFields[action.fieldId] = action.newValue;
                             logs.push(`  - Action [Update Contact Field]: Updated custom field '${action.fieldId}' for contact ${payload.contact.contactName} to '${action.newValue}'.`);
                        }
                    } else {
                        logs.push(`  - Action [Update Contact Field]: FAILED - Contact ${payload.contact.id} not found.`);
                    }
                    break;
                }
                case 'createAuditLogEntry':
                    const oldStatus = payload.oldContact?.status;
                    const newStatus = payload.contact.status;
                    if (oldStatus !== newStatus) {
                        // In a real app, the user performing the action would be passed in the payload.
                        // For this simulation, we'll assume a default admin user made the change.
                        const user = MOCK_USERS.find(u => u.id === 'user_admin_1');
                        if (user) {
                            const logMessage = `updated status from "${oldStatus}" to "${newStatus}".`;
                            const newLogEntry: AuditLogEntry = {
                                id: `log_wf_${Date.now()}`,
                                timestamp: new Date().toISOString(),
                                userId: user.id,
                                userName: user.name,
                                change: logMessage,
                            };
                            
                            const contactIndex = MOCK_CONTACTS_MUTABLE.findIndex(c => c.id === payload.contact.id);
                            if (contactIndex > -1) {
                                if (!MOCK_CONTACTS_MUTABLE[contactIndex].auditLogs) {
                                    MOCK_CONTACTS_MUTABLE[contactIndex].auditLogs = [];
                                }
                                // Add to the beginning of the array to show newest first
                                MOCK_CONTACTS_MUTABLE[contactIndex].auditLogs!.unshift(newLogEntry);
                                logs.push(`  - Action [Create Audit Log]: Created log for contact ${payload.contact.id}: "${user.name} ${logMessage}"`);
                            } else {
                                logs.push(`  - Action [Create Audit Log]: FAILED - Contact ${payload.contact.id} not found.`);
                            }
                        } else {
                            logs.push(`  - Action [Create Audit Log]: FAILED - User for logging not found.`);
                        }
                    } else {
                        logs.push(`  - Action [Create Audit Log]: SKIPPED - Status did not change.`);
                    }
                    break;
            }
        });
    });
    return logs;
};


// --- Advanced Workflow Engine ---

const executeAction = (node: ReactFlowNode, payload: EventPayload, organizationId: string): string[] => {
    const logs: string[] = [];
    // FIX: Cast node to Node to access properties.
    const rfn = node as Node;
    if (rfn.type !== 'action') return logs;

    logs.push(`  - Action [${rfn.data.label}]`);

    switch (rfn.data.nodeType) {
        case 'createTask': {
            const title = replacePlaceholders(rfn.data.taskTitle || 'New Task', payload.contact, payload.deal);
            
            let assigneeId = rfn.data.assigneeId;
            if (!assigneeId && payload.deal?.assignedToId) {
                assigneeId = payload.deal.assignedToId;
                logs.push(`    - SUCCESS: Assigning to deal owner (ID: ${assigneeId})`);
            } else if (!assigneeId) {
                assigneeId = MOCK_USERS.find(u => u.organizationId === organizationId && u.role === 'Team Member')?.id || '';
                logs.push(`    - SUCCESS: No assignee specified. Falling back to default user (ID: ${assigneeId})`);
            }

            const newTask: Task = {
                id: `task_wf_${Date.now()}_${Math.random()}`,
                organizationId: organizationId,
                title,
                dueDate: new Date(Date.now() + 86400000).toISOString(),
                isCompleted: false,
                userId: assigneeId,
                contactId: payload.contact.id,
            };
            MOCK_TASKS.push(newTask);
            logs.push(`    - SUCCESS: Created task '${title}' for user ID ${assigneeId}`);
            break;
        }
        case 'sendEmail': {
            const template = MOCK_EMAIL_TEMPLATES.find(t => t.id === rfn.data.emailTemplateId);
            if (!template) {
                logs.push(`    - FAILED: Template ID ${rfn.data.emailTemplateId} not found.`);
                break;
            }

            const senderId = payload.deal?.assignedToId || MOCK_USERS.find(u => u.organizationId === organizationId && u.role === 'Organization Admin')?.id || '';
            const sender = MOCK_USERS.find(u => u.id === senderId);

            const subject = replacePlaceholders(template.subject, payload.contact, payload.deal);
            const body = replacePlaceholders(template.body.replace('{{userName}}', sender?.name || 'The Team'), payload.contact, payload.deal);

            const emailInteraction: Interaction = {
                id: `int_awf_${Date.now()}`,
                organizationId: organizationId,
                contactId: payload.contact.id,
                userId: senderId,
                type: 'Email',
                date: new Date().toISOString(),
                notes: `Subject: ${subject}\n\n${body}`,
            };
            
            const contactIndex = MOCK_CONTACTS_MUTABLE.findIndex(c => c.id === payload.contact.id);
            if (contactIndex > -1) {
                if (!MOCK_CONTACTS_MUTABLE[contactIndex].interactions) {
                    MOCK_CONTACTS_MUTABLE[contactIndex].interactions = [];
                }
                MOCK_CONTACTS_MUTABLE[contactIndex].interactions!.unshift(emailInteraction);
                logs.push(`    - SUCCESS: (Simulated) Sent email '${template.name}' to ${payload.contact.contactName} and logged interaction.`);
            } else {
                 logs.push(`    - FAILED: Contact ${payload.contact.id} not found to log interaction.`);
            }
            break;
        }
        case 'updateContactField': {
            const { fieldId, newValue } = rfn.data;
            if (!fieldId || newValue === undefined) {
                logs.push(`    - FAILED: Missing fieldId or newValue.`);
                break;
            }
            const contactIndex = MOCK_CONTACTS_MUTABLE.findIndex(c => c.id === payload.contact.id);
            if (contactIndex > -1) {
                const contactToUpdate = MOCK_CONTACTS_MUTABLE[contactIndex];
                if (Object.keys(contactToUpdate).includes(fieldId)) {
                    (contactToUpdate as any)[fieldId] = newValue;
                    logs.push(`    - SUCCESS: Updated '${fieldId}' for contact ${payload.contact.contactName} to '${newValue}'.`);
                } else {
                    contactToUpdate.customFields[fieldId] = newValue;
                    logs.push(`    - SUCCESS: Updated custom field '${fieldId}' for contact ${payload.contact.contactName} to '${newValue}'.`);
                }
            } else {
                logs.push(`    - FAILED: Contact ${payload.contact.id} not found.`);
            }
            break;
        }
        case 'wait':
            logs.push(`    - SUCCESS: (Simulated) Waiting for ${rfn.data.days} day(s).`);
            break;
    }
    return logs;
};

const evaluateCondition = (node: ReactFlowNode, payload: EventPayload): { result: boolean, log: string } => {
    // FIX: Cast node to Node to access properties.
    const rfn = node as Node;
    const condition = rfn.data.condition;
    if (!condition || !condition.field) return { result: false, log: "  - Condition: Invalid or missing condition."};

    const [object, field] = condition.field.split('.');
    
    let valueToTest: any;
    if (object === 'contact') {
        valueToTest = (payload.contact as any)[field];
    } else if (object === 'deal' && payload.deal) {
        valueToTest = (payload.deal as any)[field];
    } else {
        return { result: false, log: `  - Condition: Invalid object '${object}' in condition.`}; 
    }

    const compareValue = condition.value;
    let result = false;

    switch (condition.operator) {
        case 'is': result = String(valueToTest).toLowerCase() === String(compareValue).toLowerCase(); break;
        case 'is_not': result = String(valueToTest).toLowerCase() !== String(compareValue).toLowerCase(); break;
        case 'contains': result = String(valueToTest).toLowerCase().includes(String(compareValue).toLowerCase()); break;
        case 'greater_than': result = Number(valueToTest) > Number(compareValue); break;
        case 'less_than': result = Number(valueToTest) < Number(compareValue); break;
        default: result = false;
    }
    
    const log = `  - Condition [${rfn.data.label}]: '${valueToTest}' ${condition.operator} '${compareValue}'? RESULT: ${result}`;
    return { result, log };
};

const traverseWorkflow = (startNode: ReactFlowNode, nodes: ReactFlowNode[], edges: ReactFlowEdge[], payload: EventPayload, organizationId: string): string[] => {
    const logs: string[] = [];
    let currentNode: ReactFlowNode | undefined = startNode;
    const maxSteps = nodes.length + 1; // Prevent infinite loops
    let steps = 0;

    while (currentNode && steps < maxSteps) {
        steps++;
        // FIX: Cast currentNode to Node to access properties.
        const rfn = currentNode as Node;
        logs.push(`[STEP] Executing node ID ${rfn.id} ('${rfn.data.label}')`);
        
        if (rfn.type === 'action') {
            logs.push(...executeAction(currentNode, payload, organizationId));
            
            // Find next node
            // FIX: Cast edge to Edge to access properties.
            const nextEdge = edges.find(edge => (edge as Edge).source === rfn?.id);
            // FIX: Cast node to Node to access properties and nextEdge to Edge.
            currentNode = nodes.find(node => (node as Node).id === (nextEdge as Edge)?.target);

        } else if (rfn.type === 'condition') {
            const { result, log } = evaluateCondition(currentNode, payload);
            logs.push(log);
            
            const handleId = result ? 'true' : 'false';
            // FIX: Cast edge and node to access properties.
            const nextEdge = edges.find(edge => (edge as Edge).source === rfn?.id && (edge as Edge).sourceHandle === handleId);
            // FIX: Cast node and edge to access properties.
            currentNode = nodes.find(node => (node as Node).id === (nextEdge as Edge)?.target);

        } else if (rfn.type === 'trigger') {
            // Find first node connected to trigger
            // FIX: Cast edge and node to access properties.
            const nextEdge = edges.find(edge => (edge as Edge).source === rfn?.id);
            // FIX: Cast node and edge to access properties.
            currentNode = nodes.find(node => (node as Node).id === (nextEdge as Edge)?.target);
        } else {
            logs.push(`[WARN] Unknown node type or dead end reached at node ID ${rfn.id}.`);
            currentNode = undefined;
        }
    }
    
    if (steps >= maxSteps) {
        logs.push('[ERROR] Workflow execution stopped to prevent infinite loop.');
    } else {
        logs.push('[END] Workflow execution finished.');
    }

    return logs;
};

const triggerAdvancedWorkflows = (eventType: EventType, payload: EventPayload): string[] => {
    const logs: string[] = [];

    const relevantWorkflows = MOCK_ADVANCED_WORKFLOWS.filter(wf => {
        if (!wf.isActive) return false;
        // FIX: Cast node to Node to access properties.
        const triggerNode = wf.nodes.find(n => (n as Node).type === 'trigger');
        // FIX: Cast triggerNode to Node to access properties.
        return (triggerNode as Node)?.data.nodeType === eventType;
    });

    if (relevantWorkflows.length > 0) {
        logs.push(`[INFO] Found ${relevantWorkflows.length} matching advanced workflows.`);
    }

    relevantWorkflows.forEach(wf => {
        logs.push(`[EXEC] Running advanced workflow: '${wf.name}'`);
        // FIX: Cast node to Node to access properties.
        const triggerNode = wf.nodes.find(n => (n as Node).type === 'trigger');
        if (triggerNode) {
            const executionLogs = traverseWorkflow(triggerNode, wf.nodes, wf.edges, payload, wf.organizationId);
            logs.push(...executionLogs);
        } else {
            logs.push(`[ERROR] Workflow '${wf.name}' has no trigger node.`);
        }
    });

    return logs;
};