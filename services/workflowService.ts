// FIX: Corrected import path for types.
import { AnyContact, Workflow, EmailTemplate, ContactStatus, Interaction, Task, WorkflowTrigger, Deal, Ticket } from '../types';
import toast from 'react-hot-toast';
import { replacePlaceholders } from '../utils/textUtils';

type CreateTaskFn = (task: Omit<Task, 'id' | 'isCompleted'>) => void;
type CreateInteractionFn = (interaction: Omit<Interaction, 'id'>) => void;
type UpdateContactFn = (contact: AnyContact) => void;


interface WorkflowDependencies {
    workflows: Workflow[];
    emailTemplates: EmailTemplate[];
    createTask: CreateTaskFn;
    createInteraction: CreateInteractionFn;
    updateContact: UpdateContactFn;
}

export interface TriggerPayload {
    event: WorkflowTrigger['type'];
    contact: AnyContact; // The contact associated with the event, for actions
    deal?: Deal;
    ticket?: Ticket;
    from?: any; // fromStatus, fromStageId, etc.
    to?: any;   // toStatus, toStageId, etc.
    dependencies: WorkflowDependencies;
}

export const checkAndTriggerWorkflows = (payload: TriggerPayload) => {
    const { event, contact, deal, ticket, from, to, dependencies } = payload;
    const { workflows } = dependencies;

    console.log(`Checking workflows for event: ${event}`);

    const matchingWorkflows = workflows.filter(workflow => {
        if (!workflow.isActive) return false;

        const trigger = workflow.trigger;
        if (trigger.type !== event) return false;

        switch (trigger.type) {
            case 'contactCreated':
                return true;
            case 'contactStatusChanged':
                const fromMatch = !trigger.fromStatus || trigger.fromStatus === from;
                const toMatch = !trigger.toStatus || trigger.toStatus === to;
                return fromMatch && toMatch;
            case 'dealStageChanged':
                const fromStageMatch = !trigger.fromStageId || trigger.fromStageId === from;
                const toStageMatch = !trigger.toStageId || trigger.toStageId === to;
                return fromStageMatch && toStageMatch;
            case 'ticketCreated':
                return true;
            case 'ticketStatusChanged':
                const fromTicketStatusMatch = !trigger.fromStatus || trigger.fromStatus === from;
                const toTicketStatusMatch = !trigger.toStatus || trigger.toStatus === to;
                return fromTicketStatusMatch && toTicketStatusMatch;
            default:
                return false;
        }
    });


    console.log(`Found ${matchingWorkflows.length} matching workflows.`);

    matchingWorkflows.forEach(workflow => {
        executeWorkflowActions(workflow, contact, deal, ticket, dependencies);
    });
};

const executeWorkflowActions = (workflow: Workflow, contact: AnyContact, deal: Deal | undefined, ticket: Ticket | undefined, dependencies: WorkflowDependencies) => {
    console.log(`Executing actions for workflow: ${workflow.name}`);
    let updatedContact = { ...contact };

    // This executes actions sequentially. In a real system with delays, this would be a message queue.
    // For our simulation, we process them instantly.
    workflow.actions.forEach(async action => {
        if (action.type === 'createTask') {
            if (action.taskTitle && action.assigneeId) {
                dependencies.createTask({
                    title: replacePlaceholders(action.taskTitle, contact, deal, ticket),
                    dueDate: new Date().toISOString(),
                    userId: action.assigneeId,
                    contactId: contact.id,
                    organizationId: contact.organizationId,
                });
                console.log(`Action: Created task "${action.taskTitle}"`);
                toast.success(`Workflow "${workflow.name}" triggered: Task created.`);
            }
        } else if (action.type === 'sendEmail') {
            if (action.emailTemplateId) {
                const template = dependencies.emailTemplates.find(t => t.id === action.emailTemplateId);
                if (template) {
                    const body = replacePlaceholders(template.body, contact, deal, ticket)
                        .replace('{{userName}}', 'System'); // Assuming system sends it
                    
                    dependencies.createInteraction({
                        contactId: contact.id,
                        organizationId: contact.organizationId,
                        userId: 'system', // Indicates an automated action
                        type: 'Email',
                        date: new Date().toISOString(),
                        notes: `Subject: ${replacePlaceholders(template.subject, contact, deal, ticket)}\n\n${body}`,
                    });
                    console.log(`Action: Sent email using template "${template.name}"`);
                    toast.success(`Workflow "${workflow.name}" triggered: Email sent.`);
                }
            }
        } else if (action.type === 'updateContactField') {
            if (action.fieldId && action.newValue !== undefined) {
                const newCustomFields = {
                    ...updatedContact.customFields,
                    [action.fieldId]: action.newValue,
                };
                updatedContact = { ...updatedContact, customFields: newCustomFields };
                dependencies.updateContact(updatedContact);
                console.log(`Action: Updated field "${action.fieldId}" to "${action.newValue}"`);
                toast.success(`Workflow "${workflow.name}" triggered: Contact field updated.`);
            }
        } else if (action.type === 'wait') {
            console.log(`Action: Waiting for ${action.days} days...`);
            toast.success(`Workflow "${workflow.name}" has started a ${action.days}-day wait period.`);
            // In a real system, this would queue the *next* action to run after the delay.
            // For our mock, we just log it and proceed instantly for demonstration.
        } else if (action.type === 'sendWebhook') {
            if (action.webhookUrl && action.payloadTemplate) {
                const payload = replacePlaceholders(action.payloadTemplate, contact, deal, ticket);
                try {
                    console.log(`Action: Sending webhook to ${action.webhookUrl}`);
                    const response = await fetch(action.webhookUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: payload,
                    });
                    if (response.ok) {
                        console.log(`Webhook sent successfully. Status: ${response.status}`);
                        toast.success(`Workflow "${workflow.name}" triggered: Webhook sent.`);
                    } else {
                        console.error(`Webhook failed with status: ${response.status}`);
                        toast.error(`Workflow "${workflow.name}" webhook failed.`);
                    }
                } catch (error) {
                    console.error('Error sending webhook:', error);
                    toast.error(`Workflow "${workflow.name}" webhook failed.`);
                }
            }
        }
    });
};