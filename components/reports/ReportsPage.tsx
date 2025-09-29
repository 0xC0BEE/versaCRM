import React, { useState } from 'react';
// FIX: Imported correct types.
import { ReportType, AnyReportData } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import PageWrapper from '../layout/PageWrapper';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { exportToCSV } from '../../utils/export';
import api from '../../services/api';
import ReportFilters from './ReportFilters';
import SalesReport from './SalesReport';
import InventoryReport from './InventoryReport';
import FinancialReport from './FinancialReport';
import ContactsReport from './ContactsReport';
import TeamReport from './TeamReport';

interface ReportsPageProps {
    isTabbedView?: boolean;
}

const ReportsPage: React.FC<ReportsPageProps> = ({ isTabbedView = false }) => {
    const { currentIndustry } = useApp();
    const { authenticatedUser } = useAuth();
    const orgId = authenticatedUser?.organizationId;

    const [reportType, setReportType] = useState<ReportType>('sales');
    const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>(() => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 30);
        return { start, end };
    });

    // FIX: Used correct api method and type.
    const { data, isLoading, isError, error } = useQuery<AnyReportData, Error>({
        queryKey: ['reportData', currentIndustry, reportType, dateRange, orgId],
        queryFn: () => api.getReportData(reportType, dateRange, currentIndustry, orgId),
    });
    
    const handleExport = () => {
        if (!data) {
            toast.error("No data available to export.");
            return;
        }
        // Simplified export logic
        const key = Object.keys(data)[0];
        const dataToExport = (data as any)[key];
        if (Array.isArray(dataToExport) && dataToExport.length > 0) {
            exportToCSV(dataToExport, `${currentIndustry}_${reportType}_report.csv`);
        } else {
            toast.error("No data to export for this report section.");
        }
    };

    const renderReport = () => {
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

    const pageContent = (
        <>
            {!isTabbedView && (
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Reports</h1>
                    <Button onClick={handleExport} leftIcon={<Download size={16}/>} disabled={isLoading || !data}>
                        Export CSV
                    </Button>
                </div>
            )}
            <Card className="mb-6">
                <ReportFilters
                    reportType={reportType}
                    setReportType={setReportType}
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                />
            </Card>
            {renderReport()}
        </>
    );

    if (isTabbedView) {
        return pageContent;
    }

    return (
        <PageWrapper>
            {pageContent}
        </PageWrapper>
    );
};

export default ReportsPage;
