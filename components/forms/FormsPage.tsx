import React, { useState } from 'react';
import PageWrapper from '../layout/PageWrapper';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Plus, Edit, Trash2, Code, TestTube2, ClipboardList } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { PublicForm } from '../../types';
import FormBuilderPage from './FormBuilderPage';
import EmbedCodeModal from './EmbedCodeModal';
import PublicFormTestModal from './PublicFormTestModal';

const FormsPage: React.FC = () => {
    const { formsQuery, deleteFormMutation } = useData();
    const { data: forms = [], isLoading } = formsQuery;

    const [view, setView] = useState<'list' | 'builder'>('list');
    const [selectedForm, setSelectedForm] = useState<PublicForm | null>(null);
    const [modal, setModal] = useState<'embed' | 'test' | null>(null);

    const handleNew = () => {
        setSelectedForm(null);
        setView('builder');
    };

    const handleEdit = (form: PublicForm) => {
        setSelectedForm(form);
        setView('builder');
    };

    const handleDelete = (form: PublicForm) => {
        if (window.confirm(`Are you sure you want to delete the form "${form.name}"?`)) {
            deleteFormMutation.mutate(form.id);
        }
    };
    
    const openModal = (type: 'embed' | 'test', form: PublicForm) => {
        setSelectedForm(form);
        setModal(type);
    }
    
    const closeModal = () => {
        setSelectedForm(null);
        setModal(null);
    }

    if (view === 'builder') {
        return <FormBuilderPage formToEdit={selectedForm} onClose={() => setView('list')} />;
    }

    return (
        <PageWrapper>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-text-heading">Public Forms</h1>
                <Button onClick={handleNew} leftIcon={<Plus size={16} />}>
                    New Form
                </Button>
            </div>
            <Card>
                {isLoading ? (
                    <div className="p-8 text-center">Loading forms...</div>
                ) : forms.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-text-secondary">
                             <thead className="text-xs uppercase bg-card-bg/50 text-text-secondary">
                                <tr>
                                    <th scope="col" className="px-6 py-3 font-medium">Form Name</th>
                                    <th scope="col" className="px-6 py-3 font-medium text-center">Submissions</th>
                                    <th scope="col" className="px-6 py-3 font-medium"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                {forms.map((form: PublicForm) => (
                                    <tr key={form.id} className="border-b border-border-subtle hover:bg-hover-bg">
                                        <td className="px-6 py-4 font-medium text-text-primary">{form.name}</td>
                                        <td className="px-6 py-4 text-center">{form.submissions}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex gap-2 justify-end">
                                                <Button size="sm" variant="secondary" onClick={() => openModal('test', form)} leftIcon={<TestTube2 size={14} />}>Test</Button>
                                                <Button size="sm" variant="secondary" onClick={() => openModal('embed', form)} leftIcon={<Code size={14} />}>Embed</Button>
                                                <Button size="sm" variant="secondary" onClick={() => handleEdit(form)} leftIcon={<Edit size={14} />}>Edit</Button>
                                                <Button size="sm" variant="danger" onClick={() => handleDelete(form)} disabled={deleteFormMutation.isPending}><Trash2 size={14} /></Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-20 text-text-secondary">
                        <ClipboardList className="mx-auto h-16 w-16 text-text-secondary/50" />
                        <h2 className="mt-4 text-lg font-semibold text-text-primary">No Forms Created Yet</h2>
                        <p className="mt-2 text-sm">Capture leads by creating your first public form.</p>
                         <Button onClick={handleNew} leftIcon={<Plus size={16} />} className="mt-4">
                            Create First Form
                        </Button>
                    </div>
                )}
            </Card>

            {modal === 'embed' && selectedForm && (
                <EmbedCodeModal isOpen={true} onClose={closeModal} formId={selectedForm.id} />
            )}
            {modal === 'test' && selectedForm && (
                <PublicFormTestModal isOpen={true} onClose={closeModal} form={selectedForm} />
            )}
        </PageWrapper>
    );
};

export default FormsPage;
