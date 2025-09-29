import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import { Plus } from 'lucide-react';
// FIX: Imported the Product type.
import { Product } from '../../types';
import ProductEditModal from './ProductEditModal';

const ProductsTab: React.FC = () => {
    const { authenticatedUser } = useAuth();
    const organizationId = authenticatedUser?.organizationId || '';
    const { productsQuery } = useData();
    const { data: products = [], isLoading } = productsQuery;
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const handleEdit = (product: Product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedProduct(null);
        setIsModalOpen(true);
    };
    
    return (
        <div>
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Products</h3>
                <Button size="sm" variant="secondary" onClick={handleAdd} leftIcon={<Plus size={14} />}>Add Product</Button>
            </div>
            {isLoading ? (
                <div>Loading products...</div>
            ) : (
                <div className="overflow-x-auto">
                     <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Name</th>
                                <th scope="col" className="px-6 py-3">SKU</th>
                                <th scope="col" className="px-6 py-3">Category</th>
                                <th scope="col" className="px-6 py-3">Sale Price</th>
                                <th scope="col" className="px-6 py-3">Stock Level</th>
                                <th scope="col" className="px-6 py-3"><span className="sr-only">Edit</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product.id} className="bg-white border-b dark:bg-dark-card dark:border-dark-border hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{product.name}</td>
                                    <td className="px-6 py-4">{product.sku}</td>
                                    <td className="px-6 py-4">{product.category}</td>
                                    <td className="px-6 py-4">{product.salePrice.toLocaleString('en-US', {style: 'currency', currency: 'USD'})}</td>
                                    <td className="px-6 py-4">{product.stockLevel}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => handleEdit(product)} className="font-medium text-primary-600 dark:text-primary-500 hover:underline">Edit</button>
                                    </td>
                                </tr>
                            ))}
                            {products.length === 0 && (
                                <tr><td colSpan={6} className="text-center p-8">No products found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
            {isModalOpen && (
                <ProductEditModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    product={selectedProduct}
                    organizationId={organizationId}
                />
            )}
        </div>
    );
};

export default ProductsTab;
