import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardWidget as WidgetType, CustomReport } from '../../types';
import Card from '../ui/Card';
import { useData } from '../../contexts/DataContext';
// FIX: Corrected import path for apiClient.
import apiClient from '../../services/apiClient';
import { processReportData } from '../../utils/reportProcessor';
import CustomReportDataTable from '../reports/CustomReportDataTable';
import CustomReportChart from '../reports/CustomReportChart';
import { Loader, AlertTriangle, Trash2, Edit } from 'lucide-react';
import Button from '../ui/Button';
import { useApp } from '../../contexts/AppContext';

interface DashboardWidgetProps {
    widget: WidgetType;
    isEditMode: boolean;
    onRemove: (widgetId: string) => void;
}

const DashboardWidget: React.FC<DashboardWidgetProps> = ({ widget, isEditMode, onRemove }) => {
    const { customReportsQuery } = useData();
    const { data: customReports = [] } = customReportsQuery;
    const { setCurrentPage, setReportToEditId } = useApp();

    const report = useMemo(() => {
        return (customReports as CustomReport[]).find(r => r.id === widget.reportId);
    }, [customReports, widget.reportId]);
    
    const { data: reportData, isLoading, isError } = useQuery({
        queryKey: ['customReportData', widget.reportId],
        queryFn: () => apiClient.generateCustomReport(report!.config, report!.organizationId),
        enabled: !!report,
    });
    
    const handleEdit = () => {
        if (report) {
            setReportToEditId(report.id);
            setCurrentPage('Reports');
        }
    }

    if (!report) {
        return (
            <Card className="h-full">
                <div className="text-center p-8 text-error flex flex-col items-center justify-center h-full">
                    <AlertTriangle className="mx-auto h-8 w-8" />
                    <p className="mt-2 text-sm">Associated report not found.</p>
                     {isEditMode && (
                        <Button size="sm" variant="danger" className="mt-2" onClick={() => onRemove(widget.widgetId)} leftIcon={<Trash2 size={14} />}>
                            Remove
                        </Button>
                     )}
                </div>
            </Card>
        );
    }
    
    const chartData = reportData && report.config.visualization.type !== 'table' 
        ? processReportData(reportData, report.config.visualization)
        : [];

    return (
        <Card title={report.name} className="h-full flex flex-col">
             {isEditMode && (
                <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                    <Button size="sm" variant="secondary" className="p-1.5 h-auto" onClick={handleEdit}>
                        <Edit size={14} />
                    </Button>
                    <Button size="sm" variant="secondary" className="p-1.5 h-auto" onClick={() => onRemove(widget.widgetId)}>
                        <Trash2 size={14} />
                    </Button>
                </div>
             )}
            {isLoading && (
                <div className="h-full flex-grow flex items-center justify-center text-text-secondary">
                    <Loader className="animate-spin mr-2" /> Loading data...
                </div>
            )}
            {isError && (
                 <div className="h-full flex-grow flex items-center justify-center text-error">
                    <AlertTriangle className="mr-2" /> Error loading.
                </div>
            )}
            {reportData && (
                <div className="flex-grow h-full">
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