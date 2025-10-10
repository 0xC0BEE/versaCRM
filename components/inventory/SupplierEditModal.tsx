import React, { useMemo } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Supplier } from '../../types';
import toast from 'react-hot-toast';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Trash2 } from 'lucide-react';
import { useForm } from '../../hooks/useForm';

interface SupplierEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    supplier: Supplier | null;
}

const SupplierEditModal: React.FC<SupplierEditModalProps> = ({ isOpen, onClose, supplier }) => {
    const { createSupplierMutation, updateSupplierMutation, deleteSupplierMutation } = useData();
    const { authenticatedUser } = useAuth();
    const isNew = !supplier;

    const initialState = useMemo(() => ({
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
    }), []);

    const { formData, handleChange } = useForm(initialState, supplier);

    const handleSave = () => {
        if (!formData.name.trim()) {
            toast.error("Supplier Name is required.");
            return;
        }

        const orgId = authenticatedUser!.organizationId;

        if (isNew) {
            createSupplierMutation.mutate({ ...formData, organizationId: orgId }, {
                onSuccess: () => onClose()
            });
        } else {
            updateSupplierMutation.mutate({ ...supplier!, ...formData }, {
                onSuccess: () => onClose()
            });
        }
    };

    const handleDelete = () => {
        if (supplier && window.confirm(`Are you sure you want to delete "${supplier.name}"?`)) {
            deleteSupplierMutation.mutate(supplier.id, {
                onSuccess: () => onClose()
            });
        }
    };

    const isPending = createSupplierMutation.isPending || updateSupplierMutation.isPending || deleteSupplierMutation.isPending;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isNew ? 'New Supplier' : `Edit Supplier`}>
            <div className="space-y-4">
                <Input id="name" label="Supplier Name" value={formData.name} onChange={e => handleChange('name', e.target.value)} required disabled={isPending} />
                <Input id="contactPerson" label="Contact Person" value={formData.contactPerson} onChange={e => handleChange('contactPerson', e.target.value)} disabled={isPending} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input id="email" label="Email" type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} disabled={isPending} />
                    <Input id="phone" label="Phone" type="tel" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} disabled={isPending} />
                </div>
            </div>
            <div className="mt-6 flex justify-between items-center">
                <div>
                    {!isNew && (
                        <Button variant="danger" onClick={handleDelete} disabled={isPending} leftIcon={<Trash2 size={16} />}>
                            {deleteSupplierMutation.isPending ? 'Deleting...' : 'Delete'}
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

export default SupplierEditModal;
