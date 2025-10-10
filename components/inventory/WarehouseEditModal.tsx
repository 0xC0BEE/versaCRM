import React, { useMemo } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Warehouse } from '../../types';
import toast from 'react-hot-toast';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Trash2 } from 'lucide-react';
import { useForm } from '../../hooks/useForm';

interface WarehouseEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    warehouse: Warehouse | null;
}

const WarehouseEditModal: React.FC<WarehouseEditModalProps> = ({ isOpen, onClose, warehouse }) => {
    const { createWarehouseMutation, updateWarehouseMutation, deleteWarehouseMutation } = useData();
    const { authenticatedUser } = useAuth();
    const isNew = !warehouse;

    const initialState = useMemo(() => ({
        name: '',
        location: '',
    }), []);

    const { formData, handleChange } = useForm(initialState, warehouse);

    const handleSave = () => {
        if (!formData.name.trim()) {
            toast.error("Warehouse Name is required.");
            return;
        }
        
        const orgId = authenticatedUser!.organizationId;

        if (isNew) {
            createWarehouseMutation.mutate({ ...formData, organizationId: orgId }, {
                onSuccess: () => onClose()
            });
        } else {
            updateWarehouseMutation.mutate({ ...warehouse!, ...formData }, {
                onSuccess: () => onClose()
            });
        }
    };

    const handleDelete = () => {
        if (warehouse && window.confirm(`Are you sure you want to delete "${warehouse.name}"?`)) {
            deleteWarehouseMutation.mutate(warehouse.id, {
                onSuccess: () => onClose()
            });
        }
    };

    const isPending = createWarehouseMutation.isPending || updateWarehouseMutation.isPending || deleteWarehouseMutation.isPending;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isNew ? 'New Warehouse' : `Edit Warehouse`}>
            <div className="space-y-4">
                <Input id="name" label="Warehouse Name" value={formData.name} onChange={e => handleChange('name', e.target.value)} required disabled={isPending} />
                <Input id="location" label="Location" value={formData.location} onChange={e => handleChange('location', e.target.value)} disabled={isPending} />
            </div>
            <div className="mt-6 flex justify-between items-center">
                 <div>
                    {!isNew && (
                        <Button variant="danger" onClick={handleDelete} disabled={isPending} leftIcon={<Trash2 size={16} />}>
                            {deleteWarehouseMutation.isPending ? 'Deleting...' : 'Delete'}
                        </Button>
                    )}
                </div>
                <div className="flex space-x-2">
                    <Button variant="secondary" onClick={onClose} disabled={isPending}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isPending}>{isPending ? 'Saving...' : 'Save'}</Button>
                </div>
            </div>
        </Modal>
    );
};

export default WarehouseEditModal;
