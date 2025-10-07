import React, { useState, useEffect } from 'react';
import { LandingPage, LandingPageComponent, PublicForm } from '../../types';
import PageWrapper from '../layout/PageWrapper';
import Button from '../ui/Button';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';

interface LandingPageBuilderPageProps {
    pageToEdit: LandingPage | null;
    onClose: () => void;
}

const LandingPageBuilderPage: React.FC<LandingPageBuilderPageProps> = ({ pageToEdit, onClose }) => {
    const { createLandingPageMutation, updateLandingPageMutation, formsQuery } = useData();
    const { authenticatedUser } = useAuth();
    const { data: forms = [] } = formsQuery;
    const isNew = !pageToEdit;

    const [page, setPage] = useState<Omit<LandingPage, 'id' | 'organizationId'>>(() => pageToEdit || {
        name: '',
        slug: '',
        status: 'Draft',
        content: [],
        style: { backgroundColor: '#f8fafc', textColor: '#1e293b' },
    });
    const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);

    useEffect(() => {
        if (pageToEdit) setPage(pageToEdit);
    }, [pageToEdit]);

    const handleSave = () => {
        if (!page.name.trim() || !page.slug.trim()) return toast.error("Page Name and URL Slug are required.");

        const pageData = { ...page, organizationId: authenticatedUser!.organizationId! };

        if (isNew) {
            createLandingPageMutation.mutate(pageData as any, { onSuccess: onClose });
        } else {
            updateLandingPageMutation.mutate({ ...pageToEdit!, ...pageData }, { onSuccess: onClose });
        }
    };
    
    const addComponent = (type: LandingPageComponent['type']) => {
        const newId = `comp_${Date.now()}`;
        let newComponent: LandingPageComponent;
        switch(type) {
            case 'header':
                newComponent = { id: newId, type, content: { title: 'Your Big Headline', subtitle: 'A catchy subtitle to draw attention.' } };
                break;
            case 'text':
                newComponent = { id: newId, type, content: { text: 'This is a block of text. You can use it to describe your product or service in detail. Double-click to edit!' } };
                break;
            case 'image':
                newComponent = { id: newId, type, content: { src: 'https://via.placeholder.com/600x300', alt: 'Placeholder' } };
                break;
            case 'form':
                newComponent = { id: newId, type, content: { formId: '' } };
                break;
        }
        setPage(p => ({ ...p, content: [...p.content, newComponent] }));
        setSelectedComponentId(newId);
    };

    const updateComponent = (id: string, newContent: any) => {
        setPage(p => ({
            ...p,
            content: p.content.map(c => c.id === id ? { ...c, content: newContent } : c)
        }));
    };

    const removeComponent = (id: string) => {
        setPage(p => ({ ...p, content: p.content.filter(c => c.id !== id) }));
        if(selectedComponentId === id) setSelectedComponentId(null);
    };

    const isPending = createLandingPageMutation.isPending || updateLandingPageMutation.isPending;
    const selectedComponent = page.content.find(c => c.id === selectedComponentId);

    const renderPreviewComponent = (comp: LandingPageComponent) => {
        switch(comp.type) {
            case 'header': return (
                <div className="text-center p-8">
                    <h1 className="text-4xl font-bold">{comp.content.title}</h1>
                    <p className="text-xl mt-2">{comp.content.subtitle}</p>
                </div>
            );
            case 'text': return <p className="p-4 whitespace-pre-wrap">{comp.content.text}</p>;
            case 'image': return <img src={comp.content.src} alt={comp.content.alt} className="w-full h-auto" />;
            case 'form': 
                const form = forms.find((f: PublicForm) => f.id === comp.content.formId);
                return (
                    <div className="p-4 border-2 border-dashed border-gray-400 rounded-md text-center">
                        {form ? `Form: ${form.name}` : 'No form selected'}
                    </div>
                );
            default: return null;
        }
    };

    const renderConfigPanel = () => {
        if (!selectedComponent) {
            return (
                <div>
                    <h4 className="font-semibold mb-2">Page Styles</h4>
                    <Input id="bg-color" label="Background Color" type="color" value={page.style.backgroundColor} onChange={e => setPage(p => ({...p, style: {...p.style, backgroundColor: e.target.value}}))} />
                    <Input id="text-color" label="Text Color" type="color" value={page.style.textColor} onChange={e => setPage(p => ({...p, style: {...p.style, textColor: e.target.value}}))} />
                </div>
            );
        }

        switch(selectedComponent.type) {
            case 'header': return (
                <div>
                    <Input id="header-title" label="Title" value={selectedComponent.content.title} onChange={e => updateComponent(selectedComponent.id, { ...selectedComponent.content, title: e.target.value })} />
                    <Textarea id="header-subtitle" label="Subtitle" value={selectedComponent.content.subtitle} onChange={e => updateComponent(selectedComponent.id, { ...selectedComponent.content, subtitle: e.target.value })} />
                </div>
            );
            case 'text': return <Textarea id="text-content" label="Text" value={selectedComponent.content.text} rows={8} onChange={e => updateComponent(selectedComponent.id, { text: e.target.value })} />;
            case 'image': return <Input id="image-src" label="Image URL" value={selectedComponent.content.src} onChange={e => updateComponent(selectedComponent.id, { ...selectedComponent.content, src: e.target.value })} />;
            case 'form': return (
                <Select id="form-select" label="Select a Form" value={selectedComponent.content.formId} onChange={e => updateComponent(selectedComponent.id, { formId: e.target.value })}>
                    <option value="">-- Choose a form --</option>
                    {forms.map((f: PublicForm) => <option key={f.id} value={f.id}>{f.name}</option>)}
                </Select>
            );
            default: return null;
        }
    };

    return (
        <PageWrapper>
             <div className="flex justify-between items-center mb-4">
                <Button variant="secondary" onClick={onClose} leftIcon={<ArrowLeft size={16} />}>Back</Button>
                <div className="flex items-center gap-4">
                    <Input id="page-name" label="" placeholder="Enter Page Name..." value={page.name} onChange={e => setPage(p => ({...p, name: e.target.value}))} />
                    <Input id="page-slug" label="" placeholder="url-slug" value={page.slug} onChange={e => setPage(p => ({...p, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')}))} />
                    <Button onClick={handleSave} disabled={isPending}>{isPending ? 'Saving...' : 'Save Page'}</Button>
                </div>
            </div>
            <div className="grid grid-cols-12 gap-4 h-[calc(100vh-12rem)]">
                <Card className="col-span-3 p-4 overflow-y-auto">
                    <h3 className="text-lg font-semibold mb-4">Components</h3>
                    <div className="space-y-2">
                        <Button variant="secondary" className="w-full" onClick={() => addComponent('header')}>Add Header</Button>
                        <Button variant="secondary" className="w-full" onClick={() => addComponent('text')}>Add Text Block</Button>
                        <Button variant="secondary" className="w-full" onClick={() => addComponent('image')}>Add Image</Button>
                        <Button variant="secondary" className="w-full" onClick={() => addComponent('form')}>Add Form</Button>
                    </div>
                </Card>
                <div className="col-span-6 h-full overflow-y-auto p-4 bg-white rounded-card border border-border-subtle" style={{ backgroundColor: page.style.backgroundColor, color: page.style.textColor }}>
                    {page.content.map(comp => (
                        <div key={comp.id} className={`relative p-2 border-2 border-transparent hover:border-primary/50 ${selectedComponentId === comp.id ? 'border-primary' : ''}`} onClick={() => setSelectedComponentId(comp.id)}>
                            {renderPreviewComponent(comp)}
                             {selectedComponentId === comp.id && (
                                <button onClick={() => removeComponent(comp.id)} className="absolute top-0 right-0 p-1 bg-error text-white rounded-full"><Trash2 size={14}/></button>
                             )}
                        </div>
                    ))}
                </div>
                <Card className="col-span-3 p-4 overflow-y-auto">
                    <h3 className="text-lg font-semibold mb-4">{selectedComponent ? 'Edit Component' : 'Page Settings'}</h3>
                    <div className="space-y-4">
                       {renderConfigPanel()}
                    </div>
                </Card>
            </div>
        </PageWrapper>
    );
};

export default LandingPageBuilderPage;
