// FIX: Corrected import path for mockData from a file path to a relative module path.
import { MOCK_CONTACTS_MUTABLE, MOCK_WORKFLOWS, MOCK_ADVANCED_WORKFLOWS, MOCK_DEAL_STAGES, MOCK_EMAIL_TEMPLATES, MOCK_TASKS, MOCK_USERS, MOCK_ROLES } from './mockData';
// FIX: Removed unused 'Node' and 'Edge' imports which are not exported from the types module.
import { Workflow, WorkflowTrigger, AnyContact, Deal, AdvancedWorkflow, NodeExecutionType, AuditLogEntry, Task, Interaction, ContactStatus } from '../types';
import { replacePlaceholders } from '../utils/textUtils';
// FIX: Imported 'addDays' from 'date-fns' to make the function available.
import { addDays } from 'date-fns';

const logs: string[] = [];

function evaluateCondition(condition: any, payload: any): boolean {
    const { field, operator, value } = condition;
    if (!field) return false;

    // Resolve nested field paths like 'contact.status' or 'deal.value'
    const fieldParts = field.split('.');
    let dataValue = payload[fieldParts[0]];
    for (let i = 1; i < fieldParts.length; i++) {
        if (dataValue === undefined) break;
        dataValue = dataValue[fieldParts[i]];
    }

    if (dataValue === undefined) return false;
    
    // Handle numeric comparisons for fields like leadScore or deal.value
    if (typeof dataValue === 'number') {
        const numericValue = Number(value);
        switch(operator) {
            case 'gt': return dataValue > numericValue;
            case 'lt': return dataValue < numericValue;
            case 'eq': return dataValue === numericValue;
            default: return false;
        }
    }

    // Handle string comparisons
    const stringValue = String(dataValue).toLowerCase();
    const compareValue = String(value).toLowerCase();

    switch(operator) {
        case 'is': return stringValue === compareValue;
        case 'is_not': return stringValue !== compareValue;
        case 'contains': return stringValue.includes(compareValue);
        default: return false;
    }
}

function checkTrigger(trigger: WorkflowTrigger, eventType: string, payload: any): boolean {
    if (trigger.type !== eventType) return false;

    switch (eventType) {
        case 'contactStatusChanged':
            const { contact, oldContact } = payload as { contact: AnyContact; oldContact: AnyContact };
            const fromMatch = !trigger.fromStatus || trigger.fromStatus === oldContact.status;
            const toMatch = !trigger.toStatus || trigger.toStatus === contact.status;
            return fromMatch && toMatch;
        case 'dealStageChanged':
             const { deal, oldDeal } = payload as { deal: Deal, oldDeal: Deal};
             const fromStageMatch = !trigger.fromStageId || trigger.fromStageId === oldDeal.stageId;
             const toStageMatch = !trigger.toStageId || trigger.toStageId === deal.stageId;
             return fromStageMatch && toStageMatch;
        case 'ticketCreated':
             const { ticket } = payload as { ticket: any };
             const priorityMatch = !trigger.priority || trigger.priority === ticket.priority;
             return priorityMatch;
        default:
            return true;
    }
}

async function executeSimpleActions(workflow: Workflow, payload: any) {
    logs.push(`[Workflow] Executing simple actions for: "${workflow.name}"`);
    for (const action of workflow.actions) {
        await executeAction(action, payload, workflow.id, logs);
    }
}

async function executeAdvancedActions(workflow: AdvancedWorkflow, payload: any) {
    logs.push(`[Workflow] Executing advanced actions for: "${workflow.name}"`);
    const triggerNode = workflow.nodes.find(n => n.type === 'trigger');
    if (!triggerNode) return;
    
    let currentNodeId: string | null = triggerNode.id;
    const visited = new Set<string>(); // To prevent infinite loops

    while (currentNodeId && !visited.has(currentNodeId)) {
        visited.add(currentNodeId);
        const currentNode = workflow.nodes.find(n => n.id === currentNodeId);
        if (!currentNode) break;

        let nextNodeId: string | null = null;

        if (currentNode.type === 'action') {
            await executeAction(currentNode.data, payload, workflow.id, logs);
            const outgoingEdge = workflow.edges.find(e => e.source === currentNode.id);
            nextNodeId = outgoingEdge ? outgoingEdge.target : null;
        } else if (currentNode.type === 'condition') {
            const conditionResult = evaluateCondition(currentNode.data.condition, payload);
            logs.push(`  -> CONDITION: ${currentNode.data.label} evaluated to ${conditionResult}.`);
            const outgoingEdge = workflow.edges.find(e => e.source === currentNode.id && e.sourceHandle === String(conditionResult));
            nextNodeId = outgoingEdge ? outgoingEdge.target : null;
        } else { // trigger
             const outgoingEdge = workflow.edges.find(e => e.source === currentNode.id);
             nextNodeId = outgoingEdge ? outgoingEdge.target : null;
        }
        
        currentNodeId = nextNodeId;
    }
}

async function executeAction(actionData: any, payload: any, workflowId: string, logArray: string[]) {
     await new Promise(res => setTimeout(res, 200)); // Simulate async
     const actionType = actionData.nodeType || actionData.type;

     switch (actionType) {
        case 'createTask':
            {
                const taskTitle = replacePlaceholders(actionData.taskTitle || 'Untitled Task', payload.contact, payload.deal);
                const orgId = payload.contact?.organizationId || payload.deal?.organizationId;
                const adminRoleId = MOCK_ROLES.find(r => r.organizationId === orgId && r.name === 'Organization Admin')?.id;
                const adminForOrg = MOCK_USERS.find(u => u.organizationId === orgId && u.roleId === adminRoleId);
                const assigneeId = actionData.assigneeId || payload.deal?.assignedToId || payload.contact?.assignedToId || adminForOrg?.id || '';
                
                const newTask: Omit<Task, 'id' | 'isCompleted'> = {
                    organizationId: orgId,
                    userId: assigneeId,
                    title: taskTitle,
                    dueDate: addDays(new Date(), 3).toISOString(),
                    contactId: payload.contact?.id,
                };
                const createdTask = { ...newTask, id: `task_${Date.now()}`, isCompleted: false };
                MOCK_TASKS.push(createdTask);
                logArray.push(`  -> ACTION: Create Task. Title: "${taskTitle}". Assignee: ${assigneeId}.`);
            }
            break;
        case 'sendEmail':
            {
                const template = MOCK_EMAIL_TEMPLATES.find(t => t.id === actionData.emailTemplateId);
                 if (template && payload.contact) {
                     // FIX: User object does not have a 'role' property. Finding admin user by roleId via MOCK_ROLES.
                     const adminRoleId = MOCK_ROLES.find(r => r.organizationId === payload.contact.organizationId && r.name === 'Organization Admin')?.id;
                     const sender = MOCK_USERS.find(u => u.organizationId === payload.contact.organizationId && u.roleId === adminRoleId) || MOCK_USERS[0];
                     const subject = replacePlaceholders(template.subject, payload.contact, payload.deal);
                     const body = replacePlaceholders(template.body.replace('{{userName}}', sender.name), payload.contact, payload.deal);
                     const emailInteraction: Interaction = {
                        id: `int_wf_${Date.now()}`,
                        organizationId: payload.contact.organizationId,
                        contactId: payload.contact.id,
                        userId: sender.id, // System or specific user
                        type: 'Email',
                        date: new Date().toISOString(),
                        notes: `(Workflow: ${workflowId})\nSubject: ${subject}\n\n${body}`,
                    };
                    const contactIndex = MOCK_CONTACTS_MUTABLE.findIndex(c => c.id === payload.contact.id);
                    if (contactIndex > -1) {
                         if (!MOCK_CONTACTS_MUTABLE[contactIndex].interactions) MOCK_CONTACTS_MUTABLE[contactIndex].interactions = [];
                         MOCK_CONTACTS_MUTABLE[contactIndex].interactions!.unshift(emailInteraction);
                    }
                }
                logArray.push(`  -> ACTION: Send Email. Template ID: ${actionData.emailTemplateId}.`);
            }
            break;
        case 'updateContactField':
             {
                const contactIndex = MOCK_CONTACTS_MUTABLE.findIndex(c => c.id === payload.contact.id);
                if (contactIndex > -1 && actionData.fieldId) {
                    const topLevelFields = ['contactName', 'email', 'phone', 'status', 'leadSource'];
                    if (topLevelFields.includes(actionData.fieldId)) {
                        (MOCK_CONTACTS_MUTABLE[contactIndex] as any)[actionData.fieldId] = actionData.newValue;
                        logArray.push(`  -> ACTION: Update Contact Field. Field: ${actionData.fieldId}. New Value: ${actionData.newValue}.`);
                    } else { // Assume custom field
                        if (!MOCK_CONTACTS_MUTABLE[contactIndex].customFields) {
                            MOCK_CONTACTS_MUTABLE[contactIndex].customFields = {};
                        }
                        MOCK_CONTACTS_MUTABLE[contactIndex].customFields[actionData.fieldId] = actionData.newValue;
                        logArray.push(`  -> ACTION: Update Contact Custom Field. Field: ${actionData.fieldId}. New Value: ${actionData.newValue}.`);
                    }
                }
            }
            break;
        case 'createAuditLogEntry':
            {
                const { contact, oldContact, user } = payload;
                if(contact && oldContact) {
                    const logEntry: AuditLogEntry = {
                        id: `log_${Date.now()}`,
                        timestamp: new Date().toISOString(),
                        userId: user?.id || 'system',
                        userName: user?.name || 'System',
                        change: `had status updated from "${oldContact.status}" to "${contact.status}".`
                    };
                     const contactIndex = MOCK_CONTACTS_MUTABLE.findIndex(c => c.id === contact.id);
                     if (contactIndex > -1) {
                        if(!MOCK_CONTACTS_MUTABLE[contactIndex].auditLogs) MOCK_CONTACTS_MUTABLE[contactIndex].auditLogs = [];
                        MOCK_CONTACTS_MUTABLE[contactIndex].auditLogs!.push(logEntry);
                     }
                    logArray.push(`  -> ACTION: Create Audit Log Entry.`);
                }
            }
            break;
        default:
             logArray.push(`  -> ACTION: Unknown action type: ${actionType}.`);
     }
}

export async function checkAndTriggerWorkflows(eventType: string, payload: any): Promise<string[]> {
    logs.length = 0;
    logs.push(`[Workflow Engine] Event triggered: ${eventType}`);

    // Simple Workflows
    const matchingSimple = MOCK_WORKFLOWS.filter(
        (wf) => wf.isActive && checkTrigger(wf.trigger, eventType, payload)
    );
    for (const workflow of matchingSimple) {
        await executeSimpleActions(workflow, payload);
    }

    // Advanced Workflows
    const matchingAdvanced = MOCK_ADVANCED_WORKFLOWS.filter(wf => {
        const triggerNode = wf.nodes.find(n => n.type === 'trigger');
        return wf.isActive && triggerNode && triggerNode.data.nodeType === eventType;
    });
     for (const workflow of matchingAdvanced) {
        await executeAdvancedActions(workflow, payload);
    }


    if (matchingSimple.length === 0 && matchingAdvanced.length === 0) {
        logs.push(`[Workflow Engine] No matching active workflows found.`);
    }

    logs.push(`[Workflow Engine] Finished processing event.`);
    return [...logs];
}