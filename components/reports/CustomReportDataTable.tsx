import React from 'react';

interface CustomReportDataTableProps {
    data: any[];
}

const CustomReportDataTable: React.FC<CustomReportDataTableProps> = ({ data }) => {
    if (!data || data.length === 0) {
        return <p>No data to display.</p>;
    }

    const headers = Object.keys(data[0]);

    const renderCell = (value: any) => {
        if (value === null || value === undefined) {
            return <span className="text-gray-400">N/A</span>;
        }
        if (typeof value === 'boolean') {
            return value ? 'Yes' : 'No';
        }
        if (typeof value === 'object') {
            // Stringify arrays or objects for display.
            const jsonString = JSON.stringify(value);
            // Show a truncated version and the full version in a tooltip for complex objects
            return (
                <span title={jsonString} className="cursor-help">
                    {jsonString.length > 50 ? `${jsonString.substring(0, 50)}...` : jsonString}
                </span>
            );
        }
        return String(value);
    };

    return (
        <div className="overflow-x-auto max-h-[60vh]">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
                    <tr>
                        {headers.map(header => (
                            <th key={header} scope="col" className="px-6 py-3">{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex} className="bg-white border-b dark:bg-dark-card dark:border-dark-border hover:bg-gray-50 dark:hover:bg-gray-600">
                            {headers.map(header => (
                                <td key={`${rowIndex}-${header}`} className="px-6 py-4">
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

export default CustomReportDataTable;