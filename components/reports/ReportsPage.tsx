import React, { useState, useMemo } from 'react';
import PageWrapper from '../layout/PageWrapper';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Download, Plus } from 'lucide-react';
// FIX: Corrected import path for DataContext.
import { useData } from '../../contexts/DataContext';
import { AnyReportData, ReportType, AnyContact, Product, User, Task, Deal, DealStage } from '../../types';
import { generateReportData } from '../../services/reportGenerator';
import { subDays } from 'date-fns';
import ReportFilters from './ReportFilters';
import SalesReport from './SalesReport';
import InventoryReport from './InventoryReport';
import FinancialReport from './FinancialReport';
import ContactsReport from './ContactsReport';
import TeamReport from './TeamReport';
import DealsReport from './DealsReport';
import { exportToCSV } from '../../utils/export';
import CustomReportBuilderPage from './CustomReportBuilderPage';
import CustomReportDataTable from './CustomReportDataTable';
import { processReportData } from '../../utils/reportProcessor';
import CustomReportChart from './CustomReportChart';

interface ReportsPageProps {
    isTabbedView?: boolean;
}

const ReportsPage: React.FC<ReportsPageProps> = ({ isTabbedView = false }) => {
    const [reportType, setReportType] = useState<ReportType>('deals');
    const [dateRange, setDateRange] = useState({ start: subDays(new Date(), 30), end: new Date() });
    const [view, setView] = useState<'reports' | 'builder'>('reports');

    const { contactsQuery, productsQuery, teamMembersQuery, tasksQuery, dealsQuery, dealStagesQuery, customReportsQuery } = useData();

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

    if (view === 'builder') {
        return <CustomReportBuilderPage onClose={() => setView('reports')} />;
    }

    const pageContent = (
        <>
            {!isTabbedView && (
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-text-heading">Reports</h1>
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={handleExport} leftIcon={<Download size={16} />}>Export</Button>
                        <Button onClick={() => setView('builder')} leftIcon={<Plus size={16} />}>Custom Report</Button>
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
        </>
    );
    
    if (isTabbedView) {
        return <div className="p-1">{pageContent}</div>
    }

    return <PageWrapper>{pageContent}</PageWrapper>;
};

export default ReportsPage;