

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
// FIX: Corrected import path for types.
import { DashboardWidget as WidgetType } from '../../types';
import Card from '../ui/Card';
// FIX: Corrected import path for DataContext.
import { useData } from '../../contexts/DataContext';
import apiClient from '../../services/apiClient';
import { processReportData } from '../../utils/reportProcessor';
import CustomReportDataTable from '../reports/CustomReportDataTable';
import CustomReportChart from '../reports/CustomReportChart';
import { Loader, AlertTriangle, Trash2 } from 'lucide-react';
import Button from '../ui/Button';

interface DashboardWidgetProps {
    widget: WidgetType;
}

const DashboardWidget: React.FC<DashboardWidgetProps> = ({ widget }) => {
    const { customReportsQuery, removeDashboardWidgetMutation } = useData();
    const { data: customReports = [] } = customReportsQuery;

    const report = useMemo(() => {
        return customReports.find(r => r.id === widget.reportId);
    }, [customReports, widget.reportId]);
    
    const { data: reportData, isLoading, isError } = useQuery({
        queryKey: ['customReportData', widget.reportId],
        queryFn: () => apiClient.generateCustomReport(report!.config, report!.organizationId),
        enabled: !!report,
    });
    
    const handleRemove = () => {
        if (window.confirm(`Are you sure you want to remove this widget from your dashboard?`)) {
            removeDashboardWidgetMutation.mutate(widget.id);
        }
    }

    if (!report) {
        return (
            <Card>
                <div className="text-center p-8 text-red-500">
                    <AlertTriangle className="mx-auto h-8 w-8" />
                    <p className="mt-2 text-sm">Associated report not found. It may have been deleted.</p>
                     <Button size="sm" variant="danger" className="mt-2" onClick={handleRemove} leftIcon={<Trash2 size={14} />}>Remove Widget</Button>
                </div>
            </Card>
        );
    }
    
    const chartData = reportData && report.config.visualization.type !== 'table' 
        ? processReportData(reportData, report.config.visualization)
        : [];

    return (
        <Card title={report.name}>
             <Button size="sm" variant="secondary" className="absolute top-4 right-4" onClick={handleRemove} disabled={removeDashboardWidgetMutation.isPending}>
                <Trash2 size={14} />
            </Button>
            {isLoading && (
                <div className="h-64 flex items-center justify-center text-gray-500">
                    <Loader className="animate-spin mr-2" /> Loading data...
                </div>
            )}
            {isError && (
                 <div className="h-64 flex items-center justify-center text-red-500">
                    <AlertTriangle className="mr-2" /> Could not load report data.
                </div>
            )}
            {reportData && (
                <div>
                    {report.config.visualization.type === 'table' ? (
                        <CustomReportDataTable data={reportData} />
                    ) : (
                        <CustomReportChart data={chartData} visualizationType={report.config.visualization.type} />
                    )}
                </div>
            )}
        </Card>
    );
};

export default DashboardWidget;