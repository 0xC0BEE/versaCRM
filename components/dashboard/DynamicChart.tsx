import React from 'react';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
// FIX: Corrected import path for useTheme.
import { useTheme } from '../../contexts/ThemeContext';

interface DynamicChartProps {
    type: 'bar' | 'line' | 'pie';
    data: any[];
}

const COLORS = ['#3b82f6', '#84cc16', '#f97316', '#a855f7', '#ec4899'];

const DynamicChart: React.FC<DynamicChartProps> = ({ type, data }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const tickColor = isDark ? '#9ca3af' : '#6b7280';
    const strokeColor = isDark ? '#4b5563' : '#d1d5db';

    const renderChart = () => {
        if (!data || data.length === 0) {
            return <div className="flex items-center justify-center h-full text-gray-500">No data available for this chart.</div>;
        }
        switch (type) {
            case 'bar':
                return (
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke={strokeColor} />
                        <XAxis dataKey="name" tick={{ fill: tickColor }} />
                        <YAxis tick={{ fill: tickColor }} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                                border: `1px solid ${strokeColor}`
                            }}
                        />
                        <Legend />
                        <Bar dataKey="value" fill="#3b82f6" name="Count"/>
                    </BarChart>
                );
            case 'line':
                return (
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke={strokeColor}/>
                        <XAxis dataKey="name" tick={{ fill: tickColor }}/>
                        <YAxis tick={{ fill: tickColor }}/>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                                border: `1px solid ${strokeColor}`
                            }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="value" stroke="#84cc16" name="Value" />
                    </LineChart>
                );
            case 'pie':
                return (
                     <PieChart>
                        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                             contentStyle={{
                                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                                border: `1px solid ${strokeColor}`
                            }}
                        />
                        <Legend />
                    </PieChart>
                );
            default:
                return null;
        }
    };
    
    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                {renderChart()}
            </ResponsiveContainer>
        </div>
    );
};

export default DynamicChart;