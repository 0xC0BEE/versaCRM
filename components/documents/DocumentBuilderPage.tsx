import React, { useState, useEffect } from 'react';
import { DocumentTemplate, DocumentBlock, DocumentPermission, User, Product } from '../../types';
import PageWrapper from '../layout/PageWrapper';
import Button from '../ui/Button';
import { ArrowLeft, Edit, Trash2, Heading, Type, Image as ImageIcon, List, Wand2, Share2 } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Card } from '../ui/Card';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import AiContentStudioModal from '../ai/AiContentStudioModal';
import AiImageStudioModal from '../ai/AiImageStudioModal';
import ShareDocumentModal from './ShareDocumentModal';

// Simplified internal components for the builder
const Toolbox: React.FC<{ onAddBlock: (type: DocumentBlock['type']) => void }> = ({ onAddBlock }) => {
    return (
        <div>
            <h3 className="text-lg font-semibold mb-4">Content Blocks</h3>
            <div className="space-y-2">
                <Button variant="secondary" className="w-full justify-start" onClick={() => onAddBlock('header')} leftIcon={<Heading size={16}/>}>Header</Button>
                <Button variant="secondary" className="w-full justify-start" onClick={() => onAddBlock('text')} leftIcon={<Type size={16}/>}>Text Block</Button>
                <Button variant="secondary" className="w-full justify-start" onClick={() => onAddBlock('image')} leftIcon={<ImageIcon size={16}/>}>Image</Button>
                <Button variant="secondary" className="w-full justify-start" onClick={() => onAddBlock('lineItems')} leftIcon={<List size={16}/>}>Line Items</Button>
            </div>
        </div>
    );
};

const ConfigPanel: React.FC<{
    selectedBlock: DocumentBlock | null;
    updateBlock: (id: string, newContent: any) => void;
    openAiContent: () => void;
    openAiImage: () => void;
}> = ({ selectedBlock, updateBlock, openAiContent, openAiImage }) => {
    if (!selectedBlock) return <p className="text-sm text-text-secondary">Select a block to edit.</p>;
    
    switch (selectedBlock.type) {
        case 'header':
            return (
                <div className="space-y-4">
                    <Input id="header-title" label="Title" value={selectedBlock.content.title} onChange={e => updateBlock(selectedBlock.id, { ...selectedBlock.content, title: e.target.value })} />
                    <Textarea id="header-subtitle" label="Subtitle" value={selectedBlock.content.subtitle} onChange={e => updateBlock(selectedBlock.id, { ...selectedBlock.content, subtitle: e.target.value })} />
                </div>
            );
        case 'text':
            return (
                <div className="space-y-4">
                    <Textarea id="text-content" label="Text" value={selectedBlock.content.text} rows={10} onChange={e => updateBlock(selectedBlock.id, { text: e.target.value })} />
                    <Button variant="secondary" size="sm" className="w-full" onClick={openAiContent} leftIcon={<Wand2 size={14}/>}>Generate with AI</Button>
                </div>
            );
         case 'image':
            return (
                <div className="space-y-4">
                    <Input id="image-src" label="Image URL" value={selectedBlock.content.src} onChange={e => updateBlock(selectedBlock.id, { ...selectedBlock.content, src: e.target.value })} />
                    <Input id="image-alt" label="Alt Text" value={selectedBlock.content.alt} onChange={e => updateBlock(selectedBlock.id, { ...selectedBlock.content, alt: e.target.value })} />
                     <Button variant="secondary" size="sm" className="w-full" onClick={openAiImage} leftIcon={<Wand2 size={14}/>}>Generate with AI</Button>
                </div>
            );
        case 'lineItems':
             return <p className="text-sm text-text-secondary">Line items are pre-configured. Use this block to create quotes and proposals.</p>;
        default: return null;
    }
};

interface DocumentBuilderPageProps {
    templateToEdit: DocumentTemplate | null;
    onClose: () => void;
}

const DocumentBuilderPage: React.FC<DocumentBuilderPageProps> = ({ templateToEdit, onClose }) => {
    const { createDocumentTemplateMutation, updateDocumentTemplateMutation } = useData();
    const { authenticatedUser } = useAuth();
    const isNew = !templateToEdit;

    const [template, setTemplate] = useState<Omit<DocumentTemplate, 'id' | 'organizationId'>>(() => templateToEdit || {
        name: 'New Document Template',
        content: [],
        permissions: [],
    });
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
    const [aiContentModal, setAiContentModal] = useState(false);
    const [aiImageModal, setAiImageModal] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    useEffect(() => {
        if (templateToEdit) setTemplate(templateToEdit);
    }, [templateToEdit]);

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
        let content;
        switch(type) {
            case 'header': content = { title: 'New Header', subtitle: 'Subtitle' }; break;
            case 'text': content = { text: 'New text block...' }; break;
            case 'image': content = { src: 'https://via.placeholder.com/600x200', alt: 'Placeholder' }; break;
            case 'lineItems': content = { items: [], taxRate: 0 }; break;
            default: content = {};
        }
        const newBlock: DocumentBlock = { id: newId, type, content };
        setTemplate(t => ({ ...t, content: [...t.content, newBlock] }));
    };

    const updateBlock = (id: string, newContent: any) => {
        setTemplate(t => ({ ...t, content: t.content.map(b => b.id === id ? { ...b, content: newContent } : b) }));
    };

    const removeBlock = (id: string) => {
        setTemplate(t => ({ ...t, content: t.content.filter(b => b.id !== id) }));
        if (selectedBlockId === id) setSelectedBlockId(null);
    };

    const handleAiContentGenerated = (text: string) => {
        if (selectedBlockId) {
            updateBlock(selectedBlockId, { text });
        }
    };

    const handleAiImageGenerated = (dataUrl: string) => {
        if (selectedBlockId) {
            updateBlock(selectedBlockId, { src: dataUrl, alt: 'AI Generated Image' });
        }
    };

    const isPending = createDocumentTemplateMutation.isPending || updateDocumentTemplateMutation.isPending;
    const selectedBlock = template.content.find(b => b.id === selectedBlockId);

    const renderPreviewBlock = (block: DocumentBlock) => {
        switch(block.type) {
            case 'header': return <div className="text-center py-4"><h1 className="text-2xl font-bold">{block.content.title}</h1><p className="text-md mt-1">{block.content.subtitle}</p></div>;
            case 'text': return <p className="py-2 whitespace-pre-wrap">{block.content.text}</p>;
            case 'image': return <img src={block.content.src} alt={block.content.alt} className="w-full h-auto rounded-md my-2" />;
            case 'lineItems': return <div className="my-4 p-4 border-dashed border-2 border-gray-300 text-center text-gray-500">Line Items Table Placeholder</div>;
            default: return null;
        }
    };

    return (
        <PageWrapper>
            <div className="flex justify-between items-center mb-4">
                <Button variant="secondary" onClick={onClose} leftIcon={<ArrowLeft size={16} />}>Back to Documents</Button>
                <div className="flex items-center gap-4">
                    <Input id="template-name" label="" placeholder="Enter Template Name..." value={template.name} onChange={e => setTemplate(t => ({...t, name: e.target.value}))} className="w-72" />
                    {!isNew && <Button variant="secondary" onClick={() => setIsShareModalOpen(true)} leftIcon={<Share2 size={16}/>}>Share</Button>}
                    <Button onClick={handleSave} disabled={isPending}>{isPending ? 'Saving...' : 'Save Template'}</Button>
                </div>
            </div>
            <div className="grid grid-cols-12 gap-4 h-[calc(100vh-12rem)]">
                <Card className="col-span-3 p-4 overflow-y-auto"><Toolbox onAddBlock={addBlock} /></Card>
                <div className="col-span-6 h-full overflow-y-auto p-8 rounded-lg border border-border-subtle bg-white text-black">
                    <div className="max-w-2xl mx-auto space-y-4">
                        {template.content.map(block => (
                            <div key={block.id} className="group relative p-2 border-2 border-transparent hover:border-blue-300" onClick={() => setSelectedBlockId(block.id)}>
                                {renderPreviewBlock(block)}
                                <div className="absolute top-0 right-0 z-10 flex gap-1 opacity-0 group-hover:opacity-100">
                                    <Button size="icon" variant="secondary" className="h-7 w-7"><Edit size={14}/></Button>
                                    <Button size="icon" variant="danger" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}><Trash2 size={14}/></Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <Card className="col-span-3 p-4 overflow-y-auto">
                    <h3 className="text-lg font-semibold mb-4">Properties</h3>
                    <ConfigPanel selectedBlock={selectedBlock!} updateBlock={updateBlock} openAiContent={() => setAiContentModal(true)} openAiImage={() => setAiImageModal(true)} />
                </Card>
            </div>
            <AiContentStudioModal isOpen={aiContentModal} onClose={() => setAiContentModal(false)} onGenerate={handleAiContentGenerated} />
            <AiImageStudioModal isOpen={aiImageModal} onClose={() => setAiImageModal(false)} onGenerate={handleAiImageGenerated} />
            {templateToEdit && <ShareDocumentModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} template={templateToEdit} />}
        </PageWrapper>
    );
};

export default DocumentBuilderPage;
