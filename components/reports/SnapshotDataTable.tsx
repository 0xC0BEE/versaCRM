import React from 'react';

interface SnapshotDataTableProps {
    data: any[];
}

const SnapshotDataTable: React.FC<SnapshotDataTableProps> = ({ data }) => {
    if (!data || data.length === 0) {
        return <p className="text-center p-8 text-text-secondary">This snapshot is empty or contains no data.</p>;
    }

    // Use only a subset of keys for display to keep the table manageable
    const allHeaders = Object.keys(data[0]);
    const headersToShow = allHeaders.filter(h => !['organizationId', 'interactions', 'orders', 'enrollments', 'transactions', 'auditLogs', 'relationships', 'campaignEnrollments', 'structuredRecords', 'comments', 'notes'].includes(h)).slice(0, 7);


    const renderCell = (value: any) => {
        if (value === null || value === undefined) {
            return <span className="text-text-secondary">N/A</span>;
        }
        if (typeof value === 'boolean') {
            return value ? 'Yes' : 'No';
        }
        if (typeof value === 'object') {
            return <span className="text-xs text-text-secondary">[Complex Data]</span>
        }
        return String(value);
    };

    return (
        <div className="overflow-x-auto max-h-[60vh] border border-border-subtle rounded-lg">
            <table className="w-full text-sm text-left text-text-secondary">
                <thead className="text-xs uppercase bg-card-bg/50 text-text-secondary sticky top-0">
                    <tr>
                        {headersToShow.map(header => (
                            <th key={header} scope="col" className="px-6 py-3 font-medium">{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-b border-border-subtle last:border-b-0 hover:bg-hover-bg">
                            {headersToShow.map(header => (
                                <td key={`${rowIndex}-${header}`} className="px-6 py-3 text-text-primary whitespace-nowrap">
                                    {renderCell(row[header])}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default SnapshotDataTable;