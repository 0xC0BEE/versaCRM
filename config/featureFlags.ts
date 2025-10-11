import { FeatureFlag } from '../types';

export const featureFlags: FeatureFlag[] = [
    {
        id: 'aiContentStudio',
        name: 'AI Content Studio',
        description: 'Enables the AI-powered content generation modal for creating marketing emails and landing page copy.',
        isEnabled: false, // Default to off
    },
    // Add other future flags here
];
