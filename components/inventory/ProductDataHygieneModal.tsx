import React, { useState, useMemo, useEffect } from 'react';
import Modal from '../ui/Modal';
import { ProductDataHygieneSuggestion, ProductFormattingSuggestion, Product } from '../../types';
import Tabs from '../ui/Tabs';
import { useData } from '../../contexts/DataContext';
import Button from '../ui/Button';
import { Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProductDataHygieneModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialResults: ProductDataHygieneSuggestion;
}

const ProductDataHygieneModal: React.FC<ProductDataHygieneModalProps> = ({ isOpen, onClose, initialResults }) => {
    const { productsQuery, updateProductMutation } = useData();
    const { data: allProducts = [] } = productsQuery;
    const [results, setResults] = useState(initialResults);
    const [activeTab, setActiveTab] = useState('Duplicates');

    useEffect(() => {
        setResults(initialResults);
    }, [initialResults]);

    const productMap = useMemo(() => new Map((allProducts as Product[]).map(p => [p.id, p])), [allProducts]);

    const handleApplyFix = (suggestion: ProductFormattingSuggestion) => {
        const productToUpdate = productMap.get(suggestion.productId);
        if (!productToUpdate) return toast.error("Product not found.");

        const updatedProduct = { ...productToUpdate };
        (updatedProduct as any)[suggestion.field] = suggestion.newValue;

        updateProductMutation.mutate(updatedProduct, {
            onSuccess: () => {
                toast.success("Formatting fix applied!");
                setResults(prev => ({
                    ...prev,
                    formatting: prev.formatting.filter(f => f.productId !== suggestion.productId)
                }));
            }
        });
    };

    const DuplicatesTab = () => (
        <div className="space-y-4">
            {results.duplicates.length > 0 ? results.duplicates.map((group, index) => (
                <div key={index} className="p-4 border border-border-subtle rounded-lg bg-hover-bg">
                    <h4 className="font-semibold text-sm mb-2">Potential Duplicate Group {index + 1}</h4>
                    <ul className="space-y-2">
                        {group.map(productId => {
                            const product = productMap.get(productId);
                            return (
                                <li key={productId} className="text-sm flex justify-between items-center">
                                    <span>{product?.name} (SKU: {product?.sku})</span>
                                </li>
                            );
                        })}
                    </ul>
                    <div className="text-right mt-3">
                        <Button size="sm" variant="secondary" onClick={() => toast('Merge functionality coming soon!', { icon: '🚧' })}>
                            Review & Merge
                        </Button>
                    </div>
                </div>
            )) : <p className="text-sm text-center py-8 text-text-secondary">No potential duplicates found.</p>}
        </div>
    );

    const FormattingTab = () => (
        <div className="space-y-3">
            {results.formatting.length > 0 ? results.formatting.map(suggestion => (
                <div key={suggestion.productId} className="p-3 border border-border-subtle rounded-lg flex justify-between items-center">
                    <div>
                        <p className="font-medium text-sm">{suggestion.productName}</p>
                        <p className="text-xs text-text-secondary">{suggestion.suggestion}</p>
                    </div>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleApplyFix(suggestion)}
                        disabled={updateProductMutation.isPending}
                        leftIcon={<Check size={14} />}
                    >
                        Apply Fix
                    </Button>
                </div>
            )) : <p className="text-sm text-center py-8 text-text-secondary">No formatting suggestions found.</p>}
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="AI Product Data Hygiene" size="2xl">
            <div className="min-h-[40vh] max-h-[60vh] overflow-y-auto">
                <Tabs
                    tabs={[`Duplicates (${results.duplicates.length})`, `Formatting (${results.formatting.length})`]}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />
                <div className="mt-4">
                    {activeTab === 'Duplicates' ? <DuplicatesTab /> : <FormattingTab />}
                </div>
            </div>
        </Modal>
    );
};

export default ProductDataHygieneModal;