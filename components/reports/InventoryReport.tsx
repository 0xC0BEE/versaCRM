import React from 'react';
// FIX: Corrected the import path for types to be a valid relative path.
import { InventoryReportData } from '../../types';
import Card from '../ui/Card';
import KpiCard from '../dashboard/KpiCard';
import { Package, Archive, AlertTriangle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943'];

interface InventoryReportProps {
    data: InventoryReportData;
}

const InventoryReport: React.FC<InventoryReportProps> = ({ data }) => {
    return (
        <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KpiCard title="Total Products" value={data.totalProducts} icon={<Package className="h-6 w-6 text-blue-500" />} />
                <KpiCard title="Total Inventory Value" value={data.totalValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} icon={<Archive className="h-6 w-6 text-green-500" />} />
                 <KpiCard title="Low Stock Items" value={data.lowStockItems.length} icon={<AlertTriangle className="h-6 w-6 text-red-500" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Low Stock Items (< 100 Units)">
                    <div className="max-h-96 overflow-y-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Product Name</th>
                                    <th scope="col" className="px-6 py-3">SKU</th>
                                    <th scope="col" className="px-6 py-3">Stock Level</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.lowStockItems.map(item => (
                                    <tr key={item.id} className="bg-white border-b dark:bg-dark-card dark:border-dark-border">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.name}</td>
                                        <td className="px-6 py-4">{item.sku}</td>
                                        <td className="px-6 py-4 font-bold text-red-500">{item.stockLevel}</td>
                                    </tr>
                                ))}
                                {data.lowStockItems.length === 0 && (
                                    <tr><td colSpan={3} className="text-center p-8">No low stock items. Great job!</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
                <Card title="Stock by Category">
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
                </Card>
            </div>
        </div>
    );
};

export default InventoryReport;