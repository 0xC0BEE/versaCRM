import React from 'react';
// FIX: Corrected the import path for types to be a valid relative path.
import { SalesReportData } from '../../types';
import Card from '../ui/Card';
import KpiCard from '../dashboard/KpiCard';

interface SalesReportProps {
    data: SalesReportData;
}

const SalesReport: React.FC<SalesReportProps> = ({ data }) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KpiCard title="Total Revenue" value={data.totalRevenue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} iconName="DollarSign" />
                <KpiCard title="Total Orders" value={data.totalOrders} iconName="ShoppingCart" />
                <KpiCard title="Average Order Value" value={data.averageOrderValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} iconName="Percent" />
            </div>

            <Card title="Sales by Product" className="overflow-x-auto">
                 <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Product Name</th>
                            <th scope="col" className="px-6 py-3">Quantity Sold</th>
                            <th scope="col" className="px-6 py-3">Total Revenue</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.salesByProduct.map(product => (
                            <tr key={product.name} className="bg-white border-b dark:bg-dark-card dark:border-dark-border">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{product.name}</td>
                                <td className="px-6 py-4">{product.quantity}</td>
                                <td className="px-6 py-4">{product.revenue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                            </tr>
                        ))}
                         {data.salesByProduct.length === 0 && (
                            <tr><td colSpan={3} className="text-center p-8">No product sales in this period.</td></tr>
                         )}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};

export default SalesReport;