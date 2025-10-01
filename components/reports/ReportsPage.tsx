import React, { useState } from 'react';
// FIX: Corrected the import path for types to be a valid relative path.
import { ReportType, AnyReportData, CustomReport } from '../../types';
// FIX: Corrected import path for useApp.
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import PageWrapper from '../layout/PageWrapper';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Download, Plus, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { exportToCSV } from '../../utils/export';
import apiClient from '../../services/apiClient';
import ReportFilters from './ReportFilters';
import SalesReport from './SalesReport';
import InventoryReport from './InventoryReport';
import FinancialReport from './FinancialReport';
import ContactsReport from './ContactsReport';
import TeamReport from './TeamReport';
// FIX: Corrected the import path for DataContext to be a valid relative path.
import { useData } from '../../contexts/DataContext';
import CustomReportBuilderPage from './CustomReportBuilderPage';

// FIX: Added props interface to accept isTabbedView
interface ReportsPageProps {
    isTabbedView?: boolean;
}

const ReportsPage: React.FC<ReportsPageProps> = ({ isTabbedView = false }) => {
    const { currentIndustry } = useApp();
    const { authenticatedUser } = useAuth();
    const { customReportsQuery } = useData();
    const orgId = authenticatedUser?.organizationId;
    
    const [view, setView] = useState<'list' | 'builder' | 'run_prebuilt' | 'run_custom'>('list');
    const [selectedCustomReport, setSelectedCustomReport] = useState<CustomReport | null>(null);

    // State for pre-built reports
    const [reportType, setReportType] = useState<ReportType>('sales');
    const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>(() => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 30);
        return { start, end };
    });

    const { data, isLoading, isError, error } = useQuery<AnyReportData, Error>({
        queryKey: ['reportData', currentIndustry, reportType, dateRange, orgId],
        // FIX: Removed extra 'currentIndustry' argument to match function signature.
        queryFn: () => apiClient.getReportData(reportType, dateRange, orgId!),
        enabled: view === 'run_prebuilt', // Only run this query when viewing a pre-built report
    });
    
    const { data: customReports = [], isLoading: customReportsLoading } = customReportsQuery;

    const handleExport = () => {
        // This function will need to be adapted for custom reports as well
        if (!data) {
            toast.error("No data available to export.");
            return;
        }
        const key = Object.keys(data)[0];
        const dataToExport = (data as any)[key];
        if (Array.isArray(dataToExport) && dataToExport.length > 0) {
            exportToCSV(dataToExport, `${currentIndustry}_${reportType}_report.csv`);
        } else {
            toast.error("No data to export for this report section.");
        }
    };

    const renderPrebuiltReport = () => {
        if (isLoading) return <div className="text-center py-16">Generating report...</div>;
        if (isError) return <div className="text-center py-16 text-red-500">Error generating report: {error.message}</div>;
        if (!data) return <div className="text-center py-16">No data available for this report.</div>;

        switch(reportType) {
            case 'sales': return <SalesReport data={data as any} />;
            case 'inventory': return <InventoryReport data={data as any} />;
            case 'financial': return <FinancialReport data={data as any} />;
            case 'contacts': return <ContactsReport data={data as any} />;
            case 'team': return <TeamReport data={data as any} />;
            default: return null;
        }
    };
    
    if (view === 'builder') {
        return <CustomReportBuilderPage onFinish={() => setView('list')} />;
    }

    const pageContent = (
        <>
            {!isTabbedView && (
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Reports</h1>
                    <Button onClick={() => setView('builder')} leftIcon={<Plus size={16}/>}>
                        Build New Report
                    </Button>
                </div>
            )}

            {/* My Custom Reports */}
            <Card className="mb-8">
                 <h2 className="text-lg font-semibold mb-4">My Custom Reports</h2>
                 {customReportsLoading ? <p>Loading custom reports...</p> : (
                    customReports.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {customReports.map(report => (
                                <div key={report.id} className="p-4 border dark:border-dark-border rounded-lg flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <div>
                                        <p className="font-semibold">{report.name}</p>
                                        <p className="text-xs text-gray-500">Source: {report.config.dataSource}</p>
                                    </div>
                                    <Button size="sm" variant="secondary">Run</Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                         <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <FileText className="mx-auto h-10 w-10 text-gray-400" />
                            <p className="mt-2 font-semibold">No custom reports created yet.</p>
                            <p className="text-sm">Click "Build New Report" to get started.</p>
                        </div>
                    )
                 )}
            </Card>


            {/* Pre-built Reports */}
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Standard Reports</h2>
            <Card className="mb-6">
                <ReportFilters
                    reportType={reportType}
                    setReportType={setReportType}
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                />
                 <div className="p-4 flex justify-end">
                     <Button onClick={() => setView('run_prebuilt')} disabled={isLoading}>Generate Report</Button>
                 </div>
            </Card>

            {view === 'run_prebuilt' && (
                <>
                    <div className="flex justify-between items-center mb-6">
                        <Button onClick={() => setView('list')}>Back to Reports List</Button>
                        <Button onClick={handleExport} leftIcon={<Download size={16}/>} disabled={isLoading || !data}>
                            Export CSV
                        </Button>
                    </div>
                    {renderPrebuiltReport()}
                </>
            )}
        </>
    );
    
    if (isTabbedView) {
        return <div className="p-1">{pageContent}</div>
    }

    return (
        <PageWrapper>
            {pageContent}
        </PageWrapper>
    );
};

export default ReportsPage;