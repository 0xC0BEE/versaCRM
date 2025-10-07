import { MOCK_CAMPAIGNS, MOCK_CONTACTS_MUTABLE, MOCK_EMAIL_TEMPLATES, MOCK_TASKS, MOCK_USERS } from './mockData';
import { AnyContact, Campaign, CampaignEnrollment, Edge, Interaction, Node, Task } from '../types';
import { replacePlaceholders } from '../utils/textUtils';
import { addDays } from 'date-fns';

async function executeJourneyAction(node: Node, contact: AnyContact, campaign: Campaign): Promise<string | null> {
    await new Promise(res => setTimeout(res, 50)); // Simulate async action

    console.log(`[Scheduler] Executing action "${node.data.nodeType}" for contact ${contact.id} in campaign "${campaign.name}"`);

    switch (node.data.nodeType) {
        case 'sendEmail': {
            const template = MOCK_EMAIL_TEMPLATES.find(t => t.id === node.data.emailTemplateId);
            const user = MOCK_USERS[0]; // Assume a generic sender
            if (template && contact) {
                const subject = replacePlaceholders(template.subject, contact);
                const body = replacePlaceholders(template.body.replace('{{userName}}', user.name), contact);
                const emailInteraction: Interaction = {
                    id: `int_camp_${Date.now()}`,
                    organizationId: contact.organizationId,
                    contactId: contact.id,
                    userId: user.id,
                    type: 'Email',
                    date: new Date().toISOString(),
                    notes: `(Campaign: ${campaign.name})\nSubject: ${subject}\n\n${body}`,
                };
                contact.interactions = [emailInteraction, ...(contact.interactions || [])];
                const campToUpdate = MOCK_CAMPAIGNS.find(c => c.id === campaign.id);
                if (campToUpdate) campToUpdate.stats.sent++;
            }
            break;
        }
        case 'createTask': {
            const taskTitle = replacePlaceholders(node.data.taskTitle || 'Campaign Task', contact);
            const newTask: Omit<Task, 'id' | 'isCompleted'> = {
                organizationId: contact.organizationId,
                userId: MOCK_USERS[1].id, // Assign to admin for now
                title: taskTitle,
                dueDate: addDays(new Date(), 3).toISOString(),
                contactId: contact.id,
            };
            MOCK_TASKS.push({ ...newTask, id: `task_camp_${Date.now()}`, isCompleted: false });
            break;
        }
    }
    const nextEdge = campaign.edges.find(e => e.source === node.id);
    return nextEdge ? nextEdge.target : null;
}

async function evaluateJourneyCondition(node: Node, contact: AnyContact, campaign: Campaign): Promise<string | null> {
    let result = false; // Default to 'false' path
    switch (node.data.nodeType) {
        case 'ifEmailOpened': {
            const lastEmail = (contact.interactions || []).find(i => i.type === 'Email' && i.notes.includes(`Campaign: ${campaign.name}`));
            if (lastEmail) {
                // Mock logic: 50% chance of opening
                result = Math.random() > 0.5;
                if (result) {
                    lastEmail.openedAt = new Date().toISOString();
                    const campToUpdate = MOCK_CAMPAIGNS.find(c => c.id === campaign.id);
                    if (campToUpdate) campToUpdate.stats.opened++;
                    
                    // Mock click logic: 30% chance of click if opened
                    if (Math.random() < 0.3) {
                        lastEmail.clickedAt = new Date(Date.now() + 1000 * 60).toISOString(); // Click a minute later
                        if (campToUpdate) campToUpdate.stats.clicked++;
                    }
                }
            }
            break;
        }
    }
    const nextEdge = campaign.edges.find(e => e.source === node.id && e.sourceHandle === String(result));
    return nextEdge ? nextEdge.target : null;
}

export const campaignSchedulerService = {
    processScheduledCampaigns: (currentDate: Date) => {
        console.log(`[Scheduler] Running for date: ${currentDate.toISOString()}`);
        const contactsWithEnrollments = MOCK_CONTACTS_MUTABLE.filter(c => c.campaignEnrollments && c.campaignEnrollments.length > 0);

        for (const contact of contactsWithEnrollments) {
            for (const enrollment of (contact.campaignEnrollments || [])) {
                
                if (new Date(enrollment.waitUntil) > currentDate) continue; // Not yet time

                const campaign = MOCK_CAMPAIGNS.find(c => c.id === enrollment.campaignId);
                if (!campaign || campaign.status !== 'Active') continue;

                // FIX: Changed 'let' to 'const' to allow TypeScript to correctly infer the non-nullable type within the async closure.
                const currentNode = campaign.nodes.find(n => n.id === enrollment.currentNodeId);
                if (!currentNode) continue;

                (async () => {
                    let nextNodeId: string | null = null;
                    
                    switch (currentNode.type) {
                        case 'journeyTrigger':
                            const nextEdge = campaign.edges.find(e => e.source === currentNode!.id);
                            nextNodeId = nextEdge ? nextEdge.target : null;
                            break;
                        case 'journeyAction':
                            if(currentNode.data.nodeType === 'wait') {
                                // Just find the next node after a wait
                                const nextEdge = campaign.edges.find(e => e.source === currentNode!.id);
                                nextNodeId = nextEdge ? nextEdge.target : null;
                            } else {
                                nextNodeId = await executeJourneyAction(currentNode, contact, campaign);
                            }
                            break;
                        case 'journeyCondition':
                            nextNodeId = await evaluateJourneyCondition(currentNode, contact, campaign);
                            break;
                    }
                    
                    // Now that we have the next node, handle its logic
                    const nextNode = nextNodeId ? campaign.nodes.find(n => n.id === nextNodeId) : null;
                    
                    if (nextNode) {
                        if (nextNode.data.nodeType === 'wait') {
                            const waitDays = nextNode.data.days || 1;
                            enrollment.waitUntil = addDays(currentDate, waitDays).toISOString();
                            enrollment.currentNodeId = nextNodeId!;
                            console.log(`[Scheduler] Contact ${contact.id} is now waiting for ${waitDays} days.`);
                        } else {
                            // It's an action/condition to be executed on the next run
                            enrollment.waitUntil = currentDate.toISOString();
                            enrollment.currentNodeId = nextNodeId!;
                             // Re-run scheduler for immediate actions after a wait
                            this.processScheduledCampaigns(currentDate);
                        }
                    } else {
                        // End of journey, remove enrollment
                        contact.campaignEnrollments = (contact.campaignEnrollments || []).filter(e => e.campaignId !== campaign.id);
                        console.log(`[Scheduler] Contact ${contact.id} completed campaign "${campaign.name}".`);
                    }
                })();
            }
        }
    }
};