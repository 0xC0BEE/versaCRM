import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';
import { Card } from '../ui/Card';

type ChartType = 'list' | 'bar' | 'kpi';

interface AiGeneratedChartProps {
    chartType: ChartType;
    data: any[];
}

const AiGeneratedChart: React.FC<AiGeneratedChartProps> = ({ chartType, data }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const tickColor = isDark ? '#9ca3af' : '#6b7280';
    const strokeColor = isDark ? 'rgba(55, 65, 81, 0.3)' : 'rgba(226, 232, 240, 0.8)';

    if (!data || data.length === 0) {
        return null;
    }

    switch (chartType) {
        case 'list':
            return (
                <ul className="space-y-2 text-sm">
                    {data.map((item, index) => (
                        <li key={index} className="p-2 bg-card-bg rounded-md">
                            <p className="font-semibold text-text-primary">{item?.title || 'Untitled Item'}</p>
                            {item?.subtitle && <p className="text-xs text-text-secondary">{item.subtitle}</p>}
                        </li>
                    ))}
                </ul>
            );
        case 'bar':
            return (
                <div style={{ width: '100%', height: 200 }}>
                    <ResponsiveContainer>
                        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={strokeColor} />
                            <XAxis dataKey="name" tick={{ fill: tickColor, fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: tickColor, fontSize: 10 }} axisLine={false} tickLine={false} />
                            <Tooltip
                                cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                                contentStyle={{ backgroundColor: 'rgb(var(--card-bg))', border: '1px solid rgb(var(--border-subtle))', borderRadius: '0.5rem' }}
                            />
                            <Bar dataKey="numericValue" fill="rgb(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            );
        case 'kpi':
            const kpi = data[0];
            return (
                <div className="text-center">
                    <p className="text-sm font-medium text-text-secondary">{kpi?.title || 'Metric'}</p>
                    <p className="text-4xl font-bold text-text-heading">{kpi?.textValue || '-'}</p>
                </div>
            );
        default:
            return null;
    }
};

export default AiGeneratedChart;