import React from 'react';
// FIX: Imported PieChart components from recharts.
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../ui/Card';

interface DynamicChartProps {
    title: string;
    data: any[];
    dataKey: string;
    type: 'bar' | 'line' | 'pie';
}

// FIX: Added colors array for PieChart slices.
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943'];

const DynamicChart: React.FC<DynamicChartProps> = ({ title, data, dataKey, type }) => {
    const renderChart = () => {
        if (type === 'bar') {
            return (
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey={dataKey} fill="#3b82f6" />
                </BarChart>
            );
        }
        if (type === 'line') {
            return (
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey={dataKey} stroke="#3b82f6" activeDot={{ r: 8 }}/>
                </LineChart>
            );
        }
        // FIX: Added rendering logic for 'pie' chart type.
        if (type === 'pie') {
            return (
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => {
                            if (typeof percent !== 'number' || isNaN(percent)) {
                                return name;
                            }
                            return `${name} ${(percent * 100).toFixed(0)}%`;
                        }}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => value.toLocaleString()} />
                    <Legend />
                </PieChart>
            );
        }
        return null;
    };

    return (
        <Card title={title}>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    {renderChart()}
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

export default DynamicChart;