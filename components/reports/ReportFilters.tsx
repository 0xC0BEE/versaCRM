import React from 'react';
// FIX: Corrected the import path for types to be a valid relative path.
import { ReportType } from '../../types';

interface ReportFiltersProps {
    reportType: ReportType;
    setReportType: (type: ReportType) => void;
    dateRange: { start: Date; end: Date };
    setDateRange: (range: { start: Date; end: Date }) => void;
}

const ReportFilters: React.FC<ReportFiltersProps> = ({ reportType, setReportType, dateRange, setDateRange }) => {

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDateRange({ ...dateRange, [name]: new Date(value) });
    };

    return (
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <div>
                <label htmlFor="reportType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Report Type
                </label>
                <select
                    id="reportType"
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value as ReportType)}
                    className="mt-1 block w-full md:w-auto pl-3 pr-10 py-2 text-base border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                    <option value="deals">Deals Report</option>
                    <option value="sales">Sales Report (Orders)</option>
                    <option value="inventory">Inventory Report</option>
                    <option value="financial">Financial Report</option>
                    <option value="contacts">Contacts Report</option>
                    <option value="team">Team Performance</option>
                </select>
            </div>
            <div className="flex items-center space-x-4">
                <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Start Date
                    </label>
                    <input
                        type="date"
                        id="startDate"
                        name="start"
                        value={dateRange.start.toISOString().split('T')[0]}
                        onChange={handleDateChange}
                        className="mt-1 block w-full pl-3 pr-4 py-2 text-base border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                    />
                </div>
                 <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        End Date
                    </label>
                    <input
                        type="date"
                        id="endDate"
                        name="end"
                        value={dateRange.end.toISOString().split('T')[0]}
                        onChange={handleDateChange}
                        className="mt-1 block w-full pl-3 pr-4 py-2 text-base border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                    />
                </div>
            </div>
        </div>
    );
};

export default ReportFilters;