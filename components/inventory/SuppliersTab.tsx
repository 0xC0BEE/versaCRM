import React from 'react';
// FIX: Corrected the import path for DataContext to be a valid relative path.
import { useData } from '../../contexts/DataContext';
import Button from '../ui/Button';
import { Plus } from 'lucide-react';

const SuppliersTab: React.FC = () => {
    const { suppliersQuery } = useData();
    const { data: suppliers = [], isLoading } = suppliersQuery;

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Suppliers</h3>
                <Button size="sm" variant="secondary" leftIcon={<Plus size={14} />}>Add Supplier</Button>
            </div>
            {isLoading ? (
                <div>Loading suppliers...</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Name</th>
                                <th scope="col" className="px-6 py-3">Contact Person</th>
                                <th scope="col" className="px-6 py-3">Email</th>
                                <th scope="col" className="px-6 py-3">Phone</th>
                            </tr>
                        </thead>
                        <tbody>
                            {suppliers.map(supplier => (
                                <tr key={supplier.id} className="bg-white border-b dark:bg-dark-card dark:border-dark-border">
                                    <td className="px-6 py-4 font-medium">{supplier.name}</td>
                                    <td className="px-6 py-4">{supplier.contactPerson}</td>
                                    <td className="px-6 py-4">{supplier.email}</td>
                                    <td className="px-6 py-4">{supplier.phone}</td>
                                </tr>
                            ))}
                             {suppliers.length === 0 && (
                                <tr><td colSpan={4} className="text-center p-8">No suppliers found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default SuppliersTab;