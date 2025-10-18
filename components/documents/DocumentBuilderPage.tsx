import React, { useState, useEffect, useMemo } from 'react';
import { DocumentTemplate, DocumentBlock, Product, User, DocumentLineItemBlockContent } from '../../types';
import PageWrapper from '../layout/PageWrapper';
import Button from '../ui/Button';
// FIX: Imported 'GripVertical' to resolve reference error.
import { ArrowLeft, Edit, Trash2, Heading, Type, Image as ImageIcon, Wand2, ListOrdered, Plus, Monitor, Share2, GripVertical } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Card } from '../ui/Card';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import AiContentStudioModal from '../ai/AiContentStudioModal';
import AiImageStudioModal from '../ai/AiImageStudioModal';
import Select from '../ui/Select';
import ShareDocumentModal from './ShareDocumentModal';

interface DocumentBuilderPageProps {
    templateToEdit: DocumentTemplate | null;
    onClose: () => void;
}

// FIX: Define a local type for document line items to ensure type safety.
type DocumentLineItem = DocumentLineItemBlockContent['items'][0];

const placeholders = [
    { label: 'Contact Name', value: '{{contact.contactName}}' },
    { label: 'Contact Email', value: '{{contact.email}}' },
    { label: 'Deal Name', value: '{{deal.name}}' },
    { label: 'Deal Value', value: '{{deal.value}}' },
    { label: 'Current Date', value: `{{now}}` },
];

const DocumentBuilderPage: React.FC<DocumentBuilderPageProps> = ({ templateToEdit, onClose }) => {
    const { createDocumentTemplateMutation, updateDocumentTemplateMutation, productsQuery, teamMembersQuery } = useData();
    const { data: products = [] } = productsQuery;
    const { data: teamMembers = [] } = teamMembersQuery;
    const { authenticatedUser } = useAuth();
    const isNew = !templateToEdit;

    const [template, setTemplate] = useState<Omit<DocumentTemplate, 'id' | 'organizationId'>>(() => 
        templateToEdit || { name: 'New Template', content: [], permissions: [] }
    );
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [isAiStudioOpen, setIsAiStudioOpen] = useState(false);
    const [isAiImageStudioOpen, setIsAiImageStudioOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    
    useEffect(() => {
        if (templateToEdit) setTemplate(templateToEdit);
    }, [templateToEdit]);

    const userMap = useMemo(() => new Map((teamMembers as User[]).map(u => [u.id, u])), [teamMembers]);

    const handleSave = () => {
        if (!template.name.trim()) return toast.error("Template name is required.");
        
        const templateData = { ...template, organizationId: authenticatedUser!.organizationId! };
        
        if (isNew) {
            createDocumentTemplateMutation.mutate(templateData as any, { onSuccess: onClose });
        } else {
            updateDocumentTemplateMutation.mutate({ ...templateToEdit!, ...templateData }, { onSuccess: onClose });
        }
    };

    const addBlock = (type: DocumentBlock['type']) => {
        const newId = `block_${Date.now()}`;
        let newBlock: DocumentBlock;
        switch(type) {
            case 'header':
                newBlock = { id: newId, type, content: { title: 'Your Main Headline', subtitle: 'A compelling subtitle goes here.' } };
                break;
            case 'text':
                newBlock = { id: newId, type, content: { text: 'This is a paragraph of text. Click to edit it in the configuration panel.' } };
                break;
            case 'image':
                newBlock = { id: newId, type, content: { src: 'https://via.placeholder.com/800x200', alt: 'Placeholder Image' } };
                break;
            case 'lineItems':
                newBlock = { id: newId, type, content: { items: [], taxRate: 0 } };
                break;
            default: return;
        }
        setTemplate(t => ({...t, content: [...t.content, newBlock]}));
        setSelectedBlockId(newId);
    };

    const updateBlock = (id: string, newContent: any) => {
        setTemplate(t => ({
            ...t,
            content: t.content.map(block => block.id === id ? { ...block, content: newContent } : block)
        }));
    };

    const removeBlock = (id: string) => {
        setTemplate(t => ({...t, content: t.content.filter(b => b.id !== id)}));
        if (selectedBlockId === id) setSelectedBlockId(null);
    };
    
    const insertPlaceholder = (value: string) => {
        if (selectedBlockId) {
            const block = template.content.find(b => b.id === selectedBlockId);
            if (block && block.type === 'text') {
                 updateBlock(selectedBlockId, { text: block.content.text + ` ${value} ` });
            }
        }
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => setDraggedIndex(index);
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;
        const newContent = [...template.content];
        const [movedBlock] = newContent.splice(draggedIndex, 1);
        newContent.splice(index, 0, movedBlock);
        setTemplate(t => ({...t, content: newContent}));
        setDraggedIndex(index);
    };
    const handleDragEnd = () => setDraggedIndex(null);

    const handleAiGenerateText = (generatedText: string) => {
        if (selectedBlockId) {
            const block = template.content.find(b => b.id === selectedBlockId);
            if (block && block.type === 'text') {
                 updateBlock(selectedBlockId, { text: generatedText });
            }
        }
    };
    
    const handleAiGenerateImage = (dataUrl: string) => {
        if (selectedBlockId) {
             const block = template.content.find(b => b.id === selectedBlockId);
            if (block && block.type === 'image') {
                updateBlock(selectedBlockId, { ...block.content, src: dataUrl });
            }
        }
    };

    const isPending = createDocumentTemplateMutation.isPending || updateDocumentTemplateMutation.isPending;
    const selectedBlock = template.content.find(b => b.id === selectedBlockId);

    const collaborators = useMemo(() => {
        if (!templateToEdit) return [authenticatedUser];
        const userIds = new Set(templateToEdit.permissions.map(p => p.userId));
        userIds.add(authenticatedUser!.id); // Always include current user
        return Array.from(userIds).map(id => userMap.get(id)).filter(Boolean);
    }, [templateToEdit, userMap, authenticatedUser]);
    
    const myPermission = useMemo(() => {
        if (isNew || !templateToEdit) return 'edit'; // Creator has edit access
        return templateToEdit.permissions.find(p => p.userId === authenticatedUser!.id)?.accessLevel || 'view';
    }, [templateToEdit, authenticatedUser, isNew]);

    const isReadOnly = myPermission === 'view';

    // This is the preview rendering logic
    const renderPreviewBlock = (block: DocumentBlock) => {
        switch(block.type) {
            case 'header': return (
                <div className="text-center py-8">
                    <h1 className="text-3xl font-bold">{block.content.title}</h1>
                    <p className="text-lg mt-2 text-gray-600">{block.content.subtitle}</p>
                </div>
            );
            case 'text': return <p className="py-2 whitespace-pre-wrap leading-relaxed">{block.content.text}</p>;
            case 'image': return <img src={block.content.src} alt={block.content.alt} className="w-full h-auto rounded-md" />;
            case 'lineItems': {
                // FIX: Cast items to DocumentLineItem[] and add a fallback for undefined to prevent runtime errors.
                const items = (block.content.items || []) as DocumentLineItem[];
                const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
                const tax = subtotal * (block.content.taxRate / 100);
                const total = subtotal + tax;
                return (
                    <div className="my-4">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-2">Item</th>
                                    <th className="p-2 text-right">Quantity</th>
                                    <th className="p-2 text-right">Unit Price</th>
                                    <th className="p-2 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, index) => (
                                    <tr key={index} className="border-b">
                                        <td className="p-2 font-medium">
                                            {item.name}
                                            {item.description && (
                                                <p className="text-xs text-gray-500 whitespace-pre-wrap font-normal">{item.description}</p>
                                            )}
                                        </td>
                                        <td className="p-2 text-right">{item.quantity}</td>
                                        <td className="p-2 text-right">{item.unitPrice.toLocaleString('en-US', {style:'currency', currency: 'USD'})}</td>
                                        <td className="p-2 text-right">{(item.quantity * item.unitPrice).toLocaleString('en-US', {style:'currency', currency: 'USD'})}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="w-full flex justify-end mt-4">
                            <div className="w-64 space-y-2 text-sm totals">
                                <div className="flex justify-between"><span>Subtotal</span><span>{subtotal.toLocaleString('en-US', {style:'currency', currency: 'USD'})}</span></div>
                                <div className="flex justify-between"><span>Tax ({block.content.taxRate}%)</span><span>{tax.toLocaleString('en-US', {style:'currency', currency: 'USD'})}</span></div>
                                <div className="flex justify-between font-bold text-base border-t pt-2 grand-total"><span>Total</span><span>{total.toLocaleString('en-US', {style:'currency', currency: 'USD'})}</span></div>
                            </div>
                        </div>
                    </div>
                );
            }
            default: return null;
        }
    };

    const renderConfigPanel = () => {
        if (!selectedBlock) return <p className="text-sm text-text-secondary">Select a block on the canvas to edit its properties.</p>;
        
        switch(selectedBlock.type) {
            case 'header': return (
                <div className="space-y-4">
                    <Input id="header-title" label="Title" value={selectedBlock.content.title} onChange={e => updateBlock(selectedBlock.id, { ...selectedBlock.content, title: e.target.value })} disabled={isReadOnly} />
                    <Textarea id="header-subtitle" label="Subtitle" value={selectedBlock.content.subtitle} onChange={e => updateBlock(selectedBlock.id, { ...selectedBlock.content, subtitle: e.target.value })} disabled={isReadOnly} />
                </div>
            );
            case 'text': return (
                <div className="space-y-4">
                    <Textarea id="text-content" label="Text" value={selectedBlock.content.text} rows={10} onChange={e => updateBlock(selectedBlock.id, { text: e.target.value })} disabled={isReadOnly} />
                    <Button variant="secondary" size="sm" className="w-full" onClick={() => setIsAiStudioOpen(true)} leftIcon={<Wand2 size={14} />} disabled={isReadOnly}>Generate with AI</Button>
                    <div>
                        <h4 className="text-sm font-semibold mt-4 mb-2">Placeholders</h4>
                        <div className="flex flex-wrap gap-1">
                            {placeholders.map(p => (
                                <button key={p.value} onClick={() => insertPlaceholder(p.value)} className="text-xs bg-hover-bg px-2 py-1 rounded hover:bg-primary/10 hover:text-primary transition-colors" disabled={isReadOnly}>
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            );
            case 'image': return (
                 <div className="space-y-4">
                    <Input id="image-src" label="Image URL or Data" value={selectedBlock.content.src} onChange={e => updateBlock(selectedBlock.id, { ...selectedBlock.content, src: e.target.value })} disabled={isReadOnly} />
                    <Button variant="secondary" size="sm" className="w-full" onClick={() => setIsAiImageStudioOpen(true)} leftIcon={<Wand2 size={14} />} disabled={isReadOnly}>Generate with AI</Button>
                </div>
            );
            case 'lineItems': {
                const items = (selectedBlock.content.items || []) as DocumentLineItem[];
                const taxRate = selectedBlock.content.taxRate || 0;

                const handleItemChange = (index: number, field: string, value: any) => {
                    const newItems = [...items];
                    const item: any = {...newItems[index]};
                    item[field] = value;

                    if(field === 'productId') {
                        // FIX: Cast `products` to `Product[]` to ensure correct type inference for `product`, fixing property access errors.
                        const product = (products as Product[]).find(p => p.id === value);
                        if (product) {
                            item.name = product.name;
                            item.unitPrice = product.salePrice;
                            item.selectedOptions = {}; // Reset options
                            
                            // Set default options
                            if (product.options) {
                                product.options.forEach(opt => {
                                    if (opt.choices.length > 0) {
                                        item.selectedOptions[opt.name] = opt.choices[0].name;
                                    }
                                });
                            }
                            
                            if (product.isBundle && product.bundleItemIds) {
                                const productMap = new Map((products as Product[]).map((p: Product) => [p.id, p]));
                                const bundleContents = product.bundleItemIds
                                    .map(id => productMap.get(id)?.name)
                                    .filter(Boolean)
                                    .map(name => `- ${name}`)
                                    .join('\n');
                                item.description = `Includes:\n${bundleContents}`;
                            } else {
                                item.description = '';
                            }
                        }
                    }
                    newItems[index] = item;
                    updateBlock(selectedBlock.id, { ...selectedBlock.content, items: newItems });
                };
                
                const handleOptionChange = (itemIndex: number, optionName: string, choiceName: string) => {
                    const newItems = [...items];
                    const item = { ...newItems[itemIndex] };
                    if (!item.selectedOptions) item.selectedOptions = {};
                    item.selectedOptions[optionName] = choiceName;

                    // FIX: Cast `products` to `Product[]` to ensure correct type inference for `product`, fixing property access errors.
                    const product = (products as Product[]).find(p => p.id === item.productId);
                    if (product && product.options) {
                        let price = product.salePrice;
                        let description = '';
                        if (product.isBundle && product.bundleItemIds) {
                           const productMap = new Map((products as Product[]).map((p: Product) => [p.id, p]));
                            const bundleContents = product.bundleItemIds.map(id => `- ${productMap.get(id)?.name}`).join('\n');
                            description = `Includes:\n${bundleContents}\n\nCustomizations:\n`;
                        }
                        
                        const selectedOptionDescriptions: string[] = [];

                        product.options.forEach(opt => {
                            const selectedChoiceName = item.selectedOptions![opt.name];
                            const choice = opt.choices.find(c => c.name === selectedChoiceName);
                            if (choice) {
                                price += choice.priceAdjustment;
                                selectedOptionDescriptions.push(`- ${opt.name}: ${choice.name}${choice.priceAdjustment !== 0 ? ` (${choice.priceAdjustment > 0 ? '+' : ''}${choice.priceAdjustment.toLocaleString('en-US', {style: 'currency', currency: 'USD'})})` : ''}`);
                            }
                        });
                        item.unitPrice = price;
                        item.description = (description || '') + selectedOptionDescriptions.join('\n');
                    }

                    newItems[itemIndex] = item;
                    updateBlock(selectedBlock.id, { ...selectedBlock.content, items: newItems });
                };

                const addItem = () => {
                    const newItem: DocumentLineItem = { productId: '', name: 'New Item', description: '', quantity: 1, unitPrice: 0 };
                    updateBlock(selectedBlock.id, { ...selectedBlock.content, items: [...items, newItem] });
                };
                
                const removeItem = (index: number) => {
                    updateBlock(selectedBlock.id, { ...selectedBlock.content, items: items.filter((_:any, i:number) => i !== index) });
                };
                
                const handleTaxChange = (value: number) => {
                    updateBlock(selectedBlock.id, { ...selectedBlock.content, taxRate: value });
                };

                return (
                    <div className="space-y-4">
                        <h4 className="font-semibold">Line Items</h4>
                        <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
                        {items.map((item: any, index: number) => {
                            const product = products.find((p: Product) => p.id === item.productId);
                            return (
                                <div key={index} className="p-2 border border-border-subtle rounded-md space-y-2">
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm font-medium">Item #{index + 1}</p>
                                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => removeItem(index)} disabled={isReadOnly}><Trash2 size={14} className="text-error"/></Button>
                                    </div>
                                    <Select id={`item-prod-${index}`} label="Product" value={item.productId} onChange={e => handleItemChange(index, 'productId', e.target.value)} disabled={isReadOnly}>
                                        <option value="">Select a product</option>
                                        {products.map((p: Product) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </Select>
                                    
                                    {product && product.options && product.options.map(option => (
                                        <Select
                                            key={option.name}
                                            id={`item-opt-${index}-${option.name}`}
                                            label={option.name}
                                            value={item.selectedOptions?.[option.name] || ''}
                                            onChange={e => handleOptionChange(index, option.name, e.target.value)}
                                            disabled={isReadOnly}
                                        >
                                            {option.choices.map(choice => (
                                                <option key={choice.name} value={choice.name}>
                                                    {choice.name} {choice.priceAdjustment !== 0 ? `(${choice.priceAdjustment > 0 ? '+' : ''}${choice.priceAdjustment.toLocaleString('en-US', {style:'currency', currency:'USD'})})` : ''}
                                                </option>
                                            ))}
                                        </Select>
                                    ))}

                                    <div className="grid grid-cols-2 gap-2">
                                        <Input id={`item-qty-${index}`} label="Quantity" type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', parseInt(e.target.value))} disabled={isReadOnly}/>
                                        <Input id={`item-price-${index}`} label="Unit Price" type="number" step="0.01" value={item.unitPrice} onChange={e => handleItemChange(index, 'unitPrice', parseFloat(e.target.value))} disabled={isReadOnly}/>
                                    </div>
                                </div>
                            );
                        })}
                        </div>
                        <Button size="sm" variant="secondary" className="w-full" onClick={addItem} leftIcon={<Plus size={14}/>} disabled={isReadOnly}>Add Item</Button>
                        <div className="pt-4 border-t border-border-subtle">
                            <Input id="tax-rate" label="Tax Rate (%)" type="number" value={taxRate} onChange={e => handleTaxChange(parseFloat(e.target.value) || 0)} disabled={isReadOnly} />
                        </div>
                    </div>
                )
            }
            default: return null;
        }
    };

    return (
        <PageWrapper>
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <Button variant="secondary" onClick={onClose} leftIcon={<ArrowLeft size={16} />}>Back to Templates</Button>
                <div className="hidden md:flex items-center gap-4">
                     <input id="template-name" placeholder="Enter Template Name..." value={template.name} onChange={e => setTemplate(p => ({...p, name: e.target.value}))} className="w-72 bg-transparent text-xl font-semibold focus:outline-none focus:border-b border-border-subtle" disabled={isReadOnly} />
                    <div className="flex -space-x-2">
                        {collaborators.slice(0, 4).map(user => (
                            user && <div key={user.id} title={user.name} className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500 border-2 border-card-bg">{user.name.charAt(0)}</div>
                        ))}
                        {collaborators.length > 4 && <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center text-xs font-bold border-2 border-card-bg">+{collaborators.length - 4}</div>}
                    </div>
                    {!isNew && (
                        <Button variant="secondary" leftIcon={<Share2 size={16}/>} onClick={() => setIsShareModalOpen(true)}>Share</Button>
                    )}
                    <Button onClick={handleSave} disabled={isPending || isReadOnly}>{isPending ? 'Saving...' : 'Save Template'}</Button>
                </div>
            </div>
            
            {/* Main Builder Area */}
            <div className="hidden md:grid grid-cols-12 gap-4 h-[calc(100vh-12rem)]">
                {/* Toolbox */}
                <Card className="col-span-3 p-4">
                    <h3 className="text-lg font-semibold text-text-heading mb-4">Toolbox</h3>
                    <div className="space-y-2">
                        <Button variant="secondary" className="w-full justify-start" onClick={() => addBlock('header')} leftIcon={<Heading size={16}/>} disabled={isReadOnly}>Header</Button>
                        <Button variant="secondary" className="w-full justify-start" onClick={() => addBlock('text')} leftIcon={<Type size={16}/>} disabled={isReadOnly}>Text Block</Button>
                        <Button variant="secondary" className="w-full justify-start" onClick={() => addBlock('image')} leftIcon={<ImageIcon size={16}/>} disabled={isReadOnly}>Image</Button>
                        <Button variant="secondary" className="w-full justify-start" onClick={() => addBlock('lineItems')} leftIcon={<ListOrdered size={16}/>} disabled={isReadOnly}>Line Items</Button>
                    </div>
                </Card>
                {/* Preview */}
                <div className="col-span-6 h-full overflow-y-auto p-8 bg-white dark:bg-gray-100 rounded-lg border border-border-subtle text-black">
                    <div className="max-w-2xl mx-auto space-y-4">
                        {template.content.map((block, index) => (
                             <div 
                                key={block.id} 
                                className={`group relative p-2 border-2 rounded-md transition-all ${!isReadOnly ? 'cursor-pointer' : ''} ${
                                    selectedBlockId === block.id ? 'border-primary' : 'border-transparent hover:border-primary/30'
                                } ${draggedIndex === index ? 'opacity-30' : ''}`}
                                draggable={!isReadOnly} onDragStart={e => !isReadOnly && handleDragStart(e, index)} onDragOver={e => !isReadOnly && handleDragOver(e, index)} onDragEnd={handleDragEnd}
                                onClick={() => !isReadOnly && setSelectedBlockId(block.id)}
                            >
                                {renderPreviewBlock(block)}
                                {!isReadOnly && (
                                    <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button size="icon" variant="secondary" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); setSelectedBlockId(block.id); }}><Edit size={14}/></Button>
                                        <Button size="icon" variant="danger" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}><Trash2 size={14}/></Button>
                                        <GripVertical className="cursor-move text-text-secondary/50"/>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                {/* Config Panel */}
                <Card className="col-span-3 p-4 overflow-y-auto">
                    <h3 className="text-lg font-semibold text-text-heading mb-4">Configuration</h3>
                     <div className="space-y-4">
                        {renderConfigPanel()}
                     </div>
                </Card>
            </div>
             <div className="md:hidden flex flex-col items-center justify-center h-[calc(100vh-12rem)] text-center p-4">
                <Monitor size={48} className="text-text-secondary" />
                <h3 className="mt-4 font-semibold text-lg">Builder Not Available on Mobile</h3>
                <p className="text-text-secondary mt-1">Please switch to a desktop or tablet to use the document builder.</p>
            </div>
            <AiContentStudioModal isOpen={isAiStudioOpen} onClose={() => setIsAiStudioOpen(false)} onGenerate={handleAiGenerateText} />
            <AiImageStudioModal isOpen={isAiImageStudioOpen} onClose={() => setIsAiImageStudioOpen(false)} onGenerate={handleAiGenerateImage} />
            {templateToEdit && (
                <ShareDocumentModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} template={templateToEdit} />
            )}
        </PageWrapper>
    );
};

export default DocumentBuilderPage;