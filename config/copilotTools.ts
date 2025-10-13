import { FunctionDeclaration, Type } from '@google/genai';

export const findDealsTool: FunctionDeclaration = {
  name: 'findDeals',
  description: 'Finds deals in the CRM based on specified criteria.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      minValue: {
        type: Type.NUMBER,
        description: 'The minimum value of the deals to find.',
      },
      maxValue: {
        type: Type.NUMBER,
        description: 'The maximum value of the deals to find.',
      },
      stageName: {
        type: Type.STRING,
        description: 'The name of the stage the deals are in (e.g., "Qualification", "Proposal Sent", "Won").',
      },
    },
  },
};

export const findContactsTool: FunctionDeclaration = {
  name: 'findContacts',
  description: 'Finds contacts in the CRM based on their status or lead source.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      status: {
        type: Type.STRING,
        description: 'The status of the contacts to find (e.g., "Lead", "Active", "Inactive").',
      },
      leadSource: {
        type: Type.STRING,
        description: 'The source where the lead originated from (e.g., "Web", "Referral").',
      },
    },
  },
};

export const summarizeTicketsTool: FunctionDeclaration = {
    name: 'summarizeTickets',
    description: 'Provides a summary of support tickets, often grouped by a certain property like priority.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            groupBy: {
                type: Type.STRING,
                description: 'The field to group tickets by for summarization (e.g., "priority", "status").',
            },
        },
        required: ['groupBy'],
    },
};

export const copilotTools: FunctionDeclaration[] = [
  findDealsTool,
  findContactsTool,
  summarizeTicketsTool,
];
