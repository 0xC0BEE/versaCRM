import React, { useState } from 'react';
import PageWrapper from '../layout/PageWrapper';
import { Card } from '../ui/Card';
import Button from '../ui/Button';
import { Plus, Edit, Trash2, FileText } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { DocumentTemplate } from '../../types';
import DocumentBuilderPage from './DocumentBuilderPage';

const DocumentsPage: React.FC = () => {
    const { documentTemplatesQuery, deleteDocumentTemplateMutation } = useData();
    const { data: templates = [], isLoading } = documentTemplatesQuery;

    const [view, setView] = useState<'list' | 'builder'>('list');
    const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);

    const handleNew = () => {
        setSelectedTemplate(null);
        setView('builder');
    };

    const handleEdit = (template: DocumentTemplate) => {
        setSelectedTemplate(template);
        setView('builder');
    };
    
    const handleDelete = (template: DocumentTemplate) => {
        if (window.confirm(`Are you sure you want to delete the template "${template.name}"?`)) {
            deleteDocumentTemplateMutation.mutate(template.id);
        }
    };

    if (view === 'builder') {
        return <DocumentBuilderPage templateToEdit={selectedTemplate} onClose={() => setView('list')} />;
    }

    return (
        <PageWrapper>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-text-heading">Document Templates</h1>
                <Button onClick={handleNew} leftIcon={<Plus size={16} />}>
                    New Template
                </Button>
            </div>
            <Card>
                {isLoading ? (
                    <div className="p-8 text-center">Loading templates...</div>
                ) : templates.length > 0 ? (
                     <div className="divide-y divide-border-subtle">
                        {templates.map((template: DocumentTemplate) => (
                            <div key={template.id} className="p-4 flex justify-between items-center">
                                <p className="font-medium">{template.name}</p>
                                <div className="flex items-center gap-2">
                                    <Button size="sm" variant="secondary" onClick={() => handleEdit(template)} leftIcon={<Edit size={14} />}>Edit</Button>
                                    <Button size="sm" variant="danger" onClick={() => handleDelete(template)} disabled={deleteDocumentTemplateMutation.isPending} leftIcon={<Trash2 size={14} />}>Delete</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-text-secondary">
                        <FileText className="mx-auto h-16 w-16 text-text-secondary/50" />
                        <h2 className="mt-4 text-lg font-semibold text-text-primary">No Templates Created Yet</h2>
                        <p className="mt-2 text-sm">Create reusable templates for your proposals, quotes, and contracts.</p>
                         <Button onClick={handleNew} leftIcon={<Plus size={16} />} className="mt-4">
                            Create First Template
                        </Button>
                    </div>
                )}
            </Card>
        </PageWrapper>
    );
};

export default DocumentsPage;
