import React, { useState, useEffect } from 'react';
import { LandingPage, LandingPageComponent, PublicForm } from '../../types';
import PageWrapper from '../layout/PageWrapper';
import Button from '../ui/Button';
import { ArrowLeft, Edit, Trash2, Heading, Type, Image as ImageIcon, ClipboardList, GripVertical } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Card } from '../ui/Card';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';

interface LandingPageBuilderPageProps {
    pageToEdit: LandingPage | null;
    onClose: () => void;
}

// Toolbox Component (internal)
const Toolbox: React.FC<{ onAddComponent: (type: LandingPageComponent['type']) => void }> = ({ onAddComponent }) => {
    return (
        <div>
            <h3 className="text-lg font-semibold text-text-heading mb-4">Components</h3>
            <div className="space-y-2">
                <Button variant="secondary" className="w-full justify-start" onClick={() => onAddComponent('header')} leftIcon={<Heading size={16}/>}>Header</Button>
                <Button variant="secondary" className="w-full justify-start" onClick={() => onAddComponent('text')} leftIcon={<Type size={16}/>}>Text Block</Button>
                <Button variant="secondary" className="w-full justify-start" onClick={() => onAddComponent('image')} leftIcon={<ImageIcon size={16}/>}>Image</Button>
                <Button variant="secondary" className="w-full justify-start" onClick={() => onAddComponent('form')} leftIcon={<ClipboardList size={16}/>}>Form</Button>
            </div>
        </div>
    );
};

// Config Panel Component (internal)
const ConfigPanel: React.FC<{
    selectedBlock: LandingPageComponent | null;
    updateBlock: (id: string, newContent: any) => void;
    forms: PublicForm[];
}> = ({ selectedBlock, updateBlock, forms }) => {
    if (!selectedBlock) {
        return <p className="text-sm text-text-secondary">Select a block on the canvas to edit its properties.</p>;
    }

    switch (selectedBlock.type) {
        case 'header':
            return (
                <div className="space-y-4">
                    <Input id="header-title" label="Title" value={selectedBlock.content.title} onChange={e => updateBlock(selectedBlock.id, { ...selectedBlock.content, title: e.target.value })} />
                    <Textarea id="header-subtitle" label="Subtitle" value={selectedBlock.content.subtitle} onChange={e => updateBlock(selectedBlock.id, { ...selectedBlock.content, subtitle: e.target.value })} />
                </div>
            );
        case 'text':
            return <Textarea id="text-content" label="Text" value={selectedBlock.content.text} rows={10} onChange={e => updateBlock(selectedBlock.id, { text: e.target.value })} />;
        case 'image':
            return (
                <div className="space-y-4">
                    <Input id="image-src" label="Image URL" value={selectedBlock.content.src} onChange={e => updateBlock(selectedBlock.id, { ...selectedBlock.content, src: e.target.value })} />
                    <Input id="image-alt" label="Alt Text" value={selectedBlock.content.alt} onChange={e => updateBlock(selectedBlock.id, { ...selectedBlock.content, alt: e.target.value })} />
                </div>
            );
        case 'form':
            return (
                <Select id="form-select" label="Select Form" value={selectedBlock.content.formId} onChange={e => updateBlock(selectedBlock.id, { formId: e.target.value })}>
                    <option value="">-- Choose a form --</option>
                    {forms.map(form => <option key={form.id} value={form.id}>{form.name}</option>)}
                </Select>
            );
        default:
            return null;
    }
};

// Main Builder Component
const LandingPageBuilderPage: React.FC<LandingPageBuilderPageProps> = ({ pageToEdit, onClose }) => {
    const { createLandingPageMutation, updateLandingPageMutation, formsQuery } = useData();
    const { authenticatedUser } = useAuth();
    const { data: forms = [] } = formsQuery;
    const isNew = !pageToEdit;

    const [page, setPage] = useState<Omit<LandingPage, 'id' | 'organizationId'>>(() => pageToEdit || {
        name: 'New Landing Page',
        slug: '',
        status: 'Draft',
        content: [],
        style: { backgroundColor: '#f8fafc', textColor: '#0f172a' },
    });
    
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    useEffect(() => {
        if (pageToEdit) {
            setPage(pageToEdit);
        }
    }, [pageToEdit]);

    const handleSave = () => {
        if (!page.name.trim() || !page.slug.trim()) return toast.error("Page Name and Slug are required.");
        
        const pageData = { ...page, organizationId: authenticatedUser!.organizationId!, slug: page.slug.toLowerCase().replace(/\s+/g, '-') };
        
        if (isNew) {
            createLandingPageMutation.mutate(pageData as any, { onSuccess: onClose });
        } else {
            updateLandingPageMutation.mutate({ ...pageToEdit!, ...pageData }, { onSuccess: onClose });
        }
    };

    const addComponent = (type: LandingPageComponent['type']) => {
        const newId = `comp_${Date.now()}`;
        let newBlock: LandingPageComponent;
        switch(type) {
            case 'header':
                newBlock = { id: newId, type, content: { title: 'Your Headline Here', subtitle: 'A compelling subtitle to grab attention.' } };
                break;
            case 'text':
                newBlock = { id: newId, type, content: { text: 'This is a paragraph of text. Click to edit it.' } };
                break;
            case 'image':
                newBlock = { id: newId, type, content: { src: 'https://via.placeholder.com/800x400', alt: 'Placeholder Image' } };
                break;
            case 'form':
                newBlock = { id: newId, type, content: { formId: '' } };
                break;
            default: return;
        }
        setPage(p => ({ ...p, content: [...p.content, newBlock] }));
        setSelectedBlockId(newId);
    };

    const updateBlock = (id: string, newContent: any) => {
        setPage(p => ({
            ...p,
            content: p.content.map(block => block.id === id ? { ...block, content: newContent } : block)
        }));
    };
    
    const removeBlock = (id: string) => {
        setPage(p => ({ ...p, content: p.content.filter(b => b.id !== id) }));
        if (selectedBlockId === id) setSelectedBlockId(null);
    };

    // Drag and Drop handlers
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => setDraggedIndex(index);
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;
        const newContent = [...page.content];
        const [movedBlock] = newContent.splice(draggedIndex, 1);
        newContent.splice(index, 0, movedBlock);
        
        setPage(p => ({...p, content: newContent}));
        setDraggedIndex(index);
    };
    const handleDragEnd = () => setDraggedIndex(null);


    const isPending = createLandingPageMutation.isPending || updateLandingPageMutation.isPending;
    const selectedBlock = page.content.find(b => b.id === selectedBlockId);

    // This is the preview rendering logic
    const renderPreviewBlock = (block: LandingPageComponent) => {
        switch(block.type) {
            case 'header': return <div className="text-center py-8"><h1 className="text-3xl font-bold">{block.content.title}</h1><p className="text-lg mt-2 text-gray-600">{block.content.subtitle}</p></div>;
            case 'text': return <p className="py-2 whitespace-pre-wrap">{block.content.text}</p>;
            case 'image': return <img src={block.content.src} alt={block.content.alt} className="w-full h-auto rounded-md" />;
            case 'form': {
                const form = (forms as PublicForm[]).find(f => f.id === block.content.formId);
                return <div className="my-6 p-4 text-center bg-gray-200 rounded-lg">{form ? `Form: ${form.name}` : 'Select a form'}</div>;
            }
            default: return null;
        }
    };
    

    return (
        <PageWrapper>
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <Button variant="secondary" onClick={onClose} leftIcon={<ArrowLeft size={16} />}>Back to Pages</Button>
                <div className="flex items-center gap-4">
                    <Input id="page-name" label="" placeholder="Enter Page Name..." value={page.name} onChange={e => setPage(p => ({...p, name: e.target.value}))} className="w-72" />
                    <Button onClick={handleSave} disabled={isPending}>{isPending ? 'Saving...' : 'Save Page'}</Button>
                </div>
            </div>
            
            {/* Main Builder Area */}
            <div className="grid grid-cols-12 gap-4 h-[calc(100vh-12rem)]">
                {/* Toolbox */}
                <Card className="col-span-3 p-4 overflow-y-auto">
                    <Toolbox onAddComponent={addComponent} />
                </Card>
                {/* Preview */}
                <div className="col-span-6 h-full overflow-y-auto p-8 rounded-lg border border-border-subtle" style={{backgroundColor: page.style.backgroundColor, color: page.style.textColor}}>
                    <div className="max-w-2xl mx-auto space-y-4">
                        {page.content.map((block, index) => (
                             <div 
                                key={block.id} 
                                className={`group relative p-2 border-2 transition-all cursor-pointer ${selectedBlockId === block.id ? 'border-primary' : 'border-transparent hover:border-primary/30'} ${draggedIndex === index ? 'opacity-30' : ''}`}
                                draggable 
                                onDragStart={e => handleDragStart(e, index)} 
                                onDragOver={e => handleDragOver(e, index)} 
                                onDragEnd={handleDragEnd}
                                onClick={() => setSelectedBlockId(block.id)}
                            >
                                {renderPreviewBlock(block)}
                                <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button size="icon" variant="secondary" className="h-7 w-7"><Edit size={14}/></Button>
                                    <Button size="icon" variant="danger" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}><Trash2 size={14}/></Button>
                                    <GripVertical className="cursor-move text-text-secondary/50"/>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Config Panel */}
                <Card className="col-span-3 p-4 overflow-y-auto">
                    <h3 className="text-lg font-semibold text-text-heading mb-4">Configuration</h3>
                    {selectedBlockId ? 
                        <ConfigPanel selectedBlock={selectedBlock!} updateBlock={updateBlock} forms={forms as PublicForm[]} /> : 
                        <div className="space-y-4">
                            <h4 className="font-semibold">Page Settings</h4>
                            <Input id="page-slug" label="URL Slug" value={page.slug} onChange={e => setPage(p => ({...p, slug: e.target.value}))} />
                            <Input id="page-bg" label="Background Color" type="color" value={page.style.backgroundColor} onChange={e => setPage(p => ({...p, style: {...p.style, backgroundColor: e.target.value}}))} className="w-24" />
                            <Input id="page-text" label="Text Color" type="color" value={page.style.textColor} onChange={e => setPage(p => ({...p, style: {...p.style, textColor: e.target.value}}))} className="w-24" />
                        </div>
                    }
                </Card>
            </div>
        </PageWrapper>
    );
};

export default LandingPageBuilderPage;
