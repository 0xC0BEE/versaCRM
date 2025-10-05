import React from 'react';
// FIX: Corrected the import path for types to be a valid relative path.
import { ReportType } from '../../types';
import Select from '../ui/Select';
import Input from '../ui/Input';

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
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
            <Select
                id="reportType"
                label="Report Type"
                value={reportType}
                onChange={(e) => setReportType(e.target.value as ReportType)}
                className="w-full md:w-auto"
            >
                <option value="deals">Deals Report</option>
                <option value="sales">Sales Report (Orders)</option>
                <option value="inventory">Inventory Report</option>
                <option value="financial">Financial Report</option>
                <option value="contacts">Contacts Report</option>
                <option value="team">Team Performance</option>
            </Select>
            <div className="flex items-end gap-4 w-full md:w-auto">
                <Input
                    type="date"
                    id="startDate"
                    label="Start Date"
                    name="start"
                    value={dateRange.start.toISOString().split('T')[0]}
                    onChange={handleDateChange}
                    className="w-full"
                />
                 <Input
                    type="date"
                    id="endDate"
                    label="End Date"
                    name="end"
                    value={dateRange.end.toISOString().split('T')[0]}
                    onChange={handleDateChange}
                    className="w-full"
                />
            </div>
        </div>
    );
};

export default ReportFilters;