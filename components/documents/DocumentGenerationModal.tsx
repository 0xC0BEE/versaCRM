import React, { useState, useEffect, useMemo } from 'react';
import { DocumentTemplate, Deal, AnyContact, DocumentBlock } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Select from '../ui/Select';
import { useData } from '../../contexts/DataContext';
import { replacePlaceholders } from '../../utils/textUtils';
import { Loader } from 'lucide-react';

interface DocumentGenerationModalProps {
    isOpen: boolean;
    onClose: () => void;
    deal: Deal;
    contact?: AnyContact;
}

const DocumentGenerationModal: React.FC<DocumentGenerationModalProps> = ({ isOpen, onClose, deal, contact }) => {
    const { documentTemplatesQuery } = useData();
    const { data: templates = [], isLoading: templatesLoading } = documentTemplatesQuery;
    const [selectedTemplateId, setSelectedTemplateId] = useState('');

    const selectedTemplate = useMemo(() => {
        return (templates as DocumentTemplate[]).find(t => t.id === selectedTemplateId);
    }, [templates, selectedTemplateId]);

    const generatedContent = useMemo(() => {
        if (!selectedTemplate || !contact) return [];

        return selectedTemplate.content.map(block => {
            const newBlock = { ...block };
            if (block.type === 'header' || block.type === 'text') {
                const newContent = { ...block.content };
                for (const key in newContent) {
                    if (typeof newContent[key] === 'string') {
                        newContent[key] = replacePlaceholders(newContent[key], { contact, deal, now: new Date().toLocaleDateString() });
                    }
                }
                newBlock.content = newContent;
            }
            return newBlock;
        });
    }, [selectedTemplate, deal, contact]);
    
    const handleDownload = () => {
        const previewElement = document.getElementById('doc-preview-content');
        if (previewElement) {
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                    <head>
                        <title>${selectedTemplate?.name || 'Document'}</title>
                        <style>
                            body { font-family: sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 40px auto; padding: 20px; }
                            h1 { color: #111; }
                            img { max-width: 100%; height: auto; }
                            table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 0.9em; }
                            th, td { padding: 12px 15px; border: 1px solid #ddd; }
                            thead { background-color: #f2f2f2; }
                            .totals { margin-left: auto; width: 250px; }
                            .totals div { display: flex; justify-content: space-between; padding: 5px 0; }
                            .totals .grand-total { font-weight: bold; font-size: 1.1em; border-top: 1px solid #ddd; padding-top: 10px; margin-top: 10px; }
                        </style>
                    </head>
                    <body>${previewElement.innerHTML}</body>
                </html>
            `;
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
            URL.revokeObjectURL(url);
        }
    };


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
                const subtotal = block.content.items.reduce((sum: number, item: any) => sum + item.quantity * item.unitPrice, 0);
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
                                {block.content.items.map((item: any, index: number) => (
                                    <tr key={index} className="border-b">
                                        <td className="p-2 font-medium">{item.name}</td>
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

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Generate Document" size="4xl">
            <div className="min-h-[60vh] flex flex-col">
                <div className="flex-shrink-0 mb-4">
                    <Select id="template-select" label="Select a Template" value={selectedTemplateId} onChange={e => setSelectedTemplateId(e.target.value)} disabled={templatesLoading}>
                        <option value="">-- Choose a template --</option>
                        {templates.map((t: DocumentTemplate) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </Select>
                </div>
                
                <div className="flex-grow p-6 bg-white text-black rounded-md border border-gray-200 overflow-y-auto">
                    {templatesLoading ? (
                        <div className="flex items-center justify-center h-full"><Loader className="animate-spin"/></div>
                    ) : selectedTemplate ? (
                        <div id="doc-preview-content">
                            {generatedContent.map(block => (
                                <div key={block.id} className="my-4">{renderPreviewBlock(block)}</div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            <p>Select a template to see a preview.</p>
                        </div>
                    )}
                </div>

                 <div className="mt-6 flex justify-end space-x-2">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleDownload} disabled={!selectedTemplate}>Download</Button>
                </div>
            </div>
        </Modal>
    );
};

export default DocumentGenerationModal;