import React from 'react';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';

interface DynamicChartProps {
    type: 'bar' | 'line' | 'pie';
    data: any[];
}

const PIE_COLORS = ['#3b82f6', '#10b981', '#f97316', '#a855f7', '#ec4899'];

const DynamicChart: React.FC<DynamicChartProps> = ({ type, data }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const tickColor = isDark ? '#9ca3af' : '#6b7280';
    const strokeColor = isDark ? 'rgba(55, 65, 81, 0.3)' : 'rgba(226, 232, 240, 0.8)';

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
          return (
            <div className="glass-overlay p-3 rounded-lg shadow-lg">
              <p className="label font-semibold">{`${label}`}</p>
              <p className="intro text-sm">{`${payload[0].name} : ${payload[0].value}`}</p>
            </div>
          );
        }
        // Returning a fragment is safer than null for some third-party libraries
        return <></>; 
      };
    
    const renderLegend = (props: any) => {
        const { payload } = props;
        if (!payload) return null;

        return (
            <ul className="flex justify-center items-center gap-4 text-xs text-slate-500">
                {payload.map((entry: any, index: number) => (
                    <li key={`item-${index}`} className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span>{entry.value}</span>
                    </li>
                ))}
            </ul>
        );
    };

    const renderChart = () => {
        if (!data || data.length === 0) {
            return <div className="flex items-center justify-center h-full text-slate-500">No data available for this chart.</div>;
        }
        switch (type) {
            case 'bar':
                return (
                    <BarChart data={data}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="rgb(var(--color-accent-blue))" stopOpacity={0.7}/>
                                <stop offset="95%" stopColor="rgb(var(--color-accent-blue))" stopOpacity={0.1}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={strokeColor} />
                        <XAxis dataKey="name" tick={{ fill: tickColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: tickColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
                        <Bar dataKey="value" fill="url(#colorValue)" name="Count" radius={[4, 4, 0, 0]} />
                    </BarChart>
                );
            case 'line':
                return (
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke={strokeColor}/>
                        <XAxis dataKey="name" tick={{ fill: tickColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: tickColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="value" stroke="rgb(var(--primary))" name="Value" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }}/>
                    </LineChart>
                );
            case 'pie':
                return (
                     <PieChart>
                        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={'80%'} label>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke={isDark ? '#1f2937' : '#fff'} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend content={renderLegend} />
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