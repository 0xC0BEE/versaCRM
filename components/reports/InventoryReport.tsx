import React from 'react';
// FIX: Corrected the import path for types to be a valid relative path.
import { InventoryReportData } from '../../types';
// FIX: Changed default import of 'Card' to a named import '{ Card, CardHeader, CardTitle, CardContent }' and refactored usage to resolve module export error.
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import KpiCard from '../dashboard/KpiCard';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f97316', '#a855f7', '#ec4899'];

interface InventoryReportProps {
    data: InventoryReportData;
}

const InventoryReport: React.FC<InventoryReportProps> = ({ data }) => {
    return (
        <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KpiCard title="Total Products" value={data.totalProducts} iconName="Package" />
                <KpiCard title="Total Inventory Value" value={data.totalValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} iconName="Archive" />
                 <KpiCard title="Low Stock Items" value={data.lowStockItems.length} iconName="AlertTriangle" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Low Stock Items (&lt; 100 Units)</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="max-h-96 overflow-y-auto">
                            <table className="w-full text-sm text-left text-text-secondary">
                                <thead className="text-xs text-text-secondary uppercase bg-card-bg/50 sticky top-0">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Product Name</th>
                                        <th scope="col" className="px-6 py-3">SKU</th>
                                        <th scope="col" className="px-6 py-3">Stock Level</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.lowStockItems.map(item => (
                                        <tr key={item.id} className="border-b border-border-subtle">
                                            <td className="px-6 py-4 font-medium text-text-primary">{item.name}</td>
                                            <td className="px-6 py-4">{item.sku}</td>
                                            <td className="px-6 py-4 font-bold text-error">{item.stockLevel}</td>
                                        </tr>
                                    ))}
                                    {data.lowStockItems.length === 0 && (
                                        <tr><td colSpan={3} className="text-center p-8">No low stock items. Great job!</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Stock by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div style={{ width: '100%', height: 350 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={data.stockByCategory}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={120}
                                        fill="#8884d8"
                                        dataKey="quantity"
                                        nameKey="name"
                                        label
                                    >
                                        {data.stockByCategory.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default InventoryReport;