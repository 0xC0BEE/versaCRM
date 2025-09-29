import React from 'react';
// FIX: Imported correct type.
import { FinancialReportData } from '../../types';
import Card from '../ui/Card';
import KpiCard from '../dashboard/KpiCard';
import { TrendingUp, TrendingDown, Scale } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

interface FinancialReportProps {
    data: FinancialReportData;
}

const FinancialReport: React.FC<FinancialReportProps> = ({ data }) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KpiCard title="Total Charges" value={data.totalCharges.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} icon={<TrendingUp className="h-6 w-6 text-red-500" />} />
                <KpiCard title="Total Payments Received" value={data.totalPayments.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} icon={<TrendingDown className="h-6 w-6 text-green-500" />} />
                <KpiCard title="Net Balance" value={data.netBalance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} icon={<Scale className="h-6 w-6 text-blue-500" />} />
            </div>

             <Card title="Payments by Method">
                <div style={{ width: '100%', height: 350 }}>
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie
                                data={data.paymentsByMethod}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={120}
                                fill="#8884d8"
                                dataKey="amount"
                                nameKey="name"
                                label
                            >
                                {data.paymentsByMethod.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => (value as number).toLocaleString('en-US', { style: 'currency', currency: 'USD' })} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
    );
};

export default FinancialReport;
