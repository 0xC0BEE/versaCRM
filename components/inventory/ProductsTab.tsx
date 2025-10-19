import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Product } from '../../types';
import Button from '../ui/Button';
import { Plus } from 'lucide-react';
import ProductEditModal from './ProductEditModal';

const ProductsTab: React.FC = () => {
    const { productsQuery } = useData();
    const { authenticatedUser } = useAuth();
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
                <h3 className="text-lg font-semibold text-text-primary">Products</h3>
                <div className="flex items-center gap-2">
                    <Button size="sm" onClick={handleAdd} leftIcon={<Plus size={14} />}>
                        New Product
                    </Button>
                </div>
            </div>
            {isLoading ? (
                <p className="text-text-secondary">Loading products...</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-text-secondary">
                        <thead className="text-sm text-text-secondary uppercase bg-card-bg/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 font-medium">Name</th>
                                <th scope="col" className="px-6 py-3 font-medium">SKU</th>
                                <th scope="col" className="px-6 py-3 font-medium">Category</th>
                                <th scope="col" className="px-6 py-3 font-medium text-right">Sale Price</th>
                                <th scope="col" className="px-6 py-3 font-medium text-right">Stock Level</th>
                                <th scope="col" className="px-6 py-3 font-medium"><span className="sr-only">Edit</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product: Product) => (
                                <tr key={product.id} className="border-b border-border-subtle hover:bg-hover-bg h-[52px]">
                                    <td className="px-6 py-4 font-medium text-text-primary cursor-pointer" onClick={() => handleEdit(product)}>{product.name}</td>
                                    <td className="px-6 py-4 cursor-pointer" onClick={() => handleEdit(product)}>{product.sku}</td>
                                    <td className="px-6 py-4 cursor-pointer" onClick={() => handleEdit(product)}>{product.category}</td>
                                    <td className="px-6 py-4 text-right cursor-pointer" onClick={() => handleEdit(product)}>{product.salePrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                                    <td className="px-6 py-4 text-right cursor-pointer" onClick={() => handleEdit(product)}>{product.stockLevel}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={(e) => { e.stopPropagation(); handleEdit(product); }} className="font-medium text-primary hover:underline">Edit</button>
                                    </td>
                                </tr>
                            ))}
                            {products.length === 0 && (
                                <tr><td colSpan={6} className="text-center p-8 text-text-secondary">No products found.</td></tr>
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
                    organizationId={authenticatedUser!.organizationId!}
                />
            )}
        </div>
    );
};

export default ProductsTab;