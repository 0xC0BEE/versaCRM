// FIX: Corrected import path for mockData.
import { MOCK_CONTACTS_MUTABLE, MOCK_ORGANIZATION_SETTINGS } from './mockData';
import { AnyContact, LeadScoringRule } from '../types';

function calculateLeadScore(contact: AnyContact, rules: LeadScoringRule[]): number {
    let score = 0;
    
    // Score based on interactions
    (contact.interactions || []).forEach(interaction => {
        const rule = rules.find(r => r.event === 'interaction' && r.interactionType === interaction.type);
        if (rule) score += rule.points;
    });

    // Score based on current status from the contact object itself
    const statusRule = rules.find(r => r.event === 'status_change' && r.status === contact.status);
    if (statusRule) score += statusRule.points;
    
    // A better approach for status changes might be to look at audit logs,
    // but for simplicity and performance, scoring the current status is effective.
    // If a status changes from A to B, the old score from A is implicitly removed
    // and the new score for B is added during recalculation.

    return score;
}

export const recalculateScoreForContact = (contactId: string): void => {
    const contactIndex = MOCK_CONTACTS_MUTABLE.findIndex(c => c.id === contactId);
    if (contactIndex === -1) {
        console.warn(`[LeadScoring] Contact ${contactId} not found for score recalculation.`);
        return;
    }
    
    const contact = MOCK_CONTACTS_MUTABLE[contactIndex];
    const rules = MOCK_ORGANIZATION_SETTINGS.leadScoringRules; // In a real app, fetch this per-org
    
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