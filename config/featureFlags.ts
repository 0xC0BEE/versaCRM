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
    }
];
