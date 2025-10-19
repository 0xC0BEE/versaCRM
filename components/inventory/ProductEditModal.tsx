import React, { useMemo, useState } from 'react';
import { Product, ProductOption, PricingRule, ProductOptionChoice } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import { useData } from '../../contexts/DataContext';
import { useForm } from '../../hooks/useForm';
import toast from 'react-hot-toast';
import { Trash2, Plus } from 'lucide-react';
import Tabs from '../ui/Tabs';
import Select from '../ui/Select';
import MultiSelectDropdown from '../ui/MultiSelectDropdown';

interface ProductEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
    organizationId: string;
}

const ProductEditModal: React.FC<ProductEditModalProps> = ({ isOpen, onClose, product, organizationId }) => {
    const { productsQuery, createProductMutation, updateProductMutation, deleteProductMutation } = useData();
    const { data: allProducts = [] } = productsQuery;
    const isNew = !product;
    const [activeTab, setActiveTab] = useState('General');

    const initialState = useMemo(() => ({
        name: '', sku: '', category: '', description: '', costPrice: 0, salePrice: 0, stockLevel: 0,
        organizationId: organizationId,
        isBundle: false, bundleItemIds: [] as string[],
        options: [] as ProductOption[], pricingRules: [] as PricingRule[],
    }), [organizationId]);
    
    const formDependency = useMemo(() => {
        // Correctly handle merging optional product description
        if (!product) return null;
        return {
            ...initialState,
            ...product,
            description: product.description || '',
        };
    }, [product, initialState]);

    const { formData, setFormData, handleChange } = useForm(initialState, formDependency);

    const handleSave = () => {
        if (!formData.name.trim() || !formData.sku.trim()) {
            toast.error("Product Name and SKU are required.");
            return;
        }
        if (isNew) {
            createProductMutation.mutate(formData as Omit<Product, 'id'>, { onSuccess: onClose });
        } else {
            updateProductMutation.mutate({ ...product!, ...formData }, { onSuccess: onClose });
        }
    };

    const handleDelete = () => {
        if (product) deleteProductMutation.mutate(product.id, { onSuccess: onClose });
    };

    const isPending = createProductMutation.isPending || updateProductMutation.isPending || deleteProductMutation.isPending;

    const GeneralTab = () => (
        <div className="space-y-4">
            <Input id="name" label="Product Name" value={formData.name} onChange={e => handleChange('name', e.target.value)} required disabled={isPending} />
            <div className="grid grid-cols-2 gap-4">
                <Input id="sku" label="SKU" value={formData.sku} onChange={e => handleChange('sku', e.target.value)} required disabled={isPending} />
                <Input id="category" label="Category" value={formData.category} onChange={e => handleChange('category', e.target.value)} disabled={isPending} />
            </div>
            <Textarea id="description" label="Description" value={formData.description || ''} onChange={e => handleChange('description', e.target.value)} disabled={isPending} />
             <div className="grid grid-cols-3 gap-4">
                <Input id="costPrice" label="Cost Price" type="number" value={formData.costPrice} onChange={e => handleChange('costPrice', parseFloat(e.target.value) || 0)} disabled={isPending} />
                <Input id="salePrice" label="Sale Price" type="number" value={formData.salePrice} onChange={e => handleChange('salePrice', parseFloat(e.target.value) || 0)} disabled={isPending} />
                <Input id="stockLevel" label="Stock Level" type="number" value={formData.stockLevel} onChange={e => handleChange('stockLevel', parseInt(e.target.value) || 0)} disabled={isPending} />
            </div>
        </div>
    );
    
    const ConfigurationTab = () => {
        const productType = formData.isBundle ? 'bundle' : (formData.options && formData.options.length > 0 ? 'configurable' : 'standard');
        
        const setProductType = (type: string) => {
            if (type === 'bundle') {
                setFormData(p => ({ ...p, isBundle: true, options: [] }));
            } else if (type === 'configurable') {
                setFormData(p => ({ ...p, isBundle: false, options: p.options?.length ? p.options : [{ name: 'New Option', choices: [{ name: 'Default', priceAdjustment: 0 }] }] }));
            } else { // standard
                setFormData(p => ({ ...p, isBundle: false, options: [] }));
            }
        };

        const addOption = () => setFormData(p => ({...p, options: [...(p.options || []), { name: 'New Option', choices: [{ name: 'Default', priceAdjustment: 0 }]}]}));
        const removeOption = (index: number) => setFormData(p => ({...p, options: p.options?.filter((_, i) => i !== index)}));
        const updateOptionName = (index: number, name: string) => setFormData(p => ({...p, options: p.options?.map((opt, i) => i === index ? {...opt, name} : opt)}));
        
        const addChoice = (optIndex: number) => setFormData(p => ({...p, options: p.options?.map((opt, i) => i === optIndex ? {...opt, choices: [...opt.choices, {name: 'New Choice', priceAdjustment: 0}]} : opt)}));
        const removeChoice = (optIndex: number, choiceIndex: number) => setFormData(p => ({...p, options: p.options?.map((opt, i) => i === optIndex ? {...opt, choices: opt.choices.filter((_, ci) => ci !== choiceIndex)} : opt)}));
        const updateChoice = (optIndex: number, choiceIndex: number, field: keyof ProductOptionChoice, value: any) => {
            setFormData(p => ({...p, options: p.options?.map((opt, i) => i === optIndex ? {
                ...opt, choices: opt.choices.map((c, ci) => ci === choiceIndex ? {...c, [field]: value} : c)
            } : opt)}));
        };

        return (
            <div className="space-y-4">
                <Select id="product-type" label="Product Type" value={productType} onChange={e => setProductType(e.target.value)}>
                    <option value="standard">Standard Product</option>
                    <option value="configurable">Configurable Product</option>
                    <option value="bundle">Bundle</option>
                </Select>
                {productType === 'bundle' && (
                    <MultiSelectDropdown
                        options={(allProducts as Product[]).filter(p => p.id !== product?.id).map(p => ({value: p.id, label: p.name}))}
                        selectedValues={formData.bundleItemIds || []}
                        onChange={ids => handleChange('bundleItemIds', ids)}
                        placeholder="Select products for this bundle..."
                    />
                )}
                {productType === 'configurable' && (
                    <div className="space-y-3">
                        {(formData.options || []).map((option, optIndex) => (
                            <div key={optIndex} className="p-3 border border-border-subtle rounded-md">
                                <div className="flex justify-between items-center mb-2">
                                    <Input id={`opt-name-${optIndex}`} label="Option Name" value={option.name} onChange={e => updateOptionName(optIndex, e.target.value)} />
                                    <Button size="icon" variant="danger" className="h-8 w-8 mt-6" onClick={() => removeOption(optIndex)}><Trash2 size={14}/></Button>
                                </div>
                                <div className="space-y-1 pl-2">
                                    {option.choices.map((choice, choiceIndex) => (
                                        <div key={choiceIndex} className="flex items-center gap-2">
                                            <Input id={`choice-name-${optIndex}-${choiceIndex}`} label="" value={choice.name} onChange={e => updateChoice(optIndex, choiceIndex, 'name', e.target.value)} className="flex-grow"/>
                                            <Input id={`choice-price-${optIndex}-${choiceIndex}`} label="" type="number" value={choice.priceAdjustment} onChange={e => updateChoice(optIndex, choiceIndex, 'priceAdjustment', parseFloat(e.target.value))} className="w-28"/>
                                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => removeChoice(optIndex, choiceIndex)}><Trash2 size={14}/></Button>
                                        </div>
                                    ))}
                                    <Button size="sm" variant="secondary" onClick={() => addChoice(optIndex)} leftIcon={<Plus size={14}/>}>Add Choice</Button>
                                </div>
                            </div>
                        ))}
                        <Button onClick={addOption} leftIcon={<Plus size={14}/>}>Add Option</Button>
                    </div>
                )}
            </div>
        );
    };

    const PricingRulesTab = () => {
        const addRule = () => setFormData(p => ({...p, pricingRules: [...(p.pricingRules || []), { condition: { type: 'quantity_gt', value: 0 }, action: { type: 'percent_discount', value: 0 }}]}));
        const removeRule = (index: number) => setFormData(p => ({...p, pricingRules: p.pricingRules?.filter((_, i) => i !== index)}));
        const updateRule = (index: number, field: 'condition' | 'action', subfield: string, value: any) => {
            setFormData(p => ({...p, pricingRules: p.pricingRules?.map((rule, i) => i === index ? {
                ...rule, [field]: { ...rule[field], [subfield]: value }
            } : rule)}));
        };

        return (
            <div className="space-y-3">
                {(formData.pricingRules || []).map((rule, index) => (
                    <div key={index} className="p-3 flex items-end gap-2 border border-border-subtle rounded-md">
                        <p className="text-sm self-center">If</p>
                        <Select id={`rule-cond-type-${index}`} label="Condition" value={rule.condition.type}>
                            <option value="quantity_gt">Quantity is greater than</option>
                        </Select>
                        <Input id={`rule-cond-val-${index}`} label="Value" type="number" value={rule.condition.value} onChange={e => updateRule(index, 'condition', 'value', parseInt(e.target.value))}/>
                        <p className="text-sm self-center">then</p>
                        <Select id={`rule-act-type-${index}`} label="Action" value={rule.action.type}>
                            <option value="percent_discount">Apply % discount</option>
                        </Select>
                        <Input id={`rule-act-val-${index}`} label="Value" type="number" value={rule.action.value} onChange={e => updateRule(index, 'action', 'value', parseInt(e.target.value))}/>
                        <Button size="icon" variant="danger" className="h-10 w-10" onClick={() => removeRule(index)}><Trash2 size={14}/></Button>
                    </div>
                ))}
                <Button onClick={addRule} leftIcon={<Plus size={14}/>}>Add Rule</Button>
            </div>
        );
    };

    const tabs = ['General', 'Configuration', 'Pricing Rules'];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isNew ? 'New Product' : 'Edit Product'} size="3xl">
            <div className="mb-4">
                <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
            <div className="max-h-[60vh] overflow-y-auto pr-2">
                {activeTab === 'General' && <GeneralTab />}
                {activeTab === 'Configuration' && <ConfigurationTab />}
                {activeTab === 'Pricing Rules' && <PricingRulesTab />}
            </div>
            <div className="mt-6 flex justify-between items-center">
                <div>{!isNew && <Button variant="danger" onClick={handleDelete} disabled={isPending} leftIcon={<Trash2 size={16}/>}>{isPending ? 'Deleting...' : 'Delete'}</Button>}</div>
                <div className="flex space-x-2">
                    <Button variant="secondary" onClick={onClose} disabled={isPending}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isPending}>{isPending ? 'Saving...' : 'Save'}</Button>
                </div>
            </div>
        </Modal>
    );
};

export default ProductEditModal;
