import React from 'react';
import { ProcessedChartData } from '../../utils/reportProcessor';
import DynamicChart from '../dashboard/DynamicChart';

interface CustomReportChartProps {
    data: ProcessedChartData[];
    visualizationType: 'bar' | 'line' | 'pie';
}

const CustomReportChart: React.FC<CustomReportChartProps> = ({ data, visualizationType }) => {
    // This component acts as a simple wrapper to pass processed data to our existing DynamicChart component.
    return <DynamicChart type={visualizationType} data={data} />;
};

export default CustomReportChart;
