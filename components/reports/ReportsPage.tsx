
import React, { useState, useMemo, useEffect } from 'react';
import PageWrapper from '../layout/PageWrapper';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Download, Plus, Check, Edit, Trash2, Eye } from 'lucide-react';
// FIX: Corrected import path for DataContext.
import { useData } from '../../contexts/DataContext';
// FIX: Corrected import path for types.
import { AnyReportData, ReportType, AnyContact, Product, User, Task, Deal, DealStage, CustomReport } from '../../types';
import { generateReportData } from '../../services/reportGenerator';
// FIX: Changed date-fns import for 'subDays' from a destructured import to a default import from its subpath to resolve a module export error.
import subDays from 'date-fns/subDays';
import ReportFilters from './ReportFilters';
import SalesReport from './SalesReport';
import InventoryReport from './InventoryReport';
import FinancialReport from './FinancialReport';
import ContactsReport from './ContactsReport';
import TeamReport from './TeamReport';
import DealsReport from './DealsReport';
import { exportToCSV } from '../../utils/export';
import CustomReportBuilderPage from './CustomReportBuilderPage';
import ReportPreviewModal from './ReportPreviewModal';
import { useApp } from '../../contexts/AppContext';


interface ReportsPageProps {
    isTabbedView?: boolean;
}

const ReportsPage: React.FC<ReportsPageProps> = ({ isTabbedView = false }) => {
    const [reportType, setReportType] = useState<ReportType>('deals');
    const [dateRange, setDateRange] = useState({ start: subDays(new Date(), 30), end: new Date() });
    const [view, setView] = useState<'reports' | 'builder'>('reports');
    const [selectedReport, setSelectedReport] = useState<CustomReport | null>(null);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    
    const { reportToEditId, setReportToEditId } = useApp();

    const { 
        contactsQuery, productsQuery, teamMembersQuery, tasksQuery, dealsQuery, dealStagesQuery, 
        customReportsQuery, dashboardWidgetsQuery, addDashboardWidgetMutation, deleteCustomReportMutation 
    } = useData();
    const { data: customReports = [] } = customReportsQuery;
    const { data: dashboardWidgets = [] } = dashboardWidgetsQuery;
    
    useEffect(() => {
        if (reportToEditId) {
            const report = (customReports as CustomReport[]).find(r => r.id === reportToEditId);
            if (report) {
                setSelectedReport(report);
                setView('builder');
                setReportToEditId(null); // Clear the trigger
            }
        }
    }, [reportToEditId, customReports, setReportToEditId]);


    const isLoading = contactsQuery.isLoading || productsQuery.isLoading || teamMembersQuery.isLoading || tasksQuery.isLoading || dealsQuery.isLoading || dealStagesQuery.isLoading;

    const reportData = useMemo((): AnyReportData | null => {
        if (isLoading) return null;
        try {
            return generateReportData(reportType, dateRange, {
                contacts: contactsQuery.data as AnyContact[],
                products: productsQuery.data as Product[],
                team: teamMembersQuery.data as User[],
                tasks: tasksQuery.data as Task[],
                deals: dealsQuery.data as Deal[],
                dealStages: dealStagesQuery.data as DealStage[],
            });
        } catch (error) {
            console.error("Failed to generate report data:", error);
            return null;
        }
    }, [reportType, dateRange, isLoading, contactsQuery.data, productsQuery.data, teamMembersQuery.data, tasksQuery.data, dealsQuery.data, dealStagesQuery.data]);

    const renderReport = () => {
        if (!reportData) return <div className="p-8 text-center">No data available for this report and date range.</div>;

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
        if(reportData) {
            // This is a simplified export; a real app would format based on report type
            const dataToExport = (reportData as any).salesByProduct || (reportData as any).lowStockItems || [];
            if(dataToExport.length > 0) {
                 exportToCSV(dataToExport, `${reportType}-report-${new Date().toISOString().split('T')[0]}.csv`);
            }
        }
    }
    
    const handleEdit = (report: CustomReport) => {
        setSelectedReport(report);
        setView('builder');
    };
    
    const handleNew = () => {
        setSelectedReport(null);
        setView('builder');
    };
    
    const handleDelete = (reportId: string) => {
        if (window.confirm("Are you sure you want to delete this report? This will also remove it from any dashboards.")) {
            deleteCustomReportMutation.mutate(reportId);
        }
    };
    
    const handlePreview = (report: CustomReport) => {
        setSelectedReport(report);
        setIsPreviewModalOpen(true);
    };


    if (view === 'builder') {
        return <CustomReportBuilderPage reportToEdit={selectedReport} onClose={() => setView('reports')} />;
    }

    const pageContent = (
        <>
            {!isTabbedView && (
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-text-heading">Reports</h1>
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={handleExport} leftIcon={<Download size={16} />}>Export</Button>
                        <Button onClick={handleNew} leftIcon={<Plus size={16} />}>Custom Report</Button>
                    </div>
                </div>
            )}
            <Card>
                <div className="p-4 border-b border-border-subtle">
                    <ReportFilters reportType={reportType} setReportType={setReportType} dateRange={dateRange} setDateRange={setDateRange} />
                </div>
                <div className="p-6">
                    {isLoading ? <div className="p-8 text-center">Loading report data...</div> : renderReport()}
                </div>
            </Card>

            <Card title="My Custom Reports" className="mt-6">
                 {customReports.length > 0 ? (
                    <div className="divide-y divide-border-subtle">
                        {(customReports as CustomReport[]).map((report: CustomReport) => {
                            const widgetExists = dashboardWidgets.some((w: any) => w.reportId === report.id);
                            return (
                                <div key={report.id} className="p-3 flex justify-between items-center">
                                    <p className="font-medium">{report.name}</p>
                                    <div className="flex items-center gap-2">
                                        <Button 
                                            size="sm" 
                                            variant="secondary"
                                            onClick={() => addDashboardWidgetMutation.mutate(report.id)}
                                            disabled={widgetExists || addDashboardWidgetMutation.isPending}
                                            leftIcon={widgetExists ? <Check size={14} /> : <Plus size={14} />}
                                        >
                                            {widgetExists ? 'Added' : 'Add to Dashboard'}
                                        </Button>
                                        <Button size="sm" variant="secondary" onClick={() => handlePreview(report)}><Eye size={14} /></Button>
                                        <Button size="sm" variant="secondary" onClick={() => handleEdit(report)}><Edit size={14} /></Button>
                                        <Button size="sm" variant="danger" onClick={() => handleDelete(report.id)} disabled={deleteCustomReportMutation.isPending}><Trash2 size={14} /></Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-sm text-text-secondary text-center p-6">You haven't created any custom reports yet.</p>
                )}
            </Card>
            
            {isPreviewModalOpen && selectedReport && (
                <ReportPreviewModal
                    isOpen={isPreviewModalOpen}
                    onClose={() => setIsPreviewModalOpen(false)}
                    report={selectedReport}
                />
            )}
        </>
    );
    
    if (isTabbedView) {
        return <div className="p-1">{pageContent}</div>
    }

    return <PageWrapper>{pageContent}</PageWrapper>;
};

export default ReportsPage;