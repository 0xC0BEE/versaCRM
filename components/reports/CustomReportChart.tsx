import React from 'react';
import { ProcessedChartData } from '../../utils/reportProcessor';
import DynamicChart from '../dashboard/DynamicChart';

interface CustomReportChartProps {
    data: ProcessedChartData[];
    visualizationType: 'bar' | 'line' | 'pie';
    title: string;
    onSegmentClick?: (payload: any) => void;
}

const CustomReportChart: React.FC<CustomReportChartProps> = ({ data, visualizationType, title, onSegmentClick }) => {
    // This component acts as a simple wrapper to pass processed data to our existing DynamicChart component.
    return <DynamicChart type={visualizationType} data={data} title={title} onSegmentClick={onSegmentClick} />;
};

export default CustomReportChart;