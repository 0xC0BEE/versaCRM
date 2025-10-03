// This utility processes raw data from a custom report into a format suitable for charting.

// FIX: Corrected import path for types.
import { ReportVisualization } from '../types';

export interface ProcessedChartData {
    name: string;
    value: number;
}

/**
 * Groups and aggregates raw data based on the visualization configuration.
 * @param rawData The array of raw data objects from the report query.
 * @param visualization The visualization configuration object.
 * @returns An array of objects formatted for use with recharts ({ name, value }).
 */
export const processReportData = (rawData: any[], visualization: ReportVisualization): ProcessedChartData[] => {
    // A chart must have a dimension to group by.
    if (!visualization.groupByKey) return [];

    const groupedData: Record<string, any[]> = rawData.reduce((acc, item) => {
        const key = item[visualization.groupByKey!] ?? 'Uncategorized';
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(item);
        return acc;
    }, {});
    
    const chartData: ProcessedChartData[] = Object.entries(groupedData).map(([name, group]) => {
        let value = 0;
        switch (visualization.metric.type) {
            case 'count':
                value = group.length;
                break;
            case 'sum':
                if (visualization.metric.column) {
                    value = group.reduce((sum, item) => sum + (Number(item[visualization.metric.column!]) || 0), 0);
                }
                break;
            case 'average':
                 if (visualization.metric.column && group.length > 0) {
                    const sum = group.reduce((sum, item) => sum + (Number(item[visualization.metric.column!]) || 0), 0);
                    value = sum / group.length;
                }
                break;
        }
        return { name, value };
    });
    
    // Sort by value descending for better chart readability
    return chartData.sort((a,b) => b.value - a.value);
};