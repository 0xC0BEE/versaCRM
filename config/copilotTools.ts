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

export const createTaskTool: FunctionDeclaration = {
  name: 'createTask',
  description: 'Creates a new task and assigns it to the current user. Use this for reminders or to-do items related to a contact.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: 'The title of the task.',
      },
      dueDate: {
        type: Type.STRING,
        description: 'The due date for the task in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ). Use the current date and user prompts like "tomorrow" or "next week" to calculate this.',
      },
      contactName: {
        type: Type.STRING,
        description: 'The full name of the contact the task is related to.',
      },
    },
    required: ['title', 'dueDate', 'contactName'],
  },
};

export const generateChartTool: FunctionDeclaration = {
  name: 'generateChart',
  description: 'Generates a chart or data table from CRM data to answer analytical questions. Use this when the user asks to "show", "list", "summarize", "count", or "chart" data like contacts, deals, or tickets.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      chartType: {
        type: Type.STRING,
        description: 'The type of chart to generate. Use "table" for lists or detailed data. Use "bar", "pie", or "line" for visualizations.',
        enum: ['bar', 'pie', 'line', 'table'],
      },
      dataSource: {
        type: Type.STRING,
        description: 'The primary data source for the chart (e.g., "contacts", "deals", "tickets").',
        enum: ['contacts', 'deals', 'tickets'],
      },
      metric: {
        type: Type.STRING,
        description: 'The aggregation metric to calculate (e.g., "count", "sum", "average"). Required for bar, pie, and line charts.',
        enum: ['count', 'sum', 'average'],
      },
      metricColumn: {
        type: Type.STRING,
        description: 'The column to perform the metric on (required for "sum" and "average"). E.g., for "sum of deal values", this would be "value".',
      },
      groupBy: {
        type: Type.STRING,
        description: 'The column to group the data by for the chart\'s labels/categories. E.g., for "deals by stage", this would be "stageId". Required for bar, pie, and line charts.',
      },
      columns: {
        type: Type.ARRAY,
        description: 'An array of column names to display. Primarily used for "table" chartType.',
        items: { type: Type.STRING }
      },
      filters: {
        type: Type.ARRAY,
        description: 'An array of filter conditions to apply to the data source before aggregation.',
        items: {
          type: Type.OBJECT,
          properties: {
            field: { type: Type.STRING, description: 'The field to filter on.' },
            operator: { type: Type.STRING, description: 'The filter operator (e.g., "is", "gt", "lt", "contains").' },
            value: { type: Type.STRING, description: 'The value to filter against.' },
          },
        },
      },
    },
    required: ['chartType', 'dataSource'],
  },
};


export const copilotTools: FunctionDeclaration[] = [
  findDealsTool,
  findContactsTool,
  summarizeTicketsTool,
  createTaskTool,
  generateChartTool,
];