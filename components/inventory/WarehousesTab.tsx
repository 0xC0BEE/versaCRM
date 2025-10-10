import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Warehouse } from '../../types';
import Button from '../ui/Button';
import { Plus } from 'lucide-react';
import WarehouseEditModal from './WarehouseEditModal';

const WarehousesTab: React.FC = () => {
    const { warehousesQuery } = useData();
    const { data: warehouses = [], isLoading } = warehousesQuery;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);

    const handleEdit = (warehouse: Warehouse) => {
        setSelectedWarehouse(warehouse);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedWarehouse(null);
        setIsModalOpen(true);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-text-primary">Warehouses</h3>
                <Button size="sm" onClick={handleAdd} leftIcon={<Plus size={14} />}>
                    New Warehouse
                </Button>
            </div>
            {isLoading ? (
                <p className="text-text-secondary">Loading warehouses...</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-text-secondary">
                        <thead className="text-sm text-text-secondary uppercase bg-card-bg/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 font-medium">Name</th>
                                <th scope="col" className="px-6 py-3 font-medium">Location</th>
                                <th scope="col" className="px-6 py-3 font-medium"><span className="sr-only">Edit</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {warehouses.map((warehouse: Warehouse) => (
                                <tr key={warehouse.id} className="border-b border-border-subtle hover:bg-hover-bg h-[52px]">
                                    <td className="px-6 py-4 font-medium text-text-primary cursor-pointer" onClick={() => handleEdit(warehouse)}>{warehouse.name}</td>
                                    <td className="px-6 py-4 cursor-pointer" onClick={() => handleEdit(warehouse)}>{warehouse.location}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={(e) => { e.stopPropagation(); handleEdit(warehouse); }} className="font-medium text-primary hover:underline">Edit</button>
                                    </td>
                                </tr>
                            ))}
                            {warehouses.length === 0 && (
                                <tr><td colSpan={3} className="text-center p-8 text-text-secondary">No warehouses found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
            {isModalOpen && (
                 <WarehouseEditModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    warehouse={selectedWarehouse}
                />
            )}
        </div>
    );
};

export default WarehousesTab;
