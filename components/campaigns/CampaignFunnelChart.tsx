import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { Campaign } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';

interface CampaignFunnelChartProps {
    stats: Campaign['stats'];
}

const CampaignFunnelChart: React.FC<CampaignFunnelChartProps> = ({ stats }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const tickColor = isDark ? '#9ca3af' : '#6b7280';
    const strokeColor = isDark ? 'rgba(55, 65, 81, 0.3)' : 'rgba(226, 232, 240, 0.8)';

    const data = [
        { name: 'Recipients', value: stats.recipients },
        { name: 'Sent', value: stats.sent },
        { name: 'Opened', value: stats.opened },
        { name: 'Clicked', value: stats.clicked },
    ];

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={strokeColor} />
                    <XAxis type="number" tick={{ fill: tickColor, fontSize: 12 }} />
                    <YAxis type="category" dataKey="name" tick={{ fill: tickColor, fontSize: 12 }} width={80} />
                    <Tooltip
                        cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                        contentStyle={{
                            backgroundColor: isDark ? '#1f2937' : '#ffffff',
                            border: `1px solid ${strokeColor}`,
                            borderRadius: '10px'
                        }}
                    />
                    <Bar dataKey="value" fill="rgb(var(--primary))" radius={[0, 4, 4, 0]}>
                        <LabelList dataKey="value" position="right" fill={tickColor} fontSize={12} />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default CampaignFunnelChart;