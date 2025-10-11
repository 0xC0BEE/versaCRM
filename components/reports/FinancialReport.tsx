import React from 'react';
// FIX: Corrected the import path for types to be a valid relative path.
import { FinancialReportData } from '../../types';
// FIX: Changed default import of 'Card' to a named import '{ Card, CardHeader, CardTitle, CardContent }' and refactored usage to resolve module export error.
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import KpiCard from '../dashboard/KpiCard';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f97316', '#a855f7'];

interface FinancialReportProps {
    data: FinancialReportData;
}

const FinancialReport: React.FC<FinancialReportProps> = ({ data }) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KpiCard title="Total Charges" value={data.totalCharges.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} iconName="TrendingUp" />
                <KpiCard title="Total Payments Received" value={data.totalPayments.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} iconName="TrendingDown" />
                <KpiCard title="Net Balance" value={data.netBalance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} iconName="Scale" />
            </div>

             <Card>
                <CardHeader>
                    <CardTitle>Payments by Method</CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
            </Card>
        </div>
    );
};

export default FinancialReport;