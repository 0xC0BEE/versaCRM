import { AnyContact, Deal, Ticket } from '../types';

export const replacePlaceholders = (template: string, contact: AnyContact, deal?: Deal, ticket?: Ticket): string => {
    let result = template
        .replace(/\{\{contactName\}\}/g, contact.contactName)
        .replace(/\{\{contactEmail\}\}/g, contact.email)
        .replace(/\{\{contactId\}\}/g, contact.id)
        .replace(/\{\{contactStatus\}\}/g, contact.status);

    if (deal) {
        result = result
            .replace(/\{\{dealName\}\}/g, deal.name)
            .replace(/\{\{dealValue\}\}/g, String(deal.value));
    }
    if (ticket) {
        result = result
            .replace(/\{\{ticketSubject\}\}/g, ticket.subject)
            .replace(/\{\{ticketStatus\}\}/g, ticket.status)
            .replace(/\{\{ticketPriority\}\}/g, ticket.priority);
    }
    return result;
};
