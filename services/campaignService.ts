import {
  MOCK_CAMPAIGNS,
  MOCK_CONTACTS_MUTABLE,
} from './mockData';
import { Campaign, CampaignEnrollment, AnyContact, CampaignTargetAudience } from '../types';

function matchesAudience(contact: AnyContact, audience: CampaignTargetAudience): boolean {
    if (!audience) return true;

    const statusMatch = !audience.status || contact.status === audience.status;
    
    let scoreMatch = true;
    if (audience.leadScore) {
        const score = contact.leadScore || 0;
        const { operator, value } = audience.leadScore;
        switch(operator) {
            case 'gt': scoreMatch = score > value; break;
            case 'lt': scoreMatch = score < value; break;
            case 'eq': scoreMatch = score === value; break;
            default: scoreMatch = false;
        }
    }

    return statusMatch && scoreMatch;
}


export const campaignService = {
    checkAndEnrollInCampaigns: (contact: AnyContact) => {
        const activeCampaigns = MOCK_CAMPAIGNS.filter(c => c.status === 'Active');

        for (const campaign of activeCampaigns) {
            if (matchesAudience(contact, campaign.targetAudience)) {
                 const alreadyEnrolled = (contact.campaignEnrollments || []).some(e => e.campaignId === campaign.id);
                 if (!alreadyEnrolled) {
                    const triggerNode = campaign.nodes.find(n => n.type === 'journeyTrigger');
                    if (!triggerNode) {
                        console.error(`[CampaignService] Campaign "${campaign.name}" is missing a trigger node.`);
                        continue;
                    }
                     const enrollment: CampaignEnrollment = {
                        id: `enroll_${Date.now()}`,
                        campaignId: campaign.id,
                        contactId: contact.id,
                        currentNodeId: triggerNode.id,
                        waitUntil: new Date().toISOString(),
                    };
                    if (!contact.campaignEnrollments) contact.campaignEnrollments = [];
                    contact.campaignEnrollments.push(enrollment);
                    
                    const campaignToUpdate = MOCK_CAMPAIGNS.find(c => c.id === campaign.id);
                    if (campaignToUpdate) campaignToUpdate.stats.recipients++;

                    console.log(`[CampaignService] Auto-enrolled new contact ${contact.id} into "${campaign.name}".`);
                 }
            }
        }
    },
    
    enrollContacts: (campaignId: string): void => {
        const campaign = MOCK_CAMPAIGNS.find(c => c.id === campaignId);
        if (!campaign) {
            console.error(`[CampaignService] Campaign ${campaignId} not found.`);
            return;
        }
        
        const triggerNode = campaign.nodes.find(n => n.type === 'journeyTrigger');
        if (!triggerNode) {
            console.error(`[CampaignService] Campaign "${campaign.name}" is missing a trigger node.`);
            return;
        }
        
        const contactsToEnroll = MOCK_CONTACTS_MUTABLE.filter(contact => {
            const matches = matchesAudience(contact, campaign.targetAudience);
            const notEnrolled = !(contact.campaignEnrollments || []).some(e => e.campaignId === campaign.id);
            return matches && notEnrolled;
        });

        console.log(`[CampaignService] Enrolling ${contactsToEnroll.length} contacts into campaign "${campaign.name}".`);

        contactsToEnroll.forEach(contact => {
            const enrollment: CampaignEnrollment = {
                id: `enroll_${Date.now()}_${contact.id}`,
                campaignId: campaign.id,
                contactId: contact.id,
                currentNodeId: triggerNode.id,
                waitUntil: new Date().toISOString(),
            };
            if (!contact.campaignEnrollments) {
                contact.campaignEnrollments = [];
            }
            contact.campaignEnrollments.push(enrollment);
        });

        const campaignIndex = MOCK_CAMPAIGNS.findIndex(c => c.id === campaignId);
        if(campaignIndex > -1) {
            MOCK_CAMPAIGNS[campaignIndex].status = 'Active';
            MOCK_CAMPAIGNS[campaignIndex].stats.recipients = contactsToEnroll.length;
        }
    },
};
