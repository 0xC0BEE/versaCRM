import { AnyContact, Deal, Ticket } from '../types';

// Helper function to get a nested property from an object using a string path
const getProperty = (obj: any, path: string): any => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

export const replacePlaceholders = (template: string, ...dataSources: any[]): string => {
    if (!template) return '';

    return template.replace(/\{\{(.*?)\}\}/g, (match, key) => {
        const path = key.trim();
        for (const source of dataSources) {
            if (!source) continue;
            
            const value = getProperty(source, path);
            
            if (value !== undefined && value !== null) {
                // Basic currency formatting for 'value' or 'price' fields
                if (typeof value === 'number' && (path.includes('value') || path.includes('price'))) {
                    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
                }
                return String(value);
            }
        }
        return match; // Return the original placeholder if no value is found
    });
};
