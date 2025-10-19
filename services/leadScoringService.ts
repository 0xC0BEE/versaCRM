import { MOCK_CONTACTS_MUTABLE, MOCK_ORGANIZATION_SETTINGS } from './mockData';
import { AnyContact, LeadScoringRule } from '../types';

function calculateLeadScore(contact: AnyContact, rules: LeadScoringRule[]): number {
    const model = MOCK_ORGANIZATION_SETTINGS.aiLeadScoringModel;

    // Use AI model if trained, otherwise fall back to manual rules
    if (model && model.status === 'trained') {
        let score = 0;
        const contactDataString = `${contact.leadSource} ${contact.status}`.toLowerCase();
        
        model.positiveFactors.forEach(factor => {
            if (contactDataString.includes(factor.toLowerCase())) {
                score += 10;
            }
        });
        model.negativeFactors.forEach(factor => {
            if (contactDataString.includes(factor.toLowerCase())) {
                score -= 5;
            }
        });
        return score;
    }

    // Fallback to manual rules
    let score = 0;
    (contact.interactions || []).forEach(interaction => {
        const rule = rules.find(r => r.event === 'interaction' && r.interactionType === interaction.type);
        if (rule) score += rule.points;
    });
    const statusRule = rules.find(r => r.event === 'status_change' && r.status === contact.status);
    if (statusRule) score += statusRule.points;
    
    return score;
}

export const recalculateScoreForContact = (contactId: string): void => {
    const contactIndex = MOCK_CONTACTS_MUTABLE.findIndex(c => c.id === contactId);
    if (contactIndex === -1) {
        console.warn(`[LeadScoring] Contact ${contactId} not found for score recalculation.`);
        return;
    }
    
    const contact = MOCK_CONTACTS_MUTABLE[contactIndex];
    const rules = MOCK_ORGANIZATION_SETTINGS.leadScoringRules;
    
    const newScore = calculateLeadScore(contact, rules);
    
    if (contact.leadScore !== newScore) {
        console.log(`[LeadScoring] Updating score for ${contact.contactName} from ${contact.leadScore || 0} to ${newScore}.`);
        MOCK_CONTACTS_MUTABLE[contactIndex].leadScore = newScore;
    }
};

export const recalculateAllScores = (organizationId: string): void => {
    console.log(`[LeadScoring] Recalculating scores for all contacts in org ${organizationId}.`);
    MOCK_CONTACTS_MUTABLE.forEach(contact => {
        if (contact.organizationId === organizationId) {
            recalculateScoreForContact(contact.id);
        }
    });
};