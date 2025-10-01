import { AnyContact, Workflow, EmailTemplate, ContactStatus, Interaction, Task } from '../types';

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

interface TriggerPayload {
    event: 'contactCreated' | 'contactStatusChanged';
    contact: AnyContact;
    fromStatus?: ContactStatus;
    toStatus?: ContactStatus;
    dependencies: WorkflowDependencies;
}

const replacePlaceholders = (template: string, contact: AnyContact): string => {
    return template
        .replace(/\{\{contactName\}\}/g, contact.contactName)
        .replace(/\{\{contactEmail\}\}/g, contact.email)
        .replace(/\{\{contactId\}\}/g, contact.id)
        .replace(/\{\{contactStatus\}\}/g, contact.status);
};

export const checkAndTriggerWorkflows = (payload: TriggerPayload) => {
    const { event, contact, fromStatus, toStatus, dependencies } = payload;
    const { workflows } = dependencies;

    console.log(`Checking workflows for event: ${event}`);

    const matchingWorkflows = workflows.filter(workflow => {
        if (!workflow.isActive) return false;

        if (workflow.trigger.type === 'contactCreated' && event === 'contactCreated') {
            return true;
        }

        if (workflow.trigger.type === 'contactStatusChanged' && event === 'contactStatusChanged') {
            const trigger = workflow.trigger;
            // If trigger specifies from/to, match it. Otherwise, any status change matches.
            const fromMatch = !trigger.fromStatus || trigger.fromStatus === fromStatus;
            const toMatch = !trigger.toStatus || trigger.toStatus === toStatus;
            return fromMatch && toMatch;
        }

        return false;
    });

    console.log(`Found ${matchingWorkflows.length} matching workflows.`);

    matchingWorkflows.forEach(workflow => {
        executeWorkflowActions(workflow, contact, dependencies);
    });
};

const executeWorkflowActions = (workflow: Workflow, contact: AnyContact, dependencies: WorkflowDependencies) => {
    console.log(`Executing actions for workflow: ${workflow.name}`);
    let updatedContact = { ...contact };

    workflow.actions.forEach(async action => {
        if (action.type === 'createTask') {
            if (action.taskTitle && action.assigneeId) {
                dependencies.createTask({
                    title: replacePlaceholders(action.taskTitle, contact),
                    dueDate: new Date().toISOString(),
                    userId: action.assigneeId,
                    contactId: contact.id,
                    organizationId: contact.organizationId,
                });
                console.log(`Action: Created task "${action.taskTitle}"`);
            }
        } else if (action.type === 'sendEmail') {
            if (action.emailTemplateId) {
                const template = dependencies.emailTemplates.find(t => t.id === action.emailTemplateId);
                if (template) {
                    const body = template.body
                        .replace('{{contactName}}', contact.contactName)
                        .replace('{{userName}}', 'System'); // Assuming system sends it
                    
                    dependencies.createInteraction({
                        contactId: contact.id,
                        organizationId: contact.organizationId,
                        userId: 'system', // Indicates an automated action
                        type: 'Email',
                        date: new Date().toISOString(),
                        notes: `Subject: ${template.subject}\n\n${body}`,
                    });
                    console.log(`Action: Sent email using template "${template.name}"`);
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
            }
        } else if (action.type === 'sendWebhook') {
            if (action.webhookUrl && action.payloadTemplate) {
                const payload = replacePlaceholders(action.payloadTemplate, contact);
                try {
                    console.log(`Action: Sending webhook to ${action.webhookUrl}`);
                    const response = await fetch(action.webhookUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: payload,
                    });
                    if (response.ok) {
                        console.log(`Webhook sent successfully. Status: ${response.status}`);
                    } else {
                        console.error(`Webhook failed with status: ${response.status}`);
                    }
                } catch (error) {
                    console.error('Error sending webhook:', error);
                }
            }
        }
    });
};