
import {
    AnyContact, Workflow, AdvancedWorkflow, Task, User, ReactFlowNode, Deal, ContactStatus, ReactFlowEdge
} from '../types';
import {
    MOCK_WORKFLOWS, MOCK_ADVANCED_WORKFLOWS, MOCK_TASKS, MOCK_USERS
} from './mockData';
import { replacePlaceholders } from '../utils/textUtils';
// FIX: Import Node and Edge to use for casting.
import { Node, Edge } from 'reactflow';

export type EventType = 'contactCreated' | 'contactStatusChanged' | 'dealCreated' | 'dealStageChanged';

interface EventPayload {
    contact: AnyContact;
    oldContact?: AnyContact;
    deal?: Deal;
    oldDeal?: Deal;
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

        return true;
    });

    if(relevantWorkflows.length > 0) {
        logs.push(`[INFO] Found ${relevantWorkflows.length} matching simple workflows.`);
    }

    relevantWorkflows.forEach(wf => {
        logs.push(`[EXEC] Running simple workflow: '${wf.name}'`);
        wf.actions.forEach(action => {
            switch (action.type) {
                case 'createTask':
                    const title = replacePlaceholders(action.taskTitle || 'New Task', payload.contact, payload.deal);
                    const newTask: Task = {
                        id: `task_wf_${Date.now()}`,
                        organizationId: wf.organizationId,
                        title,
                        dueDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
                        isCompleted: false,
                        userId: action.assigneeId || MOCK_USERS.find(u => u.organizationId === wf.organizationId && u.role === 'Team Member')?.id || '',
                        contactId: payload.contact.id,
                    };
                    MOCK_TASKS.push(newTask);
                    logs.push(`  - Action [Create Task]: Created task '${title}'`);
                    break;
                case 'sendEmail':
                    logs.push(`  - Action [Send Email]: (Simulated) Sent email using template ID ${action.emailTemplateId}`);
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
        case 'createTask':
            const title = replacePlaceholders(rfn.data.taskTitle || 'New Task', payload.contact, payload.deal);
            const newTask: Task = {
                id: `task_wf_${Date.now()}_${Math.random()}`,
                organizationId: organizationId,
                title,
                dueDate: new Date(Date.now() + 86400000).toISOString(),
                isCompleted: false,
                userId: rfn.data.assigneeId || MOCK_USERS.find(u => u.organizationId === organizationId && u.role === 'Team Member')?.id || '',
                contactId: payload.contact.id,
            };
            MOCK_TASKS.push(newTask);
            logs.push(`    - SUCCESS: Created task '${title}'`);
            break;
        case 'sendEmail':
            logs.push(`    - SUCCESS: (Simulated) Sent email using template ID ${rfn.data.emailTemplateId}`);
            break;
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
