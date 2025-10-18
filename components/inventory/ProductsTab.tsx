import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Product, ProductDataHygieneSuggestion } from '../../types';
import Button from '../ui/Button';
import { Plus, Sparkles, Loader } from 'lucide-react';
import ProductEditModal from './ProductEditModal';
import { useApp } from '../../contexts/AppContext';
import toast from 'react-hot-toast';
import { GoogleGenAI, Type } from '@google/genai';
import ProductDataHygieneModal from './ProductDataHygieneModal';

const ProductsTab: React.FC = () => {
    const { productsQuery } = useData();
    const { authenticatedUser } = useAuth();
    const { isFeatureEnabled } = useApp();
    const { data: products = [], isLoading } = productsQuery;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const [isHygieneModalOpen, setIsHygieneModalOpen] = useState(false);
    const [hygieneResults, setHygieneResults] = useState<ProductDataHygieneSuggestion | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleEdit = (product: Product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedProduct(null);
        setIsModalOpen(true);
    };

    const handleAnalyzeDataHygiene = async () => {
        setIsAnalyzing(true);
        toast.promise(
            (async () => {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
                const productSample = (products as Product[]).slice(0, 50).map(p => ({ id: p.id, name: p.name, sku: p.sku, category: p.category }));
                
                const prompt = `You are a data hygiene expert for a CRM's product inventory. Analyze this list of products: ${JSON.stringify(productSample)}.
    Identify potential duplicate products and products with formatting issues.
    
    Your response MUST be a JSON object with two keys: 'duplicates' and 'formatting'.
    - 'duplicates': An array of arrays, where each inner array contains the IDs of products that are likely duplicates of each other. Group them based on similar names or SKUs.
    - 'formatting': An array of objects for products that need formatting fixes. Each object should have 'productId', 'productName', 'suggestion' (e.g., 'Capitalize name'), 'field' (e.g., 'name' or 'category'), and 'newValue'. Only suggest fixes for obviously incorrect formatting, like all-lowercase names.`;
    
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                duplicates: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
                                formatting: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            productId: { type: Type.STRING },
                                            productName: { type: Type.STRING },
                                            suggestion: { type: Type.STRING },
                                            field: { type: Type.STRING },
                                            newValue: { type: Type.STRING }
                                        }
                                    }
                                }
                            }
                        }
                    }
                });
                
                const results = JSON.parse(response.text);
                setHygieneResults(results);
                setIsHygieneModalOpen(true);
            })(),
            {
                loading: 'AI is analyzing your product data...',
                success: 'Analysis complete!',
                error: 'AI analysis failed. Please try again.',
            }
        ).finally(() => setIsAnalyzing(false));
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-text-primary">Products</h3>
                <div className="flex items-center gap-2">
                    {isFeatureEnabled('aiProductDataHygiene') && (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleAnalyzeDataHygiene}
                            leftIcon={isAnalyzing ? <Loader size={16} className="animate-spin"/> : <Sparkles size={16} />}
                            disabled={isAnalyzing}
                        >
                            AI Data Hygiene
                        </Button>
                    )}
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
            {hygieneResults && (
                <ProductDataHygieneModal
                    isOpen={isHygieneModalOpen}
                    onClose={() => setIsHygieneModalOpen(false)}
                    initialResults={hygieneResults}
                />
            )}
        </div>
    );
};

export default ProductsTab;