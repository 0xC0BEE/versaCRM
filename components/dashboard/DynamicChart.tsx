import React from 'react';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

interface DynamicChartProps {
    type: 'bar' | 'line' | 'pie';
    data: any[];
    title: string;
    onSegmentClick?: (payload: any) => void;
}

const PIE_COLORS = ['#3b82f6', '#10b981', '#f97316', '#a855f7', '#ec4899'];

const DynamicChart: React.FC<DynamicChartProps> = ({ type, data, title, onSegmentClick }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const tickColor = isDark ? '#9ca3af' : '#6b7280';
    const strokeColor = isDark ? 'rgba(55, 65, 81, 0.3)' : 'rgba(226, 232, 240, 0.8)';

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
          return (
            <div className="bg-card-bg p-3 rounded-lg shadow-lg border border-border-subtle">
              <p className="label font-semibold">{`${label}`}</p>
              <p className="intro text-sm">{`${payload[0].name} : ${payload[0].value}`}</p>
            </div>
          );
        }
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
                    <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="rgb(var(--primary))" stopOpacity={0.7}/>
                                <stop offset="95%" stopColor="rgb(var(--primary))" stopOpacity={0.1}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={strokeColor} />
                        <XAxis dataKey="name" tick={{ fill: tickColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: tickColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
                        <Bar dataKey="value" fill="url(#colorValue)" name="Count" radius={[4, 4, 0, 0]} onClick={onSegmentClick} cursor={onSegmentClick ? 'pointer' : 'default'} />
                    </BarChart>
                );
            case 'line':
                return (
                    <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
                        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={'85%'} onClick={onSegmentClick} cursor={onSegmentClick ? 'pointer' : 'default'}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke={isDark ? '#1f2937' : '#fff'} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend verticalAlign="bottom" height={36} content={renderLegend} />
                    </PieChart>
                );
            default:
                return null;
        }
    };
    
    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow h-full w-full p-2 pt-0">
                <ResponsiveContainer width="100%" height="100%">
                    {renderChart()}
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default DynamicChart;