import React from 'react';
import { DealReportData } from '../../types';
// FIX: Changed default import of 'Card' to a named import '{ Card, CardHeader, CardTitle, CardContent }' and refactored usage to resolve module export error.
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import KpiCard from '../dashboard/KpiCard';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';

interface DealsReportProps {
    data: DealReportData;
}

const DealsReport: React.FC<DealsReportProps> = ({ data }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const tickColor = isDark ? '#9ca3af' : '#6b7280';
    const strokeColor = isDark ? 'rgba(55, 65, 81, 0.3)' : 'rgba(226, 232, 240, 0.8)';

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard title="Total Pipeline Value" value={data.totalPipelineValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} iconName="DollarSign" />
                <KpiCard title="Win Rate" value={`${data.winRate.toFixed(1)}%`} iconName="Percent" />
                <KpiCard title="Avg. Deal Size" value={data.averageDealSize.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} iconName="BarChart" />
                <KpiCard title="Avg. Sales Cycle" value={`${data.averageSalesCycle.toFixed(0)} days`} iconName="Clock" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <KpiCard title="Deals Won (in period)" value={data.dealsWon} iconName="CheckCircle" />
                 <KpiCard title="Deals Lost (in period)" value={data.dealsLost} iconName="XCircle" />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Current Deals by Stage</CardTitle>
                </CardHeader>
                <CardContent>
                    <div style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer>
                            <RechartsBarChart data={data.dealsByStage} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="dealsByStage" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="rgb(var(--color-accent-blue))" stopOpacity={0.7}/>
                                        <stop offset="95%" stopColor="rgb(var(--color-accent-blue))" stopOpacity={0.1}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={strokeColor} />
                                <XAxis dataKey="name" tick={{ fill: tickColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: tickColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: isDark ? '#1f2937' : '#ffffff',
                                        border: `1px solid ${strokeColor}`,
                                        borderRadius: 'var(--radius-input)'
                                    }}
                                />
                                <Bar dataKey="value" fill="url(#dealsByStage)" name="Deal Count" radius={[4, 4, 0, 0]} />
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default DealsReport;