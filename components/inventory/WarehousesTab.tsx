import React from 'react';
// FIX: Corrected the import path for DataContext to be a valid relative path.
import { useData } from '../../contexts/DataContext';
import Button from '../ui/Button';
import { Plus } from 'lucide-react';

const WarehousesTab: React.FC = () => {
    const { warehousesQuery } = useData();
    const { data: warehouses = [], isLoading } = warehousesQuery;

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Warehouses</h3>
                <Button size="sm" variant="secondary" leftIcon={<Plus size={14} />}>Add Warehouse</Button>
            </div>
            {isLoading ? (
                <div>Loading warehouses...</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Name</th>
                                <th scope="col" className="px-6 py-3">Location</th>
                            </tr>
                        </thead>
                        <tbody>
                            {warehouses.map(warehouse => (
                                <tr key={warehouse.id} className="bg-white border-b dark:bg-dark-card dark:border-dark-border">
                                    <td className="px-6 py-4 font-medium">{warehouse.name}</td>
                                    <td className="px-6 py-4">{warehouse.location}</td>
                                </tr>
                            ))}
                             {warehouses.length === 0 && (
                                <tr><td colSpan={2} className="text-center p-8">No warehouses found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default WarehousesTab;