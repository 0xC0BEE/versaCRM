

import React, { useState } from 'react';
import PageWrapper from '../layout/PageWrapper';
import Card from '../ui/Card';
// FIX: Corrected the import path for types to be a valid relative path.
import { ReportType, AnyReportData, CustomReport } from '../../types';
// FIX: Corrected the import path for DataContext to be a valid relative path.
import { useData } from '../../contexts/DataContext';
import ReportFilters from './ReportFilters';
import SalesReport from './SalesReport';
import InventoryReport from './InventoryReport';
import FinancialReport from './FinancialReport';
import ContactsReport from './ContactsReport';
import TeamReport from './TeamReport';
import DealsReport from './DealsReport';
import { useQuery } from '@tanstack/react-query';
// FIX: Corrected the import path for apiClient to be a valid relative path.
import apiClient from '../../services/apiClient';
import { useAuth } from '../../contexts/AuthContext';
import { AlertTriangle, BarChart, Download, Plus, Trash2, Eye } from 'lucide-react';
import Button from '../ui/Button';
import { exportToCSV } from '../../utils/export';
import { useApp } from '../../contexts/AppContext';
import CustomReportBuilderPage from './CustomReportBuilderPage';
import Modal from '../ui/Modal';
import CustomReportDataTable from './CustomReportDataTable';
// FIX: Imported toast to handle notifications.
import toast from 'react-hot-toast';

interface ReportsPageProps {
    isTabbedView?: boolean;
}

const ReportsPage: React.FC<ReportsPageProps> = ({ isTabbedView = false }) => {
    const { authenticatedUser } = useAuth();
    const { setCurrentPage } = useApp(); // Not really router, but works for this app structure
    const [reportType, setReportType] = useState<ReportType>('deals');
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        end: new Date(),
    });

    const { data: reportData, isLoading } = useQuery<AnyReportData, Error>({
        queryKey: ['reportData', reportType, dateRange, authenticatedUser?.organizationId],
        queryFn: () => apiClient.getReportData(reportType, dateRange, authenticatedUser!.organizationId!),
        enabled: !!authenticatedUser?.organizationId,
    });

    const { customReportsQuery, deleteCustomReportMutation, addDashboardWidgetMutation, dashboardWidgetsQuery } = useData();
    const { data: customReports = [] } = customReportsQuery;
    const { data: dashboardWidgets = [] } = dashboardWidgetsQuery;

    const [view, setView] = useState<'list' | 'builder'>('list');
    const [viewingReport, setViewingReport] = useState<CustomReport | null>(null);

    const { data: customReportData, isLoading: isCustomReportDataLoading } = useQuery({
        queryKey: ['customReportData', viewingReport?.id],
        queryFn: () => apiClient.generateCustomReport(viewingReport!.config, viewingReport!.organizationId),
        enabled: !!viewingReport,
    });

    const renderReport = () => {
        if (!reportData) return null;
        switch (reportType) {
            case 'sales': return <SalesReport data={reportData as any} />;
            case 'inventory': return <InventoryReport data={reportData as any} />;
            case 'financial': return <FinancialReport data={reportData as any} />;
            case 'contacts': return <ContactsReport data={reportData as any} />;
            case 'team': return <TeamReport data={reportData as any} />;
            case 'deals': return <DealsReport data={reportData as any} />;
            default: return null;
        }
    };

    const handleExport = () => {
        if (reportData) {
            // This is a simplification. A real export would need to flatten the data.
            const dataToExport = (reportData as any)[Object.keys(reportData)[0]];
            if (Array.isArray(dataToExport) && dataToExport.length > 0) {
                 exportToCSV(dataToExport, `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`);
            } else {
                toast.error("Export is not available for this report's data structure.");
            }
        }
    };
    
    if (view === 'builder') {
        return <CustomReportBuilderPage onClose={() => setView('list')} />;
    }

    const pageContent = (
        <>
             {!isTabbedView && (
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Reports</h1>
            )}
            <div className="space-y-6">
                <Card>
                    <div className="p-6">
                        <ReportFilters
                            reportType={reportType}
                            setReportType={setReportType}
                            dateRange={dateRange}
                            setDateRange={setDateRange}
                        />
                         <div className="mt-4 flex justify-end">
                            <Button variant="secondary" onClick={handleExport} leftIcon={<Download size={16} />} disabled={isLoading}>
                                Export Data
                            </Button>
                        </div>
                    </div>
                </Card>
                
                {isLoading ? (
                    <Card><div className="p-12 text-center">Generating report...</div></Card>
                ) : reportData ? (
                    renderReport()
                ) : (
                    <Card><div className="p-12 text-center text-red-500 flex items-center justify-center"><AlertTriangle className="mr-2"/> Could not load report data.</div></Card>
                )}

                <Card>
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Custom Reports</h2>
                            <Button onClick={() => setView('builder')} leftIcon={<Plus size={16} />}>
                                New Custom Report
                            </Button>
                        </div>
                        {customReports.length > 0 ? (
                            <div className="divide-y dark:divide-dark-border">
                                {customReports.map(report => {
                                    const isOnDashboard = dashboardWidgets.some(w => w.reportId === report.id);
                                    return (
                                        <div key={report.id} className="p-3 flex justify-between items-center">
                                            <p className="font-medium">{report.name}</p>
                                            <div className="space-x-2">
                                                <Button size="sm" variant="secondary" onClick={() => setViewingReport(report)} leftIcon={<Eye size={14} />}>View</Button>
                                                <Button size="sm" variant="secondary" onClick={() => addDashboardWidgetMutation.mutate(report.id)} disabled={isOnDashboard || addDashboardWidgetMutation.isPending} leftIcon={<BarChart size={14} />}>
                                                    {isOnDashboard ? 'On Dashboard' : 'Add to Dashboard'}
                                                </Button>
                                                <Button size="sm" variant="danger" onClick={() => {if(window.confirm('Are you sure?')) deleteCustomReportMutation.mutate(report.id)}} leftIcon={<Trash2 size={14} />} disabled={deleteCustomReportMutation.isPending}>Delete</Button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                             <p className="text-sm text-center text-gray-500 py-8">No custom reports created yet.</p>
                        )}
                    </div>
                </Card>
            </div>
            {viewingReport && (
                <Modal isOpen={!!viewingReport} onClose={() => setViewingReport(null)} title={viewingReport.name} size="5xl">
                    {isCustomReportDataLoading ? (
                        <p>Loading report data...</p>
                    ) : customReportData ? (
                        <CustomReportDataTable data={customReportData} />
                    ) : (
                        <p>Could not load data for this report.</p>
                    )}
                </Modal>
            )}
        </>
    );

    if (isTabbedView) {
        return <div className="p-1">{pageContent}</div>;
    }

    return <PageWrapper>{pageContent}</PageWrapper>;
};

export default ReportsPage;