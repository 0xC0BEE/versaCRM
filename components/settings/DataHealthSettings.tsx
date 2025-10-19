import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { AnyContact, Product, FormattingSuggestion, ProductFormattingSuggestion } from '../../types';
import Button from '../ui/Button';
import { Check, ShieldCheck, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import Tabs from '../ui/Tabs';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

const DataHealthSettings: React.FC = () => {
    const { 
        dataHygieneQuery,
        contactsQuery, 
        productsQuery,
        updateContactMutation, 
        updateProductMutation 
    } = useData();
    
    const { data: hygieneResults, isLoading, refetch } = dataHygieneQuery;
    const { data: allContacts = [] } = contactsQuery;
    const { data: allProducts = [] } = productsQuery;
    
    const [activeTab, setActiveTab] = useState('Contact Duplicates');
    
    const contactMap = useMemo(() => new Map((allContacts as AnyContact[]).map(c => [c.id, c])), [allContacts]);
    const productMap = useMemo(() => new Map((allProducts as Product[]).map(p => [p.id, p])), [allProducts]);
    
    const { contactDuplicates, contactFormatting, productDuplicates, productFormatting } = useMemo(() => {
        return {
            contactDuplicates: hygieneResults?.contactHygiene?.duplicates || [],
            contactFormatting: hygieneResults?.contactHygiene?.formatting || [],
            productDuplicates: hygieneResults?.productHygiene?.duplicates || [],
            productFormatting: hygieneResults?.productHygiene?.formatting || [],
        };
    }, [hygieneResults]);
    
    const totalIssues = contactDuplicates.length + contactFormatting.length + productDuplicates.length + productFormatting.length;
    const totalRecords = allContacts.length + allProducts.length;
    const healthScore = totalRecords > 0 ? Math.max(0, Math.round((1 - (totalIssues / totalRecords)) * 100)) : 100;

    const handleApplyContactFix = (suggestion: FormattingSuggestion) => {
        const contactToUpdate = contactMap.get(suggestion.contactId);
        if (!contactToUpdate) return toast.error("Contact not found.");
        
        const updatedContact = { ...contactToUpdate, [suggestion.field]: suggestion.newValue };
        updateContactMutation.mutate(updatedContact, {
            onSuccess: () => {
                toast.success("Formatting fix applied!");
                refetch();
            }
        });
    };

    const handleApplyProductFix = (suggestion: ProductFormattingSuggestion) => {
        const productToUpdate = productMap.get(suggestion.productId);
        if (!productToUpdate) return toast.error("Product not found.");

        const updatedProduct = { ...productToUpdate, [suggestion.field]: suggestion.newValue };
        updateProductMutation.mutate(updatedProduct, {
            onSuccess: () => {
                toast.success("Formatting fix applied!");
                refetch();
            }
        });
    };

    const isPending = updateContactMutation.isPending || updateProductMutation.isPending;

    const renderContent = () => {
        if (isLoading) {
            return <p>Analyzing data...</p>;
        }
        if (!hygieneResults) {
            return <p>Could not load data health suggestions.</p>;
        }

        switch (activeTab) {
            case 'Contact Duplicates':
                return (
                     <div className="space-y-4">
                        {contactDuplicates.length > 0 ? contactDuplicates.map((group, index) => (
                            <div key={index} className="p-4 border border-border-subtle rounded-lg bg-hover-bg">
                                <h4 className="font-semibold text-sm mb-2">Potential Duplicate Group {index + 1}</h4>
                                <ul className="space-y-2">
                                    {group.map(contactId => {
                                        const contact = contactMap.get(contactId);
                                        return <li key={contactId} className="text-sm"><span>{contact?.contactName} ({contact?.email})</span></li>;
                                    })}
                                </ul>
                                <div className="text-right mt-3"><Button size="sm" variant="secondary" onClick={() => toast('Merge functionality coming soon!', { icon: '🚧' })}>Review & Merge</Button></div>
                            </div>
                        )) : <p className="text-sm text-center py-8 text-text-secondary">No potential contact duplicates found.</p>}
                    </div>
                );
            case 'Contact Formatting':
                return (
                    <div className="space-y-3">
                        {contactFormatting.length > 0 ? contactFormatting.map(suggestion => (
                            <div key={suggestion.contactId} className="p-3 border border-border-subtle rounded-lg flex justify-between items-center">
                                <div><p className="font-medium text-sm">{suggestion.contactName}</p><p className="text-xs text-text-secondary">{suggestion.suggestion}</p></div>
                                <Button size="sm" variant="secondary" onClick={() => handleApplyContactFix(suggestion)} disabled={isPending} leftIcon={<Check size={14} />}>Apply Fix</Button>
                            </div>
                        )) : <p className="text-sm text-center py-8 text-text-secondary">No contact formatting suggestions found.</p>}
                    </div>
                );
            case 'Product Duplicates':
                return (
                     <div className="space-y-4">
                        {productDuplicates.length > 0 ? productDuplicates.map((group, index) => (
                            <div key={index} className="p-4 border border-border-subtle rounded-lg bg-hover-bg">
                                <h4 className="font-semibold text-sm mb-2">Potential Duplicate Group {index + 1}</h4>
                                <ul className="space-y-2">
                                    {group.map(productId => {
                                        const product = productMap.get(productId);
                                        return <li key={productId} className="text-sm"><span>{product?.name} (SKU: {product?.sku})</span></li>;
                                    })}
                                </ul>
                                <div className="text-right mt-3"><Button size="sm" variant="secondary" onClick={() => toast('Merge functionality coming soon!', { icon: '🚧' })}>Review & Merge</Button></div>
                            </div>
                        )) : <p className="text-sm text-center py-8 text-text-secondary">No potential product duplicates found.</p>}
                    </div>
                );
            case 'Product Formatting':
                return (
                    <div className="space-y-3">
                        {productFormatting.length > 0 ? productFormatting.map(suggestion => (
                            <div key={suggestion.productId} className="p-3 border border-border-subtle rounded-lg flex justify-between items-center">
                                <div><p className="font-medium text-sm">{suggestion.productName}</p><p className="text-xs text-text-secondary">{suggestion.suggestion}</p></div>
                                <Button size="sm" variant="secondary" onClick={() => handleApplyProductFix(suggestion)} disabled={isPending} leftIcon={<Check size={14} />}>Apply Fix</Button>
                            </div>
                        )) : <p className="text-sm text-center py-8 text-text-secondary">No product formatting suggestions found.</p>}
                    </div>
                );
        }
    };


    return (
        <div>
            <h3 className="text-lg font-semibold">Data Health Center</h3>
            <p className="text-sm text-text-secondary mb-4">
                Review AI-powered suggestions to improve your data quality.
            </p>
            
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Data Health Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div className="p-4 bg-hover-bg rounded-lg">
                            <p className="text-sm font-medium text-text-secondary">Overall Health Score</p>
                            <p className="text-3xl font-bold text-primary">{healthScore}%</p>
                        </div>
                         <div className="p-4 bg-hover-bg rounded-lg">
                            <p className="text-sm font-medium text-text-secondary">Potential Duplicates</p>
                            <p className="text-3xl font-bold text-text-heading">{contactDuplicates.length + productDuplicates.length}</p>
                        </div>
                         <div className="p-4 bg-hover-bg rounded-lg">
                            <p className="text-sm font-medium text-text-secondary">Formatting Issues</p>
                            <p className="text-3xl font-bold text-text-heading">{contactFormatting.length + productFormatting.length}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Tabs
                tabs={[
                    `Contact Duplicates (${contactDuplicates.length})`, 
                    `Contact Formatting (${contactFormatting.length})`,
                    `Product Duplicates (${productDuplicates.length})`,
                    `Product Formatting (${productFormatting.length})`
                ]}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />
            <div className="mt-4">
                {renderContent()}
            </div>
        </div>
    );
};

export default DataHealthSettings;