import React from 'react';
// FIX: Corrected the import path for types to be a valid relative path.
import { SalesReportData } from '../../types';
// FIX: Changed default import of 'Card' to a named import '{ Card, CardHeader, CardTitle }' and refactored usage to resolve module export error.
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
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

            <Card>
                <CardHeader>
                    <CardTitle>Sales by Product</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-text-secondary">
                            <thead className="text-xs text-text-secondary uppercase bg-card-bg/50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Product Name</th>
                                    <th scope="col" className="px-6 py-3">Quantity Sold</th>
                                    <th scope="col" className="px-6 py-3">Total Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.salesByProduct.map(product => (
                                    <tr key={product.name} className="border-b border-border-subtle">
                                        <td className="px-6 py-4 font-medium text-text-primary">{product.name}</td>
                                        <td className="px-6 py-4">{product.quantity}</td>
                                        <td className="px-6 py-4">{product.revenue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                                    </tr>
                                ))}
                                {data.salesByProduct.length === 0 && (
                                    <tr><td colSpan={3} className="text-center p-8">No product sales in this period.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SalesReport;