import React, { useMemo } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
// FIX: Corrected the import path for types to be a valid relative path.
import { Product } from '../../types';
import toast from 'react-hot-toast';
// FIX: Corrected the import path for DataContext to be a valid relative path.
import { useData } from '../../contexts/DataContext';
import { Trash2 } from 'lucide-react';
import { useForm } from '../../hooks/useForm';

interface ProductEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
    organizationId: string;
}

const ProductEditModal: React.FC<ProductEditModalProps> = ({ isOpen, onClose, product, organizationId }) => {
    const { createProductMutation, updateProductMutation, deleteProductMutation } = useData();
    const isNew = !product;

    const initialState = useMemo(() => ({
        name: '',
        sku: '',
        category: '',
        description: '',
        costPrice: 0,
        salePrice: 0,
        stockLevel: 0,
    }), []);
    
    // FIX: The `product` prop can have an optional `description`, which is incompatible with `initialState` where `description` is a required string.
    // This creates a memoized dependency that merges the product with the initial state to ensure type compatibility with the useForm hook.
    const formDependency = useMemo(() => {
        return product ? { ...initialState, ...product } : null;
    }, [product, initialState]);

    const { formData, handleChange } = useForm(initialState, formDependency);
    
    const handleNumericChange = (field: keyof typeof initialState, value: string) => {
        handleChange(field, parseFloat(value) || 0);
    };

    const handleSave = () => {
        if (!formData.name.trim() || !formData.sku.trim()) {
            toast.error("Product Name and SKU are required.");
            return;
        }
        if (formData.costPrice < 0 || formData.salePrice < 0 || formData.stockLevel < 0) {
            toast.error("Prices and stock level cannot be negative.");
            return;
        }

        if (isNew) {
            createProductMutation.mutate({ ...formData, organizationId }, {
                onSuccess: () => onClose()
            });
        } else {
            updateProductMutation.mutate({ ...product, ...formData } as Product, {
                onSuccess: () => onClose()
            });
        }
    };
    
    const handleDelete = () => {
        if (product && window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
            deleteProductMutation.mutate(product.id, {
                onSuccess: () => onClose()
            });
        }
    };

    const isPending = createProductMutation.isPending || updateProductMutation.isPending || deleteProductMutation.isPending;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={product ? `Edit ${product.name}` : 'Add New Product'}>
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input id="name" label="Product Name" value={formData.name} onChange={e => handleChange('name', e.target.value)} required disabled={isPending} />
                    <Input id="sku" label="SKU" value={formData.sku} onChange={e => handleChange('sku', e.target.value)} required disabled={isPending} />
                </div>
                 <Input id="category" label="Category" value={formData.category} onChange={e => handleChange('category', e.target.value)} disabled={isPending} />
                 <Textarea id="description" label="Description" value={formData.description || ''} onChange={e => handleChange('description', e.target.value)} disabled={isPending} />
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input id="costPrice" label="Cost Price" type="number" value={formData.costPrice} onChange={e => handleNumericChange('costPrice', e.target.value)} disabled={isPending} />
                    <Input id="salePrice" label="Sale Price" type="number" value={formData.salePrice} onChange={e => handleNumericChange('salePrice', e.target.value)} disabled={isPending} />
                    <Input id="stockLevel" label="Stock Level" type="number" value={formData.stockLevel} onChange={e => handleNumericChange('stockLevel', e.target.value)} disabled={isPending} />
                 </div>
            </div>
            <div className="mt-6 flex justify-between items-center">
                 <div>
                    {!isNew && (
                        <Button variant="danger" onClick={handleDelete} disabled={isPending} leftIcon={<Trash2 size={16} />}>
                            {deleteProductMutation.isPending ? 'Deleting...' : 'Delete'}
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

export default ProductEditModal;