import React from 'react';
import Modal from '../ui/Modal';
import { CustomReport } from '../../types';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../services/apiClient';
import { useAuth } from '../../contexts/AuthContext';
import CustomReportDataTable from './CustomReportDataTable';
import { processReportData } from '../../utils/reportProcessor';
import CustomReportChart from './CustomReportChart';
import { Loader } from 'lucide-react';

interface ReportPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    report: CustomReport;
}

const ReportPreviewModal: React.FC<ReportPreviewModalProps> = ({ isOpen, onClose, report }) => {
    const { authenticatedUser } = useAuth();
    
    const { data: reportData, isLoading } = useQuery({
        queryKey: ['reportPreview', report.id],
        queryFn: () => apiClient.generateCustomReport(report.config, authenticatedUser!.organizationId),
        enabled: isOpen,
    });
    
    const isChart = report.config.visualization.type !== 'table';
    const chartData = reportData && isChart ? processReportData(reportData, report.config.visualization) : [];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Preview: ${report.name}`} size="4xl">
            <div className="min-h-[400px] flex items-center justify-center">
                {isLoading ? (
                    <Loader className="animate-spin text-primary" />
                ) : reportData ? (
                    isChart ? (
                        <CustomReportChart data={chartData} visualizationType={report.config.visualization.type} />
                    ) : (
                        <CustomReportDataTable data={reportData} />
                    )
                ) : (
                    <p>No data to display for this report.</p>
                )}
            </div>
        </Modal>
    );
};

export default ReportPreviewModal;
