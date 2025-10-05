import React from 'react';
import { useData } from '../../contexts/DataContext';
import { Supplier } from '../../types';
import Button from '../ui/Button';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const SuppliersTab: React.FC = () => {
    const { suppliersQuery } = useData();
    const { data: suppliers = [], isLoading } = suppliersQuery;

    const handleEdit = (supplier: Supplier) => {
        // In a real implementation, this would open a SupplierEditModal
        // FIX: Replaced unsupported toast.info with a default toast call.
        toast(`Editing for "${supplier.name}" is not implemented yet.`);
    };

    const handleAdd = () => {
        // In a real implementation, this would open a SupplierEditModal
        // FIX: Replaced unsupported toast.info with a default toast call.
        toast("Adding a new supplier is not implemented yet.");
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-text-primary">Suppliers</h3>
                <Button size="sm" onClick={handleAdd} leftIcon={<Plus size={14} />}>
                    New Supplier
                </Button>
            </div>
            {isLoading ? (
                <p className="text-text-secondary">Loading suppliers...</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-text-secondary">
                        <thead className="text-sm text-text-secondary uppercase bg-card-bg/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 font-medium">Name</th>
                                <th scope="col" className="px-6 py-3 font-medium">Contact Person</th>
                                <th scope="col" className="px-6 py-3 font-medium">Email</th>
                                <th scope="col" className="px-6 py-3 font-medium">Phone</th>
                                <th scope="col" className="px-6 py-3 font-medium"><span className="sr-only">Edit</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {suppliers.map((supplier: Supplier) => (
                                <tr key={supplier.id} className="border-b border-border-subtle hover:bg-hover-bg h-[52px]">
                                    <td className="px-6 py-4 font-medium text-text-primary cursor-pointer" onClick={() => handleEdit(supplier)}>{supplier.name}</td>
                                    <td className="px-6 py-4 cursor-pointer" onClick={() => handleEdit(supplier)}>{supplier.contactPerson}</td>
                                    <td className="px-6 py-4 cursor-pointer" onClick={() => handleEdit(supplier)}>{supplier.email}</td>
                                    <td className="px-6 py-4 cursor-pointer" onClick={() => handleEdit(supplier)}>{supplier.phone}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={(e) => { e.stopPropagation(); handleEdit(supplier); }} className="font-medium text-primary hover:underline">Edit</button>
                                    </td>
                                </tr>
                            ))}
                            {suppliers.length === 0 && (
                                <tr><td colSpan={5} className="text-center p-8 text-text-secondary">No suppliers found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default SuppliersTab;