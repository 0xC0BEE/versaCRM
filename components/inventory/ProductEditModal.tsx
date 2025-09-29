import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
// FIX: Imported the Product type.
import { Product } from '../../types';
import toast from 'react-hot-toast';

interface ProductEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
    organizationId: string;
}

const ProductEditModal: React.FC<ProductEditModalProps> = ({ isOpen, onClose, product, organizationId }) => {
    
    const getInitialState = (): Omit<Product, 'id' | 'organizationId'> => {
        if (product) return { ...product };
        return {
            name: '',
            sku: '',
            category: '',
            description: '',
            // FIX: Changed 'purchasePrice' to 'costPrice' to match the Product type.
            costPrice: 0,
            salePrice: 0,
            stockLevel: 0,
        };
    };
    
    const [data, setData] = useState(getInitialState());

    useEffect(() => {
        if(isOpen) {
            setData(getInitialState());
        }
    }, [isOpen, product]);
    
    const handleChange = (field: keyof Omit<Product, 'id' | 'organizationId' | 'supplierId' | 'warehouseId'>, value: string) => {
        // FIX: Cast field to string for array includes check
        const isNumeric = ['costPrice', 'salePrice', 'stockLevel'].includes(field as string);
        setData(prev => ({...prev, [field]: isNumeric ? parseFloat(value) || 0 : value }));
    };

    const handleSave = () => {
        if (!data.name || !data.sku) {
            toast.error("Product Name and SKU are required.");
            return;
        }
        // Mock save
        toast.success(`Product "${data.name}" saved!`);
        console.log("Saving product:", { ...data, organizationId });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={product ? `Edit ${product.name}` : 'Add New Product'}>
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input id="name" label="Product Name" value={data.name} onChange={e => handleChange('name', e.target.value)} required />
                    <Input id="sku" label="SKU" value={data.sku} onChange={e => handleChange('sku', e.target.value)} required />
                </div>
                 <Input id="category" label="Category" value={data.category} onChange={e => handleChange('category', e.target.value)} />
                 <Textarea id="description" label="Description" value={data.description || ''} onChange={e => handleChange('description', e.target.value)} />
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* FIX: Changed id and onChange handler to use 'costPrice'. */}
                    <Input id="costPrice" label="Cost Price" type="number" value={data.costPrice} onChange={e => handleChange('costPrice', e.target.value)} />
                    <Input id="salePrice" label="Sale Price" type="number" value={data.salePrice} onChange={e => handleChange('salePrice', e.target.value)} />
                    <Input id="stockLevel" label="Stock Level" type="number" value={data.stockLevel} onChange={e => handleChange('stockLevel', e.target.value)} />
                 </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave}>Save</Button>
            </div>
        </Modal>
    );
};

export default ProductEditModal;
