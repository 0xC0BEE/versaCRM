import React from 'react';
import { DealReportData } from '../../types';
import Card from '../ui/Card';
import KpiCard from '../dashboard/KpiCard';
import { DollarSign, Percent, BarChart, CheckCircle, XCircle, Clock } from 'lucide-react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';

interface DealsReportProps {
    data: DealReportData;
}

const DealsReport: React.FC<DealsReportProps> = ({ data }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const tickColor = isDark ? '#9ca3af' : '#6b7280';

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard title="Total Pipeline Value" value={data.totalPipelineValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} icon={<DollarSign className="h-6 w-6 text-blue-500" />} />
                <KpiCard title="Win Rate" value={`${data.winRate.toFixed(1)}%`} icon={<Percent className="h-6 w-6 text-green-500" />} />
                <KpiCard title="Avg. Deal Size" value={data.averageDealSize.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} icon={<BarChart className="h-6 w-6 text-indigo-500" />} />
                <KpiCard title="Avg. Sales Cycle" value={`${data.averageSalesCycle.toFixed(0)} days`} icon={<Clock className="h-6 w-6 text-orange-500" />} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <KpiCard title="Deals Won (in period)" value={data.dealsWon} icon={<CheckCircle className="h-6 w-6 text-green-500" />} />
                 <KpiCard title="Deals Lost (in period)" value={data.dealsLost} icon={<XCircle className="h-6 w-6 text-red-500" />} />
            </div>

            <Card title="Current Deals by Stage">
                 <div style={{ width: '100%', height: 350 }}>
                    <ResponsiveContainer>
                        <RechartsBarChart data={data.dealsByStage} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" tick={{ fill: tickColor, fontSize: 12 }} />
                            <YAxis tick={{ fill: tickColor }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: isDark ? '#1f2937' : '#ffffff',
                                    border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`
                                }}
                            />
                            <Bar dataKey="value" fill="#3b82f6" name="Deal Count" />
                        </RechartsBarChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
    );
};

export default DealsReport;