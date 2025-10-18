import { FeatureFlag } from '../types';

export const featureFlags: FeatureFlag[] = [
    {
        id: 'aiContentStudio',
        name: 'AI Content Studio',
        description: 'Enables the AI-powered content generation modal for creating marketing emails and landing page copy.',
        isEnabled: false, // Default to off
    },
    {
        id: 'aiCopilotProactive',
        name: 'AI Co-pilot Proactive Suggestions',
        description: 'Allows the dashboard co-pilot to automatically generate suggested questions on load.',
        isEnabled: false,
    },
    {
        id: 'aiPredictiveForecasting',
        name: 'AI Predictive Forecasting (Deals & Churn)',
        description: 'Enables the AI Forecast button on the Deals pipeline and the AI Churn Risk on the Contacts page.',
        isEnabled: false,
    },
    {
        id: 'aiNextBestAction',
        name: 'AI Next Best Action Suggestions',
        description: 'Enables the AI-powered "Next Best Action" suggestions on contact detail views.',
        isEnabled: false,
    },
    {
        id: 'aiRecordLinking',
        name: 'AI Record Linking Suggestions',
        description: 'Enables AI-powered suggestions for linking Deals and Tickets to Custom Object records.',
        isEnabled: false,
    },
    {
        id: 'aiReplySuggestions',
        name: 'AI Reply Suggestions',
        description: 'Enables AI-powered one-click reply suggestions in the Unified Inbox.',
        isEnabled: false,
    },
    {
        id: 'aiProcessOptimization',
        name: 'AI Process Optimization',
        description: 'Enables the AI-powered process mining and workflow suggestion feature on the Workflows page.',
        isEnabled: false,
    },
    {
        id: 'aiDataHygiene',
        name: 'AI Data Hygiene',
        description: 'Enables the AI-powered tool for detecting duplicates and formatting issues in contacts.',
        isEnabled: false,
    },
    {
        id: 'aiProductDataHygiene',
        name: 'AI Product Data Hygiene',
        description: 'Enables the AI-powered tool for detecting duplicates and formatting issues in inventory products.',
        isEnabled: false,
    }
];